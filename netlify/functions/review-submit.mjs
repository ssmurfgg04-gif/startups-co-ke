/**
 * NETLIFY FUNCTION — POST /.netlify/functions/review-submit
 * The review queue, rebuilt on Netlify Blobs.
 *
 * WHY: the Supabase `submissions` insert policy never covered the anon role
 * (policy was created with `to postgres` default via the Management API), so
 * EVERY review-queue form failed with 42501 in production and the founder's
 * "submit for human review" never saved anywhere. This function is the
 * reliable write path: honeypot → validate → rate-limit → Blob store
 * `review_queue` → best-effort desk email via Resend (when RESEND_API_KEY is
 * configured). The desk reads the queue at /desk (see desk.mjs).
 *
 * Body (JSON): { kind, payload, email?, company_url? }
 * kinds: startup | claim | job | event | intro | issue | trial | buy |
 *        sponsor | register
 */
import { getStore } from '@netlify/blobs';
import { attemptEmail, checkRateLimit, clientIp, digestLines, json } from './_lib.mjs';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};
const NO_STORE = { 'Cache-Control': 'no-store' };

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

    const kind = String(body?.kind ?? '');
    if (!KINDS.has(kind)) return json(422, { ok: false, error: 'unknown kind' }, { ...CORS, ...NO_STORE });

    // Payload: keep it small + flat. Strings capped, arrays/objects JSON-capped.
    const raw = body?.payload && typeof body.payload === 'object' ? body.payload : {};
    const payload = {};
    for (const [k, val] of Object.entries(raw).slice(0, 24)) {
      const key = String(k).replace(/[\u0000-\u001f]/g, '').slice(0, 40);
      if (!key) continue;
      payload[key] = typeof val === 'string' ? val.replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, 1200) : val;
    }
    const email = String(body?.email ?? '').trim().slice(0, 160) || null;

    const store = getStore('review_queue');
    const allowed = await checkRateLimit(store, clientIp(req), 20);
    if (!allowed) {
      return json(429, { ok: false, error: 'Daily limit reached. Try again tomorrow.' }, { ...CORS, ...NO_STORE });
    }

    const id = `r:${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    const record = {
      id,
      kind,
      label: LABELS[kind] || 'Submission',
      payload,
      email,
      status: 'new',
      createdAt: new Date().toISOString(),
    };
    try {
      await store.setJSON(id, record);
    } catch (err) {
      return json(503, {
        ok: false,
        error: `Our queue storage is momentarily unavailable (${String((err && err.message) || err).slice(0, 80)}). Please try again in a moment.`,
      }, { ...CORS, ...NO_STORE });
    }

    // Desk digest (best-effort — the queue itself is the source of truth).
    attemptEmail({
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
    }).catch(() => {});

    return json(200, { ok: true, stored: 'queue', id }, { ...CORS, ...NO_STORE });
  } catch (err) {
    return json(500, { ok: false, error: String((err && err.message) || err) }, { ...CORS, ...NO_STORE });
  }
};
