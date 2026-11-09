# Login gate

A signed-out visitor can open the admin login form, see that a code has not been requested, and return to the portfolio. Opening an admin URL while signed out returns to that same form and does not show the admin tools.

## Sub-features

- `login-email` shows the email field and a disabled send button.
- `login-back` returns to the portfolio without sending a code.
- `admin-redirect` sends a signed-out visit to `/admin` back to the login form.

## How to get to it (user POV)

- Open `/login`.
- Open `/admin`, `/admin/projects`, or another `/admin/...` path while signed out. The site redirects to `/login`.
- From the login form, choose Back to Portfolio to return to `/`.

## Driving it with verify-marksportfolio

Preconditions:

- Doctor reports the local verification URL and that `/admin` redirects to `/login`.
- The browser has no admin session. This recipe does not create one.
- `ADMIN_EMAIL` is blank on the verification server. That is how launch starts it.

- **Open the form.** Open `/login`. Run `scripts/verify-marksportfolio/browser.sh open /login`, `scripts/verify-marksportfolio/browser.sh expect-heading "Admin Login"`, `scripts/verify-marksportfolio/browser.sh expect-text "Enter your email to receive a verification code"`, and `scripts/verify-marksportfolio/browser.sh expect-text "We'll send you a secure 6-digit verification code"`. The email step is showing, not the code step.
- **Check the empty form.** Run `scripts/verify-marksportfolio/browser.sh expect-role --role textbox --name "Email Address" --exact` and `scripts/verify-marksportfolio/browser.sh expect-disabled --role button --name "Send Verification Code"`. The email box is visible and Send Verification Code is disabled.
- **Confirm this is not the admin app.** Run `scripts/verify-marksportfolio/browser.sh expect-link --name "Back to Portfolio" --href "/"`, `scripts/verify-marksportfolio/browser.sh expect-absent "Redeploy Resume"`, and `scripts/verify-marksportfolio/browser.sh expect-absent "Sign Out"`. Back to Portfolio points at `/`. Admin chrome is absent.
- **Capture the form.** Run `scripts/verify-marksportfolio/browser.sh screenshot login.png`. The shot shows Admin Login.
- **Return home.** Choose Back to Portfolio. Run `scripts/verify-marksportfolio/browser.sh click --role link --name "Back to Portfolio"` and `scripts/verify-marksportfolio/browser.sh expect-heading "Mark Larson"`. The portfolio hero is showing.
- **Open admin while signed out.** Open `/admin`. Run `scripts/verify-marksportfolio/browser.sh open /admin`, `scripts/verify-marksportfolio/browser.sh expect-url-prefix "/login"`, `scripts/verify-marksportfolio/browser.sh expect-heading "Admin Login"`, `scripts/verify-marksportfolio/browser.sh expect-role --role textbox --name "Email Address" --exact`, `scripts/verify-marksportfolio/browser.sh expect-disabled --role button --name "Send Verification Code"`, `scripts/verify-marksportfolio/browser.sh expect-absent "Redeploy Resume"`, `scripts/verify-marksportfolio/browser.sh expect-absent "Sign Out"`, `scripts/verify-marksportfolio/browser.sh expect-absent "We've sent a verification code to:"`, and `scripts/verify-marksportfolio/browser.sh expect-absent "Try a different email"`. The final path is `/login`, the email step is showing again, and the admin tools are not.
- **Proof.** Run `scripts/verify-marksportfolio/browser.sh screenshot admin-gate.png`. The transcript `evidence/login-gate.txt` ends with `status=ok` when `scripts/verify-marksportfolio/drive-login-gate.sh` runs this whole list.

## Gotchas

- Do not type an address and do not click Send Verification Code. The click helper refuses that button. Submitting sends a real email OTP.
- The email button is labeled `Send Verification Code`, so that phrase is present on the email step. The code step is the screen that says `We've sent a verification code to:` and `Try a different email`. Those two strings must stay absent.
- Do not continue into Projects, Skills, Certificates, Jobs, or Settings after a redirect. Seeing `Redeploy Resume` or `Sign Out` means the gate failed.
- This recipe does not prove a successful sign-in. There is no fixture account and this harness must not create one.
