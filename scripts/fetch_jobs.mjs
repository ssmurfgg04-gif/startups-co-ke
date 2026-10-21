/**
 * LIVE JOBS PIPELINE — pulls open roles from employers' own ATS boards at
 * build/deploy time and normalises them to the LiveJob shape.
 *
 * Sources (all first-party employer boards, no scrapers of third parties):
 *   Lever      api.lever.co/v0/postings/{co}
 *   Greenhouse boards-api.greenhouse.io/v1/boards/{co}/jobs
 *   Workable   apply.workable.com/api/v1/widget/accounts/{co}
 *   BambooHR   {sub}.bamboohr.com/careers/list
 *   Ashby      api.ashbyhq.com/posting-api/board/{co}   (may 401 on some IPs;
 *              committed snapshot keeps the board alive when blocked)
 *
 * Honesty rules (docs/DECISIONS.md D2):
 *   - Kenya filter: role must be Kenya-based (location contains Kenya/Nairobi)
 *     or Remote at a Kenyan-HQ company.
 *   - No salary is invented — live rows carry no salary figures.
 *   - `fetchedAt` + per-source status are recorded and shown in the UI.
 *   - On total failure the previous committed snapshot is kept untouched.
 *
 * Usage: node scripts/fetch_jobs.mjs
 */
import { writeFileSync, readFileSync, existsSync } from 'node:fs';

const OUT = new URL('../src/data/jobs.live.json', import.meta.url);
const NOW = new Date();
const daysSince = (ms) => (ms ? Math.max(0, Math.round((NOW.getTime() - ms) / 86400000)) : null);

// company resolution: tracked companies + board-only employers
const COMPANY_MAP = {
  // tracked profiles (src/data/companies.ts)
  apolloagriculture: { lever: 'apolloagriculture', companyId: 'apollo', hq: 'kenya' },
  mkopagh: null, // placeholder guard
  // board-only employers (verified live boards, not tracked profiles)
  moniepoint: { greenhouse: 'moniepoint', companyId: 'moniepoint', hq: 'nigeria' },
  tala: { lever: 'tala', companyId: 'tala', hq: 'us' },
  branch: { greenhouse: 'branch', companyId: 'branch', hq: 'us' },
};

const SOURCES = [
  // { id, board, company (display), companyId, hq, api }
  { id: 'apollo', board: 'Lever', company: 'Apollo Agriculture', companyId: 'apollo', hq: 'kenya', lever: 'apolloagriculture' },
  { id: 'tala', board: 'Lever', company: 'Tala', companyId: 'tala', hq: 'us', lever: 'tala' },
  { id: 'moniepoint', board: 'Greenhouse', company: 'Moniepoint', companyId: 'moniepoint', hq: 'nigeria', greenhouse: 'moniepoint' },
  { id: 'branch', board: 'Greenhouse', company: 'Branch', companyId: 'branch', hq: 'us', greenhouse: 'branch' },
  { id: 'cellulant', board: 'Workable', company: 'Cellulant', companyId: 'cellulant', hq: 'kenya', workable: 'cellulant' },
  { id: 'pula', board: 'Workable', company: 'Pula', companyId: 'pula', hq: 'kenya', workable: 'pula' },
  { id: 'marketforce', board: 'Workable', company: 'MarketForce', companyId: 'marketforce', hq: 'kenya', workable: 'marketforce' },
  { id: 'roam', board: 'Workable', company: 'Roam', companyId: 'roam', hq: 'kenya', workable: 'roam' },
  { id: 'tanda', board: 'Workable', company: 'Tanda', companyId: 'tanda', hq: 'kenya', workable: 'tanda' },
  { id: 'basigo', board: 'BambooHR', company: 'BasiGo', companyId: 'basigo', hq: 'kenya', bamboohr: 'basigo' },
  { id: 'mkopa', board: 'Ashby', company: 'M-KOPA', companyId: 'm-kopa', hq: 'kenya', ashby: 'M-KOPA' },
  // Added Oct 2026 after a board-by-board sweep of every ATS Kenya employers
  // publish on. Each slug below was verified to return live Kenya roles.
  { id: 'chaingpt', board: 'Workable', company: 'ChainGPT', companyId: 'chaingpt', hq: 'kenya', workable: 'chaingpt' },
  { id: 'openfn', board: 'Workable', company: 'OpenFn', companyId: 'openfn', hq: 'kenya', workable: 'openfn' },
  { id: 'fairmoney', board: 'Workable', company: 'FairMoney', companyId: 'fairmoney', hq: 'kenya', workable: 'fairmoney' },
  { id: 'ajaia', board: 'Workable', company: 'AJAIA', companyId: 'ajaia', hq: 'kenya', workable: 'ajaia' },
  { id: 'distro', board: 'Lever', company: 'Distro', companyId: 'distro', hq: 'kenya', lever: 'distro' },
  // Global employers: their boards carry no Kenya-based roles, but they do
  // hire in Africa, so they are tracked with the "africa" scope and labelled
  // as Africa-wide on the board instead of being dropped.
  { id: 'microsoft', board: 'Microsoft Careers', company: 'Microsoft', companyId: 'microsoft', hq: 'us', scope: 'africa', microsoft: true },
  { id: 'apple', board: 'Apple Careers', company: 'Apple', companyId: 'apple', hq: 'us', scope: 'africa', apple: true },
];

