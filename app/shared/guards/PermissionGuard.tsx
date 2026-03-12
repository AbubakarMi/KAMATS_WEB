import { Outlet } from 'react-router';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router';
import { useAuth } from '~/shared/hooks';

interface PermissionGuardProps {
  required: string | string[];
  children?: React.ReactNode;
}

export function PermissionGuard({ required, children }: PermissionGuardProps) {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();

  if (!hasPermission(required)) {
    return (
      <Result
        status="403"
        title="403 — Access Denied"
        subTitle="You do not have permission to access this page."
        extra={
          <Button type="primary" onClick={() => navigate('/')}>
            Back to Dashboard
          </Button>
        }
      />
    );
  }

  return children ?? <Outlet />;
}
