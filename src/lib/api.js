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
    const { action, type, subject_code, question, student_answer, marks, userId } = payload;

    const resolvedAction = action === "generate" ? `generate_${type}` : action;

    // Get module name if question is provided
    let moduleName = "General";
    if (question) {
      const { data: qData } = await supabase
        .from("question_bank")
        .select("module_name")
        .eq("question", question)
        .maybeSingle();
      if (qData) {
        moduleName = qData.module_name || "General";
      }
    }

    const studentContext = await getStudentContext(userId, subject_code, moduleName);

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
- Provide a complete, MU-acceptable solution. Do not omit any details.

STUDENT CONTEXT FOR THIS MODULE:
${studentContext}`;

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
      
      const systemPrompt = `${prompts.score.gradingSystemPrompt}

STUDENT CONTEXT FOR THIS MODULE:
${studentContext}

INSTRUCTION: Review the student's history on this module. If this is a repeat attempt (attempted questions > 1), acknowledge their progress or lack thereof in the exam tip or feedback (e.g. if accuracy improved from a low value, praise them; if doubts are increasing, provide a warning tip).`;

      const userMsg = prompts.score.gradingUserPrompt(question, marks, student_answer, context);
      const responseText = await generateChatLocal(systemPrompt, userMsg, true);

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

      const systemPrompt = `${prompts.score.mcqSystemPrompt}
      
STUDENT CONTEXT FOR THIS MODULE:
${studentContext}`;

      const userMsg = prompts.score.mcqUserPrompt(subject_code, context);
      const responseText = await generateChatLocal(systemPrompt, userMsg, true);

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

      const systemPrompt = `${prompts.score.theorySystemPrompt}
      
STUDENT CONTEXT FOR THIS MODULE:
${studentContext}`;

      const userMsg = prompts.score.theoryUserPrompt(subject_code, context);
      const responseText = await generateChatLocal(systemPrompt, userMsg, true);

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
    const { subject_code, userId } = payload;

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

    let studentContextText = "no prior activity";
    if (userId && userId !== "guest") {
      const { data: progressRows } = await supabase
        .from("user_topic_progress")
        .select("*")
        .eq("user_id", userId)
        .eq("subject_code", subject_code);
      
      if (progressRows && progressRows.length > 0) {
        studentContextText = progressRows.map(r => 
          `- Module "${r.module_name}": attempted ${r.questions_attempted} questions (${r.questions_correct} correct), doubts raised: ${r.doubts_raised}, study notes time: ${r.time_spent_mins} mins.`
        ).join("\n");
      }
    }

    const systemPrompt = `${prompts.scope.systemPrompt}

STUDENT'S ENTIRE PROGRESS FOR THIS SUBJECT:
${studentContextText}

INSTRUCTION: Review the student's study time and correctness on modules. In the recommended ranked topics list, if the student has high accuracy (>=80%) and significant attempts/study notes time on a high-priority topic, direct them to focus elsewhere first. Prioritize modules where they have low correctness or higher doubts.`;

    const userMsg = prompts.scope.userPrompt(subject_code, modulesText, context);
    const responseText = await generateChatLocal(systemPrompt, userMsg, true);

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
    const { subject_code, exam_date, hours_per_day, topics_done = [], weak_topics = [], userId } = payload;

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

    let studentContextText = "no prior activity";
    if (userId && userId !== "guest") {
      const { data: progressRows } = await supabase
        .from("user_topic_progress")
        .select("*")
        .eq("user_id", userId)
        .eq("subject_code", subject_code);
      
      if (progressRows && progressRows.length > 0) {
        studentContextText = progressRows.map(r => 
          `- Module "${r.module_name}": attempted ${r.questions_attempted} questions (${r.questions_correct} correct), doubts raised: ${r.doubts_raised}, study notes time: ${r.time_spent_mins} mins.`
        ).join("\n");
      }
    }

    const systemPrompt = `${prompts.crashMode.systemPrompt}

STUDENT'S PROGRESS CONTEXT FOR COMPROMISED STUDY PLAN:
${studentContextText}

INSTRUCTION: In the generated day-by-day plan, make sure the "summary" explains why certain modules get more/less time based on the student's progress and doubts (e.g., "Module X gets more study hours because you have 3 doubts there and low MCQ correctness").`;

    const userMsg = prompts.crashMode.userPrompt(
      subject_code, exam_date, daysLeft, hours_per_day, topics_done, weak_topics, modulesText, context
    );
    const responseText = await generateChatLocal(systemPrompt, userMsg, true);

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
    const { subject_code, topic, level = "exam-ready", userId } = payload;

    const { data: subject } = await supabase
      .from("subjects")
      .select("modules")
      .eq("code", subject_code)
      .single();

    let moduleName = "General";
    if (subject && subject.modules) {
      let modules = subject.modules;
      if (typeof modules === "string") {
        try { modules = JSON.parse(modules); } catch { modules = []; }
      }
      const queryLower = topic.toLowerCase();
      for (const mod of modules) {
        const titleMatch = mod.title && queryLower.includes(mod.title.toLowerCase());
        const topicsMatch = mod.topics && mod.topics.some(t => queryLower.includes(t.toLowerCase()));
        if (titleMatch || topicsMatch) {
          moduleName = mod.title;
          break;
        }
      }
      if (moduleName === "General" && modules.length > 0) {
        moduleName = modules[0].title;
      }
    }

    // Record the doubt
    if (userId && userId !== "guest") {
      await recordSimplifyDoubt(userId, subject_code, moduleName);
    }

    const studentContext = await getStudentContext(userId, subject_code, moduleName);

    const chunks = await retrieveChunksLocal(topic, {
      subjectCode: subject_code,
      matchCount: 5,
      similarityThreshold: 0.20,
    });
    const context = formatChunksAsContext(chunks);
    
    const systemPrompt = `${prompts.simplify.systemPrompt}

STUDENT CONTEXT FOR THIS MODULE:
${studentContext}

INSTRUCTION: Review the student's context history. If they have repeated doubts (doubts > 2), do not repeat the same general textbook style—use a different real-world analogy. If this is a first doubt, keep it simple.`;

    const userMsg = prompts.simplify.userPrompt(topic, level, context);
    const explanation = await generateChatLocal(systemPrompt, userMsg, false);

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

  // Update progress log
  try {
    const { data: qData } = await supabase
      .from("question_bank")
      .select("subject_code, module_name, type, correct_option")
      .eq("id", questionId)
      .single();

    if (qData) {
      const isCorrect = qData.type === "mcq"
        ? (studentAnswer === qData.correct_option)
        : (gradingResult.marks_awarded >= (gradingResult.marks_total * 0.5));

      const { data: prog } = await supabase
        .from("user_topic_progress")
        .select("*")
        .eq("user_id", userId)
        .eq("subject_code", qData.subject_code)
        .eq("module_name", qData.module_name || "General")
        .maybeSingle();

      const attempted = (prog?.questions_attempted || 0) + 1;
      const correct = (prog?.questions_correct || 0) + (isCorrect ? 1 : 0);

      await supabase
        .from("user_topic_progress")
        .upsert({
          user_id: userId,
          subject_code: qData.subject_code,
          module_name: qData.module_name || "General",
          questions_attempted: attempted,
          questions_correct: correct,
          updated_at: new Date().toISOString()
        }, { onConflict: "user_id,subject_code,module_name" });
    }
  } catch (progErr) {
    console.warn("Failed to update user_topic_progress inside saveAttempt:", progErr.message);
  }

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

