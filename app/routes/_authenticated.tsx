import { Navigate, Outlet } from 'react-router';
import { useAuth } from '~/shared/hooks';
import AppLayout from '~/shared/components/layout/AppLayout';

export default function AuthenticatedLayout() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}
