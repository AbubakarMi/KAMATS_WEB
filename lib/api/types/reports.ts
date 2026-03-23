import type { UUID, Timestamp, Weight, Percentage, DateRangeParams } from './common';
import type { StoreTier } from './enums';

// Report 1 — Stock Balance Summary
export interface StoreStockSummary {
  storeId: UUID;
  storeName: string;
  tier: StoreTier;
  totalBags: number;
  totalWeightKg: Weight;
  reorderPoint: number;
  belowReorderPoint: boolean;
  lots: { lotNumber: string; bags: number; weightKg: Weight }[];
}

export interface StockSummaryReport {
  generatedAt: Timestamp;
  systemTotalBags: number;
  systemTotalWeightKg: Weight;
  stores: StoreStockSummary[];
}

export interface StockSummaryParams {
  storeId?: UUID;
  tier?: StoreTier;
}

// Report 2 — Lot Lifecycle
export interface LotLifecycleEvent {
  eventType: string;
  timestamp: Timestamp;
  description: string;
  actorName: string;
  storeName: string;
  quantity: number;
}

export interface LotLifecycleReport {
  lotNumber: string;
  poNumber: string;
  supplierName: string;
  grnNumber: string;
  receiptDate: string;
  totalBags: number;
  currentDistribution: Record<string, number>;
  events: LotLifecycleEvent[];
}

// Report 3 — Item Chain of Custody
export interface CustodyEvent {
  eventType: string;
  timestamp: Timestamp;
  actorName: string;
  storeName: string;
  locationCode: string | null;
  referenceNumber: string;
  details: string;
}

export interface ItemHistoryReport {
  itemCode: string;
  lotNumber: string;
  poNumber: string;
  supplierName: string;
  currentStatus: string;
  currentStoreName: string;
  currentLocationCode: string | null;
  chainOfCustody: CustodyEvent[];
}

// Report 4 — Consumption Analytics (cross-store)
export interface StoreConsumptionReport {
  storeId: UUID;
  storeName: string;
  totalVolumeM3: string;
  totalConsumedKg: Weight;
  avgRateKgM3: string;
  configuredRate: string;
  anomalyCount: number;
  anomalyRatePct: Percentage;
}

export interface ConsumptionAnalyticsReport {
  period: { from: string; to: string };
  stores: StoreConsumptionReport[];
}

// Report 5 — Transfer Reconciliation
export interface TransferReconciliationEntry {
  stoNumber: string;
  sourceStore: string;
  destinationStore: string;
  dispatchedBags: number;
  receivedBags: number;
  shortageBags: number;
  excessBags: number;
  damagedBags: number;
  tdnStatus: string;
  investigationStatus: string | null;
}

export interface TransferReconciliationReport {
  period: { from: string; to: string };
  transfers: TransferReconciliationEntry[];
}

export interface TransferReconciliationParams extends DateRangeParams {
  storeId?: UUID;
  status?: string;
}

// Report 6 — Supplier Performance
export interface SupplierPerformanceEntry {
  supplierId: UUID;
  supplierName: string;
  totalDeliveries: number;
  onTimeRate: Percentage;
  quantityAccuracy: Percentage;
  qualityAcceptance: Percentage;
  avgScore: Percentage;
}

export interface SupplierPerformanceReport {
  period: { from: string; to: string };
  suppliers: SupplierPerformanceEntry[];
}

// Report 8 — Stock Movement Summary
export interface StockMovementEntry {
  date: string;
  movementType: string;
  referenceNumber: string;
  storeName: string;
  bags: number;
  weightKg: Weight;
  direction: 'in' | 'out';
  notes: string | null;
}

export interface StockMovementSummaryReport {
  period: { from: string; to: string };
  totalReceived: number;
  totalIssued: number;
  totalTransferred: number;
  movements: StockMovementEntry[];
}

// Report 9 — Anomaly History
export interface AnomalyEntry {
  id: UUID;
  timestamp: Timestamp;
  storeName: string;
  referenceNumber: string;
  volumeM3: string;
  consumedKg: Weight;
  rateKgM3: string;
  configuredRate: string;
  deviationPct: Percentage;
  anomalyLevel: string;
  resolved: boolean;
  resolution: string | null;
}

export interface AnomalyHistoryReport {
  period: { from: string; to: string };
  totalAnomalies: number;
  resolvedCount: number;
  unresolvedCount: number;
  entries: AnomalyEntry[];
}

// Report 10 — Physical Count Results
export interface CountResultEntry {
  countId: UUID;
  storeName: string;
  countDate: string;
  countType: string;
  totalItems: number;
  matchedItems: number;
  varianceItems: number;
  variancePct: Percentage;
  status: string;
}

export interface PhysicalCountResultsReport {
  period: { from: string; to: string };
  totalCounts: number;
  avgVariancePct: Percentage;
  entries: CountResultEntry[];
}

// Report 11 — Procurement Pipeline
export interface PipelineEntry {
  type: string;
  referenceNumber: string;
  status: string;
  storeName: string;
  quantityBags: number;
  expectedDate: string;
  daysInStatus: number;
  assignedTo: string | null;
}

export interface ProcurementPipelineReport {
  openPRs: number;
  pendingPOs: number;
  expectedDeliveries: number;
  entries: PipelineEntry[];
}

// Report 12 — Loss Summary (reuses LossSummary from loss.ts)
