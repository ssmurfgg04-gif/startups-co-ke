/**
 * NETLIFY FUNCTION — POST /.netlify/functions/newsletter
 * The Ecosystem Brief signup, rebuilt on Netlify Blobs.
 *
 * WHY: the Supabase `newsletter_subscribers` insert policy never covered the
 * anon role, so every signup failed with 42501 and the table stayed empty —
 * subscribers were told "Subscribed" while nothing was saved. This function
 * is the reliable write path: validate → dedupe → Blob store `newsletter`
 * → best-effort welcome email via Resend (when RESEND_API_KEY is configured;
 * startups.co.ke is a verified sender there).
 *
 * Body (JSON): { email, source?, company_url? }
 */
import { getStore } from '@netlify/blobs';
import { attemptEmail, checkRateLimit, clientIp, json } from './_lib.mjs';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};
const NO_STORE = { 'Cache-Control': 'no-store' };

const EMAIL_RE = /^[^\s@"'<>]+@[^\s@"'<>]+\.[a-z]{2,}$/i;

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
      return json(200, { ok: true, honeypot: true }, { ...CORS, ...NO_STORE });
    }

    const email = String(body?.email ?? '').trim().slice(0, 160).toLowerCase();
    if (!EMAIL_RE.test(email)) {
      return json(422, { ok: false, error: 'Please enter a valid email address.' }, { ...CORS, ...NO_STORE });
    }
    const source = String(body?.source ?? 'site').replace(/[^a-z0-9_-]/gi, '').slice(0, 24) || 'site';

    const store = getStore('newsletter');
    const allowed = await checkRateLimit(store, clientIp(req), 10);
    if (!allowed) {
      return json(429, { ok: false, error: 'Too many attempts today. Try again tomorrow.' }, { ...CORS, ...NO_STORE });
    }

    // Dedupe: key on the email itself (per-address, unique by construction).
    const key = `n:${email}`;
    const existing = await store.get(key, { type: 'json' }).catch(() => null);
    if (existing) {
      return json(200, { ok: true, duplicate: true }, { ...CORS, ...NO_STORE });
    }

    const record = { email, source, status: 'subscribed', createdAt: new Date().toISOString() };
    try {
      await store.setJSON(key, record);
    } catch (err) {
      return json(503, {
        ok: false,
        error: `Signup storage is momentarily unavailable (${String((err && err.message) || err).slice(0, 80)}). Please try again in a moment.`,
      }, { ...CORS, ...NO_STORE });
    }

    // Welcome email (best-effort — subscription succeeds regardless).
    attemptEmail({
      to: email,
      subject: 'Welcome to The Ecosystem Brief — startups.co.ke',
      text: [
        'Karibu — you are on the list for The Ecosystem Brief.',
        '',
        'What to expect: one tight email when there is something worth reading — verified funding rounds with named sources, founder listings from the community, live tech jobs and every hackathon in the region. No hype, no invented numbers; every figure keeps its source.',
        '',
        'Building something? Your startup can be listed instantly: https://startups.co.ke/startups/community',
        '',
        '-- startups.co.ke — Kenya\u2019s startup record, kept in the open',
      ].join('\n'),
    }).catch(() => {});

    // Desk ping so the owner sees growth (best-effort).
    attemptEmail({
      subject: `[newsletter] new subscriber — ${email}`,
      text: `New newsletter signup (source: ${source}).\nTotal management: https://startups.co.ke/desk`,
    }).catch(() => {});

    return json(200, { ok: true, stored: 'queue' }, { ...CORS, ...NO_STORE });
  } catch (err) {
    return json(500, { ok: false, error: String((err && err.message) || err) }, { ...CORS, ...NO_STORE });
  }
};
