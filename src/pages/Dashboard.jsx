// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { MainLayout } from "../components/MainLayout";
import {
  Calendar,
  AlertCircle,
  ArrowRight,
  Zap,
  Target,
  Lightbulb,
  PenTool,
  Edit2,
  Check,
  Camera,
  Activity,
  FileText,
  Building
} from "lucide-react";

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Basic user variables
  const fullName = user?.user_metadata?.name || "Aryan Sharma";
  const userEmail = user?.email || "aryan.sharma@saboo.edu";
  const studyLevel = user?.user_metadata?.studyLevel || "degree";
  const branch = user?.user_metadata?.branch || "AIDS";
  const year = user?.user_metadata?.year || 2;
  const semester = user?.user_metadata?.semester || 4;
  const nextExam = user?.user_metadata?.nextExam;
  const struggle = user?.user_metadata?.struggle;

  // ── 1. Profile Picture Photo State & Upload Handler ─────────────────────
  const [profilePhoto, setProfilePhoto] = useState(() => {
    return localStorage.getItem("padhai_profile_photo") || null;
  });

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        localStorage.setItem("padhai_profile_photo", base64String);
        setProfilePhoto(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  // ── 2. Editable Bio State ────────────────────────────────────────────────
  const [bio, setBio] = useState(() => {
    return localStorage.getItem("padhai_user_bio") || 
      "Passionate engineering student at Mumbai University. Targeting a 9.5+ CGPA. Always grinding OS and Database designs.";
  });
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [tempBio, setTempBio] = useState(bio);

  const handleSaveBio = () => {
    setBio(tempBio);
    localStorage.setItem("padhai_user_bio", tempBio);
    setIsEditingBio(false);
  };

  // ── 3. Seeding Active Schedules (OS + DBMS) ──────────────────────────────────
  const [activeSchedules, setActiveSchedules] = useState([]);
  const [selectedSubjectTab, setSelectedSubjectTab] = useState("");

  useEffect(() => {
    const activeList = JSON.parse(localStorage.getItem("padhai_active_schedules") || "[]");
    
    if (activeList.length === 0) {
      // Seed DBMS plan
      const dbmsPlan = {
        subjectCode: "CS403",
        subjectName: "Database Management Systems",
        examDate: "2026-07-28",
        summary: "Focus on transaction serialization and relational algebra which comprise 60% of past paper marks.",
        strategy: "FOCUSED",
        days_left: 23,
        total_hours: 16,
        revision_days: ["2026-07-26", "2026-07-27"],
        topics_to_skip: ["Extended Entity Relationship features"],
        predicted_questions: ["Draw ER diagram for Hospital Management", "Explain Conflict Serializability with schedules"],
        plan: [
          { day: 1, date: "2026-07-06", hours: 4, topics: ["ER Diagrams", "Relational Mapping"], session_split: "2 hrs study, 2 hrs mapping", goals: "Learn 3 past ER diagram question solutions", tip: "Ensure prime keys are clearly marked." },
          { day: 2, date: "2026-07-07", hours: 4, topics: ["Relational Algebra", "Tuple Calculus"], session_split: "3 hrs query writing, 1 hr test", goals: "Understand joins, projects, selections", tip: "Focus on division operator query models." },
          { day: 3, date: "2026-07-08", hours: 4, topics: ["Normalization (1NF to BCNF)", "Decomposition"], session_split: "2 hrs normalization rules, 2 hrs problem solving", goals: "Practice dependency preservation check", tip: "BCNF is highly likely to come for 10 marks." },
          { day: 4, date: "2026-07-09", hours: 4, topics: ["ACID Properties", "Concurrency Control"], session_split: "2 hrs lock protocols, 2 hrs validation", goals: "Draw serializable concurrency schedules", tip: "Two-Phase Locking (2PL) is guaranteed." }
        ]
      };

      // Seed Operating Systems plan
      const osPlan = {
        subjectCode: "CS402",
        subjectName: "Operating Systems",
        examDate: "2026-07-20",
        summary: "Concentrate heavily on process scheduling calculations, paging address translations, and Banker's deadlock safety checks.",
        strategy: "AGGRESSIVE",
        days_left: 15,
        total_hours: 20,
        revision_days: ["2026-07-18", "2026-07-19"],
        topics_to_skip: ["Real-time scheduling kernels"],
        predicted_questions: ["Compare Paging and Segmentation", "Banker's Safety Algorithm problem for 10m"],
        plan: [
          { day: 1, date: "2026-07-06", hours: 4, topics: ["Process States", "System Calls"], session_split: "2 hrs transitions, 2 hrs coding concepts", goals: "Master fork() execution chains", tip: "Practice drawing process hierarchies." },
          { day: 2, date: "2026-07-07", hours: 4, topics: ["CPU Scheduling (FCFS, SJF, RR)"], session_split: "3 hrs Gantt charts, 1 hr math comparisons", goals: "Compare turn-around and waiting time metrics", tip: "Round Robin time-slice calculations are common." },
          { day: 3, date: "2026-07-08", hours: 4, topics: ["Deadlock Detection & Banker's Algorithm"], session_split: "2 hrs safety matrix steps, 2 hrs practice", goals: "Run safety algorithm with multiple resources", tip: "Double check the 'Need' matrix subtraction." },
          { day: 4, date: "2026-07-09", hours: 4, topics: ["Memory Paging & Address Translation"], session_split: "3 hrs address offset calculations, 1 hr TLB", goals: "Convert logical to physical addresses", tip: "TLB hit ratio problems appear frequently." },
          { day: 5, date: "2026-07-10", hours: 4, topics: ["Page Replacement (FIFO, LRU, Optimal)"], session_split: "2 hrs page fault comparisons, 2 hrs exercises", goals: "Compute page fault ratios for LRU", tip: "Optimal replacement requires looking ahead in reference strings." }
        ]
      };

      // Save to localStorage
      localStorage.setItem("padhai_schedule_CS403", JSON.stringify(dbmsPlan));
      localStorage.setItem("padhai_schedule_CS402", JSON.stringify(osPlan));
      
      const seedList = ["CS403", "CS402"];
      localStorage.setItem("padhai_active_schedules", JSON.stringify(seedList));

      // Seed default completed days
      localStorage.setItem("padhai_completed_days_CS403", JSON.stringify([1]));
      localStorage.setItem("padhai_completed_days_CS402", JSON.stringify([1, 2]));

      setActiveSchedules(seedList);
      setSelectedSubjectTab("CS402"); // default active tab
    } else {
      setActiveSchedules(activeList);
      setSelectedSubjectTab(activeList[0]);
    }
  }, []);

  // ── 4. Read Selected Schedule details ──────────────────────────────────
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [completedDays, setCompletedDays] = useState([]);

  useEffect(() => {
    if (!selectedSubjectTab) return;
    const scheduleStr = localStorage.getItem(`padhai_schedule_${selectedSubjectTab}`);
    if (scheduleStr) {
      setSelectedSchedule(JSON.parse(scheduleStr));
    }
    const completedStr = localStorage.getItem(`padhai_completed_days_${selectedSubjectTab}`);
    setCompletedDays(completedStr ? JSON.parse(completedStr) : []);
  }, [selectedSubjectTab]);

  const handleToggleDay = (dayNum) => {
    if (!selectedSubjectTab) return;
    let nextCompleted = [...completedDays];
    if (nextCompleted.includes(dayNum)) {
      nextCompleted = nextCompleted.filter(d => d !== dayNum);
    } else {
      nextCompleted.push(dayNum);
    }
    setCompletedDays(nextCompleted);
    localStorage.setItem(`padhai_completed_days_${selectedSubjectTab}`, JSON.stringify(nextCompleted));
  };

  const getCompletionPercentage = () => {
    if (!selectedSchedule || !selectedSchedule.plan?.length) return 0;
    const total = selectedSchedule.plan.length;
    const completed = completedDays.length;
    return Math.round((completed / total) * 100);
  };

  // ── 5. Exam Countdown logic ─────────────────────────────────────────────
  let daysLeft = null;
  let countdownLabel = "";
  if (nextExam?.date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const examDate = new Date(nextExam.date);
    examDate.setHours(0, 0, 0, 0);
    const diff = examDate - today;
    daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
    countdownLabel = daysLeft < 0 ? "Exam Finished" : daysLeft === 0 ? "Exam Today!" : `${daysLeft} days remaining`;
  }

  // ── 6. Static mock metrics & checklists ──────────────────────────────────
  const readinessScores = [
    { subject: "Operating Systems", score: 62, rating: "Moderate", color: "#C8854A" },
    { subject: "DBMS", score: 45, rating: "Weak", color: "#B54A3A" },
    { subject: "Automata Theory", score: 78, rating: "Strong", color: "#2B8A3E" }
  ];

  const pastGrades = [
    { id: 1, test: "OS Process Synchronization Midterm", score: "8/10", pct: 80, date: "2 hours ago" },
    { id: 2, test: "DBMS Normalization Mock Test", score: "6/12", pct: 50, date: "Yesterday" },
    { id: 3, test: "Automata Context Free Grammar Quiz", score: "17/20", pct: 85, date: "3 days ago" }
  ];

  return (
    <MainLayout>
      
      {/* ── HEADER PANEL: Profile and Welcoming Info ────────────────────────── */}
      <header
        className="memoir-card"
        style={{
          padding: "36px 48px",
          marginBottom: "24px",
          backgroundColor: "var(--color-pure-white)",
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          justifyContent: "space-between",
          gap: "36px",
          borderLeft: "6px solid var(--color-accent)",
          minHeight: "180px"
        }}
      >
        {/* Left Section: Avatar + Info */}
        <div style={{ display: "flex", alignItems: "center", gap: "28px", flexWrap: "wrap" }}>
          
          {/* Avatar Container with Base64 Uploader */}
          <div style={{ position: "relative" }}>
            <label htmlFor="avatar-upload" style={{ cursor: "pointer", display: "block" }}>
              <div style={{ position: "relative", width: "96px", height: "96px", borderRadius: "50%", overflow: "hidden" }} className="avatar-hover-trigger">
                {profilePhoto ? (
                  <img
                    src={profilePhoto}
                    alt="Profile"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      border: "2.5px solid var(--color-linen-mid)"
                    }}
                  />
                ) : (
                  <div style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    backgroundColor: "var(--color-accent-muted)",
                    color: "var(--color-accent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "var(--font-serif)",
                    fontSize: "36px",
                    fontWeight: 700,
                    boxShadow: "inset 0 0 0 2px rgba(200, 133, 74, 0.2)"
                  }}>
                    {fullName.split(" ").map(n => n[0]).join("")}
                  </div>
                )}
                {/* Overlay indicating change capability */}
                <div style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "rgba(0, 0, 0, 0.45)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: "10px",
                  fontWeight: 600,
                  opacity: 0,
                  transition: "opacity 0.2s ease",
                  gap: "2px"
                }}
                className="avatar-hover-overlay"
                >
                  <Camera size={14} />
                  <span>Update Photo</span>
                </div>
              </div>
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              style={{ display: "none" }}
            />
          </div>

          <div>
            <span style={{ fontSize: "11px", color: "var(--color-accent)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px" }}>
              Welcome back
            </span>
            <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "32px", fontWeight: 500, margin: "2px 0", color: "var(--color-ink-black)", letterSpacing: "-1.5px", lineHeight: "1.2" }}>
              {fullName}
            </h1>
            <p style={{ fontSize: "13px", color: "var(--color-ink-muted)", margin: 0, fontWeight: 500 }}>
              {studyLevel === "degree" ? `${branch} · Semester ${semester} · MU Engineering` : `${studyLevel.toUpperCase()} student · ${userEmail}`}
            </p>
          </div>
        </div>

        {/* Right Section: Large Editable Bio Box */}
        <div style={{ maxWidth: "380px", flex: "1 1 320px", display: "flex", flexDirection: "column", gap: "8px" }}>
          <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--color-ink-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Personal Bio
          </span>
          {isEditingBio ? (
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                value={tempBio}
                onChange={(e) => setTempBio(e.target.value)}
                className="memoir-input"
                style={{ padding: "6px 10px", fontSize: "12px" }}
              />
              <button onClick={handleSaveBio} className="memoir-btn-primary" style={{ padding: "6px 12px", fontSize: "11px" }}>
                <Check size={12} />
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
              <p style={{ margin: 0, fontSize: "12px", color: "var(--color-ink-black)", fontStyle: "italic", lineHeight: "1.5" }}>
                "{bio}"
              </p>
              <button
                onClick={() => {
                  setTempBio(bio);
                  setIsEditingBio(true);
                }}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-accent)", padding: 0 }}
                title="Edit bio"
              >
                <Edit2 size={11} />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ── SUB-HEADER: Exam Countdown Widget ───────────────────────────────── */}
      <section style={{ marginBottom: "24px" }}>
        {nextExam ? (
          <div
            className="memoir-card"
            style={{
              padding: "16px 28px",
              background: "linear-gradient(135deg, #FFFDFB 0%, var(--color-linen-warm) 100%)",
              border: "1px solid rgba(200, 133, 74, 0.2)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Calendar size={18} color="var(--color-accent)" />
              <div>
                <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--color-accent)", textTransform: "uppercase" }}>
                  Upcoming Target Exam
                </span>
                <h4 style={{ fontFamily: "var(--font-sans)", fontSize: "14px", fontWeight: 700, margin: 0, color: "var(--color-ink-black)" }}>
                  {nextExam.subject}
                </h4>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <span style={{
                fontSize: "13px",
                fontWeight: 700,
                color: daysLeft <= 3 ? "#B54A3A" : "var(--color-ink-black)",
                backgroundColor: daysLeft <= 3 ? "#FEF3EE" : "var(--color-linen-mid)",
                padding: "4px 10px",
                borderRadius: "var(--radius-pill)"
              }}>
                ⏳ {countdownLabel}
              </span>
              <button
                onClick={() => navigate("/onboarding")}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--color-accent)",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  textDecoration: "underline"
                }}
              >
                Change Exam →
              </button>
            </div>
          </div>
        ) : (
          <div
            className="memoir-card"
            style={{
              padding: "16px 28px",
              background: "var(--color-pure-white)",
              border: "1.5px dashed var(--color-accent)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px"
            }}
          >
            <div>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--color-ink-black)" }}>
                No target exam set yet.
              </span>
              <p style={{ margin: 0, fontSize: "12px", color: "var(--color-ink-muted)" }}>
                Establish an exam schedule to enable study plans.
              </p>
            </div>
            <button
              onClick={() => navigate("/onboarding")}
              className="memoir-btn-primary"
              style={{ padding: "8px 16px", fontSize: "12px" }}
            >
              + Add upcoming exam
            </button>
          </div>
        )}
      </section>

      {/* ── MAIN COCKPIT: Split Dashboard Layout ────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px", alignItems: "flex-start", marginBottom: "24px" }}>
        
        {/* LEFT COLUMN: Readiness & Student Performance metrics */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Widget 3: Exam Readiness Scores */}
          <div className="memoir-card" style={{ padding: "24px" }}>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "18px", fontWeight: 500, margin: "0 0 16px 0", borderBottom: "1px solid var(--color-ink-border)", paddingBottom: "6px" }}>
              Exam Readiness Score
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {readinessScores.map((scoreObj) => (
                <div key={scoreObj.subject} style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  {/* Circular progress SVG */}
                  <svg width="40" height="40" viewBox="0 0 36 36" style={{ transform: "rotate(-90deg)" }}>
                    <circle cx="18" cy="18" r="16" fill="none" stroke="var(--color-linen-warm)" strokeWidth="3" />
                    <circle
                      cx="18"
                      cy="18"
                      r="16"
                      fill="none"
                      stroke={scoreObj.color}
                      strokeWidth="3"
                      strokeDasharray={`${scoreObj.score}, 100`}
                    />
                  </svg>
                  <div>
                    <span style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "var(--color-ink-black)" }}>
                      {scoreObj.subject}
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--color-ink-muted)" }}>
                      {scoreObj.score}% · <strong style={{ color: scoreObj.color }}>{scoreObj.rating}</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <p style={{ margin: "14px 0 0 0", fontSize: "11.5px", color: "var(--color-ink-muted)", fontStyle: "italic", lineHeight: "1.4" }}>
              💡 Based on examiner grade logs. Submit practice answers in Score to update.
            </p>
          </div>

          {/* Student Profile past tests statistics */}
          <div className="memoir-card" style={{ padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "18px", fontWeight: 500, margin: 0 }}>
                Practice Audits
              </h3>
              <span style={{ fontSize: "11px", fontWeight: 700, backgroundColor: "#EAF6EE", color: "#2B8A3E", padding: "2px 8px", borderRadius: "var(--radius-pill)" }}>
                86% Accuracy
              </span>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {pastGrades.map((grade) => (
                <div key={grade.id} style={{ borderBottom: "1px solid var(--color-ink-border)", paddingBottom: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: 600 }}>
                    <span style={{ color: "var(--color-ink-black)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "160px" }}>{grade.test}</span>
                    <span style={{ color: "var(--color-accent)" }}>{grade.score}</span>
                  </div>
                  <span style={{ display: "block", fontSize: "10px", color: "var(--color-ink-muted)", marginTop: "2px" }}>{grade.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AI recommendations & Module navigation */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Widget 5: Today's Focus Recommendation (AI suggestions) */}
          <div
            className="memoir-card"
            style={{
              padding: "24px",
              backgroundColor: "var(--color-pure-white)",
              border: "1px solid rgba(200, 133, 74, 0.25)"
            }}
          >
            <span style={{
              fontFamily: "var(--font-sans)",
              fontSize: "10px",
              fontWeight: 700,
              color: "var(--color-accent)",
              textTransform: "uppercase",
              letterSpacing: "1.2px",
              display: "block",
              marginBottom: "8px"
            }}>
              💡 Today's Focus
            </span>
            <p style={{
              fontFamily: "var(--font-sans)",
              fontSize: "13.5px",
              lineHeight: "20px",
              color: "var(--color-ink-black)",
              margin: "0 0 16px 0",
              fontWeight: 500
            }}>
              Based on your {nextExam ? `${nextExam.subject} exam in ${daysLeft} days` : "active study curriculum"} and your weak scores in Normalization and Scheduling — we recommend dedicating 2 hours to <strong>Third Normal Form (3NF)</strong> and <strong>CPU gantt calculations</strong> today.
            </p>
            <Link
              to={recommendedToolPath(struggle)}
              className="memoir-btn-primary"
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12.5px", padding: "8px 16px" }}
            >
              Start studying <ArrowRight size={12} />
            </Link>
          </div>

          {/* Widget 4: Quick Launch (4 module cards) */}
          <div>
            <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "var(--color-ink-muted)", marginBottom: "10px" }}>
              Quick Launch Modules
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <QuickCard emoji="⚡" name="CrashMode" tag="Generate study plan" to="/crashmode" color="#FEF3EE" />
              <QuickCard emoji="🎯" name="Scope" tag="See what to study" to="/scope" color="#F0F9FF" />
              <QuickCard emoji="💡" name="Simplify" tag="Ask a doubt" to="/simplify" color="#FFFBEB" />
              <QuickCard emoji="📝" name="Score" tag="Practice an answer" to="/score" color="#EAF6EE" />
            </div>
          </div>
        </div>
      </div>

      {/* ── SCHEDULES PERFORMANCE TRACKER (Dynamic LocalStorage integration) ──── */}
      <section className="memoir-card" style={{ padding: "28px", marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid var(--color-ink-border)", paddingBottom: "12px" }}>
          <div>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "20px", fontWeight: 500, margin: 0 }}>
              Syllabus Study Schedules
            </h3>
            <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "var(--color-ink-muted)" }}>
              Active day-by-day preparation plans. Mark days as read to audit progress.
            </p>
          </div>

          {/* Subject Tab Selector */}
          <div style={{ display: "flex", gap: "6px" }}>
            {activeSchedules.map((subjCode) => (
              <button
                key={subjCode}
                onClick={() => setSelectedSubjectTab(subjCode)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "var(--radius-pill)",
                  border: "1px solid " + (selectedSubjectTab === subjCode ? "var(--color-accent)" : "var(--color-ink-border)"),
                  backgroundColor: selectedSubjectTab === subjCode ? "var(--color-accent-muted)" : "var(--color-pure-white)",
                  color: selectedSubjectTab === subjCode ? "var(--color-accent-hover)" : "var(--color-ink-black)",
                  fontFamily: "var(--font-sans)",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                {subjCode === "CS402" ? "OS Plan" : subjCode === "CS403" ? "DBMS Plan" : subjCode}
              </button>
            ))}
          </div>
        </div>

        {selectedSchedule ? (
          <div>
            {/* Summary details */}
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", marginBottom: "20px" }}>
              <div style={{ flex: 1, minWidth: "260px" }}>
                <h4 style={{ fontFamily: "var(--font-sans)", fontSize: "15px", fontWeight: 700, margin: 0, color: "var(--color-ink-black)" }}>
                  {selectedSchedule.subjectName}
                </h4>
                <p style={{ fontSize: "12.5px", color: "var(--color-ink-muted)", marginTop: "4px", lineHeight: "1.4" }}>
                  {selectedSchedule.summary}
                </p>
              </div>

              {/* Progress Dial indicator */}
              <div style={{ textAlign: "right", minWidth: "120px" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--color-accent)" }}>
                  Schedule Progress
                </span>
                <div style={{ fontSize: "28px", fontWeight: 700, fontFamily: "var(--font-serif)", color: "var(--color-ink-black)" }}>
                  {getCompletionPercentage()}%
                </div>
                <span style={{ fontSize: "11px", color: "var(--color-ink-muted)" }}>
                  {completedDays.length} of {selectedSchedule.plan?.length} Days Cleared
                </span>
              </div>
            </div>

            {/* Day list */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "12px" }}>
              {selectedSchedule.plan?.map((day) => {
                const isCleared = completedDays.includes(day.day);
                return (
                  <div
                    key={day.day}
                    style={{
                      padding: "14px",
                      borderRadius: "var(--radius-lg)",
                      border: "1.5px solid " + (isCleared ? "#C5E1A5" : "var(--color-ink-border)"),
                      backgroundColor: isCleared ? "#F1F8E9" : "var(--color-pure-white)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      gap: "8px",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-ink-black)" }}>
                          🌅 Day {day.day}
                        </span>
                        <input
                          type="checkbox"
                          checked={isCleared}
                          onChange={() => handleToggleDay(day.day)}
                          style={{ accentColor: "#558B2F", cursor: "pointer" }}
                        />
                      </div>
                      <span style={{ fontSize: "10px", color: "var(--color-ink-muted)", display: "block" }}>{day.date}</span>
                      <p style={{ margin: "8px 0 0 0", fontSize: "11.5px", fontWeight: 600, color: isCleared ? "#33691E" : "var(--color-ink-black)", lineHeight: "1.3" }}>
                        {day.topics?.join(", ")}
                      </p>
                    </div>

                    <div style={{ borderTop: "1px solid var(--color-ink-border)", paddingTop: "6px", fontSize: "10.5px", color: "var(--color-ink-muted)" }}>
                      ⏳ {day.hours} hrs Study Target
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={{ color: "var(--color-ink-muted)", textAlign: "center", padding: "16px 0", fontSize: "13px" }}>
            No schedule selected. Set up an exam plan inside CrashMode.
          </div>
        )}
      </section>

      {/* ── BOTTOM PANELS: Logs, Warnings, Catalog, Question bank ────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", flexWrap: "wrap" }}>
        
        {/* Widget 7: Recent Sessions & Widget 10: Weak Areas */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Recent Sessions */}
          <div className="memoir-card" style={{ padding: "24px" }}>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "18px", fontWeight: 500, margin: "0 0 16px 0" }}>
              Recent Practice History
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <ActivityRow module="Score" topic="Deadlocks banker execution answer check" desc="Grade: 8/12" time="2 hours ago" />
              <ActivityRow module="Simplify" topic="Paging fragmentation and addressing offsets" desc="Analogies read" time="Yesterday" />
              <ActivityRow module="CrashMode" topic="Database transactional schedule mapping" desc="Strategy generated" time="3 days ago" />
            </div>
          </div>

          {/* Weak Areas Alert */}
          <div className="memoir-card" style={{ padding: "24px", border: "1.5px solid rgba(181, 74, 58, 0.20)", backgroundColor: "#FEF3EE" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
              <AlertCircle color="#B54A3A" size={18} />
              <h3 style={{ fontFamily: "var(--font-sans)", fontSize: "13px", fontWeight: 700, color: "#B54A3A", margin: 0, textTransform: "uppercase" }}>
                Weak Concepts Alert
              </h3>
            </div>
            <p style={{ margin: 0, fontSize: "12px", color: "#B54A3A", lineHeight: "1.5" }}>
              Based on mid-terms, you are scoring low on <strong>Normalization</strong> (BCNF decomposition) and <strong>Memory Paging</strong> algorithms. Consider running a doubt simplify or practice question for these modules.
            </p>
          </div>
        </div>

        {/* Widget 8: Notes Catalogue & Widget 9: Question Bank */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Notes Catalogue snapshot */}
          <div className="memoir-card" style={{ padding: "24px" }}>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "18px", fontWeight: 500, margin: "0 0 16px 0" }}>
              📚 Notes Catalog
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <CatalogItem subject="Operating Systems" count="10 chapters available" />
              <CatalogItem subject="Database Systems" count="8 chapters available" />
              <CatalogItem subject="Automata Theory" count="6 chapters available" />
            </div>
            
            <Link to="/simplify" style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-accent)", textDecoration: "none", display: "inline-block", marginTop: "14px" }}>
              Browse notes summaries →
            </Link>
          </div>

          {/* Practice snapshot */}
          <div className="memoir-card" style={{ padding: "24px" }}>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "18px", fontWeight: 500, margin: "0 0 16px 0" }}>
              🎯 Practice Questions
            </h3>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "var(--color-linen-warm)", padding: "14px 18px", borderRadius: "var(--radius-lg)" }}>
              <div>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--color-ink-black)", display: "block" }}>
                  47 Questions Available
                </span>
                <span style={{ fontSize: "11px", color: "var(--color-ink-muted)" }}>
                  Operating Systems exam syllabus
                </span>
              </div>
              <Link to="/score" className="memoir-btn-primary" style={{ padding: "8px 14px", fontSize: "11.5px" }}>
                Solve Recommended
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Styled hovering effect styling */}
      <style>{`
        .avatar-hover-trigger:hover .avatar-hover-overlay {
          opacity: 1 !important;
        }
      `}</style>
    </MainLayout>
  );
};

