# The before/after proposal report

Every run ends with one self-contained HTML file the user can open, share, and use to decide whether to keep the changes.

## Steps

1. **Before any edit**
   ```bash
   python scripts/slop_audit.py <src> --json > <out>/before.json
   node scripts/page_check.mjs <url> <out>/before          # run from the project folder
   ```
2. **After the passes**
   ```bash
   python scripts/slop_audit.py <src> --json > <out>/after.json
   node scripts/page_check.mjs <url> <out>/after
   ```
3. **Write `<out>/changes.json`** (schema below).
4. **Build**
   ```bash
   python scripts/make_report.py --before <out>/before --after <out>/after \
     --scan-before <out>/before.json --scan-after <out>/after.json \
     --changes <out>/changes.json --out <out>/unslop-report.html
   ```
   Images are embedded by default. A full-page desktop capture can be several MB; use `--link` to reference the PNGs by relative path instead (then keep the folders next to the report).

Suggested `<out>`: `unslop/` in the project root. Add it to `.gitignore` unless the user wants it committed.

If no browser automation exists, take screenshots with any tool, name them `home-desktop-1440-fold.png`, `home-mobile-390-fold.png`, etc. in `before/` and `after/`, and the report will pair them. With no screenshots at all, the report still renders scores, changes, and the checklist.

## `changes.json`

Write it in the user's language (set `lang`). Be specific: what changed, where, and why. No hype.

```json
{
  "project": "Pulso — landing",
  "lang": "es",
  "date": "2026-10-30",
  "url": "http://localhost:5199",
  "summary": "La landing deja de parecer plantilla: carbón neutro, lima solo para acción y estado, menú móvil y página 404.",
  "direction": "Carbón neutro; lima solo para CTA y estados; la personalidad la pone el llavero del hero.",
  "passes": [
    { "name": "1 · Spacing", "changes": [
      { "what": "Padding, margin y gap a múltiplos de 4", "files": ["src/index.css"] } ] },
    { "name": "7 · Listo para publicar", "changes": [
      { "what": "Menú móvil con botón accesible", "files": ["src/App.tsx", "src/index.css"] } ] }
  ],
  "graphic": {
    "decision": "keep",
    "type": "object render (existing)",
    "reason": "El llavero y el teléfono del hero ya son el material gráfico; una mascota cambiaría la marca.",
    "scores": { "audience": 1, "metaphor": 2, "anchor": 2, "state": 1, "brand": 1, "execution": 2 }
  },
  "ship": [
    { "item": "Horizontal overflow", "status": "ok", "note": "Sin overflow en 360/390/768/1440" },
    { "item": "Mobile menu", "status": "fixed", "note": "Botón con aria-expanded, cierra con Escape" },
    { "item": "Page title", "status": "ok", "note": "" },
    { "item": "Meta description", "status": "ok", "note": "" },
    { "item": "Favicon", "status": "ok", "note": "Falta apple-touch-icon" },
    { "item": "Clickable email", "status": "ok", "note": "" },
    { "item": "Broken links", "status": "open", "note": "'Términos' apunta a #preguntas" },
    { "item": "Placeholder text", "status": "ok", "note": "" },
    { "item": "Empty states", "status": "not-applicable", "note": "Landing estática" },
    { "item": "Error messages", "status": "not-applicable", "note": "El contacto es mailto:" },
    { "item": "404 page", "status": "added", "note": "404.html con el estilo del sitio" },
    { "item": "Tested on mobile", "status": "proposed", "note": "Revisar en un teléfono real" }
  ],
  "proposals": ["Migrar el acento a azul cuando se decida la marca"],
  "untouched": ["Logo y lockup (MARCA.md)", "Panel en /panel"],
  "revert": "Copia del código original en <ruta>. Para revertir, reemplaza src/ e index.html con esa copia."
}
```

Field notes:

- `status` values: `fixed`, `added`, `ok` (was already fine), `proposed`, `open` (could not fix; say why), `not-applicable`.
- `graphic.decision`: `add`, `keep` (an existing graphic already does the job), `propose`, or `skip`. `scores` are the six fit-test questions (0–2 each).
- `revert` must always be present: the branch name, or where the backup is and how to restore it.

## The reply to the user

Lead with the outcome and the score change, link the report, list the 3–5 most visible changes, say what was not changed and why, and ask whether to keep or revert. Keep the rest in the report.
