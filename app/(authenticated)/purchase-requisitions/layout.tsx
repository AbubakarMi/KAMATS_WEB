'use client';

import { PermissionGuard } from '@/components/guards/PermissionGuard';
import { Permissions as P } from '@/lib/utils/permissions';

export default function PRLayout({ children }: { children: React.ReactNode }) {
  return (
    <PermissionGuard required={[P.PR_CREATE, P.PR_READ, P.PR_APPROVE]}>
      {children}
    </PermissionGuard>
  );
}
