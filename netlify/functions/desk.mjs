/**
 * NETLIFY FUNCTION — GET /desk (+ /desk/data) — the OWNER'S QUEUE.
 *
 * WHY: review submissions used to land in a Supabase table nobody could see
 * (RLS blocked anon reads, the notify email was never configured), so real
 * founder applications vanished. The queue now lives in Blobs (see
 * review-submit.mjs) and THIS page is the window into it — no email required.
 *
 * Auth: the desk mailbox (NOTIFY_EMAIL env, default jackblessed191@gmail.com)
 * must hold a valid Supabase magic-link session. Everyone else gets a
 * sign-in shell; there is no enumeration or data leak on failure (404).
 *
 * GET /desk       → HTML shell (self-contained sign-in + data fetch)
 * GET /desk/data  → JSON: review queue + community listings + newsletter count
 */
import { getStore } from '@netlify/blobs';
import { deskEmail, esc, json, verifyUser } from './_lib.mjs';

export const config = { path: ["/desk", "/desk/data"] };

const SB_URL = process.env.PUBLIC_SUPABASE_URL || 'https://eezqpsbhmnhuhnmiwnsz.supabase.co';
const SB_ANON = process.env.PUBLIC_SUPABASE_ANON_KEY
  || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlenFwc2JobW5odWhubWl3bnN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwNjQzMjgsImV4cCI6MjEwNzY0MDMyOH0.Ks8O3JMluiPxJuozW3CvgU-lsReS7qolo6WR4wO2fXM';

const NO_STORE = { 'Cache-Control': 'no-store' };

async function listStore(store, prefix) {
  try {
    const res = await store.list({ prefix });
    const keys = (res?.blobs ?? []).map((b) => b.key);
    const out = [];
    for (const key of keys) {
      const rec = await store.get(key, { type: 'json' }).catch(() => null);
      if (rec) out.push(rec);
    }
    return out;
  } catch {
    return [];
  }
}

async function deskData() {
  const queue = (await listStore(getStore('review_queue'), 'r:')).sort((a, b) =>
    String(b.createdAt).localeCompare(String(a.createdAt)));
  const listings = (await listStore(getStore('community_startups'), 's:'))
    .filter((r) => !r.slug?.startsWith('__'))
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  const subs = await listStore(getStore('newsletter'), 'n:');
  return { ok: true, desk: deskEmail(), queue, listings, subscribers: subs.length };
}

