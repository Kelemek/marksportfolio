---
name: verify-marksportfolio
description: Drive Mark's Portfolio locally (Next.js production build on 127.0.0.1) and prove the public pages, project links, and unauthenticated login gate. Use when a change to the portfolio site needs a scripted browser proof before handoff.
---

# Verify Mark's Portfolio (web)

The primary surface is the public Next.js site in `portfolio-next` (home, project pages, contact, and the unauthenticated login gate). Admin CRUD, email OTP submission, resume deploys, and database writes are out of scope for this skill. The app reads the configured public Supabase project. This harness does not seed, migrate, or mutate it.

The repo's quickstart is `npm run dev` on port 3000. Verification does not use that server. It builds with `npm run build` and serves `next start` on `127.0.0.1:4180` so the proof matches a production build and does not attach to a developer's dev server.

## Launch

From the repo root, with Node **22** or newer (`.nvmrc` and `portfolio-next/package.json` engines):

```bash
export MARKSPORTFOLIO_VERIFY_RUN_ID="${MARKSPORTFOLIO_VERIFY_RUN_ID:-}"
export MARKSPORTFOLIO_VERIFY_PORT="${MARKSPORTFOLIO_VERIFY_PORT:-4180}"
scripts/verify-marksportfolio/launch.sh
```

Leave `MARKSPORTFOLIO_VERIFY_RUN_ID` unset for a single local run. The script writes `/tmp/marksportfolio-verify-current` so later commands in a new shell find the same run. Two runs at once each need their own `MARKSPORTFOLIO_VERIFY_RUN_ID` and `MARKSPORTFOLIO_VERIFY_PORT`. They still share the remote Supabase project, read-only. Do not point this harness at `https://portfolio.romans8.net` or any other deployed host. `MARKSPORTFOLIO_VERIFY_URL` is always `http://127.0.0.1:$PORT` from the run's port file.

Public config, and only that:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (anon JWT or `sb_publishable_` key)

Export them, or put them in `portfolio-next/.env.local`, or set `MARKSPORTFOLIO_VERIFY_ENV_FILE` to a file that contains them. The script never prints the values. A service-role key is refused. Launch blanks `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`, `NEXT_PUBLIC_POSTHOG_HOST`, `ADMIN_EMAIL`, `VERCEL_DEPLOY_HOOK_RESUME`, and `SUPABASE_SERVICE_ROLE_KEY` for the build and the server so a developer env file cannot enable analytics, admin identity, or the resume deploy hook during a proof.

What launch does:

1. `npm ci --prefix portfolio-next` when `portfolio-next/node_modules/next/dist/bin/next` is missing.
2. `npm run build` in `portfolio-next`.
3. `next start --hostname 127.0.0.1 --port $MARKSPORTFOLIO_VERIFY_PORT`.
4. Waits until `scripts/verify-marksportfolio/doctor.sh` exits 0.

**Ready** is this line:

```text
[verify-marksportfolio] Ready at http://127.0.0.1:4180
```

Ready means the homepage returned 200 with `Mark Larson`, the four section ids (`work`, `drawing`, `about`, `contact`), and at least one `/projects/` link. A process that answers before that content is rendered is not ready. There is no local database to migrate and this skill does not seed one. Visible projects come from the public Supabase read. If that read returns none, launch fails and says so.

State directory: `/tmp/marksportfolio-verify-$MARKSPORTFOLIO_VERIFY_RUN_ID/` (`next.pid`, `next.log`, `port`, `build.json`, `evidence/`).

If that pid is already healthy, launch leaves it running and prints Ready. If the pid is alive but doctor fails, run cleanup before launching again. Launch will not kill a process it did not start, and it will not take a port another process owns.

Teardown is `scripts/verify-marksportfolio/cleanup.sh`. It stops only this run's process group. Evidence stays.

## Doctor

```bash
scripts/verify-marksportfolio/doctor.sh
```

Read-only. Run it before the first drive and again whenever the server did something unexpected. It checks:

1. `next.pid` is alive.
2. `127.0.0.1:$PORT` is listened on by that pid or a descendant, and by nothing else.
3. The recorded git SHA, `portfolio-next` source stamp, Node version, port, and `.next/BUILD_ID` still match this checkout. A dirty `portfolio-next` tree is allowed only if it is the same dirty tree that was built. Edits limited to this skill do not invalidate the server.
4. The key class stored at launch is `anon` or `publishable`.
5. `GET /` is 200 and contains the public headings plus at least one project link.
6. `GET /login` is 200, shows `Admin Login`, and does not show `Redeploy Resume`.
7. `GET /admin` with no cookies redirects (301, 302, 303, 307, or 308) to `/login`.

A passing doctor prints one line:

```text
[doctor] OK pid=<pid> url=http://127.0.0.1:4180 run_id=<id> project_links=<n> admin_gate=<status> keyClass=anon supabaseHost=<host> buildId=<id> git=<sha>
```

If it fails, read `/tmp/marksportfolio-verify-$MARKSPORTFOLIO_VERIFY_RUN_ID/next.log` and `build.log`. Do not drive a server this run did not start.

## Drive

Harness: Playwright through `scripts/verify-marksportfolio/browser.sh`, using Google Chrome when `/usr/bin/google-chrome` (or `MARKSPORTFOLIO_VERIFY_CHROME`) is executable. Viewport is 1280×800. The first browser command installs `playwright@1.65.0` under `/tmp/marksportfolio-playwright-1.65.0` and does not add it to the app. If no Chrome binary is usable, that command installs Playwright's Chromium and retries once.

Read the feature map first: [features/README.md](features/README.md). Drive the feature you changed, not a convenient neighbor. One feature's pass does not cover the others.

