import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { ShieldCheck, Loader, Building, User, Mail, Phone, Lock, CheckCircle } from "lucide-react";

export const InstitutionSignup = () => {
  const navigate = useNavigate();
  const { signUp, user } = useAuth();

  const [institutionName, setInstitutionName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [designation, setDesignation] = useState("Dean / Director");
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [registered, setRegistered] = useState(false);
  const [approving, setApproving] = useState(false);

  // If already registered and waiting for verification, or direct check
  const isPending = registered || (user && user.user_metadata?.role === "admin" && !user.user_metadata?.verified);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!institutionName || !adminName || !email || !password || !phone) {
      setError("Please fill in all details.");
      setLoading(false);
      return;
    }

    try {
      const extraMetadata = {
        role: "admin",
        verified: false,
        designation,
        institutionName,
        phone
      };

      // Sign up using standard method
      await signUp(email, password, adminName, "Admin", 1, extraMetadata);
      setRegistered(true);
    } catch (err) {
      setError(err.message || "Failed to create administrator account.");
    } finally {
      setLoading(false);
    }
  };

  // Demo tool: Instant approval bypass
  const handleDemoApprove = async () => {
    setApproving(true);
    setError(null);
    try {
      // Update auth user metadata directly in Supabase
      const { error: updateErr } = await supabase.auth.updateUser({
        data: { verified: true }
      });
      if (updateErr) throw updateErr;

      // Update database profile
      if (user) {
        await supabase
          .from("profiles")
          .update({
            college: `${institutionName} (Verified Institution Admin)`
          })
          .eq("id", user.id);
      }

      // Navigate straight to admin dashboard
      navigate("/institution/dashboard");
    } catch (err) {
      setError(err.message || "Approval failed.");
    } finally {
      setApproving(false);
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
      <div style={{ width: "100%", maxWidth: "500px" }}>
        
        {/* Header */}
        <div style={{ marginBottom: "32px", textAlign: "center" }}>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "36px",
              fontWeight: 500,
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
              fontSize: "14px",
              fontWeight: 700,
              backgroundColor: "var(--color-accent)",
              color: "var(--color-pure-white)",
              padding: "2px 7px",
              borderRadius: "var(--radius-pill)"
            }}>
              Portal
            </span>
          </h1>
          <p style={{
            fontFamily: "var(--font-sans)",
            fontSize: "13px",
            color: "var(--color-ink-muted)",
            marginTop: "6px"
          }}>
            Institutional Admin Dashboard Signup
          </p>
        </div>

        {/* Card */}
        <div className="memoir-card" style={{ padding: "36px" }}>
          
          {error && (
            <div style={{
              padding: "10px 14px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "#FEF3EE",
              border: "1px solid rgba(181, 74, 58, 0.20)",
              color: "#B54A3A",
              fontFamily: "var(--font-sans)",
              fontSize: "13px",
              marginBottom: "20px",
            }}>
              {error}
            </div>
          )}

          {isPending ? (
            /* MANUAL VERIFICATION SCREEN */
            <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <div style={{
                  width: "72px",
                  height: "72px",
                  backgroundColor: "var(--color-accent-muted)",
                  borderRadius: "var(--radius-pill)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <ShieldCheck size={36} color="var(--color-accent)" />
                </div>
              </div>

              <div>
                <h3 style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "24px",
                  fontWeight: 500,
                  color: "var(--color-ink-black)",
                  margin: "0 0 10px 0"
                }}>
                  Verification Pending
                </h3>
                <p style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "13.5px",
                  lineHeight: "22px",
                  color: "var(--color-ink-muted)",
                  margin: 0
                }}>
                  Your request has been filed for manually verifying <strong>{institutionName || user?.user_metadata?.institutionName}</strong>. Our team verifies physical academic credentials prior to granting admin dashboard authorizations.
                </p>
              </div>

              {/* Demo Override Module */}
              <div style={{
                backgroundColor: "var(--color-linen-warm)",
                borderRadius: "var(--radius-xl)",
                padding: "20px",
                border: "1.5px dashed var(--color-accent)",
                marginTop: "12px",
                textAlign: "left"
              }}>
                <span style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "9px",
                  fontWeight: 700,
                  backgroundColor: "var(--color-accent)",
                  color: "var(--color-pure-white)",
                  padding: "2px 6px",
                  borderRadius: "var(--radius-pill)",
                  textTransform: "uppercase",
                  display: "inline-block",
                  marginBottom: "8px"
                }}>
                  Demo Mode Bypass
                </span>
                <p style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "12px",
                  lineHeight: "18px",
                  color: "var(--color-ink-muted)",
                  margin: "0 0 16px 0"
                }}>
                  To let judges review the Institution Administration panel, bypass manual audits below.
                </p>
                <button
                  onClick={handleDemoApprove}
                  disabled={approving}
                  className="memoir-btn-primary"
                  style={{
                    width: "100%",
                    padding: "10px",
                    fontSize: "13px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px"
                  }}
                >
                  {approving ? (
                    <>
                      <Loader size={14} className="animate-spin" /> Authorizing...
                    </>
                  ) : (
                    "Authorize Instantly (Demo)"
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* SIGNUP FORM */
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              
              <div>
                <label style={{ display: "block", fontFamily: "var(--font-sans)", fontSize: "11px", fontWeight: 600, color: "var(--color-ink-black)", marginBottom: "4px" }}>
                  Institution / Coaching Name
                </label>
                <div style={{ position: "relative" }}>
                  <Building size={14} style={{ position: "absolute", left: "12px", top: "13px", color: "var(--color-ink-muted)" }} />
                  <input
                    type="text"
                    placeholder="e.g. M.H. Saboo Siddik College"
                    value={institutionName}
                    onChange={(e) => setInstitutionName(e.target.value)}
                    required
                    className="memoir-input"
                    style={{ paddingLeft: "36px" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontFamily: "var(--font-sans)", fontSize: "11px", fontWeight: 600, color: "var(--color-ink-black)", marginBottom: "4px" }}>
                    Your Name
                  </label>
                  <div style={{ position: "relative" }}>
                    <User size={14} style={{ position: "absolute", left: "12px", top: "13px", color: "var(--color-ink-muted)" }} />
                    <input
                      type="text"
                      placeholder="Dr. Aryan"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      required
                      className="memoir-input"
                      style={{ paddingLeft: "36px" }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontFamily: "var(--font-sans)", fontSize: "11px", fontWeight: 600, color: "var(--color-ink-black)", marginBottom: "4px" }}>
                    Designation
                  </label>
                  <select
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    required
                    className="memoir-input"
                  >
                    <option value="Dean / Director">Dean / Director</option>
                    <option value="HOD (Dept Head)">HOD (Dept Head)</option>
                    <option value="Coaching Owner">Coaching Owner</option>
                    <option value="IT Admin">IT Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontFamily: "var(--font-sans)", fontSize: "11px", fontWeight: 600, color: "var(--color-ink-black)", marginBottom: "4px" }}>
                  Work Email
                </label>
                <div style={{ position: "relative" }}>
                  <Mail size={14} style={{ position: "absolute", left: "12px", top: "13px", color: "var(--color-ink-muted)" }} />
                  <input
                    type="email"
                    placeholder="dean@college.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="memoir-input"
                    style={{ paddingLeft: "36px" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontFamily: "var(--font-sans)", fontSize: "11px", fontWeight: 600, color: "var(--color-ink-black)", marginBottom: "4px" }}>
                    Password
                  </label>
                  <div style={{ position: "relative" }}>
                    <Lock size={14} style={{ position: "absolute", left: "12px", top: "13px", color: "var(--color-ink-muted)" }} />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="memoir-input"
                      style={{ paddingLeft: "36px" }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontFamily: "var(--font-sans)", fontSize: "11px", fontWeight: 600, color: "var(--color-ink-black)", marginBottom: "4px" }}>
                    Contact Phone
                  </label>
                  <div style={{ position: "relative" }}>
                    <Phone size={14} style={{ position: "absolute", left: "12px", top: "13px", color: "var(--color-ink-muted)" }} />
                    <input
                      type="tel"
                      placeholder="+91 98..."
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="memoir-input"
                      style={{ paddingLeft: "36px" }}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="memoir-btn-primary"
                style={{ width: "100%", padding: "12px", fontSize: "14px", marginTop: "12px", opacity: loading ? 0.7 : 1 }}
              >
                {loading ? "Registering Request..." : "Request Admin Setup"}
              </button>
            </form>
          )}
        </div>

        {/* Footer info link */}
        <p
          style={{
            marginTop: "24px",
            textAlign: "center",
            fontFamily: "var(--font-sans)",
            fontSize: "13px",
            fontWeight: 500,
            color: "var(--color-ink-muted)",
          }}
        >
          Want to access the student terminal?{" "}
          <Link
            to="/login"
            style={{ color: "var(--color-accent)", fontWeight: 600, textDecoration: "none" }}
            onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
            onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}
          >
            Go to Student Login
          </Link>
        </p>
      </div>

      <style>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
