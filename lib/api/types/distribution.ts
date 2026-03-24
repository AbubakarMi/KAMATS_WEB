import type { UUID, Timestamp, Weight, PaginationParams, DateRangeParams } from './common';
import type { STOStatus, STOTrigger, TDNStatus, DispatchStatus, BagCondition } from './enums';

// ========================
// M11 — Stock Transfer Order
// ========================

export interface STOItem {
  itemId: UUID;
  itemCode: string;
  lotNumber: string;
  status: string;
}

export interface STO {
  id: UUID;
  stoNumber: string;
  triggerType: STOTrigger;
  status: STOStatus;
  sourceStoreId: UUID;
  sourceStoreName: string;
  destinationStoreId: UUID;
  destinationStoreName: string;
  requestedBags: number;
  authorisedBags: number | null;
  requestedDelivery: string;
  notes: string | null;
  justification: string | null;
  preSelectedItems: STOItem[];
  requestedBy: UUID;
  requestedByName: string;
  requestedAt: Timestamp;
  authorisedBy: UUID | null;
  authorisedByName: string | null;
  authorisedAt: Timestamp | null;
  rejectionReason: string | null;
  sourceBalanceAtAuth: number | null;
  tdnId: UUID | null;
  tdnNumber: string | null;
  grdId: UUID | null;
  grdNumber: string | null;
  createdAt: Timestamp;
}

export interface STOListParams extends PaginationParams, DateRangeParams {
  status?: STOStatus;
  sourceStoreId?: UUID;
  destinationStoreId?: UUID;
}

export interface CreateSTORequest {
  sourceStoreId: UUID;
  destinationStoreId: UUID;
  requestedBags: number;
  requestedDelivery: string;
  notes?: string;
  justification: string;
}

export interface AuthoriseSTORequest {
  notes?: string;
}

export interface RejectSTORequest {
  rejectionReason: string;
}

export interface CancelSTORequest {
  reason: string;
}

// ========================
// M12 — Transfer Dispatch
// ========================

export interface DispatchSession {
  id: UUID;
  stoId: UUID;
  stoNumber: string;
  vehicleReg: string;
  driverName: string;
  driverPhone: string;
  expectedItems: STOItem[];
  scannedItems: {
    itemId: UUID;
    itemCode: string;
    scannedAt: Timestamp;
  }[];
  scannedCount: number;
  expectedCount: number;
  dispatchedWeightKg: Weight | null;
  expectedWeightKg: Weight | null;
  weightVariancePct: string | null;
  status: DispatchStatus;
  createdAt: Timestamp;
}

export interface DispatchListParams extends PaginationParams, DateRangeParams {
  status?: DispatchStatus;
  stoId?: UUID;
}

export interface CreateDispatchRequest {
  stoId: UUID;
  vehicleReg: string;
  driverName: string;
  driverPhone: string;
}

export interface ScanDispatchItemRequest {
  itemId?: UUID;
  qrCode?: string;
}

export interface ScanDispatchItemResponse {
  itemId: UUID;
  itemCode: string;
  scanAccepted: boolean;
  scannedCount: number;
  expectedCount: number;
  remaining: number;
  scannedAt: Timestamp;
}

export interface RecordDispatchWeightRequest {
  dispatchedWeightKg: string;
  weightSource: 'scale' | 'manual';
}

export interface ApproveShortShipmentRequest {
  reason: string;
  missingItemIds: UUID[];
}

export interface CompleteDispatchRequest {
  dispatcherPinToken: string;
  driverPin: string;
  expectedArrivalAt: Timestamp;
}

export interface CompleteDispatchResponse {
  dispatchId: UUID;
  tdnNumber: string;
  tdnId: UUID;
  stoNumber: string;
  dispatchedBags: number;
  dispatchedWeightKg: Weight;
  consignmentQr: string;
  departureAt: Timestamp;
  expectedArrivalAt: Timestamp;
  stoStatus: 'InTransit';
  itemsStatus: 'InTransit';
}

// ========================
// M13 — Transfer Receipt
// ========================

export interface ReceiptSession {
  id: UUID;
  grdNumber: string;
  tdnId: UUID;
  tdnNumber: string;
  stoId: UUID;
  stoNumber: string;
  sourceStoreName: string;
  expectedBags: number;
  expectedItems: STOItem[];
  receivedItems: {
    itemId: UUID;
    itemCode: string;
    condition: BagCondition;
    scannedAt: Timestamp;
    damageNotes: string | null;
  }[];
  missingItems: {
    itemId: UUID;
    itemCode: string;
  }[];
  scannedCount: number;
  arrivalAt: Timestamp;
  createdAt: Timestamp;
}

export interface CreateReceiptRequest {
  consignmentQr: string;
}

export interface ScanReceiptItemRequest {
  itemId?: UUID;
  qrCode?: string;
  condition: BagCondition;
}

export interface ScanReceiptItemResponse {
  itemId: UUID;
  itemCode: string;
  scanAccepted: boolean;
  condition: BagCondition;
  scannedCount: number;
  expectedCount: number;
  remaining: number;
  scannedAt: Timestamp;
}

export interface ReportDamageRequest {
  itemId: UUID;
  damageNotes: string;
  photoUrls?: string[];
}

export interface CompleteReceiptRequest {
  receiverPinToken: string;
  notes: string;
}

export interface CompleteReceiptResponse {
  id: UUID;
  grdNumber: string;
  tdnNumber: string;
  stoNumber: string;
  receivedBags: number;
  receivedWeightKg: Weight;
  shortageBags: number;
  excessBags: number;
  damagedBags: number;
  stoStatus: STOStatus;
  tdnStatus: TDNStatus;
  shortageReportGenerated: boolean;
  receivingOfficer: string;
  arrivalAt: Timestamp;
}

export interface ShortageReport {
  grdNumber: string;
  tdnNumber: string;
  stoNumber: string;
  sourceStoreName: string;
  destinationStoreName: string;
  dispatchedBags: number;
  receivedBags: number;
  shortageBags: number;
  missingItems: { itemId: UUID; itemCode: string; lotNumber: string }[];
  investigationStatus: string;
  investigationId: UUID | null;
  generatedAt: Timestamp;
}
