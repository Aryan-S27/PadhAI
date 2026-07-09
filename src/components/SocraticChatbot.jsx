import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MessageSquare, X, Send, Sparkles, MapPin } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import { generateChatLocal } from "../lib/localLlm";

const getFeatureFriendlyName = (path) => {
  switch (path) {
    case "/notes": return "Syllabus Study Notes 📚";
    case "/score": return "Exam Practice Quizzes 🎯";
    case "/simplify": return "Concept Simplifier 🤖";
    case "/scope": return "Syllabus Weightage Analysis 📊";
    case "/crashmode": return "Personalized Study Planner 📅";
    case "/dashboard": return "Student Portal Dashboard 🏠";
    default: return "Syllabus Hub";
  }
};

export const SocraticChatbot = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [proactiveLoaded, setProactiveLoaded] = useState(false);
  const messagesEndRef = useRef(null);

  // Load proactive greeting based on student's actual database progress history
  useEffect(() => {
    if (!isOpen || proactiveLoaded || !user || user.id === "guest") {
      if (isOpen && !proactiveLoaded && (!user || user.id === "guest")) {
        setMessages([
          {
            role: "assistant",
            content: "Hi guest student! I am PadhAI, your Socratic Guide. What topic or doubt in your syllabus can I help you master today?"
          }
        ]);
        setProactiveLoaded(true);
      }
      return;
    }

    const loadProactiveMessage = async () => {
      try {
        const { data: progress } = await api.supabase
          .from("user_topic_progress")
          .select("*")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false });

        let greeting = `Hello ${user.user_metadata?.name || "Student"}! I am your PadhAI Socratic Guide. Ask me any conceptual question or let me help you target your weak spots!`;

        if (progress && progress.length > 0) {
          const needsAttempts = progress.find(r => r.time_spent_mins > 2 && r.questions_attempted === 0);
          const struggling = progress.find(r => r.questions_attempted > 1 && (r.questions_correct / r.questions_attempted) < 0.6);

          if (needsAttempts) {
            greeting = `Hi ${user.user_metadata?.name || "Student"}! I noticed you spent ${needsAttempts.time_spent_mins} minutes studying notes for "${needsAttempts.module_name}" but haven't attempted any Score questions yet. Let me know if you want to quiz yourself on it, or ask me any questions!`;
          } else if (struggling) {
            greeting = `Hi ${user.user_metadata?.name || "Student"}! I noticed you have been struggling a bit with "${struggling.module_name}" (grading accuracy is under 60%). Let's review the core logic together. What part is confusing you?`;
          } else {
            const active = progress[0];
            greeting = `Welcome back! I see you recently worked on "${active.module_name}". Would you like to simplify a specific concept there, or practice some more exam questions?`;
          }
        }

        setMessages([
          {
            role: "assistant",
            content: greeting
          }
        ]);
        setProactiveLoaded(true);
      } catch (err) {
        console.warn("Failed to load proactive chatbot greeting:", err.message);
        setMessages([
          {
            role: "assistant",
            content: "Hi there! I am your PadhAI Socratic Guide. What syllabus topic can I help you master today?"
          }
        ]);
      }
    };

    loadProactiveMessage();
  }, [isOpen, proactiveLoaded, user]);

  // Proactive check for closest exam date when opening Notes
  useEffect(() => {
    if (location.pathname !== "/notes" || !user || user.id === "guest") return;

    const checkExamPriority = async () => {
      const activeSubject = localStorage.getItem("padhai_active_subject");
      if (!activeSubject) return;

      const activeSubjectCodes = JSON.parse(localStorage.getItem("padhai_active_schedules") || "[]");
      const schedules = [];

      for (const code of activeSubjectCodes) {
        const scheduleStr = localStorage.getItem(`padhai_schedule_${code}`);
        if (scheduleStr) {
          try {
            const sch = JSON.parse(scheduleStr);
            if (sch.examDate) {
              schedules.push(sch);
            }
          } catch { }
        }
      }

      if (schedules.length === 0) return;

      const sorted = [...schedules].sort((a, b) => new Date(a.examDate) - new Date(b.examDate));
      const closestExam = sorted[0];

      if (closestExam && closestExam.subjectCode !== activeSubject) {
        const lastWarned = localStorage.getItem(`padhai_last_priority_warn_${activeSubject}`);
        if (lastWarned === closestExam.subjectCode) return;

        let recommendedModule = "Module 1";
        try {
          const { data: progress } = await api.supabase
            .from("user_topic_progress")
            .select("*")
            .eq("user_id", user.id)
            .eq("subject_code", closestExam.subjectCode);

          if (progress && progress.length > 0) {
            const sortedProgress = [...progress].sort((a, b) => {
              const accA = a.questions_attempted > 0 ? (a.questions_correct / a.questions_attempted) : 1;
              const accB = b.questions_attempted > 0 ? (b.questions_correct / b.questions_attempted) : 1;
              if (accA !== accB) return accA - accB;
              return b.doubts_raised - a.doubts_raised;
            });
            recommendedModule = sortedProgress[0].module_name;
          }
        } catch (err) {
          console.warn("Failed to check user progress for closest exam priority:", err);
        }

        const warnMsg = `🔔 Priority Alert: I see you are studying "${activeSubject}" notes. However, your "${closestExam.subjectName}" exam is closer (on ${closestExam.examDate}). I highly recommend prioritizing "${closestExam.subjectName}" - "${recommendedModule}" first!`;

        setMessages(prev => [...prev, {
          role: "assistant",
          content: warnMsg,
          pendingNavigation: { path: `/notes` } // Render confirmation if they want to navigate/highlight
        }]);
        localStorage.setItem(`padhai_last_priority_warn_${activeSubject}`, closestExam.subjectCode);
        setIsOpen(true);
      }
    };

    const t = setTimeout(checkExamPriority, 1000);
    return () => clearTimeout(t);
  }, [location.pathname, user]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || loading) return;

    const userText = inputValue.trim();
    setInputValue("");
    setMessages(prev => [...prev, { role: "user", content: userText }]);
    setLoading(true);

    try {
      // ── 1. Gather student context ─────────────────────────────────────────

      // Active schedules from localStorage
      let schedulesSummary = "No active study schedules found.";
      let allSchedules = []; // raw list for [SHOW_NOTES] rendering
      try {
        const activeCodes = JSON.parse(localStorage.getItem("padhai_active_schedules") || "[]");
        if (activeCodes.length > 0) {
          const schLines = [];
          for (const code of activeCodes) {
            const schStr = localStorage.getItem(`padhai_schedule_${code}`);
            if (schStr) {
              try {
                const sch = JSON.parse(schStr);
                const completedList = JSON.parse(localStorage.getItem(`padhai_completed_days_${code}`) || "[]");
                const totalDays = sch.plan?.length || 0;
                const doneDays = completedList.length;
                const todayStr = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().split("T")[0];
                const todayPlan = sch.plan?.find(d => d.date === todayStr);
                const nextIncomplete = sch.plan?.find(d => !completedList.includes(d.day));
                allSchedules.push({ ...sch, completedList });
                schLines.push(
                  `- ${sch.subjectName} (${code}): Exam on ${sch.examDate}, ${doneDays}/${totalDays} days done.` +
                  (todayPlan ? ` Today's scheduled topics: ${todayPlan.topics?.join(", ") || todayPlan.goals}.` : "") +
                  (nextIncomplete ? ` Next up: Day ${nextIncomplete.day} — ${nextIncomplete.topics?.join(", ") || nextIncomplete.goals}.` : "")
                );
              } catch { }
            }
          }
          if (schLines.length > 0) schedulesSummary = schLines.join("\n");
        }
      } catch (err) {
        console.warn("Failed to retrieve schedules for chatbot:", err);
      }

      // User progress (questions solved + notes read) from Supabase
      let progressSummary = "No progress data available.";
      try {
        if (user && user.id !== "guest") {
          const { data: progress } = await api.supabase
            .from("user_topic_progress")
            .select("*")
            .eq("user_id", user.id);

          if (progress && progress.length > 0) {
            const lines = progress.map(p =>
              `- ${p.subject_code}/${p.module_name}: ${p.questions_attempted} questions attempted (${p.questions_correct} correct, ${p.time_spent_mins} min notes read)`
            );
            progressSummary = lines.join("\n");
          }
        }
      } catch (err) {
        console.warn("Failed to retrieve progress for chatbot:", err);
      }

      const contextLines = messages.map(m => `${m.role === "user" ? "Student" : "Tutor"}: ${m.content}`).join("\n");

      // ── 2. Build enriched system prompt ───────────────────────────────────
      const systemPrompt = `You are PadhAI's Socratic Study Companion for Mumbai University Engineering students. You have LIVE access to the student's learning data.

Core guidelines:
1. Answer the student's questions directly and clearly with warm mentor-like guidance. No generic yapping.
2. Observe the student's nature (lazy, anxious, curious, rushed) and respond constructively.
3. When redirecting to a feature, explain WHY enthusiastically BEFORE appending the [NAVIGATE: <path>] tag at the VERY END.
   Paths: /notes, /score, /simplify, /scope, /crashmode, /dashboard
4. If asked to set a reminder: append [REMINDER: <mins>, <task>] at the VERY END.
5. To update Today's Focus on the dashboard with a specific recommendation: append [SET_FOCUS: <focus text>] at the VERY END.
6. To show inline notes/topics for a specific schedule day inside this chat: append [SHOW_NOTES: <subjectCode>, <dayNum>] at the VERY END (e.g. [SHOW_NOTES: CS403, 2]).
7. To mark a schedule day as complete: append [MARK_DAY: <subjectCode>, <dayNum>] at the VERY END.
8. Keep responses under 2-3 brief paragraphs. Always be supportive, warm, direct.

LIVE STUDENT DATA:
Active Study Schedules (Syllabus Study Schedules):
${schedulesSummary}

Score & Notes Progress (from database):
${progressSummary}`;

      const userMessagePrompt = `CONVERSATION HISTORY:\n${contextLines}\n\nStudent: ${userText}\n\nTutor (use student data to give personalized, specific advice):`;

      // ── 3. Call LLM ───────────────────────────────────────────────────────
      const response = await generateChatLocal(systemPrompt, userMessagePrompt, false);

      let cleanedResponse = response;
      let navPath = null;
      let reminderMins = null;
      let reminderTask = "";
      let setFocusText = null;
      let showNotesData = null;
      let markDayData = null;

      // Strip and parse [NAVIGATE:]
      const navMatch = cleanedResponse.match(/\[NAVIGATE:\s*([^\[\]]+)\]/i);
      if (navMatch) {
        navPath = navMatch[1].trim();
        cleanedResponse = cleanedResponse.replace(navMatch[0], "").trim();
      }

      // Strip and parse [REMINDER:]
      const remMatch = cleanedResponse.match(/\[REMINDER:\s*([^,]+),\s*([^\[\]]+)\]/i);
      if (remMatch) {
        reminderMins = parseInt(remMatch[1].trim(), 10);
        reminderTask = remMatch[2].trim();
        cleanedResponse = cleanedResponse.replace(remMatch[0], "").trim();
      }

      // Strip and parse [SET_FOCUS:]
      const focusMatch = cleanedResponse.match(/\[SET_FOCUS:\s*([^\[\]]+)\]/i);
      if (focusMatch) {
        setFocusText = focusMatch[1].trim();
        cleanedResponse = cleanedResponse.replace(focusMatch[0], "").trim();
      }

      // Strip and parse [SHOW_NOTES:]
      const showNotesMatch = cleanedResponse.match(/\[SHOW_NOTES:\s*([^,\[\]]+),\s*([^\[\]]+)\]/i);
      if (showNotesMatch) {
        showNotesData = { code: showNotesMatch[1].trim().toUpperCase(), day: parseInt(showNotesMatch[2].trim(), 10) };
        cleanedResponse = cleanedResponse.replace(showNotesMatch[0], "").trim();
      }

      // Strip and parse [MARK_DAY:]
      const markDayMatch = cleanedResponse.match(/\[MARK_DAY:\s*([^,\[\]]+),\s*([^\[\]]+)\]/i);
      if (markDayMatch) {
        markDayData = { code: markDayMatch[1].trim().toUpperCase(), day: parseInt(markDayMatch[2].trim(), 10) };
        cleanedResponse = cleanedResponse.replace(markDayMatch[0], "").trim();
      }

      // ── 4. Execute actions ────────────────────────────────────────────────

      // SET_FOCUS: update localStorage and dispatch event to refresh Dashboard
      if (setFocusText) {
        localStorage.setItem("padhai_custom_today_focus", setFocusText);
        window.dispatchEvent(new Event("padhai_focus_updated"));
        setMessages(prev => [...prev, { role: "assistant", content: cleanedResponse, pendingNavigation: navPath ? { path: navPath } : null }]);
        setMessages(prev => [...prev, { role: "assistant", content: `✅ I've updated Today's Focus on your Dashboard to: "${setFocusText}"` }]);
        cleanedResponse = null; // already pushed
      }

      // SHOW_NOTES: render inline schedule notes in chat
      if (showNotesData) {
        const schStr = localStorage.getItem(`padhai_schedule_${showNotesData.code}`);
        if (schStr) {
          const sch = JSON.parse(schStr);
          const dayPlan = sch.plan?.find(d => d.day === showNotesData.day);
          if (dayPlan) {
            const noteCard = {
              role: "assistant",
              content: cleanedResponse || `Here are the Day ${showNotesData.day} notes for ${sch.subjectName}:`,
              inlineScheduleCard: {
                subjectName: sch.subjectName,
                day: dayPlan.day,
                date: dayPlan.date,
                topics: dayPlan.topics,
                hours: dayPlan.hours,
                goals: dayPlan.goals,
                tip: dayPlan.tip,
                sessionSplit: dayPlan.session_split,
                subjectCode: showNotesData.code
              },
              pendingNavigation: navPath ? { path: navPath } : null
            };
            setMessages(prev => [...prev, noteCard]);
            cleanedResponse = null;
          }
        }
      }

      // MARK_DAY: toggle day as complete in localStorage and notify user
      if (markDayData) {
        const key = `padhai_completed_days_${markDayData.code}`;
        const existing = JSON.parse(localStorage.getItem(key) || "[]");
        if (!existing.includes(markDayData.day)) {
          existing.push(markDayData.day);
          localStorage.setItem(key, JSON.stringify(existing));
          window.dispatchEvent(new Event("padhai_focus_updated"));
          setMessages(prev => [...prev, { role: "assistant", content: `✅ Marked Day ${markDayData.day} for ${markDayData.code} as complete!` }]);
        }
      }

      // Default: push the cleaned response with navigation card if needed
      if (cleanedResponse !== null) {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: cleanedResponse,
          pendingNavigation: navPath ? { path: navPath } : null
        }]);
      }

      // Schedule reminder
      if (reminderMins && !isNaN(reminderMins)) {
        setMessages(prev => [...prev, { role: "assistant", content: `⏰ Reminder set: I will alert you in ${reminderMins} minutes to "${reminderTask}".` }]);
        setTimeout(() => {
          alert(`⏰ [PadhAI Reminder] Time to: ${reminderTask}`);
        }, reminderMins * 60 * 1000);
      }

    } catch (err) {
      console.error("Chatbot response error:", err);
      setMessages(prev => [...prev, { role: "assistant", content: "I encountered a brief lag. Please try again!" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ zIndex: 9999, fontFamily: "var(--font-sans)" }}>
      {/* Floating Button (Visible only when closed) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            backgroundColor: "var(--color-accent)",
            color: "#fff",
            border: "none",
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.16)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
            zIndex: 9999,
          }}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.08)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
        >
          <MessageSquare size={24} />
        </button>
      )}

      {/* Slide-out Sidebar Panel */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            right: 0,
            top: 0,
            width: "380px",
            height: "100vh",
            backgroundColor: "var(--color-pure-white)",
            borderLeft: "1px solid var(--color-ink-border)",
            boxShadow: "-8px 0 30px rgba(0, 0, 0, 0.08)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 9999,
            animation: "slideInRight 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.05)",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "18px 24px",
              backgroundColor: "var(--color-linen-mid)",
              borderBottom: "1px solid var(--color-ink-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ position: "relative" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#2b8a3e", position: "absolute", bottom: 0, right: 0, border: "1.5px solid #fff" }} />
                <span style={{ fontSize: "20px" }}>🤖</span>
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "var(--color-ink-black)", display: "flex", alignItems: "center", gap: "4px" }}>
                  PadhAI Guide <Sparkles size={11} color="var(--color-accent)" />
                </h4>
                <span style={{ fontSize: "10.5px", color: "var(--color-ink-muted)" }}>Active Study Companion</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-ink-muted)" }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages List */}
          <div style={{ flex: 1, padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "14px", backgroundColor: "var(--color-linen-warm)" }}>
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: m.role === "user" ? "80%" : "92%",
                  backgroundColor: m.role === "user" ? "var(--color-accent)" : "var(--color-pure-white)",
                  color: m.role === "user" ? "#fff" : "var(--color-ink-black)",
                  padding: m.role === "user" ? "10px 15px" : "14px 18px",
                  borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "4px 18px 18px 18px",
                  boxShadow: m.role === "user" ? "0 4px 14px rgba(200, 133, 74, 0.2)" : "0 2px 12px rgba(0,0,0,0.04)",
                  fontSize: m.role === "user" ? "13px" : "12.5px",
                  lineHeight: "1.55",
                  border: m.role === "user" ? "none" : "1px solid rgba(0,0,0,0.07)",
                  letterSpacing: "0.01em",
                }}
              >
                {/* Rich text renderer for assistant messages */}
                {m.role === "assistant" ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {m.content.split("\n").filter(line => line !== "").map((line, li) => {
                      // Bullet points: lines starting with - or •
                      if (/^[-•]\s+/.test(line)) {
                        const text = line.replace(/^[-•]\s+/, "");
                        return (
                          <div key={li} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                            <span style={{ color: "var(--color-accent)", fontWeight: 700, marginTop: "1px", flexShrink: 0 }}>•</span>
                            <span dangerouslySetInnerHTML={{ __html: text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") }} />
                          </div>
                        );
                      }
                      // Numbered list: lines starting with 1. 2. etc.
                      if (/^\d+\.\s+/.test(line)) {
                        const num = line.match(/^(\d+)\./)?.[1];
                        const text = line.replace(/^\d+\.\s+/, "");
                        return (
                          <div key={li} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                            <span style={{ color: "var(--color-accent)", fontWeight: 700, minWidth: "16px", flexShrink: 0 }}>{num}.</span>
                            <span dangerouslySetInnerHTML={{ __html: text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") }} />
                          </div>
                        );
                      }
                      // Regular paragraph with bold support
                      return (
                        <p key={li} style={{ margin: 0, lineHeight: "1.6" }}
                          dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") }}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ lineHeight: "1.55" }}>{m.content}</div>
                )}

                {/* Inline Schedule Day Notes Card */}
                {m.inlineScheduleCard && (() => {
                  const c = m.inlineScheduleCard;
                  return (
                    <div style={{
                      marginTop: "12px",
                      padding: "14px",
                      backgroundColor: "var(--color-linen-mid)",
                      borderRadius: "var(--radius-lg)",
                      border: "1px solid var(--color-ink-border)",
                      fontSize: "11.5px",
                    }}>
                      <div style={{ fontWeight: 700, fontSize: "12px", color: "var(--color-accent)", marginBottom: "6px" }}>
                        📅 {c.subjectName} — Day {c.day} ({c.date})
                      </div>
                      <div style={{ marginBottom: "4px" }}><strong>Topics:</strong> {Array.isArray(c.topics) ? c.topics.join(", ") : c.topics}</div>
                      <div style={{ marginBottom: "4px" }}><strong>Study hours:</strong> {c.hours}h — {c.sessionSplit}</div>
                      <div style={{ marginBottom: "4px" }}><strong>Goal:</strong> {c.goals}</div>
                      {c.tip && <div style={{ marginTop: "6px", padding: "6px 10px", backgroundColor: "#FFF8F2", borderRadius: "4px", borderLeft: "3px solid var(--color-accent)", color: "var(--color-ink-muted)" }}>💡 {c.tip}</div>}
                    </div>
                  );
                })()}

                {/* Friendly Navigation Confirmation Card */}
                {m.pendingNavigation && (
                  <div style={{
                    marginTop: "12px",
                    padding: "12px",
                    backgroundColor: "var(--color-linen-mid)",
                    borderRadius: "var(--radius-lg)",
                    border: "1px dashed var(--color-accent)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-ink-black)", display: "flex", alignItems: "center", gap: "4px" }}>
                      <MapPin size={12} color="var(--color-accent)" /> Suggestion: {getFeatureFriendlyName(m.pendingNavigation.path)}
                    </span>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => {
                          const path = m.pendingNavigation.path;
                          m.pendingNavigation = null; // Clear buttons on click
                          setMessages([...messages]);
                          navigate(path);
                        }}
                        style={{
                          flex: 1,
                          backgroundColor: "var(--color-accent)",
                          color: "#fff",
                          border: "none",
                          borderRadius: "4px",
                          padding: "6px 10px",
                          fontSize: "11px",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Let's Go! 🚀
                      </button>
                      <button
                        onClick={() => {
                          m.pendingNavigation = null;
                          setMessages([...messages]);
                        }}
                        style={{
                          backgroundColor: "var(--color-linen-warm)",
                          color: "var(--color-ink-muted)",
                          border: "1px solid var(--color-ink-border)",
                          borderRadius: "4px",
                          padding: "6px 10px",
                          fontSize: "11px",
                          cursor: "pointer",
                        }}
                      >
                        Stay Here
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div
                style={{
                  alignSelf: "flex-start",
                  backgroundColor: "var(--color-pure-white)",
                  padding: "10px 14px",
                  borderRadius: "16px 16px 16px 4px",
                  border: "1px solid var(--color-ink-border)",
                  fontSize: "12.5px",
                  color: "var(--color-ink-muted)",
                  fontStyle: "italic",
                }}
              >
                Guiding...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={handleSend}
            style={{
              padding: "14px 20px",
              borderTop: "1px solid var(--color-ink-border)",
              display: "flex",
              gap: "8px",
              backgroundColor: "var(--color-pure-white)",
            }}
          >
            <input
              type="text"
              placeholder="Ask a doubt or request a hint..."
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              disabled={loading}
              style={{
                flex: 1,
                border: "1px solid var(--color-ink-border)",
                borderRadius: "var(--radius-lg)",
                padding: "10px 14px",
                fontSize: "12.5px",
                outline: "none",
                fontFamily: "var(--font-sans)",
              }}
            />
            <button
              type="submit"
              disabled={loading || !inputValue.trim()}
              style={{
                backgroundColor: "var(--color-accent)",
                color: "#fff",
                border: "none",
                borderRadius: "var(--radius-lg)",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                opacity: loading || !inputValue.trim() ? 0.6 : 1,
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      {/* Styled slideInRight transition */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};
