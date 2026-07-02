import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await signIn(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed");
    }
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
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
        }}
      >
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
            Welcome back
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
            Sign in to PadhAI
          </h1>
        </div>

        {/* Card */}
        <div
          className="memoir-card"
          style={{ padding: "32px" }}
        >
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
            {/* Email */}
            <div style={{ marginBottom: "14px" }}>
              <label
                htmlFor="login-email"
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
                Email
              </label>
              <input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="memoir-input"
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: "24px" }}>
              <label
                htmlFor="login-password"
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
                Password
              </label>
              <input
                id="login-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="memoir-input"
              />
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              className="memoir-btn-primary"
              style={{ width: "100%", padding: "12px", fontSize: "14px" }}
            >
              Sign In
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
          Don't have an account?{" "}
          <Link
            to="/signup"
            style={{
              color: "var(--color-accent)",
              fontWeight: 600,
              textDecoration: "none",
            }}
            onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
            onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};
