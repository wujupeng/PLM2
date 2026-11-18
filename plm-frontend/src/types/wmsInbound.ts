import type { PageQuery } from '@/types/common';

/** G5-N2 WMS 收货上架（T046，后端 Base: /wms/inbound）类型与枚举定义。 */

/* ---------------- 分页查询条件 ---------------- */

/** 收货通知（ASN）分页查询条件。keyword 匹配 asnNo/supplierCode/supplierName/poNo。 */
export interface WmsAsnQuery extends PageQuery {
  asnType?: string;
  asnStatus?: string;
  supplierCode?: string;
  poNo?: string;
}

/** 收货单分页查询条件。keyword 匹配 receiptNo/asnNo/supplierCode/supplierName/operator。 */
export interface WmsReceiptQuery extends PageQuery {
  receiveType?: string;
  receiveStatus?: string;
  supplierCode?: string;
  asnNo?: string;
}

/** 上架任务分页查询条件。keyword 匹配 taskNo/receiptNo/materialCode/materialName/batchNo。 */
export interface WmsPutawayTaskQuery extends PageQuery {
  putawayStatus?: string;
  receiptNo?: string;
  materialCode?: string;
  toBinCode?: string;
}

/* ---------------- 1. 收货通知（ASN） ---------------- */

export interface WmsAsn {
  id?: number;
  asnNo?: string;
  asnType?: string;
  supplierCode?: string;
  supplierName?: string;
  poNo?: string;
  expectedArrivalDate?: string;
  carrier?: string;
  warehouseCode?: string;
  totalQty?: number | null;
  receivedQty?: number | null;
  asnStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type WmsAsnSaveRequest = Omit<
  WmsAsn,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 2. 收货单 ---------------- */

export interface WmsReceipt {
  id?: number;
  receiptNo?: string;
  asnNo?: string;
  supplierCode?: string;
  supplierName?: string;
  warehouseCode?: string;
  receiveType?: string;
  receiveTime?: string;
  operator?: string;
  totalQty?: number | null;
  inspectedQty?: number | null;
  qualifiedQty?: number | null;
  rejectedQty?: number | null;
  receiveStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type WmsReceiptSaveRequest = Omit<
  WmsReceipt,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 3. 上架任务 ---------------- */

export interface WmsPutawayTask {
  id?: number;
  taskNo?: string;
  receiptNo?: string;
  materialCode?: string;
  materialName?: string;
  batchNo?: string;
  qty?: number | null;
  fromBinCode?: string;
  toBinCode?: string;
  strategyCode?: string;
  operator?: string;
  putawayTime?: string;
  taskPriority?: number | null;
  putawayStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type WmsPutawayTaskSaveRequest = Omit<
  WmsPutawayTask,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 枚举选项与标签 ---------------- */

/** ASN 类型：PURCHASE/OUTSOURCE。 */
export const WMS_ASN_TYPE_OPTIONS = [
  { label: '采购 ASN', value: 'PURCHASE' },
  { label: '委外 ASN', value: 'OUTSOURCE' },
] as const;
export const WMS_ASN_TYPE_LABEL: Record<string, string> = {
  PURCHASE: '采购 ASN',
  OUTSOURCE: '委外 ASN',
};

/** ASN 状态：DRAFT/RELEASED/RECEIVING/RECEIVED/CLOSED。 */
export const WMS_ASN_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已下达', value: 'RELEASED' },
  { label: '收货中', value: 'RECEIVING' },
  { label: '已收货', value: 'RECEIVED' },
  { label: '已关闭', value: 'CLOSED' },
] as const;
export const WMS_ASN_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  RELEASED: '已下达',
  RECEIVING: '收货中',
  RECEIVED: '已收货',
  CLOSED: '已关闭',
};

/** 收货方式：SCAN/MANUAL。 */
export const WMS_RECEIVE_TYPE_OPTIONS = [
  { label: '扫码收货', value: 'SCAN' },
  { label: '手工收货', value: 'MANUAL' },
] as const;
export const WMS_RECEIVE_TYPE_LABEL: Record<string, string> = {
  SCAN: '扫码收货',
  MANUAL: '手工收货',
};

/** 收货状态：PENDING/INSPECTING/QUALIFIED/REJECTED/PUTAWAY_DONE。 */
export const WMS_RECEIVE_STATUS_OPTIONS = [
  { label: '待检', value: 'PENDING' },
  { label: '检验中', value: 'INSPECTING' },
  { label: '合格放行', value: 'QUALIFIED' },
  { label: '拒收', value: 'REJECTED' },
  { label: '已上架', value: 'PUTAWAY_DONE' },
] as const;
export const WMS_RECEIVE_STATUS_LABEL: Record<string, string> = {
  PENDING: '待检',
  INSPECTING: '检验中',
  QUALIFIED: '合格放行',
  REJECTED: '拒收',
  PUTAWAY_DONE: '已上架',
};

/** 上架状态：PENDING/IN_PROGRESS/DONE/CANCELLED。 */
export const WMS_PUTAWAY_STATUS_OPTIONS = [
  { label: '待上架', value: 'PENDING' },
  { label: '上架中', value: 'IN_PROGRESS' },
  { label: '已完成', value: 'DONE' },
  { label: '已取消', value: 'CANCELLED' },
] as const;
export const WMS_PUTAWAY_STATUS_LABEL: Record<string, string> = {
  PENDING: '待上架',
  IN_PROGRESS: '上架中',
  DONE: '已完成',
  CANCELLED: '已取消',
};
