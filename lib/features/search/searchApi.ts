import { baseApi } from '@/lib/store/baseApi';
import { endpoints } from '@/lib/api/endpoints';
import type { SearchResponse } from '@/lib/api/types/common';

export const searchApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    globalSearch: builder.query<SearchResponse, string>({
      query: (q) => ({ url: endpoints.search.query, params: { q } }),
    }),
  }),
});

export const { useGlobalSearchQuery, useLazyGlobalSearchQuery } = searchApi;
