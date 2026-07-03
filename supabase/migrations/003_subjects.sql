-- ═══════════════════════════════════════════════════════
-- Migration 003: subjects catalogue (idempotent)
-- ═══════════════════════════════════════════════════════
create table if not exists public.subjects (
  id           uuid primary key default gen_random_uuid(),
  code         text unique not null,
  name         text not null,
  short_name   text,
  branch       text not null,
  year         smallint not null,
  semester     smallint not null,
  total_marks  smallint default 60,
  modules      jsonb default '[]',
  is_active    boolean default true,
  created_at   timestamptz default now()
);

alter table public.subjects add column if not exists short_name text;
alter table public.subjects add column if not exists is_active boolean default true;

alter table public.subjects enable row level security;

drop policy if exists "Public can read subjects" on public.subjects;
create policy "Public can read subjects"
  on public.subjects for select
  using (true);