export async function getStudentContext(userId, subjectCode, moduleName) {
  if (!userId || userId === "guest" || !subjectCode) {
    return "no prior activity";
  }

  try {
    const { data, error } = await supabase
      .from("user_topic_progress")
      .select("*")
      .eq("user_id", userId)
      .eq("subject_code", subjectCode)
      .eq("module_name", moduleName || "General")
      .maybeSingle();

    if (error) throw error;
    if (!data) return "no prior activity";

    const attempted = data.questions_attempted || 0;
    const correct = data.questions_correct || 0;
    const doubts = data.doubts_raised || 0;
    const timeSpent = data.time_spent_mins || 0;
    
    let lastDoubtStr = "";
    if (data.last_doubt_at) {
      const lastDoubtDate = new Date(data.last_doubt_at);
      const diffMs = new Date().getTime() - lastDoubtDate.getTime();
      const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
      lastDoubtStr = diffDays === 0 ? "today" : `${diffDays} days ago`;
    }

    let summary = `This student has attempted ${attempted} questions on this module (${correct} correct), `;
    summary += `raised ${doubts} doubts here${lastDoubtStr ? ` (most recently ${lastDoubtStr})` : ""}, `;
    summary += `and spent ${timeSpent} minutes in notes for this module. `;

    // Trend calculation
    let trend = "";
    if (doubts > 3 && timeSpent < 5) {
      trend = "doubts increasing relative to time spent — likely still confused.";
    } else if (attempted > 0 && (correct / attempted) >= 0.8) {
      trend = "high accuracy on questions — strong comprehension.";
    } else if (attempted > 0 && (correct / attempted) < 0.5) {
      trend = "low accuracy on questions — requires fundamental revision.";
    } else {
      trend = "steady progress.";
    }
    
    summary += `Trend: ${trend}`;
    return summary;
  } catch (err) {
    console.warn("Failed to generate student context:", err.message);
    return "no prior activity";
  }
}

export async function recordSimplifyDoubt(userId, subjectCode, moduleName) {
  if (!userId || userId === "guest" || !subjectCode) return;
  try {
    const { data: prog } = await supabase
      .from("user_topic_progress")
      .select("*")
      .eq("user_id", userId)
      .eq("subject_code", subjectCode)
      .eq("module_name", moduleName || "General")
      .maybeSingle();

    const doubts = (prog?.doubts_raised || 0) + 1;

    await supabase
      .from("user_topic_progress")
      .upsert({
        user_id: userId,
        subject_code: subjectCode,
        module_name: moduleName || "General",
        doubts_raised: doubts,
        last_doubt_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: "user_id,subject_code,module_name" });
  } catch (err) {
    console.warn("Failed to record simplify doubt in progress db:", err.message);
  }
}

export async function incrementNotesTime(userId, subjectCode, moduleName, mins) {
  if (!userId || userId === "guest" || !subjectCode) return;
  try {
    const { data: prog } = await supabase
      .from("user_topic_progress")
      .select("*")
      .eq("user_id", userId)
      .eq("subject_code", subjectCode)
      .eq("module_name", moduleName || "General")
      .maybeSingle();

    const timeSpent = (prog?.time_spent_mins || 0) + mins;

    await supabase
      .from("user_topic_progress")
      .upsert({
        user_id: userId,
        subject_code: subjectCode,
        module_name: moduleName || "General",
        time_spent_mins: timeSpent,
        updated_at: new Date().toISOString()
      }, { onConflict: "user_id,subject_code,module_name" });
  } catch (err) {
    console.warn("Failed to increment notes time:", err.message);
  }
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
  getStudentContext,
  recordSimplifyDoubt,
  incrementNotesTime
};

export default api;
