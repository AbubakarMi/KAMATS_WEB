import { useSelector } from 'react-redux';
import type { RootState } from '@/lib/store';
import { hasPermission, hasAllPermissions } from '@/lib/utils/permissions';

export function useAuth() {
  const auth = useSelector((state: RootState) => state.auth);

  return {
    user: auth.user,
    isAuthenticated: !!auth.accessToken,
    permissions: auth.user?.permissions ?? [],
    storeAssignments: auth.user?.storeAssignments ?? [],
    activeStoreId: auth.activeStoreId,
    hasPermission: (perm: string | string[]) =>
      hasPermission(auth.user?.permissions ?? [], perm),
    hasAllPermissions: (perms: string[]) =>
      hasAllPermissions(auth.user?.permissions ?? [], perms),
  };
}
