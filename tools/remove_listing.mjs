#!/usr/bin/env node
/**
 * Remove (or restore) a founder-listed startup from Netlify Blobs.
 *
 * Usage:
 *   NETLIFY_AUTH_TOKEN=nf_... NETLIFY_SITE_ID=<site-id> node tools/remove_listing.mjs <slug> [list|remove|restore]
 *
 *   list     → show all community listings (slug · name · status)   (default when no slug)
 *   remove   → set status=unlisted (keeps the record, page 404s)    (default with slug)
 *   restore  → set status=published again
 *
 * Env (from Netlify UI → User settings → Applications → Personal access token):
 *   NETLIFY_AUTH_TOKEN  required
 *   NETLIFY_SITE_ID     required (Site → Site settings → API → Site ID)
 */
const SITE_ID = process.env.NETLIFY_SITE_ID;
const TOKEN = process.env.NETLIFY_AUTH_TOKEN;
const [slugArg, actionArg] = process.argv.slice(2);

if (!SITE_ID || !TOKEN) {
  console.error('Set NETLIFY_AUTH_TOKEN and NETLIFY_SITE_ID (see header comments).');
  process.exit(1);
}

const API = `https://api.netlify.com/api/v1`;
const headers = { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' };

const siteRes = await fetch(`${API}/sites/${SITE_ID}`, { headers });
if (!siteRes.ok) { console.error(`Site lookup failed: ${siteRes.status}`); process.exit(1); }
const site = await siteRes.json();

// Blobs API: list + read + write metadata via the site's blob store endpoint.
const STORE = 'community_startups';

async function listAll() {
  const res = await fetch(`${API}/sites/${SITE_ID}/blobs/stores/${STORE}/entries`, { headers });
  if (!res.ok) {
    console.error(`Blob list failed (${res.status}). Note: the Blobs REST API may not be enabled for this site — alternatively remove listings from the Supabase-backed review flow or ask the desk.`);
    process.exit(1);
  }
  const j = await res.json();
  for (const e of j.entries ?? []) {
    if (!e.key.startsWith('s:')) continue;
    const r = JSON.parse(e.value ?? '{}');
    console.log(`${e.key.padEnd(40)} ${String(r.name ?? '').padEnd(28)} ${r.status ?? '?'}`);
  }
}

async function setStatus(slug, status) {
  const key = `s:${slug}`;
  const get = await fetch(`${API}/sites/${SITE_ID}/blobs/stores/${STORE}/entries/${encodeURIComponent(key)}`, { headers });
  if (!get.ok) { console.error(`Read failed: ${get.status} — is the slug right?`); process.exit(1); }
  const rec = await get.json();
  const recObj = typeof rec.value === 'string' ? JSON.parse(rec.value) : (rec.value ?? rec);
  recObj.status = status;
  const put = await fetch(`${API}/sites/${SITE_ID}/blobs/stores/${STORE}/entries/${encodeURIComponent(key)}`, {
    method: 'PUT', headers, body: JSON.stringify(recObj),
  });
  console.log(put.ok ? `${slug} → status=${status} ✓` : `Update failed: ${put.status}`);
}

if (!slugArg) await listAll();
else if (actionArg === 'restore') await setStatus(slugArg, 'published');
else await setStatus(slugArg, actionArg === 'list' ? 'published' : 'unlisted');
