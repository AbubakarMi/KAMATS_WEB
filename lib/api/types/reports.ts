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

// Report 7 — Loss Summary (reuses LossSummary from loss.ts)
