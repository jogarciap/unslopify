# Starter tokens

Starting points, not a brand. Swap `--accent` for the product's colour and give it one job.

## CSS custom properties

```css
:root {
  /* spacing: 4px base */
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px; --space-4: 16px;
  --space-5: 20px; --space-6: 24px; --space-8: 32px; --space-10: 40px;
  --space-12: 48px; --space-16: 64px; --space-20: 80px;

  /* radius */
  --radius-sm: 8px;   /* inputs, small buttons */
  --radius-md: 12px;  /* cards (web) */
  --radius-lg: 20px;  /* large cards (mobile) */
  --radius-full: 999px;

  /* type */
  --font-sans: "Geist", "Inter Tight", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "Geist Mono", "JetBrains Mono", ui-monospace, monospace;
  --text-xs: 12px; --text-sm: 14px; --text-md: 16px;
  --text-lg: 20px; --text-xl: 28px; --text-display: 44px;
  --leading-tight: 1.15; --leading-body: 1.5;
  --tracking-tight: -0.02em;

  /* light theme */
  --bg: #FAFAF9;
  --surface: #FFFFFF;
  --surface-2: #F4F4F3;
  --border: rgba(0, 0, 0, 0.08);
  --text: #111113;
  --text-2: #5C5C63;
  --text-3: #8E8E96;
  --accent: #E5484D;        /* one job: primary action / live state */
  --positive: #2F9E6B;
  --negative: #D93F3F;
  --shadow: 0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04);
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #0A0A0B;
    --surface: #131315;
    --surface-2: #1A1A1D;
    --border: rgba(255, 255, 255, 0.08);
    --text: #EDEDEF;
    --text-2: #A1A1A8;
    --text-3: #6E6E76;
    --positive: #4CC38A;
    --negative: #F2555A;
    --shadow: none;
  }
}

body { background: var(--bg); color: var(--text); font-family: var(--font-sans); }
.num { font-variant-numeric: tabular-nums; letter-spacing: var(--tracking-tight); }
.label { font-size: var(--text-sm); color: var(--text-2); }
.meta { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--text-3); }
.card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: var(--space-5); box-shadow: var(--shadow); }
kbd { font-family: var(--font-mono); font-size: 11px; padding: 2px 6px; border: 1px solid var(--border); border-radius: 6px; color: var(--text-3); }

/* meaning-tied glow, one card only */
.card--live { background:
  radial-gradient(120% 80% at 80% 110%, color-mix(in oklab, var(--accent) 35%, transparent), transparent 60%),
  var(--surface); }
```

## Tailwind (v3 `theme.extend` or v4 `@theme`)

```js
// tailwind.config.js (v3)
export default {
  theme: {
    extend: {
      fontFamily: { sans: ['Geist', 'Inter Tight', 'system-ui'], mono: ['Geist Mono', 'monospace'] },
      fontSize: { xs: '12px', sm: '14px', base: '16px', lg: '20px', xl: '28px', display: '44px' },
      borderRadius: { sm: '8px', md: '12px', lg: '20px' },
      colors: {
        bg: 'var(--bg)', surface: 'var(--surface)', 'surface-2': 'var(--surface-2)',
        line: 'var(--border)', fg: 'var(--text)', 'fg-2': 'var(--text-2)', 'fg-3': 'var(--text-3)',
        accent: 'var(--accent)',
      },
    },
  },
}
```

Rules when using Tailwind:
- Use only scale spacing utilities (`p-4`, `gap-3`, `mt-8`); no `p-[37px]`.
- Remove `bg-gradient-to-*`, `from-*`, `via-*`, `to-*`, `bg-clip-text`, `text-transparent`, `shadow-{color}-*`, and broad `backdrop-blur` unless there is one deliberate use.
- Replace `purple-*`/`violet-*`/`indigo-*`/`fuchsia-*` with neutral tokens plus `accent`.
- Replace `uppercase tracking-wider` labels with `text-sm text-fg-2`.
