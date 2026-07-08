// src/pages/Simplify.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { MainLayout } from "../components/MainLayout";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Lock, Sparkles, AlertCircle } from "lucide-react";

export const Simplify = () => {
  const { isGuest } = useAuth();
  const navigate = useNavigate();

  const [branch, setBranch] = useState("CS");
  const [semester, setSemester] = useState(4);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectCode, setSelectedSubjectCode] = useState("");
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("exam-ready");
  
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [error, setError] = useState("");

  // Guest constraints
  const [guestQueries, setGuestQueries] = useState(() => {
    return Number(localStorage.getItem("padhai_guest_queries") || "0");
  });
  const [showPromptModal, setShowPromptModal] = useState(false);

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

    if (isGuest && guestQueries >= 3) {
      setShowPromptModal(true);
      return;
    }

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
      
      // Increment guest queries count on successful generation
      if (isGuest) {
        const nextCount = guestQueries + 1;
        setGuestQueries(nextCount);
        localStorage.setItem("padhai_guest_queries", String(nextCount));
        if (nextCount >= 3) {
          // Immediately prompt user on reaching limit
          setShowPromptModal(true);
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "An error occurred while generating explanation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      {/* 1. Guest Trial Status Banner */}
      {isGuest && (
        <div
          style={{
            padding: "12px 24px",
            borderRadius: "var(--radius-xl)",
            backgroundColor: guestQueries >= 3 ? "#FEF3EE" : "var(--color-accent-muted)",
            border: "1px solid " + (guestQueries >= 3 ? "rgba(181, 74, 58, 0.2)" : "rgba(200, 133, 74, 0.2)"),
            color: guestQueries >= 3 ? "#B54A3A" : "var(--color-accent-hover)",
            fontFamily: "var(--font-sans)",
            fontSize: "13px",
            fontWeight: 600,
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Sparkles size={16} />
            <span>
              {guestQueries >= 3 
                ? "You have used all 3 free trial queries." 
                : `Guest Trial Active: ${3 - guestQueries} of 3 free queries remaining.`
              }
            </span>
          </div>
          <Link
            to="/signup"
            style={{
              backgroundColor: "var(--color-pure-white)",
              color: "var(--color-ink-black)",
              padding: "4px 12px",
              borderRadius: "var(--radius-pill)",
              fontSize: "12px",
              fontWeight: 700,
              textDecoration: "none",
              border: "1px solid var(--color-ink-border)",
              boxShadow: "var(--shadow-card)"
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--color-linen-warm)"}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = "var(--color-pure-white)"}
          >
            Create Free Account
          </Link>
        </div>
      )}

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
            letterSpacing: "-2px",
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
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    table({ children }) {
                      return (
                        <div style={{ overflowX: "auto", margin: "20px 0" }}>
                          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", color: "var(--color-ink-black)", border: "1px solid var(--color-ink-border)" }}>
                            {children}
                          </table>
                        </div>
                      );
                    },
                    thead({ children }) {
                      return <thead style={{ backgroundColor: "var(--color-linen-warm)", borderBottom: "2px solid var(--color-ink-border)" }}>{children}</thead>;
                    },
                    th({ children }) {
                      return <th style={{ padding: "10px 14px", fontWeight: 600, textAlign: "left", border: "1px solid var(--color-ink-border)" }}>{children}</th>;
                    },
                    td({ children }) {
                      return <td style={{ padding: "10px 14px", border: "1px solid var(--color-ink-border)" }}>{children}</td>;
                    }
                  }}
                >
                  {explanation}
                </ReactMarkdown>
            )}
          </div>
        )}
      </div>

      {/* Guest Lockout/SignUp Modal */}
      {showPromptModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            animation: "fadeIn 0.2s ease"
          }}
        >
          <div
            className="memoir-card"
            style={{
              width: "100%",
              maxWidth: "440px",
              padding: "36px",
              textAlign: "center",
              margin: "20px",
              animation: "slideUp 0.3s ease"
            }}
          >
            <div
              style={{
                width: "60px",
                height: "60px",
                backgroundColor: "var(--color-accent-muted)",
                borderRadius: "var(--radius-pill)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px"
              }}
            >
              <Lock size={24} color="var(--color-accent)" />
            </div>

            <h3
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "24px",
                fontWeight: 500,
                color: "var(--color-ink-black)",
                margin: "0 0 10px 0"
              }}
            >
              Save Your Progress
            </h3>
            
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "14px",
                lineHeight: "22px",
                color: "var(--color-ink-muted)",
                margin: "0 0 28px 0"
              }}
            >
              You've utilized all 3 free trial queries. Register a free account to get unlimited queries, create custom exam countdown schedules, and analyze exam paper answers.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button
                onClick={() => navigate("/signup", { state: { msg: "Register a free account to unlock unlimited access!" } })}
                className="memoir-btn-primary"
                style={{ width: "100%", padding: "12px" }}
              >
                Sign Up for Free
              </button>
              <button
                onClick={() => navigate("/login")}
                className="memoir-btn-ghost"
                style={{ width: "100%", padding: "12px" }}
              >
                Log In
              </button>
              {guestQueries < 3 && (
                <button
                  onClick={() => setShowPromptModal(false)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--color-ink-muted)",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    marginTop: "8px"
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Keyframe animation styles */}
      <style>{`
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </MainLayout>
  );
};
