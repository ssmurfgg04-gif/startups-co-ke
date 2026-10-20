-- startups.co.ke — initial schema
-- Applied via Supabase Management API. Idempotent.

-- 1) Submissions: single table for every user-submitted flow
--    (startup submit, profile claim, job post, event list, intro request,
--     data issue, sponsor, trial, report purchase)
create table if not exists public.submissions (
  id         uuid primary key default gen_random_uuid(),
  kind       text not null,
  payload    jsonb not null default '{}'::jsonb,
  email      text,
  user_id    uuid references auth.users (id) on delete set null,
  status     text not null default 'new',
  created_at timestamptz not null default now()
);

alter table public.submissions enable row level security;

-- Writes go through the Worker (service key) only: no anon/authenticated
-- insert policy. The old "submissions_insert_anon" policy let anyone write
-- directly with the public anon key, bypassing rate limits and validation.
drop policy if exists "submissions_insert_anon" on public.submissions;

drop policy if exists "submissions_select_own" on public.submissions;
create policy "submissions_select_own"
  on public.submissions for select
  to authenticated
  using (auth.uid() = user_id);

-- 2) Newsletter subscribers (The Ecosystem Brief)
create table if not exists public.newsletter_subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text unique not null,
  source     text not null default 'site',
  created_at timestamptz not null default now()
);

alter table public.newsletter_subscribers enable row level security;

-- Writes go through the Worker (service key) only. The old
-- "newsletter_insert_anon" policy let the public anon key insert directly,
-- bypassing the Worker's rate limit and duplicate handling.
drop policy if exists "newsletter_insert_anon" on public.newsletter_subscribers;

-- 3) Storage: public bucket for user-uploaded company logos
--    READ is public ("meant to be seen"). WRITE is service-role only: the
--    Worker mints a one-shot, path-scoped signed upload URL after its
--    rate-limit/honeypot/Turnstile checks. No public insert policy exists.
insert into storage.buckets (id, name, public)
values ('logos', 'logos', true)
on conflict (id) do nothing;

-- Hard caps are defence in depth: Storage enforces them on the signed PUT
-- even if the Worker is ever bypassed.
update storage.buckets
   set file_size_limit = 2097152,
       allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
 where id = 'logos';

drop policy if exists "logos_public_upload" on storage.objects;
drop policy if exists "logos public read" on storage.objects;
create policy "logos public read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'logos');
