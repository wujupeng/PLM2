import type { PageQuery } from '@/types/common';

/** G3-N4a ERP 需求计划（T025/T095，后端 Base: /erp/demand-plan）类型与枚举定义。 */

/* ---------------- 通用分页查询 ---------------- */

/** 需求计划分页查询条件。 */
export interface ErpDemandPlanQuery extends PageQuery {
  planStatus?: string;
  planType?: string;
  planSource?: string;
  planOrg?: string;
}

/** MRP 运算单分页查询条件。 */
export interface ErpMrpRunQuery extends PageQuery {
  runType?: string;
  runScope?: string;
  runStatus?: string;
  planNo?: string;
}

/** 净需求分页查询条件。 */
export interface ErpNetRequirementQuery extends PageQuery {
  requirementStatus?: string;
  materialCode?: string;
  runNo?: string;
}

/** 采购建议分页查询条件。 */
export interface ErpPurchaseSuggestionQuery extends PageQuery {
  suggestionStatus?: string;
  materialCode?: string;
  runNo?: string;
}

/** 生产建议分页查询条件。 */
export interface ErpProductionSuggestionQuery extends PageQuery {
  suggestionStatus?: string;
  materialCode?: string;
  runNo?: string;
}

/** 计划调整单分页查询条件。 */
export interface ErpPlanAdjustmentQuery extends PageQuery {
  adjustmentStatus?: string;
  adjustmentType?: string;
  materialCode?: string;
  planNo?: string;
}

/* ---------------- 1. 需求计划（主子表） ---------------- */

