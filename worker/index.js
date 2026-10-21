/**
 * startups.co.ke — Cloudflare Worker (static assets + dynamic layer).
 *
 * Static: Astro build output in dist/, served first by the Assets binding.
 * Dynamic (this worker, only for requests no asset can answer):
 *   GET  /startups/community/list.json          public JSON feed
 *   GET  /startups/community/:slug              founder listing page (+ ?format=md)
 *   GET  /desk                                  owner's queue (HTML shell)
 *   GET  /desk/data                             owner's queue (JSON, session-gated)
 *   POST /desk/data                             moderation actions (session-gated)
 *   POST /api/startup-create                    instant founder listing
 *   POST /api/review-submit                     review-queue forms
 *   POST /api/newsletter                        The Ecosystem Brief signup
 *   POST /api/logo-upload-url                   mint a one-shot logo upload URL
 *   GET  /api/my-listings                       a signed-in founder's own listings
 *   POST /api/listing-update                    founder edits/hides their OWN listing
 * Legacy /​.netlify/functions/* POST paths map to the same handlers so old
 * cached bundles never break.
 *
 * Storage: Supabase REST with the service key (tables are RLS-on with no
 * policies, so the public anon key can never touch them).
 * Email: Resend, best-effort, never blocks a response.
 */

import {
  attemptEmail, checkRateLimit, clientIp, createListing, deleteListing, deskEmail, digestLines,
  findByClientRef, getListing, getListingRow, json, listListings, listListingsByUser, listSubscribers,
  mintLogoUpload, neverSentSubscribers, newsletterSubscribe, queueInsert, queueMarkDone, queueList,
  recordSends, removeSubscriber, sb,
  sendEmailBatch, setListingStatus, slugify, subscriberCount, uniqueSlug, unsubToken, unsubValid,
  updateListingByOwner, validateListing, verifyTurnstile, verifyUser,
} from './lib.mjs';
import { deskHtml, notFoundPage, renderMarkdown, renderPage, unsubscribeConfirmPage, unsubscribePage } from './render.mjs';
import { BRIEF, briefFooter, briefHeaders } from './brief.mjs';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};
const NO_STORE = { 'Cache-Control': 'no-store' };
/**
 * Cache policy for anything a founder can change in seconds.
 *
 * This zone's Browser Cache TTL is 14400 (4 hours) and Cloudflare REWRITES
 * any positive origin `max-age` up to that value: "Cloudflare respects
 * whichever value is higher: the Browser Cache TTL in Cloudflare or the
 * max-age header". So a `max-age=60` listing feed reached browsers as
 * `max-age=14400` and a repeat visitor kept the pre-publish list for four
 * hours. Purging the CDN does NOT clear a copy already in a visitor's
 * browser, so a cache purge alone can never fix this.
 *
 * `no-store` is the only directive that cannot be rewritten into a stale
 * copy: the browser never stores it and Cloudflare never serves it from
 * cache. The edge may still cache it under `Cloudflare-CDN-Cache-Control`,
 * which is a separate directive that only Cloudflare's cache reads.
 */
const FRESH = 'no-store';
/** Edge-only TTL for the listing feed: Cloudflare's cache, never a browser's. */
const EDGE_FRESH = { 'Cloudflare-CDN-Cache-Control': 'public, max-age=30, stale-while-revalidate=60' };
/**
 * Headers for the live listing feed: a browser must never store it, and
 * Cloudflare's own edge may keep it for half a minute. `s-maxage` alone is
 * not enough - a browser ignores it, and this zone's Browser Cache TTL
 * rewrites any positive `max-age` to 4 hours, so the browser-facing
 * directive has to be `no-store` to survive.
 */
const FRESH_HEADERS = { 'Cache-Control': FRESH, ...EDGE_FRESH };

const SECURITY = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

/** Unsubscribe pages: server-rendered, never cached, never indexed. */
const UNSUB_HEADERS = {
  'Content-Type': 'text/html; charset=utf-8',
  ...NO_STORE,
  'X-Robots-Tag': 'noindex',
  ...SECURITY,
};

const KINDS = new Set([
  'startup', 'claim', 'job', 'event', 'intro', 'issue', 'trial', 'buy', 'sponsor', 'register',
]);

