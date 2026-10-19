#!/usr/bin/env python3
"""Refresh TRENDS in src/data/ecosystem.ts from Google Trends KE daily RSS (D8: raw endpoint, zero deps)."""
import re, urllib.request, datetime, os

# Repo-root relative so the script runs locally AND in CI (it used to carry
# absolute sandbox paths that made the workflow line fail silently).
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
XML = os.path.join(ROOT, "research", "gtrends-fresh.xml")
TS = os.path.join(ROOT, "src", "data", "ecosystem.ts")

req = urllib.request.Request("https://trends.google.com/trending/rss?geo=KE", headers={"User-Agent": "Mozilla/5.0"})
xml = urllib.request.urlopen(req, timeout=20).read().decode("utf-8", "ignore")
open(XML, "w").write(xml)

items = re.findall(r"<title>(.*?)</title>", xml)[1:]  # skip channel title
vols = re.findall(r"<ht:approx_traffic>(.*?)</ht:approx_traffic>", xml)

def clean(s):
    s = (s.replace("&apos;", "\u2019").replace("&amp;", "&").replace("&quot;", '"')
          .replace("&lt;", "<").replace("&gt;", ">")).strip()
    return s

def vol(v):
    v = v.strip().rstrip("+")  # "1,000+" -> "1,000"
    return v + "+"

trends = [(clean(t), vol(v)) for t, v in zip(items, vols + ["1K"] * len(items))][:10]

today = datetime.date.today().strftime("%b %d, %Y")
lines = "\n".join([f"  {{ keyword: '{k.replace(chr(39), chr(39)*2)}', volume: '{v}' }}," for k, v in trends])

s = open(TS).read()
s = re.sub(r"/\*\* Real consumer-interest snapshot \(Google Trends KE RSS, [^*]+\)\*/",
           f"/** Real consumer-interest snapshot (Google Trends KE RSS, {today}) */", s)
s = re.sub(r"export const TRENDS: \{ keyword: string; volume: string \}\[\] = \[.*?\];",
           f"export const TRENDS: {{ keyword: string; volume: string }}[] = [\n{lines}\n];", s, flags=re.S)
open(TS, "w").write(s)
print(f"TRENDS refreshed {today}:")
for k, v in trends: print(f"  {k} — {v}")
