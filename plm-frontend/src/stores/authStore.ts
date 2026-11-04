import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserInfo, LoginParams, LoginResult } from '@/types/common';
import { authService } from '@/services/authService';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  userInfo: UserInfo | null;
  isAuthenticated: boolean;
  login: (params: LoginParams) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      userInfo: null,
      isAuthenticated: false,

      login: async (params: LoginParams) => {
        const result: LoginResult = await authService.login(params);
        set({
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          userInfo: result.userInfo,
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({
          accessToken: null,
          refreshToken: null,
          userInfo: null,
          isAuthenticated: false,
        });
        localStorage.removeItem('plm-auth');
      },

      refreshAccessToken: async () => {
        const refreshToken = get().refreshToken;
        if (!refreshToken) {
          get().logout();
          return;
        }
        try {
          const result = await authService.refresh(refreshToken);
          set({ accessToken: result.accessToken });
        } catch {
          get().logout();
        }
      },

      hasPermission: (permission: string) => {
        const { userInfo } = get();
        if (!userInfo) return false;
        return userInfo.permissions.includes(permission) || userInfo.permissions.includes('*');
      },

      hasRole: (role: string) => {
        const { userInfo } = get();
        if (!userInfo) return false;
        return userInfo.roles.includes(role);
      },
    }),
    {
      name: 'plm-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        userInfo: state.userInfo,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);