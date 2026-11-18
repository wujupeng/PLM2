import type { PageQuery } from '@/types/common';

/** G3-N3b ERP 委外管理（后端 Base: /erp/outsource）类型与枚举定义。 */

/* ---------------- 通用分页查询 ---------------- */

/** 委外订单分页查询条件。 */
export interface ErpOutsourceOrderQuery extends PageQuery {
  orderStatus?: string;
  reviewStatus?: string;
  orderType?: string;
  supplierCode?: string;
}

/** 委外发料单分页查询条件。 */
export interface ErpOutsourceIssueQuery extends PageQuery {
  issueStatus?: string;
  orderNo?: string;
  supplierCode?: string;
}

/** 委外到货单分页查询条件。 */
export interface ErpOutsourceReceiptQuery extends PageQuery {
  receiptStatus?: string;
  receiptType?: string;
  orderNo?: string;
  supplierCode?: string;
}

/** 委外报检分页查询条件。 */
export interface ErpOutsourceInspectionQuery extends PageQuery {
  inspectionStatus?: string;
  inspectionResult?: string;
  receiptNo?: string;
  materialCode?: string;
}

/** 委外入库分页查询条件。 */
export interface ErpOutsourceInboundQuery extends PageQuery {
  inboundStatus?: string;
  receiptNo?: string;
  orderNo?: string;
  supplierCode?: string;
}

/** 委外发票分页查询条件。 */
export interface ErpOutsourceInvoiceQuery extends PageQuery {
  invoiceStatus?: string;
  invoiceType?: string;
  orderNo?: string;
  supplierCode?: string;
}

/** 委外结算分页查询条件。 */
export interface ErpOutsourceSettlementQuery extends PageQuery {
  settlementStatus?: string;
  orderNo?: string;
  supplierCode?: string;
  invoiceNo?: string;
}

/** 委外核销分页查询条件。 */
export interface ErpOutsourceWriteoffQuery extends PageQuery {
  writeoffStatus?: string;
  orderNo?: string;
  supplierCode?: string;
}

/** 委外退货分页查询条件。 */
export interface ErpOutsourceReturnQuery extends PageQuery {
  returnStatus?: string;
  orderNo?: string;
  supplierCode?: string;
}

/* ---------------- 1. 委外订单（主子表） ---------------- */

