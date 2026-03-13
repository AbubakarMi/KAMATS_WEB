import { PermissionGuard } from '~/shared/guards';
import { Permissions as P } from '~/shared/utils/permissions';

export default function LedgerGuard() {
  return <PermissionGuard required={[P.LEDGER_READ]} />;
}
