#!/usr/bin/env bash
set -e

# 如果 deploy.sh 和 docker-compose.yml 在同一层级
# ======== 删除 begin ========
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"
# ======== 删除 end ========

# 定义文件路径变量，根据 docker-compose file name 更新
COMPOSE_FILE="docker-compose.prod.yml"

echo "🚀 Starting deployment..."

# Prevent an existing PostgreSQL installation from silently booting an empty site.
if [ ! -f "$PROJECT_DIR/data/xc2f.db" ] || [ ! -s "$PROJECT_DIR/data/xc2f.db" ]; then
  echo "data/xc2f.db is missing or empty. Complete docs/sqlite-migration.md before deploying."
  exit 1
fi

# 1. 拉取最新镜像
echo "📥 Pulling latest images..."
docker-compose -f $COMPOSE_FILE pull
docker-compose -f "$COMPOSE_FILE" run --rm --no-deps --entrypoint node payload -e \
  'const fs = require("fs");
   const file = "/app/data/xc2f.db";
   if (!fs.statSync(file).isFile() || !fs.statSync(file).size) process.exit(1);
   fs.accessSync("/app/data", fs.constants.R_OK | fs.constants.W_OK | fs.constants.X_OK);
   fs.accessSync(file, fs.constants.R_OK | fs.constants.W_OK)'

# 2. 启动/更新容器
echo "🆙 Starting containers..."
docker-compose -f $COMPOSE_FILE down
docker-compose -f $COMPOSE_FILE up -d

# 3. 清理旧镜像
echo "🧹 Cleaning up old images..."
docker image prune -f

echo "✅ Deployment completed successfully!"
