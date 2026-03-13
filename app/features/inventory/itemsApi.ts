import { baseApi } from '~/store/baseApi';
import { endpoints } from '~/api/endpoints';
import type {
  Item, ScanLabelRequest, ScanLabelResponse,
  ItemLifecycle, PutAwayRequest, PutAwayResponse,
} from '~/api/types/inventory';

export const itemsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getItem: builder.query<Item, string>({
      query: (id) => ({ url: endpoints.items.detail(id) }),
      providesTags: ['Item'],
    }),
    scanLabel: builder.mutation<ScanLabelResponse, { id: string; data: ScanLabelRequest }>({
      query: ({ id, data }) => ({ url: endpoints.items.scanLabel(id), method: 'PATCH', data }),
      invalidatesTags: ['Item', 'Lot'],
    }),
    getItemLifecycle: builder.query<ItemLifecycle, string>({
      query: (id) => ({ url: endpoints.items.lifecycle(id) }),
      providesTags: ['Item'],
    }),
    putAway: builder.mutation<PutAwayResponse, { id: string; data: PutAwayRequest }>({
      query: ({ id, data }) => ({ url: endpoints.items.putAway(id), method: 'PATCH', data }),
      invalidatesTags: ['Item', 'Location'],
    }),
  }),
});

export const {
  useGetItemQuery,
  useScanLabelMutation,
  useGetItemLifecycleQuery,
  usePutAwayMutation,
} = itemsApi;
