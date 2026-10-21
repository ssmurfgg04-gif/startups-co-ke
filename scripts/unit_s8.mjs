// Unit checks for worker/lib.mjs security-critical helpers.
// Pure / stubbed — no network. Run: node scripts/unit_s8.mjs
import { deskEmail, digestLines, attemptEmail, clientIp, sb, unsubToken, unsubValid } from '../worker/lib.mjs';

const ok = (name, cond) => { console.log(`${cond ? 'PASS' : 'FAIL'} ${name}`); if (!cond) process.exitCode = 1; };

// ---- deskEmail: env-only, fails closed ----
const env = { NOTIFY_EMAIL: 'Owner@Startups.co.ke ' };
ok('deskEmail normalizes case+space', deskEmail(env) === 'owner@startups.co.ke');
ok('deskEmail missing config → empty (no hardcoded fallback)', deskEmail({}) === '');
ok('deskEmail empty string → empty', deskEmail({ NOTIFY_EMAIL: '' }) === '');
ok('deskEmail prefers DESK_EMAIL over legacy NOTIFY_EMAIL', deskEmail({ DESK_EMAIL: 'desk@startups.co.ke', NOTIFY_EMAIL: 'old@example.com' }) === 'desk@startups.co.ke');

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

// ---- sb(): never send Content-Type without a body ----
// PostgREST answers bodyless DELETEs that carry Content-Type: application/json
// with 400 "Body cannot be empty", which silently broke unsubscribe + deletes.
const realFetch = globalThis.fetch;
let seen = null;
globalThis.fetch = async (url, init) => {
  seen = { url: String(url), init };
  return new Response('[]', { status: 200, headers: { 'content-type': 'application/json' } });
};
const sbEnv = { PUBLIC_SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'svc-test' };
await sb(sbEnv, '/rest/v1/x?y=eq.1', { method: 'DELETE', prefer: 'return=minimal' });
ok('sb DELETE omits Content-Type when there is no body', !seen.init.headers['Content-Type']);
ok('sb DELETE keeps apikey + Prefer', seen.init.headers.apikey === 'svc-test' && seen.init.headers.Prefer === 'return=minimal');
await sb(sbEnv, '/rest/v1/x', { method: 'POST', body: { a: 1 } });
ok('sb POST with body sets Content-Type + JSON body', seen.init.headers['Content-Type'] === 'application/json' && seen.init.body === '{"a":1}');
globalThis.fetch = realFetch;

// ---- Turnstile config: fail closed unless explicitly skipped ----
// A deploy that loses TURNSTILE_SECRET must not silently disable the bot
// check. The single escape hatch is the explicit TURNSTILE_SKIP=1 switch
// used for local `wrangler dev` runs (never set in production).
const worker = (await import('../worker/index.js')).default;
const mkReq = (body = {}) => new Request('https://startups.co.ke/api/startup-create', {
  method: 'POST',
  headers: { 'content-type': 'application/json', 'cf-connecting-ip': '1.2.3.4' },
  body: JSON.stringify(body),
});
const guardEnv = { SUPABASE_SERVICE_ROLE_KEY: 'svc-test' };
const ctx = { waitUntil() {} };
const edge = await worker.fetch(mkReq({ name: 'Acme Test' }), guardEnv, ctx);
ok('no TURNSTILE_SECRET -> 503 (fail closed)', edge.status === 503);
const skipped = await worker.fetch(mkReq({}), { ...guardEnv, TURNSTILE_SKIP: '1' }, ctx);
ok('TURNSTILE_SKIP=1 (local dev) -> 422 validation, no 503', skipped.status === 422);
const hOff = await (await worker.fetch(new Request('https://startups.co.ke/api/health'), guardEnv, ctx)).json();
ok('health reports turnstile:false when the secret is missing', hOff.turnstile === false);
const hOn = await (await worker.fetch(new Request('https://startups.co.ke/api/health'), { ...guardEnv, TURNSTILE_SECRET: 'x' }, ctx)).json();
ok('health reports turnstile:true when the secret is set', hOn.turnstile === true);

