/**
 * Supabase client (browser only). Credentials come from env:
 *   PUBLIC_SUPABASE_URL / PUBLIC_SUPABASE_ANON_KEY
 * Fallbacks: both values are PUBLIC by design (the anon key ships in every
 * visitor's bundle and RLS guards the data), so a fresh Netlify/CI build
 * without configured env vars still produces a fully working site. Set the
 * env vars in the host UI to override.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const FALLBACK_URL = 'https://eezqpsbhmnhuhnmiwnsz.supabase.co';
const FALLBACK_ANON =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlenFwc2JobW5odWhubWl3bnN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwNjQzMjgsImV4cCI6MjEwNzY0MDMyOH0.Ks8O3JMluiPxJuozW3CvgU-lsReS7qolo6WR4wO2fXM';

const url = (import.meta.env.PUBLIC_SUPABASE_URL as string | undefined) || FALLBACK_URL;
const anon = (import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string | undefined) || FALLBACK_ANON;

export const supabaseConfigured = Boolean(url && anon);

let client: SupabaseClient | null = null;

export function supabase(): SupabaseClient | null {
  if (!supabaseConfigured) return null;
  if (!client) client = createClient(url!, anon!, { auth: { persistSession: true, autoRefreshToken: true } });
  return client;
}

export type SubmissionKind =
  | 'startup'
  | 'claim'
  | 'job'
  | 'event'
  | 'intro'
  | 'issue'
  | 'trial'
  | 'buy'
  | 'sponsor'
  | 'register';

/**
 * Insert a review-queue submission.
 *
 * The queue lives in Supabase via /api/review-submit (worker/index.js). The
 * previous Supabase `submissions`
 * path is DEAD in production — its insert RLS policy never covered the anon
 * role, so every review form failed with 42501 and submissions vanished. The
 * function also emails the desk (best-effort) — the client no longer fires a
 * separate notify request.
 *
 * Offline fallback: if the network itself is unreachable the entry is queued
 * in localStorage and re-synced on the next successful submission, so a
 * subway-level connection never loses a founder's typed details.
 */
export async function submitForm(kind: SubmissionKind, payload: Record<string, unknown>, email?: string) {
  try {
    const res = await fetch('/api/review-submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind, payload, email: email ?? undefined }),
      signal: AbortSignal.timeout(20000),
    });
    const out = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    if (!res.ok || !out.ok) throw new Error(out.error || `HTTP ${res.status}`);
    syncLocalQueue();
    return { stored: 'queue' as const };
  } catch (err) {
    // Network-level failure only (the function reports its own errors above):
    // queue locally with an honest flag — we do NOT pretend it saved.
    if (err instanceof TypeError) {
      const q = JSON.parse(localStorage.getItem('sck-submissions') || '[]');
      q.push({ kind, payload, email, at: new Date().toISOString(), offline: true });
      localStorage.setItem('sck-submissions', JSON.stringify(q));
      throw new Error('offline-queued');
    }
    throw err;
  }
}

/** Fire-and-forget re-sync of entries queued while offline (best effort). */
async function syncLocalQueue() {
  try {
    const q = JSON.parse(localStorage.getItem('sck-submissions') || '[]');
    if (!Array.isArray(q) || !q.length) return;
    const remaining: unknown[] = [];
    for (const item of q) {
      try {
        const res = await fetch('/api/review-submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
          signal: AbortSignal.timeout(15000),
        });
        if (!res.ok) remaining.push(item);
      } catch {
        remaining.push(item);
      }
    }
    localStorage.setItem('sck-submissions', JSON.stringify(remaining));
  } catch { /* never blocks the current submission */ }
}

/**
 * Subscribe to The Ecosystem Brief.
 *
 * Writes through /api/newsletter (Cloudflare Worker, Supabase storage). The previous
 * Supabase path silently failed with 42501 (insert policy never covered the
 * anon role) — subscribers saw "Subscribed" while the table stayed empty.
 */
export async function subscribeNewsletter(email: string, source = 'site') {
  const res = await fetch('/api/newsletter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, source }),
    signal: AbortSignal.timeout(20000),
  });
  const out = (await res.json().catch(() => ({}))) as { ok?: boolean; duplicate?: boolean; error?: string };
  if (!res.ok || !out.ok) throw new Error(out.error || `HTTP ${res.status}`);
  return { stored: 'queue' as const, duplicate: Boolean(out.duplicate) };
}

/** Public URL for an uploaded logo in the `logos` bucket. */
export function logoPublicUrl(path: string): string {
  return `${url}/storage/v1/object/public/logos/${path}`;
}

export async function uploadLogo(file: File, slug: string): Promise<string> {
  const sb = supabase();
  if (!sb) throw new Error('Supabase not configured');
  const ext = file.name.split('.').pop() || 'png';
  const path = `${slug}-${Date.now()}.${ext}`;
  const { error } = await sb.storage.from('logos').upload(path, file, { cacheControl: '3600', upsert: false });
  if (error) throw error;
  return path;
}
