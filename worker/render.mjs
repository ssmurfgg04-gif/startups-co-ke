/**
 * SERVER-RENDERED PAGES — community listing profile, 404, desk shell.
 * Copy is plain and human: short declaratives, no dashes-as-pauses, no hype.
 */
import { esc } from './lib.mjs';

export function renderMarkdown(l, slug) {
  const lines = [];
  lines.push(`# ${esc(l.name)}`);
  lines.push('');
  lines.push(`> ${esc(l.tagline)}`);
  lines.push('');
  lines.push(`- Website: ${esc(l.website)}`);
  if (l.sector) lines.push(`- Sector: ${esc(l.sector)}`);
  if (l.stage) lines.push(`- Stage: ${esc(l.stage)}`);
  if (l.county) lines.push(`- County: ${esc(l.county)}`);
  if (l.founderName) lines.push(`- Founder: ${esc(l.founderName)}`);
  lines.push(`- Listed: ${l.createdAt ? l.createdAt.slice(0, 10) : 'n/a'} (founder-submitted)`);
  lines.push(`- Status: Founder-submitted, published instantly, not yet verified against public sources`);
  if (l.description) { lines.push(''); lines.push(esc(l.description)); }
  lines.push('');
  lines.push(`Source: https://startups.co.ke/startups/community/${slug}`);
  return lines.join('\n');
}

