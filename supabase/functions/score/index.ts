// supabase/functions/score/index.ts
// Grades a student's answer like an MU examiner using RAG context.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { generateText } from "../_shared/gemini.ts";
import { retrieveChunks, formatChunksAsContext } from "../_shared/rag.ts";

const SYSTEM_PROMPT = `You are a strict Mumbai University examiner grading a student's answer.

MU exam format: 60-mark papers, 5 questions of 12 marks each, students answer any 4.
You must grade exactly like an MU internal examiner — reward keywords, structured answers, examples, and diagrams mentions.

When grading:
1. Award marks out of the total specified
2. List what was correct (keyword hits, correct definitions, examples)
3. List what was missing (expected keywords, concepts, examples)
4. Show the keywords the examiner EXPECTS to see
5. Suggest the ideal answer structure
6. Give a one-line tip for exam improvement

Be direct, specific, and constructive. Base your evaluation on the provided context from past papers and model answers.`;

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // ── Auth ────────────────────────────────────────────────
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

    // ── Rate limit ──────────────────────────────────────────
    const { data: withinLimit } = await supabase.rpc("check_and_increment_usage", {
      p_user_id: user.id, p_module: "score", p_limit: 20,
    });
    if (!withinLimit) {
      return new Response(JSON.stringify({ error: "Daily limit reached (20 scores/day)" }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Parse request ───────────────────────────────────────
    const { subject_code, question, marks, student_answer } = await req.json();

    if (!subject_code || !question || !marks || !student_answer) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── RAG: retrieve ideal answer context ──────────────────
    const startTime = Date.now();
    const chunks = await retrieveChunks(question, {
      subjectCode: subject_code,
      docTypeFilter: "past_paper",
      matchCount: 8,
      similarityThreshold: 0.28,
    });
    const context = formatChunksAsContext(chunks);

    // ── Gemini: grade the answer ─────────────────────────────
    const userPrompt = `RETRIEVED CONTEXT FROM MU PAST PAPERS:
${context}

---
QUESTION: ${question}
MARKS: ${marks}

STUDENT'S ANSWER:
${student_answer}

---
Grade this answer strictly like an MU examiner. Award marks out of ${marks}.
Return your response as a JSON object with this exact structure:
{
  "marks_awarded": <number>,
  "marks_total": ${marks},
  "percentage": <number>,
  "grade": "<Excellent|Good|Average|Below Average|Poor>",
  "feedback": {
    "correct": [<list of what was correct>],
    "missing": [<list of what was missing>],
    "keywords_expected": [<keywords examiner expects>],
    "keywords_found": [<keywords student used>]
  },
  "ideal_structure": "<brief outline of ideal answer>",
  "exam_tip": "<one specific improvement tip>"
}`;

    const rawResponse = await generateText(SYSTEM_PROMPT, [
      { role: "user", parts: [{ text: userPrompt }] },
    ]);

    // Parse JSON from Gemini response (it may wrap in markdown code blocks)
    let result;
    try {
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      result = JSON.parse(jsonMatch?.[0] ?? rawResponse);
    } catch {
      result = { raw: rawResponse };
    }

    const duration = Date.now() - startTime;

    // ── Log session ─────────────────────────────────────────
    await supabase.from("sessions").insert({
      user_id: user.id,
      module: "score",
      subject_code,
      input: { question, marks, student_answer_length: student_answer.length },
      output: JSON.stringify(result),
      chunks_used: chunks.map((c) => ({ id: c.id, similarity: c.similarity })),
      duration_ms: duration,
    });

    return new Response(JSON.stringify({ session_id: null, ...result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Score function error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
