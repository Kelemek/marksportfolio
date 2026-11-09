# About

The about section states Mark's background, shows the self-portrait, and links to the résumé. The résumé site is not opened.

## Sub-features

- `about-copy` shows the biography under About Me.
- `about-portrait` shows the self-portrait.
- `about-resume` points My Resumé at the résumé site.

## How to get to it (user POV)

- Open `/` and scroll to About Me.
- Choose About in the top nav (`#about` on the home page, `/#about` elsewhere).
- Open `/#about` directly.

## Driving it with verify-marksportfolio

Preconditions:

- Doctor reports the local verification URL.
- The run was started by `scripts/verify-marksportfolio/launch.sh`.

- **Open About.** Open `/#about`. Run `scripts/verify-marksportfolio/browser.sh open /#about` and `scripts/verify-marksportfolio/browser.sh expect-heading "About Me"`. The heading reads `About Me`.
- **Read the biography.** Run `scripts/verify-marksportfolio/browser.sh expect-text "systems engineer"`, `scripts/verify-marksportfolio/browser.sh expect-text "Cambridge, Minnesota"`, and `scripts/verify-marksportfolio/browser.sh expect-text "ACBC certified Biblical counselor"`. All three phrases are visible.
- **Check the portrait.** Run `scripts/verify-marksportfolio/browser.sh expect-role --role img --name "My own self portrait drawn on iPad by me." --exact`. An image with that name is visible.
- **Check the résumé link.** Run `scripts/verify-marksportfolio/browser.sh expect-link --name "My Resumé" --exact --href "https://resume.romans8.net"`. The href is `https://resume.romans8.net`.
- **Proof.** Run `scripts/verify-marksportfolio/browser.sh screenshot about.png --selector "section#about"` and `scripts/verify-marksportfolio/browser.sh snapshot about.aria.txt --selector "section#about"`. The transcript `evidence/about.txt` ends with `status=ok` when `scripts/verify-marksportfolio/drive-about.sh` runs this whole list.

## Gotchas

- `My Resumé` uses `é` (U+00E9). The nav label `Resumé` is a different link and is covered by the home feature.
- Do not click My Resumé. The résumé host is outside this app.
- The portrait is not the full-bleed header photo. The header photo has an empty alt and is not this proof.
