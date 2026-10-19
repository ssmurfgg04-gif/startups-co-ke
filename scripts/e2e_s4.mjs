import { chromium } from 'playwright';
const base = 'http://localhost:4173';
const b = await chromium.launch();
const results = [];
const ok = (name, cond) => results.push([cond ? 'PASS' : 'FAIL', name]);

// 1. Post-a-job modal: open, fill (incl. new BrighterMonday-style fields), submit
const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
await p.goto(`${base}/jobs`, { waitUntil: 'networkidle' });
await p.evaluate(() => localStorage.setItem('sck-consent', 'essential'));
await p.click('aside button[data-modal="postjob"]');
await p.waitForSelector('#modal-postjob[open]');
await p.fill('#pj-co', 'Zawadi Labs');
await p.fill('#pj-title', 'Junior Data Analyst');
await p.fill('#pj-loc', 'Nakuru');
await p.selectOption('#pj-type', 'Full-time');
await p.fill('#pj-email', 'jobs@zawadi.co.ke');
await p.selectOption('#pj-pay', 'Range');
ok('pay Range reveals min/max inputs', await p.locator('#pj-range-wrap:not(.hidden)').count() === 1);
await p.fill('#pj-min', '60000');
await p.fill('#pj-max', '90000');
await p.fill('#pj-duties', 'Own the reporting queue');
await p.fill('#pj-quals', '2+ yrs SQL');
await p.selectOption('#pj-apply', 'Email CV');
ok('apply-method hint swaps to email copy', (await p.textContent('[data-apply-hint]')).includes('inbox'));
await p.fill('#pj-apply-detail', 'jobs@zawadi.co.ke');
await p.fill('#pj-deadline', '2026-11-30');
// The review queue now writes via /.netlify/functions/review-submit (Netlify
// runtime, absent on astro preview). Intercept the endpoint to simulate it:
// first call succeeds, and a follow-up 500 run proves honest failure UX.
let fnCalls = 0;
await p.route('**/.netlify/functions/review-submit', async (route) => {
  fnCalls++;
  const body = fnCalls === 1
    ? { ok: true, stored: 'queue', id: 'r:test' }
    : { ok: false, error: 'queue storage momentarily unavailable (simulated)' };
  await route.fulfill({ status: fnCalls === 1 ? 200 : 503, contentType: 'application/json', body: JSON.stringify(body) });
});
let fnStatus = null;
p.on('response', (r) => { if (r.url().includes('/.netlify/functions/review-submit') && r.request().method() === 'POST' && fnStatus !== 200) fnStatus = r.status(); });
await p.click('#modal-postjob button[type="submit"]');
await p.waitForTimeout(1800);
const subs = await p.evaluate(() => JSON.parse(localStorage.getItem('sck-submissions') || '[]'));
const job = subs.filter((s) => s.kind === 'job').pop();
const viaFn = fnStatus === 200;
const viaLocal = !!job && job.payload.company === 'Zawadi Labs' && job.payload.pay === 'Range' && job.payload.applyDetail === 'jobs@zawadi.co.ke' && job.payload.deadline === '2026-11-30';
ok(`postjob submit reaches review-queue function (fn ${fnStatus ?? 'no-call'} / local ${viaLocal})`, viaFn || viaLocal);
ok('postjob toast fired', await p.evaluate(() => !!document.querySelector('#toast-root, .toast, [id^=toast]')));

// 1b. Function failure path — honest error, dialog stays open, no fake success
await p.click('aside button[data-modal="postjob"]');
await p.waitForSelector('#modal-postjob[open]');
await p.fill('#pj-co', 'Zawadi Labs');
await p.fill('#pj-title', 'Retry Analyst');
await p.fill('#pj-email', 'jobs@zawadi.co.ke');
await p.fill('#pj-apply-detail', 'jobs@zawadi.co.ke');
await p.fill('#pj-deadline', '2026-11-30');
await p.click('#modal-postjob button[type="submit"]');
await p.waitForFunction(() => document.querySelector('#toaster')?.textContent?.includes('Not sent'), null, { timeout: 6000 }).catch(() => {});
ok('failed submit keeps dialog open (honest retry)', await p.locator('#modal-postjob[open]').count() === 1);
const failToast = await p.evaluate(() => document.querySelector('#toaster')?.textContent || '');
ok(`failure toast names the cause (${failToast.slice(0, 40).trim()}…)`, failToast.includes('Not sent') || failToast.includes('unavailable'));
await p.keyboard.press('Escape');
await p.waitForTimeout(300);

// 2. Pay disclosed filter
const total = await p.locator('.job-row').count();
await p.check('#pay-only');
await p.waitForTimeout(300);
const shown = await p.locator('.job-row:not(.hidden)').count();
const payVisible = await p.locator('.job-row:not(.hidden)').evaluateAll((rows) => rows.every((r) => r.dataset.pay === '1'));
ok(`pay filter narrows ${total} -> ${shown}, all disclosed`, shown > 0 && shown < total && payVisible);
await p.uncheck('#pay-only');

