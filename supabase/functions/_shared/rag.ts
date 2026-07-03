// supabase/functions/_shared/rag.ts
// Shared RAG retriever: embed query → pgvector search → return chunks.
// Used by all 4 AI tool functions.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { embedText } from "./gemini.ts";

export interface RagChunk {
  id: string;
  content: string;
  metadata: Record<string, unknown>;
  subject_code: string;
  similarity: number;
}

export interface RetrieveOptions {
  subjectCode: string;
  docTypeFilter?: "past_paper" | "syllabus" | "notes" | "model_answer" | null;
  matchCount?: number;
  similarityThreshold?: number;
}

/**
 * Embed the query text, then run pgvector cosine similarity search
 * against document_chunks filtered by subject and optional doc type.
 */
export async function retrieveChunks(
  query: string,
  options: RetrieveOptions,
): Promise<RagChunk[]> {
  const {
    subjectCode,
    docTypeFilter = null,
    matchCount = 6,
    similarityThreshold = 0.30,
  } = options;

  // 1. Embed the query with text-embedding-004
  const queryEmbedding = await embedText(query);

  // 2. Build Supabase client with service role (needed for reading chunks)
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  // 3. Call the match_documents RPC (defined in migration 005)
  const { data, error } = await supabase.rpc("match_documents", {
    query_embedding: queryEmbedding,
    subject_filter: subjectCode,
    doc_type_filter: docTypeFilter,
    match_count: matchCount,
    similarity_threshold: similarityThreshold,
  });

  if (error) {
    throw new Error(`RAG retrieval failed: ${error.message}`);
  }

  return (data as RagChunk[]) ?? [];
}

/**
 * Format retrieved chunks into a string block for Gemini's system context.
 */
export function formatChunksAsContext(chunks: RagChunk[]): string {
  if (!chunks.length) return "No relevant documents found in knowledge base.";

  return chunks
    .map((chunk, i) => {
      const meta = chunk.metadata;
      const label = [
        meta.doc_type ? `[${String(meta.doc_type).toUpperCase()}]` : "",
        meta.year_of_exam ? `Year: ${meta.year_of_exam}` : "",
        meta.question_num ? `Q${meta.question_num}` : "",
        meta.marks ? `${meta.marks}m` : "",
        meta.topic ? `Topic: ${meta.topic}` : "",
      ]
        .filter(Boolean)
        .join(" | ");

      return `--- Context ${i + 1} ${label} (similarity: ${chunk.similarity.toFixed(2)}) ---\n${chunk.content}`;
    })
    .join("\n\n");
}
