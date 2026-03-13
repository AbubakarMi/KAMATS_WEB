import { baseApi } from '~/store/baseApi';
import { endpoints } from '~/api/endpoints';
import type {
  GRN, GRNListParams, CreateGRNRequest, RecordCountRequest,
} from '~/api/types/grn';
import type { PaginatedResponse } from '~/api/types/common';

export const grnApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getGRNs: builder.query<PaginatedResponse<GRN>, GRNListParams>({
      query: (params) => ({ url: endpoints.grn.list, params }),
      providesTags: ['GRN'],
    }),
    getGRN: builder.query<GRN, string>({
      query: (id) => ({ url: endpoints.grn.detail(id) }),
      providesTags: ['GRN'],
    }),
    createGRN: builder.mutation<GRN, CreateGRNRequest>({
      query: (body) => ({ url: endpoints.grn.list, method: 'POST', data: body }),
      invalidatesTags: ['GRN'],
    }),
    recordCount: builder.mutation<void, { id: string; data: RecordCountRequest }>({
      query: ({ id, data }) => ({ url: endpoints.grn.recordCount(id), method: 'PATCH', data }),
      invalidatesTags: ['GRN'],
    }),
    submitGRN: builder.mutation<void, string>({
      query: (id) => ({ url: endpoints.grn.submit(id), method: 'PATCH' }),
      invalidatesTags: ['GRN', 'Lot', 'Ledger'],
    }),
  }),
});

export const {
  useGetGRNsQuery,
  useGetGRNQuery,
  useCreateGRNMutation,
  useRecordCountMutation,
  useSubmitGRNMutation,
} = grnApi;
