import { PermissionGuard } from '~/shared/guards';
import { Permissions as P } from '~/shared/utils/permissions';

export default function LossGuard() {
  return <PermissionGuard required={[P.WRITEOFF_RAISE, P.WRITEOFF_READ, P.WRITEOFF_APPROVE_MINOR, P.WRITEOFF_APPROVE_SIGNIFICANT, P.WRITEOFF_APPROVE_CRITICAL]} />;
}
