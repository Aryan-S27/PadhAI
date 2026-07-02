// src/App.jsx
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { Dashboard } from "./pages/Dashboard";
import { CrashMode } from "./pages/CrashMode";
import { Scope } from "./pages/Scope";
import { Simplify } from "./pages/Simplify";
import { Score } from "./pages/Score";
import { AuthProvider } from "./context/AuthContext";

// Routes where the global Navbar shows (public / auth pages)
// App-interior routes use MainLayout's sidebar instead.
const PUBLIC_ROUTES = ["/", "/login", "/signup"];

const AppRoutes = () => {
  const { pathname } = useLocation();
  const showNavbar = PUBLIC_ROUTES.includes(pathname);

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/"           element={<Landing />} />
        <Route path="/login"      element={<Login />} />
        <Route path="/signup"     element={<Signup />} />
        <Route path="/dashboard"  element={<Dashboard />} />
        <Route path="/crashmode"  element={<CrashMode />} />
        <Route path="/scope"      element={<Scope />} />
        <Route path="/simplify"   element={<Simplify />} />
        <Route path="/score"      element={<Score />} />
      </Routes>
    </>
  );
};

export const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </AuthProvider>
);
