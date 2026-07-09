import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signUp } = useAuth();

  // Get potential message from redirect (e.g. from ProtectedRoute trying to access locked features)
  const redirectMsg = location.state?.msg;

  // Step 1 states
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Step 2 states
  const [studyLevel, setStudyLevel] = useState("degree"); // school, junior, degree

  // Level-specific fields
  const [board, setBoard] = useState("CBSE");
  const [schoolClass, setSchoolClass] = useState("Class 10");

  const [examTarget, setExamTarget] = useState("JEE");

  const [university, setUniversity] = useState("Mumbai University (MU)");
  const [branch, setBranch] = useState("CS");
  const [year, setYear] = useState(1);
  const [semester, setSemester] = useState(1);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleNextStep = (e) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleBackStep = () => {
    setError(null);
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let extraMetadata = { studyLevel };

      if (studyLevel === "school") {
        extraMetadata.board = board;
        extraMetadata.class = schoolClass;
        // Default placeholders for standard profile schema if required
        await signUp(email, password, fullName, "School", 1, extraMetadata);
      } else if (studyLevel === "junior") {
        extraMetadata.examTarget = examTarget;
        await signUp(email, password, fullName, "Junior College", 1, extraMetadata);
      } else {
        extraMetadata.university = university;
        extraMetadata.semester = semester;
        await signUp(email, password, fullName, branch, year, extraMetadata);
      }

      // Successful signup redirects to Onboarding
      navigate("/onboarding");
    } catch (err) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const fieldStyle = {
    marginBottom: "16px",
  };

  const labelStyle = {
    display: "block",
    fontFamily: "var(--font-sans)",
    fontSize: "12px",
    fontWeight: 600,
    letterSpacing: "-0.48px",
    color: "var(--color-ink-black)",
    marginBottom: "6px",
  };

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
      <div style={{ width: "100%", maxWidth: "460px" }}>

        {/* Redirect notice if guest attempts locked page */}
        {redirectMsg && (
          <div
            style={{
              padding: "12px 16px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--color-accent-muted)",
              color: "var(--color-accent-hover)",
              fontFamily: "var(--font-sans)",
              fontSize: "13px",
              fontWeight: 600,
              letterSpacing: "-0.48px",
              marginBottom: "24px",
              textAlign: "center",
              border: "1px solid rgba(200, 133, 74, 0.2)"
            }}
          >
            {redirectMsg}
          </div>
        )}

        {/* Header */}
        <div style={{ marginBottom: "32px", textAlign: "center" }}>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "10px",
              fontWeight: 500,
              letterSpacing: "1.2px",
              textTransform: "uppercase",
              color: "var(--color-accent)",
              marginBottom: "12px",
            }}
          >
            Step {step} of 2 · {step === 1 ? "Basic Information" : "Academic Profile"}
          </p>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "36px",
              fontWeight: 500,
              lineHeight: "40px",
              letterSpacing: "-2px",
              color: "var(--color-ink-black)",
              margin: 0,
            }}
          >
            {step === 1 ? "Create your account" : "Tell us about your studies"}
          </h1>
        </div>

        {/* Card */}
        <div className="memoir-card" style={{ padding: "32px", position: "relative" }}>

          {/* Progress bar indicator */}
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
              width: step === 1 ? "50%" : "100%",
              height: "100%",
              backgroundColor: "var(--color-accent)",
              transition: "width 0.3s ease"
            }} />
          </div>

          {error && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "#FEF3EE",
                border: "1px solid rgba(181, 74, 58, 0.20)",
                color: "#B54A3A",
                fontFamily: "var(--font-sans)",
                fontSize: "13px",
                fontWeight: 500,
                letterSpacing: "-0.48px",
                marginBottom: "20px",
              }}
            >
              {error}
            </div>
          )}

          {step === 1 ? (
            /* STEP 1: Basic Info Form */
            <form onSubmit={handleNextStep}>
              <div style={fieldStyle}>
                <label htmlFor="signup-name" style={labelStyle}>Full Name</label>
                <input
                  id="signup-name"
                  type="text"
                  placeholder="Aryan Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="memoir-input"
                />
              </div>

              <div style={fieldStyle}>
                <label htmlFor="signup-email" style={labelStyle}>Email</label>
                <input
                  id="signup-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="memoir-input"
                />
              </div>

              <div style={fieldStyle}>
                <label htmlFor="signup-password" style={labelStyle}>Password</label>
                <input
                  id="signup-password"
                  type="password"
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="memoir-input"
                />
              </div>

              <button
                id="signup-next"
                type="submit"
                className="memoir-btn-primary"
                style={{ width: "100%", padding: "12px", fontSize: "14px", marginTop: "12px" }}
              >
                Continue to Academic Profile
              </button>
            </form>
          ) : (
            /* STEP 2: Academic Profile Form */
            <form onSubmit={handleSubmit}>

              {/* Selector buttons for Study Level */}
              <div style={fieldStyle}>
                <label style={labelStyle}>What are you studying?</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginTop: "4px" }}>
                  {[
                    { id: "school", label: "School" },
                    { id: "junior", label: "Junior College" },
                    { id: "degree", label: "Degree" }
                  ].map((levelOption) => (
                    <button
                      key={levelOption.id}
                      type="button"
                      onClick={() => setStudyLevel(levelOption.id)}
                      style={{
                        padding: "10px 4px",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid " + (studyLevel === levelOption.id ? "var(--color-accent)" : "var(--color-ink-border)"),
                        backgroundColor: studyLevel === levelOption.id ? "var(--color-accent-muted)" : "var(--color-pure-white)",
                        color: studyLevel === levelOption.id ? "var(--color-accent-hover)" : "var(--color-ink-black)",
                        fontFamily: "var(--font-sans)",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.15s ease"
                      }}
                    >
                      {levelOption.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* DYNAMIC FIELDS BASED ON STREAM */}

              {studyLevel === "school" && (
                <div style={{ animation: "fadeIn 0.25s ease" }}>
                  <div style={fieldStyle}>
                    <label htmlFor="school-board" style={labelStyle}>Board</label>
                    <select
                      id="school-board"
                      value={board}
                      onChange={(e) => setBoard(e.target.value)}
                      required
                      className="memoir-input"
                    >
                      <option value="CBSE">CBSE (Central Board)</option>
                      <option value="SSC">SSC (State Board)</option>
                      <option value="ICSE">ICSE Board</option>
                      <option value="Other">Other Board</option>
                    </select>
                  </div>
                  <div style={fieldStyle}>
                    <label htmlFor="school-class" style={labelStyle}>Class</label>
                    <select
                      id="school-class"
                      value={schoolClass}
                      onChange={(e) => setSchoolClass(e.target.value)}
                      required
                      className="memoir-input"
                    >
                      <option value="Class 8">Class 8</option>
                      <option value="Class 9">Class 9</option>
                      <option value="Class 10">Class 10</option>
                      <option value="Class 11">Class 11</option>
                      <option value="Class 12">Class 12</option>
                    </select>
                  </div>
                </div>
              )}

              {studyLevel === "junior" && (
                <div style={{ animation: "fadeIn 0.25s ease" }}>
                  <div style={fieldStyle}>
                    <label htmlFor="exam-target" style={labelStyle}>Target Exam</label>
                    <select
                      id="exam-target"
                      value={examTarget}
                      onChange={(e) => setExamTarget(e.target.value)}
                      required
                      className="memoir-input"
                    >
                      <option value="JEE">JEE (Engineering)</option>
                      <option value="NEET">NEET (Medical)</option>
                      <option value="MHT-CET">MHT-CET (State Engineering/Pharmacy)</option>
                    </select>
                  </div>
                </div>
              )}

              {studyLevel === "degree" && (
                <div style={{ animation: "fadeIn 0.25s ease" }}>
                  <div style={fieldStyle}>
                    <label htmlFor="degree-university" style={labelStyle}>University</label>
                    <select
                      id="degree-university"
                      value={university}
                      onChange={(e) => setUniversity(e.target.value)}
                      required
                      className="memoir-input"
                    >
                      <option value="Mumbai University (MU)">Mumbai University (MU)</option>
                      <option value="Pune University (SPPU)">Pune University (SPPU)</option>
                      <option value="Other">Other University</option>
                    </select>
                  </div>

                  <div style={fieldStyle}>
                    <label htmlFor="degree-branch" style={labelStyle}>Branch</label>
                    <select
                      id="degree-branch"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      required
                      className="memoir-input"
                    >
                      <option value="CS">Computer Engineering (CS)</option>
                      <option value="AIDS">Artificial Intelligence & Data Science (AIDS)</option>
                      <option value="IT">Information Technology (IT)</option>
                      <option value="Other">Other branch</option>
                    </select>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                    <div>
                      <label htmlFor="degree-year" style={labelStyle}>Year</label>
                      <select
                        id="degree-year"
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        required
                        className="memoir-input"
                      >
                        <option value={1}>1st Year</option>
                        <option value={2}>2nd Year</option>
                        <option value={3}>3rd Year</option>
                        <option value={4}>4th Year</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="degree-sem" style={labelStyle}>Semester</label>
                      <select
                        id="degree-sem"
                        value={semester}
                        onChange={(e) => setSemester(Number(e.target.value))}
                        required
                        className="memoir-input"
                      >
                        {Array.from({ length: 8 }, (_, i) => i + 1).map((semNum) => (
                          <option key={semNum} value={semNum}>Sem {semNum}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Navigation Actions */}
              <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
                <button
                  type="button"
                  onClick={handleBackStep}
                  className="memoir-btn-ghost"
                  style={{ flex: 1, padding: "12px" }}
                >
                  Back
                </button>
                <button
                  id="signup-submit"
                  type="submit"
                  disabled={loading}
                  className="memoir-btn-primary"
                  style={{ flex: 2, padding: "12px", opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? "Signing up..." : "Complete Signup"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer link */}
        <p
          style={{
            marginTop: "24px",
            textAlign: "center",
            fontFamily: "var(--font-sans)",
            fontSize: "13px",
            fontWeight: 500,
            letterSpacing: "-0.48px",
            color: "var(--color-ink-muted)",
          }}
        >
          Already have an account?{" "}
          <Link
            to="/login"
            style={{ color: "var(--color-accent)", fontWeight: 600, textDecoration: "none" }}
            onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
            onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}
          >
            Log in
          </Link>
        </p>
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
