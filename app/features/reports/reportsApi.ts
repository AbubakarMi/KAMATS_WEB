import { baseApi } from '~/store/baseApi';
import { endpoints } from '~/api/endpoints';
import type {
  StockSummaryReport, StockSummaryParams,
  ConsumptionAnalyticsReport,
  TransferReconciliationReport, TransferReconciliationParams,
  SupplierPerformanceReport,
} from '~/api/types/reports';
import type { LossSummary, LossSummaryParams } from '~/api/types/loss';

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
  }),
});

export const {
  useGetStockSummaryQuery,
  useGetConsumptionAnalyticsReportQuery,
  useGetTransferReconciliationQuery,
  useGetSupplierPerformanceQuery,
  useGetLossSummaryReportQuery,
} = reportsApi;
