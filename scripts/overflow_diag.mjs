/**
 * Precise overflow diagnosis + funding pageerror stack.
 */
import { chromium } from 'playwright';

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const page = await ctx.newPage();

async function diagnose(name, url) {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(600);
  const res = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const overflowX = document.documentElement.scrollWidth - vw;
    const bad = [];
    // every element extending past the right edge whose ancestors don't clip
    document.querySelectorAll('body *').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.right > vw + 1 && r.width > 8) {
        // check if any ancestor clips
        let p = el.parentElement, clipped = false;
        while (p && p !== document.body) {
          const s = getComputedStyle(p);
          if (s.overflowX === 'hidden' || s.overflow === 'hidden' || s.overflowX === 'clip' || s.overflow === 'clip' || s.contain?.includes('paint')) { clipped = true; break; }
          p = p.parentElement;
        }
        if (!clipped) bad.push({ tag: el.tagName, cls: String(el.className).slice(0, 70), right: Math.round(r.right), w: Math.round(r.width) });
      }
    });
    // dedupe by class, top 8 widest
    const seen = new Map();
    for (const b of bad) { const k = b.cls || b.tag; if (!seen.has(k) || seen.get(k).right < b.right) seen.set(k, b); }
    return { overflowX, vw, offenders: [...seen.values()].sort((a, b) => b.right - a.right).slice(0, 8) };
  });
  console.log(`\n== ${name} == overflowX=${res.overflowX}px vw=${res.vw}`);
  res.offenders.forEach((o) => console.log(`  right=${o.right} w=${o.w} <${o.tag}> ${o.cls}`));
}

await diagnose('home', 'https://startups.co.ke/');
await diagnose('climate', 'https://startups.co.ke/climate-tech');
await diagnose('profile-basigo', 'https://startups.co.ke/startups/basigo');
await diagnose('jobs', 'https://startups.co.ke/jobs');
await diagnose('funding', 'https://startups.co.ke/funding');

// funding pageerror with stack
const errs = [];
page.on('pageerror', (e) => errs.push(String(e?.stack || e).slice(0, 500)));
await page.goto('https://startups.co.ke/funding', { waitUntil: 'networkidle', timeout: 45000 }).catch(() => {});
await page.waitForTimeout(1200);
console.log('\n== funding pageerrors ==');
errs.forEach((e) => console.log(e));
await browser.close();
