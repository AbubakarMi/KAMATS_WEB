import { PermissionGuard } from '~/shared/guards';
import { Permissions as P } from '~/shared/utils/permissions';

export default function PRGuard() {
  return <PermissionGuard required={[P.PR_CREATE, P.PR_READ, P.PR_APPROVE]} />;
}
