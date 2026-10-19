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
 *
 * Uses @netlify/blobs in manual-credential mode (getStore({ siteID, token, name }))
 * — the supported write path, unlike the ad-hoc REST endpoint.
 */
import { getStore } from '@netlify/blobs';

const SITE_ID = process.env.NETLIFY_SITE_ID;
const TOKEN = process.env.NETLIFY_AUTH_TOKEN;
const [slugArg, actionArg] = process.argv.slice(2);

if (!SITE_ID || !TOKEN) {
  console.error('Set NETLIFY_AUTH_TOKEN and NETLIFY_SITE_ID (see header comments).');
  process.exit(1);
}

const store = getStore({ siteID: SITE_ID, token: TOKEN, name: 'community_startups' });

async function listAll() {
  // list() shape differs across @netlify/blobs generations — read {blobs}.
  const res = await store.list({ prefix: 's:' });
  const keys = (res?.blobs ?? []).map((b) => b.key).filter((k) => k && k.startsWith('s:'));
  if (!keys.length) {
    console.log('(no community listings found)');
    return;
  }
  for (const key of keys.sort()) {
    const r = await store.get(key, { type: 'json' }).catch(() => null);
    if (!r) { console.log(`${key.padEnd(42)} (unreadable)`); continue; }
    console.log(
      `${String(r.slug ?? key).padEnd(38)} ${String(r.name ?? '').padEnd(30).slice(0, 30)} ${r.status ?? '?'} ${r.source ?? ''}`,
    );
  }
}

async function setStatus(slug, status) {
  const rec = await store.get(`s:${slug}`, { type: 'json' });
  if (!rec) {
    console.error(`No listing at s:${slug} — run "node tools/remove_listing.mjs" to list all slugs.`);
    process.exit(1);
  }
  rec.status = status;
  await store.setJSON(`s:${slug}`, rec);
  console.log(`${slug} → status=${status} ✓`);
}

if (!slugArg || slugArg === 'list') await listAll();
else if (actionArg === 'restore') await setStatus(slugArg, 'published');
else await setStatus(slugArg, actionArg === 'list' ? 'published' : 'unlisted');
