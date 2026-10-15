/** Global client behavior: scroll reveals, count-ups, auth session chip. */

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

// --- Count-up numbers (ease-out cubic, once) ---
const counters = document.querySelectorAll<HTMLElement>('[data-count]');
const cio = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const el = e.target as HTMLElement;
      cio.unobserve(el);
      const target = Number(el.dataset.count);
      const prefix = el.dataset.prefix ?? '';
      const suffix = el.dataset.suffix ?? '';
      const dur = 900;
      const t0 = performance.now();
      const fmt = (v: number) => (Number.isInteger(target) ? Math.round(v).toLocaleString('en-KE') : v.toFixed(1));
      const step = (t: number) => {
        const p = Math.min(1, (t - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = prefix + fmt(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
  },
  { threshold: 0.4 }
);
counters.forEach((el) => cio.observe(el));

// --- Auth session chip (Supabase magic-link session) ---
(async () => {
  const btn = document.getElementById('auth-btn');
  if (!btn) return;
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
    sb.auth.onAuthStateChange((_e, session) => setSession(session?.user.email));
    btn.addEventListener('click', async (ev) => {
      if (btn.dataset.signedIn === '1') {
        ev.stopPropagation();
        await sb.auth.signOut();
        setSession(null);
        document.dispatchEvent(new CustomEvent('sck:toast', { detail: { title: 'Signed out', body: 'See you soon.' } }));
      }
    });
  } catch {
    /* supabase not configured — button stays as Sign in modal trigger */
  }
})();

// --- "Data · compiled from public sources" floating chip opens About modal ---
const float = document.getElementById('sample-chip');
if (float) {
  float.addEventListener('click', () => {
    (document.getElementById('modal-about') as HTMLDialogElement | null)?.showModal();
  });
}
