/**
 * Mobile recon — shoot key live pages + the submit flow at 390x844 (iPhone-ish).
 * Also capture the publish modal open + filled + error states.
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const OUT = 'qa/r8_mobile';
mkdirSync(OUT, { recursive: true });

const pages = [
  ['home', 'https://startups.co.ke/'],
  ['startups', 'https://startups.co.ke/startups'],
  ['community', 'https://startups.co.ke/startups/community'],
  ['climate', 'https://startups.co.ke/climate-tech'],
  ['jobs', 'https://startups.co.ke/jobs'],
  ['funding', 'https://startups.co.ke/funding'],
  ['profile', 'https://startups.co.ke/startups/basigo'],
  ['community-profile', 'https://startups.co.ke/startups/community/zawadi-labs-test'],
];

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
});
const page = await ctx.newPage();
const issues = [];
page.on('console', (m) => { if (m.type() === 'error') issues.push(`console ${page.url()}: ${m.text().slice(0, 160)}`); });
page.on('pageerror', (e) => issues.push(`pageerror ${page.url()}: ${String(e).slice(0, 160)}`));

for (const [name, url] of pages) {
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
    await page.waitForTimeout(700);
    // horizontal overflow check
    const overflow = await page.evaluate(() => {
      const d = document.documentElement;
      const over = d.scrollWidth - d.clientWidth;
      // find worst offenders
      let worst = null, worstW = 0;
      document.querySelectorAll('*').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.right > d.clientWidth + 2 && r.width > worstW) { worstW = r.width; worst = `${el.tagName}.${String(el.className).slice(0, 60)}`; }
      });
      return { over, worst };
    });
    await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: name === 'home' || name === 'community' });
    console.log(`${name}: overflow=${overflow.over}px worst=${overflow.worst}`);
  } catch (e) { console.log(`${name}: ERROR ${String(e).slice(0, 120)}`); }
}

// --- submit modal flow on mobile ---
try {
  await page.goto('https://startups.co.ke/startups/community', { waitUntil: 'networkidle', timeout: 45000 });
  // find the list-your-startup trigger
  const triggers = await page.evaluate(() => Array.from(document.querySelectorAll('[data-modal]')).map((b) => b.getAttribute('data-modal')));
  console.log('triggers on community:', JSON.stringify(triggers));
  const btn = page.locator('[data-modal="submit"]').first();
  if (await btn.count()) {
    await btn.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${OUT}/modal-top.png` });
    // scroll inside dialog to bottom
    await page.evaluate(() => { const d = document.querySelector('dialog[open]'); if (d) d.scrollTop = d.scrollHeight; });
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${OUT}/modal-bottom.png` });
    // measure dialog metrics
    const m = await page.evaluate(() => {
      const d = document.querySelector('dialog[open]');
      if (!d) return null;
      const r = d.getBoundingClientRect();
      const dw = document.documentElement.clientWidth;
      return { dialogWidth: r.width, viewport: dw, left: r.left, right: r.right, innerScroll: d.scrollHeight > d.clientHeight };
    });
    console.log('dialog metrics:', JSON.stringify(m));
  }
} catch (e) { console.log('modal flow ERROR:', String(e).slice(0, 160)); }

console.log('--- JS issues ---');
issues.slice(0, 12).forEach((i) => console.log(i));
await browser.close();
