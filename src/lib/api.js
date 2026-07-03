// src/lib/api.js
// Unified PadhAI API client.
// ALL AI calls go through Supabase Edge Functions — Gemini key never touches the browser.
//
// Replaces: src/lib/gemini.js  (which exposed the API key client-side)
//           src/lib/rag.js     (which used wrong embedding model)

import { supabase } from "./supabase";

// ── Generic invoker ──────────────────────────────────────────────────────────
// Wraps supabase.functions.invoke with auth token + error handling.

async function invoke(functionName, payload) {
  // Get the current session JWT to pass as Authorization header
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
    // Supabase wraps Edge Function errors — unwrap the message
    const message = error.message || "Request failed";
    throw new Error(message);
  }

  return data;
}

// ── Score ────────────────────────────────────────────────────────────────────
// Grades a student answer like an MU examiner.
//
// @param {Object} payload
// @param {string} payload.subject_code   e.g. "MU-CS-SEM5-OS"
// @param {string} payload.question       The exam question
// @param {number} payload.marks          Total marks (e.g. 12)
// @param {string} payload.student_answer The student's written answer
//
// @returns {Object} { marks_awarded, marks_total, grade, feedback, ideal_structure, exam_tip }

export const scoreAnswer = (payload) => invoke("score", payload);

// ── Scope ────────────────────────────────────────────────────────────────────
// Ranks syllabus topics by past-paper frequency.
//
// @param {Object} payload
// @param {string} payload.subject_code   e.g. "MU-CS-SEM5-OS"
//
// @returns {Object} { ranked_topics, guaranteed_topics, safe_to_skip, study_order }

export const getScopeAnalysis = (payload) => invoke("scope", payload);

// ── CrashMode ────────────────────────────────────────────────────────────────
// Generates a day-by-day study plan.
//
// @param {Object} payload
// @param {string}   payload.subject_code    e.g. "MU-CS-SEM5-OS"
// @param {string}   payload.exam_date       ISO date "2025-11-20"
// @param {number}   payload.hours_per_day   Available study hours per day
// @param {string[]} payload.topics_done     Topics already covered (optional)
// @param {string[]} payload.weak_topics     Topics needing extra time (optional)
//
// @returns {Object} { summary, plan: [{day, date, topics, goals, ...}], predicted_questions }

export const getCrashPlan = (payload) => invoke("crash-mode", payload);

// ── Simplify ─────────────────────────────────────────────────────────────────
// Explains a concept with Indian analogies + exam structure.
//
// @param {Object} payload
// @param {string} payload.subject_code   e.g. "MU-CS-SEM5-OS"
// @param {string} payload.topic          e.g. "Banker's Algorithm"
// @param {string} payload.level          "beginner" | "exam-ready" (default: "exam-ready")
//
// @returns {Object} { explanation: string (markdown) }

export const simplifyConcept = (payload) => invoke("simplify", payload);

// ── Subjects ─────────────────────────────────────────────────────────────────
// Fetch available subjects from DB (no Edge Function needed — direct DB query).
//
// @param {string} branch   e.g. "CS"
// @param {number} semester e.g. 5
//
// @returns {Array} subjects[]

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
//
// @param {string} module  Optional: filter by 'crash_mode'|'scope'|'simplify'|'score'
// @param {number} limit   Max rows to fetch (default 20)
//
// @returns {Array} sessions[]

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
//
// @returns {Object} { crash_mode: 2, scope: 1, simplify: 5, score: 3 }

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

// ── Default export (grouped object) ─────────────────────────────────────────
// Allows: import api from '../lib/api'
// Usage:  api.score({ ... })  api.scope({ ... })  etc.

const api = {
  score: scoreAnswer,
  scope: getScopeAnalysis,
  crashMode: getCrashPlan,
  simplify: simplifyConcept,
  getSubjects,
  getSessionHistory,
  getTodayUsage,
};

export default api;
