import { baseApi } from '@/lib/store/baseApi';
import { endpoints } from '@/lib/api/endpoints';
import type {
  StockSummaryReport, StockSummaryParams,
  ConsumptionAnalyticsReport,
  TransferReconciliationReport, TransferReconciliationParams,
  SupplierPerformanceReport,
  LotLifecycleReport,
  ItemHistoryReport,
} from '@/lib/api/types/reports';
import type { LossSummary, LossSummaryParams } from '@/lib/api/types/loss';

export const reportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStockSummary: builder.query<StockSummaryReport, StockSummaryParams | void>({
      query: (params) => ({ url: endpoints.reports.stockSummary, params: params ?? undefined }),
    }),
    getConsumptionAnalyticsReport: builder.query<ConsumptionAnalyticsReport, void>({
      query: () => ({ url: endpoints.reports.consumptionAnalytics }),
    }),
    getTransferReconciliation: builder.query<TransferReconciliationReport, TransferReconciliationParams | void>({
      query: (params) => ({ url: endpoints.reports.transferReconciliation, params: params ?? undefined }),
    }),
    getSupplierPerformance: builder.query<SupplierPerformanceReport, void>({
      query: () => ({ url: endpoints.reports.supplierPerformance }),
    }),
    getLossSummaryReport: builder.query<LossSummary, LossSummaryParams | void>({
      query: (params) => ({ url: endpoints.reports.lossSummary, params: params ?? undefined }),
    }),
    getLotLifecycleReport: builder.query<LotLifecycleReport, string>({
      query: (lotId) => ({ url: endpoints.reports.lotLifecycle(lotId) }),
    }),
    getItemHistoryReport: builder.query<ItemHistoryReport, string>({
      query: (itemId) => ({ url: endpoints.reports.itemHistory(itemId) }),
    }),
  }),
});

export const {
  useGetStockSummaryQuery,
  useGetConsumptionAnalyticsReportQuery,
  useGetTransferReconciliationQuery,
  useGetSupplierPerformanceQuery,
  useGetLossSummaryReportQuery,
  useGetLotLifecycleReportQuery,
  useGetItemHistoryReportQuery,
} = reportsApi;
