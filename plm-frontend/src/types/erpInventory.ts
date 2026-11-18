import type { PageQuery } from '@/types/common';

/** G3-N5 ERP 库存核算（T027/T097，后端 Base: /erp/inventory）类型与枚举定义。 */

/* ---------------- 通用分页查询 ---------------- */

/** 库存余额分页查询条件。 */
export interface ErpInventoryBalanceQuery extends PageQuery {
  materialCode?: string;
  warehouseCode?: string;
  batchNo?: string;
}

/** 库存流水分页查询条件。 */
export interface ErpInventoryTransactionQuery extends PageQuery {
  transactionType?: string;
  bizType?: string;
  transactionStatus?: string;
}

/** 库存调拨分页查询条件。 */
export interface ErpInventoryTransferQuery extends PageQuery {
  transferStatus?: string;
  transferType?: string;
  fromWarehouseCode?: string;
}

/** 库存盘点的分页查询条件。 */
export interface ErpInventoryCountQuery extends PageQuery {
  countStatus?: string;
  countType?: string;
  warehouseCode?: string;
}

/** 形态转换分页查询条件。 */
export interface ErpInventoryConversionQuery extends PageQuery {
  conversionType?: string;
  conversionStatus?: string;
  warehouseCode?: string;
}

/** 库存报废分页查询条件。 */
export interface ErpInventoryScrapQuery extends PageQuery {
  scrapType?: string;
  scrapStatus?: string;
  warehouseCode?: string;
}

/** 库存冻结分页查询条件。 */
export interface ErpInventoryFreezeQuery extends PageQuery {
  freezeType?: string;
  freezeStatus?: string;
  warehouseCode?: string;
}

/** 库存成本分页查询条件。 */
export interface ErpInventoryCostQuery extends PageQuery {
  costMethod?: string;
  costStatus?: string;
  period?: string;
  materialCode?: string;
}

/* ---------------- 1. 库存余额（收发存台账） ---------------- */

