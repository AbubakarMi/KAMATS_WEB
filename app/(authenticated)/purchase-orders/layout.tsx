'use client';

import { PermissionGuard } from '@/components/guards/PermissionGuard';
import { Permissions as P } from '@/lib/utils/permissions';

export default function POLayout({ children }: { children: React.ReactNode }) {
  return (
    <PermissionGuard required={[P.PO_CREATE, P.PO_READ, P.PO_APPROVE_FINANCE, P.PO_APPROVE_DIRECTOR]}>
      {children}
    </PermissionGuard>
  );
}
