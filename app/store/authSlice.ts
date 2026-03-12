import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { UserProfile, LoginResponse, RefreshResponse } from '~/api/types/auth';
import { setTokens, clearTokens } from '~/api/client';

interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  activeStoreId: string | null;
}

const isBrowser = typeof window !== 'undefined';

function safeGetItem(key: string): string | null {
  if (!isBrowser) return null;
  return localStorage.getItem(key);
}

// Restore from localStorage on init
const initialState: AuthState = {
  user: (() => {
    try {
      const u = safeGetItem('kamats_user');
      return u ? JSON.parse(u) : null;
    } catch { return null; }
  })(),
  accessToken: safeGetItem('kamats_access_token'),
  refreshToken: safeGetItem('kamats_refresh_token'),
  activeStoreId: safeGetItem('kamats_active_store'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<LoginResponse>) {
      const { accessToken, refreshToken, user } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.activeStoreId = user.storeId ?? user.storeAssignments[0]?.storeId ?? null;

      setTokens(accessToken, refreshToken);
      localStorage.setItem('kamats_user', JSON.stringify(user));
      if (state.activeStoreId) {
        localStorage.setItem('kamats_active_store', state.activeStoreId);
      }
    },

    refreshTokens(state, action: PayloadAction<RefreshResponse>) {
      const { accessToken, refreshToken } = action.payload;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      setTokens(accessToken, refreshToken);
    },

    setActiveStore(state, action: PayloadAction<string>) {
      state.activeStoreId = action.payload;
      localStorage.setItem('kamats_active_store', action.payload);
    },

    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.activeStoreId = null;
      clearTokens();
      localStorage.removeItem('kamats_user');
      localStorage.removeItem('kamats_active_store');
    },
  },
});

export const { setCredentials, refreshTokens, setActiveStore, logout } = authSlice.actions;
export default authSlice.reducer;
