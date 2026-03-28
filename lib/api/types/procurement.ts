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
  expiresAt: Timestamp | null;
  // Creator (StoreKeeper)
  raisedBy: UUID;
  raisedByName: string | null;
  raisedAt: Timestamp;
  // Reviewer (Finance Officer)
  reviewedBy: UUID | null;
  reviewedByName: string | null;
  reviewedAt: Timestamp | null;
  reviewNotes: string | null;
  changeRequestReason: string | null;
  rejectionReason: string | null;
  // Approver (Admin)
  approvedBy: UUID | null;
  approvedByName: string | null;
  approvedAt: Timestamp | null;
  approvalNotes: string | null;
  // Linked PO
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

export interface UpdatePRRequest {
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
  financeApprovedBy: UUID | null;
  financeApprovedAt: Timestamp | null;
  directorApprovedBy: UUID | null;
  directorApprovedAt: Timestamp | null;
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
  financeApprovedBy: UUID | null;
  financeApprovedByName: string | null;
  financeApprovedAt: Timestamp | null;
  financeRejectionReason: string | null;
  directorApprovedBy: UUID | null;
  directorApprovedByName: string | null;
  directorApprovedAt: Timestamp | null;
  directorRejectionReason: string | null;
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

export interface UpdatePORequest {
  supplierId: UUID;
  destinationStoreId: UUID;
  expectedDeliveryDate: string;
  currency: string;
  notes?: string;
  lines: CreatePOLine[];
}

export interface ApproveFinanceRequest {
  notes?: string;
}

export interface RejectFinanceRequest {
  rejectionReason: string;
}

export interface ApproveDirectorRequest {
  notes?: string;
}

export interface RejectDirectorRequest {
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
