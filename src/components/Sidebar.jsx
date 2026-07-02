// src/components/Sidebar.jsx
import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Home,
  Zap,
  Target,
  Lightbulb,
  PenTool,
  LogOut,
} from "lucide-react";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: Home },
  { to: "/crashmode", label: "CrashMode", icon: Zap },
  { to: "/scope", label: "Scope", icon: Target },
  { to: "/simplify", label: "Simplify", icon: Lightbulb },
  { to: "/score", label: "Score", icon: PenTool },
];

export const Sidebar = () => {
  const { user, signOut } = useAuth();

  return (
    <aside
      style={{
        width: "220px",
        minWidth: "220px",
        height: "100vh",
        position: "sticky",
        top: 0,
        backgroundColor: "var(--color-linen-mid)",
        borderRight: "1px solid var(--color-ink-border)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "24px 16px",
        overflowY: "auto",
      }}
    >
      {/* Top: Logo + Nav */}
      <div>
        {/* Logo */}
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: "1px",
            textDecoration: "none",
            marginBottom: "32px",
            paddingLeft: "8px",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "20px",
              fontWeight: 500,
              letterSpacing: "-1px",
              color: "var(--color-ink-black)",
            }}
          >
            Padh
          </span>
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "10px",
              fontWeight: 700,
              color: "var(--color-pure-white)",
              backgroundColor: "var(--color-accent)",
              padding: "2px 6px",
              borderRadius: "var(--radius-pill)",
              marginLeft: "2px",
              lineHeight: 1.4,
            }}
          >
            AI
          </span>
        </Link>

        {/* Section label */}
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "10px",
            fontWeight: 600,
            letterSpacing: "0.6px",
            textTransform: "uppercase",
            color: "var(--color-ink-muted)",
            paddingLeft: "8px",
            marginBottom: "8px",
          }}
        >
          Menu
        </p>

        {/* Nav links */}
        <nav>
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 10px",
                borderRadius: "var(--radius-md)",
                marginBottom: "2px",
                fontFamily: "var(--font-sans)",
                fontSize: "13px",
                fontWeight: isActive ? 600 : 500,
                letterSpacing: "-0.48px",
                color: isActive ? "var(--color-ink-black)" : "rgba(0,0,0,0.55)",
                backgroundColor: isActive
                  ? "var(--color-linen-warm)"
                  : "transparent",
                textDecoration: "none",
                transition: "background-color 0.15s ease, color 0.15s ease",
              })}
              onMouseEnter={e => {
                if (!e.currentTarget.classList.contains("active")) {
                  e.currentTarget.style.backgroundColor = "var(--color-linen-warm)";
                  e.currentTarget.style.color = "var(--color-ink-black)";
                }
              }}
              onMouseLeave={e => {
                // Let NavLink manage active state via style prop — reset non-active
                const link = links.find(l => l.to === to);
                if (link && window.location.pathname !== to) {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "rgba(0,0,0,0.55)";
                }
              }}
            >
              <Icon
                size={15}
                style={{ flexShrink: 0, strokeWidth: 2 }}
              />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom: User info + logout */}
      {user && (
        <div
          style={{
            borderTop: "1px solid var(--color-ink-border)",
            paddingTop: "16px",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "11px",
              fontWeight: 500,
              letterSpacing: "-0.44px",
              color: "var(--color-ink-muted)",
              marginBottom: "10px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {user.email}
          </p>
          <button
            onClick={signOut}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontFamily: "var(--font-sans)",
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "-0.48px",
              color: "var(--color-error, #B54A3A)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px 0",
            }}
          >
            <LogOut size={13} strokeWidth={2} />
            Logout
          </button>
        </div>
      )}
    </aside>
  );
};
