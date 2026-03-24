import type { ReceiptSession, ShortageReport } from '@/lib/api/types/distribution';

export const mockReceiptSessions: ReceiptSession[] = [
  {
    id: 'grd-001',
    grdNumber: 'GRD-2026-0001',
    tdnId: 'tdn-001',
    tdnNumber: 'TDN-2026-0001',
    stoId: 'sto-001',
    stoNumber: 'STO-2026-0001',
    sourceStoreName: 'Central Store — Main',
    expectedBags: 50,
    expectedItems: [
      { itemId: 'item-001', itemCode: 'ALUM-2026-0001-001', lotNumber: 'LOT-2026-0001', status: 'InTransit' },
      { itemId: 'item-002', itemCode: 'ALUM-2026-0001-002', lotNumber: 'LOT-2026-0001', status: 'InTransit' },
    ],
    receivedItems: [
      { itemId: 'item-001', itemCode: 'ALUM-2026-0001-001', condition: 'Good', scannedAt: '2026-03-10T14:00:00Z', damageNotes: null },
      { itemId: 'item-002', itemCode: 'ALUM-2026-0001-002', condition: 'Good', scannedAt: '2026-03-10T14:01:00Z', damageNotes: null },
    ],
    missingItems: [],
    scannedCount: 50,
    status: 'Completed',
    arrivalAt: '2026-03-10T13:30:00Z',
    createdAt: '2026-03-10T13:30:00Z',
  },
  {
    id: 'grd-002',
    grdNumber: 'GRD-2026-0002',
    tdnId: 'tdn-002',
    tdnNumber: 'TDN-2026-0002',
    stoId: 'sto-002',
    stoNumber: 'STO-2026-0002',
    sourceStoreName: 'Central Store — Main',
    expectedBags: 30,
    expectedItems: [
      { itemId: 'item-005', itemCode: 'ALUM-2026-0001-005', lotNumber: 'LOT-2026-0001', status: 'InTransit' },
    ],
    receivedItems: [],
    missingItems: [],
    scannedCount: 0,
    status: 'Receiving',
    arrivalAt: '2026-03-13T15:00:00Z',
    createdAt: '2026-03-13T15:00:00Z',
  },
];

export const mockShortageReport: ShortageReport = {
  grdNumber: 'GRD-2026-0002',
  tdnNumber: 'TDN-2026-0002',
  stoNumber: 'STO-2026-0002',
  sourceStoreName: 'Central Store — Main',
  destinationStoreName: 'Tamburawa WTP Unit Store',
  dispatchedBags: 30,
  receivedBags: 28,
  shortageBags: 2,
  missingItems: [
    { itemId: 'item-missing-1', itemCode: 'ALUM-2026-0001-029', lotNumber: 'LOT-2026-0001' },
    { itemId: 'item-missing-2', itemCode: 'ALUM-2026-0001-030', lotNumber: 'LOT-2026-0001' },
  ],
  investigationStatus: 'Open',
  investigationId: null,
  generatedAt: '2026-03-13T17:00:00Z',
};
