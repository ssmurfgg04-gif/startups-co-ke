---
Task ID: 1
Agent: Super Z (main agent)
Task: Rebuild startups.co.ke from the single-file HTML/CSS approach onto Astro with global configs ("standing on shoulders of giants"), wire Supabase backend, ship production-ready site on port 3000.

Work Log:
- Read full spec from /home/z/my-project/upload/Pasted Content_1792070774231.txt (12-section spec: brand system, pages, Kenya map, data model, honesty system, SEO).
- Initialized fullstack environment; validated user's Supabase management token — project "startups-co-ke" (ref eezqpsbhmnhuhnmiwnsz, eu-west-2) already ACTIVE_HEALTHY.
- Configured Supabase auth (site_url https://startups.co.ke + redirect allow-list) and applied schema (submissions with RLS, newsletter_subscribers, public `logos` storage bucket) via Management API SQL endpoint.
- Removed Next.js scaffold; root package.json now runs `astro dev --host 0.0.0.0 --port 3000` (preview gateway port), tee'd to dev.log.
- Installed astro@5.18.2, tailwindcss@4.3.3, @astrojs/sitemap, @astrojs/rss, @supabase/supabase-js.
- Built the codebase:
  - Global configs: src/config/site.ts (nav/footer/contact/pricing/honesty copy), src/config/sectors.ts (palette), Tailwind 4 @theme tokens in src/styles/global.css.
  - Typed data layer: src/data/{types,companies(15),investors(8),jobs(10),hackathons,ecosystem(rounds/series/salaries/reports),stats}.ts.
  - News as Markdown content collections (7 articles) with zod schema.
  - Components: Ticker (EAT clock + marquee), Masthead (global search + auth chip), Footer, KenyaMap (BUILD-TIME point-in-polygon dot map + Gaussian hub clusters + dashed routes), FundingChart (sector switcher), Sparkline (seeded PRNG), Countdown (offset-based, never dies), ShareButtons (WhatsApp-first), ModalHost (14 native <dialog> forms → Supabase with local fallback), Toaster, CookieBanner.
  - Pages: home (12 modules), /startups (client-filtered directory with deep-links), /startups/[id] (tabs), /investors, /funding (CSV export), /hackathons (tabs + calendar), /jobs (expand rows, bookmarks, salary bands), /news + /news/[slug], /research, /privacy (Kenya DPA), 404, /search-index.json, /rss.xml.
  - SEO: per-page Seo component (OG/Twitter/canonical/hreflang), JSON-LD (Organization, WebSite+SearchAction, ItemList, Article, JobPosting, Event, Dataset), sitemap-index, RSS, robots.txt, favicon.svg, og.png (1200×630 generated via Playwright from scripts/og.html).
- Fixed during verification: YAML frontmatter quoting, Astro 5 entry.id vs slug, `.table-row` class collision with Tailwind utility (renamed .rowline), ticker marquee overlapping clock, nested <button> in job rows (parser split — converted to div role=button), mobile hamburger pushed off-screen (hid Post-a-job below sm).
- E2E verified via agent-browser: home all 12 sections reveal, directory filters/sort, profile tabs, funding chart switcher, hackathon live countdown, job expand + bookmark toast, search dropdown ("pesa" → PesaFlow), mobile viewport (iPhone 14), article + share buttons.
- Supabase E2E write test: submitted startup via modal → row landed in public.submissions (verified via SQL query), then deleted test row.
- Final `astro build`: 32 pages + sitemap in ~5s. Git commit ea75582 on main.

Stage Summary:
- Deliverable: genuine Astro 5 codebase at /home/z/my-project (GitHub-ready), served on port 3000 for preview.
- Supabase project eezqpsbhmnhuhnmiwnsz live: auth configured, tables+RLS applied, logos bucket ready. Env vars in .env (gitignored), .env.example committed.
- GitHub push NOT done: the github token in the pasted spec was redacted by the gateway. Repo committed locally — push with `git remote add origin … && git push`.
- Design system fidelity: Fraunces/Archivo/IBM Plex Mono, paper/ink/green/amber tokens, hairline rules, offset shadows, honesty chips everywhere.

---
Task ID: 2
Agent: Super Z (main agent)
Task: Deeper research + E2E tests + real data population + logos + 10 VLM rounds + GitHub persistence (user follow-up, session 2)

Work Log:
- Reconciled divergent GitHub lineages (research corpus + taste-skill vs Astro app), merged, pushed (push-protection forced SPEC secret redaction).
- Ran fresh research batch (companies/jobs/news/events/arXiv) → research/; refreshed Google Trends KE via raw RSS (scripts/refresh_trends.py).
- Migrated the entire data layer to real sourced data: 21 companies (failure states tracked), 13 investors, 8 real jobs, 12 real events w/ ISO countdowns, real stats/wire/rounds/salaries; rewrote honesty system (D2) — statuses + named sources everywhere; replaced 7 fictional articles with 7 real sourced analyses; research page gained arXiv + trends + competitor rails.
- Fetched + normalized 24 real logos; Monogram renders logo→monogram fallback; Supabase claim/startup uploads verified end-to-end.
- VLM: 11 screenshots × 10 rounds (z-ai vision), scores 4–7.5 → 8.5–9.5; fixed directory null-raised crash, JS-gated reveals, cookie banner, sorted rounds, chips, tabular-nums (qa/vlm/SUMMARY.md).
- E2E: investor + founder personas vs live Supabase (DB-verified writes incl. logo bucket); fixed postjob ID-collision bug; cleanup done (qa/e2e-report.md).
- SEO/WhatsApp: audit script, title tightening, FAQ JSON-LD, wa.me share verified live (og.png 67KB 1200×630).

Stage Summary:
- Site is real-data, sourced, verified: 38 pages build clean; server on :3000; repo @ GitHub main.
- Key artifacts: qa/vlm/*, qa/e2e-report.md, scripts/{vlm_shots,vlm_rounds,e2e_investor,e2e_founder,seo_audit,refresh_trends,sql}.?*
- Open items: 2 test objects in logos bucket (need service key to delete); GitHub Pages/DNS still pending user registrar action.

---
Task ID: 3
Agent: Super Z (main agent)
Task: Session 3 — expand coverage (47 counties + deeper investor data), wire jobs board to live postings, Netlify deploy prep, close pending gaps.

Work Log:
- Recovered environment-wipe artifacts (274-file mode churn, .env overwritten, vendored skills truncated) from HEAD before starting.
- Research (web-verified, snippets saved to research/): county hubs outside Nairobi (qz/AfriLabs/UNDP/UNESCO), 11 new investor facts (DOB, Chandaria, Norrsken22, Safaricom Spark, ShakaVC, Global Ventures, InVhestia, Rise Fund/TPG, Tiger, SoftBank VGF2, AfricInvest), FlexPay HQ claim DISPROVEN (Nairobi, not Eldoret — left correct), ATS board discovery across Lever/Greenhouse/Workable/BambooHR/Ashby/SmartRecruiters for 21 tracked + 12 wider employers.
- Live jobs pipeline scripts/fetch_jobs.mjs (first-party ATS APIs, Kenya filter, no invented salaries, per-board status, committed-snapshot fallback): 27 live roles from 11 boards (M-KOPA 13 via Ashby snapshot — API 401s datacenter IPs, documented; Moniepoint 12; Apollo 2). Wired into src/data/jobs.ts (merge + dedup + boardEmployers), jobs.astro rewritten (Live chips, board-status rail, Band n/a honesty, working location filter + live role counter, external-apply links).
- Counties: src/data/counties.ts (all 47, hubs only where verified — 7/47), map plots 42 county seats + 6 verified hub rings, home map band gained "County anchors — verified" railbox with sources line.
- Investors 13 → 24 with sourced theses + portfolio links; investorRounds() derives each fund's Kenya track record from the rounds feed (nothing typed twice); co-investor chips; r-ilara-a lead corrected to TLcom Capital.
- Honesty fixes: STATS.* + REGIONS now DERIVED from data modules (stale "8 jobs / 13 investors / 19 Nairobi" impossible); map city labels dual-counted "≈268 est. · 21 tracked" (was misleading); fixed pre-existing client-script NaN bug (frontmatter var in <script>); "Theses" → "Fund theses" copy.
- Netlify: netlify.toml (Node 22, npm build, cache + security headers), .nvmrc, build = fetch_jobs + astro build (snapshot fallback keeps builds green), supabase.ts public-by-design env fallbacks, .github/workflows/netlify.yml (secrets-guarded), README deployment section (UI import + Actions + domain attach), .env untracked from git.
- Verification: npm production build (38 pages) + astro check (my new errors fixed; 19 pre-existing left, noted); browser E2E on served dist — live rows expand w/ real apply URLs, filters (category 15/35, remote 4/35), county hover captions (Garissa ring, Nakuru hub), home snapshot "35 Open tech jobs", screenshots + VLM expansion round (caught 8-vs-35 stat drift, map label semantics, copy typo — all fixed, re-shot).

Stage Summary:
- Jobs board is genuinely live (build-time ATS pull + honest board statuses); counties mapped 47/47 with verified anchors; investors doubled w/ derived track records; repo is Netlify-ready (config + workflow + README) with env-fallback hardening.
- Open: user flips the Netlify switch (UI import or 2 GH secrets); custom domain attach after; 2 test objects in logos bucket still need a service key; 19 pre-existing astro-check strictness errors in untouched files (Masthead/research/ModalHost) noted for a cleanup pass.

---
Task ID: 4-research
Agent: research sub-agent (general-purpose)
Task: Kenyan market research batch — job-ad conventions, Kenyan Wall Street teardown, competitor job-posting pricing, founder visibility/directory value. No site code touched (read-only session).

Work Log:
- Read worklog.md (Tasks 1–3) + reused prior research pattern from scripts/research_batch.sh: z-ai CLI `web_search` / `page_reader` functions.
- Ran 30+ web searches + 12 page fetches; raw JSON/html saved to research/session4/ (s01–s36*.json, kws-*.json, p-*.json, r-*.json).
- kenyanwallstreet.co.ke is dead/unreachable (curl + JINA + headless browser all time out) — KWS now lives on kenyanwallstreet.com (Cloudflare-gated homepage fetched partially; beehiiv newsletter archive, /advertise-with-us, one /newsletter article, and t.me/s/kenyanwallstreet fetched in full). Legacy .co.ke headlines captured via search index and marked accordingly.
- Pricing verified by fetching the actual employer pages: myjobmag.co.ke/employers (KSh 2,900 / 14,000 / 24,000 / KSh 0), fuzu.com/kenya/employers/starter (6,000 / 13,000 / 15,000 / 30,000 KES per job post), brightermonday.co.ke free-listing article (Basic listing free, "previously valued at KES 5,000"), careerpointkenya free-job-advertising, jobwebkenya.com/us (price not public), Standard print rate-card PDF 2022 (KES 200,000–700,000 classifieds).
- Salary-disclosure evidence: no Kenya-wide % exists publicly (marked UNVERIFIED); used Fuzu's own "market with zero salary transparency" framing + verbatim disclosed-salary formats (KES 30,000-40,000 / Kes 50k-80k / (50-60K) headline suffix / "Monthly Gross Salary: KSH 80,000…" / "Salary: Negotiable").
- Scam/trust corpus: Fuzu Inuka 8-warning-signs page (golden rule quote + Fair Work Pledge), Safaricom fraud page, Africa Check KSh1,000/day, Airkenya/Standard/KRA disclaimers, CareerPoint/MyJobsInKenya no-fee pledges.
- Reddit blocks direct fetch ("whoa there, pardner") — r/Kenya quotes are verbatim search-index snippets with thread URLs, noted in files.
- Wrote 4 dense sourced files (43–52 lines each) under research/session4/.

Files written:
- research/session4/kenyan-job-ads.md (structure, salary disclosure + formats, CV/WhatsApp/apply conventions, scams vs trust signals)
- research/session4/kenyanwallstreet.md (positioning, Daily Brief cadence/channel stack, 13 verbatim headlines, Telegram formats, monetization, copy patterns to steal)
- research/session4/competitor-jobs-pricing.md (exact KE posting prices incl. free tiers, print rate card, free channels + their gaps)
- research/session4/founder-visibility.md (tarmacking, 12 sourced slang phrases, directory-listing value props, demo-day/press evidence)
(+ ~50 raw JSON fetches in the same dir)

Top 10 decision-relevant findings:
1. Job-ad skeleton in KE: title → duties → qualifications → "How to Apply" = "Send your CV to jobs@…" + deadline; referees and even ID/passport-photo copies still requested (careerpoint/vezill/qarera sources).
2. Salary disclosure is the exception: Fuzu itself calls Kenya "a market with zero salary transparency"; when shown it's "Salary: Negotiable", "KES 30,000-40,000", "Kes 50k-80k", or "(50-60K)" as headline suffix — a always-show-band board is a differentiator.
3. Exact competitor prices: MyJobMag KSh 2,900/post (3-month run, featured 3 weeks) / KSh 14,000/mo unlimited / KSh 24,000 shortlist; Fuzu KSh 6,000–30,000/post; BrighterMonday basic listing FREE (was KES 5,000); CareerPoint free; JobWebKenya premium price not public; print classifieds KSh 150k–700k.
4. Free channels are the real competition: #IkoKaziKE ("unspoken rule" for KE job ads), LinkedIn, FB groups, WhatsApp/Telegram groups — but they carry scam noise and zero structure; trust + structure is the wedge.
5. Scam pattern to design against: "registration/training/uniform fee" via M-PESA, WhatsApp-only recruiters; winning trust signals = "never pay to apply/interview" pledge, verified-employer badge, per-role review, no-fee pledge (Fuzu Fair Work Pledge).
6. KWS playbook: "The Daily Brief" beehiiv + LinkedIn newsletter, "every Monday at 9am EAT + every weekday at 7pm EAT" cadence, same host ("I'm Brian…"), tagline "Kenya's #1 newsletter among business leaders & policy makers"; audience claims 100K+ monthly readers / 50K+ subscribers; Telegram 35.2K.
7. KWS headline formulas: named actor + hard number ("NSE Daily Equity Turnover Declines 13.7% to KSh 417.7 Million"), odd-detail twist ("Inflation is up 6.8% and milk is a major culprit"), quote-led ("'The IMF can wait' - CBK Governor Thugge"); KSh/US$ no-space style.
8. KWS monetization beyond ads: Wall Street Africa Business Intelligence premium, Bullish Kenya invite-only event (Safaricom/KCB-backed), Best Places to Work awards, NSE Investment Challenge gamification.
9. Founders list on directories for: SEO backlink, "as seen on" badge, referral traffic, investor discovery (r/nairobitechies thread: investor literally hunting Kenyan businesses on Reddit; StartupList Africa sells "Increased Exposure — Investment opportunities — Analytics").
10. Language to mirror on-site: "Iko Kazi", "Naomba kazi mzee", "tarmacking", "side hustle", "Hii kazi ni referrals", "Jua Kali", "kazi", "mtaa", "hustler", "shelf company" — all with sources in founder-visibility.md §4.

---
Task ID: 4
Agent: Super Z (main agent)
Task: Session 4 — humanize design + founder visibility + Kenyan-market job packages + pay-disclosure honesty (user feedback round).

Work Log:
- Research batch (Task 4-research subagent) saved to research/session4/: Kenyan job-ad conventions (CV/email/WhatsApp apply, "Negotiable", referees, M-PESA scam patterns), KWS tone study (13 verbatim headlines, Daily Brief cadence), competitor job-posting prices verified on-page (MyJobMag KSh 2,900/post · 14,000/mo; BrighterMonday basic FREE since Apr 2025; Fuzu 6,000–30,000), founder-visibility evidence (StartupList pitch, investor discovery via Reddit, "as seen on" badges), 12 slang phrases (tarmacking, iko kazi, CV-not-resume).
- Jobs pricing rebuilt to market: Free listing KSh 0 (human-reviewed ~48h, 14 days) / Standard KSh 2,900 (30 days, alerts + WhatsApp channel) / Featured KSh 6,500 (pinned + homepage, 45 days) + 3-pack KSh 7,500 + never-pay pledge (SITE.jobPostPricing/Note/Pledge). Postjob modal rebuilt: pay select (Not disclosed/Negotiable/Range), apply-method select (Email a CV / WhatsApp / Portal link), pledge + pricing ledger line.
- Pay-disclosure honesty on /jobs: derived "Only 8 of 29 roles publish pay" hero block quoting Fuzu's "zero salary transparency" line; "pay: n/d" italic mono null-state on live rows (not bold statnum); Pay disclosed filter added (data-pay).
- Kenya filter fixed in fetch_jobs.mjs: "Lagos/London/Johannesburg · Remote" roles at KE-HQ companies were passing; now only Kenya-specific or generic locations kept (M-KOPA 13→7 genuine KE roles, live total 35→29, Moniepoint 12, Apollo 2).
- Founder visibility: new strip under hero ("Founder? Claim a free profile — your own page for deck/bio/signature, investors search the index, roles ride along") + CTAs; Founders box rewritten ("Get seen. Free, takes three minutes.") + embeddable /badge.svg deliverable; Employers box now says "From free".
- Sector grid emptied no more: derived SECTOR_ROWS straight from COMPANIES (static SECTOR_COUNTS had drifted 19 vs 21 — bug caught), dense two-line rows with inline company names + footer note; funding rail capped at 8 rows with All rounds (20) link (was 20 rows = the actual empty-space culprit); featured grid 6→8 cards (4×2, no dead cells).
- Human-craft pass: new hand-set "s." logo (chalk-drawn serif S path + amber dot, favicon + masthead 30px, bold wordmark); badge rebuilt as typeset plate (paper face, ink hairline, ink offset shadow, mono LISTED ON + serif domain); DataPlate.astro replaces picsum random stock photos with seeded generative dot-field illustrations (home lead, news index, article heroes; article og:image → static og.png); global.css: border-radius 0 on btn/input/dialog, dialog-card hard offset shadow (was shadow-2xl soft), focus offset ring, h1-h3 text-wrap balance, terminal select chevrons; cookie banner already square/offset; footer tagline + hero/kicker/regional/research copy de-AI-ified (plain declaratives, no "intelligence layer").
- FundingChart bars now server-rendered with real heights (was height:0% + IO-gated → blank chart for no-JS/fast scroll); JS only switches series.
- Verification: astro build 38 pages ×2; astro check 19 pre-existing strictness errors (unchanged, none new); E2E suite scripts/e2e_s4.mjs 9/9 PASS incl. real Supabase submissions insert HTTP 201 with new form fields (test row "Zawadi Labs" left in review queue — deletable from Supabase dashboard); VLM 7-round review → fixes → 4-round recheck (insights 6→8, hero 6→7.5, modal 3→6, logo 4→6; remaining deductions are VLM priors contradicting verified pixels, e.g. "rounded inputs" on square inputs); mark rendered at 16/32/64/128px + badge verified visually (qa/mark_test.png); netlify.toml validated with tomllib (6 header blocks intact), npm run build (Netlify's exact command) green incl. fetch_jobs prebuild.
- Tooling notes: z-ai-web-dev-sdk installed locally (lost in env wipe) as devDependency; VLM calls must use zai.chat.completions.createVision with role:'assistant' system prompt; terminal/tool display eats "[h" sequences (transition-[height], [[headers]] false alarms — always verify with Grep before patching).

Stage Summary:
- Site speaks Kenyan-market job board (free tier, KSh/WhatsApp/CV conventions, never-pay pledge), answers "why list your startup" in 3 seconds, kills empty space, and sheds most AI-tell surfaces (logo, stock photos, soft corners, verbose copy). All verified by build + E2E + VLM evidence.
- Open: user flips Netlify switch (repo-ready: netlify.toml + .nvmrc + workflow + README); delete "Zawadi Labs" test row from Supabase submissions when convenient; 2 test objects in logos bucket still need service key; 19 pre-existing astro-check strictness errors in untouched files.

---
Task ID: 5
Agent: Super Z (main agent)
Task: Session 5 — audit defect fixes + form overhaul (founder modal, post-a-job), Resend review-queue emails, jobs automation (link-check + daily cron), homepage/nav restructure.

Work Log:
- Critical defects (external audit): created /about, /contact, /methodology (were 404; footer + masthead + mobile nav rewired to real pages); fmtAmount() renders "Undisclosed" for null amounts (was $0K on funding page + home rails); relDate() + relDays guard render "Date unavailable" (was "NaN mo ago" on empty round dates); county copy now "7/47 incl. Nairobi · anchors = Nairobi + 6 regional hubs"; cookie banner compacted (340px, one-line copy, ✕ dismiss without consent).
- Founder submit modal rebuilt per user's pasted UX spec: Website URL* + County select (all 47), custom dashed drag-drop zone (no native file input, filename feedback, DataTransfer drop), sentence-case helper text with info icon, quiet underlined Cancel + single amber "Submit for review →", bordered ✕ close, placeholders on every field. Claim modal got the same treatment.
- Post-a-job modal enriched to Kenyan ad conventions (research/session4): duties + qualifications textareas, employment type, pay fieldset with Range → KSh min/max (conditional), how-to-apply method + required destination field with per-method placeholder/hint (Email CV/WhatsApp/Portal), deadline + starts, pledge + pricing ledger sentence-cased. BrighterMonday-grade without losing mono aesthetic.
- Review queue + email: netlify/functions/notify.mjs (Resend REST; RESEND_API_KEY/NOTIFY_EMAIL/RESEND_FROM env; no-key → 202 no-op so forms never break; reply_to submitter). Client fire-and-forget POST after every successful submission insert. Live test: Resend 200 (id 01a142f6…); learned account owner inbox = jackblessed191@gmail.com → NOTIFY_EMAIL default set there (deliverable TODAY via onboarding@resend.dev); jack@startups.co.ke works after domain verification (documented in README). Queue location documented: Supabase submissions table, project eezqpsbhmnhuhnmiwnsz.
- Jobs automation ("piggyback"): checkLinks() in fetch_jobs.mjs — HEAD w/ GET fallback, drops CONFIRMED 404/410 only, ambiguous (bot-walls/timeouts) kept; meta.linkCheck recorded; first run dropped 2 dead listings (21→19). New .github/workflows/refresh-data.yml: daily 03:00 UTC (06:00 EAT) fetch + trends refresh + auto-commit + push → Netlify auto-deploy (GITHUB_TOKEN, no secrets). Jobs page shows auto-drop count + StartupJobs Kenya coverage benchmark (54 roles, Oct 2026) with honest framing.
- Homepage/nav flow (audit): nav = 5 destinations (Discover/Capital/Careers/Events/Insights) with square hover dropdowns (group-focus-within keyboard support) + children in mobile nav; The Wire lifted to section 01 (timely intel up); stat band deduped (Rounds tracked + Median seed $1.6M replace hero dupes); duplicated "Latest funding intelligence" rail → derived "Most active investors" (investorRounds() projection, nothing typed twice); hero search input → mono.
- VLM s5: 9 rounds + 2-round recheck (founder modal 6→6.5, postjob 5→6; remaining deductions are documented VLM priors contradicting verified pixels — labels ARE mono, dialog shadow IS hard offset). Caught + applied: bordered close ✕, pay fieldset 3-col, backdrop 0.62→0.45. Display-eating false alarm on dialog width verified clean via python byte check.
- Type cleanup: 19 → 8 astro-check errors (new src/types/global.d.ts window.sckToast typed global — 5 casts replaced; Masthead ensureIndex non-null + empty-array fallback; HTMLDialogElement generics; null-safe clipboard; rss p.id). Remaining 8 = research.astro check-parser false positives (file valid, builds + serves fine).
- Verification: npm build 41 pages ×3 (fetch_jobs prebuild incl. link check); E2E suite extended to 32 checks — 32/32 PASS incl. Supabase 201 with enriched payload, dropzone file-pick, pay-range reveal, 5-destination nav, /about//contact//methodology 200s, no $0K/NaN regression guards. Commit c353234 pushed to main.
- Couldn't delete: 2 "Zawadi Labs" test rows in Supabase submissions (management token lost in earlier env wipe) — user deletes via Supabase dashboard → Table Editor → submissions.

Stage Summary:
- Every external-audit defect closed (404s, $0K, NaN, dead links, county conflict, cookie banner); forms are BrighterMonday/enterprise-grade per the pasted spec; review queue now emails the desk in real time (verified live); jobs board is self-updating daily with automatic dead-link retirement; nav/home restructured to the 5-destination blueprint; sitemap includes the new trust pages.
- Open: user flips Netlify switch (UI import or NETLIFY_AUTH_TOKEN/NETLIFY_SITE_ID secrets) — deploy then verify; verify startups.co.ke domain in Resend → set RESEND_FROM + NOTIFY_EMAIL=jack@startups.co.ke; delete 2 Zawadi Labs test rows in Supabase dashboard; 2 test logos objects in bucket still need service key.

---
Task ID: 6
Agent: Super Z (main agent)
Task: Session 6 — remove "Made with Netlify" badge, verified-domain email identity, jobs mobile pay fix (user-reported "payment ranges floating around"), ovrion.ai.studio-inspired jobs rework (own opinionated way).

Work Log:
- Netlify badge: researched official docs — "Powered by Netlify" badge is edge-injected on Free-plan public projects and renders in an ISOLATED FRAME (site CSS/JS cannot remove it). Correct off-switch documented in README deploy section + told user: Project configuration → General → Powered by Netlify badge → off (effective next request, no redeploy). Nothing in code could do this honestly.
- Email identity: user confirmed startups.co.ke verified in Resend → notify.mjs default RESEND_FROM now "startups.co.ke <notices@startups.co.ke>" (replaces onboarding@resend.dev test sender); NOTIFY_EMAIL default stays jackblessed191@gmail.com (PROVEN inbox — Resend sends FROM the domain but does NOT host mailboxes, so jack@ only via env var when that mailbox exists). Live-tested: Resend 200 id 01a14ade-5d7e… (key restored into gitignored .env after env wipe). test_notify.mjs defaults + 403 hint, README env section, .env.example all aligned.
- Jobs mobile fix (the complaint): collapsed row rebuilt as deterministic CSS grid. Desktop md+: 6 cols [logo 2.75rem | title 1fr | pay 9.5rem right | date 5.5rem | bookmark | caret]. Mobile: 3 cols [logo | title | caret] + col-span-full pay strip under a dashed divider — pay LEFT (band or "pay: n/d"), compact date + 44px-touch bookmark RIGHT. Nothing floats; every row identical.
- Ovrion-inspired (own way): standardized pay line derived from salaryMin/Max ("KSh 350–500K" + "market band · mo" sub-label, whitespace-nowrap); Verified-only filter (data-v, 15/31 pass, tooltip "cross-checked against 2+ public sources"); "How listings are vetted" railbox (✓ daily link-check, ✓ own ATS boards never middlemen, ✓ never pay to apply, ✓ bands never invented offers) with CONFIRMED chip + methodology link, replacing the coverage blurb (StartupJobs 54-role benchmark folded into its footer).
- Live-data wart fixed: 16/23 live rows had mode '—' (ATS doesn't expose) rendering dangling "· —" in meta — now omitted when meaningless.
- Regression caught by own re-shoot: nowrap pay + full "3 DAYS AGO" date exactly filled the 375px strip → "BAND3DAYS" collision. Fixed with compact strip dates shortDays() = 3d/2w/1mo (full form on desktop column + title attr). Also learned: Astro compiler rejects `as` casts + inline `<` ternaries in template JSX expressions (CompilerError "Fragment shorthand") — moved to frontmatter helper function.
- Verification: npm build 41 pages ×3; astro check still 8 pre-existing research.astro false positives (0 new); s6 E2E 6/6 (pay strip 31/31 rows, 8 bands + 23 n/d, 0px overflow @375px, verified filter 31→15 all data-v=1, twin bookmark buttons paint together, expand works); s4 regression 32/32 PASS incl. Supabase 201; VLM s6 4 rounds + recheck: mobile rows 6.5→8, desktop 7.5→8, hero 5→7.5 (expanded-row 6 = shot artifacts: cookie banner in frame + mid-transition capture; findings cross-checked against pixels before acting).
- Commit e5e2ecf pushed to main (rebased over the daily cron's "data: daily jobs board refresh 2026-10-17" commit — automation confirmed running). Netlify auto-deploy picks it up.

Stage Summary:
- Jobs board mobile is deterministic: pay lives in one anchored slot per row on every breakpoint; desktop pay/date columns align stock-ticker style; verification is a first-class filter + vetted-checklist rail (ovrion's trust pattern, our voice).
- Review-queue alerts now send from the verified domain (notices@startups.co.ke) with replies routed to the submitter; live-verified 200.
- Open: user turns the badge off in Netlify dashboard (10-second toggle, documented in README); optional NOTIFY_EMAIL → jack@startups.co.ke once that mailbox exists; delete 2 Zawadi Labs test rows in Supabase dashboard; 2 test logos objects need service key; 8 pre-existing astro-check false positives in research.astro.
