import { baseApi } from '~/store/baseApi';
import { endpoints } from '~/api/endpoints';
import type {
  DosageConfiguration, CreateDosageConfigRequest, UpdateDosageConfigRequest,
  ConsumptionAnalytics, ConsumptionTrends, OperatorPatterns,
} from '~/api/types/consumption';

export const dosageApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDosageConfigs: builder.query<DosageConfiguration[], void>({
      query: () => ({ url: endpoints.dosage.list }),
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
