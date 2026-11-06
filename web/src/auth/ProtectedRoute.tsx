import {
  Navigate,
  useLocation
} from 'react-router-dom';

import { useAuth } from './AuthContext';

import type { UserRole } from '../types/user';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({
  children,
  allowedRoles
}: ProtectedRouteProps) {

  const { user, loading } = useAuth();

  const location = useLocation();

  if (loading) {
    return <div className="page-loading">Memeriksa akun...</div>;
  }

  // Jika belum login
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  // Jika role tidak sesuai
  if (
    allowedRoles &&
    !allowedRoles.includes(user.role)
  ) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}