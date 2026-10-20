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

/**
 * Turnstile site key (public, like the anon key). The matching SECRET is a
 * Worker secret only. Fallback keeps the widget working on CI builds.
 */
const FALLBACK_TURNSTILE = '0x4AAAAAAFb9FAfoXKvdJ2o4';
export const TURNSTILE_SITE_KEY =
  (import.meta.env.PUBLIC_TURNSTILE_SITE_KEY as string | undefined) || FALLBACK_TURNSTILE;

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
 * path is DEAD in production, its insert RLS policy never covered the anon
 * role, so every review form failed with 42501 and submissions vanished. The
 * function also emails the desk (best-effort), the client no longer fires a
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
    // queue locally with an honest flag, we do NOT pretend it saved.
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
 * anon role), subscribers saw "Subscribed" while the table stayed empty.
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

/**
 * Cloudflare Turnstile token for the widget inside `root` (defaults to the
 * whole document). Scoping matters: the page can host several widgets (publish,
 * claim, edit), and a form must send ITS token, not the first one on screen.
 */
export function turnstileToken(root: ParentNode = document): string | undefined {
  const el = root.querySelector<HTMLInputElement>('input[name="cf-turnstile-response"]');
  return el?.value || undefined;
}

/**
 * Upload a company logo.
 *
 * The browser no longer writes to Storage directly — the `logos` bucket has
 * no public insert policy. Instead it asks the Worker for a one-shot,
 * path-scoped signed URL, then PUTs the bytes straight to Storage. The Worker
 * picks the path (so a caller cannot overwrite an object or choose a name)
 * and applies the rate-limit / honeypot / Turnstile checks first.
 *
 * Returns the object path (not the URL) so `logoPublicUrl(path)` still works.
 */
export async function uploadLogo(file: File, _slug?: string, token?: string): Promise<string> {
  const res = await fetch('/api/logo-upload-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mime: file.type, size: file.size, turnstile: token || turnstileToken() }),
    signal: AbortSignal.timeout(15000),
  });
  const out = (await res.json().catch(() => ({}))) as {
    ok?: boolean; uploadUrl?: string; path?: string; error?: string;
  };
  if (!res.ok || !out.ok || !out.uploadUrl || !out.path) {
    throw new Error(out.error || `upload URL failed (${res.status})`);
  }
  const put = await fetch(out.uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type || 'application/octet-stream', 'x-upsert': 'false' },
    body: file,
    signal: AbortSignal.timeout(25000),
  });
  if (!put.ok) throw new Error(`logo upload failed (${put.status})`);
  return out.path;
}
