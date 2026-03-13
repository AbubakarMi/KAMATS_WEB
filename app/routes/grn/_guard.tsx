import { PermissionGuard } from '~/shared/guards';
import { Permissions as P } from '~/shared/utils/permissions';

export default function GRNGuard() {
  return <PermissionGuard required={[P.GRN_CREATE, P.GRN_READ]} />;
}
