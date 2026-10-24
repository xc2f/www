# PostgreSQL → SQLite

This migration keeps IDs, password hashes/salts, sessions, localized fields,
relationships, blocks, drafts, versions, globals, search rows, preferences, and
jobs. It reads standard UTF8 `pg_dump` COPY-text backups (`.sql` or `.sql.gz`)
without executing their SQL. PostgreSQL migration records stay in the original
backup; SQLite retains its own new migration baseline. Unsupported schemas or
types, a nonempty target, mismatched data, and invalid foreign keys abort the
import and roll back all inserted rows.

The three old nonlocalized `search` columns are retained by an adapter schema hook.
Current search functionality continues to use `search_locales`. Sequence high-water
marks are preserved for AUTOINCREMENT IDs, including IDs deleted before backup.

## 1. Prepare and convert locally

Use Node 24, pnpm, and the SQLite CLI. Keep the original `PAYLOAD_SECRET`, S3/R2
configuration, and PostgreSQL backup. Never commit databases or backups.

The destination must not be in use by an application. Initialization and import
must use the **same** database URL. If a target contains data, select a new filename
rather than deleting or overwriting it.

```bash
pnpm install --frozen-lockfile
DATABASE_URL=file:./data/xc2f.db pnpm db:init
pnpm db:import backups/BACKUP.sql.gz file:./data/xc2f.db
pnpm db:verify backups/BACKUP.sql.gz file:./data/xc2f.db
```

`db:init` disables automatic background jobs and email transport initialization.
`db:import` never initializes Payload or runs content hooks, mail delivery, or jobs.
Verification compares a SHA-256 multiset digest of every source field in every
table after explicit type conversion, then checks foreign keys and integrity.
It does not expose row contents or password hashes in output. The original backup
is unchanged. JSON and rich-text fields are preserved as JSON text, booleans become
SQLite integers, and timestamps become UTC ISO strings at millisecond precision.

## 2. Test a disposable copy

Create a consistent snapshot; do not copy a running database file without its WAL:

```bash
sqlite3 -readonly data/xc2f.db "VACUUM INTO '/tmp/xc2f-smoke-check.db';"
NODE_ENV=production ENABLE_EMAIL=false DISABLE_BACKGROUND_JOBS=true \
  DATABASE_URL=file:/tmp/xc2f-smoke-check.db \
  pnpm payload run scripts/sqlite/smoke.ts
pnpm test:sqlite
pnpm exec tsc --noEmit
pnpm build
```

The smoke check expects a populated production backup with posts and their versions.
It mutates only the disposable database: reads both locales and relationships,
checks globals and version history, creates and authenticates a temporary user,
rolls back a nested-block write, publishes a draft, and verifies post-to-search sync.
Use a new snapshot filename for each run. All automatic jobs and external email
delivery remain disabled. For manual review, point the app at another disposable
copy and verify existing account login, editing, media URLs, and both locales.

## 3. Final export and server cutover

The supplied backup is a point-in-time snapshot. If production has changed since
then, stop production writes (including cron and workers), take a final PostgreSQL
backup, and repeat conversion and verification into a fresh SQLite file. Keep the
old app stopped until cutover finishes; R2/S3 media does not need to move.

Build and tag the new SQLite application image before the maintenance window.
Transfer the verified database to the server's `data/xc2f.db`. Preserve secrets in
the server's existing `.env`; remove the obsolete PostgreSQL `DATABASE_URL` or
replace it with `file:/app/data/xc2f.db`. Compose also sets this URL explicitly.
Set `DISABLE_BACKGROUND_JOBS=true` for the first verification startup.

Both Compose files bind the host `./data` directory to `/app/data`. The path is
relative to the Compose file; no SQLite Docker volume needs to be created or populated.
Prepare the directory while the application is stopped, and place the verified
SQLite database at `data/xc2f.db`. The short bind syntax (`./data:/app/data`) supports
older `docker-compose` installations without `create_host_path`. Prepare the data
before startup; `scripts/deploy.sh` checks for a nonempty database.
On a Linux production server, grant the standalone container's UID/GID 1001 access:

```bash
sudo chown -R 1001:1001 ./data
sudo chmod 755 ./data
sudo chmod 600 ./data/xc2f.db
```

The development container uses UID/GID `1000:1000` instead. Set ownership for the
container you are using on Linux. Host and Docker instances must not run against
this shared database simultaneously during validation.

If you already started SQLite using `xc2f_sqlite_data` or
`xc2f_sqlite_dev_data`, stop that application and export a consistent snapshot from
its volume before switching mounts. The new bind mount does not copy volume data.
Keep the old volume, compare its data with any existing `./data/xc2f.db`, and do not
overwrite either database without choosing the intended source and backing it up.

Use a pinned version/tag in `docker-compose.prod.yml` for this cutover. Then start
the new app, check logs and both locales, and sign in using an existing account:

```bash
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml logs --tail=100 payload
```

Check the scheduled-job list before enabling background jobs: imported records
retain their source state. Resume production jobs by setting
`DISABLE_BACKGROUND_JOBS=false` and recreating the app container. Run an admin
backup and confirm a new `.sqlite.gz` object exists in R2/S3, then restore it into
a disposable file and check integrity before ending the maintenance window.

After successful validation, stop the old `postgres` container to release its RAM.
Retain `xc2f_pgdata`, the final SQL backup, old deployment files, and old image tag.
Do not run `docker compose down -v` or remove PostgreSQL volumes.

## 4. Restore SQLite backups

Download a `.sqlite.gz` backup from R2/S3 and restore to a **new** filename:

```bash
gzip -dc backups/BACKUP.sqlite.gz > data/restored.db
sqlite3 -readonly data/restored.db 'PRAGMA integrity_check; PRAGMA foreign_key_check;'
```

Expected output: `ok`, with no foreign-key violation rows. Stop the application
before replacing the active database. Take a snapshot of the current database,
remove or archive its old WAL/SHM sidecars while all connections are closed, install
the verified restored file, correct ownership, and restart. Never replace only the
main `.db` while an application connection is open.

## 5. Rollback

Before reopening writes, rollback is straightforward: stop the SQLite app, restore
the previous image/Compose files and PostgreSQL environment configuration from the
pre-migration revision, then start the old PostgreSQL deployment using its retained
`xc2f_pgdata` volume. `docker-compose.postgres.yml` can also bring that original
database up in isolation for inspection/export (requires its original database
credentials and the existing volume).

Once writes have resumed on SQLite, PostgreSQL is stale. Back up SQLite and plan
data reconciliation before rolling back; reverting images alone would discard
post-cutover changes.
