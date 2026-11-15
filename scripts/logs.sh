#!/usr/bin/env bash

COMPOSE_FILE="docker-compose.prod.yml"

exec docker compose -f "$COMPOSE_FILE" logs -f payload
