-- ============================================================
--  Supabase schema for the Body Transformation Daily Log
--  Run this in: Supabase Dashboard -> SQL Editor -> New query
-- ============================================================

create table if not exists public.daily_logs (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  log_date      date not null,
  weight        numeric,
  waist         numeric,
  workout_name  text,
  notes         text,
  checks        jsonb default '{}'::jsonb,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),
  unique (user_id, log_date)
);

-- Keep updated_at fresh on upsert/update
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_daily_logs_updated on public.daily_logs;
create trigger trg_daily_logs_updated
  before update on public.daily_logs
  for each row execute function public.set_updated_at();

-- Row Level Security: each user can only see/edit their own rows
alter table public.daily_logs enable row level security;

drop policy if exists "own rows - select" on public.daily_logs;
create policy "own rows - select" on public.daily_logs
  for select using (auth.uid() = user_id);

drop policy if exists "own rows - insert" on public.daily_logs;
create policy "own rows - insert" on public.daily_logs
  for insert with check (auth.uid() = user_id);

drop policy if exists "own rows - update" on public.daily_logs;
create policy "own rows - update" on public.daily_logs
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own rows - delete" on public.daily_logs;
create policy "own rows - delete" on public.daily_logs
  for delete using (auth.uid() = user_id);

-- ============================================================
--  Goals
-- ============================================================
create table if not exists public.goals (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  title         text not null,
  type          text default 'weight',
  target_value  numeric,
  deadline      date,
  achieved      boolean default false,
  created_at    timestamptz default now()
);
alter table public.goals enable row level security;
drop policy if exists "goals owner" on public.goals;
create policy "goals owner" on public.goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
--  Progress photos (metadata; files live in Storage bucket)
-- ============================================================
create table if not exists public.photos (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  storage_path  text not null,
  pose          text,
  weight        numeric,
  taken_on      date default current_date,
  note          text,
  created_at    timestamptz default now()
);
alter table public.photos enable row level security;
drop policy if exists "photos owner" on public.photos;
create policy "photos owner" on public.photos
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
--  AI-generated plans
-- ============================================================
create table if not exists public.ai_plans (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  title         text not null,
  params        jsonb default '{}'::jsonb,
  content       text,
  created_at    timestamptz default now()
);
alter table public.ai_plans enable row level security;
drop policy if exists "ai_plans owner" on public.ai_plans;
create policy "ai_plans owner" on public.ai_plans
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
--  Storage bucket policies for progress photos
--  (Run after creating a PUBLIC bucket named 'progress-photos')
-- ============================================================
insert into storage.buckets (id, name, public)
values ('progress-photos', 'progress-photos', true)
on conflict (id) do nothing;

drop policy if exists "photo upload own folder" on storage.objects;
create policy "photo upload own folder" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "photo read public" on storage.objects;
create policy "photo read public" on storage.objects
  for select using (bucket_id = 'progress-photos');

drop policy if exists "photo delete own" on storage.objects;
create policy "photo delete own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = auth.uid()::text);
