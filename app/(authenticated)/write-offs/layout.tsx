'use client';

import { PermissionGuard } from '@/components/guards/PermissionGuard';
import { Permissions as P } from '@/lib/utils/permissions';

export default function WriteOffsLayout({ children }: { children: React.ReactNode }) {
  return (
    <PermissionGuard required={[P.WRITEOFF_RAISE, P.WRITEOFF_READ, P.WRITEOFF_APPROVE_MINOR, P.WRITEOFF_APPROVE_SIGNIFICANT, P.WRITEOFF_APPROVE_CRITICAL]}>
      {children}
    </PermissionGuard>
  );
}
