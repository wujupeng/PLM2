#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REDIS_DIR="$ROOT_DIR/.local/redis-test"
REDIS_PORT="${PLM_REDIS_PORT:-6381}"
PASSWORD_FILE="$REDIS_DIR/password"
CONFIG_FILE="$REDIS_DIR/redis.conf"
PID_FILE="$REDIS_DIR/redis.pid"
LOG_FILE="$REDIS_DIR/redis.log"
ACTION="${1:-}"

if [[ ! "$REDIS_PORT" =~ ^[0-9]+$ ]] || (( REDIS_PORT < 1024 || REDIS_PORT > 65535 )); then
  printf 'ERROR: PLM_REDIS_PORT must be an unprivileged TCP port.\n' >&2
  exit 2
fi

load_password() {
  if [[ -n "${PLM_REDIS_PASSWORD:-}" ]]; then
    REDIS_PASSWORD="$PLM_REDIS_PASSWORD"
  elif [[ -f "$PASSWORD_FILE" ]]; then
    IFS= read -r REDIS_PASSWORD <"$PASSWORD_FILE"
  elif [[ "$ACTION" == start ]]; then
    if ! command -v openssl >/dev/null 2>&1; then
      printf 'ERROR: openssl is required to create a local Redis password.\n' >&2
      exit 127
    fi
    mkdir -p "$REDIS_DIR"
    umask 077
    openssl rand -hex 32 >"$PASSWORD_FILE"
    REDIS_PASSWORD="$(<"$PASSWORD_FILE")"
  else
    printf 'ERROR: no local test Redis password is available; start Redis first or set PLM_REDIS_PASSWORD.\n' >&2
    exit 2
  fi

  if [[ ! "$REDIS_PASSWORD" =~ ^[A-Za-z0-9_-]{32,128}$ ]]; then
    printf 'ERROR: PLM_REDIS_PASSWORD must contain 32-128 letters, digits, underscores, or hyphens.\n' >&2
    exit 2
  fi
}

port_listening() {
  nc -z 127.0.0.1 "$REDIS_PORT" >/dev/null 2>&1
}

redis_ready() {
  REDISCLI_AUTH="$REDIS_PASSWORD" redis-cli -h 127.0.0.1 -p "$REDIS_PORT" ping 2>/dev/null |
    grep -qx PONG
}

test_redis_managed() {
  local server_info server_pid configured_file pid
  redis_ready || return 1
  server_info="$(REDISCLI_AUTH="$REDIS_PASSWORD" redis-cli --raw -h 127.0.0.1 -p "$REDIS_PORT" info server 2>/dev/null)" || return 1
  server_pid="$(grep '^process_id:' <<<"$server_info" | cut -d: -f2 | tr -d '\r')"
  configured_file="$(grep '^config_file:' <<<"$server_info" | cut -d: -f2- | tr -d '\r')"
  [[ -f "$PID_FILE" ]] || return 1
  pid="$(<"$PID_FILE")"
  [[ "$server_pid" == "$pid" && "$configured_file" == "$CONFIG_FILE" ]] &&
    [[ "$pid" =~ ^[0-9]+$ ]] &&
    kill -0 "$pid" 2>/dev/null
}

require_tools() {
  for command_name in "$@"; do
    if ! command -v "$command_name" >/dev/null 2>&1; then
      printf 'ERROR: required command is missing: %s\n' "$command_name" >&2
      exit 127
    fi
  done
}

case "$ACTION" in
  start)
    require_tools nc redis-cli redis-server
    load_password
    if port_listening; then
      if test_redis_managed; then
        printf 'Persistent test Redis is already ready on 127.0.0.1:%s.\n' "$REDIS_PORT"
        exit 0
      fi
      printf 'ERROR: port %s is occupied by a Redis service not managed by this test script; refusing to use or replace it.\n' "$REDIS_PORT" >&2
      exit 1
    fi
    if [[ -f "$PID_FILE" ]]; then
      pid="$(<"$PID_FILE")"
      if [[ "$pid" =~ ^[0-9]+$ ]] && kill -0 "$pid" 2>/dev/null; then
        printf 'ERROR: test Redis PID %s is still running but not listening; refusing to replace it.\n' "$pid" >&2
        exit 1
      fi
      rm -- "$PID_FILE"
    fi

    mkdir -p "$REDIS_DIR"
    chmod 700 "$REDIS_DIR"
    umask 077
    printf '%s\n' "$REDIS_PASSWORD" >"$PASSWORD_FILE"
    chmod 600 "$PASSWORD_FILE"
    printf '%s\n' \
      "bind 127.0.0.1" \
      "protected-mode yes" \
      "port $REDIS_PORT" \
      "dir $REDIS_DIR" \
      "dbfilename dump.rdb" \
      "save 60 1000" \
      "save 300 10" \
      "appendonly yes" \
      "appendfsync everysec" \
      "requirepass $REDIS_PASSWORD" \
      "daemonize yes" \
      "pidfile $PID_FILE" \
      "logfile $LOG_FILE" >"$CONFIG_FILE"
    chmod 600 "$CONFIG_FILE"
    redis-server "$CONFIG_FILE"

    for _ in {1..20}; do
      if redis_ready; then
        printf 'Persistent authenticated test Redis is ready on 127.0.0.1:%s; data: %s\n' "$REDIS_PORT" "$REDIS_DIR"
        exit 0
      fi
      sleep 1
    done
    printf 'ERROR: test Redis did not become ready; inspect %s.\n' "$LOG_FILE" >&2
    exit 1
    ;;
  stop)
    require_tools nc redis-cli
    load_password
    if ! port_listening; then
      printf 'Persistent test Redis is not running on 127.0.0.1:%s.\n' "$REDIS_PORT"
      exit 0
    fi
    if ! test_redis_managed; then
      printf 'ERROR: port %s is occupied by a Redis service not managed by this test script; refusing to stop it.\n' "$REDIS_PORT" >&2
      exit 1
    fi
    pid="$(<"$PID_FILE")"
    REDISCLI_AUTH="$REDIS_PASSWORD" redis-cli -h 127.0.0.1 -p "$REDIS_PORT" shutdown
    for _ in {1..10}; do
      if ! port_listening; then
        printf 'Persistent test Redis stopped; data retained in %s.\n' "$REDIS_DIR"
        exit 0
      fi
      sleep 1
    done
    printf 'ERROR: test Redis did not stop; inspect %s.\n' "$LOG_FILE" >&2
    exit 1
    ;;
  status)
    require_tools nc redis-cli
    load_password
    if test_redis_managed; then
      printf 'Persistent test Redis is ready on 127.0.0.1:%s.\n' "$REDIS_PORT"
    else
      printf 'Persistent test Redis is not managed and ready on 127.0.0.1:%s.\n' "$REDIS_PORT" >&2
      exit 1
    fi
    ;;
  *)
    printf 'Usage: %s {start|stop|status}\n' "$0" >&2
    exit 2
    ;;
esac
