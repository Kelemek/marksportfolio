#!/usr/bin/env bash
# Unauthenticated login screen and admin redirect. Does not submit the form.
# Matches features/login-gate.md.
set -euo pipefail

source "$(dirname "$0")/common.sh"
export MARKSPORTFOLIO_VERIFY_FEATURE=login-gate

ROOT="$(repo_root)"
B="${ROOT}/scripts/verify-marksportfolio/browser.sh"

{
  echo "feature=login-gate"
  echo "run_id=${MARKSPORTFOLIO_VERIFY_RUN_ID}"
  echo "base_url=${MARKSPORTFOLIO_VERIFY_URL}"
  echo "entry=/login"
} > "${EVIDENCE_DIR}/login-gate.txt"

"${B}" open /login
"${B}" expect-heading "Admin Login"
"${B}" expect-text "Enter your email to receive a verification code"
"${B}" expect-text "We'll send you a secure 6-digit verification code"
"${B}" expect-role --role textbox --name "Email Address" --exact
"${B}" expect-disabled --role button --name "Send Verification Code"
"${B}" expect-link --name "Back to Portfolio" --href "/"
"${B}" expect-absent "Redeploy Resume"
"${B}" expect-absent "Sign Out"
"${B}" screenshot login.png
"${B}" click --role link --name "Back to Portfolio"
"${B}" expect-heading "Mark Larson"
"${B}" open /admin
"${B}" expect-url-prefix "/login"
"${B}" expect-heading "Admin Login"
"${B}" expect-role --role textbox --name "Email Address" --exact
"${B}" expect-disabled --role button --name "Send Verification Code"
"${B}" expect-absent "Redeploy Resume"
"${B}" expect-absent "Sign Out"
"${B}" expect-absent "We've sent a verification code to:"
"${B}" expect-absent "Try a different email"
"${B}" screenshot admin-gate.png

echo "status=ok" >> "${EVIDENCE_DIR}/login-gate.txt"
echo "[drive-login-gate] OK evidence=${EVIDENCE_DIR}/login-gate.txt"
