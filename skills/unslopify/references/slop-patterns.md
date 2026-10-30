# AI-slop tells and their fixes

Each row: what you see → why it reads as AI-generated → what to do instead.

## Colour and effects

| Tell | Why it reads as slop | Fix |
|---|---|---|
| Full-screen purple/indigo/violet gradient background | Default "AI aesthetic"; signals no design decision | Neutral base (near-black or off-white). Atmosphere, if any, as one localized glow |
| Each card a different saturated gradient | Colour carries no meaning; everything competes | Same surface for all cards; colour only on the data or as meaning-tied light |
| Gradient text in headings | Overused, hurts legibility | Solid text; two-tone heading (primary + muted) |
| Coloured glow shadows (`shadow-purple-500/50`) | Neon effect without purpose | No shadow on dark; one soft neutral shadow token on light |
| Glassmorphism / backdrop-blur everywhere | Visual noise, poor contrast | At most one glass element (e.g. floating tab bar) |
| Gradient CTA buttons | Loud and cheap-looking | Solid high-contrast button (white on dark, black on light, or the single accent) |
| Saturated active nav item | Heaviest element on screen is navigation | Subtle surface fill or thin indicator |
| Pastel washed-out buttons | Look disabled | Solid button with clear contrast |
| Green/red applied to whole cards | Alarmist, colour as decoration | Colour only the changed value |

## Symbols

| Tell | Why it reads as slop | Fix |
|---|---|---|
| Emoji as icons (🏠 📊 🏆 👤 💰 📥) | Inconsistent rendering, childish, no stroke system | One icon set, one stroke width, monochrome |
| Emoji in copy (👋 ✨ 🚀 🔥 ❤️ 📚) | Hype filler | Delete |
| ✨ sparkle next to anything "AI" | The universal AI cliché | Delete; describe the feature plainly or not at all |
| Badges everywhere ("PRO", "New ✨", "Beta") | Attention dilution | Max one meaningful badge per screen |
| Coloured count pills on every nav item | Rainbow sidebar | Muted right-aligned numbers |
| Emoji/clip-art illustration (💳) | Placeholder quality | Real render, screenshot, photo, or nothing |
| `⌘K` inside a coloured pill | Decorative | Muted `<kbd>` keycaps |

## Typography

| Tell | Why it reads as slop | Fix |
|---|---|---|
| UPPERCASE + letter-spacing + emoji labels | Shouting metadata | Sentence-case small muted labels |
| Everything bold | No hierarchy | Mostly 400/500; size and colour create hierarchy |
| Many font sizes (10+) | No scale | ≤ 6 sizes from a defined scale |
| Big numbers in the same font as body | Missed opportunity for a focal point | Display or tight-tracked hero numerals, tabular figures |
| Units same size as values ("5.24 km") | Flat | Demote units: smaller, muted ("5.24" + "kilometres") |

## Spacing and layout

| Tell | Why it reads as slop | Fix |
|---|---|---|
| Arbitrary values (15, 22, 37, 42 px) | No system | 4 px scale, few spacing roles reused |
| Mixed radii (6, 10, 14, 20, 32 on one screen) | No system | One radius family; nested = outer − padding |
| Everything in a card, cards in cards | Boxy, heavy | Remove unnecessary containers; use whitespace and hairlines |
| All cards same visual weight | No focal point | One hero element per screen |
| Dense chips floating between sections ("0 XP today", "1 drill left") | Filler | Integrate into a real section or delete |

## Copy

| Tell | Fix |
|---|---|
| "Welcome back, Name! 👋", "Hey Name!", "Ready for today's X?" | Context title: date, activity, period ("Morning run", "October 2026") |
| "!!", "!" on stats ("+12%!!") | "+12% vs last month" |
| "AI-powered", "Supercharge", "Unlock", "Seamless", "Next-level", "Revolutionize", "Elevate" | Plain, specific statement of what it does |
| "Search anything…" | "Search" |
| Product name + "AI" + "PRO" | Product name only |

## Data visualisation

| Tell | Fix |
|---|---|
| Decorative sine wave under a number | Real sparkline of the actual series, or remove |
| Pill bar chart with one random highlighted bar | Highlight only what matters (today, max) with reason; neutral others |
| Rainbow series with no legend link | Category colours shared by legend dots, list items, and series |
| Heavy gridlines and axes | Few light gridlines, muted small tick labels |
| Same chart type for every metric | Pick per data shape: trend → line/bars, bounded live value → radial, goal → progress track |
