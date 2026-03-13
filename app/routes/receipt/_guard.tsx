import { PermissionGuard } from '~/shared/guards';
import { Permissions as P } from '~/shared/utils/permissions';

export default function ReceiptGuard() {
  return <PermissionGuard required={[P.TRANSFER_RECEIVE, P.TRANSFER_READ]} />;
}
