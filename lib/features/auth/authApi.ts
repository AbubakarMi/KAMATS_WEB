import { baseApi } from '@/lib/store/baseApi';
import { endpoints } from '@/lib/api/endpoints';
import type {
  LoginRequest,
  LoginResponse,
  RefreshRequest,
  RefreshResponse,
  LogoutRequest,
} from '@/lib/api/types/auth';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({
        url: endpoints.auth.login,
        method: 'POST',
        data: body,
      }),
    }),

    refreshToken: builder.mutation<RefreshResponse, RefreshRequest>({
      query: (body) => ({
        url: endpoints.auth.refresh,
        method: 'POST',
        data: body,
      }),
    }),

    logout: builder.mutation<{ message: string }, LogoutRequest>({
      query: (body) => ({
        url: endpoints.auth.logout,
        method: 'POST',
        data: body,
      }),
    }),
  }),
});

export const { useLoginMutation, useLogoutMutation } = authApi;
