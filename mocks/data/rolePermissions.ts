import { Permissions as P } from '@/lib/utils/permissions';

/**
 * Mock role → permission mappings for dev/test only.
 * In production, the backend is the single source of truth.
 */
export const rolePermissions: Record<string, string[]> = {
  'System Administrator': Object.values(P),

  'Procurement Officer': [
    P.SUPPLIERS_CREATE, P.SUPPLIERS_READ,
    P.PR_CREATE, P.PR_READ,
    P.PO_CREATE, P.PO_READ,
  ],

  'Procurement Manager': [
    P.SUPPLIERS_READ, P.SUPPLIERS_APPROVE,
    P.PR_READ, P.PR_APPROVE,
    P.PO_READ, P.PO_APPROVE_MANAGER,
  ],

  'Finance Officer': [
    P.PO_READ, P.PO_APPROVE_FINANCE,
    P.REPORTS_VIEW,
  ],

  'Quality Inspector': [
    P.DVR_CREATE, P.DVR_READ,
    P.INSPECTION_SUBMIT, P.INSPECTION_READ,
  ],

  'Weighbridge Operator': [
    P.WEIGHBRIDGE_RECORD, P.WEIGHBRIDGE_READ,
  ],

  'Central Store Keeper': [
    P.GRN_CREATE, P.GRN_READ,
    P.LOTS_READ, P.LABELS_PRINT,
    P.ITEMS_READ, P.ITEMS_LABEL, P.ITEMS_PUTAWAY,
    P.LOCATIONS_READ, P.LOCATIONS_MANAGE,
    P.LEDGER_READ,
    P.STOCKCOUNT_CREATE, P.STOCKCOUNT_READ, P.STOCKCOUNT_EXECUTE,
    P.STO_READ,
    P.TRANSFER_DISPATCH, P.TRANSFER_READ,
    P.WRITEOFF_RAISE, P.WRITEOFF_READ,
  ],

  'Unit Store Keeper': [
    P.LOTS_READ, P.ITEMS_READ,
    P.LOCATIONS_READ,
    P.LEDGER_READ,
    P.STOCKCOUNT_CREATE, P.STOCKCOUNT_READ, P.STOCKCOUNT_EXECUTE,
    P.STO_CREATE, P.STO_READ,
    P.TRANSFER_RECEIVE, P.TRANSFER_READ,
    P.TRANSFER_DISPATCH,
    P.WRITEOFF_RAISE, P.WRITEOFF_READ,
  ],

  'Store Manager': [
    P.LOTS_READ, P.ITEMS_READ,
    P.LOCATIONS_READ, P.LOCATIONS_MANAGE,
    P.LEDGER_READ,
    P.STOCKCOUNT_READ, P.STOCKCOUNT_APPROVE,
    P.STO_READ, P.STO_APPROVE_CENTRAL_UNIT, P.STO_APPROVE_UNIT_USER,
    P.TRANSFER_READ,
    P.WRITEOFF_READ, P.WRITEOFF_APPROVE_MINOR, P.WRITEOFF_APPROVE_SIGNIFICANT,
    P.REPORTS_VIEW,
  ],

  'WTP Operator': [
    P.CONSUMPTION_RECORD, P.CONSUMPTION_READ,
    P.DOSAGE_READ,
  ],

  'WTP Supervisor': [
    P.CONSUMPTION_READ, P.CONSUMPTION_ACKNOWLEDGE,
    P.DOSAGE_READ, P.DOSAGE_CONFIGURE,
    P.WRITEOFF_RAISE, P.WRITEOFF_READ, P.WRITEOFF_APPROVE_MINOR,
    P.ALERTS_READ, P.ALERTS_ACKNOWLEDGE,
    P.REPORTS_VIEW,
  ],

  'Internal Auditor': [
    P.AUDIT_VIEW, P.AUDIT_VERIFY, P.AUDIT_EXPORT,
    P.REPORTS_VIEW,
    P.LEDGER_READ,
    P.STOCKCOUNT_READ,
    P.LOTS_READ, P.ITEMS_READ,
  ],
};

/** Look up permissions for the first matching role. */
export function getPermissionsForRoles(roles: string[]): string[] {
  const permSet = new Set<string>();
  for (const role of roles) {
    const perms = rolePermissions[role];
    if (perms) {
      for (const p of perms) permSet.add(p);
    }
  }
  return [...permSet];
}
