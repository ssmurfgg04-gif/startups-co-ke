build this install the leonlix taste github skill and run vlm rounds also yeah make this real no demo data for now if you can also get and keep company logos and enable users to keep their own also study trust mrr and others also kenyan starup space do deep web research first also chck arxiv and our competitors be ultracritical opinionated and detail oriented also run e2e tests both as an investor and as a startup founder looking to list their startup think through everything ofc and enable this website being shared on whatsapp looing nice also do seo research on this use google rss if youre rate limited you may also use github runners with different ips to run deeper research and planning also were using github to store project files and spec decisions so when this environment wipes as it usually does we dont lose our work the key is [REDACTED:github_token]  also use this to fetch trends data besides the normal websearch alternative as this gives consumer statistics In our previous discussion, the **GitHub options** mentioned for replacing unreliable standard RSS feeds were:

---

### 1. `trendspyg` (Recommended for RSS Streams)

* **GitHub Repository:** [`flack0x/trendspyg`](https://github.com/flack0x/trendspyg)
* **Why it worked:** It directly targets Google’s sub-second RSS endpoints without needing a headless browser for basic trending feeds, while offering built-in continuous stream polling (`watch_google_trends_rss`) and asynchronous batch fetches.

```python
from trendspyg import download_google_trends_rss, watch_google_trends_rss

# 1. Fetch a fast, lightweight RSS snapshot
trends = download_google_trends_rss(geo="KE")  # or "US"
for t in trends["trends"][:5]:
    print(t["keyword"], t["volume_min"])

# 2. Continuous polling stream without triggering rate-limits
for change in watch_google_trends_rss(geo="KE", interval=60):
    print(change["event"], change["keyword"])

```

---

### 2. `trendspy` (Lightweight HTTP Client)

* **GitHub Repository:** [`sdil87/trendspy`](https://github.com/sdil87/trendspy)
* **Why it worked:** A pure HTTP-request-based library (no Selenium/Playwright) that includes direct helpers for RSS-backed trending items along with attached news context.

```python
from trendspy import Trends

tr = Trends()
# Fetches current RSS trending items along with related news articles
trends_with_news = tr.trending_now_by_rss(geo="US")
print(trends_with_news[0].news[0].url)

```

---

### 3. Non-RSS Alternatives Covered

* **Wikimedia Pageviews API:** Used as a rate-limit-free proxy for search interest.
* **Apify Google Trends Scraper:** Cloud-hosted JSON actor for managed scraping without local proxy maintenance. below is the MASTER PROMPT — Build "startups.co.ke": Kenya's Startup Ecosystem & Business Intelligence Platform

═══════════════════════════════════════════════
0. ROLE & OBJECTIVE
═══════════════════════════════════════════════
You are a senior product designer + front-end engineer. Build a complete, production-quality, single-file interactive website (one HTML file, embedded CSS + JS, no build step) for startups.co.ke — a startup ecosystem and business intelligence hub for Kenya. It must feel like a credible, established, institutional platform (think PitchBook × The Information × TechCrunch) — NOT a generic AI directory, NOT a startup landing-page template, NOT a SaaS dashboard clone.

Non-negotiables:
• Single self-contained HTML file that runs by double-clicking.
• Information-rich, data-dense, scannable. Real-feeling content everywhere.
• Absolute honesty system: every entity and figure is fictional sample data, and every figure carries a visible status tag. Never present sample data as real.
• Mobile-first responsive design (see section 10).
• SEO-complete semantic markup + structured data (see section 11).

═══════════════════════════════════════════════
1. BRAND & VISUAL SYSTEM (follow exactly)
═══════════════════════════════════════════════
Design language: "data terminal × editorial publication," grounded in a Kenyan identity. Warm, papery, print-like — not cold corporate blue.

Typography (Google Fonts):
• Display/headlines: "Fraunces" (variable serif), weight ~550, tight tracking (-0.02em), used for all H1/H2/section titles. Use italic Fraunces for one emphasized word in the hero headline.
• UI/body: "Archivo" 400–700.
• ALL numbers, prices, metrics, labels, kickers, nav, buttons, dates, tag chips: "IBM Plex Mono" 400–600, uppercase micro-labels with letter-spacing 0.08–0.16em.

Color tokens (use these exact values):
--paper:#F6F3EA (page bg) · --paper2:#EDE8D9 · --paper3:#E4DECC
--ink:#181712 (text/borders) · --ink2:#3E3B31 · --mut:#6E6A5B
--line:#D9D3C1 · --line2:#C9C2AC
--green:#0E4630 (primary) · --green2:#0A321F · --green3:#134F38
--amber:#B87503 · --amber2:#E3A21A (accent/CTA) · --clay:#A63D2F (alert/live)
--dark:#14130E · --dark2:#1C1A13 · --darkline:#2E2B20
--dpaper:#EFEAD9 · --dmut:#A9A492
Sector palette: fintech #0E4630, commerce #B4530A, logistics #4A4636, agritech #4F7A28, energy #B87503, health #A63D2F, edtech #1F5F5B, proptech #6B4A2B, saas #3E4A3A, hr/future-of-work #7C6A00, media #33312A.

Visual rules:
• Backgrounds alternate rhythmically: ivory paper → dark #14130E (funding) → green #0E4630 (hackathons) → tinted paper2 (insights/news) etc.
• Hairline 1px borders in --ink are a core motif: section headers end with a full-width rule; "railboxes" open with a top rule; stat grids are 1px-gap cells on a line background.
• Square-ish corners only (2–3px radius). Buttons are sharp rectangles with mono uppercase labels; hover = invert to ink or darken.
• Signature hard offset shadow: "box-shadow: 8px 8px 0 var(--paper3)" on hero widget and report cover.
• Photos: warm monochrome treatment — filter: grayscale(1) contrast(1.06) sepia(.24), slow zoom on hover. Use picsum.photos seeded images.
• Company monogram tiles: colored square (sector color) with 2-letter white mono initials.
• Icons: inline SVG symbol sprite, 1.8 stroke, currentColor — search, arrow-right, arrow-up-right, chevron, verified badge (circle+check), pin, calendar, menu, x, download, case, users, file, clock, building, check, bookmark, plus.
• No gradients as decoration, no glassmorphism, no drop-shadow-everything. Authority through rules, type and data.

Logo: 24px rounded-square green mark with a diagonal line and two dots (amber + ivory) + "Startups" in Fraunces + ".co.ke" in amber mono. Logo mark rotates 90° on hover.

═══════════════════════════════════════════════
2. GLOBAL CHROME (every page)
═══════════════════════════════════════════════
a) LIVE TICKER (top, above masthead): deep green bar. Left cell: blinking amber dot + "WIRE · {day} · {HH:MM} EAT" — a real clock using Africa/Nairobi timezone updating every 30s. Right: infinite marquee of wire items (funding rounds, index moves, hiring) in mono caps with amber highlights and a tiny "SAMPLE" suffix per item; separated by small rotated diamonds; 60s loop, pauses on hover.

b) STICKY MASTHEAD: ivory, 1px ink bottom border. Logo → nav (mono caps: Startups, Investors, Funding, Hackathons, Jobs, News, Research) with amber underline grow-on-hover/active → global search box (width ~200px, "/" keyboard shortcut, live dropdown grouped by Companies/Investors/Jobs/News/Hackathons/Go-to, Esc closes) → "Sign in" ghost button → amber "Post a job" → mobile hamburger. Mobile nav slides open as full-width list.

