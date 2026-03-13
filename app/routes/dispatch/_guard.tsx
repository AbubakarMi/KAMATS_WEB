import { PermissionGuard } from '~/shared/guards';
import { Permissions as P } from '~/shared/utils/permissions';

export default function DispatchGuard() {
  return <PermissionGuard required={[P.TRANSFER_DISPATCH, P.TRANSFER_READ]} />;
}
