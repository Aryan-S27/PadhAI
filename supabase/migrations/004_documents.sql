-- ═══════════════════════════════════════════════════════
-- Migration 004: documents table (idempotent)
-- ═══════════════════════════════════════════════════════
create table if not exists public.documents (
  id             uuid primary key default gen_random_uuid(),
  subject_id     uuid references public.subjects(id) on delete set null,
  subject_code   text not null,
  type           text not null check (type in ('past_paper', 'syllabus', 'notes', 'model_answer')),
  year_of_exam   smallint,
  title          text not null,
  storage_path   text not null,
  status         text not null default 'pending'
                   check (status in ('pending', 'processing', 'done', 'error')),
  error_message  text,
  chunk_count    integer default 0,
  uploaded_by    uuid references auth.users(id),
  created_at     timestamptz default now()
);

alter table public.documents add column if not exists error_message text;

create index if not exists documents_subject_code_type_idx on public.documents (subject_code, type);
create index if not exists documents_status_idx on public.documents (status);

alter table public.documents enable row level security;

drop policy if exists "Public can read documents" on public.documents;
create policy "Public can read documents"
  on public.documents for select
  using (true);

drop policy if exists "Service role can manage documents" on public.documents;
create policy "Service role can manage documents"
  on public.documents for all
  using (auth.role() = 'service_role');
