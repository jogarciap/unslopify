---
name: unslop-ui
description: Redesign web or mobile UIs that look AI-generated ("AI slop" / "vibecoded") so they look like a senior designer and front-end engineer built them. Use when the user asks to unslop, de-slop, polish, make more professional, make less generic, or "make it look like a real product"; when restyling a landing page, dashboard, or app screen built by an AI tool; or when reviewing a UI for generic AI aesthetics (purple gradients, emoji icons, glow, "Welcome back! 👋" copy, arbitrary spacing). Works on HTML/CSS, Tailwind, React, Vue, Svelte, and similar.
---

# Unslop UI

Turn a generic AI-looking interface into one that looks deliberately designed. The method comes from public "before/after" redesigns of vibecoded dashboards and apps: the after versions never add more decoration. They **remove** noise, build a **system** (spacing, type, color tokens), and spend boldness in **one** place.

## Ground rules

- Keep behavior. Do not change routes, data, state, handlers, APIs, or accessibility semantics. This is a visual and copy pass.
- Keep the content's meaning. Rewrite tone, not facts. Never invent metrics, testimonials, or logos.
- Work in passes (below), in order. Each pass edits the whole UI before the next one starts.
- Prefer editing tokens/theme/config once over patching every component.
- If you can render the UI (dev server, browser tool, screenshot tool), capture a **before** screenshot first and an **after** screenshot at the end, and compare.

## Workflow

