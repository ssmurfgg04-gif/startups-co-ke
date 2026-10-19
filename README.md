# startups.co.ke

**Kenya's startup ecosystem & business intelligence platform.**
Data terminal × editorial publication — verified profiles, funding intelligence with named sources, investor directory, hackathon index and tech jobs.

Built on the "standing on shoulders of giants" principle: [Astro 5](https://astro.build) (static-first, content collections, build-time generation), [Tailwind CSS 4](https://tailwindcss.com) (CSS-first `@theme` tokens), [Supabase](https://supabase.com) (auth, database, storage), `@astrojs/sitemap`, `@astrojs/rss`.

## Repo layout

- `src/` — the Astro 5 app (pages, components, layouts, data, content collections)
- `worker/` — the Cloudflare Worker: the single production backend (`index.js` + `lib.mjs` + `render.mjs` + `brief.mjs`)
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
| Dynamic backend | Cloudflare Worker (Supabase REST, service key) | `worker/index.js`, `/api/*`, `/startups/community/*`, `/desk` |
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
# worker secrets (Cloudflare dashboard — never in source)
RESEND_API_KEY=re_...
SUPABASE_SERVICE_ROLE_KEY=...
NOTIFY_EMAIL=desk@startups.co.ke   # the desk mailbox, no code fallback
# optional privacy-friendly analytics (loads only after cookie consent)
PUBLIC_ANALYTICS_DOMAIN=startups.co.ke
```

**Worker runtime config.** The Cloudflare Worker is the only backend. Non-secret vars ship in `wrangler.jsonc` (`PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`, `NOTIFY_EMAIL`); secrets live ONLY in **Cloudflare dashboard → Workers → startups-co-ke → Settings → Variables & Secrets** (never in source):

- `SUPABASE_SERVICE_ROLE_KEY` — required for writes; the Worker answers 503 without it (check `/api/health`).
- `RESEND_API_KEY` — required to actually send email; without it email no-ops and the database stays the source of truth.
- `NOTIFY_EMAIL` — the desk mailbox. No hardcoded fallback: missing config fails closed (the desk simply won't unlock).
- `RESEND_FROM` — default `startups.co.ke <notices@startups.co.ke>` (domain verified ✓).

The legacy `POST /api/notify` endpoint was deleted (unauthenticated email relay).

## Supabase

Project ref: `<project-ref>` (region eu-west-2). Schema in `supabase/migrations/0001_init.sql` + `tools/schema.sql`:

- `submissions` — every user-submitted flow (startup, claim, job, event, intro, issue, trial, buy, sponsor, register). Public insert, owner-only read (RLS). **This table is the review queue** — browse it in the Supabase dashboard → Table Editor → submissions; every entry also lands in the desk inbox via the Resend function above.
- `newsletter_subscribers` — The Ecosystem Brief signups (unique email).
- `logos` — public storage bucket for user-uploaded company logos.

Auth: magic-link sign-in (Supabase Auth), site_url + redirect allow-list preconfigured.

## Jobs automation (piggyback, zero manual upkeep)

- **Build-time pull:** `scripts/fetch_jobs.mjs` reads employers' own ATS boards (Lever / Greenhouse / Workable / BambooHR / Ashby), keeps Kenya-relevant roles only, **link-checks every application URL** (confirmed 404/410 → dropped; ambiguous bot-wall → kept, never silently empties the board) and writes `src/data/jobs.live.json`.
- **Daily refresh:** `.github/workflows/refresh-data.yml` runs 06:00 EAT daily — re-pulls boards, commits the changed snapshot with `GITHUB_TOKEN` (no secrets needed), and the push triggers the Cloudflare Workers git integration rebuild. Run on demand via *Run workflow*.
- **Add an employer:** append one line to `SOURCES` in `scripts/fetch_jobs.mjs` (board slug + display name). That's it.

## Deployment

**Cloudflare Workers (the only deploy target).** `wrangler.jsonc` serves the Astro `dist/` as static assets from the Worker (`worker/index.js` handles `/api/*`, `/startups/community/*`, `/desk`, `/auth/*`).

- **Auto-deploy:** the Cloudflare Workers git integration watches `main` — every push runs `bun run build` and ships. Keep `bun.lock` the ONLY lockfile (`package-lock.json` is gitignored; mixed lockfiles broke builds before).
- **Secrets:** Cloudflare dashboard → Workers → startups-co-ke → Settings → Variables & Secrets (see the list above). `wrangler.jsonc` `vars` holds only non-secrets.
- **Manual deploy (rare):** `bun run build && bunx wrangler deploy`.
- **Post-deploy smoke:** `GET /api/health` → `{"ok":true,"storage":true,"email":true,"anon":true}`.
- **Supabase Auth URL config (dashboard):** Site URL `https://startups.co.ke`; redirect allow-list includes `https://startups.co.ke/**` and `https://startups.co.ke/auth/reset`.

## Founder-listed startups (instant publish, no approval) — Session 7

- **Flow:** founder opens *List your startup* → publishes → live immediately at
  `/startups/community/<slug>` (server-rendered by the Worker from Supabase).
  No review queue. Optional review fallback still writes to the Supabase
  `submissions` table.
- **Storage:** Supabase table `community_startups` (slug-keyed) via the Worker's
  service key; rate-limit counters live in the `rate_limits` table.
- **Spam controls:** hidden honeypot (`company_url`), strict field caps, https-only
  website links, per-IP daily cap from `cf-connecting-ip` only (5 anon / 10 with a
  verified session), `rel="nofollow ugc"` on founder links, Founder-submitted badge
  until editorially verified.
- **Removing a bad listing:** `/desk` → Unlist or Delete (one click, session-gated;
  records are kept for audit except explicit delete). Any record whose `status` is
  not `published` is excluded from `?format=md` and the list feed.
- **Caching:** dynamic pages answer `s-maxage=300, stale-while-revalidate=86400`;
  static assets are immutable (`/_astro/*`, `/fonts/*`); HTML revalidates.

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
- Verified: `scripts/unit_s7.mjs` + `scripts/unit_s8.mjs` (43 checks, run against
  `worker/lib.mjs` + `worker/render.mjs` — the code that actually ships).

## Contact

contact@startups.co.ke · +254 700 000 000 · WhatsApp wa.me/254700000000
