import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(false);

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      const user = await signIn(email, password);
      
      // Smart Redirect Routing based on user profile/metadata
      const role = user?.user_metadata?.role;
      const nextExam = user?.user_metadata?.nextExam;

      if (role === "admin") {
        navigate("/institution/dashboard");
      } else if (nextExam) {
        navigate("/dashboard");
      } else {
        navigate("/onboarding");
      }
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    alert("Demo Mode: Password reset link has been sent to your email (mocked).");
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
        <div style={{ marginBottom: "36px", textAlign: "center" }}>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "40px",
              fontWeight: 500,
              lineHeight: "44px",
              letterSpacing: "-2px",
              color: "var(--color-ink-black)",
              margin: 0,
              display: "inline-flex",
              alignItems: "baseline",
              gap: "2px"
            }}
          >
            Padh
            <span style={{
              fontFamily: "var(--font-sans)",
              fontSize: "16px",
              fontWeight: 700,
              backgroundColor: "var(--color-accent)",
              color: "var(--color-pure-white)",
              padding: "2px 8px",
              borderRadius: "var(--radius-pill)",
              lineHeight: 1
            }}>
              AI
            </span>
          </h1>
          <p style={{
            fontFamily: "var(--font-sans)",
            fontSize: "13px",
            color: "var(--color-ink-muted)",
            marginTop: "8px"
          }}>
            Welcome back! Let's resume your preparation.
          </p>
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
            <div style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "6px" }}>
                <label
                  htmlFor="login-password"
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "12px",
                    fontWeight: 600,
                    letterSpacing: "-0.48px",
                    color: "var(--color-ink-black)",
                  }}
                >
                  Password
                </label>
                <a
                  href="#forgot"
                  onClick={handleForgotPassword}
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "var(--color-ink-muted)",
                    textDecoration: "none"
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = "var(--color-accent)"}
                  onMouseLeave={e => e.currentTarget.style.color = "var(--color-ink-muted)"}
                >
                  Forgot password?
                </a>
              </div>
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
              disabled={loading}
              className="memoir-btn-primary"
              style={{ width: "100%", padding: "12px", fontSize: "14px", opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Signing In..." : "Login →"}
            </button>
          </form>
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
