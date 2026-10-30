# Graphic material: when to add it and how

Slop *decorates*: sparkles, emoji, floating blobs, gradients everywhere. Designed UIs *illustrate*: one graphic that comes from what the product is about, placed where it carries meaning.

Reference moment: in a public study-app redesign, after the cleanup passes the designer added (1) an orange cat-like mascot with a sleepy face peeking over the top edge of the lesson card, and (2) a new "Streaks" block whose numbers sit on a horizontal flame-like gradient band (orange → magenta → violet), echoing the flame icon of the "Today" tab. Both come from the product (a gamified study habit app), both sit on one component, and both can reflect state.

## 1. Fit test

Score each question 0–2. Write the scores in your report.

| Question | 0 | 1 | 2 |
|---|---|---|---|
| **Audience and tone.** Does the product invite warmth or play? | Enterprise, finance, legal, clinical, dev tools | Prosumer, B2B for small businesses, fitness | Consumer, habits, learning, kids, games, community |
| **Metaphor.** Is there a concept that already evokes an image? | None obvious | Generic (growth, speed) | Specific and already hinted in the UI (streak → flame icon, NFC → keytag) |
| **Anchor.** Is there a natural place for it? | Only decorative empty space | A hero or section header | A focal component, empty state, success or onboarding moment |
| **State.** Can it show information? | Purely decorative | Static but meaningful | Changes with data (mood, intensity, progress, real values) |
| **Brand.** Do the brand rules allow it? | Rules forbid it or brand is strictly corporate | No rules; neutral brand | Brand already has illustration, a character, or a physical object |
| **Execution.** Can you build it at the quality of the rest of the UI? | Only with clip-art or emoji | Simple SVG/CSS that is acceptable | Clean SVG/CSS, or the project already has assets |

- **9–12 → add.** Build it.
- **5–8 → add the restrained version** (object render, data-as-graphic, atmosphere) and **propose** the bolder one (a character).
- **0–4 → skip**, or **propose only** if one question scores 2.
- Execution scored 0 → never ship it; write a brief instead.
- Brand scored 0 → never add a character or new illustration style; data-as-graphic is still allowed.

## 2. Types

| Type | What it is | Fits | Example |
|---|---|---|---|
| **Character / mascot** | A simple figure with a face that reacts | Consumer, learning, habits, kids, community | Sleepy cat peeking over a lesson card |
| **Metaphor illustration** | A shape that stands for a concept | Any product with a strong concept | Flame band behind streak days; route line for delivery |
| **Object / product render** | The real physical or digital thing, rendered | Hardware, payments, physical products | Dark credit cards on a payments dashboard; an NFC keytag |
| **Data-as-graphic** | The data itself drawn with character | Dashboards, fitness, finance | Dot-matrix numerals; radial tick gauge; glowing progress |
| **Atmosphere** | Localized light or texture tied to meaning | Dark UIs needing depth | Warm glow inside the heart-rate card only |
| **Spot illustration** | Small scene for a moment | Empty, error, success, onboarding states | "No sessions yet" with the mascot asleep |

Prefer the lowest type that does the job. A finance dashboard gets a card render, not a mascot.

## 3. Placement

- **One graphic moment per screen.** Repeat a character across screens, not within one.
- **Anchor to a component.** Overlap a card's top edge by 20–40% of the graphic's height, bleed behind a number, or fill an empty state. Avoid graphics floating in margins.
- **Hierarchy.** The graphic supports the focal point; it does not compete with the primary action. Keep it smaller than the main heading's visual weight, unless it *is* the hero.
- **Echo the system.** Reuse it in one icon (flame tab icon ↔ flame band), in empty states, and in notifications so it becomes language, not decoration.

## 4. Building it

### Character / mascot (inline SVG)

- Build from 4–8 simple shapes: rounded body, two ears or a distinctive silhouette, large eyes, tiny mouth. No outlines, or one outline weight matching the icon stroke.
- 2–3 flat colours from the tokens (body = accent or a warm secondary; shadow = darker step; eyes = ink).
- The face carries emotion. Expose a `mood` prop and change only eyelids, pupils, and mouth:
  - `sleepy` — empty or zero state (0-day streak, nothing started)
  - `neutral` — in progress
  - `happy` — goal met, session completed
