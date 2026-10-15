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

function modeOf(location, workplace) {
  const w = (workplace || '').toLowerCase();
  if (w.includes('remote')) return 'Remote';
  if (w.includes('hybrid')) return 'Hybrid';
  if (w.includes('on-site') || w.includes('onsite') || w.includes('on site')) return 'On-site';
  return '—';
}

/** Keep Kenya-based roles; keep Remote (stated anywhere in location/workplace) at Kenyan-HQ companies. */
function kenyaRelevant(location, mode, hq) {
  const l = `${location || ''} ${mode === 'Remote' ? 'remote' : ''}`.toLowerCase();
  const inKenya = /kenya|nairobi/.test(l);
  const remoteEligible = mode === 'Remote' || /remote|anywhere/.test(l);
  return inKenya || (remoteEligible && hq === 'kenya');
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
        if (!kenyaRelevant(r.location, mode, src.hq)) continue;
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
          tags: r.tags,
        });
      }
      sources.push({ id: src.id, company: src.company, board: src.board, count: rows.length, kept, ok: true });
      console.log(`✓ ${src.company} (${src.board}): ${rows.length} roles, ${kept} Kenya-relevant`);
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

  const out = {
    fetchedAt: NOW.toISOString().slice(0, 10),
    note: 'Pulled from employers\u2019 own ATS boards. No salaries are invented for live rows.',
    sources,
    jobs,
  };
  writeFileSync(OUT, JSON.stringify(out, null, 1) + '\n');
  console.log(`→ wrote ${jobs.length} live jobs from ${totalOk}/${sources.length} sources to src/data/jobs.live.json`);
}

main().catch((e) => {
  console.error('pipeline error:', e);
  // keep previous snapshot on catastrophic failure
  process.exit(0);
});
