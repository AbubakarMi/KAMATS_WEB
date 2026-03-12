import type { UUID, Timestamp, PaginationParams, DateRangeParams } from './common';
import type { DVRStatus, InspectionResult } from './enums';

// ========================
// M4 — Driver Visit Records
// ========================

export interface DVR {
  id: UUID;
  dvrNumber: string;
  driverName: string;
  driverIdNumber: string;
  driverPhone: string;
  vehicleReg: string;
  supplierId: UUID;
  supplierName: string;
  poId: UUID | null;
  poNumber: string | null;
  status: DVRStatus;
  gateOfficerId: UUID;
  gateOfficerName: string;
  createdAt: Timestamp;
}

export interface DVRListParams extends PaginationParams, DateRangeParams {
  status?: DVRStatus;
  poId?: UUID;
}

export interface CreateDVRRequest {
  driverName: string;
  driverIdNumber: string;
  driverPhone: string;
  vehicleReg: string;
  supplierId: UUID;
}

export interface LinkPORequest {
  poId: UUID;
}

export interface LinkPOResponse {
  id: UUID;
  dvrNumber: string;
  poId: UUID;
  poNumber: string;
  supplierId: UUID;
  supplierName: string;
  status: 'Active';
}

// ========================
// M4 — Quality Inspections
// ========================

export interface QualityInspection {
  id: UUID;
  inspectionNumber: string;
  dvrId: UUID;
  dvrNumber: string;
  poId: UUID;
  poNumber: string;
  bagsSampled: number;
  visualCheckNotes: string;
  physicalStateNotes: string;
  purityTestResult: string;
  result: InspectionResult | null;
  rejectionReason: string | null;
  photoUrls: string[];
  inspectorId: UUID;
  inspectorName: string;
  inspectedAt: Timestamp | null;
  completedAt: Timestamp | null;
  createdAt: Timestamp;
}

export interface CreateInspectionRequest {
  dvrId: UUID;
  poId: UUID;
  bagsSampled: number;
  visualCheckNotes: string;
  physicalStateNotes: string;
  purityTestResult: string;
}

export interface SubmitInspectionPassRequest {
  result: 'Pass';
  visualCheckNotes: string;
  physicalStateNotes: string;
  purityTestResult: string;
}

export interface SubmitInspectionFailRequest {
  result: 'Fail';
  rejectionReason: string;
  photoUrls: string[];
}

export type SubmitInspectionResultRequest =
  | SubmitInspectionPassRequest
  | SubmitInspectionFailRequest;
