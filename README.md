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
# optional privacy-friendly analytics (loads only after cookie consent)
PUBLIC_ANALYTICS_DOMAIN=startups.co.ke
```

## Supabase

Project ref: `eezqpsbhmnhuhnmiwnsz` (region eu-west-2). Schema in `supabase/migrations/0001_init.sql` + `tools/schema.sql`:

- `submissions` — every user-submitted flow (startup, claim, job, event, intro, issue, trial, buy, sponsor, register). Public insert, owner-only read (RLS).
- `newsletter_subscribers` — The Ecosystem Brief signups (unique email).
- `logos` — public storage bucket for user-uploaded company logos.

Auth: magic-link sign-in (Supabase Auth), site_url + redirect allow-list preconfigured.

## Deployment

Static host (Netlify / Vercel / Cloudflare Pages), or GitHub Pages via Actions:

```bash
bun run build && npx netlify deploy --dir=dist --prod
```

GitHub Pages option (until DNS lands): https://ssmurfgg04-gif.github.io/startups-co-ke/
DNS at the registrar: `A` @ → 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153 · `CNAME` www → ssmurfgg04-gif.github.io. HTTPS is automatic once DNS verifies.

## Contact

contact@startups.co.ke · +254 700 000 000 · WhatsApp wa.me/254700000000
