-- ═══════════════════════════════════════════════════════
-- Migration 006: sessions table (idempotent)
-- ═══════════════════════════════════════════════════════
create table if not exists public.sessions (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users(id) on delete cascade,
  module         text not null check (module in ('crash_mode', 'scope', 'simplify', 'score')),
  subject_code   text,
  input          jsonb not null default '{}',
  output         text,
  chunks_used    jsonb default '[]',
  tokens_in      integer,
  tokens_out     integer,
  duration_ms    integer,
  error          text,
  created_at     timestamptz default now()
);

alter table public.sessions add column if not exists error text;
alter table public.sessions add column if not exists duration_ms integer;

create index if not exists sessions_user_module_idx
  on public.sessions (user_id, module, created_at desc);
create index if not exists sessions_user_idx
  on public.sessions (user_id, created_at desc);

alter table public.sessions enable row level security;

drop policy if exists "Users can read own sessions" on public.sessions;
create policy "Users can read own sessions"
  on public.sessions for select
  using (auth.uid() = user_id);

drop policy if exists "Service role can insert sessions" on public.sessions;
create policy "Service role can insert sessions"
  on public.sessions for insert
  with check (auth.role() = 'service_role');
