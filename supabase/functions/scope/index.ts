// supabase/functions/scope/index.ts
// Ranks MU syllabus topics by exam priority using past paper frequency data.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { generateText } from "../_shared/gemini.ts";
import { retrieveChunks, formatChunksAsContext } from "../_shared/rag.ts";

const SYSTEM_PROMPT = `You are PadhAI's Scope analyzer. Your job is to analyze Mumbai University past papers and rank syllabus topics by exam priority.

MU exam format: 60 marks, 5 questions × 12 marks, students answer any 4.
You have access to past paper question data from the knowledge base.

Your analysis must be:
- Based ONLY on patterns in the retrieved past paper data
- Specific: mention which years a topic appeared
- Actionable: clear priority tiers (MUST STUDY / HIGH / MEDIUM / CAN SKIP)
- Honest: if data is insufficient, say so

Return valid JSON only.`;

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
      p_user_id: user.id, p_module: "scope", p_limit: 10,
    });
    if (!withinLimit) {
      return new Response(JSON.stringify({ error: "Daily limit reached (10 scope analyses/day)" }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { subject_code } = await req.json();
    if (!subject_code) {
      return new Response(JSON.stringify({ error: "subject_code required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch subject module data for full topic list
    const { data: subject } = await supabase
      .from("subjects")
      .select("modules, name")
      .eq("code", subject_code)
      .single();

    // RAG: retrieve many past paper chunks to build frequency picture
    const startTime = Date.now();
    const chunks = await retrieveChunks("question topics marks syllabus distribution exam", {
      subjectCode: subject_code,
      docTypeFilter: "past_paper",
      matchCount: 20,          // more chunks = better frequency analysis
      similarityThreshold: 0.20,
    });
    const context = formatChunksAsContext(chunks);

    const modulesText = subject?.modules
      ? JSON.stringify(subject.modules, null, 2)
      : "Modules not available in DB";

    const userPrompt = `SUBJECT: ${subject?.name ?? subject_code}

SYLLABUS MODULES:
${modulesText}

PAST PAPER QUESTION DATA (retrieved from knowledge base):
${context}

---
Analyze the past papers. For each topic in the syllabus, determine:
1. How many times it appeared (across all years in the data)
2. Which years it appeared
3. Typical marks allocation (12m, 6m, 4m, 2m)
4. Priority tier

Return ONLY this JSON structure:
{
  "subject": "${subject_code}",
  "data_coverage": "<e.g. '2019-2024 (5 papers)'>",
  "ranked_topics": [
    {
      "topic": "<topic name>",
      "module": <module number>,
      "priority": "<MUST_STUDY|HIGH|MEDIUM|LOW|SKIP>",
      "frequency": "<e.g. '4 of 5 years'>",
      "years_appeared": [2024, 2023, 2022, 2021],
      "typical_marks": "<e.g. '12m (3×), 6m (1×)'>",
      "tip": "<specific exam tip>"
    }
  ],
  "guaranteed_topics": ["<topic>"],
  "safe_to_skip": ["<topic>"],
  "study_order": ["<topic in order of importance>"]
}`;

    const rawResponse = await generateText(SYSTEM_PROMPT, [
      { role: "user", parts: [{ text: userPrompt }] },
    ], 0.2); // low temperature for factual analysis

    let result;
    try {
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      result = JSON.parse(jsonMatch?.[0] ?? rawResponse);
    } catch {
      result = { raw: rawResponse };
    }

    await supabase.from("sessions").insert({
      user_id: user.id,
      module: "scope",
      subject_code,
      input: { subject_code },
      output: JSON.stringify(result),
      chunks_used: chunks.map((c) => ({ id: c.id, similarity: c.similarity })),
      duration_ms: Date.now() - startTime,
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Scope function error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
