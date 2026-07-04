// src/pages/Score.jsx
import React, { useState, useEffect } from "react";
import { MainLayout } from "../components/MainLayout";
import api from "../lib/api";

export const Score = () => {
  // Setup selectors
  const [branch, setBranch] = useState("CS");
  const [semester, setSemester] = useState(4);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectCode, setSelectedSubjectCode] = useState("");
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
      });
      setGradingResult(result);
    } catch (err) {
      console.error(err);
      setError(err.message || "An error occurred while grading the answer.");
    } finally {
      setGradingLoading(false);
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
          Generate RAG-grounded MCQs or theory questions to practice. Write your answers and get rigorous examiner-style marks and feedback.
        </p>
      </div>

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
                  No active subjects found for CS Semester {semester} in DB.
                </div>
              )}
            </div>

            {/* Question Type Selection */}
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
              disabled={loading || !selectedSubjectCode}
              className="memoir-btn-primary"
              style={{ width: "100%", opacity: loading || !selectedSubjectCode ? 0.6 : 1 }}
            >
              {loading ? "Generating practice questions..." : "Generate Practice Questions"}
            </button>
          </form>
        </div>

        {/* Loading Placeholders */}
        {loading && (
          <div className="memoir-card" style={{ padding: "36px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ height: "16px", backgroundColor: "var(--color-linen-warm)", borderRadius: "4px", width: "100%", animation: "pulse 1.5s infinite" }} />
              <div style={{ height: "16px", backgroundColor: "var(--color-linen-warm)", borderRadius: "4px", width: "90%", animation: "pulse 1.5s infinite" }} />
              <div style={{ height: "16px", backgroundColor: "var(--color-linen-warm)", borderRadius: "4px", width: "40%", animation: "pulse 1.5s infinite" }} />
            </div>
          </div>
        )}

        {/* Display Generated MCQ Questions */}
        {generatedQuestions && questionType === "mcq" && (
          <div className="memoir-card" style={{ padding: "36px" }}>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "20px", fontWeight: 500, marginBottom: "20px", borderBottom: "1px solid var(--color-ink-border)", paddingBottom: "10px" }}>
              Multiple Choice Questions
            </h3>

            {mcqSubmitted && (
              <div style={{ padding: "16px", backgroundColor: "var(--color-accent-muted)", color: "var(--color-accent)", borderRadius: "var(--radius-lg)", marginBottom: "24px", fontWeight: 700, fontSize: "16px" }}>
                Score: {mcqScore} / 10 correct
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
                          borderStyle = "1.5px solid #34D399"; // green
                          bgStyle = "#ECFDF5";
                        } else if (isSelected) {
                          borderStyle = "1.5px solid #F87171"; // red
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
                        {userAnswers[q.id] === q.correct_option 
                          ? "✓ Correct!" 
                          : `✗ Incorrect (You selected: ${userAnswers[q.id] || "No answer"}. Correct: ${q.correct_option})`}
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

        {/* Display Generated Theory Questions */}
        {generatedQuestions && questionType === "theory" && (
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
                          <div style={{ backgroundColor: "#FEF3C7", border: "1px solid #FCD34D", color: "#92400E", padding: "12px 16px", borderRadius: "var(--radius-lg)", fontSize: "13px" }}>
                            💡 <strong>Examiner Exam Tip:</strong> {gradingResult.exam_tip}
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
