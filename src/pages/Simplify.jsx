// src/pages/Simplify.jsx
import React, { useState, useEffect } from "react";
import { MainLayout } from "../components/MainLayout";
import api from "../lib/api";
import ReactMarkdown from "react-markdown";

export const Simplify = () => {
  const [branch, setBranch] = useState("CS");
  const [semester, setSemester] = useState(4);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectCode, setSelectedSubjectCode] = useState("");
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("exam-ready");
  
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState("");
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
    if (!topic.trim()) {
      setError("Please enter a concept or doubt to simplify.");
      return;
    }

    setLoading(true);
    setError("");
    setExplanation("");

    try {
      const result = await api.simplify({
        subject_code: selectedSubjectCode,
        topic: topic.trim(),
        level,
      });
      setExplanation(result.explanation || "No explanation returned.");
    } catch (err) {
      console.error(err);
      setError(err.message || "An error occurred while generating explanation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      {/* Page Header */}
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
          Tool · Simplify
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
          Simplify Notes
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
          Turn dense technical concepts into simple, intuitive explanations with Indian analogies. Perfect for fast revision.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "800px" }}>
        {/* Form Card */}
        <div className="memoir-card" style={{ padding: "32px" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            {/* Branch and Semester Selection */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label
                  style={{
                    display: "block",
                    fontFamily: "var(--font-sans)",
                    fontSize: "12px",
                    fontWeight: 600,
                    letterSpacing: "-0.48px",
                    color: "var(--color-ink-black)",
                    marginBottom: "6px",
                  }}
                >
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
                <label
                  style={{
                    display: "block",
                    fontFamily: "var(--font-sans)",
                    fontSize: "12px",
                    fontWeight: 600,
                    letterSpacing: "-0.48px",
                    color: "var(--color-ink-black)",
                    marginBottom: "6px",
                  }}
                >
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
              <label
                style={{
                  display: "block",
                  fontFamily: "var(--font-sans)",
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "-0.48px",
                  color: "var(--color-ink-black)",
                  marginBottom: "6px",
                }}
              >
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
                  No active subjects found for CS Semester {semester} in DB.
                </div>
              )}
            </div>

            {/* Topic Input */}
            <div>
              <label
                htmlFor="topic"
                style={{
                  display: "block",
                  fontFamily: "var(--font-sans)",
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "-0.48px",
                  color: "var(--color-ink-black)",
                  marginBottom: "6px",
                }}
              >
                Concept / Doubt to Simplify
              </label>
              <input
                id="topic"
                type="text"
                placeholder="e.g. Banker's Algorithm, Thrashing, Paging..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="memoir-input"
                required
              />
            </div>

            {/* Level of explanation */}
            <div>
              <label
                style={{
                  display: "block",
                  fontFamily: "var(--font-sans)",
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "-0.48px",
                  color: "var(--color-ink-black)",
                  marginBottom: "6px",
                }}
              >
                Explanation Style
              </label>
              <div style={{ display: "flex", gap: "16px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "14px" }}>
                  <input
                    type="radio"
                    name="level"
                    value="beginner"
                    checked={level === "beginner"}
                    onChange={() => setLevel("beginner")}
                    style={{ accentColor: "var(--color-accent)" }}
                  />
                  Beginner Friendly (Intuitive focus)
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "14px" }}>
                  <input
                    type="radio"
                    name="level"
                    value="exam-ready"
                    checked={level === "exam-ready"}
                    onChange={() => setLevel("exam-ready")}
                    style={{ accentColor: "var(--color-accent)" }}
                  />
                  Exam-Ready (Balanced with keywords)
                </label>
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
              {loading ? "Simplifying concept..." : "Simplify"}
            </button>
          </form>
        </div>

        {/* Results Panel */}
        {(loading || explanation) && (
          <div className="memoir-card" style={{ padding: "36px", backgroundColor: "#fff" }}>
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
              Output
            </h3>

            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ height: "16px", backgroundColor: "var(--color-linen-warm)", borderRadius: "4px", width: "100%", animation: "pulse 1.5s infinite" }} />
                <div style={{ height: "16px", backgroundColor: "var(--color-linen-warm)", borderRadius: "4px", width: "90%", animation: "pulse 1.5s infinite" }} />
                <div style={{ height: "16px", backgroundColor: "var(--color-linen-warm)", borderRadius: "4px", width: "95%", animation: "pulse 1.5s infinite" }} />
                <div style={{ height: "16px", backgroundColor: "var(--color-linen-warm)", borderRadius: "4px", width: "40%", animation: "pulse 1.5s infinite" }} />
              </div>
            ) : (
              <div className="markdown-body" style={{ fontSize: "14px", lineHeight: "1.7", color: "#333" }}>
                <ReactMarkdown>{explanation}</ReactMarkdown>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Keyframe animation for pulse loading state */}
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
