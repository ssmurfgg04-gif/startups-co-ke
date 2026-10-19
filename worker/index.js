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
 *   POST /api/notify                            desk email ping (legacy path)
 * Legacy /​.netlify/functions/* POST paths map to the same handlers so old
 * cached bundles never break.
 *
 * Storage: Supabase REST with the service key (tables are RLS-on with no
 * policies, so the public anon key can never touch them).
 * Email: Resend, best-effort, never blocks a response.
 */

import {
  attemptEmail, checkRateLimit, clientIp, deleteListing, deskEmail, digestLines, findByClientRef,
  getListing, json, listListings, listSubscribers, newsletterSubscribe, putListing, queueInsert,
  queueMarkDone, queueList, removeSubscriber, sb, setListingStatus, slugify, subscriberCount,
  uniqueSlug, unsubToken, unsubValid, validateListing, verifyUser,
} from './lib.mjs';
import { deskHtml, notFoundPage, renderMarkdown, renderPage, unsubscribePage } from './render.mjs';
import { BRIEF, briefFooter, briefHeaders } from './brief.mjs';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};
const NO_STORE = { 'Cache-Control': 'no-store' };
const HTML_CACHE = 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400';

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

/** Simple edge cache for GET 200s. Best effort; never breaks a response. */
async function cached(ctx, req, ttl, make) {
  let cache = null;
  try { cache = caches.default; } catch { /* no cache in this runtime */ }
  if (cache) {
    try {
      const hit = await cache.match(req);
      if (hit) return hit;
    } catch { /* fall through */ }
  }
  const res = await make();
  if (cache && res.status === 200) {
    try {
      const store = new Response(res.clone().body, res);
      store.headers.set('Cache-Control', `public, max-age=${ttl}`);
      ctx.waitUntil(cache.put(req, store));
    } catch { /* ignore */ }
  }
  return res;
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
  const rows = await listListings(env);
  if (rows === null) {
    return json(200, { ok: true, count: 0, startups: [], notice: 'Listings storage is warming up. Try again shortly.' }, {
      ...CORS,
      'Cache-Control': 'public, max-age=30',
    });
  }
  const out = rows
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
  return json(200, { ok: true, count: out.length, startups: out }, {
    ...CORS,
    'Cache-Control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=86400',
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
      headers: { 'Content-Type': 'text/markdown; charset=utf-8', 'Cache-Control': HTML_CACHE, 'X-Robots-Tag': 'noindex', ...SECURITY },
    });
  }
  return new Response(renderPage(rec, slug), {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': HTML_CACHE, ...SECURITY },
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
  const slug = await uniqueSlug(env, base);
  const record = { ...v.listing, slug, source: user ? 'signedin' : 'anon', status: 'published' };
  if (clientRef) record.clientRef = clientRef;
  if (user) record.userId = user.id;

  const stored = await putListing(env, record);
  if (!stored) {
    return json(503, { ok: false, error: 'Listing storage is momentarily unavailable. Your entries are still in the form; please press Publish again.' }, { ...CORS, ...NO_STORE });
  }

  // Desk ping (best-effort, never blocks the founder's success).
  bg(ctx, attemptEmail(env, {
    subject: `[instant listing] ${record.name} went live — /startups/community/${slug}`,
    text: [
      'A founder published a startup instantly (no review):',
      '',
      digestLines({ name: record.name, tagline: record.tagline, sector: record.sector, stage: record.stage, county: record.county, website: record.website, founder: record.founderName, email: record.email, source: record.source }),
      '',
      `Live at: https://startups.co.ke/startups/community/${slug}`,
      '--',
      'Automated ping from startups.co.ke.',
    ].join('\n'),
  }));

  return json(200, { ok: true, slug, url: `https://startups.co.ke/startups/community/${slug}` }, { ...CORS, ...NO_STORE });
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

  const EMAIL_RE = /^[^\s@"'<>]+@[^\s@"'<>]+\.[a-z]{2,}$/i;
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

async function handleNotify(req, env) {
  if (!env.RESEND_API_KEY) return json(202, { ok: true, skipped: 'RESEND_API_KEY not configured' });
  let body;
  try { body = await req.json(); } catch { return json(400, { ok: false, error: 'bad json' }); }
  const { kind, payload = {}, email } = body ?? {};
  if (!kind || typeof payload !== 'object') return json(400, { ok: false, error: 'missing kind/payload' });

  const label = LABELS[kind] || 'New submission';
  const sent = await attemptEmail(env, {
    subject: `[review queue] ${label}${email ? ` — ${email}` : ''}`,
    text: [
      `${label}`,
      `From: ${email || 'no email given'}`,
      '',
      digestLines(payload),
      '',
      '--',
      'Review it: Supabase dashboard, Table Editor, review_queue + submissions (project eezqpsbhmnhuhnmiwnsz)',
      'This is an automated ping from startups.co.ke — the record is already saved.',
    ].join('\n'),
    replyTo: email || undefined,
  });
  return json(sent.sent ? 200 : 200, sent.sent ? { ok: true, id: sent.id } : { ok: false, error: sent.reason || 'not sent' });
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
    const [queue, listings, subs] = await Promise.all([queueList(env), listListings(env), subscriberCount(env)]);
    return json(200, {
      ok: true,
      desk: deskEmail(env),
      queue,
      listings: (listings || []).filter((r) => !String(r.slug || '').startsWith('__')),
      subscribers: subs,
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
  return json(200, {
    ok: true,
    edition: { id: BRIEF.id, updatedAt: BRIEF.updatedAt, from: BRIEF.from, subject: BRIEF.subject, body: BRIEF.body },
    testAddress: BRIEF.testAddress,
    // The exact footer the test address would receive (real tokenised link).
    sampleFooterLink: await unsubToken(env, BRIEF.testAddress).then((t) => briefFooter(env, BRIEF.testAddress, t)),
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

  let sent = 0, failed = 0;
  for (const rcpt of recipients.slice(0, 2000)) {
    const token = await unsubToken(env, rcpt);
    const out = await attemptEmail(env, {
      to: rcpt,
      subject,
      text: `${text}\n\n${briefFooter(env, rcpt, token)}`,
      headers: briefHeaders(env, rcpt, token),
    });
    if (out.sent) sent += 1; else failed += 1;
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
  let email = String(url.searchParams.get('e') ?? '').trim().toLowerCase();
  const token = String(url.searchParams.get('t') ?? '').trim();
  if (!email || !token) return new Response(unsubscribePage('invalid'), { status: 400, headers: UNSUB_HEADERS });
  if (!/^[^\s@"'<>]+@[^\s@"'<>]+\.[a-z]{2,}$/i.test(email)) return new Response(unsubscribePage('invalid'), { status: 400, headers: UNSUB_HEADERS });
  if (!(await unsubValid(env, email, token))) return new Response(unsubscribePage('invalid'), { status: 403, headers: UNSUB_HEADERS });
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
        const res = await cached(ctx, req, 60, () => handleList(req, env));
        return method === 'HEAD' ? new Response(null, { status: res.status, headers: res.headers }) : res;
      }
      if (path.startsWith('/startups/community/') || path === '/.netlify/functions/startup-page') {
        const slug = path.startsWith('/startups/community/')
          ? path.split('/').filter(Boolean).pop() || ''
          : url.searchParams.get('slug') || '';
        const res = await cached(ctx, req, 300, () => handlePage(req, env, slug));
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
        }, { ...CORS, ...NO_STORE });
      }
      if (path === '/api/unsubscribe') {
        const res = await handleUnsubscribe(req, env);
        return method === 'HEAD' ? new Response(null, { status: res.status, headers: res.headers }) : res;
      }
      return asset404(req, env);
    }

    // ---- writes ----
    if (method === 'POST') {
      if (path === '/api/startup-create' || path === '/.netlify/functions/startup-create') return handleCreate(req, env, ctx);
      if (path === '/api/review-submit' || path === '/.netlify/functions/review-submit') return handleReview(req, env, ctx);
      if (path === '/api/newsletter' || path === '/.netlify/functions/newsletter') return handleNewsletter(req, env, ctx);
      if (path === '/api/notify' || path === '/.netlify/functions/notify') return handleNotify(req, env);
      if (path === '/desk/data') return handleDeskData(req, env);
      if (path === '/desk/brief-send') return handleBriefSend(req, env, ctx);
      if (path === '/api/unsubscribe') return handleUnsubscribe(req, env);
      return json(404, { ok: false, error: 'not found' }, { ...CORS, ...NO_STORE });
    }

    return json(405, { ok: false, error: 'method not allowed' }, { ...CORS, ...NO_STORE });
  },
};
