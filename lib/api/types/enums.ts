// All enum types matching PostgreSQL ENUM types exactly.
// Pattern: const object for values + union type for type safety.

export const StoreTier = {
  CentralStore: 'CentralStore',
  UnitStore: 'UnitStore',
  UserStore: 'UserStore',
} as const;
export type StoreTier = (typeof StoreTier)[keyof typeof StoreTier];

export const SupplierStatus = {
  PendingApproval: 'PendingApproval',
  Active: 'Active',
  Suspended: 'Suspended',
  Deactivated: 'Deactivated',
  Rejected: 'Rejected',
} as const;
export type SupplierStatus = (typeof SupplierStatus)[keyof typeof SupplierStatus];

export const PRStatus = {
  Draft: 'Draft',
  Submitted: 'Submitted',
  FinanceApproved: 'FinanceApproved',
  FinanceRejected: 'FinanceRejected',
  Approved: 'Approved',
  Rejected: 'Rejected',
  ConvertedToPO: 'ConvertedToPO',
  Expired: 'Expired',
} as const;
export type PRStatus = (typeof PRStatus)[keyof typeof PRStatus];

export const PRTrigger = {
  AutoReorderPoint: 'AutoReorderPoint',
  Manual: 'Manual',
} as const;
export type PRTrigger = (typeof PRTrigger)[keyof typeof PRTrigger];

export const POStatus = {
  Draft: 'Draft',
  Submitted: 'Submitted',
  FinanceApproved: 'FinanceApproved',
  Issued: 'Issued',
  AwaitingDelivery: 'AwaitingDelivery',
  PartiallyReceived: 'PartiallyReceived',
  FullyReceived: 'FullyReceived',
  Closed: 'Closed',
  FinanceRejected: 'FinanceRejected',
  DirectorRejected: 'DirectorRejected',
  AmendmentPending: 'AmendmentPending',
  Cancelled: 'Cancelled',
} as const;
export type POStatus = (typeof POStatus)[keyof typeof POStatus];

export const DVRStatus = {
  PendingPOMatch: 'PendingPOMatch',
  Active: 'Active',
  QualityCleared: 'QualityCleared',
  QualityFailed: 'QualityFailed',
} as const;
export type DVRStatus = (typeof DVRStatus)[keyof typeof DVRStatus];

export const InspectionResult = {
  Pass: 'Pass',
  Fail: 'Fail',
} as const;
export type InspectionResult = (typeof InspectionResult)[keyof typeof InspectionResult];

export const WeighbridgeStatus = {
  InProgress: 'InProgress',
  Pass: 'Pass',
  Flagged: 'Flagged',
  OverrideApproved: 'OverrideApproved',
  Rejected: 'Rejected',
} as const;
export type WeighbridgeStatus = (typeof WeighbridgeStatus)[keyof typeof WeighbridgeStatus];

export const GRNStatus = {
  Draft: 'Draft',
  Accepted: 'Accepted',
  PartiallyAccepted: 'PartiallyAccepted',
} as const;
export type GRNStatus = (typeof GRNStatus)[keyof typeof GRNStatus];

export const LotStatus = {
  PendingLabelling: 'PendingLabelling',
  Active: 'Active',
  Depleted: 'Depleted',
  Quarantined: 'Quarantined',
} as const;
export type LotStatus = (typeof LotStatus)[keyof typeof LotStatus];

export const ItemStatus = {
  PendingLabelling: 'PendingLabelling',
  InStock: 'InStock',
  Reserved: 'Reserved',
  InTransit: 'InTransit',
  PartiallyConsumed: 'PartiallyConsumed',
  Consumed: 'Consumed',
  Quarantined: 'Quarantined',
  Damaged: 'Damaged',
  Lost: 'Lost',
  Returned: 'Returned',
} as const;
export type ItemStatus = (typeof ItemStatus)[keyof typeof ItemStatus];

export const LedgerEntryType = {
  Receipt: 'Receipt',
  Issue: 'Issue',
  TransferReceipt: 'TransferReceipt',
  Consumption: 'Consumption',
  Adjustment: 'Adjustment',
  WriteOff: 'WriteOff',
  SupplierReturn: 'SupplierReturn',
} as const;
export type LedgerEntryType = (typeof LedgerEntryType)[keyof typeof LedgerEntryType];

export const CountType = {
  CycleCount: 'CycleCount',
  FullCount: 'FullCount',
  SpotCount: 'SpotCount',
} as const;
export type CountType = (typeof CountType)[keyof typeof CountType];

export const CountStatus = {
  Open: 'Open',
  InProgress: 'InProgress',
  PendingRecount: 'PendingRecount',
  PendingApproval: 'PendingApproval',
  Approved: 'Approved',
  Closed: 'Closed',
} as const;
export type CountStatus = (typeof CountStatus)[keyof typeof CountStatus];

export const STOStatus = {
  Draft: 'Draft',
  Submitted: 'Submitted',
  Authorised: 'Authorised',
  InTransit: 'InTransit',
  PartiallyReceived: 'PartiallyReceived',
  FullyReceived: 'FullyReceived',
  Closed: 'Closed',
  Rejected: 'Rejected',
  Cancelled: 'Cancelled',
} as const;
export type STOStatus = (typeof STOStatus)[keyof typeof STOStatus];

