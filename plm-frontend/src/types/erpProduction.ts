import type { PageQuery } from '@/types/common';

/** G3-N4b ERP 生产管理（T026/T096，后端 Base: /erp/production）类型与枚举定义。 */

/* ---------------- 通用分页查询 ---------------- */

/** 生产订单分页查询条件。 */
export interface ErpProductionOrderQuery extends PageQuery {
  orderStatus?: string;
  orderType?: string;
  materialCode?: string;
  planNo?: string;
}

/** 订单拆分单分页查询条件。 */
export interface ErpProductionOrderSplitQuery extends PageQuery {
  splitStatus?: string;
  splitType?: string;
  sourceOrderNo?: string;
}

/** 材料领用单分页查询条件。 */
export interface ErpMaterialIssueQuery extends PageQuery {
  issueStatus?: string;
  orderNo?: string;
}

/** 生产补料单分页查询条件。 */
export interface ErpMaterialAdditionQuery extends PageQuery {
  additionStatus?: string;
  additionType?: string;
  orderNo?: string;
}

/** 完工入库单分页查询条件。 */
export interface ErpCompletionReceiptQuery extends PageQuery {
  receiptStatus?: string;
  inspectionStatus?: string;
  orderNo?: string;
}

/* ---------------- 1. 生产订单（主子表） ---------------- */

