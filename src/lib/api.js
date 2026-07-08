// src/lib/api.js
// Unified PadhAI API client.
// ALL AI calls go through Supabase Edge Functions — Gemini key never touches the browser.
//
// Replaces: src/lib/gemini.js  (which exposed the API key client-side)
//           src/lib/rag.js     (which used wrong embedding model)

import { supabase } from "./supabase";
import { embedTextLocal, generateChatLocal } from "./localLlm";
import * as prompts from "./prompts";
import { questionBank } from "./questions";

// ── Local RAG Helper ─────────────────────────────────────────────────────────
async function retrieveChunksLocal(query, options) {
  const {
    subjectCode,
    docTypeFilter = null,
    matchCount = 6,
    similarityThreshold = 0.25,
  } = options;

  try {
    const queryEmbedding = await embedTextLocal(query);

    const { data, error } = await supabase.rpc("match_documents", {
      query_embedding: queryEmbedding,
      subject_filter: subjectCode,
      doc_type_filter: docTypeFilter,
      match_count: matchCount,
      similarity_threshold: similarityThreshold,
    });

    if (error) {
      console.warn("Direct DB match_documents failed:", error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn("Local RAG retrieval failed/skipped:", err.message);
    return [];
  }
}

function formatChunksAsContext(chunks) {
  if (!chunks?.length) return "No relevant documents found in knowledge base.";
  return chunks
    .map((chunk, i) => {
      const meta = chunk.metadata || {};
      const label = [
        meta.doc_type ? `[${String(meta.doc_type).toUpperCase()}]` : "",
        meta.year_of_exam ? `Year: ${meta.year_of_exam}` : "",
        meta.question_num ? `Q${meta.question_num}` : "",
        meta.marks ? `${meta.marks}m` : "",
        meta.topic ? `Topic: ${meta.topic}` : "",
      ]
        .filter(Boolean)
        .join(" | ");

      return `--- Context ${i + 1} ${label} (similarity: ${chunk.similarity?.toFixed(2) || "0.00"}) ---\n${chunk.content}`;
    })
    .join("\n\n");
}

// ── Generic invoker ──────────────────────────────────────────────────────────
// Wraps supabase.functions.invoke with auth token + error handling.

async function invoke(functionName, payload) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { data, error } = await supabase.functions.invoke(functionName, {
    body: payload,
    headers: session
      ? { Authorization: `Bearer ${session.access_token}` }
      : {},
  });

  if (error) {
    const message = error.message || "Request failed";
    throw new Error(message);
  }

  return data;
}

// ── Score ────────────────────────────────────────────────────────────────────
// Grades a student answer like an MU examiner.

export const scoreAnswer = async (payload) => {
  if (import.meta.env.VITE_USE_LOCAL_LLM === "true") {
    const {
      subject_code,
      action,
      question,
      marks,
      student_answer,
      type
    } = payload;

    const resolvedAction = action === "generate" ? `generate_${type}` : action;

    if (resolvedAction === "solve") {
      const chunks = await retrieveChunksLocal(question, {
        subjectCode: subject_code,
        matchCount: 5,
        similarityThreshold: 0.20,
      });
      const context = formatChunksAsContext(chunks);
      const systemPrompt = `You are an expert Mumbai University professor. Your task is to write a highly detailed, examiner-grade model answer for the given question of ${marks} marks.
The answer must strictly follow the Mumbai University engineering guidelines:
- Use clear headings, bullet points, and step-by-step logic.
- If appropriate, describe block diagrams, state transition tables, or standard code layouts.
- Include all important technical keywords and correct definitions.
- Include mathematical equations or formulas where necessary.
- Provide a complete, MU-acceptable solution. Do not omit any details.`;

      const userMsg = `RETRIEVED KNOWLEDGE BASE CONTEXT:
${context}

---
QUESTION: ${question}
MARKS: ${marks}

Generate the comprehensive model answer:`;

      const responseText = await generateChatLocal(systemPrompt, userMsg, false);
      return { answer: responseText };
    }

    if (resolvedAction === "grade_answer") {
      const chunks = await retrieveChunksLocal(question, {
        subjectCode: subject_code,
        docTypeFilter: "past_paper",
        matchCount: 5,
        similarityThreshold: 0.20,
      });
      const context = formatChunksAsContext(chunks);
      const userMsg = prompts.score.gradingUserPrompt(question, marks, student_answer, context);
      const responseText = await generateChatLocal(prompts.score.gradingSystemPrompt, userMsg, true);

      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        return JSON.parse(jsonMatch?.[0] ?? responseText);
      } catch {
        return { raw: responseText };
      }
    }

    if (resolvedAction === "generate_mcq") {
      // 1. Try to fetch from Supabase public.question_bank table
      try {
        const { data, error } = await supabase
          .from("question_bank")
          .select("*")
          .eq("subject_code", subject_code)
          .eq("type", "mcq");

        if (!error && data && data.length > 0) {
          const questions = data.slice(0, 5);
          return { questions };
        }
      } catch (dbErr) {
        console.warn("DB question_bank fetch failed, using local/LLM fallback:", dbErr.message);
      }

      // 2. Try local pre-seeded question bank fallback
      const localQs = questionBank[subject_code]?.mcq || [];
      if (localQs.length > 0) {
        return { questions: localQs.slice(0, 5) };
      }

      // 3. Fallback to generating via local LLM
      const { data: subject } = await supabase
        .from("subjects")
        .select("name, modules")
        .eq("code", subject_code)
        .single();

      const context = subject?.modules
        ? JSON.stringify(subject.modules, null, 2)
        : "Syllabus modules not available";

      const userMsg = prompts.score.mcqUserPrompt(subject_code, context);
      const responseText = await generateChatLocal(prompts.score.mcqSystemPrompt, userMsg, true);

      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/) || responseText.match(/\[[\s\S]*\]/);
        const parsed = JSON.parse(jsonMatch?.[0] ?? responseText);
        return { questions: parsed };
      } catch {
        return { raw: responseText };
      }
    }

    if (resolvedAction === "generate_theory") {
      // 1. Try to fetch from Supabase public.question_bank table
      try {
        const { data, error } = await supabase
          .from("question_bank")
          .select("*")
          .eq("subject_code", subject_code)
          .eq("type", "theory");

        if (!error && data && data.length > 0) {
          const questions = data.slice(0, 3);
          return { questions };
        }
      } catch (dbErr) {
        console.warn("DB question_bank fetch failed, using local/LLM fallback:", dbErr.message);
      }

      // 2. Try local pre-seeded question bank fallback
      const localQs = questionBank[subject_code]?.theory || [];
      if (localQs.length > 0) {
        return { questions: localQs.slice(0, 3) };
      }

      // 3. Fallback to generating via local LLM
      const { data: subject } = await supabase
        .from("subjects")
        .select("name, modules")
        .eq("code", subject_code)
        .single();

      const context = subject?.modules
        ? JSON.stringify(subject.modules, null, 2)
        : "Syllabus modules not available";

      const userMsg = prompts.score.theoryUserPrompt(subject_code, context);
      const responseText = await generateChatLocal(prompts.score.theorySystemPrompt, userMsg, true);

      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/) || responseText.match(/\[[\s\S]*\]/);
        const parsed = JSON.parse(jsonMatch?.[0] ?? responseText);
        return { questions: parsed };
      } catch {
        return { raw: responseText };
      }
    }
  }

  return invoke("score", payload);
};

