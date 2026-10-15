# E2E Persona Test Report — startups.co.ke

Date: 2026-10-15 · Live Supabase project `eezqpsbhmnhuhnmiwnsz` (eu-west-2) · dev server :3000
Method: agent-browser scripted journeys; every backend write verified against the Postgres tables via the Management API SQL endpoint.

## Persona 1 — Investor (session `e2e-inv`)

| # | Step | Result |
|---|------|--------|
| 1 | Land on home, real wire ticker + stats render | PASS — title correct, 12 sections render |
| 2 | Hero search "solar" → deep-link to directory | PASS — `/startups?q=solar` shows M-KOPA + SunCulture |
| 3 | SunCulture profile → Funding tab | PASS — `$10M Securitisation (debt)` row visible with status chip |
| 4 | Request introduction modal → submit | PASS — `submissions` row `kind=intro` verified in DB (email + note intact) |
| 5 | /funding → Fintech series switcher | PASS — bar heights re-render to fintech series |
| 6 | CSV export button | PASS — "Export ready" toast, `startups-co-ke-funding-database.csv` |
| 7 | /investors → Verified-only filter | PASS — "Showing 9 funds" (9 verified of 13 tracked — matches data) |
| 8 | Newsletter subscribe (footer modal) | PASS — `newsletter_subscribers` row verified, duplicate-safe (unique constraint) |

## Persona 2 — Startup Founder (session `e2e-fdr2`)

| # | Step | Result |
|---|------|--------|
| 1 | M-KOPA profile → Claim profile + logo upload | PASS — `kind=claim` row + object in `logos` bucket; `logoPath` recorded in payload |
| 2 | Submit your startup + logo upload | PASS — `kind=startup` row ("Zuka Robotics") + `logos/Zuka Robotics-*.png` object |
| 3 | Post a job | PASS after bug fix (see below) — `kind=job` row with company/title/email |
| 4 | Hackathon "Get reminders" (register modal) | PASS — `kind=register` row |
| 5 | Expand job row + bookmark | PASS — localStorage `sck-bookmarks = ["j-mkopa-backend"]`, toast fired |

## Bugs found by E2E (fixed)

1. **ID collision broke "Post a job" for everyone** — the modal heading `<p id="pj-title">` collided with the Role-title `<input id="pj-title">`. Any `querySelector('#pj-title')` or `label[for]` targeting hit the heading; the real input stayed empty and HTML5 validation silently blocked submission. Fixed: heading renamed to `postjob-heading`; a duplicate-id scan across ModalHost now reports **zero** duplicate ids. This is exactly the class of bug the founder persona exists to catch.
2. **Test-harness lessons (not app bugs):** agent-browser `eval` shares global lexical scope across calls (const re-assignment throws) — all steps re-run as IIFEs; toast assertions now read actual toast text rather than substring matches against page HTML.

## Cleanup

- All test rows deleted from `submissions` and `newsletter_subscribers` (both back to 0).
- Two 8-byte test uploads remain in the public `logos` bucket (`Zuka Robotics-*.png`, `June Founder-*.png`). The Storage API blocks direct object deletion without the service key (kept out of the sandbox by design); the site never reads this bucket (profiles serve `/public/logos/*`). Remove anytime with a service-key call: `supabase storage rm` or dashboard → storage → logos.

## Environment notes

- Auth (magic-link) flow is wired (Supabase OTP POST verified earlier in session); full OTP round-trip needs mailbox access, out of scope here.
- The anon-key RLS posture was exercised live: public insert on `submissions`/`newsletter_subscribers` succeeded; storage upload to `logos` succeeded.
