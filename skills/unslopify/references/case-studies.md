# Case studies

Three public before/after redesigns of AI-generated UIs. Use them to calibrate how far to push.

## 1. Mobile running app

**Before:** purple→blue gradient screen. "Hey Alex! 👋 / Ready for today's run?". Distance card in a violet gradient with "5.24 km" and a decorative sine wave. Pace card orange gradient, heart-rate card pink gradient, weekly-goal card cyan gradient with a yellow bar. Pink→violet gradient button "Start Run 🚀". Emoji tab bar with labels.

**After:**
- Near-black screen. Cards are black surfaces; each has a localized glow tied to its meaning (distance → magenta, pace → blue, heart rate → red/orange).
- Header: mono eyebrow `WED, 28 OCT · 7:12`, title "Morning run". Avatar kept.
- Hero metric "5.24" in a dot-matrix display face, centred; caption "kilometres · +12% vs last week" small and muted.
- Pace: `5′12 /km` with a tiny bar sparkline. Heart rate: `148 bpm` inside a radial tick gauge. Weekly goal: `32 / 40 km` with a dotted track and a slider knob.
- CTA row: white circular ▶ button, "Start run", status `• GPS READY` in mono.
- Tab bar: line icons only, inside a rounded capsule.

**Lesson:** colour moved from fill to light; each metric got the visualization that fits it; one hero; real context instead of a greeting.

## 2. SaaS dashboard ("EmberAI" → "Ember")

**Before:** violet everywhere. Logo with sparkles + "PRO" badge. Gradient heading "Welcome back, Damir! 👋". Emoji before every nav item. Active item in a saturated gradient slab. Count pills in many colours ("12", "New ✨", "18", "64", "210", "480", "1.2k"). Stat labels like "💰 PAID THIS MONTH", deltas "+12%!!" and "+4.2% this month!!". Emoji credit card. Purple pill bar chart. Spacing measured at 15, 22, 37, 42, 28, 38 px.

**After:**
- Neutral dark greys, 1 px hairline borders, no coloured shadows.
- Logo: simple monochrome glyph + "Ember". Sidebar collapse icon.
- Heading "October 2026" with the year muted.
- Search: "Search" + `⌘` `K` keycaps.
- Nav: consistent line icons, muted counts right-aligned, chevrons for expandable groups, subtle grey active state. Section labels "Navigation", "Plans" in small muted sentence case.
- Plans list: small coloured dots that match the chart series.
- Stat cards: "Paid this month" / `$48,210` / `+12% vs last month` (mono, green only on the number). Rendered dark card image instead of emoji.
- Revenue: multi-series smooth line chart with a light y-axis and the same category colours.
- Spacing normalized to a scale.

**Lesson:** delete before adding. Most of the improvement is removal (emoji, badges, gradients, exclamation marks) plus a spacing scale.

## 3. Mobile study app

**Before:** pale greys and lavender (or navy with pastel cards). "Good evening 👋", "Exam in 91 days ✨", a lesson card "Cells and Energy" with a greyed-out "Start 🚀" button that looks disabled, floating chips "0 XP today" and "1 drill left", "✨ AI-powered study plan", "📚 Quests" card with "Keep every heart ❤️".

**After** (the designer documented the passes in a side panel):
- Spacing tokens: gap 24, gutter 20, padding 22, filler 20, width 107, radius 28.
- Type tokens: Plus Jakarta Sans; title 28, heading 36, body 18.
- Colour tokens: canvas (near-black navy), shadow 0%, button (black), quests (yellow).
- Symbols: custom tab icons (a flame for "Today"), action icons, chip, and a mascot.
- Graphic material, added at the end, after the cleanup:
  - **Mascot**: an orange, cat-like character with a sleepy, unimpressed face, cropped so it peeks over the top-right edge of the white lesson card. Its mood fits the state (evening, 0-day streak).
  - **Flame band**: a new "Streaks" block whose "0d current / 0d best" numbers sit on a horizontal blowtorch-like gradient (orange → magenta → violet). It echoes the flame tab icon, so the metaphor becomes part of the product's language.
- Structure: added the "Streaks" section; tab bar made glass and floating.
- Lesson card: white surface, bold title, "3 drills · 1 min", solid black "▶ Start" pill.
- Quests: saturated yellow card — the single accent — with clear XP chips.
- All emoji removed from copy; "AI-powered" line removed.

**Lesson:** work in explicit passes (spacing → type → colour → symbols → graphic material → structure). Remove first, then add graphics that come from the product's own concepts (studying with a companion, a streak as fire), each anchored to one component and able to show state. One saturated accent with a job.
