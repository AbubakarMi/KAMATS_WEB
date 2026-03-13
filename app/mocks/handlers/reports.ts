import { http, HttpResponse } from 'msw';
import { mockStockSummary, mockConsumptionReport, mockTransferReconciliation, mockSupplierPerformance } from '../data/reports';
import { mockLossSummary } from '../data/loss';

const API = '/api/v1';

export const reportHandlers = [
  http.get(`${API}/reports/stock-summary`, () => {
    return HttpResponse.json({ data: mockStockSummary, meta: { timestamp: new Date().toISOString(), request_id: 'mock' } });
  }),

  http.get(`${API}/reports/consumption-analytics`, () => {
    return HttpResponse.json({ data: mockConsumptionReport, meta: { timestamp: new Date().toISOString(), request_id: 'mock' } });
  }),

  http.get(`${API}/reports/transfer-reconciliation`, () => {
    return HttpResponse.json({ data: mockTransferReconciliation, meta: { timestamp: new Date().toISOString(), request_id: 'mock' } });
  }),

  http.get(`${API}/reports/supplier-performance`, () => {
    return HttpResponse.json({ data: mockSupplierPerformance, meta: { timestamp: new Date().toISOString(), request_id: 'mock' } });
  }),

  http.get(`${API}/reports/loss-summary`, () => {
    return HttpResponse.json({ data: mockLossSummary, meta: { timestamp: new Date().toISOString(), request_id: 'mock' } });
  }),
];
