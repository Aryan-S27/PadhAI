-- ═══════════════════════════════════════════════════════
-- Migration 003: subjects catalogue
-- Master list of MU subjects. Used for RAG filtering
-- and driving Scope / CrashMode context.
-- ═══════════════════════════════════════════════════════
create table public.subjects (
  id           uuid primary key default gen_random_uuid(),
  code         text unique not null,  -- e.g. 'MU-CS-SEM5-OS'
  name         text not null,         -- 'Operating Systems'
  short_name   text,                  -- 'OS'
  branch       text not null,         -- 'CS', 'IT', 'EXTC'
  year         smallint not null,
  semester     smallint not null,
  total_marks  smallint default 60,
  modules      jsonb default '[]',    -- [{num,title,topics:[]}]
  is_active    boolean default true,
  created_at   timestamptz default now()
);

-- Public read — no login required to query subject list
alter table public.subjects enable row level security;

create policy "Public can read subjects"
  on public.subjects for select
  using (true);
