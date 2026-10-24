#!/usr/bin/env bash
set -euo pipefail

COMPOSE_FILE="docker-compose.prod.yml"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -f "$SCRIPT_DIR/$COMPOSE_FILE" ]; then
  PROJECT_DIR="$SCRIPT_DIR"
elif [ -f "$SCRIPT_DIR/../$COMPOSE_FILE" ]; then
  PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
else
  echo "Cannot locate $COMPOSE_FILE beside the script or in its parent directory."
  exit 1
fi
cd "$PROJECT_DIR"

if [ ! -d "$PROJECT_DIR/data" ]; then
  echo "Source directory is missing: $PROJECT_DIR/data"
  exit 1
fi

docker volume create xc2f_sqlite_data >/dev/null

# Refuse an existing target before interrupting the application.
docker-compose -f "$COMPOSE_FILE" run --rm --no-deps --user 0 --entrypoint sh \
  -v "$PROJECT_DIR/data:/source:ro" payload -c '
    set -eu
    if [ ! -f /source/xc2f.db ] || [ ! -s /source/xc2f.db ]; then
      echo "Source database is missing or empty: /source/xc2f.db"
      exit 1
    fi
    test "$(sqlite3 -readonly /source/xc2f.db ".timeout 30000" "PRAGMA quick_check;")" = "ok"
    for file in /app/data/xc2f.db /app/data/xc2f.db-wal /app/data/xc2f.db-shm; do
      if [ -e "$file" ]; then
        echo "Target volume already contains SQLite files; refusing to overwrite: $file"
        exit 1
      fi
    done
  '

echo "Stopping the application before copying the database..."
docker-compose -f "$COMPOSE_FILE" stop payload

docker-compose -f "$COMPOSE_FILE" run --rm --no-deps --user 0 --entrypoint sh \
  -v "$PROJECT_DIR/data:/source:ro" payload -c '
    set -eu
    test ! -e /app/data/xc2f.db
    test ! -e /app/data/xc2f.db-wal
    test ! -e /app/data/xc2f.db-shm
    sqlite3 -readonly /source/xc2f.db ".timeout 30000" "VACUUM INTO '\''/app/data/xc2f.db'\'';"
    test "$(sqlite3 -readonly /app/data/xc2f.db "PRAGMA integrity_check;")" = "ok"
    test -z "$(sqlite3 -readonly /app/data/xc2f.db "PRAGMA foreign_key_check;")"
    chown 1001:1001 /app/data /app/data/xc2f.db
    chmod 700 /app/data
    chmod 600 /app/data/xc2f.db
  '

docker-compose -f "$COMPOSE_FILE" up -d --force-recreate payload
echo "SQLite migrated to xc2f_sqlite_data. Original ./data files are retained."
