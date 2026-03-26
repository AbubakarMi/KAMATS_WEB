import { baseApi } from '@/lib/store/baseApi';
import { endpoints } from '@/lib/api/endpoints';
import type {
  WriteOff, WriteOffListParams, CreateWriteOffRequest,
  ApproveWriteOffRequest, ApproveWriteOffResponse, RejectWriteOffRequest,
  LossSummary, LossSummaryParams,
  ReturnOrder, CreateReturnOrderRequest, ShipReturnOrderRequest, ConfirmCreditRequest,
} from '@/lib/api/types/loss';
import type { PaginatedResponse } from '@/lib/api/types/common';

export const lossApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getWriteOffs: builder.query<PaginatedResponse<WriteOff>, WriteOffListParams>({
      query: (params) => ({ url: endpoints.writeOff.list, params }),
      providesTags: ['WriteOff'],
    }),
    getWriteOff: builder.query<WriteOff, string>({
      query: (id) => ({ url: endpoints.writeOff.detail(id) }),
      providesTags: ['WriteOff'],
    }),
    createWriteOff: builder.mutation<WriteOff, CreateWriteOffRequest>({
      query: (body) => ({ url: endpoints.writeOff.list, method: 'POST', data: body }),
      invalidatesTags: ['WriteOff'],
    }),
    approveWriteOff: builder.mutation<ApproveWriteOffResponse, { id: string; body: ApproveWriteOffRequest }>({
      query: ({ id, body }) => ({ url: endpoints.writeOff.approve(id), method: 'POST', data: body }),
      invalidatesTags: ['WriteOff', 'Ledger'],
    }),
    rejectWriteOff: builder.mutation<WriteOff, { id: string; body: RejectWriteOffRequest }>({
      query: ({ id, body }) => ({ url: endpoints.writeOff.reject(id), method: 'POST', data: body }),
      invalidatesTags: ['WriteOff'],
    }),
    getLossSummary: builder.query<LossSummary, LossSummaryParams | void>({
      query: (params) => ({ url: endpoints.writeOff.lossSummary, params: params ?? undefined }),
      providesTags: ['WriteOff'],
    }),
    createReturnOrder: builder.mutation<ReturnOrder, CreateReturnOrderRequest>({
      query: (body) => ({ url: endpoints.returnOrder.create, method: 'POST', data: body }),
      invalidatesTags: ['WriteOff'],
    }),
    shipReturnOrder: builder.mutation<ReturnOrder, { id: string; body: ShipReturnOrderRequest }>({
      query: ({ id, body }) => ({ url: endpoints.returnOrder.ship(id), method: 'POST', data: body }),
      invalidatesTags: ['WriteOff'],
    }),
    confirmCredit: builder.mutation<ReturnOrder, { id: string; body: ConfirmCreditRequest }>({
      query: ({ id, body }) => ({ url: endpoints.returnOrder.confirmCredit(id), method: 'POST', data: body }),
      invalidatesTags: ['WriteOff'],
    }),
  }),
});

export const {
  useGetWriteOffsQuery,
  useGetWriteOffQuery,
  useCreateWriteOffMutation,
  useApproveWriteOffMutation,
  useRejectWriteOffMutation,
  useGetLossSummaryQuery,
  useCreateReturnOrderMutation,
  useShipReturnOrderMutation,
  useConfirmCreditMutation,
} = lossApi;
