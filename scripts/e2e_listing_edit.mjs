// E2E — founder self-serve edit of their OWN community listing.
// Covers: signed-in create, my-listings auth, owner edit, hide/republish,
// non-owner + anon rejection. Run against wrangler dev or prod:
//   node scripts/e2e_listing_edit.mjs http://localhost:8787
//   node scripts/e2e_listing_edit.mjs https://startups.co.ke
//
// Needs SUPABASE_SERVICE_ROLE_KEY in the env (create users/rows + cleanup).

const BASE = (process.argv[2] || 'http://localhost:8787').replace(/\/$/, '');
const SB = process.env.SUPABASE_URL || 'https://eezqpsbhmnhuhnmiwnsz.supabase.co';
const ANON = process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlenFwc2JobW5odWhubWl3bnN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwNjQzMjgsImV4cCI6MjEwNzY0MDMyOH0.Ks8O3JMluiPxJuozW3CvgU-lsReS7qolo6WR4wO2fXM';
const SVC = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
if (!SVC) { console.error('SUPABASE_SERVICE_ROLE_KEY required'); process.exit(2); }

const stamp = Date.now().toString(36);
let pass = 0, fail = 0;
const ok = (name, cond, extra = '') => {
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${extra ? ` — ${extra}` : ''}`);
  cond ? pass++ : fail++;
};

async function sb(path, { method = 'GET', key = SVC, body } = {}) {
  const r = await fetch(SB + path, {
    method,
    headers: { apikey: key, Authorization: `Bearer ${key}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  let j = null; try { j = await r.json(); } catch { /* empty */ }
  return { status: r.status, j };
}

async function makeUser(tag) {
  const email = `startupsqa+${stamp}-${tag}@gmail.com`;
  const password = `Qa!${stamp}-${tag}-9zR`;
  const c = await sb('/auth/v1/admin/users', { method: 'POST', body: { email, password, email_confirm: true } });
  const id = c.j?.id || c.j?.user?.id;
  const t = await sb('/auth/v1/token?grant_type=password', { method: 'POST', key: ANON, body: { email, password } });
  return { email, id, token: t.j?.access_token || '' };
}

async function createListing(name, token, extra = {}) {
  const r = await fetch(BASE + '/api/startup-create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({
      name, website: `https://example-${stamp}.co.ke`, tagline: `QA listing ${stamp}`,
      email: `founder+${stamp}@gmail.com`, county: 'Nairobi', sector: 'SaaS', stage: 'Seed',
      description: 'created by e2e', founderName: 'QA Bot', ...extra,
    }),
  });
  return { status: r.status, j: await r.json().catch(() => ({})) };
}

async function update(payload, token) {
  const r = await fetch(BASE + '/api/listing-update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(payload),
  });
  return { status: r.status, j: await r.json().catch(() => ({})) };
}

