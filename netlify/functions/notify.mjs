/**
 * NETLIFY FUNCTION — review-queue email notifications.
 *
 * Every form on the site writes into the Supabase `submissions` table (the
 * review queue). This function is the "you've got mail" half: the browser
 * fires a POST here right after a successful insert, and we email the desk
 * a plain-text digest via the Resend API.
 *
 * Path (default for v2 functions): POST /.netlify/functions/notify
 *
 * Environment variables (Netlify UI → Site configuration → Environment
 * variables — server-side only, never shipped to the browser):
 *   RESEND_API_KEY  required to send (re_…). Without it the function
 *                   responds 202 {skipped} so forms never break in previews.
 *   NOTIFY_EMAIL    optional. Who gets the alert. Default: jackblessed191@gmail.com (a proven
 *                   inbox). To receive at jack@startups.co.ke instead, set this
 *                   env var — but only once that mailbox actually exists (Resend
 *                   sends FROM your domain; it does not HOST mailboxes for it).
 *   RESEND_FROM     optional. Default "startups.co.ke <notices@startups.co.ke>".
 *                   startups.co.ke is verified in Resend, so this sender is live
 *                   and delivers to any inbox (previously onboarding@resend.dev
 *                   could only reach the Resend account owner).
 */

const json = (status, obj) =>
  new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json' } });

const KIND_LABELS = {
  startup: 'New startup submission',
  claim: 'Profile claim request',
  job: 'New job posting',
  event: 'Event listing request',
  intro: 'Introduction request',
  register: 'Hackathon registration',
  trial: 'Professional trial started',
  buy: 'Report unlock request',
  sponsor: 'Sponsor enquiry',
  issue: 'Data issue report',
  newsletter: 'Newsletter signup',
};

/** Flatten the payload object into "- key: value" lines (control chars stripped). */
function digest(payload) {
  const clean = (v) => String(v ?? '').replace(/[\u0000-\u001f<>]/g, '').slice(0, 500);
  return Object.entries(payload)
    .filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== '' && !String(v).startsWith('data:'))
    .map(([k, v]) => `- ${k}: ${clean(v)}`)
    .join('\n');
}

export default async (req) => {
  if (req.method !== 'POST') return json(405, { ok: false, error: 'POST only' });

  const key = process.env.RESEND_API_KEY;
  if (!key) return json(202, { ok: true, skipped: 'RESEND_API_KEY not configured' });

  let body;
  try {
    body = await req.json();
  } catch {
    return json(400, { ok: false, error: 'bad json' });
  }

  const { kind, payload = {}, email } = body ?? {};
  if (!kind || typeof payload !== 'object') return json(400, { ok: false, error: 'missing kind/payload' });

  const to = process.env.NOTIFY_EMAIL || 'jackblessed191@gmail.com';
  const from = process.env.RESEND_FROM || 'startups.co.ke <notices@startups.co.ke>';
  const label = KIND_LABELS[kind] || 'New submission';
  const subject = `[review queue] ${label}${email ? ` — ${email}` : ''}`;
  const text = [
    `${label}`,
    `From: ${email || 'no email given'}`,
    '',
    digest(payload),
    '',
    '--',
    'Review it: Supabase dashboard → Table Editor → submissions (project eezqpsbhmnhuhnmiwnsz)',
    'This is an automated ping from startups.co.ke — the record is already saved.',
    'Reply goes to the submitter\'s email when they gave one.',
  ].join('\n');

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [to], subject, text, ...(email ? { reply_to: email } : {}) }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error('resend error', res.status, data);
      // Non-2xx from Resend: log it, but the form already saved — not the user's problem
      return json(200, { ok: false, error: `resend ${res.status}` });
    }
    return json(200, { ok: true, id: data.id });
  } catch (err) {
    console.error('notify error', err);
    return json(200, { ok: false, error: 'resend unreachable' });
  }
};
