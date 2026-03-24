'use client';

import { PermissionGuard } from '@/components/guards/PermissionGuard';
import { Permissions as P } from '@/lib/utils/permissions';

export default function DispatchLayout({ children }: { children: React.ReactNode }) {
  return (
    <PermissionGuard required={[P.TRANSFER_DISPATCH, P.TRANSFER_READ]}>
      {children}
    </PermissionGuard>
  );
}
