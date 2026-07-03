-- ═══════════════════════════════════════════════════════
-- Migration 007: usage_logs — per-user daily rate limiting
-- Prevents API abuse without needing Redis.
-- ═══════════════════════════════════════════════════════
create table public.usage_logs (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade,
  module       text not null,
  date         date not null default current_date,
  call_count   integer not null default 1,
  unique (user_id, module, date)
);

create index on public.usage_logs (user_id, date);

-- ── Helper function called by Edge Functions ─────────────
-- Returns true if user is within limit, false if exceeded.
-- Also increments the counter atomically.
create or replace function public.check_and_increment_usage(
  p_user_id  uuid,
  p_module   text,
  p_limit    integer default 20   -- max calls per day per module
)
returns boolean
language plpgsql
security definer
as $$
declare
  current_count integer;
begin
  insert into public.usage_logs (user_id, module, date, call_count)
  values (p_user_id, p_module, current_date, 1)
  on conflict (user_id, module, date)
  do update set call_count = usage_logs.call_count + 1
  returning call_count into current_count;

  return current_count <= p_limit;
end;
$$;

-- ── RLS ──────────────────────────────────────────────────
alter table public.usage_logs enable row level security;

create policy "Users can read own usage"
  on public.usage_logs for select
  using (auth.uid() = user_id);

create policy "Service role can manage usage"
  on public.usage_logs for all
  using (auth.role() = 'service_role');
