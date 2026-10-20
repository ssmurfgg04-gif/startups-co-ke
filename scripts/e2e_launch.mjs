#!/usr/bin/env node
/**
 * Launch harness: proves the two things the product is for.
 *   1. a founder publishes a startup listing on their own (anonymous + signed in)
 *   2. they sign up / sign in and change THAT listing (edit, hide, republish)
 *
 * Runs against a local `wrangler dev` (base http://127.0.0.1:8787) or prod.
 * Writes real rows to the Supabase project the target Worker is configured with
 * and deletes them again at the end (only slugs it created).
 *
 *   node scripts/e2e_launch.mjs [--base http://127.0.0.1:8787] [--keep]
 */
import { readFileSync } from 'node:fs';

const args = process.argv.slice(2);
const base = (args.includes('--base') ? args[args.indexOf('--base') + 1] : 'http://127.0.0.1:8787').replace(/\/$/, '');
const keep = args.includes('--keep');
// With the Turnstile "always passes" test secret, any non-empty token verifies.
// A real prod run needs a token solved in a browser: pass it in QA_TURNSTILE_TOKEN.
const TS = process.env.QA_TURNSTILE_TOKEN || undefined;

const SB_URL = 'https://eezqpsbhmnhuhnmiwnsz.supabase.co';
const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlenFwc2JobW5odWhubWl3bnN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwNjQzMjgsImV4cCI6MjEwNzY0MDMyOH0.Ks8O3JMluiPxJuozW3CvgU-lsReS7qolo6WR4wO2fXM';

