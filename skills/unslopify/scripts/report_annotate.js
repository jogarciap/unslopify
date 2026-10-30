/* Annotation mode for the unslopify report.
 * Draw a box on any screenshot and attach a comment.
 * - Inside a Claude Artifact that declares {comments: {customAnchors: true}}: the box opens
 *   Claude's own comment composer anchored to that area; "Send to Claude" delivers the
 *   comment, its location and the elements inside the box to the Claude session.
 * - Anywhere else: comments are kept in this browser and can be copied as a prompt or
 *   downloaded as JSON for any AI assistant.
 * Inlined by make_report.py. Reads its data from <script id="unslop-data">. */
(() => {
  const D = JSON.parse(document.getElementById("unslop-data").textContent);
  const T = (k) => (D.i18n && D.i18n[k]) || k;
  const KEY = "unslopify-notes:" + D.project;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  let notes = load();
  let drawing = false;
  let commentMode = false;
  let ctrl = null;
  let threads = [];
  let draft = null;

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(notes)); } catch { /* private mode: keep in memory */ }
  }

  // ---------------------------------------------------------------- geometry
  const shotEl = (id) => $$(".shot").find((el) => el.dataset.shot === id);
  const info = (id) => D.shots[id] || { w: 1, h: 1, label: id, layout: null };
  function toNatural(el, ev) {
    const r = el.getBoundingClientRect();
    const s = info(el.dataset.shot).w / r.width;
    return {
      x: Math.max(0, Math.min(info(el.dataset.shot).w, (ev.clientX - r.left) * s)),
      y: Math.max(0, Math.min(info(el.dataset.shot).h, (ev.clientY - r.top) * s)),
    };
  }
  function place(box, id, [x, y, w, h]) {
    const { w: W, h: H } = info(id);
    Object.assign(box.style, { left: (x / W) * 100 + "%", top: (y / H) * 100 + "%", width: (w / W) * 100 + "%", height: (h / H) * 100 + "%" });
  }
  function docPoint(id, [x, y, w]) {
    const el = shotEl(id);
    const r = el.getBoundingClientRect();
    const s = r.width / info(id).w;
    return { x: r.left + scrollX + (x + w) * s, y: r.top + scrollY + y * s };
  }
  const visible = (id) => { const el = shotEl(id); return !!el && !el.closest("[hidden]"); };

  // ---------------------------------------------------------------- what is inside a box
  function elementsIn(id, [x, y, w, h]) {
    const L = info(id).layout;
    if (!L) return { container: null, inside: [] };
    const x2 = x + w, y2 = y + h;
    let container = null;
    const inside = [];
    for (const e of L) {
      const [ex, ey, ew, eh] = e;
      const ix = Math.min(x2, ex + ew) - Math.max(x, ex);
      const iy = Math.min(y2, ey + eh) - Math.max(y, ey);
      if (ix <= 0 || iy <= 0) continue;
      if (ex <= x && ey <= y && ex + ew >= x2 && ey + eh >= y2) {
        if (!container || ew * eh < container[2] * container[3]) container = e;
      } else if ((ix * iy) / (ew * eh) >= 0.6) inside.push(e);
    }
    const seen = new Set();
    let picked = inside.filter((e) => e[5] && !seen.has(e[5]) && seen.add(e[5]));
    if (!picked.length) picked = inside;
    picked.sort((a, b) => a[1] - b[1] || a[0] - b[0]);
    return { container, inside: picked.slice(0, 8) };
  }
  const fmt = (e) => e[4] + (e[5] ? ` "${e[5].slice(0, 40)}"` : "");
  function describe(els) {
    const parts = [];
    if (els.container) parts.push(T("inside") + ": " + fmt(els.container));
    if (els.inside.length) parts.push(T("covers") + ": " + els.inside.map(fmt).join("; "));
    return parts.join(" | ");
  }
  const anchorName = (id, r) => `${id}#${r.map(Math.round).join(",")}`;
  function parseAnchor(s) {
    const m = /^((?:before|after)\/[\w-]+)#(\d+),(\d+),(\d+),(\d+)$/.exec(s || "");
    return m ? { id: m[1], rect: m.slice(2).map(Number) } : null;
  }
  const areaLabel = (id, [x, y, w, h]) => `${info(id).label} · ${Math.round(w)}×${Math.round(h)} px @ ${Math.round(x)},${Math.round(y)}`;

  // ---------------------------------------------------------------- drawing
  function armed() { return drawing || commentMode; }
  function setDrawing(on) {
    drawing = on;
    document.body.classList.toggle("is-drawing", on);
    const b = $("#annotate-toggle");
    if (b) { b.setAttribute("aria-pressed", String(on)); b.textContent = on ? T("Stop marking") : T("Mark an area"); }
  }

  for (const el of $$(".shot")) {
    let start = null;
    let box = null;
    el.addEventListener("pointerdown", (ev) => {
      if (!armed() || ev.button !== 0 || ev.target.closest(".note-form")) return;
      ev.preventDefault();
      clearDraft();
      closeForm();
      el.setPointerCapture(ev.pointerId);
      start = toNatural(el, ev);
      box = document.createElement("div");
      box.className = "box box--draft";
      el.append(box);
      place(box, el.dataset.shot, [start.x, start.y, 0, 0]);
    });
    el.addEventListener("pointermove", (ev) => {
      if (!start) return;
      const p = toNatural(el, ev);
      place(box, el.dataset.shot, [Math.min(start.x, p.x), Math.min(start.y, p.y), Math.abs(p.x - start.x), Math.abs(p.y - start.y)]);
    });
    const end = (ev) => {
      if (!start) return;
      const p = toNatural(el, ev);
      let rect = [Math.min(start.x, p.x), Math.min(start.y, p.y), Math.abs(p.x - start.x), Math.abs(p.y - start.y)];
      start = null;
      if (rect[2] < 8 && rect[3] < 8) rect = [Math.max(0, rect[0] - 16), Math.max(0, rect[1] - 16), 32, 32]; // a click marks a small spot
      rect = rect.map(Math.round);
      place(box, el.dataset.shot, rect);
      draft = box;
      finish(el.dataset.shot, rect, box);
      box = null;
    };
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", () => { start = null; box?.remove(); box = null; });
  }

  function clearDraft() { draft?.remove(); draft = null; }

  async function finish(id, rect, box) {
    const els = elementsIn(id, rect);
    const label = areaLabel(id, rect);
    const detail = describe(els);
    if (ctrl) {
      try {
        const res = await ctrl.compose(anchorName(id, rect), docPoint(id, rect), {
          label: label.slice(0, 120), detail: detail.slice(0, 1000), area: ctrl.areas,
        });
        if (!res.opened) clearDraft();
        return;
      } catch { /* comments unavailable here: fall back to the local form */ }
    }
    openForm(id, rect, els, label, box);
  }

  // ---------------------------------------------------------------- local comments (fallback)
  function closeForm() { $(".note-form")?.remove(); }
  function openForm(id, rect, els, label, box) {
    closeForm();
    const el = shotEl(id);
    const form = document.createElement("form");
    form.className = "note-form";
    const { w: W, h: H } = info(id);
    form.style.left = Math.min(((rect[0]) / W) * 100, 60) + "%";
    form.style.top = ((rect[1] + rect[3]) / H) * 100 + "%";
    form.innerHTML = `<label><span>${T("What should change here?")}</span><textarea rows="3" maxlength="2000" required></textarea></label>
      <p class="note-form__where"></p>
      <div class="note-form__actions"><button type="submit" class="btn btn--primary">${T("Save comment")}</button><button type="button" class="btn">${T("Cancel")}</button></div>`;
    $(".note-form__where", form).textContent = describe(els) || label;
    form.addEventListener("submit", (ev) => {
      ev.preventDefault();
      const text = $("textarea", form).value.trim();
      if (!text) return;
      notes.push({ id: Date.now().toString(36), shot: id, label, rect, text, elements: describe(els) });
      save();
      closeForm();
      clearDraft();
      render();
    });
    $(".note-form__actions .btn:not(.btn--primary)", form).addEventListener("click", () => { closeForm(); clearDraft(); });
    form.addEventListener("keydown", (ev) => { if (ev.key === "Escape") { closeForm(); clearDraft(); } });
    el.append(form);
    $("textarea", form).focus({ preventScroll: true });
  }

  function render() {
    $$(".box--note").forEach((b) => b.remove());
    notes.forEach((n, i) => {
      const el = shotEl(n.shot);
      if (!el) return;
      const b = document.createElement("div");
      b.className = "box box--note";
      b.innerHTML = `<span class="box__num">${i + 1}</span>`;
      place(b, n.shot, n.rect);
      el.append(b);
    });
    const panel = $("#feedback");
    panel.hidden = !notes.length;
    $("#feedback-count").textContent = String(notes.length);
    const list = $("#feedback-list");
    list.replaceChildren(...notes.map((n, i) => {
      const li = document.createElement("li");
      li.innerHTML = `<button type="button" class="link"></button><p></p><button type="button" class="del" aria-label="${T("Delete")}">×</button>`;
      const [go, p, del] = li.children;
      go.textContent = `${i + 1}. ${n.label}`;
      p.textContent = n.text;
      go.addEventListener("click", () => reveal(n.shot));
      del.addEventListener("click", () => { notes = notes.filter((x) => x !== n); save(); render(); });
      return li;
    }));
  }

  function asPrompt() {
    const lines = [
      `${T("Feedback on the redesign")}: ${D.project}`,
      T("Each item is a box drawn on a screenshot. Coordinates are CSS px of the page at that viewport width."),
      "",
    ];
    notes.forEach((n, i) => {
      lines.push(`${i + 1}. [${n.label}]`);
      if (n.elements) lines.push(`   ${T("Elements")}: ${n.elements}`);
      lines.push(`   ${T("Change")}: ${n.text}`, "");
    });
    lines.push(T("Apply these changes, re-capture the after screenshots, and rebuild the report."));
    return lines.join("\n");
  }
  async function copy() {
    const text = asPrompt();
    let ok = false;
    try { await navigator.clipboard.writeText(text); ok = true; } catch {
      const ta = Object.assign(document.createElement("textarea"), { value: text });
      document.body.append(ta); ta.select();
      try { ok = document.execCommand("copy"); } catch { ok = false; }
      ta.remove();
    }
    flash(ok ? T("Copied. Paste it in your chat with the AI.") : T("Could not copy. Use Download instead."));
  }
  function download() {
    const blob = new Blob([JSON.stringify({ project: D.project, notes }, null, 2)], { type: "application/json" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: "unslopify-feedback.json" });
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  function flash(msg) {
    const s = $("#feedback-status");
    s.textContent = msg;
    clearTimeout(flash.t);
    flash.t = setTimeout(() => (s.textContent = ""), 4000);
  }

  // ---------------------------------------------------------------- tabs
  function showPane(i) {
    $$(".tabs button").forEach((x) => x.setAttribute("aria-selected", String(x.dataset.i === String(i))));
    $$(".pane").forEach((p) => (p.hidden = p.dataset.i !== String(i)));
    report();
  }
  function reveal(id) {
    const el = shotEl(id);
    if (!el) return;
    showPane(el.closest(".pane").dataset.i);
    el.scrollIntoView({ block: "center", behavior: reduced ? "auto" : "smooth" });
  }
  $$(".tabs button").forEach((b) => b.addEventListener("click", () => showPane(b.dataset.i)));

  // ---------------------------------------------------------------- Claude comments
  function report() {
    if (!ctrl) return;
    $$(".box--thread").forEach((b) => b.remove());
    const map = {};
    for (const th of threads) {
      const p = parseAnchor(th.anchor);
      if (!p || !shotEl(p.id)) continue;
      const show = visible(p.id) && !th.resolved;
      map[th.id] = show ? docPoint(p.id, p.rect) : null;
      if (show) {
        const b = document.createElement("div");
        b.className = "box box--thread" + (th.active ? " is-active" : "");
        place(b, p.id, p.rect);
        shotEl(p.id).append(b);
      }
    }
    try { ctrl.placed(map); } catch { /* shell went away */ }
  }
  let rt;
  addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(report, 150); });
  $$(".shot img").forEach((img) => img.addEventListener("load", report));

  function setHint() {
    const h = $("#annotate-hint");
    if (h) h.textContent = ctrl ? T("Draw a box on a screenshot, write the change and press Send to Claude.") : T("Draw a box on a screenshot and describe the change. Then copy the comments for your AI.");
  }

  (async () => {
    if (!(window.claude && typeof window.claude.use === "function")) return;
    let c = null;
    try { c = await window.claude.use("comments"); } catch { c = null; }
    if (!c) return;
    try {
      ctrl = await c.customAnchors({
        mode(on) {
          commentMode = on;
          document.body.classList.toggle("is-commenting", on);
          if (!on) { threads = []; clearDraft(); }
          report();
        },
        threads(list) { threads = list; report(); },
        reveal(id) {
          const th = threads.find((x) => x.id === id);
          const p = th && parseAnchor(th.anchor);
          if (p) { reveal(p.id); report(); }
        },
        composing(open) { if (!open) clearDraft(); },
      });
      document.body.classList.add("has-claude");
      setHint();
      report();
      // in comment mode, a click outside the screenshots comments on that element
      document.addEventListener("click", (ev) => {
        if (!commentMode || ev.target.closest(".shot, .annotate-bar, #feedback")) return;
        const t = ev.target.closest("h1, h2, h3, p, li, td, figure, section, .stat, .decision, .revert");
        if (!t) return;
        ev.preventDefault();
        const [anchor, at] = ctrl.domAnchor(t, ev);
        ctrl.compose(anchor, at, { label: (t.textContent || "").trim().slice(0, 100) }).catch(() => {});
      }, true);
    } catch { ctrl = null; }
  })();

  // ---------------------------------------------------------------- wire up
  $("#annotate-toggle")?.addEventListener("click", () => setDrawing(!drawing));
  $("#feedback-copy").addEventListener("click", copy);
  $("#feedback-download").addEventListener("click", download);
  // two-step confirm built into the page (dialogs like confirm() are blocked in some viewers)
  const clearBtn = $("#feedback-clear");
  let armedClear = 0;
  clearBtn.addEventListener("click", () => {
    if (Date.now() - armedClear < 4000) {
      notes = []; save(); render();
      armedClear = 0; clearBtn.textContent = T("Clear");
      return;
    }
    armedClear = Date.now();
    clearBtn.textContent = T("Tap again to delete all");
    setTimeout(() => { if (Date.now() - armedClear >= 4000) clearBtn.textContent = T("Clear"); }, 4100);
  });
  // inside an embedded viewer, file downloads started by the page are blocked
  if (window.claude) $("#feedback-download").hidden = true;
  addEventListener("keydown", (ev) => { if (ev.key === "Escape" && drawing && !$(".note-form")) setDrawing(false); });
  setHint();
  render();
})();
