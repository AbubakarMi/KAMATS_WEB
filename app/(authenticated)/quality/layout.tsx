'use client';

import { PermissionGuard } from '@/components/guards/PermissionGuard';
import { Permissions as P } from '@/lib/utils/permissions';

export default function QualityLayout({ children }: { children: React.ReactNode }) {
  return (
    <PermissionGuard required={[P.DVR_CREATE, P.DVR_READ, P.INSPECTION_READ]}>
      {children}
    </PermissionGuard>
  );
}
