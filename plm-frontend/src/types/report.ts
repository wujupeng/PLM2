import type { PageQuery } from '@/types/common';

/** G1-N2 公共平台底座—报表平台（后端 WBS T010）类型与枚举定义。 */

/* ---------------- 通用分页查询 ---------------- */

/** 报表平台通用分页查询条件（各资源按需使用对应状态字段）。 */
export interface ReportQuery extends PageQuery {
  bizDomain?: string;
  category?: string;
  sourceType?: string;
  refreshMode?: string;
  chartType?: string;
  indicatorStatus?: string;
  datasetStatus?: string;
  reportStatus?: string;
  dashboardStatus?: string;
  exportStatus?: string;
  startDate?: string;
  endDate?: string;
}

/* ---------------- 1. 指标口径 ---------------- */

export interface ReportIndicatorItem {
  id: number;
  indicatorCode: string;
  indicatorName: string;
  bizDomain?: string;
  category?: string;
  caliber?: string;
  formula?: string;
  unit?: string;
  decimalScale?: number;
  dataSource?: string;
  refreshCycle: string;
  ownerName?: string;
  indicatorStatus: string;
  description?: string;
  orgName?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReportIndicatorSaveParams {
  indicatorCode?: string;
  indicatorName: string;
  bizDomain?: string;
  category?: string;
  caliber?: string;
  formula?: string;
  unit?: string;
  decimalScale?: number;
  dataSource?: string;
  refreshCycle?: string;
  ownerName?: string;
  indicatorStatus?: string;
  description?: string;
  orgName?: string;
  remark?: string;
}

/* ---------------- 2. 数据集市 ---------------- */

export interface ReportDatasetItem {
  id: number;
  datasetCode: string;
  datasetName: string;
  bizDomain?: string;
  sourceType: string;
  sourceRef?: string;
  filterCondition?: string;
  fieldSchema?: string;
  refreshMode: string;
  refreshCron?: string;
  lastRefreshAt?: string;
  rowCount?: number;
  ownerName?: string;
  datasetStatus: string;
  description?: string;
  orgName?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReportDatasetSaveParams {
  datasetCode?: string;
  datasetName: string;
  bizDomain?: string;
  sourceType?: string;
  sourceRef?: string;
  filterCondition?: string;
  fieldSchema?: string;
  refreshMode?: string;
  refreshCron?: string;
  rowCount?: number;
  ownerName?: string;
  datasetStatus?: string;
  description?: string;
  orgName?: string;
  remark?: string;
}

/* ---------------- 3. 报表定义 ---------------- */

export interface ReportDefinitionItem {
  id: number;
  reportCode: string;
  reportName: string;
  bizDomain?: string;
  category?: string;
  datasetCode?: string;
  chartType: string;
  indicatorCodes?: string;
  permissionCode?: string;
  rowFilter?: string;
  exportEnabled?: number;
  exportAuditFlag?: number;
  reportStatus: string;
  ownerName?: string;
  description?: string;
  orgName?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReportDefinitionSaveParams {
  reportCode?: string;
  reportName: string;
  bizDomain?: string;
  category?: string;
  datasetCode?: string;
  chartType?: string;
  indicatorCodes?: string;
  permissionCode?: string;
  rowFilter?: string;
  exportEnabled?: number;
  exportAuditFlag?: number;
  reportStatus?: string;
  ownerName?: string;
  description?: string;
  orgName?: string;
  remark?: string;
}

/* ---------------- 4. 导出审计 ---------------- */

export interface ReportExportLogItem {
  id: number;
  exportNo: string;
  reportCode: string;
  reportName?: string;
  exportType: string;
  exportRows?: number;
  fileSize?: number;
  exportBy?: string;
  exportTime?: string;
  resultStatus: string;
  ipAddress?: string;
  filterSummary?: string;
  costMs?: number;
  orgName?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReportExportLogSaveParams {
  exportNo?: string;
  reportCode: string;
  reportName?: string;
  exportType?: string;
  exportRows?: number;
  fileSize?: number;
  exportBy?: string;
  exportTime?: string;
  resultStatus?: string;
  ipAddress?: string;
  filterSummary?: string;
  costMs?: number;
  orgName?: string;
  remark?: string;
}

/* ---------------- 5. 经营驾驶舱 ---------------- */

export interface ReportDashboardItem {
  id: number;
  dashboardCode: string;
  dashboardName: string;
  bizDomain?: string;
  audience?: string;
  layoutMode: string;
  widgetSchema?: string;
  refreshIntervalSec?: number;
  ownerName?: string;
  dashboardStatus: string;
  description?: string;
  orgName?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReportDashboardSaveParams {
  dashboardCode?: string;
  dashboardName: string;
  bizDomain?: string;
  audience?: string;
  layoutMode?: string;
  widgetSchema?: string;
  refreshIntervalSec?: number;
  ownerName?: string;
  dashboardStatus?: string;
  description?: string;
  orgName?: string;
  remark?: string;
}

/* ---------------- 统计结果 ---------------- */

/** 后端 stats 接口返回的统计指标（键名以后端为准）。 */
export type ReportStats = Record<string, number>;

/* ---------------- 枚举选项与文案 ---------------- */

/** 业务域：PLM/ERP/SRM/MES/WMS/OA。 */
export const REPORT_BIZ_DOMAIN_OPTIONS = [
  { label: 'PLM', value: 'PLM' },
  { label: 'ERP', value: 'ERP' },
  { label: 'SRM', value: 'SRM' },
  { label: 'MES', value: 'MES' },
  { label: 'WMS', value: 'WMS' },
  { label: 'OA', value: 'OA' },
] as const;

export const REPORT_BIZ_DOMAIN_LABEL: Record<string, string> = {
  PLM: 'PLM',
  ERP: 'ERP',
  SRM: 'SRM',
  MES: 'MES',
  WMS: 'WMS',
  OA: 'OA',
};

/** 指标状态：DRAFT/ACTIVE/DISABLED。 */
export const REPORT_INDICATOR_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已启用', value: 'ACTIVE' },
  { label: '已停用', value: 'DISABLED' },
] as const;

export const REPORT_INDICATOR_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  ACTIVE: '已启用',
  DISABLED: '已停用',
};

/** 刷新周期：REALTIME/HOURLY/DAILY/WEEKLY/MONTHLY。 */
export const REPORT_REFRESH_CYCLE_OPTIONS = [
  { label: '实时', value: 'REALTIME' },
  { label: '每小时', value: 'HOURLY' },
  { label: '每日', value: 'DAILY' },
  { label: '每周', value: 'WEEKLY' },
  { label: '每月', value: 'MONTHLY' },
] as const;

export const REPORT_REFRESH_CYCLE_LABEL: Record<string, string> = {
  REALTIME: '实时',
  HOURLY: '每小时',
  DAILY: '每日',
  WEEKLY: '每周',
  MONTHLY: '每月',
};

/** 来源类型：TABLE/VIEW/API/SQL。 */
export const REPORT_SOURCE_TYPE_OPTIONS = [
  { label: '数据表(TABLE)', value: 'TABLE' },
  { label: '视图(VIEW)', value: 'VIEW' },
  { label: '接口(API)', value: 'API' },
  { label: '自定义 SQL', value: 'SQL' },
] as const;

export const REPORT_SOURCE_TYPE_LABEL: Record<string, string> = {
  TABLE: '数据表',
  VIEW: '视图',
  API: '接口',
  SQL: '自定义 SQL',
};

/** 刷新方式：MANUAL/SCHEDULED/REALTIME。 */
export const REPORT_REFRESH_MODE_OPTIONS = [
  { label: '手动(MANUAL)', value: 'MANUAL' },
  { label: '定时(SCHEDULED)', value: 'SCHEDULED' },
  { label: '实时(REALTIME)', value: 'REALTIME' },
] as const;

export const REPORT_REFRESH_MODE_LABEL: Record<string, string> = {
  MANUAL: '手动',
  SCHEDULED: '定时',
  REALTIME: '实时',
};

/** 数据集状态：DRAFT/ACTIVE/DISABLED。 */
export const REPORT_DATASET_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已启用', value: 'ACTIVE' },
  { label: '已停用', value: 'DISABLED' },
] as const;

export const REPORT_DATASET_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  ACTIVE: '已启用',
  DISABLED: '已停用',
};

/** 图表类型：TABLE/BAR/LINE/PIE/GAUGE/CARD。 */
export const REPORT_CHART_TYPE_OPTIONS = [
  { label: '表格(TABLE)', value: 'TABLE' },
  { label: '柱状图(BAR)', value: 'BAR' },
  { label: '折线图(LINE)', value: 'LINE' },
  { label: '饼图(PIE)', value: 'PIE' },
  { label: '仪表盘(GAUGE)', value: 'GAUGE' },
  { label: '指标卡(CARD)', value: 'CARD' },
] as const;

export const REPORT_CHART_TYPE_LABEL: Record<string, string> = {
  TABLE: '表格',
  BAR: '柱状图',
  LINE: '折线图',
  PIE: '饼图',
  GAUGE: '仪表盘',
  CARD: '指标卡',
};

/** 报表状态：DRAFT/PUBLISHED/DISABLED。 */
export const REPORT_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已发布', value: 'PUBLISHED' },
  { label: '已停用', value: 'DISABLED' },
] as const;

