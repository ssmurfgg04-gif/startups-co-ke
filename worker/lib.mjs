/**
 * SHARED HELPERS — startups.co.ke Cloudflare Worker.
 * Single dependency-free module. Storage is Supabase (REST + service key);
 * email is Resend (best-effort, never blocking).
 *
 * Ported from the Netlify Functions (netlify/functions/*.mjs) when the site
 * moved to Cloudflare Workers. Response shapes are kept identical so the
 * existing client code and the desk UI work unchanged.
 *
 * Design notes carried over:
 * - Founder listings publish INSTANTLY (no approval queue). Spam controls:
 *   required fields with strict caps, a hidden honeypot field, a single-use
 *   Turnstile check on the final write, per-IP daily rate limits, and optional
 *   Supabase identity (password or email link, raises the cap).
 * - EVERY user string is HTML-escaped at render time and length-capped at
 *   write time. Nothing user-supplied is ever trusted.
 */

export const SECTORS = ['Fintech', 'Commerce', 'Logistics', 'Agritech', 'Energy', 'Health', 'Edtech', 'Proptech', 'SaaS', 'HR & Future of Work', 'Media', 'Climate & Energy', 'Other'];
export const STAGES = ['Pre-seed', 'Seed', 'Series A', 'Series B', 'Growth'];

export const FALLBACK_SB_URL = 'https://eezqpsbhmnhuhnmiwnsz.supabase.co';
export const FALLBACK_SB_ANON =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlenFwc2JobW5odWhubWl3bnN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwNjQzMjgsImV4cCI6MjEwNzY0MDMyOH0.Ks8O3JMluiPxJuozW3CvgU-lsReS7qolo6WR4wO2fXM';

export const sbUrl = (env) => String(env.PUBLIC_SUPABASE_URL || FALLBACK_SB_URL).replace(/\/$/, '');
export const sbAnon = (env) => env.PUBLIC_SUPABASE_ANON_KEY || FALLBACK_SB_ANON;
/** Server-side key. Falls back to the legacy service-role JWT name. */
export const svcKey = (env) => env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY || null;

/** HTML-escape a string for safe interpolation into markup. */
export function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Slug from a company name: lowercase, alnum+hyphens, 1-48 chars. */
export function slugify(name) {
  const s = String(name ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/^-+|-+$/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
  return s || 'startup';
}

const json = (status, obj, extraHeaders = {}) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...extraHeaders },
  });
export { json };

/** Best-effort client IP. ONLY cf-connecting-ip: Cloudflare strips/overwrites
 *  x-forwarded-for for direct requests, so trusting XFF would let callers
 *  spoof fresh rate-limit buckets with a header. Workers always see
 *  cf-connecting-ip; the 'unknown' bucket only exists for local dev. */
export function clientIp(req) {
  return req.headers.get('cf-connecting-ip') || 'unknown';
}

/* ------------------------------------------------------------------ */
/* Supabase REST (service key)                                         */
/* ------------------------------------------------------------------ */

/**
 * One Supabase REST call. Returns { status, data } (data = parsed JSON).
 * Always uses the service key: every table the worker touches has RLS on and
 * no policies, so the public anon key can never read or write it directly.
 */
export async function sb(env, path, { method = 'GET', body, prefer } = {}) {
  const key = svcKey(env);
  if (!key) return { status: 0, data: null, nokey: true };
  const headers = {
    apikey: key,
    Authorization: `Bearer ${key}`,
  };
  // Only declare a JSON body when one exists: PostgREST rejects bodyless
  // DELETEs that carry Content-Type: application/json (400 "Body cannot be
  // empty"), which silently broke unsubscribe and desk deletes.
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (prefer) headers.Prefer = prefer;
  try {
    const r = await fetch(`${sbUrl(env)}${path}`, {
      method,
      headers,
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      signal: AbortSignal.timeout(8000),
    });
    const text = await r.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = null; }
    return { status: r.status, data };
  } catch (err) {
    return { status: 0, data: null, error: String((err && err.message) || err).slice(0, 120) };
  }
}