c) FOOTER: dark #14130E. 4 columns: brand blurb, Platform links, Intelligence links (incl. "Methodology & statuses" modal), Company links. Bottom bar: full honesty disclaimer (see section 8) + "Designed & built in Nairobi" with amber dot.

d) FIXED "MOCKUP · SAMPLE DATA" chip bottom-left (ink bg, amber border) → opens the About modal with a "things to try" checklist.

e) Toast system bottom-right: ink cards, amber left border, mono title + sans body, auto-dismiss 3.8s.

═══════════════════════════════════════════════
3. HOME PAGE — module order (exact)
═══════════════════════════════════════════════
1) HERO (2-col, mobile stacks): left = kicker "EST. NAIROBI — The intelligence layer for Kenya's startup ecosystem", H1 "Kenya's startup economy, mapped & measured." (italic serif on "mapped"), sub-paragraph, big bordered search bar with live entity search panel, popular-filter chips (Fintech, Healthtech, Climate & Energy, Seed, Tech jobs — each deep-links into pre-filtered directory), note line "Sample figures shown for demonstration — [✓ verified] entities are marked throughout."
   right = ECOSYSTEM SNAPSHOT widget (ink border, offset shadow): header "Ecosystem snapshot" + "Sample data" chip; 2×2 count-up cells (428+ Startups tracked · 96 Active investors · 312 Open tech jobs · 38 Hackathons indexed — numbers animate from 0 with ease-out cubic on scroll); "Funding by sector · YTD" mini bar chart (8 bars, green with amber accents, hover shows USD value); footer link to funding database.

