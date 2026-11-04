import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { message } from 'antd';
import NProgress from 'nprogress';
import { useAuthStore } from '@/stores/authStore';
import { ApiResponse } from '@/types/common';

NProgress.configure({ showSpinner: false });

const BASE_URL = '/api';
const AUTH_HEADER = 'Authorization';
const BEARER_PREFIX = 'Bearer ';
const TRACE_ID_HEADER = 'X-Trace-Id';

const instance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    NProgress.start();
    const token = useAuthStore.getState().accessToken;
    if (token && config.headers) {
      config.headers[AUTH_HEADER] = `${BEARER_PREFIX}${token}`;
    }
    const traceId = generateTraceId();
    if (config.headers) {
      config.headers[TRACE_ID_HEADER] = traceId;
    }
    return config;
  },
  (error) => {
    NProgress.done();
    return Promise.reject(error);
  },
);

instance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<unknown>>) => {
    NProgress.done();
    const data = response.data;
    if (data && typeof data.code !== 'undefined') {
      if (data.code === 200) {
        return response;
      }
      message.error(data.message || '请求失败');
      return Promise.reject(new Error(data.message || '请求失败'));
    }
    return response;
  },
  (error) => {
    NProgress.done();
    if (error.response) {
      const { status, data } = error.response;
      switch (status) {
        case 401:
          message.error('登录已过期，请重新登录');
          useAuthStore.getState().logout();
          window.location.href = '/login';
          break;
        case 403:
          message.error('没有权限访问该资源');
          break;
        case 429:
          message.error('请求过于频繁，请稍后再试');
          break;
        default:
          message.error(data?.message || `请求错误 (${status})`);
      }
    } else if (error.request) {
      message.error('网络异常，请检查网络连接');
    } else {
      message.error(error.message || '未知错误');
    }
    return Promise.reject(error);
  },
);

function generateTraceId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
}

export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await instance.request<ApiResponse<T>>(config);
  return response.data.data;
}

export default instance;