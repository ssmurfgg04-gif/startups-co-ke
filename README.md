# startups.co.ke

**Kenya's startup ecosystem & business intelligence platform.**
Data terminal × editorial publication — verified profiles, funding intelligence with named sources, investor directory, hackathon index and tech jobs.

Built on the "standing on shoulders of giants" principle: [Astro 5](https://astro.build) (static-first, content collections, build-time generation), [Tailwind CSS 4](https://tailwindcss.com) (CSS-first `@theme` tokens), [Supabase](https://supabase.com) (auth, database, storage), `@astrojs/sitemap`, `@astrojs/rss`.

## Repo layout

- `src/` — the Astro 5 app (pages, components, layouts, data, content collections)
- `docs/` — `DECISIONS.md` (why everything is the way it is), `SPEC.md` (product spec), `TASTE-SKILL-README.md`
- `research/` — raw research captures (search results, Google News RSS, arXiv, Google Trends)
- `tools/` — `schema.sql`, `seed.sql` (real sourced seed data), `run_sql.py` (Supabase Management API runner)
- `skills/taste-skill/` — vendored design-taste skill (MIT, Leonxlnx) used for the visual QA loop
- `qa/` — screenshots, VLM reviews, E2E persona reports
- `supabase/migrations/` — schema applied to the live project

## Stack

| Layer      | Giant                                | Where                              |
| ---------- | ------------------------------------ | ---------------------------------- |
| Framework  | Astro 5 (static output)              | `src/pages`, `src/layouts`         |
| Styling    | Tailwind 4 CSS-first config          | `src/styles/global.css` (`@theme`) |
| Global cfg | Site config single source of truth   | `src/config/site.ts`               |
| Sector cfg | Palette + labels                     | `src/config/sectors.ts`            |
| Data       | Typed TypeScript modules, real sourced entities | `src/data/*.ts`         |
| Editorial  | Content collections (Markdown)       | `src/content/news/*.md`            |
| Backend    | Supabase (auth + Postgres + storage) | `src/lib/supabase.ts`              |
| SEO        | Sitemap, RSS, JSON-LD, OG images     | `src/components/Seo.astro`, etc.   |

## Commands

```bash
bun install          # deps
bun run dev          # dev server on :3000 (teed to dev.log)
bun run build        # production build → dist/
bun run preview      # serve the production build on :3000
```

## Architecture notes (the "giants" decisions)

- **Build-time over runtime**: the Kenya dot map is generated in `.astro` frontmatter (point-in-polygon, density falloff, Gaussian hub clusters) — zero runtime cost, ships as static SVG.
- **One config, many pages**: nav, footer, contact, pricing, honesty disclaimers all come from `src/config/site.ts`.
- **Typed data layer**: companies/investors/jobs/hackathons/rounds are TypeScript modules — pages derive everything; no duplicated markup.
- **Content collections**: news articles are Markdown with a zod schema (`src/content.config.ts`).
- **Honesty system**: every figure carries a visible status tag (Confirmed / Reported / Estimated) plus a named source where one exists. Real entities and figures are labelled with their source; anything estimated says so. See `docs/DECISIONS.md` (D2).
- **Graceful degradation**: forms write to Supabase when `PUBLIC_SUPABASE_*` is configured; otherwise they queue locally with an honest toast.

## Environment

Copy `.env.example` → `.env`:

```
PUBLIC_SUPABASE_URL=...
PUBLIC_SUPABASE_ANON_KEY=...
# review-queue email notifications (server-side only — see below)
RESEND_API_KEY=re_...
NOTIFY_EMAIL=jackblessed191@gmail.com
# optional privacy-friendly analytics (loads only after cookie consent)
PUBLIC_ANALYTICS_DOMAIN=startups.co.ke
```

**Resend / review-queue emails.** Every form (submit startup, post a job, claim, sponsor, …) writes into the Supabase `submissions` table and then pings `POST /.netlify/functions/notify`, which emails the desk a digest via the Resend API. Set in **Netlify UI → Site configuration → Environment variables** (server-side only — the key never reaches the browser bundle):

- `RESEND_API_KEY` — required to actually send; without it the function no-ops (202) so forms never break.
- `NOTIFY_EMAIL` — recipient. Default `jackblessed191@gmail.com` (the Resend account owner — reachable today via Resend's test sender).
- `RESEND_FROM` — once `startups.co.ke` is verified at resend.com/domains, set to `startups.co.ke <notices@startups.co.ke>` and switch `NOTIFY_EMAIL` to `contact@startups.co.ke`.

Local check: `node scripts/test_notify.mjs --live` (prints the exact email body, then really calls Resend).

## Supabase

Project ref: `eezqpsbhmnhuhnmiwnsz` (region eu-west-2). Schema in `supabase/migrations/0001_init.sql` + `tools/schema.sql`:

- `submissions` — every user-submitted flow (startup, claim, job, event, intro, issue, trial, buy, sponsor, register). Public insert, owner-only read (RLS). **This table is the review queue** — browse it in the Supabase dashboard → Table Editor → submissions; every entry also lands in the desk inbox via the Resend function above.
- `newsletter_subscribers` — The Ecosystem Brief signups (unique email).
- `logos` — public storage bucket for user-uploaded company logos.

Auth: magic-link sign-in (Supabase Auth), site_url + redirect allow-list preconfigured.

## Jobs automation (piggyback, zero manual upkeep)

- **Build-time pull:** `scripts/fetch_jobs.mjs` reads employers' own ATS boards (Lever / Greenhouse / Workable / BambooHR / Ashby), keeps Kenya-relevant roles only, **link-checks every application URL** (confirmed 404/410 → dropped; ambiguous bot-wall → kept, never silently empties the board) and writes `src/data/jobs.live.json`.
- **Daily refresh:** `.github/workflows/refresh-data.yml` runs 06:00 EAT daily — re-pulls boards, commits the changed snapshot with `GITHUB_TOKEN` (no secrets needed), and the push triggers Netlify's auto-deploy. Run on demand via *Run workflow*.
- **Add an employer:** append one line to `SOURCES` in `scripts/fetch_jobs.mjs` (board slug + display name). That's it.

## Deployment

**Netlify (primary — prepared, one step away):** the repo ships `netlify.toml` (Node 22, `npm run build`, `dist/`, cache + security headers) and `.github/workflows/netlify.yml`. Every build re-pulls the live job boards via `scripts/fetch_jobs.mjs` (committed snapshot is the fallback, so a build never breaks on a flaky board).

Two ways to go live:

1. **Netlify UI (fastest):** Netlify → *Add new site → Import an existing project* → pick this repo. Build settings auto-load from `netlify.toml` — just click Deploy. Optionally set env vars `PUBLIC_SUPABASE_URL` / `PUBLIC_SUPABASE_ANON_KEY` (values in `.env.example`; the build also has public-by-design fallbacks, so deploys work without them).
2. **GitHub Actions:** add two repo secrets — `NETLIFY_AUTH_TOKEN` (Netlify → User settings → Applications → Personal access token) and `NETLIFY_SITE_ID` (Site → Site settings → API) — then push to `main`. The workflow builds and ships to production; without the secrets the deploy step skips itself.

Then attach the domain: Netlify → *Domain settings* → add `startups.co.ke` apex + `www` (Netlify DNS or registrar CNAME → `<site>.netlify.app`; HTTPS via Let's Encrypt is automatic). The Astro `site` is already `https://startups.co.ke`, so sitemap/OG/canonicals are correct from the first deploy.

CLI alternative: `npm run build && npx netlify-cli deploy --prod --dir=dist`

## Contact

contact@startups.co.ke · +254 700 000 000 · WhatsApp wa.me/254700000000
