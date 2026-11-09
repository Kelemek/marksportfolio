# Projects

A visitor scans visible coding projects and drawings, opens a project, and checks that the detail page is the same project. Coding cards can also expose a live site and a source repository. Those destinations are recorded, not opened.

## Sub-features

- `projects-coding` lists visible coding projects under My Coding, each with a Details link.
- `projects-drawing` lists visible drawings under My Drawing, each with a Details link.
- `projects-detail` opens a card and shows that title as the page heading.
- `projects-detail-links` keeps the card's Visit and source hrefs on the detail page when the card had them.
- `projects-back` returns from a detail page to the coding section.

## How to get to it (user POV)

- Open `/` and scroll to My Coding or My Drawing.
- Choose Coding or Drawing in the top nav.
- Choose Details on a card.
- Open `/projects/<slug>` directly.

## Driving it with verify-marksportfolio

Preconditions:

- Doctor reports the local verification URL.
- The homepage contains at least one Details link under My Coding and one under My Drawing. If either section has no card, stop and report that failure. Do not invent a slug and do not write a project.

- **Open the lists.** Open `/`. Run `scripts/verify-marksportfolio/browser.sh open /`, `scripts/verify-marksportfolio/browser.sh expect-heading "My Coding"`, and `scripts/verify-marksportfolio/browser.sh expect-heading "My Drawing"`. Both headings are visible.
- **Check the first card in each list.** Read the first Details link in each section. Run `scripts/verify-marksportfolio/browser.sh expect-link --name "Details" --within-heading "My Coding" --href-prefix "/projects/"` and `scripts/verify-marksportfolio/browser.sh expect-link --name "Details" --within-heading "My Drawing" --href-prefix "/projects/"`. Each href starts with `/projects/`.
- **Capture the first coding card.** Run `scripts/verify-marksportfolio/browser.sh screenshot projects-coding.png --selector "section#work article"`. The shot shows that card's title and Details link.
- **Open the first coding project.** Choose its Details link. Run `scripts/verify-marksportfolio/browser.sh click --role link --name "Details" --within-heading "My Coding" --record-card`, `scripts/verify-marksportfolio/browser.sh expect-url-prefix "/projects/"`, `scripts/verify-marksportfolio/browser.sh expect-recorded-heading`, `scripts/verify-marksportfolio/browser.sh expect-recorded-links`, and `scripts/verify-marksportfolio/browser.sh expect-project-preview`. The path starts with `/projects/`, the `h1` equals the card title, Visit Site and the GitHub source href match the card when the card had them, and a demo iframe titled with that project name is present when the card had Visit.
- **Capture the coding detail.** Run `scripts/verify-marksportfolio/browser.sh screenshot projects-detail.png --selector "main article"` and `scripts/verify-marksportfolio/browser.sh snapshot projects-detail.aria.txt --selector "main"`. The snapshot includes the project title.
- **Return to coding.** Choose Coding in the nav. Run `scripts/verify-marksportfolio/browser.sh click --role link --name "Coding" --exact`, `scripts/verify-marksportfolio/browser.sh expect-url-contains "#work"`, and `scripts/verify-marksportfolio/browser.sh expect-heading "My Coding"`. The URL contains `#work`.
- **Open the first drawing.** Choose its Details link. Run `scripts/verify-marksportfolio/browser.sh click --role link --name "Details" --within-heading "My Drawing" --record-card`, `scripts/verify-marksportfolio/browser.sh expect-url-prefix "/projects/"`, `scripts/verify-marksportfolio/browser.sh expect-recorded-heading`, and `scripts/verify-marksportfolio/browser.sh expect-project-preview`. The `h1` equals that drawing's card title. A drawing has no Visit link; the preview is a loaded image or the text `No preview available` / `No image available`.
- **Capture the drawing.** Run `scripts/verify-marksportfolio/browser.sh screenshot projects-drawing.png --selector "main article"`. The transcript `evidence/projects.txt` ends with `status=ok` when `scripts/verify-marksportfolio/drive-projects.sh` runs this whole list.

## Gotchas

- Card order is the live `display_order` of visible rows. Assert the card you opened, not a title memorized from production.
- The accessible name is `Details →` or `Visit →`. Match `Details` and `Visit`; do not require the arrow in the command.
- On the detail page the live-site link is named `Visit Site`, not `Visit`.
- Source links are named `View Source Code on GitHub`. The footer link is named `GitHub`. A substring match on `GitHub` selects the wrong control.
- Do not open Visit, the source repository, or the image's storage URL. Read the href or the rendered image.
- A coding demo iframe loads another site. The proof checks the iframe's title and the Visit href. It does not click inside the frame.
- From a detail page, Coding points at `/#work`, not `#work`.
- An empty My Coding or My Drawing section fails this journey. The harness does not insert a project to make it pass.
