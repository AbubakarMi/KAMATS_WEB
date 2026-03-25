import { baseApi } from '@/lib/store/baseApi';
import { endpoints } from '@/lib/api/endpoints';
import type {
  Alert, AlertListParams, AcknowledgeAlertRequest,
  AlertRule, CreateAlertRuleRequest, UpdateAlertRuleRequest,
} from '@/lib/api/types/alerts';
import type { PaginatedResponse } from '@/lib/api/types/common';

export const alertsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAlerts: builder.query<PaginatedResponse<Alert>, AlertListParams>({
      query: (params) => ({ url: endpoints.alerts.list, params }),
      providesTags: ['Alert'],
    }),
    acknowledgeAlert: builder.mutation<Alert, { id: string; body?: AcknowledgeAlertRequest }>({
      query: ({ id, body }) => ({ url: endpoints.alerts.acknowledge(id), method: 'POST', data: body }),
      invalidatesTags: ['Alert'],
    }),
    getAlertRules: builder.query<AlertRule[], void>({
      query: () => ({ url: endpoints.alerts.rules }),
      transformResponse: (response: AlertRule[] | { data: AlertRule[] }) =>
        Array.isArray(response) ? response : response?.data ?? [],
      providesTags: ['AlertRule'],
    }),
    createAlertRule: builder.mutation<AlertRule, CreateAlertRuleRequest>({
      query: (body) => ({ url: endpoints.alerts.rules, method: 'POST', data: body }),
      invalidatesTags: ['AlertRule'],
    }),
    updateAlertRule: builder.mutation<AlertRule, { id: string; body: UpdateAlertRuleRequest }>({
      query: ({ id, body }) => ({ url: endpoints.alerts.rule(id), method: 'PATCH', data: body }),
      invalidatesTags: ['AlertRule'],
    }),
  }),
});

export const {
  useGetAlertsQuery,
  useAcknowledgeAlertMutation,
  useGetAlertRulesQuery,
  useCreateAlertRuleMutation,
  useUpdateAlertRuleMutation,
} = alertsApi;
