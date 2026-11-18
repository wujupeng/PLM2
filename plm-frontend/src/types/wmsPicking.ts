import type { PageQuery } from '@/types/common';

/** G5-N4 WMS 拣选发料（T048，后端 Base: /wms/pick）类型与枚举定义。 */

/* ---------------- 分页查询条件 ---------------- */

/** 拣料单分页查询条件。keyword 匹配 pickNo/materialCode/materialName/batchNo。 */
export interface WmsPickTaskQuery extends PageQuery {
  pickStatus?: string;
  pickType?: string;
  workOrderNo?: string;
  materialCode?: string;
}

/** 齐套检查分页查询条件。keyword 匹配 checkNo/workOrderNo/productCode/productName。 */
export interface WmsKittingCheckQuery extends PageQuery {
  kitStatus?: string;
  workOrderNo?: string;
}

/** 线边仓库存分页查询条件。keyword 匹配 materialCode/materialName/batchNo/binCode。 */
export interface WmsLineSideInventoryQuery extends PageQuery {
  stockStatus?: string;
  materialCode?: string;
  lineCode?: string;
  warehouseCode?: string;
}

/* ---------------- 1. 拣料单 ---------------- */

export interface WmsPickTask {
  id?: number;
  pickNo?: string;
  pickType?: string;
  workOrderNo?: string;
  materialCode?: string;
  materialName?: string;
  spec?: string;
  batchNo?: string;
  warehouseCode?: string;
  fromBinCode?: string;
  toBinCode?: string;
  requiredQty?: number | null;
  pickedQty?: number | null;
  pickStrategy?: string;
  taskPriority?: number | null;
  operator?: string;
  pickTime?: string;
  pickStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type WmsPickTaskSaveRequest = Omit<
  WmsPickTask,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 2. 齐套检查 ---------------- */

export interface WmsKittingCheck {
  id?: number;
  checkNo?: string;
  workOrderNo?: string;
  productCode?: string;
  productName?: string;
  planQty?: number | null;
  totalItems?: number | null;
  kitItems?: number | null;
  shortItems?: number | null;
  shortQty?: number | null;
  kitStatus?: string;
  checkBy?: string;
  checkTime?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type WmsKittingCheckSaveRequest = Omit<
  WmsKittingCheck,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 3. 线边仓库存 ---------------- */

export interface WmsLineSideInventory {
  id?: number;
  materialCode?: string;
  materialName?: string;
  spec?: string;
  batchNo?: string;
  lineCode?: string;
  binCode?: string;
  warehouseCode?: string;
  qty?: number | null;
  availableQty?: number | null;
  frozenQty?: number | null;
  minQty?: number | null;
  maxQty?: number | null;
  stockStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type WmsLineSideInventorySaveRequest = Omit<
  WmsLineSideInventory,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 枚举选项与标签 ---------------- */

/** 拣料类型：PRODUCTION/DELIVERY/RETURN。 */
export const WMS_PICK_TYPE_OPTIONS = [
  { label: '生产领料', value: 'PRODUCTION' },
  { label: '发货拣选', value: 'DELIVERY' },
  { label: '退货拣选', value: 'RETURN' },
] as const;
export const WMS_PICK_TYPE_LABEL: Record<string, string> = {
  PRODUCTION: '生产领料',
  DELIVERY: '发货拣选',
  RETURN: '退货拣选',
};

/** 拣料状态：PENDING/PICKING/PICKED/ISSUED/CANCELLED。 */
export const WMS_PICK_STATUS_OPTIONS = [
  { label: '待拣选', value: 'PENDING' },
  { label: '拣选中', value: 'PICKING' },
  { label: '已拣选', value: 'PICKED' },
  { label: '已发料', value: 'ISSUED' },
  { label: '已取消', value: 'CANCELLED' },
] as const;
export const WMS_PICK_STATUS_LABEL: Record<string, string> = {
  PENDING: '待拣选',
  PICKING: '拣选中',
  PICKED: '已拣选',
  ISSUED: '已发料',
  CANCELLED: '已取消',
};

/** 拣选策略：FIFO/LIFO/NEAREST。 */
export const WMS_PICK_STRATEGY_OPTIONS = [
  { label: '先进先出', value: 'FIFO' },
  { label: '后进先出', value: 'LIFO' },
  { label: '最近库位', value: 'NEAREST' },
] as const;
export const WMS_PICK_STRATEGY_LABEL: Record<string, string> = {
  FIFO: '先进先出',
  LIFO: '后进先出',
  NEAREST: '最近库位',
};

/** 齐套状态：PENDING/KITTED/SHORTAGE/PARTIAL。 */
export const WMS_KIT_STATUS_OPTIONS = [
  { label: '待检查', value: 'PENDING' },
  { label: '齐套', value: 'KITTED' },
  { label: '缺料', value: 'SHORTAGE' },
  { label: '部分齐套', value: 'PARTIAL' },
] as const;
export const WMS_KIT_STATUS_LABEL: Record<string, string> = {
  PENDING: '待检查',
  KITTED: '齐套',
  SHORTAGE: '缺料',
  PARTIAL: '部分齐套',
};

/** 线边仓库存状态：NORMAL/SHORTAGE/FROZEN。 */
export const WMS_LINESTOCK_STATUS_OPTIONS = [
  { label: '正常', value: 'NORMAL' },
  { label: '缺料', value: 'SHORTAGE' },
  { label: '冻结', value: 'FROZEN' },
] as const;
export const WMS_LINESTOCK_STATUS_LABEL: Record<string, string> = {
  NORMAL: '正常',
  SHORTAGE: '缺料',
  FROZEN: '冻结',
};
