import type { StockBalance, LedgerEntry, BalanceHistory } from '~/api/types/ledger';

export const mockStockBalances: Record<string, StockBalance> = {
  s1: {
    storeId: 's1',
    storeName: 'Central Store — Main',
    totalBags: 462,
    totalWeightKg: '23100.0000',
    reorderPoint: 50,
    maxStockLevel: 1000,
    belowReorderPoint: false,
    balancesByLot: [
      { lotId: 'lot-001', lotNumber: 'LOT-2026-0001', supplierName: 'Chemtrade Nigeria Ltd', receiptDate: '2026-03-12', totalBags: 298, bagsInStock: 250, bagsReserved: 10, bagsInTransit: 8, weightKg: '12500.0000' },
      { lotId: 'lot-003', lotNumber: 'LOT-2026-0003', supplierName: 'Al-Falah Chemical Supplies', receiptDate: '2026-03-10', totalBags: 192, bagsInStock: 192, bagsReserved: 0, bagsInTransit: 0, weightKg: '9600.0000' },
      { lotId: 'lot-005', lotNumber: 'LOT-2026-0004', supplierName: 'Sahel Water Solutions', receiptDate: '2026-01-10', totalBags: 80, bagsInStock: 20, bagsReserved: 0, bagsInTransit: 0, weightKg: '1000.0000' },
    ],
  },
  s2: {
    storeId: 's2',
    storeName: 'Challawa WTP Unit Store',
    totalBags: 35,
    totalWeightKg: '1750.0000',
    reorderPoint: 30,
    maxStockLevel: 200,
    belowReorderPoint: false,
    balancesByLot: [
      { lotId: 'lot-004', lotNumber: 'LOT-2025-0045', supplierName: 'Sahel Water Solutions', receiptDate: '2025-12-15', totalBags: 100, bagsInStock: 35, bagsReserved: 0, bagsInTransit: 0, weightKg: '1750.0000' },
    ],
  },
};

export const mockLedgerEntries: Record<string, LedgerEntry[]> = {
  s1: [
    { id: 'le-001', entryNumber: 'LE-0001', entryType: 'Receipt', storeName: 'Central Store — Main', lotNumber: 'LOT-2026-0001', quantityBags: 298, weightKg: '14900.0000', balanceBefore: 212, balanceAfter: 510, referenceType: 'GRN', referenceNumber: 'GRN-2026-0001', notes: null, createdAt: '2026-03-12T10:30:00Z' },
    { id: 'le-002', entryNumber: 'LE-0002', entryType: 'Issue', storeName: 'Central Store — Main', lotNumber: 'LOT-2026-0001', quantityBags: 20, weightKg: '1000.0000', balanceBefore: 510, balanceAfter: 490, referenceType: 'STO', referenceNumber: 'STO-2026-0010', notes: 'Transfer to Challawa', createdAt: '2026-03-13T08:00:00Z' },
    { id: 'le-003', entryNumber: 'LE-0003', entryType: 'Consumption', storeName: 'Central Store — Main', lotNumber: 'LOT-2026-0001', quantityBags: 8, weightKg: '400.0000', balanceBefore: 490, balanceAfter: 482, referenceType: 'CON', referenceNumber: 'CON-2026-0050', notes: null, createdAt: '2026-03-13T16:00:00Z' },
    { id: 'le-004', entryNumber: 'LE-0004', entryType: 'WriteOff', storeName: 'Central Store — Main', lotNumber: 'LOT-2026-0001', quantityBags: 2, weightKg: '100.0000', balanceBefore: 482, balanceAfter: 480, referenceType: 'WO', referenceNumber: 'WO-2026-0005', notes: 'Damaged bags from receipt', createdAt: '2026-03-12T11:00:00Z' },
    { id: 'le-005', entryNumber: 'LE-0005', entryType: 'Receipt', storeName: 'Central Store — Main', lotNumber: 'LOT-2026-0003', quantityBags: 192, weightKg: '9600.0000', balanceBefore: 270, balanceAfter: 462, referenceType: 'GRN', referenceNumber: 'GRN-2026-0003', notes: null, createdAt: '2026-03-10T11:00:00Z' },
    { id: 'le-006', entryNumber: 'LE-0006', entryType: 'Adjustment', storeName: 'Central Store — Main', lotNumber: 'LOT-2026-0002', quantityBags: -2, weightKg: '-100.0000', balanceBefore: 152, balanceAfter: 150, referenceType: 'ADJ', referenceNumber: 'ADJ-2026-0001', notes: 'Stock count variance correction', createdAt: '2026-03-08T14:00:00Z' },
    { id: 'le-007', entryNumber: 'LE-0007', entryType: 'Issue', storeName: 'Central Store — Main', lotNumber: 'LOT-2026-0002', quantityBags: 30, weightKg: '1500.0000', balanceBefore: 180, balanceAfter: 150, referenceType: 'STO', referenceNumber: 'STO-2026-0008', notes: 'Transfer to Tamburawa', createdAt: '2026-03-05T09:00:00Z' },
    { id: 'le-008', entryNumber: 'LE-0008', entryType: 'TransferReceipt', storeName: 'Central Store — Main', lotNumber: 'LOT-2026-0001', quantityBags: 5, weightKg: '250.0000', balanceBefore: 475, balanceAfter: 480, referenceType: 'STO', referenceNumber: 'STO-2026-0009', notes: 'Return from Challawa — surplus', createdAt: '2026-03-11T10:00:00Z' },
  ],
};