/**
 * Verify a Supabase session server-side. The anon key is public by
 * design; Auth validates the user JWT itself, so no service key is needed to
 * confirm "this person controls this mailbox".
 *
 * Unconfirmed sign-ups are REJECTED: with "Confirm email" on, Supabase issues
 * no session for them anyway, but if confirmation is ever switched off this
 * check is what stops an unverified address from reaching the desk by
 * registering as the desk email. Fail closed.
 */
export async function verifyUser(env, req) {
  const auth = req.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token || token.length < 20) return null;
  try {
    const r = await fetch(`${sbUrl(env)}/auth/v1/user`, {
      headers: { apikey: sbAnon(env), Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(5000),
    });
    if (!r.ok) return null;
    const u = await r.json();
    if (!u?.email) return null;
    const confirmed = Boolean(u.email_confirmed_at || u.confirmed_at);
    if (!confirmed) return null;
    return { id: u.id || null, email: String(u.email).slice(0, 160) };
  } catch {
    return null;
  }
}

/**
 * Per-IP daily counter in the rate_limits table. Race-window tolerant:
 * a good-enough abuse brake, not a bank ledger.
 */
export async function checkRateLimit(env, ip, cap) {
  const day = new Date().toISOString().slice(0, 10);
  const sel = await sb(
    env,
    `/rest/v1/rate_limits?ip=eq.${encodeURIComponent(ip)}&day=eq.${day}&select=n`
  );
  const n = (Array.isArray(sel.data) && sel.data[0] && Number(sel.data[0].n)) || 0;
  if (n >= cap) return false;
  await sb(env, '/rest/v1/rate_limits?on_conflict=ip,day', {
    method: 'POST',
    body: { ip, day, n: n + 1 },
    prefer: 'resolution=merge-duplicates,return=minimal',
  });
  return true;
}

/* ------------------------------------------------------------------ */
/* Desk identity + best-effort email                                   */
/* ------------------------------------------------------------------ */

/** The desk mailbox: the site owner, set as DESK_EMAIL in the Worker's
 *  environment (Cloudflare secret). NOTIFY_EMAIL is accepted as a legacy alias.
 *  NO hardcoded fallback: a personal address in source code both leaks it and
 *  silently grants the desk to whoever controls that mailbox. Missing config
 *  fails closed. */
export const deskEmail = (env) =>
  String(env.DESK_EMAIL || env.NOTIFY_EMAIL || '').trim().toLowerCase();

/**
 * Best-effort email via Resend. NEVER throws; email is an enhancement, the
 * database is the source of truth. `headers` passes through to Resend
 * (used for List-Unsubscribe on broadcast mail).
 */
export async function attemptEmail(env, { to, subject, text, replyTo, headers }) {
  const key = env.RESEND_API_KEY;
  if (!key) return { sent: false, reason: 'RESEND_API_KEY not configured' };
  const rcpt = String(to || deskEmail(env));
  if (!rcpt || !rcpt.includes('@')) return { sent: false, reason: 'no recipient' };
  const from = env.RESEND_FROM || 'startups.co.ke <notices@startups.co.ke>';
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [rcpt],
        subject,
        text,
        ...(replyTo ? { reply_to: replyTo } : {}),
        ...(headers ? { headers } : {}),
      }),
      signal: AbortSignal.timeout(8000),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { sent: false, reason: `resend ${res.status}` };
    return { sent: true, id: data.id };
  } catch (err) {
    return { sent: false, reason: String((err && err.message) || err).slice(0, 120) };
  }
}

/**
 * Best-effort BATCH email via Resend (max 100 messages per request).
 * Same contract as attemptEmail: never throws, email is an enhancement.
 * Returns { sent, failed } so a broadcast can report honest counts.
 */
