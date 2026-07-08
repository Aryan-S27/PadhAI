import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { BookOpen, Calendar, AlertTriangle, CheckCircle, ArrowRight } from "lucide-react";

export const Onboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [subject, setSubject] = useState("");
  const [customSubject, setCustomSubject] = useState("");
  const [examDate, setExamDate] = useState("");
  const [struggle, setStruggle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isDegree = user?.user_metadata?.studyLevel === "degree";
  const isJunior = user?.user_metadata?.studyLevel === "junior";
  const isSchool = user?.user_metadata?.studyLevel === "school";

  // Dynamic subject dropdown choices
  const getSubjectSuggestions = () => {
    if (isDegree) {
      const branch = user?.user_metadata?.branch || "CS";
      if (branch === "CS") return ["Operating Systems", "Computer Networks", "Analysis of Algorithms", "Database Systems", "Theoretical Computer Science"];
      if (branch === "AIDS") return ["Machine Learning", "Data Warehousing", "Operating Systems", "Artificial Intelligence", "Probability & Statistics"];
      return ["Software Engineering", "Web Technologies", "Information Security", "Internet of Things", "Computer Networks"];
    }
    if (isJunior) {
      return ["Physics", "Chemistry", "Mathematics", "Biology", "English"];
    }
    return ["Science", "Mathematics", "Social Studies", "English", "Sanskrit", "Hindi"];
  };

  const handleNextStep1 = (e) => {
    e.preventDefault();
    const selectedSubject = subject === "Other" ? customSubject : subject;
    if (!selectedSubject) {
      setError("Please choose or enter a subject.");
      return;
    }
    if (!examDate) {
      setError("Please select an exam date.");
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleNextStep2 = (e) => {
    e.preventDefault();
    if (!struggle) {
      setError("Please select one option describing your struggle.");
      return;
    }
    setError(null);
    setStep(3);
  };

  const handleComplete = async () => {
    setLoading(true);
    setError(null);
    
    const finalSubject = subject === "Other" ? customSubject : subject;

    try {
      const onboardingData = {
        completedOnboarding: true,
        nextExam: {
          subject: finalSubject,
          date: examDate
        },
        struggle: struggle
      };

      // 1. Update Auth metadata
      const { error: authErr } = await supabase.auth.updateUser({
        data: onboardingData
      });
      if (authErr) throw authErr;

      // 2. Also attempt updating the profiles DB row
      if (user && user.id !== "guest") {
        try {
          await supabase
            .from("profiles")
            .update({
              college: finalSubject + " | " + examDate
            })
            .eq("id", user.id);
        } catch (dbErr) {
          console.warn("Could not save onboarding detail to profiles db:", dbErr);
        }
      }

      // Route to Student Dashboard
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Failed to save settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to get personalized advice
  const getPersonalizedAdvice = () => {
    switch (struggle) {
      case "study-what":
        return {
          title: "Prioritize with CrashMode",
          desc: "We recommend jumping straight into CrashMode. It ranks exam subjects and subtopics by weightage so you don't spend time on topics that won't appear."
        };
      case "no-time":
        return {
          title: "Build your map in Scope",
          desc: "You need a strict study schedule. Go to Scope to plan exactly which units to prepare on which day leading up to your exam."
        };
      case "answers":
        return {
          title: "Train with Score module",
          desc: "You understand topics but drop marks. Head to Score to submit a practice answer and see exactly what keywords get marks."
        };
      case "concepts":
      default:
        return {
          title: "Distill with Simplify",
          desc: "Don't choke on text books. Input complex concepts into Simplify to get easy Indian analogies that stick instantly."
        };
    }
  };

  const advice = getPersonalizedAdvice();

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--color-linen-warm)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        paddingTop: "calc(56px + 48px)",
      }}
    >
      <div style={{ width: "100%", maxWidth: "520px" }}>
        
        {/* Step Indicator */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
          <div>
            <span style={{
              fontFamily: "var(--font-sans)",
              fontSize: "10px",
              fontWeight: 600,
              color: "var(--color-accent)",
              letterSpacing: "1.2px",
              textTransform: "uppercase"
            }}>
              Onboarding Questionnaire
            </span>
            <h2 style={{
              fontFamily: "var(--font-serif)",
              fontSize: "24px",
              fontWeight: 500,
              color: "var(--color-ink-black)",
              margin: "4px 0 0 0",
              letterSpacing: "-0.8px"
            }}>
              {step === 1 && "Plan Your Countdown"}
              {step === 2 && "Identify Your Bottleneck"}
              {step === 3 && "Personalized Plan Ready"}
            </h2>
          </div>
          <div style={{
            fontFamily: "var(--font-sans)",
            fontSize: "13px",
            fontWeight: 600,
            color: "var(--color-ink-muted)",
            backgroundColor: "var(--color-linen-mid)",
            padding: "4px 12px",
            borderRadius: "var(--radius-pill)"
          }}>
            Step {step} of 3
          </div>
        </div>

        {/* Card Panel */}
        <div className="memoir-card" style={{ padding: "36px", position: "relative" }}>
          
          {/* Progress bar */}
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            backgroundColor: "var(--color-linen-mid)",
            borderTopLeftRadius: "var(--radius-2xl)",
            borderTopRightRadius: "var(--radius-2xl)",
            overflow: "hidden"
          }}>
            <div style={{
              width: `${(step / 3) * 100}%`,
              height: "100%",
              backgroundColor: "var(--color-accent)",
              transition: "width 0.3s ease"
            }} />
          </div>

          {error && (
            <div style={{
              padding: "10px 14px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "#FEF3EE",
              border: "1px solid rgba(181, 74, 58, 0.20)",
              color: "#B54A3A",
              fontFamily: "var(--font-sans)",
              fontSize: "13px",
              fontWeight: 500,
              marginBottom: "20px",
            }}>
              {error}
            </div>
          )}

          {step === 1 && (
            /* STEP 1: Next Exam Picker */
            <form onSubmit={handleNextStep1} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <p style={{
                fontFamily: "var(--font-sans)",
                fontSize: "14px",
                lineHeight: "20px",
                color: "var(--color-ink-muted)",
                margin: 0
              }}>
                To feed your dashboard countdown and target focus modules, tell us when your next high-priority exam is.
              </p>

              <div>
                <label style={{ display: "block", fontFamily: "var(--font-sans)", fontSize: "12px", fontWeight: 600, color: "var(--color-ink-black)", marginBottom: "8px" }}>
                  Which Subject?
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <select
                    value={subject}
                    onChange={(e) => {
                      setSubject(e.target.value);
                      setError(null);
                    }}
                    className="memoir-input"
                    required
                  >
                    <option value="">-- Select Subject --</option>
                    {getSubjectSuggestions().map((subOpt) => (
                      <option key={subOpt} value={subOpt}>{subOpt}</option>
                    ))}
                    <option value="Other">Other (Type below)</option>
                  </select>

                  {subject === "Other" && (
                    <input
                      type="text"
                      placeholder="Enter subject name (e.g. Operating Systems)"
                      value={customSubject}
                      onChange={(e) => setCustomSubject(e.target.value)}
                      className="memoir-input"
                      required
                      style={{ animation: "fadeIn 0.2s ease" }}
                    />
                  )}
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontFamily: "var(--font-sans)", fontSize: "12px", fontWeight: 600, color: "var(--color-ink-black)", marginBottom: "8px" }}>
                  When is the exam?
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="memoir-input"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="memoir-btn-primary"
                style={{ width: "100%", padding: "12px", fontSize: "14px", marginTop: "10px" }}
              >
                Next: Study Struggles <ArrowRight size={14} style={{ marginLeft: "6px" }} />
              </button>
            </form>
          )}

          {step === 2 && (
            /* STEP 2: Struggling options */
            <form onSubmit={handleNextStep2} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <p style={{
                fontFamily: "var(--font-sans)",
                fontSize: "14px",
                lineHeight: "20px",
                color: "var(--color-ink-muted)",
                margin: 0
              }}>
                Everyone learns differently. Tell us what is holding you back from full marks so we can personalize PadhAI for you.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {[
                  { id: "study-what", label: "I don't know what to study", desc: "Hard to distinguish high-weightage topics from low priority ones." },
                  { id: "no-time", label: "I run out of study time", desc: "Struggling to cover full syllabi before the countdown expires." },
                  { id: "answers", label: "I don't write answers correctly", desc: "Understanding the syllabus well but failing to score full marks in paper." },
                  { id: "concepts", label: "I don't understand concepts", desc: "Textbooks are too dense and dry; I need simple, clear explanations." }
                ].map((option) => (
                  <label
                    key={option.id}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "12px",
                      padding: "14px",
                      borderRadius: "var(--radius-lg)",
                      border: "1.5px solid " + (struggle === option.id ? "var(--color-accent)" : "var(--color-ink-border)"),
                      backgroundColor: struggle === option.id ? "var(--color-accent-muted)" : "var(--color-pure-white)",
                      cursor: "pointer",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <input
                      type="radio"
                      name="struggle"
                      value={option.id}
                      checked={struggle === option.id}
                      onChange={() => {
                        setStruggle(option.id);
                        setError(null);
                      }}
                      style={{ marginTop: "4px", accentColor: "var(--color-accent)" }}
                    />
                    <div>
                      <span style={{
                        display: "block",
                        fontFamily: "var(--font-sans)",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "var(--color-ink-black)"
                      }}>
                        {option.label}
                      </span>
                      <span style={{
                        display: "block",
                        fontFamily: "var(--font-sans)",
                        fontSize: "11px",
                        color: "var(--color-ink-muted)",
                        marginTop: "2px"
                      }}>
                        {option.desc}
                      </span>
                    </div>
                  </label>
                ))}
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="memoir-btn-ghost"
                  style={{ flex: 1, padding: "12px" }}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="memoir-btn-primary"
                  style={{ flex: 2, padding: "12px" }}
                >
                  Next: Recommendations <ArrowRight size={14} style={{ marginLeft: "6px" }} />
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            /* STEP 3: Personalized Recommendation */
            <div style={{ display: "flex", flexDirection: "column", gap: "24px", textAlign: "center" }}>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <CheckCircle size={56} color="var(--color-accent)" />
              </div>

              <div>
                <h3 style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "24px",
                  fontWeight: 500,
                  color: "var(--color-ink-black)",
                  margin: "0 0 8px 0"
                }}>
                  You are all set!
                </h3>
                <p style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "14px",
                  lineHeight: "22px",
                  color: "var(--color-ink-muted)",
                  margin: 0
                }}>
                  We've initialized your study workspace. Based on your inputs, here is your customized focus recommendation:
                </p>
              </div>

              {/* Recommendation Box */}
              <div style={{
                backgroundColor: "var(--color-linen-warm)",
                borderRadius: "var(--radius-xl)",
                padding: "20px",
                border: "1px dashed var(--color-accent)",
                textAlign: "left"
              }}>
                <span style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "10px",
                  fontWeight: 600,
                  color: "var(--color-accent)",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  display: "block",
                  marginBottom: "6px"
                }}>
                  Personalized Study Focus
                </span>
                <h4 style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "15px",
                  fontWeight: 700,
                  color: "var(--color-ink-black)",
                  margin: "0 0 6px 0"
                }}>
                  {advice.title}
                </h4>
                <p style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "12.5px",
                  lineHeight: "18px",
                  color: "var(--color-ink-muted)",
                  margin: 0
                }}>
                  {advice.desc}
                </p>
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="memoir-btn-ghost"
                  style={{ flex: 1, padding: "12px" }}
                >
                  Back
                </button>
                <button
                  onClick={handleComplete}
                  disabled={loading}
                  className="memoir-btn-primary"
                  style={{ flex: 2, padding: "12px", opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? "Configuring..." : "Go to Dashboard"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