2) MAP BAND (2-col): left = THE KENYA DOT MAP (section 5). right = "Explore by region" panel: rows for Nairobi (268, CAPITAL tag), Mombasa (41), Nakuru (33), Kisumu (28), Eldoret (19), Malindi (12) — each with count, share-of-index bar, click → filters directory; footnote that Nairobi holds ~63% but regional hubs are fastest-growing (sample).

3) STAT BAND (5 columns between hairlines, count-ups): 428 companies tracked (+31 this quarter) · $184M capital YTD (+18%) · $420K median seed cheque (flat QoQ) · 62 rounds this year (+11) · 38 hackathons indexed. Right-aligned asterisk note "* Illustrative sample figures".

4) SECTION 01 — FUNDING INTELLIGENCE (dark section): left = chart panel (dark #1C1A13) with sector chips (All sectors / Fintech / Climate & Energy / Commerce — switching animates bars), 8 quarterly bars (Q1'24→Q4'25) rising onto dashed gridlines, amber bars, hover tooltip "$XXM · N rounds tracked · sample"; methodology microcopy. right = "Latest tracked rounds" rail: date · company · round · lead · amount, each with a status dot (green=Confirmed, amber=Reported, grey=Estimated) — rows click through to profiles.

5) SECTION 02 — FEATURED VERIFIED STARTUPS: 4 cards (Sokoni Systems, PesaFlow, Zuka Energy, ShambaSense). Card = monogram tile + Verified chip, name, one-liner, sector+stage pills, footer row (HQ pin · "Raised $X.XM" · arrow). Hover lifts with shadow. Click → profile.

6) SECTION 03 — ECOSYSTEM INSIGHTS (tinted): left panel "Startups tracked by sector" — 11 clickable horizontal bars (Fintech 96 … Other 18) with counts and "% of index"; right panel "Latest funding intelligence" — feed rows (monogram, "Company · Round", amount + lead, status dot).

7) SECTION 04 — HACKATHONS (green section, 2-col): left = kicker "Hackathon index — East Africa builds in sprints", H2 "Every build sprint, prize pool and winning team. Tracked.", paragraph, amber CTA. right = LIVE COUNTDOWN (4 cells: Days/Hours/Min/Sec, ticking every second) to Nairobi Build Week + 3 upcoming-event chips.

8) SECTION 05 — NEWS (tinted): editorial lead article (photo, category chip, serif title, dek, byline "By Njeri Mwangi · 2 hours ago · 6 min read") + numbered side list (01–06) of headlines.

9) SECTION 06 — RESEARCH: left = report cover (dark green SVG with the dot-Kenya rendered small + amber Nairobi dot + "STARTUPS.CO.KE · RESEARCH", offset shadow); right = "State of Kenya's Startup Ecosystem 2025", 68 pages, buy CTA + free sample chapter, plus 3 report rows with pricing/members tags.

10) SECTION 07 — BUILT FOR THE WHOLE ECOSYSTEM: 4 asymmetric panels (7/5 + 5/7 grid) for Founders / Investors / Employers / Partners & Sponsors — each with 2–3 benefit bullets and a contextual price + CTA (Claim profile · Start trial · Post a job · Become a sponsor).

