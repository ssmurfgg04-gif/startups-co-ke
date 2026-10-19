#!/usr/bin/env python3
"""Download the three brand fonts from Google Fonts as woff2 into public/fonts/
and print the @font-face CSS block (urls rewritten to /fonts/<file>).

Fonts: Fraunces (variable, normal+italic), Archivo (variable),
IBM Plex Mono (400/500/600). Latin subset only — site is English.
"""
import re
import urllib.request
from pathlib import Path

UA = ("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")

CSS_URLS = [
    # Fraunces variable, both styles (keeps opsz+wght axes)
    ("fraunces", "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&display=swap"),
    # Archivo variable (wght)
    ("archivo", "https://fonts.googleapis.com/css2?family=Archivo:ital,wght@0,100..900;1,100..900&display=swap"),
    # IBM Plex Mono static weights
    ("plexmono", "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&display=swap"),
]

OUT = Path(__file__).resolve().parent.parent / "public" / "fonts"
OUT.mkdir(parents=True, exist_ok=True)


def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read().decode("utf-8")


def fetch_bin(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=120) as r:
        return r.read()


css_out: list[str] = []
seen_urls: set[str] = set()

for prefix, css_url in CSS_URLS:
    css = fetch(css_url)
    # split into blocks with a preceding /* subset */ comment
    blocks = re.findall(r"/\*\s*([a-z0-9-]+)\s*\*/\s*(@font-face\s*\{[^}]+\})", css)
    if not blocks:  # some responses have no subset comments (single block = latin)
        blocks = [("latin", b) for b in re.findall(r"@font-face\s*\{[^}]+\}", css)]
    for subset, block in blocks:
        if subset not in ("latin", "latin-ext"):
            continue
        if subset == "latin-ext":
            continue  # keep bundle lean; site is English
        style = "italic" if "font-style: italic" in block else "normal"
        weight = re.search(r"font-weight:\s*([^;]+);", block).group(1).strip().replace(" ", "-")
        m = re.search(r"url\((https://[^)]+\.woff2)\)", block)
        if not m:
            continue
        url = m.group(1)
        if url in seen_urls:
            continue
        seen_urls.add(url)
        name = f"{prefix}-{weight}-{style}.woff2".lower()
        data = fetch_bin(url)
        (OUT / name).write_bytes(data)
        # rebuild the block with our local URL + swap
        block_local = re.sub(r"src:\s*url\([^)]+\)\s*format\('woff2'\);",
                             f"src: url('/fonts/{name}') format('woff2');", block)
        block_local = re.sub(r"unicode-range:[^;]+;", "", block_local)
        css_out.append(block_local.strip())
        print(f"{name}  {len(data)//1024} KB")

css_file = OUT / "fonts.css"
css_file.write_text("/* Self-hosted brand fonts — referenced by src/styles/global.css.\n"
                    "   Files are immutable-cached via netlify.toml /fonts/* rule. */\n\n"
                    + "\n\n".join(css_out) + "\n")
print(f"\nwrote {css_file} with {len(css_out)} @font-face blocks")
