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
| Instant listings | Netlify Functions + Netlify Blobs | `netlify/functions/`, `/startups/community` |
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
- `NOTIFY_EMAIL` — recipient. Default `jackblessed191@gmail.com` (a proven inbox). To receive at `contact@startups.co.ke`, set this var — but only once that mailbox exists (Resend sends FROM your domain; it does not host mailboxes for it).
- `RESEND_FROM` — default `startups.co.ke <notices@startups.co.ke>` (domain verified ✓ — delivers to any inbox, replies route to the submitter).

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

**"Powered by Netlify" badge:** the floating badge on the live site is injected by Netlify's edge (it renders in an isolated frame, so site CSS can't remove it). Turn it off in the dashboard: **Project configuration → General → Powered by Netlify badge → off**. Takes effect on the next page request — no redeploy needed.

## Founder-listed startups (instant publish, no approval) — Session 7

- **Flow:** founder opens *List your startup* → publishes → live immediately at
  `/startups/community/<slug>` (server-rendered by `netlify/functions/startup-page.mjs`,
  rewritten from the clean URL via `netlify.toml`). No review queue. Optional review
  fallback still writes to the Supabase `submissions` table.
- **Storage:** Netlify Blobs, store `community_startups` (keys `s:<slug>`; rate-limit
  counters `__rl:<ip>:<date>`). Zero schema migration; nothing to configure — the
  runtime injects credentials automatically.
- **Spam controls:** hidden honeypot (`company_url`), strict field caps, https-only
  website links, per-IP daily cap (5 anon / 10 with a Supabase magic-link session,
  verified server-side via `/auth/v1/user` — no service key needed), `rel="nofollow ugc"`
  on founder links, Founder-submitted badge until editorially verified.
- **Removing a bad listing** (dashboard → Netlify UI has no Blobs browser): run
  `NETLIFY_AUTH_TOKEN=<token> NETLIFY_SITE_ID=<site-id> node tools/remove_listing.mjs <slug>`
  (see `tools/`), or purge via API. The `?format=md` + list function exclude any record
  whose `status` is not `published`.
- **Caching:** functions answer with `s-maxage=300, stale-while-revalidate=86400`;
  static assets are immutable (`/_astro/*`, `/fonts/*`); HTML revalidates. Googlebot
  crawls the edge, not your origin.

## Performance & Cloudflare notes (Session 7)

- **Fonts are self-hosted** in `public/fonts/` (Fraunces/Archivo/IBM Plex Mono, latin,
  ~260 KB total) with 3 preloads in `Seo.astro` — the render-blocking third-party font
  stylesheet is gone. Add new weights via `scripts/fetch_fonts.py`.
- **Email addresses are base64-encoded** (`data-email` + `core.ts` decode) so Cloudflare
  Email Obfuscation never finds an address and stops injecting its
  `/cdn-cgi/l/email-decode` script. Keep the feature on in Cloudflare — it's now inert.
  The literal address appears only inside JSON-LD `contactPoint` (inert data, not scrambled).
- **SVG dash/pulse animations are hover-gated** and all animations respect
  `prefers-reduced-motion` at the CSS level (no-JS included).
- Verified: `scripts/unit_s7.mjs` (26 checks), `scripts/e2e_s7.mjs` (44 checks),
  `scripts/e2e_s4.mjs` (32), `scripts/e2e_s6.mjs` (6).

## Contact

contact@startups.co.ke · +254 700 000 000 · WhatsApp wa.me/254700000000