export function renderPage(l, slug) {
  const md = `https://startups.co.ke/startups/community/${slug}?format=md`;
  const monogram = esc((l.name || '?').trim().slice(0, 2).toUpperCase());
  const title = `${esc(l.name)}: ${esc(l.sector)} startup in ${esc(l.county || 'Kenya')} | startups.co.ke`;
  const desc = esc((l.tagline || '').slice(0, 155));
  // JSON-LD: escape `<` as \u003c so raw user strings can never close the
  // script element or smuggle tags (standard JSON-LD hardening).
  const jsonld = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: l.name,
        url: l.website,
        description: l.tagline,
        ...(l.logoUrl ? { logo: l.logoUrl } : {}),
        address: { '@type': 'PostalAddress', addressLocality: l.county || 'Kenya', addressCountry: 'KE' },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://startups.co.ke/' },
          { '@type': 'ListItem', position: 2, name: 'Founder-listed startups', item: 'https://startups.co.ke/startups/community' },
          { '@type': 'ListItem', position: 3, name: l.name },
        ],
      },
    ],
  }).replace(/</g, '\\u003c');

  return `<!doctype html>
<html lang="en-KE">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title>
<meta name="description" content="${desc}" />
<link rel="canonical" href="https://startups.co.ke/startups/community/${esc(slug)}" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${desc}" />
<meta property="og:type" content="website" />
<meta name="robots" content="index, follow" />
<link rel="stylesheet" href="/fonts/fonts.css" />
<script type="application/ld+json">${jsonld}</script>
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body { margin:0; background:#f6f3ea; color:#181712; font:16px/1.55 Archivo, system-ui, sans-serif; }
  a { color:inherit; }
  .wrap { max-width:900px; margin:0 auto; padding:0 20px; }
  header.top { background:#14130e; color:#efead9; }
  header.top .wrap { display:flex; align-items:center; justify-content:space-between; padding-top:14px; padding-bottom:14px; }
  .brand { font:600 11px/1 "IBM Plex Mono", ui-monospace, monospace; letter-spacing:.14em; text-transform:uppercase; text-decoration:none; }
  .brand b { color:#e3a21a; }
  .back { font:400 11px/1 "IBM Plex Mono", ui-monospace, monospace; letter-spacing:.1em; text-transform:uppercase; color:#a9a492; text-decoration:none; }
  .back:hover { color:#efead9; }
  .mono { font-family:"IBM Plex Mono", ui-monospace, monospace; text-transform:uppercase; letter-spacing:.12em; font-size:10px; }
  .kicker { color:#5d5949; margin:28px 0 10px; }
  .card { border:2px solid #181712; background:#f6f3ea; box-shadow:8px 8px 0 rgba(20,19,14,.3); padding:32px; margin-bottom:32px; }
  h1 { font-family:Fraunces, Georgia, serif; font-weight:550; font-size:clamp(30px,5vw,44px); letter-spacing:-.02em; margin:10px 0 6px; line-height:1.05; }
  .tagline { font-size:17px; color:#3e3b31; max-width:640px; margin:0 0 18px; }
  .badges { display:flex; flex-wrap:wrap; gap:6px; margin:0 0 22px; }
  .chip { display:inline-flex; align-items:center; gap:6px; border:1px solid rgba(24,23,18,.6); padding:5px 8px; font:400 10px/1 "IBM Plex Mono", ui-monospace, monospace; text-transform:uppercase; letter-spacing:.08em; border-radius:2px; background:transparent; }
  .chip.fs { border-color:#96610a; background:#96610a; color:#181712; font-weight:600; }
  .desc { white-space:pre-line; color:#3e3b31; max-width:640px; }
  .row { display:flex; flex-wrap:wrap; gap:12px; align-items:center; margin-top:26px; }
  .btn { display:inline-flex; align-items:center; gap:8px; min-height:44px; padding:0 18px; border:1px solid #181712; background:#181712; color:#f6f3ea; font:400 11px/1 "IBM Plex Mono", ui-monospace, monospace; text-transform:uppercase; letter-spacing:.12em; text-decoration:none; }
  .btn:hover { background:#3e3b31; }
  .btn.ghost { background:transparent; color:#181712; }
  .btn.ghost:hover { background:#ede8d9; }
  .meta { margin-top:26px; border-top:1px solid #d9d3c1; padding-top:14px; display:flex; flex-wrap:wrap; gap:8px 22px; color:#5d5949; }
  .logo { width:64px; height:64px; object-fit:contain; border:1px solid #d9d3c1; background:#fff; padding:6px; }
  .mono-tile { width:64px; height:64px; display:flex; align-items:center; justify-content:center; border:1px solid #d9d3c1; background:#ede8d9; font:600 20px Fraunces, Georgia, serif; }
  .head { display:flex; gap:18px; align-items:flex-start; }
  footer { border-top:1px solid #d9d3c1; margin-top:8px; }
  footer .wrap { padding:22px 20px 40px; color:#5d5949; font-size:13px; }
  footer a { color:#96610a; }
  .cta { border:1px dashed #96610a; padding:18px; margin:0 0 28px; display:flex; flex-wrap:wrap; gap:12px; justify-content:space-between; align-items:center; }
  @media (prefers-reduced-motion: no-preference) { a, .btn { transition: background-color .15s ease, color .15s ease; } }
</style>
</head>
<body>
<header class="top">
  <div class="wrap">
    <a class="brand" href="/">startups<b>.co.ke</b></a>
    <a class="back" href="/startups/community">&larr; Founder-listed startups</a>
  </div>
</header>
<main class="wrap">
  <p class="kicker mono">Founder-listed &middot; published instantly &middot; not yet verified</p>
  <div class="cta">
    <span style="font-size:14px;color:#3e3b31;max-width:460px">Built something in Kenya? Your own profile page can be live in about three minutes, free.</span>
    <a class="btn" href="/startups/community">List your startup, free</a>
  </div>
  <article class="card">
    <div class="head">
      ${l.logoUrl ? `<img class="logo" src="${esc(l.logoUrl)}" alt="${esc(l.name)} logo" width="64" height="64" />` : `<div class="mono-tile" aria-hidden="true">${monogram}</div>`}
      <div>
        <h1>${esc(l.name)}</h1>
        <p class="tagline">${esc(l.tagline)}</p>
        <div class="badges">
          <span class="chip fs">Founder-submitted</span>
          ${l.sector ? `<span class="chip">${esc(l.sector)}</span>` : ''}
          ${l.stage ? `<span class="chip">${esc(l.stage)}</span>` : ''}
          ${l.county ? `<span class="chip">${esc(l.county)}</span>` : ''}
        </div>
      </div>
    </div>
    ${l.description ? `<p class="desc">${esc(l.description)}</p>` : ''}
    <div class="row">
      <a class="btn" href="${esc(l.website)}" rel="nofollow ugc noopener" target="_blank">Visit website &nearr;</a>
      <a class="btn ghost" href="${md}">Markdown version</a>
    </div>
    <div class="meta">
      ${l.founderName ? `<span>Founder: <strong>${esc(l.founderName)}</strong></span>` : ''}
      <span>Listed ${esc((l.createdAt || '').slice(0, 10) || 'n/a')}</span>
      <span>Spotted a problem? <a href="https://startups.co.ke/contact">Report an issue</a></span>
    </div>
  </article>
</main>
<footer>
  <div class="wrap">
    <p><strong style="color:#3e3b31">Honesty note:</strong> this page is founder-submitted and was published immediately, without editorial review. It stays tagged &ldquo;Founder-submitted&rdquo; until the desk cross-checks it against at least two independent public sources. Figures are self-reported. Fake or misleading listings can be reported via <a href="https://startups.co.ke/contact">the contact page</a>.</p>
    <p><a href="https://startups.co.ke/">startups.co.ke</a>: Kenya's startup record, kept in the open. <a href="https://startups.co.ke/llms.txt">llms.txt</a></p>
  </div>
</footer>
</body>
</html>`;
}

