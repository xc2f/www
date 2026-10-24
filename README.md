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
Production uses a single application instance and a local persistent Docker volume.

**Existing PostgreSQL deployments:** follow [the migration runbook](docs/sqlite-migration.md)
before deploying this version. Changing the adapter does not migrate your data.
The original PostgreSQL volume and migrations are retained for rollback.

## Develop

1. Copy `.env.example` to `.env` and configure Payload secrets and S3/R2 credentials.
2. Run `pnpm install --frozen-lockfile`.
3. Run `pnpm db:init`, then `pnpm dev`.

On the host, the default database is `data/xc2f.db`. Docker Compose uses
`file:/app/data/xc2f.db` in the separate `xc2f_sqlite_dev_data` volume:

```bash
docker compose up -d --build
```

Local files in `data/` and `backups/` are excluded from Git and Docker build contexts.
A host database is not automatically copied into the Docker development volume.
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

`test:sqlite` verifies COPY decoding, authentication hash preservation, sequence
continuity, refusal to overwrite populated databases, transactional rollback,
and restoring committed WAL data from a compressed SQLite backup.

The migration runbook also covers testing Payload against a disposable copy of
real data, including authentication, drafts, versions, localized content, and search.

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

After preparing and verifying the persistent `xc2f_sqlite_data` volume:

```bash
docker compose -f docker-compose.prod.yml up -d
```

`pnpm deploy` checks that the SQLite volume and database file exist before replacing
the application. The standalone application applies bundled SQLite migrations on
startup. New SQLite schema changes need a committed migration:

```bash
pnpm payload migrate:create describe_change
pnpm generate:types
pnpm generate:importmap
```

SQLite migrations live in `src/migrations/sqlite`. PostgreSQL history is archived
under `src/migrations/postgres` and is never run against SQLite.

## Backups

The scheduled task and admin backup endpoint create a consistent SQLite snapshot
using `sqlite3 VACUUM INTO`, gzip it, and upload it to `backups/` in S3/R2. Docker
images include the SQLite CLI. Host installations also need `sqlite3` on `PATH`.
See the runbook for restore and rollback steps.

## Seed data

`POST /next/seed` resets demo content in development/test environments only.
The route returns `404` in production. Do not run it against imported data.
