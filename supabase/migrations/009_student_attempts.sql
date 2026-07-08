-- ═══════════════════════════════════════════════════════
-- Migration 009: student_attempts tracking (idempotent)
-- ═══════════════════════════════════════════════════════

create table if not exists public.student_attempts (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  question_id    uuid not null references public.question_bank(id) on delete cascade,
  student_answer text not null,
  grading_result jsonb not null,
  created_at     timestamptz default now(),
  
  -- Prevent multiple entries per user-question combo
  constraint unique_user_question_attempt unique (user_id, question_id)
);

-- Enable RLS
alter table public.student_attempts enable row level security;

-- Policies for select, insert, update, and delete
drop policy if exists "Users can select their own attempts" on public.student_attempts;
create policy "Users can select their own attempts"
  on public.student_attempts for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own attempts" on public.student_attempts;
create policy "Users can insert their own attempts"
  on public.student_attempts for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own attempts" on public.student_attempts;
create policy "Users can update their own attempts"
  on public.student_attempts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own attempts" on public.student_attempts;
create policy "Users can delete their own attempts"
  on public.student_attempts for delete
  using (auth.uid() = user_id);
