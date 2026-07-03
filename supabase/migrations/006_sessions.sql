-- ═══════════════════════════════════════════════════════
-- Migration 006: sessions table
-- Logs every AI tool invocation for history + analytics.
-- ═══════════════════════════════════════════════════════
create table public.sessions (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users(id) on delete cascade,
  module         text not null check (module in ('crash_mode', 'scope', 'simplify', 'score')),
  subject_code   text,
  input          jsonb not null default '{}',  -- the request payload
  output         text,                          -- Gemini's full response text
  chunks_used    jsonb default '[]',            -- [{id, similarity, content_preview}]
  tokens_in      integer,
  tokens_out     integer,
  duration_ms    integer,
  error          text,                          -- null if successful
  created_at     timestamptz default now()
);

create index on public.sessions (user_id, module, created_at desc);
create index on public.sessions (user_id, created_at desc);

-- ── RLS ──────────────────────────────────────────────────
alter table public.sessions enable row level security;

create policy "Users can read own sessions"
  on public.sessions for select
  using (auth.uid() = user_id);

-- Service role (Edge Functions) inserts sessions
create policy "Service role can insert sessions"
  on public.sessions for insert
  with check (auth.role() = 'service_role');
