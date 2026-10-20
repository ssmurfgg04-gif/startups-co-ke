# DECISIONS — startups.co.ke (log of spec & architecture decisions)

Living document. Everything non-obvious we decided, and why. Date base: **2026-10-15 (EAT)**. Owner contact: see the site's `/contact` page (not duplicated in this repo).

## D1. Architecture — single self-contained HTML file + Supabase

> **Superseded (2026-10-19):** the site is now **Astro 5 (static output) on Cloudflare Workers**, not a single `index.html` on GitHub Pages. Backend stays Supabase, but every write goes through the Worker with the service key; the browser never writes with the anon key. Auth is password-first with an email-link alternative. See `docs/ARCHITECTURE.md` for the current map. The bullets below are kept as history.

- `index.html` at repo root, deployed via **GitHub Pages** with `CNAME` = startups.co.ke (see README for the 2 DNS records).
- Backend: **Supabase** project `startups-co-ke` (ref `<project-ref>`), region `eu-west-2` (closest available to Nairobi; af-south-1 not offered on free plan).
- Auth: Supabase built-in email auth. Data: Postgres + RLS. Logos: Supabase Storage bucket `logos`.
- Client loads `@supabase/supabase-js@2` from CDN; data fetched via REST with **anon key** (safe by design — RLS enforced). Service key NEVER leaves `.secrets/` / repo Actions secrets.
- Offline/double-click resilience: a build-time snapshot of the seeded data is embedded in the HTML as fallback; localStorage caches live data.

## D2. "Real, no demo data" — the honesty system, rewritten for real entities
User directive overrides the original spec's fictional-sample system. Transform:
- Figures are **real, sourced and status-tagged**: `Confirmed` (multiple/company statement) / `Reported` (single credible press source) / `Estimated` — with a **Source** column everywhere (TechCabal, Business Daily, Reuters, TechCrunch, PitchBook, Dealroom, Disrupt Africa, Tracxn…).
- `Verified` badge = profile cross-checked against ≥2 independent public sources as of **2026-10-15**. Thin-data profiles are `Unverified` (Roam, Tanda, Flowt).
- Failure states are tracked, not hidden: Twiga (in administration), Copia (in liquidation), Sendy (shut down 2023), Ilara (restructuring). Differentiator vs Tracxn-style inflated listings.
- Every dataset view carries "compiled from public sources · as of {date} · report an issue". Footer + About modal carry the full disclaimer. No "SAMPLE DATA" watermarks — replaced by real status dots + sources.
- Numbers where our own coverage is thin are labeled "coverage gap, not market gap".

