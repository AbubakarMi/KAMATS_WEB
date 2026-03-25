import { baseApi } from '@/lib/store/baseApi';
import { endpoints } from '@/lib/api/endpoints';
import type {
  DosageConfiguration, CreateDosageConfigRequest, UpdateDosageConfigRequest,
  ConsumptionAnalytics, ConsumptionTrends, OperatorPatterns,
} from '@/lib/api/types/consumption';
export const dosageApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getDosageConfigs: builder.query<DosageConfiguration[], void>({
      query: () => ({ url: endpoints.dosage.list }),
      transformResponse: (response: DosageConfiguration[] | { data: DosageConfiguration[] }) =>
        Array.isArray(response) ? response : response?.data ?? [],
      providesTags: ['DosageConfig'],
    }),
    getDosageByStore: builder.query<DosageConfiguration, string>({
      query: (storeId) => ({ url: endpoints.dosage.byStore(storeId) }),
      providesTags: ['DosageConfig'],
    }),
    createDosageConfig: builder.mutation<DosageConfiguration, CreateDosageConfigRequest>({
      query: (body) => ({ url: endpoints.dosage.create, method: 'POST', data: body }),
      invalidatesTags: ['DosageConfig'],
    }),
    updateDosageConfig: builder.mutation<DosageConfiguration, { id: string; body: UpdateDosageConfigRequest }>({
      query: ({ id, body }) => ({ url: endpoints.dosage.update(id), method: 'PATCH', data: body }),
      invalidatesTags: ['DosageConfig'],
    }),
    getConsumptionAnalytics: builder.query<ConsumptionAnalytics, string>({
      query: (storeId) => ({ url: endpoints.dosage.analytics(storeId) }),
    }),
    getConsumptionTrends: builder.query<ConsumptionTrends, string>({
      query: (storeId) => ({ url: endpoints.dosage.trends(storeId) }),
    }),
    getOperatorPatterns: builder.query<OperatorPatterns, string>({
      query: (storeId) => ({ url: endpoints.dosage.operatorPatterns(storeId) }),
    }),
  }),
});

export const {
  useGetDosageConfigsQuery,
  useGetDosageByStoreQuery,
  useCreateDosageConfigMutation,
  useUpdateDosageConfigMutation,
  useGetConsumptionAnalyticsQuery,
  useGetConsumptionTrendsQuery,
  useGetOperatorPatternsQuery,
} = dosageApi;
