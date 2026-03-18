'use client';

import { PermissionGuard } from '@/components/guards/PermissionGuard';
import { Permissions as P } from '@/lib/utils/permissions';

export default function WeighbridgeLayout({ children }: { children: React.ReactNode }) {
  return (
    <PermissionGuard required={[P.WEIGHBRIDGE_READ]}>
      {children}
    </PermissionGuard>
  );
}
