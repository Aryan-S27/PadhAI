// src/components/ModuleCard.jsx
import { Link } from "react-router-dom";

export const ModuleCard = ({ tag, title, description, to }) => (
  <div
    className="memoir-card"
    style={{ padding: "28px 28px 24px" }}
  >
    {/* Pill tag chip */}
    {tag && (
      <span className="memoir-chip" style={{ marginBottom: "16px", display: "inline-flex" }}>
        {tag}
      </span>
    )}

    {/* Card heading — Source Serif 4 */}
    <h3
      style={{
        fontFamily: "var(--font-serif)",
        fontSize: "28px",
        fontWeight: 500,
        lineHeight: "30px",
        letterSpacing: "-1.96px",
        color: "var(--color-ink-black)",
        margin: "0 0 12px",
      }}
    >
      {title}
    </h3>

    {/* Description — Manrope body-sm */}
    <p
      style={{
        fontFamily: "var(--font-sans)",
        fontSize: "13px",
        fontWeight: 500,
        lineHeight: "19px",
        letterSpacing: "-0.48px",
        color: "var(--color-ink-muted)",
        margin: "0 0 20px",
      }}
    >
      {description}
    </p>

    {/* Launch link */}
    <Link
      to={to}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        fontFamily: "var(--font-sans)",
        fontSize: "13px",
        fontWeight: 600,
        letterSpacing: "-0.52px",
        color: "var(--color-accent)",
        textDecoration: "none",
      }}
      onMouseEnter={e => e.currentTarget.style.color = "var(--color-accent-hover)"}
      onMouseLeave={e => e.currentTarget.style.color = "var(--color-accent)"}
    >
      Launch
      <span style={{ fontSize: "14px" }}>→</span>
    </Link>
  </div>
);
