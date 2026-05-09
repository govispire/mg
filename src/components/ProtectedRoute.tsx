
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth, UserRole } from '@/app/providers';

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // While auth is initialising (e.g. reading localStorage / verifying JWT),
  // render nothing — prevents a flash-redirect to the landing page
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100/80">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (user && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    switch (user.role) {
      case 'student':
        return <Navigate to="/student/dashboard" replace />;
      case 'employee':
        return <Navigate to="/employee/dashboard" replace />;
      case 'super-admin':
        return <Navigate to="/super-admin/dashboard" replace />;
      case 'owner':
        return <Navigate to="/owner/dashboard" replace />;
      case 'mentor':
        return <Navigate to="/mentor/dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
