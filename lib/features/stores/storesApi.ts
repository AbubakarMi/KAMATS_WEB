import { baseApi } from '@/lib/store/baseApi';
import { endpoints } from '@/lib/api/endpoints';
import type { Store, StoreListParams } from '@/lib/api/types/admin';

export const storesApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAllStores: builder.query<Store[], StoreListParams | void>({
      query: (params) => ({ url: endpoints.stores.list, params: params || undefined }),
      transformResponse: (response: Store[] | { data: Store[] }) =>
        Array.isArray(response) ? response : response?.data ?? [],
      providesTags: ['Store'],
    }),
  }),
});

export const { useGetAllStoresQuery } = storesApi;
