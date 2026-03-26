// Centralized status → Ant Design color/tag mapping for all enum values.
// Colors align with Ant Design Tag presets.

type ColorMap = Record<string, string>;

export const supplierStatusColors: ColorMap = {
  PendingApproval: 'orange',
  Active: 'green',
  Suspended: 'red',
  Deactivated: 'default',
  Rejected: 'red',
};

export const prStatusColors: ColorMap = {
  Draft: 'default',
  Submitted: 'blue',
  FinanceApproved: 'cyan',
  FinanceRejected: 'red',
  Approved: 'green',
  Rejected: 'red',
  ConvertedToPO: 'purple',
  Expired: 'default',
};

export const poStatusColors: ColorMap = {
  Draft: 'default',
  Submitted: 'blue',
  FinanceApproved: 'cyan',
  Issued: 'green',
  AwaitingDelivery: 'geekblue',
  PartiallyReceived: 'orange',
  FullyReceived: 'green',
  Closed: 'default',
  FinanceRejected: 'red',
  DirectorRejected: 'red',
  AmendmentPending: 'orange',
  Cancelled: 'default',
};

export const dvrStatusColors: ColorMap = {
  PendingPOMatch: 'orange',
  Active: 'blue',
  QualityCleared: 'green',
  QualityFailed: 'red',
};

export const inspectionResultColors: ColorMap = {
  Pass: 'green',
  Fail: 'red',
};

export const weighbridgeStatusColors: ColorMap = {
  InProgress: 'blue',
  Pass: 'green',
  Flagged: 'orange',
  OverrideApproved: 'cyan',
  Rejected: 'red',
};

export const grnStatusColors: ColorMap = {
  Draft: 'default',
  Accepted: 'green',
  PartiallyAccepted: 'orange',
};

export const lotStatusColors: ColorMap = {
  PendingLabelling: 'orange',
  Active: 'green',
  Depleted: 'default',
  Quarantined: 'red',
};

export const itemStatusColors: ColorMap = {
  PendingLabelling: 'orange',
  InStock: 'green',
  Reserved: 'blue',
  InTransit: 'geekblue',
  PartiallyConsumed: 'cyan',
  Consumed: 'default',
  Quarantined: 'red',
  Damaged: 'red',
  Lost: 'red',
  Returned: 'purple',
};

export const ledgerEntryTypeColors: ColorMap = {
  Receipt: 'green',
  Issue: 'blue',
  TransferReceipt: 'cyan',
  Consumption: 'orange',
  Adjustment: 'purple',
  WriteOff: 'red',
  SupplierReturn: 'magenta',
};

export const countStatusColors: ColorMap = {
  Open: 'default',
  InProgress: 'blue',
  PendingRecount: 'orange',
  PendingApproval: 'cyan',
  Approved: 'green',
  Closed: 'default',
};

export const stoStatusColors: ColorMap = {
  Draft: 'default',
  Submitted: 'blue',
  Authorised: 'cyan',
  InTransit: 'geekblue',
  PartiallyReceived: 'orange',
  FullyReceived: 'green',
  Closed: 'default',
  Rejected: 'red',
  Cancelled: 'default',
};

export const tdnStatusColors: ColorMap = {
  Generated: 'blue',
  InTransit: 'geekblue',
  Completed: 'green',
  ShortDelivery: 'orange',
  Investigating: 'red',
};

export const consumptionStatusColors: ColorMap = {
  Submitted: 'blue',
  Confirmed: 'green',
  PendingAcknowledgment: 'orange',
  Closed: 'default',
};

export const anomalyLevelColors: ColorMap = {
  Normal: 'green',
  LowConsumption: 'cyan',
  Elevated: 'orange',
  HighAnomaly: 'red',
  Unconfigured: 'default',
};

export const writeOffStatusColors: ColorMap = {
  Pending: 'orange',
  Approved: 'green',
  Rejected: 'red',
};

export const writeOffCategoryColors: ColorMap = {
  PhysicalDamage: 'red',
  QualityDegradation: 'orange',
  TransitLoss: 'blue',
  UnexplainedShortage: 'purple',
  SupplierReturn: 'magenta',
};

export const alertSeverityColors: ColorMap = {
  Info: 'blue',
  Warning: 'orange',
  Significant: 'red',
  Critical: 'magenta',
};

export const alertStatusColors: ColorMap = {
  Open: 'red',
  Acknowledged: 'orange',
  Closed: 'default',
};

export const varianceSeverityColors: ColorMap = {
  Minor: 'orange',
  Significant: 'red',
  Critical: 'magenta',
};

// Universal lookup: pass any status string and get a color
const allColorMaps: ColorMap = {
  ...supplierStatusColors,
  ...prStatusColors,
  ...poStatusColors,
  ...dvrStatusColors,
  ...weighbridgeStatusColors,
  ...grnStatusColors,
  ...lotStatusColors,
  ...itemStatusColors,
  ...countStatusColors,
  ...stoStatusColors,
  ...consumptionStatusColors,
  ...anomalyLevelColors,
  ...writeOffStatusColors,
  ...alertSeverityColors,
  ...alertStatusColors,
};

export function getStatusColor(status: string): string {
  return allColorMaps[status] || 'default';
}
