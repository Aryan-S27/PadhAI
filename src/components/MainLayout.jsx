// src/components/MainLayout.jsx
import { Sidebar } from "./Sidebar";

export const MainLayout = ({ children }) => (
  <div
    style={{
      display: "flex",
      minHeight: "100vh",
      backgroundColor: "var(--color-linen-warm)",
    }}
  >
    {/* Persistent sidebar */}
    <Sidebar />

    {/* Main content area */}
    <main
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "40px 48px",
        minWidth: 0,
      }}
    >
      {children}
    </main>
  </div>
);
