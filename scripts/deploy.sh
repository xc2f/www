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
if ! docker volume inspect xc2f_sqlite_data >/dev/null 2>&1; then
  echo "SQLite volume is missing. Complete docs/sqlite-migration.md before deploying."
  exit 1
fi

# 1. 拉取最新镜像
echo "📥 Pulling latest images..."
docker-compose -f $COMPOSE_FILE pull
docker-compose -f "$COMPOSE_FILE" run --rm --no-deps --entrypoint node payload -e \
  'if (!require("fs").statSync("/app/data/xc2f.db").size) process.exit(1)'

# 2. 启动/更新容器
echo "🆙 Starting containers..."
docker-compose -f $COMPOSE_FILE down
docker-compose -f $COMPOSE_FILE up -d

# 3. 清理旧镜像
echo "🧹 Cleaning up old images..."
docker image prune -f

echo "✅ Deployment completed successfully!"
