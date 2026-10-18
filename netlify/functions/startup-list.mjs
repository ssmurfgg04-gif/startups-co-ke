/**
 * NETLIFY FUNCTION — GET /.netlify/functions/startup-list
 * Public JSON feed of founder-listed startups (published instantly).
 * Founder emails are NEVER included in public output (anti-scraping).
 * Served CDN-cached for 60s so bursts of Googlebot don't touch storage.
 */
import { getStore } from '@netlify/blobs';
import { json, listingKey } from './_lib.mjs';

// Claim the clean feed URL directly (Functions API v2 path management).
export const config = { path: "/startups/community/list.json" };

export default async () => {
  try {
    const store = getStore('community_startups');
    // list() shape differs across @netlify/blobs generations: never assume the
    // async-iterable form — read the {blobs:[{key}]} result object (works on
    // both old and new runtimes).
    const res = await store.list({ prefix: 's:' });
    const keys = (res?.blobs ?? []).map((b) => b.key).filter((k) => k && k.startsWith('s:'));
    const out = [];
    for (const key of keys) {
      const rec = await store.get(key, { type: 'json' }).catch(() => null);
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
  } catch (err) {
    return json(500, { ok: false, error: String((err && err.message) || err) }, {
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
    });
  }
};
