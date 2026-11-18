import type { PageQuery } from '@/types/common';

/** G6-N1 MES 生产计划执行（T037，后端 Base: /mes/plan）类型与枚举定义。 */

/* ---------------- 分页查询条件 ---------------- */

/** 生产工单分页查询条件。keyword 匹配 orderNo/erpOrderNo/materialCode/materialName。 */
export interface MesProdOrderQuery extends PageQuery {
  orderStatus?: string;
  priority?: string;
  materialCode?: string;
  workshopCode?: string;
}

/** 排产计划分页查询条件。keyword 匹配 scheduleNo/workOrderNo/materialCode/materialName。 */
export interface MesScheduleQuery extends PageQuery {
  scheduleStatus?: string;
  lineCode?: string;
  workOrderNo?: string;
  materialCode?: string;
}

/** 派工任务分页查询条件。keyword 匹配 dispatchNo/workOrderNo/processCode/materialCode/materialName。 */
export interface MesDispatchQuery extends PageQuery {
  dispatchStatus?: string;
  processCode?: string;
  workOrderNo?: string;
  materialCode?: string;
}

/* ---------------- 1. 生产工单 ---------------- */

export interface MesProdOrder {
  id?: number;
  orderNo?: string;
  erpOrderNo?: string;
  orderSource?: string;
  materialCode?: string;
  materialName?: string;
  spec?: string;
  planQty?: number | null;
  productQty?: number | null;
  orderStatus?: string;
  priority?: string;
  workshopCode?: string;
  planStartTime?: string;
  planEndTime?: string;
  receiveTime?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type MesProdOrderSaveRequest = Omit<
  MesProdOrder,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 2. 排产计划 ---------------- */

export interface MesSchedule {
  id?: number;
  scheduleNo?: string;
  workOrderNo?: string;
  materialCode?: string;
  materialName?: string;
  spec?: string;
  lineCode?: string;
  planQty?: number | null;
  scheduledQty?: number | null;
  scheduleStartTime?: string;
  scheduleEndTime?: string;
  scheduleStatus?: string;
  scheduler?: string;
  scheduleTime?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type MesScheduleSaveRequest = Omit<
  MesSchedule,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 3. 派工任务 ---------------- */

export interface MesDispatch {
  id?: number;
  dispatchNo?: string;
  workOrderNo?: string;
  processCode?: string;
  processName?: string;
  equipmentCode?: string;
  lineCode?: string;
  materialCode?: string;
  materialName?: string;
  planQty?: number | null;
  dispatchedQty?: number | null;
  progressQty?: number | null;
  progressRate?: number | null;
  dispatchStatus?: string;
  operator?: string;
  dispatchTime?: string;
  feedbackTime?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type MesDispatchSaveRequest = Omit<
  MesDispatch,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 枚举选项与标签 ---------------- */

/** 工单状态：DRAFT/RELEASED/IN_PROGRESS/COMPLETED/CANCELLED。 */
export const MES_PROD_ORDER_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已下达', value: 'RELEASED' },
  { label: '生产中', value: 'IN_PROGRESS' },
  { label: '已完工', value: 'COMPLETED' },
  { label: '已取消', value: 'CANCELLED' },
] as const;
export const MES_PROD_ORDER_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  RELEASED: '已下达',
  IN_PROGRESS: '生产中',
  COMPLETED: '已完工',
  CANCELLED: '已取消',
};

/** 优先级：LOW/NORMAL/HIGH/URGENT。 */
export const MES_PRIORITY_OPTIONS = [
  { label: '低', value: 'LOW' },
  { label: '普通', value: 'NORMAL' },
  { label: '高', value: 'HIGH' },
  { label: '紧急', value: 'URGENT' },
] as const;
export const MES_PRIORITY_LABEL: Record<string, string> = {
  LOW: '低',
  NORMAL: '普通',
  HIGH: '高',
  URGENT: '紧急',
};

/** 工单来源：ERP/MANUAL。 */
export const MES_ORDER_SOURCE_OPTIONS = [
  { label: 'ERP下发', value: 'ERP' },
  { label: '手工创建', value: 'MANUAL' },
] as const;
export const MES_ORDER_SOURCE_LABEL: Record<string, string> = {
  ERP: 'ERP下发',
  MANUAL: '手工创建',
};

/** 排产状态：DRAFT/SCHEDULED/RELEASED/CLOSED/CANCELLED。 */
export const MES_SCHEDULE_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已排产', value: 'SCHEDULED' },
  { label: '已下达', value: 'RELEASED' },
  { label: '已关闭', value: 'CLOSED' },
  { label: '已取消', value: 'CANCELLED' },
] as const;
export const MES_SCHEDULE_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  SCHEDULED: '已排产',
  RELEASED: '已下达',
  CLOSED: '已关闭',
  CANCELLED: '已取消',
};

/** 派工状态：DRAFT/DISPATCHED/IN_PROGRESS/COMPLETED。 */
export const MES_DISPATCH_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已派工', value: 'DISPATCHED' },
  { label: '执行中', value: 'IN_PROGRESS' },
  { label: '已完成', value: 'COMPLETED' },
] as const;
export const MES_DISPATCH_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  DISPATCHED: '已派工',
  IN_PROGRESS: '执行中',
  COMPLETED: '已完成',
};
