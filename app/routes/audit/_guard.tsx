import { PermissionGuard } from '~/shared/guards';
import { Permissions as P } from '~/shared/utils/permissions';

export default function AuditGuard() {
  return <PermissionGuard required={[P.AUDIT_VIEW, P.AUDIT_VERIFY]} />;
}
