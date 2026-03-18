// All permission strings from the RBAC specification.
// Used by PermissionGuard and sidebar menu filtering.

export const Permissions = {
  // Supplier Management
  SUPPLIERS_CREATE: 'suppliers:create',
  SUPPLIERS_READ: 'suppliers:read',
  SUPPLIERS_APPROVE: 'suppliers:approve',

  // Purchase Requisition
  PR_CREATE: 'pr:create',
  PR_READ: 'pr:read',
  PR_APPROVE: 'pr:approve',

  // Purchase Order
  PO_CREATE: 'po:create',
  PO_READ: 'po:read',
  PO_APPROVE_MANAGER: 'po:approve:manager',
  PO_APPROVE_FINANCE: 'po:approve:finance',

  // Quality & Gate
  DVR_CREATE: 'dvr:create',
  DVR_READ: 'dvr:read',
  INSPECTION_SUBMIT: 'inspection:submit',
  INSPECTION_READ: 'inspection:read',

  // Weighbridge
  WEIGHBRIDGE_RECORD: 'weighbridge:record',
  WEIGHBRIDGE_READ: 'weighbridge:read',
  WEIGHBRIDGE_OVERRIDE: 'weighbridge:override',

  // Inventory
  GRN_CREATE: 'grn:create',
  GRN_READ: 'grn:read',
  LOTS_READ: 'lots:read',
  LABELS_PRINT: 'labels:print',
  ITEMS_READ: 'items:read',
  ITEMS_LABEL: 'items:label',
  ITEMS_PUTAWAY: 'items:putaway',
  LOCATIONS_READ: 'locations:read',
  LOCATIONS_MANAGE: 'locations:manage',
  LEDGER_READ: 'ledger:read',

  // Stock Count
  STOCKCOUNT_CREATE: 'stockcount:create',
  STOCKCOUNT_READ: 'stockcount:read',
  STOCKCOUNT_EXECUTE: 'stockcount:execute',
  STOCKCOUNT_APPROVE: 'stockcount:approve',

  // Distribution
  STO_CREATE: 'sto:create',
  STO_READ: 'sto:read',
  STO_APPROVE_CENTRAL_UNIT: 'sto:approve:central_unit',
  STO_APPROVE_UNIT_USER: 'sto:approve:unit_user',
  TRANSFER_DISPATCH: 'transfer:dispatch',
  TRANSFER_RECEIVE: 'transfer:receive',
  TRANSFER_READ: 'transfer:read',

  // Consumption
  CONSUMPTION_RECORD: 'consumption:record',
  CONSUMPTION_READ: 'consumption:read',
  CONSUMPTION_ACKNOWLEDGE: 'consumption:acknowledge',

  // Dosage
  DOSAGE_READ: 'dosage:read',
  DOSAGE_CONFIGURE: 'dosage:configure',

  // Write-Offs
  WRITEOFF_RAISE: 'writeoff:raise',
  WRITEOFF_READ: 'writeoff:read',
  WRITEOFF_APPROVE_MINOR: 'writeoff:approve:minor',
  WRITEOFF_APPROVE_SIGNIFICANT: 'writeoff:approve:significant',
  WRITEOFF_APPROVE_CRITICAL: 'writeoff:approve:critical',

  // Reports & Audit
  REPORTS_VIEW: 'reports:view',
  AUDIT_VIEW: 'audit:view',
  AUDIT_VERIFY: 'audit:verify',
  AUDIT_EXPORT: 'audit:export',

  // Alerts
  ALERTS_READ: 'alerts:read',
  ALERTS_ACKNOWLEDGE: 'alerts:acknowledge',
  ALERTS_CONFIGURE: 'alerts:configure',

  // Administration
  USERS_MANAGE: 'users:manage',
  SYSTEM_CONFIGURE: 'system:configure',
  DEVICES_MANAGE: 'devices:manage',

  // Biometric
  BIOMETRIC_ENROLL: 'biometric:enroll',
  BIOMETRIC_VERIFY: 'biometric:verify',
} as const;

export type Permission = (typeof Permissions)[keyof typeof Permissions];

// Check if user has a specific permission
export function hasPermission(
  userPermissions: string[],
  required: string | string[]
): boolean {
  if (typeof required === 'string') {
    return userPermissions.includes(required);
  }
  // Any of the required permissions
  return required.some((p) => userPermissions.includes(p));
}

// Check if user has ALL of the specified permissions
export function hasAllPermissions(
  userPermissions: string[],
  required: string[]
): boolean {
  return required.every((p) => userPermissions.includes(p));
}
