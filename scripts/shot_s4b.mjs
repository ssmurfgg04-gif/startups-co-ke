import { chromium } from 'playwright';
const base = 'http://localhost:4173';
const b = await chromium.launch();
// modal shot
const p = await b.newPage({ viewport: { width: 1280, height: 860 } });
await p.goto(`${base}/jobs`, { waitUntil: 'networkidle' });
await p.evaluate(() => localStorage.setItem('sck-consent', 'essential'));
await p.click('button[data-modal="postjob"]');
await p.waitForTimeout(500);
await p.screenshot({ path: '/home/z/my-project/qa/shots/postjob-modal.png' });
await p.close();
// founder strip + hero clip
const p2 = await b.newPage({ viewport: { width: 1440, height: 1000 } });
await p2.goto(`${base}/`, { waitUntil: 'networkidle' });
await p2.evaluate(() => localStorage.setItem('sck-consent', 'essential'));
await p2.waitForTimeout(800);
await p2.screenshot({ path: '/home/z/my-project/qa/shots/hero-strip.png' });
await p2.evaluate(() => document.querySelector('section[aria-labelledby="insights-h"]')?.scrollIntoView());
await p2.waitForTimeout(900);
await p2.screenshot({ path: '/home/z/my-project/qa/shots/insights.png' });
await p2.close();
// article page with DataPlate
const p3 = await b.newPage({ viewport: { width: 1280, height: 900 } });
await p3.goto(`${base}/news/sh93bn-lesson`, { waitUntil: 'networkidle' });
await p3.waitForTimeout(600);
await p3.screenshot({ path: '/home/z/my-project/qa/shots/article-plate.png' });
await p3.close();
await b.close();
console.log('extras done');
