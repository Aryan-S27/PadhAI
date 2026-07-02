// src/pages/Simplify.jsx
import { MainLayout } from "../components/MainLayout";

export const Simplify = () => (
  <MainLayout>
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
        Tool · Simplify
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
        Simplify
      </h1>
      <p
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "14px",
          fontWeight: 400,
          letterSpacing: "-0.48px",
          color: "var(--color-ink-muted)",
          marginTop: "10px",
          maxWidth: "520px",
        }}
      >
        Turn dense notes into concise, exam-ready summaries — in seconds.
      </p>
    </div>

    <div
      className="memoir-card"
      style={{
        padding: "48px 36px",
        textAlign: "center",
        maxWidth: "480px",
      }}
    >
      <span style={{ fontSize: "36px", display: "block", marginBottom: "16px" }}>✨</span>
      <h2
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "24px",
          fontWeight: 500,
          letterSpacing: "-1.2px",
          marginBottom: "12px",
          color: "var(--color-ink-black)",
        }}
      >
        Coming soon
      </h2>
      <p
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "13px",
          fontWeight: 400,
          color: "var(--color-ink-muted)",
          letterSpacing: "-0.48px",
          marginBottom: "24px",
        }}
      >
        AI-powered note distillation tailored to MU exam format.
      </p>
      <button className="memoir-btn-ghost">Simplify Notes (Coming Soon)</button>
    </div>
  </MainLayout>
);
