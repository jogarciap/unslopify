# Motion and interaction (pass 7)

Generated UIs either have no motion at all or the same default everywhere: `transition: all 0.3s ease`, every section fading up on scroll, and hover effects that stick on phones. Senior motion is short, specific, and rare.

## Tokens

Define motion once, next to the other tokens:

```css
:root {
  --ease-out: cubic-bezier(.2, .8, .2, 1);   /* entering, responding */
  --ease-in: cubic-bezier(.4, 0, 1, 1);      /* leaving */
  --ease-in-out: cubic-bezier(.65, 0, .35, 1); /* moving on screen */
  --dur-1: 120ms;  /* hover, press */
  --dur-2: 200ms;  /* small enter/exit, tooltips, toasts */
  --dur-3: 320ms;  /* drawers, sheets, modals */
}
@media (prefers-reduced-motion: reduce) {
  :root { --dur-1: 0ms; --dur-2: 0ms; --dur-3: 0ms; }
}
```

```js
// Tailwind: theme.extend.transitionTimingFunction / transitionDuration with the same values
```

## Rules

| Situation | Do | Avoid |
|---|---|---|
| Hover / press on a button | `background-color var(--dur-1)`, `:active { transform: scale(.98) }` | `transition: all`, bounce, glow pulse |
| Element appears (toast, menu, tooltip) | `opacity` + `translateY(4px)` → 0, `--dur-2`, ease-out | Scaling from 0, fading for 600 ms |
| Element leaves | Same properties, ease-in, slightly shorter | Same duration and curve as entering |
| Drawer / sheet / modal | `transform: translateX/Y`, `--dur-3`, ease-out; backdrop fades | Animating `width`, `height`, `top`, `left` |
| List reorder / expand | `grid-template-rows: 0fr → 1fr`, or FLIP with transforms | Animating `height: auto` with JS timers |
| Number changes | Cross-fade or roll the digits; keep `tabular-nums` | Counting up from 0 on every page load |
| Scroll | One scroll-linked moment at most (hero reveal, product turn) | Fading in every section; parallax on body text |

- Animate `transform` and `opacity`. Colour, border, and shadow may change quickly (≤ 150 ms). Never animate layout properties in loops.
- Interruptible: a second click must not wait for the first animation to finish. CSS transitions handle this; with JS, cancel the running animation.
- Stagger lists by 20–40 ms per item, capped at about 6 items.
- Loading: skeletons for content that has a known shape, a spinner only for short actions inside buttons. Show nothing for the first 300 ms of a wait.

## Touch devices

```css
@media (hover: hover) and (pointer: fine) {
  .card:hover { transform: translateY(-2px); }
}
.button:active { transform: scale(.98); }
```

Hover effects outside that query stay "stuck" after a tap on iOS and Android.

## Libraries: when they earn a place

Use them only when the page's subject calls for a rich scroll or entrance experience (a product launch, a studio portfolio, an editorial story). Stores, dashboards, documentation, forms, and tools do not need them.

- **GSAP** (`gsap`, with `ScrollTrigger`): timelines and scroll-linked sequences. Use one timeline for the signature moment; clean up with `gsap.context()` in React; check `prefers-reduced-motion` with `gsap.matchMedia()`.
- **Lenis** (`lenis`): smooth scroll. Use it only on long scroll-told pages. Never on apps with inner scroll areas, forms, or maps, and turn it off for reduced motion. Make sure anchor links and `position: sticky` still work.
- **React Bits** and **21st.dev**: collections of animated components (split text, magnetic buttons, backgrounds, cards). Take one component, then restyle it to the tokens: palette, radius, type, and durations. A pasted component with its demo colours is a new slop tell.
- **Motion** (`motion`, formerly Framer Motion) in React apps: layout animations, shared elements, and gestures. Prefer it to GSAP for UI state transitions.

Ask before adding a dependency. Record in `changes.json` which library was added, for which moment, and its size cost.

## Motion slop to remove

- `transition: all` on many selectors.
- Every section fading or sliding up on scroll (AOS, `whileInView` everywhere).
- Infinite pulses, glows, or floating blobs behind the hero.
- Animated gradients on text or buttons.
- Marquees of logos or claims moving at the same speed in both directions.
- Particle, aurora, or "beam" backgrounds that come from a component library and have nothing to do with the product.
- Hover effects on touch devices, and animations that ignore `prefers-reduced-motion`.
