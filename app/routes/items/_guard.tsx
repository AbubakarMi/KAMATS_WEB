import { PermissionGuard } from '~/shared/guards';
import { Permissions as P } from '~/shared/utils/permissions';

export default function ItemsGuard() {
  return <PermissionGuard required={[P.LOTS_READ, P.ITEMS_READ]} />;
}
