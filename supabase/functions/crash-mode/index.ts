// supabase/functions/crash-mode/index.ts
// Generates a personalized day-by-day study plan based on exam date and syllabus.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { generateText } from "../_shared/gemini.ts";
import { retrieveChunks, formatChunksAsContext } from "../_shared/rag.ts";

const SYSTEM_PROMPT = `You are PadhAI's CrashMode planner for Mumbai University Engineering students.

MU exam format: 60 marks, 5 questions × 12 marks, students answer any 4.
This means studying 4 topics well beats studying 5 topics poorly.

When creating a study plan:
- Be realistic about how much can be covered in the available time
- Prioritize topics that appear frequently in past papers (HIGH priority first)
- If very few days remain (< 3 days), create a "last-minute" plan focusing on 3 guaranteed topics
- Include specific daily goals, not vague instructions
- For each day: morning/evening split if hours > 4
- End plan with revision days (last 1-2 days = practice questions only)

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
      p_user_id: user.id, p_module: "crash_mode", p_limit: 5,
    });
    if (!withinLimit) {
      return new Response(JSON.stringify({ error: "Daily limit reached (5 plans/day)" }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const {
      subject_code,
      exam_date,           // ISO date string "2025-11-20"
      hours_per_day,       // number
      topics_done = [],    // already covered
      weak_topics = [],    // struggling with
    } = await req.json();

    if (!subject_code || !exam_date || !hours_per_day) {
      return new Response(JSON.stringify({ error: "Missing: subject_code, exam_date, hours_per_day" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Calculate days remaining
    const today = new Date();
    const examDay = new Date(exam_date);
    const daysLeft = Math.max(0, Math.ceil((examDay.getTime() - today.getTime()) / 86400000));

    // Fetch subject + modules
    const { data: subject } = await supabase
      .from("subjects")
      .select("modules, name")
      .eq("code", subject_code)
      .single();

    // RAG: get syllabus structure + past paper topic frequencies
    const startTime = Date.now();
    const [syllabusChunks, paperChunks] = await Promise.all([
      retrieveChunks("syllabus modules topics study material", {
        subjectCode: subject_code, docTypeFilter: "syllabus", matchCount: 6,
      }),
      retrieveChunks("important questions exam topics marks", {
        subjectCode: subject_code, docTypeFilter: "past_paper", matchCount: 8,
      }),
    ]);

    const context = [
      formatChunksAsContext(syllabusChunks),
      formatChunksAsContext(paperChunks),
    ].join("\n\n--- PAST PAPER CONTEXT ---\n\n");

    const modulesText = subject?.modules
      ? JSON.stringify(subject.modules, null, 2)
      : "Not available";

    const userPrompt = `SUBJECT: ${subject?.name ?? subject_code}
EXAM DATE: ${exam_date}
DAYS REMAINING: ${daysLeft}
HOURS AVAILABLE PER DAY: ${hours_per_day}
TOTAL STUDY HOURS: ${daysLeft * hours_per_day}

ALREADY COVERED: ${topics_done.length ? topics_done.join(", ") : "Nothing yet"}
WEAK TOPICS (need more time): ${weak_topics.length ? weak_topics.join(", ") : "None specified"}

SYLLABUS MODULES:
${modulesText}

KNOWLEDGE BASE CONTEXT (syllabus + past papers):
${context}

---
Create a day-by-day study plan. Be specific and realistic.
Return ONLY this JSON:
{
  "summary": "<2-3 sentence overview of the strategy>",
  "days_left": ${daysLeft},
  "total_hours": ${daysLeft * hours_per_day},
  "strategy": "<AGGRESSIVE|FOCUSED|BALANCED|LAST_MINUTE>",
  "plan": [
    {
      "day": 1,
      "date": "<YYYY-MM-DD>",
      "topics": ["<topic name>"],
      "goals": "<specific learning goals for this day>",
      "hours": ${hours_per_day},
      "session_split": "<e.g. Morning: 2h OS Scheduling, Evening: 2h Deadlock>",
      "tip": "<specific exam tip for today's topics>"
    }
  ],
  "revision_days": ["<dates reserved for practice papers>"],
  "topics_to_skip": ["<low-priority topics given time constraint>"],
  "predicted_questions": ["<2-3 likely exam questions based on past papers>"]
}`;

    const rawResponse = await generateText(SYSTEM_PROMPT, [
      { role: "user", parts: [{ text: userPrompt }] },
    ], 0.3);

    let result;
    try {
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      result = JSON.parse(jsonMatch?.[0] ?? rawResponse);
    } catch {
      result = { raw: rawResponse };
    }

    await supabase.from("sessions").insert({
      user_id: user.id,
      module: "crash_mode",
      subject_code,
      input: { subject_code, exam_date, hours_per_day, daysLeft },
      output: JSON.stringify(result),
      chunks_used: [...syllabusChunks, ...paperChunks].map((c) => ({ id: c.id, similarity: c.similarity })),
      duration_ms: Date.now() - startTime,
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("CrashMode error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
