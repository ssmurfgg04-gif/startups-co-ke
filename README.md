# startups.co.ke — Kenya's Startup Ecosystem & Business Intelligence Hub

Live: **https://startups.co.ke** (GitHub Pages + CNAME; DNS steps below)
Preview (until DNS lands): https://ssmurfgg04-gif.github.io/startups-co-ke/

## What this is
A single-file app (`index.html`) — no build step, works by double-click — over a Supabase backend (auth + Postgres + storage). Real, sourced data only: every funding figure carries a status (Confirmed / Reported / Estimated) and a source. Failure states are tracked (Twiga — in administration; Copia — in liquidation; Sendy — shut down). See `docs/DECISIONS.md` (D2) for the honesty system.

## Repo layout
- `index.html` — the entire site (HTML + CSS + JS)
- `tools/` — schema.sql, seed.sql, run_sql.py (Supabase Management API runner)
- `docs/` — SPEC.md (product spec), DECISIONS.md (why everything is the way it is)
- `research/` — raw research captures (search results, Google News RSS, arXiv, Trends)
- `skills/taste-skill/` — vendored design-taste skill (MIT, Leonxlnx) used for the visual QA loop
- `qa/` — screenshots, VLM reviews, E2E reports

## Go live on your domain (startups.co.ke)
1. GitHub repo → Settings → Pages: already enabled (branch `main`, `/root`).
2. At your registrar, point DNS:
   - `A` @ → 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153
   - `CNAME` www → ssmurfgg04-gif.github.io
3. Wait for DNS; HTTPS is automatic. `CNAME` file in this repo already claims the domain.

## Backend (Supabase)
Project ref `eezqpsbhmnhuhnmiwnsz` (eu-west-2). Keys live in repo **Actions secrets** (never files). RLS: public read on data tables; user tables are auth-scoped. Storage bucket `logos` (public read, user-scoped writes).

## Contact
jack@startups.co.ke · +254 721 725 958 · WhatsApp wa.me/254721725958
