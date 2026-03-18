'use client';

import { PermissionGuard } from '@/components/guards/PermissionGuard';
import { Permissions as P } from '@/lib/utils/permissions';

export default function GRNLayout({ children }: { children: React.ReactNode }) {
  return (
    <PermissionGuard required={[P.GRN_CREATE, P.GRN_READ]}>
      {children}
    </PermissionGuard>
  );
}
