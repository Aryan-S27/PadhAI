// src/components/Sidebar.jsx
import React, { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Home,
  Zap,
  Target,
  Lightbulb,
  PenTool,
  BookOpen,
  LogOut,
  Lock,
  Map,
} from "lucide-react";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: Home },
  { to: "/crashmode", label: "CrashMode", icon: Zap },
  { to: "/scope", label: "Scope", icon: Target },
  { to: "/simplify", label: "Simplify", icon: Lightbulb },
  { to: "/score", label: "Score", icon: PenTool },
  { to: "/notes", label: "Notes", icon: BookOpen },
  { to: "/roadmaps", label: "Roadmaps", icon: Map },
];

export const Sidebar = () => {
  const { user, signOut, isGuest } = useAuth();
  const navigate = useNavigate();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleLinkClick = (e, to) => {
    if (isGuest && to !== "/simplify" && !to.startsWith("/roadmaps")) {
      e.preventDefault();
      setShowUpgradeModal(true);
    }
  };

  return (
    <>
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
            {links.map(({ to, label, icon: Icon }) => {
              const isLocked = isGuest && to !== "/simplify" && !to.startsWith("/roadmaps");
              return (
                <NavLink
                  key={to}
                  to={isLocked ? "#" : to}
                  onClick={(e) => handleLinkClick(e, to)}
                  style={({ isActive }) => ({
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 10px",
                    borderRadius: "var(--radius-md)",
                    marginBottom: "2px",
                    fontFamily: "var(--font-sans)",
                    fontSize: "13px",
                    fontWeight: isActive && !isLocked ? 600 : 500,
                    letterSpacing: "-0.48px",
                    color: isActive && !isLocked ? "var(--color-ink-black)" : "rgba(0,0,0,0.55)",
                    backgroundColor: isActive && !isLocked
                      ? "var(--color-linen-warm)"
                      : "transparent",
                    textDecoration: "none",
                    transition: "background-color 0.15s ease, color 0.15s ease",
                    cursor: isLocked ? "not-allowed" : "pointer"
                  })}
                  onMouseEnter={e => {
                    if (isLocked) {
                      e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.03)";
                      return;
                    }
                    if (window.location.pathname !== to) {
                      e.currentTarget.style.backgroundColor = "var(--color-linen-warm)";
                      e.currentTarget.style.color = "var(--color-ink-black)";
                    }
                  }}
                  onMouseLeave={e => {
                    if (isLocked) {
                      e.currentTarget.style.backgroundColor = "transparent";
                      return;
                    }
                    if (window.location.pathname !== to) {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "rgba(0,0,0,0.55)";
                    }
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Icon
                      size={15}
                      style={{ flexShrink: 0, strokeWidth: 2 }}
                    />
                    <span>{label}</span>
                  </div>
                  {isLocked && (
                    <Lock size={12} color="var(--color-ink-muted)" style={{ marginLeft: "6px" }} />
                  )}
                </NavLink>
              );
            })}
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
              {isGuest ? "Guest Trial Mode" : user.email}
            </p>
            <button
              onClick={() => {
                signOut();
                navigate("/");
              }}
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
              {isGuest ? "Exit Trial" : "Logout"}
            </button>
          </div>
        )}
      </aside>

      {/* Upgrade Promo Modal */}
      {showUpgradeModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            animation: "fadeIn 0.2s ease"
          }}
        >
          <div
            className="memoir-card"
            style={{
              width: "100%",
              maxWidth: "400px",
              padding: "36px",
              textAlign: "center",
              margin: "20px"
            }}
          >
            <div
              style={{
                width: "60px",
                height: "60px",
                backgroundColor: "var(--color-accent-muted)",
                borderRadius: "var(--radius-pill)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px"
              }}
            >
              <Lock size={24} color="var(--color-accent)" />
            </div>

            <h3
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "22px",
                fontWeight: 500,
                color: "var(--color-ink-black)",
                margin: "0 0 10px 0"
              }}
            >
              Unlock All Study Modules
            </h3>
            
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "13.5px",
                lineHeight: "20px",
                color: "var(--color-ink-muted)",
                margin: "0 0 24px 0"
              }}
            >
              Access to Dashboard, CrashMode, Scope, and Score are reserved for registered users. Create a free account to unlock all features immediately.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button
                onClick={() => {
                  setShowUpgradeModal(false);
                  navigate("/signup", { state: { msg: "Create an account to unlock all student tools!" } });
                }}
                className="memoir-btn-primary"
                style={{ width: "100%", padding: "12px" }}
              >
                Sign Up for Free
              </button>
              <button
                onClick={() => {
                  setShowUpgradeModal(false);
                  navigate("/login");
                }}
                className="memoir-btn-ghost"
                style={{ width: "100%", padding: "12px" }}
              >
                Log In
              </button>
              <button
                onClick={() => setShowUpgradeModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--color-ink-muted)",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  marginTop: "8px"
                }}
              >
                Continue trial
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