export interface ErpInventoryBalance {
  id?: number;
  materialCode: string;
  materialName?: string;
  spec?: string;
  uom?: string;
  warehouseCode: string;
  warehouseName?: string;
  locationCode?: string;
  batchNo?: string;
  onHandQty?: number | null;
  lockedQty?: number | null;
  availableQty?: number | null;
  inTransitQty?: number | null;
  avgCost?: number | null;
  amount?: number | null;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ErpInventoryBalanceSaveRequest = Omit<
  ErpInventoryBalance,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 2. 库存流水 ---------------- */

export interface ErpInventoryTransaction {
  id?: number;
  transactionNo?: string;
  transactionType?: string;
  bizType?: string;
  direction?: string;
  bizNo?: string;
  materialCode: string;
  materialName?: string;
  spec?: string;
  uom?: string;
  warehouseCode?: string;
  locationCode?: string;
  batchNo?: string;
  qty?: number | null;
  unitCost?: number | null;
  amount?: number | null;
  transactionDate?: string;
  operator?: string;
  transactionStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ErpInventoryTransactionSaveRequest = Omit<
  ErpInventoryTransaction,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 3. 库存调拨（主子表） ---------------- */

export interface ErpInventoryTransfer {
  id?: number;
  transferNo?: string;
  transferType?: string;
  fromWarehouseCode?: string;
  fromWarehouseName?: string;
  toWarehouseCode?: string;
  toWarehouseName?: string;
  transferBy?: string;
  transferDate?: string;
  totalQty?: number | null;
  transferStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ErpInventoryTransferSaveRequest = Omit<
  ErpInventoryTransfer,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

export interface ErpInventoryTransferLine {
  id?: number;
  transferId?: number;
  transferNo?: string;
  lineNo?: number;
  lineStatus?: string;
  materialCode: string;
  materialName?: string;
  spec?: string;
  uom?: string;
  batchNo?: string;
  fromLocationCode?: string;
  toLocationCode?: string;
  transferQty?: number | null;
  remark?: string;
}

export type ErpInventoryTransferLineSaveRequest = Omit<
  ErpInventoryTransferLine,
  'id' | 'transferId' | 'transferNo'
>;

export interface ErpInventoryTransferDetail {
  header: ErpInventoryTransfer;
  lines: ErpInventoryTransferLine[];
}

/* ---------------- 4. 库存盘点（主子表） ---------------- */

export interface ErpInventoryCount {
  id?: number;
  countNo?: string;
  countType?: string;
  warehouseCode?: string;
  warehouseName?: string;
  countBy?: string;
  countDate?: string;
  totalDiffQty?: number | null;
  countStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ErpInventoryCountSaveRequest = Omit<
  ErpInventoryCount,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

export interface ErpInventoryCountLine {
  id?: number;
  countId?: number;
  countNo?: string;
  lineNo?: number;
  lineStatus?: string;
  materialCode: string;
  materialName?: string;
  spec?: string;
  uom?: string;
  locationCode?: string;
  batchNo?: string;
  bookQty?: number | null;
  actualQty?: number | null;
  diffQty?: number | null;
  remark?: string;
}

export type ErpInventoryCountLineSaveRequest = Omit<
  ErpInventoryCountLine,
  'id' | 'countId' | 'countNo'
>;

export interface ErpInventoryCountDetail {
  header: ErpInventoryCount;
  lines: ErpInventoryCountLine[];
}

/* ---------------- 5. 形态转换 ---------------- */

export interface ErpInventoryConversion {
  id?: number;
  conversionNo?: string;
  conversionType?: string;
  sourceMaterialCode: string;
  sourceMaterialName?: string;
  sourceSpec?: string;
  sourceUom?: string;
  sourceQty?: number | null;
  sourceBatchNo?: string;
  targetMaterialCode: string;
  targetMaterialName?: string;
  targetSpec?: string;
  targetUom?: string;
  targetQty?: number | null;
  warehouseCode?: string;
  conversionBy?: string;
  conversionDate?: string;
  conversionStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ErpInventoryConversionSaveRequest = Omit<
  ErpInventoryConversion,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 6. 库存报废 ---------------- */

export interface ErpInventoryScrap {
  id?: number;
  scrapNo?: string;
  scrapType?: string;
  materialCode: string;
  materialName?: string;
  spec?: string;
  uom?: string;
  warehouseCode?: string;
  locationCode?: string;
  batchNo?: string;
  scrapQty?: number | null;
  scrapReason?: string;
  scrapBy?: string;
  scrapDate?: string;
  scrapStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ErpInventoryScrapSaveRequest = Omit<
  ErpInventoryScrap,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 7. 库存冻结 ---------------- */

export interface ErpInventoryFreeze {
  id?: number;
  freezeNo?: string;
  freezeType?: string;
  materialCode: string;
  materialName?: string;
  spec?: string;
  uom?: string;
  warehouseCode?: string;
  locationCode?: string;
  batchNo?: string;
  freezeQty?: number | null;
  freezeReason?: string;
  freezeBy?: string;
  freezeDate?: string;
  unfreezeDate?: string;
  freezeStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ErpInventoryFreezeSaveRequest = Omit<
  ErpInventoryFreeze,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 8. 库存成本 ---------------- */

export interface ErpInventoryCost {
  id?: number;
  costNo?: string;
  costMethod?: string;
  period?: string;
  materialCode: string;
  materialName?: string;
  spec?: string;
  uom?: string;
  warehouseCode?: string;
  beginQty?: number | null;
  beginAmount?: number | null;
  inQty?: number | null;
  inAmount?: number | null;
  outQty?: number | null;
  outAmount?: number | null;
  endQty?: number | null;
  endAmount?: number | null;
  avgCost?: number | null;
  costBy?: string;
  costDate?: string;
  costStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ErpInventoryCostSaveRequest = Omit<
  ErpInventoryCost,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 枚举选项与标签 ---------------- */

/** 交易类型：IN/OUT/TRANSFER/ADJUST/SCRAP/CONVERT。 */
export const ERP_INVENTORY_TRANSACTION_TYPE_OPTIONS = [
  { label: '入库', value: 'IN' },
  { label: '出库', value: 'OUT' },
  { label: '调拨', value: 'TRANSFER' },
  { label: '调整', value: 'ADJUST' },
  { label: '报废', value: 'SCRAP' },
  { label: '形态转换', value: 'CONVERT' },
] as const;
export const ERP_INVENTORY_TRANSACTION_TYPE_LABEL: Record<string, string> = {
  IN: '入库',
  OUT: '出库',
  TRANSFER: '调拨',
  ADJUST: '调整',
  SCRAP: '报废',
  CONVERT: '形态转换',
};

/** 业务类型。 */
export const ERP_INVENTORY_BIZ_TYPE_OPTIONS = [
  { label: '采购入库', value: 'PURCHASE_IN' },
  { label: '委外入库', value: 'OUTSOURCE_IN' },
  { label: '产成品入库', value: 'COMPLETION_IN' },
  { label: '材料出库', value: 'MATERIAL_ISSUE' },
  { label: '委外出库', value: 'OUTSOURCE_ISSUE' },
  { label: '销售出库', value: 'SALES_OUT' },
  { label: '调拨', value: 'TRANSFER' },
  { label: '盘点', value: 'COUNT' },
  { label: '报废', value: 'SCRAP' },
  { label: '形态转换', value: 'CONVERT' },
  { label: '手工', value: 'MANUAL' },
] as const;
export const ERP_INVENTORY_BIZ_TYPE_LABEL: Record<string, string> = {
  PURCHASE_IN: '采购入库',
  OUTSOURCE_IN: '委外入库',
  COMPLETION_IN: '产成品入库',
  MATERIAL_ISSUE: '材料出库',
  OUTSOURCE_ISSUE: '委外出库',
  SALES_OUT: '销售出库',
  TRANSFER: '调拨',
  COUNT: '盘点',
  SCRAP: '报废',
  CONVERT: '形态转换',
  MANUAL: '手工',
};

/** 收发方向：IN/OUT。 */
export const ERP_INVENTORY_DIRECTION_OPTIONS = [
  { label: '入', value: 'IN' },
  { label: '出', value: 'OUT' },
] as const;
export const ERP_INVENTORY_DIRECTION_LABEL: Record<string, string> = {
  IN: '入',
  OUT: '出',
};

/** 流水状态：POSTED/CANCELLED。 */
export const ERP_INVENTORY_TRANSACTION_STATUS_OPTIONS = [
  { label: '已过账', value: 'POSTED' },
  { label: '已取消', value: 'CANCELLED' },
] as const;
export const ERP_INVENTORY_TRANSACTION_STATUS_LABEL: Record<string, string> = {
  POSTED: '已过账',
  CANCELLED: '已取消',
};

/** 库存单据行状态：OPEN/CONFIRMED/CANCELLED。 */
export const ERP_INVENTORY_LINE_STATUS_OPTIONS = [
  { label: '未处理', value: 'OPEN' },
  { label: '已确认', value: 'CONFIRMED' },
  { label: '已取消', value: 'CANCELLED' },
] as const;
export const ERP_INVENTORY_LINE_STATUS_LABEL: Record<string, string> = {
  OPEN: '未处理',
  CONFIRMED: '已确认',
  CANCELLED: '已取消',
};

/** 调拨类型：DIRECT/CROSS。 */
export const ERP_INVENTORY_TRANSFER_TYPE_OPTIONS = [
  { label: '直接调拨', value: 'DIRECT' },
  { label: '跨工厂调拨', value: 'CROSS' },
] as const;
export const ERP_INVENTORY_TRANSFER_TYPE_LABEL: Record<string, string> = {
  DIRECT: '直接调拨',
  CROSS: '跨工厂调拨',
};

/** 调拨状态：DRAFT/CONFIRMED/POSTED/CANCELLED。 */
export const ERP_INVENTORY_TRANSFER_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已确认', value: 'CONFIRMED' },
  { label: '已过账', value: 'POSTED' },
  { label: '已取消', value: 'CANCELLED' },
] as const;
export const ERP_INVENTORY_TRANSFER_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  CONFIRMED: '已确认',
  POSTED: '已过账',
  CANCELLED: '已取消',
};

/** 盘点类型：FULL/CYCLE/SPOT。 */
export const ERP_INVENTORY_COUNT_TYPE_OPTIONS = [
  { label: '全盘', value: 'FULL' },
  { label: '循环盘点', value: 'CYCLE' },
  { label: '抽盘', value: 'SPOT' },
] as const;
export const ERP_INVENTORY_COUNT_TYPE_LABEL: Record<string, string> = {
  FULL: '全盘',
  CYCLE: '循环盘点',
  SPOT: '抽盘',
};

/** 盘点状态：DRAFT/COUNTING/CONFIRMED/POSTED/CANCELLED。 */
export const ERP_INVENTORY_COUNT_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '盘点中', value: 'COUNTING' },
  { label: '已确认', value: 'CONFIRMED' },
  { label: '已过账', value: 'POSTED' },
  { label: '已取消', value: 'CANCELLED' },
] as const;
export const ERP_INVENTORY_COUNT_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  COUNTING: '盘点中',
  CONFIRMED: '已确认',
  POSTED: '已过账',
  CANCELLED: '已取消',
};

/** 形态转换类型：SPLIT/MERGE/REPACK。 */
export const ERP_INVENTORY_CONVERSION_TYPE_OPTIONS = [
  { label: '拆分', value: 'SPLIT' },
  { label: '合并', value: 'MERGE' },
  { label: '换包', value: 'REPACK' },
] as const;
export const ERP_INVENTORY_CONVERSION_TYPE_LABEL: Record<string, string> = {
  SPLIT: '拆分',
  MERGE: '合并',
  REPACK: '换包',
};

/** 形态转换状态：DRAFT/CONFIRMED/POSTED/CANCELLED。 */
export const ERP_INVENTORY_CONVERSION_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已确认', value: 'CONFIRMED' },
  { label: '已过账', value: 'POSTED' },
  { label: '已取消', value: 'CANCELLED' },
] as const;
export const ERP_INVENTORY_CONVERSION_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  CONFIRMED: '已确认',
  POSTED: '已过账',
  CANCELLED: '已取消',
};

/** 报废类型：NORMAL/EXPIRED/DAMAGED/QUALITY。 */
export const ERP_INVENTORY_SCRAP_TYPE_OPTIONS = [
  { label: '正常报废', value: 'NORMAL' },
  { label: '过期报废', value: 'EXPIRED' },
  { label: '损坏报废', value: 'DAMAGED' },
  { label: '质量报废', value: 'QUALITY' },
] as const;
export const ERP_INVENTORY_SCRAP_TYPE_LABEL: Record<string, string> = {
  NORMAL: '正常报废',
  EXPIRED: '过期报废',
  DAMAGED: '损坏报废',
  QUALITY: '质量报废',
};

/** 报废状态：DRAFT/CONFIRMED/POSTED/CANCELLED。 */
export const ERP_INVENTORY_SCRAP_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已确认', value: 'CONFIRMED' },
  { label: '已过账', value: 'POSTED' },
  { label: '已取消', value: 'CANCELLED' },
] as const;
export const ERP_INVENTORY_SCRAP_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  CONFIRMED: '已确认',
  POSTED: '已过账',
  CANCELLED: '已取消',
};