export function notFoundPage(slug) {
  return `<!doctype html>
<html lang="en-KE">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Startup not found | startups.co.ke</title>
<meta name="robots" content="noindex, follow" />
<link rel="stylesheet" href="/fonts/fonts.css" />
<style>
  body { margin:0; background:#f6f3ea; color:#181712; font:16px/1.55 Archivo, system-ui, sans-serif; }
  .wrap { max-width:640px; margin:0 auto; padding:80px 20px; text-align:center; }
  h1 { font-family:Fraunces, Georgia, serif; font-size:34px; margin:0 0 10px; }
  p { color:#5d5949; }
  .btn { display:inline-flex; align-items:center; min-height:44px; padding:0 18px; border:1px solid #181712; background:#181712; color:#f6f3ea; font:400 11px/1 "IBM Plex Mono", monospace; text-transform:uppercase; letter-spacing:.12em; text-decoration:none; margin-top:18px; }
</style>
</head>
<body>
<div class="wrap">
  <p class="mono" style="font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase">404 &middot; No founder listing at this address</p>
  <h1>Nothing listed here${slug ? ` for &ldquo;${esc(slug)}&rdquo;` : ''}.</h1>
  <p>The listing may have been removed, or the address is mistyped. If it was published seconds ago, give it a few seconds and retry. The verified company index is a good place to land instead.</p>
  <a class="btn" href="https://startups.co.ke/startups">Browse the company index</a>
</div>
</body>
</html>`;
}

export function deskHtml(env) {
  const SB = esc(String(env.PUBLIC_SUPABASE_URL || 'https://eezqpsbhmnhuhnmiwnsz.supabase.co'));
  const KEY = esc(String(env.PUBLIC_SUPABASE_ANON_KEY || ''));
  return `<!doctype html>
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
  <a class="mono" style="color:#a9a492;font-size:10px;text-transform:uppercase;letter-spacing:.1em;text-decoration:none" href="/">&larr; Site</a>
</header>
<div class="wrap" id="app">
  <h1>Review queue</h1>
  <p class="mut" style="margin-top:0">Submissions from every form on the site: founder listings, claims, jobs, issues, newsletter. Loads only for the desk mailbox.</p>
  <div id="state" class="empty">Checking your session…</div>
</div>
<script>
  const SB = '${SB}', KEY = '${KEY}', LS = 'sb-eezqpsbhmnhuhnmiwnsz-auth-token';
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
  // Magic link lands with #access_token=... — store it the way supabase-js does.
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
      <p class="mut mono" style="font-size:10px;margin-top:8px">One link per address. Check spam. The link works once and expires in 60 minutes.</p>\` : '');
    const go = document.getElementById('dgo');
    if (go) go.addEventListener('click', async () => {
      const em = (document.getElementById('demail').value || '').trim();
      if (!em.includes('@')) return;
      go.disabled = true; go.textContent = 'Sending…';
      const ok = await signIn(em);
      go.disabled = false; go.textContent = 'Send link';
      document.getElementById('state').innerHTML = ok
        ? 'Link sent to <b>' + esc(em) + '</b> — open it on this device and the queue loads here.'
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

  // Moderation actions: POST, then refresh the view.
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
    // The token might be stale: probe; on 404 (auth fails, stealth 404) fall back to the sign-in shell.
    const probe = await fetch('/desk/data', { headers: { Authorization: 'Bearer ' + tok } }).catch(() => null);
    if (probe && probe.ok) { render(await probe.json()); return; }
    shell('Session expired or this is not the desk mailbox. Sign in again.', true);
  })();
</script>
</body>
</html>`;
}
