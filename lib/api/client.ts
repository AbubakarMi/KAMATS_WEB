import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { camelToSnakeDeep, snakeToCamelDeep } from '@/lib/utils/caseTransform';
import type { ApiError } from './types/common';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1';

// --- Axios Instance ---
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

// --- Token Storage ---
const TOKEN_KEY = 'kamats_access_token';
const REFRESH_KEY = 'kamats_refresh_token';

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens(access: string, refresh: string): void {
  localStorage.setItem(TOKEN_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

// --- Request Interceptor ---
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // Attach Bearer token
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Attach store context
  const activeStore = localStorage.getItem('kamats_active_store');
  if (activeStore) {
    config.headers['X-Store-Id'] = activeStore;
  }

  // Attach idempotency key
  config.headers['X-Request-Id'] = uuidv4();

  // Transform request body: camelCase → snake_case
  if (config.data && !(config.data instanceof FormData)) {
    config.data = camelToSnakeDeep(config.data);
  }

  // Transform query params: camelCase → snake_case
  if (config.params) {
    config.params = camelToSnakeDeep(config.params);
  }

  return config;
});

// --- Token Refresh Queue ---
let isRefreshing = false;
let refreshQueue: {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}[] = [];

function processQueue(error: unknown, token: string | null) {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });
  refreshQueue = [];
}

async function refreshAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error('No refresh token available');

  // Use a separate axios instance to avoid interceptor loops
  const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
    refresh_token: refreshToken,
  });

  const { access_token, refresh_token } = response.data.data;
  setTokens(access_token, refresh_token);
  return access_token;
}

// --- Auth endpoints that should NOT trigger token refresh ---
const AUTH_ENDPOINTS = ['/auth/login', '/auth/refresh', '/auth/logout'];

function isAuthEndpoint(url: string | undefined): boolean {
  if (!url) return false;
  return AUTH_ENDPOINTS.some((ep) => url.endsWith(ep));
}

// --- Response Interceptor ---
apiClient.interceptors.response.use(
  (response) => {
    // Transform response: snake_case → camelCase
    if (response.data) {
      response.data = snakeToCamelDeep(response.data);
    }
    return response;
  },
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // 401 — Token refresh (skip for auth endpoints like login/refresh/logout)
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint(originalRequest.url)
    ) {
      if (isRefreshing) {
        // Queue this request until refresh completes
        return new Promise((resolve, reject) => {
          refreshQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(apiClient(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // 429 — Rate limited, retry with Retry-After
    if (error.response?.status === 429) {
      const retryAfter = Number(error.response.headers['retry-after']) || 5;
      await new Promise((r) => setTimeout(r, retryAfter * 1000));
      return apiClient(originalRequest);
    }

    // 403 — Forbidden (permission denied)
    if (error.response?.status === 403) {
      if (error.response.data) {
        error.response.data = snakeToCamelDeep(error.response.data) as ApiError;
      }
      const method = originalRequest.method?.toUpperCase();
      if (method && method !== 'GET') {
        toast.error('Permission Denied', {
          description:
            (error.response.data as ApiError)?.message ??
            'You do not have permission to perform this action.',
        });
      }
      return Promise.reject(error);
    }

    // Transform error response to camelCase
    if (error.response?.data) {
      error.response.data = snakeToCamelDeep(error.response.data) as ApiError;
    }

    return Promise.reject(error);
  }
);

export default apiClient;
