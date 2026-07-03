-- ═══════════════════════════════════════════════════════
-- Migration 002: profiles table (idempotent)
-- ═══════════════════════════════════════════════════════
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  name         text not null default '',
  branch       text not null default '',
  year         smallint not null default 1,
  semester     smallint,
  college      text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- Add missing columns if the table already existed
alter table public.profiles add column if not exists college text;
alter table public.profiles add column if not exists updated_at timestamptz default now();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, branch, year)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'branch', ''),
    coalesce((new.raw_user_meta_data->>'year')::smallint, 1)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Drop and recreate trigger to ensure it's up-to-date
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);
