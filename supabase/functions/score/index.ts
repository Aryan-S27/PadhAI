// supabase/functions/score/index.ts
// Handles practicing (generating MCQ/theory questions) and grading student answers.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { generateText } from "../_shared/gemini.ts";
import { retrieveChunks, formatChunksAsContext } from "../_shared/rag.ts";

const GRADING_SYSTEM_PROMPT = `You are a strict Mumbai University examiner grading a student's answer.

MU exam format: 60-mark papers, 5 questions of 12 marks each, students answer any 4.
You must grade exactly like an MU internal examiner — reward keywords, structured answers, examples, and diagram mentions.

When grading:
1. Award marks out of the total specified
2. List what was correct (keyword hits, correct definitions, examples)
3. List what was missing (expected keywords, concepts, examples)
4. Show the keywords the examiner EXPECTS to see
5. Suggest the ideal answer structure
6. Give a one-line tip for exam improvement

Be direct, specific, and constructive. Base your evaluation on the provided context from past papers and model answers.`;

const MCQ_SYSTEM_PROMPT = `You are a Mumbai University computer engineering professor. Your task is to generate 10 high-quality multiple choice questions (MCQs) for the given subject based on the syllabus and past paper context.
Each MCQ must:
1. Cover key technical topics from the syllabus.
2. Have exactly 4 options: A, B, C, D.
3. Have one clear correct option (A, B, C, or D).
4. Be challenging and realistic for an engineering student.
5. Provide a short explanation of why the correct option is correct.

Return ONLY a valid JSON array of 10 questions with this exact structure:
[
  {
    "id": 0,
    "question": "Question text?",
    "options": {
      "A": "Option A text",
      "B": "Option B text",
      "C": "Option C text",
      "D": "Option D text"
    },
    "correct_option": "A",
    "explanation": "Why option A is correct."
  }
]`;

const THEORY_SYSTEM_PROMPT = `You are a Mumbai University computer engineering professor. Your task is to generate 3 high-quality, exam-style theory questions for the given subject based on the syllabus and past paper context.
Each question should be realistic for a university exam and have a typical marks value (e.g., 5, 10, or 12 marks).

Return ONLY a valid JSON array of 3 questions with this exact structure:
[
  {
    "id": 0,
    "question": "Question text?",
    "marks": 10,
    "expected_duration_mins": 15
  }
]`;

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
      p_user_id: user.id, p_module: "score", p_limit: 30, // upgraded to 30 to support generation
    });
    if (!withinLimit) {
      return new Response(JSON.stringify({ error: "Daily limit reached (30 queries/day)" }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Parse request ───────────────────────────────────────
    const body = await req.json();
    const { action = "grade", subject_code } = body;

    if (!subject_code) {
      return new Response(JSON.stringify({ error: "Missing required parameter: subject_code" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const startTime = Date.now();

    if (action === "generate") {
      const { type = "mcq" } = body; // "mcq" | "theory"

      // RAG: retrieve syllabus/past paper topics to base questions on
      const chunks = await retrieveChunks("syllabus structure modules important topics questions", {
        subjectCode: subject_code,
        matchCount: 8,
        similarityThreshold: 0.15,
      });
      const context = formatChunksAsContext(chunks);

      const systemPrompt = type === "mcq" ? MCQ_SYSTEM_PROMPT : THEORY_SYSTEM_PROMPT;
      const userPrompt = `SUBJECT: ${subject_code}
TYPE OF QUESTIONS: ${type.toUpperCase()}

KNOWLEDGE BASE CONTEXT (Syllabus and Past Papers):
${context}

Generate the questions. Return only the valid JSON array.`;

      const rawResponse = await generateText(systemPrompt, [
        { role: "user", parts: [{ text: userPrompt }] },
      ], 0.6); // slightly higher temp for variety

      let questions;
      try {
        const jsonMatch = rawResponse.match(/\[[\s\S]*\]/);
        questions = JSON.parse(jsonMatch?.[0] ?? rawResponse);
      } catch {
        throw new Error("Failed to parse generated questions as valid JSON");
      }

      await supabase.from("sessions").insert({
        user_id: user.id,
        module: "score",
        subject_code,
        input: { action, type },
        output: JSON.stringify(questions),
        duration_ms: Date.now() - startTime,
      });

      return new Response(JSON.stringify({ questions }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } else if (action === "solve") {
      const { question, marks } = body;
      if (!question || !marks) {
        return new Response(JSON.stringify({ error: "Missing parameters: question, marks" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // RAG: retrieve syllabus/past paper topics to base questions on
      const chunks = await retrieveChunks(question, {
        subjectCode: subject_code,
        matchCount: 8,
        similarityThreshold: 0.15,
      });
      const context = formatChunksAsContext(chunks);

      const systemPrompt = `You are an expert Mumbai University professor. Your task is to write a highly detailed, examiner-grade model answer for the given question of ${marks} marks.
The answer must strictly follow the Mumbai University engineering guidelines:
- Use clear headings, bullet points, and step-by-step logic.
- If appropriate, describe block diagrams, state transition tables, or standard code layouts.
- Include all important technical keywords and correct definitions.
- Include mathematical equations or formulas where necessary.
- Provide a complete, MU-acceptable solution. Do not omit any details.`;

      const userPrompt = `RETRIEVED KNOWLEDGE BASE CONTEXT:
${context}

---
QUESTION: ${question}
MARKS: ${marks}

Generate the comprehensive model answer:`;

      const rawResponse = await generateText(systemPrompt, [
        { role: "user", parts: [{ text: userPrompt }] },
      ], 0.2); // low temp for accuracy

      await supabase.from("sessions").insert({
        user_id: user.id,
        module: "score",
        subject_code,
        input: { action, question, marks },
        output: JSON.stringify({ answer: rawResponse }),
        duration_ms: Date.now() - startTime,
      });

      return new Response(JSON.stringify({ answer: rawResponse }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } else {
      // ── Default Action: Grade Written Answer ──────────────────────────────
      const { question, marks, student_answer } = body;

      if (!question || !marks || !student_answer) {
        return new Response(JSON.stringify({ error: "Missing grading fields: question, marks, student_answer" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // RAG: retrieve ideal answer context
      const chunks = await retrieveChunks(question, {
        subjectCode: subject_code,
        docTypeFilter: "past_paper",
        matchCount: 8,
        similarityThreshold: 0.28,
      });
      const context = formatChunksAsContext(chunks);

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

      const rawResponse = await generateText(GRADING_SYSTEM_PROMPT, [
        { role: "user", parts: [{ text: userPrompt }] },
      ], 0.3); // low temp for strict evaluation

      let result;
      try {
        const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
        result = JSON.parse(jsonMatch?.[0] ?? rawResponse);
      } catch {
        result = { raw: rawResponse };
      }

      await supabase.from("sessions").insert({
        user_id: user.id,
        module: "score",
        subject_code,
        input: { action, question, marks, student_answer_length: student_answer.length },
        output: JSON.stringify(result),
        chunks_used: chunks.map((c) => ({ id: c.id, similarity: c.similarity })),
        duration_ms: Date.now() - startTime,
      });

      return new Response(JSON.stringify({ session_id: null, ...result }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

  } catch (err) {
    console.error("Score function error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
