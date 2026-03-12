import type { UUID, Timestamp, Money, Weight, PaginationParams, DateRangeParams } from './common';
import type { PRStatus, PRTrigger, POStatus, AmendmentStatus } from './enums';

// ========================
// M2 — Purchase Requisition
// ========================

export interface PR {
  id: UUID;
  prNumber: string;
  triggerType: PRTrigger;
  status: PRStatus;
  storeId: UUID;
  storeName: string;
  requestedQuantity: number;
  requestedWeightKg: Weight;
  stockBalanceAtPr: number;
  justification: string;
  requestedDeliveryDate: string;
  raisedBy: UUID;
  raisedByName: string;
  raisedAt: Timestamp;
  approvedBy: UUID | null;
  approvedByName: string | null;
  approvedAt: Timestamp | null;
  rejectionReason: string | null;
  expiresAt: Timestamp | null;
  linkedPoId: UUID | null;
  linkedPoNumber: string | null;
  createdAt: Timestamp;
}

export interface PRListParams extends PaginationParams, DateRangeParams {
  status?: PRStatus;
  triggerType?: PRTrigger;
  storeId?: UUID;
}

export interface CreatePRRequest {
  storeId: UUID;
  requestedQuantity: number;
  requestedWeightKg: string;
  justification: string;
  requestedDeliveryDate: string;
}

export interface ApprovePRRequest {
  notes?: string;
}

export interface RejectPRRequest {
  rejectionReason: string;
}

// ========================
// M3 — Purchase Order
// ========================

export interface POLine {
  lineNumber: number;
  productSpecification: string;
  quantityBags: number;
  standardWeightKg: Weight;
  unitPrice: Money;
  lineTotal: Money;
}

export interface POAmendment {
  id: UUID;
  amendmentVersion: number;
  changes: Record<string, unknown>;
  originalValues: Record<string, unknown>;
  justification: string;
  status: AmendmentStatus;
  requestedBy: UUID;
  requestedAt: Timestamp;
  managerApprovedBy: UUID | null;
  managerApprovedAt: Timestamp | null;
  financeApprovedBy: UUID | null;
  financeApprovedAt: Timestamp | null;
}

export interface PO {
  id: UUID;
  poNumber: string;
  prId: UUID;
  prNumber: string;
  supplierId: UUID;
  supplierName: string;
  destinationStoreId: UUID;
  destinationStoreName: string;
  status: POStatus;
  currency: string;
  totalAmount: Money;
  expectedDeliveryDate: string;
  lines: POLine[];
  amendments: POAmendment[];
  requestedBy: UUID;
  requestedByName: string;
  requestedAt: Timestamp;
  managerApprovedBy: UUID | null;
  managerApprovedByName: string | null;
  managerApprovedAt: Timestamp | null;
  managerRejectionReason: string | null;
  financeApprovedBy: UUID | null;
  financeApprovedByName: string | null;
  financeApprovedAt: Timestamp | null;
  financeRejectionReason: string | null;
  issuedAt: Timestamp | null;
  createdAt: Timestamp;
}

export interface POListParams extends PaginationParams, DateRangeParams {
  status?: POStatus;
  supplierId?: UUID;
}

export interface CreatePOLine {
  lineNumber: number;
  productSpecification: string;
  quantityBags: number;
  standardWeightKg: string;
  unitPrice: string;
}

export interface CreatePORequest {
  prId: UUID;
  supplierId: UUID;
  destinationStoreId: UUID;
  expectedDeliveryDate: string;
  currency: string;
  notes?: string;
  lines: CreatePOLine[];
}

export interface ApproveManagerRequest {
  notes?: string;
}

export interface RejectManagerRequest {
  rejectionReason: string;
}

export interface ApproveFinanceRequest {
  notes?: string;
}

export interface RejectFinanceRequest {
  rejectionReason: string;
}

export interface CreateAmendmentRequest {
  changes: {
    quantityBags?: number;
    unitPrice?: string;
    expectedDeliveryDate?: string;
  };
  justification: string;
}
