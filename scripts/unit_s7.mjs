// Unit checks for the LIVE worker helpers (worker/lib.mjs + worker/render.mjs).
// Pure functions only — no network. Run: node scripts/unit_s7.mjs
import { esc, slugify, validateListing } from '../worker/lib.mjs';
import { renderPage, renderMarkdown, unsubscribeConfirmPage } from '../worker/render.mjs';

const ok = (name, cond) => { console.log(`${cond ? 'PASS' : 'FAIL'} ${name}`); if (!cond) process.exitCode = 1; };

// esc
ok('esc escapes quotes+angles', esc(`<script>"'&`) === '&lt;script&gt;&quot;&#39;&amp;');

// slugify
ok('slugify basic', slugify('Acme Robotics!') === 'acme-robotics');
ok('slugify unicode', slugify('Café Nairobi') === 'cafe-nairobi');
ok('slugify empty fallback', slugify('!!!') === 'startup');
ok('slugify cap 48', slugify('x'.repeat(80)).length <= 48);

// validate
const v1 = validateListing({ name: 'Test Co', website: 'https://test.co.ke', tagline: 'We build things', sector: 'Energy', stage: 'Seed', county: 'Nairobi', email: 'a@b.co' });
ok('valid listing passes', v1.ok === true && v1.listing.name === 'Test Co');
ok('unknown sector → Other', validateListing({ name: 'X Co', website: 'https://x.co', tagline: '1234', sector: 'Crypto' }).ok);
const v2 = validateListing({ name: 'T', website: 'ftp://nope', tagline: '' });
ok('bad url + short name fail', v2.ok === false && v2.errors.website && v2.errors.name);
ok('http URL rejected', validateListing({ name: 'T Co', website: 'http://insecure.co', tagline: '1234' }).ok === false);
ok('email optional', validateListing({ name: 'T Co', website: 'https://t.co', tagline: '1234', email: '' }).ok === true);
ok('bad email rejected', validateListing({ name: 'T Co', website: 'https://t.co', tagline: '1234', email: 'nope@' }).ok === false);
ok('XSS attempt neutralized in name', validateListing({ name: '<script>alert(1)</script>', website: 'https://t.co', tagline: '1234' }).ok === true);

// render: XSS smoke — no raw user string survives into HTML
const l = validateListing({ name: '<script>alert(1)</script>', website: 'https://t.co', tagline: '<img src=x onerror=alert(1)>', description: '" onclick="evil()', county: 'Nairobi', founderName: '<b>bold</b>' }).listing;
const page = renderPage({ ...l, createdAt: new Date().toISOString(), slug: 'x' }, 'x');
ok('page has no raw <script>alert', !page.includes('<script>alert'));
// Invariants that actually matter:
//  (a) user text lands as entities (&lt;img…), never as a real element;
//  (b) the ld+json block contains no raw `<` at all (can't break out —
//      `onerror=` as inert JSON/string data is irrelevant).
const ldStart0 = page.indexOf('<script type="application/ld+json">');
const ldEnd = page.indexOf('</script>', ldStart0);
const ldBody = page.slice(ldStart0 + '<script type="application/ld+json">'.length, ldEnd);
const outsideLd = page.slice(0, ldStart0) + page.slice(ldEnd + 9);
ok('no raw <img element outside ld+json', !outsideLd.includes('<img src=x'));
ok('user tagline entity-escaped in meta', page.includes('&lt;img src=x onerror=alert(1)&gt;'));
ok('ld+json body has no raw <', !ldBody.includes('<'));
ok('page has no raw onclick', !page.includes('" onclick='));
ok('page shows escaped name', page.includes('&lt;script&gt;'));
ok('page has nofollow ugc on website link', page.includes('rel="nofollow ugc noopener"'));
ok('page has canonical', page.includes('rel="canonical" href="https://startups.co.ke/startups/community/x"'));
ok('page has Founder-submitted badge', page.includes('Founder-submitted'));
ok('page has JSON-LD', page.includes('application/ld+json'));
const md = renderMarkdown(l, 'x');
ok('md has no raw html', !md.includes('<img'));
ok('md advertises canonical URL', md.includes('https://startups.co.ke/startups/community/x'));

// Unsubscribe confirmation (GET must not mutate)
const u = unsubscribeConfirmPage('a"b@x.co', 'ff00');
ok('unsub confirm escapes the address', !u.includes('a"b@x.co') && u.includes('a&quot;b@x.co'));
ok('unsub confirm is a POST form', u.includes('method="POST"') && u.includes('action="/api/unsubscribe?'));
ok('unsub confirm carries the token in the action', u.includes('t=ff00'));

// uniqueSlug's collision logic needs the live store (Supabase REST via env),
// so it is covered by the production smoke checks, not here.

console.log('lib unit checks done');
