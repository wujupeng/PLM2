import type { PageQuery } from '@/types/common';

/** G3-N7b ERP 工艺资源（T098，后端 Base: /erp/process）类型与枚举定义。 */

/* ---------------- 分页查询条件 ---------------- */

/** 资源资料分页查询条件。keyword 匹配 resourceCode/resourceName/workCenter/spec。 */
export interface ErpProcessResourceQuery extends PageQuery {
  resourceType?: string;
  resourceStatus?: string;
}

/** 标准工艺分页查询条件。keyword 匹配 standardCode/standardName/materialCode/materialName。 */
export interface ErpProcessStandardQuery extends PageQuery {
  standardStatus?: string;
  materialCode?: string;
}

/** 工艺路线分页查询条件。keyword 匹配 routeCode/routeName/materialCode/materialName。 */
export interface ErpProcessRouteQuery extends PageQuery {
  routeType?: string;
  routeStatus?: string;
  materialCode?: string;
}

/** 工序计划分页查询条件。keyword 匹配 planNo/productionOrderNo/materialCode/operationName。 */
export interface ErpProcessPlanQuery extends PageQuery {
  planStatus?: string;
  productionOrderNo?: string;
}

/** 工序报工分页查询条件。keyword 匹配 reportNo/planNo/productionOrderNo/materialCode/reporter。 */
export interface ErpProcessReportQuery extends PageQuery {
  reportStatus?: string;
  planNo?: string;
  productionOrderNo?: string;
}

/** 工时反馈分页查询条件。keyword 匹配 feedbackNo/planNo/reportNo/resourceCode/operatorName。 */
export interface ErpProcessLaborQuery extends PageQuery {
  laborType?: string;
  laborStatus?: string;
  planNo?: string;
}

/* ---------------- 1. 资源资料 ---------------- */

