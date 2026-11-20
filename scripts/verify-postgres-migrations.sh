#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="$ROOT_DIR/docker-compose.postgres.yml"
MODULE_DIR="$ROOT_DIR/plm-backend"
PORT="${PLM_MIGRATION_VERIFY_PORT:-18082}"
LOG_FILE="${TMPDIR:-/tmp}/plm2-postgres-migration-verify.log"
APP_PID=""
USE_DOCKER="${PLM_POSTGRES_USE_DOCKER:-true}"

required_commands=(mvn java curl lsof)
if [[ "$USE_DOCKER" == true ]]; then
  required_commands+=(docker)
elif [[ "$USE_DOCKER" == false ]]; then
  required_commands+=(psql pg_isready)
else
  printf 'ERROR: PLM_POSTGRES_USE_DOCKER must be true or false.\n' >&2
  exit 2
fi

for command_name in "${required_commands[@]}"; do
  if ! command -v "$command_name" >/dev/null 2>&1; then
    printf 'ERROR: required command is missing: %s\n' "$command_name" >&2
    exit 127
  fi
done

: "${PLM_POSTGRES_PASSWORD:?Set PLM_POSTGRES_PASSWORD locally; do not commit it.}"
: "${PLM_JWT_SECRET:?Set PLM_JWT_SECRET locally; do not commit it.}"

export PLM_POSTGRES_DB="${PLM_POSTGRES_DB:-plm2}"
export PLM_POSTGRES_USER="${PLM_POSTGRES_USER:-plm2}"
export PLM_POSTGRES_PORT="${PLM_POSTGRES_PORT:-5432}"
export PLM_POSTGRES_HOST="${PLM_POSTGRES_HOST:-127.0.0.1}"
export SPRING_PROFILES_ACTIVE=dev
export SPRING_DATASOURCE_URL="jdbc:postgresql://${PLM_POSTGRES_HOST}:${PLM_POSTGRES_PORT}/${PLM_POSTGRES_DB}"
export SPRING_DATASOURCE_DRIVER_CLASS_NAME=org.postgresql.Driver
export SPRING_DATASOURCE_USERNAME="$PLM_POSTGRES_USER"
export SPRING_DATASOURCE_PASSWORD="$PLM_POSTGRES_PASSWORD"
export SERVER_PORT="$PORT"
export SERVER_ADDRESS=127.0.0.1

cd "$MODULE_DIR"
export JAVA_HOME="${JAVA_HOME:-$(/usr/libexec/java_home -v 17 2>/dev/null || true)}"
if [[ -n "$JAVA_HOME" ]]; then
  export PATH="$JAVA_HOME/bin:$PATH"
fi

if lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  printf 'ERROR: verification port %s is already occupied; refusing to replace the process.\n' "$PORT" >&2
  exit 1
fi

if [[ "$USE_DOCKER" == true ]]; then
  docker compose -f "$COMPOSE_FILE" up -d postgres
else
  if ! pg_isready -h "$PLM_POSTGRES_HOST" -p "$PLM_POSTGRES_PORT" -U "$PLM_POSTGRES_USER" -d "$PLM_POSTGRES_DB" >/dev/null; then
    printf 'ERROR: local PostgreSQL is not ready at %s:%s/%s.\n' "$PLM_POSTGRES_HOST" "$PLM_POSTGRES_PORT" "$PLM_POSTGRES_DB" >&2
    exit 1
  fi
fi

mvn -pl plm-system -am -DskipTests package
java -jar "$MODULE_DIR/plm-system/target/plm-system-1.0.0-SNAPSHOT.jar" >"$LOG_FILE" 2>&1 &
APP_PID=$!
cleanup() {
  if [[ -n "$APP_PID" ]] && kill -0 "$APP_PID" 2>/dev/null; then
    kill -TERM "$APP_PID"
    wait "$APP_PID" || true
  fi
}
trap cleanup EXIT

ready=false
for _ in {1..120}; do
  if ! kill -0 "$APP_PID" 2>/dev/null; then
    printf 'ERROR: system service exited during PostgreSQL migration verification; see %s.\n' "$LOG_FILE" >&2
    exit 1
  fi
  if curl --fail --silent --show-error --max-time 2 "http://127.0.0.1:$PORT/actuator/health" >/dev/null 2>&1; then
    ready=true
    break
  fi
  sleep 1
done

if [[ "$ready" != true ]]; then
  printf 'ERROR: system service did not become healthy against PostgreSQL; see %s.\n' "$LOG_FILE" >&2
  exit 1
fi

if [[ "$USE_DOCKER" == true ]]; then
  run_sql() {
    docker compose -f "$COMPOSE_FILE" exec -T postgres \
      psql -U "$PLM_POSTGRES_USER" -d "$PLM_POSTGRES_DB" -Atc "$1"
  }
else
  export PGPASSWORD="$PLM_POSTGRES_PASSWORD"
  run_sql() {
    psql -h "$PLM_POSTGRES_HOST" -p "$PLM_POSTGRES_PORT" -U "$PLM_POSTGRES_USER" \
      -d "$PLM_POSTGRES_DB" -Atc "$1"
  }
fi

latest_version="$(run_sql "SELECT version FROM flyway_schema_history WHERE success ORDER BY installed_rank DESC LIMIT 1")"
if [[ "$latest_version" != "173" ]]; then
  printf 'ERROR: expected Flyway schema version 173, found %s.\n' "$latest_version" >&2
  exit 1
fi

table_count="$(run_sql "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'")"
printf 'PostgreSQL migration verification passed: Flyway=%s, public tables=%s, health=UP.\n' "$latest_version" "$table_count"
