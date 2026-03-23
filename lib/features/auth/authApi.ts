import { baseApi } from '@/lib/store/baseApi';
import { endpoints } from '@/lib/api/endpoints';
import type {
  LoginRequest,
  LoginResponse,
  RefreshRequest,
  RefreshResponse,
  LogoutRequest,
  PinSetupRequest,
  PinSetupResponse,
  PinVerifyRequest,
  PinVerifyResponse,
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

    pinSetup: builder.mutation<PinSetupResponse, PinSetupRequest>({
      query: (body) => ({
        url: endpoints.auth.pinSetup,
        method: 'POST',
        data: body,
      }),
    }),

    pinVerify: builder.mutation<PinVerifyResponse, PinVerifyRequest>({
      query: (body) => ({
        url: endpoints.auth.pinVerify,
        method: 'POST',
        data: body,
      }),
    }),
  }),
});

export const { useLoginMutation, useLogoutMutation, usePinSetupMutation, usePinVerifyMutation } = authApi;
