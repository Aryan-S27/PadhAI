// src/components/Navbar.jsx
import { Link } from "react-router-dom";

export const Navbar = () => {
  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: "var(--color-linen-warm)",
        borderBottom: "1px solid var(--color-ink-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
        height: "56px",
      }}
    >
      {/* Logo */}
      <Link
        to="/"
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: "1px",
          textDecoration: "none",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "22px",
            fontWeight: 500,
            letterSpacing: "-1.2px",
            color: "var(--color-ink-black)",
          }}
        >
          Padh
        </span>
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "-0.5px",
            color: "var(--color-pure-white)",
            backgroundColor: "var(--color-accent)",
            padding: "2px 7px",
            borderRadius: "var(--radius-pill)",
            marginLeft: "3px",
            lineHeight: 1.4,
          }}
        >
          AI
        </span>
      </Link>

      {/* Navigation links */}
      <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
        <Link
          to="/dashboard"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "14px",
            fontWeight: 600,
            letterSpacing: "-0.56px",
            color: "var(--color-ink-black)",
          }}
          onMouseEnter={e => e.currentTarget.style.color = "var(--color-accent)"}
          onMouseLeave={e => e.currentTarget.style.color = "var(--color-ink-black)"}
        >
          Dashboard
        </Link>

        <Link
          to="/login"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "14px",
            fontWeight: 600,
            letterSpacing: "-0.56px",
            color: "var(--color-ink-black)",
          }}
          onMouseEnter={e => e.currentTarget.style.color = "var(--color-accent)"}
          onMouseLeave={e => e.currentTarget.style.color = "var(--color-ink-black)"}
        >
          Login
        </Link>

        <Link
          to="/signup"
          className="memoir-btn-primary"
        >
          Get Started
        </Link>
      </div>
    </nav>
  );
};
