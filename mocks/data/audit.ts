import type { AuditEvent, VerifyChainResponse } from '@/lib/api/types/audit';

export const mockAuditEvents: AuditEvent[] = [
  {
    id: 'ae-001', eventId: 'EVT-2026-0001', eventType: 'GRN_SUBMITTED', entityType: 'GRN', entityId: 'grn-001',
    eventData: { grnNumber: 'GRN-2026-0001', bagsAccepted: 298 },
    actorId: '33333333-3333-3333-3333-333333333333', actorName: 'Ibrahim Musa', actorRole: 'StoreKeeper',
    deviceId: null, ipAddress: '10.0.1.50', storeId: 's1', timestamp: '2026-03-12T10:30:00Z',
    storeSequence: 1045, currentHash: 'a1b2c3d4e5f6',
  },
  {
    id: 'ae-002', eventId: 'EVT-2026-0002', eventType: 'LOT_CREATED', entityType: 'Lot', entityId: 'lot-001',
    eventData: { lotNumber: 'LOT-2026-0001', totalBags: 298 },
    actorId: '33333333-3333-3333-3333-333333333333', actorName: 'Ibrahim Musa', actorRole: 'StoreKeeper',
    deviceId: null, ipAddress: '10.0.1.50', storeId: 's1', timestamp: '2026-03-12T10:31:00Z',
    storeSequence: 1046, currentHash: 'b2c3d4e5f6a1',
  },
  {
    id: 'ae-003', eventId: 'EVT-2026-0003', eventType: 'LEDGER_ENTRY', entityType: 'LedgerEntry', entityId: 'le-001',
    eventData: { entryType: 'Receipt', quantityBags: 298, lotNumber: 'LOT-2026-0001' },
    actorId: '00000000-0000-0000-0000-000000000000', actorName: 'System', actorRole: 'System',
    deviceId: null, ipAddress: '10.0.1.1', storeId: 's1', timestamp: '2026-03-12T10:31:01Z',
    storeSequence: 1047, currentHash: 'c3d4e5f6a1b2',
  },
  {
    id: 'ae-004', eventId: 'EVT-2026-0004', eventType: 'STO_AUTHORISED', entityType: 'STO', entityId: 'sto-001',
    eventData: { stoNumber: 'STO-2026-0001', authorisedBags: 50 },
    actorId: '11111111-1111-1111-1111-111111111111', actorName: 'Admin User', actorRole: 'SystemAdmin',
    deviceId: null, ipAddress: '10.0.1.10', storeId: 's1', timestamp: '2026-03-08T14:00:00Z',
    storeSequence: 1030, currentHash: 'd4e5f6a1b2c3',
  },
  {
    id: 'ae-005', eventId: 'EVT-2026-0005', eventType: 'DISPATCH_COMPLETED', entityType: 'Dispatch', entityId: 'tdn-001',
    eventData: { stoNumber: 'STO-2026-0001', dispatchedBags: 50, tdnNumber: 'TDN-2026-0001' },
    actorId: '33333333-3333-3333-3333-333333333333', actorName: 'Ibrahim Musa', actorRole: 'StoreKeeper',
    deviceId: null, ipAddress: '10.0.1.50', storeId: 's1', timestamp: '2026-03-10T08:30:00Z',
    storeSequence: 1035, currentHash: 'e5f6a1b2c3d4',
  },
  {
    id: 'ae-006', eventId: 'EVT-2026-0006', eventType: 'RECEIPT_COMPLETED', entityType: 'Receipt', entityId: 'grd-001',
    eventData: { stoNumber: 'STO-2026-0001', receivedBags: 50, grdNumber: 'GRD-2026-0001' },
    actorId: '44444444-4444-4444-4444-444444444444', actorName: 'Amina Yusuf', actorRole: 'StoreKeeper',
    deviceId: null, ipAddress: '10.0.2.50', storeId: 's2', timestamp: '2026-03-10T14:00:00Z',
    storeSequence: 520, currentHash: 'f6a1b2c3d4e5',
  },
  {
    id: 'ae-007', eventId: 'EVT-2026-0007', eventType: 'CONSUMPTION_RECORDED', entityType: 'ConsumptionEntry', entityId: 'con-001',
    eventData: { consumptionNumber: 'CON-2026-0001', actualQtyKg: '55.0000' },
    actorId: '55555555-5555-5555-5555-555555555555', actorName: 'Abubakar Danjuma', actorRole: 'Operator',
    deviceId: 'DEV-CWTP-001', ipAddress: '10.0.3.10', storeId: 's4', timestamp: '2026-03-01T09:00:00Z',
    storeSequence: 210, currentHash: 'a1a2a3a4a5a6',
  },
  {
    id: 'ae-008', eventId: 'EVT-2026-0008', eventType: 'WRITEOFF_APPROVED', entityType: 'WriteOff', entityId: 'wo-001',
    eventData: { requestNumber: 'WO-2026-0001', bagsCount: 2, category: 'PhysicalDamage' },
    actorId: '11111111-1111-1111-1111-111111111111', actorName: 'Admin User', actorRole: 'SystemAdmin',
    deviceId: null, ipAddress: '10.0.1.10', storeId: 's1', timestamp: '2026-03-05T14:00:00Z',
    storeSequence: 1025, currentHash: 'b2b3b4b5b6b7',
  },
];

export const mockChainVerification: VerifyChainResponse = {
  verifiedAt: '2026-03-13T12:00:00Z',
  totalStores: 5,
  results: [
    { storeId: 's1', storeName: 'Central Store — Main', chainLength: 1047, isValid: true, firstEventAt: '2025-01-01T00:00:00Z', lastEventAt: '2026-03-12T10:31:01Z', lastSequence: 1047, lastHash: 'c3d4e5f6a1b2', brokenAtSequence: null, verificationDurationMs: 245 },
    { storeId: 's2', storeName: 'Challawa WTP Unit Store', chainLength: 520, isValid: true, firstEventAt: '2025-01-01T00:00:00Z', lastEventAt: '2026-03-10T14:00:00Z', lastSequence: 520, lastHash: 'f6a1b2c3d4e5', brokenAtSequence: null, verificationDurationMs: 120 },
    { storeId: 's3', storeName: 'Tamburawa WTP Unit Store', chainLength: 380, isValid: true, firstEventAt: '2025-01-01T00:00:00Z', lastEventAt: '2026-03-13T17:00:00Z', lastSequence: 380, lastHash: 'x1y2z3a4b5c6', brokenAtSequence: null, verificationDurationMs: 95 },
    { storeId: 's4', storeName: 'Challawa Treatment Plant', chainLength: 210, isValid: true, firstEventAt: '2025-06-01T00:00:00Z', lastEventAt: '2026-03-12T08:15:00Z', lastSequence: 210, lastHash: 'a1a2a3a4a5a6', brokenAtSequence: null, verificationDurationMs: 55 },
    { storeId: 's5', storeName: 'Tamburawa Treatment Plant', chainLength: 180, isValid: true, firstEventAt: '2025-06-01T00:00:00Z', lastEventAt: '2026-03-08T08:00:00Z', lastSequence: 180, lastHash: 'd1d2d3d4d5d6', brokenAtSequence: null, verificationDurationMs: 48 },
  ],
  overallValid: true,
};
