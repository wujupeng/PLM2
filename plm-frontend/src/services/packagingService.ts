import { request } from './request';
import type { PageResult } from '@/types/common';
import type {
  PackagingItem,
  PackagingQuery,
  PackagingSaveParams,
} from '@/types/packaging';

/** 包装标签技术要求 */
export const packagingService = {
  page: (params: PackagingQuery): Promise<PageResult<PackagingItem>> =>
    request<PageResult<PackagingItem>>({ method: 'GET', url: '/packaging/specs', params }),

  detail: (packagingId: number): Promise<PackagingItem> =>
    request<PackagingItem>({ method: 'GET', url: `/packaging/specs/${packagingId}` }),

  byProduct: (productCode: string): Promise<PackagingItem[]> =>
    request<PackagingItem[]>({ method: 'GET', url: `/packaging/specs/by-product/${productCode}` }),

  create: (data: PackagingSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/packaging/specs', data }),

  update: (packagingId: number, data: PackagingSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/packaging/specs/${packagingId}`, data }),

  remove: (packagingId: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/packaging/specs/${packagingId}` }),

  release: (packagingId: number): Promise<void> =>
    request<void>({ method: 'POST', url: `/packaging/specs/${packagingId}/release` }),
};
