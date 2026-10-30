#!/usr/bin/env python3
"""Scan UI source files for common "AI slop" tells.

Usage:
    python slop_audit.py <file-or-dir> [more paths...] [--json]

Finds: emoji in UI, gradients and gradient text, purple/violet palettes,
coloured glow shadows, glassmorphism, hype copy, exclamation marks,
off-scale spacing, too many font sizes / radii, uppercase tracked labels.
Prints a score (higher = more slop) and findings with file:line locations.
No dependencies beyond the Python standard library.
"""
import colorsys
import json
import os
import re
import sys
from collections import defaultdict

EXTS = {".html", ".htm", ".css", ".scss", ".sass", ".less", ".js", ".jsx",
        ".ts", ".tsx", ".vue", ".svelte", ".astro", ".mdx"}
SKIP_DIRS = {"node_modules", ".git", "dist", "build", ".next", ".nuxt",
             ".svelte-kit", "out", "coverage", ".turbo", "vendor"}

EMOJI = re.compile(
    "[\U0001F300-\U0001FAFF\U0001F000-\U0001F2FF☀-➿⭐⬆⬇⤴⤵]"
)
EMOJI_OK = set("✓✔✕✖✗✘")  # check / cross marks

RULES = [
    # key, label, weight, regex
    ("gradient", "Gradient", 2,
     re.compile(r"(linear|radial|conic)-gradient\(|\bbg-gradient-to-\w+|\bbg-(linear|radial|conic)-", re.I)),
    ("gradient_text", "Gradient text", 4,
     re.compile(r"background-clip\s*:\s*text|\bbg-clip-text\b|-webkit-text-fill-color\s*:\s*transparent", re.I)),
    ("purple_tw", "Purple/violet/indigo/fuchsia utility", 2,
     re.compile(r"\b(?:bg|text|from|via|to|border|ring|shadow|fill|stroke)-(?:purple|violet|indigo|fuchsia)-\d{2,3}\b")),
    ("glow_tw", "Coloured glow shadow utility", 3,
     re.compile(r"\bshadow-(?!sm\b|md\b|lg\b|xl\b|2xl\b|inner\b|none\b)[a-z]+-\d{2,3}(?:/\d+)?\b")),
    ("blur", "Backdrop blur / glassmorphism", 1,
     re.compile(r"backdrop-filter\s*:\s*blur|\bbackdrop-blur(?:-\w+)?\b", re.I)),
    ("uppercase", "Uppercase tracked label", 1,
     re.compile(r"\buppercase\b[^\"'`\n]{0,80}\btracking-(?:wide|wider|widest)\b|\btracking-(?:wide|wider|widest)\b[^\"'`\n]{0,80}\buppercase\b|text-transform\s*:\s*uppercase", re.I)),
    ("hype", "Hype / generic copy", 3,
     re.compile(r"\b(?:AI[- ]powered|supercharge\w*|unlock (?:your|the)|seamless(?:ly)?|next[- ]level|revolutioni[sz]e\w*|elevate your|game[- ]chang\w+|welcome back|ready for today|search anything|cutting[- ]edge|blazing[- ]fast|effortless(?:ly)?)\b", re.I)),
    ("exclaim", "Exclamation in UI copy", 2,
     re.compile(r"[A-Za-z0-9%)]!+(?=\s*(?:<|\"|'|`|\{|$))|!!")),
    ("arbitrary_tw", "Arbitrary Tailwind value", 1,
     re.compile(r"\b(?:p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|gap-x|gap-y|space-x|space-y|text|rounded|w|h|top|left|right|bottom|inset)-\[[^\]]+\]")),
]

CSS_SPACING = re.compile(r"\b(?:padding|margin|gap|row-gap|column-gap|inset|top|left|right|bottom)(?:-[a-z]+)?\s*:\s*([^;}{\n]+)", re.I)
TW_SPACING_ARB = re.compile(r"\b(?:p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|gap-x|gap-y|space-x|space-y)-\[(-?\d+(?:\.\d+)?)px\]")
PX = re.compile(r"(-?\d+(?:\.\d+)?)px")
CSS_FONT_SIZE = re.compile(r"font-size\s*:\s*([\d.]+(?:px|rem|em))", re.I)
TW_FONT_SIZE = re.compile(r"\btext-(xs|sm|base|lg|xl|[2-9]xl|\[[\d.]+(?:px|rem)\])(?=[\s\"'`])")
CSS_RADIUS = re.compile(r"border-radius\s*:\s*([^;}{\n]+)", re.I)
TW_RADIUS = re.compile(r"\brounded(?:-(?:none|sm|md|lg|xl|2xl|3xl|full|\[[^\]]+\]))?(?=[\s\"'`])")
HEX = re.compile(r"#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b")
CSS_SHADOW = re.compile(r"box-shadow\s*:\s*([^;}{\n]+)", re.I)
RGBA = re.compile(r"rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)")


