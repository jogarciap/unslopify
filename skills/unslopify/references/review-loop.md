# Review loop: the user marks areas, you apply the changes

The report built by `make_report.py` has an annotation mode. The user draws a box on any before/after screenshot and writes what should change. Each comment carries:

- **where**: screenshot id and the box in page CSS px, e.g. `after/home-desktop-1440-full#160,230,540,190`;
- **what is inside**: the elements the box covers, from the layout map `page_check.mjs` saves next to each screenshot, e.g. `inside: div.wrap.hero-grid | covers: span "Un llavero."; span.soft "Toda la red."`;
- **the request**, in the user's words.

The comment reaches you in one of two ways.

## A. Claude with Artifacts (claude.ai, Claude desktop, Claude Code with the Artifact tool)

1. Build the review view (`make_report.py --view review --fragment …`: device picker plus large before/after screenshots, drawing always on) and publish it as an Artifact that declares the comments capability with custom anchors:
   - `capabilities: {"comments": {"customAnchors": true}}`
   - Keep the file path the same on every republish so the URL stays the same.
   - The page is private by default; it contains screenshots of the user's project, so do not share it unless the user asks.
2. Tell the user: open the side panel (or the link), pick the device, drag over a screenshot to mark an area, write the change, and press **Send to Claude**.
3. The comment arrives in this session (the publish result says whether the session is watching the artifact; if not, use the ArtifactComments tool to watch it or to read its threads). Its location is the anchor string above; the label and the element list come with it.
4. For each comment:
   1. Parse the anchor: screenshot (`after/<page>-<viewport>-<fold|full>`), box `x,y,w,h` in page px at that viewport width.
   2. Find the code: grep the project for the selectors and text in the element list (`hero-grid`, `"Toda la red."`); confirm with the layout map if needed.
   3. Make the change. It is still bound by the ground rules: brand docs, behaviour, no invented content. If the request conflicts with them, reply in the thread explaining why and offer an alternative instead of applying it.
   4. Reply in the thread with one or two lines: what changed and in which file.
5. When the batch is done: re-run `page_check.mjs` into `after/`, rebuild both the review view and the full report with `make_report.py`, add the new changes to `changes.json`, and republish the **same** Artifact (same file path). Resolve the threads you handled.
6. In chat, summarise in a few lines: what changed per comment and what you did not change and why.

If the publish is refused because of `customAnchors`, republish with `capabilities: {"comments": {}}`; the page then falls back to its local comment list (B).

## B. Any other environment (local file, other AI tools)

The same page works without Claude: comments are saved in the browser (localStorage) and listed in a panel with:

- **Copy for Claude**: a ready-to-paste prompt with every comment, its location, and its elements;
- **Download JSON**: `unslopify-feedback.json` with `{project, notes: [{shot, label, rect, elements, text}]}`.

When the user pastes that prompt or points you to the JSON, apply steps 4–6 above (reply in chat instead of threads).

## Showing the report in a side panel

- Claude desktop / claude.ai: publishing as an Artifact (A) opens it in the side panel.
- Claude Code desktop without Artifacts: send the HTML file to the user so it renders in the side panel; comments then use mode B.
- VS Code and other editors: open the HTML in the built-in browser preview (Simple Browser / Live Preview); mode B.
- Anywhere else: open the file in a browser.

## Tips for good annotations

- Comments on the **after** screenshots are the normal case; a comment on a **before** screenshot usually means "bring this back".
- The layout map exists for screenshots taken with `page_check.mjs`. Without it, the comment still has the box coordinates; locate the element by loading the page at that viewport width and reading what sits at those coordinates.
