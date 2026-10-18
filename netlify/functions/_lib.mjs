/**
 * SHARED HELPERS — community startup listings (Netlify Functions).
 * Zero-dependency except @netlify/blobs (provided by the functions runtime).
 *
 * Design notes:
 * - Founder listings publish INSTANTLY (no approval queue) into the
 *   `community_startups` blob store. Spam controls: required fields with
 *   strict caps, a hidden honeypot field, per-IP daily rate limits, and
 *   optional Supabase magic-link identity (raises the rate limit).
 * - EVERY user string is HTML-escaped at render time (startup-page) and
 *   length-capped at write time. Nothing user-supplied is ever trusted.
 */

export const SECTORS = ['Fintech', 'Commerce', 'Logistics', 'Agritech', 'Energy', 'Health', 'Edtech', 'Proptech', 'SaaS', 'HR & Future of Work', 'Media', 'Climate & Energy', 'Other'];
export const STAGES = ['Pre-seed', 'Seed', 'Series A', 'Series B', 'Growth'];

export const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL || 'https://eezqpsbhmnhuhnmiwnsz.supabase.co';
export const SUPABASE_ANON = process.env.PUBLIC_SUPABASE_ANON_KEY
  || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlenFwc2JobW5odWhubWl3bnN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwNjQzMjgsImV4cCI6MjEwNzY0MDMyOH0.Ks8O3JMluiPxJuozW3CvgU-lsReS7qolo6WR4wO2fXM';

/** HTML-escape a string for safe interpolation into markup. */
export function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Slug from a company name: lowercase, alnum+hyphens, 1–48 chars. */
export function slugify(name) {
  const s = String(name ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
    .replace(/-+$/g, '');
  return s || 'startup';
}

const json = (status, obj, extraHeaders = {}) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...extraHeaders },
  });
export { json };

/** Best-effort client IP (Netlify injects x-nf-client-connection-ip). */
export function clientIp(req) {
  return (
    req.headers.get('x-nf-client-connection-ip') ||
    (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() ||
    'unknown'
  );
}

const today = () => new Date().toISOString().slice(0, 10);

/**
 * Per-IP daily counter in the same blob store (keys prefixed __rl:).
 * Race-window tolerant — good-enough abuse brake, not a bank ledger.
 */
export async function checkRateLimit(store, ip, cap) {
  const key = `__rl:${ip}:${today()}`;
  const cur = (await store.get(key, { type: 'json' })) || { n: 0 };
  if ((cur.n ?? 0) >= cap) return false;
  await store.setJSON(key, { n: (cur.n ?? 0) + 1 });
  return true;
}

/**
 * Verify a Supabase magic-link session server-side. The anon key is public by
 * design; PostgREST/Auth validates the user JWT itself, so no service key is
 * needed to confirm "this person controls this mailbox".
 */
export async function verifyUser(req) {
  const auth = req.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token || token.length < 20) return null;
  try {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(5000),
    });
    if (!r.ok) return null;
    const u = await r.json();
    if (!u?.email) return null;
    return { id: u.id || null, email: String(u.email).slice(0, 160) };
  } catch {
    return null;
  }
}

