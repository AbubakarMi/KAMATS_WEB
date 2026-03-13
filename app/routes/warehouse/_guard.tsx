import { PermissionGuard } from '~/shared/guards';
import { Permissions as P } from '~/shared/utils/permissions';

export default function WarehouseGuard() {
  return <PermissionGuard required={[P.LOCATIONS_READ, P.LOCATIONS_MANAGE]} />;
}
