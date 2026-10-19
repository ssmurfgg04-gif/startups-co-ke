// Unit checks for worker/lib.mjs security-critical helpers.
// Pure / stubbed — no network. Run: node scripts/unit_s8.mjs
import { deskEmail, digestLines, attemptEmail, clientIp, unsubToken, unsubValid } from '../worker/lib.mjs';

const ok = (name, cond) => { console.log(`${cond ? 'PASS' : 'FAIL'} ${name}`); if (!cond) process.exitCode = 1; };

// ---- deskEmail: env-only, fails closed ----
const env = { NOTIFY_EMAIL: 'Owner@Startups.co.ke ' };
ok('deskEmail normalizes case+space', deskEmail(env) === 'owner@startups.co.ke');
ok('deskEmail missing config → empty (no hardcoded fallback)', deskEmail({}) === '');
ok('deskEmail empty string → empty', deskEmail({ NOTIFY_EMAIL: '' }) === '');

// ---- digestLines ----
const d = digestLines({ name: 'Acme', empty: '', dropped: undefined, dataUrl: 'data:image/png;base64,xx', n: 5 });
ok('digest drops empty/undefined/data:', !d.includes('empty') && !d.includes('dropped') && !d.includes('data:') && d.includes('name: Acme') && d.includes('n: 5'));
ok('digest strips control chars + angles (to empty)', !digestLines({ x: 'a\nb<c>' }).includes('\n') && !digestLines({ x: '<' }).includes('<'));

// ---- attemptEmail: no key → skipped, never throws ----
const R = () => ({ RESEND_API_KEY: undefined });
const r1 = await attemptEmail(R(), { subject: 't', text: 't' });
ok('attemptEmail skips without key', r1.sent === false && /not configured/.test(r1.reason));
const r2 = await attemptEmail({ RESEND_API_KEY: 're_test_123' }, { subject: 't', text: 't' }).catch((e) => ({ sent: false, reason: String(e) }));
ok('attemptEmail with key never throws (network err → {sent:false})', r2.sent === false);
const r3 = await attemptEmail({ RESEND_API_KEY: 're_test_123' }, { subject: 't', text: 't' });
ok('attemptEmail without recipient fails closed', r3.sent === false && r3.reason === 'no recipient');

// ---- clientIp: cf-connecting-ip only, XFF never trusted ----
ok('clientIp uses cf-connecting-ip', clientIp({ headers: new Headers({ 'cf-connecting-ip': '1.2.3.4', 'x-forwarded-for': '9.9.9.9' }) }) === '1.2.3.4');
ok('clientIp ignores spoofed XFF', clientIp({ headers: new Headers({ 'x-forwarded-for': '9.9.9.9' }) }) === 'unknown');
ok('clientIp no headers → unknown bucket', clientIp({ headers: new Headers() }) === 'unknown');

// ---- unsubToken: service-key only, no anon fallback ----
const anon = 'eyJhbGciOiJIUzI1NiJ9.anon.fake';
const noSvc = { SUPABASE_SERVICE_ROLE_KEY: '', PUBLIC_SUPABASE_ANON_KEY: anon };
ok('unsubToken without service key → empty (fail closed)', (await unsubToken(noSvc, 'a@b.co')) === '');
ok('unsubValid without service key → false', (await unsubValid(noSvc, 'a@b.co', 'f'.repeat(64))) === false);
const svc = { SUPABASE_SERVICE_ROLE_KEY: 'svc-secret-123' };
const t1 = await unsubToken(svc, 'a@b.co');
ok('unsubToken with service key is 64 hex', /^[0-9a-f]{64}$/.test(t1));
ok('unsubValid accepts correct token', (await unsubValid(svc, 'a@b.co', t1)) === true);
ok('unsubValid rejects wrong token', (await unsubValid(svc, 'a@b.co', '0'.repeat(64))) === false);
ok('unsubValid rejects other address', (await unsubValid(svc, 'other@b.co', t1)) === false);
// Determinism: same key+email → same token; different key → different token.
ok('unsubToken deterministic per key', (await unsubToken(svc, 'a@b.co')) === t1);
ok('unsubToken bound to the key', (await unsubToken({ SUPABASE_SERVICE_ROLE_KEY: 'svc-secret-124' }, 'a@b.co')) !== t1);

console.log('worker security unit checks done');
