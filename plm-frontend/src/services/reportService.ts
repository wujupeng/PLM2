import { request } from '@/services/request';
import type { PageResult } from '@/types/common';
import type {
  ReportDashboardItem,
  ReportDashboardSaveParams,
  ReportDatasetItem,
  ReportDatasetSaveParams,
  ReportDefinitionItem,
  ReportDefinitionSaveParams,
  ReportExportLogItem,
  ReportExportLogSaveParams,
  ReportIndicatorItem,
  ReportIndicatorSaveParams,
  ReportQuery,
  ReportStats,
} from '@/types/report';

/** G1-N2 公共平台底座—报表平台（后端 WBS T010）服务定义。 */

const BASE = '/platform/report';

/* ---------------- 1. 指标口径 ---------------- */

export const reportIndicatorService = {
  pageIndicators: (params: ReportQuery): Promise<PageResult<ReportIndicatorItem>> =>
    request<PageResult<ReportIndicatorItem>>({ method: 'GET', url: `${BASE}/indicators`, params }),

  stats: (): Promise<ReportStats> => request<ReportStats>({ method: 'GET', url: `${BASE}/indicators/stats` }),

  detail: (id: number): Promise<ReportIndicatorItem> =>
    request<ReportIndicatorItem>({ method: 'GET', url: `${BASE}/indicators/${id}` }),

  create: (data: ReportIndicatorSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/indicators`, data }),

  update: (id: number, data: ReportIndicatorSaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/indicators/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/indicators/${id}` }),

  publish: (id: number): Promise<ReportIndicatorItem> =>
    request<ReportIndicatorItem>({ method: 'POST', url: `${BASE}/indicators/${id}/publish` }),

  disable: (id: number): Promise<ReportIndicatorItem> =>
    request<ReportIndicatorItem>({ method: 'POST', url: `${BASE}/indicators/${id}/disable` }),
};

/* ---------------- 2. 数据集市 ---------------- */

export const reportDatasetService = {
  pageDatasets: (params: ReportQuery): Promise<PageResult<ReportDatasetItem>> =>
    request<PageResult<ReportDatasetItem>>({ method: 'GET', url: `${BASE}/datasets`, params }),

  stats: (): Promise<ReportStats> => request<ReportStats>({ method: 'GET', url: `${BASE}/datasets/stats` }),

  detail: (id: number): Promise<ReportDatasetItem> =>
    request<ReportDatasetItem>({ method: 'GET', url: `${BASE}/datasets/${id}` }),

  create: (data: ReportDatasetSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/datasets`, data }),

  update: (id: number, data: ReportDatasetSaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/datasets/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/datasets/${id}` }),

  refresh: (id: number): Promise<ReportDatasetItem> =>
    request<ReportDatasetItem>({ method: 'POST', url: `${BASE}/datasets/${id}/refresh` }),

  disable: (id: number): Promise<ReportDatasetItem> =>
    request<ReportDatasetItem>({ method: 'POST', url: `${BASE}/datasets/${id}/disable` }),
};

/* ---------------- 3. 报表定义 ---------------- */

export const reportDefinitionService = {
  pageDefinitions: (params: ReportQuery): Promise<PageResult<ReportDefinitionItem>> =>
    request<PageResult<ReportDefinitionItem>>({ method: 'GET', url: `${BASE}/definitions`, params }),

  stats: (): Promise<ReportStats> => request<ReportStats>({ method: 'GET', url: `${BASE}/definitions/stats` }),

  detail: (id: number): Promise<ReportDefinitionItem> =>
    request<ReportDefinitionItem>({ method: 'GET', url: `${BASE}/definitions/${id}` }),

  create: (data: ReportDefinitionSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/definitions`, data }),

  update: (id: number, data: ReportDefinitionSaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/definitions/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/definitions/${id}` }),

  publish: (id: number): Promise<ReportDefinitionItem> =>
    request<ReportDefinitionItem>({ method: 'POST', url: `${BASE}/definitions/${id}/publish` }),

  disable: (id: number): Promise<ReportDefinitionItem> =>
    request<ReportDefinitionItem>({ method: 'POST', url: `${BASE}/definitions/${id}/disable` }),
};

/* ---------------- 4. 导出审计 ---------------- */

export const reportExportLogService = {
  pageExportLogs: (params: ReportQuery): Promise<PageResult<ReportExportLogItem>> =>
    request<PageResult<ReportExportLogItem>>({ method: 'GET', url: `${BASE}/export-logs`, params }),

  stats: (): Promise<ReportStats> => request<ReportStats>({ method: 'GET', url: `${BASE}/export-logs/stats` }),

  detail: (id: number): Promise<ReportExportLogItem> =>
    request<ReportExportLogItem>({ method: 'GET', url: `${BASE}/export-logs/${id}` }),

  create: (data: ReportExportLogSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/export-logs`, data }),

  update: (id: number, data: ReportExportLogSaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/export-logs/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/export-logs/${id}` }),
};

/* ---------------- 5. 经营驾驶舱 ---------------- */

export const reportDashboardService = {
  pageDashboards: (params: ReportQuery): Promise<PageResult<ReportDashboardItem>> =>
    request<PageResult<ReportDashboardItem>>({ method: 'GET', url: `${BASE}/dashboards`, params }),

  stats: (): Promise<ReportStats> => request<ReportStats>({ method: 'GET', url: `${BASE}/dashboards/stats` }),

  detail: (id: number): Promise<ReportDashboardItem> =>
    request<ReportDashboardItem>({ method: 'GET', url: `${BASE}/dashboards/${id}` }),

  create: (data: ReportDashboardSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/dashboards`, data }),

  update: (id: number, data: ReportDashboardSaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/dashboards/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/dashboards/${id}` }),

  publish: (id: number): Promise<ReportDashboardItem> =>
    request<ReportDashboardItem>({ method: 'POST', url: `${BASE}/dashboards/${id}/publish` }),

  disable: (id: number): Promise<ReportDashboardItem> =>
    request<ReportDashboardItem>({ method: 'POST', url: `${BASE}/dashboards/${id}/disable` }),
};
