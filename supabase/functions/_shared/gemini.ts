// supabase/functions/_shared/gemini.ts
// Shared Gemini API caller for all Edge Functions.
// API key is read from Supabase secret (GEMINI_API_KEY) — never exposed to client.

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com";
const API_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";

// ── Embedding ─────────────────────────────────────────────────────────────────
// Uses text-embedding-004: produces float32[768] for pgvector storage.

export async function embedText(text: string): Promise<number[]> {
  const url = `${GEMINI_API_BASE}/v1beta/models/gemini-embedding-2:embedContent?key=${API_KEY}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "models/gemini-embedding-2",
      content: { parts: [{ text }] },
      taskType: "RETRIEVAL_QUERY",  // optimises embedding for similarity search
      outputDimensionality: 768,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini embed error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const values: number[] = data?.embedding?.values;

  if (!values?.length) {
    throw new Error("Gemini returned empty embedding");
  }

  return values; // float32[768]
}

// ── Text generation ───────────────────────────────────────────────────────────
// Uses gemini-3.5-flash for fast, cost-effective generation.

export interface GeminiMessage {
  role: "user" | "model";
  parts: Array<{ text: string }>;
}

export async function generateText(
  systemInstruction: string,
  messages: GeminiMessage[],
  temperature = 0.4,
): Promise<string> {
  const url = `${GEMINI_API_BASE}/v1beta/models/gemini-3.5-flash:generateContent?key=${API_KEY}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemInstruction }] },
      contents: messages,
      generationConfig: {
        temperature,
        maxOutputTokens: 2048,
        topP: 0.95,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini generate error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Gemini returned empty response");
  }

  return text;
}
