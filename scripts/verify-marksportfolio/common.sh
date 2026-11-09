#!/usr/bin/env bash
# Shared paths for the portfolio verification harness.
# Source this file. It does not start or stop the server.
set -euo pipefail

POINTER_FILE="/tmp/marksportfolio-verify-current"
PLAYWRIGHT_DIR="/tmp/marksportfolio-playwright-1.65.0"
PLAYWRIGHT_VERSION="1.65.0"

resolve_run_id() {
  if [[ -n "${MARKSPORTFOLIO_VERIFY_RUN_ID:-}" ]]; then
    export MARKSPORTFOLIO_VERIFY_RUN_ID
    return
  fi
  if [[ -s "${POINTER_FILE}" ]]; then
    MARKSPORTFOLIO_VERIFY_RUN_ID="$(tr -d '[:space:]' < "${POINTER_FILE}")"
    if [[ -n "${MARKSPORTFOLIO_VERIFY_RUN_ID}" ]]; then
      export MARKSPORTFOLIO_VERIFY_RUN_ID
      return
    fi
  fi
  if [[ "${MARKSPORTFOLIO_VERIFY_ALLOW_NEW_RUN:-}" == "1" ]]; then
    MARKSPORTFOLIO_VERIFY_RUN_ID="$(date +%s)"
    export MARKSPORTFOLIO_VERIFY_RUN_ID
    return
  fi
  echo "[verify-marksportfolio] No run id. Run scripts/verify-marksportfolio/launch.sh first." >&2
  exit 1
}

resolve_run_id

VERIFY_DIR="/tmp/marksportfolio-verify-${MARKSPORTFOLIO_VERIFY_RUN_ID}"
export MARKSPORTFOLIO_VERIFY_DIR="${VERIFY_DIR}"
PID_FILE="${VERIFY_DIR}/next.pid"
LOG_FILE="${VERIFY_DIR}/next.log"
PORT_FILE="${VERIFY_DIR}/port"
BUILD_FILE="${VERIFY_DIR}/build.json"
BROWSER_STATE="${VERIFY_DIR}/browser-state.json"
EVIDENCE_DIR="${VERIFY_DIR}/evidence"
export MARKSPORTFOLIO_VERIFY_EVIDENCE="${EVIDENCE_DIR}"
export MARKSPORTFOLIO_VERIFY_BROWSER_STATE="${BROWSER_STATE}"

mkdir -p "${VERIFY_DIR}" "${EVIDENCE_DIR}"

if [[ -s "${PORT_FILE}" ]]; then
  MARKSPORTFOLIO_VERIFY_PORT="$(tr -d '[:space:]' < "${PORT_FILE}")"
else
  MARKSPORTFOLIO_VERIFY_PORT="${MARKSPORTFOLIO_VERIFY_PORT:-4180}"
fi
export MARKSPORTFOLIO_VERIFY_PORT

if [[ ! "${MARKSPORTFOLIO_VERIFY_PORT}" =~ ^[0-9]+$ ]]; then
  echo "[verify-marksportfolio] Port must be numeric, got '${MARKSPORTFOLIO_VERIFY_PORT}'." >&2
  exit 1
fi

# Always the local server this run started. Never a deployed host.
export MARKSPORTFOLIO_VERIFY_URL="http://127.0.0.1:${MARKSPORTFOLIO_VERIFY_PORT}"

if [[ "${MARKSPORTFOLIO_VERIFY_WRITE_POINTER:-}" == "1" ]]; then
  printf '%s\n' "${MARKSPORTFOLIO_VERIFY_RUN_ID}" > "${POINTER_FILE}"
fi

repo_root() {
  cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd
}

load_public_supabase_env() {
  local root file line key value
  root="$(repo_root)"
  file="${MARKSPORTFOLIO_VERIFY_ENV_FILE:-${root}/portfolio-next/.env.local}"
  if [[ -f "${file}" ]]; then
    while IFS= read -r line || [[ -n "${line}" ]]; do
      line="${line#"${line%%[![:space:]]*}"}"
      line="${line%$'\r'}"
      [[ -z "${line}" || "${line}" == \#* ]] && continue
      [[ "${line}" == export\ * ]] && line="${line#export }"
      key="${line%%=*}"
      value="${line#*=}"
      if [[ "${value}" == \"*\" && "${value}" == *\" ]]; then
        value="${value:1:${#value}-2}"
      elif [[ "${value}" == \'*\' && "${value}" == *\' ]]; then
        value="${value:1:${#value}-2}"
      fi
      case "${key}" in
        NEXT_PUBLIC_SUPABASE_URL)
          if [[ -z "${NEXT_PUBLIC_SUPABASE_URL:-}" ]]; then
            NEXT_PUBLIC_SUPABASE_URL="${value}"
          fi
          ;;
        NEXT_PUBLIC_SUPABASE_ANON_KEY)
          if [[ -z "${NEXT_PUBLIC_SUPABASE_ANON_KEY:-}" ]]; then
            NEXT_PUBLIC_SUPABASE_ANON_KEY="${value}"
          fi
          ;;
      esac
    done < "${file}"
  fi

  if [[ -z "${NEXT_PUBLIC_SUPABASE_URL:-}" || -z "${NEXT_PUBLIC_SUPABASE_ANON_KEY:-}" ]]; then
    echo "[verify-marksportfolio] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY." >&2
    echo "[verify-marksportfolio] Export both, or put only those public values in portfolio-next/.env.local (see portfolio-next/.env.local.example)." >&2
    echo "[verify-marksportfolio] You can also point MARKSPORTFOLIO_VERIFY_ENV_FILE at a file that sets them. Values are never printed." >&2
    exit 1
  fi
  export NEXT_PUBLIC_SUPABASE_URL NEXT_PUBLIC_SUPABASE_ANON_KEY
}

# Prints the key class (anon or publishable) or exits. Never prints the key.
supabase_key_class() {
  python3 - <<'PY'
import base64, json, os, sys
key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY", "")
if key.startswith("sb_publishable_"):
    print("publishable")
    sys.exit(0)
parts = key.split(".")
if len(parts) != 3:
    print("unrecognized", file=sys.stderr)
    sys.exit(1)
pad = parts[1] + "=" * ((4 - len(parts[1]) % 4) % 4)
try:
    payload = json.loads(base64.urlsafe_b64decode(pad))
except Exception:
    print("unrecognized", file=sys.stderr)
    sys.exit(1)
role = str(payload.get("role", ""))
if role == "anon":
    print("anon")
    sys.exit(0)
print(role or "unrecognized", file=sys.stderr)
sys.exit(1)
PY
}

source_stamp() {
  local root payload
  root="$(repo_root)"
  payload="$(
    git -C "${root}" rev-parse HEAD
    git -C "${root}" status --porcelain -- portfolio-next
  )"
  printf '%s' "${payload}" | python3 -c 'import hashlib,sys; print(hashlib.sha256(sys.stdin.buffer.read()).hexdigest())'
}

git_sha() {
  git -C "$(repo_root)" rev-parse HEAD
}