1. **Audit.** Run the scanner on the UI source and read the report:
   ```bash
   python scripts/slop_audit.py <src-dir-or-files>
   ```
   (Path is relative to this skill's folder.) Then look at the rendered UI and list every tell from [references/slop-patterns.md](references/slop-patterns.md) you see. The scanner finds code-level tells; your eyes find hierarchy problems.
2. **Pick a direction in one sentence** before touching code: base (near-black or off-white), one accent color and what it *means*, one personality move (display font for hero numbers, a mascot, an illustration, a distinctive layout). Example: "Neutral near-black, warm orange only for live/heart data, dot-matrix display font for the hero metric."
3. **Run the five passes** below.
4. **Verify.** Re-run the scanner (score should fall sharply), re-screenshot, and walk the final checklist.
5. **Report** a short changelog grouped by pass, plus anything you deliberately left alone.

## Pass 1 — Spacing

AI output uses arbitrary values (15, 22, 37, 42 px). Replace them with a scale.

- Use a 4 px base: `4 8 12 16 20 24 32 40 48 64 80 96`. Every padding, margin, and gap must come from it.
- Pick a few roles and reuse them everywhere: card padding (e.g. 20–24), gap between cards (e.g. 12–16), section gap (e.g. 32–48), page gutter (16–24 on mobile, 24–40 on desktop).
- Group by proximity: related items tighter, unrelated items farther apart. Fewer dividers, more whitespace.
- One radius family: e.g. 8 for controls, 12–16 for cards, 24–28 for large mobile cards, full for pills and avatars. Nested radius = outer radius − padding.
- Align to one grid. Numbers right-aligned in lists and tables.

## Pass 2 — Type

- One family for UI (e.g. Geist, Inter Tight, Plus Jakarta Sans, Satoshi, SF Pro, IBM Plex Sans) plus optionally a mono for metadata and numbers (Geist Mono, JetBrains Mono, IBM Plex Mono). A display face is allowed for **one** role only, such as the hero metric.
- Scale of at most 5–6 sizes, e.g. `12 / 14 / 16 / 20 / 28 / 40+`. Weights: mostly 400 and 500; 600 sparingly. Avoid 800–900 except a deliberate display moment.
- Hierarchy through size and color (primary / secondary / tertiary text), not through bold + caps + color all at once.
- Labels in sentence case, small, muted ("Paid this month"), not `UPPERCASE TRACKED + emoji`. A single tiny mono uppercase eyebrow is fine (e.g. `WED, 28 OCT · 7:12`).
- Big numbers: tabular figures (`font-variant-numeric: tabular-nums`), tight tracking, units and deltas demoted to a smaller muted size (`5′12 /km`, `148 bpm`, `+12% vs last month`).
- Two-tone headings beat gradient text: `October <span class="muted">2026</span>`.
- Remove gradient text everywhere.

## Pass 3 — Colour

- Neutral base: near-black (`#0A0A0B`–`#111113`) with surfaces 1–2 steps lighter, or off-white (`#FAFAF9`) with white surfaces. Borders as 1 px hairlines (`rgba(255,255,255,0.06–0.10)` on dark, `rgba(0,0,0,0.06–0.10)` on light).
- **One** accent, and it must mean something (primary action, live state, a category). Everything else is grayscale.
- Color as data: when color encodes categories, use the same color in the legend dot, the chart series, and the list item. Never color for decoration.
- Color as light, not fill: if you want atmosphere, use a localized radial glow inside one card tied to its meaning (heart rate → warm red), on a dark surface. Not full-bleed gradients.
- Kill: purple/indigo/violet → pink gradients, rainbow cards, colored glow shadows on everything, glassmorphism on every surface, gradient buttons.
- Status colors (green/red/amber) only on the value that changed, not on whole cards.
- Check contrast: body text ≥ 4.5:1. "Muted" must still be readable. A primary button must never look disabled.
- Shadows: on dark UIs, near zero; separate by surface color and borders. On light UIs, one soft shadow token at most.

## Pass 4 — Symbols (icons, emoji, imagery)

- Remove every emoji from UI chrome and copy: headings, labels, buttons, nav, tabs, badges, toasts. (Keep emoji only if it is user-generated content or the brand is genuinely emoji-based.)
- One icon set (Lucide, Phosphor, Heroicons, Tabler, SF Symbols), one stroke width (1.5 typical), one size per context (16 in nav/labels, 20 in toolbars). Monochrome, inheriting text color.
- Tab bars and dense nav: icons can stand alone if they are standard; otherwise icon + label, consistently.
- Replace emoji/clip-art illustrations with real assets: product screenshots, a rendered object, a photo, or nothing.
- Keyboard hints as real keycaps: `<kbd>⌘</kbd><kbd>K</kbd>`, muted.
- Remove badge spam: "PRO", "New ✨", "AI", colored count pills on every nav item. Counts become muted right-aligned numbers; keep at most one attention badge (e.g. unread).
- One personality element is welcome (mascot, custom illustration, display numerals) — exactly one, placed with intent.

## Pass 5 — Structure and copy

- Establish one focal point per screen. One hero card/metric, the rest subordinate (smaller, quieter).
- Replace greetings with context: "Welcome back, Damir! 👋" → "October 2026"; "Hey Alex! Ready for today's run?" → "Morning run" with a date/time eyebrow.
- Copy: no exclamation marks, no "!!", no 🔥🚀✨, no "AI-powered", "supercharge", "unlock", "seamless", "next-level", "revolutionize". State facts plainly: "+4.2% vs September".
- Data viz must fit the data: sparkline bars for pace over time, a radial gauge for a bounded live value, a progress track for a goal, multi-series lines with a legend for categories over time. Remove decorative sine waves and fake charts. Light axes, few gridlines, labels in muted small text.
- Primary action looks primary and carries state when useful (`▶ Start run · GPS ready`). Secondary actions are quiet (ghost/outline).
- Add structure the content needs (a real empty state, a streak section, a collapse button for a sidebar) and delete structure it does not (duplicate stats, filler chips, "AI-powered" banners).
- Active nav state: subtle surface fill or a small indicator, not a saturated gradient slab.

## Final checklist

- [ ] Zero emoji in UI chrome and copy.
- [ ] No gradient text; gradients only as one intentional, localized effect, if any.
- [ ] Every spacing value on the scale; one radius family.
- [ ] ≤ 6 font sizes, ≤ 3 weights, one UI family (+ optional mono, + optional single display role).
- [ ] One accent color with a stated meaning; categorical colors consistent across legend, chart, and list.
- [ ] One focal point per screen; secondary content visibly quieter.
- [ ] Copy is plain, specific, and free of hype and exclamation marks.
- [ ] One icon set, one stroke width.
- [ ] Contrast passes; primary buttons look enabled.
- [ ] Behavior and data unchanged.
- [ ] Scanner score dropped; before/after screenshots compared (when rendering is possible).

## Avoid over-correcting

The goal is not "make everything dark gray like Linear". Signs you over-corrected: everything is the same gray with no focal point, text is too low-contrast to read, the brand's color disappeared entirely, or you replaced purple glow with a different glow. Keep the brand's identity; express it through one accent, one typographic choice, or one illustration.

## References

- [references/slop-patterns.md](references/slop-patterns.md) — catalog of AI-slop tells, each with the fix.
- [references/case-studies.md](references/case-studies.md) — three before/after breakdowns (mobile fitness app, SaaS dashboard, study app).
- [references/tokens.md](references/tokens.md) — starter token sets (CSS variables and Tailwind) for dark and light.
- `scripts/slop_audit.py` — static scanner for code-level tells; prints a score and findings.
