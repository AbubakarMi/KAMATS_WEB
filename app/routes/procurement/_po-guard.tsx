import { PermissionGuard } from '~/shared/guards';
import { Permissions as P } from '~/shared/utils/permissions';

export default function POGuard() {
  return <PermissionGuard required={[P.PO_CREATE, P.PO_READ, P.PO_APPROVE_MANAGER, P.PO_APPROVE_FINANCE]} />;
}
