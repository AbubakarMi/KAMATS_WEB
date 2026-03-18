'use client';

import { PermissionGuard } from '@/components/guards/PermissionGuard';
import { Permissions as P } from '@/lib/utils/permissions';

export default function StockCountLayout({ children }: { children: React.ReactNode }) {
  return (
    <PermissionGuard required={[P.STOCKCOUNT_CREATE, P.STOCKCOUNT_READ, P.STOCKCOUNT_EXECUTE, P.STOCKCOUNT_APPROVE]}>
      {children}
    </PermissionGuard>
  );
}
