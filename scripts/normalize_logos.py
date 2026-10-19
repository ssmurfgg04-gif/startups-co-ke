#!/usr/bin/env python3
"""Normalize logos: convert ICO->PNG, upgrade tiny logos, validate all."""
import os, subprocess, io
from PIL import Image

LOGOS = "/home/z/my-project/public/logos"

def fetch(url, dest):
    subprocess.run(["curl", "-sL", "-o", dest, "--max-time", "15", url], check=False)
    try:
        return os.path.getsize(dest)
    except OSError:
        return 0

def valid_png(path, min_px=0):
    try:
        im = Image.open(path); im.load()
        return im.width >= min_px
    except Exception:
        return False

# 1) Convert non-PNG (ICO) files to PNG
for f in sorted(os.listdir(LOGOS)):
    p = os.path.join(LOGOS, f)
    if not f.endswith(".png"):
        continue
    try:
        im = Image.open(p)
        if im.format and im.format.upper() != "PNG":
            im.convert("RGBA").save(p, "PNG")
            print(f"converted {f} ({im.format})")
    except Exception as e:
        print(f"BROKEN {f}: {e}")
        os.remove(p)

# 2) Upgrade tiny logos (<=32px) via duckduckgo/clearbit
UPGRADES = {
    "pesapal": "pesapal.com", "flexpay": "flexpay.co.ke", "tanda": "tanda.co.ke",
    "iprocure": "iprocure.co.ke", "marketforce": "marketforce.io", "turaco": "turaco.co.ke",
    "delta40": "delta40.earth", "cellulant": "cellulant.io", "ilara": "ilarahealth.com",
    "antler": "antler.co", "flourish": "flourishventures.com", "renew": "renewcapital.com",
    "m-kopa": "m-kopa.com", "sunculture": "sunculture.com", "pula": "pula-advisors.com",
    "novastar": "novastarventures.com", "tlcom": "tlcomcapital.com", "wasoko": "wasoko.com",
}
for slug, domain in UPGRADES.items():
    p = os.path.join(LOGOS, f"{slug}.png")
    cur = 0
    if os.path.exists(p):
        try: cur = Image.open(p).width
        except Exception: cur = 0
    if cur >= 96:
        continue
    tmp = p + ".tmp"
    ok = False
    for url in (f"https://icons.duckduckgo.com/ip3/{domain}.ico",
                f"https://logo.clearbit.com/{domain}?size=128"):
        if fetch(url, tmp) >= 800 and valid_png(tmp, 64):
            im = Image.open(tmp).convert("RGBA")
            im.save(p, "PNG")
            print(f"upgraded {slug} -> {im.size} via {url.split('/')[2]}")
            ok = True
            break
    if not ok and os.path.exists(tmp):
        os.remove(tmp)
    if os.path.exists(tmp):
        os.remove(tmp)

# 3) Final report
print("--- final inventory ---")
for f in sorted(os.listdir(LOGOS)):
    p = os.path.join(LOGOS, f)
    try:
        im = Image.open(p); im.load()
        print(f"{f}: {im.size} {im.format}")
    except Exception:
        print(f"{f}: INVALID - removed")
        os.remove(p)
