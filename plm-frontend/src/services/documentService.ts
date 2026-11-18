import { request } from './request';
import type { PageResult } from '@/types/common';
import type {
  DocCategoryItem,
  DocCategoryQuery,
  DocCategorySaveParams,
  DocDocumentItem,
  DocDocumentQuery,
  DocDocumentSaveParams,
  DocDocumentDetail,
  DocVersionItem,
  DocVersionSaveParams,
  DocVersionCompareResponse,
  DocReviewTaskItem,
  DocReviewDecideParams,
  DocSubmitParams,
  DocApprovalLogItem,
  DocRelationItem,
  DocRelationSaveParams,
  DocDistributionItem,
  DocDistributionSaveParams,
} from '@/types/document';

/** 文档分类 */
export const docCategoryService = {
  page: (params: DocCategoryQuery): Promise<PageResult<DocCategoryItem>> =>
    request<PageResult<DocCategoryItem>>({ method: 'GET', url: '/document/categories', params }),

  options: (): Promise<DocCategoryItem[]> =>
    request<DocCategoryItem[]>({ method: 'GET', url: '/document/categories/options' }),

  detail: (categoryId: number): Promise<DocCategoryItem> =>
    request<DocCategoryItem>({ method: 'GET', url: `/document/categories/${categoryId}` }),

  create: (data: DocCategorySaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/document/categories', data }),

  update: (categoryId: number, data: DocCategorySaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/document/categories/${categoryId}`, data }),

  remove: (categoryId: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/document/categories/${categoryId}` }),
};

/** 图文档 */
export const docService = {
  page: (params: DocDocumentQuery): Promise<PageResult<DocDocumentItem>> =>
    request<PageResult<DocDocumentItem>>({ method: 'GET', url: '/document/documents', params }),

  options: (): Promise<DocDocumentItem[]> =>
    request<DocDocumentItem[]>({ method: 'GET', url: '/document/documents/options' }),

  byMaterial: (materialCode: string): Promise<DocDocumentItem[]> =>
    request<DocDocumentItem[]>({
      method: 'GET',
      url: `/document/documents/by-material/${materialCode}`,
    }),

  detail: (documentId: number): Promise<DocDocumentDetail> =>
    request<DocDocumentDetail>({ method: 'GET', url: `/document/documents/${documentId}` }),

  create: (data: DocDocumentSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/document/documents', data }),

  update: (documentId: number, data: DocDocumentSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/document/documents/${documentId}`, data }),

  remove: (documentId: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/document/documents/${documentId}` }),

  versions: (documentId: number): Promise<DocVersionItem[]> =>
    request<DocVersionItem[]>({ method: 'GET', url: `/document/documents/${documentId}/versions` }),

  compareVersions: (
    documentId: number,
    leftVersionNo: string,
    rightVersionNo: string,
  ): Promise<DocVersionCompareResponse> =>
    request<DocVersionCompareResponse>({
      method: 'GET',
      url: `/document/documents/${documentId}/versions/compare`,
      params: { leftVersionNo, rightVersionNo },
    }),

  addVersion: (documentId: number, data: DocVersionSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `/document/documents/${documentId}/versions`, data }),

  activateVersion: (documentId: number, versionId: number): Promise<void> =>
    request<void>({
      method: 'PUT',
      url: `/document/documents/${documentId}/versions/${versionId}/activate`,
    }),

  submit: (documentId: number, data: DocSubmitParams): Promise<void> =>
    request<void>({ method: 'POST', url: `/document/documents/${documentId}/submit`, data }),

  reviewTasks: (documentId: number, versionNo?: string): Promise<DocReviewTaskItem[]> =>
    request<DocReviewTaskItem[]>({
      method: 'GET',
      url: `/document/documents/${documentId}/review-tasks`,
      params: { versionNo },
    }),

  decide: (taskId: number, data: DocReviewDecideParams): Promise<void> =>
    request<void>({
      method: 'POST',
      url: `/document/documents/review-tasks/${taskId}/decide`,
      data,
    }),

  release: (documentId: number, data: { versionNo?: string; comment?: string }): Promise<void> =>
    request<void>({ method: 'POST', url: `/document/documents/${documentId}/release`, data }),

  obsolete: (documentId: number, data: { comment?: string }): Promise<void> =>
    request<void>({ method: 'POST', url: `/document/documents/${documentId}/obsolete`, data }),

  relations: (documentId: number): Promise<DocRelationItem[]> =>
    request<DocRelationItem[]>({ method: 'GET', url: `/document/documents/${documentId}/relations` }),

  addRelation: (documentId: number, data: DocRelationSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `/document/documents/${documentId}/relations`, data }),

  removeRelation: (relationId: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/document/documents/relations/${relationId}` }),

  distributions: (documentId: number): Promise<DocDistributionItem[]> =>
    request<DocDistributionItem[]>({
      method: 'GET',
      url: `/document/documents/${documentId}/distributions`,
    }),

  addDistribution: (documentId: number, data: DocDistributionSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `/document/documents/${documentId}/distributions`, data }),

  recallDistribution: (distributionId: number): Promise<void> =>
    request<void>({
      method: 'PUT',
      url: `/document/documents/distributions/${distributionId}/recall`,
    }),

  approvalLogs: (documentId: number): Promise<DocApprovalLogItem[]> =>
    request<DocApprovalLogItem[]>({
      method: 'GET',
      url: `/document/documents/${documentId}/approval-logs`,
    }),
};
