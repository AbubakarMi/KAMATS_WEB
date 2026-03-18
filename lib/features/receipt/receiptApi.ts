import { baseApi } from '@/lib/store/baseApi';
import { endpoints } from '@/lib/api/endpoints';
import type {
  ReceiptSession, CreateReceiptRequest,
  ScanReceiptItemRequest, ScanReceiptItemResponse,
  ReportDamageRequest, CompleteReceiptRequest,
  CompleteReceiptResponse, ShortageReport,
} from '@/lib/api/types/distribution';

export const receiptApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReceipt: builder.query<ReceiptSession, string>({
      query: (id) => ({ url: endpoints.receipt.detail(id) }),
      providesTags: ['Receipt'],
    }),
    createReceipt: builder.mutation<ReceiptSession, CreateReceiptRequest>({
      query: (body) => ({ url: endpoints.receipt.create, method: 'POST', data: body }),
      invalidatesTags: ['Receipt', 'STO'],
    }),
    scanReceiptItem: builder.mutation<ScanReceiptItemResponse, { id: string; body: ScanReceiptItemRequest }>({
      query: ({ id, body }) => ({ url: endpoints.receipt.scanItem(id), method: 'POST', data: body }),
      invalidatesTags: ['Receipt'],
    }),
    reportDamage: builder.mutation<void, { id: string; body: ReportDamageRequest }>({
      query: ({ id, body }) => ({ url: endpoints.receipt.reportDamage(id), method: 'POST', data: body }),
      invalidatesTags: ['Receipt'],
    }),
    completeReceipt: builder.mutation<CompleteReceiptResponse, { id: string; body: CompleteReceiptRequest }>({
      query: ({ id, body }) => ({ url: endpoints.receipt.complete(id), method: 'POST', data: body }),
      invalidatesTags: ['Receipt', 'STO', 'Item', 'Ledger'],
    }),
    getShortageReport: builder.query<ShortageReport, string>({
      query: (id) => ({ url: endpoints.receipt.shortageReport(id) }),
      providesTags: ['Receipt'],
    }),
  }),
});

export const {
  useGetReceiptQuery,
  useCreateReceiptMutation,
  useScanReceiptItemMutation,
  useReportDamageMutation,
  useCompleteReceiptMutation,
  useGetShortageReportQuery,
} = receiptApi;
