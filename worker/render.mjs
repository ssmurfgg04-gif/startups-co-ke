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
    <p style="margin-top:8px"><a href="https://goodsaas.xyz/saas/startupscoke" target="_blank" rel="noopener" aria-label="startups.co.ke on goodSaaS"><img src="https://goodsaas.xyz/badge/startupscoke.svg?theme=dark" alt="startups.co.ke on goodSaaS" width="120" height="36" loading="lazy" decoding="async" style="vertical-align:middle" /></a></p>
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

/**
 * One-click unsubscribe landing page. Neutral on purpose: an invalid token
 * and an unknown address produce the same copy, so the endpoint leaks
 * nothing about who is on the list.
 */
export function unsubscribePage(state) {
  const copy = state === 'done'
    ? { h: 'You are unsubscribed.', p: 'The address has been removed from The Ecosystem Brief. Resubscribe any time at startups.co.ke.' }
    : state === 'error'
      ? { h: 'That did not go through.', p: 'A storage error got in the way. Please try the link again in a moment; if it keeps failing, the contact page has a form and a phone number.' }
      : { h: 'This link does not work.', p: 'The unsubscribe link is incomplete or was altered. The one in your email works: open the latest edition of The Ecosystem Brief and use its link. If it keeps failing, the contact page has a form and a phone number.' };
  return `<!doctype html>
<html lang="en-KE">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Unsubscribe | startups.co.ke</title>
<meta name="robots" content="noindex, nofollow" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<style>
  body { margin:0; background:#f6f3ea; color:#181712; font:16px/1.55 Archivo, system-ui, sans-serif; }
  .wrap { max-width:560px; margin:0 auto; padding:80px 20px; }
  h1 { font-family:Fraunces, Georgia, serif; font-size:30px; margin:0 0 10px; }
  p { color:#3e3b31; }
  .mono { font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:.14em; text-transform:uppercase; color:#5d5949; }
  .btn { display:inline-flex; align-items:center; min-height:44px; padding:0 18px; border:1px solid #181712; background:#181712; color:#f6f3ea; font:400 11px/1 'IBM Plex Mono',monospace; text-transform:uppercase; letter-spacing:.12em; text-decoration:none; margin-top:16px; }
  .btn.ghost { background:transparent; color:#181712; }
</style>
</head>
<body>
<div class="wrap">
  <p class="mono">startups.co.ke &middot; The Ecosystem Brief</p>
  <h1>${esc(copy.h)}</h1>
  <p>${esc(copy.p)}</p>
  <div style="display:flex;gap:10px;flex-wrap:wrap">
    <a class="btn" href="/">startups.co.ke</a>
    <a class="btn ghost" href="/contact">Contact</a>
  </div>
</div>
</body>
</html>`;
}

/**
 * GET /api/unsubscribe renders this confirmation shell and NEVER mutates.
 * Link prefetchers and mail scanners issue GETs on every link in an email, so
 * deletion only happens on a deliberate POST (also RFC 8058 one-click).
 */