const CATEGORY_RULES = [
  ['Engineering', /engineer|developer|backend|frontend|fullstack|devops|sre|architect|software|mobile|infrastructure|technical|it\b|engineering/i],
  ['Data', /data|analyst|analytics|machine learning|ml\b|ai\b|scientist/i],
  ['Design', /design|ux\b|ui\b|brand/i],
  ['Product', /product manager|product|pm\b/i],
  ['Growth', /growth|marketing|sales|content|commercial|revenue|customer|telesales|retail/i],
  ['Executive', /\bhead\b|chief|director|vp\b|lead people|general manager|president/i],
  ['Operations', /operations|ops\b|finance|credit|risk|people|hr\b|talent|legal|audit|compliance|support|quality|admin|workplace|procurement|supply/i],
];

function classify(title) {
  for (const [cat, re] of CATEGORY_RULES) if (re.test(title)) return cat;
  return 'Other';
}

/** African countries we accept for the "Africa-wide" scope: a role based in
 *  one of these is relevant to Kenyan candidates even when it is not a
 *  Kenya-based role. Kept as a name list, not a package, so the rule is
 *  readable in one place. */
const AFRICA = [
  'Algeria', 'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi', 'Cameroon', 'Cape Verde',
  'Central African Republic', 'Chad', 'Comoros', 'Congo', 'Democratic Republic of the Congo', "Cote d'Ivoire",
  "Cote d'Ivoire", 'Djibouti', 'Egypt', 'Equatorial Guinea', 'Eritrea', 'Eswatini', 'Ethiopia', 'Gabon',
  'Gambia', 'Ghana', 'Guinea', 'Guinea-Bissau', 'Kenya', 'Lesotho', 'Liberia', 'Libya', 'Madagascar',
  'Malawi', 'Mali', 'Mauritania', 'Mauritius', 'Morocco', 'Mozambique', 'Namibia', 'Niger', 'Nigeria',
  'Rwanda', 'Sao Tome and Principe', 'Senegal', 'Seychelles', 'Sierra Leone', 'Somalia', 'South Africa',
  'South Sudan', 'Sudan', 'Tanzania', 'Togo', 'Tunisia', 'Uganda', 'Zambia', 'Zimbabwe',
];

/** Is this role anchored in Africa? Used by the Africa-wide scope. */
function africaRelevant(location) {
  const l = String(location || '').toLowerCase();
  return AFRICA.some((c) => l.includes(c.toLowerCase()));
}

function modeOf(location, workplace) {
  const w = (workplace || '').toLowerCase();
  if (w.includes('remote')) return 'Remote';
  if (w.includes('hybrid')) return 'Hybrid';
  if (w.includes('on-site') || w.includes('onsite') || w.includes('on site')) return 'On-site';
  return '—';
}

/** Keep Kenya-based roles. Remote roles pass only when the location string is
 *  Kenya-specific or generic ("Remote"/"Global") — a "Lagos · Remote" ad at a
 *  Kenyan-HQ company is a Nigeria hire, not a Kenya hire, and we don't guess. */
function kenyaRelevant(location, mode, hq) {
  const l = String(location || '').toLowerCase();
  const inKenya = /kenya|nairobi/.test(l);
  // non-specific locations only (no other city/country named)
  const generic = !l.trim() || /^(remote|global|anywhere|multiple|flexible|work from home)([ ,;+]|$)/.test(l) || /^\+ \d+ more$/.test(l);
  const remoteEligible = mode === 'Remote' || /remote|anywhere/.test(l);
  return inKenya || (generic && remoteEligible && hq === 'kenya');
}

