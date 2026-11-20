#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
if [[ -f "$ROOT_DIR/.env.local" ]]; then
  set -a
  # Local-only credentials are intentionally loaded for matching JWT validation in system and gateway.
  source "$ROOT_DIR/.env.local"
  set +a
fi
node "$ROOT_DIR/scripts/validate-test-targets.mjs"
BACKEND_DIR="$ROOT_DIR/plm-backend"
FRONTEND_DIR="$ROOT_DIR/plm-frontend"
LOG_DIR="${TMPDIR:-/tmp}/plm2-dev-test"
mkdir -p "$LOG_DIR"

service_ready() {
  local name="$1"
  local url="$2"
  local expected="$3"
  local body

  if ! body="$(curl -fsS --max-time 2 "$url" 2>/dev/null)"; then
    return 1
  fi

  case "$name" in
    system|gateway)
      grep -Eq "\"status\"[[:space:]]*:[[:space:]]*\"$expected\"" <<<"$body"
      ;;
    frontend)
      [[ "$body" == *'<html lang="zh-CN">'* ]]
      ;;
  esac
}

port_listening() {
  nc -z 127.0.0.1 "$1" >/dev/null 2>&1
}

start_backend_service() {
  local name="$1"
  local module="$2"
  local port="$3"

  if port_listening "$port"; then
    if service_ready "$name" "http://127.0.0.1:$port/actuator/health" UP; then
      printf '%s already ready on :%s\n' "$name" "$port"
      return
    fi
    printf 'ERROR: :%s is occupied but %s is not healthy; refusing to replace an existing process.\n' "$port" "$name" >&2
    return 1
  fi

  (
    cd "$BACKEND_DIR"
    if [[ -x /usr/libexec/java_home ]]; then
      export JAVA_HOME="$(/usr/libexec/java_home -v 17)"
      export PATH="$JAVA_HOME/bin:$PATH"
    fi
    export SPRING_PROFILES_ACTIVE=dev
    mvn -pl "$module" -am package
    java -jar "$BACKEND_DIR/$module/target/$module-1.0.0-SNAPSHOT.jar"
  ) >"$LOG_DIR/$name.log" 2>&1 &
  printf '%s started (PID %s); log: %s\n' "$name" "$!" "$LOG_DIR/$name.log"
}

start_frontend() {
  if port_listening 3000; then
    if service_ready frontend http://127.0.0.1:3000/ ignored; then
      printf 'frontend already ready on :3000\n'
      return
    fi
    printf 'ERROR: :3000 is occupied but the frontend is not ready; refusing to replace an existing process.\n' >&2
    return 1
  fi

  (
    cd "$FRONTEND_DIR"
    npm run dev -- --host 127.0.0.1
  ) >"$LOG_DIR/frontend.log" 2>&1 &
  printf 'frontend started (PID %s); log: %s\n' "$!" "$LOG_DIR/frontend.log"
}

wait_ready() {
  local name="$1"
  local url="$2"
  local expected="$3"
  local seconds=180

  while (( seconds > 0 )); do
    if service_ready "$name" "$url" "$expected"; then
      printf '%s ready: %s\n' "$name" "$url"
      return
    fi
    sleep 1
    ((seconds -= 1))
  done

  printf 'ERROR: %s did not become ready: %s\n' "$name" "$url" >&2
  return 1
}

for command_name in curl nc; do
  if ! command -v "$command_name" >/dev/null 2>&1; then
    printf 'ERROR: required command is missing: %s\n' "$command_name" >&2
    exit 127
  fi
done

export PLM_REDIS_HOST="${PLM_REDIS_HOST:-127.0.0.1}"
export PLM_REDIS_PORT="${PLM_REDIS_PORT:-6381}"
mkdir -p "$ROOT_DIR/.local/dev-h2"
export PLM_DATASOURCE_URL="${PLM_DATASOURCE_URL:-jdbc:h2:file:$ROOT_DIR/.local/dev-h2/plm_system;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_ON_EXIT=FALSE}"
if [[ "$PLM_REDIS_HOST" != 127.0.0.1 && "$PLM_REDIS_HOST" != localhost ]]; then
  printf 'ERROR: local development only permits loopback Redis hosts.\n' >&2
  exit 2
fi
if { ! port_listening 8082 || ! port_listening 8080; } && ! command -v mvn >/dev/null 2>&1; then
  printf 'BLOCKED: Maven is required to start plm-system/plm-gateway, but mvn is not installed.\n' >&2
  exit 127
fi
bash "$ROOT_DIR/scripts/test-redis.sh" start
if [[ -z "${PLM_REDIS_PASSWORD:-}" ]]; then
  PLM_REDIS_PASSWORD="$(<"$ROOT_DIR/.local/redis-test/password")"
  export PLM_REDIS_PASSWORD
fi

for service_spec in \
  'system:8082:http://127.0.0.1:8082/actuator/health' \
  'gateway:8080:http://127.0.0.1:8080/actuator/health' \
  'frontend:3000:http://127.0.0.1:3000/'
do
  IFS=: read -r name port url <<<"$service_spec"
  if port_listening "$port" && ! service_ready "$name" "$url" UP; then
    printf '%s is listening on :%s but not ready; waiting without replacing the existing process.\n' "$name" "$port"
    if ! wait_ready "$name" "$url" UP; then
      printf 'ERROR: :%s is occupied but %s did not become healthy; refusing to replace the process.\n' "$port" "$name" >&2
      exit 1
    fi
  fi
done

start_backend_service system plm-system 8082
start_backend_service gateway plm-gateway 8080
start_frontend

wait_ready system http://127.0.0.1:8082/actuator/health UP
wait_ready gateway http://127.0.0.1:8080/actuator/health UP
wait_ready frontend http://127.0.0.1:3000/ ignored
