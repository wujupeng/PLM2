import { request } from '@/services/request';
import type { PageResult } from '@/types/common';
import type {
  MdmChangeRequestItem,
  MdmChangeRequestQueryParams,
  MdmChangeRequestSaveParams,
  MdmCodeIssueItem,
  MdmCodeIssueQueryParams,
  MdmCodeIssueSaveParams,
  MdmCodeStandardItem,
  MdmCodeStandardQueryParams,
  MdmCodeStandardSaveParams,
  MdmDistributionItem,
  MdmDistributionQueryParams,
  MdmDistributionSaveParams,
  MdmDomainItem,
  MdmDomainQueryParams,
  MdmDomainSaveParams,
  MdmQualityCheckItem,
  MdmQualityCheckQueryParams,
  MdmQualityCheckSaveParams,
  MdmSourceItem,
  MdmSourceQueryParams,
  MdmSourceSaveParams,
  MdmSyncLogItem,
  MdmSyncLogQueryParams,
  MdmSyncLogSaveParams,
} from '@/types/mdm';

/** G1-N8 WBS T007 主数据平台（后端 Base: /platform/mdm）服务定义。 */

const BASE = '/platform/mdm';

/* ---------------- 1. 主数据域 ---------------- */

export const mdmDomainService = {
  page: (params: MdmDomainQueryParams): Promise<PageResult<MdmDomainItem>> =>
    request<PageResult<MdmDomainItem>>({ method: 'GET', url: `${BASE}/domains`, params }),

  detail: (id: number): Promise<MdmDomainItem> =>
    request<MdmDomainItem>({ method: 'GET', url: `${BASE}/domains/${id}` }),

  create: (data: MdmDomainSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/domains`, data }),

  update: (id: number, data: MdmDomainSaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/domains/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/domains/${id}` }),
};

/* ---------------- 2. 权威源登记 ---------------- */

export const mdmSourceService = {
  page: (params: MdmSourceQueryParams): Promise<PageResult<MdmSourceItem>> =>
    request<PageResult<MdmSourceItem>>({ method: 'GET', url: `${BASE}/sources`, params }),

  detail: (id: number): Promise<MdmSourceItem> =>
    request<MdmSourceItem>({ method: 'GET', url: `${BASE}/sources/${id}` }),

  create: (data: MdmSourceSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/sources`, data }),

  update: (id: number, data: MdmSourceSaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/sources/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/sources/${id}` }),
};

/* ---------------- 3. 编码标准 ---------------- */

export const mdmCodeStandardService = {
  page: (params: MdmCodeStandardQueryParams): Promise<PageResult<MdmCodeStandardItem>> =>
    request<PageResult<MdmCodeStandardItem>>({ method: 'GET', url: `${BASE}/code-standards`, params }),

  detail: (id: number): Promise<MdmCodeStandardItem> =>
    request<MdmCodeStandardItem>({ method: 'GET', url: `${BASE}/code-standards/${id}` }),

  create: (data: MdmCodeStandardSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/code-standards`, data }),

  update: (id: number, data: MdmCodeStandardSaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/code-standards/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/code-standards/${id}` }),
};

/* ---------------- 4. 主数据分发 ---------------- */

export const mdmDistributionService = {
  page: (params: MdmDistributionQueryParams): Promise<PageResult<MdmDistributionItem>> =>
    request<PageResult<MdmDistributionItem>>({ method: 'GET', url: `${BASE}/distributions`, params }),

  detail: (id: number): Promise<MdmDistributionItem> =>
    request<MdmDistributionItem>({ method: 'GET', url: `${BASE}/distributions/${id}` }),

  create: (data: MdmDistributionSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/distributions`, data }),

  update: (id: number, data: MdmDistributionSaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/distributions/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/distributions/${id}` }),
};

/* ---------------- 5. 变更申请 ---------------- */

export const mdmChangeRequestService = {
  page: (params: MdmChangeRequestQueryParams): Promise<PageResult<MdmChangeRequestItem>> =>
    request<PageResult<MdmChangeRequestItem>>({ method: 'GET', url: `${BASE}/change-requests`, params }),

  detail: (id: number): Promise<MdmChangeRequestItem> =>
    request<MdmChangeRequestItem>({ method: 'GET', url: `${BASE}/change-requests/${id}` }),

  create: (data: MdmChangeRequestSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/change-requests`, data }),

  update: (id: number, data: MdmChangeRequestSaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/change-requests/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/change-requests/${id}` }),
};

/* ---------------- 6. 数据质量校验 ---------------- */

export const mdmQualityCheckService = {
  page: (params: MdmQualityCheckQueryParams): Promise<PageResult<MdmQualityCheckItem>> =>
    request<PageResult<MdmQualityCheckItem>>({ method: 'GET', url: `${BASE}/quality-checks`, params }),

  detail: (id: number): Promise<MdmQualityCheckItem> =>
    request<MdmQualityCheckItem>({ method: 'GET', url: `${BASE}/quality-checks/${id}` }),

  create: (data: MdmQualityCheckSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/quality-checks`, data }),

  update: (id: number, data: MdmQualityCheckSaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/quality-checks/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/quality-checks/${id}` }),
};

/* ---------------- 7. 同步日志 ---------------- */

export const mdmSyncLogService = {
  page: (params: MdmSyncLogQueryParams): Promise<PageResult<MdmSyncLogItem>> =>
    request<PageResult<MdmSyncLogItem>>({ method: 'GET', url: `${BASE}/sync-logs`, params }),

  detail: (id: number): Promise<MdmSyncLogItem> =>
    request<MdmSyncLogItem>({ method: 'GET', url: `${BASE}/sync-logs/${id}` }),

  create: (data: MdmSyncLogSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/sync-logs`, data }),

  update: (id: number, data: MdmSyncLogSaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/sync-logs/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/sync-logs/${id}` }),
};

/* ---------------- 8. 编码发放 ---------------- */

export const mdmCodeIssueService = {
  page: (params: MdmCodeIssueQueryParams): Promise<PageResult<MdmCodeIssueItem>> =>
    request<PageResult<MdmCodeIssueItem>>({ method: 'GET', url: `${BASE}/code-issues`, params }),

  detail: (id: number): Promise<MdmCodeIssueItem> =>
    request<MdmCodeIssueItem>({ method: 'GET', url: `${BASE}/code-issues/${id}` }),

  create: (data: MdmCodeIssueSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/code-issues`, data }),

  update: (id: number, data: MdmCodeIssueSaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/code-issues/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/code-issues/${id}` }),
};
