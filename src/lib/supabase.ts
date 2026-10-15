/**
 * Supabase client (browser only). Credentials come from env:
 *   PUBLIC_SUPABASE_URL / PUBLIC_SUPABASE_ANON_KEY
 * When not configured, the site degrades gracefully: forms fall back to
 * local storage + an honest "not connected" toast.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.PUBLIC_SUPABASE_URL as string | undefined;
const anon = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string | undefined;

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

/** Insert a submission; falls back to localStorage queue when Supabase is not configured. */
export async function submitForm(kind: SubmissionKind, payload: Record<string, unknown>, email?: string) {
  const sb = supabase();
  if (sb) {
    const { error } = await sb.from('submissions').insert({ kind, payload, email: email ?? null });
    if (error) throw error;
    return { stored: 'supabase' as const };
  }
  const q = JSON.parse(localStorage.getItem('sck-submissions') || '[]');
  q.push({ kind, payload, email, at: new Date().toISOString() });
  localStorage.setItem('sck-submissions', JSON.stringify(q));
  return { stored: 'local' as const };
}

export async function subscribeNewsletter(email: string, source = 'site') {
  const sb = supabase();
  if (sb) {
    const { error } = await sb.from('newsletter_subscribers').insert({ email, source });
    if (error && (error as { code?: string }).code === '23505') return { stored: 'supabase' as const, duplicate: true };
    if (error) throw error;
    return { stored: 'supabase' as const, duplicate: false };
  }
  return { stored: 'local' as const, duplicate: false };
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