// ── Scope ────────────────────────────────────────────────────────────────────
// Ranks syllabus topics by past-paper frequency.

export const getScopeAnalysis = async (payload) => {
  if (import.meta.env.VITE_USE_LOCAL_LLM === "true") {
    const { subject_code } = payload;

    const { data: subject } = await supabase
      .from("subjects")
      .select("modules, name")
      .eq("code", subject_code)
      .single();

    const modulesText = subject?.modules ? JSON.stringify(subject.modules, null, 2) : "Modules not available";

    const chunks = await retrieveChunksLocal("question topics marks syllabus distribution exam", {
      subjectCode: subject_code,
      docTypeFilter: "past_paper",
      matchCount: 6,
      similarityThreshold: 0.18,
    });
    const context = formatChunksAsContext(chunks);
    const userMsg = prompts.scope.userPrompt(subject_code, modulesText, context);
    const responseText = await generateChatLocal(prompts.scope.systemPrompt, userMsg, true);

    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      return JSON.parse(jsonMatch?.[0] ?? responseText);
    } catch {
      return { raw: responseText };
    }
  }

  return invoke("scope", payload);
};

// ── CrashMode ────────────────────────────────────────────────────────────────
// Generates a day-by-day study plan.

export const getCrashPlan = async (payload) => {
  if (import.meta.env.VITE_USE_LOCAL_LLM === "true") {
    const { subject_code, exam_date, hours_per_day, topics_done = [], weak_topics = [] } = payload;

    const today = new Date();
    const examDay = new Date(exam_date);
    const daysLeft = Math.max(0, Math.ceil((examDay.getTime() - today.getTime()) / 86400000));

    const { data: subject } = await supabase
      .from("subjects")
      .select("modules, name")
      .eq("code", subject_code)
      .single();

    const modulesText = subject?.modules ? JSON.stringify(subject.modules, null, 2) : "Modules not available";

    const [syllabusChunks, paperChunks] = await Promise.all([
      retrieveChunksLocal("syllabus modules topics study material", {
        subjectCode: subject_code, docTypeFilter: "syllabus", matchCount: 4,
      }),
      retrieveChunksLocal("important questions exam topics marks", {
        subjectCode: subject_code, docTypeFilter: "past_paper", matchCount: 4,
      }),
    ]);
    const context = [
      formatChunksAsContext(syllabusChunks),
      formatChunksAsContext(paperChunks),
    ].join("\n\n--- PAST PAPER CONTEXT ---\n\n");

    const userMsg = prompts.crashMode.userPrompt(
      subject_code, exam_date, daysLeft, hours_per_day, topics_done, weak_topics, modulesText, context
    );
    const responseText = await generateChatLocal(prompts.crashMode.systemPrompt, userMsg, true);

    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      return JSON.parse(jsonMatch?.[0] ?? responseText);
    } catch {
      return { raw: responseText };
    }
  }

  return invoke("crash-mode", payload);
};

