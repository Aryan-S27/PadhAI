// src/lib/gemini.js
// ⚠️  DEPRECATED — DO NOT USE
//
// This file called Gemini directly from the browser, exposing VITE_GEMINI_API_KEY
// to anyone with devtools open. It also used the wrong embedding model.
//
// ✅  Use src/lib/api.js instead:
//     import api from './api'
//     const result = await api.simplify({ subject_code, topic })
//
// All AI calls now go through Supabase Edge Functions.
// The Gemini API key is stored as a Supabase secret (server-side only).

export function askPadhAI() {
  throw new Error(
    "gemini.js is deprecated. Use api.js instead:\n" +
    "  import api from './api'\n" +
    "  api.score({ subject_code, question, marks, student_answer })"
  );
}
