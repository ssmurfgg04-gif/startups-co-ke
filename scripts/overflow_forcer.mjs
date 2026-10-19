/** Find which leaf elements actually FORCE the page wider than the viewport
 *  (scrollWidth > clientWidth chain) — home + profile, localhost:4175. */
import { chromium } from 'playwright';

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const page = await ctx.newPage();

for (const [name, path] of [['home', '/'], ['profile-basigo', '/startups/basigo']]) {
  await page.goto(`http://localhost:4175${path}`, { waitUntil: 'networkidle', timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(500);
  const res = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const sw = document.documentElement.scrollWidth;
    const out = [];
    // walk all elements: report those whose own scrollWidth exceeds their clientWidth
    // (they contain unbreakable content) AND whose width > vw
    document.querySelectorAll('body *').forEach((el) => {
      if (el.scrollWidth > el.clientWidth + 2 && el.clientWidth > 0) {
        out.push({
          tag: el.tagName,
          cls: String(el.className).slice(0, 60),
          cw: el.clientWidth,
          swd: el.scrollWidth,
        });
      }
    });
    return { vw, sw, out: out.slice(0, 14) };
  });
  console.log(`\n== ${name} == vw=${res.vw} scrollW=${res.sw} (overflow ${res.sw - res.vw}px)`);
  for (const o of res.out) console.log(`  scroll ${o.swd}>client ${o.cw}  <${o.tag.toLowerCase()}> ${o.cls}`);
}
await browser.close();
