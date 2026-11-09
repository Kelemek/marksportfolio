#!/usr/bin/env bash
# About section and resume link. Matches features/about.md.
set -euo pipefail

source "$(dirname "$0")/common.sh"
export MARKSPORTFOLIO_VERIFY_FEATURE=about

ROOT="$(repo_root)"
B="${ROOT}/scripts/verify-marksportfolio/browser.sh"

{
  echo "feature=about"
  echo "run_id=${MARKSPORTFOLIO_VERIFY_RUN_ID}"
  echo "base_url=${MARKSPORTFOLIO_VERIFY_URL}"
  echo "entry=/#about"
} > "${EVIDENCE_DIR}/about.txt"

"${B}" open /#about
"${B}" expect-heading "About Me"
"${B}" expect-text "systems engineer"
"${B}" expect-text "Cambridge, Minnesota"
"${B}" expect-text "ACBC certified Biblical counselor"
"${B}" expect-role --role img --name "My own self portrait drawn on iPad by me." --exact
"${B}" expect-link --name "My Resumé" --exact --href "https://resume.romans8.net"
"${B}" screenshot about.png --selector "section#about"
"${B}" snapshot about.aria.txt --selector "section#about"

echo "status=ok" >> "${EVIDENCE_DIR}/about.txt"
echo "[drive-about] OK evidence=${EVIDENCE_DIR}/about.txt"