export interface ErpOutsourceOrder {
  id?: number;
  orderNo?: string;
  orderType?: string;
  supplierCode: string;
  supplierName?: string;
  buyerName?: string;
  purchaseGroup?: string;
  orderDate?: string;
  requiredDate?: string;
  currencyCode?: string;
  exchangeRate?: number | null;
  taxCode?: string;
  paymentTerm?: string;
  settleMethod?: string;
  reviewStatus?: string;
  orderStatus?: string;
  totalAmount?: number | null;
  taxAmount?: number | null;
  netAmount?: number | null;
  receivedAmount?: number | null;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ErpOutsourceOrderSaveRequest = Omit<
  ErpOutsourceOrder,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

export interface ErpOutsourceOrderLine {
  id?: number;
  orderId?: number;
  orderNo?: string;
  lineNo?: number;
  lineStatus?: string;
  materialCode: string;
  materialName?: string;
  spec?: string;
  uom?: string;
  orderQty?: number | null;
  issuedQty?: number | null;
  receivedQty?: number | null;
  remainingQty?: number | null;
  unitPrice?: number | null;
  taxRate?: number | null;
  amount?: number | null;
  requiredDate?: string;
  warehouseCode?: string;
  remark?: string;
}

export type ErpOutsourceOrderLineSaveRequest = Omit<
  ErpOutsourceOrderLine,
  'id' | 'orderId' | 'orderNo'
>;

export interface ErpOutsourceOrderDetail {
  header: ErpOutsourceOrder;
  lines: ErpOutsourceOrderLine[];
}

/* ---------------- 2. 委外发料（主子表） ---------------- */

export interface ErpOutsourceIssue {
  id?: number;
  issueNo?: string;
  orderNo?: string;
  supplierCode: string;
  supplierName?: string;
  issueDate?: string;
  warehouseCode?: string;
  issuer?: string;
  issueStatus?: string;
  totalQty?: number | null;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ErpOutsourceIssueSaveRequest = Omit<
  ErpOutsourceIssue,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

export interface ErpOutsourceIssueLine {
  id?: number;
  issueId?: number;
  issueNo?: string;
  lineNo?: number;
  orderNo?: string;
  orderLineNo?: number | null;
  materialCode: string;
  materialName?: string;
  spec?: string;
  uom?: string;
  issueQty?: number | null;
  batchNo?: string;
  warehouseCode?: string;
  remark?: string;
}

export type ErpOutsourceIssueLineSaveRequest = Omit<
  ErpOutsourceIssueLine,
  'id' | 'issueId' | 'issueNo'
>;

export interface ErpOutsourceIssueDetail {
  header: ErpOutsourceIssue;
  lines: ErpOutsourceIssueLine[];
}

/* ---------------- 3. 委外到货（主子表） ---------------- */

export interface ErpOutsourceReceipt {
  id?: number;
  receiptNo?: string;
  receiptType?: string;
  orderNo?: string;
  supplierCode: string;
  supplierName?: string;
  receiptDate?: string;
  warehouseCode?: string;
  inspectionRequired?: number | null;
  receiver?: string;
  receiptStatus?: string;
  totalQty?: number | null;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ErpOutsourceReceiptSaveRequest = Omit<
  ErpOutsourceReceipt,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

export interface ErpOutsourceReceiptLine {
  id?: number;
  receiptId?: number;
  receiptNo?: string;
  lineNo?: number;
  orderNo?: string;
  orderLineNo?: number | null;
  materialCode: string;
  materialName?: string;
  spec?: string;
  uom?: string;
  receiptQty?: number | null;
  batchNo?: string;
  warehouseCode?: string;
  inspectionResult?: string;
  remark?: string;
}

export type ErpOutsourceReceiptLineSaveRequest = Omit<
  ErpOutsourceReceiptLine,
  'id' | 'receiptId' | 'receiptNo'
>;

export interface ErpOutsourceReceiptDetail {
  header: ErpOutsourceReceipt;
  lines: ErpOutsourceReceiptLine[];
}

/* ---------------- 4. 委外报检 ---------------- */

export interface ErpOutsourceInspection {
  id?: number;
  inspectionNo?: string;
  receiptNo?: string;
  orderNo?: string;
  materialCode: string;
  materialName?: string;
  inspectionType?: string;
  inspectionQty?: number | null;
  qualifiedQty?: number | null;
  rejectedQty?: number | null;
  inspectionResult?: string;
  inspector?: string;
  inspectionDate?: string;
  inspectionStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ErpOutsourceInspectionSaveRequest = Omit<
  ErpOutsourceInspection,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 5. 委外入库 ---------------- */

export interface ErpOutsourceInbound {
  id?: number;
  inboundNo?: string;
  receiptNo?: string;
  orderNo?: string;
  supplierCode?: string;
  warehouseCode?: string;
  inboundDate?: string;
  inboundQty?: number | null;
  batchNo?: string;
  operatorName?: string;
  inboundStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ErpOutsourceInboundSaveRequest = Omit<
  ErpOutsourceInbound,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 6. 委外发票 ---------------- */

export interface ErpOutsourceInvoice {
  id?: number;
  invoiceNo?: string;
  invoiceType?: string;
  invoiceCode?: string;
  orderNo?: string;
  receiptNo?: string;
  supplierCode: string;
  supplierName?: string;
  invoiceDate?: string;
  invoiceAmount?: number | null;
  taxRate?: number | null;
  taxAmount?: number | null;
  netAmount?: number | null;
  invoiceStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ErpOutsourceInvoiceSaveRequest = Omit<
  ErpOutsourceInvoice,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 7. 委外结算 ---------------- */

export interface ErpOutsourceSettlement {
  id?: number;
  settlementNo?: string;
  supplierCode: string;
  supplierName?: string;
  orderNo?: string;
  invoiceNo?: string;
  settlementDate?: string;
  settlementAmount?: number | null;
  paidAmount?: number | null;
  settleBalance?: number | null;
  paymentTerm?: string;
  settlementStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ErpOutsourceSettlementSaveRequest = Omit<
  ErpOutsourceSettlement,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 8. 委外核销 ---------------- */

export interface ErpOutsourceWriteoff {
  id?: number;
  writeoffNo?: string;
  orderNo?: string;
  settlementNo?: string;
  supplierCode: string;
  supplierName?: string;
  issuedQty?: number | null;
  receivedQty?: number | null;
  lossQty?: number | null;
  balanceQty?: number | null;
  writeoffDate?: string;
  writeoffStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ErpOutsourceWriteoffSaveRequest = Omit<
  ErpOutsourceWriteoff,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 9. 委外退货 ---------------- */

export interface ErpOutsourceReturn {
  id?: number;
  returnNo?: string;
  orderNo?: string;
  receiptNo?: string;
  supplierCode: string;
  supplierName?: string;
  materialCode: string;
  materialName?: string;
  returnDate?: string;
  returnQty?: number | null;
  returnReason?: string;
  returnAmount?: number | null;
  warehouseCode?: string;
  returnStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ErpOutsourceReturnSaveRequest = Omit<
  ErpOutsourceReturn,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 枚举选项与标签 ---------------- */

/** 委外订单类型：STANDARD/REWORK。 */
export const ERP_OUTSOURCE_ORDER_TYPE_OPTIONS = [
  { label: '标准委外', value: 'STANDARD' },
  { label: '返工', value: 'REWORK' },
] as const;
export const ERP_OUTSOURCE_ORDER_TYPE_LABEL: Record<string, string> = {
  STANDARD: '标准委外',
  REWORK: '返工',
};

/** 委外订单状态：DRAFT/SUBMITTED/APPROVED/PARTIAL_RECEIVED/RECEIVED/CLOSED/CANCELLED。 */
export const ERP_OUTSOURCE_ORDER_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已提交', value: 'SUBMITTED' },
  { label: '已批准', value: 'APPROVED' },
  { label: '部分到货', value: 'PARTIAL_RECEIVED' },
  { label: '已到货', value: 'RECEIVED' },
  { label: '已关闭', value: 'CLOSED' },
  { label: '已取消', value: 'CANCELLED' },
] as const;
export const ERP_OUTSOURCE_ORDER_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  SUBMITTED: '已提交',
  APPROVED: '已批准',
  PARTIAL_RECEIVED: '部分到货',
  RECEIVED: '已到货',
  CLOSED: '已关闭',
  CANCELLED: '已取消',
};

/** 委外订单行状态：OPEN/PARTIAL/CLOSED/CANCELLED。 */
export const ERP_OUTSOURCE_LINE_STATUS_OPTIONS = [
  { label: '未到货', value: 'OPEN' },
  { label: '部分到货', value: 'PARTIAL' },
  { label: '已关闭', value: 'CLOSED' },
  { label: '已取消', value: 'CANCELLED' },
] as const;
export const ERP_OUTSOURCE_LINE_STATUS_LABEL: Record<string, string> = {
  OPEN: '未到货',
  PARTIAL: '部分到货',
  CLOSED: '已关闭',
  CANCELLED: '已取消',
};

/** 委外订单评审状态：PENDING/PASSED/FAILED。 */
export const ERP_OUTSOURCE_REVIEW_STATUS_OPTIONS = [
  { label: '待评审', value: 'PENDING' },
  { label: '已通过', value: 'PASSED' },
  { label: '未通过', value: 'FAILED' },
] as const;
export const ERP_OUTSOURCE_REVIEW_STATUS_LABEL: Record<string, string> = {
  PENDING: '待评审',
  PASSED: '已通过',
  FAILED: '未通过',
};

/** 委外发料单状态：DRAFT/CONFIRMED/POSTED/CANCELLED。 */
export const ERP_OUTSOURCE_ISSUE_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已确认', value: 'CONFIRMED' },
  { label: '已过账', value: 'POSTED' },
  { label: '已取消', value: 'CANCELLED' },
] as const;
export const ERP_OUTSOURCE_ISSUE_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  CONFIRMED: '已确认',
  POSTED: '已过账',
  CANCELLED: '已取消',
};

/** 委外到货类型：NORMAL/RETURN/FREE。 */
export const ERP_OUTSOURCE_RECEIPT_TYPE_OPTIONS = [
  { label: '正常到货', value: 'NORMAL' },
  { label: '退货到货', value: 'RETURN' },
  { label: '免费到货', value: 'FREE' },
] as const;
export const ERP_OUTSOURCE_RECEIPT_TYPE_LABEL: Record<string, string> = {
  NORMAL: '正常到货',
  RETURN: '退货到货',
  FREE: '免费到货',
};

/** 委外到货单状态：DRAFT/RECEIVED/INSPECTING/INSPECTED/INBOUND/CLOSED/CANCELLED。 */
export const ERP_OUTSOURCE_RECEIPT_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已到货', value: 'RECEIVED' },
  { label: '检验中', value: 'INSPECTING' },
  { label: '已检验', value: 'INSPECTED' },
  { label: '已入库', value: 'INBOUND' },
  { label: '已关闭', value: 'CLOSED' },
  { label: '已取消', value: 'CANCELLED' },
] as const;
export const ERP_OUTSOURCE_RECEIPT_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  RECEIVED: '已到货',
  INSPECTING: '检验中',
  INSPECTED: '已检验',
  INBOUND: '已入库',
  CLOSED: '已关闭',
  CANCELLED: '已取消',
};

/** 委外报检类型：FULL/SAMPLE/EXEMPT。 */
export const ERP_OUTSOURCE_INSPECTION_TYPE_OPTIONS = [
  { label: '全检', value: 'FULL' },
  { label: '抽检', value: 'SAMPLE' },
  { label: '免检', value: 'EXEMPT' },
] as const;
export const ERP_OUTSOURCE_INSPECTION_TYPE_LABEL: Record<string, string> = {
  FULL: '全检',
  SAMPLE: '抽检',
  EXEMPT: '免检',
};

/** 委外检验结果：PENDING/PASS/FAIL/CONCESSION。 */
export const ERP_OUTSOURCE_INSPECTION_RESULT_OPTIONS = [
  { label: '待检验', value: 'PENDING' },
  { label: '合格', value: 'PASS' },
  { label: '不合格', value: 'FAIL' },
  { label: '让步接收', value: 'CONCESSION' },
] as const;
export const ERP_OUTSOURCE_INSPECTION_RESULT_LABEL: Record<string, string> = {
  PENDING: '待检验',
  PASS: '合格',
  FAIL: '不合格',
  CONCESSION: '让步接收',
};

/** 委外报检单状态：OPEN/CLOSED。 */
export const ERP_OUTSOURCE_INSPECTION_STATUS_OPTIONS = [
  { label: '待检验', value: 'OPEN' },
  { label: '已关闭', value: 'CLOSED' },
] as const;
export const ERP_OUTSOURCE_INSPECTION_STATUS_LABEL: Record<string, string> = {
  OPEN: '待检验',
  CLOSED: '已关闭',
};

/** 委外入库单状态：DRAFT/CONFIRMED/POSTED/CANCELLED。 */
export const ERP_OUTSOURCE_INBOUND_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已确认', value: 'CONFIRMED' },
  { label: '已过账', value: 'POSTED' },
  { label: '已取消', value: 'CANCELLED' },
] as const;
export const ERP_OUTSOURCE_INBOUND_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  CONFIRMED: '已确认',
  POSTED: '已过账',
  CANCELLED: '已取消',
};

/** 委外发票类型：SPECIAL/GENERAL/TRANSPORT。 */
export const ERP_OUTSOURCE_INVOICE_TYPE_OPTIONS = [
  { label: '增值税专用发票', value: 'SPECIAL' },
  { label: '增值税普通发票', value: 'GENERAL' },
  { label: '运输发票', value: 'TRANSPORT' },
] as const;
export const ERP_OUTSOURCE_INVOICE_TYPE_LABEL: Record<string, string> = {
  SPECIAL: '增值税专用发票',
  GENERAL: '增值税普通发票',
  TRANSPORT: '运输发票',
};

/** 委外发票状态：DRAFT/RECEIVED/VERIFIED/POSTED/RED_REVERSED/CANCELLED。 */
export const ERP_OUTSOURCE_INVOICE_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已收票', value: 'RECEIVED' },
  { label: '已认证', value: 'VERIFIED' },
  { label: '已过账', value: 'POSTED' },
  { label: '已红冲', value: 'RED_REVERSED' },
  { label: '已作废', value: 'CANCELLED' },
] as const;
export const ERP_OUTSOURCE_INVOICE_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  RECEIVED: '已收票',
  VERIFIED: '已认证',
  POSTED: '已过账',
  RED_REVERSED: '已红冲',
  CANCELLED: '已作废',
};

