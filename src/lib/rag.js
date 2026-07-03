// src/lib/rag.js
// ⚠️  DEPRECATED — DO NOT USE
//
// Issues with the old implementation:
//   1. Used gemini-2.0-flash (text generation) to create embeddings — WRONG.
//      The correct model is text-embedding-004, which outputs float32[768].
//   2. Called Google's API directly from the browser — API key exposed.
//   3. The embedding output was text (prose), not a vector — pgvector couldn't use it.
//
// ✅  The fixed RAG pipeline now lives in:
//     supabase/functions/_shared/rag.ts   (server-side retriever)
//     supabase/functions/_shared/gemini.ts (embedText with text-embedding-004)
//
// Frontend just calls: import api from './api'

export function retrieveChunks() {
  throw new Error(
    "rag.js is deprecated. RAG now runs server-side in Supabase Edge Functions.\n" +
    "Use api.js instead:\n" +
    "  import api from './api'\n" +
    "  api.score({ subject_code, question, marks, student_answer })"
  );
}
