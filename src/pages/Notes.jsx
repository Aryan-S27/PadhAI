import React, { useState, useEffect } from "react";
import { MainLayout } from "../components/MainLayout";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { notesData } from "../lib/notesData";

const ProgressRing = ({ percentage, size = 32 }) => {
  const radius = size / 2 - 3;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div style={{ position: "relative", width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--color-linen-warm)"
          strokeWidth="3.5"
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--color-accent)"
          strokeWidth="3.5"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.35s" }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          fontFamily: "var(--font-sans)",
          fontSize: "9px",
          fontWeight: 700,
          color: "var(--color-ink-black)",
        }}
      >
        {percentage}%
      </div>
    </div>
  );
};

export const Notes = () => {
  const { user } = useAuth();

  // Filters State
  const [branch, setBranch] = useState("All");
  const [semester, setSemester] = useState("All");
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectCode, setSelectedSubjectCode] = useState("All");
  
  // Dashboard & Active View States
  const [activeSubjectCode, setActiveSubjectCode] = useState(null);
  const [expandedModule, setExpandedModule] = useState(null);

  // Load subjects dynamically matching Score filters
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const paramBranch = branch === "All" ? null : branch;
        const paramSem = semester === "All" ? null : semester;
        const data = await api.getSubjects(paramBranch, paramSem);
        setSubjects(data || []);
        setSelectedSubjectCode("All");
      } catch (err) {
        console.error("Failed to load subjects:", err);
      }
    };
    loadSubjects();
  }, [branch, semester]);

  // Track reading time spent on expanded module notes
  useEffect(() => {
    if (!user || user.id === "guest" || !activeSubjectCode || !expandedModule) return;

    const interval = setInterval(async () => {
      try {
        await api.incrementNotesTime(user.id, activeSubjectCode, expandedModule, 1);
      } catch (err) {
        console.warn("Failed to increment notes time:", err.message);
      }
    }, 60000); // every 60 seconds (1 minute)

    return () => clearInterval(interval);
  }, [user, activeSubjectCode, expandedModule]);

  // Set active subject and module in localStorage for the chatbot
  useEffect(() => {
    if (activeSubjectCode && activeSubjectCode !== "All") {
      localStorage.setItem("padhai_active_subject", activeSubjectCode);
    } else {
      localStorage.removeItem("padhai_active_subject");
    }
    if (expandedModule) {
      localStorage.setItem("padhai_expanded_module", expandedModule);
    } else {
      localStorage.removeItem("padhai_expanded_module");
    }
  }, [activeSubjectCode, expandedModule]);

  // Clean up localStorage on unmount
  useEffect(() => {
    return () => {
      localStorage.removeItem("padhai_active_subject");
      localStorage.removeItem("padhai_expanded_module");
    };
  }, []);

  // Dynamically compile and render Mermaid.js diagrams on expand/load
  useEffect(() => {
    if (window.mermaid) {
      try {
        window.mermaid.initialize({ startOnLoad: false, theme: "neutral" });
        window.mermaid.run();
      } catch (err) {
        console.warn("Mermaid execution error:", err);
      }
    } else {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/mermaid/10.9.0/mermaid.min.js";
      script.async = true;
      script.onload = () => {
        window.mermaid.initialize({ startOnLoad: false, theme: "neutral" });
        window.mermaid.run();
      };
      document.body.appendChild(script);
    }
  }, [activeSubjectCode, expandedModule]);

  const renderSubjectDashboard = () => {
    const sub = subjects.find(s => s.code === activeSubjectCode);
    if (!sub) return null;

    // Check if we have notes parsed for this subject code
    const parsedSubjectNotes = notesData[activeSubjectCode];

    return (
      <div style={{ maxWidth: "900px", display: "flex", flexDirection: "column", gap: "24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", borderBottom: "1px solid var(--color-ink-border)", paddingBottom: "20px" }}>
          <div>
            <button
              onClick={() => {
                setActiveSubjectCode(null);
                setExpandedModule(null);
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--color-accent)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                marginBottom: "8px"
              }}
            >
              ← Back to Catalog
            </button>
          </div>

          <div>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "28px", fontWeight: 500, color: "var(--color-ink-black)", margin: 0 }}>
              {sub.name} Study Notes
            </h2>
            <p style={{ fontSize: "13px", color: "var(--color-ink-muted)", margin: "4px 0 0 0" }}>
              Branch: {sub.branch} · Semester {sub.semester} · Subject Code: {sub.code}
            </p>
          </div>
        </div>

        {!parsedSubjectNotes ? (
          <div className="memoir-card" style={{ padding: "36px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "24px" }}>📚</span>
            <h4 style={{ fontFamily: "var(--font-serif)", fontSize: "17px", fontWeight: 500, color: "var(--color-ink-black)", margin: 0 }}>
              Notes Compilation in Progress
            </h4>
            <p style={{ fontSize: "13px", color: "var(--color-ink-muted)", margin: 0, maxWidth: "500px" }}>
              Notes catalog is currently being compiled for this subject. In the meantime, you can use the **Simplify** tool to study concepts or **Score** to practice past papers!
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {Object.entries(parsedSubjectNotes).map(([moduleTitle, markdownContent]) => {
              const isExpanded = expandedModule === moduleTitle;

              return (
                <div
                  key={moduleTitle}
                  className="memoir-card"
                  style={{
                    padding: "20px",
                    backgroundColor: isExpanded ? "#FFFDFB" : "#fff",
                    border: isExpanded ? "1px solid var(--color-accent)" : "1px solid var(--color-ink-border)",
                    transition: "all 0.2s"
                  }}
                >
                  {/* Accordion Header */}
                  <div
                    onClick={() => setExpandedModule(isExpanded ? null : moduleTitle)}
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span
                        style={{
                          fontSize: "9px",
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: "var(--radius-pill)",
                          backgroundColor: isExpanded ? "var(--color-accent-muted)" : "var(--color-linen-warm)",
                          color: isExpanded ? "var(--color-accent)" : "var(--color-ink-muted)",
                          textTransform: "uppercase"
                        }}
                      >
                        Module
                      </span>
                      <span style={{ fontSize: "14px", color: "var(--color-ink-black)", fontWeight: isExpanded ? 600 : 500 }}>
                        {moduleTitle}
                      </span>
                    </div>
                    <span style={{ transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform 0.2s", color: "var(--color-ink-muted)" }}>
                      ▼
                    </span>
                  </div>

                  {/* Accordion Body */}
                  {isExpanded && (
                    <div style={{ marginTop: "20px", borderTop: "1px solid var(--color-ink-border)", paddingTop: "16px" }}>
                      <div className="notes-markdown-body" style={{ fontSize: "14px", color: "var(--color-ink-black)", lineHeight: "1.6" }}>
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
                            },
                            code({ node, inline, className, children, ...props }) {
                              const match = /language-(\w+)/.exec(className || "");
                              if (!inline && match && match[1] === "mermaid") {
                                return (
                                  <div className="mermaid" style={{ display: "flex", justifyContent: "center", margin: "24px 0", backgroundColor: "#fff", border: "1px solid var(--color-ink-border)", padding: "16px", borderRadius: "var(--radius-lg)" }}>
                                    {String(children).replace(/\n$/, "")}
                                  </div>
                                );
                              }
                              return (
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              );
                            }
                          }}
                        >
                          {markdownContent}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
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
          Tool · Notes
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
          Notes Catalogue
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
          Browse and study chapter-wise handwritten notes transcribed and formatted with high-fidelity diagrams.
        </p>
      </div>

      {activeSubjectCode ? (
        renderSubjectDashboard()
      ) : (
        /* Catalogue Catalog list View */
        <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "900px" }}>
          
          {/* Setup Selection Card */}
          <div className="memoir-card" style={{ padding: "32px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
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
                    <option value="All">All Branches</option>
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
                    onChange={(e) => setSemester(e.target.value === "All" ? "All" : Number(e.target.value))}
                    className="memoir-input"
                  >
                    <option value="All">All Semesters</option>
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
                <select
                  value={selectedSubjectCode}
                  onChange={(e) => setSelectedSubjectCode(e.target.value)}
                  className="memoir-input"
                >
                  <option value="All">All Subjects</option>
                  {subjects.map((sub) => (
                    <option key={sub.code} value={sub.code}>
                      {sub.name} ({sub.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Cards Grid list */}
          <div>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "18px", fontWeight: 500, color: "var(--color-ink-black)", marginBottom: "16px" }}>
              Select a Subject Module to View Notes
            </h3>

            {subjects.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
                {subjects
                  .filter((sub) => selectedSubjectCode === "All" || sub.code === selectedSubjectCode)
                  .map((sub) => {
                    const hasNotes = !!notesData[sub.code];
                    const chapterCount = hasNotes ? Object.keys(notesData[sub.code]).length : 0;

                    return (
                      <div 
                        key={sub.code} 
                        className="memoir-card" 
                        style={{ 
                          padding: "24px", 
                          display: "flex", 
                          flexDirection: "column", 
                          justifyContent: "space-between", 
                          minHeight: "180px", 
                          border: "1px solid var(--color-ink-border)", 
                          backgroundColor: "#fff",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.01)"
                        }}
                      >
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                            <span style={{ fontSize: "9px", padding: "2px 8px", backgroundColor: "var(--color-linen-warm)", borderRadius: "var(--radius-pill)", color: "var(--color-accent)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2px" }}>
                              {sub.branch} · Sem {sub.semester}
                            </span>
                            <ProgressRing percentage={hasNotes ? 100 : 0} />
                          </div>

                          <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "17px", fontWeight: 500, color: "var(--color-ink-black)", margin: "0 0 6px 0", lineHeight: "1.4" }}>
                            {sub.name}
                          </h3>
                          <p style={{ fontSize: "11px", color: "var(--color-ink-muted)", margin: "0 0 16px 0" }}>
                            Code: {sub.code}
                          </p>
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--color-ink-border)", paddingTop: "14px" }}>
                          <div style={{ fontSize: "11px", color: "var(--color-ink-muted)" }}>
                            <strong>{chapterCount || "—"}</strong> {chapterCount === 1 ? "Chapter" : "Chapters"}
                          </div>
                          <button
                            onClick={() => {
                              setActiveSubjectCode(sub.code);
                              setExpandedModule(null);
                            }}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: "32px",
                              height: "32px",
                              borderRadius: "var(--radius-pill)",
                              backgroundColor: "var(--color-accent)",
                              color: "#fff",
                              border: "none",
                              cursor: "pointer",
                              transition: "opacity 0.2s"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = 0.8}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = 1}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <polygon points="5 3 19 12 5 21 5 3"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div style={{ color: "var(--color-ink-muted)", fontSize: "13px", fontStyle: "italic", padding: "16px 0" }}>
                No active subjects found for this selection.
              </div>
            )}
          </div>
        </div>
      )}
    </MainLayout>
  );
};
