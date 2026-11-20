#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

command -v git >/dev/null 2>&1 || { echo "git is required to stamp build metadata." >&2; exit 1; }
command -v mvn >/dev/null 2>&1 || { echo "Maven is required to build the backend." >&2; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "npm is required to build the frontend." >&2; exit 1; }

GIT_COMMIT="$(git rev-parse --short=12 HEAD)"
if [[ -n "$(git status --porcelain)" ]]; then
  GIT_COMMIT="${GIT_COMMIT}-dirty"
fi
BUILD_TIME="${BUILD_TIME:-$(date -u '+%Y-%m-%dT%H:%M:%SZ')}"
export GIT_COMMIT BUILD_TIME

mvn -f plm-backend/pom.xml \
  -Dplm.git.commit="$GIT_COMMIT" \
  -Dproject.build.outputTimestamp="$BUILD_TIME" \
  -pl plm-gateway,plm-system -am package

npm --prefix plm-frontend run build
