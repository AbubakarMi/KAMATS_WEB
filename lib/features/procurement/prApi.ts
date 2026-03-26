import { baseApi } from '@/lib/store/baseApi';
import { endpoints } from '@/lib/api/endpoints';
import type {
  PR, PRListParams, CreatePRRequest, UpdatePRRequest, ApprovePRRequest, RejectPRRequest,
} from '@/lib/api/types/procurement';
import type { PaginatedResponse } from '@/lib/api/types/common';

export const prApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getPRs: builder.query<PaginatedResponse<PR>, PRListParams>({
      query: (params) => ({ url: endpoints.pr.list, params }),
      providesTags: ['PR'],
    }),
    getPR: builder.query<PR, string>({
      query: (id) => ({ url: endpoints.pr.detail(id) }),
      providesTags: ['PR'],
    }),
    createPR: builder.mutation<PR, CreatePRRequest>({
      query: (body) => ({ url: endpoints.pr.list, method: 'POST', data: body }),
      invalidatesTags: ['PR'],
    }),
    updatePR: builder.mutation<PR, { id: string; data: UpdatePRRequest }>({
      query: ({ id, data }) => ({ url: endpoints.pr.update(id), method: 'PUT', data }),
      invalidatesTags: ['PR'],
    }),
    submitPR: builder.mutation<void, string>({
      query: (id) => ({ url: endpoints.pr.submit(id), method: 'PATCH' }),
      invalidatesTags: ['PR'],
    }),
    approveFinancePR: builder.mutation<void, { id: string; data?: ApprovePRRequest }>({
      query: ({ id, data }) => ({ url: endpoints.pr.approveFinance(id), method: 'PATCH', data }),
      invalidatesTags: ['PR'],
    }),
    rejectFinancePR: builder.mutation<void, { id: string; data: RejectPRRequest }>({
      query: ({ id, data }) => ({ url: endpoints.pr.rejectFinance(id), method: 'PATCH', data }),
      invalidatesTags: ['PR'],
    }),
    approveDirectorPR: builder.mutation<void, { id: string; data?: ApprovePRRequest }>({
      query: ({ id, data }) => ({ url: endpoints.pr.approveDirector(id), method: 'PATCH', data }),
      invalidatesTags: ['PR'],
    }),
    rejectDirectorPR: builder.mutation<void, { id: string; data: RejectPRRequest }>({
      query: ({ id, data }) => ({ url: endpoints.pr.rejectDirector(id), method: 'PATCH', data }),
      invalidatesTags: ['PR'],
    }),
  }),
});

export const {
  useGetPRsQuery,
  useGetPRQuery,
  useCreatePRMutation,
  useUpdatePRMutation,
  useSubmitPRMutation,
  useApproveFinancePRMutation,
  useRejectFinancePRMutation,
  useApproveDirectorPRMutation,
  useRejectDirectorPRMutation,
} = prApi;
