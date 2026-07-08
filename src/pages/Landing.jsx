// src/pages/Landing.jsx
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const Landing = () => {
  const { startGuestSession } = useAuth();
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--color-linen-warm)",
        paddingTop: "56px", /* navbar height */
      }}
    >
      {/* ── Hero Section ─────────────────────────────────────── */}
      <section
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "80px 48px 64px",
          textAlign: "center",
        }}
      >
        {/* Eyebrow micro-label */}
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "10px",
            fontWeight: 500,
            letterSpacing: "1.2px",
            textTransform: "uppercase",
            color: "var(--color-accent)",
            marginBottom: "20px",
          }}
        >
          Exam Intelligence for MU Students
        </p>

        {/* Hero headline — Source Serif 4 */}
        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(40px, 6vw, 64px)",
            fontWeight: 500,
            lineHeight: 1.1,
            letterSpacing: "-3px",
            color: "var(--color-ink-black)",
            marginBottom: "24px",
            maxWidth: "780px",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Every tool teaches.
          <br />
          <span style={{ fontStyle: "italic" }}>PadhAI</span> guides.
        </h1>

        {/* Sub-copy */}
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "15px",
            fontWeight: 400,
            lineHeight: "22px",
            letterSpacing: "-0.48px",
            color: "var(--color-ink-muted)",
            maxWidth: "480px",
            margin: "0 auto 36px",
          }}
        >
          The only AI platform that knows exactly what MU examiners reward — and
          trains you to write answers that get full marks.
        </p>

        {/* CTA buttons */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "center",
            flexWrap: "wrap",
            alignItems: "center"
          }}
        >
          <Link to="/signup" className="memoir-btn-primary" style={{ padding: "12px 28px", fontSize: "15px" }}>
            Start for Free
          </Link>
          <Link to="/dashboard" className="memoir-btn-ghost" style={{ padding: "12px 28px", fontSize: "15px" }}>
            See how it works
          </Link>
        </div>

        {/* Trial entry link */}
        <div style={{ marginTop: "20px" }}>
          <button
            onClick={() => {
              startGuestSession();
              navigate("/simplify");
            }}
            style={{
              background: "none",
              border: "none",
              color: "var(--color-ink-muted)",
              fontFamily: "var(--font-sans)",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              textDecoration: "underline",
              padding: "4px 8px"
            }}
            onMouseEnter={e => e.currentTarget.style.color = "var(--color-accent)"}
            onMouseLeave={e => e.currentTarget.style.color = "var(--color-ink-muted)"}
          >
            Try without signing up (Explore Simplify module)
          </button>
        </div>

        {/* Subtle divider */}
        <div
          style={{
            width: "40px",
            height: "1px",
            backgroundColor: "var(--color-ink-border)",
            margin: "64px auto 0",
          }}
        />
      </section>

      {/* ── Feature cards ────────────────────────────────────── */}
      <section
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "0 48px 80px",
        }}
      >
        {/* Section heading */}
        <h2
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(28px, 4vw, 48px)",
            fontWeight: 500,
            lineHeight: "52.8px",
            letterSpacing: "-2px",
            color: "var(--color-ink-black)",
            marginBottom: "36px",
          }}
        >
          Four tools. One mission.
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "16px",
          }}
        >
          <FeatureCard
            emoji="⚡"
            tag="CrashMode"
            title="Race to the exam"
            description="Tell us your exam date and hours available. Get a precise hour-by-hour study plan based on 5 years of MU past papers."
            to="/crashmode"
          />
          <FeatureCard
            emoji="🎯"
            tag="Scope"
            title="Know what matters"
            description="Stop guessing. Know exactly which topics are high priority, what's safe to skip, and what's guaranteed to come."
            to="/scope"
          />
          <FeatureCard
            emoji="✨"
            tag="Simplify"
            title="Dense notes, distilled"
            description="Turn walls of text into concise, exam-ready summaries that stick — in seconds."
            to="/simplify"
          />
          <FeatureCard
            emoji="📝"
            tag="Score"
            title="Write like a topper"
            description="Submit a practice answer. Get examiner-style feedback with marks, missing points, and exact keywords MU rewards."
            to="/score"
          />
        </div>
      </section>

      {/* ── Comparison table ──────────────────────────────────── */}
      <section
        style={{
          maxWidth: "760px",
          margin: "0 auto",
          padding: "0 48px 80px",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(24px, 3vw, 40px)",
            fontWeight: 500,
            letterSpacing: "-1.5px",
            color: "var(--color-ink-black)",
            marginBottom: "32px",
          }}
        >
          Why not just use ChatGPT?
        </h2>

        <div
          style={{
            backgroundColor: "var(--color-pure-white)",
            borderRadius: "var(--radius-2xl)",
            boxShadow: "var(--shadow-card)",
            overflow: "hidden",
          }}
        >
          {/* Table header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 140px 140px",
              padding: "12px 24px",
              backgroundColor: "var(--color-linen-mid)",
              borderBottom: "1px solid var(--color-ink-border)",
            }}
          >
            <span style={{ fontFamily: "var(--font-sans)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase", color: "var(--color-ink-muted)" }}>Feature</span>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase", color: "var(--color-ink-muted)", textAlign: "center" }}>ChatGPT</span>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: "12px", fontWeight: 700, letterSpacing: "-0.48px", color: "var(--color-accent)", textAlign: "center" }}>PadhAI</span>
          </div>

          {[
            ["Knows MU paper pattern", "❌", "✅"],
            ["Topic frequency from past papers", "❌", "✅"],
            ["Personalized study schedule", "❌", "✅"],
            ["Examiner-style answer feedback", "❌", "✅"],
            ["MU-specific marking scheme", "❌", "✅"],
          ].map(([row, chat, padh], i) => (
            <div
              key={row}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 140px 140px",
                padding: "14px 24px",
                backgroundColor: i % 2 === 0 ? "var(--color-pure-white)" : "var(--color-linen-warm)",
                borderBottom: i < 4 ? "1px solid var(--color-ink-border)" : "none",
              }}
            >
              <span style={{ fontFamily: "var(--font-sans)", fontSize: "13px", fontWeight: 500, letterSpacing: "-0.48px", color: "var(--color-ink-black)" }}>{row}</span>
              <span style={{ textAlign: "center", fontSize: "14px" }}>{chat}</span>
              <span style={{ textAlign: "center", fontSize: "14px" }}>{padh}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer
        style={{
          borderTop: "1px solid var(--color-ink-border)",
          padding: "24px 48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "11px",
            fontWeight: 500,
            letterSpacing: "-0.4px",
            color: "var(--color-ink-muted)",
          }}
        >
          © 2026 PadhAI · Built for MU Students · Idea2Impact
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Link
            to="/institution/signup"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "11px",
              fontWeight: 600,
              color: "var(--color-accent)",
              textDecoration: "none"
            }}
            onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
            onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}
          >
            For Institutions
          </Link>
          <span style={{ color: "var(--color-ink-border)" }}>|</span>
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "11px",
              fontWeight: 500,
              letterSpacing: "-0.4px",
              color: "var(--color-ink-muted)",
            }}
          >
            Light · Memoir
          </span>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ emoji, tag, title, description, to }) => (
  <div
    className="memoir-card"
    style={{ padding: "24px" }}
  >
    {/* Emoji icon */}
    <span style={{ fontSize: "24px", display: "block", marginBottom: "14px" }}>{emoji}</span>

    {/* Pill tag */}
    <span className="memoir-chip" style={{ marginBottom: "12px" }}>{tag}</span>

    {/* Title */}
    <h3
      style={{
        fontFamily: "var(--font-serif)",
        fontSize: "22px",
        fontWeight: 500,
        lineHeight: "24px",
        letterSpacing: "-1px",
        color: "var(--color-ink-black)",
        margin: "12px 0 10px",
      }}
    >
      {title}
    </h3>

    {/* Description */}
    <p
      style={{
        fontFamily: "var(--font-sans)",
        fontSize: "13px",
        fontWeight: 400,
        lineHeight: "19px",
        letterSpacing: "-0.48px",
        color: "var(--color-ink-muted)",
        margin: 0,
      }}
    >
      {description}
    </p>
  </div>
);