export default async (req) => {
  const url = new URL(req.url);

  // ---- data endpoint ----
  if (url.pathname === '/desk/data' && req.method === 'GET') {
    const user = await verifyUser(req);
    // Stealth: unauthorized gets 404 with no hint the page exists.
    if (!user || String(user.email).toLowerCase() !== deskEmail()) {
      return json(404, { ok: false, error: 'not found' }, NO_STORE);
    }
    const data = await deskData();
    return json(200, data, NO_STORE);
  }

  // ---- moderation actions (desk mailbox only) ----
  // unlist/restore/delete a community listing by slug; mark a queue item done.
  // Records are kept (except explicit delete) so removals stay auditable.
  if (url.pathname === '/desk/data' && req.method === 'POST') {
    const user = await verifyUser(req);
    if (!user || String(user.email).toLowerCase() !== deskEmail()) {
      return json(404, { ok: false, error: 'not found' }, NO_STORE);
    }
    let body;
    try { body = await req.json(); } catch { return json(400, { ok: false, error: 'invalid JSON' }, NO_STORE); }
    const action = String(body?.action ?? '');
    const slug = String(body?.slug ?? '').replace(/[^a-z0-9-]/gi, '').slice(0, 60);
    const id = String(body?.id ?? '').replace(/[^a-z0-9:-]/gi, '').slice(0, 60);
    try {
      if ((action === 'unlist' || action === 'restore' || action === 'delete') && slug) {
        const store = getStore('community_startups');
        const rec = await store.get(`s:${slug}`, { type: 'json' }).catch(() => null);
        if (!rec) return json(404, { ok: false, error: 'no such listing' }, NO_STORE);
        if (action === 'delete') await store.delete(`s:${slug}`);
        else {
          rec.status = action === 'unlist' ? 'unlisted' : 'published';
          rec.updatedAt = new Date().toISOString();
          await store.setJSON(`s:${slug}`, rec);
        }
        return json(200, { ok: true, action, slug }, NO_STORE);
      }
      if (action === 'done' && id) {
        const store = getStore('review_queue');
        const rec = await store.get(id, { type: 'json' }).catch(() => null);
        if (!rec) return json(404, { ok: false, error: 'no such record' }, NO_STORE);
        rec.status = 'done';
        rec.updatedAt = new Date().toISOString();
        await store.setJSON(id, rec);
        return json(200, { ok: true, action, id }, NO_STORE);
      }
      return json(422, { ok: false, error: 'unknown action' }, NO_STORE);
    } catch (err) {
      return json(500, { ok: false, error: String((err && err.message) || err).slice(0, 120) }, NO_STORE);
    }
  }

  // ---- HTML shell ----
  const html = `<!doctype html>
<html lang="en-KE">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>The desk — startups.co.ke</title>
<meta name="robots" content="noindex, nofollow" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="stylesheet" href="/fonts/fonts.css" />
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body { margin:0; background:#f6f3ea; color:#181712; font:15px/1.55 Archivo, system-ui, sans-serif; }
  .mono { font-family:"IBM Plex Mono", ui-monospace, monospace; }
  header { background:#14130e; color:#efead9; padding:14px 20px; display:flex; justify-content:space-between; gap:12px; align-items:center; }
  header .brand { font:600 11px/1 "IBM Plex Mono",monospace; letter-spacing:.14em; text-transform:uppercase; color:#efead9; text-decoration:none; }
  header .brand b { color:#e3a21a; }
  .wrap { max-width:960px; margin:0 auto; padding:22px 20px 60px; }
  h1 { font-family:Fraunces, Georgia, serif; font-weight:550; font-size:26px; margin:0 0 4px; }
  .mut { color:#5d5949; }
  .stats { display:flex; flex-wrap:wrap; gap:8px; margin:14px 0 22px; }
  .stat { border:1px solid #181712; padding:8px 12px; font:500 11px/1.4 "IBM Plex Mono",monospace; text-transform:uppercase; letter-spacing:.08em; background:#ede8d9; }
  .card { border:1px solid #181712; background:#fff; margin-bottom:14px; }
  .card-h { display:flex; flex-wrap:wrap; gap:6px 14px; justify-content:space-between; align-items:center; border-bottom:1px solid #d9d3c1; padding:10px 14px; background:#ede8d9; }
  .card-h .kind { font:600 11px/1 "IBM Plex Mono",monospace; text-transform:uppercase; letter-spacing:.1em; }
  .card-b { padding:12px 14px; font-size:14px; white-space:pre-wrap; word-break:break-word; }
  .tag { display:inline-block; border:1px solid #181712; padding:3px 7px; font:500 9px/1 "IBM Plex Mono",monospace; text-transform:uppercase; letter-spacing:.08em; }
  .tag.new { background:#96610a; color:#fff; border-color:#96610a; }
  button, .btnlink { font:500 11px/1 "IBM Plex Mono",monospace; text-transform:uppercase; letter-spacing:.1em; border:1px solid #181712; background:#181712; color:#f6f3ea; padding:0 14px; height:40px; cursor:pointer; }
  button.ghost { background:transparent; color:#181712; }
  button.danger { background:transparent; color:#8a1f11; border-color:#8a1f11; }
  button.act { height:30px; padding:0 10px; margin-left:6px; }
  button.act:disabled { opacity:.45; cursor:wait; }
  input { height:40px; border:1px solid #181712; padding:0 10px; font:14px Archivo, sans-serif; min-width:0; flex:1; }
  .row { display:flex; gap:8px; margin-top:12px; max-width:440px; flex-wrap:wrap; }
  .empty { border:1px dashed #96610a; padding:18px; color:#5d5949; }
  a { color:#96610a; }
</style>
</head>
<body>
<header>
  <a class="brand" href="/">startups<b>.co.ke</b> — the desk</a>
  <a class="mono" style="color:#a9a492;font-size:10px;text-transform:uppercase;letter-spacing:.1em;text-decoration:none" href="/">← Site</a>
</header>
<div class="wrap" id="app">
  <h1>Review queue</h1>
  <p class="mut" style="margin-top:0">Submissions from every form on the site — founder listings, claims, jobs, issues, newsletter. Loads only for the desk mailbox.</p>
  <div id="state" class="empty">Checking your session…</div>
</div>
<script>
  const SB = '${SB_URL}', KEY = '${SB_ANON}', LS = 'sb-eezqpsbhmnhuhnmiwnsz-auth-token';
  const esc = (s) => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');

  function tokenFromStorage() {
    try {
      const raw = JSON.parse(localStorage.getItem(LS) || 'null');
      if (!raw) return null;
      if (raw.access_token) return raw.access_token;
      if (raw.currentSession?.access_token) return raw.currentSession.access_token;
      if (Array.isArray(raw.sessions) && raw.sessions[0]?.access_token) return raw.sessions[0].access_token;
    } catch {}
    return null;
  }
  // Magic-link lands with #access_token=... — store it the way supabase-js would.
  function tokenFromHash() {
    if (!location.hash.includes('access_token')) return null;
    const h = new URLSearchParams(location.hash.slice(1));
    const at = h.get('access_token');
    if (at && h.get('expires_in')) {
      localStorage.setItem(LS, JSON.stringify({
        access_token: at, refresh_token: h.get('refresh_token'), token_type: 'bearer',
        expires_in: Number(h.get('expires_in')), expires_at: Date.now() + Number(h.get('expires_in')) * 1000,
        user: null,
      }));
    }
    history.replaceState(null, '', location.pathname);
    return at;
  }

  async function signIn(email) {
    const r = await fetch(SB + '/auth/v1/otp', {
      method: 'POST', headers: { apikey: KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, create_user: true, options: { email_redirect_to: location.origin + '/desk' } }),
    });
    return r.ok;
  }

  function shell(msg, withForm) {
    document.getElementById('state').innerHTML = msg + (withForm ? \`
      <div class="row"><input id="demail" type="email" placeholder="desk mailbox" autocomplete="email" />
      <button id="dgo">Send link</button></div>
      <p class="mut mono" style="font-size:10px;margin-top:8px">One link per address — check spam. Link works once, expires in 60 minutes.</p>\` : '');
    const go = document.getElementById('dgo');
    if (go) go.addEventListener('click', async () => {
      const em = (document.getElementById('demail').value || '').trim();
      if (!em.includes('@')) return;
      go.disabled = true; go.textContent = 'Sending…';
      const ok = await signIn(em);
      go.disabled = false; go.textContent = 'Send link';
      document.getElementById('state').innerHTML = ok
        ? 'Link sent to <b>' + esc(em) + '</b> — open it on this device, and this page loads the queue.'
        : 'Could not send the link. Try again in a minute.';
    });
  }

  async function loadData(tok) {
    const r = await fetch('/desk/data', { headers: { Authorization: 'Bearer ' + tok } });
    if (r.status === 404) { shell('Signed in, but this mailbox is not the desk mailbox. Sign in with the desk account.', true); return; }
    if (!r.ok) { shell('Queue unavailable (' + r.status + ') — try again shortly.', true); return; }
    const d = await r.json();
    render(d);
  }

  // Moderation actions — POST then refresh the view.
  document.addEventListener('click', async (e) => {
    const b = e.target.closest ? e.target.closest('[data-act]') : null;
    if (!b) return;
    const tok = tokenFromHash() || tokenFromStorage();
    if (!tok) return;
    const label = b.textContent;
    b.disabled = true; b.textContent = '…';
    try {
      const r = await fetch('/desk/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + tok },
        body: JSON.stringify({ action: b.dataset.act, slug: b.dataset.slug || undefined, id: b.dataset.id || undefined }),
      });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const fresh = await fetch('/desk/data', { headers: { Authorization: 'Bearer ' + tok } });
      if (fresh.ok) render(await fresh.json());
    } catch (err) {
      b.disabled = false; b.textContent = label;
      alert('Action failed (' + String(err.message || err) + ') — try again.');
    }
  });

  function render(d) {
    const st = document.getElementById('state');
    if (st) st.remove();
    document.querySelectorAll('#app .card, #app .stats, #app h1:not(:first-of-type), #app .empty').forEach((n) => n.remove());
    const qNew = d.queue.filter((r) => r.status === 'new').length;
    const pub = d.listings.filter((r) => r.status === 'published').length;
    let html = '<div class="stats">' +
      '<span class="stat">Queue: ' + d.queue.length + ' (' + qNew + ' new)</span>' +
      '<span class="stat">Listings: ' + pub + ' live / ' + d.listings.length + ' total</span>' +
      '<span class="stat">Newsletter: ' + d.subscribers + '</span></div>';
    if (!d.queue.length) html += '<div class="empty">Queue is empty — new submissions appear here the moment they happen.</div>';
    for (const r of d.queue) {
      const lines = Object.entries(r.payload || {}).filter(([, v]) => String(v ?? '').trim() !== '')
        .map(([k, v]) => '<b>' + esc(k) + ':</b> ' + esc(typeof v === 'string' ? v : JSON.stringify(v))).join('<br>');
      const done = r.status === 'new'
        ? '<button class="act ghost" data-act="done" data-id="' + esc(r.id) + '">Mark done</button>' : '';
      html += '<div class="card"><div class="card-h"><span class="kind">' + esc(r.label || r.kind) +
        (r.email ? ' · ' + esc(r.email) : '') + '</span><span><span class="tag ' + (r.status === 'new' ? 'new' : '') + '">' +
        esc(r.status || 'new') + '</span> <span class="mut mono" style="font-size:10px">' + esc(String(r.createdAt || '').slice(0, 16).replace('T', ' ')) + ' UTC</span>' + done + '</span></div>' +
        '<div class="card-b">' + (lines || '<span class="mut">(no details)</span>') + '</div></div>';
    }
    html += '<h1 style="margin-top:30px;font-size:20px">Founder listings</h1>';
    if (!d.listings.length) html += '<div class="empty">No community listings yet.</div>';
    for (const l of d.listings) {
      const acts = l.slug ? '<span>' + (l.status === 'published'
        ? '<button class="act ghost" data-act="unlist" data-slug="' + esc(l.slug) + '">Unlist</button>'
        : '<button class="act ghost" data-act="restore" data-slug="' + esc(l.slug) + '">Restore</button>') +
        '<button class="act danger" data-act="delete" data-slug="' + esc(l.slug) + '">Delete</button></span>' : '';
      html += '<div class="card"><div class="card-h"><span class="kind">' + esc(l.name) + '</span><span><span class="tag' +
        (l.status === 'published' ? ' new' : '') + '">' + esc(l.status || '?') + '</span> <span class="mut mono" style="font-size:10px">' +
        esc(String(l.createdAt || '').slice(0, 10)) + '</span>' + acts + '</span></div><div class="card-b">' +
        esc(l.tagline || '') + '<br><span class="mut">' + esc(l.sector || '') + ' · ' + esc(l.stage || '') + ' · ' + esc(l.county || '') +
        ' · ' + esc(l.website || '') + (l.founderName ? ' · founder ' + esc(l.founderName) : '') + '</span>' +
        (l.slug ? '<br><a href="/startups/community/' + esc(l.slug) + '">open page →</a>' : '') + '</div></div>';
    }
    document.getElementById('app').insertAdjacentHTML('beforeend', html);
  }

  (async () => {
    const tok = tokenFromHash() || tokenFromStorage();
    if (!tok) { shell('Desk access — sign in with the desk mailbox.', true); return; }
    // Token might be stale: probe; on 404 (auth fails → stealth 404) fall back to sign-in shell.
    const probe = await fetch('/desk/data', { headers: { Authorization: 'Bearer ' + tok } }).catch(() => null);
    if (probe && probe.ok) { render(await probe.json()); return; }
    shell('Session expired or this is not the desk mailbox. Sign in again.', true);
  })();
</script>
</body>
</html>`;

  return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8', ...NO_STORE } });
};
