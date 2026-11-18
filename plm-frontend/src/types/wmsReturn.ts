import type { PageQuery } from '@/types/common';

/** G5-N5 WMS 生产退补料（T049，后端 Base: /wms/return）类型与枚举定义。 */

/* ---------------- 分页查询条件 ---------------- */

/** 生产退料分页查询条件。keyword 匹配 returnNo/workOrderNo/materialCode/materialName。 */
export interface WmsReturnOrderQuery extends PageQuery {
  returnStatus?: string;
  returnType?: string;
  workOrderNo?: string;
  materialCode?: string;
}

/** 生产补料分页查询条件。keyword 匹配 replenishNo/workOrderNo/materialCode/materialName。 */
export interface WmsReplenishOrderQuery extends PageQuery {
  replenishStatus?: string;
  replenishType?: string;
  workOrderNo?: string;
  materialCode?: string;
}

/** 差异处理分页查询条件。keyword 匹配 diffNo/workOrderNo/materialCode/materialName。 */
export interface WmsMaterialDiffQuery extends PageQuery {
  diffStatus?: string;
  diffType?: string;
  workOrderNo?: string;
  materialCode?: string;
}

/* ---------------- 1. 生产退料 ---------------- */

export interface WmsReturnOrder {
  id?: number;
  returnNo?: string;
  returnType?: string;
  workOrderNo?: string;
  materialCode?: string;
  materialName?: string;
  spec?: string;
  batchNo?: string;
  warehouseCode?: string;
  binCode?: string;
  returnQty?: number | null;
  receivedQty?: number | null;
  returnReason?: string;
  returnStatus?: string;
  applyBy?: string;
  applyTime?: string;
  receiveBy?: string;
  receiveTime?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type WmsReturnOrderSaveRequest = Omit<
  WmsReturnOrder,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 2. 生产补料 ---------------- */

export interface WmsReplenishOrder {
  id?: number;
  replenishNo?: string;
  replenishType?: string;
  workOrderNo?: string;
  materialCode?: string;
  materialName?: string;
  spec?: string;
  batchNo?: string;
  warehouseCode?: string;
  binCode?: string;
  planQty?: number | null;
  replenishQty?: number | null;
  issuedQty?: number | null;
  replenishReason?: string;
  replenishStatus?: string;
  applyBy?: string;
  applyTime?: string;
  issueBy?: string;
  issueTime?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type WmsReplenishOrderSaveRequest = Omit<
  WmsReplenishOrder,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 3. 差异处理 ---------------- */

export interface WmsMaterialDiff {
  id?: number;
  diffNo?: string;
  diffType?: string;
  workOrderNo?: string;
  materialCode?: string;
  materialName?: string;
  spec?: string;
  batchNo?: string;
  warehouseCode?: string;
  planQty?: number | null;
  actualQty?: number | null;
  diffQty?: number | null;
  diffReason?: string;
  diffStatus?: string;
  handler?: string;
  handleTime?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type WmsMaterialDiffSaveRequest = Omit<
  WmsMaterialDiff,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 枚举选项与标签 ---------------- */

/** 退料类型：RETURN/SURPLUS。 */
export const WMS_RETURN_TYPE_OPTIONS = [
  { label: '生产退料', value: 'RETURN' },
  { label: '余料回库', value: 'SURPLUS' },
] as const;
export const WMS_RETURN_TYPE_LABEL: Record<string, string> = {
  RETURN: '生产退料',
  SURPLUS: '余料回库',
};

/** 退料状态：DRAFT/SUBMITTED/RECEIVED/CANCELLED。 */
export const WMS_RETURN_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已提交', value: 'SUBMITTED' },
  { label: '已收货', value: 'RECEIVED' },
  { label: '已取消', value: 'CANCELLED' },
] as const;
export const WMS_RETURN_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  SUBMITTED: '已提交',
  RECEIVED: '已收货',
  CANCELLED: '已取消',
};

/** 补料类型：REPLENISH/OVER_ISSUE。 */
export const WMS_REPLENISH_TYPE_OPTIONS = [
  { label: '生产补料', value: 'REPLENISH' },
  { label: '超领', value: 'OVER_ISSUE' },
] as const;
export const WMS_REPLENISH_TYPE_LABEL: Record<string, string> = {
  REPLENISH: '生产补料',
  OVER_ISSUE: '超领',
};

/** 补料状态：DRAFT/SUBMITTED/ISSUED/CANCELLED。 */
export const WMS_REPLENISH_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已提交', value: 'SUBMITTED' },
  { label: '已发料', value: 'ISSUED' },
  { label: '已取消', value: 'CANCELLED' },
] as const;
export const WMS_REPLENISH_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  SUBMITTED: '已提交',
  ISSUED: '已发料',
  CANCELLED: '已取消',
};

/** 差异类型：QTY/QUALITY。 */
export const WMS_MATERIAL_DIFF_TYPE_OPTIONS = [
  { label: '数量差异', value: 'QTY' },
  { label: '质量差异', value: 'QUALITY' },
] as const;
export const WMS_MATERIAL_DIFF_TYPE_LABEL: Record<string, string> = {
  QTY: '数量差异',
  QUALITY: '质量差异',
};

/** 差异状态：PENDING/PROCESSING/RESOLVED/CLOSED。 */
export const WMS_MATERIAL_DIFF_STATUS_OPTIONS = [
  { label: '待处理', value: 'PENDING' },
  { label: '处理中', value: 'PROCESSING' },
  { label: '已解决', value: 'RESOLVED' },
  { label: '已关闭', value: 'CLOSED' },
] as const;
export const WMS_MATERIAL_DIFF_STATUS_LABEL: Record<string, string> = {
  PENDING: '待处理',
  PROCESSING: '处理中',
  RESOLVED: '已解决',
  CLOSED: '已关闭',
};
