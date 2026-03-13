import { PermissionGuard } from '~/shared/guards';
import { Permissions as P } from '~/shared/utils/permissions';

export default function WeighbridgeGuard() {
  return <PermissionGuard required={[P.WEIGHBRIDGE_RECORD, P.WEIGHBRIDGE_READ, P.WEIGHBRIDGE_OVERRIDE]} />;
}
