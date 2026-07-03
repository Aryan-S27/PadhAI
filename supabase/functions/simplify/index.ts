// supabase/functions/simplify/index.ts
// Explains a concept clearly using Indian analogies for MU students.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { generateText } from "../_shared/gemini.ts";
import { retrieveChunks, formatChunksAsContext } from "../_shared/rag.ts";

const SYSTEM_PROMPT = `You are PadhAI's Simplify tutor for Mumbai University Engineering students.

Your teaching style:
1. Start with a relatable Indian everyday analogy (chai shop, local train, cricket, etc.)
2. Build intuition from the analogy to the technical concept
3. Give the formal textbook definition clearly
4. Provide a worked example if applicable
5. End with "What a full-marks answer needs:" — specific exam keywords and structure

Never be vague. Never say "it's complex." Make it crystal clear.
Always ground explanations in the retrieved knowledge base context.`;

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: withinLimit } = await supabase.rpc("check_and_increment_usage", {
      p_user_id: user.id, p_module: "simplify", p_limit: 30,
    });
    if (!withinLimit) {
      return new Response(JSON.stringify({ error: "Daily limit reached (30 explanations/day)" }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { subject_code, topic, level = "exam-ready" } = await req.json();
    if (!subject_code || !topic) {
      return new Response(JSON.stringify({ error: "Missing: subject_code, topic" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // RAG: retrieve textbook/notes content on this topic
    const startTime = Date.now();
    const chunks = await retrieveChunks(topic, {
      subjectCode: subject_code,
      docTypeFilter: null,      // search across all doc types
      matchCount: 5,
      similarityThreshold: 0.25,
    });
    const context = formatChunksAsContext(chunks);

    const userPrompt = `SUBJECT: ${subject_code}
TOPIC TO EXPLAIN: ${topic}
LEVEL: ${level} (${level === "beginner" ? "focus on intuition and analogy" : "balance intuition with exam precision"})

KNOWLEDGE BASE CONTEXT:
${context}

---
Explain "${topic}" in a way that makes it unforgettable and exam-ready.
Follow the structure:
1. 🍵 Indian Analogy: (relatable everyday example)
2. 📚 Technical Concept: (formal definition)
3. 🔧 How It Works: (mechanism / algorithm steps)
4. 💡 Worked Example: (if applicable)
5. ✅ What a Full-Marks Answer Needs:
   - Must-use keywords: [list]
   - Structure: [outline]
   - Common mistakes to avoid: [list]`;

    const explanation = await generateText(SYSTEM_PROMPT, [
      { role: "user", parts: [{ text: userPrompt }] },
    ], 0.5); // slightly higher temperature for creative analogies

    await supabase.from("sessions").insert({
      user_id: user.id,
      module: "simplify",
      subject_code,
      input: { topic, level },
      output: explanation,
      chunks_used: chunks.map((c) => ({ id: c.id, similarity: c.similarity })),
      duration_ms: Date.now() - startTime,
    });

    return new Response(JSON.stringify({ explanation, chunks_count: chunks.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Simplify error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
