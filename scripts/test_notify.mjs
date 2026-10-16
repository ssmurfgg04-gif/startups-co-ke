/**
 * TEST — netlify/functions/notify.mjs
 * 1) Unit: builds the same email body the function would send and prints it.
 * 2) Live: calls the Resend API with RESEND_API_KEY from .env and reports
 *    the honest result (403 "only send to your own email" is an expected,
 *    documented outcome until the sending domain is verified in Resend).
 *
 * Usage: node scripts/test_notify.mjs [--live]
 */
import { readFileSync } from 'node:fs';

// --- load .env (same loader style as other scripts) ---
const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n')
    .filter((l) => l.trim() && !l.trim().startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()])
);

// --- mirror of the function's digest() so we test the real shape ---
function digest(payload) {
  const clean = (v) => String(v ?? '').replace(/[\u0000-\u001f<>]/g, '').slice(0, 500);
  return Object.entries(payload)
    .filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== '' && !String(v).startsWith('data:'))
    .map(([k, v]) => `- ${k}: ${clean(v)}`)
    .join('\n');
}

const sample = {
  kind: 'job',
  email: 'hiring@acme.co.ke',
  payload: {
    company: 'Acme Robotics',
    title: 'Backend Engineer',
    location: 'Nairobi',
    type: 'Full-time',
    tier: 'Standard — KSh 2,900',
    pay: 'Range — KES / month',
    payMin: '80000',
    payMax: '120000',
    duties: 'Ship the ledger service; own the M-PESA reconciliation queue',
    quals: '4+ yrs Node; SQL; has shipped payments before',
    apply: 'Email CV',
    applyDetail: 'jobs@acme.co.ke',
    deadline: '2026-11-30',
  },
};

const subject = `[review queue] New job posting — ${sample.email}`;
const text = [
  'New job posting',
  `From: ${sample.email}`,
  '',
  digest(sample.payload),
  '',
  '--',
  'Review it: Supabase dashboard → Table Editor → submissions (project eezqpsbhmnhuhnmiwnsz)',
  'This is an automated ping from startups.co.ke — the record is already saved.',
].join('\n');

console.log('--- email preview ---');
console.log(`To: ${env.NOTIFY_EMAIL || 'jack@startups.co.ke'}`);
console.log(`From: ${env.RESEND_FROM || 'startups.co.ke <onboarding@resend.dev>'}`);
console.log(`Subject: ${subject}`);
console.log(text);
console.log('---------------------');

if (!process.argv.includes('--live')) {
  console.log('(dry run — pass --live to actually call Resend)');
  process.exit(0);
}

if (!env.RESEND_API_KEY) {
  console.error('✗ RESEND_API_KEY missing from .env');
  process.exit(1);
}

const res = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    from: env.RESEND_FROM || 'startups.co.ke <onboarding@resend.dev>',
    to: [env.NOTIFY_EMAIL || 'jack@startups.co.ke'],
    subject,
    text,
    reply_to: sample.email,
  }),
});
const data = await res.json().catch(() => ({}));
console.log(`Resend responded ${res.status}:`, JSON.stringify(data));
if (res.status === 403) {
  console.log('ℹ Expected until the sending domain is verified: onboarding@resend.dev can only deliver to the Resend account owner\u2019s own address. Verify startups.co.ke in the Resend dashboard (Domains → Add domain → add the DNS records), then set RESEND_FROM to notices@startups.co.ke.');
}
