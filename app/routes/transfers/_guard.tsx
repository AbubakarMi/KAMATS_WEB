import { PermissionGuard } from '~/shared/guards';
import { Permissions as P } from '~/shared/utils/permissions';

export default function TransfersGuard() {
  return <PermissionGuard required={[P.STO_CREATE, P.STO_READ, P.STO_APPROVE_CENTRAL_UNIT, P.STO_APPROVE_UNIT_USER]} />;
}
