import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../hooks/redux';
import type { Role } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles }) => {
  const { user, token } = useAppSelector(s => s.auth);

  if (!token || !user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role as Role)) return <Navigate to="/app/dashboard" replace />;

  return <>{children}</>;
