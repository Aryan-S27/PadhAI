// src/pages/Dashboard.jsx
import { MainLayout } from "../components/MainLayout";
import { ModuleCard } from "../components/ModuleCard";

export const Dashboard = () => (
  <MainLayout>
    {/* Page heading */}
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
        Your workspace
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
        Welcome to PadhAI
      </h1>
      <p
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "14px",
          fontWeight: 400,
          letterSpacing: "-0.48px",
          color: "var(--color-ink-muted)",
          marginTop: "10px",
        }}
      >
        Choose a tool to get started on your exam prep.
      </p>
    </div>

    {/* Module cards grid */}
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        gap: "16px",
      }}
    >
      <ModuleCard
        tag="CrashMode"
        title="Crash Mode"
        description="Rank topics and modules by past-paper exam weightage to prioritize your study."
        to="/crashmode"
      />
      <ModuleCard
        tag="Scope"
        title="Scope"
        description="Create a personalized day-by-day preparation schedule based on your exam date."
        to="/scope"
      />
      <ModuleCard
        tag="Simplify"
        title="Simplify"
        description="Turn dense notes into concise, exam-ready summaries."
        to="/simplify"
      />
      <ModuleCard
        tag="Score"
        title="Score"
        description="Submit practice answers and receive examiner-style feedback."
        to="/score"
      />
    </div>
  </MainLayout>
);
