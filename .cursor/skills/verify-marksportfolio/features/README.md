# Mark's Portfolio verification map

This directory is the maintained source for verifying the public portfolio. Read the index before driving the app, then use the matching feature file as the recipe.

## Baseline preconditions

- Launch with `scripts/verify-marksportfolio/launch.sh` so the site is served at `http://127.0.0.1:4180` (or the port in that run's port file).
- The shell has `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`, or `portfolio-next/.env.local` / `MARKSPORTFOLIO_VERIFY_ENV_FILE` provides them. The key must be the public anon or publishable key.
- Run `scripts/verify-marksportfolio/doctor.sh` and require the expected local URL, a live pid that owns the port, and a build stamp for this checkout.
- Visible projects are whatever the public Supabase project currently returns. This map does not seed or edit them.
- Never drive an instance that was not started by this verification run. Never point the browser at the deployed site.

## Driving conventions

- Start every recipe from the baseline state unless its preconditions say otherwise.
- Prefer the accessible names in each feature file. Link text includes a trailing arrow (`Details →`, `Visit →`, `Visit Site →`); the commands match the words and do not require the arrow glyph.
- Treat every command as literal. Keep quoted names and flags unchanged.
- Run browser actions through `scripts/verify-marksportfolio/browser.sh`, or run the feature's `drive-*.sh`, which calls those commands in order.
- Do not click `Send Verification Code`, external profile links, or `mailto:`.
- Restore nothing in Supabase. Do not remove proof artifacts during cleanup.

## Proof and skip reporting

- Capture the user action and the resulting URL, heading, and href, not only the final screen.
- UI proof includes the feature transcript, an ARIA snapshot where the drive script writes one, and a screenshot.
- Record the feature id and entry path. They are the first lines of `evidence/<feature>.txt`.
- Report an unreachable path with the command that failed and the unmet precondition.
- Do not report a skipped entry point as verified through a different path.
- Admin editing, OTP submission, and the résumé site itself are not features in this map. A pass of the public pages does not prove them.

## Feature entry contract

Each feature file starts with an H1 title and one paragraph describing the user-visible behavior. It then uses exactly four H2 sections in this order.

1. `Sub-features` lists short IDs with one line for each behavior.
2. `How to get to it (user POV)` lists every user entry point.
3. `Driving it with verify-marksportfolio` starts with `Preconditions:` and uses labeled bullets that pair each user action with an exact command and observable result.
4. `Gotchas` lists traps that can waste or invalidate a verification run.

## Features

- [Home](./home.md) covers the hero, the tagline, and the top navigation.
- [Projects](./projects.md) covers coding and drawing lists, detail pages, and the return to the coding section.
- [About](./about.md) covers the biography, portrait, and résumé link.
- [Contact](./contact.md) covers the email button and the footer profiles.
- [Login gate](./login-gate.md) covers the unauthenticated login form and the redirect from `/admin`.
