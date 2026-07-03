-- ═══════════════════════════════════════════════════════
-- Migration 004: documents table
-- Tracks PDFs stored in Supabase Storage.
-- One document → many chunks (document_chunks).
-- ═══════════════════════════════════════════════════════
create table public.documents (
  id             uuid primary key default gen_random_uuid(),
  subject_id     uuid references public.subjects(id) on delete set null,
  subject_code   text not null,          -- denormalized for fast joins
  type           text not null check (type in ('past_paper', 'syllabus', 'notes', 'model_answer')),
  year_of_exam   smallint,               -- e.g. 2023 (for past_paper type)
  title          text not null,
  storage_path   text not null,          -- path in Supabase Storage bucket 'padhai-docs'
  status         text not null default 'pending'
                   check (status in ('pending', 'processing', 'done', 'error')),
  error_message  text,                   -- populated if status = 'error'
  chunk_count    integer default 0,
  uploaded_by    uuid references auth.users(id),
  created_at     timestamptz default now()
);

create index on public.documents (subject_code, type);
create index on public.documents (status);

-- Public read — students can see what documents are available
alter table public.documents enable row level security;

create policy "Public can read documents"
  on public.documents for select
  using (true);

-- Only service_role (backend) can insert/update/delete
create policy "Service role can manage documents"
  on public.documents for all
  using (auth.role() = 'service_role');
