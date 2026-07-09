-- ═══════════════════════════════════════════════════════
-- Migration 012: user_topic_progress tracking (idempotent)
-- ═══════════════════════════════════════════════════════

create table if not exists public.user_topic_progress (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.profiles(id) on delete cascade,
  subject_code        text not null,
  module_name         text not null,
  questions_attempted integer not null default 0,
  questions_correct   integer not null default 0,
  doubts_raised       integer not null default 0,
  last_doubt_at       timestamptz,
  time_spent_mins     integer not null default 0,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now(),
  
  constraint unique_user_subject_module unique (user_id, subject_code, module_name)
);

-- Enable RLS
alter table public.user_topic_progress enable row level security;

-- Policies for select, insert, update, and delete
drop policy if exists "Users can select their own progress" on public.user_topic_progress;
create policy "Users can select their own progress"
  on public.user_topic_progress for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own progress" on public.user_topic_progress;
create policy "Users can insert their own progress"
  on public.user_topic_progress for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own progress" on public.user_topic_progress;
create policy "Users can update their own progress"
  on public.user_topic_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own progress" on public.user_topic_progress;
create policy "Users can delete their own progress"
  on public.user_topic_progress for delete
  using (auth.uid() = user_id);