export const mockBalanceHistory: Record<string, BalanceHistory> = {
  s1: {
    storeId: 's1',
    storeName: 'Central Store — Main',
    dataPoints: [
      { date: '2026-02-11', balanceBags: 320, balanceWeightKg: '16000.0000', receipts: 0, issues: 10, consumption: 5 },
      { date: '2026-02-12', balanceBags: 315, balanceWeightKg: '15750.0000', receipts: 0, issues: 0, consumption: 5 },
      { date: '2026-02-13', balanceBags: 310, balanceWeightKg: '15500.0000', receipts: 0, issues: 5, consumption: 0 },
      { date: '2026-02-14', balanceBags: 305, balanceWeightKg: '15250.0000', receipts: 0, issues: 0, consumption: 5 },
      { date: '2026-02-15', balanceBags: 300, balanceWeightKg: '15000.0000', receipts: 0, issues: 5, consumption: 0 },
      { date: '2026-02-16', balanceBags: 295, balanceWeightKg: '14750.0000', receipts: 0, issues: 0, consumption: 5 },
      { date: '2026-02-17', balanceBags: 290, balanceWeightKg: '14500.0000', receipts: 0, issues: 5, consumption: 0 },
      { date: '2026-02-18', balanceBags: 285, balanceWeightKg: '14250.0000', receipts: 0, issues: 0, consumption: 5 },
      { date: '2026-02-19', balanceBags: 280, balanceWeightKg: '14000.0000', receipts: 0, issues: 5, consumption: 0 },
      { date: '2026-02-20', balanceBags: 275, balanceWeightKg: '13750.0000', receipts: 0, issues: 0, consumption: 5 },
      { date: '2026-02-21', balanceBags: 270, balanceWeightKg: '13500.0000', receipts: 0, issues: 5, consumption: 0 },
      { date: '2026-02-22', balanceBags: 265, balanceWeightKg: '13250.0000', receipts: 0, issues: 0, consumption: 5 },
      { date: '2026-02-23', balanceBags: 260, balanceWeightKg: '13000.0000', receipts: 0, issues: 5, consumption: 0 },
      { date: '2026-02-24', balanceBags: 255, balanceWeightKg: '12750.0000', receipts: 0, issues: 0, consumption: 5 },
      { date: '2026-02-25', balanceBags: 250, balanceWeightKg: '12500.0000', receipts: 0, issues: 5, consumption: 0 },
      { date: '2026-02-26', balanceBags: 245, balanceWeightKg: '12250.0000', receipts: 0, issues: 0, consumption: 5 },
      { date: '2026-02-27', balanceBags: 390, balanceWeightKg: '19500.0000', receipts: 150, issues: 0, consumption: 5 },
      { date: '2026-02-28', balanceBags: 385, balanceWeightKg: '19250.0000', receipts: 0, issues: 5, consumption: 0 },
      { date: '2026-03-01', balanceBags: 380, balanceWeightKg: '19000.0000', receipts: 0, issues: 0, consumption: 5 },
      { date: '2026-03-02', balanceBags: 375, balanceWeightKg: '18750.0000', receipts: 0, issues: 5, consumption: 0 },
      { date: '2026-03-03', balanceBags: 370, balanceWeightKg: '18500.0000', receipts: 0, issues: 0, consumption: 5 },
      { date: '2026-03-04', balanceBags: 365, balanceWeightKg: '18250.0000', receipts: 0, issues: 5, consumption: 0 },
      { date: '2026-03-05', balanceBags: 330, balanceWeightKg: '16500.0000', receipts: 0, issues: 30, consumption: 5 },
      { date: '2026-03-06', balanceBags: 325, balanceWeightKg: '16250.0000', receipts: 0, issues: 0, consumption: 5 },
      { date: '2026-03-07', balanceBags: 320, balanceWeightKg: '16000.0000', receipts: 0, issues: 5, consumption: 0 },
      { date: '2026-03-08', balanceBags: 318, balanceWeightKg: '15900.0000', receipts: 0, issues: 0, consumption: 2 },
      { date: '2026-03-09', balanceBags: 315, balanceWeightKg: '15750.0000', receipts: 0, issues: 3, consumption: 0 },
      { date: '2026-03-10', balanceBags: 505, balanceWeightKg: '25250.0000', receipts: 192, issues: 0, consumption: 2 },
      { date: '2026-03-11', balanceBags: 510, balanceWeightKg: '25500.0000', receipts: 5, issues: 0, consumption: 0 },
      { date: '2026-03-12', balanceBags: 480, balanceWeightKg: '24000.0000', receipts: 0, issues: 20, consumption: 10 },
    ],
  },
};
