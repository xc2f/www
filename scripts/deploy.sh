#!/usr/bin/env bash
set -e

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

cd "$PROJECT_DIR"

# 定义文件路径变量
COMPOSE_FILE="docker-compose.prod.yml"

echo "🚀 Starting deployment..."

# 1. 拉取最新镜像
echo "📥 Pulling latest images..."
docker-compose -f $COMPOSE_FILE pull

# 2. 启动/更新容器
echo "🆙 Starting containers..."
docker-compose -f $COMPOSE_FILE up -d

# 3. 清理旧镜像
echo "🧹 Cleaning up old images..."
docker image prune -f

echo "✅ Deployment completed successfully!"
