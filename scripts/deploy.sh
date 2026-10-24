#!/usr/bin/env bash
set -e

COMPOSE_FILE="docker-compose.prod.yml"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Support both a standalone server upload and the repository's scripts/ layout.
if [ -f "$SCRIPT_DIR/$COMPOSE_FILE" ]; then
  PROJECT_DIR="$SCRIPT_DIR"
elif [ -f "$SCRIPT_DIR/../$COMPOSE_FILE" ]; then
  PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
else
  echo "Cannot locate $COMPOSE_FILE beside the deployment script or in its parent directory."
  exit 1
fi
cd "$PROJECT_DIR"

echo "🚀 Starting deployment..."

# Require the prepared volume before starting the application.
if ! docker volume inspect xc2f_sqlite_data >/dev/null 2>&1; then
  echo "SQLite volume is missing. Run migrate-sqlite-volume.sh before deploying."
  exit 1
fi

# 1. 拉取最新镜像
echo "📥 Pulling latest images..."
docker-compose -f "$COMPOSE_FILE" pull
docker-compose -f "$COMPOSE_FILE" run --rm --no-deps --entrypoint node payload -e \
  'const fs = require("fs");
   const file = "/app/data/xc2f.db";
   if (!fs.statSync(file).isFile() || !fs.statSync(file).size) process.exit(1);
   fs.accessSync("/app/data", fs.constants.R_OK | fs.constants.W_OK | fs.constants.X_OK);
   fs.accessSync(file, fs.constants.R_OK | fs.constants.W_OK)'

# 2. 启动/更新容器
echo "🆙 Starting containers..."
docker-compose -f "$COMPOSE_FILE" down
docker-compose -f "$COMPOSE_FILE" up -d

# 3. 清理旧镜像
echo "🧹 Cleaning up old images..."
docker image prune -f

echo "✅ Deployment completed successfully!"
