import type { PageQuery } from '@/types/common';

/** G6-N3 MES 工序报工（T039，后端 Base: /mes/report）类型与枚举定义。 */

/* ---------------- 分页查询条件 ---------------- */

/** 工序报工单分页查询条件。keyword 匹配 reportNo/workOrderNo/dispatchNo/processCode/materialCode/materialName。 */
export interface MesWorkReportQuery extends PageQuery {
  reportStatus?: string;
  reportType?: string;
  workOrderNo?: string;
  dispatchNo?: string;
  processCode?: string;
  materialCode?: string;
}

/** 补料记录分页查询条件。keyword 匹配 replenishNo/workOrderNo/materialCode/materialName/batchNo。 */
export interface MesMaterialReplenishQuery extends PageQuery {
  replenishStatus?: string;
  replenishType?: string;
  workOrderNo?: string;
  materialCode?: string;
}

/** 工时记录分页查询条件。keyword 匹配 laborNo/workOrderNo/worker/materialCode/materialName。 */
export interface MesLaborHourQuery extends PageQuery {
  laborStatus?: string;
  worker?: string;
  workOrderNo?: string;
  materialCode?: string;
}

/* ---------------- 1. 工序报工单（开工/暂停/完工/良品/不良/返工） ---------------- */

export interface MesWorkReport {
  id?: number;
  reportNo?: string;
  workOrderNo?: string;
  dispatchNo?: string;
  processCode?: string;
  processName?: string;
  materialCode?: string;
  materialName?: string;
  equipmentCode?: string;
  lineCode?: string;
  operator?: string;
  shiftCode?: string;
  reportType?: string;
  goodQty?: number | null;
  badQty?: number | null;
  reworkQty?: number | null;
  reportQty?: number | null;
  startTime?: string;
  endTime?: string;
  durationMinutes?: number | null;
  workHours?: number | null;
  reportStatus?: string;
  reportTime?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type MesWorkReportSaveRequest = Omit<
  MesWorkReport,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 2. 补料记录 ---------------- */

export interface MesMaterialReplenish {
  id?: number;
  replenishNo?: string;
  workOrderNo?: string;
  dispatchNo?: string;
  processCode?: string;
  materialCode?: string;
  materialName?: string;
  spec?: string;
  batchNo?: string;
  replenishQty?: number | null;
  unit?: string;
  replenishType?: string;
  reason?: string;
  applicant?: string;
  applyTime?: string;
  replenishStatus?: string;
  issuer?: string;
  issueTime?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type MesMaterialReplenishSaveRequest = Omit<
  MesMaterialReplenish,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 3. 工时记录 ---------------- */

export interface MesLaborHour {
  id?: number;
  laborNo?: string;
  workOrderNo?: string;
  dispatchNo?: string;
  processCode?: string;
  materialCode?: string;
  materialName?: string;
  worker?: string;
  shiftCode?: string;
  workDate?: string;
  normalHours?: number | null;
  overtimeHours?: number | null;
  totalHours?: number | null;
  laborStatus?: string;
  confirmTime?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type MesLaborHourSaveRequest = Omit<
  MesLaborHour,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 枚举选项与标签 ---------------- */

/** 报工类型：START/PAUSE/FINISH。 */
export const MES_WORK_REPORT_TYPE_OPTIONS = [
  { label: '开工', value: 'START' },
  { label: '暂停', value: 'PAUSE' },
  { label: '完工', value: 'FINISH' },
] as const;
export const MES_WORK_REPORT_TYPE_LABEL: Record<string, string> = {
  START: '开工',
  PAUSE: '暂停',
  FINISH: '完工',
};

/** 报工状态：DRAFT/SUBMITTED/CONFIRMED/CANCELLED。 */
export const MES_WORK_REPORT_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已提交', value: 'SUBMITTED' },
  { label: '已确认', value: 'CONFIRMED' },
  { label: '已取消', value: 'CANCELLED' },
] as const;
export const MES_WORK_REPORT_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  SUBMITTED: '已提交',
  CONFIRMED: '已确认',
  CANCELLED: '已取消',
};

/** 补料类型：SUPPLEMENT/REWORK/SCRAP。 */
export const MES_REPLENISH_TYPE_OPTIONS = [
  { label: '补料', value: 'SUPPLEMENT' },
  { label: '返工料', value: 'REWORK' },
  { label: '报废补料', value: 'SCRAP' },
] as const;
export const MES_REPLENISH_TYPE_LABEL: Record<string, string> = {
  SUPPLEMENT: '补料',
  REWORK: '返工料',
  SCRAP: '报废补料',
};

/** 补料状态：DRAFT/SUBMITTED/ISSUED/CONFIRMED/CANCELLED。 */
export const MES_REPLENISH_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已提交', value: 'SUBMITTED' },
  { label: '已发料', value: 'ISSUED' },
  { label: '已确认', value: 'CONFIRMED' },
  { label: '已取消', value: 'CANCELLED' },
] as const;
export const MES_REPLENISH_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  SUBMITTED: '已提交',
  ISSUED: '已发料',
  CONFIRMED: '已确认',
  CANCELLED: '已取消',
};

/** 工时状态：DRAFT/CONFIRMED/CANCELLED。 */
export const MES_LABOR_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已确认', value: 'CONFIRMED' },
  { label: '已取消', value: 'CANCELLED' },
] as const;
export const MES_LABOR_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  CONFIRMED: '已确认',
  CANCELLED: '已取消',
};
