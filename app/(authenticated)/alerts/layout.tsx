'use client';

import { PermissionGuard } from '@/components/guards/PermissionGuard';
import { Permissions as P } from '@/lib/utils/permissions';

export default function AlertsLayout({ children }: { children: React.ReactNode }) {
  return (
    <PermissionGuard required={[P.ALERTS_READ, P.ALERTS_ACKNOWLEDGE, P.ALERTS_CONFIGURE]}>
      {children}
    </PermissionGuard>
  );
}
