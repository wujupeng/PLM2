import { request } from './request';
import type { PageResult } from '@/types/common';
import type {
  HarnessItem,
  HarnessQuery,
  HarnessSaveParams,
  HarnessDetail,
} from '@/types/harness';

/** 线束端子 */
export const harnessService = {
  page: (params: HarnessQuery): Promise<PageResult<HarnessItem>> =>
    request<PageResult<HarnessItem>>({ method: 'GET', url: '/harness/harnesses', params }),

  detail: (harnessId: number): Promise<HarnessDetail> =>
    request<HarnessDetail>({ method: 'GET', url: `/harness/harnesses/${harnessId}` }),

  byMaterial: (materialCode: string): Promise<HarnessItem[]> =>
    request<HarnessItem[]>({ method: 'GET', url: `/harness/harnesses/by-material/${materialCode}` }),

  create: (data: HarnessSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/harness/harnesses', data }),

  update: (harnessId: number, data: HarnessSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/harness/harnesses/${harnessId}`, data }),

  remove: (harnessId: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/harness/harnesses/${harnessId}` }),

  release: (harnessId: number): Promise<void> =>
    request<void>({ method: 'POST', url: `/harness/harnesses/${harnessId}/release` }),
};
