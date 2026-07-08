
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * ProtectedRoute ensures that only authenticated users or allowed guest states
 * can access specific application routes.
 */
export const ProtectedRoute = ({ children }) => {
  const { user, loading, isGuest } = useAuth();
  const location = useLocation();

  if (loading) {
    return null;
  }

  // 1. Unauthenticated case
  if (!user && !isGuest) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 2. Guest case: restrict all routes except /simplify and /roadmaps
  if (isGuest) {
    if (location.pathname !== "/simplify" && !location.pathname.startsWith("/roadmaps")) {
      return <Navigate to="/signup" replace state={{ msg: "Please sign up to unlock other tools!" }} />;
    }
    return <>{children}</>;
  }

  // 3. Authenticated Roles case
  const role = user?.user_metadata?.role;
  const isAdminPath = location.pathname.startsWith("/institution");

  if (role === "admin") {
    // Admin trying to access student pages
    if (!isAdminPath) {
      return <Navigate to="/institution/dashboard" replace />;
    }
  } else {
    // Student trying to access admin pages
    if (isAdminPath) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};
