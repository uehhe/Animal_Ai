import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';
import { LoadingSpinner } from '../components/common/LoadingSpinner.js';

export const AdminRoute: React.FC = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner size="lg" text="Đang kiểm tra quyền quản trị..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
