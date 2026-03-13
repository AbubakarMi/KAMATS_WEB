import { baseApi } from '~/store/baseApi';
import { endpoints } from '~/api/endpoints';
import type {
  PR, PRListParams, CreatePRRequest, ApprovePRRequest, RejectPRRequest,
} from '~/api/types/procurement';
import type { PaginatedResponse } from '~/api/types/common';

export const prApi = baseApi.injectEndpoints({
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
    submitPR: builder.mutation<void, string>({
      query: (id) => ({ url: endpoints.pr.submit(id), method: 'PATCH' }),
      invalidatesTags: ['PR'],
    }),
    approvePR: builder.mutation<void, { id: string; data?: ApprovePRRequest }>({
      query: ({ id, data }) => ({ url: endpoints.pr.approve(id), method: 'PATCH', data }),
      invalidatesTags: ['PR'],
    }),
    rejectPR: builder.mutation<void, { id: string; data: RejectPRRequest }>({
      query: ({ id, data }) => ({ url: endpoints.pr.reject(id), method: 'PATCH', data }),
      invalidatesTags: ['PR'],
    }),
  }),
});

export const {
  useGetPRsQuery,
  useGetPRQuery,
  useCreatePRMutation,
  useSubmitPRMutation,
  useApprovePRMutation,
  useRejectPRMutation,
} = prApi;
