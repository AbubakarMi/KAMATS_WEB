import { PermissionGuard } from '~/shared/guards';
import { Permissions as P } from '~/shared/utils/permissions';

export default function ConsumptionGuard() {
  return <PermissionGuard required={[P.CONSUMPTION_RECORD, P.CONSUMPTION_READ, P.CONSUMPTION_ACKNOWLEDGE]} />;
}
