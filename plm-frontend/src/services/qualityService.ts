import { request } from './request';
import type { PageResult } from '@/types/common';
import type {
  QualityDefectCodeItem,
  QualityDefectCodeQuery,
  QualityDefectCodeSaveParams,
  QualityIssueActionItem,
  QualityIssueActionSaveParams,
  QualityIssueActionVerifyParams,
  QualityIssueCloseParams,
  QualityIssueDetail,
  QualityIssueEcrResult,
  QualityIssueItem,
  QualityIssueQuery,
  QualityIssueSaveParams,
  QualityIssueToEcrParams,
  QualityIssueUpdateParams,
} from '@/types/quality';

/** 缺陷代码库 */
export const qualityDefectCodeService = {
  page: (params: QualityDefectCodeQuery): Promise<PageResult<QualityDefectCodeItem>> =>
    request<PageResult<QualityDefectCodeItem>>({
      method: 'GET',
      url: '/quality/defect-codes',
      params,
    }),

  options: (): Promise<QualityDefectCodeItem[]> =>
    request<QualityDefectCodeItem[]>({ method: 'GET', url: '/quality/defect-codes/options' }),

  detail: (defectCodeId: number): Promise<QualityDefectCodeItem> =>
    request<QualityDefectCodeItem>({ method: 'GET', url: `/quality/defect-codes/${defectCodeId}` }),

  create: (data: QualityDefectCodeSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/quality/defect-codes', data }),

  update: (defectCodeId: number, data: QualityDefectCodeSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/quality/defect-codes/${defectCodeId}`, data }),

  remove: (defectCodeId: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/quality/defect-codes/${defectCodeId}` }),
};

/** 质量问题单 */
export const qualityIssueService = {
  page: (params: QualityIssueQuery): Promise<PageResult<QualityIssueItem>> =>
    request<PageResult<QualityIssueItem>>({ method: 'GET', url: '/quality/issues', params }),

  detail: (issueId: number): Promise<QualityIssueDetail> =>
    request<QualityIssueDetail>({ method: 'GET', url: `/quality/issues/${issueId}` }),

  create: (data: QualityIssueSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/quality/issues', data }),

  update: (issueId: number, data: QualityIssueUpdateParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/quality/issues/${issueId}`, data }),

  remove: (issueId: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/quality/issues/${issueId}` }),

  listActions: (issueId: number): Promise<QualityIssueActionItem[]> =>
    request<QualityIssueActionItem[]>({ method: 'GET', url: `/quality/issues/${issueId}/actions` }),

  addAction: (issueId: number, data: QualityIssueActionSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `/quality/issues/${issueId}/actions`, data }),

  updateAction: (
    issueId: number,
    actionId: number,
    data: QualityIssueActionSaveParams,
  ): Promise<void> =>
    request<void>({
      method: 'PUT',
      url: `/quality/issues/${issueId}/actions/${actionId}`,
      data,
    }),

  completeAction: (issueId: number, actionId: number): Promise<void> =>
    request<void>({
      method: 'POST',
      url: `/quality/issues/${issueId}/actions/${actionId}/complete`,
    }),

  verifyAction: (
    issueId: number,
    actionId: number,
    data: QualityIssueActionVerifyParams,
  ): Promise<void> =>
    request<void>({
      method: 'POST',
      url: `/quality/issues/${issueId}/actions/${actionId}/verify`,
      data,
    }),

  deleteAction: (issueId: number, actionId: number): Promise<void> =>
    request<void>({
      method: 'DELETE',
      url: `/quality/issues/${issueId}/actions/${actionId}`,
    }),

  close: (issueId: number, data: QualityIssueCloseParams): Promise<void> =>
    request<void>({ method: 'POST', url: `/quality/issues/${issueId}/close`, data }),

  toEcr: (issueId: number, data: QualityIssueToEcrParams): Promise<QualityIssueEcrResult> =>
    request<QualityIssueEcrResult>({
      method: 'POST',
      url: `/quality/issues/${issueId}/to-ecr`,
      data,
    }),
};
