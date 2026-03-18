import { baseApi } from '@/lib/store/baseApi';
import { endpoints } from '@/lib/api/endpoints';
import type {
  User, UserListParams, CreateUserRequest, UpdateUserRequest,
  DeactivateUserResponse, UnlockUserResponse,
  AssignStoreRequest, StoreAssignmentResponse,
  Store, StoreListParams, CreateStoreRequest, UpdateStoreRequest,
  ConfigItem, UpdateConfigRequest,
  Device, DeviceListParams, RegisterDeviceRequest, DeregisterDeviceResponse,
} from '@/lib/api/types/admin';
import type { PaginatedResponse } from '@/lib/api/types/common';

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // === Users ===
    getUsers: builder.query<PaginatedResponse<User>, UserListParams>({
      query: (params) => ({ url: endpoints.admin.users, params }),
      providesTags: ['User'],
    }),
    createUser: builder.mutation<User, CreateUserRequest>({
      query: (body) => ({ url: endpoints.admin.users, method: 'POST', data: body }),
      invalidatesTags: ['User'],
    }),
    updateUser: builder.mutation<User, { id: string; data: UpdateUserRequest }>({
      query: ({ id, data }) => ({ url: endpoints.admin.user(id), method: 'PUT', data }),
      invalidatesTags: ['User'],
    }),
    deactivateUser: builder.mutation<DeactivateUserResponse, string>({
      query: (id) => ({ url: endpoints.admin.deactivateUser(id), method: 'PATCH' }),
      invalidatesTags: ['User'],
    }),
    unlockUser: builder.mutation<UnlockUserResponse, string>({
      query: (id) => ({ url: endpoints.admin.unlockUser(id), method: 'PATCH' }),
      invalidatesTags: ['User'],
    }),
    assignStore: builder.mutation<StoreAssignmentResponse, { userId: string; data: AssignStoreRequest }>({
      query: ({ userId, data }) => ({
        url: endpoints.admin.userStoreAssignments(userId), method: 'POST', data,
      }),
      invalidatesTags: ['User'],
    }),
    removeStoreAssignment: builder.mutation<void, { userId: string; storeId: string }>({
      query: ({ userId, storeId }) => ({
        url: endpoints.admin.removeStoreAssignment(userId, storeId), method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),

    // === Stores ===
    getStores: builder.query<Store[], StoreListParams | void>({
      query: (params) => ({ url: endpoints.admin.stores, params: params || undefined }),
      providesTags: ['Store'],
    }),
    createStore: builder.mutation<Store, CreateStoreRequest>({
      query: (body) => ({ url: endpoints.admin.stores, method: 'POST', data: body }),
      invalidatesTags: ['Store'],
    }),
    updateStore: builder.mutation<Store, { id: string; data: UpdateStoreRequest }>({
      query: ({ id, data }) => ({ url: endpoints.admin.store(id), method: 'PUT', data }),
      invalidatesTags: ['Store'],
    }),

    // === Configuration ===
    getConfiguration: builder.query<ConfigItem[], void>({
      query: () => ({ url: endpoints.admin.configuration }),
      providesTags: ['Config'],
    }),
    updateConfig: builder.mutation<ConfigItem, { key: string; data: UpdateConfigRequest }>({
      query: ({ key, data }) => ({ url: endpoints.admin.configKey(key), method: 'PUT', data }),
      invalidatesTags: ['Config'],
    }),

    // === Devices ===
    getDevices: builder.query<Device[], DeviceListParams | void>({
      query: (params) => ({ url: endpoints.admin.devices, params: params || undefined }),
      providesTags: ['Device'],
    }),
    registerDevice: builder.mutation<Device, RegisterDeviceRequest>({
      query: (body) => ({ url: endpoints.admin.devices, method: 'POST', data: body }),
      invalidatesTags: ['Device'],
    }),
    deregisterDevice: builder.mutation<DeregisterDeviceResponse, string>({
      query: (id) => ({ url: endpoints.admin.device(id), method: 'DELETE' }),
      invalidatesTags: ['Device'],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeactivateUserMutation,
  useUnlockUserMutation,
  useAssignStoreMutation,
  useRemoveStoreAssignmentMutation,
  useGetStoresQuery,
  useCreateStoreMutation,
  useUpdateStoreMutation,
  useGetConfigurationQuery,
  useUpdateConfigMutation,
  useGetDevicesQuery,
  useRegisterDeviceMutation,
  useDeregisterDeviceMutation,
} = adminApi;
