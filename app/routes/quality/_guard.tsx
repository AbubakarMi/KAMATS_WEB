import { PermissionGuard } from '~/shared/guards';
import { Permissions as P } from '~/shared/utils/permissions';

export default function QualityGuard() {
  return <PermissionGuard required={[P.DVR_CREATE, P.DVR_READ, P.INSPECTION_READ]} />;
}