export const REPORT_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  PUBLISHED: '已发布',
  DISABLED: '已停用',
};

/** 导出类型：EXCEL/CSV/PDF。 */
export const REPORT_EXPORT_TYPE_OPTIONS = [
  { label: 'Excel', value: 'EXCEL' },
  { label: 'CSV', value: 'CSV' },
  { label: 'PDF', value: 'PDF' },
] as const;

export const REPORT_EXPORT_TYPE_LABEL: Record<string, string> = {
  EXCEL: 'Excel',
  CSV: 'CSV',
  PDF: 'PDF',
};

/** 导出结果：SUCCESS/FAILED。 */
export const REPORT_EXPORT_RESULT_OPTIONS = [
  { label: '成功', value: 'SUCCESS' },
  { label: '失败', value: 'FAILED' },
] as const;

export const REPORT_EXPORT_RESULT_LABEL: Record<string, string> = {
  SUCCESS: '成功',
  FAILED: '失败',
};

/** 布局模式：GRID/FREE。 */
export const REPORT_LAYOUT_MODE_OPTIONS = [
  { label: '栅格布局(GRID)', value: 'GRID' },
  { label: '自由布局(FREE)', value: 'FREE' },
] as const;

export const REPORT_LAYOUT_MODE_LABEL: Record<string, string> = {
  GRID: '栅格布局',
  FREE: '自由布局',
};

/** 驾驶舱状态：DRAFT/PUBLISHED/DISABLED。 */
export const REPORT_DASHBOARD_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已发布', value: 'PUBLISHED' },
  { label: '已停用', value: 'DISABLED' },
] as const;

export const REPORT_DASHBOARD_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  PUBLISHED: '已发布',
  DISABLED: '已停用',
};

/** 是否标志下拉选项（1=是，0=否）。 */
export const REPORT_BOOLEAN_OPTIONS = [
  { label: '是', value: 1 },
  { label: '否', value: 0 },
] as const;
