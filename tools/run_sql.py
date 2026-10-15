#!/usr/bin/env python3
"""Run a .sql file against the startups-co-ke Supabase project via the Management API."""
import json, sys, os

REF = "eezqpsbhmnhuhnmiwnsz"
TOKEN = open("/home/z/my-project/.secrets/sb_token").read().strip()

def run_sql(path: str) -> None:
    sql = open(path, encoding="utf-8").read()
    payload = json.dumps({"query": sql})
    import urllib.request
    req = urllib.request.Request(
        f"https://api.supabase.com/v1/projects/{REF}/database/query",
        data=payload.encode(),
        headers={"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            body = r.read().decode()
            print(f"OK {path}: {body[:300] or '(no rows returned)'}")
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f"FAIL {path}: HTTP {e.code}\n{body[:1500]}")
        sys.exit(1)

if __name__ == "__main__":
    for p in sys.argv[1:]:
        run_sql(p)
