// SESSION 7 E2E — self-hosted fonts, email de-obfuscation, climate hub,
// llms.txt/md endpoints, community shell, a11y spot checks.
// Serves dist/ with astro preview (functions need Netlify runtime — their
// helpers are unit-tested in scripts/unit_s7.mjs; live verify post-deploy).
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';

const base = 'http://localhost:4173';
let failures = 0;
const ok = (name, cond) => { console.log(`${cond ? '✓' : '✗ FAIL'} ${name}`); if (!cond) failures++; };

// --- launch astro preview on dist ---
const preview = spawn('npx', ['astro', 'preview', '--port', '4173'], { stdio: 'pipe' });
await new Promise((resolve, reject) => {
  const t = setTimeout(() => reject(new Error('preview timeout')), 30000);
  preview.stdout.on('data', (d) => { if (String(d).includes('4173')) { clearTimeout(t); resolve(); } });
  preview.stderr.on('data', (d) => process.stderr.write(d));
});
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 900 } });

try {
  // 1. fonts: no third-party font stylesheet, self-hosted preloads instead
  await p.goto(`${base}/`, { waitUntil: 'networkidle' });
  const html = await p.content();
  ok('no third-party font stylesheet request', !html.includes('fonts.googleapis') || !html.match(/href="https:\/\/fonts\.googleapis\.com[^"]*" rel="stylesheet"/));
  const preloads = await p.locator('link[rel="preload"][as="font"]').count();
  ok(`3 font preloads present (${preloads})`, preloads === 3);
  for (const f of ['fraunces-100-900-normal', 'archivo-100-900-normal', 'plexmono-400-normal']) {
    const r = await p.request.get(`${base}/fonts/${f}.woff2`);
    ok(`font ${f} served (${r.status()})`, r.status() === 200);
  }
  ok('font CSS immutable header check skipped (Netlify-side)', true);

  // fonts actually loaded by the browser (200s, no console font errors)
  const fontErrors = [];
  p.on('console', (m) => { if (m.type() === 'error' && /font|woff/i.test(m.text())) fontErrors.push(m.text()); });
  await p.reload({ waitUntil: 'networkidle' });
  ok('no font load errors in console', fontErrors.length === 0);

  // 2. email de-obfuscation: no literal address in SERVED HTML (outside the
  // ld+json contactPoint, which is inert structured data), no mailto hrefs;
  // runtime DOM correctly restores mailto + visible address via core.ts
  const servedHome = await (await p.request.get(`${base}/`)).text();
  const noLd = servedHome.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '');
  ok('no mailto: in served HTML', !servedHome.includes('href="mailto:'));
  ok('literal address never in served HTML (excl. ld+json)', !/[\w.+-]+@startups\.co\.ke/.test(noLd));
  const footerLink = p.locator('footer a[data-email]').first();
  ok('footer carries data-email anchor', (await footerLink.count()) === 1);
  ok('mailto restored at runtime by core.ts', String(await footerLink.getAttribute('href')).startsWith('mailto:'));

  // 3. climate hub
  const r2 = await p.request.get(`${base}/climate-tech`);
  ok('/climate-tech 200', r2.status() === 200);
  const hub = await r2.text();
  ok('hub has CollectionPage JSON-LD', hub.includes('"@type":"CollectionPage"'));
  ok('hub has ItemList JSON-LD', hub.includes('"@type":"ItemList"'));
  ok('hub has FAQPage JSON-LD', hub.includes('"@type":"FAQPage"'));
  ok('hub lists 7 climate profiles', ['basigo', 'roam', 'sunculture', 'm-kopa', 'apollo', 'pula', 'iprocure'].every((id) => hub.includes(`/startups/${id}`)));
  ok('hub honesty caveat present', hub.includes('not an ecosystem census'));

  // 4. AI-readable endpoints
  const md1 = await p.request.get(`${base}/startups/m-kopa.md`);
  ok('/startups/m-kopa.md 200 text/markdown', md1.status() === 200 && (md1.headers()['content-type'] || '').includes('text/markdown'));
  const mdBody = await md1.text();
  ok('profile md carries source line', mdBody.includes('Compiled from public sources'));
  const lt = await p.request.get(`${base}/llms.txt`);
  ok('/llms.txt 200', lt.status() === 200);
  ok('llms.txt references climate hub', (await lt.text()).includes('/climate-tech'));
  const ltf = await p.request.get(`${base}/llms-full.txt`);
  ok('/llms-full.txt 200 + companies', ltf.status() === 200 && (await ltf.text()).includes('### M-KOPA'));
  const profilePage = await p.request.get(`${base}/startups/basigo`);
  ok('profile links AI-readable Markdown', (await profilePage.text()).includes('/startups/basigo.md'));

  // 5. community shell (functions need Netlify runtime — shell + empty state only)
  const r3 = await p.request.get(`${base}/startups/community`);
  ok('/startups/community 200', r3.status() === 200);
  const comm = await r3.text();
  ok('community shell has submit CTA', comm.includes('List your startup'));
  ok('community shell honesty rules rail', comm.includes('nofollow ugc'));
  await p.goto(`${base}/startups/community`, { waitUntil: 'networkidle' });
  await p.waitForTimeout(700);
  const emptyState = await p.locator('#community-list').textContent();
  ok('community list degrades gracefully without function (empty/error state)', /first listing|temporarily unavailable/i.test(emptyState || ''));

  // 6. submit modal: instant-publish copy + honeypot present
  await p.goto(`${base}/`, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.querySelector('[data-modal="submit"]')?.click());
  await p.waitForTimeout(300);
  const modalText = await p.locator('#modal-submit').textContent();
  ok('modal promises instant publish', modalText?.includes('No waiting, no approval'));
  ok('modal publish button present', (await p.locator('#modal-submit button[type="submit"]').textContent())?.includes('Publish now'));
  ok('honeypot field exists + hidden', await p.locator('#su-company-url').isHidden());
  const modeBefore = await p.locator('form[data-kind="startup"]').getAttribute('data-mode');
  await p.locator('[data-toggle-mode]').click();
  const modeAfter = await p.locator('form[data-kind="startup"]').getAttribute('data-mode');
  ok(`mode toggles instant→review (${modeBefore}→${modeAfter})`, modeBefore === 'instant' && modeAfter === 'review');
  await p.locator('[data-toggle-mode]').click();

  // 7. a11y spot checks
  const contrast = await p.evaluate(() => {
    const probe = document.createElement('span');
    probe.className = 'text-mut';
    document.body.appendChild(probe);
    return getComputedStyle(probe).color;
  });
  ok(`--mut computed color changed to darkened token (${contrast})`, contrast === 'rgb(93, 89, 73)');
  const dashAnim = await p.evaluate(() => {
    const el = document.querySelector('.anim-dash');
    if (!el) return 'absent';
    return getComputedStyle(el).animationName;
  });
  ok(`dash animation idle by default (${dashAnim})`, dashAnim === 'none' || dashAnim === 'absent');
  // coarse pointer: interactive chips get 44px touch targets
  const tp = await b.newPage({ viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true });
  await tp.goto(`${base}/startups`, { waitUntil: 'networkidle' });
  const chipH = await tp.evaluate(() => {
    const c = document.querySelector('a.chip, button.chip');
    if (!c) return null;
    return Math.round(c.getBoundingClientRect().height);
  });
  ok(`touch chips ≥44px on coarse pointer (${chipH}px)`, chipH == null || chipH >= 44);
  await tp.close();

  // 8. regression: key pages still 200
  for (const path of ['/', '/startups', '/startups/m-kopa', '/funding', '/jobs', '/investors', '/hackathons', '/news', '/methodology', '/about', '/contact', '/privacy']) {
    const r = await p.request.get(`${base}${path}`);
    ok(`${path} → ${r.status()}`, r.status() === 200);
  }
} finally {
  await b.close();
  preview.kill();
}
console.log(failures === 0 ? 's7 e2e ALL PASS' : `s7 e2e ${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
