/**
 * Available system roles — mirrors KAMATS.Core.Constants.Roles.
 * Used for role assignment UI on user create/edit pages.
 */
export const AVAILABLE_ROLES = [
  { value: 'SystemAdmin', label: 'System Administrator' },
  { value: 'Director', label: 'Director' },
  { value: 'OperationsManager', label: 'Operations Manager' },
  { value: 'FinanceOfficer', label: 'Finance Officer' },
  { value: 'ProcurementOfficer', label: 'Procurement Officer' },
  { value: 'ProcurementManager', label: 'Procurement Manager' },
  { value: 'AuditOfficer', label: 'Audit Officer' },
  { value: 'CentralStoreKeeper', label: 'Central Store Keeper' },
  { value: 'CentralStoreManager', label: 'Central Store Manager' },
  { value: 'UnitStoreKeeper', label: 'Unit Store Keeper' },
  { value: 'UnitStoreManager', label: 'Unit Store Manager' },
  { value: 'QualityInspector', label: 'Quality Inspector' },
  { value: 'WeighbridgeOperator', label: 'Weighbridge Operator' },
  { value: 'GateSecurityOfficer', label: 'Gate Security Officer' },
  { value: 'PlantOperator', label: 'Plant Operator' },
  { value: 'PlantSupervisor', label: 'Plant Supervisor' },
  { value: 'DistributionOfficer', label: 'Distribution Officer' },
  { value: 'TransportManager', label: 'Transport Manager' },
  { value: 'DataAnalyst', label: 'Data Analyst' },
] as const;
