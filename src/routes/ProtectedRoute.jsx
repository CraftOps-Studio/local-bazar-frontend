import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated, roleMode } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg text-brand-text">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-primary" />
          <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider animate-pulse">
            Verifying Session...
          </p>
        </div>
      </div>
    );
  }

  // Not logged in -> redirect to login with original target path saved
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role validation based on selected roleMode
  const activeRole = roleMode || user?.role;
  if (allowedRoles && !allowedRoles.includes(activeRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