const EMAIL_RE = /^[^\s@"'<>]+@[^\s@"'<>]+\.[a-z]{2,}$/i;

const LABELS = {
  startup: 'New startup submission (review)',
  claim: 'Profile claim request',
  job: 'New job posting',
  event: 'Event listing request',
  intro: 'Introduction request',
  register: 'Hackathon registration',
  trial: 'Professional trial started',
  buy: 'Report unlock request',
  sponsor: 'Sponsor enquiry',
  issue: 'Data issue report',
};

/**
 * Live listing feed. Deliberately NOT cached anywhere.
 *
 * The obvious place for this is `caches.default` (the shared edge cache),
 * but a stored entry is served by Cloudflare with the headers it was stored
 * with, and this zone's Browser Cache TTL (14400) rewrites any positive
 * `max-age` up to four hours before the browser sees it. `list.json` is
 * cacheable-by-extension for Cloudflare, so the feed was being stored,
 * served to browsers as `max-age=14400`, and a new listing stayed
 * invisible to repeat visitors for hours. Purging the CDN does not clear a
 * copy a visitor already holds, and a purge could not have fixed it anyway.
 *
 * So: no shared-cache entry, no browser cache, no in-Worker memo. Every
 * read is one indexed Supabase query - the same cost the listing page
 * already pays per view - and a publish is visible on the very next
 * request, in every isolate, with no window to wait out.
 */
async function listJsonFresh(env) {
  const rows = await listListings(env);
  if (rows === null) {
    return { ok: true, count: 0, startups: [], notice: 'Listings storage is warming up. Try again shortly.' };
  }
  const startups = rows
    .filter((r) => r.status === 'published' && !String(r.slug || '').startsWith('__'))
    .map((r) => ({
      slug: r.slug,
      name: r.name,
      tagline: r.tagline,
      sector: r.sector,
      stage: r.stage,
      county: r.county,
      website: r.website,
      founderName: r.founderName || null,
      logoUrl: r.logoUrl || null,
      createdAt: r.createdAt,
      source: r.source,
    }));
  return { ok: true, count: startups.length, startups };
}

/** Serve the Astro 404 page for unmatched paths (correct status code). */
async function asset404(req, env) {
  try {
    const url = new URL('/404.html', req.url);
    const r = await env.ASSETS.fetch(new Request(url, { method: 'GET' }));
    const body = await r.text();
    return new Response(body, {
      status: 404,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        ...NO_STORE,
        'X-Robots-Tag': 'noindex',
        ...SECURITY,
      },
    });
  } catch {
    return new Response('Not found', { status: 404, headers: { 'Content-Type': 'text/plain', ...NO_STORE } });
  }
}

/* ------------------------------------------------------------------ */
/* Handlers                                                            */
/* ------------------------------------------------------------------ */

async function handleList(req, env) {
  const body = await listJsonFresh(env);
  return json(200, body, {
    ...CORS,
    ...FRESH_HEADERS,
  });
}

async function handlePage(req, env, slugRaw) {
  const url = new URL(req.url);
  const slug = String(slugRaw || url.searchParams.get('slug') || '')
    .toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 64);
  const wantsMd = url.searchParams.get('format') === 'md';

  if (!slug) {
    return new Response(notFoundPage(''), {
      status: 404,
      // 404s are NEVER cached: a just-published listing must appear on retry.
      headers: { 'Content-Type': 'text/html; charset=utf-8', ...NO_STORE, 'X-Robots-Tag': 'noindex', ...SECURITY },
    });
  }

  const rec = await getListing(env, slug);
  if (!rec || rec.status !== 'published') {
    return new Response(notFoundPage(slug), {
      status: 404,
      headers: { 'Content-Type': 'text/html; charset=utf-8', ...NO_STORE, 'X-Robots-Tag': 'noindex', ...SECURITY },
    });
  }

  if (wantsMd) {
    return new Response(renderMarkdown(rec, slug), {
      status: 200,
      headers: { 'Content-Type': 'text/markdown; charset=utf-8', 'Cache-Control': FRESH, 'X-Robots-Tag': 'noindex', ...SECURITY },
    });
  }
  return new Response(renderPage(rec, slug), {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': FRESH, ...SECURITY },
  });
}

/** Run background work past the response: without waitUntil, workerd may
 *  cancel an un-awaited promise the instant the response is returned —
 *  which silently swallowed the desk pings and the brief audit entries. */
function bg(ctx, p) {
  const q = Promise.resolve(p).catch(() => {});
  try { ctx?.waitUntil(q); } catch { /* dev runtime without waitUntil */ }
  return q;
}

