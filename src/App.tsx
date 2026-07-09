// src/App.tsx
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Landing } from "./pages/Landing.jsx";
import { Login } from "./pages/Login.jsx";
import { Signup } from "./pages/Signup.jsx";
import { Dashboard } from "./pages/Dashboard.jsx";
import { CrashMode } from "./pages/CrashMode.jsx";
import { Scope } from "./pages/Scope.jsx";
import { Simplify } from "./pages/Simplify.jsx";
import { Score } from "./pages/Score.jsx";
import { Notes } from "./pages/Notes.jsx";
import { Onboarding } from "./pages/Onboarding.jsx";
import { InstitutionSignup } from "./pages/InstitutionSignup.jsx";
import { InstitutionDashboard } from "./pages/InstitutionDashboard.jsx";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { RoadmapsDashboard } from "./pages/RoadmapsDashboard.tsx";
import { RoadmapsBookmarks } from "./pages/RoadmapsBookmarks.tsx";
import { RoadmapDetail } from "./pages/RoadmapDetail.tsx";
import { useTargetReminder } from "./hooks/useTargetReminder";
import { SocraticChatbot } from "./components/SocraticChatbot";

// Navbar shows only on public/marketing pages.
// App-interior pages (dashboard, tools) use MainLayout's sidebar.
const PUBLIC_ROUTES = ["/", "/login", "/signup", "/institution/signup"];

const AppRoutes = () => {
  useTargetReminder();
  const { pathname } = useLocation();
  const showNavbar = PUBLIC_ROUTES.includes(pathname);
  const showChatbot = !PUBLIC_ROUTES.includes(pathname);

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/"          element={<Landing />} />
        <Route path="/login"     element={<Login />} />
        <Route path="/signup"    element={<Signup />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          }
        />
        <Route
          path="/crashmode"
          element={
            <ProtectedRoute>
              <CrashMode />
            </ProtectedRoute>
          }
        />
        <Route
          path="/scope"
          element={
            <ProtectedRoute>
              <Scope />
            </ProtectedRoute>
          }
        />
        <Route
          path="/simplify"
          element={
            <ProtectedRoute>
              <Simplify />
            </ProtectedRoute>
          }
        />
        <Route
          path="/score"
          element={
            <ProtectedRoute>
              <Score />
            </ProtectedRoute>
          }
        />
        <Route
          path="/institution/signup"
          element={<InstitutionSignup />}
        />
        <Route
          path="/institution/dashboard"
          element={
            <ProtectedRoute>
              <InstitutionDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notes"
          element={
            <ProtectedRoute>
              <Notes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/roadmaps"
          element={
            <ProtectedRoute>
              <RoadmapsDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/roadmaps/bookmarks"
          element={
            <ProtectedRoute>
              <RoadmapsBookmarks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/roadmaps/:roadmapId"
          element={
            <ProtectedRoute>
              <RoadmapDetail />
            </ProtectedRoute>
          }
        />
      </Routes>
      {showChatbot && <SocraticChatbot />}
    </>
  );
};

export const App = () => (
  <AuthProvider>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AppRoutes />
    </BrowserRouter>
  </AuthProvider>
);
