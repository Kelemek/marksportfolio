#!/usr/bin/env bash
# Build the portfolio and start it on 127.0.0.1 for a verification run.
set -euo pipefail

if [[ -z "${MARKSPORTFOLIO_VERIFY_RUN_ID:-}" && ! -s /tmp/marksportfolio-verify-current ]]; then
  export MARKSPORTFOLIO_VERIFY_ALLOW_NEW_RUN=1
fi
export MARKSPORTFOLIO_VERIFY_WRITE_POINTER=1

source "$(dirname "$0")/common.sh"

ROOT="$(repo_root)"
APP="${ROOT}/portfolio-next"
PROC="${ROOT}/scripts/verify-marksportfolio/proc.py"
DOCTOR="${ROOT}/scripts/verify-marksportfolio/doctor.sh"

load_public_supabase_env
KEY_CLASS="$(supabase_key_class)" || {
  echo "[verify-marksportfolio] NEXT_PUBLIC_SUPABASE_ANON_KEY must be an anon JWT or an sb_publishable key. Refusing to start." >&2
  exit 1
}

if [[ -s "${PID_FILE}" ]]; then
  EXISTING_PID="$(tr -d '[:space:]' < "${PID_FILE}")"
  if kill -0 "${EXISTING_PID}" 2>/dev/null; then
    if "${DOCTOR}"; then
      echo "[verify-marksportfolio] Ready at ${MARKSPORTFOLIO_VERIFY_URL}"
      exit 0
    fi
    echo "[verify-marksportfolio] pid ${EXISTING_PID} is still running but failed doctor. Run scripts/verify-marksportfolio/cleanup.sh before launching again." >&2
    exit 1
  fi
fi

LISTENER_REPORT="$(python3 "${PROC}" listeners "${MARKSPORTFOLIO_VERIFY_PORT}" 0 || true)"
if [[ "${LISTENER_REPORT}" != "none" && -n "${LISTENER_REPORT}" ]]; then
  echo "[verify-marksportfolio] Port ${MARKSPORTFOLIO_VERIFY_PORT} is already in use. Set MARKSPORTFOLIO_VERIFY_PORT to a free port and MARKSPORTFOLIO_VERIFY_RUN_ID to a new id." >&2
  printf '%s\n' "${LISTENER_REPORT}" >&2
  exit 1
fi

if [[ ! -e "${APP}/node_modules/next/dist/bin/next" ]]; then
  echo "[verify-marksportfolio] Installing dependencies with npm ci --prefix portfolio-next"
  npm ci --prefix "${APP}"
fi

printf '%s\n' "${MARKSPORTFOLIO_VERIFY_PORT}" > "${PORT_FILE}"

echo "[verify-marksportfolio] Building portfolio-next (production). Log: ${VERIFY_DIR}/build.log"
# Blank analytics, admin identity, deploy hook, and service-role so a developer
# .env.local cannot turn those on for this server. Next.js lets the process
# environment override .env.local. The public URL and anon key stay exported
# in this process and are not placed on the command line.
blank_runtime_secrets() {
  export NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN=
  export NEXT_PUBLIC_POSTHOG_HOST=
  export VERCEL_DEPLOY_HOOK_RESUME=
  export ADMIN_EMAIL=
  export SUPABASE_SERVICE_ROLE_KEY=
}
(
  blank_runtime_secrets
  cd "${APP}"
  npm run build
) 2>&1 | tee "${VERIFY_DIR}/build.log"

if [[ ! -s "${APP}/.next/BUILD_ID" ]]; then
  echo "[verify-marksportfolio] Build finished without portfolio-next/.next/BUILD_ID." >&2
  exit 1
fi

SUPABASE_HOST="$(python3 - <<'PY'
import os
from urllib.parse import urlparse
print(urlparse(os.environ["NEXT_PUBLIC_SUPABASE_URL"]).hostname or "")
PY
)"

# Write the build stamp without putting secrets in the file.
export MARKSPORTFOLIO_VERIFY_STAMP="$(source_stamp)"
export MARKSPORTFOLIO_VERIFY_SHA="$(git_sha)"
export MARKSPORTFOLIO_VERIFY_BUILD_ID="$(tr -d '[:space:]' < "${APP}/.next/BUILD_ID")"
export MARKSPORTFOLIO_VERIFY_NODE="$(node -v)"
export MARKSPORTFOLIO_VERIFY_KEY_CLASS="${KEY_CLASS}"
export MARKSPORTFOLIO_VERIFY_SUPABASE_HOST="${SUPABASE_HOST}"
export MARKSPORTFOLIO_VERIFY_BUILD_FILE="${BUILD_FILE}"
python3 - <<'PY'
import json
import os
payload = {
    "gitSha": os.environ["MARKSPORTFOLIO_VERIFY_SHA"],
    "sourceStamp": os.environ["MARKSPORTFOLIO_VERIFY_STAMP"],
    "buildId": os.environ["MARKSPORTFOLIO_VERIFY_BUILD_ID"],
    "node": os.environ["MARKSPORTFOLIO_VERIFY_NODE"],
    "port": int(os.environ["MARKSPORTFOLIO_VERIFY_PORT"]),
    "keyClass": os.environ["MARKSPORTFOLIO_VERIFY_KEY_CLASS"],
    "supabaseHost": os.environ["MARKSPORTFOLIO_VERIFY_SUPABASE_HOST"],
}
with open(os.environ["MARKSPORTFOLIO_VERIFY_BUILD_FILE"], "w", encoding="utf-8") as handle:
    json.dump(payload, handle, indent=2)
    handle.write("\n")
PY

rm -f "${PID_FILE}"
echo "[verify-marksportfolio] Starting next start on ${MARKSPORTFOLIO_VERIFY_URL}"
blank_runtime_secrets
python3 "${PROC}" start "${PID_FILE}" "${LOG_FILE}" "${APP}" -- \
  node "${APP}/node_modules/next/dist/bin/next" start \
  --hostname 127.0.0.1 \
  --port "${MARKSPORTFOLIO_VERIFY_PORT}" \
  >/dev/null

sleep 0.3
for _ in $(seq 1 45); do
  if "${DOCTOR}"; then
    echo "[verify-marksportfolio] Ready at ${MARKSPORTFOLIO_VERIFY_URL}"
    exit 0
  fi
  if [[ -s "${PID_FILE}" ]]; then
    STARTED_PID="$(tr -d '[:space:]' < "${PID_FILE}")"
    if ! kill -0 "${STARTED_PID}" 2>/dev/null; then
      echo "[verify-marksportfolio] next start exited. Last log lines:" >&2
      tail -n 40 "${LOG_FILE}" >&2 || true
      exit 1
    fi
  fi
  sleep 1
done

echo "[verify-marksportfolio] Timed out waiting for doctor. Last log lines:" >&2
tail -n 40 "${LOG_FILE}" >&2 || true
if [[ -s "${PID_FILE}" ]]; then
  python3 "${PROC}" stop "$(tr -d '[:space:]' < "${PID_FILE}")" || true
  rm -f "${PID_FILE}"
fi
exit 1