async function handleCreate(req, env, ctx) {
  let body;
  try { body = await req.json(); } catch { return json(400, { ok: false, error: 'invalid JSON' }, CORS); }

  // Honeypot: pretend success so bots learn nothing.
  if (String(body?.company_url ?? '').trim() !== '') {
    return json(200, { ok: true, honeypot: true, slug: 'thanks', url: '/startups/community' }, CORS);
  }

  if (!env.SUPABASE_SERVICE_ROLE_KEY && !env.SUPABASE_SERVICE_KEY) {
    return json(503, { ok: false, error: 'Listings storage is not configured yet. Your entries are safe in the form; please try again shortly.' }, { ...CORS, ...NO_STORE });
  }

  const user = await verifyUser(env, req);

  // Fail closed: a deploy that lost TURNSTILE_SECRET must not silently turn
  // the bot check off. The only way to publish without a secret is the
  // explicit `TURNSTILE_SKIP=1` switch, which exists for local `wrangler
  // dev` runs and is never set in production. `req.cf` is NOT a usable
  // discriminator here - wrangler dev populates it too.
  const skipTurnstile = String(env.TURNSTILE_SKIP ?? '') === '1' && !env.TURNSTILE_SECRET;
  if (!env.TURNSTILE_SECRET && !skipTurnstile) {
    return json(503, { ok: false, error: 'Publishing is temporarily unavailable. Your entries are safe in the form; please try again shortly.' }, { ...CORS, ...NO_STORE });
  }

  // Bot check before any write (and before the rate-limit bucket, so a bot
  // cannot burn a founder's daily allowance). Skipped when no secret is set.
  if (!(await verifyTurnstile(env, body?.turnstile, clientIp(req)))) {
    return json(403, { ok: false, error: 'Verification failed. Please complete the verification check in the form and try again.' }, { ...CORS, ...NO_STORE });
  }

  // Validate BEFORE the rate limit: a fixable mistake must not burn the day's attempts.
  const v = validateListing(body);
  if (!v.ok) return json(422, { ok: false, error: 'validation', errors: v.errors }, { ...CORS, ...NO_STORE });

  const ip = clientIp(req);

  // Idempotency: a retry from the same form session returns the SAME listing.
  const clientRef = String(body?.clientRef ?? '').replace(/[^a-zA-Z0-9-]/g, '').slice(0, 64);
  if (clientRef) {
    const prior = await findByClientRef(env, clientRef).catch(() => null);
    if (prior && prior.slug) {
      return json(200, {
        ok: true, duplicate: true, slug: prior.slug,
        url: `https://startups.co.ke/startups/community/${prior.slug}`,
      }, { ...CORS, ...NO_STORE });
    }
  }

  // 5/day anon (shared office NATs are real), 10/day with a verified session.
  const cap = user ? 10 : 5;
  const allowed = await checkRateLimit(env, ip, cap);
  if (!allowed) {
    return json(429, { ok: false, error: `Daily limit reached (${cap}/day). Try again tomorrow.` }, { ...CORS, ...NO_STORE });
  }

  const base = slugify(v.listing.name);
  let record = null;
  let stored = false;
  // Insert-only with a bounded retry: uniqueSlug() closes most gaps, and
  // createListing() (ignore-duplicates) closes the concurrent-write race
  // without ever overwriting the row that won.
  for (let attempt = 0; attempt < 5 && !stored; attempt++) {
    const slug = attempt === 0
      ? await uniqueSlug(env, base)
      : `${base}-${Date.now().toString(36)}${attempt}`;
    const candidate = { ...v.listing, slug, source: user ? 'signedin' : 'anon', status: 'published' };
    if (clientRef) candidate.clientRef = clientRef;
    if (user) candidate.userId = user.id;

    const res = await createListing(env, candidate);
    if (res.ok && res.inserted) { record = candidate; stored = true; break; }
    if (!res.ok) break; // storage error: stop, don't hammer the DB
  }

  if (!stored || !record) {
    return json(503, { ok: false, error: 'Listing storage is momentarily unavailable. Your entries are still in the form; please press Publish again.' }, { ...CORS, ...NO_STORE });
  }

  // Desk ping (best-effort, never blocks the founder's success).
  bg(ctx, attemptEmail(env, {
    subject: `[instant listing] ${record.name} went live — /startups/community/${record.slug}`,
    text: [
      'A founder published a startup instantly (no review):',
      '',
      digestLines({ name: record.name, tagline: record.tagline, sector: record.sector, stage: record.stage, county: record.county, website: record.website, founder: record.founderName, email: record.email, source: record.source }),
      '',
      `Live at: https://startups.co.ke/startups/community/${record.slug}`,
      '--',
      'Automated ping from startups.co.ke.',
    ].join('\n'),
  }));

  // A new listing must be visible to the public NOW: the feed is read fresh
  // on every request, so the row that was just written is already public.
  return json(200, { ok: true, slug: record.slug, url: `https://startups.co.ke/startups/community/${record.slug}` }, { ...CORS, ...NO_STORE });
}

/** Statuses a founder may set on their own listing (hard delete stays desk-only). */
const OWNER_STATUS = { unlist: 'unlisted', republish: 'published' };

/**
 * GET /api/my-listings — the signed-in founder's own listings, so the account
 * panel can offer a real "edit your listing" instead of the old "email the
 * desk" dead end. Auth is by Supabase session; the query is filtered to
 * data->>userId = the verified user id, so it can never leak another's rows.
 */
