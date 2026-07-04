import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const Signup = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [branch, setBranch] = useState("CS");
  const [year, setYear] = useState(2);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await signUp(email, password, fullName, branch, year);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Signup failed");
    }
  };

  const fieldStyle = {
    marginBottom: "14px",
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
      <div style={{ width: "100%", maxWidth: "440px" }}>
        {/* Header */}
        <div style={{ marginBottom: "36px" }}>
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
            Join PadhAI
          </p>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "40px",
              fontWeight: 500,
              lineHeight: "44px",
              letterSpacing: "-2.4px",
              color: "var(--color-ink-black)",
              margin: 0,
            }}
          >
            Create your account
          </h1>
        </div>

        {/* Card */}
        <div className="memoir-card" style={{ padding: "32px" }}>
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

          <form onSubmit={handleSubmit}>
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
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="memoir-input"
              />
            </div>

            {/* Branch + Year row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px" }}>
              <div>
                <label htmlFor="signup-branch" style={labelStyle}>Branch</label>
                <select
                  id="signup-branch"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  required
                  className="memoir-input"
                >
                  <option value="CS">Computer Engineering (CS)</option>
                  <option value="AIDS">Artificial Intelligence & Data Science (AIDS)</option>
                  <option value="IT">Information Technology (IT)</option>
                </select>
              </div>
              <div>
                <label htmlFor="signup-year" style={labelStyle}>Year</label>
                <select
                  id="signup-year"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  required
                  className="memoir-input"
                >
                  <option value={1}>1st Year (Sem 1-2)</option>
                  <option value={2}>2nd Year (Sem 3-4)</option>
                  <option value={3}>3rd Year (Sem 5-6)</option>
                  <option value={4}>4th Year (Sem 7-8)</option>
                </select>
              </div>
            </div>

            <button
              id="signup-submit"
              type="submit"
              className="memoir-btn-primary"
              style={{ width: "100%", padding: "12px", fontSize: "14px" }}
            >
              Create Account
            </button>
          </form>
        </div>

        {/* Footer link */}
        <p
          style={{
            marginTop: "20px",
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
    </div>
  );
};
