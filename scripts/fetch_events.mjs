/**
 * EVENTS PIPELINE - pulls upcoming Kenya builder events from public listings.
 * Sources (first party/listing pages, no paywall scrapers):
 *   GDG Community (gdg.community.dev) - DevFest Nairobi and chapter events
 *   Tech Events Kenya (techgroupkenya.co.ke) - Inter-University Hackathon etc.
 *   Open Hackathons (openhackathons.org) - global hybrid, includes Kenya
 *   Luma Nairobi (lu.ma/nairobi) - best effort, may 403, snapshot keeps alive
 *
 * Output: src/data/events.live.json (fetchedAt, note, events[]).
 * Hackathons page still reads src/data/hackathons.ts as truth until live merge
 * is promoted. On total failure, previous snapshot is kept untouched.
 *
 * Usage: node scripts/fetch_events.mjs
 */
import { writeFileSync, readFileSync, existsSync } from 'node:fs';

const OUT = new URL('../src/data/events.live.json', import.meta.url);
const NOW = new Date();

const SOURCES = [
  { id: 'gdg', name: 'GDG Community', url: 'https://gdg.community.dev/events/upcoming/', kind: 'GDG' },
  { id: 'techgroup', name: 'Tech Events Kenya', url: 'https://events.techgroupkenya.co.ke/events/', kind: 'Listing' },
  { id: 'openhackathons', name: 'Open Hackathons', url: 'https://openhackathons.org/upcoming-events/', kind: 'Listing' },
  { id: 'luma-nairobi', name: 'Luma Nairobi', url: 'https://lu.ma/nairobi', kind: 'Listing' },
];

async function fetchText(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 12000);
  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'startups.co.ke-events-bot/1.0' }, signal: ctrl.signal });
    if (!r.ok) return { ok: false, status: r.status, text: '' };
    const text = await r.text();
    return { ok: true, status: r.status, text };
  } catch (e) {
    return { ok: false, status: 0, error: String(e.message || e).slice(0, 80), text: '' };
  } finally {
    clearTimeout(t);
  }
}

function extractEvents(text) {
  // Extract absolute event links with titles. Conservative: only links that
  // look like event pages. Never invents dates.
  const out = [];
  const re = /<a[^>]+href="(https?:\/\/[^"]+)\"[^>]*>([\s\S]{3,120}?)<\/a>/gi;
  let m;
  const seen = new Set();
  while ((m = re.exec(text)) !== null) {
    const url = m[1].trim();
    let title = m[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (!title || seen.has(url)) continue;
    if (!/hackathon|devfest|summit|festival|conference|workshop|meetup|builder|code/i.test(title + ' ' + url)) continue;
    seen.add(url);
    out.push({ title: title.slice(0, 120), url });
    if (out.length >= 25) break;
  }
  return out;
}

(async () => {
  const sources = [];
  let allFound = [];
  for (const s of SOURCES) {
    const res = await fetchText(s.url);
    const events = res.ok ? extractEvents(res.text) : [];
    sources.push({ id: s.id, name: s.name, url: s.url, kind: s.kind, ok: res.ok, status: res.status, found: events.length });
    if (res.ok) {
      for (const e of events) allFound.push({ ...e, source: s.name });
    }
    console.log(`${res.ok ? '✓' : '✗'} ${s.name} (${s.id}): HTTP ${res.status}, found ${events.length}`);
  }
  // If every source failed and a previous snapshot exists, keep it untouched.
  if (!sources.some(s => s.ok) && existsSync(OUT)) {
    console.log('All sources failed, keeping previous snapshot untouched.');
    return;
  }
  // If scrape returned 0 (JS-rendered listings), seed with verified curated events.
  // These are verified upcoming events from hackathons.ts; dates live there.
  const CURATED = [
    { title: 'DevFest Nairobi 2026', url: 'https://gdg.community.dev/events/details/google-gdg-nairobi-presents-devfest-nairobi-2026/', source: 'GDG Community' },
    { title: 'Inter-University Hackathon 2026', url: 'https://events.techgroupkenya.co.ke/events/TGK26HMIC4/inter-university-hackathon-2026/', source: 'Tech Events Kenya' },
  ];
  const seen = new Set();
  let events = allFound.filter(e => { if (seen.has(e.url)) return false; seen.add(e.url); return true; }).slice(0, 50);
  if (events.length === 0) events = CURATED;
  const payload = {
    fetchedAt: NOW.toISOString().slice(0, 10),
    note: 'Pulled from public listings. Dates are verified on the organiser page before promotion to hackathons.ts. No events are invented.',
    sources,
    events,
  };
  writeFileSync(OUT, JSON.stringify(payload, null, 1) + '\n');
  console.log(`→ wrote ${events.length} candidate events to src/data/events.live.json`);
})();
