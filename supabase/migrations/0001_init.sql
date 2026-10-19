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

drop policy if exists "submissions_insert_anon" on public.submissions;
create policy "submissions_insert_anon"
  on public.submissions for insert
  to anon, authenticated
  with check (true);

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

drop policy if exists "newsletter_insert_anon" on public.newsletter_subscribers;
create policy "newsletter_insert_anon"
  on public.newsletter_subscribers for insert
  to anon, authenticated
  with check (true);

-- 3) Storage: public bucket for user-uploaded company logos
insert into storage.buckets (id, name, public)
values ('logos', 'logos', true)
on conflict (id) do nothing;

drop policy if exists "logos_public_read" on storage.objects;
create policy "logos_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'logos');

drop policy if exists "logos_public_upload" on storage.objects;
create policy "logos_public_upload"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'logos');