11) SECTION 08 — PRICING: 3 tiers — Explorer Free (KSh 0: public directory, basic jobs, weekly brief, calendar) · Professional KSh 2,900/mo (INVERTED dark card, elevated, "Most popular" amber tab: full verified data, investor directory, 2 deal-flow requests, salary benchmarks, alerts) · Institution KSh 24,500/mo (API access, custom research, unlimited intros, dedicated analyst). Amber trial CTA on Professional. Footnote: "All prices are illustrative samples."

12) NEWSLETTER BAND (deep green #0A321F): "The Ecosystem Brief — every Monday, 06:30 EAT. What moved, what funded, what shipped." + inline email capture → success toast.

═══════════════════════════════════════════════
4. INNER PAGES (hash-routed views, no reload)
═══════════════════════════════════════════════
Router: location.hash driven (#/home, #/startups, #/company/:id, #/investors, #/funding, #/hackathons, #/jobs, #/news, #/article/:id, #/research). Views toggle with fade; scroll to top; active nav state.

• COMPANY INDEX (#/startups): breadcrumb, serif H1 "Company index", lede. Left sticky sidebar: name search, sector checkboxes with counts, stage pills (Pre-seed/Seed/Series A/Series B), HQ city select, "Verified only" toggle switch, "Clear all filters", verified legend, "Submit your startup" CTA card. Right: toolbar (live "Showing X of 428 — illustrative subset" + sort select: Most raised / Newest / A–Z / Most viewed) + table rows: monogram, name + verified badge + one-liner, sector (color square + label), stage pill, HQ, raised, founded, arrow. Hover = tint + arrow slides. Click → profile. Empty state with clear-filters button.

• COMPANY PROFILE (#/company/:id): breadcrumb Home/Startups/Sector/Name. Header: XL monogram, name + Verified-or-Unverified chip + "Sample profile" tag, tagline, meta pills (sector, stage, HQ, founded). Actions right: "Request introduction" (solid) + "Follow company". Then TABS: Overview | Funding | Team | News | Similar (JS tabs).
  – Overview: sample narrative; Key facts grid 6 cells (Employees ~58, HQ, Sector, Stage, Founded, Last round); "Technology stack" chips (self-reported · sample); "Signals we track" list (green-left-border items, all "(sample)").
  – Funding: table (Round/Date/Amount/Lead/Status) where Status = amber "Unverified — sample data" chip; below, "Funding trend (illustrative)" sparkline chart in a bordered box with a rotated dashed "SAMPLE DATA" watermark stamp.
  – Team: leadership cards with avatar initials; headcount note; open roles list linking to jobs.
  – News: generated coverage mentions (sample).
  – Similar: 4 similar-company cards (monogram, name, pills, raised).
  Right rail: Momentum sparkline "+X%" (12 weeks, sample); Investors list (3 funds, "Sample · unverified"); Hiring (open roles or empty note); Ecosystem actions: Request introduction / Report data issue / Claim this profile.

• INVESTORS (#/investors): H1 "Who is writing cheques." 3-column: left filter rail (focus sectors, stage select, verified-only toggle, live count); center expandable fund rows (monogram, name + verified badge, type·HQ, stage range, cheque size in mono, status chip; expanding reveals thesis note, thesis pills, "Notable investments (Sample)" as clickable company pills, Request introduction + Follow buttons); right rail: "Deal flow requests (Sample queue)" — 3 founder requests each with amber "Qualified intro ★" chip + note that intros are a paid, vetted service; "Investor activity (Illustrative)" sparkline; "List your fund" card. Below: full-width green subscription band (4 benefit ticks, KSh 4,900/mo sample, Start 14-day trial).

• FUNDING (#/funding): H1 "The funding database." + "Export quarterly dataset" button (toast). Dark chart panel (same chart component, 320px). Then "Notable rounds — this quarter" table with legend Confirmed/Reported/Estimated: Date | Company | Round | Amount | Lead investor | Source (e.g. "Company statement", "Lead investor memo", "Registry filing") | Status dot. Then "Where the capital went" horizontal bars (% of capital YTD). Then a bordered METHODOLOGY box in mono: defines Confirmed/Reported/Estimated and states all figures are illustrative samples.

• HACKATHONS (#/hackathons): dark-green hero ("BUILD · COMPETE · LAUNCH", H1 "Kenya's hackathon & builder events calendar.", lede, Submit an event + Browse all). Toolbar: tabs Upcoming | Ongoing | Past | Online + City/Theme/Prize selects + search. FEATURED EVENT CARD: left geometric SVG art panel (green/dark-green polygons + amber triangles) with big "NOV 14–16" date; right = "Featured · Sponsored" chip + "Illustrative event — not a real listing" chip, title "Nairobi Build Week 2026", meta (venue pin, 48 hours · teams of 2–5, prize pool KSh 1,500,000), theme, track pills, organizers line, Register + Details buttons. GRID of 7 event cards: date-square (rotating green/amber/ink color blocks), title, focus, city + format + prize chips, "Verified organizer" badge on one, builders-registered + countdown-days, Register button. ONGOING tab: live event card with red "LIVE" pulsing chip and HH:MM:SS countdown to submissions close. PAST tab: winners table (Event | Winning team | Prize | "Today" outcome — e.g. "Raised a $520K seed (sample)"). Then an ECOSYSTEM CALENDAR: real month grid (Mon-start), prev/next month navigation, event dots (amber = indexed hackathon, red = featured event), today inverted, footer legend. Bottom: organizer/sponsor band (List an event — free + Sponsor a hackathon).

• JOBS (#/jobs): DARK HERO: kicker "312 open roles", H1 "Tech jobs at Kenya's most ambitious startups.", search + location select + amber Search, skill pills (Python, Fintech, Remote, Product, Data). Two columns: left = category chips (All/Engineering/Data/Product/Design/Growth/Operations/Executive), remote-only toggle, job rows (expandable): monogram, title, company (green, clickable → profile) · location · mode + "✓ Verified employer" chip + "Featured" amber pill on featured rows, salary in mono with "Sample" sub, posted "Xd", BOOKMARK icon that toggles amber-filled with toast. Expanded: description + skill pills + Apply now. right sticky rail: "Employers — post a job" card with price table (Featured KSh 25,000 / Standard KSh 12,000 / Internship KSh 6,000 · SAMPLE PRICING) + Post now; "Salary benchmark" panel — range bars on a 0–700K axis for Backend (450–600, amber), Data/ML, Product, Mobile, Design, Growth + source note; "Job alerts" email form → toast.

• NEWS (#/news): category chips, lead + numbered list (same patterns as home).
• ARTICLE (#/article/:id): breadcrumb, category chip, serif H1, byline, monochrome photo, dashed SAMPLE ARTICLE notice box, 3–5 paragraph body (well-written, Kenya-specific analysis), Copy link + Save buttons, "More from the desk" related links.
• RESEARCH (#/research): flagship cover + buy/sample-chapter CTAs, "Library — All reports" rows (pages · date · blurb, tags: Members/price/Free, Unlock-Buy or Download buttons).

═══════════════════════════════════════════════
5. THE KENYA MAP — build precisely
═══════════════════════════════════════════════
A hand-built inline SVG (viewBox ~480×540), NO external libraries, NO tile maps:
1. Encode Kenya's real border as a coordinate polygon (lon,lat) capturing: the Ilemi Triangle tip (~35.9,5.0), the straight NE borders to Mandera corner (~41.9,4.0), the Somalia border down the coast, Lamu/Malindi/Mombasa indentation, the SE corner at ~39.2,-4.68 (Vanga), the Tanzania border running NW past Kilimanjaro notch, up to Lake Victoria at ~34.0,-1.05, and the western border closing at ~34.1,0.1.
2. Fill land with paper tone; render Lake Victoria (west entry) and Lake Turkana (center-north) as lighter water polygons with labels ("L. VICTORIA" italic).
3. Draw a dashed EQUATOR line across at lat 0 with an "EQUATOR" label.
4. Base layer: a jittered dot grid (~0.15° spacing) — a dot only where inside-border AND outside lakes (point-in-polygon test); dots slightly larger/denser near Nairobi (density falloff by distance from capital).
5. Hub layer: Gaussian-style scatter clusters per city (Nairobi biggest ~268, then Mombasa 41, Nakuru 33, Kisumu 28, Eldoret 19, Malindi 12).
6. City markers: amber dots (Nairobi larger with ivory ring + pulsing halo animation, staggered), mono uppercase labels + "268 cos." sublabels.
7. Dashed animated routes from Nairobi to Mombasa/Nakuru/Kisumu/Eldoret.
8. Ink border outline drawn on top; a north-arrow compass (top right) and a "100 KM" scale bar (bottom left).
9. Dots fade-in on load (staggered animation delays).
10. Interactions: hover hub → caption bar updates "Nairobi — 268 companies tracked · 63% of the index (sample)"; click hub → toast + navigate to directory pre-filtered to that city.

═══════════════════════════════════════════════
6. DATA MODEL (fictional, Kenya-realistic — write it as JS constants)
═══════════════════════════════════════════════
• COMPANIES (15): {id, name, tagline, sector, stage, hq, founded, raised(USD M), employees, verified 0|1, techStack[4], longDesc (2–3 sentence, specific, operational), signals[3] each ending "(sample)", rounds[{date, round, amount, lead}], founders[{name, role}]}. Names/ideas must be invented but plausible: Sokoni Systems (wholesale commerce OS), BodaMetrics (motorcycle fleet intelligence), PesaFlow (payment orchestration), ShambaSense (satellite crop intel via WhatsApp/USSD), Zuka Energy (PAYG solar), AfyaLink (clinic SaaS, UNVERIFIED), Mika Homes (rental escrow), DukaCredit (duka working capital, Mombasa, UNVERIFIED), ChapaRail (freight brokerage, UNVERIFIED), Elimu Forge (CBC AI tutoring, Eldoret, UNVERIFIED), Kazi Network (informal-sector hiring, Kisumu), Hadithi Labs (Swahili audio creators, UNVERIFIED), Mavuno Analytics (post-harvest loss, ex-hackathon winner), Rafiki HR (SME payroll/compliance), Ndege Aero (medical drones, Nanyuki, UNVERIFIED). Realistic detail: mention M-PESA rails, USSD, county governments, cooperatives, PAYE/NSSF/SHIF compliance, 2G/offline-first.
• INVESTORS (8): Rift Capital Partners, Savannah Ventures, Kilele Climate Fund, Acacia Angel Network, Hornbill Growth, Lake Basin Ventures (Kisumu), Mwezi Capital, Tenda Microfund — each {type, stages, cheque range, thesis[], HQ, deals count, verified 0|1, note, notable portfolio ids}.
• JOBS (10): title, company id, location, mode (Hybrid/On-site/Remote), category, salary "KSh 450–600K/mo", posted days, featured flag, tags[3], real-feeling description. 2 featured; several with Verified employers.
• HACKATHONS: featured (Nairobi Build Week 2026, theme "AI for the informal economy", prize KSh 1.5M, tracks, organizers, start = now + 21 days + offset so countdown always live); ongoing (ends now + ~9.5h); 7 upcoming across Nairobi/Mombasa/Nakuru/Kisumu/Kilifi/Online with prizes KSh 150K–800K, modes, themes (Fintech/AI/Logistics/Agritech/Civic/Inclusion), builder counts, one Verified organizer; 4 past winners with outcomes ("Raised a $520K seed (sample)", "acqui-hired (sample)").
• NEWS (7): real-analysis-tone articles: quarterly funding in five charts, angel syndicates filling the seed gap, Nairobi→Kigali expansion costs, hackathon pipeline lessons, climate deals changing instrument, salary snapshot, "why verified data beats loud data". Each: category, title, dek, mins, relative date, picsum seed, 3–4 full paragraphs.
• REPORTS (4): Funding Landscape H1 2025 (Members), Talent & Compensation Guide (KSh 2,500), Payments Infrastructure deep dive (Members), Hackathon Impact Study (Free).
• ROUNDS feed (6) with status letters c/r/e; CHART quarterly series (all/fintech/climate/commerce, 8 quarters); SECTOR counts; SALARY bands; DEALFLOW queue (3 founders).
Deterministic pseudo-random helper (seeded) for sparklines per company id so charts are stable across reloads.

═══════════════════════════════════════════════
7. INTERACTIONS & JS (vanilla, no libraries)
═══════════════════════════════════════════════
• Hash router + per-view render functions; render profile/article on demand.
• Global click delegation via data-attributes: data-company, data-article, data-investor, data-go, data-gofilter, data-gostage, data-gojob, data-modal, data-toast, data-x (expand), data-bm (bookmark), data-goprice (smooth-scroll to pricing).
• Entity search index across companies/investors/jobs/news/hackathons/pages; grouped dropdown; "/" focuses header search; Enter opens first result.
• Filters (directory): text, sectors set, stages set, city, verified, 4 sorts. Deep-link filters from home chips/map/pricing.
• Expandable rows: grid-template-rows 0fr→1fr animation; caret rotates; featured job rows tinted with amber left border.
• Charts: bar chart with sector chips, dashed gridlines, hover tooltip (rounds count), animated heights on load; horizontal bars; sparklines (seeded PRNG); snapshot minibars.
• Countdowns: featured event (D/H/M/S, 1s interval) + ongoing (HH:MM:SS).
• Count-up numbers (ease-out cubic, once).
• Scroll reveal: IntersectionObserver adding .in to .rv elements with --d stagger delays; respect prefers-reduced-motion.
• Modals (accessible: overlay click + Esc + X close): intro (vetted introduction), register (hackathon team), apply, report (data issue), listEvent, submit/claim startup, trial, buy report, post job, sponsor, invclaim, methodology, about. All forms: on submit close + contextual success toast containing "sample flow".
• Toasts stacked, auto-dismiss, exit animation.
• Kenya map per section 5. Salary bench bars. Job bookmarks in a Set. Mobile nav toggle. Calendar month navigation (state offset).

═══════════════════════════════════════════════
8. HONESTY SYSTEM (mandatory, woven everywhere)
═══════════════════════════════════════════════
• "Verified" = registry + team checks (design fiction, labeled). Green chip with badge icon vs dashed grey "Unverified" chip. Directory/profiles/investors/jobs all show the correct status.
• Funding statuses everywhere: Confirmed (green dot) / Reported (amber) / Estimated (grey) + a source column ("Company statement", "Registry filing") + methodology box + methodology modal.
• Amounts in company funding tables get "Unverified — sample data" chips; trend charts get a rotated "SAMPLE DATA" watermark stamp.
• Persistent micro-chips: "Sample data", "Illustrative", "Sample profile", "Sample pricing", "Illustrative event — not a real listing", "Sample content".
• Footer + floating chip + About modal all state: all companies, investors, people, figures and articles are illustrative samples describing no real entities or transactions.
• Never invent real companies, real funding figures, or real investor relationships.

═══════════════════════════════════════════════
9. MOTION PRINCIPLES
═══════════════════════════════════════════════
Restrained, institutional: 150–250ms hover transitions; 700ms scroll reveals with cubic-bezier(.2,.7,.2,1); animated data (count-ups, bar heights, marquee, pulse, dashed-route flow) as the only "wow" — never bounce, never parallax. Full prefers-reduced-motion support.

═══════════════════════════════════════════════
10. MOBILE-FIRST REQUIREMENTS (build mobile → up)
═══════════════════════════════════════════════
• Author the base stylesheet mobile-first; enhance at ≥760px and ≥1120px.
• ≤760px: single column everywhere; hamburger nav replaces inline nav; directory filters collapse to a stacked block above results; tables become horizontally scrollable; stat band 2-col; pricing stacks (Popular tier no longer offset); hero search full-width with tappable 44px+ targets; snapshot widget and map stack with map full-bleed; hide secondary table columns (HQ, Founded, 7D views) gracefully via classes; sticky side rails become static; job/expand rows wrap to 2-line grid; ticker and masthead stay compact (smaller search box).
• 760–1120px: 2-col card grids, asymmetric panels collapse logically.
• ≥1120px: full multi-column layouts as specified.
• Touch: larger hit areas on rows, chips, bookmarks; hover tooltips degrade to tap-visible; map hubs have enlarged invisible hit circles.
• Typography scales with clamp() for H1/H2 (e.g. clamp(40px,5.2vw,72px) hero, clamp(26px,3.2vw,40px) sections).

═══════════════════════════════════════════════
11. SEO & DISCOVERABILITY (production-grade)
═══════════════════════════════════════════════
• Semantic HTML5: single <h1> per view, hierarchical h2/h3, <header>/<nav>/<main>/<section aria-labelledby>/<article>/<aside>/<footer>, <table> with proper <th scope>, alt text on every image, aria-labels on icon buttons, :focus-visible styles.
• <head>: title "startups.co.ke — Kenya's Startup Ecosystem & Business Intelligence Hub"; meta description (~155 chars, mention verified startup profiles, funding data, investor directory, hackathons, tech jobs in Kenya); canonical https://startups.co.ke/; robots; theme-color #0E4630; Open Graph + Twitter card tags (og:title, og:description, og:image 1200×630, og:locale en_KE, og:type website); favicon via inline SVG data URI of the logo mark.
• JSON-LD structured data (one <script type="application/ld+json"> per type):
  – Organization + WebSite with SearchAction (potentialAction → /search?q={search_term_string}).
  – ItemList of the featured companies (name, url).
  – Article schema on the news article view (headline, author Person, datePublished, publisher).
  – JobPosting schema for job rows (title, hiringOrganization, jobLocation/Telecommute, datePosted, baseSalary in KES).
  – Event schema for hackathons (name, startDate, location, offers/prize, organizer).
  – FAQPage or Dataset schema on the funding page (name "Kenya Startup Funding Database", license note).
• Add commented <link rel="alternate" hreflang> block + a commented XML sitemap outline (/, /startups, /investors, /funding, /hackathons, /jobs, /news, /research) and robots.txt suggestion.
• Performance-SEO: preconnect to fonts.googleapis.com/gstatic, font-display swap, lazy-loading images (loading="lazy" decoding="async"), width/height or aspect-ratio to prevent CLS, system-font fallbacks, all JS deferred at end of body, no layout-shifting animations.
• Local SEO signals: .co.ke branding, "Nairobi, Kenya" in copy/footer/org address, EAT signals (methodology page, named author "Njeri Mwangi", data-status transparency) — explain in a comment block how verification/status tags map to Google E-E-A-T trust guidelines.
• Keyword intent to naturally cover in copy (no stuffing): "Kenyan startups list", "startups in Kenya", "Kenya startup funding", "venture capital Kenya", "investors in Kenya", "tech jobs Nairobi", "hackathons Kenya 2025/2026", "Kenya startup ecosystem report".

═══════════════════════════════════════════════
12. QUALITY BAR
═══════════════════════════════════════════════
Every visible element wired (filters, tabs, modals, toasts, router, countdowns, map). No lorem ipsum, no dead buttons, no empty states without design. The finished file should be openable offline and feel like a funded Kenyan intelligence company shipped it. If anything in this spec conflicts, prioritize: honesty system > information density > typography/rules authority > motion.we arent doing anymore imrpovement rounds on this or further ones my domain startups.co.ke has to go live today and we dont have much time be through with your work take your time attention to details screenshots and vlm reviews pixel perfect work also keep supabase for the backend create a new project utilize the built in auth and stuff run full e2e tests and edge cases [REDACTED:supabase_token] and heres the token i will revoke it i give you full permission to use it for all necessary work and to create write and read projects i epecially made it for todays work use it as a way customers data is stored also yeah add the usual cookies to the page that gives data also copy dont reinvent wherever you can so we dont rebuild from scratch use tools and stacks that provide ready to go sevices on all these hunt github see what you find execute all ive said plus also use strategic thinking and btw dont leave or forget page favicon and a logo also my support email is jack@startups.co.ke and phone number is +254721725958 include privacy policy where needed,and ofc study the giants and stand on their shoulders we want sth polished ready to go today ive sent you the full spec of all i want no next we should do this im low on time do all these in 1 run, no next we should do this and this pls do all the work 