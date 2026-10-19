-- ============================================================
-- startups.co.ke — schema (Postgres / Supabase)
-- Run via Management API. Idempotent.
-- ============================================================

-- ---------- PUBLIC DATA (anon read via RLS) ----------
create table if not exists public.companies (
  id text primary key,
  name text not null,
  tagline text,
  sector text not null,
  stage text,
  hq text not null default 'Nairobi',
  founded int,
  employees text,
  verified boolean not null default false,
  status text not null default 'Active',
  status_note text,
  domain text,
  website text,
  about text,
  tech_stack text[] default '{}',
  total_raised_usd bigint,
  raised_display text,
  raised_source text,
  data_as_of date not null default '2026-10-15',
  sources jsonb default '[]',
  logo_url text,
  featured boolean default false
);

create table if not exists public.funding_rounds (
  id bigserial primary key,
  company_id text references public.companies(id) on delete cascade,
  announced date,
  round text,
  amount_usd bigint,
  amount_display text,
  lead text,
  status text not null check (status in ('confirmed','reported','estimated')),
  source text,
  source_url text,
  note text
);

create table if not exists public.investors (
  id text primary key,
  name text not null,
  type text,
  hq text,
  stages text,
  cheque text,
  thesis text[] default '{}',
  website text,
  verified boolean not null default false,
  deals int default 0,
  note text,
  logo_domain text
);

create table if not exists public.investments (
  id bigserial primary key,
  investor_id text references public.investors(id) on delete cascade,
  company_id text references public.companies(id) on delete cascade,
  note text
);

create table if not exists public.jobs (
  id text primary key,
  company_id text references public.companies(id) on delete cascade,
  title text not null,
  location text,
  mode text,
  category text,
  salary text,
  salary_min_kes int,
  salary_max_kes int,
  posted_days int default 1,
  featured boolean default false,
  verified_employer boolean default false,
  tags text[] default '{}',
  description text,
  apply_url text
);

create table if not exists public.hackathons (
  id text primary key,
  name text not null,
  kind text default 'Hackathon',
  start date,
  end_date date,
  city text,
  venue text,
  theme text,
  prize text,
  tracks text[] default '{}',
  organizers text,
  url text,
  verified_organizer boolean default false,
  status text default 'upcoming',
  builders int default 0,
  notes text,
  featured boolean default false
);

create table if not exists public.articles (
  id text primary key,
  category text,
  title text not null,
  dek text,
  mins int default 4,
  published text,
  author text default 'startups.co.ke desk',
  date date,
  seed text,
  body jsonb default '[]',
  sources jsonb default '[]',
  feature boolean default false,
  tags text[] default '{}'
);

create table if not exists public.reports (
  id text primary key,
  title text not null,
  pages int,
  date text,
  blurb text,
  access text default 'Free',
  price text,
  tag text,
  url text
);

create table if not exists public.salary_bands (
  id bigserial primary key,
  role text not null,
  min_kes int not null,
  max_kes int not null,
  source text
);

create table if not exists public.wire_items (
  id bigserial primary key,
  body text not null,
  source text,
  category text,
  ts date default '2026-10-15'
);

create table if not exists public.trend_items (
  id bigserial primary key,
  keyword text not null,
  volume text,
  as_of date default '2026-10-15'
);

-- ---------- USER DATA (auth-gated) ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text,
  role text default 'member',
  created_at timestamptz default now()
);

create table if not exists public.bookmarks (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  job_id text not null,
  created_at timestamptz default now()
);

create table if not exists public.follows (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  company_id text not null,
  created_at timestamptz default now()
);

create table if not exists public.logo_claims (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  company_id text not null,
  storage_path text not null,
  status text default 'pending',
  note text,
  created_at timestamptz default now()
);

create table if not exists public.startup_submissions (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  sector text,
  stage text,
  hq text,
  website text,
  pitch text,
  status text default 'pending',
  created_at timestamptz default now()
);

create table if not exists public.intro_requests (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  target_type text,
  target_id text,
  target_name text,
  note text,
  status text default 'received',
  created_at timestamptz default now()
);

create table if not exists public.data_issues (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  company_id text,
  field text,
  details text,
  status text default 'open',
  created_at timestamptz default now()
);

create table if not exists public.subscribers (
  id bigserial primary key,
  email text unique not null,
  created_at timestamptz default now()
);

create table if not exists public.trials (
  id bigserial primary key,
  email text not null,
  plan text default 'professional',
  created_at timestamptz default now()
);

create table if not exists public.events (
  id bigserial primary key,
  kind text,
  path text,
  meta text,
  created_at timestamptz default now()
);

-- ---------- AUTH TRIGGER: auto-create profile ----------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------- STORAGE bucket for logos ----------
insert into storage.buckets (id, name, public)
values ('logos', 'logos', true)
on conflict (id) do nothing;

-- storage policies: public read, users write to own folder
drop policy if exists "logos public read" on storage.objects;
create policy "logos public read" on storage.objects
  for select using (bucket_id = 'logos');

drop policy if exists "logos user insert own" on storage.objects;
create policy "logos user insert own" on storage.objects
  for insert with check (bucket_id = 'logos' and auth.role() = 'authenticated' and (storage.foldername(name))[1] = auth.uid()::text);

-- ---------- RLS ----------
alter table public.companies enable row level security;
alter table public.funding_rounds enable row level security;
alter table public.investors enable row level security;
alter table public.investments enable row level security;
alter table public.jobs enable row level security;
alter table public.hackathons enable row level security;
alter table public.articles enable row level security;
alter table public.reports enable row level security;
alter table public.salary_bands enable row level security;
alter table public.wire_items enable row level security;
alter table public.trend_items enable row level security;
alter table public.profiles enable row level security;
alter table public.bookmarks enable row level security;
alter table public.follows enable row level security;
alter table public.logo_claims enable row level security;
alter table public.startup_submissions enable row level security;
alter table public.intro_requests enable row level security;
alter table public.data_issues enable row level security;
alter table public.subscribers enable row level security;
alter table public.trials enable row level security;
alter table public.events enable row level security;

-- public read
create policy "pub read companies" on public.companies for select using (true);
create policy "pub read rounds" on public.funding_rounds for select using (true);
create policy "pub read investors" on public.investors for select using (true);
create policy "pub read investments" on public.investments for select using (true);
create policy "pub read jobs" on public.jobs for select using (true);
create policy "pub read hackathons" on public.hackathons for select using (true);
create policy "pub read articles" on public.articles for select using (true);
create policy "pub read reports" on public.reports for select using (true);
create policy "pub read salary" on public.salary_bands for select using (true);
create policy "pub read wire" on public.wire_items for select using (true);
create policy "pub read trends" on public.trend_items for select using (true);

-- profiles: own row only
create policy "own profile" on public.profiles for select using (auth.uid() = id);
create policy "own profile upd" on public.profiles for update using (auth.uid() = id);

-- user rows: own only
create policy "own bookmarks" on public.bookmarks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own follows" on public.follows for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own logo claims" on public.logo_claims for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own submissions" on public.startup_submissions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own intros" on public.intro_requests for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own issues" on public.data_issues for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- anyone can subscribe / start trial / log analytics event (insert only)
create policy "anon subscribe" on public.subscribers for insert with check (true);
create policy "anon trial" on public.trials for insert with check (true);
create policy "anon events" on public.events for insert with check (true);
