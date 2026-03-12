import type { UUID, Timestamp, Weight, PaginationParams, DateRangeParams } from './common';
import type { LedgerEntryType } from './enums';

// ========================
// M9 — Stock Ledger
// ========================

export interface LotBalance {
  lotId: UUID;
  lotNumber: string;
  supplierName: string;
  receiptDate: string;
  totalBags: number;
  bagsInStock: number;
  bagsReserved: number;
  bagsInTransit: number;
  weightKg: Weight;
}

export interface StockBalance {
  storeId: UUID;
  storeName: string;
  totalBags: number;
  totalWeightKg: Weight;
  reorderPoint: number;
  maxStockLevel: number;
  belowReorderPoint: boolean;
  balancesByLot: LotBalance[];
}

export interface LedgerEntry {
  id: UUID;
  entryNumber: string;
  entryType: LedgerEntryType;
  storeName: string;
  lotNumber: string;
  quantityBags: number;
  weightKg: Weight;
  balanceBefore: number;
  balanceAfter: number;
  referenceType: string;
  referenceNumber: string;
  notes: string | null;
  createdAt: Timestamp;
}

export interface LedgerEntryListParams extends PaginationParams, DateRangeParams {
  entryType?: LedgerEntryType;
  lotId?: UUID;
}

export interface BalanceDataPoint {
  date: string;
  balanceBags: number;
  balanceWeightKg: Weight;
  receipts: number;
  issues: number;
  consumption: number;
}

export interface BalanceHistory {
  storeId: UUID;
  storeName: string;
  dataPoints: BalanceDataPoint[];
}

export interface BalanceHistoryParams extends DateRangeParams {
  granularity?: 'daily' | 'weekly' | 'monthly';
}
