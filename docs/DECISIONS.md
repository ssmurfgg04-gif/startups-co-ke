# DECISIONS — startups.co.ke (log of spec & architecture decisions)

Living document. Everything non-obvious we decided, and why. Date base: **2026-10-15 (EAT)**. Owner contact: jack@startups.co.ke · +254 721 725 958.

## D1. Architecture — single self-contained HTML file + Supabase
- `index.html` at repo root, deployed via **GitHub Pages** with `CNAME` = startups.co.ke (see README for the 2 DNS records).
- Backend: **Supabase** project `startups-co-ke` (ref `eezqpsbhmnhuhnmiwnsz`), region `eu-west-2` (closest available to Nairobi; af-south-1 not offered on free plan).
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

## D7. Taste layer (leonlix/taste-skill, MIT — vendored in `skills/taste-skill/`)
- Applied `minimalist-ui` protocol + `full-output-enforcement` onto the user's exact brand spec (paper/ink/green tokens, Fraunces/Archivo/IBM Plex Mono). Banned-clichés list enforced in all copy (no "Elevate/Seamless/Unleash/Next-Gen/Delve", no lorem, no emoji in UI).
- Self-review loop = taste-skill's "check your own work in a browser": agent-browser screenshots at 3 widths + VLM critique rounds + fix top issues.

## D8. Ops notes
- Google News RSS (not scrape-robots) + web-search for research; no IP-rotation runners (ToS risk) — authenticated GitHub API covered rate limits.
- trendspyg had install friction; used Google Trends RSS endpoint directly (same data, zero deps).
- Secrets: `.secrets/` (gitignored) + GitHub repo **Actions secrets** (SUPABASE_SERVICE_KEY, SUPABASE_DB_PASSWORD, GH_TOKEN) via API — never in files.
- Pricing presented as real launch pricing (Explorer KSh 0 / Professional KSh 2,900 / Institution KSh 24,500 per month; jobs: Featured KSh 25,000 / Standard 12,000 / Internship 6,000). Payment on launch = invoice/M-Pesa via jack@startups.co.ke; card flows later.
- Support: jack@startups.co.ke · +254 721 725 958 · WhatsApp wa.me/254721725958. Privacy policy at #/privacy + cookie consent (essential + first-party analytics categories; analytics events table, no third-party trackers).

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
