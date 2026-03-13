import { baseApi } from '~/store/baseApi';
import { endpoints } from '~/api/endpoints';
import type {
  STO, STOListParams,
  CreateSTORequest, AuthoriseSTORequest,
  RejectSTORequest, CancelSTORequest,
} from '~/api/types/distribution';
import type { PaginatedResponse } from '~/api/types/common';

export const stoApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSTOs: builder.query<PaginatedResponse<STO>, STOListParams>({
      query: (params) => ({ url: endpoints.sto.list, params }),
      providesTags: ['STO'],
    }),
    getSTO: builder.query<STO, string>({
      query: (id) => ({ url: endpoints.sto.detail(id) }),
      providesTags: ['STO'],
    }),
    createSTO: builder.mutation<STO, CreateSTORequest>({
      query: (body) => ({ url: endpoints.sto.list, method: 'POST', data: body }),
      invalidatesTags: ['STO'],
    }),
    submitSTO: builder.mutation<STO, string>({
      query: (id) => ({ url: endpoints.sto.submit(id), method: 'POST' }),
      invalidatesTags: ['STO'],
    }),
    authoriseSTO: builder.mutation<STO, { id: string; body?: AuthoriseSTORequest }>({
      query: ({ id, body }) => ({ url: endpoints.sto.authorise(id), method: 'POST', data: body }),
      invalidatesTags: ['STO'],
    }),
    rejectSTO: builder.mutation<STO, { id: string; body: RejectSTORequest }>({
      query: ({ id, body }) => ({ url: endpoints.sto.reject(id), method: 'POST', data: body }),
      invalidatesTags: ['STO'],
    }),
    cancelSTO: builder.mutation<STO, { id: string; body: CancelSTORequest }>({
      query: ({ id, body }) => ({ url: endpoints.sto.cancel(id), method: 'POST', data: body }),
      invalidatesTags: ['STO'],
    }),
  }),
});

export const {
  useGetSTOsQuery,
  useGetSTOQuery,
  useCreateSTOMutation,
  useSubmitSTOMutation,
  useAuthoriseSTOMutation,
  useRejectSTOMutation,
  useCancelSTOMutation,
} = stoApi;
