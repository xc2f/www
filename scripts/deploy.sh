#!/usr/bin/env bash
set -e

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

cd "$PROJECT_DIR"

echo "👉 Stop docker"
docker-compose down

echo "👉 Stash docker-compose.yml"
git stash push -- docker-compose.yml || true

echo "👉 Pull main"
git pull origin main

echo "👉 Fetch build"
git fetch origin build

echo "👉 Clean build artifacts"
rm -rf .next public

echo "👉 Restore build artifacts"
git restore --source origin/build .next public

echo "👉 Restore stash"
git stash pop || true

echo "👉 Start docker"
docker-compose up -d
