'use client';

import { PermissionGuard } from '@/components/guards/PermissionGuard';
import { Permissions as P } from '@/lib/utils/permissions';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <PermissionGuard required={P.USERS_MANAGE}>
      {children}
    </PermissionGuard>
  );
}
