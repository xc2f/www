#!/usr/bin/env bash

COMPOSE_FILE="docker-compose.prod.yml"

docker compose -f "$COMPOSE_FILE" exec -T payload pnpm db:migrate
STATUS=$?

if [[ $STATUS -eq 0 ]]; then
  echo "✅ 数据库迁移成功"
else
  echo "❌ 数据库迁移失败 (exit code: $STATUS)"
fi

exit "$STATUS"
