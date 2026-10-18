/**
 * NETLIFY FUNCTION — POST /.netlify/functions/startup-create
 * Founder self-service startup listing: PUBLISHES INSTANTLY, no approval.
 *
 * Body (JSON): { name, website, tagline, description?, sector?, stage?,
 *                county?, founderName?, email?, logoUrl?, company_url? }
 * Optional header: Authorization: Bearer <supabase-access-token> — when a
 * valid magic-link session is presented the listing is marked source=signedin
 * and gets a higher rate limit.
 *
 * Spam controls: honeypot field `company_url` (bots fill it, humans can't see
 * it), per-IP daily cap, strict field caps, https-only website URLs.
 *
 * Storage: Netlify Blobs, store `community_startups`, key `s:<slug>`.
 */
import { getStore } from '@netlify/blobs';
import {
  checkRateLimit, clientIp, json, listingKey, uniqueSlug, validateListing, verifyUser,
} from './_lib.mjs';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (req.method !== 'POST') return json(405, { ok: false, error: 'POST only' }, CORS);

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
  const store = getStore('community_startups');
  const ip = clientIp(req);
  const cap = user ? 10 : 2;

  const allowed = await checkRateLimit(store, ip, cap);
  if (!allowed) {
    return json(429, { ok: false, error: `Daily limit reached (${cap}/day). Try again tomorrow.` }, CORS);
  }

  const v = validateListing(body);
  if (!v.ok) return json(422, { ok: false, error: 'validation', errors: v.errors }, CORS);

  const base = slugify(v.listing.name);
  const slug = await uniqueSlug(store, base);
  const record = { ...v.listing, slug, source: user ? 'signedin' : 'anon', status: 'published' };
  if (user) record.userId = user.id;

  await store.setJSON(listingKey(slug), record);

  return json(200, {
    ok: true,
    slug,
    url: `https://startups.co.ke/startups/community/${slug}`,
  }, CORS);
};
