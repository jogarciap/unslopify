---
name: unslopify
description: Redesign web or mobile UIs that look AI-generated ("AI slop" / "vibecoded") so they look like a senior designer and front-end engineer built them, and make them ready to ship. Use when the user asks to unslop, de-slop, polish, make more professional, make less generic, or "make it look like a real product"; when restyling a landing page, dashboard, or app screen built by an AI tool; or when reviewing a UI for generic AI aesthetics (purple gradients, emoji icons, glow, "Welcome back! 👋" copy, arbitrary spacing). Also decides whether to add graphic material (a mascot, a metaphor illustration like a flame for streaks, a product render), fixes ship-readiness gaps (mobile overflow, mobile menu, page titles, meta descriptions, favicon, broken links, clickable email, placeholder text, empty/error states, 404 page), and delivers a before/after proposal report the user can annotate (draw a box, write a change, send it back) for another round. Works on HTML/CSS, Tailwind, React, Vue, Svelte, Next.js, Astro, and similar.
---

# Unslopify

Turn a generic AI-looking interface into one that looks deliberately designed and is ready to publish. The method comes from public "before/after" redesigns of vibecoded dashboards and apps: the after versions **remove** noise, build a **system** (spacing, type, colour tokens), spend boldness in **one** place, and add only what the product needs.

The answer to the user is always a **proposal**: the redesigned page plus a before/after report of everything that changed (see "Deliverable").

## Ground rules

- Keep behaviour. Do not change data, state, handlers, APIs, or accessibility semantics. Passes 1–6 are visual and copy passes. Pass 7 may **add** missing pieces (mobile menu, 404 page, empty and error states, metadata) but never removes or rewires existing functionality.
- Keep the content's meaning. Rewrite tone, not facts. Never invent metrics, testimonials, prices, addresses, or logos. If real content is missing, leave a clearly marked gap in the report instead of new placeholder text.
- Respect brand rules. If the project has brand or design docs (logo usage, approved palette, `DESIGN.md`, `MARCA.md`, `brand/`), read them first and do not break them; flag conflicts in the report.
- Make the work reversible. In a git repo, work on a new branch. Otherwise, copy the files you will touch to a backup folder before editing and say where it is.
- Work in passes (below), in order. Each pass edits the whole UI before the next one starts.
- Prefer editing tokens/theme/config once over patching every component.

## Workflow

