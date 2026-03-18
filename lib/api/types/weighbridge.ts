import type { UUID, Timestamp, Weight, Percentage, PaginationParams, DateRangeParams } from './common';
import type { WeighbridgeStatus } from './enums';

export interface WeighbridgeTicket {
  id: UUID;
  ticketNumber: string;
  poId: UUID;
  poNumber: string;
  dvrId: UUID;
  dvrNumber: string;
  supplierId: UUID;
  supplierName: string;
  driverName: string;
  driverIdNumber: string;
  vehicleReg: string;
  poQuantityKg: Weight;
  grossWeightKg: Weight | null;
  tareWeightKg: Weight | null;
  netWeightKg: Weight | null;
  variancePct: Percentage | null;
  grossWeightAt: Timestamp | null;
  tareWeightAt: Timestamp | null;
  grossManual: boolean | null;
  tareManual: boolean | null;
  status: WeighbridgeStatus;
  operatorId: UUID;
  operatorName: string;
  overrideBy: UUID | null;
  overrideReason: string | null;
  overrideAt: Timestamp | null;
  rejectionReason: string | null;
  createdAt: Timestamp;
}

export interface WeighbridgeListParams extends PaginationParams, DateRangeParams {
  status?: WeighbridgeStatus;
  poId?: UUID;
}

export interface CreateWeighbridgeTicketRequest {
  poId: UUID;
  dvrId: UUID;
}

export interface RecordGrossWeightRequest {
  grossWeightKg: string;
  grossManual: boolean;
  supervisorPinToken?: string;
}

export interface RecordTareWeightRequest {
  tareWeightKg: string;
  tareManual: boolean;
  supervisorPinToken?: string;
}

export interface OverrideWeighbridgeRequest {
  overrideReason: string;
}

export interface RejectWeighbridgeRequest {
  rejectionReason: string;
}
