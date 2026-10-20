// E2E — logo upload via Worker-brokered signed URL.
// Exercises the real endpoint + real Storage. Run against prod or wrangler dev:
//   node scripts/e2e_logo.mjs https://startups.co.ke
//   node scripts/e2e_logo.mjs http://localhost:8787
// Cleanup needs SUPABASE_SERVICE_ROLE_KEY in the env (optional; warns if absent).

const BASE = (process.argv[2] || 'http://localhost:8787').replace(/\/$/, '');
const SB = 'https://eezqpsbhmnhuhnmiwnsz.supabase.co';
const SB_ANON =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlenFwc2JobW5odWhubWl3bnN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwNjQzMjgsImV4cCI6MjEwNzY0MDMyOH0.Ks8O3JMluiPxJuozW3CvgU-lsReS7qolo6WR4wO2fXM';
const SVC = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
);

let pass = 0;
let fail = 0;
const ok = (name, cond, extra = '') => {
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${extra ? ` — ${extra}` : ''}`);
  cond ? pass++ : fail++;
};

async function post(path, body) {
  const r = await fetch(BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  let j = null;
  try { j = await r.json(); } catch { /* non-JSON */ }
  return { status: r.status, j };
}

console.log(`E2E logo upload against ${BASE}\n`);

// 1. valid mint
const m = await post('/api/logo-upload-url', { mime: 'image/png', size: PNG.length });
ok('mint valid png -> 200 ok', m.status === 200 && m.j?.ok === true, JSON.stringify(m.j));
ok('mint returns uploadUrl + path + publicUrl', Boolean(m.j?.uploadUrl && m.j?.path && m.j?.publicUrl));
ok('path is a bare uuid.ext (no bucket prefix)', /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.png$/.test(m.j?.path || ''), m.j?.path);

// 2 + 3. upload then read back
if (m.j?.uploadUrl) {
  const put = await fetch(m.j.uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'image/png', 'x-upsert': 'false' },
    body: PNG,
  });
  ok('signed PUT -> 200', put.status === 200, `http ${put.status}`);

  const get = await fetch(m.j.publicUrl);
  ok('public read -> 200 image/png', get.status === 200 && /image\/png/.test(get.headers.get('content-type') || ''), `http ${get.status}, ${get.headers.get('content-type')}`);
}

// 4. disallowed mime
const bad = await post('/api/logo-upload-url', { mime: 'text/html', size: 10 });
ok('disallowed mime -> 415', bad.status === 415, `http ${bad.status}`);

// 5. oversize (worker-side check)
const big = await post('/api/logo-upload-url', { mime: 'image/png', size: 5 * 1024 * 1024 });
ok('oversize -> 413', big.status === 413, `http ${big.status}`);

// 6. honeypot
const honey = await post('/api/logo-upload-url', { mime: 'image/png', size: 10, company_url: 'http://bot.example' });
ok('honeypot -> 200 honeypot', honey.status === 200 && honey.j?.honeypot === true);

// 7. anon key cannot write to the bucket directly (RLS / no policy)
const direct = await fetch(`${SB}/storage/v1/object/logos/e2e-${Date.now()}.png`, {
  method: 'POST',
  headers: { apikey: SB_ANON, Authorization: `Bearer ${SB_ANON}`, 'Content-Type': 'image/png', 'x-upsert': 'false' },
  body: PNG,
});
ok('direct anon upload blocked', direct.status >= 400, `http ${direct.status}`);

// 8. anon key cannot mint a signed URL
const anonSign = await fetch(`${SB}/storage/v1/object/upload/sign/logos/e2e-anon.png`, {
  method: 'POST',
  headers: { apikey: SB_ANON, Authorization: `Bearer ${SB_ANON}`, 'Content-Type': 'application/json' },
  body: '{}',
});
ok('anon cannot mint signed URL', anonSign.status >= 400, `http ${anonSign.status}`);

// cleanup
if (SVC && m.j?.path) {
  const del = await fetch(`${SB}/storage/v1/object/logos/${m.j.path}`, {
    method: 'DELETE',
    headers: { apikey: SVC, Authorization: `Bearer ${SVC}` },
  });
  ok('cleanup test object', del.status === 200, `http ${del.status}`);
} else if (!SVC) {
  console.log(`WARN cleanup skipped (no SUPABASE_SERVICE_ROLE_KEY); remove logos/${m.j?.path} manually`);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
