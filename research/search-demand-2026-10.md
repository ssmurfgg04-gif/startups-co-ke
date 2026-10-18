# Search Demand Research — startups.co.ke (Oct 2026, Session 7)

**Honesty rule (site D2, applied to ourselves): no invented search volumes, keyword
difficulty scores, traffic forecasts or trend curves appear in this document.** Where a
number is shown, it is verifiable via the named source. Where Google Search Console or a
keyword tool is required, that is marked **[VERIFY — needs GSC/tool]**.

---

## 1. What we can verify today (measured)

| Signal | Value | Source |
|---|---|---|
| Kenya's startup ecosystem rank | #61 globally, #1 in Eastern Africa | StartupBlink, Oct 2026 |
| Kenyan startups listed by third-party ranker | 659 | StartupBlink, Oct 2026 |
| Kenya equity funding 2025 | $984M — Africa #1, second year running | Tech In Africa (via site wire) |
| Kenya equity funding H1 2026 | $126M, −44.5% YoY | Business Daily (via site wire) |
| Africa H1 2026 | $1.44B, +1.34% | TechCabal Insights (via site wire) |
| Investor losses across 13 Kenyan startup failures | Sh93bn | Business Daily (via site wire) |
| Insurtech venture funding over 5 years | Sh8.54B | Business Daily (via site wire) |
| Googlebot index status | ~40 pages known to Googlebot (owner report, Oct 2026) | owner / GSC |
| KE daily trending searches (real-time spikes) | research/gtrends-fresh.xml (raw RSS, refreshed by scripts/refresh_trends.py) | Google Trends RSS |

Reading: demand for *structured Kenyan startup information* is proven by the existence
and traffic of aggregators (StartupBlink, Tracxn, TechCabal, Techpoint) — they rank
pages precisely because people search for these entities and lists. The site's own
positioning (verified, sourced, honest statuses) is differentiated, not commoditised.
**[VERIFY — needs GSC]**: which of our own ~40 pages already earn impressions.

## 2. Keyword → page mapping (clusters)

Volume notes are deliberately absent. Priority = confidence in intent fit + our
competitive right-to-win.

### Cluster A — Branded entity queries (highest confidence, fastest wins)
People who read funding news search the company name + qualifier. We already own the
most complete sourced profile for 21 entities.
- `<company> funding` / `<company> funding history` → `/startups/<id>` (e.g. "BasiGo funding history" → /startups/basigo)
- `<company> investors` / `<company> revenue` → same profile + `/funding`
- `what happened to <company>` / `<company> shut down` → failure-state profiles (Twiga, Copia, Sendy) — statusNote carries it
- Action: profile pages already have Org JSON-LD + sourced rounds; nothing invented. **[VERIFY — needs GSC]** query report to prioritise which profiles get deeper copy.

### Cluster B — Climate & Energy vertical (the business-selected play)
Capital flows here (Cluster evidence: $984M 2025 Africa #1; insurtech Sh8.54B). Competitors
are global (Tracxn: clunky, paywalled) or media (article-per-announcement, no database).
- "Kenya climate tech startups" / "Kenya cleantech startups directory" → **/climate-tech** (shipped this session)
- "electric bus Kenya BasiGo" / "electric motorcycle Kenya Roam" → profiles + hub
- "solar irrigation startups Kenya" → SunCulture profile + hub
- "climate insurance Africa Pula" → Pula profile
- "climate tech funding Kenya 2026" → hub capital-context section + /funding
- The hub's FAQ targets question-form long-tails directly with tracked-count honesty.

### Cluster C — Directory/list intent (head terms; 60-day sandbox applies)
- "startups in Kenya" / "list of startups in Kenya" / "Kenyan startups to watch" → /startups
- "Kenya startup directory" → /startups + /climate-tech
- "startups in Nairobi/Mombasa/Kisumu/Nakuru/Eldoret" → /startups?city= filters (map anchors already link these)
- Action: keep titles/descriptions as shipped (they name the thing plainly); internal links from The Wire articles pass context.

### Cluster D — Investor intent (monetisation-adjacent)
- "venture capital firms in Kenya" / "angel investors Kenya" / "accelerators Nairobi" → /investors
- "investor database Kenya" → /investors (Professional plan hook)

### Cluster E — Jobs intent (highest volume ceiling on the site)
- "tech jobs Nairobi" / "fintech jobs Kenya" / "developer jobs Kenya remote" → /jobs
- "salary software engineer Kenya" → Talent & Compensation guide + /jobs

### Cluster F — Failure/research intent (low competition, high authority)
- "failed startups Kenya" / "startups that collapsed in Kenya" → The Wire analysis (#2: "The fallen") + failure-state profiles
- "Kenya startup funding 2026" → /funding + Wire #1

### Cluster G — AI-surface / LLM retrieval (the new discovery layer)
- Assistant queries ("best cleantech startups in Kenya", "how much has M-KOPA raised")
  are answered from machine-readable corpora. Shipped this session: `/llms.txt`,
  `/llms-full.txt`, per-profile `/startups/<id>.md`, founder-page `?format=md`.
- TrustMRR pioneered per-page "AI-readable Markdown"; we match the pattern and add the
  site-level llmstxt.org map. This is positioning for AI citations, not a volume play.

## 3. Verification plan (owner, ~30 minutes total)

1. **GSC**: confirm startups.co.ke property; after 14 days export Queries → sort by
   impressions. Mark every query with an existing page (Cluster A wins) vs. no page
   (content gap). This replaces all the invented volumes we refuse to fabricate.
2. **Keyword Planner / free tools**: spot-check 5–10 cluster B/C terms for volume bands
   (low/mid/high) before investing in more vertical pages.
3. **Trends RSS**: keep `scripts/refresh_trends.py` daily run — trending spikes feed
   The Wire story selection (already wired), not evergreen pages.
4. **Watch**: `/climate-tech` and `/startups/community` were added to sitemap-0.xml by
   the build (43 pages now); request indexing in GSC for the two new hub pages.

## 4. What we did NOT do, on purpose
- No volume/Difficulty numbers inserted anywhere on the site or in this doc without a tool export.
- No doors/gateway pages for counties (thin-content risk under Google's spam policy;
  county pages ship only when tracked data genuinely supports them — currently only Nairobi).
- No scraping SERPs for fake "10K searches/mo" claims. If a number can't be verified, it isn't published.
