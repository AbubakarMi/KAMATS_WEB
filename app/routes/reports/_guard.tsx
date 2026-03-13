import { PermissionGuard } from '~/shared/guards';
import { Permissions as P } from '~/shared/utils/permissions';

export default function ReportsGuard() {
  return <PermissionGuard required={[P.REPORTS_VIEW]} />;
}
