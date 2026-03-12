import type { UUID, Timestamp, PaginationParams, DateRangeParams, Percentage } from './common';
import type { SupplierStatus } from './enums';

export interface Supplier {
  id: UUID;
  name: string;
  registrationNumber: string;
  address: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  taxId: string;
  status: SupplierStatus;
  deliveryCount: number;
  onTimeDeliveryRate: Percentage;
  quantityAccuracyRate: Percentage;
  qualityAcceptanceRate: Percentage;
  createdAt: Timestamp;
  createdBy: UUID;
  approvedBy?: UUID;
  approvedAt?: Timestamp;
  rejectionReason?: string;
  suspensionReason?: string;
}

export interface SupplierListParams extends PaginationParams {
  status?: SupplierStatus;
  search?: string;
}

export interface CreateSupplierRequest {
  name: string;
  registrationNumber: string;
  address: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  taxId: string;
}

export interface ApproveSupplierResponse {
  id: UUID;
  name: string;
  status: 'Active';
  approvedBy: UUID;
  approvedAt: Timestamp;
}

export interface RejectSupplierRequest {
  rejectionReason: string;
}

export interface SuspendSupplierRequest {
  reason: string;
}

export interface SuspendSupplierResponse {
  id: UUID;
  status: 'Suspended';
  pendingPoCount: number;
  pendingPosFlagged: boolean;
}

export interface DeactivateSupplierRequest {
  reason: string;
}

export interface ReactivateSupplierRequest {
  reason?: string;
}

// --- Scorecard ---
export interface SupplierScorecardParams extends DateRangeParams {}

export interface DeliveryScorecard {
  deliveryId: UUID;
  poNumber: string;
  deliveryDate: string;
  onTime: boolean;
  quantityVariancePct: Percentage;
  qualityPassed: boolean;
}

export interface SupplierScorecard {
  overall: {
    totalDeliveries: number;
    onTimeDeliveryRate: Percentage;
    quantityAccuracyRate: Percentage;
    qualityAcceptanceRate: Percentage;
  };
  deliveries: DeliveryScorecard[];
}