async function handleMyListings(req, env) {
  if (!env.SUPABASE_SERVICE_ROLE_KEY && !env.SUPABASE_SERVICE_KEY) {
    return json(503, { ok: false, error: 'Listings storage is not configured yet.' }, { ...CORS, ...NO_STORE });
  }
  const user = await verifyUser(env, req);
  if (!user) return json(401, { ok: false, error: 'Sign in to see your listings.' }, { ...CORS, ...NO_STORE });

  const rows = await listListingsByUser(env, user.id);
  if (rows === null) return json(503, { ok: false, error: 'Listings storage is momentarily unavailable.' }, { ...CORS, ...NO_STORE });

  const listings = rows.map((r) => ({
    slug: r.slug,
    name: r.name,
    tagline: r.tagline,
    website: r.website,
    sector: r.sector,
    stage: r.stage,
    county: r.county,
    description: r.description || '',
    founderName: r.founderName || '',
    email: r.email || '',
    logoUrl: r.logoUrl || null,
    status: r.status || 'published',
    createdAt: r.createdAt || null,
    url: `https://startups.co.ke/startups/community/${r.slug}`,
  }));
  return json(200, { ok: true, count: listings.length, listings }, { ...CORS, ...NO_STORE });
}

/**
 * POST /api/listing-update — a signed-in founder edits (or hides / republishes)
 * THEIR OWN listing. Ownership is proved twice: an explicit check here, and the
 * UPDATE query itself is scoped by slug AND data->>userId. Non-owners get a 404
 * (not 403) so the endpoint never confirms a listing exists.
 */
