-- ═══════════════════════════════════════════════════════
-- Migration 005: document_chunks + vector index + RPC (idempotent)
-- Requires: pgvector (001) + documents (004)
-- ═══════════════════════════════════════════════════════
create table if not exists public.document_chunks (
  id             uuid primary key default gen_random_uuid(),
  document_id    uuid references public.documents(id) on delete cascade,
  subject_id     uuid references public.subjects(id) on delete set null,
  subject_code   text not null,
  chunk_index    integer not null,
  content        text not null,
  metadata       jsonb default '{}',
  embedding      vector(768),
  created_at     timestamptz default now()
);

create index if not exists document_chunks_subject_code_idx
  on public.document_chunks (subject_code);

-- IVFFlat index — only create if not already present
do $$
begin
  if not exists (
    select 1 from pg_indexes
    where tablename = 'document_chunks'
    and indexname = 'document_chunks_embedding_idx'
  ) then
    create index document_chunks_embedding_idx
      on public.document_chunks
      using ivfflat (embedding vector_cosine_ops)
      with (lists = 100);
  end if;
end $$;

alter table public.document_chunks enable row level security;

drop policy if exists "Authenticated users can read chunks" on public.document_chunks;
create policy "Authenticated users can read chunks"
  on public.document_chunks for select
  using (auth.role() = 'authenticated');

drop policy if exists "Service role can manage chunks" on public.document_chunks;
create policy "Service role can manage chunks"
  on public.document_chunks for all
  using (auth.role() = 'service_role');

-- match_documents RPC (replace existing if any)
create or replace function public.match_documents(
  query_embedding    vector(768),
  subject_filter     text,
  doc_type_filter    text    default null,
  match_count        integer default 6,
  similarity_threshold float  default 0.30
)
returns table (
  id             uuid,
  content        text,
  metadata       jsonb,
  subject_code   text,
  similarity     float
)
language sql
stable
as $$
  select
    dc.id,
    dc.content,
    dc.metadata,
    dc.subject_code,
    (1 - (dc.embedding <=> query_embedding))::float as similarity
  from public.document_chunks dc
  join public.documents d on dc.document_id = d.id
  where
    dc.subject_code = subject_filter
    and (doc_type_filter is null or d.type = doc_type_filter)
    and dc.embedding is not null
    and (1 - (dc.embedding <=> query_embedding)) > similarity_threshold
  order by dc.embedding <=> query_embedding
  limit match_count;
$$;
