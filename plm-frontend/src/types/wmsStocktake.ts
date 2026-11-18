import type { PageQuery } from '@/types/common';

/** G5-N7 WMS 盘点与调拨（T051，后端 Base: /wms/stocktake）类型与枚举定义。 */

/* ---------------- 分页查询条件 ---------------- */

/** 盘点单分页查询条件。keyword 匹配 stocktakeNo/warehouseCode/materialCode/materialName。 */
export interface WmsStocktakeOrderQuery extends PageQuery {
  stocktakeStatus?: string;
  stocktakeType?: string;
  warehouseCode?: string;
  materialCode?: string;
}

/** 盘点差异分页查询条件。keyword 匹配 diffNo/stocktakeNo/materialCode/materialName。 */
export interface WmsStocktakeDiffQuery extends PageQuery {
  diffStatus?: string;
  diffType?: string;
  stocktakeNo?: string;
  materialCode?: string;
}

/** 调拨单分页查询条件。keyword 匹配 transferNo/fromWarehouseCode/toWarehouseCode/materialCode/materialName。 */
export interface WmsTransferOrderQuery extends PageQuery {
  transferStatus?: string;
  transferType?: string;
  fromWarehouseCode?: string;
  materialCode?: string;
}

/* ---------------- 1. 盘点单 ---------------- */

export interface WmsStocktakeOrder {
  id?: number;
  stocktakeNo?: string;
  stocktakeType?: string;
  warehouseCode?: string;
  binCode?: string;
  materialCode?: string;
  materialName?: string;
  spec?: string;
  batchNo?: string;
  bookQty?: number | null;
  countedQty?: number | null;
  diffQty?: number | null;
  stocktakeStatus?: string;
  countBy?: string;
  countTime?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type WmsStocktakeOrderSaveRequest = Omit<
  WmsStocktakeOrder,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 2. 盘点差异 ---------------- */

export interface WmsStocktakeDiff {
  id?: number;
  diffNo?: string;
  stocktakeNo?: string;
  diffType?: string;
  materialCode?: string;
  materialName?: string;
  spec?: string;
  batchNo?: string;
  warehouseCode?: string;
  bookQty?: number | null;
  countedQty?: number | null;
  diffQty?: number | null;
  diffReason?: string;
  diffStatus?: string;
  approveBy?: string;
  approveTime?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type WmsStocktakeDiffSaveRequest = Omit<
  WmsStocktakeDiff,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 3. 调拨单 ---------------- */

export interface WmsTransferOrder {
  id?: number;
  transferNo?: string;
  transferType?: string;
  materialCode?: string;
  materialName?: string;
  spec?: string;
  batchNo?: string;
  fromWarehouseCode?: string;
  fromBinCode?: string;
  toWarehouseCode?: string;
  toBinCode?: string;
  transferQty?: number | null;
  receivedQty?: number | null;
  transferStatus?: string;
  applyBy?: string;
  applyTime?: string;
  transferBy?: string;
  transferTime?: string;
  receiveBy?: string;
  receiveTime?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type WmsTransferOrderSaveRequest = Omit<
  WmsTransferOrder,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 枚举选项与标签 ---------------- */

/** 盘点类型：CYCLE/FULL。 */
export const WMS_STOCKTAKE_TYPE_OPTIONS = [
  { label: '循环盘点', value: 'CYCLE' },
  { label: '全盘', value: 'FULL' },
] as const;
export const WMS_STOCKTAKE_TYPE_LABEL: Record<string, string> = {
  CYCLE: '循环盘点',
  FULL: '全盘',
};

/** 盘点状态：DRAFT/COUNTING/COUNTED/APPROVED/CANCELLED。 */
export const WMS_STOCKTAKE_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '盘点中', value: 'COUNTING' },
  { label: '已盘点', value: 'COUNTED' },
  { label: '已审批', value: 'APPROVED' },
  { label: '已取消', value: 'CANCELLED' },
] as const;
export const WMS_STOCKTAKE_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  COUNTING: '盘点中',
  COUNTED: '已盘点',
  APPROVED: '已审批',
  CANCELLED: '已取消',
};

/** 差异类型：PROFIT/LOSS。 */
export const WMS_STOCKTAKE_DIFF_TYPE_OPTIONS = [
  { label: '盘盈', value: 'PROFIT' },
  { label: '盘亏', value: 'LOSS' },
] as const;
export const WMS_STOCKTAKE_DIFF_TYPE_LABEL: Record<string, string> = {
  PROFIT: '盘盈',
  LOSS: '盘亏',
};

/** 差异状态：PENDING/APPROVED/REJECTED/CLOSED。 */
export const WMS_STOCKTAKE_DIFF_STATUS_OPTIONS = [
  { label: '待审批', value: 'PENDING' },
  { label: '已审批', value: 'APPROVED' },
  { label: '已驳回', value: 'REJECTED' },
  { label: '已关闭', value: 'CLOSED' },
] as const;
export const WMS_STOCKTAKE_DIFF_STATUS_LABEL: Record<string, string> = {
  PENDING: '待审批',
  APPROVED: '已审批',
  REJECTED: '已驳回',
  CLOSED: '已关闭',
};

/** 调拨类型：WAREHOUSE/BIN。 */
export const WMS_TRANSFER_TYPE_OPTIONS = [
  { label: '仓间调拨', value: 'WAREHOUSE' },
  { label: '库位调拨', value: 'BIN' },
] as const;
export const WMS_TRANSFER_TYPE_LABEL: Record<string, string> = {
  WAREHOUSE: '仓间调拨',
  BIN: '库位调拨',
};

/** 调拨状态：DRAFT/TRANSFERRING/TRANSFERRED/RECEIVED/CANCELLED。 */
export const WMS_TRANSFER_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '调拨中', value: 'TRANSFERRING' },
  { label: '已调拨', value: 'TRANSFERRED' },
  { label: '已收货', value: 'RECEIVED' },
  { label: '已取消', value: 'CANCELLED' },
] as const;
export const WMS_TRANSFER_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  TRANSFERRING: '调拨中',
  TRANSFERRED: '已调拨',
  RECEIVED: '已收货',
  CANCELLED: '已取消',
};