export function unsubscribeConfirmPage(email, token) {
  const e = esc(String(email).toLowerCase());
  const q = `e=${encodeURIComponent(String(email).toLowerCase())}&amp;t=${encodeURIComponent(String(token))}`;
  return `<!doctype html>
<html lang="en-KE">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Unsubscribe | startups.co.ke</title>
<meta name="robots" content="noindex, nofollow" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<style>
  body { margin:0; background:#f6f3ea; color:#181712; font:16px/1.55 Archivo, system-ui, sans-serif; }
  .wrap { max-width:560px; margin:0 auto; padding:80px 20px; }
  h1 { font-family:Fraunces, Georgia, serif; font-size:30px; margin:0 0 10px; }
  p { color:#3e3b31; }
  .mono { font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:.14em; text-transform:uppercase; color:#5d5949; }
  .btn { display:inline-flex; align-items:center; min-height:44px; padding:0 18px; border:1px solid #181712; background:#181712; color:#f6f3ea; font:400 11px/1 'IBM Plex Mono',monospace; text-transform:uppercase; letter-spacing:.12em; text-decoration:none; margin-top:16px; cursor:pointer; }
  .btn.ghost { background:transparent; color:#181712; }
</style>
</head>
<body>
<div class="wrap">
  <p class="mono">startups.co.ke &middot; The Ecosystem Brief</p>
  <h1>Unsubscribe this address?</h1>
  <p>This removes <strong>${e}</strong> from The Ecosystem Brief. Nothing changes until you press the button.</p>
  <form method="POST" action="/api/unsubscribe?${q}">
    <button class="btn" type="submit">Yes, unsubscribe</button>
    <a class="btn ghost" href="/">Keep me subscribed</a>
  </form>
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
<script src="/vendor/supabase-js.js"></script>
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
  h2 { font-family:Fraunces, Georgia, serif; font-weight:550; font-size:20px; margin:30px 0 10px; }
  .mut { color:#5d5949; }
  .stats { display:flex; flex-wrap:wrap; gap:8px; margin:14px 0 22px; align-items:center; }
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
  button.act:disabled, button:disabled { opacity:.45; cursor:wait; }
  input, textarea { border:1px solid #181712; padding:0 10px; font:14px Archivo, sans-serif; min-width:0; }
  input { height:40px; flex:1; }
  textarea { width:100%; min-height:200px; padding:10px; margin-top:12px; resize:vertical; }
  .row { display:flex; gap:8px; margin-top:12px; max-width:440px; flex-wrap:wrap; }
  .row.wide { max-width:680px; }
  .empty { border:1px dashed #96610a; padding:18px; color:#5d5949; }
  a { color:#96610a; }
  .authbox { border:1px dashed #181712; background:#fff; padding:14px; margin-top:12px; max-width:480px; }
  .tab.on { background:#181712; color:#f6f3ea; }
  label.mlab { display:block; font:500 10px/1.6 "IBM Plex Mono",monospace; text-transform:uppercase; letter-spacing:.1em; color:#5d5949; }
  .msg { font-family:"IBM Plex Mono",monospace; font-size:10.5px; line-height:1.6; margin-top:8px; color:#5d5949; white-space:pre-wrap; }
  .msg.err { color:#8a1f11; }
  .msg.ok { color:#0e4630; }
  .prev { border:1px solid #181712; background:#fff; max-width:680px; margin-top:12px; }
  .prev .ph { border-bottom:1px solid #d9d3c1; background:#ede8d9; padding:8px 12px; font:500 10px/1.5 "IBM Plex Mono",monospace; text-transform:uppercase; letter-spacing:.08em; word-break:break-all; }
  .prev pre { margin:0; padding:14px; font:12.5px/1.6 ui-monospace, "IBM Plex Mono", monospace; white-space:pre-wrap; word-break:break-word; }
  details { margin-top:8px; font-size:13px; }
  summary { cursor:pointer; color:#96610a; }
  .checkline { display:flex; gap:8px; align-items:flex-start; margin-top:12px; max-width:680px; font-size:13px; }
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
  // Official Supabase JS SDK (vendored UMD build of @supabase/supabase-js v2).
  // All auth goes through documented APIs: signInWithPassword, signInWithOtp,
  // resetPasswordForEmail, updateUser, signOut. No hand-rolled token storage:
  // the SDK owns persistence, refresh and hash detection.
  var SB = '${SB}', KEY = '${KEY}';
  var RESET_MODE = location.pathname.replace(/\\/+$/, '') === '/desk/reset';
  var sb = window.supabase.createClient(SB, KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });

  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
  function setMsg(el, text, kind) { if (el) { el.textContent = text || ''; el.className = 'msg' + (kind ? ' ' + kind : ''); } }
  function errText(e) { return String((e && e.message) || e || 'unknown error'); }

  /* ---------------- sign-in shell ---------------- */
  function showSignIn(notice, noticeKind) {
    var st = $('state');
    st.innerHTML = (notice ? '<p class="msg ' + (noticeKind || '') + '">' + esc(notice) + '</p>' : '') +
      '<div class="authbox">' +
      '<div class="row" style="margin-top:0"><button type="button" id="tab-pass" class="ghost tab on">Password</button>' +
      '<button type="button" id="tab-link" class="ghost tab">Email me a link</button></div>' +
      '<div id="pane-pass">' +
      '<label class="mlab" for="pemail" style="margin-top:10px">Email</label><div class="row" style="margin-top:4px"><input id="pemail" type="email" autocomplete="email" placeholder="desk mailbox" style="max-width:280px" /></div>' +
      '<label class="mlab" for="ppass" style="margin-top:10px">Password</label>' +
      '<div class="row" style="margin-top:4px"><input id="ppass" type="password" autocomplete="current-password" placeholder="password" /><button type="button" id="pshow" class="ghost" style="height:40px">Show</button></div>' +
      '<div class="row"><button id="pgo">Sign in</button></div>' +
      '<p class="mut" style="font-size:12.5px;margin:12px 0 0">Forgot your password? <a href="#" id="recover">Email me a reset link</a>.</p>' +
      '<p id="pmsg" class="msg"></p></div>' +
      '<div id="pane-link" style="display:none">' +
      '<label class="mlab" for="demail" style="margin-top:10px">Email</label><div class="row" style="margin-top:4px"><input id="demail" type="email" autocomplete="email" placeholder="desk mailbox" style="max-width:280px" /><button id="dgo">Send link</button></div>' +
      '<p class="mut mono" style="font-size:10px;margin-top:8px">One-time sign-in link, works once, expires in 60 minutes. Check spam. Prefer the password tab next time.</p>' +
      '<p id="dmsg" class="msg"></p></div>' +
      '</div>';

    var tabP = $('tab-pass'), tabL = $('tab-link'), paneP = $('pane-pass'), paneL = $('pane-link');
    function tab(useP) {
      paneP.style.display = useP ? '' : 'none';
      paneL.style.display = useP ? 'none' : '';
      tabP.classList.toggle('on', useP); tabL.classList.toggle('on', !useP);
    }
    tabP.addEventListener('click', function () { tab(true); });
    tabL.addEventListener('click', function () { tab(false); });

    $('pshow').addEventListener('click', function () {
      var f = $('ppass'); f.type = f.type === 'password' ? 'text' : 'password';
      this.textContent = f.type === 'password' ? 'Show' : 'Hide';
    });

    $('pgo').addEventListener('click', async function () {
      var em = ($('pemail').value || '').trim(), pw = $('ppass').value || '';
      var m = $('pmsg');
      if (!em || !pw) { setMsg(m, 'Email and password are both required.', 'err'); return; }
      this.disabled = true; setMsg(m, 'Signing in…');
      var err = null;
      try { var r = await sb.auth.signInWithPassword({ email: em, password: pw }); err = r.error; } catch (e) { err = e; }
      this.disabled = false;
      if (err) {
        var s = errText(err);
        setMsg(m, /invalid login credentials/i.test(s)
          ? 'That email and password do not match. Never set a password? Use the reset link below, or the "Email me a link" tab once.'
          : /email not confirmed/i.test(s) ? 'This address is not confirmed yet. Use "Email me a link" to sign in once.'
          : /rate|too many/i.test(s) ? 'Too many attempts right now, wait a couple of minutes.' : 'Sign-in failed: ' + s, 'err');
        return;
      }
      setMsg(m, 'Signed in.', 'ok');
      loadDesk();
    });

    $('recover').addEventListener('click', async function (ev) {
      ev.preventDefault();
      var em = ($('pemail').value || '').trim();
      var m = $('pmsg');
      if (!em) { setMsg(m, 'Type the desk mailbox above first, then press this link.', 'err'); return; }
      setMsg(m, 'Sending reset link…');
      var err = null;
      try { var r = await sb.auth.resetPasswordForEmail(em, { redirectTo: location.origin + '/desk/reset' }); err = r.error; } catch (e) { err = e; }
      // Same message either way: never reveal whether the mailbox has an account.
      setMsg(m, err ? 'Could not send the reset email (' + errText(err) + ').' : 'If that address has an account, a password-reset link is on its way. Open it on this device; it lands on /desk/reset.', err ? 'err' : 'ok');
    });

    $('dgo').addEventListener('click', async function () {
      var em = ($('demail').value || '').trim();
      var m = $('dmsg');
      if (!em) { setMsg(m, 'Type the desk mailbox first.', 'err'); return; }
      this.disabled = true; setMsg(m, 'Sending…');
      var err = null;
      try { var r = await sb.auth.signInWithOtp({ email: em, options: { emailRedirectTo: location.origin + '/desk' } }); err = r.error; } catch (e) { err = e; }
      this.disabled = false;
      setMsg(m, err ? 'Could not send the link (' + errText(err) + '). Try again in a minute.' : 'Link sent to ' + em + ' — open it on this device and the queue loads here.', err ? 'err' : 'ok');
    });
  }

  /* ---------------- reset screen (/desk/reset) ---------------- */
  async function showReset() {
    var st = $('state');
    var sess = null;
    try { var r = await sb.auth.getSession(); sess = r.data && r.data.session; } catch (e) { sess = null; }
    if (!sess) {
      st.innerHTML = '<p class="msg err">This reset link is invalid, was already used, or has expired (links last about an hour).</p>' +
        '<div class="authbox"><label class="mlab" for="remail" style="margin-top:0">Request a fresh reset email</label>' +
        '<div class="row" style="margin-top:4px"><input id="remail" type="email" autocomplete="email" placeholder="desk mailbox" style="max-width:280px" /><button id="rego">Send reset link</button></div>' +
        '<p id="rmsg" class="msg"></p></div>';
      $('rego').addEventListener('click', async function () {
        var em = ($('remail').value || '').trim(); var m = $('rmsg');
        if (!em) { setMsg(m, 'Type the desk mailbox first.', 'err'); return; }
        setMsg(m, 'Sending…');
        var err = null;
        try { var r2 = await sb.auth.resetPasswordForEmail(em, { redirectTo: location.origin + '/desk/reset' }); err = r2.error; } catch (e) { err = e; }
        setMsg(m, err ? 'Could not send (' + errText(err) + ').' : 'If that address has an account, a fresh reset link is on its way.', err ? 'err' : 'ok');
      });
      return;
    }
    st.innerHTML = '<p class="msg ok">Reset link accepted — signed in for the next few minutes. Set the new password:</p>' +
      '<div class="authbox">' +
      '<label class="mlab" for="np1" style="margin-top:0">New password</label>' +
      '<div class="row" style="margin-top:4px"><input id="np1" type="password" autocomplete="new-password" placeholder="min 8 characters" /><button type="button" id="nshow" class="ghost" style="height:40px">Show</button></div>' +
      '<label class="mlab" for="np2" style="margin-top:10px">Repeat</label>' +
      '<div class="row" style="margin-top:4px"><input id="np2" type="password" autocomplete="new-password" placeholder="repeat password" /></div>' +
      '<div class="row"><button id="ngo">Save password</button></div><p id="nmsg" class="msg"></p></div>';
    $('nshow').addEventListener('click', function () {
      var f = $('np1'); f.type = f.type === 'password' ? 'text' : 'password';
      this.textContent = f.type === 'password' ? 'Show' : 'Hide';
    });
    $('ngo').addEventListener('click', async function () {
      var p1 = $('np1').value || '', p2 = $('np2').value || ''; var m = $('nmsg');
      if (p1.length < 8) { setMsg(m, 'Use at least 8 characters.', 'err'); return; }
      if (p1 !== p2) { setMsg(m, 'The two passwords do not match.', 'err'); return; }
      this.disabled = true; setMsg(m, 'Saving…');
      var err = null;
      try { var r = await sb.auth.updateUser({ password: p1 }); err = r.error; } catch (e) { err = e; }
      this.disabled = false;
      if (err) { setMsg(m, 'Could not save (' + errText(err) + '). If the link has expired, request a fresh one.', 'err'); return; }
      setMsg(m, 'Password saved. Sign in with it at /desk.', 'ok');
      try { await sb.auth.signOut(); } catch (e) {}
    });
  }

  /* ---------------- queue + brief ---------------- */
  async function loadDesk() {
    var st = $('state');
    var sess = null;
    try { var r = await sb.auth.getSession(); sess = r.data && r.data.session; } catch (e) { sess = null; }
    if (!sess) { showSignIn('Session expired — sign in again.'); return; }
    var res = await fetch('/desk/data', { headers: { Authorization: 'Bearer ' + sess.access_token } }).catch(function () { return null; });
    if (res && res.status === 404) { showSignIn('Signed in, but this mailbox is not the desk mailbox.'); return; }
    if (!res || !res.ok) { showSignIn('Queue unavailable (' + (res ? res.status : 'network') + ') — try again shortly.'); return; }
    var d = await res.json();
    render(d, sess);
  }

  document.addEventListener('click', async function (e) {
    var b = e.target.closest ? e.target.closest('[data-act]') : null;
    if (!b) return;
    var sess = null;
    try { var r = await sb.auth.getSession(); sess = r.data && r.data.session; } catch (err) { sess = null; }
    if (!sess) return;
    var label = b.textContent;
    b.disabled = true; b.textContent = '…';
    try {
      var act = await fetch('/desk/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + sess.access_token },
        body: JSON.stringify({ action: b.dataset.act, slug: b.dataset.slug || undefined, id: b.dataset.id || undefined }),
      });
      if (!act.ok) throw new Error('HTTP ' + act.status);
      loadDesk();
    } catch (err) {
      b.disabled = false; b.textContent = label;
      alert('Action failed (' + errText(err) + ') — try again.');
    }
  });

  function render(d, sess) {
    var st = $('state');
    if (st) st.remove();
    document.querySelectorAll('#app .card, #app .stats, #app h2, #app .empty').forEach(function (n) { n.remove(); });
    var qNew = d.queue.filter(function (r) { return r.status === 'new'; }).length;
    var pub = d.listings.filter(function (r) { return r.status === 'published'; }).length;
    var html = '<div class="stats">' +
      '<span class="stat">Queue: ' + d.queue.length + ' (' + qNew + ' new)</span>' +
      '<span class="stat">Listings: ' + pub + ' live / ' + d.listings.length + ' total</span>' +
      '<span class="stat">Newsletter: ' + d.subscribers + '</span>' +
      '<button id="signout" class="act ghost">Sign out</button></div>';

    // Who signed up but has never received an edition: the honest work list.
    var never = d.neverSent || [];
    html += '<h2>Never received an issue</h2>';
    if (!never.length) {
      html += '<div class="empty">Every subscriber has received at least one edition.</div>';
    } else {
      html += '<div class="card"><div class="card-h"><span class="kind">' + never.length +
        ' subscriber' + (never.length === 1 ? '' : 's') + ' waiting for a first edition</span></div>' +
        '<div class="card-b"><div class="mono" style="font-size:12px;word-break:break-all">' +
        never.map(function (e) { return esc(e); }).join('<br>') +
        '</div><p class="mut" style="margin:8px 0 0">Test sends do not count as an issue. A full-list send records every recipient here.</p></div></div>';
    }
    if (!d.queue.length) html += '<div class="empty">Queue is empty — new submissions appear here the moment they happen.</div>';
    d.queue.forEach(function (r) {
      var lines = Object.entries(r.payload || {}).filter(function (e) { return String(e[1] == null ? '' : e[1]).trim() !== ''; })
        .map(function (e) { return '<b>' + esc(e[0]) + ':</b> ' + esc(typeof e[1] === 'string' ? e[1] : JSON.stringify(e[1])); }).join('<br>');
      var done = r.status === 'new' ? '<button class="act ghost" data-act="done" data-id="' + esc(r.id) + '">Mark done</button>' : '';
      html += '<div class="card"><div class="card-h"><span class="kind">' + esc(r.label || r.kind) +
        (r.email ? ' · ' + esc(r.email) : '') + '</span><span><span class="tag ' + (r.status === 'new' ? 'new' : '') + '">' +
        esc(r.status || 'new') + '</span> <span class="mut mono" style="font-size:10px">' + esc(String(r.createdAt || '').slice(0, 16).replace('T', ' ')) + ' UTC</span>' + done + '</span></div>' +
        '<div class="card-b">' + (lines || '<span class="mut">(no details)</span>') + '</div></div>';
    });
    html += '<h2>Founder listings</h2>';
    if (!d.listings.length) html += '<div class="empty">No community listings yet.</div>';
    d.listings.forEach(function (l) {
      var acts = l.slug ? '<span>' + (l.status === 'published'
        ? '<button class="act ghost" data-act="unlist" data-slug="' + esc(l.slug) + '">Unlist</button>'
        : '<button class="act ghost" data-act="restore" data-slug="' + esc(l.slug) + '">Restore</button>') +
        '<button class="act danger" data-act="delete" data-slug="' + esc(l.slug) + '">Delete</button></span>' : '';
      html += '<div class="card"><div class="card-h"><span class="kind">' + esc(l.name) + '</span><span><span class="tag' +
        (l.status === 'published' ? ' new' : '') + '">' + esc(l.status || '?') + '</span> <span class="mut mono" style="font-size:10px">' +
        esc(String(l.createdAt || '').slice(0, 10)) + '</span>' + acts + '</span></div><div class="card-b">' +
        esc(l.tagline || '') + '<br><span class="mut">' + esc(l.sector || '') + ' · ' + esc(l.stage || '') + ' · ' + esc(l.county || '') +
        ' · ' + esc(l.website || '') + (l.founderName ? ' · founder ' + esc(l.founderName) : '') + '</span>' +
        (l.slug ? '<br><a href="/startups/community/' + esc(l.slug) + '">open page →</a>' : '') + '</div></div>';
    });

    html += '<h2>Desk account</h2>' +
      '<div class="card"><div class="card-h"><span class="kind">Change password</span></div>' +
      '<div class="card-b"><p class="mut" style="margin:0 0 4px">Applies immediately; the new password works on the Password tab at /desk.</p>' +
      '<div class="row"><input id="cpass" type="password" placeholder="new password (min 8 characters)" autocomplete="new-password" />' +
      '<input id="cpass2" type="password" placeholder="repeat password" autocomplete="new-password" />' +
      '<button id="cpassGo" class="ghost">Save password</button></div>' +
      '<p id="cpassMsg" class="msg"></p></div></div>';

    html += '<h2>The Ecosystem Brief</h2>' +
      '<div class="card"><div class="card-h"><span class="kind">Edition draft — fact-checked, lives in git (worker/brief.mjs)</span>' +
      '<span class="mut mono" style="font-size:10px" id="bMeta"></span></div>' +
      '<div class="card-b">' +
      '<p class="mut" style="margin:6px 0 0">Sender: <b id="bFrom"></b></p>' +
      '<p class="mut" style="margin:4px 0 0">Recipients: <b id="bCount"></b> <span id="bDedupe" class="mono" style="font-size:10px"></span></p>' +
      '<details id="bListWrap"><summary>Show the recipient list</summary><div id="bList" class="mono" style="font-size:11px;padding:6px 0;word-break:break-all"></div></details>' +
      '<label class="mlab" for="bSubject" style="margin-top:12px">Subject</label>' +
      '<div class="row wide" style="margin-top:4px"><input id="bSubject" /></div>' +
      '<label class="mlab" for="bBody" style="margin-top:12px">Body (plain text; the unsubscribe footer is appended per recipient at send time)</label>' +
      '<textarea id="bBody"></textarea>' +
      '<div class="row wide"><button id="bPreview" class="ghost">Preview</button></div>' +
      '<div id="bPrev" class="prev" style="display:none"></div>' +
      '<div class="row wide"><input id="bTestTo" placeholder="test send to one address" /><button id="bTest">Send test</button></div>' +
      '<p id="bTestMsg" class="msg"></p>' +
      '<div class="checkline"><input type="checkbox" id="bApprove" style="height:18px;width:18px;flex:0 0 auto;margin-top:2px" />' +
      '<label for="bApprove">I have reviewed the fact-checked preview and approve sending this edition to every subscriber listed above.</label></div>' +
      '<div class="row wide"><button id="bSend" disabled>Send to subscribers</button></div>' +
      '<p id="bMsg" class="msg"></p>' +
      '</div></div>';

    $('app').insertAdjacentHTML('beforeend', html);
    $('signout').addEventListener('click', async function () {
      try { await sb.auth.signOut(); } catch (e) {}
      location.href = '/desk';
    });

    $('cpassGo').addEventListener('click', async function () {
      var p1 = $('cpass').value || '', p2 = $('cpass2').value || ''; var m = $('cpassMsg');
      if (p1.length < 8) { setMsg(m, 'Use at least 8 characters.', 'err'); return; }
      if (p1 !== p2) { setMsg(m, 'The two passwords do not match.', 'err'); return; }
      this.disabled = true; setMsg(m, 'Saving…');
      var err = null;
      try { var r = await sb.auth.updateUser({ password: p1 }); err = r.error; } catch (e) { err = e; }
      this.disabled = false;
      setMsg(m, err ? 'Could not save (' + errText(err) + ').' : 'Password saved. Use it next time on the Password tab.', err ? 'err' : 'ok');
      if (!err) { $('cpass').value = ''; $('cpass2').value = ''; }
    });

    loadBrief(sess);
  }

  async function loadBrief(sess) {
    var r = await fetch('/desk/brief', { headers: { Authorization: 'Bearer ' + sess.access_token } }).catch(function () { return null; });
    if (!r || !r.ok) return;
    var b = await r.json();
    if (!b || !b.ok) return;
    $('bMeta').textContent = 'Edition #' + b.edition.id + ' · draft updated ' + b.edition.updatedAt;
    $('bFrom').textContent = b.edition.from;
    $('bCount').textContent = b.recipients.count + ' subscriber' + (b.recipients.count === 1 ? '' : 's');
    $('bDedupe').textContent = b.recipients.duplicates ? '(' + b.recipients.raw + ' raw, ' + b.recipients.duplicates + ' duplicate' + (b.recipients.duplicates === 1 ? '' : 's') + ' removed)' : '(no duplicates)';
    $('bList').textContent = b.recipients.list.join(' · ');
    $('bSubject').value = b.edition.subject;
    $('bBody').value = b.edition.body;
    $('bTestTo').value = b.testAddress;

    var prev = $('bPrev');
    $('bPreview').addEventListener('click', function () {
      if (prev.style.display !== 'none') { prev.style.display = 'none'; return; }
      var subject = ($('bSubject').value || '').trim();
      var body = $('bBody').value || '';
      var toList = ($('bTestTo').value || '').trim()
        ? 'test send → ' + ($('bTestTo').value || '').trim()
        : b.recipients.count + ' subscriber(s)';
      var links = (body.match(/https:\\/\\/[^\\s]+/g) || []);
      var sampleFooter = '————————————————\\nYou are receiving this because you subscribed at startups.co.ke.\\nUnsubscribe in one click, no questions asked:\\n' + (b.sampleFooterLink || '[per-recipient unsubscribe link]');
      prev.innerHTML =
        '<div class="ph">From: ' + esc(b.edition.from) + '</div>' +
        '<div class="ph">To: ' + esc(toList) + '</div>' +
        '<div class="ph">Subject: ' + esc(subject) + '</div>' +
        '<pre>' + esc(body) + '\\n\\n' + esc(sampleFooter) + '</pre>' +
        '<div class="ph">Links in this edition: ' + (links.length ? '' : 'none in body') + '</div>' +
        (links.length ? links.map(function (u) { return '<div class="ph" style="background:#fff;text-transform:none;letter-spacing:0"><a href="' + esc(u) + '" target="_blank" rel="noopener">' + esc(u) + '</a></div>'; }).join('') : '');
      prev.style.display = '';
    });

    var sendBtn = $('bSend'), appr = $('bApprove');
    appr.addEventListener('change', function () { sendBtn.disabled = !appr.checked; });
    sendBtn.addEventListener('click', async function () {
      var m = $('bMsg');
      if (!appr.checked) return;
      if (!confirm('Send to all ' + b.recipients.count + ' subscriber(s)? This is the real broadcast.')) return;
      this.disabled = true; setMsg(m, 'Sending to the list…');
      var out = null, net = null;
      try {
        var r2 = await fetch('/desk/brief-send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + sess.access_token },
          body: JSON.stringify({ subject: ($('bSubject').value || '').trim(), text: $('bBody').value, approve: true }),
        });
        out = await r2.json().catch(function () { return null; });
        if (!r2.ok) net = out && out.error ? out.error : 'HTTP ' + r2.status;
      } catch (e) { net = errText(e); }
      this.disabled = false;
      if (net) { setMsg(m, 'Not sent: ' + net, 'err'); return; }
      setMsg(m, 'Sent to ' + out.sent + ' recipient(s)' + (out.failed ? ', ' + out.failed + ' failed' : '') + '. A record is in the queue above.', 'ok');
    });

    $('bTest').addEventListener('click', async function () {
      var m = $('bTestMsg');
      var to = ($('bTestTo').value || '').trim();
      if (!to) { setMsg(m, 'Type a test address first.', 'err'); return; }
      this.disabled = true; setMsg(m, 'Sending test…');
      var out = null, net = null;
      try {
        var r2 = await fetch('/desk/brief-send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + sess.access_token },
          body: JSON.stringify({ subject: ($('bSubject').value || '').trim(), text: $('bBody').value, to: to }),
        });
        out = await r2.json().catch(function () { return null; });
        if (!r2.ok) net = out && out.error ? out.error : 'HTTP ' + r2.status;
      } catch (e) { net = errText(e); }
      this.disabled = false;
      if (net) { setMsg(m, 'Test not sent: ' + net, 'err'); return; }
      setMsg(m, 'Test sent to ' + to + ' (' + out.sent + ' sent' + (out.failed ? ', ' + out.failed + ' failed' : '') + '). Check delivery, formatting and the unsubscribe link.', 'ok');
    });
  }

  (async function () {
    // detectSessionInUrl consumes magic-link / recovery hashes automatically.
    var sess = null;
    try { var r = await sb.auth.getSession(); sess = r.data && r.data.session; } catch (e) { sess = null; }
    if (RESET_MODE) { await showReset(); return; }
    if (!sess) { showSignIn(); return; }
    loadDesk();
  })();
</script>
</body>
</html>`;
}