const URL_RE = /^https:\/\/[^\s"'<>]{4,190}$/i;
const EMAIL_RE = /^[^\s@"'<>]+@[^\s@"'<>]+\.[a-z]{2,}$/i;

/**
 * Validate + normalise a submission. Returns {ok, listing|errors}.
 * Honeypot: any value in `company_url` is a bot — report fake success upstream.
 */
export function validateListing(body = {}) {
  const errors = {};
  const str = (k, min, max) => {
    const v = String(body[k] ?? '').replace(/[\u0000-\u001f]/g, ' ').trim();
    if (v.length < min) errors[k] = `required (min ${min})`;
    else if (v.length > max) errors[k] = `max ${max} chars`;
    return v;
  };

  const name = str('name', 2, 60);
  const website = String(body.website ?? '').trim().replace(/[?&#].*$/, '').slice(0, 200);
  const tagline = str('tagline', 4, 160);
  const description = String(body.description ?? '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, 1200);
  const county = String(body.county ?? '').trim().slice(0, 40);
  const founderName = String(body.founderName ?? '').trim().slice(0, 80);
  const email = String(body.email ?? '').trim().slice(0, 160);
  const sector = SECTORS.includes(body.sector) ? body.sector : 'Other';
  const stage = STAGES.includes(body.stage) ? body.stage : 'Pre-seed';
  const logoUrl = typeof body.logoUrl === 'string' && /^https:\/\/[^\s"'<>]+$/.test(body.logoUrl) ? body.logoUrl : null;

  if (!errors.website && !URL_RE.test(website)) errors.website = 'https URL required';
  if (email && !EMAIL_RE.test(email)) errors.email = 'invalid email';

  if (Object.keys(errors).length) return { ok: false, errors };

  return {
    ok: true,
    listing: {
      name,
      website,
      tagline,
      description,
      sector,
      stage,
      county,
      founderName,
      email,
      logoUrl,
      createdAt: new Date().toISOString(),
    },
  };
}

/** Store keys are namespaced so the rate-limit keys never collide. */
export const listingKey = (slug) => `s:${slug}`;

/** Unique slug: try base, then -2 … -50. */
export async function uniqueSlug(store, base) {
  if (!(await store.get(listingKey(base)))) return base;
  for (let i = 2; i <= 50; i++) {
    const cand = `${base}-${i}`;
    if (!(await store.get(listingKey(cand)))) return cand;
  }
  return `${base}-${Date.now().toString(36)}`;
}

/* ------------------------------------------------------------------ */
/* Page rendering (shared by startup-page + format=md)                 */
/* ------------------------------------------------------------------ */

export function renderMarkdown(l, slug) {
  const lines = [];
  lines.push(`# ${esc(l.name)}`);
  lines.push('');
  lines.push(`> ${esc(l.tagline)}`);
  lines.push('');
  lines.push(`- Website: ${esc(l.website)}`);
  if (l.sector) lines.push(`- Sector: ${esc(l.sector)}`);
  if (l.stage) lines.push(`- Stage: ${esc(l.stage)}`);
  if (l.county) lines.push(`- County: ${esc(l.county)}`);
  if (l.founderName) lines.push(`- Founder: ${esc(l.founderName)}`);
  lines.push(`- Listed: ${l.createdAt ? l.createdAt.slice(0, 10) : 'n/a'} (founder-submitted)`);
  lines.push(`- Status: Founder-submitted — published instantly, not yet verified against public sources`);
  if (l.description) { lines.push(''); lines.push(esc(l.description)); }
  lines.push('');
  lines.push(`Source: ${`https://startups.co.ke/startups/community/${slug}`}`);
  return lines.join('\n');
}

export function renderPage(l, slug) {
  const md = `https://startups.co.ke/startups/community/${slug}?format=md`;
  const monogram = esc((l.name || '?').trim().slice(0, 2).toUpperCase());
  const title = `${esc(l.name)} — ${esc(l.sector)} startup in ${esc(l.county || 'Kenya')} | startups.co.ke`;
  const desc = esc((l.tagline || '').slice(0, 155));
  // JSON-LD: escape `<` as \u003c so raw user strings can never close the
  // script element or smuggle tags (standard JSON-LD hardening).
  const jsonld = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: l.name,
        url: l.website,
        description: l.tagline,
        ...(l.logoUrl ? { logo: l.logoUrl } : {}),
        address: { '@type': 'PostalAddress', addressLocality: l.county || 'Kenya', addressCountry: 'KE' },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://startups.co.ke/' },
          { '@type': 'ListItem', position: 2, name: 'Founder-listed startups', item: 'https://startups.co.ke/startups/community' },
          { '@type': 'ListItem', position: 3, name: l.name },
        ],
      },
    ],
  }).replace(/</g, '\\u003c');

  return `<!doctype html>
<html lang="en-KE">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title>
<meta name="description" content="${desc}" />
<link rel="canonical" href="https://startups.co.ke/startups/community/${esc(slug)}" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${desc}" />
<meta property="og:type" content="website" />
<meta name="robots" content="index, follow" />
<link rel="stylesheet" href="/fonts/fonts.css" />
<script type="application/ld+json">${jsonld}</script>
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body { margin:0; background:#f6f3ea; color:#181712; font:16px/1.55 Archivo, system-ui, sans-serif; }
  a { color:inherit; }
  .wrap { max-width:900px; margin:0 auto; padding:0 20px; }
  header.top { background:#14130e; color:#efead9; }
  header.top .wrap { display:flex; align-items:center; justify-content:space-between; padding-top:14px; padding-bottom:14px; }
  .brand { font:600 11px/1 "IBM Plex Mono", ui-monospace, monospace; letter-spacing:.14em; text-transform:uppercase; text-decoration:none; }
  .brand b { color:#e3a21a; }
  .back { font:400 11px/1 "IBM Plex Mono", ui-monospace, monospace; letter-spacing:.1em; text-transform:uppercase; color:#a9a492; text-decoration:none; }
  .back:hover { color:#efead9; }
  .mono { font-family:"IBM Plex Mono", ui-monospace, monospace; text-transform:uppercase; letter-spacing:.12em; font-size:10px; }
  .kicker { color:#5d5949; margin:28px 0 10px; }
  .card { border:2px solid #181712; background:#f6f3ea; box-shadow:8px 8px 0 rgba(20,19,14,.3); padding:32px; margin-bottom:32px; }
  h1 { font-family:Fraunces, Georgia, serif; font-weight:550; font-size:clamp(30px,5vw,44px); letter-spacing:-.02em; margin:10px 0 6px; line-height:1.05; }
  .tagline { font-size:17px; color:#3e3b31; max-width:640px; margin:0 0 18px; }
  .badges { display:flex; flex-wrap:wrap; gap:6px; margin:0 0 22px; }
  .chip { display:inline-flex; align-items:center; gap:6px; border:1px solid rgba(24,23,18,.6); padding:5px 8px; font:400 10px/1 "IBM Plex Mono", ui-monospace, monospace; text-transform:uppercase; letter-spacing:.08em; border-radius:2px; background:transparent; }
  .chip.fs { border-color:#96610a; background:#96610a; color:#181712; font-weight:600; }
  .desc { white-space:pre-line; color:#3e3b31; max-width:640px; }
  .row { display:flex; flex-wrap:wrap; gap:12px; align-items:center; margin-top:26px; }
  .btn { display:inline-flex; align-items:center; gap:8px; min-height:44px; padding:0 18px; border:1px solid #181712; background:#181712; color:#f6f3ea; font:400 11px/1 "IBM Plex Mono", ui-monospace, monospace; text-transform:uppercase; letter-spacing:.12em; text-decoration:none; }
  .btn:hover { background:#3e3b31; }
  .btn.ghost { background:transparent; color:#181712; }
  .btn.ghost:hover { background:#ede8d9; }
  .meta { margin-top:26px; border-top:1px solid #d9d3c1; padding-top:14px; display:flex; flex-wrap:wrap; gap:8px 22px; color:#5d5949; }
  .logo { width:64px; height:64px; object-fit:contain; border:1px solid #d9d3c1; background:#fff; padding:6px; }
  .mono-tile { width:64px; height:64px; display:flex; align-items:center; justify-content:center; border:1px solid #d9d3c1; background:#ede8d9; font:600 20px Fraunces, Georgia, serif; }
  .head { display:flex; gap:18px; align-items:flex-start; }
  footer { border-top:1px solid #d9d3c1; margin-top:8px; }
  footer .wrap { padding:22px 20px 40px; color:#5d5949; font-size:13px; }
  footer a { color:#96610a; }
  .cta { border:1px dashed #96610a; padding:18px; margin:0 0 28px; display:flex; flex-wrap:wrap; gap:12px; justify-content:space-between; align-items:center; }
  @media (prefers-reduced-motion: no-preference) { a, .btn { transition: background-color .15s ease, color .15s ease; } }
</style>
</head>
<body>
<header class="top">
  <div class="wrap">
    <a class="brand" href="/">startups<b>.co.ke</b></a>
    <a class="back" href="/startups/community">← Founder-listed startups</a>
  </div>
</header>
<main class="wrap">
  <p class="kicker mono">Founder-listed · published instantly · not yet verified</p>
  <div class="cta">
    <span style="font-size:14px;color:#3e3b31;max-width:460px">Built something in Kenya? Your profile can be live in the next three minutes — no approval queue.</span>
    <a class="btn" href="/startups/community">List your startup — free</a>
  </div>
  <article class="card">
    <div class="head">
      ${l.logoUrl ? `<img class="logo" src="${esc(l.logoUrl)}" alt="${esc(l.name)} logo" width="64" height="64" />` : `<div class="mono-tile" aria-hidden="true">${monogram}</div>`}
      <div>
        <h1>${esc(l.name)}</h1>
        <p class="tagline">${esc(l.tagline)}</p>
        <div class="badges">
          <span class="chip fs">Founder-submitted</span>
          ${l.sector ? `<span class="chip">${esc(l.sector)}</span>` : ''}
          ${l.stage ? `<span class="chip">${esc(l.stage)}</span>` : ''}
          ${l.county ? `<span class="chip">${esc(l.county)}</span>` : ''}
        </div>
      </div>
    </div>
    ${l.description ? `<p class="desc">${esc(l.description)}</p>` : ''}
    <div class="row">
      <a class="btn" href="${esc(l.website)}" rel="nofollow ugc noopener" target="_blank">Visit website ↗</a>
      <a class="btn ghost" href="${md}">AI-readable Markdown</a>
    </div>
    <div class="meta">
      ${l.founderName ? `<span>Founder: <strong>${esc(l.founderName)}</strong></span>` : ''}
      <span>Listed ${esc((l.createdAt || '').slice(0, 10) || 'n/a')}</span>
      <span>Spotted a problem? <a href="https://startups.co.ke/contact">Report an issue</a></span>
    </div>
  </article>
</main>
<footer>
  <div class="wrap">
    <p><strong style="color:#3e3b31">Honesty note</strong> — this page is founder-submitted and was published immediately, without editorial review. It is tagged “Founder-submitted” until the desk cross-checks it against at least two independent public sources. Figures are self-reported. Fake or misleading listings can be reported via <a href="https://startups.co.ke/contact">the contact page</a>.</p>
    <p><a href="https://startups.co.ke/">startups.co.ke</a> — Kenya's startup record, kept in the open. <a href="https://startups.co.ke/llms.txt">llms.txt</a></p>
  </div>
</footer>
</body>
</html>`;
}

export function notFoundPage(slug) {
  return `<!doctype html>
<html lang="en-KE">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Startup not found | startups.co.ke</title>
<meta name="robots" content="noindex, follow" />
<link rel="stylesheet" href="/fonts/fonts.css" />
<style>
  body { margin:0; background:#f6f3ea; color:#181712; font:16px/1.55 Archivo, system-ui, sans-serif; }
  .wrap { max-width:640px; margin:0 auto; padding:80px 20px; text-align:center; }
  h1 { font-family:Fraunces, Georgia, serif; font-size:34px; margin:0 0 10px; }
  p { color:#5d5949; }
  .btn { display:inline-flex; align-items:center; min-height:44px; padding:0 18px; border:1px solid #181712; background:#181712; color:#f6f3ea; font:400 11px/1 "IBM Plex Mono", monospace; text-transform:uppercase; letter-spacing:.12em; text-decoration:none; margin-top:18px; }
</style>
</head>
<body>
<div class="wrap">
  <p class="mono" style="font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase">404 · No founder listing at this address</p>
  <h1>Nothing listed here${slug ? ` for “${esc(slug)}”` : ''}.</h1>
  <p>The listing may have been removed, or the address is mistyped. Browsing the verified company index is a good place to land instead.</p>
  <a class="btn" href="https://startups.co.ke/startups">Browse the company index</a>
</div>
</body>
</html>`;
}
