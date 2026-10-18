/**
 * NETLIFY FUNCTION — GET /.netlify/functions/startup-list
 * Public JSON feed of founder-listed startups (published instantly).
 * Founder emails are NEVER included in public output (anti-scraping).
 * Served CDN-cached for 60s so bursts of Googlebot don't touch storage.
 */
import { getStore } from '@netlify/blobs';
import { json, listingKey } from './_lib.mjs';

export default async () => {
  const store = getStore('community_startups');
  const it = store.list({ prefix: 's:' });
  const out = [];
  for await (const b of it) {
    if (!b.key.startsWith('s:')) continue; // skip __rl: rate keys in odd stores
    const rec = await store.get(b.key, { type: 'json' });
    if (!rec || rec.status !== 'published') continue;
    out.push({
      slug: rec.slug,
      name: rec.name,
      tagline: rec.tagline,
      sector: rec.sector,
      stage: rec.stage,
      county: rec.county,
      website: rec.website,
      founderName: rec.founderName || null,
      logoUrl: rec.logoUrl || null,
      createdAt: rec.createdAt,
      source: rec.source,
    });
  }
  out.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  return json(200, { ok: true, count: out.length, startups: out }, {
    'Cache-Control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=86400',
    'Access-Control-Allow-Origin': '*',
  });
};
