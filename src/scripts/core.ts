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
    if (data?.session) {
      localStorage.removeItem('sck-auth-none');
      window.dispatchEvent(new CustomEvent('sck:auth-changed', { detail: { email: data.session.user?.email || null } }));
    }
    if (isRecovery && !location.pathname.startsWith('/auth/reset')) location.replace('/auth/reset');
    else if (isSignup) window.sckToast?.({ title: 'Email confirmed', body: 'Your address is verified. You can sign in with your password now.' });
  } catch {
    /* leave the hash untouched; nothing else in the page depends on it */
  }
})();

// --- Auth session chip (Supabase session) ---
// Deferred to browser idle, and skipped entirely once this device is known to
// be signed out WITHOUT a stored Supabase token, so the 56KB bundle never
// competes with page load (it was the largest "unused JavaScript" finding in
// PSI). The modal flips the chip instantly via `sck:auth-changed` on sign-in,
// sign-up and sign-out — no bundle needed for those transitions.
(async () => {
  const btn = document.getElementById('auth-btn');
  if (!btn) return;
  const setChip = (email: string | null | undefined) => {
    if (email) {
      btn.textContent = email.split('@')[0] + ' · Sign out';
      btn.dataset.signedIn = '1';
    } else {
      btn.textContent = 'Sign in';
      btn.dataset.signedIn = '';
      btn.dataset.modal = 'auth';
      // Re-arm the signed-out marker so later page loads can skip the bundle.
      // Safe even on first visit: the hasSbToken guard below overrides it when
      // a session token actually exists.
      try { localStorage.setItem('sck-auth-none', '1'); } catch { /* private mode */ }
    }
  };
  // Modal-driven transitions arrive here instantly (password sign-in, sign-up,
  // sign-out, magic-link landing). Keeps the masthead truthful on the very
  // page where the action happened, no reload needed.
  window.addEventListener('sck:auth-changed', (ev) => {
    const email = (ev as CustomEvent<{ email?: string | null }>).detail?.email || null;
    if (email) localStorage.removeItem('sck-auth-none');
    setChip(email);
  });
  const check = async () => {
    try {
      const { supabase } = await import('@/lib/supabase');
      const sb = supabase();
      if (!sb) return;
      const { data } = await sb.auth.getSession();
      if (data.session) localStorage.removeItem('sck-auth-none');
      setChip(data.session?.user.email || null);
      // Keep the flag in sync from here on (SIGNED_OUT re-arms it).
      sb.auth.onAuthStateChange((_e, session) => {
        if (session?.user.email) localStorage.removeItem('sck-auth-none');
        setChip(session?.user.email || null);
      });
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
  // Known signed-out devices skip the bundle — but ONLY while localStorage
  // holds no Supabase session token. The flag used to stick after password
  // sign-ins, permanently hiding real sessions behind a "Sign in" chip.
  const hasSbToken = Object.keys(localStorage).some(
    (k) => k.startsWith('sb-') && k.endsWith('-auth-token')
  );
  if (localStorage.getItem('sck-auth-none') === '1' && !hasSbToken) return;
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
