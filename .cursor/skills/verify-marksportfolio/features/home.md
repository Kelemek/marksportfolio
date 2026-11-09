# Home

The home page introduces Mark Larson and jumps to the coding, drawing, about, and contact sections without leaving the page. The résumé link leaves the site and is checked by its href only.

## Sub-features

- `home-hero` shows the name, the tagline, and Get in touch.
- `home-nav` lists Coding, Drawing, About, Contact, and Resumé.
- `home-coding-jump` moves to the coding section from the nav.

## How to get to it (user POV)

- Open `/`.
- From a project page or the login page, follow a link back to the portfolio and land on `/`.

## Driving it with verify-marksportfolio

Preconditions:

- Doctor reports the local verification URL and a homepage that already contains `Mark Larson`.
- The run was started by `scripts/verify-marksportfolio/launch.sh`.

- **Open the hero.** Open `/`. Run `scripts/verify-marksportfolio/browser.sh open /`, then `scripts/verify-marksportfolio/browser.sh expect-heading "Mark Larson"`, `scripts/verify-marksportfolio/browser.sh expect-text "soli Deo gloria"`, and `scripts/verify-marksportfolio/browser.sh expect-text "Cambridge, Minnesota"`. The heading reads `Mark Larson` and the tagline names Cambridge, Minnesota.
- **Check the nav hrefs.** Read each top link without following the external one. Run `scripts/verify-marksportfolio/browser.sh expect-link --name "Coding" --exact --href "#work"`, `scripts/verify-marksportfolio/browser.sh expect-link --name "Drawing" --exact --href "#drawing"`, `scripts/verify-marksportfolio/browser.sh expect-link --name "About" --exact --href "#about"`, `scripts/verify-marksportfolio/browser.sh expect-link --name "Contact" --exact --href "#contact"`, and `scripts/verify-marksportfolio/browser.sh expect-link --name "Resumé" --exact --href "https://resume.romans8.net"`. The four section links are hashes. Resumé points at `https://resume.romans8.net`.
- **Check the hero button.** Read Get in touch. Run `scripts/verify-marksportfolio/browser.sh expect-link --name "Get in touch" --exact --href "#contact"`. The href is `#contact`.
- **Jump to coding.** Choose Coding. Run `scripts/verify-marksportfolio/browser.sh click --role link --name "Coding" --exact`, `scripts/verify-marksportfolio/browser.sh expect-url-contains "#work"`, and `scripts/verify-marksportfolio/browser.sh expect-heading "My Coding"`. The URL contains `#work` and the heading `My Coding` is visible.
- **Proof.** Capture the hero. Run `scripts/verify-marksportfolio/browser.sh screenshot home-hero.png --selector 'header[role="banner"]'` and `scripts/verify-marksportfolio/browser.sh snapshot home.aria.txt --selector 'header[role="banner"]'`. The transcript `evidence/home.txt` ends with `status=ok` when `scripts/verify-marksportfolio/drive-home.sh` runs this whole list.

## Gotchas

- On `/`, Coding is `#work`. On a project page the same link is `/#work`. This recipe starts at `/` and expects the hash form.
- The accessible name is `Resumé` with `é` (U+00E9), not `Resume`.
- `Get in touch` is the hero link. `Get in Touch` is the contact heading. The capital T is a different control.
- Do not click Resumé. That host is the résumé site, not this app.
- The nav is fixed to the top. The click helper scrolls the target to the center before clicking so the bar does not steal the click.