// ---- listing feed: never cached by a browser, always fresh after a publish ----
// The zone's Browser Cache TTL is 4h and Cloudflare rewrites any positive
// max-age up to it, so a `max-age=60` feed reached browsers as 14400s and a
// new listing stayed invisible for hours. The feed must carry `no-store`,
// and a publish must invalidate the Worker's memo immediately.
globalThis.fetch = async (url) => {
  if (String(url).includes('/rest/v1/community_startups')) {
    return new Response(JSON.stringify([{ slug: 'alpha', name: 'Alpha', status: 'published', data: {} }]), {
      status: 200, headers: { 'content-type': 'application/json' },
    });
  }
  return new Response('[]', { status: 200, headers: { 'content-type': 'application/json' } });
};
const listEnv = { PUBLIC_SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'svc-test' };
const listRes = await worker.fetch(new Request('https://startups.co.ke/startups/community/list.json'), listEnv, ctx);
const listCc = listRes.headers.get('cache-control') || '';
ok('listing feed is no-store (a browser can never hold a stale copy)', listCc.includes('no-store'));
ok('listing feed has no positive max-age for the browser', !/max-age\s*=\s*[1-9]/.test(listCc));
ok('listing feed keeps an edge-only TTL header', !!listRes.headers.get('cloudflare-cdn-cache-control'));
const first = await (await worker.fetch(new Request('https://startups.co.ke/startups/community/list.json'), listEnv, ctx)).json();
ok('listing feed returns the published rows', first.count === 1 && first.startups[0].slug === 'alpha');
globalThis.fetch = realFetch;

// ---- newsletter send log: who has actually received an issue ----
// Without a send log there is no way to answer "who has not been emailed
// yet", so the desk keeps one and the brief sender writes to it.
const { recordSends, neverSentSubscribers } = await import('../worker/lib.mjs');
let inserted = [];
globalThis.fetch = async (url, init) => {
  const u = String(url);
  if (u.includes('/rest/v1/newsletter_sends') && init?.method === 'POST') {
    inserted = JSON.parse(init.body);
    return new Response('[]', { status: 201, headers: { 'content-type': 'application/json' } });
  }
  if (u.includes('/rest/v1/newsletter_sends')) {
    return new Response(JSON.stringify([
      { email: 'got@example.com', mode: 'list', status: 'sent' },
      { email: 'tested@example.com', mode: 'test', status: 'sent' },
      { email: 'replied@example.com', mode: 'reply', status: 'sent' },
    ]), { status: 200, headers: { 'content-type': 'application/json' } });
  }
  if (u.includes('/rest/v1/newsletter_subscribers')) {
    return new Response(JSON.stringify([
      { email: 'got@example.com' }, { email: 'tested@example.com' }, { email: 'waiting@example.com' },
      { email: 'replied@example.com' },
    ]), { status: 200, headers: { 'content-type': 'application/json' } });
  }
  return new Response('[]', { status: 200, headers: { 'content-type': 'application/json' } });
};
const logEnv = { PUBLIC_SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'svc-test' };
const n = await recordSends(logEnv, [{ email: 'Waiting@Example.com', issue: '2026-10-21-001', mode: 'list', status: 'sent' }]);
ok('recordSends writes one row per recipient', n === 1 && inserted.length === 1);
ok('recordSends lowercases the address', inserted[0].email === 'waiting@example.com');
const never = await neverSentSubscribers(logEnv);
ok('neverSent excludes subscribers who received a list issue', !never.includes('got@example.com'));
ok('neverSent keeps a test-send subscriber on the list', never.includes('tested@example.com'));
ok('neverSent keeps a replied-to subscriber on the list (a reply is not an issue)', never.includes('replied@example.com'));
ok('neverSent keeps a subscriber with no issue on the list', never.includes('waiting@example.com'));
globalThis.fetch = realFetch;

console.log('worker security unit checks done');
