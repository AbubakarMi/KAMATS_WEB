import { baseApi } from '@/lib/store/baseApi';
import { endpoints } from '@/lib/api/endpoints';
import type { AuditEvent, AuditEventListParams, VerifyChainResponse } from '@/lib/api/types/audit';
import type { PaginatedResponse } from '@/lib/api/types/common';

export const auditApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAuditEvents: builder.query<PaginatedResponse<AuditEvent>, AuditEventListParams>({
      query: (params) => ({ url: endpoints.audit.events, params }),
    }),
    verifyChain: builder.query<VerifyChainResponse, void>({
      query: () => ({ url: endpoints.audit.verifyChain }),
    }),
    verifyChainStore: builder.query<VerifyChainResponse, string>({
      query: (storeId) => ({ url: endpoints.audit.verifyChainStore(storeId) }),
    }),
  }),
});

export const {
  useGetAuditEventsQuery,
  useVerifyChainQuery,
  useLazyVerifyChainQuery,
} = auditApi;
