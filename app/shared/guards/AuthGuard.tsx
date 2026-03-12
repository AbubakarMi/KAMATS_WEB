import { Navigate, Outlet } from 'react-router';
import { useAuth } from '~/shared/hooks';

export function AuthGuard() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
