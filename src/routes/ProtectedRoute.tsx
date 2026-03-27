import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import { ROUTES } from '../constants/routes';
import { FullPageSpinner } from '../components/ui/Spinner';

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <FullPageSpinner />;
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />;

  return <Outlet />;
}
