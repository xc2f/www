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

## Develop

### Start Server

```bash
docker-compose up -d
```

### Initial Admin Account

- Email: `admin@local.host`
- Password: `123456`

### Admin Collections

Payload Admin collections are grouped for easier navigation:

- `Content`: Pages, Posts, Moments, Videos
- `Taxonomy`: Categories, Tags, Video Topics
- `Media`: Media
- `Tools`: Feeds, Mails, Notes
- `System`: Users

Collections also define default list sorting. Content lists generally sort by latest publish or update time, taxonomy lists sort by title, and operational collections sort by latest activity.

### Seed Data

The local seed route is:

```bash
POST /next/seed
```

It resets demo content and should only be used for local or test environments. In production, the route returns `404` and does not run.

## Build

Docker images are built using GitHub Actions. You need to configure the following environment variables in your [GitHub Environment Settings](https://github.com/xc2f/www/settings/environments).

- AWS_OIDC_ROLE
- AWS_ECR_REGISTRY
- NEXT_PUBLIC_SERVER_URL
- NEXT_PUBLIC_SITE_NAME

The workflows load `.env.example` as build-time defaults, then override the public build variables above from GitHub environment variables. The deployed application still requires the runtime environment variables documented in `.env.example`, including Payload, database, preview/cron secrets, email settings, and S3/R2 storage settings.

Required S3/R2 storage variables:

- S3_ENDPOINT
- S3_BUCKET
- S3_ACCESS_KEY_ID
- S3_SECRET
- S3_REGION, optional, defaults to `auto`

The ARM image is built by default. To build an x86 (linux/amd64) image, search for `ubuntu-latest` and `linux/amd64` in the `.github/workflows/` files and uncomment the corresponding lines.

## Deploy

### Deploy with Docker Compose (Recommended)

```bash
# Required files
docker-compose.prod.yml
.env
postgres/**

# Optional files
scripts/**
```

#### 1. Production Image

> In most cases, the server should use this image

```bash
public.ecr.aws/umcai/xc2f/payload:latest
```

After pushing to the `main` branch, GitHub CI will build a standalone mode image and push it to ECR.

#### 2. Production Image with Dev Environment

```bash
public.ecr.aws/umcai/xc2f/payload:dev-latest
```

This image supports running `pnpm` scripts, such as `pnpm payload migrate`.
You need to dispatch `Build and Push Dev Image` manually in CI.

### Deploy with Docker + Build Branch

```bash
# .env
APP_CMD=start
```

1. Manually dispatch `Build and Push to Build Branch` in CI.
2. The server needs to pull the latest project code (dependencies not required).
3. Build a local image: `docker-compose build`
4. On the server side, deploy with: `pnpm run deploy:build`

### Deploy with Build Branch

1. Manually dispatch `Build and Push to Build Branch` in CI.
2. The server needs to pull the latest code and install dependencies.
3. On the server side, deploy with: `pnpm run deploy:build`

## Troubleshooting

- On first startup, you may encounter an error indicating that `external volume "xc2f_pgdata" not found`. You can resolve this by commenting out the `volumes.pgdata.external` and `volumes.pgdata.name` lines in `docker-compose.yml`. Or you can create the xc2f_pgdata volume by running `docker volume create xc2f_pgdata`.
- On first startup or after new table structures are added, enter the payload container to run `pnpm payload migrate:create` and `pnpm payload migrate`.
- If the API returns a 404, check if the URL is being processed by locale middleware. Exclude the API prefix in `src/middleware.ts`.
- If startup fails with `Missing required environment variable: S3_*`, check the S3/R2 variables in `.env`. Storage is configured at Payload startup and missing credentials fail fast.

## Commands

### docker-compose

- build: `docker-compose build`
- stop: `docker-compose down`
- start: `docker-compose up -d`
- enter payload container: `docker-compose exec payload sh`

### Stash A File with Git

```bash
git stash push -- docker-compose.yml
```

### Change Postgres volume name

```bash
docker run --rm -v ${FROM_NAME_pgdata}:/from -v ${TO_NAME_pgdata}:/to alpine sh -c "cd /from && cp -a . /to"
```

### Change Postgres Password

```bash
docker-compose exec postgres sh
psql -U postgres
ALTER USER postgres WITH PASSWORD 'postgres';
# Note: Put the new password in single quotes; end command with semicolon
```

### Database Migration

```bash
# Enter payload container
docker-compose exec payload sh

# Create migration
pnpm payload migrate:create

# Apply migration
pnpm payload migrate

# Exit container
exit

# Confirm migration filename
docker exec -it payload ls /app/src/migrations

# Copy to host machine
docker cp payload:/app/src/migrations/. ./migrations/

# Merge and commit
cd ~/www-code
git pull
cp -r ~/www/migrations/* ./src/migrations/
git status
git add -A && git commit -m "chore: generate payload migrations" && git push
```
