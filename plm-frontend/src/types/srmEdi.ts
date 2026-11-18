import type { PageQuery } from '@/types/common';

/** G4-N6 SRM EDI 协同（T036，后端 Base: /srm/edi）类型与枚举定义。 */

/* ---------------- 分页查询条件 ---------------- */

/** EDI 报文分页查询条件。keyword 匹配 ediNo/partnerCode/partnerName/bizNo。 */
export interface SrmEdiMessageQuery extends PageQuery {
  direction?: string;
  messageType?: string;
  messageStatus?: string;
  partnerCode?: string;
}

/** EDI 回执分页查询条件。keyword 匹配 receiptNo/ediNo/partnerCode/partnerName/receiptCode。 */
export interface SrmEdiReceiptQuery extends PageQuery {
  receiptType?: string;
  receiptStatus?: string;
  partnerCode?: string;
  ediNo?: string;
}

/** EDI 对账分页查询条件。keyword 匹配 reconcileNo/partnerCode/partnerName/reconcilePeriod。 */
export interface SrmEdiReconcileQuery extends PageQuery {
  messageType?: string;
  reconcileStatus?: string;
  partnerCode?: string;
  reconcilePeriod?: string;
}

/* ---------------- 1. EDI 报文 ---------------- */

export interface SrmEdiMessage {
  id?: number;
  ediNo?: string;
  partnerCode?: string;
  partnerName?: string;
  direction?: string;
  messageType?: string;
  bizNo?: string;
  messageFormat?: string;
  payload?: string;
  sendTime?: string;
  ackStatus?: string;
  ackTime?: string;
  ackCode?: string;
  retryCount?: number | null;
  lastRetryTime?: string;
  nextRetryTime?: string;
  messageStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type SrmEdiMessageSaveRequest = Omit<
  SrmEdiMessage,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 2. EDI 回执 ---------------- */

export interface SrmEdiReceipt {
  id?: number;
  receiptNo?: string;
  ediNo?: string;
  partnerCode?: string;
  partnerName?: string;
  receiptType?: string;
  receiptCode?: string;
  receiptDesc?: string;
  receivedTime?: string;
  receiptStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type SrmEdiReceiptSaveRequest = Omit<
  SrmEdiReceipt,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 3. EDI 对账 ---------------- */

export interface SrmEdiReconcile {
  id?: number;
  reconcileNo?: string;
  partnerCode?: string;
  partnerName?: string;
  reconcilePeriod?: string;
  messageType?: string;
  sendCount?: number | null;
  ackCount?: number | null;
  failCount?: number | null;
  reconcileResult?: string;
  reconcileDate?: string;
  reconcileStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type SrmEdiReconcileSaveRequest = Omit<
  SrmEdiReconcile,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 枚举选项与标签 ---------------- */

/** EDI 方向：OUTBOUND/INBOUND。 */
export const SRM_EDI_DIRECTION_OPTIONS = [
  { label: '出站（我方发送）', value: 'OUTBOUND' },
  { label: '入站（对方发送）', value: 'INBOUND' },
] as const;
export const SRM_EDI_DIRECTION_LABEL: Record<string, string> = {
  OUTBOUND: '出站（我方发送）',
  INBOUND: '入站（对方发送）',
};

/** EDI 报文类型：DEMAND/FORECAST/ORDER/CHANGE/ASN/INVOICE。 */
export const SRM_EDI_MESSAGE_TYPE_OPTIONS = [
  { label: '客户需求', value: 'DEMAND' },
  { label: '需求预测', value: 'FORECAST' },
  { label: '采购订单', value: 'ORDER' },
  { label: '订单变更', value: 'CHANGE' },
  { label: '发货通知', value: 'ASN' },
  { label: '发票对账', value: 'INVOICE' },
] as const;
export const SRM_EDI_MESSAGE_TYPE_LABEL: Record<string, string> = {
  DEMAND: '客户需求',
  FORECAST: '需求预测',
  ORDER: '采购订单',
  CHANGE: '订单变更',
  ASN: '发货通知',
  INVOICE: '发票对账',
};

/** EDI 报文格式：EDIFACT/X12/XML/JSON/CSV。 */
export const SRM_EDI_FORMAT_OPTIONS = [
  { label: 'EDIFACT', value: 'EDIFACT' },
  { label: 'ANSI X12', value: 'X12' },
  { label: 'XML', value: 'XML' },
  { label: 'JSON', value: 'JSON' },
  { label: 'CSV', value: 'CSV' },
] as const;
export const SRM_EDI_FORMAT_LABEL: Record<string, string> = {
  EDIFACT: 'EDIFACT',
  X12: 'ANSI X12',
  XML: 'XML',
  JSON: 'JSON',
  CSV: 'CSV',
};

/** EDI 报文状态：DRAFT/READY/SENT/ACKED/FAILED/RETRYING/CANCELLED。 */
export const SRM_EDI_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '待发送', value: 'READY' },
  { label: '已发送', value: 'SENT' },
  { label: '已回执', value: 'ACKED' },
  { label: '发送失败', value: 'FAILED' },
  { label: '重试中', value: 'RETRYING' },
  { label: '已取消', value: 'CANCELLED' },
] as const;
export const SRM_EDI_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  READY: '待发送',
  SENT: '已发送',
  ACKED: '已回执',
  FAILED: '发送失败',
  RETRYING: '重试中',
  CANCELLED: '已取消',
};

/** EDI 回执类型：ACK/NAK/APPLICATION。 */
export const SRM_EDI_RECEIPT_TYPE_OPTIONS = [
  { label: '接收确认', value: 'ACK' },
  { label: '拒绝确认', value: 'NAK' },
  { label: '应用确认', value: 'APPLICATION' },
] as const;
export const SRM_EDI_RECEIPT_TYPE_LABEL: Record<string, string> = {
  ACK: '接收确认',
  NAK: '拒绝确认',
  APPLICATION: '应用确认',
};

/** EDI 回执状态：RECEIVED/PROCESSED/FAILED。 */
export const SRM_EDI_RECEIPT_STATUS_OPTIONS = [
  { label: '已接收', value: 'RECEIVED' },
  { label: '已处理', value: 'PROCESSED' },
  { label: '处理失败', value: 'FAILED' },
] as const;
export const SRM_EDI_RECEIPT_STATUS_LABEL: Record<string, string> = {
  RECEIVED: '已接收',
  PROCESSED: '已处理',
  FAILED: '处理失败',
};

/** EDI 对账状态：PENDING/MATCHED/DIFF/CONFIRMED。 */
export const SRM_EDI_RECONCILE_STATUS_OPTIONS = [
  { label: '待对账', value: 'PENDING' },
  { label: '已平账', value: 'MATCHED' },
  { label: '存在差异', value: 'DIFF' },
  { label: '已确认', value: 'CONFIRMED' },
] as const;
export const SRM_EDI_RECONCILE_STATUS_LABEL: Record<string, string> = {
  PENDING: '待对账',
  MATCHED: '已平账',
  DIFF: '存在差异',
  CONFIRMED: '已确认',
};
