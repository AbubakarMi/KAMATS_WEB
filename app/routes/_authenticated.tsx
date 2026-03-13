import { Navigate, Outlet } from 'react-router';
import { useAuth } from '~/shared/hooks';
import AppLayout from '~/shared/components/layout/AppLayout';
import { ErrorBoundary } from '~/shared/components/errors';

export default function AuthenticatedLayout() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppLayout>
      <ErrorBoundary level="page">
        <Outlet />
      </ErrorBoundary>
    </AppLayout>
  );
}
