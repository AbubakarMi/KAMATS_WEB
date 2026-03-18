'use client';

import { PermissionGuard } from '@/components/guards/PermissionGuard';
import { Permissions as P } from '@/lib/utils/permissions';

export default function SuppliersLayout({ children }: { children: React.ReactNode }) {
  return (
    <PermissionGuard required={[P.SUPPLIERS_CREATE, P.SUPPLIERS_READ, P.SUPPLIERS_APPROVE]}>
      {children}
    </PermissionGuard>
  );
}
