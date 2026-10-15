#!/usr/bin/env python3
"""SEO + WhatsApp share audit over the built dist/."""
import json, re, html, os, glob

DIST = "/home/z/my-project/dist"
issues, ok = [], []

def check(name, cond, detail):
    (ok if cond else issues).append(f"{name}: {detail}")

pages = sorted(glob.glob(f"{DIST}/**/*.html", recursive=True))
check("page count", len(pages) >= 38, f"{len(pages)} html files in dist")

# Key pages meta audit
KEYS = {
    "index.html": ("startups.co.ke", "Kenya"),
    "startups/index.html": ("Startup", "Kenya"),
    "startups/m-kopa/index.html": ("M-KOPA", None),
    "investors/index.html": ("Investor", "Kenya"),
    "funding/index.html": ("Funding", "Kenya"),
    "jobs/index.html": ("jobs", None),
    "hackathons/index.html": ("hackathon", None),
    "news/index.html": ("news", None),
    "news/sh93bn-lesson/index.html": ("Sh93bn", None),
    "research/index.html": ("Research", None),
    "privacy/index.html": ("Privacy", None),
    "404.html": (None, None),
}
for rel, (tmust, dmust) in KEYS.items():
    p = os.path.join(DIST, rel)
    if not os.path.exists(p):
        issues.append(f"{rel}: MISSING PAGE")
        continue
    s = open(p, encoding="utf-8").read()
    title = re.search(r"<title[^>]*>(.*?)</title>", s, re.S)
    desc = re.search(r'<meta name="description" content="([^"]*)"', s)
    canonical = re.search(r'<link rel="canonical" href="([^"]*)"', s)
    ogtitle = re.search(r'<meta property="og:title" content="([^"]*)"', s)
    ogimg = re.search(r'<meta property="og:image" content="([^"]*)"', s)
    ogdesc = re.search(r'<meta property="og:description" content="([^"]*)"', s)
    h1 = re.search(r"<h1[^>]*>(.*?)</h1>", s, re.S)
    check(f"{rel} title", bool(title) and 25 <= len(html.unescape(title.group(1))) <= 65, html.unescape(title.group(1))[:70] if title else "none")
    check(f"{rel} desc", bool(desc) and 70 <= len(html.unescape(desc.group(1))) <= 200, (desc.group(1)[:60] + "…") if desc else "none")
    check(f"{rel} canonical", bool(canonical), canonical.group(1) if canonical else "none")
    check(f"{rel} og:image absolute", bool(ogimg) and ogimg.group(1).startswith("http"), ogimg.group(1)[:60] if ogimg else "none")
    check(f"{rel} h1", bool(h1), html.unescape(re.sub(r"<[^>]+>", "", h1.group(1)))[:60] if h1 else "none")
    if tmust:
        check(f"{rel} title keyword", tmust.lower() in title.group(1).lower(), f"'{tmust}'")
    # JSON-LD validity
    for i, m in enumerate(re.findall(r'<script type="application/ld\+json">(.*?)</script>', s, re.S)):
        try:
            json.loads(m)
        except Exception as e:
            issues.append(f"{rel} jsonld[{i}]: PARSE FAIL {e}")

# WhatsApp specifics
og = open(os.path.join(DIST, "og.png"), "rb").read()
check("og.png exists", len(og) > 10000, f"{len(og)} bytes")
check("og.png <300KB (fast WA preview)", len(og) < 300_000, f"{len(og)} bytes")
try:
    from PIL import Image
    im = Image.open(os.path.join(DIST, "og.png"))
    check("og.png 1200x630", im.size == (1200, 630), str(im.size))
except Exception as e:
    issues.append(f"og.png open: {e}")

# WhatsApp share links present?
home = open(os.path.join(DIST, "index.html"), encoding="utf-8").read()
art = open(os.path.join(DIST, "news/sh93bn-lesson/index.html"), encoding="utf-8").read()
check("wa.me share links", "wa.me" in art or "api.whatsapp.com" in art, "article share buttons")
check("og:type article", '<meta property="og:type" content="article"' in art, "")
check("article:published_time", "article:published_time" in art, "")

# infra files
for f in ["sitemap-index.xml", "rss.xml", "robots.txt"]:
    check(f, os.path.exists(os.path.join(DIST, f)), "exists" if os.path.exists(os.path.join(DIST, f)) else "MISSING")
robots = open(os.path.join(DIST, "robots.txt")).read() if os.path.exists(os.path.join(DIST, "robots.txt")) else ""
check("robots sitemap ref", "sitemap" in robots, robots.split("\n")[0] if robots else "empty")
sm = open(os.path.join(DIST, "sitemap-index.xml")).read() if os.path.exists(os.path.join(DIST, "sitemap-index.xml")) else ""
check("sitemap-index has loc", "<loc>" in sm, f"{sm.count('<loc>')} locs")

print("=== PASS ===")
for o in ok: print(" ✓", o)
print(f"\n=== ISSUES ({len(issues)}) ===")
for i in issues: print(" ✗", i)
