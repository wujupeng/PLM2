import { request } from './request';
import { LoginParams, LoginResult } from '@/types/common';

export const authService = {
  login: (params: LoginParams): Promise<LoginResult> => {
    return request<LoginResult>({
      method: 'POST',
      url: '/auth/login',
      data: params,
    });
  },

  refresh: (refreshToken: string): Promise<LoginResult> => {
    return request<LoginResult>({
      method: 'POST',
      url: '/auth/refresh',
      data: { refreshToken },
    });
  },

  logout: (): Promise<void> => {
    return request<void>({
      method: 'POST',
      url: '/auth/logout',
    });
  },

  getCurrentUser: () => {
    return request({
      method: 'GET',
      url: '/auth/me',
    });
  },
};