import { baseApi } from '@/lib/store/baseApi';
import { endpoints } from '@/lib/api/endpoints';
import type {
  ConsumptionEntry, ConsumptionListParams,
  CreateConsumptionRequest,
  ScanConsumptionItemRequest, ScanConsumptionItemResponse,
  AcknowledgeAnomalyRequest,
} from '@/lib/api/types/consumption';
import type { PaginatedResponse } from '@/lib/api/types/common';

export const consumptionApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    createConsumption: builder.mutation<ConsumptionEntry, CreateConsumptionRequest>({
      query: (body) => ({ url: endpoints.consumption.list, method: 'POST', data: body }),
      invalidatesTags: ['Consumption'],
    }),
    getConsumptionEntries: builder.query<PaginatedResponse<ConsumptionEntry>, ConsumptionListParams>({
      query: (params) => ({ url: endpoints.consumption.list, params }),
      providesTags: ['Consumption'],
    }),
    getConsumptionEntry: builder.query<ConsumptionEntry, string>({
      query: (id) => ({ url: endpoints.consumption.detail(id) }),
      providesTags: ['Consumption'],
    }),
    scanConsumptionItem: builder.mutation<ScanConsumptionItemResponse, { id: string; body: ScanConsumptionItemRequest }>({
      query: ({ id, body }) => ({ url: endpoints.consumption.scanItem(id), method: 'POST', data: body }),
      invalidatesTags: ['Consumption'],
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
  useCreateConsumptionMutation,
  useGetConsumptionEntriesQuery,
  useGetConsumptionEntryQuery,
  useScanConsumptionItemMutation,
  useSubmitConsumptionMutation,
  useAcknowledgeAnomalyMutation,
} = consumptionApi;
