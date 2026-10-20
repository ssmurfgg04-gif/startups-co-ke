// E2E — Supabase auth: sign up, email-confirmation gate, sign in, magic link,
// password recovery, sign out. Mirrors exactly what the browser does in
// src/components/ModalHost.astro + src/scripts/core.ts.
//
//   node scripts/e2e_auth.mjs https://startups.co.ke
//
// Requires SUPABASE_SERVICE_ROLE_KEY in the env to confirm + delete the test
// user deterministically (otherwise the suite stops after the signup gate and
// warns). The anon key is public and identical to the bundle's fallback.

const BASE = (process.argv[2] || 'https://startups.co.ke').replace(/\/$/, '');
const SB = process.env.SUPABASE_URL || 'https://eezqpsbhmnhuhnmiwnsz.supabase.co';
const ANON = process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlenFwc2JobW5odWhubWl3bnN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwNjQzMjgsImV4cCI6MjEwNzY0MDMyOH0.Ks8O3JMluiPxJuozW3CvgU-lsReS7qolo6WR4wO2fXM';
const SVC = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const EMAIL = process.argv[3] || `startupsqa+${Date.now()}@gmail.com`;
const PASSWORD = `Qa!${Math.random().toString(36).slice(2)}9zR`;

let pass = 0;
let fail = 0;
const ok = (name, cond, extra = '') => {
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${extra ? ` — ${extra}` : ''}`);
  cond ? pass++ : fail++;
};

async function sbFetch(path, { method = 'GET', key = ANON, body, headers = {} } = {}) {
  const r = await fetch(SB + path, {
    method,
    headers: { apikey: key, Authorization: `Bearer ${key}`, ...(body ? { 'Content-Type': 'application/json' } : {}), ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
  let j = null;
  try { j = await r.json(); } catch { /* empty body (204) */ }
  return { status: r.status, j };
}

console.log(`E2E auth against ${SB}\ntest user: ${EMAIL}\n`);

// 0. settings: is signup enabled, is email autoconfirmed?
const settings = await sbFetch('/auth/v1/settings');
const autoconfirm = settings.j?.mailer_autoconfirm === true;
ok('auth settings reachable', settings.status === 200, `http ${settings.status}`);
ok('signup enabled', settings.j?.disable_signup === false, `disable_signup=${settings.j?.disable_signup}`);
console.log(`     (mailer_autoconfirm=${autoconfirm})`);

// 1. sign up (what the Sign-up tab calls)
const su = await sbFetch('/auth/v1/signup', { method: 'POST', body: { email: EMAIL, password: PASSWORD } });
const suUser = su.j?.user || su.j;
const suId = suUser?.id;
ok('signup -> 200', su.status === 200, `http ${su.status}`);
if (autoconfirm) {
  ok('signup returns session (autoconfirm ON)', Boolean(su.j?.access_token));
} else {
  ok('signup withheld session pending confirmation', !su.j?.access_token, `access_token=${Boolean(su.j?.access_token)}`);
  ok('signup created a user object', Boolean(suId), `id=${suId}`);
}

// 2. sign in BEFORE confirmation -> must be gated
if (!autoconfirm) {
  const early = await sbFetch('/auth/v1/token?grant_type=password', { method: 'POST', body: { email: EMAIL, password: PASSWORD } });
  const m = String(early.j?.error_description || early.j?.msg || early.j?.message || '');
  ok('unconfirmed sign-in rejected', early.status >= 400, `http ${early.status} ${m}`);
}

// 3. admin-confirm (stand-in for clicking the email link)
let confirmed = autoconfirm;
if (SVC && suId) {
  const upd = await sbFetch(`/auth/v1/admin/users/${suId}`, { method: 'PUT', key: SVC, body: { email_confirm: true } });
  confirmed = upd.status === 200;
  ok('admin confirm test user', confirmed, `http ${upd.status}`);
} else if (!SVC) {
  console.log('WARN no SUPABASE_SERVICE_ROLE_KEY — cannot confirm/cleanup; stopping gate tests');
}

// 4. sign in AFTER confirmation
let accessToken = '';
if (confirmed) {
  const si = await sbFetch('/auth/v1/token?grant_type=password', { method: 'POST', body: { email: EMAIL, password: PASSWORD } });
  accessToken = si.j?.access_token || '';
  ok('confirmed sign-in -> session', si.status === 200 && Boolean(accessToken), `http ${si.status}`);
  ok('session carries user email', si.j?.user?.email === EMAIL, `email=${si.j?.user?.email}`);
}

// 5. magic link (Email-link tab -> signInWithOtp)
const otp = await sbFetch('/auth/v1/otp', { method: 'POST', body: { email: EMAIL, create_user: false } });
ok('magic link request accepted', otp.status === 200, `http ${otp.status}`);

// 6. password recovery (resetPasswordForEmail)
const rec = await sbFetch('/auth/v1/recover', { method: 'POST', body: { email: EMAIL } });
ok('password recovery accepted', rec.status === 200, `http ${rec.status}`);

// 7. sign out (logout) with the live session
if (accessToken) {
  const lo = await sbFetch('/auth/v1/logout', { method: 'POST', key: ANON, headers: { Authorization: `Bearer ${accessToken}` } });
  ok('sign out -> 204', lo.status === 204, `http ${lo.status}`);
}

// 8. site surface sanity: the pages that host these flows answer
for (const p of ['/', '/auth/reset', '/list-your-startup']) {
  const r = await fetch(BASE + p);
  ok(`site ${p} -> 200`, r.status === 200, `http ${r.status}`);
}

// cleanup
if (SVC && suId) {
  const del = await sbFetch(`/auth/v1/admin/users/${suId}`, { method: 'DELETE', key: SVC });
  ok('cleanup test user', del.status === 200, `http ${del.status}`);
} else if (!SVC) {
  console.log(`WARN cleanup skipped: delete auth user ${suId} (${EMAIL}) manually`);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
