-- ═══════════════════════════════════════════════════════
-- Migration 002: profiles table
-- Extends auth.users with MU student metadata.
-- Auto-populated via trigger on signup.
-- ═══════════════════════════════════════════════════════
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  name         text not null default '',
  branch       text not null default '',   -- 'CS', 'IT', 'EXTC', 'MECH', etc.
  year         smallint not null default 1, -- 1–4
  semester     smallint,                    -- auto-derived or set manually
  college      text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- ── Auto-create profile on user signup ───────────────────
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

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── RLS ──────────────────────────────────────────────────
alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);