async function handleListingUpdate(req, env) {
  if (!env.SUPABASE_SERVICE_ROLE_KEY && !env.SUPABASE_SERVICE_KEY) {
    return json(503, { ok: false, error: 'Listings storage is not configured yet. Your changes are safe in the form; please try again shortly.' }, { ...CORS, ...NO_STORE });
  }
  let body;
  try { body = await req.json(); } catch { return json(400, { ok: false, error: 'invalid JSON' }, { ...CORS, ...NO_STORE }); }

  const user = await verifyUser(env, req);
  if (!user) return json(401, { ok: false, error: 'Sign in to edit your listing.' }, { ...CORS, ...NO_STORE });

  const slug = String(body?.slug ?? '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 60);
  if (!slug) return json(422, { ok: false, error: 'missing slug' }, { ...CORS, ...NO_STORE });

  const found = await getListingRow(env, slug);
  const ownerId = String(found?.rec?.userId || '');
  if (!found || !ownerId || ownerId !== user.id) {
    return json(404, { ok: false, error: 'This listing is not under your account. If you submitted it without signing in, email us and we will link it to you.' }, { ...CORS, ...NO_STORE });
  }

  const ip = clientIp(req);
  if (!(await checkRateLimit(env, ip, 30))) {
    return json(429, { ok: false, error: 'Too many edits from this connection today. Try again tomorrow.' }, { ...CORS, ...NO_STORE });
  }

  const url = `https://startups.co.ke/startups/community/${slug}`;
  const stored = found.row.data && typeof found.row.data === 'object' ? found.row.data : {};

  // Hide / republish: a status change that leaves the content untouched.
  const statusAction = OWNER_STATUS[String(body?.action ?? '')];
  if (statusAction) {
    const r = await updateListingByOwner(env, slug, user.id, stored, statusAction);
    if (!r.ok) return json(503, { ok: false, error: 'update failed' }, { ...CORS, ...NO_STORE });
    return json(200, { ok: true, slug, status: statusAction, url }, { ...CORS, ...NO_STORE });
  }

  const v = validateListing(body);
  if (!v.ok) return json(422, { ok: false, error: 'validation', errors: v.errors }, { ...CORS, ...NO_STORE });

  // Merge onto the stored data: identity + audit fields survive, and a logo the
  // founder did not replace is kept (validateListing nulls an absent logo).
  const patch = {
    ...stored,
    ...v.listing,
    createdAt: stored.createdAt || found.row.created_at || new Date().toISOString(),
    slug,
    logoUrl: v.listing.logoUrl || stored.logoUrl || null,
    source: stored.source || 'signedin',
    userId: user.id,
  };
  if (stored.clientRef) patch.clientRef = stored.clientRef;

  const r = await updateListingByOwner(env, slug, user.id, patch);
  if (!r.ok) return json(503, { ok: false, error: 'update failed' }, { ...CORS, ...NO_STORE });
  return json(200, { ok: true, slug, name: patch.name, url }, { ...CORS, ...NO_STORE });
}

async function handleReview(req, env, ctx) {
  let body;
  try { body = await req.json(); } catch { return json(400, { ok: false, error: 'invalid JSON' }, CORS); }

  if (String(body?.company_url ?? '').trim() !== '') {
    return json(200, { ok: true, honeypot: true }, { ...CORS, ...NO_STORE });
  }

  const kind = String(body?.kind ?? '');
  if (!KINDS.has(kind)) return json(422, { ok: false, error: 'unknown kind' }, { ...CORS, ...NO_STORE });

  if (!env.SUPABASE_SERVICE_ROLE_KEY && !env.SUPABASE_SERVICE_KEY) {
    return json(503, { ok: false, error: 'The queue is warming up. Please try again in a moment.' }, { ...CORS, ...NO_STORE });
  }

  // Payload: small + flat. Strings capped, arrays/objects JSON-capped.
  const raw = body?.payload && typeof body.payload === 'object' ? body.payload : {};
  const payload = {};
  for (const [k, val] of Object.entries(raw).slice(0, 24)) {
    const key = String(k).replace(/[\u0000-\u001f]/g, '').slice(0, 40);
    if (!key) continue;
    payload[key] = typeof val === 'string' ? val.replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, 1200) : val;
  }
  const email = String(body?.email ?? '').trim().slice(0, 160) || null;

  const allowed = await checkRateLimit(env, clientIp(req), 20);
  if (!allowed) {
    return json(429, { ok: false, error: 'Daily limit reached. Try again tomorrow.' }, { ...CORS, ...NO_STORE });
  }

  const id = `r:${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const record = {
    id, kind, label: LABELS[kind] || 'Submission', payload, email, status: 'new',
    createdAt: new Date().toISOString(),
  };
  const stored = await queueInsert(env, record);
  if (!stored) {
    return json(503, { ok: false, error: 'Queue storage is momentarily unavailable. Please try again in a moment.' }, { ...CORS, ...NO_STORE });
  }

  bg(ctx, attemptEmail(env, {
    subject: `[review queue] ${record.label}${email ? ` — ${email}` : ''}`,
    text: [
      record.label,
      `From: ${email || 'no email given'}`,
      '',
      digestLines(payload),
      '',
      'Read the full queue: https://startups.co.ke/desk',
      '--',
      'Automated ping from startups.co.ke — the record is already saved.',
    ].join('\n'),
    replyTo: email || undefined,
  }));

  return json(200, { ok: true, stored: 'queue', id }, { ...CORS, ...NO_STORE });
}

async function handleNewsletter(req, env, ctx) {
  let body;
  try { body = await req.json(); } catch { return json(400, { ok: false, error: 'invalid JSON' }, CORS); }

  if (String(body?.company_url ?? '').trim() !== '') {
    return json(200, { ok: true, honeypot: true }, { ...CORS, ...NO_STORE });
  }

  const email = String(body?.email ?? '').trim().slice(0, 160).toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return json(422, { ok: false, error: 'Please enter a valid email address.' }, { ...CORS, ...NO_STORE });
  }
  const source = String(body?.source ?? 'site').replace(/[^a-z0-9_-]/gi, '').slice(0, 24) || 'site';

  if (!env.SUPABASE_SERVICE_ROLE_KEY && !env.SUPABASE_SERVICE_KEY) {
    return json(503, { ok: false, error: 'Signup storage is warming up. Please try again in a moment.' }, { ...CORS, ...NO_STORE });
  }

  const allowed = await checkRateLimit(env, clientIp(req), 10);
  if (!allowed) {
    return json(429, { ok: false, error: 'Too many attempts today. Try again tomorrow.' }, { ...CORS, ...NO_STORE });
  }

  const res = await newsletterSubscribe(env, email, source);
  if (res === null) {
    return json(503, { ok: false, error: 'Signup storage is momentarily unavailable. Please try again in a moment.' }, { ...CORS, ...NO_STORE });
  }

  if (!res.duplicate) {
    bg(ctx, attemptEmail(env, {
      to: email,
      subject: 'Welcome to The Ecosystem Brief — startups.co.ke',
      text: [
        'Karibu — you are on the list for The Ecosystem Brief.',
        '',
        'What to expect: one tight email when there is something worth reading. Verified funding rounds with named sources, founder listings from the community, live tech jobs and every hackathon in the region. No hype, no invented numbers; every figure keeps its source.',
        '',
        'Building something? Your startup can be listed instantly: https://startups.co.ke/startups/community',
        '',
        "-- startups.co.ke — Kenya's startup record, kept in the open",
      ].join('\n'),
    }));

    bg(ctx, attemptEmail(env, {
      subject: `[newsletter] new subscriber — ${email}`,
      text: `New newsletter signup (source: ${source}).\nManage everything at https://startups.co.ke/desk`,
    }));
  }

  return json(200, { ok: true, stored: 'queue', duplicate: res.duplicate }, { ...CORS, ...NO_STORE });
}

/**
 * POST /api/logo-upload-url — hand the browser a one-shot, path-scoped
 * Storage upload URL. This is the ONLY writer path to the `logos` bucket:
 * the bucket has no public insert policy, so the anon key cannot upload.
 * Honeypot + per-IP daily cap. Turnstile is verified on the write that follows
 * (publish / review submit), not here: a token may only be spent once.
 */
