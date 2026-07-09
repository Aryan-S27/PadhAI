import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "../components/MainLayout";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import api from "../lib/api";
import { questionBank } from "../lib/questions";

export const Score = () => {
  // Setup selectors
  const navigate = useNavigate();
  const { user } = useAuth();

  // Setup selectors
  const [branch, setBranch] = useState("All");
  const [semester, setSemester] = useState("All");
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectCode, setSelectedSubjectCode] = useState("All");
  const [questionType, setQuestionType] = useState("mcq"); // "mcq" | "theory"

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Practice generation state
  const [generatedQuestions, setGeneratedQuestions] = useState(null); // array of MCQ or Theory questions

  // MCQ state
  const [userAnswers, setUserAnswers] = useState({}); // { questionId: selectedOption }
  const [mcqSubmitted, setMcqSubmitted] = useState(false);
  const [mcqScore, setMcqScore] = useState(0);

  // Theory practice state
  const [selectedTheoryQuestion, setSelectedTheoryQuestion] = useState(null);
  const [studentAnswer, setStudentAnswer] = useState("");
  const [gradingResult, setGradingResult] = useState(null);
  const [gradingLoading, setGradingLoading] = useState(false);

  // New visual modules states
  const [viewMode, setViewMode] = useState("modules"); // "modules" | "practice"
  const [activeModuleCode, setActiveModuleCode] = useState(null);
  const [allQuestions, setAllQuestions] = useState([]);
  const [studentAttempts, setStudentAttempts] = useState([]);
  const [expandedQuestionId, setExpandedQuestionId] = useState(null);
  const [submittingAttemptId, setSubmittingAttemptId] = useState(null);
  const [moduleAnswerText, setModuleAnswerText] = useState({}); // { questionId: text }

  // Load subjects dynamically when branch or semester changes
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        setError("");
        const paramBranch = branch === "All" ? null : branch;
        const paramSem = semester === "All" ? null : semester;
        const data = await api.getSubjects(paramBranch, paramSem);
        setSubjects(data || []);
        setSelectedSubjectCode("All");
      } catch (err) {
        console.error("Failed to load subjects:", err);
        setError("Could not load subjects from catalog.");
      }
    };
    loadSubjects();
  }, [branch, semester]);

  // Load past paper questions and attempts
  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: dbQs, error: dbErr } = await supabase
          .from("question_bank")
          .select("*");

        let qs = [];
        if (!dbErr && dbQs && dbQs.length > 0) {
          qs = dbQs;
        } else {
          // Flatten local questionBank
          Object.keys(questionBank).forEach((subjectCode) => {
            const subject = questionBank[subjectCode];
            const mcqs = (subject.mcq || []).map(q => ({ ...q, type: "mcq", subject_code: subjectCode }));
            const theory = (subject.theory || []).map(q => ({ ...q, type: "theory", subject_code: subjectCode }));
            qs = [...qs, ...mcqs, ...theory];
          });
        }
        setAllQuestions(qs);

        if (user?.id) {
          const attempts = await api.getStudentAttempts(user.id);
          setStudentAttempts(attempts || []);
        } else {
          setStudentAttempts([]);
        }
      } catch (err) {
        console.error("Failed to load questions/attempts:", err);
      }
    };
    loadData();
  }, [user]);

  const handleGenerateQuestions = async (e) => {
    e.preventDefault();
    if (!selectedSubjectCode) {
      setError("Please select a subject first.");
      return;
    }

    setLoading(true);
    setError("");
    setGeneratedQuestions(null);
    setUserAnswers({});
    setMcqSubmitted(false);
    setMcqScore(0);
    setSelectedTheoryQuestion(null);
    setStudentAnswer("");
    setGradingResult(null);

    try {
      const result = await api.score({
        action: "generate",
        subject_code: selectedSubjectCode,
        type: questionType,
        userId: user?.id,
      });

      if (result && result.questions) {
        setGeneratedQuestions(result.questions);
      } else {
        throw new Error("No questions returned.");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "An error occurred while generating questions.");
    } finally {
      setLoading(false);
    }
  };

  const handleMcqSelect = (qId, optionKey) => {
    if (mcqSubmitted) return; // disable change after submission
    setUserAnswers((prev) => ({
      ...prev,
      [qId]: optionKey,
    }));
  };

  const handleSubmitMcqs = () => {
    let score = 0;
    generatedQuestions.forEach((q) => {
      if (userAnswers[q.id] === q.correct_option) {
        score++;
      }
    });
    setMcqScore(score);
    setMcqSubmitted(true);
  };

  const handleSelectTheoryQuestion = (q) => {
    setSelectedTheoryQuestion(q);
    setStudentAnswer("");
    setGradingResult(null);
  };

  const handleSubmitTheoryAnswer = async (e) => {
    e.preventDefault();
    if (!studentAnswer.trim()) {
      setError("Please write an answer before submitting.");
      return;
    }

    setGradingLoading(true);
    setError("");
    setGradingResult(null);

    try {
      const result = await api.score({
        action: "grade",
        subject_code: selectedSubjectCode,
        question: selectedTheoryQuestion.question,
        marks: selectedTheoryQuestion.marks,
        student_answer: studentAnswer.trim(),
        userId: user?.id,
      });
      setGradingResult(result);
    } catch (err) {
      console.error(err);
      setError(err.message || "An error occurred while grading the answer.");
    } finally {
      setGradingLoading(false);
    }
  };

  // ── Visual Module Handlers & Components ─────────────────────────────────────

  const ProgressRing = ({ percentage, size = 42 }) => {
    const radius = size * 0.4;
    const stroke = size * 0.08;
    const normalizedRadius = radius - stroke;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div style={{ position: "relative", width: size, height: size, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
        <svg height={size} width={size} style={{ transform: "rotate(-90deg)" }}>
          <circle
            stroke="var(--color-linen-warm)"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={size / 2}
            cy={size / 2}
          />
          <circle
            stroke="var(--color-accent)"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + " " + circumference}
            style={{ strokeDashoffset, transition: "stroke-dashoffset 0.35s" }}
            r={normalizedRadius}
            cx={size / 2}
            cy={size / 2}
          />
        </svg>
        <div
          style={{
            position: "absolute",
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

  const handleSubmitModuleQuestion = async (qId, type) => {
    const answer = moduleAnswerText[qId]?.trim() || "Attempted";
    setSubmittingAttemptId(qId);
    setError("");

    try {
      const questionObj = allQuestions.find(q => q.id === qId || q.id === Number(qId));
      let finalAnswer = questionObj.answer;

      // 1. Generate and cache RAG solution if not already present
      if (questionObj.type === "theory" && !finalAnswer) {
        const solverRes = await api.score({
          action: "solve",
          subject_code: questionObj.subject_code,
          question: questionObj.question,
          marks: questionObj.marks,
          userId: user?.id,
        });
        
        finalAnswer = solverRes.answer;

        // Save/Cache back to public.question_bank table
        const { error: updateErr } = await supabase
          .from("question_bank")
          .update({ answer: finalAnswer })
          .eq("id", qId);

        if (updateErr) {
          console.warn("Failed to cache generated answer in DB:", updateErr.message);
        }

        // Update local questions state so it updates immediately
        setAllQuestions(prev => prev.map(q => q.id === qId ? { ...q, answer: finalAnswer } : q));
      }

      // 2. Save progress attempt
      let gradingResult = {};
      if (questionObj.type === "mcq") {
        const isCorrect = answer === questionObj.correct_option;
        gradingResult = {
          is_correct: isCorrect,
          correct_option: questionObj.correct_option,
          explanation: questionObj.explanation,
        };
      }

      if (user?.id) {
        // Save the student's actual typed response
        await api.saveAttempt(user.id, qId, answer, gradingResult);
        const updatedAttempts = await api.getStudentAttempts(user.id);
        setStudentAttempts(updatedAttempts || []);
      } else {
        // Mock save for guests
        const mockAttempt = {
          question_id: qId,
          student_answer: answer,
          grading_result: gradingResult
        };
        setStudentAttempts(prev => [...prev.filter(a => a.question_id !== qId), mockAttempt]);
      }

    } catch (err) {
      console.error("Failed to submit attempt:", err);
      alert("Error evaluating answer: " + err.message);
    } finally {
      setSubmittingAttemptId(null);
    }
  };

  const handleRetryModuleQuestion = async (qId) => {
    if (!confirm("Are you sure you want to clear your attempt and retry this question?")) {
      return;
    }

    try {
      if (user?.id) {
        await api.deleteAttempt(user.id, qId);
        const updatedAttempts = await api.getStudentAttempts(user.id);
        setStudentAttempts(updatedAttempts || []);
      } else {
        setStudentAttempts(prev => prev.filter(a => a.question_id !== qId));
      }

      setModuleAnswerText(prev => ({
        ...prev,
        [qId]: ""
      }));
    } catch (err) {
      console.error("Failed to delete attempt:", err);
      alert("Error resetting question: " + err.message);
    }
  };

  const renderSection = (title, questions) => {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
        <h4 style={{ fontFamily: "var(--font-serif)", fontSize: "15px", fontWeight: 600, color: "var(--color-ink-muted)", borderBottom: "1.5px solid var(--color-ink-border)", paddingBottom: "6px", margin: "16px 0 4px 0" }}>
          {title}
        </h4>
        {questions.map((q) => {
          const attempt = studentAttempts.find(att => att.question_id === q.id);
          const isAttempted = !!attempt;
          const isExpanded = expandedQuestionId === q.id;

          return (
            <div 
              key={q.id} 
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
                onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%" }}>
                  <span 
                    style={{ 
                      fontSize: "9px", 
                      fontWeight: 700, 
                      padding: "2px 8px", 
                      borderRadius: "var(--radius-pill)", 
                      backgroundColor: isAttempted ? "#D1FAE5" : "var(--color-linen-warm)", 
                      color: isAttempted ? "#065F46" : "var(--color-ink-muted)",
                      textTransform: "uppercase"
                    }}
                  >
                    {isAttempted ? "✓ Attempted" : "Unattempted"}
                  </span>
                  
                  <span style={{ fontSize: "13px", color: "var(--color-ink-black)", fontWeight: isExpanded ? 600 : 500 }}>
                    {q.question}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "11px", color: "var(--color-ink-muted)", whiteSpace: "nowrap" }}>
                    {q.marks ? `[${q.marks}M]` : ""} {q.year_of_exam ? `(MU ${q.year_of_exam})` : ""}
                  </span>
                  <span style={{ transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform 0.2s", color: "var(--color-ink-muted)" }}>
                    ▼
                  </span>
                </div>
              </div>

              {/* Accordion Body */}
              {isExpanded && (
                <div style={{ marginTop: "20px", borderTop: "1px solid var(--color-ink-border)", paddingTop: "16px" }}>
                  {isAttempted ? (
                    /* Attempted State Details */
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      
                      {/* Show student's submitted text only if they typed one */}
                      {attempt.student_answer && attempt.student_answer !== "Attempted" && (
                        <div>
                          <h5 style={{ margin: "0 0 6px 0", fontSize: "12px", fontWeight: 700, color: "var(--color-ink-muted)" }}>
                            Your Submitted Answer:
                          </h5>
                          <div style={{ padding: "14px", backgroundColor: "var(--color-linen-warm)", borderRadius: "var(--radius-md)", fontSize: "13px", color: "#333", whiteSpace: "pre-wrap" }}>
                            {attempt.student_answer}
                          </div>
                        </div>
                      )}

                      {/* Grading Scorecard (Legacy compatibility) */}
                      {q.type === "theory" && attempt.grading_result && attempt.grading_result.marks_awarded !== undefined && (
                        <div style={{ border: "1px solid var(--color-ink-border)", padding: "18px", borderRadius: "var(--radius-lg)", backgroundColor: "#fff" }}>
                          <h5 style={{ margin: "0 0 12px 0", fontSize: "13px", fontWeight: 700 }}>
                            📝 Examiner Assessment Scorecard
                          </h5>
                          
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", textAlign: "center", marginBottom: "16px" }}>
                            <div style={{ padding: "12px", backgroundColor: "var(--color-linen-warm)", borderRadius: "var(--radius-md)" }}>
                              <div style={{ fontSize: "10px", textTransform: "uppercase", color: "var(--color-ink-muted)" }}>Marks Awarded</div>
                              <div style={{ fontSize: "20px", fontWeight: 700, color: "var(--color-accent)" }}>
                                {attempt.grading_result.marks_awarded} / {attempt.grading_result.marks_total}
                              </div>
                            </div>
                            <div style={{ padding: "12px", backgroundColor: "var(--color-linen-warm)", borderRadius: "var(--radius-md)" }}>
                              <div style={{ fontSize: "10px", textTransform: "uppercase", color: "var(--color-ink-muted)" }}>Performance Grade</div>
                              <div style={{ fontSize: "18px", fontWeight: 700 }}>
                                {attempt.grading_result.grade || "N/A"}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* MCQ Result (For MCQ only) */}
                      {q.type === "mcq" && (
                        <div 
                          style={{ 
                            padding: "14px", 
                            backgroundColor: attempt.grading_result.is_correct ? "#ECFDF5" : "#FEF2F2",
                            border: attempt.grading_result.is_correct ? "1px solid #A7F3D0" : "1px solid #FCA5A5",
                            borderRadius: "var(--radius-md)",
                            fontSize: "13px"
                          }}
                        >
                          <div style={{ fontWeight: 700, color: attempt.grading_result.is_correct ? "#065F46" : "#991B1B", marginBottom: "4px" }}>
                            {attempt.grading_result.is_correct ? "✓ Correct Option!" : `✗ Incorrect (Correct Option: ${attempt.grading_result.correct_option})`}
                          </div>
                          {attempt.grading_result.explanation && <div><strong>Explanation:</strong> {attempt.grading_result.explanation}</div>}
                        </div>
                      )}

                      {/* Stored Ideal Answer (RAG Solution Cache) */}
                      {(q.answer || q.ideal_answer) && (
                        <div style={{ border: "1.5px solid var(--color-accent)", padding: "18px", borderRadius: "var(--radius-lg)", backgroundColor: "#FFFDFB" }}>
                          <h5 style={{ margin: "0 0 10px 0", color: "var(--color-accent)", fontSize: "13px", fontWeight: 700 }}>
                            🎯 Model Solution & Explanation (MU Standard)
                          </h5>
                          <div style={{ fontSize: "13px", color: "var(--color-ink-black)", lineHeight: "1.6", whiteSpace: "pre-wrap", fontFamily: "var(--font-sans)" }}>
                            {q.answer || q.ideal_answer}
                          </div>
                        </div>
                      )}

                      {/* Retry Button */}
                      <div>
                        <button
                          onClick={() => handleRetryModuleQuestion(q.id)}
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "transparent",
                            border: "1px solid var(--color-accent)",
                            color: "var(--color-accent)",
                            borderRadius: "var(--radius-md)",
                            fontSize: "12px",
                            fontWeight: 600,
                            cursor: "pointer"
                          }}
                        >
                          🔄 Retry Question
                        </button>
                      </div>

                    </div>
                  ) : (
                    /* Unattempted Input Area */
                    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                      
                      {q.type === "mcq" ? (
                        /* MCQ Choice Buttons */
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          {Object.entries(q.options || {}).map(([key, text]) => {
                            const isSelected = moduleAnswerText[q.id] === key;
                            return (
                              <button
                                key={key}
                                type="button"
                                onClick={() => setModuleAnswerText(prev => ({ ...prev, [q.id]: key }))}
                                style={{
                                  textAlign: "left",
                                  padding: "10px 14px",
                                  borderRadius: "var(--radius-md)",
                                  border: isSelected ? "1.5px solid var(--color-accent)" : "1px solid var(--color-ink-border)",
                                  backgroundColor: isSelected ? "var(--color-accent-muted)" : "transparent",
                                  fontSize: "13px",
                                  cursor: "pointer"
                                }}
                              >
                                <strong>{key}.</strong> {text}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        /* Theory Textarea (For practice, but not saved) */
                        <div>
                          <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--color-ink-muted)", marginBottom: "6px" }}>
                            Draft your answer (Optional - will not be saved to DB):
                          </label>
                          <textarea
                            rows={6}
                            value={moduleAnswerText[q.id] || ""}
                            onChange={(e) => setModuleAnswerText(prev => ({ ...prev, [q.id]: e.target.value }))}
                            placeholder="Type your notes or structure your answer here..."
                            className="memoir-input"
                            style={{ resize: "vertical", fontFamily: "var(--font-sans)", fontSize: "13px" }}
                          />
                        </div>
                      )}

                      <div>
                        <button
                          onClick={() => handleSubmitModuleQuestion(q.id, q.type)}
                          disabled={submittingAttemptId === q.id}
                          className="memoir-btn-primary"
                          style={{
                            padding: "8px 18px",
                            opacity: submittingAttemptId === q.id ? 0.6 : 1,
                            fontSize: "12px",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px"
                          }}
                        >
                          {submittingAttemptId === q.id ? "Generating RAG Solution..." : "Reveal Solution"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderModuleDashboard = () => {
    const sub = subjects.find(s => s.code === activeModuleCode);
    if (!sub) return null;

    const moduleQuestions = allQuestions.filter(q => q.subject_code === activeModuleCode);
    
    const mcqs = moduleQuestions.filter(q => q.type === "mcq");
    const shortQs = moduleQuestions.filter(q => q.type === "theory" && (q.marks || 0) <= 5);
    const mediumQs = moduleQuestions.filter(q => q.type === "theory" && q.marks === 10);
    const longQs = moduleQuestions.filter(q => q.type === "theory" && (q.marks || 0) > 10);

    const attemptedCount = moduleQuestions.filter(q =>
      studentAttempts.some(att => att.question_id === q.id)
    ).length;

    return (
      <div style={{ maxWidth: "900px", display: "flex", flexDirection: "column", gap: "24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", borderBottom: "1px solid var(--color-ink-border)", paddingBottom: "20px" }}>
          <div>
            <button
              onClick={() => setActiveModuleCode(null)}
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
              ← Back to Modules
            </button>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "28px", fontWeight: 500, color: "var(--color-ink-black)", margin: 0 }}>
                {sub.name} Past Papers
              </h2>
              <p style={{ fontSize: "13px", color: "var(--color-ink-muted)", margin: "4px 0 0 0" }}>
                Branch: {sub.branch} · Semester {sub.semester} · Subject Code: {sub.code}
              </p>
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: "12px", backgroundColor: "#fff", border: "1px solid var(--color-ink-border)", padding: "10px 18px", borderRadius: "var(--radius-lg)" }}>
              <ProgressRing percentage={moduleQuestions.length > 0 ? Math.round((attemptedCount / moduleQuestions.length) * 100) : 0} size={38} />
              <div style={{ fontSize: "12px" }}>
                <div style={{ fontWeight: 700, color: "var(--color-ink-black)" }}>Attempted Progress</div>
                <div style={{ color: "var(--color-ink-muted)" }}>{attemptedCount} of {moduleQuestions.length} Questions</div>
              </div>
            </div>
          </div>
        </div>
        {!user && (
          <div style={{ backgroundColor: "#FFFBEB", border: "1px solid #FCD34D", color: "#B45309", padding: "14px 18px", borderRadius: "var(--radius-lg)", fontSize: "13px", display: "flex", gap: "10px", alignItems: "center" }}>
            <span style={{ fontSize: "18px" }}>⚠️</span>
            <span>You are practicing as a guest. Your inputs and scores will not be saved. <strong style={{ textDecoration: "underline", cursor: "pointer" }} onClick={() => navigate("/auth")}>Sign in</strong> to sync your progress!</span>
          </div>
        )}

        {mcqs.length > 0 && renderSection("MCQ Questions (1 Mark each)", mcqs)}
        {shortQs.length > 0 && renderSection("Short Answer Questions (5 Marks each)", shortQs)}
        {mediumQs.length > 0 && renderSection("Medium Answer Questions (10 Marks each)", mediumQs)}
        {longQs.length > 0 && renderSection("Long Answer Questions (12+ Marks each)", longQs)}
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
          Tool · Score
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
          Score & Practice
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
          Grind past papers, test your skills, and get examiner scorecard feedback aligned with Mumbai University guidelines.
        </p>
      </div>

      {/* View Mode Tabs */}
      <div style={{ display: "flex", gap: "16px", borderBottom: "1px solid var(--color-ink-border)", paddingBottom: "1px", marginBottom: "32px", maxWidth: "900px" }}>
        <button
          onClick={() => {
            setViewMode("modules");
            setActiveModuleCode(null);
          }}
          style={{
            padding: "10px 16px",
            border: "none",
            borderBottom: viewMode === "modules" ? "2.5px solid var(--color-accent)" : "2.5px solid transparent",
            background: "none",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            color: viewMode === "modules" ? "var(--color-accent)" : "var(--color-ink-muted)",
            fontFamily: "var(--font-sans)",
            transition: "all 0.2s"
          }}
        >
          📁 Past Paper Modules
        </button>
        <button
          onClick={() => {
            setViewMode("practice");
            setGeneratedQuestions(null);
          }}
          style={{
            padding: "10px 16px",
            border: "none",
            borderBottom: viewMode === "practice" ? "2.5px solid var(--color-accent)" : "2.5px solid transparent",
            background: "none",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            color: viewMode === "practice" ? "var(--color-accent)" : "var(--color-ink-muted)",
            fontFamily: "var(--font-sans)",
            transition: "all 0.2s"
          }}
        >
          ⚡ Dynamic RAG Practice
        </button>
      </div>

      {/* Active Module Dashboard View */}
      {viewMode === "modules" && activeModuleCode ? (
        renderModuleDashboard()
      ) : (
        /* Catalogue View */
        <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "900px" }}>
          
          {/* Setup Selection Card */}
          <div className="memoir-card" style={{ padding: "32px" }}>
            <form onSubmit={handleGenerateQuestions} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              
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

              {/* Practice Mode Specific Controls */}
              {viewMode === "practice" && (
                <>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--color-ink-black)", marginBottom: "6px" }}>
                      Practice Type
                    </label>
                    <div style={{ display: "flex", gap: "16px" }}>
                      <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "14px" }}>
                        <input
                          type="radio"
                          name="questionType"
                          value="mcq"
                          checked={questionType === "mcq"}
                          onChange={() => setQuestionType("mcq")}
                          style={{ accentColor: "var(--color-accent)" }}
                        />
                        10 Multiple Choice Questions (MCQs)
                      </label>
                      <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "14px" }}>
                        <input
                          type="radio"
                          name="questionType"
                          value="theory"
                          checked={questionType === "theory"}
                          onChange={() => setQuestionType("theory")}
                          style={{ accentColor: "var(--color-accent)" }}
                        />
                        3 Theory Exam Questions
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
                    disabled={loading || selectedSubjectCode === "All"}
                    className="memoir-btn-primary"
                    style={{ width: "100%", opacity: loading || selectedSubjectCode === "All" ? 0.6 : 1 }}
                  >
                    {loading ? "Generating practice questions..." : "Generate Practice Questions"}
                  </button>
                  {selectedSubjectCode === "All" && (
                    <span style={{ fontSize: "11px", color: "var(--color-ink-muted)", fontStyle: "italic", textAlign: "center" }}>
                      *Select a specific subject to run a dynamic syllabus practice test
                    </span>
                  )}
                </>
              )}
            </form>
          </div>

          {/* Render Visual Modules Grid Catalogue */}
          {viewMode === "modules" && (
            <div>
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "18px", fontWeight: 500, color: "var(--color-ink-black)", marginBottom: "16px" }}>
                Select a Past Paper Module to Practice
              </h3>

              {subjects.length > 0 ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
                  {subjects
                    .filter((sub) => selectedSubjectCode === "All" || sub.code === selectedSubjectCode)
                    .map((sub) => {
                      const subQuestions = allQuestions.filter(q => q.subject_code === sub.code);
                      const totalCount = subQuestions.length;
                      
                      const attemptedCount = subQuestions.filter(q =>
                        studentAttempts.some(att => att.question_id === q.id)
                      ).length;

                      const percentage = totalCount > 0 ? Math.round((attemptedCount / totalCount) * 100) : 0;
                      
                      const uniqueYears = [...new Set(subQuestions.map(q => q.year_of_exam).filter(Boolean))];

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
                              <ProgressRing percentage={percentage} />
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
                              <strong>{uniqueYears.length}</strong> {uniqueYears.length === 1 ? "Paper" : "Papers"} ({totalCount} Questions)
                            </div>
                            <button
                              onClick={() => {
                                setActiveModuleCode(sub.code);
                                setExpandedQuestionId(null);
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
          )}

          {/* Loading Placeholders for Practice Mode */}
          {viewMode === "practice" && loading && (
            <div className="memoir-card" style={{ padding: "36px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ height: "16px", backgroundColor: "var(--color-linen-warm)", borderRadius: "4px", width: "100%", animation: "pulse 1.5s infinite" }} />
                <div style={{ height: "16px", backgroundColor: "var(--color-linen-warm)", borderRadius: "4px", width: "90%", animation: "pulse 1.5s infinite" }} />
                <div style={{ height: "16px", backgroundColor: "var(--color-linen-warm)", borderRadius: "4px", width: "40%", animation: "pulse 1.5s infinite" }} />
              </div>
            </div>
          )}

          {/* Display Generated MCQ Questions in Practice Mode */}
          {viewMode === "practice" && generatedQuestions && questionType === "mcq" && (
            <div className="memoir-card" style={{ padding: "36px" }}>
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "20px", fontWeight: 500, marginBottom: "20px", borderBottom: "1px solid var(--color-ink-border)", paddingBottom: "10px" }}>
                Multiple Choice Questions
              </h3>

              {mcqSubmitted && (
                <div style={{ padding: "16px", backgroundColor: "var(--color-accent-muted)", color: "var(--color-accent)", borderRadius: "var(--radius-lg)", marginBottom: "24px", fontWeight: 700, fontSize: "16px" }}>
                  Score: {mcqScore} / {generatedQuestions.length} correct
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {generatedQuestions.map((q, idx) => (
                  <div key={q.id || idx} style={{ borderBottom: "1px solid var(--color-ink-border)", paddingBottom: "20px" }}>
                    <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: 600 }}>
                      Q{idx + 1}. {q.question}
                    </h4>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "8px" }}>
                      {Object.entries(q.options || {}).map(([key, text]) => {
                        const isSelected = userAnswers[q.id] === key;
                        const isCorrect = q.correct_option === key;

                        let borderStyle = "1px solid var(--color-ink-border)";
                        let bgStyle = "transparent";

                        if (mcqSubmitted) {
                          if (isCorrect) {
                            borderStyle = "1.5px solid #34D399";
                            bgStyle = "#ECFDF5";
                          } else if (isSelected) {
                            borderStyle = "1.5px solid #F87171";
                            bgStyle = "#FEF2F2";
                          }
                        } else if (isSelected) {
                          borderStyle = "1.5px solid var(--color-accent)";
                          bgStyle = "var(--color-accent-muted)";
                        }

                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => handleMcqSelect(q.id, key)}
                            disabled={mcqSubmitted}
                            style={{
                              textAlign: "left",
                              padding: "10px 14px",
                              borderRadius: "var(--radius-md)",
                              border: borderStyle,
                              backgroundColor: bgStyle,
                              fontSize: "13px",
                              cursor: mcqSubmitted ? "default" : "pointer",
                              width: "100%",
                            }}
                          >
                            <strong>{key}.</strong> {text}
                          </button>
                        );
                      })}
                    </div>

                    {mcqSubmitted && (
                      <div style={{
                        marginTop: "12px",
                        padding: "12px",
                        backgroundColor: userAnswers[q.id] === q.correct_option ? "#ECFDF5" : "#FEF2F2",
                        border: userAnswers[q.id] === q.correct_option ? "1px solid #A7F3D0" : "1px solid #FCA5A5",
                        borderRadius: "var(--radius-md)",
                        fontSize: "12px",
                        borderLeft: userAnswers[q.id] === q.correct_option ? "4px solid #10B981" : "4px solid #EF4444"
                      }}>
                        <div style={{ fontWeight: 700, marginBottom: "4px", color: userAnswers[q.id] === q.correct_option ? "#065F46" : "#991B1B" }}>
                          {userAnswers[q.id] === q.correct_option ? "✓ Correct!" : `✗ Incorrect`}
                        </div>
                        <strong>Explanation:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {!mcqSubmitted && (
                <button
                  onClick={handleSubmitMcqs}
                  className="memoir-btn-primary"
                  style={{ width: "100%", marginTop: "24px" }}
                >
                  Submit and Check Answers
                </button>
              )}
            </div>
          )}

          {/* Display Generated Theory Questions in Practice Mode */}
          {viewMode === "practice" && generatedQuestions && questionType === "theory" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div className="memoir-card" style={{ padding: "36px" }}>
                <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "20px", fontWeight: 500, marginBottom: "20px", borderBottom: "1px solid var(--color-ink-border)", paddingBottom: "10px" }}>
                  Select a Question to Practice
                </h3>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {generatedQuestions.map((q, idx) => (
                    <button
                      key={q.id || idx}
                      onClick={() => handleSelectTheoryQuestion(q)}
                      style={{
                        textAlign: "left",
                        padding: "16px",
                        borderRadius: "var(--radius-lg)",
                        border: selectedTheoryQuestion?.id === q.id ? "1.5px solid var(--color-accent)" : "1px solid var(--color-ink-border)",
                        backgroundColor: selectedTheoryQuestion?.id === q.id ? "var(--color-accent-muted)" : "#fff",
                        cursor: "pointer",
                        fontSize: "13px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <strong>Question {idx + 1}:</strong> {q.question}
                      </div>
                      <span style={{ fontSize: "11px", color: "var(--color-ink-muted)", whiteSpace: "nowrap" }}>
                        ({q.marks} Marks)
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Answer and Evaluation panel */}
              {selectedTheoryQuestion && (
                <div className="memoir-card" style={{ padding: "36px" }}>
                  <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "18px", fontWeight: 500, marginBottom: "16px" }}>
                    Write Your Answer
                  </h3>
                  <p style={{ fontSize: "13px", margin: "0 0 16px 0", color: "#333", backgroundColor: "var(--color-linen-warm)", padding: "12px", borderRadius: "var(--radius-md)" }}>
                    <strong>Q:</strong> {selectedTheoryQuestion.question} ({selectedTheoryQuestion.marks} Marks)
                  </p>

                  <form onSubmit={handleSubmitTheoryAnswer}>
                    <textarea
                      rows={8}
                      value={studentAnswer}
                      onChange={(e) => setStudentAnswer(e.target.value)}
                      placeholder="Write your detailed answer here..."
                      className="memoir-input"
                      style={{ resize: "vertical", height: "auto", fontFamily: "var(--font-sans)", marginBottom: "16px" }}
                      required
                    />

                    {error && (
                      <p style={{ color: "#d32f2f", margin: "0 0 16px 0", fontSize: "13px", fontWeight: 600 }}>
                        {error}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={gradingLoading}
                      className="memoir-btn-primary"
                      style={{ width: "100%", opacity: gradingLoading ? 0.6 : 1 }}
                    >
                      {gradingLoading ? "Submitting for strict grading..." : "Submit Answer to Grade"}
                    </button>
                  </form>

                  {/* Grading Evaluation Result */}
                  {(gradingLoading || gradingResult) && (
                    <div style={{ marginTop: "32px", borderTop: "1px solid var(--color-ink-border)", paddingTop: "24px" }}>
                      <h4 style={{ fontFamily: "var(--font-serif)", fontSize: "18px", fontWeight: 500, marginBottom: "16px" }}>
                        Examiner Scorecard
                      </h4>

                      {gradingLoading ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          <div style={{ height: "16px", backgroundColor: "var(--color-linen-warm)", borderRadius: "4px", width: "100%", animation: "pulse 1.5s infinite" }} />
                          <div style={{ height: "16px", backgroundColor: "var(--color-linen-warm)", borderRadius: "4px", width: "70%", animation: "pulse 1.5s infinite" }} />
                        </div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                          
                          {/* Score and Grade Block */}
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", textAlign: "center" }}>
                            <div style={{ padding: "16px", backgroundColor: "var(--color-linen-warm)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-ink-border)" }}>
                              <div style={{ fontSize: "11px", textTransform: "uppercase", color: "var(--color-ink-muted)", fontWeight: 700 }}>Marks Awarded</div>
                              <div style={{ fontSize: "28px", fontWeight: 700, color: "var(--color-accent)", margin: "4px 0" }}>
                                {gradingResult.marks_awarded} / {gradingResult.marks_total}
                              </div>
                              <div style={{ fontSize: "11px", color: "var(--color-ink-muted)" }}>
                                {gradingResult.percentage}% Score
                              </div>
                            </div>

                            <div style={{ padding: "16px", backgroundColor: "var(--color-linen-warm)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-ink-border)" }}>
                              <div style={{ fontSize: "11px", textTransform: "uppercase", color: "var(--color-ink-muted)", fontWeight: 700 }}>Performance Grade</div>
                              <div style={{ fontSize: "22px", fontWeight: 700, margin: "10px 0" }}>
                                {gradingResult.grade}
                              </div>
                            </div>
                          </div>

                          {/* Keyword list comparison */}
                          {gradingResult.feedback && (
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                              <div style={{ padding: "16px", border: "1px solid #BAE6FD", backgroundColor: "#F0F9FF", borderRadius: "var(--radius-lg)" }}>
                                <h5 style={{ margin: "0 0 8px 0", color: "#0369A1", fontSize: "13px" }}>✅ What Was Correct</h5>
                                <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "12px", lineHeight: "1.5" }}>
                                  {gradingResult.feedback.correct && gradingResult.feedback.correct.map((item, idx) => (
                                    <li key={idx} style={{ marginBottom: "3px" }}>{item}</li>
                                  ))}
                                </ul>
                              </div>

                              <div style={{ padding: "16px", border: "1px solid #F8B4B4", backgroundColor: "#FDF2F2", borderRadius: "var(--radius-lg)" }}>
                                <h5 style={{ margin: "0 0 8px 0", color: "#9B1C1C", fontSize: "13px" }}>❌ What Was Missing</h5>
                                <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "12px", lineHeight: "1.5" }}>
                                  {gradingResult.feedback.missing && gradingResult.feedback.missing.map((item, idx) => (
                                    <li key={idx} style={{ marginBottom: "3px" }}>{item}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}

                          {/* Expected Keywords block */}
                          {gradingResult.feedback && gradingResult.feedback.keywords_expected && (
                            <div style={{ border: "1px solid var(--color-ink-border)", padding: "16px", borderRadius: "var(--radius-lg)" }}>
                              <h5 style={{ margin: "0 0 8px 0", fontSize: "13px" }}>🔑 Expected Key Technical Terms</h5>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                {gradingResult.feedback.keywords_expected.map((word, idx) => {
                                  const found = gradingResult.feedback.keywords_found?.includes(word);
                                  return (
                                    <span
                                      key={idx}
                                      style={{
                                        fontSize: "11px",
                                        padding: "3px 8px",
                                        borderRadius: "var(--radius-pill)",
                                        backgroundColor: found ? "#E6FDF5" : "#F3F4F6",
                                        color: found ? "#047857" : "#4B5563",
                                        border: found ? "1px solid #A7F3D0" : "1px solid #E5E7EB",
                                        textDecoration: found ? "none" : "line-through",
                                      }}
                                    >
                                      {word} {found ? "✓" : ""}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Ideal structure */}
                          {gradingResult.ideal_structure && (
                            <div>
                              <h5 style={{ margin: "0 0 6px 0", fontSize: "13px" }}>📋 Recommended Answer Layout</h5>
                              <div style={{ fontSize: "13px", color: "#333", backgroundColor: "var(--color-linen-warm)", padding: "14px", borderRadius: "var(--radius-md)", borderLeft: "3.5px solid var(--color-accent)" }}>
                                {gradingResult.ideal_structure}
                              </div>
                            </div>
                          )}

                          {/* Exam Tip */}
                          {gradingResult.exam_tip && (
                            <div style={{ backgroundColor: "#FEF3C7", border: "1px solid #FCD34D", color: "#92400E", padding: "12px 16px", borderRadius: "var(--radius-lg)", fontSize: "13px", marginBottom: "12px" }}>
                              💡 <strong>Examiner Exam Tip:</strong> {gradingResult.exam_tip}
                            </div>
                          )}

                          {/* Stored Model Answer */}
                          {selectedTheoryQuestion.ideal_answer && (
                            <div style={{ marginTop: "12px", border: "1.5px solid var(--color-accent)", padding: "18px", borderRadius: "var(--radius-lg)", backgroundColor: "#FFFDFB" }}>
                              <h5 style={{ margin: "0 0 10px 0", color: "var(--color-accent)", fontSize: "14px", fontWeight: 700 }}>
                                🎯 Model Answer (MU Acceptable Standards)
                              </h5>
                              <div 
                                style={{ fontSize: "13.5px", color: "var(--color-ink-black)", lineHeight: "1.6", whiteSpace: "pre-wrap", fontFamily: "var(--font-sans)" }}
                              >
                                {selectedTheoryQuestion.ideal_answer}
                              </div>
                            </div>
                          )}

                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

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
