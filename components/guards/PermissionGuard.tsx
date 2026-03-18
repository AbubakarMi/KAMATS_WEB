'use client';

import { useRouter } from 'next/navigation';
import { ShieldX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/hooks';

interface PermissionGuardProps {
  required: string | string[];
  children: React.ReactNode;
}

export function PermissionGuard({ required, children }: PermissionGuardProps) {
  const { hasPermission } = useAuth();
  const router = useRouter();

  if (!hasPermission(required)) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-6">
          <ShieldX size={32} className="text-red-500" />
        </div>
        <h2 className="text-2xl font-bold font-[family-name:var(--font-display)] text-slate-900 mb-2">
          403 — Access Denied
        </h2>
        <p className="text-slate-500 mb-8 max-w-sm">
          You do not have permission to access this page.
        </p>
        <Button onClick={() => router.push('/')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
