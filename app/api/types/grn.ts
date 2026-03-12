import type { UUID, Timestamp, Weight, PaginationParams, DateRangeParams } from './common';
import type { GRNStatus } from './enums';

export interface GRN {
  id: UUID;
  grnNumber: string;
  poId: UUID;
  poNumber: string;
  weighbridgeTicketId: UUID;
  ticketNumber: string;
  dvrId: UUID;
  storeId: UUID;
  storeName: string;
  status: GRNStatus;
  bagsOnTruck: number | null;
  bagsDamaged: number | null;
  bagsAccepted: number | null;
  netWeightKg: Weight;
  conditionNotes: string | null;
  photoUrls: string[];
  crossReferenceWarning: string | null;
  receivedBy: UUID;
  receivedByName: string;
  witnessId: UUID;
  witnessName: string;
  receivedAt: Timestamp;
  submittedAt: Timestamp | null;
  lotCreated: {
    lotId: UUID;
    lotNumber: string;
    totalBags: number;
  } | null;
  createdAt: Timestamp;
}

export interface GRNListParams extends PaginationParams, DateRangeParams {
  status?: GRNStatus;
  poId?: UUID;
  storeId?: UUID;
}

export interface CreateGRNRequest {
  weighbridgeTicketId: UUID;
  witnessId: UUID;
}

export interface RecordCountRequest {
  bagsOnTruck: number;
  bagsDamaged: number;
  conditionNotes: string;
  photoUrls: string[];
}
