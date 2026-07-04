// src/pages/Scope.jsx
import React, { useState, useEffect } from "react";
import { MainLayout } from "../components/MainLayout";
import api from "../lib/api";

export const Scope = () => {
  const [branch, setBranch] = useState("CS");
  const [semester, setSemester] = useState(4);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectCode, setSelectedSubjectCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [scopeData, setScopeData] = useState(null);
  const [error, setError] = useState("");

  // Load subjects dynamically when semester changes
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

    setLoading(true);
    setError("");
    setScopeData(null);

    try {
      const result = await api.scope({
        subject_code: selectedSubjectCode,
      });
      setScopeData(result);
    } catch (err) {
      console.error(err);
      setError(err.message || "An error occurred while fetching syllabus scope analysis.");
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toUpperCase()) {
      case "MUST STUDY":
        return { bg: "#FDE8E8", text: "#9B1C1C", border: "#F8B4B4" };
      case "HIGH":
        return { bg: "#FEF08A", text: "#713F12", border: "#FDE047" };
      case "MEDIUM":
        return { bg: "#E0F2FE", text: "#0369A1", border: "#BAE6FD" };
      default:
        return { bg: "#F3F4F6", text: "#374151", border: "#E5E7EB" };
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
          Tool · Scope
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
          Scope
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
          Analyze past papers and syllabus modules to rank topics on the basis of their weightage and occurrence in previous exams. Get study prioritization cards.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "900px" }}>
        {/* Form Card */}
        <div className="memoir-card" style={{ padding: "32px" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Branch and Semester Selection */}
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

            {/* Subject Selection */}
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
              {loading ? "Analyzing past papers..." : "Analyze Priority Weightage"}
            </button>
          </form>
        </div>

        {/* Results Study Cards Display */}
        {(loading || scopeData) && (
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
              Syllabus Priority Analysis
            </h3>

            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ height: "16px", backgroundColor: "var(--color-linen-warm)", borderRadius: "4px", width: "100%", animation: "pulse 1.5s infinite" }} />
                <div style={{ height: "16px", backgroundColor: "var(--color-linen-warm)", borderRadius: "4px", width: "90%", animation: "pulse 1.5s infinite" }} />
                <div style={{ height: "16px", backgroundColor: "var(--color-linen-warm)", borderRadius: "4px", width: "40%", animation: "pulse 1.5s infinite" }} />
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

                {/* Highlights boxes */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", flexWrap: "wrap" }}>
                  <div style={{ padding: "16px", borderRadius: "var(--radius-lg)", border: "1px solid #BAE6FD", backgroundColor: "#F0F9FF" }}>
                    <h4 style={{ margin: "0 0 6px 0", color: "#0369A1", fontSize: "14px" }}>🔥 Guaranteed Topics</h4>
                    <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "12px", lineHeight: "1.6" }}>
                      {scopeData.guaranteed_topics && scopeData.guaranteed_topics.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                      {(!scopeData.guaranteed_topics || scopeData.guaranteed_topics.length === 0) && <li>No specific data available</li>}
                    </ul>
                  </div>

                  <div style={{ padding: "16px", borderRadius: "var(--radius-lg)", border: "1px solid #F8B4B4", backgroundColor: "#FDF2F2" }}>
                    <h4 style={{ margin: "0 0 6px 0", color: "#9B1C1C", fontSize: "14px" }}>💤 Can Skip (Low Weightage)</h4>
                    <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "12px", lineHeight: "1.6" }}>
                      {scopeData.safe_to_skip && scopeData.safe_to_skip.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                      {(!scopeData.safe_to_skip || scopeData.safe_to_skip.length === 0) && <li>No specific data available</li>}
                    </ul>
                  </div>
                </div>

                {/* Ranked Cards */}
                <div>
                  <h4 style={{ fontFamily: "var(--font-serif)", fontSize: "18px", fontWeight: 500, marginBottom: "12px" }}>
                    Topic Priority Cards
                  </h4>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "16px" }}>
                    {scopeData.ranked_topics && scopeData.ranked_topics.map((card, idx) => {
                      const colors = getPriorityColor(card.priority);
                      return (
                        <div
                          key={idx}
                          style={{
                            padding: "16px",
                            borderRadius: "var(--radius-lg)",
                            border: `1.5px solid ${colors.border}`,
                            backgroundColor: "#fff",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                          }}
                        >
                          <div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                              <span
                                style={{
                                  fontSize: "9px",
                                  fontWeight: 700,
                                  textTransform: "uppercase",
                                  backgroundColor: colors.bg,
                                  color: colors.text,
                                  padding: "2px 6px",
                                  borderRadius: "4px",
                                }}
                              >
                                {card.priority}
                              </span>
                              {card.typical_marks && (
                                <span style={{ fontSize: "11px", color: "var(--color-ink-muted)" }}>
                                  ~{card.typical_marks} Marks
                                </span>
                              )}
                            </div>
                            <h5 style={{ margin: "0 0 10px 0", fontSize: "14px", fontWeight: 600, color: "var(--color-ink-black)", lineHeight: "1.4" }}>
                              {card.topic}
                            </h5>
                          </div>

                          <div style={{ borderTop: "1px solid var(--color-ink-border)", paddingTop: "8px", marginTop: "8px", fontSize: "11px", color: "var(--color-ink-muted)" }}>
                            <span>Appeared: <strong>{card.frequency || "N/A"}</strong></span>
                            {card.years_appeared && card.years_appeared.length > 0 && (
                              <span style={{ display: "block" }}>Years: {card.years_appeared.join(", ")}</span>
                            )}
                            {card.tip && (
                              <div style={{
                                marginTop: "8px",
                                padding: "6px 8px",
                                backgroundColor: "var(--color-linen-warm)",
                                borderRadius: "4px",
                                fontSize: "10.5px",
                                color: "var(--color-ink-black)",
                                borderLeft: "2.5px solid var(--color-accent)",
                                lineHeight: "1.3"
                              }}>
                                💡 {card.tip}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Optimal Study Order */}
                {scopeData.study_order && scopeData.study_order.length > 0 && (
                  <div style={{ padding: "16px", border: "1px solid var(--color-ink-border)", borderRadius: "var(--radius-lg)", backgroundColor: "var(--color-linen-warm)" }}>
                    <h4 style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: 600 }}>🎓 Recommended Study Order</h4>
                    <ol style={{ margin: 0, paddingLeft: "16px", fontSize: "13px", lineHeight: "1.6" }}>
                      {scopeData.study_order.map((step, idx) => (
                        <li key={idx} style={{ marginBottom: "4px" }}>{step}</li>
                      ))}
                    </ol>
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
