import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const Signup = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [branch, setBranch] = useState("");
  const [year, setYear] = useState("");
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
                <input
                  id="signup-branch"
                  type="text"
                  placeholder="e.g. CS, IT"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  required
                  className="memoir-input"
                />
              </div>
              <div>
                <label htmlFor="signup-year" style={labelStyle}>Year</label>
                <input
                  id="signup-year"
                  type="number"
                  placeholder="e.g. 3"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  required
                  className="memoir-input"
                />
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
