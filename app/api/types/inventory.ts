import type { UUID, Timestamp, Weight, PaginationParams, DateRangeParams } from './common';
import type { LotStatus, ItemStatus } from './enums';

// ========================
// M7 — Lots
// ========================

export interface Lot {
  id: UUID;
  lotNumber: string;
  grnNumber: string;
  poNumber: string;
  supplierName: string;
  storeId: UUID;
  storeName: string;
  receiptDate: string;
  standardWeightKg: Weight;
  totalBags: number;
  bagsInStock: number;
  bagsReserved: number;
  bagsInTransit: number;
  bagsConsumed: number;
  bagsWrittenOff: number;
  fifoSequence: number;
  status: LotStatus;
  createdAt: Timestamp;
}

export interface LotListParams extends PaginationParams, DateRangeParams {
  storeId?: UUID;
  status?: LotStatus;
  supplierId?: UUID;
}

export interface LotDetail extends Lot {
  items: Item[];
}

export interface GenerateLabelsRequest {
  printerId?: string;
  format?: 'pdf' | 'zpl';
}

export interface GenerateLabelsResponse {
  lotId: UUID;
  lotNumber: string;
  totalLabels: number;
  printJobId: string;
  labelFileUrl: string;
  generatedAt: Timestamp;
}

// ========================
// M7 — Items
// ========================

export interface Item {
  id: UUID;
  itemCode: string;
  qrCode: string;
  lotId: UUID;
  lotNumber: string;
  status: ItemStatus;
  currentStoreId: UUID;
  currentStoreName: string;
  locationCode: string | null;
  standardWeightKg: Weight;
  remainingWeightKg: Weight;
  poNumber: string;
  supplierName: string;
  receiptDate: string;
  labelledAt: Timestamp | null;
  labelledBy: UUID | null;
  createdAt: Timestamp;
}

export interface ScanLabelRequest {
  scannedQrCode: string;
}

export interface ScanLabelResponse {
  id: UUID;
  itemCode: string;
  status: 'InStock';
  labelledAt: Timestamp;
  labelledBy: UUID;
  lotId: UUID;
  lotBagsLabelled: number;
  lotTotalBags: number;
}

export interface LifecycleEvent {
  eventType: string;
  timestamp: Timestamp;
  actorName: string;
  storeName: string;
  referenceNumber: string;
  details: string;
}

export interface ItemLifecycle {
  itemId: UUID;
  itemCode: string;
  lotNumber: string;
  poNumber: string;
  supplierName: string;
  events: LifecycleEvent[];
}

// ========================
// M8 — Warehouse Locations
// ========================

export interface StorageLocation {
  id: UUID;
  storeId: UUID;
  storeName: string;
  locationCode: string;
  zone: string;
  row: string;
  position: string;
  maxCapacityKg: Weight;
  currentBags: number;
  currentWeightKg: Weight;
  isActive: boolean;
}

export interface StorageLocationListParams {
  storeId?: UUID;
  zone?: string;
  isActive?: boolean;
}

export interface CreateLocationRequest {
  storeId: UUID;
  locationCode: string;
  zone: string;
  row: string;
  position: string;
  maxCapacityKg: string;
}

export interface UpdateLocationRequest {
  zone?: string;
  row?: string;
  position?: string;
  maxCapacityKg?: string;
  isActive?: boolean;
}

export interface LocationContents {
  locationId: UUID;
  locationCode: string;
  zone: string;
  maxCapacityKg: Weight;
  currentBags: number;
  currentWeightKg: Weight;
  utilizationPct: number;
  lots: { lotId: UUID; lotNumber: string; bags: number }[];
  items: Item[];
}

export interface WarehouseZone {
  zone: string;
  locations: (StorageLocation & { utilizationPct: number })[];
}

export interface WarehouseMap {
  storeId: UUID;
  storeName: string;
  totalLocations: number;
  occupiedLocations: number;
  totalCapacityKg: Weight;
  currentWeightKg: Weight;
  utilizationPct: number;
  zones: WarehouseZone[];
}

export interface PutAwayRequest {
  locationId: UUID;
  overrideReason?: string;
}

export interface PutAwayResponse {
  id: UUID;
  itemCode: string;
  locationId: UUID;
  locationCode: string;
  putAwayAt: Timestamp;
  putAwayBy: UUID;
  wasOverride: boolean;
}

export interface InternalTransferRequest {
  itemIds: UUID[];
  fromLocationId: UUID;
  toLocationId: UUID;
  reason: string;
}

export interface InternalTransferResponse {
  id: UUID;
  itemsMoved: number;
  fromLocationCode: string;
  toLocationCode: string;
  reason: string;
  movedBy: UUID;
  movedAt: Timestamp;
}
