'use client';

import { useState } from 'react';
import { X, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface QueryErrorAlertProps {
  error: unknown;
}

type Severity = 'destructive' | 'warning' | 'info';

function extractInfo(error: unknown): { message: string; severity: Severity; title: string } {
  if (!error) return { message: 'An unexpected error occurred.', severity: 'destructive', title: 'Error' };

  const rtkError = error as {
    status?: number | string;
    data?: { message?: string };
    error?: string;
    message?: string;
  };

  if (rtkError.status === 'FETCH_ERROR') {
    return { message: 'Network error. Please check your connection.', severity: 'warning', title: 'Connection Issue' };
  }
  if (rtkError.status === 'TIMEOUT_ERROR') {
    return { message: 'Request timed out. Please try again.', severity: 'warning', title: 'Timeout' };
  }

  const msg = rtkError.data?.message || rtkError.error || rtkError.message || '';

  if (typeof rtkError.status === 'number') {
    if (rtkError.status === 403) return { message: msg || 'You do not have permission to access this resource.', severity: 'warning', title: 'Access Denied' };
    if (rtkError.status === 404) return { message: msg || 'The requested resource was not found.', severity: 'info', title: 'Not Found' };
    if (rtkError.status >= 500) return { message: msg || 'A server error occurred. Please try again later.', severity: 'destructive', title: 'Server Error' };
  }

  return { message: msg || 'An unexpected error occurred.', severity: 'destructive', title: 'Error' };
}

const severityIcon: Record<Severity, React.ReactNode> = {
  destructive: <AlertCircle size={16} />,
  warning: <AlertTriangle size={16} />,
  info: <Info size={16} />,
};

export function QueryErrorAlert({ error }: QueryErrorAlertProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const { message, severity, title } = extractInfo(error);

  return (
    <Alert variant={severity} className="mb-4 rounded-xl relative pr-10">
      {severityIcon[severity]}
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 rounded-lg p-1 opacity-60 hover:opacity-100 transition-opacity"
      >
        <X size={14} />
      </button>
    </Alert>
  );
}
