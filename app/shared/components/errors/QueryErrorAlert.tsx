import { Alert, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

interface QueryErrorAlertProps {
  error: unknown;
  onRetry?: () => void;
}

function extractMessage(error: unknown): string {
  if (!error) return 'An unexpected error occurred.';

  // RTK Query error shapes
  const rtkError = error as {
    status?: number | string;
    data?: { message?: string };
    error?: string;
    message?: string;
  };

  if (rtkError.data?.message) return rtkError.data.message;
  if (rtkError.error) return rtkError.error;
  if (rtkError.message) return rtkError.message;

  if (typeof rtkError.status === 'number') {
    if (rtkError.status === 403) return 'You do not have permission to access this resource.';
    if (rtkError.status === 404) return 'The requested resource was not found.';
    if (rtkError.status >= 500) return 'A server error occurred. Please try again later.';
  }

  if (rtkError.status === 'FETCH_ERROR') return 'Network error. Please check your connection.';
  if (rtkError.status === 'TIMEOUT_ERROR') return 'Request timed out. Please try again.';

  return 'An unexpected error occurred.';
}

export function QueryErrorAlert({ error, onRetry }: QueryErrorAlertProps) {
  return (
    <Alert
      type="error"
      message="Failed to load data"
      description={extractMessage(error)}
      showIcon
      style={{ marginBottom: 16 }}
      action={
        onRetry && (
          <Button size="small" icon={<ReloadOutlined />} onClick={onRetry}>
            Retry
          </Button>
        )
      }
    />
  );
}
