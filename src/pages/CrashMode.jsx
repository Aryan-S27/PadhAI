// src/pages/CrashMode.jsx
import React, { useState, useEffect } from "react";
import { MainLayout } from "../components/MainLayout";
import api from "../lib/api";

export const CrashMode = () => {
  const [branch, setBranch] = useState("CS");
  const [semester, setSemester] = useState(4);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectCode, setSelectedSubjectCode] = useState("");

  // Plan Inputs
  const [examDate, setExamDate] = useState("");
  const [hoursPerDay, setHoursPerDay] = useState(4);
  const [topicsDoneRaw, setTopicsDoneRaw] = useState("");
  const [weakTopicsRaw, setWeakTopicsRaw] = useState("");

  const [loading, setLoading] = useState(false);
  const [planData, setPlanData] = useState(null);
  const [error, setError] = useState("");

  // Load subjects dynamically when branch or semester changes
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        setError("");
        const data = await api.getSubjects(branch, semester);
        setSubjects(data || []);
        if (data && data.length > 0) {
          setSelectedSubjectCode(data[0].code);
        } else {
          setSelectedSubjectCode("");
        }
      } catch (err) {
        console.error("Failed to load subjects:", err);
        setError("Could not load subjects from catalog.");
      }
    };
    loadSubjects();
  }, [branch, semester]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSubjectCode) {
      setError("Please select a subject first.");
      return;
    }
    if (!examDate) {
      setError("Please select your exam date.");
      return;
    }

    setLoading(true);
    setError("");
    setPlanData(null);

    // Parse comma-separated inputs
    const topics_done = topicsDoneRaw
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    const weak_topics = weakTopicsRaw
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    try {
      const result = await api.crashMode({
        subject_code: selectedSubjectCode,
        exam_date: examDate,
        hours_per_day: Number(hoursPerDay),
        topics_done,
        weak_topics,
      });
      setPlanData(result);

      // Save schedule to localStorage for dashboard integration
      const subjectName = subjects.find(s => s.code === selectedSubjectCode)?.name || selectedSubjectCode;
      const schedulePlan = {
        subjectCode: selectedSubjectCode,
        subjectName,
        examDate,
        summary: result.summary,
        strategy: result.strategy,
        days_left: result.days_left,
        total_hours: result.total_hours,
        revision_days: result.revision_days || [],
        topics_to_skip: result.topics_to_skip || [],
        predicted_questions: result.predicted_questions || [],
        plan: result.plan?.map(day => ({
          day: day.day,
          date: day.date,
          hours: day.hours,
          topics: day.topics || [],
          session_split: day.session_split || "",
          goals: day.goals || "",
          tip: day.tip || ""
        })) || []
      };
      
      localStorage.setItem(`padhai_schedule_${selectedSubjectCode}`, JSON.stringify(schedulePlan));
      
      // Update list of active schedules
      const activeSchedules = JSON.parse(localStorage.getItem("padhai_active_schedules") || "[]");
      if (!activeSchedules.includes(selectedSubjectCode)) {
        activeSchedules.push(selectedSubjectCode);
        localStorage.setItem("padhai_active_schedules", JSON.stringify(activeSchedules));
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "An error occurred while generating study schedule.");
    } finally {
      setLoading(false);
    }
  };

  const getStrategyBadgeColor = (strategy) => {
    switch (strategy?.toUpperCase()) {
      case "LAST_MINUTE":
        return { bg: "#FDE8E8", text: "#9B1C1C", label: "🚨 Last Minute Rush" };
      case "AGGRESSIVE":
        return { bg: "#FEF3C7", text: "#D97706", label: "⚡ Aggressive Push" };
      case "FOCUSED":
        return { bg: "#E0F2FE", text: "#0369A1", label: "🎯 Focused Coverage" };
      default:
        return { bg: "#DEF7EC", text: "#03543F", label: "💪 Balanced Pace" };
    }
  };

  return (
    <MainLayout>
      {/* Page Heading */}
      <div style={{ marginBottom: "40px" }}>
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "10px",
            fontWeight: 500,
            letterSpacing: "1.2px",
            textTransform: "uppercase",
            color: "var(--color-accent)",
            marginBottom: "10px",
          }}
        >
          Tool · CrashMode
        </p>
        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(32px, 4vw, 48px)",
            fontWeight: 500,
            lineHeight: "52.8px",
            letterSpacing: "-2.88px",
            color: "var(--color-ink-black)",
            margin: 0,
          }}
        >
          Crash Mode Planner
        </h1>
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "14px",
            fontWeight: 400,
            letterSpacing: "-0.48px",
            color: "var(--color-ink-muted)",
            marginTop: "10px",
            maxWidth: "600px",
          }}
        >
          Out of time? Let AI analyze past papers and configure a personalized, day-by-day study schedule matching your remaining hours.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "900px" }}>
        {/* Input Configuration Form */}
        <div className="memoir-card" style={{ padding: "32px" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            {/* Branch and Semester */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--color-ink-black)", marginBottom: "6px" }}>
                  Branch
                </label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="memoir-input"
                >
                  <option value="CS">Computer Engineering (CS)</option>
                  <option value="AIDS">Artificial Intelligence & Data Science (AIDS)</option>
                  <option value="IT">Information Technology (IT)</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--color-ink-black)", marginBottom: "6px" }}>
                  Semester
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(Number(e.target.value))}
                  className="memoir-input"
                >
                  <option value={4}>Semester 4</option>
                  <option value={5}>Semester 5</option>
                  <option value={6}>Semester 6</option>
                </select>
              </div>
            </div>

            {/* Subject Dropdown */}
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--color-ink-black)", marginBottom: "6px" }}>
                Subject
              </label>
              {subjects.length > 0 ? (
                <select
                  value={selectedSubjectCode}
                  onChange={(e) => setSelectedSubjectCode(e.target.value)}
                  className="memoir-input"
                >
                  {subjects.map((sub) => (
                    <option key={sub.code} value={sub.code}>
                      {sub.name} ({sub.code})
                    </option>
                  ))}
                </select>
              ) : (
                <div style={{ color: "var(--color-ink-muted)", fontSize: "13px", fontStyle: "italic", padding: "10px 0" }}>
                  No active subjects found in DB.
                </div>
              )}
            </div>

            {/* Date and Study Hours Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label htmlFor="exam-date" style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--color-ink-black)", marginBottom: "6px" }}>
                  Exam Date
                </label>
                <input
                  id="exam-date"
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="memoir-input"
                  required
                />
              </div>

              <div>
                <label htmlFor="hours-day" style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--color-ink-black)", marginBottom: "6px" }}>
                  Study Hours Per Day
                </label>
                <input
                  id="hours-day"
                  type="number"
                  min={1}
                  max={16}
                  value={hoursPerDay}
                  onChange={(e) => setHoursPerDay(e.target.value)}
                  className="memoir-input"
                  required
                />
              </div>
            </div>

            {/* Topics Covered & Weak Topics */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label htmlFor="topics-done" style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--color-ink-black)", marginBottom: "6px" }}>
                  Topics Done (Comma-separated)
                </label>
                <input
                  id="topics-done"
                  type="text"
                  placeholder="e.g. Deadlocks, Semaphores"
                  value={topicsDoneRaw}
                  onChange={(e) => setTopicsDoneRaw(e.target.value)}
                  className="memoir-input"
                />
              </div>

              <div>
                <label htmlFor="weak-topics" style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--color-ink-black)", marginBottom: "6px" }}>
                  Struggling Topics (Need extra focus)
                </label>
                <input
                  id="weak-topics"
                  type="text"
                  placeholder="e.g. Page Replacement"
                  value={weakTopicsRaw}
                  onChange={(e) => setWeakTopicsRaw(e.target.value)}
                  className="memoir-input"
                />
              </div>
            </div>

            {error && (
              <p style={{ color: "#d32f2f", margin: 0, fontSize: "13px", fontWeight: 600 }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !selectedSubjectCode}
              className="memoir-btn-primary"
              style={{ width: "100%", opacity: loading || !selectedSubjectCode ? 0.6 : 1 }}
            >
              {loading ? "Planning day-by-day schedule..." : "Generate Day-by-Day Schedule"}
            </button>
          </form>
        </div>

        {/* Schedule Output Display */}
        {(loading || planData) && (
          <div className="memoir-card" style={{ padding: "36px" }}>
            <h3
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "20px",
                fontWeight: 500,
                color: "var(--color-ink-black)",
                marginBottom: "20px",
                borderBottom: "1px solid var(--color-ink-border)",
                paddingBottom: "10px",
              }}
            >
              Personalized Study Schedule
            </h3>

            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ height: "16px", backgroundColor: "var(--color-linen-warm)", borderRadius: "4px", width: "100%", animation: "pulse 1.5s infinite" }} />
                <div style={{ height: "16px", backgroundColor: "var(--color-linen-warm)", borderRadius: "4px", width: "95%", animation: "pulse 1.5s infinite" }} />
                <div style={{ height: "16px", backgroundColor: "var(--color-linen-warm)", borderRadius: "4px", width: "30%", animation: "pulse 1.5s infinite" }} />
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                
                {/* Summary Box */}
                {planData.summary && (
                  <div style={{ padding: "20px", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-ink-border)", backgroundColor: "var(--color-linen-warm)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                      <h4 style={{ margin: 0, fontSize: "15px", fontWeight: 600 }}>📋 Overview & Strategy</h4>
                      {planData.strategy && (() => {
                        const strat = getStrategyBadgeColor(planData.strategy);
                        return (
                          <span style={{ fontSize: "11px", fontWeight: 700, backgroundColor: strat.bg, color: strat.text, padding: "3px 8px", borderRadius: "4px" }}>
                            {strat.label}
                          </span>
                        );
                      })()}
                    </div>
                    <p style={{ margin: 0, fontSize: "13.5px", color: "var(--color-ink-muted)", lineHeight: "1.5" }}>{planData.summary}</p>
                    <div style={{ display: "flex", gap: "16px", marginTop: "12px", fontSize: "12px", fontWeight: 600, color: "var(--color-accent)" }}>
                      <span>🗓️ Days remaining: {planData.days_left || 0}</span>
                      <span>⏰ Total study allocation: {planData.total_hours || 0} hours</span>
                    </div>
                  </div>
                )}

                {/* Day Cards list */}
                <div>
                  <h4 style={{ fontFamily: "var(--font-serif)", fontSize: "18px", fontWeight: 500, marginBottom: "16px" }}>
                    Day-by-Day Study Schedule
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {planData.plan && planData.plan.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: "20px",
                          borderRadius: "var(--radius-lg)",
                          border: "1px solid var(--color-ink-border)",
                          backgroundColor: "#fff",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                          display: "flex",
                          flexDirection: "column",
                          gap: "12px"
                        }}
                      >
                        {/* Day & Hours Header */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--color-linen-mid)", paddingBottom: "8px" }}>
                          <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--color-ink-black)" }}>
                            🌅 Day {item.day} ({item.date})
                          </span>
                          <span style={{ fontSize: "12px", fontWeight: 600, backgroundColor: "var(--color-linen-warm)", padding: "2px 8px", borderRadius: "4px", color: "var(--color-accent)" }}>
                            ⏱️ {item.hours} Hours Required
                          </span>
                        </div>

                        {/* Topics */}
                        <div>
                          <span style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", color: "var(--color-ink-muted)", display: "block", marginBottom: "4px" }}>
                            Topics to cover
                          </span>
                          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            {item.topics && item.topics.map((t, tIdx) => (
                              <span key={tIdx} style={{ fontSize: "12px", fontWeight: 600, backgroundColor: "var(--color-linen-warm)", color: "var(--color-ink-black)", padding: "3px 8px", borderRadius: "4px" }}>
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Splits */}
                        {item.session_split && (
                          <div>
                            <span style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", color: "var(--color-ink-muted)", display: "block", marginBottom: "2px" }}>
                              Session Allocation
                            </span>
                            <span style={{ fontSize: "12.5px", color: "var(--color-ink-black)" }}>{item.session_split}</span>
                          </div>
                        )}

                        {/* Daily Goals */}
                        {item.goals && (
                          <div>
                            <span style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", color: "var(--color-ink-muted)", display: "block", marginBottom: "2px" }}>
                              Daily Goals
                            </span>
                            <p style={{ margin: 0, fontSize: "12.5px", color: "var(--color-ink-black)", lineHeight: "1.4" }}>{item.goals}</p>
                          </div>
                        )}

                        {/* Daily tip */}
                        {item.tip && (
                          <div style={{ padding: "8px 12px", backgroundColor: "#F0FDF4", borderLeft: "3px solid #16A34A", borderRadius: "4px", fontSize: "11.5px", color: "#15803D" }}>
                            💡 <strong>Exam Tip:</strong> {item.tip}
                          </div>
                        )}

                      </div>
                    ))}
                  </div>
                </div>

                {/* predicted questions and revision details */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", flexWrap: "wrap" }}>
                  {planData.predicted_questions && planData.predicted_questions.length > 0 && (
                    <div style={{ padding: "16px", border: "1px solid #BAE6FD", borderRadius: "var(--radius-lg)", backgroundColor: "#F0F9FF" }}>
                      <h4 style={{ margin: "0 0 8px 0", color: "#0369A1", fontSize: "14px", fontWeight: 600 }}>🎯 Predicted Exam Questions</h4>
                      <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "12px", lineHeight: "1.6" }}>
                        {planData.predicted_questions.map((q, idx) => (
                          <li key={idx} style={{ marginBottom: "4px" }}>{q}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {planData.topics_to_skip && planData.topics_to_skip.length > 0 && (
                    <div style={{ padding: "16px", border: "1px solid #F8B4B4", borderRadius: "var(--radius-lg)", backgroundColor: "#FDF2F2" }}>
                      <h4 style={{ margin: "0 0 8px 0", color: "#9B1C1C", fontSize: "14px", fontWeight: 600 }}>⚠️ Recommended to Skip</h4>
                      <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "12px", lineHeight: "1.6" }}>
                        {planData.topics_to_skip.map((t, idx) => (
                          <li key={idx} style={{ marginBottom: "4px" }}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Revision reserved dates */}
                {planData.revision_days && planData.revision_days.length > 0 && (
                  <div style={{ padding: "12px 16px", border: "1px solid #C5E1A5", borderRadius: "var(--radius-lg)", backgroundColor: "#F1F8E9", fontSize: "12.5px", color: "#33691E" }}>
                    ✍️ <strong>Reserved Revision Dates:</strong> {planData.revision_days.join(", ")} (reserved strictly for solving past papers).
                  </div>
                )}

              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
      `}</style>
    </MainLayout>
  );
};
