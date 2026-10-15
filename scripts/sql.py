#!/usr/bin/env python3
"""Ad-hoc SQL query helper for the startups-co-ke Supabase project (Management API)."""
import json, sys, urllib.request

REF = "eezqpsbhmnhuhnmiwnsz"
TOKEN = open("/home/z/my-project/.secrets/sb_token").read().strip()

def query(sql: str):
    req = urllib.request.Request(
        f"https://api.supabase.com/v1/projects/{REF}/database/query",
        data=json.dumps({"query": sql}).encode(),
        headers={"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"},
        method="POST",
    )
    try:
        return json.loads(urllib.request.urlopen(req, timeout=120).read().decode())
    except urllib.error.HTTPError as e:
        return {"error": e.read().decode()[:800]}

if __name__ == "__main__":
    print(json.dumps(query(sys.argv[1]), indent=1)[:2000])
