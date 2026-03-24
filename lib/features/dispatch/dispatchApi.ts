import { baseApi } from '@/lib/store/baseApi';
import { endpoints } from '@/lib/api/endpoints';
import type {
  DispatchSession, DispatchListParams, CreateDispatchRequest,
  ScanDispatchItemRequest, ScanDispatchItemResponse,
  RecordDispatchWeightRequest, ApproveShortShipmentRequest,
  CompleteDispatchRequest, CompleteDispatchResponse,
} from '@/lib/api/types/distribution';
import type { PaginatedResponse } from '@/lib/api/types/common';

export const dispatchApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDispatchList: builder.query<PaginatedResponse<DispatchSession>, DispatchListParams>({
      query: (params) => ({ url: endpoints.dispatch.list, params }),
      providesTags: ['Dispatch'],
    }),
    getDispatch: builder.query<DispatchSession, string>({
      query: (id) => ({ url: endpoints.dispatch.detail(id) }),
      providesTags: ['Dispatch'],
    }),
    createDispatch: builder.mutation<DispatchSession, CreateDispatchRequest>({
      query: (body) => ({ url: endpoints.dispatch.create, method: 'POST', data: body }),
      invalidatesTags: ['Dispatch', 'STO'],
    }),
    scanDispatchItem: builder.mutation<ScanDispatchItemResponse, { id: string; body: ScanDispatchItemRequest }>({
      query: ({ id, body }) => ({ url: endpoints.dispatch.scanItem(id), method: 'POST', data: body }),
      invalidatesTags: ['Dispatch'],
    }),
    recordDispatchWeight: builder.mutation<DispatchSession, { id: string; body: RecordDispatchWeightRequest }>({
      query: ({ id, body }) => ({ url: endpoints.dispatch.recordWeight(id), method: 'POST', data: body }),
      invalidatesTags: ['Dispatch'],
    }),
    approveShortShipment: builder.mutation<DispatchSession, { id: string; body: ApproveShortShipmentRequest }>({
      query: ({ id, body }) => ({ url: endpoints.dispatch.approveShort(id), method: 'POST', data: body }),
      invalidatesTags: ['Dispatch'],
    }),
    completeDispatch: builder.mutation<CompleteDispatchResponse, { id: string; body: CompleteDispatchRequest }>({
      query: ({ id, body }) => ({ url: endpoints.dispatch.complete(id), method: 'POST', data: body }),
      invalidatesTags: ['Dispatch', 'STO', 'Item'],
    }),
  }),
});

export const {
  useGetDispatchListQuery,
  useGetDispatchQuery,
  useCreateDispatchMutation,
  useScanDispatchItemMutation,
  useRecordDispatchWeightMutation,
  useApproveShortShipmentMutation,
  useCompleteDispatchMutation,
} = dispatchApi;
