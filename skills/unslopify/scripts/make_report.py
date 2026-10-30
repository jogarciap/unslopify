#!/usr/bin/env python3
"""Build the self-contained before/after proposal report.

Usage:
  python make_report.py --after DIR --changes changes.json --out report.html
                        [--before DIR] [--scan-before before.json] [--scan-after after.json]
                        [--link]   (reference images by relative path instead of embedding)

Screenshots are paired by file name between --before and --after (page_check.mjs
names them <page>-<viewport>-fold.png / -full.png). page_check.json in each folder
is read for overflow and metadata results. Standard library only.
"""
import argparse
import base64
import html
import json
import os
import re
import sys

ORDER = ["desktop-1440-fold", "mobile-390-fold", "desktop-1440-full", "mobile-390-full",
         "tablet-768-fold", "mobile-360-fold", "tablet-768-full", "mobile-360-full"]
STATUS = {
    "fixed": ("Fixed", "ok"), "ok": ("Already fine", "ok"), "added": ("Added", "ok"),
    "proposed": ("Proposed", "warn"), "open": ("Open", "bad"),
    "not-applicable": ("Not needed", "muted"), "n/a": ("Not needed", "muted"),
}
GRAPHIC = {"add": "Added", "keep": "Kept existing", "propose": "Proposed only", "propose only": "Proposed only", "skip": "Skipped"}

I18N = {
    "es": {
        "Before": "Antes", "After": "Después", "before / after": "antes / después", "Direction": "Dirección",
        "Slop score": "Puntaje slop", "lower is better": "menos es mejor",
        "Ship-readiness issues": "Problemas para publicar", "static checks": "chequeo estático",
        "Viewports with horizontal overflow": "Pantallas con scroll horizontal",
        "Before and after": "Antes y después", "What changed": "Qué cambió", "Graphic material": "Material gráfico",
        "Ship-readiness": "Listo para publicar", "Proposed, not built": "Propuesto, no construido",
        "Left unchanged on purpose": "Sin cambios a propósito", "How to revert": "Cómo revertir",
        "Item": "Ítem", "Status": "Estado", "Note": "Nota", "No changes": "Sin cambios", "No capture": "Sin captura",
        "Type": "Tipo", "No screenshots were captured for this run.": "No se tomaron capturas en esta ejecución.",
        "Fixed": "Corregido", "Already fine": "Ya estaba bien", "Added": "Agregado", "Proposed": "Propuesto",
        "Open": "Pendiente", "Not needed": "No aplica", "Kept existing": "Se mantiene el existente",
        "Proposed only": "Solo propuesto", "Skipped": "Descartado",
        "Desktop": "Escritorio", "Mobile": "Móvil", "Tablet": "Tablet", "first screen": "primera pantalla", "full page": "página completa",
    }
}
LANG = "en"


def t(s):
    return I18N.get(LANG, {}).get(s, s)


def esc(s):
    return html.escape(str(s if s is not None else ""))


def load(path):
    if not path or not os.path.exists(path):
        return None
    with open(path, encoding="utf-8") as fh:
        return json.load(fh)


def img_src(path, out_dir, link):
    if link:
        return os.path.relpath(path, out_dir).replace("\\", "/")
    with open(path, "rb") as fh:
        return "data:image/png;base64," + base64.b64encode(fh.read()).decode()


def label_for(name):
    m = re.match(r"(?:(.+)-)?(desktop|mobile|tablet)-(\d+)-(fold|full)$", name)
    if not m:
        return name
    page, kind, w, part = m.groups()
    kind = t({"desktop": "Desktop", "mobile": "Mobile", "tablet": "Tablet"}[kind])
    part = t("first screen" if part == "fold" else "full page")
    return f"{kind} {w}px · {part}" + (f" · /{page}" if page and page != "home" else "")


def shots(before, after):
    def names(d):
        if not d or not os.path.isdir(d):
            return {}
        return {os.path.splitext(f)[0]: os.path.join(d, f) for f in os.listdir(d) if f.lower().endswith(".png")}
    b, a = names(before), names(after)

    def key(n):
        base = re.sub(r"^.*?(?=(desktop|mobile|tablet)-)", "", n)
        return (ORDER.index(base) if base in ORDER else 99, n)
    return [(n, b.get(n), a[n]) for n in sorted(a, key=key)]


