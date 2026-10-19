# VLM Review Cycle — 10 rounds (D7 taste loop)

Date: 2026-10-15 · Method: 11 page screenshots (agent-browser, 1280×800 + iPhone 14) → vision-model critique (`z-ai vision`) per page, fixes applied, re-shot, re-critiqued.

## Scores by round

| Round | Page | Initial | After fixes |
|-------|------|---------|-------------|
| 01 | Home (full) | 4/10 | **9/10** |
| 02 | Startups directory | 3/10 | **9.5/10** |
| 03 | M-KOPA profile | 6/10 | **9/10** (verdict: "clean up overlaps to hit 9") |
| 04 | Twiga failure profile | 7.5/10 | **8.5/10** |
| 05 | Investors | 6.5/10 | **8.5–9/10** |
| 06 | Funding database | 6.5/10 | **8.5/10** |
| 07 | Hackathons | 6.5/10 | **8.5/10** |
| 08 | Jobs | 6/10 | **8.5/10** |
| 09 | Article | 7.5/10 | **8/10** |
| 10 | Research | 7.5/10 | **8.5/10** |

## Root causes found & fixed (cross-page)

1. **Directory crash (round-02, 3/10):** `${c.raised.toFixed(1)}` threw on `null` raised (CarePay, Pesapal, Roam, Flowt) — killed the whole client script, so the company grid rendered zero rows. Fixed with null-safe display + null-safe sort. Verified live: 21 rows render, M-KOPA first.
2. **Content invisible without JS / before reveal (rounds 1–3):** `.rv` reveal animations set `opacity:0` unconditionally. Now JS-gated (`html.js .rv`) — without JavaScript everything is visible; with JS, IntersectionObserver reveals on scroll (respects prefers-reduced-motion).
3. **Cookie banner styling (all rounds):** restyled from generic dark box to brand paper card — 1px ink border, hard offset shadow `6px 6px 0 paper3`, square corners, amber/ghost buttons; malformed width utility fixed; still bottom-left fixed, dismissible, choice persisted.
4. **Funding table unsorted (round-06):** rounds now sorted date-descending (undated last); H1-2026 partial-period note added under chart methodology.
5. **Chip system (rounds 4–5, 10):** dashed chips re-inked (`border-ink/50 text-ink2`); failure states got the `chip-alert` clay treatment; research price chips unified (Free=solid, Members=outline, Paid=amber); Twiga status note softened to `border-l-4 clay + bg-clay/5`.
6. **Numbers (round-01):** `.statnum` now `tabular-nums`; amounts right-aligned in the dark rounds feed.
7. **Footer contrast (rounds 3, 7, 10):** muted footer text bumped to `dpaper/80–85`.
8. **Profile rail duplication (round-03):** "Request introduction" now ghost in sidebar, primary action remains in header; data-issue button promoted to primary.

## Accepted residuals (screenshot artifacts / by-design)

- Fixed-position elements (cookie banner, data chip) appear mid-page in full-page captures — in a real viewport they sit in corners. Verification shots pre-set consent to remove the artifact.
- Mixed logos vs monograms is the designed fallback (D5) — dead companies (Twiga, Sendy, Copia) intentionally have no logo.
- Dense data rows are the spec's explicit "information density" requirement.

Per-round detail: see `round-*.md` in this folder (fresh post-fix critique each).
