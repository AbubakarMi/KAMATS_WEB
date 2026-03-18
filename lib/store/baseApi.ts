import { createApi, type BaseQueryFn } from '@reduxjs/toolkit/query/react';
import type { AxiosError, AxiosRequestConfig } from 'axios';
import { apiClient } from '@/lib/api/client';
import type { ApiError } from '@/lib/api/types/common';

// Custom base query using our configured Axios instance
// (which already handles token refresh, case transform, etc.)
interface AxiosBaseQueryArgs {
  url: string;
  method?: AxiosRequestConfig['method'];
  data?: unknown;
  params?: Record<string, unknown> | object;
  headers?: Record<string, string>;
}

const axiosBaseQuery: BaseQueryFn<AxiosBaseQueryArgs, unknown, ApiError> = async ({
  url,
  method = 'GET',
  data,
  params,
  headers,
}) => {
  try {
    const result = await apiClient({
      url,
      method,
      data,
      params,
      headers,
    });
    // Unwrap the response envelope — return data.data for single resources
    // or the full response for paginated (has pagination field)
    const body = result.data;
    if (body && 'pagination' in body) {
      return { data: body };
    }
    return { data: body?.data ?? body };
  } catch (axiosError) {
    const err = axiosError as AxiosError<ApiError>;
    return {
      error: err.response?.data ?? {
        status: err.response?.status ?? 500,
        code: 'NETWORK_ERROR',
        message: err.message,
        traceId: '',
      },
    };
  }
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery,
  tagTypes: [
    'User',
    'Store',
    'Device',
    'Config',
    'Supplier',
    'PR',
    'PO',
    'DVR',
    'Inspection',
    'WeighbridgeTicket',
    'GRN',
    'Lot',
    'Item',
    'Location',
    'Ledger',
    'StockCount',
    'STO',
    'Dispatch',
    'Receipt',
    'Consumption',
    'DosageConfig',
    'WriteOff',
    'ReturnOrder',
    'Alert',
    'AlertRule',
    'AuditEvent',
    'Report',
  ],
  endpoints: () => ({}),
});
