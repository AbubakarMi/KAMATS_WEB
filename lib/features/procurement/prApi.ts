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
    deletePR: builder.mutation<void, string>({
      query: (id) => ({ url: endpoints.pr.delete(id), method: 'DELETE' }),
      invalidatesTags: ['PR'],
    }),
    // StoreKeeper submits
    submitPR: builder.mutation<PR, string>({
      query: (id) => ({ url: endpoints.pr.submit(id), method: 'PATCH' }),
      invalidatesTags: ['PR'],
    }),
    // Finance Officer reviews
    reviewAcceptPR: builder.mutation<PR, { id: string; data?: ApprovePRRequest }>({
      query: ({ id, data }) => ({ url: endpoints.pr.reviewAccept(id), method: 'POST', data }),
      invalidatesTags: ['PR'],
    }),
    reviewRequestChangePR: builder.mutation<PR, { id: string; data: RejectPRRequest }>({
      query: ({ id, data }) => ({ url: endpoints.pr.reviewRequestChange(id), method: 'POST', data }),
      invalidatesTags: ['PR'],
    }),
    reviewRejectPR: builder.mutation<PR, { id: string; data: RejectPRRequest }>({
      query: ({ id, data }) => ({ url: endpoints.pr.reviewReject(id), method: 'POST', data }),
      invalidatesTags: ['PR'],
    }),
    // StoreKeeper resubmits after change request
    resubmitPR: builder.mutation<PR, string>({
      query: (id) => ({ url: endpoints.pr.resubmit(id), method: 'POST' }),
      invalidatesTags: ['PR'],
    }),
    // Admin final approval
    approvePR: builder.mutation<PR, { id: string; data?: ApprovePRRequest }>({
      query: ({ id, data }) => ({ url: endpoints.pr.approve(id), method: 'POST', data }),
      invalidatesTags: ['PR'],
    }),
    rejectPR: builder.mutation<PR, { id: string; data: RejectPRRequest }>({
      query: ({ id, data }) => ({ url: endpoints.pr.reject(id), method: 'POST', data }),
      invalidatesTags: ['PR'],
    }),
  }),
});

export const {
  useGetPRsQuery,
  useGetPRQuery,
  useCreatePRMutation,
  useUpdatePRMutation,
  useDeletePRMutation,
  useSubmitPRMutation,
  useReviewAcceptPRMutation,
  useReviewRequestChangePRMutation,
  useReviewRejectPRMutation,
  useResubmitPRMutation,
  useApprovePRMutation,
  useRejectPRMutation,
} = prApi;
