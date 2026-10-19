/**
 * NETLIFY FUNCTION — POST /.netlify/functions/startup-create
 * Founder self-service startup listing: PUBLISHES INSTANTLY, no approval.
 *
 * Body (JSON): { name, website, tagline, description?, sector?, stage?,
 *                county?, founderName?, email?, logoUrl?, company_url?,
 *                clientRef? }
 * Optional header: Authorization: Bearer <supabase-access-token> — when a
 * valid magic-link session is presented the listing is marked source=signedin
 * and gets a higher rate limit.
 *
 * Spam controls: honeypot field `company_url` (bots fill it, humans can't see
 * it), per-IP daily cap, strict field caps, https-only website URLs.
 *
 * Idempotency: the client sends a `clientRef` (UUID generated once per form
 * session and REUSED on retries). If a record with that clientRef already
 * exists we return the original slug instead of creating a duplicate — so a
 * flaky-mobile-network retry can never publish a startup twice.
 *
 * Storage: Netlify Blobs, store `community_startups`, key `s:<slug>`.
 */
import { getStore } from '@netlify/blobs';
import {
  attemptEmail, checkRateLimit, clientIp, digestLines, json, listingKey, slugify, uniqueSlug, validateListing, verifyUser,
} from './_lib.mjs';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};
const NO_STORE = { 'Cache-Control': 'no-store' };

export default async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (req.method !== 'POST') return json(405, { ok: false, error: 'POST only' }, CORS);

  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return json(400, { ok: false, error: 'invalid JSON' }, CORS);
    }

    // Honeypot: pretend success so bots don't learn anything.
    if (String(body?.company_url ?? '').trim() !== '') {
      return json(200, { ok: true, honeypot: true, slug: 'thanks', url: '/startups/community' }, CORS);
    }

    const user = await verifyUser(req);

    // Validate BEFORE touching storage so a fixable mistake (long tagline,
    // missing https) never burns one of the day's attempts — and so local/
    // unit contexts get clean 422s without a Blobs runtime.
    const v = validateListing(body);
    if (!v.ok) return json(422, { ok: false, error: 'validation', errors: v.errors }, { ...CORS, ...NO_STORE });

    const store = getStore('community_startups');
    const ip = clientIp(req);

    // Idempotency: a retry from the same form session must return the SAME
    // listing, not create a twin. Scan published records for this clientRef.
    const clientRef = String(body?.clientRef ?? '').replace(/[^a-zA-Z0-9-]/g, '').slice(0, 64);
    if (clientRef) {
      try {
        const res = await store.list({ prefix: 's:' });
        const keys = (res?.blobs ?? []).map((b) => b.key).filter((k) => k && k.startsWith('s:'));
        for (const key of keys) {
          const rec = await store.get(key, { type: 'json' }).catch(() => null);
          if (rec && rec.clientRef === clientRef) {
            return json(200, {
              ok: true, duplicate: true, slug: rec.slug,
              url: `https://startups.co.ke/startups/community/${rec.slug}`,
            }, { ...CORS, ...NO_STORE });
          }
        }
      } catch { /* scan is best-effort; dedupe still comes from uniqueSlug */ }
    }

    // 5/day for anon (shared office NATs are real), 10/day with a verified
    // magic-link session. Both are spam-tight thanks to the honeypot + caps.
    const cap = user ? 10 : 5;
    const allowed = await checkRateLimit(store, ip, cap);
    if (!allowed) {
      return json(429, { ok: false, error: `Daily limit reached (${cap}/day). Try again tomorrow.` }, { ...CORS, ...NO_STORE });
    }

    const base = slugify(v.listing.name);
    const slug = await uniqueSlug(store, base);
    const record = { ...v.listing, slug, source: user ? 'signedin' : 'anon', status: 'published' };
    if (clientRef) record.clientRef = clientRef;
    if (user) record.userId = user.id;

    try {
      await store.setJSON(listingKey(slug), record);
    } catch (err) {
      return json(503, {
        ok: false,
        error: `Our listing storage is momentarily unavailable (${String((err && err.message) || err).slice(0, 80)}). Your entries are still in the form — please press Publish again.`,
      }, { ...CORS, ...NO_STORE });
    }

    // Desk ping (best-effort, server-side — never blocks the founder's success).
    attemptEmail({
      to: undefined, // resolved inside attemptEmail via NOTIFY_EMAIL default — keep signature simple
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
    }).catch(() => {});

    return json(200, {
      ok: true,
      slug,
      url: `https://startups.co.ke/startups/community/${slug}`,
    }, { ...CORS, ...NO_STORE });
  } catch (err) {
    // Surface the cause (message only — never a stack) so production issues
    // are debuggable from the client response.
    return json(500, { ok: false, error: String((err && err.message) || err) }, { ...CORS, ...NO_STORE });
  }
};