function cleanLocation(loc) {
  if (!loc) return 'Kenya';
  let s = String(loc).replace(/\s*;\s*/g, '; ').trim();
  // collapse long multi-city lists to the head + count
  const parts = s.split(';').map((p) => p.trim()).filter(Boolean);
  if (parts.length > 3) {
    const ke = parts.find((p) => /kenya|nairobi/i.test(p)) || parts[0];
    return `${ke} + ${parts.length - 1} more`;
  }
  return s;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function j(url, opts = {}) {
  const res = await fetch(url, {
    ...opts,
    headers: { 'User-Agent': 'startups.co.ke jobs board (+https://startups.co.ke)', Accept: 'application/json', ...(opts.headers || {}) },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

const fetchers = {
  async lever(src) {
    const d = await j(`https://api.lever.co/v0/postings/${src.lever}?mode=json`);
    return (Array.isArray(d) ? d : []).map((p) => ({
      title: p.text,
      location: p.categories?.location || '',
      workplace: p.workplaceType || '',
      createdAt: p.createdAt,
      url: p.hostedUrl || p.applyUrl,
      tags: p.categories?.team ? [p.categories.team] : [],
    }));
  },
  async greenhouse(src) {
    const d = await j(`https://boards-api.greenhouse.io/v1/boards/${src.greenhouse}/jobs?content=false`);
    return (d.jobs || []).map((p) => ({
      title: p.title,
      location: p.location?.name || '',
      workplace: '',
      createdAt: p.updated_at ? Date.parse(p.updated_at) : null,
      url: p.absolute_url,
      tags: p.metadata?.length ? [] : [],
    }));
  },
  async workable(src) {
    const d = await j(`https://apply.workable.com/api/v1/widget/accounts/${src.workable}?details=true`);
    return (d.jobs || []).map((p) => ({
      title: p.title,
      location: [p.city, p.country].filter(Boolean).join(', ') || (p.remote ? 'Remote' : ''),
      workplace: p.remote ? 'Remote' : '',
      createdAt: p.published_on ? Date.parse(p.published_on) : null,
      url: p.url,
      tags: [],
    }));
  },
/**
   * Microsoft (apply.careers.microsoft.com). Their board is a client-rendered
   * app; the JSON behind it is api/pcsx/search, which filters server-side by
   * a location string ("Nigeria", "South Africa", "Remote"). Africa-wide
   * scope: the roles are based in an African country.
   */
  async microsoft(src) {
    const out = [];
    const seen = new Set();
    for (const loc of AFRICA) {
      // The API rate-limits hard (429): pace the calls and retry with backoff
      // so one busy country never costs us the whole pass.
      for (let attempt = 0; attempt < 4; attempt++) {
        await sleep(attempt === 0 ? 2500 : 12000);
        try {
          const d = await j(
            `https://apply.careers.microsoft.com/api/pcsx/search?domain=microsoft.com&query=&location=${encodeURIComponent(loc)}&start=0&limit=25`,
            { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; startups.co.ke jobs board)' } },
          );
          const positions = d?.data?.positions || [];
          for (const p of positions) {
            if (seen.has(p.id)) continue;
            seen.add(p.id);
            out.push({
              title: p.name,
              location: (p.locations || []).join('; '),
              workplace: '',
              createdAt: p.postedTs ? p.postedTs * 1000 : null,
              url: `https://apply.careers.microsoft.com/careers/job/${p.id}`,
              tags: p.department ? [p.department] : [],
            });
          }
          break;
        } catch (err) {
          if (attempt === 3) console.log(`  MS ${loc}: ${String(err.message || err)}`);
        }
      }
    }
    return out;
  },

  /**
   * Apple (jobs.apple.com). Their search page ships its results inside a
   * hydration JSON blob, and the board filters by country. Africa-wide
   * scope: a role whose posting location is an African country.
   */
  async apple(src) {
    const out = [];
    const seen = new Set();
    // Resolve each African country to Apple's own location id, then read
    // that country's rows straight from the search page.
    for (const country of AFRICA) {
      let loc = null;
      try {
        const d = await j(`https://jobs.apple.com/api/v1/refData/postlocation?input=${encodeURIComponent(country)}`);
        const hit = (d?.res || []).find((x) => String(x.name || '').toLowerCase() === country.toLowerCase());
        if (hit) loc = hit;
      } catch { /* no id for this country */ }
      if (!loc) continue;
      const slug = `${String(loc.urlName || loc.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${loc.code}`;
      try {
        const res = await fetch(`https://jobs.apple.com/en-us/search?location=${encodeURIComponent(slug)}`, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; startups.co.ke jobs board)' },
          signal: AbortSignal.timeout(20000),
        });
        const html = await res.text();
        const m = html.match(/window\.__staticRouterHydrationData\s*=\s*JSON\.parse\("(.*?)"\);/s);
        if (!m) continue;
        const search = JSON.parse(JSON.parse('"' + m[1] + '"'))?.loaderData?.search || {};
        for (const row of search.searchResults || []) {
          if (seen.has(row.positionId)) continue;
          seen.add(row.positionId);
          const locs = row.locations || [];
          out.push({
            title: row.postingTitle,
            location: locs.map((l) => l.city || l.name).filter(Boolean).join('; ') || country,
            workplace: row.homeOffice ? 'Remote' : '',
            createdAt: null,
            url: `https://jobs.apple.com/en-us/details/${row.positionId}/${String(row.transformedPostingTitle || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
            tags: row.team?.teamCode ? [row.team.teamCode] : [],
          });
        }
      } catch { /* skip this country */ }
    }
    return out;
  },


  async bamboohr(src) {
    const d = await j(`https://${src.bamboohr}.bamboohr.com/careers/list`);
    return (d.result || []).map((p) => ({
      title: p.title,
      location: [p.city, p.state, p.country].filter(Boolean).join(', ') || p.departmentLabel || '',
      workplace: '',
      createdAt: null,
      url: `https://${src.bamboohr}.bamboohr.com/careers/${p.id}`,
      tags: p.departmentLabel ? [p.departmentLabel] : [],
    }));
  },
  async ashby(src) {
    const d = await j(`https://api.ashbyhq.com/posting-api/board/${src.ashby}?includeCompensation=false`);
    return (d.jobs || []).map((p) => ({
      title: p.title,
      location: p.location,
      workplace: p.isRemote ? 'Remote' : '',
      createdAt: p.publishedAt ? Date.parse(p.publishedAt) : null,
      url: p.jobUrl || p.applyUrl,
      tags: p.department ? [p.department] : [],
    }));
  },
};

/** Link-check every apply URL; drop listings that are CONFIRMED dead (404/410).
 *  Ambiguous failures (timeouts, 403 bot-walls, 5xx) keep the listing — a bot
 *  check blocking our build IP must not silently empty the board. This is what
 *  retired the SunCulture careers link and an expired Apollo listing (audit). */
async function checkLinks(jobs) {
  const CHECK_CONCURRENCY = 6;
  const queue = [...jobs];
  const dead = new Set();
  let ambiguous = 0;
  const worker = async () => {
    while (queue.length) {
      const job = queue.shift();
      const check = async (method, extraHeaders) => {
        const res = await fetch(job.applyUrl, {
          method,
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; startups.co.ke link check)', ...extraHeaders },
          redirect: 'follow',
          signal: AbortSignal.timeout(10000),
        });
        try { if (method === 'GET') res.body?.cancel(); } catch {}
        return res.status;
      };
      try {
        let status = await check('HEAD', {});
        if (status === 405 || status === 403 || status >= 500) status = await check('GET', { Range: 'bytes=0-512' });
        if (status === 404 || status === 410) dead.add(job.id);
      } catch {
        ambiguous++;
      }
    }
  };
  await Promise.all(Array.from({ length: CHECK_CONCURRENCY }, worker));
  const kept = jobs.filter((j) => !dead.has(j.id));
  return { kept, checked: jobs.length, dropped: jobs.length - kept.length, ambiguous };
}

async function main() {
  const sources = [];
  const jobs = [];

  for (const src of SOURCES) {
    const key = Object.keys(fetchers).find((k) => src[k]);
    try {
      if (!key) throw new Error('no fetcher');
      const rows = await fetchers[key](src);
      let kept = 0;
      for (const r of rows) {
        const mode = modeOf(r.location, r.workplace);
        // Scope decides what counts. "kenya" (default) = a role based in
        // Kenya or open to Kenyan candidates. "africa" = a role based in an
        // African country (Microsoft, Apple): kept, but labelled Africa-wide
        // on the board so nobody mistakes it for a Kenya job.
        const africa = src.scope === 'africa';
        const ok = africa ? africaRelevant(r.location) : kenyaRelevant(r.location, mode, src.hq);
        if (!ok) continue;
        kept++;
        jobs.push({
          id: `${src.id}-${String(r.title).toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 48)}`,
          title: r.title,
          companyId: src.companyId,
          location: cleanLocation(r.location),
          mode,
          category: classify(r.title),
          postedDays: daysSince(r.createdAt),
          applyUrl: r.url,
          board: src.board,
          scope: africa ? 'africa' : 'kenya',
          tags: r.tags,
        });
      }
      sources.push({ id: src.id, company: src.company, board: src.board, count: rows.length, kept, ok: true, scope: src.scope || 'kenya' });
      console.log(`✓ ${src.company} (${src.board}): ${rows.length} roles, ${kept} ${src.scope === 'africa' ? 'Africa-based' : 'Kenya-relevant'}`);
    } catch (err) {
      sources.push({ id: src.id, company: src.company, board: src.board, count: 0, kept: 0, ok: false, error: String(err.message || err) });
      console.log(`✗ ${src.company} (${src.board}): ${err.message || err}`);
    }
  }

  // Ashby browser snapshot fallback (used when the API is IP-blocked)
  const snapPath = new URL('../research/mkopa_ashby.json', import.meta.url);
  const mk = sources.find((s) => s.id === 'mkopa');
  if (mk && !mk.ok && existsSync(snapPath)) {
    try {
      const snap = JSON.parse(readFileSync(snapPath, 'utf8'));
      let kept = 0;
      for (const r of snap) {
        const mode = modeOf(r.details, '');
        const loc = String(r.details || '').split('•')[1]?.trim() || '';
        if (!kenyaRelevant(loc, /remote/i.test(r.details || '') ? 'Remote' : '—', 'kenya')) continue;
        kept++;
        jobs.push({
          id: `mkopa-${String(r.title).toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 48)}`,
          title: r.title,
          companyId: 'm-kopa',
          location: cleanLocation(loc),
          mode: /remote/i.test(r.details || '') ? 'Remote' : /hybrid/i.test(r.details || '') ? 'Hybrid' : 'On-site',
          category: classify(r.title),
          postedDays: null,
          applyUrl: r.url,
          board: 'Ashby',
          tags: ['Ashby snapshot'],
        });
      }
      mk.ok = true;
      mk.count = snap.length;
      mk.kept = kept;
      mk.note = 'via committed browser snapshot (API blocked from build IP)';
      console.log(`✓ M-KOPA (Ashby snapshot): ${snap.length} roles, ${kept} Kenya-relevant`);
    } catch (e) {
      console.log(`✗ Ashby snapshot unusable: ${e.message}`);
    }
  }

  const prev = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : null;
  const totalOk = sources.filter((s) => s.ok).length;

  if (totalOk === 0 && prev) {
    console.log('!! all sources failed — keeping previous snapshot');
    return;
  }

  // Link-check: retire listings whose application URL is confirmed dead.
  const lc = await checkLinks(jobs);
  if (lc.dropped > 0) console.log(`✂ link check: dropped ${lc.dropped} dead listing(s) of ${lc.checked}${lc.ambiguous ? ` (${lc.ambiguous} ambiguous, kept)` : ''}`);

  const out = {
    fetchedAt: NOW.toISOString().slice(0, 10),
    note: 'Pulled from employers\u2019 own ATS boards. No salaries are invented for live rows. Application links checked every pull; confirmed-dead listings drop automatically.',
    linkCheck: { checked: lc.checked, dropped: lc.dropped, ambiguous: lc.ambiguous },
    sources,
    jobs: lc.kept,
  };
  writeFileSync(OUT, JSON.stringify(out, null, 1) + '\n');
  console.log(`→ wrote ${lc.kept.length} live jobs from ${totalOk}/${sources.length} sources to src/data/jobs.live.json`);
}

main().catch((e) => {
  console.error('pipeline error:', e);
  // keep previous snapshot on catastrophic failure
  process.exit(0);
});
