#!/usr/bin/env bash
# One browser action against the local verification server.
# Usage: browser.sh <command> [args...]
set -euo pipefail

source "$(dirname "$0")/common.sh"

ROOT="$(repo_root)"
"${ROOT}/scripts/verify-marksportfolio/doctor.sh" >/dev/null

if [[ ! -d "${PLAYWRIGHT_DIR}/node_modules/playwright" ]]; then
  echo "[verify-marksportfolio] Installing playwright@${PLAYWRIGHT_VERSION} into ${PLAYWRIGHT_DIR}"
  mkdir -p "${PLAYWRIGHT_DIR}"
  PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm install \
    --prefix "${PLAYWRIGHT_DIR}" \
    --no-save \
    --silent \
    "playwright@${PLAYWRIGHT_VERSION}"
fi

export MARKSPORTFOLIO_PLAYWRIGHT_PACKAGE="${PLAYWRIGHT_DIR}/package.json"
BROWSER_JS="${ROOT}/scripts/verify-marksportfolio/browser.mjs"

set +e
node "${BROWSER_JS}" "$@"
CODE=$?
set -e

if [[ "${CODE}" -eq 80 ]]; then
  echo "[verify-marksportfolio] System Chrome was not usable. Installing Playwright Chromium."
  "${PLAYWRIGHT_DIR}/node_modules/.bin/playwright" install chromium
  node "${BROWSER_JS}" "$@"
  exit $?
fi

exit "${CODE}"
