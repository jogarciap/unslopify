# Ship-readiness (pass 7)

What makes a page look unfinished once it is live, how to detect it, and how to fix it per framework.

## Tools

- `python scripts/slop_audit.py <src>`: static. Its "Ship-readiness" section reports missing title/description/favicon/viewport, default titles, dead links, plain-text emails and phones, placeholder text, overflow risks, a nav without a mobile toggle, and a missing 404 page.
- `node scripts/page_check.mjs <url> <outdir>`: runtime. Loads the page at 360, 390, 768, and 1440 px wide and reports horizontal overflow (with the widest offending elements), title, description, favicon, viewport, in-page anchors that point nowhere, same-origin links that return ≥ 400, small tap targets on mobile, and console errors. Saves full-page and first-screen screenshots per viewport into `<outdir>`.
  - Needs Playwright. It looks for it in the current project first, then globally. If missing: `npm i -D playwright && npx playwright install chromium` (ask before installing in the user's project), or run it from any folder that has Playwright.
  - Works with `http://localhost:…` dev servers and `file:///…/index.html`.
  - Add `--paths /,/pricing,/about` to check several routes, and `--no-shots` to skip screenshots.

## Mobile

### Horizontal overflow / horizontal scroll

Detection: `document.documentElement.scrollWidth > window.innerWidth` at any viewport. `page_check.mjs` lists the elements whose right edge passes the viewport.

Common causes and fixes:

| Cause | Fix |
|---|---|
| Fixed width (`width: 1200px`, `w-[1200px]`, `min-width: 600px`) | `max-width` + `width: 100%`, or a media query |
| `100vw` on a block (includes the scrollbar) | `100%` or `100dvw` only on fixed overlays |
| Absolutely positioned art with negative offsets | Contain it: `overflow: clip` on the art's own wrapper, not on `body` |
| Long unbroken strings (URLs, emails, IDs) | `overflow-wrap: anywhere` |
| Wide tables | Wrap in a container with `overflow-x: auto` |
| Flex children that won't shrink | `min-width: 0` on the child |
| Grids with fixed columns | `grid-template-columns: repeat(auto-fit, minmax(min(260px, 100%), 1fr))` |
| Images/video | `max-width: 100%; height: auto` |

`overflow-x: hidden` on `html`/`body` hides the symptom and breaks `position: sticky`; use it only when the cause is decorative and you have also contained it.

### Mobile menu

Needed when nav links are hidden under a breakpoint, or when they wrap badly at 360 px.

Requirements: a `<button>` with `aria-expanded`, `aria-controls`, and an accessible label; the panel is reachable by keyboard; it closes on link click, on Escape, and when resizing to desktop; body scroll is locked only while a full-screen panel is open; ≥ 44 px tap targets; same tokens as the rest of the UI.

React:

```tsx
const [open, setOpen] = useState(false);
useEffect(() => {
  const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
  window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
}, []);

<button className="menu-toggle" aria-expanded={open} aria-controls="mobile-nav"
        aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)}>
  <MenuIcon open={open} />
</button>
<nav id="mobile-nav" className="mobile-nav" data-open={open} hidden={!open}>
  {links.map((l) => <a key={l.href} href={l.href} onClick={() => setOpen(false)}>{l.label}</a>)}
</nav>
```

```css
.menu-toggle { display: none; width: 44px; height: 44px; }
@media (max-width: 860px) {
  .menu-toggle { display: inline-grid; place-items: center; }
}
.mobile-nav { position: fixed; inset: 64px 0 auto; padding: 16px 20px 24px;
  background: var(--bg); border-bottom: 1px solid var(--line); display: grid; gap: 4px; }
.mobile-nav a { padding: 12px 0; font-size: 18px; }
```

Plain HTML: same markup with a small script toggling `hidden` and `aria-expanded`. Use the label language of the site (e.g. "Abrir menú" in Spanish).

### Optimize and test on mobile

- `<meta name="viewport" content="width=device-width, initial-scale=1">`.
- Tap targets ≥ 44×44 px (links in footers and nav are the usual offenders).
- Body text ≥ 16 px; inputs ≥ 16 px (iOS zooms below that).
- Stack multi-column layouts; keep the primary CTA visible in the first screen.
- Use `min-height: 100dvh` instead of `100vh` for full-screen sections.
- No hover-only reveals; give touch an equivalent.
- Respect safe areas on fixed bars: `padding-bottom: env(safe-area-inset-bottom)`.
- Review the mobile screenshots from `page_check.mjs` yourself, then ask the user to open the page on a real phone (for a local dev server: `vite --host` or `next dev -H 0.0.0.0` and the machine's LAN IP).

## Metadata

### Page title

`Specific page — Brand`, ≤ 60 characters, unique per route. Replace defaults: "Vite + React", "Vite + React + TS", "Create Next App", "React App", "Document", "Untitled", "Home".

| Stack | Where |
|---|---|
| Plain HTML / Vite | `<title>` in `index.html` (and each extra `.html`) |
| Next.js app router | `export const metadata = { title: { default: "Brand", template: "%s — Brand" } }` in `app/layout.tsx`; `metadata.title` per page |
| Next.js pages router | `<Head><title>…</title></Head>` |
| Astro | `<title>` in the layout, passed as a prop |
| SPA with routes | update `document.title` per route (or `react-helmet-async`) |

### Meta description

120–160 characters, from the page's real content, plain language, no hype. One per route. Same places as the title (`metadata.description` in Next.js).

### Favicon and app icons

- `<link rel="icon" href="/favicon.svg" type="image/svg+xml">` built from the existing logo/isotype (single colour, legible at 16 px).
- `<link rel="apple-touch-icon" href="/apple-touch-icon.png">` 180×180 with a solid background.
- `<meta name="theme-color" content="#…">` matching the page background.
- Next.js app router: `app/icon.svg` and `app/apple-icon.png` are picked up automatically.
- Remove framework defaults (`vite.svg`, the Next.js logo, `react.svg`).
- If there is no logo, propose a simple monogram in the brand accent and list it in the report as a proposal.

### Social preview

`og:title`, `og:description`, `og:image` (1200×630), `twitter:card=summary_large_image`. If there is no image, list it as a proposal; do not use a random stock image.

## Links and content

### Clickable email and phone

- Email: `<a href="mailto:hola@brand.com">hola@brand.com</a>`.
- Phone: `<a href="tel:+56912345678">+56 9 1234 5678</a>` (digits and `+` only in the `href`).
- Addresses can link to a maps search: `https://maps.google.com/?q=<encoded address>`.

### Broken links

- `href="#"`, `href=""`, and `javascript:void(0)` on visible links: point them to a real target, turn them into buttons if they trigger an action, or turn them into plain text if there is nowhere to go yet (and list them in the report).
- In-page anchors (`#section`) must match an existing `id`.
- Internal routes must resolve (`page_check.mjs` requests same-origin links).
- Links whose label promises something the target doesn't deliver (e.g. "Terms" pointing to the FAQ) count as broken: report them.
- External links that fail: report, don't guess replacements. Add `rel="noopener"` to `target="_blank"` links.

### Placeholder text

Search for and replace with real content from the project (README, docs, existing pages, brand files): lorem ipsum, "John Doe"/"Jane Doe", "Your Company", "Company Name", "Acme", "Feature 1/2/3", "Item 1", "123 Main St", "(555)", `example.com`, `placeholder.com`, `via.placeholder`, "Coming soon" sections with nothing behind them, "TODO", "FIXME", "Insert … here", "[Your …]". Image placeholders count too (grey boxes, `picsum.photos`, `unsplash.it`).

If no real content exists, remove the element or list the gap in the report. Never invent testimonials, clients, numbers, or contact details.

## States

### Empty state

For each list, table, feed, inbox, search result, cart, or dashboard widget that can be empty:

- One line that says what will appear here ("No members yet").
- One line on how to get there, plus the primary action ("Add your first member").
- Optional: the pass-5 graphic in a quiet mood, or a muted icon. No big illustrations of random people.
- Search with no results: repeat the query, suggest clearing filters.

Implement it where the data is rendered (`items.length === 0 ? <EmptyState …/> : <List …/>`). In static landing pages that show mock data, the empty state is not required; mention it only if the product has such screens.

### Error messages

- Forms: validate on blur/submit; message under the field, linked with `aria-describedby`; say what is wrong and how to fix it ("Enter an email like name@gym.cl"); keep the user's input; focus the first invalid field.
- Network/submit failures: a visible message near the action with a retry, inside an `aria-live="polite"` region.
- Tone: plain, specific, no blame, no codes unless useful ("We couldn't send your request. Check your connection and try again.").
- Colour is not the only signal: add an icon or text prefix.
- Landing pages whose contact is a `mailto:` link don't need form errors; mention only what exists.

### 404 page

Content: a short statement that the page doesn't exist, one sentence of help, a primary link home, and 2–4 main destinations; same header, footer, and tokens; a pass-5 graphic is welcome if one exists. Title "Page not found — Brand"; `noindex` is not needed if the server returns a real 404 status.

| Stack | How |
|---|---|
| Plain static site | `404.html` at the root (Netlify, Vercel, GitHub Pages, Cloudflare Pages serve it automatically) |
| Vite multi-page | add `404.html` to the root (or `public/`) and to `build.rollupOptions.input` if it uses the app bundle |
| Vite + React Router | catch-all route `{ path: "*", element: <NotFound/> }`; for static hosting also add `404.html` or a rewrite |
| Next.js app router | `app/not-found.tsx` |
| Next.js pages router | `pages/404.tsx` |
| Astro | `src/pages/404.astro` |
| SvelteKit | `src/routes/+error.svelte` |
| Nuxt | `error.vue` |