export async function sendEmailBatch(env, messages = []) {
  const key = env.RESEND_API_KEY;
  if (!key) return { sent: 0, failed: messages.length, reason: 'RESEND_API_KEY not configured' };
  if (!messages.length) return { sent: 0, failed: 0 };

  const from = env.RESEND_FROM || 'startups.co.ke <notices@startups.co.ke>';
  const payload = messages.map((m) => ({
    from: m.from || from,
    to: [String(m.to || '').trim()],
    subject: m.subject,
    text: m.text,
    ...(m.replyTo ? { reply_to: m.replyTo } : {}),
    ...(m.headers ? { headers: m.headers } : {}),
  }));

  try {
    const r = await fetch('https://api.resend.com/emails/batch', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000),
    });
    const data = await r.json().catch(() => null);
    if (!r.ok) return { sent: 0, failed: messages.length, reason: `resend ${r.status}` };
    const sent = Array.isArray(data?.data) ? data.data.length : messages.length;
    return { sent, failed: Math.max(0, messages.length - sent) };
  } catch (err) {
    return { sent: 0, failed: messages.length, reason: String((err && err.message) || err).slice(0, 120) };
  }
}

/* ------------------------------------------------------------------ */
/* Newsletter send log (who has actually received an issue)           */
/* ------------------------------------------------------------------ */

/**
 * Record who received which edition. Without this there is no way to
 * answer "who has still not heard from us" - the subscriber table only
 * says who signed up, not who got a brief.
 */
export async function recordSends(env, rows = []) {
  if (!rows.length) return 0;
  const body = rows.map((x) => ({
    email: String(x.email || '').trim().toLowerCase(),
    issue: String(x.issue || '').slice(0, 80),
    mode: x.mode === 'test' ? 'test' : 'list',
    status: x.status === 'failed' ? 'failed' : 'sent',
  }));
  const r = await sb(env, '/rest/v1/newsletter_sends', { method: 'POST', body });
  return r.status >= 200 && r.status < 300 ? body.length : 0;
}

/**
 * Subscribers who have never received a list edition. Only a "list" send
 * counts as an issue: a test send or a one-to-one reply does not.
 */
export async function neverSentSubscribers(env) {
  const subs = await listSubscribers(env);
  if (!subs) return null;
  const r = await sb(env, '/rest/v1/newsletter_sends?select=email,mode,status&limit=5000');
  const sends = Array.isArray(r.data) ? r.data : [];
  const got = new Set(
    sends
      .filter((s) => s.status === 'sent' && s.mode === 'list')
      .map((s) => String(s.email || '').trim().toLowerCase()),
  );
  return subs.map((e) => String(e).trim().toLowerCase()).filter((e) => e && !got.has(e));
}

/* ------------------------------------------------------------------ */
/* Unsubscribe tokens (The Ecosystem Brief)                            */
/* ------------------------------------------------------------------ */

/**
 * Per-address HMAC token. Keyed by the service-role key, which only the
 * Worker ever holds: nobody can forge an unsubscribe for someone else
 * without the secret. Not printed, not logged.
 *
 * The old `|| sbAnon(env)` fallback is gone: the anon key is public, so it
 * made unsubscribe tokens forgeable by anyone when the service key was
 * missing. Without a service key there is no token — unsub links simply
 * fail validation (fail closed).
 */
export async function unsubToken(env, email) {
  const secret = svcKey(env);
  if (!secret) return '';
  const data = new TextEncoder().encode(`brief-unsub:${String(email).toLowerCase()}`);
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, data);
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function unsubValid(env, email, token) {
  if (!email || !token) return false;
  const want = await unsubToken(env, email);
  if (!want) return false; // no service key -> no valid tokens exist
  // Constant-time-ish compare; length is fixed (64 hex) so early exit is safe.
  if (String(token).length !== want.length) return false;
  let diff = 0;
  for (let i = 0; i < want.length; i++) diff |= want.charCodeAt(i) ^ String(token).charCodeAt(i);
  return diff === 0;
}

