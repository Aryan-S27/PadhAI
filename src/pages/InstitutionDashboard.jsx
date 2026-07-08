import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import {
  Users,
  Activity,
  FileText,
  TrendingUp,
  Plus,
  LogOut,
  Trash2,
  Mail,
  UserPlus,
  CheckCircle,
  Building,
  Briefcase
} from "lucide-react";

export const InstitutionDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const institutionName = user?.user_metadata?.institutionName || "Saboo Siddik Engineering College";
  const adminName = user?.user_metadata?.name || "Dr. Aryan";
  const designation = user?.user_metadata?.designation || "Dean / Admin";

  // Mock student database state
  const [students, setStudents] = useState([
    { id: 1, name: "Aryan Sharma", email: "aryan.s@eng.edu", branch: "CS", year: 3, queries: 45, status: "Active" },
    { id: 2, name: "Shruti Patel", email: "shruti.p@eng.edu", branch: "AIDS", year: 2, queries: 124, status: "Active" },
    { id: 3, name: "Rahul Deshmukh", email: "rahul.d@eng.edu", branch: "CS", year: 4, queries: 82, status: "Active" },
    { id: 4, name: "Aditi Iyer", email: "aditi.i@eng.edu", branch: "IT", year: 3, queries: 12, status: "Inactive" },
    { id: 5, name: "Pranav Sawant", email: "pranav.s@eng.edu", branch: "CS", year: 1, queries: 67, status: "Active" }
  ]);

  // Mock activity logs
  const [activityLogs] = useState([
    { id: 1, user: "Shruti Patel", action: "Simplified Notes: Banker's Algorithm", time: "10 mins ago" },
    { id: 2, user: "Aryan Sharma", action: "Created Study Plan in CrashMode", time: "25 mins ago" },
    { id: 3, user: "Rahul Deshmukh", action: "Submitted Operating Systems Practice Answer", time: "1 hour ago" },
    { id: 4, user: "Pranav Sawant", action: "Requested topic scoping in Scope", time: "3 hours ago" }
  ]);

  // Form states to invite new student
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentEmail, setNewStudentEmail] = useState("");
  const [newStudentBranch, setNewStudentBranch] = useState("CS");
  const [newStudentYear, setNewStudentYear] = useState(1);
  const [inviteSuccess, setInviteSuccess] = useState(false);

  const handleInviteSubmit = (e) => {
    e.preventDefault();
    if (!newStudentName || !newStudentEmail) return;

    // Create a mockup student entry
    const newStudent = {
      id: students.length + 1,
      name: newStudentName,
      email: newStudentEmail,
      branch: newStudentBranch,
      year: Number(newStudentYear),
      queries: 0,
      status: "Invited"
    };

    setStudents([newStudent, ...students]);
    setInviteSuccess(true);
    
    // Reset form after a brief delay
    setTimeout(() => {
      setShowInviteModal(false);
      setNewStudentName("");
      setNewStudentEmail("");
      setNewStudentBranch("CS");
      setNewStudentYear(1);
      setInviteSuccess(false);
    }, 1500);
  };

  const handleDeleteStudent = (id) => {
    if (confirm("Are you sure you want to revoke this student's access?")) {
      setStudents(students.filter(student => student.id !== id));
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "var(--color-linen-warm)" }}>
      {/* ── Admin Specialized Sidebar ─────────────────────────────────── */}
      <aside
        style={{
          width: "240px",
          minWidth: "240px",
          backgroundColor: "var(--color-linen-mid)",
          borderRight: "1px solid var(--color-ink-border)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "28px 20px",
          position: "sticky",
          top: 0,
          height: "100vh"
        }}
      >
        <div>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "baseline", gap: "2px", marginBottom: "36px", paddingLeft: "4px" }}>
            <span style={{ fontFamily: "var(--font-serif)", fontSize: "22px", fontWeight: 500, color: "var(--color-ink-black)" }}>
              Padh
            </span>
            <span style={{
              fontFamily: "var(--font-sans)",
              fontSize: "10px",
              fontWeight: 700,
              color: "var(--color-pure-white)",
              backgroundColor: "var(--color-accent)",
              padding: "2px 7px",
              borderRadius: "var(--radius-pill)"
            }}>
              Portal
            </span>
          </div>

          {/* Admin Context Profile */}
          <div style={{
            backgroundColor: "rgba(255,255,255,0.4)",
            borderRadius: "var(--radius-xl)",
            padding: "16px",
            marginBottom: "32px",
            border: "1px solid var(--color-ink-border)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <Building size={16} color="var(--color-accent)" />
              <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-ink-black)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Institution admin
              </span>
            </div>
            <h4 style={{ fontFamily: "var(--font-sans)", fontSize: "14px", fontWeight: 700, color: "var(--color-ink-black)", margin: 0 }}>
              {adminName}
            </h4>
            <p style={{ fontSize: "11.5px", color: "var(--color-ink-muted)", margin: "2px 0 0 0" }}>
              {designation}
            </p>
            <p style={{ fontSize: "11px", color: "var(--color-accent-hover)", fontWeight: 600, margin: "6px 0 0 0" }}>
              {institutionName}
            </p>
          </div>

          <p style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", color: "var(--color-ink-muted)", paddingLeft: "4px", marginBottom: "8px" }}>
            Overview Panel
          </p>
          <nav style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 12px",
              borderRadius: "var(--radius-md)",
              fontFamily: "var(--font-sans)",
              fontSize: "13px",
              fontWeight: 600,
              backgroundColor: "var(--color-linen-warm)",
              color: "var(--color-ink-black)"
            }}>
              <Users size={16} />
              Student Database
            </div>
          </nav>
        </div>

        <button
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontFamily: "var(--font-sans)",
            fontSize: "13px",
            fontWeight: 600,
            color: "var(--color-error, #B54A3A)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "8px 4px",
            textAlign: "left"
          }}
        >
          <LogOut size={15} />
          Sign Out Portal
        </button>
      </aside>

      {/* ── Main Panel ────────────────────────────────────────────────── */}
      <main style={{ flex: 1, padding: "40px 48px", overflowY: "auto", minWidth: 0 }}>
        {/* Page title header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "40px" }}>
          <div>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "10px", fontWeight: 500, letterSpacing: "1.2px", textTransform: "uppercase", color: "var(--color-accent)" }}>
              Executive console
            </p>
            <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "40px", fontWeight: 500, letterSpacing: "-1.5px", margin: 0, color: "var(--color-ink-black)" }}>
              Admin Workspace
            </h1>
            <p style={{ fontSize: "14px", color: "var(--color-ink-muted)", marginTop: "6px" }}>
              Provision student licenses, inspect system logs, and view usage diagnostics.
            </p>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="memoir-btn-primary"
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "12px 20px" }}
          >
            <Plus size={16} /> Invite Student
          </button>
        </div>

        {/* ── Metrics Row ────────────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "40px" }}>
          <MetricCard title="Registered Student Profiles" value={students.length} icon={Users} trend="+2 new today" />
          <MetricCard title="AI Queries Executed" value={students.reduce((acc, curr) => acc + curr.queries, 0)} icon={Activity} trend="Average 56/student" />
          <MetricCard title="Topper Audits Performed" value="142" icon={FileText} trend="Score improvements" />
          <MetricCard title="Score Improvement Average" value="+14.8%" icon={TrendingUp} trend="Vetted by term tests" />
        </div>

        {/* ── Two Column Content ──────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px", alignItems: "flex-start" }}>
          
          {/* Left Column: Student Database */}
          <div className="memoir-card" style={{ padding: "28px" }}>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "20px", fontWeight: 500, margin: "0 0 20px 0" }}>
              Student Directory
            </h3>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--color-linen-warm)" }}>
                    <th style={{ padding: "10px 8px", fontSize: "11px", fontWeight: 700, color: "var(--color-ink-muted)", textTransform: "uppercase" }}>Name</th>
                    <th style={{ padding: "10px 8px", fontSize: "11px", fontWeight: 700, color: "var(--color-ink-muted)", textTransform: "uppercase" }}>Branch</th>
                    <th style={{ padding: "10px 8px", fontSize: "11px", fontWeight: 700, color: "var(--color-ink-muted)", textTransform: "uppercase" }}>Year</th>
                    <th style={{ padding: "10px 8px", fontSize: "11px", fontWeight: 700, color: "var(--color-ink-muted)", textTransform: "uppercase" }}>Queries Used</th>
                    <th style={{ padding: "10px 8px", fontSize: "11px", fontWeight: 700, color: "var(--color-ink-muted)", textTransform: "uppercase" }}>Status</th>
                    <th style={{ padding: "10px 8px", fontSize: "11px", fontWeight: 700, color: "var(--color-ink-muted)", textTransform: "uppercase" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id} style={{ borderBottom: "1px solid var(--color-ink-border)" }}>
                      <td style={{ padding: "12px 8px" }}>
                        <span style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--color-ink-black)" }}>{student.name}</span>
                        <span style={{ fontSize: "11px", color: "var(--color-ink-muted)" }}>{student.email}</span>
                      </td>
                      <td style={{ padding: "12px 8px", fontSize: "13px" }}>{student.branch}</td>
                      <td style={{ padding: "12px 8px", fontSize: "13px" }}>Yr {student.year}</td>
                      <td style={{ padding: "12px 8px", fontSize: "13px", fontWeight: 600 }}>{student.queries}</td>
                      <td style={{ padding: "12px 8px" }}>
                        <span style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          backgroundColor: student.status === "Active" ? "#EAF6EE" : student.status === "Invited" ? "#FFF9E6" : "#F4F2F0",
                          color: student.status === "Active" ? "#2B8A3E" : student.status === "Invited" ? "#D99B00" : "var(--color-ink-muted)",
                          padding: "2px 8px",
                          borderRadius: "var(--radius-pill)",
                          textTransform: "uppercase"
                        }}>
                          {student.status}
                        </span>
                      </td>
                      <td style={{ padding: "12px 8px" }}>
                        <button
                          onClick={() => handleDeleteStudent(student.id)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "var(--color-error, #B54A3A)",
                            padding: "4px"
                          }}
                          title="Revoke access"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column: Audit Activity logs */}
          <div className="memoir-card" style={{ padding: "28px" }}>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "20px", fontWeight: 500, margin: "0 0 20px 0" }}>
              Live System Activity
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {activityLogs.map((log) => (
                <div key={log.id} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <div style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: "var(--color-accent)",
                    marginTop: "6px",
                    flexShrink: 0
                  }} />
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-ink-black)", margin: 0 }}>
                      {log.user}
                    </p>
                    <p style={{ fontSize: "12px", color: "var(--color-ink-muted)", margin: "2px 0 0 0" }}>
                      {log.action}
                    </p>
                    <span style={{ fontSize: "10px", color: "var(--color-ink-muted)", display: "block", marginTop: "2px" }}>
                      {log.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* ── Invite Student Modal ────────────────────────────────────── */}
      {showInviteModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
          }}
        >
          <div className="memoir-card" style={{ width: "100%", maxWidth: "440px", padding: "32px", margin: "20px" }}>
            
            {inviteSuccess ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <CheckCircle size={48} color="var(--color-accent)" style={{ margin: "0 auto 16px" }} />
                <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "22px", fontWeight: 500 }}>
                  Invitation Dispatched!
                </h3>
                <p style={{ fontSize: "13px", color: "var(--color-ink-muted)", marginTop: "6px" }}>
                  License key and signup instructions have been sent.
                </p>
              </div>
            ) : (
              <form onSubmit={handleInviteSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "22px", fontWeight: 500, margin: "0 0 4px 0" }}>
                    Provision Student Profile
                  </h3>
                  <p style={{ fontSize: "12.5px", color: "var(--color-ink-muted)", margin: 0 }}>
                    Allocate an enterprise license to student email.
                  </p>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--color-ink-black)", marginBottom: "4px" }}>
                    Student Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Shruti Patel"
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    required
                    className="memoir-input"
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--color-ink-black)", marginBottom: "4px" }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="student@eng.edu"
                    value={newStudentEmail}
                    onChange={(e) => setNewStudentEmail(e.target.value)}
                    required
                    className="memoir-input"
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--color-ink-black)", marginBottom: "4px" }}>
                      Branch / Dept
                    </label>
                    <select
                      value={newStudentBranch}
                      onChange={(e) => setNewStudentBranch(e.target.value)}
                      className="memoir-input"
                    >
                      <option value="CS">Computer Eng (CS)</option>
                      <option value="AIDS">Artificial Intel (AIDS)</option>
                      <option value="IT">Info Tech (IT)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--color-ink-black)", marginBottom: "4px" }}>
                      Academic Year
                    </label>
                    <select
                      value={newStudentYear}
                      onChange={(e) => setNewStudentYear(Number(e.target.value))}
                      className="memoir-input"
                    >
                      <option value={1}>1st Year</option>
                      <option value={2}>2nd Year</option>
                      <option value={3}>3rd Year</option>
                      <option value={4}>4th Year</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="memoir-btn-ghost"
                    style={{ flex: 1, padding: "10px" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="memoir-btn-primary"
                    style={{ flex: 1, padding: "10px" }}
                  >
                    Invite
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const MetricCard = ({ title, value, icon: Icon, trend }) => (
  <div className="memoir-card" style={{ padding: "20px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
      <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--color-ink-muted)", textTransform: "uppercase" }}>
        {title}
      </span>
      <div style={{ color: "var(--color-accent)" }}>
        <Icon size={16} />
      </div>
    </div>
    <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
      <span style={{ fontFamily: "var(--font-serif)", fontSize: "28px", fontWeight: 500, color: "var(--color-ink-black)" }}>
        {value}
      </span>
      <span style={{ fontSize: "10px", color: "var(--color-accent-hover)", fontWeight: 700 }}>
        {trend}
      </span>
    </div>
  </div>
);
