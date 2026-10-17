import { chromium } from 'playwright';
const base = 'http://localhost:4173';
const out = '/home/z/my-project/qa/vlm/s6';
const b = await chromium.launch();

// ---------- MOBILE (375×812, iPhone-ish) ----------
const m = await b.newPage({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2 });
await m.goto(`${base}/jobs`, { waitUntil: 'networkidle' });
await m.evaluate(() => localStorage.setItem('sck-consent', 'essential'));

// 1. jobs list top — collapsed rows w/ pay strip
await m.screenshot({ path: `${out}/m1-jobs-top.png` });

// 2. rows mid — live rows (pay: n/d strip) + a curated band row
await m.evaluate(() => window.scrollTo({ top: 900, behavior: 'instant' }));
await m.waitForTimeout(400);
await m.screenshot({ path: `${out}/m2-jobs-mid.png` });

// 3. expanded row — detail + apply
await m.evaluate(() => { const r = document.querySelectorAll('.job-row [data-expand]')[1]; r.scrollIntoView({ block: 'center' }); r.click(); });
await m.waitForTimeout(450);
await m.screenshot({ path: `${out}/m3-row-expanded.png` });
await m.evaluate(() => { document.querySelectorAll('.job-row [data-expand]')[1].click(); });

// 4. right rail (vetted box) on mobile — it stacks below the list
await m.evaluate(() => document.querySelector('aside .railbox')?.scrollIntoView({ behavior: 'instant', block: 'start' }));
await m.waitForTimeout(400);
await m.screenshot({ path: `${out}/m4-vetted-rail.png` });

// 5. hero on mobile
await m.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
await m.waitForTimeout(600);
await m.screenshot({ path: `${out}/m5-hero.png` });
await m.close();

// ---------- DESKTOP ----------
const p = await b.newPage({ viewport: { width: 1366, height: 900 }, deviceScaleFactor: 1.5 });
await p.goto(`${base}/jobs`, { waitUntil: 'networkidle' });
await p.evaluate(() => localStorage.setItem('sck-consent', 'essential'));
await p.evaluate(() => window.scrollTo(0, 560));
await p.waitForTimeout(400);
await p.screenshot({ path: `${out}/d1-jobs-rows.png` });

// verified-only filter result
await p.click('#verified-only');
await p.waitForTimeout(350);
const count = await p.textContent('#job-count');
console.log('verified-only count:', count.trim());
await p.screenshot({ path: `${out}/d2-verified-only.png` });
await p.click('#verified-only');

// expanded row desktop
await p.evaluate(() => { document.querySelectorAll('.job-row [data-expand]')[0].scrollIntoView({ block: 'center' }); document.querySelectorAll('.job-row [data-expand]')[0].click(); });
await p.waitForTimeout(450);
await p.screenshot({ path: `${out}/d3-row-expanded.png` });

await b.close();
console.log('s6 shots saved');
