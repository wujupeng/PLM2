import { request } from './request';
import type { PageResult } from '@/types/common';
import type {
  ComplianceItem,
  ComplianceQuery,
  ComplianceSaveParams,
  ComplianceCheckResult,
} from '@/types/compliance';

/** 环保合规 */
export const complianceService = {
  page: (params: ComplianceQuery): Promise<PageResult<ComplianceItem>> =>
    request<PageResult<ComplianceItem>>({ method: 'GET', url: '/compliance/records', params }),

  detail: (complianceId: number): Promise<ComplianceItem> =>
    request<ComplianceItem>({ method: 'GET', url: `/compliance/records/${complianceId}` }),

  byMaterial: (materialCode: string): Promise<ComplianceItem[]> =>
    request<ComplianceItem[]>({ method: 'GET', url: `/compliance/records/by-material/${materialCode}` }),

  expiring: (days?: number): Promise<ComplianceItem[]> =>
    request<ComplianceItem[]>({ method: 'GET', url: '/compliance/records/expiring', params: { days } }),

  checkMaterial: (materialCode: string): Promise<ComplianceCheckResult> =>
    request<ComplianceCheckResult>({
      method: 'GET',
      url: '/compliance/records/check',
      params: { materialCode },
    }),

  create: (data: ComplianceSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/compliance/records', data }),

  update: (complianceId: number, data: ComplianceSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/compliance/records/${complianceId}`, data }),

  remove: (complianceId: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/compliance/records/${complianceId}` }),

  check: (complianceId: number): Promise<ComplianceItem> =>
    request<ComplianceItem>({ method: 'POST', url: `/compliance/records/${complianceId}/check` }),
};