export interface ErpProductionOrder {
  id?: number;
  orderNo?: string;
  orderType?: string;
  materialCode: string;
  materialName?: string;
  spec?: string;
  uom?: string;
  planQty?: number | null;
  completedQty?: number | null;
  scrapQty?: number | null;
  orderStatus?: string;
  planStartDate?: string;
  planEndDate?: string;
  actualStartDate?: string;
  actualEndDate?: string;
  workshop?: string;
  lineCode?: string;
  bomVersion?: string;
  routingVersion?: string;
  sourceType?: string;
  sourceNo?: string;
  planNo?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ErpProductionOrderSaveRequest = Omit<
  ErpProductionOrder,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

export interface ErpProductionOrderLine {
  id?: number;
  orderId?: number;
  orderNo?: string;
  lineNo?: number;
  lineStatus?: string;
  materialCode: string;
  materialName?: string;
  spec?: string;
  uom?: string;
  requiredQty?: number | null;
  issuedQty?: number | null;
  pickedQty?: number | null;
  remainingQty?: number | null;
  warehouseCode?: string;
  remark?: string;
}

export type ErpProductionOrderLineSaveRequest = Omit<
  ErpProductionOrderLine,
  'id' | 'orderId' | 'orderNo'
>;

export interface ErpProductionOrderDetail {
  header: ErpProductionOrder;
  lines: ErpProductionOrderLine[];
}

/* ---------------- 2. 订单拆分单 ---------------- */

export interface ErpProductionOrderSplit {
  id?: number;
  splitNo?: string;
  sourceOrderId?: number | null;
  sourceOrderNo?: string;
  targetOrderId?: number | null;
  targetOrderNo?: string;
  splitQty?: number | null;
  splitType?: string;
  splitReason?: string;
  splitBy?: string;
  splitDate?: string;
  splitStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ErpProductionOrderSplitSaveRequest = Omit<
  ErpProductionOrderSplit,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 3. 材料领用单（主子表） ---------------- */

export interface ErpMaterialIssue {
  id?: number;
  issueNo?: string;
  orderNo?: string;
  workshop?: string;
  issueBy?: string;
  issueDate?: string;
  totalQty?: number | null;
  issueStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ErpMaterialIssueSaveRequest = Omit<
  ErpMaterialIssue,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

export interface ErpMaterialIssueLine {
  id?: number;
  issueId?: number;
  issueNo?: string;
  lineNo?: number;
  lineStatus?: string;
  materialCode: string;
  materialName?: string;
  spec?: string;
  uom?: string;
  issueQty?: number | null;
  warehouseCode?: string;
  remark?: string;
}

export type ErpMaterialIssueLineSaveRequest = Omit<
  ErpMaterialIssueLine,
  'id' | 'issueId' | 'issueNo'
>;

export interface ErpMaterialIssueDetail {
  header: ErpMaterialIssue;
  lines: ErpMaterialIssueLine[];
}

/* ---------------- 4. 生产补料单 ---------------- */

export interface ErpMaterialAddition {
  id?: number;
  additionNo?: string;
  orderNo?: string;
  additionType?: string;
  materialCode: string;
  materialName?: string;
  spec?: string;
  uom?: string;
  additionQty?: number | null;
  additionReason?: string;
  overIssueReason?: string;
  approvalStatus?: string;
  additionBy?: string;
  additionDate?: string;
  additionStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ErpMaterialAdditionSaveRequest = Omit<
  ErpMaterialAddition,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 5. 完工入库单 ---------------- */

export interface ErpCompletionReceipt {
  id?: number;
  receiptNo?: string;
  orderNo?: string;
  materialCode: string;
  materialName?: string;
  spec?: string;
  uom?: string;
  completedQty?: number | null;
  scrapQty?: number | null;
  warehouseCode?: string;
  receiptDate?: string;
  inspectionRequired?: number | null;
  inspectionStatus?: string;
  receiptStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ErpCompletionReceiptSaveRequest = Omit<
  ErpCompletionReceipt,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 枚举选项与标签 ---------------- */

/** 生产订单类型：STANDARD/REWORK/TRIAL。 */
export const ERP_PRODUCTION_ORDER_TYPE_OPTIONS = [
  { label: '标准生产', value: 'STANDARD' },
  { label: '返工', value: 'REWORK' },
  { label: '试制', value: 'TRIAL' },
] as const;
export const ERP_PRODUCTION_ORDER_TYPE_LABEL: Record<string, string> = {
  STANDARD: '标准生产',
  REWORK: '返工',
  TRIAL: '试制',
};

/** 生产订单状态：DRAFT/RELEASED/IN_PROGRESS/PARTIAL_COMPLETED/COMPLETED/CLOSED/CANCELLED。 */
export const ERP_PRODUCTION_ORDER_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已下达', value: 'RELEASED' },
  { label: '生产中', value: 'IN_PROGRESS' },
  { label: '部分完工', value: 'PARTIAL_COMPLETED' },
  { label: '已完工', value: 'COMPLETED' },
  { label: '已关闭', value: 'CLOSED' },
  { label: '已取消', value: 'CANCELLED' },
] as const;
export const ERP_PRODUCTION_ORDER_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  RELEASED: '已下达',
  IN_PROGRESS: '生产中',
  PARTIAL_COMPLETED: '部分完工',
  COMPLETED: '已完工',
  CLOSED: '已关闭',
  CANCELLED: '已取消',
};

/** 生产订单行状态：OPEN/ISSUED/CLOSED/CANCELLED。 */
export const ERP_PRODUCTION_LINE_STATUS_OPTIONS = [
  { label: '未领料', value: 'OPEN' },
  { label: '已领料', value: 'ISSUED' },
  { label: '已关闭', value: 'CLOSED' },
  { label: '已取消', value: 'CANCELLED' },
] as const;
export const ERP_PRODUCTION_LINE_STATUS_LABEL: Record<string, string> = {
  OPEN: '未领料',
  ISSUED: '已领料',
  CLOSED: '已关闭',
  CANCELLED: '已取消',
};

/** 订单拆分类型：QTY/BATCH。 */
export const ERP_PRODUCTION_SPLIT_TYPE_OPTIONS = [
  { label: '按数量拆分', value: 'QTY' },
  { label: '按批次拆分', value: 'BATCH' },
] as const;
export const ERP_PRODUCTION_SPLIT_TYPE_LABEL: Record<string, string> = {
  QTY: '按数量拆分',
  BATCH: '按批次拆分',
};

/** 订单拆分状态：DRAFT/CONFIRMED/CANCELLED。 */
export const ERP_PRODUCTION_SPLIT_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已确认', value: 'CONFIRMED' },
  { label: '已取消', value: 'CANCELLED' },
] as const;
export const ERP_PRODUCTION_SPLIT_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  CONFIRMED: '已确认',
  CANCELLED: '已取消',
};

/** 材料领用状态：DRAFT/CONFIRMED/POSTED/CANCELLED。 */
export const ERP_MATERIAL_ISSUE_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已确认', value: 'CONFIRMED' },
  { label: '已过账', value: 'POSTED' },
  { label: '已取消', value: 'CANCELLED' },
] as const;
export const ERP_MATERIAL_ISSUE_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  CONFIRMED: '已确认',
  POSTED: '已过账',
  CANCELLED: '已取消',
};