0. **Capture the before.** Before any edit:
   - Run the scanner and save its JSON: `python scripts/slop_audit.py <src> --json > before.json` (paths relative to this skill's folder).
   - If the UI can run (dev server or static file), run the browser check, which also takes the screenshots: `node scripts/page_check.mjs <url> <out>/before` (see [references/ship-readiness.md](references/ship-readiness.md) for setup). If no browser automation is available, use any screenshot tool you have; if none, describe the before state in words.
1. **Audit.** Read both reports, then look at the rendered UI and list every tell from [references/slop-patterns.md](references/slop-patterns.md) you see. The scanner finds code-level tells; your eyes find hierarchy problems.
2. **Pick a direction in one sentence**: base (near-black or off-white), one accent colour and what it *means*, one personality move. Example: "Neutral near-black, warm orange only for live/heart data, dot-matrix display font for the hero metric."
3. **Run the seven passes** below. Passes 1–4 mostly remove; pass 5 may add graphics; pass 7 fixes what blocks publishing.
4. **Verify.** Re-run the scanner and the browser check into `<out>/after`. The slop score should fall sharply, ship-readiness issues should be zero or explained, there must be no horizontal overflow at 360/390/768/1440 px, and typecheck/build must pass if the project has them.
5. **Deliver the proposal** (next section).

## Deliverable: the before/after proposal

Every run ends with a proposal the user can review and accept or revert.

1. Write `changes.json` describing the run (schema in [references/report.md](references/report.md)): direction, changes grouped by pass with file references, the graphic-material decision, the ship-readiness checklist with status, anything left as a proposal, and how to revert.
2. Build the report:
   ```bash
   python scripts/make_report.py --before <out>/before --after <out>/after \
     --scan-before before.json --scan-after after.json \
     --changes changes.json --out <out>/unslop-report.html
   ```
   It produces one self-contained HTML file: side-by-side before/after screenshots (desktop and mobile), scores, the change log, the checklist, open proposals, and an **annotation mode** where the user draws a box on any screenshot and writes what should change.
3. Show the report in a side panel:
   - **Claude with an Artifact tool**: publish it as an Artifact declaring `capabilities: {"comments": {"customAnchors": true}}`. Boxes the user draws open Claude's comment composer on that area, and **Send to Claude** delivers the comment to you with the box location and the elements inside it.
   - **Elsewhere**: send or open the HTML file (side panel, editor preview, or browser). Comments are kept in the page; the user copies them as a prompt or downloads them as JSON.
   Keep it in the project (e.g. `unslop/`) and do not commit it unless asked.
4. In your reply, lead with the outcome and the score change, link the report, list the 3–5 most visible changes, say what you did not change and why, explain in one line how to mark areas and send comments, and ask whether to keep or revert the changes.
5. **Review loop.** When comments arrive (Artifact comments, a pasted prompt, or `unslopify-feedback.json`), apply them, reply per comment, re-capture the after state, rebuild the report, and republish it to the same place. Follow [references/review-loop.md](references/review-loop.md).

## Pass 1 — Spacing

AI output uses arbitrary values (15, 22, 37, 42 px). Replace them with a scale.

- Use a 4 px base: `4 8 12 16 20 24 32 40 48 64 80 96`. Every padding, margin, and gap must come from it.
- Pick a few roles and reuse them everywhere: card padding (e.g. 20–24), gap between cards (e.g. 12–16), section gap (e.g. 32–48), page gutter (16–24 on mobile, 24–40 on desktop).
- Group by proximity: related items tighter, unrelated items farther apart. Fewer dividers, more whitespace.
- One radius family: e.g. 8 for controls, 12–16 for cards, 24–28 for large mobile cards, full for pills and avatars. Nested radius = outer radius − padding.
- Align to one grid. Numbers right-aligned in lists and tables.
- Leave illustration internals (device mockups, rendered objects) and brand lockups alone; their sizes model real things.

## Pass 2 — Type

- One family for UI (e.g. Geist, Inter Tight, Plus Jakarta Sans, Satoshi, SF Pro, IBM Plex Sans) plus optionally a mono for metadata and numbers. A display face is allowed for **one** role only, such as the hero metric or headlines.
- Scale of at most 5–6 sizes, e.g. `12 / 14 / 16 / 20 / 28 / 40+`. Weights: mostly 400 and 500; 600 sparingly.
- Hierarchy through size and colour (primary / secondary / tertiary text), not through bold + caps + colour all at once.
- Labels in sentence case, small, muted ("Paid this month"), not `UPPERCASE TRACKED + emoji`. A single tiny mono eyebrow is fine (e.g. `WED, 28 OCT · 7:12`).
- Big numbers: tabular figures, tight tracking, units and deltas demoted to a smaller muted size (`5′12 /km`, `148 bpm`, `+12% vs last month`).
- Two-tone headings beat gradient text: `October <span class="muted">2026</span>`. Remove gradient text everywhere.
- Body text at least 16 px on mobile; inputs at least 16 px so iOS does not zoom.

## Pass 3 — Colour

- Neutral base: near-black (`#0A0A0B`–`#111113`) with surfaces 1–2 steps lighter, or off-white (`#FAFAF9`) with white surfaces. Borders as 1 px hairlines.
- **One** accent, and it must mean something (primary action, live state, a category). Everything else is greyscale.
- Colour as data: when colour encodes categories, use the same colour in the legend dot, the chart series, and the list item.
- Colour as light, not fill: atmosphere, if any, is a localized glow inside one component tied to its meaning. Not full-bleed gradients.
- Kill: purple/indigo/violet → pink gradients, rainbow cards, coloured glow shadows, glassmorphism on every surface, gradient buttons.
- Status colours only on the value that changed, not on whole cards.
- Contrast: body text ≥ 4.5:1; a primary button must never look disabled.
- Shadows: near zero on dark UIs; one soft shadow token at most on light UIs.

## Pass 4 — Symbols (icons, emoji, imagery)

- Remove every emoji from UI chrome and copy (keep it only in user-generated content or a genuinely emoji-based brand).
- One icon set (Lucide, Phosphor, Heroicons, Tabler, SF Symbols), one stroke width, one size per context. Monochrome, inheriting text colour.
- Replace emoji/clip-art illustrations with real assets: product screenshots, a rendered object, a photo, or nothing.
- Keyboard hints as real keycaps: `<kbd>⌘</kbd><kbd>K</kbd>`.
- Remove badge spam ("PRO", "New ✨", "AI", coloured count pills). Counts become muted right-aligned numbers.

## Pass 5 — Graphic material (decide, then add)

Removing noise often leaves a correct but anonymous UI. Senior redesigns then add **one** piece of graphic material that comes from the product itself: a mascot peeking over the lesson card of a study app, a flame-like gradient band behind a streak counter, a rendered credit card on a payments dashboard, dot-matrix numerals on a running app. Never add graphics by default; run the fit test in [references/graphic-material.md](references/graphic-material.md) and record the decision.

1. **Find the metaphor.** List the product's core concepts and what they already evoke (streak → fire, payments → card, NFC → keytag, delivery → route). Prefer metaphors the UI already hints at.
2. **Score the fit** (audience and tone, metaphor strength, a natural anchor, ability to carry state, brand rules, execution quality): **add**, **keep** (an existing graphic already does the job), **propose only**, or **skip**.
3. **Choose the type**: character/mascot, metaphor illustration, object/product render, data-as-graphic, atmosphere, or spot illustration for empty and success states.
4. **Anchor it** to one component. One graphic moment per screen; never sprinkle.
5. **Make it carry meaning or state** where possible (flame intensity follows streak length, mascot mood follows progress).
6. **Build it in the palette and icon system**: inline SVG or CSS, 2–3 colours from the tokens, `aria-hidden="true"`, motion respects `prefers-reduced-motion`.
7. **Respect brand rules.** If it would change the brand, choose **propose only**. If you cannot build it at the quality of the rest of the UI, write a brief instead of shipping clip-art.

## Pass 6 — Structure and copy

- One focal point per screen; the rest subordinate.
- Replace greetings with context: "Welcome back, Damir! 👋" → "October 2026".
- No exclamation marks, no 🔥🚀✨, no "AI-powered", "supercharge", "unlock", "seamless", "next-level". State facts plainly.
- Remove redundancy: the same claim repeated in the hero, a marquee, and a chip row becomes one statement.
- Data viz must fit the data; remove decorative sine waves and fake charts.
- The primary action looks primary; secondary actions are quiet.
- Active nav state: subtle surface fill or a small indicator, not a saturated slab.

## Pass 7 — Ship-readiness

Fix what makes a page look unfinished once it is live. Details, code for each framework, and detection rules are in [references/ship-readiness.md](references/ship-readiness.md). The scanner's "Ship-readiness" section and `page_check.mjs` find most of these; check the rest by reading the code.

**Mobile**
- **No horizontal overflow or horizontal scroll** at 360, 390, 768, and 1440 px. Fix the cause (fixed widths, `100vw`, long unbroken strings, absolutely positioned art, wide tables, negative margins); do not hide it with `overflow-x: hidden` on `body` unless the cause is decorative and contained.
- **Mobile menu.** If navigation links are hidden at small widths, add an accessible toggle (button with `aria-expanded` and `aria-controls`, closes on link click and Escape, focusable links, no layout shift).
- **Optimize for mobile.** Viewport meta tag; tap targets ≥ 44×44 px; body ≥ 16 px; stacked layouts; full-width primary buttons where it helps; images with `max-width: 100%`; no hover-only interactions.
- **Test on mobile.** Run `page_check.mjs` (it emulates phone and tablet viewports) and look at the mobile screenshots. Tell the user what to check on a real device, since emulation is not a physical phone.

**Metadata**
- **Page titles.** Every page has a unique, specific `<title>`: `Page — Brand` (≤ 60 characters). No "Vite + React", "Create Next App", "Document", or "Home".
- **Meta descriptions.** One per page, 120–160 characters, plain and specific, written from the page's real content.
- **Favicon.** SVG favicon plus `apple-touch-icon` (180×180 PNG) when possible, built from the existing logo or isotype; never the framework's default icon. Set `theme-color` to the page background.
- Social preview tags (`og:title`, `og:description`, `og:image`) when the page will be shared; propose an OG image if none exists.

**Links and content**
- **Clickable email and phone.** Every visible email is `<a href="mailto:…">` and every phone `<a href="tel:…">`.
- **Broken links.** No `href="#"`, empty `href`, or `javascript:void(0)` on things that look like links; in-page anchors point to ids that exist; internal routes resolve; external links that fail are reported. Links that have nowhere to go yet become plain text or are listed in the report; do not invent URLs.
- **Placeholder text.** Remove lorem ipsum, "John Doe", "Your Company", "Acme", "Feature 1", "123 Main St", "(555)", `example.com`, "TODO", and stock filler. Replace with real content from the project; if none exists, list the gap in the report instead of inventing it.

**States**
- **Empty states** for every list, table, feed, or search result that can be empty: a short sentence of what goes here, a primary action, optionally the pass-5 graphic in a quiet mood.
- **Error messages**: inline validation next to the field (what is wrong and how to fix it, in plain words), a visible failure message for network or submit errors with a retry, `aria-live="polite"` on message regions, no blame or jargon.
- **404 page** in the project's own style: say the page does not exist, offer a way home and the main destinations, keep the header and footer. Wire it the framework's way (see the reference).

## Final checklist

- [ ] Before captures and scan saved before any edit; backup or branch exists.
- [ ] Zero emoji in UI chrome and copy; no gradient text.
- [ ] Every spacing value on the scale; one radius family.
- [ ] ≤ 6 font sizes, ≤ 3 weights.
- [ ] One accent colour with a stated meaning.
- [ ] One focal point per screen; plain, specific copy.
- [ ] One icon set, one stroke width.
- [ ] Graphic material decision recorded (add / propose only / skip) with the reason.
- [ ] No horizontal overflow at 360/390/768/1440 px; mobile menu works; tap targets ≥ 44 px.
- [ ] Unique titles, meta descriptions, favicon, viewport, theme-color.
- [ ] Emails and phones clickable; no broken or dead links; no placeholder text.
- [ ] Empty states, error messages, and a 404 page exist where the product needs them.
- [ ] Behaviour and data unchanged; brand rules respected; typecheck/build pass.
- [ ] Before/after report built and linked in the reply.

## Avoid over-correcting

The goal is not "make everything dark grey like Linear". Signs you over-corrected: everything is the same grey with no focal point, text is too low-contrast to read, the brand's colour disappeared, or you replaced purple glow with a different glow. The opposite failure is a clean UI with no personality left; pass 5 exists to fix that with one graphic moment that belongs to the product.

## References and scripts

- [references/slop-patterns.md](references/slop-patterns.md) — catalogue of AI-slop tells, each with the fix.
- [references/graphic-material.md](references/graphic-material.md) — fit test, graphic types, placement, mascots and metaphor graphics.
- [references/ship-readiness.md](references/ship-readiness.md) — mobile, metadata, links, placeholder text, empty/error states, 404, per framework.
- [references/report.md](references/report.md) — `changes.json` schema and how the proposal report is built.
- [references/review-loop.md](references/review-loop.md) — showing the report in a side panel, how annotated comments reach you, and how to apply them.
- [references/case-studies.md](references/case-studies.md) — three before/after breakdowns.
- [references/tokens.md](references/tokens.md) — starter token sets (CSS variables and Tailwind).
- `scripts/slop_audit.py` — static scanner: slop score plus ship-readiness findings (Python standard library only).
- `scripts/page_check.mjs` — browser check with Playwright: horizontal overflow per viewport, title/description/favicon, broken anchors and links, console errors, screenshots, and a layout map of the elements in each screenshot.
- `scripts/make_report.py` — builds the self-contained before/after HTML report with the annotation mode (`scripts/report_annotate.js` is inlined into it).
