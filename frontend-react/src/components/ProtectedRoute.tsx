import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../types';
import { Spinner } from './UI';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: Role[];
}

export default function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    // redirect to appropriate dashboard
    const redirect = user.role === 'PATIENT' ? '/patient' : user.role === 'ADMIN' ? '/admin' : '/doctor';
    return <Navigate to={redirect} replace />;
  }
  return <>{children}</>;
}
