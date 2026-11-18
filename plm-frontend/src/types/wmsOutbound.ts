import type { PageQuery } from '@/types/common';

/** G5-N6 WMS 成品与发运（T050，后端 Base: /wms/outbound）类型与枚举定义。 */

/* ---------------- 分页查询条件 ---------------- */

/** 成品入库分页查询条件。keyword 匹配 fgNo/workOrderNo/materialCode/materialName。 */
export interface WmsFinishedGoodsQuery extends PageQuery {
  fgStatus?: string;
  fgType?: string;
  workOrderNo?: string;
  materialCode?: string;
}

/** 出库波次分页查询条件。keyword 匹配 waveNo/workOrderNo/materialCode/materialName。 */
export interface WmsOutboundWaveQuery extends PageQuery {
  waveStatus?: string;
  waveType?: string;
  workOrderNo?: string;
  materialCode?: string;
}

/** 发运单分页查询条件。keyword 匹配 shipmentNo/customerName/materialCode/materialName。 */
export interface WmsShipmentOrderQuery extends PageQuery {
  shipmentStatus?: string;
  shipmentType?: string;
  customerCode?: string;
  materialCode?: string;
}

/* ---------------- 1. 成品入库 ---------------- */

export interface WmsFinishedGoods {
  id?: number;
  fgNo?: string;
  fgType?: string;
  workOrderNo?: string;
  materialCode?: string;
  materialName?: string;
  spec?: string;
  batchNo?: string;
  warehouseCode?: string;
  binCode?: string;
  planQty?: number | null;
  inboundQty?: number | null;
  packageNo?: string;
  packageType?: string;
  labelNo?: string;
  fgStatus?: string;
  produceBy?: string;
  produceTime?: string;
  inboundBy?: string;
  inboundTime?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type WmsFinishedGoodsSaveRequest = Omit<
  WmsFinishedGoods,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 2. 出库波次 ---------------- */

export interface WmsOutboundWave {
  id?: number;
  waveNo?: string;
  waveType?: string;
  workOrderNo?: string;
  materialCode?: string;
  materialName?: string;
  spec?: string;
  batchNo?: string;
  warehouseCode?: string;
  binCode?: string;
  planQty?: number | null;
  pickedQty?: number | null;
  checkedQty?: number | null;
  waveStatus?: string;
  pickBy?: string;
  pickTime?: string;
  checkBy?: string;
  checkTime?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type WmsOutboundWaveSaveRequest = Omit<
  WmsOutboundWave,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 3. 发运单 ---------------- */

export interface WmsShipmentOrder {
  id?: number;
  shipmentNo?: string;
  shipmentType?: string;
  customerCode?: string;
  customerName?: string;
  materialCode?: string;
  materialName?: string;
  spec?: string;
  batchNo?: string;
  warehouseCode?: string;
  planQty?: number | null;
  shippedQty?: number | null;
  carrier?: string;
  vehicleNo?: string;
  driverName?: string;
  driverPhone?: string;
  deliveryAddress?: string;
  shipmentStatus?: string;
  loadBy?: string;
  loadTime?: string;
  shipBy?: string;
  shipTime?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type WmsShipmentOrderSaveRequest = Omit<
  WmsShipmentOrder,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 枚举选项与标签 ---------------- */

/** 入库类型：FINISHED/REWORK。 */
export const WMS_FG_TYPE_OPTIONS = [
  { label: '成品入库', value: 'FINISHED' },
  { label: '返工入库', value: 'REWORK' },
] as const;
export const WMS_FG_TYPE_LABEL: Record<string, string> = {
  FINISHED: '成品入库',
  REWORK: '返工入库',
};

/** 入库状态：DRAFT/PACKED/INBOUND/CANCELLED。 */
export const WMS_FG_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已包装', value: 'PACKED' },
  { label: '已入库', value: 'INBOUND' },
  { label: '已取消', value: 'CANCELLED' },
] as const;
export const WMS_FG_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  PACKED: '已包装',
  INBOUND: '已入库',
  CANCELLED: '已取消',
};

/** 波次类型：WAVE/MANUAL。 */
export const WMS_WAVE_TYPE_OPTIONS = [
  { label: '波次拣货', value: 'WAVE' },
  { label: '手工拣货', value: 'MANUAL' },
] as const;
export const WMS_WAVE_TYPE_LABEL: Record<string, string> = {
  WAVE: '波次拣货',
  MANUAL: '手工拣货',
};

/** 波次状态：DRAFT/PICKING/PICKED/CHECKED。 */
export const WMS_WAVE_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '拣货中', value: 'PICKING' },
  { label: '已拣货', value: 'PICKED' },
  { label: '已复核', value: 'CHECKED' },
] as const;
export const WMS_WAVE_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  PICKING: '拣货中',
  PICKED: '已拣货',
  CHECKED: '已复核',
};

/** 发运类型：SALES/TRANSFER/SAMPLE。 */
export const WMS_SHIPMENT_TYPE_OPTIONS = [
  { label: '销售发运', value: 'SALES' },
  { label: '调拨发运', value: 'TRANSFER' },
  { label: '样品发运', value: 'SAMPLE' },
] as const;
export const WMS_SHIPMENT_TYPE_LABEL: Record<string, string> = {
  SALES: '销售发运',
  TRANSFER: '调拨发运',
  SAMPLE: '样品发运',
};

/** 发运状态：DRAFT/LOADED/SHIPPED/SIGNED/CANCELLED。 */
export const WMS_SHIPMENT_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已装车', value: 'LOADED' },
  { label: '已发运', value: 'SHIPPED' },
  { label: '已签收', value: 'SIGNED' },
  { label: '已取消', value: 'CANCELLED' },
] as const;
export const WMS_SHIPMENT_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  LOADED: '已装车',
  SHIPPED: '已发运',
  SIGNED: '已签收',
  CANCELLED: '已取消',
};