// ── Focus routing helper ─────────────────────────────────────────────
function recommendedToolPath(struggle) {
  switch (struggle) {
    case "study-what": return "/crashmode";
    case "no-time": return "/scope";
    case "answers": return "/score";
    case "concepts":
    default:
      return "/simplify";
  }
}

// ── Child UI helper components ───────────────────────────────────────
const QuickCard = ({ emoji, name, tag, to, color }) => (
  <Link
    to={to}
    className="memoir-card"
    style={{
      padding: "16px",
      display: "flex",
      alignItems: "center",
      gap: "14px",
      textDecoration: "none",
      transition: "transform 0.15s ease",
      backgroundColor: "#fff",
      border: "1px solid var(--color-ink-border)"
    }}
    onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
    onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
  >
    <div style={{
      width: "36px",
      height: "36px",
      borderRadius: "50%",
      backgroundColor: color,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "18px",
      flexShrink: 0
    }}>
      {emoji}
    </div>
    <div>
      <span style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "var(--color-ink-black)" }}>
        {name}
      </span>
      <span style={{ fontSize: "10.5px", color: "var(--color-ink-muted)" }}>
        {tag}
      </span>
    </div>
  </Link>
);

const ActivityRow = ({ module, topic, desc, time }) => (
  <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", fontSize: "12.5px" }}>
    <span style={{
      fontSize: "9px",
      fontWeight: 700,
      backgroundColor: "var(--color-linen-mid)",
      padding: "2px 6px",
      borderRadius: "4px",
      textTransform: "uppercase"
    }}>
      {module}
    </span>
    <div style={{ flex: 1 }}>
      <p style={{ margin: 0, fontWeight: 600, color: "var(--color-ink-black)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "240px" }}>
        {topic}
      </p>
      <span style={{ fontSize: "11px", color: "var(--color-ink-muted)" }}>
        {desc}
      </span>
    </div>
    <span style={{ fontSize: "10.5px", color: "var(--color-ink-muted)" }}>
      {time}
    </span>
  </div>
);

const CatalogItem = ({ subject, count }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--color-linen-warm)", paddingBottom: "6px", fontSize: "12.5px" }}>
    <span style={{ fontWeight: 600, color: "var(--color-ink-black)" }}>{subject}</span>
    <span style={{ fontSize: "11px", color: "var(--color-ink-muted)", backgroundColor: "var(--color-linen-warm)", padding: "2px 8px", borderRadius: "4px" }}>
      {count}
    </span>
  </div>
);
