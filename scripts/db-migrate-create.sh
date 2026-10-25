#!/usr/bin/env bash
set -Eeuo pipefail

if [ "$#" -ne 1 ] || [[ ! "$1" =~ ^[a-zA-Z0-9][a-zA-Z0-9_-]*$ ]]; then
  echo "Usage: pnpm run db:migrate:create add_post_summary" >&2
  exit 1
fi

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

export ENABLE_EMAIL=false
export DISABLE_BACKGROUND_JOBS=true

pnpm run payload migrate:create "$1"
pnpm run generate:types
pnpm run generate:importmap
pnpm run typecheck

echo "Migration generated. Review src/migrations/sqlite/, then run pnpm run db:migrate to apply it."
