import { http, HttpResponse } from 'msw';
import { mockStockSummary, mockConsumptionReport, mockTransferReconciliation, mockSupplierPerformance, mockLotLifecycleReports, mockItemHistoryReports, mockStockMovementSummary, mockAnomalyHistory, mockPhysicalCountResults, mockProcurementPipeline } from '../data/reports';
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

  http.get(`${API}/reports/lot-lifecycle/:lotId`, ({ params }) => {
    const report = mockLotLifecycleReports[params.lotId as string];
    if (!report) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json({ data: report, meta: { timestamp: new Date().toISOString(), request_id: 'mock' } });
  }),

  http.get(`${API}/reports/item-history/:itemId`, ({ params }) => {
    const report = mockItemHistoryReports[params.itemId as string];
    if (!report) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json({ data: report, meta: { timestamp: new Date().toISOString(), request_id: 'mock' } });
  }),

  http.get(`${API}/reports/stock-movement-summary`, () => {
    return HttpResponse.json({ data: mockStockMovementSummary, meta: { timestamp: new Date().toISOString(), request_id: 'mock' } });
  }),

  http.get(`${API}/reports/anomaly-history`, () => {
    return HttpResponse.json({ data: mockAnomalyHistory, meta: { timestamp: new Date().toISOString(), request_id: 'mock' } });
  }),

  http.get(`${API}/reports/physical-count-results`, () => {
    return HttpResponse.json({ data: mockPhysicalCountResults, meta: { timestamp: new Date().toISOString(), request_id: 'mock' } });
  }),

  http.get(`${API}/reports/procurement-pipeline`, () => {
    return HttpResponse.json({ data: mockProcurementPipeline, meta: { timestamp: new Date().toISOString(), request_id: 'mock' } });
  }),
];