function serviceKey() {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) return process.env.SUPABASE_SERVICE_ROLE_KEY.trim();
  const txt = readFileSync(new URL('../.dev.vars', import.meta.url), 'utf8');
  const m = txt.match(/^\s*SUPABASE_SERVICE_ROLE_KEY\s*=\s*(.+)$/m);
  return m ? m[1].trim().replace(/^["']|["']$/g, '') : '';
}

const results = [];
const ok = (name, cond, extra = '') => {
  results.push({ name, pass: !!cond, extra });
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra ? `  (${extra})` : ''}`);
};

const j = async (r) => { try { return await r.json(); } catch { return {}; } };
const api = (p, init) => fetch(`${base}${p}`, init);
const ts = Date.now().toString(36);
const anonName = `QA Anon Harness ${ts}`;
const userEmail = `qa.launch.${ts}@startups.co.ke`;
const userPw = `Qa-${ts}-Launch!9`;

let anonSlug = '', userSlug = '', userId = '';
const created = [];

async function main() {
  const svc = serviceKey();
  const svcHeaders = { apikey: svc, Authorization: `Bearer ${svc}`, 'Content-Type': 'application/json' };

  const health = await j(await api('/api/health'));
  ok('health: storage reachable', health.storage === true, JSON.stringify(health));

  // --- 1a. anonymous publish (no account) ---
  const aRes = await api('/api/startup-create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: anonName,
      email: userEmail,
      website: 'https://qa.example.co.ke',
      tagline: 'Anonymous publish path check',
      description: 'Created by scripts/e2e_launch.mjs',
      county: 'Nairobi',
      sector: 'SaaS',
      stage: 'Seed',
      clientRef: `qa-anon-${ts}`,
      turnstile: TS,
    }),
  });
  const aOut = await j(aRes);
  anonSlug = aOut.slug || '';
  if (anonSlug) created.push(anonSlug);
  ok('anon publish: 200 + slug', aRes.status === 200 && !!anonSlug, `${aRes.status} ${anonSlug || aOut.error || ''}`);
  if (!anonSlug) return;

  // --- 1b. it renders instantly, by itself, with no approval ---
  const aPage = await api(`/startups/community/${anonSlug}`);
  const aHtml = await aPage.text();
  ok('anon listing page renders', aPage.status === 200 && aHtml.includes('Anonymous publish path check'));
  ok('anon listing tagged founder-submitted', /Founder-submitted/i.test(aHtml));
  ok('anon listing has nofollow outbound link', aHtml.includes('nofollow'));

  const listOut = await j(await api('/startups/community/list.json'));
  ok('anon listing in list.json', Array.isArray(listOut.startups) && listOut.startups.some((s) => s.slug === anonSlug));

  // --- 2. sign up (admin-confirmed so the flow is testable without a mailbox) ---
  const upRes = await fetch(`${SB_URL}/auth/v1/admin/users`, {
    method: 'POST', headers: svcHeaders,
    body: JSON.stringify({ email: userEmail, password: userPw, email_confirm: true }),
  });
  const upOut = await j(upRes);
  userId = upOut.id || '';
  ok('sign up: account created + email confirmed', upRes.status < 300 && !!userId, `${upRes.status}`);

  // --- 2b. sign in ---
  const tokRes = await fetch(`${SB_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: ANON, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: userEmail, password: userPw }),
  });
  const tokOut = await j(tokRes);
  const access = tokOut.access_token || '';
  ok('sign in: password grant returns a session', tokRes.status === 200 && !!access, `${tokRes.status} ${tokOut.error_description || tokOut.msg || ''}`);

  const auth = { 'Content-Type': 'application/json', Authorization: `Bearer ${access}` };
  const meOut = await j(await api('/api/my-listings', { headers: auth }));
  ok('my-listings: starts empty for a new account', meOut.ok === true && meOut.count === 0, JSON.stringify(meOut));

  // --- 2c. the anonymous listing is NOT silently owned ---
  const steal = await api('/api/listing-update', {
    method: 'POST', headers: auth,
    body: JSON.stringify({ slug: anonSlug, tagline: 'hijacked' }),
  });
  ok("cannot edit someone else's listing (404, not 403)", steal.status === 404, String(steal.status));

  // --- 3. signed-in publish: the listing belongs to the account ---
  const sRes = await api('/api/startup-create', {
    method: 'POST', headers: auth,
    body: JSON.stringify({
      name: `QA Owned Harness ${ts}`,
      email: userEmail,
      website: 'https://qa-owned.example.co.ke',
      tagline: 'Signed-in publish path check',
      description: 'Created by scripts/e2e_launch.mjs',
      county: 'Nairobi', sector: 'Fintech', stage: 'Pre-seed',
      clientRef: `qa-owned-${ts}`, turnstile: TS,
    }),
  });
  const sOut = await j(sRes);
  userSlug = sOut.slug || '';
  if (userSlug) created.push(userSlug);
  ok('signed-in publish: 200 + slug', sRes.status === 200 && !!userSlug, `${sRes.status} ${userSlug || sOut.error || ''}`);
  if (!userSlug) return;

  const mine = await j(await api('/api/my-listings', { headers: auth }));
  const mineRow = (mine.listings || []).find((l) => l.slug === userSlug);
  ok('my-listings: the new listing is under the account', !!mineRow && mineRow.status === 'published', `${mine.count} row(s)`);

  // --- 4. edit THAT listing ---
  const edited = 'Edited by its owner, tagline v2';
  const eRes = await api('/api/listing-update', {
    method: 'POST', headers: auth,
    body: JSON.stringify({
      slug: userSlug, name: `QA Owned Harness ${ts}`, email: userEmail,
      website: 'https://qa-owned.example.co.ke', tagline: edited,
      description: 'Edited by scripts/e2e_launch.mjs', county: 'Mombasa', sector: 'Fintech', stage: 'Seed',
    }),
  });
  ok('owner edit: 200', eRes.status === 200, String(eRes.status));
  const eHtml = await (await api(`/startups/community/${userSlug}`)).text();
  ok('edit is live immediately (no cache, no approval)', eHtml.includes(edited) && !eHtml.includes('Signed-in publish path check'));

  // --- 5. hide / republish ---
  const hRes = await api('/api/listing-update', { method: 'POST', headers: auth, body: JSON.stringify({ slug: userSlug, action: 'unlist' }) });
  const hOut = await j(hRes);
  const hiddenStatus = (await api(`/startups/community/${userSlug}`)).status;
  const hiddenList = await j(await api('/startups/community/list.json'));
  ok('hide: 200 + page 404 + out of list.json',
    hRes.status === 200 && hOut.status === 'unlisted' && hiddenStatus === 404 && !(hiddenList.startups || []).some((s) => s.slug === userSlug),
    `page ${hiddenStatus}`);

  const rRes = await api('/api/listing-update', { method: 'POST', headers: auth, body: JSON.stringify({ slug: userSlug, action: 'republish' }) });
  ok('republish: 200 + page back', rRes.status === 200 && (await api(`/startups/community/${userSlug}`)).status === 200);

  // --- 6. input hygiene on the way in ---
  const badRes = await api('/api/startup-create', {
    method: 'POST', headers: auth,
    body: JSON.stringify({ name: 'X', email: 'nope', website: 'http://insecure.example', tagline: 'no', clientRef: `qa-bad-${ts}`, turnstile: TS }),
  });
  const badOut = await j(badRes);
  ok('bad listing rejected with per-field errors', badRes.status === 422 && !!badOut.errors, JSON.stringify(badOut.errors || {}));
}

async function cleanup() {
  const svc = serviceKey();
  const svcHeaders = { apikey: svc, Authorization: `Bearer ${svc}` };
  if (!keep && created.length) {
    const inList = created.join(',');
    const r = await fetch(`${SB_URL}/rest/v1/community_startups?slug=in.(${encodeURIComponent(inList)})`, { method: 'DELETE', headers: svcHeaders });
    console.log(`cleanup: removed test listings -> ${r.status}`);
  } else if (created.length) {
    console.log(`kept test listings: ${created.join(', ')}`);
  }
  if (!keep && userId) {
    const r = await fetch(`${SB_URL}/auth/v1/admin/users/${userId}`, { method: 'DELETE', headers: svcHeaders });
    console.log(`cleanup: removed test account -> ${r.status}`);
  }
  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  if (failed.length) { console.log('failed:'); failed.forEach((f) => console.log(` - ${f.name} ${f.extra}`)); process.exitCode = 1; }
}

try { await main(); } catch (err) { ok('harness completed without throwing', false, String(err && err.message || err)); }
finally { await cleanup(); }
