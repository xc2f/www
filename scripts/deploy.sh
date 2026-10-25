#!/usr/bin/env bash
set -Eeuo pipefail

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

if ! mkdir .deploy.lock 2>/dev/null; then
  echo "Another deployment holds .deploy.lock. If it was interrupted, verify no deployment is running before removing the lock."
  exit 1
fi

ROLLBACK_FILE=""
DEPLOY_STARTED=false
PREVIOUS_IMAGE=""
cleanup() {
  if [ -n "$ROLLBACK_FILE" ]; then rm -f "$ROLLBACK_FILE"; fi
  rmdir .deploy.lock
}
trap cleanup EXIT

wait_for_application() {
  local endpoint="$1"
  local attempt
  for attempt in {1..30}; do
    if docker compose -f "$COMPOSE_FILE" exec -T payload node -e \
      'fetch("http://127.0.0.1:3000" + process.argv[1], {signal: AbortSignal.timeout(5000), redirect: "manual"})
       .then(r => process.exit(r.status >= 200 && r.status < 400 ? 0 : 1))
       .catch(() => process.exit(1))' "$endpoint"; then
      return 0
    fi
    sleep 5
  done
  return 1
}

deployment_failed() {
  trap - ERR
  echo "Deployment failed."
  docker compose -f "$COMPOSE_FILE" logs --tail=80 payload || true
  if [ "$DEPLOY_STARTED" = true ] && [ -n "$PREVIOUS_IMAGE" ]; then
    echo "Restoring previous image: xc2f-payload:rollback"
    ROLLBACK_FILE="$(mktemp)"
    cat > "$ROLLBACK_FILE" <<'YAML'
services:
  payload:
    image: xc2f-payload:rollback
    healthcheck:
      test:
        - CMD
        - node
        - -e
        - "fetch('http://127.0.0.1:3000/admin/login', {signal: AbortSignal.timeout(5000), redirect: 'manual'}).then(r => process.exit(r.status >= 200 && r.status < 400 ? 0 : 1)).catch(() => process.exit(1))"
YAML
    # Stop the new process before starting the old one: backup recovery assumes one worker.
    if docker compose -f "$COMPOSE_FILE" stop payload &&
      docker compose -f "$COMPOSE_FILE" -f "$ROLLBACK_FILE" up -d --no-deps --force-recreate payload &&
      wait_for_application /admin/login; then
      echo "Previous image restored; the admin login responds. Database migrations were not reversed. Verify application behavior before retrying deployment."
    else
      echo "ROLLBACK FAILED. Inspect container logs and database compatibility before taking further action."
    fi
  fi
  exit 1
}
trap deployment_failed ERR

echo "🚀 Starting deployment..."

# Require the prepared volume before starting the application.
if ! docker volume inspect xc2f_sqlite_data >/dev/null 2>&1; then
  echo "SQLite volume xc2f_sqlite_data is missing. See README.md for initial setup."
  exit 1
fi

PREVIOUS_IMAGE="$(docker inspect payload --format '{{.Image}}' 2>/dev/null || true)"
if [ -n "$PREVIOUS_IMAGE" ]; then
  docker image tag "$PREVIOUS_IMAGE" xc2f-payload:rollback
fi

# 1. 拉取最新镜像
echo "📥 Pulling latest images..."
docker compose -f "$COMPOSE_FILE" pull
docker compose -f "$COMPOSE_FILE" run --rm --no-deps --entrypoint node payload -e \
  'const fs = require("fs");
   const file = "/app/data/xc2f.db";
   if (!fs.statSync(file).isFile() || !fs.statSync(file).size) process.exit(1);
   fs.accessSync("/app/data", fs.constants.R_OK | fs.constants.W_OK | fs.constants.X_OK);
   fs.accessSync(file, fs.constants.R_OK | fs.constants.W_OK)'

# 2. 启动/更新容器
echo "🆙 Starting containers..."
DEPLOY_STARTED=true
docker compose -f "$COMPOSE_FILE" stop payload
docker compose -f "$COMPOSE_FILE" up -d --no-deps payload
if ! wait_for_application /api/health; then
  deployment_failed
fi

# 3. 清理旧镜像
echo "🧹 Cleaning up old images..."
docker image prune -f || echo "Image cleanup failed; application health checks passed."

echo "✅ Deployment completed successfully!"