## D3. Research findings locked (2026-10-15)
- 2025: Kenya **$984M equity** (Africa #1, 2nd yr running; Tech In Africa / Fintech Assoc. Kenya); **$1.04B incl. debt** (Invest Kenya). 2024 ≈ $647M (derived: "+52% jump", Tech In Africa).
- H1 2026: **Sh16.3B ≈ $126M, −44.5% YoY**, slowest H1 since 2021 (Business Daily, Capital FM, Eastleigh Voice, Khusoko). Africa H1 2026: $1.44B +1.34% (TechCabal insights).
- Failures: **Sh93bn investor losses, 13 collapses** incl. Koko Networks, Lipa Later, Copia, Twiga (Business Daily, Sep 16 2026). Twiga entered administration Aug 17 2026 after **$185.4M** raised. Copia → liquidation (BD Sep 29 2026). Microsoft closing Nairobi ADC (Oct 12 2026).
- Companies seeded (16, all real): M-KOPA $241M/22r (Series F $166M Nov 2025, PitchBook), BasiGo $42.5M, SunCulture $45.5M/8r (+$10M securitisation Sep 2026), Apollo Agriculture $52M+ (Series B $40M SoftBank-led 2022), Pula $26M (Series B $20M BlueOrchard Apr 2024), Cellulant $54.5M, Twiga $185.4M (administration), Sendy (shut 2023), Copia (liquidation), Ilara Health $11.7M (restructuring), HoneyCoin $4.9M seed Aug 2025, Flowt pre-seed Aug 2026 (Delta40/Impacc/Argidius), FlexPay $785K, Tanda (2021 round, undisclosed), Pesapal (bootstrapped-lean, 30K businesses), Roam Electric (funding n/d).
- Investors (13): Novastar (~60 cos), Enza Capital (40+), TLcom, Antler Kenya (→HoneyCoin), BlueOrchard (→Pula), Flourish Ventures (→HoneyCoin), Delta40 (→Flowt), WaterEquity (→SunCulture $5M), Renew Capital (→FlexPay), HAVAÍC (→Tanda), Saviu, Ajim Capital, Villgro Kenya (→Ilara $700K seed).
- Events (real, dated): DevFest Nairobi 2026 Nov 13–14 (GDG Nairobi — featured countdown), GopherCon Africa Oct 15–17 2026, Fintech Festival Kenya Nov 5–6 2026, Africa Blockchain Festival 2026, Start Developer Competition (Oct 10–Nov 1, online), Inter-University Hackathon 2026, MCP DEV Summit, AI Tinkerers Nairobi; past: DevFest Nairobi 2025 (Oct 31–Nov 1), iLabAfrica + TI-Kenya Campaign Finance Watch hackathon.
- Salaries 2026 (sourced: CareerBuddy Jun 2026, Mctaba Jun 2026, WageIndicator 2026): juniors KSh 50–130K, mid 100–250K, senior 250–400K+.
- arXiv methodology citations: 2401.05760 "Follow The Money: Key Factors Influencing Investment in African Startups"; 2408.09420 (GraphRAG startup-success prediction); 2410.03552 (LATAM AI startup risk ranking).
- Google Trends KE snapshot (Oct 15 2026): fuel 5000+, Dangote 1000+, disease outbreak 1000+, teacher 500+… (consumer stats wire module).

## D4. Competitor scan → positioning
- Global: PitchBook (institutional, $$), Crunchbase (broad, noisy), Tracxn (claims **13,642** Kenyan startups — inflated vs StartupBlink's **659**; our status system exists precisely for this).
- Africa: The Big Deal/Magnet ($100K+ deals DB, weekly substack), WeeTracker (media+data), StartupList Africa, StartupBlink (rank-based).
- **TrustMRR** (studied per user directive): verified-revenue badges + Trust Score for indie startups — we borrow the *verified framing*, applied to funding figures and employer records instead of MRR (Kenyan startups rarely disclose MRR; funding is the public currency).
- Our wedge: Kenya-first depth · source-visible statuses (Confirmed/Reported/Estimated) · failure tracking · KSh pricing for the local market · WhatsApp-native sharing.

## D5. Logos
- Real logos via `https://unavatar.io/{domain}` (aggregates favicon/official sources) with **monogram-tile fallback** (sector-colored square + 2-letter mono initials) on error — no broken images, ever.
- Users claim a profile → upload own logo → `logos` bucket → `logo_claims` row (status `pending`) → admin approves in Supabase dashboard → becomes `companies.logo_url`. Safe by default (no anonymous overrides of public data).

## D6. SEO & sharing
- Keywords (Google suggest, Oct 2026): "startups in kenya / hiring / 2025", "grants for startups in kenya", "tech startups in kenya", "funding for startups in kenya", "ai startups in kenya", "fintech startups in kenya", "kenya startup funding 2025", "tech jobs nairobi", "hackathons in kenya 2025/2026", "upcoming hackathons in kenya", "angel investors in kenya", "impact investors in kenya" — woven naturally into copy.
- JSON-LD: Organization, WebSite+SearchAction, ItemList, Article, JobPosting, Event, Dataset (funding DB). og:locale en_KE, OG image 1200×630 designed in-house. WhatsApp share buttons (`wa.me`) on articles/companies + `navigator.share`.
- E-E-A-T: methodology page, named author (desk), per-figure sources, "report an issue" flows — explained in an HTML comment block.

## D7. Taste layer (leonlix/taste-skill, MIT — consulted, not vendored)
> **Note (2026-10-20):** the vendored `skills/taste-skill/` copy was removed from the repo (it is a third-party skill tree, not app code). The protocol it established is now simply the house style — tokens in `src/styles/`, copy rules in this section.
- Applied `minimalist-ui` protocol + `full-output-enforcement` onto the user's exact brand spec (paper/ink/green tokens, Fraunces/Archivo/IBM Plex Mono). Banned-clichés list enforced in all copy (no "Elevate/Seamless/Unleash/Next-Gen/Delve", no lorem, no emoji in UI).
- Self-review loop = taste-skill's "check your own work in a browser": agent-browser screenshots at 3 widths + VLM critique rounds + fix top issues.

## D8. Ops notes
- Google News RSS (not scrape-robots) + web-search for research; no IP-rotation runners (ToS risk) — authenticated GitHub API covered rate limits.
- trendspyg had install friction; used Google Trends RSS endpoint directly (same data, zero deps).
- Secrets: `.secrets/` (gitignored) + GitHub repo **Actions secrets** (SUPABASE_SERVICE_KEY, SUPABASE_DB_PASSWORD, GH_TOKEN) via API — never in files.
- Pricing presented as real launch pricing (Explorer KSh 0 / Professional KSh 2,900 / Institution KSh 24,500 per month; jobs: Featured KSh 25,000 / Standard 12,000 / Internship 6,000). Payment on launch = invoice/M-Pesa, arranged with the desk; card flows later.
- Support: via the site's `/contact` page (email, phone, WhatsApp). Privacy policy at #/privacy + cookie consent (essential + first-party analytics categories; analytics events table, no third-party trackers).

## D9. Real-data migration completed (Oct 15, 2026 — session 2)
- **Source of truth**: `src/data/*.ts` (typed, build-time) — 21 real companies incl. failure states (Twiga administration, Copia liquidation, Sendy shutdown, iProcure administration, Ilara restructuring), 13 investors, 8 real jobs, 12 real dated events, 20 tracked rounds, real salary bands, real wire. The DB seed (`tools/seed.sql`, 16 companies) remains applied to Supabase for the future API layer; TS layer is canonical and supersedes it.
- Added companies beyond seed: Wasoko ($152M/13r), iProcure (administration Apr 2025), Turaco ($13.2M), MarketForce ($42.5M), CarePay (M-TIBA, not tracked funding).
- **Logos**: 24 real logos fetched (unavatar.io → direct favicon → Google s2 → apple-touch-icon), normalized to PNG in `public/logos/`. Dead companies intentionally have no logo (monogram tiles). `Monogram.astro` renders logo with global error→monogram fallback (never broken).
- **Trends**: `scripts/refresh_trends.py` pulls Google Trends KE daily RSS (raw endpoint per D8) into `TRENDS` (research page consumer pulse + wire item).
- **Research page**: arXiv methodology citations (2401.05760, 2408.09420, 2410.03552), consumer-pulse trends rail, competitor-counts positioning note; FAQPage JSON-LD (4 real Q&As).
- **VLM cycle (10 rounds, taste loop D7)**: scores 4–7.5/10 → 8.5–9.5/10 after fixes. Key fixes: directory null-`raised` crash (grid rendered 0 rows), JS-gated reveals (no-JS = visible), cookie banner restyled to brand paper card + offset shadow, funding table sorted desc + H1-2026 partial note, chip system re-inked, tabular-nums. Full log: `qa/vlm/SUMMARY.md` + per-round critiques.
- **E2E personas (qa/e2e-report.md)**: investor + founder journeys against live Supabase, all writes DB-verified. Caught and fixed a real bug: postjob modal heading `<p id="pj-title">` collided with the Role-title input id → submission silently blocked. Zero duplicate ids now (script-scanned).
- **SEO**: titles tightened (home 62c, profiles `— sector startup profile`, hackathons), FAQ schema, audit script `scripts/seo_audit.py` (2 benign flags: editorial article title, noindexed 404). WhatsApp share verified live: `wa.me` URL carries title + absolute URL; og.png 1200×630 @ 67KB < 300KB preview limit.
- Repo rule: secrets never committed (push protection enforced this twice — SPEC redacted before first push).

## D10. Live jobs board (Oct 16, 2026 — session 3)
- **Pipeline**: `scripts/fetch_jobs.mjs` runs inside `npm run build` (pre-astro). Sources are FIRST-PARTY employer ATS APIs only — Lever (Apollo Agriculture, Tala), Greenhouse (Moniepoint, Branch), Workable (Cellulant, Pula, MarketForce, Roam, Tanda), BambooHR (BasiGo), Ashby (M-KOPA). No third-party scrapers.
- **Kenya filter**: role location must contain Kenya/Nairobi, or be Remote at a Kenyan-HQ company. Per-board status (count / kept / unreachable) lands on the page — honest even when a board is empty.
- **Ashby quirk**: `api.ashbyhq.com` 401s datacenter IPs → committed browser snapshot (`research/mkopa_ashby.json`, captured via headless browser of jobs.ashbyhq.com/m-kopa) is the documented fallback; the fetcher tries the API first on every deploy.
- **No invented salaries**: live rows carry no salary fields (UI: "Band n/a"); market bands exist only on curated rows. `fetchedAt` + per-row board label shown. Apply links go to the employer's own portal.
- **Board-only employers**: Moniepoint/Tala/Branch render on the board from `src/data/boardEmployers.ts` with a "board-only employer" label — not passed off as tracked profiles.
- Snapshot committed at `src/data/jobs.live.json` (27 roles from 11 boards, fetched 2026-10-15). Dedup vs curated rows on company+normalized title.

## D11. Netlify deployment (Oct 16, 2026 — session 3)
> **Superseded (2026-10-19/20):** the site deploys on **Cloudflare Workers** only. `netlify.toml`, the `netlify/` functions and the Netlify workflow were deleted; the Worker aliases the old `/.netlify/functions/*` paths for compatibility. Kept as history.
- `netlify.toml`: Node 22, `npm run build` → `dist/`, immutable caching for `/_astro/*`, cache for `/logos/*` + feeds, X-Frame-Options/nosniff/Referrer-Policy site-wide. `.nvmrc` 22. Repo keeps `bun.lock` for local dev; Netlify forces npm (`NETLIFY_USE_BUN=false`) for a deterministic install.
- **Build never breaks on a flaky board**: fetcher exits 0 and keeps the committed snapshot if sources fail; `astro build` does not depend on network.
- **Env fallbacks**: `src/lib/supabase.ts` falls back to the public project URL + anon key (publishable by design, RLS-guarded) — a fresh Netlify build without env vars still ships a fully working site. `.env` untracked from git (was accidentally committed in early session); `.env.example` is the reference.
- Two deploy paths documented in README: (1) Netlify UI import (settings auto-load from netlify.toml), (2) GitHub Actions `.github/workflows/netlify.yml` with NETLIFY_AUTH_TOKEN + NETLIFY_SITE_ID secrets (job skips itself if secrets absent). Astro `site` remains `https://startups.co.ke` so sitemap/OG/canonicals are correct once the domain attaches.

## D12. County coverage + deeper investor data (Oct 16, 2026 — session 3)
- **Counties**: `src/data/counties.ts` — all 47 counties with capitals + coordinates (objective facts); `hub` appears ONLY where verified (Mombasa Swahilipot, Kisumu LakeHub 2013, Uasin Gishu EldoHub+Dlab, Nakuru ATS, Garissa NieHub, Nyeri Othaya AYEC/Mt Kenya Hub; sources: qz.com, AfriLabs, UNDP County Profiles, UNESCO DigiKen Feb 2025). Map plots 42 county-seat dots + 6 verified hub rings (Nairobi stays the amber capital marker). Honest framing everywhere: geography ≠ activity; tracked index remains Nairobi-concentrated and the page says so.
- **Map honesty fix**: city labels previously showed ecosystem-wide estimates (≈268 Nairobi) as "companies tracked". Now dual-labelled "≈268 est. · 21 tracked"; captions separate tracked (REGIONS, derived) from ecosystem estimates. Fixed pre-existing client-script bug (frontmatter `total` referenced in `<script>` → NaN%).
- **Derived stats**: `STATS.*` (companies/investors/jobs/hackathons) and `REGIONS` counts now computed from the data modules — stale hardcodes (8 jobs, 13 investors, 19 Nairobi) impossible by construction.
- **Investors 13 → 24**: added DOB Equity (Twiga, Copia; dobequity.nl + Business Daily), Chandaria Capital (Sokowatch/Wasoko, Ilara; firm LinkedIn + 2019/2020 round reports), Norrsken22 (growth fund, KE/NG/ZA presence), Safaricom Spark (iProcure, Sendy; Safaricom + StartupGuide), ShakaVC (Ilara seed), Global Ventures (Ilara A), InVhestia/ViKtoria BAN, The Rise Fund/TPG (Cellulant C), Tiger Global (Wasoko B), SoftBank Vision Fund 2 (Apollo B), AfricInvest (Turaco A). All verified against named sources; global crossovers marked `viaRoundOnly`.
- **Track records derived, not typed**: `investorRounds()` projects the tracked rounds feed onto each investor (named leads/notes + portfolio overlap) — the "Kenya track record" block on /investors can never contradict the rounds table. Verified co-investor chips added where rounds name them. Fixed r-ilara-a lead ('—' → TLcom Capital, per Africa Global Funds).
- **VLM expansion round** (3 pages): caught real issues → derived stats fix (8 vs 35 jobs), dual-count map labels, "Theses"→"Fund theses" copy. Reports: `qa/vlm/expansion-*.md`.