/** 材料领用行状态：OPEN/ISSUED/CANCELLED。 */
export const ERP_MATERIAL_ISSUE_LINE_STATUS_OPTIONS = [
  { label: '未发料', value: 'OPEN' },
  { label: '已发料', value: 'ISSUED' },
  { label: '已取消', value: 'CANCELLED' },
] as const;
export const ERP_MATERIAL_ISSUE_LINE_STATUS_LABEL: Record<string, string> = {
  OPEN: '未发料',
  ISSUED: '已发料',
  CANCELLED: '已取消',
};

/** 生产补料类型：NORMAL/OVER_ISSUE/SCRAP。 */
export const ERP_MATERIAL_ADDITION_TYPE_OPTIONS = [
  { label: '正常补料', value: 'NORMAL' },
  { label: '超领补料', value: 'OVER_ISSUE' },
  { label: '报废补料', value: 'SCRAP' },
] as const;
export const ERP_MATERIAL_ADDITION_TYPE_LABEL: Record<string, string> = {
  NORMAL: '正常补料',
  OVER_ISSUE: '超领补料',
  SCRAP: '报废补料',
};

/** 生产补料状态：DRAFT/SUBMITTED/APPROVED/REJECTED/POSTED/CANCELLED。 */
export const ERP_MATERIAL_ADDITION_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已提交', value: 'SUBMITTED' },
  { label: '已批准', value: 'APPROVED' },
  { label: '已驳回', value: 'REJECTED' },
  { label: '已过账', value: 'POSTED' },
  { label: '已取消', value: 'CANCELLED' },
] as const;
export const ERP_MATERIAL_ADDITION_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  SUBMITTED: '已提交',
  APPROVED: '已批准',
  REJECTED: '已驳回',
  POSTED: '已过账',
  CANCELLED: '已取消',
};

/** 补料审批状态：PENDING/APPROVED/REJECTED。 */
export const ERP_MATERIAL_ADDITION_APPROVAL_STATUS_OPTIONS = [
  { label: '待审批', value: 'PENDING' },
  { label: '已批准', value: 'APPROVED' },
  { label: '已驳回', value: 'REJECTED' },
] as const;
export const ERP_MATERIAL_ADDITION_APPROVAL_STATUS_LABEL: Record<string, string> = {
  PENDING: '待审批',
  APPROVED: '已批准',
  REJECTED: '已驳回',
};

/** 完工入库状态：DRAFT/CONFIRMED/POSTED/CANCELLED。 */
export const ERP_COMPLETION_RECEIPT_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已确认', value: 'CONFIRMED' },
  { label: '已入库', value: 'POSTED' },
  { label: '已取消', value: 'CANCELLED' },
] as const;
export const ERP_COMPLETION_RECEIPT_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  CONFIRMED: '已确认',
  POSTED: '已入库',
  CANCELLED: '已取消',
};

/** 完工检验状态：PENDING/PASSED/FAILED。 */
export const ERP_COMPLETION_INSPECTION_STATUS_OPTIONS = [
  { label: '待检验', value: 'PENDING' },
  { label: '合格', value: 'PASSED' },
  { label: '不合格', value: 'FAILED' },
] as const;
export const ERP_COMPLETION_INSPECTION_STATUS_LABEL: Record<string, string> = {
  PENDING: '待检验',
  PASSED: '合格',
  FAILED: '不合格',
};
