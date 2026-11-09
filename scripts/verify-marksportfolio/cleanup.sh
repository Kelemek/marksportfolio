#!/usr/bin/env bash
# Stop the server this run started. Evidence files are left in place.
set -euo pipefail

source "$(dirname "$0")/common.sh"

ROOT="$(repo_root)"
PROC="${ROOT}/scripts/verify-marksportfolio/proc.py"

if [[ -s "${PID_FILE}" ]]; then
  PID="$(tr -d '[:space:]' < "${PID_FILE}")"
  if kill -0 "${PID}" 2>/dev/null; then
    python3 "${PROC}" stop "${PID}"
    echo "[cleanup] Stopped verification server pid ${PID}"
  else
    echo "[cleanup] pid ${PID} already stopped"
  fi
  rm -f "${PID_FILE}"
else
  echo "[cleanup] No pid file — nothing to stop"
fi

# Scratch only. The evidence directory is not removed.
rm -f "${LOG_FILE}" "${PORT_FILE}" "${BUILD_FILE}" "${BROWSER_STATE}" \
  "${VERIFY_DIR}/build.log" "${VERIFY_DIR}/doctor-home.html" "${VERIFY_DIR}/doctor-login.html"

if [[ -d "${EVIDENCE_DIR}" ]]; then
  echo "[cleanup] Evidence preserved at ${EVIDENCE_DIR}"
else
  echo "[cleanup] No evidence directory at ${EVIDENCE_DIR}"
fi
