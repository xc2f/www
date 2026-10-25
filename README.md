# 📖

## What's this

A personal research project forked from the Payload CMS [website](https://github.com/payloadcms/website). Based on the official example, the following features have been added:

- Integrated Amazon SES for email delivery.
- Feeds collection with JSON or plain-text API output.
- Note-taking and content recording support.
- Scheduled database backups.
- File and media uploads to Cloudflare R2 or AWS S3.
- Built-in chart block for visual data analysis and presentation.
- Markdown support for rich text content (like tables, math, etc.)
- Moments.
- Image upload watermark.
- Organized Payload Admin collections with grouped navigation, default sorting, and icon labels.
- Production-safe seed endpoint: demo seeding is disabled when `NODE_ENV=production`.

## Database

The application uses local SQLite through `@payloadcms/db-sqlite`, with WAL,
explicit transactions, and a 30-second busy timeout. Media stays in S3/R2.
Production uses a single application instance with the Docker named volume `xc2f_sqlite_data` mounted at `/app/data`.

## Develop

1. Run `nvm install` and `nvm use` to select Node.js 24.22.1 from `.nvmrc` (also used by CI and Docker).
2. Copy `.env.example` to `.env` and configure Payload secrets and S3/R2 credentials.
3. Run `pnpm install --frozen-lockfile`.
4. Run `pnpm db:init`, then `pnpm dev`.

On the host, the default database is `data/xc2f.db`. Docker Compose uses
`file:/app/data/xc2f.db` in the separate `xc2f_sqlite_dev_data` named volume:

```bash
docker compose up -d --build
```

Local files in `data/` and `backups/` are excluded from Git and Docker build contexts.
Host `./data` files are not automatically imported into either Docker volume.
The development image initializes its volume directory for UID/GID `1000:1000`.
The production volume is external and must be created before the first startup.
The production image initializes its data directory for UID/GID `1001:1001`.
Keep `DISABLE_BACKGROUND_JOBS=true` when running a local copy of production data.

Development auto-login is configured in `src/payload.config.ts` for the original
local seed account. Imported production accounts retain their own credentials;
use those credentials to sign in.

## Validation

```bash
pnpm test:sqlite
pnpm exec tsc --noEmit
pnpm build
```

`test:sqlite` verifies that a compressed SQLite snapshot restores committed WAL data
into a standalone database with valid integrity. Standalone builds include the full
SQLite client dependency tree; the production image checks both ESM and CommonJS
clients, native bindings, Base64 encoding, and transactions during its build.

## Build and deploy

GitHub Actions builds the production standalone image and pushes it to ECR:

```text
public.ecr.aws/umcai/xc2f/payload:latest
```

Configure `AWS_OIDC_ROLE`, `AWS_ECR_REGISTRY`, `NEXT_PUBLIC_SERVER_URL`, and
`NEXT_PUBLIC_SITE_NAME` in the GitHub production environment. Builds use an isolated
SQLite path, and local database files are excluded from the image.

Runtime requires the secrets and S3/R2 variables documented in `.env.example`.
`DATABASE_URL` is fixed by Compose to `file:/app/data/xc2f.db`; the standalone
application runs as UID/GID `1001:1001` and the database directory must be writable.

For a new installation, create the external data volume and start the application:

```bash
docker volume create xc2f_sqlite_data
docker compose -f docker-compose.prod.yml up -d
```

Payload initializes the SQLite schema on first database access. Open `/admin` to
create the initial account. Existing deployments continue using the database already
stored in `xc2f_sqlite_data`.

For later deployments:

```bash
bash scripts/deploy.sh
```

The deployment script requires `xc2f_sqlite_data` to exist and checks database
access from inside the container before updating the application. Host `./data`
is no longer used by the running container. Do not delete the active Docker volume.
The standalone application applies bundled SQLite migrations on
startup. New SQLite schema changes need a committed migration:

```bash
pnpm run db:migrate:create add_post_summary
```

Replace `add_post_summary` with a descriptive migration name. This command generates
the migration, Payload types, and admin import map, then runs TypeScript validation.
It stops on the first failed step. Review the generated SQL before applying it to
your local database:

```bash
pnpm run db:migrate
pnpm run db:migrate:status
```

`pnpm run db:init` is an alias for `pnpm run db:migrate`. These commands use the
database configured by `DATABASE_URL`; without it, the host default is `data/xc2f.db`.
Email and background jobs are disabled during migration commands.

SQLite schema migrations live in `src/migrations/sqlite`. Keep the baseline and
subsequent migrations committed so fresh installations and upgrades use the same schema.
Production applies pending bundled migrations when the new image starts; deploy
with `pnpm run deploy` after building the image. Back up the active database before
schema-changing deployments; image rollback does not reverse database migrations.

### Scheduled database backups

With `DISABLE_BACKGROUND_JOBS=false`, backups run daily at midnight in the
container's timezone (UTC by default, or 08:00 Asia/Shanghai). The queue polls
every minute. Failed backups have up to three retries; successful jobs are
deleted by Payload, and backup files are stored under `backups/` in R2.

Before starting the queue, Payload releases unfinished `backupDatabase` jobs
whose last update predates the Node process startup. This recovers jobs left
with `processing=true` by a container restart. Recovery logs the affected job IDs,
preserves completed/failed jobs and other task types, and is disabled during
production builds or when `DISABLE_BACKGROUND_JOBS=true`.

This recovery assumes the current single-container, single-Node-process deployment.
Before adding concurrent workers or rolling deployments sharing the same SQLite
database, replace it with worker ownership/leases so a new process cannot release
another process's active backup. Retrying an interrupted upload can produce an
additional backup object; existing backups are preserved.

Each snapshot/compression/upload attempt is cancelled after ten minutes. Backup
outcomes are written atomically beside the SQLite file as
`xc2f.db.backup-status.json`, so completion history survives container replacement
and Payload's deletion of successful job records. Keep this file with the data
volume. It is operational metadata, not part of the database snapshot.

`GET /api/backup/status` requires an admin session or `Authorization: Bearer
<CRON_SECRET>`. It returns HTTP 200 when the latest outcome is successful and the
last successful upload is at most 26 hours old. Missing history, failed attempts,
overdue backups, and unreadable status files return HTTP 503. After first deploying
this feature, the first successful backup establishes its history; older R2
objects are not imported automatically. A successful retry restores HTTP 200.
The endpoint tracks completed uploads; it does not check whether someone later
deletes an object from R2 or verify that the backup can be restored.

Configure your monitoring service to poll that endpoint with the secret header
and alert on HTTP 503 or connection failure. No external notification service is
configured by this repository. `GET /api/health` is a separate public application
and database readiness check; it returns no content or user data.

### Deployment verification and rollback

`scripts/deploy.sh` preserves the current image as `xc2f-payload:rollback`, checks
volume access before stopping the current app, and starts the new image without
removing the Compose project. It polls `/api/health` up to 30 times with five-second
intervals and five-second HTTP timeouts. Deployment succeeds only when Payload's
database query succeeds. Concurrent deployments are blocked by `.deploy.lock`.

On startup/readiness failure, the script attempts to restart the previous image
and still exits with a failure code. Rollback probes `/admin/login` for compatibility
with older images that have no health endpoint; this is a smoke check, so verify
application behavior afterward. Database migrations are **not** reversed and may
be incompatible with an older image. Take a verified database backup before
schema-changing deployments and follow the restore procedure below if needed.
If an interrupted deployment leaves `.deploy.lock`, verify no deployment is
running before removing that directory. `PAYLOAD_IMAGE` can pin the production
Compose service to a specific image tag instead of `latest`.

Run `pnpm test:ops` for SQLite backup/recovery, real mail-queue retries, system
endpoint access, and deployment failure/rollback simulations. Production image
CI runs these checks and TypeScript validation before publishing the image.

## Backups

The scheduled task and admin backup endpoint create a consistent SQLite snapshot
using `sqlite3 VACUUM INTO`, gzip it, and upload it to `backups/` in S3/R2. Docker
images include the SQLite CLI. Host installations also need `sqlite3` on `PATH`.
To restore a backup, decompress it to a new file and run `PRAGMA integrity_check`
and `PRAGMA foreign_key_check`. Stop the application, take a snapshot of the current
database, and restore the verified file into `xc2f_sqlite_data` using a helper
container. Set ownership to `1001:1001` and remove or archive old WAL/SHM sidecars
while all connections are closed before restarting. Replacing a host `./data` file
does not update the database in the Docker volume.

## Seed data

`POST /next/seed` resets demo content in development/test environments only.
The route returns `404` in production. Do not run it against imported data.
