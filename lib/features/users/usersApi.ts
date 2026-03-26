import { baseApi } from '@/lib/store/baseApi';
import { endpoints } from '@/lib/api/endpoints';
import type { User } from '@/lib/api/types/admin';

interface UserListParams {
  storeId?: string;
  role?: string;
  isActive?: boolean;
}

export const usersApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAllUsers: builder.query<User[], UserListParams | void>({
      query: (params) => ({ url: endpoints.users.list, params: params || undefined }),
      transformResponse: (response: User[] | { data: User[] }) =>
        Array.isArray(response) ? response : response?.data ?? [],
      providesTags: ['User'],
    }),
  }),
});

export const { useGetAllUsersQuery } = usersApi;