Every `browser.sh` command runs doctor first. Commands refuse to open `/api/...`, follow `mailto:` or an external `http(s)` URL, or click `Send Verification Code`, `Redeploy Resume`, or `Sign Out`.

| Script | Feature |
| --- | --- |
| `scripts/verify-marksportfolio/drive-home.sh` | Hero and nav |
| `scripts/verify-marksportfolio/drive-projects.sh` | Coding, drawing, and detail pages |
| `scripts/verify-marksportfolio/drive-about.sh` | About and résumé link |
| `scripts/verify-marksportfolio/drive-contact.sh` | Email and footer profiles |
| `scripts/verify-marksportfolio/drive-login-gate.sh` | Login shell and `/admin` redirect, no submit |

Example:

```bash
scripts/verify-marksportfolio/drive-projects.sh
```

A single step, after launch and with the same run id:

```bash
scripts/verify-marksportfolio/browser.sh open /
scripts/verify-marksportfolio/browser.sh expect-heading "My Coding"
```

## Evidence

Directory: `/tmp/marksportfolio-verify-$MARKSPORTFOLIO_VERIFY_RUN_ID/evidence/`.

Each drive script writes `<feature>.txt` (the actions, URLs, headings, and link hrefs) plus the PNG and `.aria.txt` files named in that feature. The run id is the first lines of the transcript. Cleanup does not delete this directory.

Proof standards:

- Exercise the page a visitor opens. Do not call internal setters, test-only routes, or `/api/*`.
- Record the action and the resulting URL, heading, and href. A screenshot of the last screen is not the whole proof.
- Follow in-app links (`Details`, nav, Back to Portfolio). For résumé, Visit, GitHub, LinkedIn, and mailto, read `href` and stop. Those hosts are outside this app. Do not treat a third-party iframe document as part of the proof; check the iframe title and the Visit href.
- Do not submit the login form, do not type a real inbox into it, and do not open an authenticated admin session. The login proof is the disabled button and the redirect.
- This server is started with PostHog blanked, so a drive does not send analytics. Confirm that by the absence of `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` on the server process, not by the name of the script.
- There is no local database side effect to read back. A project title on the detail page must match the card that was opened. That is the read-only side effect.

## Cleanup

```bash
scripts/verify-marksportfolio/cleanup.sh
```

Sends `SIGTERM`, then `SIGKILL`, to the process group recorded in this run's `next.pid`. Removes the pid, log, port, build stamp, and browser-state files. Does not delete `/tmp/marksportfolio-verify-$MARKSPORTFOLIO_VERIFY_RUN_ID/evidence/` and does not delete `/tmp/marksportfolio-verify-current`. Never kills by process name. After cleanup, doctor fails because the pid is gone. That is expected. The evidence files should still be there.

Run cleanup after a failed launch or drive too, so the port is not left occupied.

## Helpers

All of these are executable. Paths are from the repo root.

| Helper | Invocation |
| --- | --- |
| Launch | `scripts/verify-marksportfolio/launch.sh` |
| Doctor | `scripts/verify-marksportfolio/doctor.sh` |
| Cleanup | `scripts/verify-marksportfolio/cleanup.sh` |
| One browser action | `scripts/verify-marksportfolio/browser.sh <command> [flags]` |
| Home | `scripts/verify-marksportfolio/drive-home.sh` |
| Projects | `scripts/verify-marksportfolio/drive-projects.sh` |
| About | `scripts/verify-marksportfolio/drive-about.sh` |
| Contact | `scripts/verify-marksportfolio/drive-contact.sh` |
| Login gate | `scripts/verify-marksportfolio/drive-login-gate.sh` |
| Process group | `python3 scripts/verify-marksportfolio/proc.py start\|stop\|listeners ...` |

`browser.sh` commands used by the feature map:

- `open <path>` — local path only (`/`, `/#about`, `/projects/...`, `/login`, `/admin`).
- `expect-heading "<text>"` — exact accessible name.
- `expect-text "<text>"` — substring of visible text.
- `expect-role --role <role> --name "<name>" [--exact]`
- `expect-link --name "<name>" [--exact] [--href "<href>"] [--href-prefix "<prefix>"] [--within-heading "<heading>"] [--nth <n>]`
- `expect-disabled --role <role> --name "<name>"`
- `expect-absent "<text>"` — case-sensitive visible text that must not be present.
- `expect-url-prefix <pathname-prefix>`
- `expect-url-contains <fragment>`
- `click --role <role> --name "<name>" [--exact] [--within-heading "<heading>"] [--nth <n>] [--record-card]`
- `expect-recorded-heading` — detail `h1` equals the card title recorded by `--record-card`.
- `expect-recorded-links` — detail Visit Site and GitHub hrefs equal the card's, when the card had them.
- `expect-project-preview` — demo iframe titled with the card name, or a loaded image, or the empty-preview text.
- `screenshot <file.png> [--selector <css>]`
- `snapshot <file.aria.txt> [--selector <css>]`

Screenshot and snapshot filenames are basenames. They are written under the evidence directory. `common.sh` is sourced by the other shell scripts; it only resolves the run id, port, and directories.

Environment the scripts actually read:

- `MARKSPORTFOLIO_VERIFY_RUN_ID` — optional; defaults through `/tmp/marksportfolio-verify-current`.
- `MARKSPORTFOLIO_VERIFY_PORT` — optional until launch writes the port file. Default `4180`. After launch, the port file wins.
- `MARKSPORTFOLIO_VERIFY_ENV_FILE` — optional file with the two public Supabase variables.
- `MARKSPORTFOLIO_VERIFY_CHROME` — optional Chrome executable.

## Maintenance

When a public heading, link name, or route changes, update the matching file under `features/` and re-run that drive script. Use `/maintain-verification-skill` to audit the map against the app.
