import type { UUID, Timestamp, Weight, Money, Percentage, PaginationParams, DateRangeParams } from './common';
import type { WriteOffCategory, WriteOffStatus, ReturnOrderStatus } from './enums';

// ========================
// M16 — Write-Offs
// ========================

export interface WriteOff {
  id: UUID;
  requestNumber: string;
  storeId: UUID;
  storeName: string;
  category: WriteOffCategory;
  bagsCount: number;
  weightKg: Weight;
  description: string;
  photoUrls: string[];
  itemIds: UUID[];
  lotId: UUID;
  status: WriteOffStatus;
  approvalRoute: string;
  raisedBy: UUID;
  raisedByName: string;
  raisedAt: Timestamp;
  approvedBy: UUID | null;
  approvedByName: string | null;
  approvedAt: Timestamp | null;
  approvalNotes: string | null;
  rejectionReason: string | null;
  investigationReportId: UUID | null;
  createdAt: Timestamp;
}

export interface WriteOffListParams extends PaginationParams, DateRangeParams {
  status?: WriteOffStatus;
  category?: WriteOffCategory;
  storeId?: UUID;
}

export interface CreateWriteOffRequest {
  storeId: UUID;
  category: WriteOffCategory;
  bagsCount: number;
  weightKg: string;
  description: string;
  itemIds: UUID[];
  lotId: UUID;
}

export interface ApproveWriteOffRequest {
  approvalNotes: string;
  investigationReportId?: UUID;
}

export interface RejectWriteOffRequest {
  rejectionReason: string;
}

export interface LedgerWriteOffEntry {
  entryId: UUID;
  entryNumber: string;
  lotId: UUID;
  quantityBags: number;
}

export interface ApproveWriteOffResponse {
  id: UUID;
  requestNumber: string;
  status: 'Approved';
  approvedBy: UUID;
  approvedAt: Timestamp;
  ledgerEntries: LedgerWriteOffEntry[];
}

// --- Loss Summary ---
export interface LossCategoryBreakdown {
  category: WriteOffCategory;
  count: number;
  totalBags: number;
  totalWeightKg: Weight;
}

export interface StoreLossSummary {
  storeId: UUID;
  storeName: string;
  totalBags: number;
  totalWeightKg: Weight;
  lossRatePct: Percentage;
}

export interface MonthlyLossTrend {
  month: string;
  totalBags: number;
  totalWeightKg: Weight;
  lossRatePct: Percentage;
}

export interface LossSummary {
  period: { from: string; to: string };
  totalWriteOffs: number;
  totalBags: number;
  totalWeightKg: Weight;
  lossRatePct: Percentage;
  byCategory: LossCategoryBreakdown[];
  byStore: StoreLossSummary[];
  monthlyTrend: MonthlyLossTrend[];
}

export interface LossSummaryParams extends DateRangeParams {
  storeId?: UUID;
}

// ========================
// Return Orders
// ========================

export interface ReturnOrder {
  id: UUID;
  returnNumber: string;
  writeoffId: UUID;
  supplierId: UUID;
  supplierName: string;
  poId: UUID;
  poNumber: string;
  bagsCount: number;
  weightKg: Weight;
  status: ReturnOrderStatus;
  notes: string | null;
  shippedAt: Timestamp | null;
  creditAmount: Money | null;
  creditReference: string | null;
  creditReceivedAt: Timestamp | null;
  createdBy: UUID;
  createdAt: Timestamp;
}

export interface CreateReturnOrderRequest {
  writeoffId: UUID;
  supplierId: UUID;
  poId: UUID;
  bagsCount: number;
  weightKg: string;
  notes?: string;
}

export interface ShipReturnOrderRequest {
  shippedAt: string;
  vehicleReg: string;
  notes?: string;
}

export interface ConfirmCreditRequest {
  creditAmount: string;
  creditReference: string;
  notes?: string;
}
