import { chromium } from 'playwright';
const base = 'http://localhost:4173';
const b = await chromium.launch();
const results = [];
const ok = (name, cond) => results.push([cond ? 'PASS' : 'FAIL', name]);

// 1. Post-a-job modal: open, fill, submit -> localStorage fallback + toast
const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
await p.goto(`${base}/jobs`, { waitUntil: 'networkidle' });
await p.evaluate(() => localStorage.setItem('sck-consent', 'essential'));
await p.click('aside button[data-modal="postjob"]');
await p.waitForSelector('#modal-postjob[open]');
await p.fill('#pj-co', 'Zawadi Labs');
await p.fill('#pj-title', 'Junior Data Analyst');
await p.fill('#pj-loc', 'Nakuru');
await p.fill('#pj-email', 'jobs@zawadi.co.ke');
await p.selectOption('#pj-pay', 'Negotiable');
await p.selectOption('#pj-apply', 'Email CV');
let sbInsert = null;
p.on('response', (r) => { if (r.url().includes('/rest/v1/submissions') && r.request().method() === 'POST') sbInsert = r.status(); });
await p.click('#modal-postjob button[type="submit"]');
await p.waitForTimeout(1600);
const subs = await p.evaluate(() => JSON.parse(localStorage.getItem('sck-submissions') || '[]'));
const job = subs.find((s) => s.kind === 'job');
const viaSb = sbInsert === 201;
const viaLocal = !!job && job.payload.company === 'Zawadi Labs' && job.payload.pay === 'Negotiable' && job.payload.apply === 'Email CV';
ok(`postjob submit stored with new fields (supabase ${sbInsert ?? 'no-call'} / local ${viaLocal})`, viaSb || viaLocal);
ok('postjob toast fired', await p.evaluate(() => !!document.querySelector('#toast-root, .toast, [id^=toast]')));

// 2. Pay disclosed filter
const total = await p.locator('.job-row').count();
await p.check('#pay-only');
await p.waitForTimeout(300);
const shown = await p.locator('.job-row:not(.hidden)').count();
const payVisible = await p.locator('.job-row:not(.hidden)').evaluateAll((rows) => rows.every((r) => r.dataset.pay === '1'));
ok(`pay filter narrows ${total} -> ${shown}, all disclosed`, shown > 0 && shown < total && payVisible);
await p.uncheck('#pay-only');

// 3. Live rows show null-state + band rows show salary
const ndCount = await p.locator('.job-row', { hasText: 'pay: n/d' }).count();
const bandCount = await p.locator('.job-row', { hasText: 'market band' }).count();
ok(`null-state rows (${ndCount}) + band rows (${bandCount}) both present`, ndCount > 0 && bandCount > 0);

// 4. Pledge + free tier copy on page
ok('never-pay pledge on jobs page', (await p.content()).includes('Applicants never pay to apply'));

// 5. Badge serves
const badge = await p.request.get(`${base}/badge.svg`);
ok('badge.svg 200 + typeset plate', badge.ok() && (await badge.text()).includes('LISTED ON'));

// 6. Sector row links from home
await p.goto(`${base}/`, { waitUntil: 'networkidle' });
const sectorHref = await p.locator('a[href="/startups?sector=Fintech"]').first().getAttribute('href');
ok('sector index rows link to directory', sectorHref === '/startups?sector=Fintech');

// 7. Favicon + DataPlate in home HTML (no picsum)
const home = await p.content();
ok('no picsum on home (DataPlate instead)', !home.includes('picsum'));
ok('founder strip present', home.includes('Claim a free profile and get seen'));
await p.close();
console.log(results.map(([s, n]) => `${s}  ${n}`).join('\n'));
await b.close();
if (results.some(([s]) => s === 'FAIL')) process.exit(1);
