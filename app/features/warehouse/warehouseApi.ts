import { baseApi } from '~/store/baseApi';
import { endpoints } from '~/api/endpoints';
import type {
  StorageLocation, StorageLocationListParams,
  LocationContents, WarehouseMap,
  InternalTransferRequest, InternalTransferResponse,
} from '~/api/types/inventory';

export const warehouseApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLocations: builder.query<StorageLocation[], StorageLocationListParams>({
      query: (params) => ({ url: endpoints.locations.list, params }),
      providesTags: ['Location'],
    }),
    getLocation: builder.query<StorageLocation, string>({
      query: (id) => ({ url: endpoints.locations.detail(id) }),
      providesTags: ['Location'],
    }),
    getLocationContents: builder.query<LocationContents, string>({
      query: (id) => ({ url: endpoints.locations.contents(id) }),
      providesTags: ['Location', 'Item'],
    }),
    getWarehouseMap: builder.query<WarehouseMap, string>({
      query: (storeId) => ({ url: endpoints.locations.warehouseMap(storeId) }),
      providesTags: ['Location'],
    }),
    createInternalTransfer: builder.mutation<InternalTransferResponse, InternalTransferRequest>({
      query: (body) => ({ url: endpoints.internalTransfers, method: 'POST', data: body }),
      invalidatesTags: ['Location', 'Item'],
    }),
  }),
});

export const {
  useGetLocationsQuery,
  useGetLocationQuery,
  useGetLocationContentsQuery,
  useGetWarehouseMapQuery,
  useCreateInternalTransferMutation,
} = warehouseApi;
