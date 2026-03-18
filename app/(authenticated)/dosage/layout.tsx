'use client';

import { PermissionGuard } from '@/components/guards/PermissionGuard';
import { Permissions as P } from '@/lib/utils/permissions';

export default function DosageLayout({ children }: { children: React.ReactNode }) {
  return (
    <PermissionGuard required={[P.DOSAGE_READ, P.DOSAGE_CONFIGURE]}>
      {children}
    </PermissionGuard>
  );
}
