'use client';

import { PermissionGuard } from '@/components/guards/PermissionGuard';
import { Permissions as P } from '@/lib/utils/permissions';

export default function LotsLayout({ children }: { children: React.ReactNode }) {
  return (
    <PermissionGuard required={[P.LOTS_READ, P.ITEMS_READ]}>
      {children}
    </PermissionGuard>
  );
}
