// Local overflow check on the fixed pages (preview on 4173).
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';

const preview = spawn('npx', ['astro', 'preview', '--port', '4175'], { stdio: 'pipe' });
await new Promise((resolve, reject) => {
  const t = setTimeout(() => reject(new Error('preview timeout')), 30000);
  preview.stdout.on('data', (d) => { if (String(d).includes('4175')) { clearTimeout(t); resolve(); } });
});

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const p = await ctx.newPage();

for (const [name, path] of [['home', '/'], ['profile-basigo', '/startups/basigo'], ['climate', '/climate-tech'], ['jobs', '/jobs'], ['funding', '/funding'], ['community', '/startups/community']]) {
  await p.goto(`http://localhost:4175${path}`, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
  await p.waitForTimeout(400);
  const over = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  console.log(`${name}: overflowX=${over}px ${over <= 0 ? 'OK' : 'STILL OVERFLOWING'}`);
}

// funding CSV export now works without JS error
const errs = [];
p.on('pageerror', (e) => errs.push(String(e)));
await p.goto('http://localhost:4175/funding', { waitUntil: 'networkidle' });
await p.waitForTimeout(800);
console.log('funding pageerrors:', errs.length === 0 ? 'NONE ✓' : errs.join(' | ').slice(0, 200));
const csv = await p.evaluate(() => window.__SCK_CSV__?.split('\n').slice(0, 2).join(' | '));
console.log('csv head:', csv || 'MISSING');

// modal-open chrome hiding
await p.goto('http://localhost:4175/startups/community', { waitUntil: 'networkidle' });
await p.evaluate(() => { document.getElementById('cookie-banner')?.classList.remove('hidden'); });
await p.click('[data-modal="submit"]');
await p.waitForTimeout(400);
const chromeState = await p.evaluate(() => ({
  modalOpen: document.body.classList.contains('modal-open'),
  cookieHidden: getComputedStyle(document.getElementById('cookie-banner')).display === 'none',
  chipHidden: getComputedStyle(document.getElementById('sample-chip')).display === 'none',
}));
console.log('chrome while modal open:', JSON.stringify(chromeState), (chromeState.modalOpen && chromeState.cookieHidden && chromeState.chipHidden) ? 'OK' : 'FAIL');
await p.keyboard.press('Escape');
await p.waitForTimeout(300);
const after = await p.evaluate(() => ({ modalOpen: document.body.classList.contains('modal-open') }));
console.log('after close modal-open flag:', JSON.stringify(after), after.modalOpen ? 'FAIL' : 'OK');

await b.close();
preview.kill();
process.exit(0);
