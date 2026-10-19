import { chromium } from 'playwright';
const base = 'http://localhost:4173';
const out = '/home/z/my-project/qa/vlm/s5';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1366, height: 900 }, deviceScaleFactor: 1.5 });

// 1. Home top (hero + snapshot + founder strip + wire)
await p.goto(`${base}/`, { waitUntil: 'networkidle' });
await p.evaluate(() => localStorage.setItem('sck-consent', 'essential'));
await p.screenshot({ path: `${out}/01-home-top.png` });

// 2. Home mid (funding + featured)
await p.evaluate(() => window.scrollTo(0, 1500));
await p.waitForTimeout(600);
await p.screenshot({ path: `${out}/02-home-mid.png` });

// 3. Founder submit modal (new fields + dropzone)
await p.click('section[aria-label="For founders"] button[data-modal="submit"]');
await p.waitForSelector('#modal-submit[open]');
await p.waitForTimeout(300);
await p.screenshot({ path: `${out}/03-founder-modal.png` });
await p.keyboard.press('Escape');

// 4. Post-a-job modal (enriched)
await p.goto(`${base}/jobs`, { waitUntil: 'networkidle' });
await p.click('aside button[data-modal="postjob"]');
await p.waitForSelector('#modal-postjob[open]');
await p.waitForTimeout(300);
await p.screenshot({ path: `${out}/04-postjob-modal.png` });
await p.keyboard.press('Escape');

// 5. Jobs right rail (board status + benchmark)
await p.evaluate(() => document.querySelector('aside .railbox')?.scrollIntoView());
await p.waitForTimeout(400);
await p.screenshot({ path: `${out}/05-jobs-rail.png` });

// 6. Contact page
await p.goto(`${base}/contact`, { waitUntil: 'networkidle' });
await p.screenshot({ path: `${out}/06-contact.png` });

// 7. About page
await p.goto(`${base}/about`, { waitUntil: 'networkidle' });
await p.screenshot({ path: `${out}/07-about.png` });

// 8. Masthead dropdown open (hover Discover)
await p.goto(`${base}/`, { waitUntil: 'networkidle' });
await p.hover('nav[aria-label="Primary"] > div:first-child > a');
await p.waitForTimeout(400);
await p.screenshot({ path: `${out}/08-nav-dropdown.png`, clip: { x: 0, y: 0, width: 1366, height: 420 } });

// 9. Methodology page
await p.goto(`${base}/methodology`, { waitUntil: 'networkidle' });
await p.screenshot({ path: `${out}/09-methodology.png` });

await b.close();
console.log('shots saved');
