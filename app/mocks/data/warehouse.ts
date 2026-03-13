import type { StorageLocation, WarehouseMap, LocationContents } from '~/api/types/inventory';

export const mockLocations: StorageLocation[] = [
  // Zone A — Bulk Storage
  { id: 'loc-001', storeId: 's1', storeName: 'Central Store — Main', locationCode: 'A-01-01', zone: 'A', row: '01', position: '01', maxCapacityKg: '5000.0000', currentBags: 80, currentWeightKg: '4000.0000', isActive: true },
  { id: 'loc-002', storeId: 's1', storeName: 'Central Store — Main', locationCode: 'A-01-02', zone: 'A', row: '01', position: '02', maxCapacityKg: '5000.0000', currentBags: 60, currentWeightKg: '3000.0000', isActive: true },
  { id: 'loc-003', storeId: 's1', storeName: 'Central Store — Main', locationCode: 'A-02-01', zone: 'A', row: '02', position: '01', maxCapacityKg: '5000.0000', currentBags: 45, currentWeightKg: '2250.0000', isActive: true },
  { id: 'loc-004', storeId: 's1', storeName: 'Central Store — Main', locationCode: 'A-02-02', zone: 'A', row: '02', position: '02', maxCapacityKg: '5000.0000', currentBags: 0, currentWeightKg: '0.0000', isActive: true },
  { id: 'loc-005', storeId: 's1', storeName: 'Central Store — Main', locationCode: 'A-03-01', zone: 'A', row: '03', position: '01', maxCapacityKg: '5000.0000', currentBags: 95, currentWeightKg: '4750.0000', isActive: true },
  // Zone B — Quarantine
  { id: 'loc-006', storeId: 's1', storeName: 'Central Store — Main', locationCode: 'B-01-01', zone: 'B', row: '01', position: '01', maxCapacityKg: '3000.0000', currentBags: 20, currentWeightKg: '1000.0000', isActive: true },
  { id: 'loc-007', storeId: 's1', storeName: 'Central Store — Main', locationCode: 'B-01-02', zone: 'B', row: '01', position: '02', maxCapacityKg: '3000.0000', currentBags: 0, currentWeightKg: '0.0000', isActive: true },
  // Zone C — Staging
  { id: 'loc-008', storeId: 's1', storeName: 'Central Store — Main', locationCode: 'C-01-01', zone: 'C', row: '01', position: '01', maxCapacityKg: '2000.0000', currentBags: 10, currentWeightKg: '500.0000', isActive: true },
  { id: 'loc-009', storeId: 's1', storeName: 'Central Store — Main', locationCode: 'C-01-02', zone: 'C', row: '01', position: '02', maxCapacityKg: '2000.0000', currentBags: 8, currentWeightKg: '400.0000', isActive: true },
  { id: 'loc-010', storeId: 's1', storeName: 'Central Store — Main', locationCode: 'C-02-01', zone: 'C', row: '02', position: '01', maxCapacityKg: '2000.0000', currentBags: 0, currentWeightKg: '0.0000', isActive: false },
  // Challawa store
  { id: 'loc-011', storeId: 's2', storeName: 'Challawa WTP Unit Store', locationCode: 'A-01-01', zone: 'A', row: '01', position: '01', maxCapacityKg: '3000.0000', currentBags: 25, currentWeightKg: '1250.0000', isActive: true },
  { id: 'loc-012', storeId: 's2', storeName: 'Challawa WTP Unit Store', locationCode: 'A-01-02', zone: 'A', row: '01', position: '02', maxCapacityKg: '3000.0000', currentBags: 10, currentWeightKg: '500.0000', isActive: true },
];

export const mockWarehouseMap: Record<string, WarehouseMap> = {
  s1: {
    storeId: 's1',
    storeName: 'Central Store — Main',
    totalLocations: 10,
    occupiedLocations: 7,
    totalCapacityKg: '40000.0000',
    currentWeightKg: '15900.0000',
    utilizationPct: 39.75,
    zones: [
      {
        zone: 'A',
        locations: [
          { ...mockLocations[0], utilizationPct: 80 },
          { ...mockLocations[1], utilizationPct: 60 },
          { ...mockLocations[2], utilizationPct: 45 },
          { ...mockLocations[3], utilizationPct: 0 },
          { ...mockLocations[4], utilizationPct: 95 },
        ],
      },
      {
        zone: 'B',
        locations: [
          { ...mockLocations[5], utilizationPct: 33.3 },
          { ...mockLocations[6], utilizationPct: 0 },
        ],
      },
      {
        zone: 'C',
        locations: [
          { ...mockLocations[7], utilizationPct: 25 },
          { ...mockLocations[8], utilizationPct: 20 },
          { ...mockLocations[9], utilizationPct: 0 },
        ],
      },
    ],
  },
  s2: {
    storeId: 's2',
    storeName: 'Challawa WTP Unit Store',
    totalLocations: 2,
    occupiedLocations: 2,
    totalCapacityKg: '6000.0000',
    currentWeightKg: '1750.0000',
    utilizationPct: 29.17,
    zones: [
      {
        zone: 'A',
        locations: [
          { ...mockLocations[10], utilizationPct: 41.7 },
          { ...mockLocations[11], utilizationPct: 16.7 },
        ],
      },
    ],
  },
};

export const mockLocationContents: Record<string, LocationContents> = {
  'loc-001': {
    locationId: 'loc-001',
    locationCode: 'A-01-01',
    zone: 'A',
    maxCapacityKg: '5000.0000',
    currentBags: 80,
    currentWeightKg: '4000.0000',
    utilizationPct: 80,
    lots: [
      { lotId: 'lot-001', lotNumber: 'LOT-2026-0001', bags: 60 },
      { lotId: 'lot-003', lotNumber: 'LOT-2026-0003', bags: 20 },
    ],
    items: [],
  },
};
