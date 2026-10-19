/** Global client behavior: scroll reveals, count-ups, auth session chip. */
// JS gate: reveal-hidden styles only apply when JS is running (fail-safe without JS)
document.documentElement.classList.add('js');

// --- Scroll reveal (respects prefers-reduced-motion) ---
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reduce) {
  document.documentElement.classList.add('reduce-motion');
  document.querySelectorAll('.rv').forEach((el) => el.classList.add('in'));
} else {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          (e.target as HTMLElement).classList.add('in');
          io.unobserve(e.target);
        }
      }
    },
    { threshold: 0.12 }
  );
  document.querySelectorAll('.rv').forEach((el) => io.observe(el));
}

// --- Count-up numbers: REMOVED on purpose ---
// Numbers are this site's product. Animating 0→N meant first paint showed a
// wrong (or "contradictory") value, burned main-thread frames and delayed the
// moment the stat band reads true. Static final values now ship in the HTML.

// --- Auth link landing (magic links + recovery emails) ---
// Supabase Auth's redirect allowlist currently points every email link at
// the site root, so sessions arrive HERE as a URL fragment. Consume the
// session immediately (not on the idle path — the sck-auth-none guard below
// would skip it), then send recovery links on to the dedicated /auth/reset
// screen. When the allowlist gains /auth/reset, links land there directly
// and this bridge simply becomes a no-op for them.
(async () => {
  if (!location.hash.includes('access_token')) return;
  const isRecovery = /type=recovery/.test(location.hash);
  const isSignup = /type=signup/.test(location.hash);
  try {
    const { supabase } = await import('@/lib/supabase');
    const sb = supabase();
    if (!sb) return;
    const { data } = await sb.auth.getSession(); // consumes + persists the hash session
    if (data?.session) localStorage.removeItem('sck-auth-none');
    if (isRecovery) location.replace('/auth/reset');
    else if (isSignup) window.sckToast?.({ title: 'Email confirmed', body: 'Your address is verified. You can sign in with your password now.' });
  } catch {
    /* leave the hash untouched; nothing else in the page depends on it */
  }
})();

// --- Auth session chip (Supabase magic-link session) ---
// Deferred to browser idle + skipped entirely once this device is known to be
// signed out, the 56KB Supabase bundle never competes with page load on the
// critical path (it was the largest "unused JavaScript" finding in PSI).
(async () => {
  const btn = document.getElementById('auth-btn');
  if (!btn) return;
  // The modal opens the session check on demand (submit handler imports the
  // lib anyway); a stale "Sign in" label self-corrects after the idle check.
  const check = async () => {
    try {
      const { supabase } = await import('@/lib/supabase');
      const sb = supabase();
      if (!sb) return;
      const { data } = await sb.auth.getSession();
      const setSession = (email: string | null | undefined) => {
        if (email) {
          btn.textContent = email.split('@')[0] + ' · Sign out';
          btn.dataset.signedIn = '1';
        } else {
          btn.textContent = 'Sign in';
          btn.dataset.signedIn = '';
          btn.dataset.modal = 'auth';
        }
      };
      setSession(data.session?.user.email);
      if (!data.session) localStorage.setItem('sck-auth-none', '1');
      sb.auth.onAuthStateChange((_e, session) => setSession(session?.user.email));
      btn.addEventListener('click', async (ev) => {
        if (btn.dataset.signedIn === '1') {
          // Open the account panel (set a password / sign out) instead of
          // signing out on an unguarded click.
          ev.stopPropagation();
          const dlg = document.getElementById('modal-auth') as HTMLDialogElement | null;
          if (dlg && !dlg.open) dlg.showModal();
          window.dispatchEvent(new Event('sck:auth-opened'));
        }
      });
    } catch {
      /* supabase not configured, button stays as Sign in modal trigger */
    }
  };
  if (localStorage.getItem('sck-auth-none') === '1') return; // known signed-out device
  const idle = (window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => void }).requestIdleCallback;
  if (idle) idle(check, { timeout: 3500 });
  else setTimeout(check, 2500);
})();

// --- "Data · compiled from public sources" floating chip opens About modal ---
const float = document.getElementById('sample-chip');
if (float) {
  float.addEventListener('click', () => {
    (document.getElementById('modal-about') as HTMLDialogElement | null)?.showModal();
  });
}

// --- Email links, de-obfuscated for Cloudflare ---
// Anchors carry the address base64-encoded in data-email (the HTML payload
// never contains a literal email), so Cloudflare Email Obfuscation has nothing
// to rewrite and stops injecting its render-blocking /cdn-cgi/ email-decode
// script on every page. JS restores the real href + label at runtime; without
// JS the anchors still navigate to /contact, which has phone + form.
document.querySelectorAll<HTMLAnchorElement>('a[data-email]').forEach((a) => {
  try {
    const email = atob(a.dataset.email || '');
    if (!email.includes('@')) return;
    if (a.dataset.emailText !== 'keep') a.textContent = email;
    a.href = `mailto:${email}`;
  } catch { /* malformed payload, fallback href stays */ }
});