async function handleLogoUploadUrl(req, env) {
  let body;
  try { body = await req.json(); } catch { return json(400, { ok: false, error: 'invalid JSON' }, { ...CORS, ...NO_STORE }); }

  if (String(body?.company_url ?? '').trim() !== '') {
    return json(200, { ok: true, honeypot: true }, { ...CORS, ...NO_STORE });
  }

  const allowed = await checkRateLimit(env, clientIp(req), 20);
  if (!allowed) {
    return json(429, { ok: false, error: 'Too many uploads today. Try again tomorrow.' }, { ...CORS, ...NO_STORE });
  }

  const out = await mintLogoUpload(env, { mime: body?.mime, size: body?.size });
  if (!out.ok) {
    if (out.error === 'unsupported type') {
      return json(415, { ok: false, error: 'Please upload a PNG, JPG, WEBP or GIF image.' }, { ...CORS, ...NO_STORE });
    }
    if (out.error === 'too large') {
      return json(413, { ok: false, error: 'That image is over 2 MB. Please choose a smaller one.' }, { ...CORS, ...NO_STORE });
    }
    return json(503, { ok: false, error: 'Upload storage is warming up. Please try again in a moment.' }, { ...CORS, ...NO_STORE });
  }

  return json(200, { ok: true, path: out.path, uploadUrl: out.uploadUrl, publicUrl: out.publicUrl }, { ...CORS, ...NO_STORE });
}

/* ------------------------------------------------------------------ */
/* Desk (owner-only)                                                   */
/* ------------------------------------------------------------------ */

async function deskGuard(env, req) {
  const user = await verifyUser(env, req);
  if (!user || String(user.email).toLowerCase() !== deskEmail(env)) return null;
  return user;
}

async function handleDeskData(req, env) {
  const user = await deskGuard(env, req);
  // Stealth: unauthorized gets 404 with no hint the page exists.
  if (!user) return json(404, { ok: false, error: 'not found' }, NO_STORE);

  if (req.method === 'GET') {
    const [queue, listings, subs, neverSent] = await Promise.all([
      queueList(env), listListings(env), subscriberCount(env), neverSentSubscribers(env),
    ]);
    return json(200, {
      ok: true,
      desk: deskEmail(env),
      queue,
      listings: (listings || []).filter((r) => !String(r.slug || '').startsWith('__')),
      subscribers: subs,
      // Signed up but never received a list edition: the desk's work list.
      neverSent: neverSent || [],
    }, NO_STORE);
  }

  // POST: moderation actions. Records are kept (except explicit delete) so
  // removals stay auditable.
  let body;
  try { body = await req.json(); } catch { return json(400, { ok: false, error: 'invalid JSON' }, NO_STORE); }
  const action = String(body?.action ?? '');
  const slug = String(body?.slug ?? '').replace(/[^a-z0-9-]/gi, '').slice(0, 60);
  const id = String(body?.id ?? '').replace(/[^a-z0-9:-]/gi, '').slice(0, 60);

  if ((action === 'unlist' || action === 'restore') && slug) {
    const ok = await setListingStatus(env, slug, action === 'unlist' ? 'unlisted' : 'published');
    return ok ? json(200, { ok: true, action, slug }, NO_STORE) : json(500, { ok: false, error: 'update failed' }, NO_STORE);
  }
  if (action === 'delete' && slug) {
    const ok = await deleteListing(env, slug);
    return ok ? json(200, { ok: true, action, slug }, NO_STORE) : json(500, { ok: false, error: 'delete failed' }, NO_STORE);
  }
  if (action === 'done' && id) {
    const ok = await queueMarkDone(env, id);
    return ok ? json(200, { ok: true, action, id }, NO_STORE) : json(500, { ok: false, error: 'update failed' }, NO_STORE);
  }
  return json(422, { ok: false, error: 'unknown action' }, NO_STORE);
}

/**
 * GET /desk/brief — desk-gated. The current edition draft (from worker/brief.mjs,
 * fact-checked and versioned in git) plus the live recipient list state, so the
 * desk can preview sender identity, links, recipient count and dedupe state
 * before anything is sent.
 */
async function handleBriefGet(req, env) {
  const user = await deskGuard(env, req);
  if (!user) return json(404, { ok: false, error: 'not found' }, NO_STORE);
  const subs = (await listSubscribers(env)) || [];
  const deduped = [...new Set(subs)];
  const desk = deskEmail(env);
  return json(200, {
    ok: true,
    edition: { id: BRIEF.id, updatedAt: BRIEF.updatedAt, from: BRIEF.from, subject: BRIEF.subject, body: BRIEF.body },
    testAddress: desk,
    // The exact footer the desk address would receive (real tokenised link).
    sampleFooterLink: desk ? await unsubToken(env, desk).then((t) => briefFooter(env, desk, t)) : '',
    recipients: { count: deduped.length, raw: subs.length, duplicates: subs.length - deduped.length, list: deduped },
  }, NO_STORE);
}

