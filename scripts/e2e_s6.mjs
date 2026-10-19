// SESSION 6 E2E — jobs mobile pay strip + verified filter + dual bookmark paint
import { chromium } from 'playwright';
const base = 'http://localhost:4173';
const ok = (name, cond) => console.log(`${cond ? '✓' : '✗ FAIL'} ${name}`);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 375, height: 812 } });
await p.goto(`${base}/jobs`, { waitUntil: 'networkidle' });

// 1. every row has a mobile pay strip with pay value + date
const rows = await p.locator('.job-row').count();
const strips = await p.locator('.job-row > div > .col-span-full').count();
ok(`mobile pay strip on every row (${strips}/${rows})`, strips === rows);

// 2. pay strip shows band for curated rows and n/d for live rows
const bandStrip = await p.locator('.job-row .col-span-full', { hasText: 'KSh' }).count();
const ndStrip = await p.locator('.job-row .col-span-full', { hasText: 'pay: n/d' }).count();
ok(`pay strips: ${bandStrip} bands + ${ndStrip} n/d (never invented for live)`, bandStrip > 0 && ndStrip > 0 && bandStrip + ndStrip === rows);

// 3. no horizontal overflow on mobile
const overflow = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
ok(`no horizontal overflow at 375px (delta ${overflow}px)`, overflow <= 0);

// 4. verified-only filter narrows and only shows verified rows
const total = await p.locator('.job-row').count();
await p.check('#verified-only');
const shown = await p.locator('.job-row:not(.hidden)').count();
const allVerified = await p.locator('.job-row:not(.hidden)').evaluateAll((rs) => rs.every((r) => r.dataset.v === '1'));
ok(`verified filter narrows ${total} -> ${shown}, all data-v=1`, shown > 0 && shown < total && allVerified);
await p.uncheck('#verified-only');

// 5. both bookmark buttons (desktop + mobile strip) paint together
await p.evaluate(() => localStorage.removeItem('sck-bookmarks'));
const bmId = await p.locator('.job-row .col-span-full .bookmark-btn').first().getAttribute('data-bm');
await p.locator(`.job-row .col-span-full .bookmark-btn[data-bm="${bmId}"]`).first().click();
await p.waitForTimeout(250);
const painted = await p.locator(`.bookmark-btn[data-bm="${bmId}"][aria-pressed="true"]`).count();
const totalBm = await p.locator(`.bookmark-btn[data-bm="${bmId}"]`).count();
ok(`bookmark click paints all ${totalBm} twin buttons (painted ${painted})`, painted === totalBm && totalBm >= 2);
await p.locator(`.job-row .col-span-full .bookmark-btn[data-bm="${bmId}"]`).first().click();

// 6. row expand still works (grid header + detail toggle)
await p.evaluate(() => { document.querySelectorAll('.job-row [data-expand]')[0].click(); });
await p.waitForTimeout(350);
const expanded = await p.locator('.job-row [data-expand]').first().getAttribute('aria-expanded');
ok('row expands (aria-expanded=true)', expanded === 'true');

await b.close();
console.log('s6 e2e done');
