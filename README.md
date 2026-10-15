# startups.co.ke

**Kenya's startup ecosystem & business intelligence platform.**
Data terminal × editorial publication — verified profiles, funding intelligence with named sources, investor directory, hackathon index and tech jobs.

Built on the "standing on shoulders of giants" principle: [Astro 5](https://astro.build) (static-first, content collections, build-time generation), [Tailwind CSS 4](https://tailwindcss.com) (CSS-first `@theme` tokens), [Supabase](https://supabase.com) (auth, database, storage), `@astrojs/sitemap`, `@astrojs/rss`.

## Stack

| Layer      | Giant                                | Where                              |
| ---------- | ------------------------------------ | ---------------------------------- |
| Framework  | Astro 5 (static output)              | `src/pages`, `src/layouts`         |
| Styling    | Tailwind 4 CSS-first config          | `src/styles/global.css` (`@theme`) |
| Global cfg | Site config single source of truth   | `src/config/site.ts`               |
| Sector cfg | Palette + labels                     | `src/config/sectors.ts`            |
| Data       | Typed TypeScript modules             | `src/data/*.ts`                    |
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
- **Honesty system**: every figure carries a visible status tag (Verified / Unverified, Confirmed / Reported / Estimated, sample chips). All entities are illustrative samples describing no real entity.
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

Project ref: `eezqpsbhmnhuhnmiwnsz` (region eu-west-2). Schema in `supabase/migrations/0001_init.sql`:

- `submissions` — every user-submitted flow (startup, claim, job, event, intro, issue, trial, buy, sponsor, register). Public insert, owner-only read (RLS).
- `newsletter_subscribers` — The Ecosystem Brief signups (unique email).
- `logos` — public storage bucket for user-uploaded company logos.

Auth: magic-link sign-in (Supabase Auth), site_url + redirect allow-list preconfigured.

## Deployment

Any static host (Netlify / Vercel / Cloudflare Pages):

```bash
bun run build && npx netlify deploy --dir=dist --prod
```

Point the domain at the host, set env vars in the dashboard, done.

## Honesty notice

Every company, investor, person, figure, article and event on this site is an illustrative sample describing no real entity or transaction. "Verified" describes the fictional registry-plus-team-check design, labelled as such throughout.