export interface ErpProcessResource {
  id?: number;
  resourceCode: string;
  resourceName?: string;
  resourceType?: string;
  spec?: string;
  resourceGroup?: string;
  workCenter?: string;
  capacity?: number | null;
  capacityUnit?: string;
  uom?: string;
  resourceStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ErpProcessResourceSaveRequest = Omit<
  ErpProcessResource,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 2. 标准工艺 ---------------- */

export interface ErpProcessStandard {
  id?: number;
  standardCode: string;
  standardName?: string;
  materialCode?: string;
  materialName?: string;
  versionNo?: string;
  routeCode?: string;
  standardHours?: number | null;
  setupHours?: number | null;
  operationCount?: number | null;
  effectiveDate?: string;
  expireDate?: string;
  standardStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ErpProcessStandardSaveRequest = Omit<
  ErpProcessStandard,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 3. 工艺路线 ---------------- */

export interface ErpProcessRoute {
  id?: number;
  routeCode: string;
  routeName?: string;
  materialCode?: string;
  materialName?: string;
  versionNo?: string;
  routeType?: string;
  routeStatus?: string;
  operationCount?: number | null;
  standardCode?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ErpProcessRouteSaveRequest = Omit<
  ErpProcessRoute,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 4. 工序计划 ---------------- */

export interface ErpProcessPlan {
  id?: number;
  planNo?: string;
  productionOrderNo?: string;
  materialCode?: string;
  materialName?: string;
  routeCode?: string;
  operationNo?: number | null;
  operationName?: string;
  resourceCode?: string;
  planQty?: number | null;
  plannedStartTime?: string;
  plannedEndTime?: string;
  planStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ErpProcessPlanSaveRequest = Omit<
  ErpProcessPlan,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 5. 工序报工 ---------------- */

export interface ErpProcessReport {
  id?: number;
  reportNo?: string;
  planNo?: string;
  productionOrderNo?: string;
  materialCode?: string;
  operationNo?: number | null;
  qualifiedQty?: number | null;
  unqualifiedQty?: number | null;
  scrapQty?: number | null;
  reporter?: string;
  reportTime?: string;
  reportStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ErpProcessReportSaveRequest = Omit<
  ErpProcessReport,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 6. 工时反馈 ---------------- */

export interface ErpProcessLabor {
  id?: number;
  feedbackNo?: string;
  planNo?: string;
  reportNo?: string;
  resourceCode?: string;
  operatorName?: string;
  laborType?: string;
  standardHours?: number | null;
  actualHours?: number | null;
  startTime?: string;
  endTime?: string;
  laborStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ErpProcessLaborSaveRequest = Omit<
  ErpProcessLabor,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 枚举选项与标签 ---------------- */

/** 资源类型：MACHINE/EQUIPMENT/MOLD/FIXTURE/GAUGE/LABOR/OTHER。 */
export const ERP_PROCESS_RESOURCE_TYPE_OPTIONS = [
  { label: '设备', value: 'MACHINE' },
  { label: '装备', value: 'EQUIPMENT' },
  { label: '模具', value: 'MOLD' },
  { label: '工装夹具', value: 'FIXTURE' },
  { label: '量具', value: 'GAUGE' },
  { label: '人工', value: 'LABOR' },
  { label: '其他', value: 'OTHER' },
] as const;
export const ERP_PROCESS_RESOURCE_TYPE_LABEL: Record<string, string> = {
  MACHINE: '设备',
  EQUIPMENT: '装备',
  MOLD: '模具',
  FIXTURE: '工装夹具',
  GAUGE: '量具',
  LABOR: '人工',
  OTHER: '其他',
};

/** 资源状态：ACTIVE/INACTIVE。 */
export const ERP_PROCESS_RESOURCE_STATUS_OPTIONS = [
  { label: '启用', value: 'ACTIVE' },
  { label: '停用', value: 'INACTIVE' },
] as const;
export const ERP_PROCESS_RESOURCE_STATUS_LABEL: Record<string, string> = {
  ACTIVE: '启用',
  INACTIVE: '停用',
};

/** 标准工艺状态：DRAFT/ACTIVE/OBSOLETE。 */
export const ERP_PROCESS_STANDARD_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '生效', value: 'ACTIVE' },
  { label: '已失效', value: 'OBSOLETE' },
] as const;
export const ERP_PROCESS_STANDARD_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  ACTIVE: '生效',
  OBSOLETE: '已失效',
};

/** 工艺路线类型：MAIN/ALTERNATE。 */
export const ERP_PROCESS_ROUTE_TYPE_OPTIONS = [
  { label: '主路线', value: 'MAIN' },
  { label: '替代路线', value: 'ALTERNATE' },
] as const;
export const ERP_PROCESS_ROUTE_TYPE_LABEL: Record<string, string> = {
  MAIN: '主路线',
  ALTERNATE: '替代路线',
};

/** 工艺路线状态：DRAFT/RELEASED/OBSOLETE。 */
export const ERP_PROCESS_ROUTE_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已发布', value: 'RELEASED' },
  { label: '已废止', value: 'OBSOLETE' },
] as const;
export const ERP_PROCESS_ROUTE_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  RELEASED: '已发布',
  OBSOLETE: '已废止',
};

/** 工序计划状态：PENDING/IN_PROGRESS/COMPLETED/CLOSED/CANCELLED。 */
export const ERP_PROCESS_PLAN_STATUS_OPTIONS = [
  { label: '待开工', value: 'PENDING' },
  { label: '加工中', value: 'IN_PROGRESS' },
  { label: '已完工', value: 'COMPLETED' },
  { label: '已关闭', value: 'CLOSED' },
  { label: '已取消', value: 'CANCELLED' },
] as const;
export const ERP_PROCESS_PLAN_STATUS_LABEL: Record<string, string> = {
  PENDING: '待开工',
  IN_PROGRESS: '加工中',
  COMPLETED: '已完工',
  CLOSED: '已关闭',
  CANCELLED: '已取消',
};

/** 工序报工状态：SUBMITTED/CONFIRMED/REJECTED。 */
export const ERP_PROCESS_REPORT_STATUS_OPTIONS = [
  { label: '已提交', value: 'SUBMITTED' },
  { label: '已确认', value: 'CONFIRMED' },
  { label: '已驳回', value: 'REJECTED' },
] as const;
export const ERP_PROCESS_REPORT_STATUS_LABEL: Record<string, string> = {
  SUBMITTED: '已提交',
  CONFIRMED: '已确认',
  REJECTED: '已驳回',
};

/** 工时类型：SETUP/RUN/WAIT/DOWN/OTHER。 */
export const ERP_PROCESS_LABOR_TYPE_OPTIONS = [
  { label: '准备', value: 'SETUP' },
  { label: '加工', value: 'RUN' },
  { label: '等待', value: 'WAIT' },
  { label: '停机', value: 'DOWN' },
  { label: '其他', value: 'OTHER' },
] as const;
export const ERP_PROCESS_LABOR_TYPE_LABEL: Record<string, string> = {
  SETUP: '准备',
  RUN: '加工',
  WAIT: '等待',
  DOWN: '停机',
  OTHER: '其他',
};

/** 工时反馈状态：DRAFT/SUBMITTED/CONFIRMED。 */
export const ERP_PROCESS_LABOR_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已提交', value: 'SUBMITTED' },
  { label: '已确认', value: 'CONFIRMED' },
] as const;
export const ERP_PROCESS_LABOR_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  SUBMITTED: '已提交',
  CONFIRMED: '已确认',
};
