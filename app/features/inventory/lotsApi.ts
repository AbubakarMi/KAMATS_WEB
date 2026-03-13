import { baseApi } from '~/store/baseApi';
import { endpoints } from '~/api/endpoints';
import type {
  Lot, LotDetail, LotListParams, GenerateLabelsRequest, GenerateLabelsResponse,
} from '~/api/types/inventory';
import type { PaginatedResponse } from '~/api/types/common';

export const lotsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLots: builder.query<PaginatedResponse<Lot>, LotListParams>({
      query: (params) => ({ url: endpoints.lots.list, params }),
      providesTags: ['Lot'],
    }),
    getLot: builder.query<LotDetail, string>({
      query: (id) => ({ url: endpoints.lots.detail(id) }),
      providesTags: ['Lot', 'Item'],
    }),
    generateLabels: builder.mutation<GenerateLabelsResponse, { lotId: string; data?: GenerateLabelsRequest }>({
      query: ({ lotId, data }) => ({ url: endpoints.lots.generateLabels(lotId), method: 'POST', data }),
      invalidatesTags: ['Lot', 'Item'],
    }),
  }),
});

export const {
  useGetLotsQuery,
  useGetLotQuery,
  useGenerateLabelsMutation,
} = lotsApi;