export interface ErpDemandPlan {
  id?: number;
  planNo?: string;
  planName?: string;
  planType?: string;
  planSource?: string;
  planOrg?: string;
  planner?: string;
  planDate?: string;
  horizonStart?: string;
  horizonEnd?: string;
  currencyCode?: string;
  planStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ErpDemandPlanSaveRequest = Omit<
  ErpDemandPlan,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

export interface ErpDemandPlanLine {
  id?: number;
  planId?: number;
  planNo?: string;
  lineNo?: number;
  lineStatus?: string;
  materialCode: string;
  materialName?: string;
  spec?: string;
  uom?: string;
  demandQty?: number | null;
  sourceType?: string;
  sourceNo?: string;
  customerCode?: string;
  demandDate?: string;
  warehouseCode?: string;
  remark?: string;
}

export type ErpDemandPlanLineSaveRequest = Omit<
  ErpDemandPlanLine,
  'id' | 'planId' | 'planNo'
>;

export interface ErpDemandPlanDetail {
  header: ErpDemandPlan;
  lines: ErpDemandPlanLine[];
}

/* ---------------- 2. MRP 运算单 ---------------- */

export interface ErpMrpRun {
  id?: number;
  runNo?: string;
  runType?: string;
  planNo?: string;
  runScope?: string;
  runDate?: string;
  runBy?: string;
  demandCount?: number | null;
  suggestionCount?: number | null;
  runStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ErpMrpRunSaveRequest = Omit<
  ErpMrpRun,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 3. 净需求 ---------------- */

export interface ErpNetRequirement {
  id?: number;
  requirementNo?: string;
  runNo?: string;
  materialCode: string;
  materialName?: string;
  spec?: string;
  uom?: string;
  grossQty?: number | null;
  onHandQty?: number | null;
  inTransitQty?: number | null;
  allocatedQty?: number | null;
  safetyStock?: number | null;
  netQty?: number | null;
  lossRate?: number | null;
  leadTimeDays?: number | null;
  requiredDate?: string;
  requirementStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ErpNetRequirementSaveRequest = Omit<
  ErpNetRequirement,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 4. 采购建议 ---------------- */

export interface ErpPurchaseSuggestion {
  id?: number;
  suggestionNo?: string;
  runNo?: string;
  materialCode: string;
  materialName?: string;
  spec?: string;
  uom?: string;
  netQty?: number | null;
  suggestQty?: number | null;
  suggestedSupplier?: string;
  suggestedPrice?: number | null;
  currencyCode?: string;
  requiredDate?: string;
  suggestionStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ErpPurchaseSuggestionSaveRequest = Omit<
  ErpPurchaseSuggestion,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 5. 生产建议 ---------------- */

export interface ErpProductionSuggestion {
  id?: number;
  suggestionNo?: string;
  runNo?: string;
  materialCode: string;
  materialName?: string;
  spec?: string;
  uom?: string;
  netQty?: number | null;
  suggestQty?: number | null;
  bomVersion?: string;
  warehouseCode?: string;
  requiredDate?: string;
  suggestionStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ErpProductionSuggestionSaveRequest = Omit<
  ErpProductionSuggestion,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 6. 计划调整单 ---------------- */

export interface ErpPlanAdjustment {
  id?: number;
  adjustmentNo?: string;
  planNo?: string;
  adjustmentType?: string;
  materialCode: string;
  materialName?: string;
  spec?: string;
  uom?: string;
  oldQty?: number | null;
  newQty?: number | null;
  oldDate?: string;
  newDate?: string;
  adjustReason?: string;
  adjustBy?: string;
  adjustDate?: string;
  adjustmentStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ErpPlanAdjustmentSaveRequest = Omit<
  ErpPlanAdjustment,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 枚举选项与标签 ---------------- */

/** 需求计划类型：ORDER/FORECAST/MIXED。 */
export const ERP_DEMAND_PLAN_TYPE_OPTIONS = [
  { label: '订单需求', value: 'ORDER' },
  { label: '预测需求', value: 'FORECAST' },
  { label: '混合需求', value: 'MIXED' },
] as const;
export const ERP_DEMAND_PLAN_TYPE_LABEL: Record<string, string> = {
  ORDER: '订单需求',
  FORECAST: '预测需求',
  MIXED: '混合需求',
};

/** 需求计划来源：SALES/FORECAST/MANUAL。 */
export const ERP_DEMAND_PLAN_SOURCE_OPTIONS = [
  { label: '销售订单', value: 'SALES' },
  { label: '销售预测', value: 'FORECAST' },
  { label: '手工录入', value: 'MANUAL' },
] as const;
export const ERP_DEMAND_PLAN_SOURCE_LABEL: Record<string, string> = {
  SALES: '销售订单',
  FORECAST: '销售预测',
  MANUAL: '手工录入',
};

/** 需求计划状态：DRAFT/RELEASED/RUNNING/CLOSED/CANCELLED。 */
export const ERP_DEMAND_PLAN_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已下发', value: 'RELEASED' },
  { label: '运算中', value: 'RUNNING' },
  { label: '已关闭', value: 'CLOSED' },
  { label: '已取消', value: 'CANCELLED' },
] as const;
export const ERP_DEMAND_PLAN_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  RELEASED: '已下发',
  RUNNING: '运算中',
  CLOSED: '已关闭',
  CANCELLED: '已取消',
};

/** 需求计划行状态：OPEN/PLANNED/CLOSED/CANCELLED。 */
export const ERP_DEMAND_LINE_STATUS_OPTIONS = [
  { label: '未计划', value: 'OPEN' },
  { label: '已计划', value: 'PLANNED' },
  { label: '已关闭', value: 'CLOSED' },
  { label: '已取消', value: 'CANCELLED' },
] as const;
export const ERP_DEMAND_LINE_STATUS_LABEL: Record<string, string> = {
  OPEN: '未计划',
  PLANNED: '已计划',
  CLOSED: '已关闭',
  CANCELLED: '已取消',
};

/** 需求来源类型：SALES/FORECAST/MANUAL。 */
export const ERP_DEMAND_SOURCE_TYPE_OPTIONS = [
  { label: '销售订单', value: 'SALES' },
  { label: '销售预测', value: 'FORECAST' },
  { label: '手工录入', value: 'MANUAL' },
] as const;
export const ERP_DEMAND_SOURCE_TYPE_LABEL: Record<string, string> = {
  SALES: '销售订单',
  FORECAST: '销售预测',
  MANUAL: '手工录入',
};

/** MRP 运算类型：MRP/LRP。 */
export const ERP_MRP_RUN_TYPE_OPTIONS = [
  { label: 'MRP物料需求计划', value: 'MRP' },
  { label: 'LRP批次需求计划', value: 'LRP' },
] as const;
export const ERP_MRP_RUN_TYPE_LABEL: Record<string, string> = {
  MRP: 'MRP物料需求计划',
  LRP: 'LRP批次需求计划',
};

/** MRP 运算范围：ALL/PLANNED/MATERIAL。 */
export const ERP_MRP_RUN_SCOPE_OPTIONS = [
  { label: '全量', value: 'ALL' },
  { label: '按计划', value: 'PLANNED' },
  { label: '按物料', value: 'MATERIAL' },
] as const;
export const ERP_MRP_RUN_SCOPE_LABEL: Record<string, string> = {
  ALL: '全量',
  PLANNED: '按计划',
  MATERIAL: '按物料',
};

/** MRP 运算状态：DRAFT/RUNNING/COMPLETED/FAILED。 */
export const ERP_MRP_RUN_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '运算中', value: 'RUNNING' },
  { label: '已完成', value: 'COMPLETED' },
  { label: '运算失败', value: 'FAILED' },
] as const;
export const ERP_MRP_RUN_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  RUNNING: '运算中',
  COMPLETED: '已完成',
  FAILED: '运算失败',
};

/** 净需求状态：OPEN/PLANNED/CLOSED。 */
export const ERP_NET_REQUIREMENT_STATUS_OPTIONS = [
  { label: '未计划', value: 'OPEN' },
  { label: '已转建议', value: 'PLANNED' },
  { label: '已关闭', value: 'CLOSED' },
] as const;
export const ERP_NET_REQUIREMENT_STATUS_LABEL: Record<string, string> = {
  OPEN: '未计划',
  PLANNED: '已转建议',
  CLOSED: '已关闭',
};

/** 采购建议状态：OPEN/CONVERTED/IGNORED。 */
export const ERP_PURCHASE_SUGGESTION_STATUS_OPTIONS = [
  { label: '未处理', value: 'OPEN' },
  { label: '已转单', value: 'CONVERTED' },
  { label: '已忽略', value: 'IGNORED' },
] as const;
export const ERP_PURCHASE_SUGGESTION_STATUS_LABEL: Record<string, string> = {
  OPEN: '未处理',
  CONVERTED: '已转单',
  IGNORED: '已忽略',
};

/** 生产建议状态：OPEN/CONVERTED/IGNORED。 */
export const ERP_PRODUCTION_SUGGESTION_STATUS_OPTIONS = [
  { label: '未处理', value: 'OPEN' },
  { label: '已转单', value: 'CONVERTED' },
  { label: '已忽略', value: 'IGNORED' },
] as const;
export const ERP_PRODUCTION_SUGGESTION_STATUS_LABEL: Record<string, string> = {
  OPEN: '未处理',
  CONVERTED: '已转单',
  IGNORED: '已忽略',
};

/** 计划调整类型：DEMAND/DATE/QUANTITY/SPLIT。 */
export const ERP_PLAN_ADJUSTMENT_TYPE_OPTIONS = [
  { label: '需求量调整', value: 'DEMAND' },
  { label: '需求日期调整', value: 'DATE' },
  { label: '数量调整', value: 'QUANTITY' },
  { label: '计划拆分', value: 'SPLIT' },
] as const;
export const ERP_PLAN_ADJUSTMENT_TYPE_LABEL: Record<string, string> = {
  DEMAND: '需求量调整',
  DATE: '需求日期调整',
  QUANTITY: '数量调整',
  SPLIT: '计划拆分',
};

/** 计划调整状态：DRAFT/SUBMITTED/APPROVED/REJECTED/CANCELLED。 */
export const ERP_PLAN_ADJUSTMENT_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已提交', value: 'SUBMITTED' },
  { label: '已批准', value: 'APPROVED' },
  { label: '已驳回', value: 'REJECTED' },
  { label: '已取消', value: 'CANCELLED' },
] as const;
export const ERP_PLAN_ADJUSTMENT_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  SUBMITTED: '已提交',
  APPROVED: '已批准',
  REJECTED: '已驳回',
  CANCELLED: '已取消',
};
