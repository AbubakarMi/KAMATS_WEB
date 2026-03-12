import type { UUID, Timestamp, PaginationParams } from './common';
import type { CountType, CountStatus, VarianceSeverity } from './enums';

export interface CountLine {
  lotId: UUID;
  lotNumber: string;
  locationId: UUID;
  locationCode: string;
  systemQty: number;
  countedQty: number | null;
  variance: number | null;
  variancePct: number | null;
}

export interface StockCount {
  id: UUID;
  countNumber: string;
  countType: CountType;
  storeId: UUID;
  storeName: string;
  locationIds: UUID[];
  status: CountStatus;
  frozenBalance: number;
  assignedTo: UUID;
  assignedToName: string;
  scheduledDate: string;
  totalVarianceBags: number | null;
  varianceSeverity: VarianceSeverity | null;
  lines: CountLine[];
  recountAssignedTo: UUID | null;
  recountAssignedToName: string | null;
  approvedBy: UUID | null;
  approvedAt: Timestamp | null;
  approvalNotes: string | null;
  rejectionReason: string | null;
  createdBy: UUID;
  createdAt: Timestamp;
}

export interface StockCountListParams extends PaginationParams {
  status?: CountStatus;
  storeId?: UUID;
  countType?: CountType;
}

export interface CreateStockCountRequest {
  countType: CountType;
  storeId: UUID;
  locationIds: UUID[];
  assignedTo: UUID;
  scheduledDate: string;
}

export interface SubmitCountLine {
  lotId: UUID;
  locationId: UUID;
  countedQty: number;
}

export interface SubmitCountResultRequest {
  lines: SubmitCountLine[];
}

export interface OrderRecountRequest {
  recountAssignedTo: UUID;
}

export interface ApproveVarianceRequest {
  approvalNotes: string;
  investigationReportId?: UUID;
}

export interface RejectVarianceRequest {
  rejectionReason: string;
}

export interface LedgerAdjustment {
  entryId: UUID;
  entryNumber: string;
  lotId: UUID;
  quantityBags: number;
}

export interface ApproveVarianceResponse {
  id: UUID;
  countNumber: string;
  status: 'Closed';
  approvedBy: UUID;
  approvedAt: Timestamp;
  ledgerAdjustments: LedgerAdjustment[];
}
