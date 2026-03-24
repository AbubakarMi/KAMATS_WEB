'use client';

import { PermissionGuard } from '@/components/guards/PermissionGuard';
import { Permissions as P } from '@/lib/utils/permissions';

export default function ReceiptLayout({ children }: { children: React.ReactNode }) {
  return (
    <PermissionGuard required={[P.TRANSFER_RECEIVE, P.TRANSFER_READ]}>
      {children}
    </PermissionGuard>
  );
}
