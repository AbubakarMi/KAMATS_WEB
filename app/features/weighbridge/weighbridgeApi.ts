import { baseApi } from '~/store/baseApi';
import { endpoints } from '~/api/endpoints';
import type {
  WeighbridgeTicket, WeighbridgeListParams,
  CreateWeighbridgeTicketRequest,
  RecordGrossWeightRequest, RecordTareWeightRequest,
  OverrideWeighbridgeRequest, RejectWeighbridgeRequest,
} from '~/api/types/weighbridge';
import type { PaginatedResponse } from '~/api/types/common';

export const weighbridgeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWeighbridgeTickets: builder.query<PaginatedResponse<WeighbridgeTicket>, WeighbridgeListParams>({
      query: (params) => ({ url: endpoints.weighbridge.list, params }),
      providesTags: ['WeighbridgeTicket'],
    }),
    getWeighbridgeTicket: builder.query<WeighbridgeTicket, string>({
      query: (id) => ({ url: endpoints.weighbridge.detail(id) }),
      providesTags: ['WeighbridgeTicket'],
    }),
    createWeighbridgeTicket: builder.mutation<WeighbridgeTicket, CreateWeighbridgeTicketRequest>({
      query: (body) => ({ url: endpoints.weighbridge.list, method: 'POST', data: body }),
      invalidatesTags: ['WeighbridgeTicket'],
    }),
    recordGrossWeight: builder.mutation<void, { id: string; data: RecordGrossWeightRequest }>({
      query: ({ id, data }) => ({ url: endpoints.weighbridge.grossWeight(id), method: 'PATCH', data }),
      invalidatesTags: ['WeighbridgeTicket'],
    }),
    recordTareWeight: builder.mutation<void, { id: string; data: RecordTareWeightRequest }>({
      query: ({ id, data }) => ({ url: endpoints.weighbridge.tareWeight(id), method: 'PATCH', data }),
      invalidatesTags: ['WeighbridgeTicket'],
    }),
    overrideWeighbridge: builder.mutation<void, { id: string; data: OverrideWeighbridgeRequest }>({
      query: ({ id, data }) => ({ url: endpoints.weighbridge.override(id), method: 'PATCH', data }),
      invalidatesTags: ['WeighbridgeTicket'],
    }),
    rejectWeighbridge: builder.mutation<void, { id: string; data: RejectWeighbridgeRequest }>({
      query: ({ id, data }) => ({ url: endpoints.weighbridge.reject(id), method: 'PATCH', data }),
      invalidatesTags: ['WeighbridgeTicket'],
    }),
  }),
});

export const {
  useGetWeighbridgeTicketsQuery,
  useGetWeighbridgeTicketQuery,
  useCreateWeighbridgeTicketMutation,
  useRecordGrossWeightMutation,
  useRecordTareWeightMutation,
  useOverrideWeighbridgeMutation,
  useRejectWeighbridgeMutation,
} = weighbridgeApi;
