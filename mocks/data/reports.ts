import type {
  StockSummaryReport, ConsumptionAnalyticsReport,
  TransferReconciliationReport, SupplierPerformanceReport,
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
