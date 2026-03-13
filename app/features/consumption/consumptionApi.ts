import { baseApi } from '~/store/baseApi';
import { endpoints } from '~/api/endpoints';
import type {
  ConsumptionEntry, ConsumptionListParams,
  AcknowledgeAnomalyRequest,
} from '~/api/types/consumption';
import type { PaginatedResponse } from '~/api/types/common';

export const consumptionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getConsumptionEntries: builder.query<PaginatedResponse<ConsumptionEntry>, ConsumptionListParams>({
      query: (params) => ({ url: endpoints.consumption.list, params }),
      providesTags: ['Consumption'],
    }),
    getConsumptionEntry: builder.query<ConsumptionEntry, string>({
      query: (id) => ({ url: endpoints.consumption.detail(id) }),
      providesTags: ['Consumption'],
    }),
    submitConsumption: builder.mutation<ConsumptionEntry, string>({
      query: (id) => ({ url: endpoints.consumption.submit(id), method: 'POST' }),
      invalidatesTags: ['Consumption'],
    }),
    acknowledgeAnomaly: builder.mutation<ConsumptionEntry, { id: string; body: AcknowledgeAnomalyRequest }>({
      query: ({ id, body }) => ({ url: endpoints.consumption.acknowledgeAnomaly(id), method: 'POST', data: body }),
      invalidatesTags: ['Consumption'],
    }),
  }),
});

export const {
  useGetConsumptionEntriesQuery,
  useGetConsumptionEntryQuery,
  useSubmitConsumptionMutation,
  useAcknowledgeAnomalyMutation,
} = consumptionApi;
