#!/usr/bin/env bash
# Contact email and footer profiles. Matches features/contact.md.
set -euo pipefail

source "$(dirname "$0")/common.sh"
export MARKSPORTFOLIO_VERIFY_FEATURE=contact

ROOT="$(repo_root)"
B="${ROOT}/scripts/verify-marksportfolio/browser.sh"

{
  echo "feature=contact"
  echo "run_id=${MARKSPORTFOLIO_VERIFY_RUN_ID}"
  echo "base_url=${MARKSPORTFOLIO_VERIFY_URL}"
  echo "entry=/#contact"
} > "${EVIDENCE_DIR}/contact.txt"

"${B}" open /#contact
"${B}" expect-heading "Get in Touch"
"${B}" expect-text "The quickest way to reach me is via email."
"${B}" expect-link --name "markdlarson@me.com" --exact --href "mailto:markdlarson@me.com"
"${B}" expect-link --name "GitHub" --exact --href "https://github.com/kelemek/"
"${B}" expect-link --name "LinkedIn" --exact --href "https://www.linkedin.com/in/mark-larson-a33b3588"
"${B}" screenshot contact.png --selector "section#contact"
"${B}" screenshot footer.png --selector 'footer[role="contentinfo"]'
"${B}" snapshot contact.aria.txt --selector "section#contact"

echo "status=ok" >> "${EVIDENCE_DIR}/contact.txt"
echo "[drive-contact] OK evidence=${EVIDENCE_DIR}/contact.txt"
