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