/** 委外结算状态：OPEN/PARTIAL/CLOSED/CANCELLED。 */
export const ERP_OUTSOURCE_SETTLEMENT_STATUS_OPTIONS = [
  { label: '未结算', value: 'OPEN' },
  { label: '部分结算', value: 'PARTIAL' },
  { label: '已结清', value: 'CLOSED' },
  { label: '已取消', value: 'CANCELLED' },
] as const;
export const ERP_OUTSOURCE_SETTLEMENT_STATUS_LABEL: Record<string, string> = {
  OPEN: '未结算',
  PARTIAL: '部分结算',
  CLOSED: '已结清',
  CANCELLED: '已取消',
};

/** 委外核销状态：OPEN/PARTIAL/CLOSED/CANCELLED。 */
export const ERP_OUTSOURCE_WRITEOFF_STATUS_OPTIONS = [
  { label: '未核销', value: 'OPEN' },
  { label: '部分核销', value: 'PARTIAL' },
  { label: '已核销', value: 'CLOSED' },
  { label: '已取消', value: 'CANCELLED' },
] as const;
export const ERP_OUTSOURCE_WRITEOFF_STATUS_LABEL: Record<string, string> = {
  OPEN: '未核销',
  PARTIAL: '部分核销',
  CLOSED: '已核销',
  CANCELLED: '已取消',
};

/** 委外退货状态：DRAFT/SUBMITTED/APPROVED/SHIPPED/CLOSED/CANCELLED。 */
export const ERP_OUTSOURCE_RETURN_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已提交', value: 'SUBMITTED' },
  { label: '已批准', value: 'APPROVED' },
  { label: '已退货', value: 'SHIPPED' },
  { label: '已关闭', value: 'CLOSED' },
  { label: '已取消', value: 'CANCELLED' },
] as const;
export const ERP_OUTSOURCE_RETURN_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  SUBMITTED: '已提交',
  APPROVED: '已批准',
  SHIPPED: '已退货',
  CLOSED: '已关闭',
  CANCELLED: '已取消',
};
