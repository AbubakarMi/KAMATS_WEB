import { baseApi } from '@/lib/store/baseApi';
import { endpoints } from '@/lib/api/endpoints';
import type {
  StockBalance, LedgerEntry, LedgerEntryListParams,
  BalanceHistory, BalanceHistoryParams,
} from '@/lib/api/types/ledger';
import type { PaginatedResponse } from '@/lib/api/types/common';

export const ledgerApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getStockBalance: builder.query<StockBalance, string>({
      query: (storeId) => ({ url: endpoints.ledger.balance(storeId) }),
      providesTags: ['Ledger'],
    }),
    getLedgerEntries: builder.query<PaginatedResponse<LedgerEntry>, { storeId: string; params: LedgerEntryListParams }>({
      query: ({ storeId, params }) => ({ url: endpoints.ledger.entries(storeId), params }),
      providesTags: ['Ledger'],
    }),
    getBalanceHistory: builder.query<BalanceHistory, { storeId: string; params?: BalanceHistoryParams }>({
      query: ({ storeId, params }) => ({ url: endpoints.ledger.balanceHistory(storeId), params }),
      providesTags: ['Ledger'],
    }),
  }),
});

export const {
  useGetStockBalanceQuery,
  useGetLedgerEntriesQuery,
  useGetBalanceHistoryQuery,
} = ledgerApi;