/** Remove a subscriber. Returns rows deleted (0/1) or null on storage error. */
export async function removeSubscriber(env, email) {
  const r = await sb(env, `/rest/v1/newsletter_subscribers?email=eq.${encodeURIComponent(email)}`, {
    method: 'DELETE',
    prefer: 'return=representation',
  });
  if (r.status >= 200 && r.status < 300) return Array.isArray(r.data) ? r.data.length : 0;
  return null;
}

/** Flatten a payload into "- key: value" digest lines (control chars stripped). */
export function digestLines(payload = {}) {
  const clean = (v) => String(v ?? '').replace(/[\u0000-\u001f<>]/g, '').slice(0, 500);
  return Object.entries(payload)
    .filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== '' && !String(v).startsWith('data:'))
    .map(([k, v]) => `- ${k}: ${clean(v)}`)
    .join('\n');
}

/* ------------------------------------------------------------------ */
/* Validation                                                          */
/* ------------------------------------------------------------------ */

const URL_RE = /^https:\/\/[^\s"'<>]{4,190}$/i;
const EMAIL_RE = /^[^\s@"'<>]+@[^\s@"'<>]+\.[a-z]{2,}$/i;

/**
 * Validate + normalise a listing submission. Returns {ok, listing|errors}.
 * Honeypot: any value in `company_url` is a bot; report fake success upstream.
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

/* ------------------------------------------------------------------ */
/* Logo uploads (Worker-brokered signed URLs)                          */
/* ------------------------------------------------------------------ */

/** Allowed logo MIME types -> canonical extension. Mirrors the `logos`
 *  bucket's allowed_mime_types: Storage enforces the same list on the PUT, so
 *  bypassing this check still cannot store a non-image object. */
export const LOGO_MIME = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
};
export const LOGO_MAX_BYTES = 2 * 1024 * 1024;

/**
 * Mint a one-shot, path-scoped Storage upload URL for a company logo.
 *
 * The object path is chosen HERE, never by the caller, so a request can only
 * ever write one random object under logos/ — no overwrite, no traversal, no
 * client-chosen names. The browser still uploads the bytes straight to
 * Storage, so the Worker never buffers the body.
 */
export async function mintLogoUpload(env, { mime, size } = {}) {
  const key = svcKey(env);
  if (!key) return { ok: false, error: 'storage not configured' };

  const ext = LOGO_MIME[String(mime || '').toLowerCase()];
  if (!ext) return { ok: false, error: 'unsupported type' };
  const bytes = Number(size);
  if (Number.isFinite(bytes) && bytes > LOGO_MAX_BYTES) return { ok: false, error: 'too large' };

  const name = `${crypto.randomUUID()}.${ext}`;
  try {
    const r = await fetch(`${sbUrl(env)}/storage/v1/object/upload/sign/logos/${name}`, {
      method: 'POST',
      headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: '{}',
      signal: AbortSignal.timeout(8000),
    });
    const data = await r.json().catch(() => null);
    const rel = data?.url || data?.signedURL || data?.signedUrl || '';
    if (!r.ok || !rel) return { ok: false, error: `sign ${r.status}` };
    return {
      ok: true,
      path: name,
      uploadUrl: rel.startsWith('http') ? rel : `${sbUrl(env)}/storage/v1${rel}`,
      publicUrl: `${sbUrl(env)}/storage/v1/object/public/logos/${name}`,
    };
  } catch (err) {
    return { ok: false, error: String((err && err.message) || err).slice(0, 80) };
  }
}

/**
 * Cloudflare Turnstile verification. No secret = not configured = skip (a
 * deployment without Turnstile keeps working). A configured secret fails
 * CLOSED — missing token and network errors both reject.
 */
export async function verifyTurnstile(env, token, ip) {
  const secret = env.TURNSTILE_SECRET;
  if (!secret) return true;
  if (!token) return false;
  try {
    const form = new URLSearchParams({ secret: String(secret), response: String(token) });
    if (ip && ip !== 'unknown') form.set('remoteip', ip);
    const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: form,
      signal: AbortSignal.timeout(5000),
    });
    const data = await r.json().catch(() => null);
    return Boolean(data?.success);
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* Storage ops (community listings / review queue / newsletter)        */
/* ------------------------------------------------------------------ */

/**
 * Map a community_startups row to the record shape the UI expects.
 * `slug` is a real column AND is copied into `data` at write time — but rows
 * written by earlier versions (or by hand) may lack it inside `data`, which
 * is how /startups/community/undefined happened. The column is the source of
 * truth; it always wins.
 */
const rowToRec = (row) => ({
  ...(row?.data || {}),
  slug: row?.slug || row?.data?.slug || undefined,
  status: row?.status || 'published',
});

export async function getListing(env, slug) {
  const r = await sb(env, `/rest/v1/community_startups?slug=eq.${encodeURIComponent(slug)}&select=*`);
  const row = Array.isArray(r.data) ? r.data[0] : null;
  return row ? rowToRec(row) : null;
}

/**
 * Insert a NEW listing without ever overwriting an existing row.
 *
 * A merge-upsert on `slug` silently clobbers the row another publish just
 * wrote when two creates race (both pick "acme", one wins the read, both
 * write). `resolution=ignore-duplicates` returns [] on a collision instead,
 * so the caller retries with a fresh slug. Returns { ok, inserted }:
 *   ok=false       -> storage error (do not retry in a tight loop)
 *   ok=true, false -> slug collided (safe to retry with another candidate)
 */
export async function createListing(env, record) {
  const r = await sb(env, '/rest/v1/community_startups?on_conflict=slug', {
    method: 'POST',
    body: {
      slug: record.slug,
      data: record,
      status: record.status || 'published',
      created_at: record.createdAt || new Date().toISOString(),
    },
    // ignore-duplicates (not merge): a collision must NOT replace the winner.
    prefer: 'resolution=ignore-duplicates,return=representation',
  });
  if (r.status < 200 || r.status >= 300) return { ok: false, inserted: false };
  return { ok: true, inserted: Array.isArray(r.data) && r.data.length > 0 };
}

export async function listListings(env) {
  const r = await sb(env, '/rest/v1/community_startups?status=eq.published&select=*&order=created_at.desc&limit=500');
  if (!Array.isArray(r.data)) return null; // includes the no-key / error case
  return r.data.map(rowToRec);
}

export async function setListingStatus(env, slug, status) {
  const r = await sb(env, `/rest/v1/community_startups?slug=eq.${encodeURIComponent(slug)}`, {
    method: 'PATCH',
    body: { status, updated_at: new Date().toISOString() },
    prefer: 'return=minimal',
  });
  return r.status >= 200 && r.status < 300;
}

export async function deleteListing(env, slug) {
  const r = await sb(env, `/rest/v1/community_startups?slug=eq.${encodeURIComponent(slug)}`, {
    method: 'DELETE',
    prefer: 'return=minimal',
  });
  return r.status >= 200 && r.status < 300;
}

/**
 * Fetch the RAW row plus the mapped record. The raw `data` column is kept so a
 * later merge-update can preserve fields the edit form never sends (clientRef,
 * source, createdAt, a logo the founder chose to keep).
 */
export async function getListingRow(env, slug) {
  const r = await sb(env, `/rest/v1/community_startups?slug=eq.${encodeURIComponent(slug)}&select=*&limit=1`);
  const row = Array.isArray(r.data) ? r.data[0] : null;
  return row ? { row, rec: rowToRec(row) } : null;
}

/** Every listing a signed-in founder owns (ownership lives in data->>userId). */
export async function listListingsByUser(env, userId) {
  const k = encodeURIComponent('data->>userId');
  const r = await sb(env, `/rest/v1/community_startups?${k}=eq.${encodeURIComponent(userId)}&select=*&order=created_at.desc&limit=200`);
  if (!Array.isArray(r.data)) return null; // no-key / error case
  return r.data.map(rowToRec);
}

/**
 * Update a listing the caller OWNS. Ownership is enforced in the QUERY itself
 * (slug AND data->>userId), so a wrong user id can never touch another
 * founder's row even if the handler's own check were bypassed. `patch` is the
 * FULL new `data` object (the caller merges onto the stored one); `status` is
 * optional (hide / republish).
 */
export async function updateListingByOwner(env, slug, userId, patch, status) {
  const k = encodeURIComponent('data->>userId');
  const r = await sb(
    env,
    `/rest/v1/community_startups?slug=eq.${encodeURIComponent(slug)}&${k}=eq.${encodeURIComponent(userId)}`,
    {
      method: 'PATCH',
      body: { data: patch, ...(status ? { status } : {}), updated_at: new Date().toISOString() },
      prefer: 'return=representation',
    },
  );
  const row = Array.isArray(r.data) ? r.data[0] : null;
  return { ok: r.status >= 200 && r.status < 300, row: row ? rowToRec(row) : null };
}

/** Idempotency: find a previously published listing with this clientRef. */
export async function findByClientRef(env, clientRef) {
  const k = encodeURIComponent('data->>clientRef');
  const r = await sb(env, `/rest/v1/community_startups?${k}=eq.${encodeURIComponent(clientRef)}&select=*&limit=1`);
  const row = Array.isArray(r.data) ? r.data[0] : null;
  return row ? rowToRec(row) : null;
}

/** Unique slug: try base, then -2 ... -50. */
export async function uniqueSlug(env, base) {
  if (!(await getListing(env, base))) return base;
  for (let i = 2; i <= 50; i++) {
    const cand = `${base}-${i}`;
    if (!(await getListing(env, cand))) return cand;
  }
  return `${base}-${Date.now().toString(36)}`;
}

export async function queueInsert(env, record) {
  const r = await sb(env, '/rest/v1/review_queue', {
    method: 'POST',
    body: {
      id: record.id,
      kind: record.kind,
      label: record.label,
      payload: record.payload,
      email: record.email,
      status: record.status || 'new',
      created_at: record.createdAt,
    },
    prefer: 'return=minimal',
  });
  return r.status >= 200 && r.status < 300;
}

export async function queueList(env) {
  const r = await sb(env, '/rest/v1/review_queue?select=*&order=created_at.desc&limit=500');
  if (!Array.isArray(r.data)) return [];
  return r.data.map((row) => ({
    id: row.id,
    kind: row.kind,
    label: row.label,
    payload: row.payload || {},
    email: row.email,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function queueMarkDone(env, id) {
  const r = await sb(env, `/rest/v1/review_queue?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: { status: 'done', updated_at: new Date().toISOString() },
    prefer: 'return=minimal',
  });
  return r.status >= 200 && r.status < 300;
}

/**
 * Newsletter signup. Returns { duplicate: false } on a fresh insert,
 * { duplicate: true } when the address is already subscribed.
 */
export async function newsletterSubscribe(env, email, source) {
  const r = await sb(env, '/rest/v1/newsletter_subscribers?on_conflict=email', {
    method: 'POST',
    body: { email, source },
    prefer: 'resolution=ignore-duplicates,return=representation',
  });
  if (r.status >= 200 && r.status < 300) return { duplicate: Array.isArray(r.data) ? r.data.length === 0 : false };
  return null;
}

export async function subscriberCount(env) {
  const r = await sb(env, '/rest/v1/newsletter_subscribers?select=email&limit=10000');
  return Array.isArray(r.data) ? r.data.length : 0;
}

/** Addresses currently on the Brief list (desk-only, used by /desk/brief-send). */
export async function listSubscribers(env) {
  const r = await sb(env, '/rest/v1/newsletter_subscribers?select=email&order=created_at.asc&limit=10000');
  if (!Array.isArray(r.data)) return null;
  return r.data.map((row) => String(row.email || '').toLowerCase()).filter((e) => e.includes('@'));
}