/** 冻结类型：MANUAL/QUALITY/LEGAL。 */
export const ERP_INVENTORY_FREEZE_TYPE_OPTIONS = [
  { label: '手工冻结', value: 'MANUAL' },
  { label: '质量冻结', value: 'QUALITY' },
  { label: '法务冻结', value: 'LEGAL' },
] as const;
export const ERP_INVENTORY_FREEZE_TYPE_LABEL: Record<string, string> = {
  MANUAL: '手工冻结',
  QUALITY: '质量冻结',
  LEGAL: '法务冻结',
};

/** 冻结状态：FROZEN/RELEASED。 */
export const ERP_INVENTORY_FREEZE_STATUS_OPTIONS = [
  { label: '已冻结', value: 'FROZEN' },
  { label: '已解冻', value: 'RELEASED' },
] as const;
export const ERP_INVENTORY_FREEZE_STATUS_LABEL: Record<string, string> = {
  FROZEN: '已冻结',
  RELEASED: '已解冻',
};

/** 成本核算方式：MOVING_AVG/FIFO/STANDARD。 */
export const ERP_INVENTORY_COST_METHOD_OPTIONS = [
  { label: '移动平均', value: 'MOVING_AVG' },
  { label: '先进先出', value: 'FIFO' },
  { label: '标准成本', value: 'STANDARD' },
] as const;
export const ERP_INVENTORY_COST_METHOD_LABEL: Record<string, string> = {
  MOVING_AVG: '移动平均',
  FIFO: '先进先出',
  STANDARD: '标准成本',
};

/** 成本状态：DRAFT/COMPLETED。 */
export const ERP_INVENTORY_COST_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已完成', value: 'COMPLETED' },
] as const;
export const ERP_INVENTORY_COST_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  COMPLETED: '已完成',
};