/**
 * POST /desk/brief-send — desk-gated. Emails The Ecosystem Brief to the
 * subscriber list (or a single test address via `to`). Body: { subject,
 * text, to?, approve? }. A list send REQUIRES approve:true (the desk UI
 * gates it behind an explicit review checkbox); a test send does not.
 * Every send carries a per-recipient one-click unsubscribe link and
 * List-Unsubscribe headers, and is audit-logged to the review queue.
 */
async function handleBriefSend(req, env, ctx) {
  const user = await deskGuard(env, req);
  if (!user) return json(404, { ok: false, error: 'not found' }, NO_STORE);
  let body;
  try { body = await req.json(); } catch { return json(400, { ok: false, error: 'invalid JSON' }, NO_STORE); }

  const subject = String(body?.subject ?? '').replace(/[\u0000-\u001f<>]/g, ' ').trim().slice(0, 140);
  const text = String(body?.text ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').slice(0, 20000);
  if (!subject || text.trim().length < 40) {
    return json(422, { ok: false, error: 'A subject and a body of at least 40 characters are required.' }, NO_STORE);
  }

  const toOverride = String(body?.to ?? '').trim().toLowerCase();
  let recipients;
  let mode = 'test';
  if (toOverride) {
    if (!/^[^\s@"'<>]+@[^\s@"'<>]+\.[a-z]{2,}$/i.test(toOverride)) {
      return json(422, { ok: false, error: 'invalid recipient' }, NO_STORE);
    }
    recipients = [toOverride];
  } else {
    if (body?.approve !== true) {
      return json(403, { ok: false, error: 'A full-list send requires the approval checkbox (approve:true) after reviewing the preview.' }, NO_STORE);
    }
    mode = 'list';
    const subs = (await listSubscribers(env)) || [];
    recipients = [...new Set(subs)]; // dedupe; unsubscribed rows are already deleted
  }
  if (!recipients.length) return json(200, { ok: true, sent: 0, failed: 0 }, NO_STORE);

  // Resend's batch endpoint takes up to 100 messages per request, so a
  // 2,000-recipient broadcast becomes 20 calls instead of 2,000 sequential
  // ones that can outlive the Worker request. Every address still gets its
  // own one-click unsubscribe token/headers.
  let sent = 0, failed = 0;
  const sendLog = [];
  const list = recipients.slice(0, 2000);
  const CHUNK = 100;
  for (let i = 0; i < list.length; i += CHUNK) {
    const chunk = list.slice(i, i + CHUNK);
    const messages = await Promise.all(chunk.map(async (rcpt) => {
      const token = await unsubToken(env, rcpt);
      return {
        to: rcpt,
        subject,
        text: `${text}\n\n${briefFooter(env, rcpt, token)}`,
        headers: briefHeaders(env, rcpt, token),
      };
    }));
    const out = await sendEmailBatch(env, messages);
    sent += out.sent;
    failed += out.failed;
    // Only a fully successful chunk is recorded as "sent": a partial batch
    // is not proof that any single address got the mail.
    const ok = out.sent === chunk.length && !out.reason;
    for (const rcpt of chunk) {
      sendLog.push({ email: rcpt, issue: BRIEF.id, mode, status: ok ? 'sent' : 'failed' });
    }
  }

  // Who received this issue, so "who has not been emailed yet" is answerable.
  if (sendLog.length) {
    bg(ctx, recordSends(env, sendLog));
  }

  // Audit trail: the desk queue keeps a record of every broadcast/test.
  bg(ctx, queueInsert(env, {
    id: `brief:${Date.now().toString(36)}`,
    kind: 'brief-send',
    label: `Ecosystem Brief ${mode === 'list' ? 'BROADCAST' : 'test send'} — ${subject.slice(0, 80)}`,
    payload: {
      edition: BRIEF.id,
      mode,
      subject,
      recipients: mode === 'list' ? `list (${sent + failed})` : toOverride,
      sent: String(sent),
      failed: String(failed),
      by: user.email,
    },
    email: user.email,
    status: 'done',
    createdAt: new Date().toISOString(),
  }));

  return json(200, { ok: sent > 0, sent, failed, mode }, NO_STORE);
}

/**
 * GET + POST /api/unsubscribe — one-click unsubscribe for The Ecosystem Brief.
 * The address and its HMAC token must both match; anything else gets a neutral
 * page that leaks nothing. POST (RFC 8058 one-click) and GET behave the same.
 */
async function handleUnsubscribe(req, env) {
  const url = new URL(req.url);
  const email = String(url.searchParams.get('e') ?? '').trim().toLowerCase();
  const token = String(url.searchParams.get('t') ?? '').trim();
  if (!email || !token) return new Response(unsubscribePage('invalid'), { status: 400, headers: UNSUB_HEADERS });
  if (!EMAIL_RE.test(email)) return new Response(unsubscribePage('invalid'), { status: 400, headers: UNSUB_HEADERS });
  if (!(await unsubValid(env, email, token))) return new Response(unsubscribePage('invalid'), { status: 403, headers: UNSUB_HEADERS });

  // GET only renders a confirmation form. Mail scanners and link prefetchers
  // issue GETs on every link in an email, so a mutating GET would silently
  // unsubscribe people who never clicked. The delete happens on POST — which
  // is also what RFC 8058 one-click (List-Unsubscribe-Post) sends.
  if (req.method !== 'POST') {
    return new Response(unsubscribeConfirmPage(email, token), { status: 200, headers: UNSUB_HEADERS });
  }

  const n = await removeSubscriber(env, email);
  if (n === null) return new Response(unsubscribePage('error'), { status: 500, headers: UNSUB_HEADERS });
  return new Response(unsubscribePage('done'), { status: 200, headers: UNSUB_HEADERS });
}

/* ------------------------------------------------------------------ */
/* Router                                                              */
/* ------------------------------------------------------------------ */

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';
    const method = req.method.toUpperCase();

    if (method === 'OPTIONS' && (path.startsWith('/api/') || path.startsWith('/.netlify/functions/'))) {
      return new Response(null, { status: 204, headers: CORS });
    }

    // ---- public reads ----
    if (method === 'GET' || method === 'HEAD') {
      if (path === '/startups/community/list.json' || path === '/.netlify/functions/startup-list') {
        // NOT cached in the shared edge cache: Cloudflare serves `list.json`
        // with the stored headers, and this zone's Browser Cache TTL turns
        // any positive max-age into 4 hours in the visitor's browser. The
        // Worker memoises the result for a few seconds instead (see
        // listJsonFresh), and a publish invalidates it immediately.
        const res = await handleList(req, env);
        return method === 'HEAD' ? new Response(null, { status: res.status, headers: res.headers }) : res;
      }
      if (path.startsWith('/startups/community/') || path === '/.netlify/functions/startup-page') {
        const slug = path.startsWith('/startups/community/')
          ? path.split('/').filter(Boolean).pop() || ''
          : url.searchParams.get('slug') || '';
        // NOT edge-cached inside the Worker: a founder can now edit, hide or
        // republish their page, and a 300s cached copy would keep serving the
        // old content after the change. These pages are low-traffic; rendering
        // per request is cheap and makes every edit visible immediately.
        const res = await handlePage(req, env, slug);
        return method === 'HEAD' ? new Response(null, { status: res.status, headers: res.headers }) : res;
      }
      if (path === '/desk') {
        return new Response(deskHtml(env), {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=utf-8', ...NO_STORE, ...SECURITY },
        });
      }
      if (path === '/desk/reset') {
        // Recovery links land here; the same shell shows the reset panel.
        return new Response(deskHtml(env), {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=utf-8', ...NO_STORE, ...SECURITY },
        });
      }
      if (path === '/desk/brief') return handleBriefGet(req, env);
      if (path === '/desk/data') return handleDeskData(req, env);
      // Health probe: boolean configuration checks ONLY. No versions, no URLs,
      // no values — safe to poll from anywhere.
      if (path === '/api/health') {
        return json(200, {
          ok: true,
          storage: Boolean(env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY),
          email: Boolean(env.RESEND_API_KEY),
          anon: Boolean(env.PUBLIC_SUPABASE_ANON_KEY),
          turnstile: Boolean(env.TURNSTILE_SECRET),
        }, { ...CORS, ...NO_STORE });
      }
      if (path === '/api/unsubscribe') {
        const res = await handleUnsubscribe(req, env);
        return method === 'HEAD' ? new Response(null, { status: res.status, headers: res.headers }) : res;
      }
      if (path === '/api/my-listings') return handleMyListings(req, env);
      return asset404(req, env);
    }

    // ---- writes ----
    if (method === 'POST') {
      if (path === '/api/startup-create' || path === '/.netlify/functions/startup-create') return handleCreate(req, env, ctx);
      if (path === '/api/review-submit' || path === '/.netlify/functions/review-submit') return handleReview(req, env, ctx);
      if (path === '/api/newsletter' || path === '/.netlify/functions/newsletter') return handleNewsletter(req, env, ctx);
      if (path === '/api/logo-upload-url') return handleLogoUploadUrl(req, env);
      if (path === '/api/listing-update') return handleListingUpdate(req, env);
      // NOTE: /api/notify was DELETED — an unauthenticated, unlimited endpoint
      // that emailed the desk with attacker-controlled content and reply-to
      // (spam + phishing + Resend-quota vector). The database records are the
      // source of truth; the desk is the review surface.
      if (path === '/desk/data') return handleDeskData(req, env);
      if (path === '/desk/brief-send') return handleBriefSend(req, env, ctx);
      if (path === '/api/unsubscribe') return handleUnsubscribe(req, env);
      return json(404, { ok: false, error: 'not found' }, { ...CORS, ...NO_STORE });
    }

    return json(405, { ok: false, error: 'method not allowed' }, { ...CORS, ...NO_STORE });
  },
};
