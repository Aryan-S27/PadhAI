// src/lib/localLlm.js
// Handles communication with the local Ollama instance (chat completions and embeddings).
// Bypasses Gemini API quota completely during local development.

const OLLAMA_HOST = "http://localhost:11434";

// Read configurations with secure fallbacks
const LLM_MODEL = import.meta.env.VITE_LOCAL_LLM_MODEL || "llama3.1";
const EMBED_MODEL = import.meta.env.VITE_LOCAL_EMBED_MODEL || "nomic-embed-text";

/**
 * Verifies if Ollama is running locally.
 */
export async function checkOllamaRunning() {
  try {
    const res = await fetch(`${OLLAMA_HOST}/api/tags`);
    if (res.ok) {
      const data = await res.json();
      const models = data?.models || [];
      const hasLlm = models.some(m => m.name.startsWith(LLM_MODEL));
      const hasEmbed = models.some(m => m.name.startsWith(EMBED_MODEL));

      return {
        running: true,
        hasLlm,
        hasEmbed,
        models: models.map(m => m.name)
      };
    }
  } catch (err) {
    // Ignore and return false
  }
  return { running: false, hasLlm: false, hasEmbed: false, models: [] };
}

/**
 * Generate 768-dimensional text embeddings locally using Ollama and nomic-embed-text.
 */
export async function embedTextLocal(text) {
  try {
    const res = await fetch(`${OLLAMA_HOST}/api/embeddings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: EMBED_MODEL,
        prompt: text
      })
    });

    if (!res.ok) {
      throw new Error(`Ollama embedding status: ${res.status}`);
    }

    const data = await res.json();
    if (!data?.embedding?.length) {
      throw new Error("Local embedding returned empty array");
    }
    return data.embedding;
  } catch (err) {
    throw new Error(`Local embedding failed: ${err.message}. Ensure Ollama is running and you pulled '${EMBED_MODEL}' model.`);
  }
}

/**
 * Generate completions locally using Ollama and Llama 3.1 or Gemma 2.
 */
export async function generateChatLocal(systemPrompt, userMessage, jsonMode = false) {
  try {
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage }
    ];

    const payload = {
      model: LLM_MODEL,
      messages,
      stream: false,
      options: {
        temperature: 0.3,
        num_ctx: 8192
      }
    };

    if (jsonMode) {
      payload.format = "json";
    }

    const res = await fetch(`${OLLAMA_HOST}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error(`Ollama chat status: ${res.status}`);
    }

    const data = await res.json();
    const text = data?.message?.content;
    if (!text) {
      throw new Error("Ollama returned empty response message");
    }
    return text;
  } catch (err) {
    throw new Error(`Local LLM generation failed: ${err.message}. Ensure Ollama is running and you pulled '${LLM_MODEL}'.`);
  }
}
