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
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

// Navbar shows only on public/marketing pages.
// App-interior pages (dashboard, tools) use MainLayout's sidebar.
const PUBLIC_ROUTES = ["/", "/login", "/signup"];

const AppRoutes = () => {
  const { pathname } = useLocation();
  const showNavbar = PUBLIC_ROUTES.includes(pathname);

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
      </Routes>
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