- Crop it: peeking from behind a card edge reads as alive and saves space.
- `aria-hidden="true"`; any meaning it shows must also exist as text.

```tsx
type Mood = "sleepy" | "neutral" | "happy";
export function Mascot({ mood = "neutral", size = 72 }: { mood?: Mood; size?: number }) {
  const lid = mood === "sleepy" ? 5 : 0;           // eyelid drop in px
  const mouth = mood === "happy" ? "M30 46q6 5 12 0" : "M32 46h8";
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" aria-hidden="true">
      <path d="M14 30 L18 8 L30 22 H42 L54 8 L58 30 Q60 62 36 62 Q12 62 14 30Z" fill="var(--mascot, #F28C28)" />
      <ellipse cx="36" cy="50" rx="10" ry="7" fill="var(--mascot-light, #F6B26B)" />
      {[27, 45].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="36" r="6" fill="#fff" />
          <circle cx={cx} cy={37 + lid / 2} r="3" fill="var(--ink, #111)" />
          {lid > 0 && <rect x={cx - 6} y="30" width="12" height={lid + 1} fill="var(--mascot, #F28C28)" />}
        </g>
      ))}
      <path d={mouth} stroke="var(--ink, #111)" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}
```

Placement over a card:

```css
.lesson-card { position: relative; overflow: visible; }
.lesson-card .mascot { position: absolute; right: 16px; top: -28px; }
```

### Metaphor band (flame for streaks)

A horizontal gradient band from the accent family, tied to the value.

```css
.streak {
  --heat: 0;                          /* 0..1, set from streak length */
  position: relative;
  padding: 24px 20px;
  border-radius: 20px;
  isolation: isolate;
}
.streak::before {
  content: "";
  position: absolute; inset: 30% -10% 10% -10%;
  z-index: -1;
  background: linear-gradient(90deg, #FF7A1A, #E0328F 45%, #7B3CF0 80%, transparent);
  filter: blur(18px);
  opacity: calc(0.25 + var(--heat) * 0.75);   /* dim at 0 days, full when hot */
  transform: scaleY(calc(0.6 + var(--heat) * 0.4));
}
@media (prefers-reduced-motion: no-preference) {
  .streak[data-active]::before { animation: flicker 2.4s ease-in-out infinite; }
}
@keyframes flicker { 50% { transform: scaleY(1.05) translateX(2%); } }
```

```tsx
<div className="streak" style={{ "--heat": Math.min(days / 30, 1) } as React.CSSProperties} data-active={days > 0 || undefined}>
```

This is the one place a vivid gradient is allowed: it is localized, it means something, and it reacts to data.

### Object render

Use CSS layers (base gradient for material, a specular highlight strip, inner shadow, soft drop shadow) or a real photo/3D render if the project has one. Show real details (last 4 digits, ID, brand mark) and keep it at a slight angle so it reads as an object.

## 5. Anti-patterns

- Emoji or emoji-like clip-art as illustration.
- Generic 3D glossy blobs, isometric stock people, abstract floating shapes, sparkles.
- AI-generated images with artefacts, fake text, or a style that clashes with the UI.
- A mascot on an enterprise or finance dashboard.
- Graphics on every card, or the same graphic repeated on one screen.
- A graphic that contradicts brand rules (recoloured logo, the logo used as an ornament).
- Animation that loops forever without meaning or ignores reduced-motion settings.

## 6. Decision examples

| Product | Decision | Why |
|---|---|---|
| Study / habit app | **Add** mascot on the lesson card + flame band on streaks | Consumer, playful, strong metaphor (streak = fire) already in the tab icon, both carry state |
| SaaS billing dashboard | **Add** object render (payment cards); **skip** mascot | B2B finance tone; cards are the product's real object |
| Running app | **Add** data-as-graphic (dot-matrix hero number, radial heart gauge) + localized glow | Sporty consumer tone, but the data is the hero |
| B2B landing for small gyms with a physical NFC keytag | **Keep** the object render (keytag + kiosk phone); **propose only** a character | The object already is the graphic; a mascot would change the brand |
| Legal / healthcare portal | **Skip** | Trust and clarity outrank personality; use typography and calm colour |