def score_block(sb, sa, pb, pa):
    cells = []
    if sb or sa:
        cells.append(("Slop score", sb and sb["score"], sa and sa["score"], "lower is better"))
        cells.append(("Ship-readiness issues", sb and sb.get("ship", {}).get("issues"),
                      sa and sa.get("ship", {}).get("issues"), "static checks"))
    def overflow(pc):
        if not pc:
            return None
        return sum(1 for p in pc["pages"] for v in p["viewports"] if v["overflow"])
    if pb or pa:
        cells.append(("Viewports with horizontal overflow", overflow(pb), overflow(pa), "360 / 390 / 768 / 1440 px"))
    out = []
    for title, b, a, note in cells:
        arrow = ""
        if isinstance(b, (int, float)) and isinstance(a, (int, float)):
            arrow = "down" if a < b else "same" if a == b else "up"
        out.append(f"""<div class="stat"><div class="stat__label">{esc(t(title))}</div>
<div class="stat__value"><span class="before">{esc('—' if b is None else b)}</span><span class="to">→</span><span class="after {arrow}">{esc('—' if a is None else a)}</span></div>
<div class="stat__note">{esc(t(note))}</div></div>""")
    return "\n".join(out)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--before"); ap.add_argument("--after", required=True)
    ap.add_argument("--scan-before"); ap.add_argument("--scan-after")
    ap.add_argument("--changes", required=True); ap.add_argument("--out", required=True)
    ap.add_argument("--link", action="store_true")
    a = ap.parse_args()

    ch = load(a.changes) or {}
    global LANG
    LANG = ch.get("lang", "en")
    sb, sa = load(a.scan_before), load(a.scan_after)
    pb = load(os.path.join(a.before, "page_check.json")) if a.before else None
    pa = load(os.path.join(a.after, "page_check.json"))
    out_dir = os.path.dirname(os.path.abspath(a.out))
    os.makedirs(out_dir, exist_ok=True)

    # ---- screenshots
    tabs, panes = [], []
    for i, (name, bp, ap_) in enumerate(shots(a.before, a.after)):
        tabs.append(f'<button role="tab" aria-selected="{str(i == 0).lower()}" data-i="{i}">{esc(label_for(name))}</button>')
        before_html = (f'<figure><figcaption>{t("Before")}</figcaption><img loading="lazy" alt="{t("Before")}: {esc(label_for(name))}" src="{img_src(bp, out_dir, a.link)}"></figure>'
                       if bp else '<figure class="empty"><figcaption>{t("Before")}</figcaption><p>{t("No capture")}</p></figure>')
        after_html = f'<figure><figcaption>{t("After")}</figcaption><img loading="lazy" alt="{t("After")}: {esc(label_for(name))}" src="{img_src(ap_, out_dir, a.link)}"></figure>'
        mobile = "mobile" in name
        panes.append(f'<div class="pane{" pane--narrow" if mobile else ""}" data-i="{i}"{"" if i == 0 else " hidden"}>{before_html}{after_html}</div>')
    shots_html = (f'<div class="tabs" role="tablist">{"".join(tabs)}</div>{"".join(panes)}' if tabs
                  else f'<p class="muted">{t("No screenshots were captured for this run.")}</p>')

    # ---- passes
    passes_html = []
    for p in ch.get("passes", []):
        items = []
        for c in p.get("changes", []):
            files = "".join(f"<code>{esc(f)}</code>" for f in c.get("files", []))
            items.append(f'<li><span>{esc(c.get("what"))}</span>{f"<span class=files>{files}</span>" if files else ""}</li>')
        passes_html.append(f'<section class="pass"><h3>{esc(p.get("name"))}</h3><ul>{"".join(items) or f"<li class=muted>{t('No changes')}</li>"}</ul></section>')

    # ---- graphic decision
    g = ch.get("graphic") or {}
    g_html = ""
    if g:
        scores = g.get("scores") or {}
        score_rows = "".join(f"<tr><td>{esc(k)}</td><td>{esc(v)}</td></tr>" for k, v in scores.items())
        total = sum(v for v in scores.values() if isinstance(v, (int, float)))
        g_html = f"""<div class="decision"><span class="pill">{esc(t(GRAPHIC.get(str(g.get('decision','')).lower(), g.get('decision',''))))}</span>
<p>{esc(g.get('reason'))}</p>{f'<p class=muted>{t("Type")}: {esc(g.get("type"))}</p>' if g.get('type') else ''}
{f'<table class="scores"><tbody>{score_rows}<tr class="total"><td>Total</td><td>{total} / 12</td></tr></tbody></table>' if score_rows else ''}</div>"""

    # ---- ship checklist
    ship_rows = []
    for s in ch.get("ship", []):
        lbl, cls = STATUS.get(str(s.get("status", "")).lower(), (s.get("status", ""), "muted"))
        ship_rows.append(f'<tr><td>{esc(s.get("item"))}</td><td><span class="status {cls}">{esc(t(lbl))}</span></td><td>{esc(s.get("note"))}</td></tr>')
    ship_html = f'<table class="ship"><thead><tr><th>{t("Item")}</th><th>{t("Status")}</th><th>{t("Note")}</th></tr></thead><tbody>{"".join(ship_rows)}</tbody></table>' if ship_rows else ""

    def bullet_list(key):
        items = ch.get(key) or []
        return "<ul class='plain'>" + "".join(f"<li>{esc(x)}</li>" for x in items) + "</ul>" if items else ""

    title = ch.get("project") or "UI redesign"
    doc = f"""<!doctype html>
<html lang="{esc(ch.get('lang', 'en'))}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(title)} — {t("before / after")}</title>
<meta name="description" content="Before/after proposal for {esc(title)}: what changed, why, and what is left.">
<style>
:root {{
  --bg:#FAFAF9; --surface:#FFFFFF; --surface-2:#F4F4F3; --line:rgba(0,0,0,.08);
  --text:#111113; --text-2:#5C5C63; --text-3:#8E8E96; --accent:#2F6FEB;
  --ok:#1F8A5B; --warn:#B7791F; --bad:#C53030;
}}
@media (prefers-color-scheme: dark) {{ :root:not([data-theme="light"]) {{
  --bg:#0A0A0B; --surface:#131315; --surface-2:#1A1A1D; --line:rgba(255,255,255,.08);
  --text:#EDEDEF; --text-2:#A1A1A8; --text-3:#6E6E76; --accent:#6E9BFF;
  --ok:#4CC38A; --warn:#E3B341; --bad:#F2555A; }} }}
* {{ box-sizing:border-box }}
body {{ margin:0; background:var(--bg); color:var(--text); font:16px/1.55 ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif; }}
.wrap {{ max-width:1200px; margin:0 auto; padding:40px 24px 80px }}
header p {{ margin:8px 0 0; color:var(--text-2); max-width:70ch }}
h1 {{ margin:0; font-size:32px; font-weight:600; letter-spacing:-.02em }}
h1 span {{ color:var(--text-3) }}
h2 {{ margin:56px 0 16px; font-size:20px; font-weight:600 }}
h3 {{ margin:0 0 8px; font-size:16px; font-weight:600 }}
.meta {{ margin-top:12px; font:12px ui-monospace,SFMono-Regular,Menlo,monospace; color:var(--text-3) }}
.direction {{ margin-top:24px; padding:16px 20px; border:1px solid var(--line); border-radius:12px; background:var(--surface) }}
.direction b {{ display:block; font-size:14px; font-weight:500; color:var(--text-2); margin-bottom:4px }}
.stats {{ display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:12px; margin-top:24px }}
.stat {{ padding:20px; border:1px solid var(--line); border-radius:12px; background:var(--surface) }}
.stat__label {{ font-size:14px; color:var(--text-2) }}
.stat__value {{ margin-top:8px; display:flex; align-items:baseline; gap:8px; font-size:28px; font-weight:600; font-variant-numeric:tabular-nums }}
.stat__value .before {{ color:var(--text-3); font-weight:500 }}
.stat__value .to {{ font-size:16px; color:var(--text-3) }}
.stat__value .down {{ color:var(--ok) }} .stat__value .up {{ color:var(--bad) }}
.stat__note {{ margin-top:4px; font:12px ui-monospace,monospace; color:var(--text-3) }}
.tabs {{ display:flex; flex-wrap:wrap; gap:8px; margin-bottom:16px }}
.tabs button {{ min-height:40px; padding:8px 14px; border:1px solid var(--line); border-radius:8px; background:var(--surface); color:var(--text-2); font:inherit; font-size:14px; cursor:pointer }}
.tabs button[aria-selected="true"] {{ color:var(--text); border-color:var(--text-3); background:var(--surface-2) }}
.pane {{ display:grid; grid-template-columns:1fr 1fr; gap:16px; align-items:start }}
.pane[hidden] {{ display:none }}
.pane--narrow {{ max-width:860px }}
figure {{ margin:0; border:1px solid var(--line); border-radius:12px; overflow:hidden; background:var(--surface) }}
figcaption {{ padding:8px 12px; font-size:14px; color:var(--text-2); border-bottom:1px solid var(--line) }}
figure img {{ display:block; width:100%; height:auto }}
figure.empty p {{ padding:40px 12px; text-align:center; color:var(--text-3) }}
.passes {{ display:grid; grid-template-columns:repeat(auto-fit,minmax(300px,1fr)); gap:12px }}
.pass {{ padding:20px; border:1px solid var(--line); border-radius:12px; background:var(--surface) }}
.pass ul, ul.plain {{ margin:0; padding-left:18px }}
.pass li, ul.plain li {{ margin:6px 0; color:var(--text-2) }}
.pass li span:first-child {{ color:var(--text) }}
.files {{ display:flex; flex-wrap:wrap; gap:4px; margin-top:4px }}
code {{ font:12px ui-monospace,monospace; padding:1px 6px; border:1px solid var(--line); border-radius:4px; color:var(--text-2) }}
.decision {{ padding:20px; border:1px solid var(--line); border-radius:12px; background:var(--surface) }}
.decision p {{ margin:8px 0 0 }}
.pill {{ display:inline-block; padding:2px 10px; border-radius:999px; background:var(--surface-2); font-size:14px; font-weight:500 }}
table {{ width:100%; border-collapse:collapse; font-size:14px }}
.ship {{ border:1px solid var(--line); border-radius:12px; overflow:hidden; background:var(--surface) }}
th, td {{ text-align:left; padding:10px 14px; border-bottom:1px solid var(--line); vertical-align:top }}
th {{ font-weight:500; color:var(--text-2) }}
tr:last-child td {{ border-bottom:0 }}
.scores {{ margin-top:12px; max-width:360px }} .scores td {{ padding:6px 0 }} .scores .total td {{ font-weight:600 }}
.status {{ white-space:nowrap; font-weight:500 }}
.status.ok {{ color:var(--ok) }} .status.warn {{ color:var(--warn) }} .status.bad {{ color:var(--bad) }} .status.muted {{ color:var(--text-3) }}
.muted {{ color:var(--text-3) }}
.revert {{ padding:16px 20px; border:1px solid var(--line); border-radius:12px; background:var(--surface-2); color:var(--text-2) }}
@media (max-width:720px) {{
  .wrap {{ padding:24px 16px 64px }}
  h1 {{ font-size:26px }}
  .pane {{ grid-template-columns:1fr }}
  th:nth-child(3), td:nth-child(3) {{ display:none }}
}}
</style>
</head>
<body>
<div class="wrap">
<header>
  <h1>{esc(title)} <span>{t("before / after")}</span></h1>
  {f'<p>{esc(ch.get("summary"))}</p>' if ch.get("summary") else ''}
  <div class="meta">{esc(ch.get('date', ''))}{' · ' + esc(ch.get('url')) if ch.get('url') else ''}</div>
  {f'<div class="direction"><b>{t("Direction")}</b>{esc(ch.get("direction"))}</div>' if ch.get('direction') else ''}
</header>
<div class="stats">{score_block(sb, sa, pb, pa)}</div>

<h2>{t("Before and after")}</h2>
{shots_html}

<h2>{t("What changed")}</h2>
<div class="passes">{''.join(passes_html)}</div>

{f'<h2>{t('Graphic material')}</h2>{g_html}' if g_html else ''}
{f'<h2>{t('Ship-readiness')}</h2>{ship_html}' if ship_html else ''}
{f'<h2>{t('Proposed, not built')}</h2>{bullet_list("proposals")}' if ch.get('proposals') else ''}
{f'<h2>{t('Left unchanged on purpose')}</h2>{bullet_list("untouched")}' if ch.get('untouched') else ''}
{f'<h2>{t('How to revert')}</h2><div class="revert">{esc(ch.get("revert"))}</div>' if ch.get('revert') else ''}
</div>
<script>
document.querySelectorAll('.tabs button').forEach(b => b.addEventListener('click', () => {{
  document.querySelectorAll('.tabs button').forEach(x => x.setAttribute('aria-selected', x === b));
  document.querySelectorAll('.pane').forEach(p => p.hidden = p.dataset.i !== b.dataset.i);
}}));
</script>
</body>
</html>
"""
    with open(a.out, "w", encoding="utf-8") as fh:
        fh.write(doc)
    print(f"report written: {a.out} ({os.path.getsize(a.out) // 1024} KB, {len(tabs)} screenshot pairs)")


if __name__ == "__main__":
    sys.exit(main())
