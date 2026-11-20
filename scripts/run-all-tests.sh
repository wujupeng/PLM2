#!/usr/bin/env bash
set -uo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUN_ID="PLM2-$(date +%Y%m%d-%H%M%S)-$$"
RUN_DIR="$ROOT_DIR/reports/test-runs/$RUN_ID"
mkdir -p "$RUN_DIR"

if [[ -x /usr/libexec/java_home ]]; then
  export JAVA_HOME="$(/usr/libexec/java_home -v 17)"
  export PATH="$JAVA_HOME/bin:$PATH"
fi

export PLM_TEST_RUN_ID="$RUN_ID"
overall_status=0

run_and_record() {
  local label="$1"
  shift
  printf '\n=== %s ===\n' "$label"
  "$@" 2>&1 | tee "$RUN_DIR/$label.log"
  local result=${PIPESTATUS[0]}
  if (( result != 0 )); then
    printf '%s: exit %s\n' "$label" "$result" | tee -a "$RUN_DIR/summary.txt"
    overall_status=1
  else
    printf '%s: PASS\n' "$label" | tee -a "$RUN_DIR/summary.txt"
  fi
}

run_and_record start-dev "$ROOT_DIR/scripts/start-dev.sh"
run_and_record smoke-test npm --prefix "$ROOT_DIR/plm-frontend" run test:smoke
run_and_record frontend-lint npm --prefix "$ROOT_DIR/plm-frontend" run lint
run_and_record frontend-build npm --prefix "$ROOT_DIR/plm-frontend" run build
run_and_record ui-e2e npm --prefix "$ROOT_DIR/plm-frontend" run test:e2e

if command -v mvn >/dev/null 2>&1; then
  run_and_record backend-tests bash -c "cd '$ROOT_DIR/plm-backend' && mvn -o test"
else
  printf 'backend-tests: BLOCKED (Maven is not installed; no Maven wrapper is present)\n' | tee -a "$RUN_DIR/summary.txt"
  overall_status=1
fi

printf '\nRun ID: %s\nResults: %s\n' "$RUN_ID" "$RUN_DIR"
exit "$overall_status"
