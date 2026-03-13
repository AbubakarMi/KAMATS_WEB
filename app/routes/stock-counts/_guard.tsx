import { PermissionGuard } from '~/shared/guards';
import { Permissions as P } from '~/shared/utils/permissions';

export default function StockCountGuard() {
  return <PermissionGuard required={[P.STOCKCOUNT_CREATE, P.STOCKCOUNT_READ, P.STOCKCOUNT_EXECUTE, P.STOCKCOUNT_APPROVE]} />;
}
