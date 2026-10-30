#!/usr/bin/env node
/**
 * Browser check for ship-readiness + before/after screenshots.
 *
 *   node page_check.mjs <url> <outdir> [--paths /,/about] [--no-shots]
 *
 * For each path and viewport (360, 390, 768, 1440 px wide) it reports:
 *   horizontal overflow (and the elements causing it), small tap targets (mobile),
 *   title, meta description, favicon, viewport meta, in-page anchors without a
 *   matching id, same-origin links returning >= 400, and console errors.
 * Writes <outdir>/page_check.json and screenshots <outdir>/<path>-<viewport>-{fold,full}.png.
 *
 * Needs Playwright. Resolved from the current working directory first (run it from
 * the project folder), then from wherever Node can find it.
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith("--")));
const pos = args.filter((a, i) => !a.startsWith("--") && args[i - 1] !== "--paths");
const [baseUrl, outDir] = pos;
if (!baseUrl || !outDir) {
  console.error("usage: node page_check.mjs <url> <outdir> [--paths /,/about] [--no-shots]");
  process.exit(2);
}
const pathsArg = args.includes("--paths") ? args[args.indexOf("--paths") + 1] : null;
const routes = pathsArg ? pathsArg.split(",") : [""];
const shots = !flags.has("--no-shots");

async function loadPlaywright() {
  try {
    return createRequire(path.join(process.cwd(), "noop.js"))("playwright");
  } catch {}
  try {
    return await import("playwright");
  } catch {}
  console.error(
    "Playwright not found. Run this from a project that has it, or install it:\n" +
      "  npm i -D playwright && npx playwright install chromium",
  );
  process.exit(3);
}

const { chromium } = await loadPlaywright();
let browser;
try {
  browser = await chromium.launch();
} catch {
  browser = await chromium.launch({ channel: "chrome" }); // fall back to installed Chrome
}

const VIEWPORTS = [
  { name: "mobile-360", width: 360, height: 760, mobile: true },
  { name: "mobile-390", width: 390, height: 844, mobile: true },
  { name: "tablet-768", width: 768, height: 1024, mobile: true },
  { name: "desktop-1440", width: 1440, height: 900, mobile: false },
];
fs.mkdirSync(outDir, { recursive: true });
const report = { url: baseUrl, generated: new Date().toISOString(), pages: [] };
const linkCache = new Map();

for (const route of routes) {
  const url = route ? new URL(route, baseUrl).href : baseUrl;
  const slug = (route || "/").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "home";
  const pageReport = { url, viewports: [], meta: null, links: null, consoleErrors: [] };

  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
      isMobile: vp.mobile,
      hasTouch: vp.mobile,
      // Site builders (Wix, Squarespace) serve a separate mobile site by user agent.
      ...(vp.mobile ? { userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1" } : {}),
    });
    const page = await ctx.newPage();
    page.on("console", (m) => m.type() === "error" && pageReport.consoleErrors.push(`${vp.name}: ${m.text()}`));
    page.on("pageerror", (e) => pageReport.consoleErrors.push(`${vp.name}: ${e.message}`));
    // Pages with analytics or chat widgets never go network-idle; fall back to DOM ready.
    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 }).catch(() =>
      page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 }).then(() => page.waitForTimeout(5000)).catch((e) =>
        pageReport.consoleErrors.push(`${vp.name}: navigation failed: ${e.message}`),
      ),
    );
    // Scroll through once so lazy-loaded images and sections render before the screenshots.
    await page.evaluate(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * 0.8) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 150)); }
      scrollTo(0, 0);
    }).catch(() => {});
    await page.waitForTimeout(800);

    const data = await page.evaluate(({ mobile }) => {
      const vw = document.documentElement.clientWidth;
      const sw = document.documentElement.scrollWidth;
      const offenders = [];
      if (sw > vw) {
        for (const el of document.querySelectorAll("body *")) {
          const r = el.getBoundingClientRect();
          if (r.width && r.right > vw + 1) {
            const cs = getComputedStyle(el);
            if (cs.position === "fixed" || cs.visibility === "hidden") continue;
            offenders.push({
              el: el.tagName.toLowerCase() + (el.id ? "#" + el.id : "") +
                (el.classList.length ? "." + [...el.classList].slice(0, 3).join(".") : ""),
              right: Math.round(r.right),
              width: Math.round(r.width),
            });
          }
        }
        offenders.sort((a, b) => b.right - a.right);
      }
      const small = [];
      if (mobile) {
        for (const el of document.querySelectorAll("a[href], button, [role=button], input, select, textarea")) {
          const r = el.getBoundingClientRect();
          const cs = getComputedStyle(el);
          if (!r.width || cs.visibility === "hidden" || cs.display === "none") continue;
          if (r.width < 44 && r.height < 44) {
            small.push(`${el.tagName.toLowerCase()} "${(el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 40)}" ${Math.round(r.width)}x${Math.round(r.height)}`);
          }
        }
      }
      const hiddenNav = [...document.querySelectorAll("nav")].some((n) => {
        const cs = getComputedStyle(n);
        return (cs.display === "none" || cs.visibility === "hidden") && n.querySelectorAll("a").length > 1;
      });
      const toggle = !!document.querySelector("[aria-expanded]");
      return { viewportWidth: vw, scrollWidth: sw, overflow: sw > vw, offenders: offenders.slice(0, 8), smallTapTargets: small.slice(0, 15), hiddenNavWithoutToggle: hiddenNav && !toggle };
    }, { mobile: vp.mobile });

    if (!pageReport.meta) {
      pageReport.meta = await page.evaluate(() => ({
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.content ?? null,
        favicon: document.querySelector('link[rel~="icon"]')?.href ?? null,
        appleTouchIcon: document.querySelector('link[rel="apple-touch-icon"]')?.href ?? null,
        viewport: document.querySelector('meta[name="viewport"]')?.content ?? null,
        themeColor: document.querySelector('meta[name="theme-color"]')?.content ?? null,
        ogImage: document.querySelector('meta[property="og:image"]')?.content ?? null,
      }));
      const links = await page.evaluate(() => {
        const ids = new Set([...document.querySelectorAll("[id]")].map((e) => e.id));
        const out = { deadHref: [], missingAnchors: [], internal: [], plainEmails: [] };
        for (const a of document.querySelectorAll("a")) {
          const raw = a.getAttribute("href");
          const label = (a.textContent || "").trim().slice(0, 40);
          if (raw === null || raw === "" || raw === "#" || raw.startsWith("javascript:")) out.deadHref.push(`${label} -> ${raw}`);
          else if (raw.startsWith("#") && !ids.has(decodeURIComponent(raw.slice(1)))) out.missingAnchors.push(`${label} -> ${raw}`);
          else if (a.href.startsWith(location.origin) && !raw.startsWith("#")) out.internal.push(a.href.split("#")[0]);
        }
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        const rx = /[\w.%+-]+@[\w-]+\.[a-z]{2,}/i;
        while (walker.nextNode()) {
          const n = walker.currentNode;
          if (n.parentElement.closest("script, style, noscript, template")) continue;
          if (rx.test(n.textContent) && !n.parentElement.closest("a[href^='mailto:']")) out.plainEmails.push(n.textContent.trim().slice(0, 60));
        }
        out.internal = [...new Set(out.internal)];
        return out;
      });
      links.broken = [];
      for (const href of links.internal.slice(0, 60)) {
        if (!linkCache.has(href)) {
          const status = await page.request.get(href, { timeout: 15000 }).then((r) => r.status()).catch(() => 0);
          linkCache.set(href, status);
        }
        const s = linkCache.get(href);
        if (s === 0 || s >= 400) links.broken.push(`${href} -> ${s || "no response"}`);
      }
      pageReport.links = links;
    }

    if (shots) {
      await page.screenshot({ path: path.join(outDir, `${slug}-${vp.name}-fold.png`) });
      await page.screenshot({ path: path.join(outDir, `${slug}-${vp.name}-full.png`), fullPage: true });
      // element map in page CSS px (= screenshot px at scale 1), used by the report's
      // annotation mode to say which elements a drawn box covers
      const layout = await page.evaluate(() => {
        const KEEP = new Set(["H1", "H2", "H3", "H4", "H5", "H6", "P", "A", "BUTTON", "IMG", "SVG", "INPUT",
          "TEXTAREA", "SELECT", "LABEL", "LI", "SECTION", "HEADER", "FOOTER", "NAV", "MAIN", "ARTICLE",
          "ASIDE", "FORM", "TABLE", "FIGURE", "VIDEO", "DETAILS", "SUMMARY"]);
        const SKIP = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE", "PATH", "G", "DEFS", "MASK", "CIRCLE", "RECT", "LINE", "POLYGON", "ELLIPSE", "USE", "PATTERN"]);
        const name = (el) => {
          let s = el.tagName.toLowerCase();
          if (el.id) s += "#" + el.id;
          const cls = typeof el.className === "string" ? el.className.trim().split(/\s+/).filter(Boolean).slice(0, 2) : [];
          if (cls.length) s += "." + cls.join(".");
          return s;
        };
        const out = [];
        for (const el of document.querySelectorAll("body *")) {
          const tag = el.tagName.toUpperCase();
          if (SKIP.has(tag) || el.closest("svg") !== el && el.closest("svg")) continue;
          const r = el.getBoundingClientRect();
          if (r.width < 4 || r.height < 4) continue;
          const cs = getComputedStyle(el);
          if (cs.visibility === "hidden" || cs.display === "none" || +cs.opacity === 0) continue;
          const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join(" ").replace(/\s+/g, " ").trim();
          const leafText = el.children.length === 0 ? (el.textContent || "").replace(/\s+/g, " ").trim() : own;
          if (!KEEP.has(tag) && !el.id && !leafText && !(typeof el.className === "string" && el.className.trim())) continue;
          const text = (leafText || el.getAttribute("aria-label") || el.getAttribute("alt") || "").slice(0, 60);
          out.push([Math.round(r.left + scrollX), Math.round(r.top + scrollY), Math.round(r.width), Math.round(r.height), name(el), text]);
          if (out.length >= 1500) break;
        }
        return { width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight, elements: out };
      });
      fs.writeFileSync(path.join(outDir, `${slug}-${vp.name}-layout.json`), JSON.stringify(layout));
    }
    pageReport.viewports.push({ name: vp.name, ...data });
    await ctx.close();
  }

  // probe a 404
  if (!report.notFound) {
    const probe = new URL("/__unslop_check_404__", baseUrl).href;
    if (/^https?:/.test(probe)) {
      const ctx = await browser.newContext();
      const p = await ctx.newPage();
      const resp = await p.goto(probe, { waitUntil: "domcontentloaded", timeout: 30000 }).catch(() => null);
      const text = resp ? (await p.evaluate(() => document.body?.innerText || "")).slice(0, 200) : "";
      report.notFound = { status: resp?.status() ?? null, looksLikeA404: /404|not found|no existe|no encontrad/i.test(text), sample: text.replace(/\s+/g, " ").slice(0, 120) };
      await ctx.close();
    }
  }
  report.pages.push(pageReport);
}
await browser.close();
fs.writeFileSync(path.join(outDir, "page_check.json"), JSON.stringify(report, null, 2));

// ---- human summary
const issues = [];
const vpIssues = new Map();
const byVp = (k, name) => vpIssues.set(k, [...(vpIssues.get(k) || []), name]);
for (const p of report.pages) {
  console.log(`\n# ${p.url}`);
  const m = p.meta || {};
  console.log(`title: ${m.title || "(missing)"}`);
  console.log(`description: ${m.description ? m.description.length + " chars" : "(missing)"}`);
  console.log(`favicon: ${m.favicon ? "yes" : "(missing)"} · apple-touch-icon: ${m.appleTouchIcon ? "yes" : "no"} · theme-color: ${m.themeColor || "no"} · og:image: ${m.ogImage ? "yes" : "no"}`);
  if (!m.title) issues.push("missing title");
  if (!m.description) issues.push("missing meta description");
  if (!m.favicon) issues.push("missing favicon");
  if (!m.viewport) issues.push("missing viewport meta");
  for (const v of p.viewports) {
    const flag = v.overflow ? `OVERFLOW (${v.scrollWidth}px > ${v.viewportWidth}px)` : "no overflow";
    console.log(`${v.name}: ${flag}${v.smallTapTargets.length ? ` · ${v.smallTapTargets.length} small tap targets` : ""}${v.hiddenNavWithoutToggle ? " · nav hidden with no menu toggle" : ""}`);
    for (const o of v.offenders.slice(0, 4)) console.log(`   ↳ ${o.el} right=${o.right}px`);
    if (v.overflow) byVp("horizontal overflow", v.name);
    if (v.hiddenNavWithoutToggle) byVp("nav hidden without a mobile menu toggle", v.name);
    if (v.smallTapTargets.length) byVp("tap targets smaller than 44px", v.name);
    for (const t of v.smallTapTargets.slice(0, 3)) console.log(`   ↳ small: ${t}`);
  }
  for (const [k, vps] of vpIssues) issues.push(`${k} (${vps.join(", ")})`);
  vpIssues.clear();
  const l = p.links || {};
  for (const [k, label] of [["deadHref", "dead links"], ["missingAnchors", "anchors without target"], ["broken", "broken internal links"], ["plainEmails", "emails not linked"]]) {
    if (l[k]?.length) {
      console.log(`${label}: ${l[k].length}`);
      l[k].slice(0, 5).forEach((x) => console.log(`   ↳ ${x}`));
      issues.push(`${l[k].length} ${label}`);
    }
  }
  if (p.consoleErrors.length) {
    console.log(`console errors: ${p.consoleErrors.length}`);
    p.consoleErrors.slice(0, 5).forEach((x) => console.log(`   ↳ ${x}`));
    issues.push(`${p.consoleErrors.length} console errors`);
  }
}
if (report.notFound) {
  const nf = report.notFound;
  console.log(`\n404 probe: status ${nf.status}, ${nf.looksLikeA404 ? "shows a not-found page" : "does NOT look like a 404 page"} — "${nf.sample}"`);
  if (!nf.looksLikeA404) issues.push("no 404 page (unknown URL does not show a not-found page)");
}
const unique = [...new Set(issues)];
console.log(`\n${unique.length ? unique.length + " issue(s):\n- " + unique.join("\n- ") : "No ship-readiness issues found."}`);
console.log(`\nSaved ${path.join(outDir, "page_check.json")}${shots ? " and screenshots" : ""}.`);
