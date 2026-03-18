import type { UUID, Timestamp, PaginationParams, DateRangeParams } from './common';

export interface AuditEvent {
  id: UUID;
  eventId: string;
  eventType: string;
  entityType: string;
  entityId: UUID;
  eventData: Record<string, unknown>;
  actorId: UUID;
  actorName: string;
  actorRole: string;
  deviceId: string | null;
  ipAddress: string;
  storeId: UUID | null;
  timestamp: Timestamp;
  storeSequence: number;
  currentHash: string;
}

export interface AuditEventListParams extends PaginationParams, DateRangeParams {
  entityType?: string;
  entityId?: UUID;
  eventType?: string;
  actorId?: UUID;
  storeId?: UUID;
}

export interface StoreChainResult {
  storeId: UUID;
  storeName: string;
  chainLength: number;
  isValid: boolean;
  firstEventAt: Timestamp;
  lastEventAt: Timestamp;
  lastSequence: number;
  lastHash: string;
  brokenAtSequence: number | null;
  verificationDurationMs: number;
}

export interface VerifyChainResponse {
  verifiedAt: Timestamp;
  totalStores: number;
  results: StoreChainResult[];
  overallValid: boolean;
}

export interface AuditExportParams extends DateRangeParams {
  format: 'json' | 'csv';
  entityType?: string;
  storeId?: UUID;
}
