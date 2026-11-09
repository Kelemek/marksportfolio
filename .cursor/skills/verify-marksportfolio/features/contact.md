# Contact

The contact section gives the email address. The footer gives the GitHub and LinkedIn profiles. None of those destinations are opened.

## Sub-features

- `contact-copy` shows how to get in touch.
- `contact-email` points the email button at `mailto:markdlarson@me.com`.
- `contact-github` points the footer GitHub icon at the GitHub profile.
- `contact-linkedin` points the footer LinkedIn icon at the LinkedIn profile.

## How to get to it (user POV)

- Open `/` and scroll to Get in Touch.
- Choose Contact in the top nav, or choose Get in touch in the hero.
- Open `/#contact` directly.
- The footer is on the home page and on project pages.

## Driving it with verify-marksportfolio

Preconditions:

- Doctor reports the local verification URL.
- The run was started by `scripts/verify-marksportfolio/launch.sh`.

- **Open contact.** Open `/#contact`. Run `scripts/verify-marksportfolio/browser.sh open /#contact` and `scripts/verify-marksportfolio/browser.sh expect-heading "Get in Touch"`. The heading reads `Get in Touch`.
- **Read the prompt.** Run `scripts/verify-marksportfolio/browser.sh expect-text "The quickest way to reach me is via email."`. That sentence is visible.
- **Check the email button.** Run `scripts/verify-marksportfolio/browser.sh expect-link --name "markdlarson@me.com" --exact --href "mailto:markdlarson@me.com"`. The href is `mailto:markdlarson@me.com`.
- **Check the footer profiles.** Run `scripts/verify-marksportfolio/browser.sh expect-link --name "GitHub" --exact --href "https://github.com/kelemek/"` and `scripts/verify-marksportfolio/browser.sh expect-link --name "LinkedIn" --exact --href "https://www.linkedin.com/in/mark-larson-a33b3588"`. GitHub includes the trailing slash. LinkedIn does not.
- **Proof.** Run `scripts/verify-marksportfolio/browser.sh screenshot contact.png --selector "section#contact"`, `scripts/verify-marksportfolio/browser.sh screenshot footer.png --selector 'footer[role="contentinfo"]'`, and `scripts/verify-marksportfolio/browser.sh snapshot contact.aria.txt --selector "section#contact"`. The transcript `evidence/contact.txt` ends with `status=ok` when `scripts/verify-marksportfolio/drive-contact.sh` runs this whole list.

## Gotchas

- `--exact` is required for `GitHub`. Project cards use `View Source Code on GitHub`, and a substring match selects those instead of the footer.
- Do not click the mailto link or either profile. The harness refuses those clicks.
- The hero's Get in touch link is covered by the home feature. This recipe checks the contact section and the footer.
