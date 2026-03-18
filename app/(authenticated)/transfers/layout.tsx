'use client';

import { PermissionGuard } from '@/components/guards/PermissionGuard';
import { Permissions as P } from '@/lib/utils/permissions';

export default function TransfersLayout({ children }: { children: React.ReactNode }) {
  return (
    <PermissionGuard required={[P.STO_CREATE, P.STO_READ, P.STO_APPROVE_CENTRAL_UNIT, P.STO_APPROVE_UNIT_USER]}>
      {children}
    </PermissionGuard>
  );
}
