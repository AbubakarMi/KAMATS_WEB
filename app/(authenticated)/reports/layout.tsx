'use client';

import { PermissionGuard } from '@/components/guards/PermissionGuard';
import { Permissions as P } from '@/lib/utils/permissions';

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
  return (
    <PermissionGuard required={P.REPORTS_VIEW}>
      {children}
    </PermissionGuard>
  );
}
