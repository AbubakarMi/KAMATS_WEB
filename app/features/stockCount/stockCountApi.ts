import { baseApi } from '~/store/baseApi';
import { endpoints } from '~/api/endpoints';
import type {
  StockCount, StockCountListParams,
  CreateStockCountRequest, SubmitCountResultRequest,
  OrderRecountRequest, ApproveVarianceRequest,
  ApproveVarianceResponse, RejectVarianceRequest,
} from '~/api/types/stockCount';
import type { PaginatedResponse } from '~/api/types/common';

export const stockCountApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStockCounts: builder.query<PaginatedResponse<StockCount>, StockCountListParams>({
      query: (params) => ({ url: endpoints.stockCount.list, params }),
      providesTags: ['StockCount'],
    }),
    getStockCount: builder.query<StockCount, string>({
      query: (id) => ({ url: endpoints.stockCount.detail(id) }),
      providesTags: ['StockCount'],
    }),
    createStockCount: builder.mutation<StockCount, CreateStockCountRequest>({
      query: (body) => ({ url: endpoints.stockCount.list, method: 'POST', data: body }),
      invalidatesTags: ['StockCount'],
    }),
    submitCountResult: builder.mutation<StockCount, { id: string; body: SubmitCountResultRequest }>({
      query: ({ id, body }) => ({ url: endpoints.stockCount.submitResult(id), method: 'POST', data: body }),
      invalidatesTags: ['StockCount'],
    }),
    orderRecount: builder.mutation<StockCount, { id: string; body: OrderRecountRequest }>({
      query: ({ id, body }) => ({ url: endpoints.stockCount.recount(id), method: 'POST', data: body }),
      invalidatesTags: ['StockCount'],
    }),
    approveVariance: builder.mutation<ApproveVarianceResponse, { id: string; body: ApproveVarianceRequest }>({
      query: ({ id, body }) => ({ url: endpoints.stockCount.approveVariance(id), method: 'POST', data: body }),
      invalidatesTags: ['StockCount', 'Ledger'],
    }),
    rejectVariance: builder.mutation<StockCount, { id: string; body: RejectVarianceRequest }>({
      query: ({ id, body }) => ({ url: endpoints.stockCount.rejectVariance(id), method: 'POST', data: body }),
      invalidatesTags: ['StockCount'],
    }),
  }),
});

export const {
  useGetStockCountsQuery,
  useGetStockCountQuery,
  useCreateStockCountMutation,
  useSubmitCountResultMutation,
  useOrderRecountMutation,
  useApproveVarianceMutation,
  useRejectVarianceMutation,
} = stockCountApi;
