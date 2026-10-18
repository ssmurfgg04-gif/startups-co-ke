/**
 * NETLIFY FUNCTION — GET /.netlify/functions/startup-page?slug=<slug>
 * Server-renders the public profile page for a founder-listed startup.
 * Rewritten from /startups/community/:slug via netlify.toml (status 200),
 * so the URL bar and canonical both show the clean path.
 *
 * ?format=md → text/markdown (the TrustMRR "AI-readable Markdown" pattern).
 *
 * Caching: CDN-cached 5 min + stale-while-revalidate 1 day — new listings
 * appear within 5 minutes, founder edits propagate quickly, and crawler
 * storms are absorbed by the edge, never by storage.
 */
import { getStore } from '@netlify/blobs';
import { json, listingKey, notFoundPage, renderMarkdown, renderPage } from './_lib.mjs';

const HTML_CACHE = 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400';

export default async (req) => {
  const url = new URL(req.url);
  const slug = String(url.searchParams.get('slug') || '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 64);
  const wantsMd = url.searchParams.get('format') === 'md';

  if (!slug) {
    return new Response(notFoundPage(''), {
      status: 404,
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=0, s-maxage=60', 'X-Robots-Tag': 'noindex' },
    });
  }

  const store = getStore('community_startups');
  let rec = await store.get(listingKey(slug), { type: 'json' }).catch(() => null);

  // Blobs are eventually consistent ACROSS regions: a just-written listing can
  // be invisible to a direct get() from another edge for a short while, while
  // list() replication sees it. Fall back to a prefix scan (tiny N) before 404.
  if (!rec) {
    const scan = await store.list({ prefix: listingKey(slug) }).catch(() => null);
    const hit = scan?.blobs?.find((b) => b.key === listingKey(slug))?.key;
    if (hit) rec = await store.get(hit, { type: 'json' }).catch(() => null);
  }

  if (!rec || rec.status !== 'published') {
    return new Response(notFoundPage(slug), {
      status: 404,
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=0, s-maxage=60', 'X-Robots-Tag': 'noindex' },
    });
  }

  if (wantsMd) {
    return new Response(renderMarkdown(rec, slug), {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Cache-Control': HTML_CACHE,
        'X-Robots-Tag': 'noindex',
      },
    });
  }

  return new Response(renderPage(rec, slug), {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': HTML_CACHE,
    },
  });
};
