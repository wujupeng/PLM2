import { request } from './request';
import type { PageResult } from '@/types/common';
import type {
  InspectionItemSaveParams,
  InspectionMatchParams,
  InspectionSpecDetail,
  InspectionSpecItem,
  InspectionSpecQuery,
  InspectionSpecSaveParams,
} from '@/types/inspection';

/** 检验规范 */
export const inspectionSpecService = {
  page: (params: InspectionSpecQuery): Promise<PageResult<InspectionSpecItem>> =>
    request<PageResult<InspectionSpecItem>>({ method: 'GET', url: '/inspection/specs', params }),

  detail: (specId: number): Promise<InspectionSpecDetail> =>
    request<InspectionSpecDetail>({ method: 'GET', url: `/inspection/specs/${specId}` }),

  byMaterial: (materialCode: string): Promise<InspectionSpecItem[]> =>
    request<InspectionSpecItem[]>({
      method: 'GET',
      url: `/inspection/specs/by-material/${materialCode}`,
    }),

  byProduct: (productCode: string): Promise<InspectionSpecItem[]> =>
    request<InspectionSpecItem[]>({
      method: 'GET',
      url: `/inspection/specs/by-product/${productCode}`,
    }),

  match: (params: InspectionMatchParams): Promise<InspectionSpecItem | null> =>
    request<InspectionSpecItem | null>({ method: 'GET', url: '/inspection/specs/match', params }),

  create: (data: InspectionSpecSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/inspection/specs', data }),

  update: (specId: number, data: InspectionSpecSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/inspection/specs/${specId}`, data }),

  remove: (specId: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/inspection/specs/${specId}` }),

  saveItems: (specId: number, items: InspectionItemSaveParams[]): Promise<void> =>
    request<void>({ method: 'PUT', url: `/inspection/specs/${specId}/items`, data: items }),

  release: (specId: number): Promise<void> =>
    request<void>({ method: 'POST', url: `/inspection/specs/${specId}/release` }),
};
