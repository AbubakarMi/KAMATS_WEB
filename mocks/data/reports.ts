import type {
  StockSummaryReport, ConsumptionAnalyticsReport,
  TransferReconciliationReport, SupplierPerformanceReport,
  LotLifecycleReport, ItemHistoryReport,
} from '@/lib/api/types/reports';

export const mockStockSummary: StockSummaryReport = {
  generatedAt: '2026-03-13T12:00:00Z',
  systemTotalBags: 620,
  systemTotalWeightKg: '31000.0000',
  stores: [
    {
      storeId: 's1', storeName: 'Central Store — Main', tier: 'CentralStore',
      totalBags: 462, totalWeightKg: '23100.0000', reorderPoint: 100, belowReorderPoint: false,
      lots: [
        { lotNumber: 'LOT-2026-0001', bags: 250, weightKg: '12500.0000' },
        { lotNumber: 'LOT-2026-0003', bags: 192, weightKg: '9600.0000' },
        { lotNumber: 'LOT-2026-0004', bags: 20, weightKg: '1000.0000' },
      ],
    },
    {
      storeId: 's2', storeName: 'Challawa WTP Unit Store', tier: 'UnitStore',
      totalBags: 35, totalWeightKg: '1750.0000', reorderPoint: 25, belowReorderPoint: false,
      lots: [{ lotNumber: 'LOT-2025-0045', bags: 35, weightKg: '1750.0000' }],
    },
    {
      storeId: 's3', storeName: 'Tamburawa WTP Unit Store', tier: 'UnitStore',
      totalBags: 18, totalWeightKg: '900.0000', reorderPoint: 25, belowReorderPoint: true,
      lots: [{ lotNumber: 'LOT-2026-0001', bags: 18, weightKg: '900.0000' }],
    },
    {
      storeId: 's4', storeName: 'Challawa Treatment Plant', tier: 'UserStore',
      totalBags: 65, totalWeightKg: '3250.0000', reorderPoint: 10, belowReorderPoint: false,
      lots: [{ lotNumber: 'LOT-2026-0001', bags: 65, weightKg: '3250.0000' }],
    },
    {
      storeId: 's5', storeName: 'Tamburawa Treatment Plant', tier: 'UserStore',
      totalBags: 40, totalWeightKg: '2000.0000', reorderPoint: 10, belowReorderPoint: false,
      lots: [{ lotNumber: 'LOT-2026-0001', bags: 40, weightKg: '2000.0000' }],
    },
  ],
};

export const mockConsumptionReport: ConsumptionAnalyticsReport = {
  period: { from: '2026-02-13', to: '2026-03-13' },
  stores: [
    { storeId: 's4', storeName: 'Challawa Treatment Plant', totalVolumeM3: '132000', totalConsumedKg: '1680.0000', avgRateKgM3: '0.01273', configuredRate: '0.012', anomalyCount: 3, anomalyRatePct: '10.71' },
    { storeId: 's5', storeName: 'Tamburawa Treatment Plant', totalVolumeM3: '87500', totalConsumedKg: '1225.0000', avgRateKgM3: '0.01400', configuredRate: '0.014', anomalyCount: 1, anomalyRatePct: '4.00' },
  ],
};

export const mockTransferReconciliation: TransferReconciliationReport = {
  period: { from: '2026-02-01', to: '2026-03-13' },
  transfers: [
    { stoNumber: 'STO-2026-0001', sourceStore: 'Central Store — Main', destinationStore: 'Challawa WTP Unit Store', dispatchedBags: 50, receivedBags: 50, shortageBags: 0, excessBags: 0, damagedBags: 0, tdnStatus: 'Completed', investigationStatus: null },
    { stoNumber: 'STO-2026-0002', sourceStore: 'Central Store — Main', destinationStore: 'Tamburawa WTP Unit Store', dispatchedBags: 30, receivedBags: 28, shortageBags: 2, excessBags: 0, damagedBags: 0, tdnStatus: 'ShortDelivery', investigationStatus: 'Open' },
  ],
};

export const mockSupplierPerformance: SupplierPerformanceReport = {
  period: { from: '2025-01-01', to: '2026-03-13' },
  suppliers: [
    { supplierId: 'sup-001', supplierName: 'Chemtrade Nigeria Ltd', totalDeliveries: 12, onTimeRate: '91.67', quantityAccuracy: '98.20', qualityAcceptance: '100.00', avgScore: '96.62' },
    { supplierId: 'sup-002', supplierName: 'Al-Falah Chemical Supplies', totalDeliveries: 8, onTimeRate: '75.00', quantityAccuracy: '95.50', qualityAcceptance: '87.50', avgScore: '86.00' },
    { supplierId: 'sup-003', supplierName: 'Sahel Water Solutions', totalDeliveries: 5, onTimeRate: '80.00', quantityAccuracy: '97.00', qualityAcceptance: '100.00', avgScore: '92.33' },
  ],
};

