// frontend/wai-wai/src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, role, loading } = useAuth();

  if (loading) {
    // Show a simple spinner or text while checking auth status
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;
  }

  // 1. Check if user is logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // 2. Check if user has the correct role (if specific roles are required)
  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect to home if they don't have permission (e.g. Job Seeker trying to access Employer tool)
    alert("Access Denied: This area is for Employers only.");
    return <Navigate to="/" replace />;
  }

  // If all checks pass, render the page
  return children;
};

export default ProtectedRoute;