export const STOTrigger = {
  AutoReorderPoint: 'AutoReorderPoint',
  ManualRequest: 'ManualRequest',
} as const;
export type STOTrigger = (typeof STOTrigger)[keyof typeof STOTrigger];

export const DispatchStatus = {
  Scanning: 'Scanning',
  WeightRecorded: 'WeightRecorded',
  ShortApproved: 'ShortApproved',
  Completed: 'Completed',
  InTransit: 'InTransit',
} as const;
export type DispatchStatus = (typeof DispatchStatus)[keyof typeof DispatchStatus];

export const ReceiptStatus = {
  Receiving: 'Receiving',
  Completed: 'Completed',
  ShortageReported: 'ShortageReported',
} as const;
export type ReceiptStatus = (typeof ReceiptStatus)[keyof typeof ReceiptStatus];

export const TDNStatus = {
  Generated: 'Generated',
  InTransit: 'InTransit',
  Completed: 'Completed',
  ShortDelivery: 'ShortDelivery',
  Investigating: 'Investigating',
} as const;
export type TDNStatus = (typeof TDNStatus)[keyof typeof TDNStatus];

export const ConsumptionStatus = {
  Submitted: 'Submitted',
  Confirmed: 'Confirmed',
  PendingAcknowledgment: 'PendingAcknowledgment',
  Closed: 'Closed',
} as const;
export type ConsumptionStatus = (typeof ConsumptionStatus)[keyof typeof ConsumptionStatus];

export const AnomalyLevel = {
  Normal: 'Normal',
  LowConsumption: 'LowConsumption',
  Elevated: 'Elevated',
  HighAnomaly: 'HighAnomaly',
  Unconfigured: 'Unconfigured',
} as const;
export type AnomalyLevel = (typeof AnomalyLevel)[keyof typeof AnomalyLevel];

export const WriteOffCategory = {
  PhysicalDamage: 'PhysicalDamage',
  QualityDegradation: 'QualityDegradation',
  TransitLoss: 'TransitLoss',
  UnexplainedShortage: 'UnexplainedShortage',
  SupplierReturn: 'SupplierReturn',
} as const;
export type WriteOffCategory = (typeof WriteOffCategory)[keyof typeof WriteOffCategory];

export const WriteOffStatus = {
  Pending: 'Pending',
  Approved: 'Approved',
  Rejected: 'Rejected',
} as const;
export type WriteOffStatus = (typeof WriteOffStatus)[keyof typeof WriteOffStatus];

export const AlertSeverity = {
  Info: 'Info',
  Warning: 'Warning',
  Significant: 'Significant',
  Critical: 'Critical',
} as const;
export type AlertSeverity = (typeof AlertSeverity)[keyof typeof AlertSeverity];

export const AlertStatus = {
  Open: 'Open',
  Acknowledged: 'Acknowledged',
  Closed: 'Closed',
} as const;
export type AlertStatus = (typeof AlertStatus)[keyof typeof AlertStatus];

export const NotificationChannel = {
  InApp: 'InApp',
  SMS: 'SMS',
  Email: 'Email',
} as const;
export type NotificationChannel = (typeof NotificationChannel)[keyof typeof NotificationChannel];

export const NotificationStatus = {
  Pending: 'Pending',
  Sent: 'Sent',
  Failed: 'Failed',
  Retrying: 'Retrying',
} as const;
export type NotificationStatus = (typeof NotificationStatus)[keyof typeof NotificationStatus];

export const InvestigationStatus = {
  Open: 'Open',
  InProgress: 'InProgress',
  Closed: 'Closed',
  Escalated: 'Escalated',
} as const;
export type InvestigationStatus = (typeof InvestigationStatus)[keyof typeof InvestigationStatus];

export const ReturnOrderStatus = {
  Draft: 'Draft',
  Shipped: 'Shipped',
  CreditReceived: 'CreditReceived',
  Closed: 'Closed',
} as const;
export type ReturnOrderStatus = (typeof ReturnOrderStatus)[keyof typeof ReturnOrderStatus];

export const SeasonType = {
  Dry: 'Dry',
  Wet: 'Wet',
  Transition: 'Transition',
} as const;
export type SeasonType = (typeof SeasonType)[keyof typeof SeasonType];

export const BagCondition = {
  Good: 'Good',
  Damaged: 'Damaged',
} as const;
export type BagCondition = (typeof BagCondition)[keyof typeof BagCondition];

export const VarianceSeverity = {
  Minor: 'Minor',
  Significant: 'Significant',
  Critical: 'Critical',
} as const;
export type VarianceSeverity = (typeof VarianceSeverity)[keyof typeof VarianceSeverity];

export const AmendmentStatus = {
  PendingFinanceApproval: 'PendingFinanceApproval',
  PendingDirectorApproval: 'PendingDirectorApproval',
  Applied: 'Applied',
  Rejected: 'Rejected',
} as const;
export type AmendmentStatus = (typeof AmendmentStatus)[keyof typeof AmendmentStatus];
