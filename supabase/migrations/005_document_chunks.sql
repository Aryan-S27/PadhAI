-- ═══════════════════════════════════════════════════════
-- Migration 005: document_chunks + vector index + RPC
-- THE core RAG table.
-- Each row = one ~400-token chunk with a 768-dim embedding.
-- Requires: pgvector (migration 001) + documents (004)
-- ═══════════════════════════════════════════════════════

-- ── Core table ───────────────────────────────────────────
create table public.document_chunks (
  id             uuid primary key default gen_random_uuid(),
  document_id    uuid references public.documents(id) on delete cascade,
  subject_id     uuid references public.subjects(id) on delete set null,
  subject_code   text not null,         -- denormalized: 'MU-CS-SEM5-OS'
  chunk_index    integer not null,      -- order within the document
  content        text not null,         -- raw text (~400 tokens)
  metadata       jsonb default '{}',    -- { page, year_of_exam, question_num, marks, topic, doc_type }
  embedding      vector(768),           -- text-embedding-004 output
  created_at     timestamptz default now()
);

-- ── Indexes ──────────────────────────────────────────────
-- Subject filter (used on every query before ANN search)
create index on public.document_chunks (subject_code);

-- Composite: subject + doc type for Scope (past_paper filter)
create index on public.document_chunks (subject_code, (metadata->>'doc_type'));

-- IVFFlat approximate nearest-neighbour index
-- lists = 100 is good for up to ~1M vectors; increase for larger corpora
create index on public.document_chunks
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- ── RLS ──────────────────────────────────────────────────
alter table public.document_chunks enable row level security;

-- All authenticated users can read chunks (RAG retrieval)
create policy "Authenticated users can read chunks"
  on public.document_chunks for select
  using (auth.role() = 'authenticated');

-- Only service_role can write chunks (ingestion pipeline)
create policy "Service role can manage chunks"
  on public.document_chunks for all
  using (auth.role() = 'service_role');

-- ── match_documents RPC ───────────────────────────────────
-- Called by every Edge Function to retrieve relevant context.
-- Performs: subject filter → cosine similarity → top-k
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
