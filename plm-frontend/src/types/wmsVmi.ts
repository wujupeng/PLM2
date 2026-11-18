import type { PageQuery } from '@/types/common';

/** G5-N8 WMS VMI管理（T052，后端 Base: /wms/vmi）类型与枚举定义。 */

/* ---------------- 分页查询条件 ---------------- */

/** VMI 库位分页查询条件。keyword 匹配 vmiBinNo/warehouseCode/binCode/materialCode/materialName。 */
export interface WmsVmiBinQuery extends PageQuery {
  binStatus?: string;
  binType?: string;
  warehouseCode?: string;
  materialCode?: string;
}

/** VMI 扫码收发分页查询条件。keyword 匹配 scanNo/warehouseCode/binCode/materialCode/materialName。 */
export interface WmsVmiScanQuery extends PageQuery {
  scanStatus?: string;
  scanType?: string;
  warehouseCode?: string;
  materialCode?: string;
}

/** VMI 超容量预警分页查询条件。keyword 匹配 warningNo/warehouseCode/binCode/materialCode/materialName。 */
export interface WmsVmiWarningQuery extends PageQuery {
  warningStatus?: string;
  warningLevel?: string;
  warehouseCode?: string;
  materialCode?: string;
}

/* ---------------- 1. VMI 库位 ---------------- */

export interface WmsVmiBin {
  id?: number;
  vmiBinNo?: string;
  binType?: string;
  warehouseCode?: string;
  binCode?: string;
  materialCode?: string;
  materialName?: string;
  spec?: string;
  capacityQty?: number | null;
  palletQty?: number | null;
  maxPalletQty?: number | null;
  qrCode?: string;
  binStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type WmsVmiBinSaveRequest = Omit<
  WmsVmiBin,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 2. VMI 扫码收发 ---------------- */

export interface WmsVmiScan {
  id?: number;
  scanNo?: string;
  scanType?: string;
  warehouseCode?: string;
  binCode?: string;
  materialCode?: string;
  materialName?: string;
  spec?: string;
  batchNo?: string;
  palletNo?: string;
  scanQty?: number | null;
  onHandQty?: number | null;
  scanStatus?: string;
  operator?: string;
  scanTime?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type WmsVmiScanSaveRequest = Omit<
  WmsVmiScan,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 3. VMI 超容量预警 ---------------- */

export interface WmsVmiWarning {
  id?: number;
  warningNo?: string;
  warehouseCode?: string;
  binCode?: string;
  materialCode?: string;
  materialName?: string;
  spec?: string;
  capacityQty?: number | null;
  currentQty?: number | null;
  usageRate?: number | null;
  warningLevel?: string;
  warningStatus?: string;
  warningTime?: string;
  handler?: string;
  handleTime?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type WmsVmiWarningSaveRequest = Omit<
  WmsVmiWarning,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 枚举选项与标签 ---------------- */

/** 库位类型：STORAGE/STAGING/PICKING。 */
export const WMS_VMI_BIN_TYPE_OPTIONS = [
  { label: '存储区', value: 'STORAGE' },
  { label: '暂存区', value: 'STAGING' },
  { label: '拣选区', value: 'PICKING' },
] as const;
export const WMS_VMI_BIN_TYPE_LABEL: Record<string, string> = {
  STORAGE: '存储区',
  STAGING: '暂存区',
  PICKING: '拣选区',
};

/** 库位状态：IDLE/OCCUPIED/FULL/RESERVED/CANCELLED。 */
export const WMS_VMI_BIN_STATUS_OPTIONS = [
  { label: '空闲', value: 'IDLE' },
  { label: '占用', value: 'OCCUPIED' },
  { label: '已满', value: 'FULL' },
  { label: '预留', value: 'RESERVED' },
  { label: '已取消', value: 'CANCELLED' },
] as const;
export const WMS_VMI_BIN_STATUS_LABEL: Record<string, string> = {
  IDLE: '空闲',
  OCCUPIED: '占用',
  FULL: '已满',
  RESERVED: '预留',
  CANCELLED: '已取消',
};

/** 扫码类型：IN/OUT。 */
export const WMS_VMI_SCAN_TYPE_OPTIONS = [
  { label: '扫码入库', value: 'IN' },
  { label: '扫码出库', value: 'OUT' },
] as const;
export const WMS_VMI_SCAN_TYPE_LABEL: Record<string, string> = {
  IN: '扫码入库',
  OUT: '扫码出库',
};

/** 扫码状态：DRAFT/CONFIRMED/CANCELLED。 */
export const WMS_VMI_SCAN_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已确认', value: 'CONFIRMED' },
  { label: '已取消', value: 'CANCELLED' },
] as const;
export const WMS_VMI_SCAN_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  CONFIRMED: '已确认',
  CANCELLED: '已取消',
};

/** 预警等级：LOW/MEDIUM/HIGH。 */
export const WMS_VMI_WARNING_LEVEL_OPTIONS = [
  { label: '低', value: 'LOW' },
  { label: '中', value: 'MEDIUM' },
  { label: '高', value: 'HIGH' },
] as const;
export const WMS_VMI_WARNING_LEVEL_LABEL: Record<string, string> = {
  LOW: '低',
  MEDIUM: '中',
  HIGH: '高',
};

/** 预警状态：PENDING/ACKNOWLEDGED/HANDLED/CLOSED。 */
export const WMS_VMI_WARNING_STATUS_OPTIONS = [
  { label: '待处理', value: 'PENDING' },
  { label: '已确认', value: 'ACKNOWLEDGED' },
  { label: '已处理', value: 'HANDLED' },
  { label: '已关闭', value: 'CLOSED' },
] as const;
export const WMS_VMI_WARNING_STATUS_LABEL: Record<string, string> = {
  PENDING: '待处理',
  ACKNOWLEDGED: '已确认',
  HANDLED: '已处理',
  CLOSED: '已关闭',
};