// ── Simplify ─────────────────────────────────────────────────────────────────
// Explains a concept with analogies + exam structure.

export const simplifyConcept = async (payload) => {
  if (import.meta.env.VITE_USE_LOCAL_LLM === "true") {
    const { subject_code, topic, level = "exam-ready" } = payload;

    const chunks = await retrieveChunksLocal(topic, {
      subjectCode: subject_code,
      matchCount: 5,
      similarityThreshold: 0.20,
    });
    const context = formatChunksAsContext(chunks);
    const userMsg = prompts.simplify.userPrompt(topic, level, context);
    const explanation = await generateChatLocal(prompts.simplify.systemPrompt, userMsg, false);

    return { explanation, chunks_count: chunks.length };
  }

  return invoke("simplify", payload);
};

// ── Subjects ─────────────────────────────────────────────────────────────────
// Fetch available subjects from DB (direct DB query).

export async function getSubjects(branch, semester) {
  let query = supabase.from("subjects").select("*").eq("is_active", true);
  if (branch) query = query.eq("branch", branch);
  if (semester) query = query.eq("semester", semester);

  const { data, error } = await query.order("semester");
  if (error) throw error;
  return data;
}

// ── Session history ───────────────────────────────────────────────────────────
// Fetch the current user's past AI sessions.

export async function getSessionHistory(module = null, limit = 20) {
  let query = supabase
    .from("sessions")
    .select("id, module, subject_code, input, output, created_at, duration_ms")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (module) query = query.eq("module", module);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// ── Usage ────────────────────────────────────────────────────────────────────
// Get today's usage counts for the current user.

export async function getTodayUsage() {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("usage_logs")
    .select("module, call_count")
    .eq("date", today);

  if (error) throw error;

  return (data ?? []).reduce((acc, row) => {
    acc[row.module] = row.call_count;
    return acc;
  }, {});
}

// ── Student Attempts ─────────────────────────────────────────────────────────

export async function getStudentAttempts(userId) {
  const { data, error } = await supabase
    .from("student_attempts")
    .select("*")
    .eq("user_id", userId);

  if (error) throw error;
  return data || [];
}

export async function saveAttempt(userId, questionId, studentAnswer, gradingResult) {
  // 1. Double check if profile exists to prevent foreign key violation
  const { data: profile, error: profErr } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (!profile && !profErr) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("profiles").insert({
        id: userId,
        name: user?.user_metadata?.name || user?.email?.split("@")[0] || "Student",
        branch: user?.user_metadata?.branch || "AIDS",
        year: user?.user_metadata?.year || 1,
      });
    } catch (profileInsertErr) {
      console.warn("Failed to insert self-healing profile row:", profileInsertErr);
    }
  }

  // 2. Save the attempt
  const { data, error } = await supabase
    .from("student_attempts")
    .upsert(
      {
        user_id: userId,
        question_id: questionId,
        student_answer: studentAnswer,
        grading_result: gradingResult,
      },
      { onConflict: "user_id,question_id" }
    )
    .select();

  if (error) throw error;
  return data?.[0] || null;
}

export async function deleteAttempt(userId, questionId) {
  const { error } = await supabase
    .from("student_attempts")
    .delete()
    .eq("user_id", userId)
    .eq("question_id", questionId);

  if (error) throw error;
  return true;
}

// ── Default export (grouped object) ─────────────────────────────────────────

const api = {
  score: scoreAnswer,
  scope: getScopeAnalysis,
  crashMode: getCrashPlan,
  simplify: simplifyConcept,
  getSubjects,
  getSessionHistory,
  getTodayUsage,
  getStudentAttempts,
  saveAttempt,
  deleteAttempt,
};

export default api;
