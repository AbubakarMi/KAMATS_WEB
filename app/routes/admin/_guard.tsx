import { PermissionGuard } from '~/shared/guards';
import { Permissions as P } from '~/shared/utils/permissions';

export default function AdminGuard() {
  return <PermissionGuard required={[P.USERS_MANAGE, P.SYSTEM_CONFIGURE, P.DEVICES_MANAGE]} />;
}
