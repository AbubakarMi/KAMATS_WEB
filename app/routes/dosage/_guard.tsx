import { PermissionGuard } from '~/shared/guards';
import { Permissions as P } from '~/shared/utils/permissions';

export default function DosageGuard() {
  return <PermissionGuard required={[P.DOSAGE_READ, P.DOSAGE_CONFIGURE]} />;
}
