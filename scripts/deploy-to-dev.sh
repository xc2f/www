#!/usr/bin/env bash
set -e

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

cd "$PROJECT_DIR"

echo "👉 Pull main"
git pull origin main

echo "👉 Fetch build"
git fetch origin build

echo "👉 Clean build artifacts"
rm -rf .next public

echo "👉 Restore build artifacts"
git restore --source origin/build .next public

echo "👉 Start docker"
docker-compose up -d