def is_purple(hexstr):
    h = hexstr if len(hexstr) == 6 else "".join(c * 2 for c in hexstr)
    r, g, b = (int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
    hue, light, sat = colorsys.rgb_to_hls(r, g, b)
    return 0.68 <= hue <= 0.90 and sat >= 0.4 and 0.2 <= light <= 0.8


def is_coloured(r, g, b):
    return max(r, g, b) - min(r, g, b) > 40


def iter_files(paths):
    for p in paths:
        if os.path.isfile(p):
            yield p
            continue
        for root, dirs, files in os.walk(p):
            dirs[:] = [d for d in dirs if d not in SKIP_DIRS and not d.startswith(".")]
            for f in files:
                if os.path.splitext(f)[1].lower() in EXTS and not f.endswith((".min.js", ".min.css")):
                    yield os.path.join(root, f)


def audit(paths):
    findings = defaultdict(list)          # key -> [(loc, snippet)]
    spacing_values = defaultdict(list)    # px value -> [loc]
    font_sizes, radii = defaultdict(int), defaultdict(int)
    files = 0

    for path in iter_files(paths):
        try:
            with open(path, encoding="utf-8", errors="ignore") as fh:
                lines = fh.read().splitlines()
        except OSError:
            continue
        files += 1
        for n, line in enumerate(lines, 1):
            loc = f"{path}:{n}"
            snip = line.strip()[:120]

            emojis = [c for c in EMOJI.findall(line) if c not in EMOJI_OK]
            if emojis:
                findings["emoji"].append((loc, "".join(dict.fromkeys(emojis)) + "  " + snip))

            for key, _label, _w, rx in RULES:
                if key == "exclaim" and ("!important" in line or "!=" in line):
                    stripped = line.replace("!important", "").replace("!==", "").replace("!=", "")
                    if not rx.search(stripped):
                        continue
                if rx.search(line):
                    findings[key].append((loc, snip))

            for m in HEX.finditer(line):
                if is_purple(m.group(1)):
                    findings["purple_hex"].append((loc, "#" + m.group(1) + "  " + snip))

            for m in CSS_SHADOW.finditer(line):
                for r, g, b in RGBA.findall(m.group(1)):
                    blur = [float(v) for v in PX.findall(m.group(1))]
                    if is_coloured(int(r), int(g), int(b)) and any(v >= 16 for v in blur):
                        findings["glow_css"].append((loc, snip))
                        break

            for m in CSS_SPACING.finditer(line):
                for v in PX.findall(m.group(1)):
                    spacing_values[abs(float(v))].append(loc)
            for v in TW_SPACING_ARB.findall(line):
                spacing_values[abs(float(v))].append(loc)

            for v in CSS_FONT_SIZE.findall(line):
                font_sizes[v] += 1
            for v in TW_FONT_SIZE.findall(line):
                font_sizes["text-" + v] += 1
            for m in CSS_RADIUS.finditer(line):
                radii[m.group(1).strip()] += 1
            for m in TW_RADIUS.finditer(line):
                radii[m.group(0)] += 1

    off_scale = {v: locs for v, locs in spacing_values.items() if v > 2 and v % 4 != 0}
    for v, locs in sorted(off_scale.items()):
        findings["off_scale"].append((locs[0], f"{v:g}px used {len(locs)}x (not on 4px scale)"))

    weights = {k: w for k, _l, w, _r in RULES}
    weights.update({"emoji": 3, "purple_hex": 2, "glow_css": 3, "off_scale": 2})
    labels = {k: l for k, l, _w, _r in RULES}
    labels.update({"emoji": "Emoji in UI", "purple_hex": "Saturated purple/violet hex",
                   "glow_css": "Coloured glow box-shadow", "off_scale": "Off-scale spacing value"})

    score = sum(min(len(v), 15) * weights[k] for k, v in findings.items())
    extra = []
    if len(font_sizes) > 6:
        score += (len(font_sizes) - 6) * 2
        extra.append(f"{len(font_sizes)} distinct font sizes (target <= 6): {', '.join(sorted(font_sizes))}")
    if len(radii) > 4:
        score += (len(radii) - 4) * 2
        extra.append(f"{len(radii)} distinct radius values (target <= 4): {', '.join(sorted(radii))}")

    return {
        "files_scanned": files,
        "score": score,
        "rating": "clean" if score < 10 else "mild" if score < 40 else "sloppy" if score < 120 else "very sloppy",
        "summary": {labels[k]: len(v) for k, v in sorted(findings.items(), key=lambda kv: -len(kv[1]) * weights[kv[0]])},
        "system": extra,
        "findings": {labels[k]: [{"loc": loc, "text": t} for loc, t in v] for k, v in findings.items()},
    }


def print_report(r, limit=8):
    print(f"# Slop audit\n\nFiles scanned: {r['files_scanned']}")
    print(f"Score: {r['score']}  ({r['rating']})  -- lower is better\n")
    if not r["summary"] and not r["system"]:
        print("No code-level tells found. Still review the rendered UI for hierarchy and copy.")
        return
    print("## Summary")
    for label, count in r["summary"].items():
        print(f"- {label}: {count}")
    for s in r["system"]:
        print(f"- {s}")
    print("\n## Findings")
    for label, items in r["findings"].items():
        print(f"\n### {label} ({len(items)})")
        for it in items[:limit]:
            print(f"- {it['loc']}  {it['text']}")
        if len(items) > limit:
            print(f"- ... {len(items) - limit} more")


def main(argv):
    args = [a for a in argv if not a.startswith("--")]
    if not args:
        print(__doc__)
        return 2
    report = audit(args)
    if "--json" in argv:
        print(json.dumps(report, indent=2, ensure_ascii=False))
    else:
        print_report(report)
    return 0


if __name__ == "__main__":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except AttributeError:
        pass
    sys.exit(main(sys.argv[1:]))
