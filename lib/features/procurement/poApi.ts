import { baseApi } from '@/lib/store/baseApi';
import { endpoints } from '@/lib/api/endpoints';
import type {
  PO, POListParams, CreatePORequest, UpdatePORequest,
  ApproveFinanceRequest, RejectFinanceRequest,
  ApproveDirectorRequest, RejectDirectorRequest,
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
    updatePO: builder.mutation<PO, { id: string; data: UpdatePORequest }>({
      query: ({ id, data }) => ({ url: endpoints.po.update(id), method: 'PUT', data }),
      invalidatesTags: ['PO'],
    }),
    submitPO: builder.mutation<void, string>({
      query: (id) => ({ url: endpoints.po.submit(id), method: 'PATCH' }),
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
    approveDirectorPO: builder.mutation<void, { id: string; data?: ApproveDirectorRequest }>({
      query: ({ id, data }) => ({ url: endpoints.po.approveDirector(id), method: 'PATCH', data }),
      invalidatesTags: ['PO'],
    }),
    rejectDirectorPO: builder.mutation<void, { id: string; data: RejectDirectorRequest }>({
      query: ({ id, data }) => ({ url: endpoints.po.rejectDirector(id), method: 'PATCH', data }),
      invalidatesTags: ['PO'],
    }),
    createAmendment: builder.mutation<POAmendment, { poId: string; data: CreateAmendmentRequest }>({
      query: ({ poId, data }) => ({ url: endpoints.po.amendments(poId), method: 'POST', data }),
      invalidatesTags: ['PO'],
    }),
    approveAmendmentFinance: builder.mutation<void, { poId: string; amendmentId: string }>({
      query: ({ poId, amendmentId }) => ({ url: endpoints.po.approveAmendmentFinance(poId, amendmentId), method: 'PATCH' }),
      invalidatesTags: ['PO'],
    }),
    approveAmendmentDirector: builder.mutation<void, { poId: string; amendmentId: string }>({
      query: ({ poId, amendmentId }) => ({ url: endpoints.po.approveAmendmentDirector(poId, amendmentId), method: 'PATCH' }),
      invalidatesTags: ['PO'],
    }),
  }),
});

export const {
  useGetPOsQuery,
  useGetPOQuery,
  useCreatePOMutation,
  useUpdatePOMutation,
  useSubmitPOMutation,
  useApproveFinancePOMutation,
  useRejectFinancePOMutation,
  useApproveDirectorPOMutation,
  useRejectDirectorPOMutation,
  useCreateAmendmentMutation,
  useApproveAmendmentFinanceMutation,
  useApproveAmendmentDirectorMutation,
} = poApi;
