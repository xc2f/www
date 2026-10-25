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
pnpm payload migrate:create describe_change
pnpm generate:types
pnpm generate:importmap
```

SQLite schema migrations live in `src/migrations/sqlite`. Keep the baseline and
subsequent migrations committed so fresh installations and upgrades use the same schema.

## Upgrading to Payload 3.92.0

Payload and all `@payloadcms/*` packages are pinned to 3.92.0. Next.js is on
15.4.11 to satisfy Payload's peer dependency; Nodemailer uses version 10 with its
built-in types. Node.js must satisfy `^22.23.4 || >=24.22.1`; this project uses
24.22.1 in `.nvmrc` and Docker images.

Before updating an existing deployment, take a consistent backup of its active
SQLite database. The bundled `payload_3_92` migration adds the media `_objectKey`
and user `resetPasswordRequestedAt` columns and indexes on localized parent IDs.
Existing media objects stay in place. Production applies the migration on startup;
for host development, run `pnpm db:init` before `pnpm dev`.

Re-create any pending scheduled publish/unpublish events after the upgrade because
Payload changed the scheduling user's representation. New uploads also follow
stricter SVG/XML validation and a default 50 MiB multipart request limit. Verify
any workflows that rely on those formats or larger requests before deploying.

References: [3.90.0 upgrade notes](https://github.com/payloadcms/payload/releases/tag/v3.90.0)
and [3.92.0 release notes](https://github.com/payloadcms/payload/releases/tag/v3.92.0).

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
