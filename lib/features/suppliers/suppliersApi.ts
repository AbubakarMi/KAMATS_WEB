import { baseApi } from '@/lib/store/baseApi';
import { endpoints } from '@/lib/api/endpoints';
import type {
  Supplier, SupplierListParams, CreateSupplierRequest,
  ApproveSupplierResponse, RejectSupplierRequest,
  SuspendSupplierRequest, SuspendSupplierResponse,
  SupplierScorecard, SupplierScorecardParams,
} from '@/lib/api/types/suppliers';
import type { PaginatedResponse } from '@/lib/api/types/common';

export const suppliersApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getSuppliers: builder.query<PaginatedResponse<Supplier>, SupplierListParams>({
      query: (params) => ({ url: endpoints.suppliers.list, params }),
      providesTags: ['Supplier'],
    }),
    getSupplier: builder.query<Supplier, string>({
      query: (id) => ({ url: endpoints.suppliers.detail(id) }),
      providesTags: ['Supplier'],
    }),
    createSupplier: builder.mutation<Supplier, CreateSupplierRequest>({
      query: (body) => ({ url: endpoints.suppliers.list, method: 'POST', data: body }),
      invalidatesTags: ['Supplier'],
    }),
    approveSupplier: builder.mutation<ApproveSupplierResponse, string>({
      query: (id) => ({ url: endpoints.suppliers.approve(id), method: 'PATCH' }),
      invalidatesTags: ['Supplier'],
    }),
    rejectSupplier: builder.mutation<void, { id: string; data: RejectSupplierRequest }>({
      query: ({ id, data }) => ({ url: endpoints.suppliers.reject(id), method: 'PATCH', data }),
      invalidatesTags: ['Supplier'],
    }),
    suspendSupplier: builder.mutation<SuspendSupplierResponse, { id: string; data: SuspendSupplierRequest }>({
      query: ({ id, data }) => ({ url: endpoints.suppliers.suspend(id), method: 'PATCH', data }),
      invalidatesTags: ['Supplier'],
    }),
    reactivateSupplier: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({ url: endpoints.suppliers.reactivate(id), method: 'PATCH' }),
      invalidatesTags: ['Supplier'],
    }),
    getSupplierScorecard: builder.query<SupplierScorecard, { id: string; params?: SupplierScorecardParams }>({
      query: ({ id, params }) => ({ url: endpoints.suppliers.scorecard(id), params }),
      providesTags: ['Supplier'],
    }),
  }),
});

export const {
  useGetSuppliersQuery,
  useGetSupplierQuery,
  useCreateSupplierMutation,
  useApproveSupplierMutation,
  useRejectSupplierMutation,
  useSuspendSupplierMutation,
  useReactivateSupplierMutation,
  useGetSupplierScorecardQuery,
} = suppliersApi;
