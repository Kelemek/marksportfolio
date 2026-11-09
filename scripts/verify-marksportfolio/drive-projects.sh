#!/usr/bin/env bash
# Coding and drawing projects, then the first detail page of each. Matches features/projects.md.
set -euo pipefail

source "$(dirname "$0")/common.sh"
export MARKSPORTFOLIO_VERIFY_FEATURE=projects

ROOT="$(repo_root)"
B="${ROOT}/scripts/verify-marksportfolio/browser.sh"

{
  echo "feature=projects"
  echo "run_id=${MARKSPORTFOLIO_VERIFY_RUN_ID}"
  echo "base_url=${MARKSPORTFOLIO_VERIFY_URL}"
  echo "entry=/"
} > "${EVIDENCE_DIR}/projects.txt"

"${B}" open /
"${B}" expect-heading "My Coding"
"${B}" expect-heading "My Drawing"
"${B}" expect-link --name "Details" --within-heading "My Coding" --href-prefix "/projects/"
"${B}" expect-link --name "Details" --within-heading "My Drawing" --href-prefix "/projects/"
"${B}" screenshot projects-coding.png --selector "section#work article"
"${B}" click --role link --name "Details" --within-heading "My Coding" --record-card
"${B}" expect-url-prefix "/projects/"
"${B}" expect-recorded-heading
"${B}" expect-recorded-links
"${B}" expect-project-preview
"${B}" screenshot projects-detail.png --selector "main article"
"${B}" snapshot projects-detail.aria.txt --selector "main"
"${B}" click --role link --name "Coding" --exact
"${B}" expect-url-contains "#work"
"${B}" expect-heading "My Coding"
"${B}" click --role link --name "Details" --within-heading "My Drawing" --record-card
"${B}" expect-url-prefix "/projects/"
"${B}" expect-recorded-heading
"${B}" expect-project-preview
"${B}" screenshot projects-drawing.png --selector "main article"

echo "status=ok" >> "${EVIDENCE_DIR}/projects.txt"
echo "[drive-projects] OK evidence=${EVIDENCE_DIR}/projects.txt"
