#!/usr/bin/env bash
set -e

# 如果 deploy.sh 和 docker-compose.yml 在同一层级
# ======== 删除 begin ========
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"
# ======== 删除 end ========

echo "👉 Pull main"
git pull origin main

echo "👉 Fetch build"
git fetch origin build

echo "👉 Clean build artifacts"
rm -rf .next public

echo "👉 Restore build artifacts"
git restore --source origin/build .next public

echo "👉 Start docker"
docker-compose down
docker-compose up -d