// 3. Live rows null-state + band rows + benchmark note
const ndCount = await p.locator('.job-row', { hasText: 'pay: n/d' }).count();
const bandCount = await p.locator('.job-row', { hasText: 'market band' }).count();
ok(`null-state rows (${ndCount}) + band rows (${bandCount}) both present`, ndCount > 0 && bandCount > 0);
ok('coverage benchmark note present', (await p.content()).includes('StartupJobs Kenya'));

// 4. Pledge + badge
ok('never-pay pledge on jobs page', (await p.content()).includes('Applicants never pay to apply'));
const badge = await p.request.get(`${base}/badge.svg`);
ok('badge.svg 200 + typeset plate', badge.ok() && (await badge.text()).includes('LISTED ON'));

// 5. Homepage: sector rows, founder strip, wire up top, active investors rail, no $0K/NaN
await p.goto(`${base}/`, { waitUntil: 'networkidle' });
const sectorHref = await p.locator('a[href="/startups?sector=Fintech"]').first().getAttribute('href');
ok('sector index rows link to directory', sectorHref === '/startups?sector=Fintech');
const home = await p.content();
ok('no picsum on home (DataPlate instead)', !home.includes('picsum'));
ok('founder strip present', home.includes('Claim a free profile and get seen'));
ok('Wire is the first numbered section (timely intel up)', home.indexOf('The Wire — what moved this week') < home.indexOf('Funding intelligence, with named sources'));
ok('active-investors rail (replaces duplicated rounds)', home.includes('Most active investors — derived'));
ok('no $0K anywhere', !home.includes('$0K'));
ok('no NaN relative dates', !/NaN (day|week|mo)/.test(home));
ok('stat band shows median seed (deduped)', home.includes('Median seed'));

// 6. New pages live + linked
for (const path of ['/about', '/contact', '/methodology']) {
  const res = await p.request.get(`${base}${path}`);
  ok(`${path} 200`, res.ok());
}
const contactHtml = await (await p.request.get(`${base}/contact`)).text();
ok('contact page has fast-path forms wired', contactHtml.includes('data-modal="postjob"') && contactHtml.includes('data-modal="submit"'));
const methHtml = await (await p.request.get(`${base}/methodology`)).text();
ok('methodology explains anchors (Nairobi + 6) and link checks', methHtml.includes('Nairobi plus 6 regional hubs') && methHtml.includes('checked on every pull'));

// 7. Masthead: 5 destinations + dropdown children
await p.goto(`${base}/about`, { waitUntil: 'networkidle' });
const navLabels = await p.locator('nav[aria-label="Primary"] > div > a').allTextContents();
ok('primary nav is 5 destinations', navLabels.filter((t) => t.trim()).length === 5);
ok('Discover dropdown has children', await p.locator('nav[aria-label="Primary"] a[href="/investors"]').count() >= 1);
ok('footer links About/Contact real pages', (await p.content()).includes('href="/about"') && (await p.content()).includes('href="/contact"'));

// 8. Founder submit modal: new fields + dropzone (open from home founder strip)
await p.goto(`${base}/`, { waitUntil: 'networkidle' });
await p.click('section[aria-label="For founders"] button[data-modal="submit"]');
await p.waitForSelector('#modal-submit[open]', { timeout: 5000 });
{
  ok('founder modal has Website URL field', (await p.locator('#su-web').count()) === 1);
  ok('founder modal has County select with 47 options', (await p.locator('#su-county option').count()) === 47);
  ok('dropzone replaces native file input', (await p.locator('#modal-submit input[type="file"].input').count()) === 0 && (await p.locator('#modal-submit [data-dropzone]').count()) === 1);
  ok('no all-caps mono wall (sentence-case helper)', (await p.locator('#modal-submit p.mono-label').count()) === 0);
  // simulate a file pick through the real input
  await p.setInputFiles('#su-logo', { name: 'logo.png', mimeType: 'image/png', buffer: Buffer.from('89504e470d0a1a0a', 'hex') });
  ok('dropzone shows chosen filename', (await p.textContent('#modal-submit [data-dropzone-label]')).includes('logo.png'));
}

// 9. Cookie banner dismiss without consent
await p.goto(`${base}/`, { waitUntil: 'networkidle' });
await p.evaluate(() => localStorage.removeItem('sck-consent'));
await p.reload({ waitUntil: 'networkidle' });
ok('cookie banner shows when unset', await p.locator('#cookie-banner:not(.hidden)').count() === 1);
await p.click('#cookie-dismiss');
ok('cookie banner dismisses (no consent forced)', await p.locator('#cookie-banner.hidden').count() === 1);

await p.close();
console.log(results.map(([s, n]) => `${s}  ${n}`).join('\n'));
await b.close();
if (results.some(([s]) => s === 'FAIL')) process.exit(1);
