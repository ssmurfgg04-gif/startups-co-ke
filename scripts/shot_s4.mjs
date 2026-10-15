import { chromium } from 'playwright';
const base = 'http://localhost:4173';
const b = await chromium.launch();
const shots = [
  ['home-desktop', `${base}/`, { width: 1440, height: 960 }, false],
  ['home-mobile', `${base}/`, { width: 390, height: 844 }, false],
  ['jobs-desktop', `${base}/jobs`, { width: 1440, height: 960 }, false],
];
for (const [name, url, vp, fullDark] of shots) {
  const p = await b.newPage({ viewport: vp });
  await p.goto(url, { waitUntil: 'networkidle' });
  await p.evaluate(async () => {
    const h = document.body.scrollHeight;
    for (let y = 0; y <= h; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
    document.querySelectorAll('.rv').forEach((el) => { el.style.opacity = '1'; el.style.transform = 'none'; });
    window.scrollTo(0, 0);
  });
  await p.waitForTimeout(700);
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(300);
  await p.screenshot({ path: `/home/z/my-project/qa/shots/${name}.png`, fullPage: true });
  await p.close();
  console.log(name, 'done');
}
await b.close();
