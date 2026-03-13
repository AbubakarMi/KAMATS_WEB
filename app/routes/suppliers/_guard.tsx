import { PermissionGuard } from '~/shared/guards';
import { Permissions as P } from '~/shared/utils/permissions';

export default function SuppliersGuard() {
  return <PermissionGuard required={[P.SUPPLIERS_CREATE, P.SUPPLIERS_READ, P.SUPPLIERS_APPROVE]} />;
}