async function myListings(token) {
  const r = await fetch(BASE + '/api/my-listings', { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  return { status: r.status, j: await r.json().catch(() => ({})) };
}

const pageStatus = async (slug) => (await fetch(`${BASE}/startups/community/${slug}`)).status;

console.log(`E2E listing edit against ${BASE}\n`);

// Repeatable runs: clear the QA rate-limit buckets (localhost dev + the
// tester's public IP when QA_RESET_IPS is passed). These rows only gate writes.
for (const ip of (process.env.QA_RESET_IPS || 'unknown,127.0.0.1').split(',').map((s) => s.trim()).filter(Boolean)) {
  await sb(`/rest/v1/rate_limits?ip=eq.${encodeURIComponent(ip)}`, { method: 'DELETE' });
}

const A = await makeUser('a');
const B = await makeUser('b');
ok('two test users created + signed in', Boolean(A.id && A.token && B.id && B.token));

// 1. signed-in create
const c1 = await createListing(`E2EEditA${stamp}`, A.token);
const slugA = c1.j?.slug;
ok('signed-in create -> 200 + slug', c1.status === 200 && Boolean(slugA), `http ${c1.status} slug=${slugA}`);
ok('created page is live (200)', (await pageStatus(slugA)) === 200);

// 2. my-listings: auth gate + ownership
const anonList = await myListings('');
ok('my-listings without token -> 401', anonList.status === 401, `http ${anonList.status}`);
const listA = await myListings(A.token);
ok('my-listings with token -> 200', listA.status === 200 && listA.j?.ok === true, `http ${listA.status}`);
ok('owner sees their listing', (listA.j?.listings || []).some((l) => l.slug === slugA));
const listB = await myListings(B.token);
ok('other user sees none of A\'s listings', !(listB.j?.listings || []).some((l) => l.slug === slugA));

// 3. owner edit
const NEW_TAGLINE = `Edited tagline ${stamp}`;
const e1 = await update({ slug: slugA, name: `E2EEditA${stamp}`, website: `https://example-${stamp}.co.ke`,
  tagline: NEW_TAGLINE, email: `founder+${stamp}@gmail.com`, county: 'Mombasa', sector: 'Fintech',
  stage: 'Series A', description: 'edited by e2e', founderName: 'QA Bot II' }, A.token);
ok('owner edit -> 200', e1.status === 200 && e1.j?.ok === true, `http ${e1.status} ${JSON.stringify(e1.j)}`);
const html = await (await fetch(`${BASE}/startups/community/${slugA}`)).text();
ok('public page reflects the edit', html.includes(NEW_TAGLINE));

// 4. validation is enforced on edit too
const bad = await update({ slug: slugA, name: 'x', website: 'not-a-url', tagline: '' }, A.token);
ok('invalid edit -> 422', bad.status === 422, `http ${bad.status}`);

// 5. hide / republish
const hide = await update({ slug: slugA, action: 'unlist' }, A.token);
ok('hide -> 200 unlisted', hide.status === 200 && hide.j?.status === 'unlisted', `http ${hide.status}`);
ok('hidden page returns 404', (await pageStatus(slugA)) === 404);
const show = await update({ slug: slugA, action: 'republish' }, A.token);
ok('republish -> 200 published', show.status === 200 && show.j?.status === 'published', `http ${show.status}`);
ok('republished page returns 200', (await pageStatus(slugA)) === 200);

// 6. non-owner + anon rejection (404, never confirm existence)
const byB = await update({ slug: slugA, name: 'Hijack', website: `https://example-${stamp}.co.ke`, tagline: 'hijacked attempt' }, B.token);
ok('non-owner edit -> 404', byB.status === 404, `http ${byB.status}`);
const byAnon = await update({ slug: slugA, name: 'Hijack', website: `https://example-${stamp}.co.ke`, tagline: 'hijacked attempt' });
ok('anon edit -> 401', byAnon.status === 401, `http ${byAnon.status}`);
const stillOk = await (await fetch(`${BASE}/startups/community/${slugA}`)).text();
ok('listing unchanged after hijack attempts', stillOk.includes(NEW_TAGLINE));

// 7. anon-created listing (no userId) cannot be self-edited by anyone.
//    Creates and edits share one per-IP bucket, so clear it first (the anon
//    cap is 5 and the edit assertions above already spent it).
for (const ip of (process.env.QA_RESET_IPS || 'unknown,127.0.0.1').split(',').map((s) => s.trim()).filter(Boolean)) {
  await sb(`/rest/v1/rate_limits?ip=eq.${encodeURIComponent(ip)}`, { method: 'DELETE' });
}
const cAnon = await createListing(`E2EAnon${stamp}`, '');
const slugAnon = cAnon.j?.slug;
ok('anon create -> 200 + slug', cAnon.status === 200 && Boolean(slugAnon), `http ${cAnon.status} slug=${slugAnon}`);
const editAnon = await update({ slug: slugAnon, name: `E2EAnon${stamp}`, website: `https://example-${stamp}.co.ke`, tagline: 'claim attempt here' }, A.token);
ok('anon listing not editable by others -> 404', editAnon.status === 404, `http ${editAnon.status} ${JSON.stringify(editAnon.j)}`);

// cleanup
console.log('\ncleanup…');
for (const slug of [slugA, slugAnon]) {
  if (slug) await sb(`/rest/v1/community_startups?slug=eq.${encodeURIComponent(slug)}`, { method: 'DELETE' });
}
for (const u of [A, B]) {
  if (u.id) await sb(`/auth/v1/admin/users/${u.id}`, { method: 'DELETE' });
}
console.log(`removed listings ${slugA}, ${slugAnon} and users ${A.id}, ${B.id}`);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
