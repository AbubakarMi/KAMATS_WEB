'use client';

import { PermissionGuard } from '@/components/guards/PermissionGuard';
import { Permissions as P } from '@/lib/utils/permissions';

export default function ConsumptionLayout({ children }: { children: React.ReactNode }) {
  return (
    <PermissionGuard required={[P.CONSUMPTION_RECORD, P.CONSUMPTION_READ, P.CONSUMPTION_ACKNOWLEDGE]}>
      {children}
    </PermissionGuard>
  );
}
