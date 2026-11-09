#!/usr/bin/env bash
# Home hero and in-page navigation. Matches features/home.md.
set -euo pipefail

source "$(dirname "$0")/common.sh"
export MARKSPORTFOLIO_VERIFY_FEATURE=home

ROOT="$(repo_root)"
B="${ROOT}/scripts/verify-marksportfolio/browser.sh"

{
  echo "feature=home"
  echo "run_id=${MARKSPORTFOLIO_VERIFY_RUN_ID}"
  echo "base_url=${MARKSPORTFOLIO_VERIFY_URL}"
  echo "entry=/"
} > "${EVIDENCE_DIR}/home.txt"

"${B}" open /
"${B}" expect-heading "Mark Larson"
"${B}" expect-text "soli Deo gloria"
"${B}" expect-text "Cambridge, Minnesota"
"${B}" expect-link --name "Coding" --exact --href "#work"
"${B}" expect-link --name "Drawing" --exact --href "#drawing"
"${B}" expect-link --name "About" --exact --href "#about"
"${B}" expect-link --name "Contact" --exact --href "#contact"
"${B}" expect-link --name "Resumé" --exact --href "https://resume.romans8.net"
"${B}" expect-link --name "Get in touch" --exact --href "#contact"
"${B}" click --role link --name "Coding" --exact
"${B}" expect-url-contains "#work"
"${B}" expect-heading "My Coding"
"${B}" screenshot home-hero.png --selector 'header[role="banner"]'
"${B}" snapshot home.aria.txt --selector 'header[role="banner"]'

echo "status=ok" >> "${EVIDENCE_DIR}/home.txt"
echo "[drive-home] OK evidence=${EVIDENCE_DIR}/home.txt"
