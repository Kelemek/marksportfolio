#!/usr/bin/env bash
# Read-only health check for the verification server this run started.
set -euo pipefail

source "$(dirname "$0")/common.sh"

ROOT="$(repo_root)"
APP="${ROOT}/portfolio-next"
PROC="${ROOT}/scripts/verify-marksportfolio/proc.py"

fail() {
  echo "[doctor] $*" >&2
  exit 1
}

if [[ ! -s "${PID_FILE}" ]]; then
  fail "Missing pid file ${PID_FILE}. Run scripts/verify-marksportfolio/launch.sh first."
fi
PID="$(tr -d '[:space:]' < "${PID_FILE}")"
if ! kill -0 "${PID}" 2>/dev/null; then
  fail "Process ${PID} is not running."
fi

if [[ ! -s "${BUILD_FILE}" ]]; then
  fail "Missing build stamp ${BUILD_FILE}."
fi

export MARKSPORTFOLIO_VERIFY_BUILD_FILE="${BUILD_FILE}"
export MARKSPORTFOLIO_VERIFY_EXPECT_STAMP="$(source_stamp)"
export MARKSPORTFOLIO_VERIFY_EXPECT_SHA="$(git_sha)"
export MARKSPORTFOLIO_VERIFY_EXPECT_NODE="$(node -v)"
export MARKSPORTFOLIO_VERIFY_EXPECT_BUILD_ID=""
if [[ -s "${APP}/.next/BUILD_ID" ]]; then
  export MARKSPORTFOLIO_VERIFY_EXPECT_BUILD_ID="$(tr -d '[:space:]' < "${APP}/.next/BUILD_ID")"
fi

python3 - <<'PY'
import json, os, sys
path = os.environ["MARKSPORTFOLIO_VERIFY_BUILD_FILE"]
with open(path, encoding="utf-8") as handle:
    stamp = json.load(handle)
expected = {
    "gitSha": os.environ["MARKSPORTFOLIO_VERIFY_EXPECT_SHA"],
    "sourceStamp": os.environ["MARKSPORTFOLIO_VERIFY_EXPECT_STAMP"],
    "node": os.environ["MARKSPORTFOLIO_VERIFY_EXPECT_NODE"],
    "buildId": os.environ["MARKSPORTFOLIO_VERIFY_EXPECT_BUILD_ID"],
    "port": int(os.environ["MARKSPORTFOLIO_VERIFY_PORT"]),
}
for key, value in expected.items():
    if stamp.get(key) != value:
        print(f"[doctor] Build stamp {key} is {stamp.get(key)!r}, expected {value!r}.", file=sys.stderr)
        sys.exit(1)
key_class = stamp.get("keyClass")
if key_class not in ("anon", "publishable"):
    print(f"[doctor] Build stamp keyClass is {key_class!r}.", file=sys.stderr)
    sys.exit(1)
PY

LISTENER_REPORT="$(python3 "${PROC}" listeners "${MARKSPORTFOLIO_VERIFY_PORT}" "${PID}")"
if [[ "${LISTENER_REPORT}" != *owned* ]]; then
  fail "Port ${MARKSPORTFOLIO_VERIFY_PORT} is not owned by pid ${PID}. ${LISTENER_REPORT}"
fi
if [[ "${LISTENER_REPORT}" == *foreign* ]]; then
  fail "Port ${MARKSPORTFOLIO_VERIFY_PORT} has a listener this run did not start. ${LISTENER_REPORT}"
fi

HOME_FILE="${VERIFY_DIR}/doctor-home.html"
LOGIN_FILE="${VERIFY_DIR}/doctor-login.html"
HOME_CODE="$(curl -sS -o "${HOME_FILE}" -w '%{http_code}' --max-time 15 "${MARKSPORTFOLIO_VERIFY_URL}/" || echo 000)"
if [[ "${HOME_CODE}" != "200" ]]; then
  fail "GET / returned ${HOME_CODE}."
fi

require_body() {
  local file="$1"
  local needle="$2"
  if ! grep -F -q -- "${needle}" "${file}"; then
    fail "Response missing '${needle}'."
  fi
}

require_body "${HOME_FILE}" "Mark Larson"
require_body "${HOME_FILE}" "My Coding"
require_body "${HOME_FILE}" "My Drawing"
require_body "${HOME_FILE}" "About Me"
require_body "${HOME_FILE}" "Get in Touch"
require_body "${HOME_FILE}" 'id="work"'
require_body "${HOME_FILE}" 'id="about"'
require_body "${HOME_FILE}" 'id="contact"'
require_body "${HOME_FILE}" 'id="drawing"'

PROJECT_LINKS="$(
  { grep -oE 'href="/projects/[^"]+"' "${HOME_FILE}" || true; } | sort -u | wc -l | tr -d ' '
)"
if [[ "${PROJECT_LINKS}" -lt 1 ]]; then
  fail "Homepage rendered no /projects/ links. The public Supabase read returned no visible projects. This harness does not seed data."
fi

LOGIN_CODE="$(curl -sS -o "${LOGIN_FILE}" -w '%{http_code}' --max-time 15 "${MARKSPORTFOLIO_VERIFY_URL}/login" || echo 000)"
if [[ "${LOGIN_CODE}" != "200" ]]; then
  fail "GET /login returned ${LOGIN_CODE}."
fi
require_body "${LOGIN_FILE}" "Admin Login"
require_body "${LOGIN_FILE}" "Email Address"
require_body "${LOGIN_FILE}" "Send Verification Code"
if grep -F -q -- "Redeploy Resume" "${LOGIN_FILE}"; then
  fail "GET /login rendered admin chrome."
fi

ADMIN_HEADERS="$(curl -sS -D - -o /dev/null --max-redirs 0 --max-time 15 "${MARKSPORTFOLIO_VERIFY_URL}/admin" || true)"
ADMIN_STATUS="$(printf '%s\n' "${ADMIN_HEADERS}" | awk 'toupper($1) ~ /^HTTP/ { code=$2 } END { print code }')"
ADMIN_LOCATION="$(printf '%s\n' "${ADMIN_HEADERS}" | awk 'tolower($1)=="location:" { print $2 }' | tr -d '\r' | tail -n 1)"
case "${ADMIN_STATUS}" in
  301|302|303|307|308) ;;
  *) fail "GET /admin returned ${ADMIN_STATUS}, expected a redirect to /login." ;;
esac
case "${ADMIN_LOCATION}" in
  /login|/login/|"${MARKSPORTFOLIO_VERIFY_URL}/login"|"${MARKSPORTFOLIO_VERIFY_URL}/login/") ;;
  *) fail "GET /admin redirected to '${ADMIN_LOCATION}', expected /login." ;;
esac

STAMP_LINE="$(python3 - <<'PY'
import json, os
with open(os.environ["MARKSPORTFOLIO_VERIFY_BUILD_FILE"], encoding="utf-8") as handle:
    stamp = json.load(handle)
print(f"keyClass={stamp['keyClass']} supabaseHost={stamp['supabaseHost']} buildId={stamp['buildId']} git={stamp['gitSha']}")
PY
)"

echo "[doctor] OK pid=${PID} url=${MARKSPORTFOLIO_VERIFY_URL} run_id=${MARKSPORTFOLIO_VERIFY_RUN_ID} project_links=${PROJECT_LINKS} admin_gate=${ADMIN_STATUS} ${STAMP_LINE}"
