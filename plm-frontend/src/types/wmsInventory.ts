import type { PageQuery } from '@/types/common';

/** G5-N3 WMS 库存控制（T047，后端 Base: /wms/inventory）类型与枚举定义。 */

/* ---------------- 分页查询条件 ---------------- */

/** 库存批次分页查询条件。keyword 匹配 batchNo/materialCode/materialName/binCode。 */
export interface WmsInventoryBatchQuery extends PageQuery {
  batchStatus?: string;
  materialCode?: string;
  batchNo?: string;
  warehouseCode?: string;
}

/** 序列号分页查询条件。keyword 匹配 serialNo/materialCode/materialName/batchNo。 */
export interface WmsSerialNumberQuery extends PageQuery {
  serialStatus?: string;
  materialCode?: string;
  batchNo?: string;
  warehouseCode?: string;
}

/** 库存冻结分页查询条件。keyword 匹配 freezeNo/materialCode/materialName/batchNo。 */
export interface WmsStockFreezeQuery extends PageQuery {
  freezeStatus?: string;
  freezeType?: string;
  materialCode?: string;
  batchNo?: string;
}

/* ---------------- 1. 库存批次 ---------------- */

export interface WmsInventoryBatch {
  id?: number;
  batchNo?: string;
  materialCode?: string;
  materialName?: string;
  spec?: string;
  warehouseCode?: string;
  zoneCode?: string;
  binCode?: string;
  supplierCode?: string;
  receiptNo?: string;
  batchSource?: string;
  productionDate?: string;
  expiryDate?: string;
  inboundDate?: string;
  qty?: number | null;
  availableQty?: number | null;
  frozenQty?: number | null;
  batchStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type WmsInventoryBatchSaveRequest = Omit<
  WmsInventoryBatch,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 2. 序列号 ---------------- */

export interface WmsSerialNumber {
  id?: number;
  serialNo?: string;
  materialCode?: string;
  materialName?: string;
  spec?: string;
  batchNo?: string;
  warehouseCode?: string;
  binCode?: string;
  supplierCode?: string;
  receiptNo?: string;
  inboundTime?: string;
  customerCode?: string;
  outboundTime?: string;
  serialStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type WmsSerialNumberSaveRequest = Omit<
  WmsSerialNumber,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 3. 库存冻结 ---------------- */

export interface WmsStockFreeze {
  id?: number;
  freezeNo?: string;
  materialCode?: string;
  materialName?: string;
  batchNo?: string;
  warehouseCode?: string;
  binCode?: string;
  freezeQty?: number | null;
  freezeType?: string;
  freezeReason?: string;
  freezeStatus?: string;
  applyBy?: string;
  applyTime?: string;
  releaseBy?: string;
  releaseTime?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type WmsStockFreezeSaveRequest = Omit<
  WmsStockFreeze,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 枚举选项与标签 ---------------- */

/** 库存批次来源：PURCHASE/PRODUCTION/RETURN。 */
export const WMS_INV_BATCH_SOURCE_OPTIONS = [
  { label: '采购入库', value: 'PURCHASE' },
  { label: '生产入库', value: 'PRODUCTION' },
  { label: '退货入库', value: 'RETURN' },
] as const;
export const WMS_INV_BATCH_SOURCE_LABEL: Record<string, string> = {
  PURCHASE: '采购入库',
  PRODUCTION: '生产入库',
  RETURN: '退货入库',
};

/** 库存批次状态：NORMAL/FROZEN/HOLD/EXPIRED/SCRAPPED。 */
export const WMS_INV_BATCH_STATUS_OPTIONS = [
  { label: '正常', value: 'NORMAL' },
  { label: '冻结', value: 'FROZEN' },
  { label: '暂扣', value: 'HOLD' },
  { label: '过期', value: 'EXPIRED' },
  { label: '报废', value: 'SCRAPPED' },
] as const;
export const WMS_INV_BATCH_STATUS_LABEL: Record<string, string> = {
  NORMAL: '正常',
  FROZEN: '冻结',
  HOLD: '暂扣',
  EXPIRED: '过期',
  SCRAPPED: '报废',
};

/** 序列号状态：IN_STOCK/ALLOCATED/OUT_STOCK/RETURNED/SCRAPPED。 */
export const WMS_SERIAL_STATUS_OPTIONS = [
  { label: '在库', value: 'IN_STOCK' },
  { label: '已分配', value: 'ALLOCATED' },
  { label: '已出库', value: 'OUT_STOCK' },
  { label: '已退货', value: 'RETURNED' },
  { label: '报废', value: 'SCRAPPED' },
] as const;
export const WMS_SERIAL_STATUS_LABEL: Record<string, string> = {
  IN_STOCK: '在库',
  ALLOCATED: '已分配',
  OUT_STOCK: '已出库',
  RETURNED: '已退货',
  SCRAPPED: '报废',
};

/** 冻结类型：FREEZE/UNFREEZE。 */
export const WMS_FREEZE_TYPE_OPTIONS = [
  { label: '冻结', value: 'FREEZE' },
  { label: '解冻', value: 'UNFREEZE' },
] as const;
export const WMS_FREEZE_TYPE_LABEL: Record<string, string> = {
  FREEZE: '冻结',
  UNFREEZE: '解冻',
};

/** 冻结状态：FROZEN/RELEASED/CANCELLED。 */
export const WMS_FREEZE_STATUS_OPTIONS = [
  { label: '已冻结', value: 'FROZEN' },
  { label: '已解冻', value: 'RELEASED' },
  { label: '已取消', value: 'CANCELLED' },
] as const;
export const WMS_FREEZE_STATUS_LABEL: Record<string, string> = {
  FROZEN: '已冻结',
  RELEASED: '已解冻',
  CANCELLED: '已取消',
};
