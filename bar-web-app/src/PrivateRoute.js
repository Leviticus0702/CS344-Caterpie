// src/components/PrivateRoute.js
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function PrivateRoute({ children, role }) {
  const { currentUser } = useAuth();

  if (!currentUser) {
    // If user is not authenticated, redirect to login
    return <Navigate to="/" />;
  }

  if (role && currentUser.role !== role) {
    // If user role does not match the required role, redirect to login
    return <Navigate to="/" />;
  }

  // If authenticated and role matches (if applicable), render the children
  return children;
}

export default PrivateRoute;