export const mockLotLifecycleReports: Record<string, LotLifecycleReport> = {
  'lot-001': {
    lotNumber: 'LOT-2026-0001',
    poNumber: 'PO-2026-0001',
    supplierName: 'Chemtrade Nigeria Ltd',
    grnNumber: 'GRN-2026-0001',
    receiptDate: '2026-03-12',
    totalBags: 298,
    currentDistribution: {
      'Central Store — Main': 250,
      'Challawa Treatment Plant': 20,
      'Tamburawa Treatment Plant': 18,
      'In Transit': 8,
      'Written Off': 2,
    },
    events: [
      { eventType: 'GRN_RECEIVED', timestamp: '2026-03-12T10:30:00Z', description: 'Goods received — 298 bags accepted from PO-2026-0001', actorName: 'Ibrahim Musa', storeName: 'Central Store — Main', quantity: 298 },
      { eventType: 'LABELS_GENERATED', timestamp: '2026-03-12T11:00:00Z', description: 'QR labels generated for all 298 bags', actorName: 'Ibrahim Musa', storeName: 'Central Store — Main', quantity: 298 },
      { eventType: 'TRANSFER_DISPATCH', timestamp: '2026-03-13T08:00:00Z', description: 'Dispatched 30 bags to Challawa WTP via STO-2026-0010', actorName: 'Amina Yusuf', storeName: 'Central Store — Main', quantity: 30 },
      { eventType: 'TRANSFER_RECEIPT', timestamp: '2026-03-13T14:00:00Z', description: 'Received 30 bags at Challawa Treatment Plant', actorName: 'Operator', storeName: 'Challawa Treatment Plant', quantity: 30 },
      { eventType: 'CONSUMPTION', timestamp: '2026-03-13T16:00:00Z', description: 'Consumed 10 bags for water treatment dosing', actorName: 'Operator', storeName: 'Challawa Treatment Plant', quantity: 10 },
      { eventType: 'TRANSFER_DISPATCH', timestamp: '2026-03-14T08:00:00Z', description: 'Dispatched 20 bags to Tamburawa WTP via STO-2026-0011', actorName: 'Amina Yusuf', storeName: 'Central Store — Main', quantity: 20 },
      { eventType: 'TRANSFER_RECEIPT', timestamp: '2026-03-14T13:00:00Z', description: 'Received 18 bags at Tamburawa Treatment Plant (2 damaged)', actorName: 'Operator', storeName: 'Tamburawa Treatment Plant', quantity: 18 },
      { eventType: 'WRITE_OFF', timestamp: '2026-03-14T14:00:00Z', description: 'Written off 2 bags — transit damage', actorName: 'Amina Yusuf', storeName: 'Central Store — Main', quantity: 2 },
    ],
  },
};

export const mockItemHistoryReports: Record<string, ItemHistoryReport> = {
  'item-003': {
    itemCode: 'ALUM-2026-0001-003',
    lotNumber: 'LOT-2026-0001',
    poNumber: 'PO-2026-0001',
    supplierName: 'Chemtrade Nigeria Ltd',
    currentStatus: 'PartiallyConsumed',
    currentStoreName: 'Challawa Treatment Plant',
    currentLocationCode: null,
    chainOfCustody: [
      { eventType: 'GRN_RECEIVED', timestamp: '2026-03-12T10:30:00Z', actorName: 'Ibrahim Musa', storeName: 'Central Store — Main', locationCode: null, referenceNumber: 'GRN-2026-0001', details: 'Goods received — 298 bags accepted' },
      { eventType: 'LABEL_GENERATED', timestamp: '2026-03-12T11:00:00Z', actorName: 'Ibrahim Musa', storeName: 'Central Store — Main', locationCode: null, referenceNumber: 'LOT-2026-0001', details: 'QR label generated and affixed' },
      { eventType: 'PUT_AWAY', timestamp: '2026-03-12T11:30:00Z', actorName: 'Ibrahim Musa', storeName: 'Central Store — Main', locationCode: 'A-01-03', referenceNumber: 'A-01-03', details: 'Put away to location A-01-03' },
      { eventType: 'TRANSFER_DISPATCH', timestamp: '2026-03-13T08:00:00Z', actorName: 'Amina Yusuf', storeName: 'Central Store — Main', locationCode: null, referenceNumber: 'STO-2026-0010', details: 'Dispatched to Challawa WTP' },
      { eventType: 'TRANSFER_RECEIPT', timestamp: '2026-03-13T14:00:00Z', actorName: 'Operator', storeName: 'Challawa Treatment Plant', locationCode: null, referenceNumber: 'STO-2026-0010', details: 'Received at Challawa Treatment Plant' },
      { eventType: 'CONSUMPTION', timestamp: '2026-03-13T16:00:00Z', actorName: 'Operator', storeName: 'Challawa Treatment Plant', locationCode: null, referenceNumber: 'CON-2026-0050', details: 'Consumed 27.5 kg for dosing — 22.5 kg remaining' },
    ],
  },
};
