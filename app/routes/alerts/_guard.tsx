import { PermissionGuard } from '~/shared/guards';
import { Permissions as P } from '~/shared/utils/permissions';

export default function AlertsGuard() {
  return <PermissionGuard required={[P.ALERTS_READ, P.ALERTS_ACKNOWLEDGE, P.ALERTS_CONFIGURE]} />;
}
