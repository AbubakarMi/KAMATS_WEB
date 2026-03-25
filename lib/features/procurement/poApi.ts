import { baseApi } from '@/lib/store/baseApi';
import { endpoints } from '@/lib/api/endpoints';
import type {
  PO, POListParams, CreatePORequest,
  ApproveManagerRequest, RejectManagerRequest,
  ApproveFinanceRequest, RejectFinanceRequest,
  CreateAmendmentRequest, POAmendment,
} from '@/lib/api/types/procurement';
import type { PaginatedResponse } from '@/lib/api/types/common';

export const poApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getPOs: builder.query<PaginatedResponse<PO>, POListParams>({
      query: (params) => ({ url: endpoints.po.list, params }),
      providesTags: ['PO'],
    }),
    getPO: builder.query<PO, string>({
      query: (id) => ({ url: endpoints.po.detail(id) }),
      providesTags: ['PO'],
    }),
    createPO: builder.mutation<PO, CreatePORequest>({
      query: (body) => ({ url: endpoints.po.list, method: 'POST', data: body }),
      invalidatesTags: ['PO', 'PR'],
    }),
    submitPO: builder.mutation<void, string>({
      query: (id) => ({ url: endpoints.po.submit(id), method: 'PATCH' }),
      invalidatesTags: ['PO'],
    }),
    approveManagerPO: builder.mutation<void, { id: string; data?: ApproveManagerRequest }>({
      query: ({ id, data }) => ({ url: endpoints.po.approveManager(id), method: 'PATCH', data }),
      invalidatesTags: ['PO'],
    }),
    rejectManagerPO: builder.mutation<void, { id: string; data: RejectManagerRequest }>({
      query: ({ id, data }) => ({ url: endpoints.po.rejectManager(id), method: 'PATCH', data }),
      invalidatesTags: ['PO'],
    }),
    approveFinancePO: builder.mutation<void, { id: string; data?: ApproveFinanceRequest }>({
      query: ({ id, data }) => ({ url: endpoints.po.approveFinance(id), method: 'PATCH', data }),
      invalidatesTags: ['PO'],
    }),
    rejectFinancePO: builder.mutation<void, { id: string; data: RejectFinanceRequest }>({
      query: ({ id, data }) => ({ url: endpoints.po.rejectFinance(id), method: 'PATCH', data }),
      invalidatesTags: ['PO'],
    }),
    createAmendment: builder.mutation<POAmendment, { poId: string; data: CreateAmendmentRequest }>({
      query: ({ poId, data }) => ({ url: endpoints.po.amendments(poId), method: 'POST', data }),
      invalidatesTags: ['PO'],
    }),
    approveAmendmentManager: builder.mutation<void, { poId: string; amendmentId: string }>({
      query: ({ poId, amendmentId }) => ({ url: endpoints.po.approveAmendmentManager(poId, amendmentId), method: 'PATCH' }),
      invalidatesTags: ['PO'],
    }),
    approveAmendmentFinance: builder.mutation<void, { poId: string; amendmentId: string }>({
      query: ({ poId, amendmentId }) => ({ url: endpoints.po.approveAmendmentFinance(poId, amendmentId), method: 'PATCH' }),
      invalidatesTags: ['PO'],
    }),
  }),
});

export const {
  useGetPOsQuery,
  useGetPOQuery,
  useCreatePOMutation,
  useSubmitPOMutation,
  useApproveManagerPOMutation,
  useRejectManagerPOMutation,
  useApproveFinancePOMutation,
  useRejectFinancePOMutation,
  useCreateAmendmentMutation,
  useApproveAmendmentManagerMutation,
  useApproveAmendmentFinanceMutation,
} = poApi;
