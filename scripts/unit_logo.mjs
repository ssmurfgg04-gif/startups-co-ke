// Unit checks for the logo-upload helper (worker/lib.mjs).
// Pure / no-network paths only. Run: node scripts/unit_logo.mjs
import { LOGO_MIME, LOGO_MAX_BYTES, mintLogoUpload, verifyTurnstile } from '../worker/lib.mjs';

const ok = (name, cond) => { console.log(`${cond ? 'PASS' : 'FAIL'} ${name}`); if (!cond) process.exitCode = 1; };

// MIME allow-list mirrors the bucket
ok('png allowed', LOGO_MIME['image/png'] === 'png');
ok('jpeg allowed', LOGO_MIME['image/jpeg'] === 'jpg');
ok('webp allowed', LOGO_MIME['image/webp'] === 'webp');
ok('gif allowed', LOGO_MIME['image/gif'] === 'gif');
ok('svg NOT allowed (stored-XSS surface)', LOGO_MIME['image/svg+xml'] === undefined);
ok('cap is 2 MB', LOGO_MAX_BYTES === 2 * 1024 * 1024);

// mintLogoUpload: validation happens before any network call
const noKey = await mintLogoUpload({}, { mime: 'image/png', size: 10 });
ok('no service key -> storage not configured', noKey.ok === false && noKey.error === 'storage not configured');

const envKey = { SUPABASE_SERVICE_ROLE_KEY: 'x' };
const badMime = await mintLogoUpload(envKey, { mime: 'text/html', size: 10 });
ok('disallowed mime -> unsupported type', badMime.ok === false && badMime.error === 'unsupported type');

const noMime = await mintLogoUpload(envKey, { size: 10 });
ok('missing mime -> unsupported type', noMime.ok === false && noMime.error === 'unsupported type');

const tooBig = await mintLogoUpload(envKey, { mime: 'image/png', size: LOGO_MAX_BYTES + 1 });
ok('oversize -> too large', tooBig.ok === false && tooBig.error === 'too large');

// (size exactly at cap is NOT rejected by the size check — but proving it
//  needs a network round-trip, so it lives in the E2E suite, not here.)

// verifyTurnstile
ok('no secret -> skip (true)', (await verifyTurnstile({}, 'anything', '1.2.3.4')) === true);
ok('secret + empty token -> fail closed', (await verifyTurnstile({ TURNSTILE_SECRET: 's' }, '', '1.2.3.4')) === false);

console.log('logo unit checks done');
