import type { PageQuery } from '@/types/common';

/** G3-N3a ERP 采购管理（后端 Base: /erp/purchase）类型与枚举定义。 */

/* ---------------- 通用分页查询 ---------------- */

/** 请购单分页查询条件。 */
export interface ErpPurchaseRequisitionQuery extends PageQuery {
  requisitionStatus?: string;
  requisitionType?: string;
  applicant?: string;
}

/** 询价单分页查询条件。 */
export interface ErpPurchaseInquiryQuery extends PageQuery {
  inquiryStatus?: string;
  materialCode?: string;
  supplierCode?: string;
}

/** 采购订单分页查询条件。 */
export interface ErpPurchaseOrderQuery extends PageQuery {
  orderStatus?: string;
  reviewStatus?: string;
  orderType?: string;
  supplierCode?: string;
}

/** 采购到货单分页查询条件。 */
export interface ErpGoodsReceiptQuery extends PageQuery {
  receiptStatus?: string;
  receiptType?: string;
  orderNo?: string;
  supplierCode?: string;
}

/** 采购报检分页查询条件。 */
export interface ErpPurchaseInspectionQuery extends PageQuery {
  inspectionStatus?: string;
  inspectionResult?: string;
  receiptNo?: string;
  materialCode?: string;
}

/** 采购入库分页查询条件。 */
export interface ErpPurchaseInboundQuery extends PageQuery {
  inboundStatus?: string;
  receiptNo?: string;
  orderNo?: string;
  supplierCode?: string;
}

/** 采购发票分页查询条件。 */
export interface ErpPurchaseInvoiceQuery extends PageQuery {
  invoiceStatus?: string;
  invoiceType?: string;
  orderNo?: string;
  supplierCode?: string;
}

/** 采购退货分页查询条件。 */
export interface ErpPurchaseReturnQuery extends PageQuery {
  returnStatus?: string;
  orderNo?: string;
  supplierCode?: string;
}

/** 采购结算分页查询条件。 */
export interface ErpPurchaseSettlementQuery extends PageQuery {
  settlementStatus?: string;
  orderNo?: string;
  supplierCode?: string;
  invoiceNo?: string;
}

/* ---------------- 1. 请购单（主子表） ---------------- */

export interface ErpPurchaseRequisition {
  id?: number;
  requisitionNo?: string;
  requisitionType?: string;
  reqOrg?: string;
  applicant?: string;
  applyDate?: string;
  requiredDate?: string;
  currencyCode?: string;
  sourceType?: string;
  requisitionStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ErpPurchaseRequisitionSaveRequest = Omit<
  ErpPurchaseRequisition,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

export interface ErpPurchaseRequisitionLine {
  id?: number;
  requisitionId?: number;
  requisitionNo?: string;
  lineNo?: number;
  lineStatus?: string;
  materialCode: string;
  materialName?: string;
  spec?: string;
  uom?: string;
  reqQty?: number | null;
  orderedQty?: number | null;
  remainingQty?: number | null;
  reqDate?: string;
  suggestedSupplier?: string;
  warehouseCode?: string;
  remark?: string;
}

export type ErpPurchaseRequisitionLineSaveRequest = Omit<
  ErpPurchaseRequisitionLine,
  'id' | 'requisitionId' | 'requisitionNo'
>;

export interface ErpPurchaseRequisitionDetail {
  header: ErpPurchaseRequisition;
  lines: ErpPurchaseRequisitionLine[];
}

/* ---------------- 2. 询价单 ---------------- */

export interface ErpPurchaseInquiry {
  id?: number;
  inquiryNo?: string;
  materialCode: string;
  materialName?: string;
  spec?: string;
  uom?: string;
  inquiryQty?: number | null;
  inquiryDate?: string;
  quoteDeadline?: string;
  supplierCode?: string;
  supplierName?: string;
  quotePrice?: number | null;
  currencyCode?: string;
  quoteDate?: string;
  validUntil?: string;
  inquiryStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ErpPurchaseInquirySaveRequest = Omit<
  ErpPurchaseInquiry,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 3. 采购订单（主子表） ---------------- */

export interface ErpPurchaseOrder {
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

export type ErpPurchaseOrderSaveRequest = Omit<
  ErpPurchaseOrder,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

export interface ErpPurchaseOrderLine {
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
  receivedQty?: number | null;
  remainingQty?: number | null;
  unitPrice?: number | null;
  taxRate?: number | null;
  amount?: number | null;
  requiredDate?: string;
  warehouseCode?: string;
  remark?: string;
}

export type ErpPurchaseOrderLineSaveRequest = Omit<
  ErpPurchaseOrderLine,
  'id' | 'orderId' | 'orderNo'
>;

export interface ErpPurchaseOrderDetail {
  header: ErpPurchaseOrder;
  lines: ErpPurchaseOrderLine[];
}

/* ---------------- 4. 采购到货单（主子表） ---------------- */

export interface ErpGoodsReceipt {
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

export type ErpGoodsReceiptSaveRequest = Omit<
  ErpGoodsReceipt,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

export interface ErpGoodsReceiptLine {
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

export type ErpGoodsReceiptLineSaveRequest = Omit<
  ErpGoodsReceiptLine,
  'id' | 'receiptId' | 'receiptNo'
>;

export interface ErpGoodsReceiptDetail {
  header: ErpGoodsReceipt;
  lines: ErpGoodsReceiptLine[];
}

/* ---------------- 5. 采购报检 ---------------- */

export interface ErpPurchaseInspection {
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

export type ErpPurchaseInspectionSaveRequest = Omit<
  ErpPurchaseInspection,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 6. 采购入库 ---------------- */

export interface ErpPurchaseInbound {
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

export type ErpPurchaseInboundSaveRequest = Omit<
  ErpPurchaseInbound,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 7. 采购发票 ---------------- */

export interface ErpPurchaseInvoice {
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

export type ErpPurchaseInvoiceSaveRequest = Omit<
  ErpPurchaseInvoice,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 8. 采购退货 ---------------- */

export interface ErpPurchaseReturn {
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

export type ErpPurchaseReturnSaveRequest = Omit<
  ErpPurchaseReturn,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 9. 采购结算 ---------------- */

export interface ErpPurchaseSettlement {
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

export type ErpPurchaseSettlementSaveRequest = Omit<
  ErpPurchaseSettlement,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 枚举选项与标签 ---------------- */

/** 请购类型：NORMAL/URGENT/PROJECT。 */
export const ERP_REQUISITION_TYPE_OPTIONS = [
  { label: '普通请购', value: 'NORMAL' },
  { label: '紧急请购', value: 'URGENT' },
  { label: '项目请购', value: 'PROJECT' },
] as const;
export const ERP_REQUISITION_TYPE_LABEL: Record<string, string> = {
  NORMAL: '普通请购',
  URGENT: '紧急请购',
  PROJECT: '项目请购',
};

/** 请购单状态：DRAFT/SUBMITTED/APPROVED/CONVERTED/CLOSED/CANCELLED。 */
export const ERP_REQUISITION_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已提交', value: 'SUBMITTED' },
  { label: '已批准', value: 'APPROVED' },
  { label: '已转采购', value: 'CONVERTED' },
  { label: '已关闭', value: 'CLOSED' },
  { label: '已取消', value: 'CANCELLED' },
] as const;
export const ERP_REQUISITION_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  SUBMITTED: '已提交',
  APPROVED: '已批准',
  CONVERTED: '已转采购',
  CLOSED: '已关闭',
  CANCELLED: '已取消',
};

/** 请购行状态：OPEN/PARTIAL/CLOSED/CANCELLED。 */
export const ERP_REQ_LINE_STATUS_OPTIONS = [
  { label: '未采购', value: 'OPEN' },
  { label: '部分采购', value: 'PARTIAL' },
  { label: '已关闭', value: 'CLOSED' },
  { label: '已取消', value: 'CANCELLED' },
] as const;
export const ERP_REQ_LINE_STATUS_LABEL: Record<string, string> = {
  OPEN: '未采购',
  PARTIAL: '部分采购',
  CLOSED: '已关闭',
  CANCELLED: '已取消',
};

/** 请购来源类型：MANUAL/MRP/SALES。 */
export const ERP_PURCHASE_SOURCE_TYPE_OPTIONS = [
  { label: '手工', value: 'MANUAL' },
  { label: 'MRP运算', value: 'MRP' },
  { label: '销售驱动', value: 'SALES' },
] as const;
export const ERP_PURCHASE_SOURCE_TYPE_LABEL: Record<string, string> = {
  MANUAL: '手工',
  MRP: 'MRP运算',
  SALES: '销售驱动',
};

/** 询价单状态：DRAFT/SENT/QUOTED/COMPARED/CONVERTED/CLOSED。 */
export const ERP_INQUIRY_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已发出', value: 'SENT' },
  { label: '已报价', value: 'QUOTED' },
  { label: '比价完成', value: 'COMPARED' },
  { label: '已转订单', value: 'CONVERTED' },
  { label: '已关闭', value: 'CLOSED' },
] as const;
export const ERP_INQUIRY_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  SENT: '已发出',
  QUOTED: '已报价',
  COMPARED: '比价完成',
  CONVERTED: '已转订单',
  CLOSED: '已关闭',
};

/** 采购订单类型：STANDARD/URGENT/CONSIGN/SUBCONTRACT。 */
export const ERP_PURCHASE_ORDER_TYPE_OPTIONS = [
  { label: '标准采购', value: 'STANDARD' },
  { label: '紧急采购', value: 'URGENT' },
  { label: '寄售', value: 'CONSIGN' },
  { label: '委外', value: 'SUBCONTRACT' },
] as const;
export const ERP_PURCHASE_ORDER_TYPE_LABEL: Record<string, string> = {
  STANDARD: '标准采购',
  URGENT: '紧急采购',
  CONSIGN: '寄售',
  SUBCONTRACT: '委外',
};

/** 采购订单状态：DRAFT/SUBMITTED/APPROVED/PARTIAL_RECEIVED/RECEIVED/CLOSED/CANCELLED。 */
export const ERP_PURCHASE_ORDER_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已提交', value: 'SUBMITTED' },
  { label: '已批准', value: 'APPROVED' },
  { label: '部分到货', value: 'PARTIAL_RECEIVED' },
  { label: '已到货', value: 'RECEIVED' },
  { label: '已关闭', value: 'CLOSED' },
  { label: '已取消', value: 'CANCELLED' },
] as const;
export const ERP_PURCHASE_ORDER_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  SUBMITTED: '已提交',
  APPROVED: '已批准',
  PARTIAL_RECEIVED: '部分到货',
  RECEIVED: '已到货',
  CLOSED: '已关闭',
  CANCELLED: '已取消',
};

/** 采购订单行状态：OPEN/PARTIAL/CLOSED/CANCELLED。 */
export const ERP_PO_LINE_STATUS_OPTIONS = [
  { label: '未到货', value: 'OPEN' },
  { label: '部分到货', value: 'PARTIAL' },
  { label: '已关闭', value: 'CLOSED' },
  { label: '已取消', value: 'CANCELLED' },
] as const;
export const ERP_PO_LINE_STATUS_LABEL: Record<string, string> = {
  OPEN: '未到货',
  PARTIAL: '部分到货',
  CLOSED: '已关闭',
  CANCELLED: '已取消',
};

/** 采购订单评审状态：PENDING/PASSED/FAILED。 */
export const ERP_PURCHASE_REVIEW_STATUS_OPTIONS = [
  { label: '待评审', value: 'PENDING' },
  { label: '已通过', value: 'PASSED' },
  { label: '未通过', value: 'FAILED' },
] as const;
export const ERP_PURCHASE_REVIEW_STATUS_LABEL: Record<string, string> = {
  PENDING: '待评审',
  PASSED: '已通过',
  FAILED: '未通过',
};

/** 到货类型：NORMAL/RETURN/FREE。 */
export const ERP_RECEIPT_TYPE_OPTIONS = [
  { label: '正常到货', value: 'NORMAL' },
  { label: '退货到货', value: 'RETURN' },
  { label: '免费到货', value: 'FREE' },
] as const;
export const ERP_RECEIPT_TYPE_LABEL: Record<string, string> = {
  NORMAL: '正常到货',
  RETURN: '退货到货',
  FREE: '免费到货',
};

/** 到货单状态：DRAFT/RECEIVED/INSPECTING/INSPECTED/INBOUND/CLOSED/CANCELLED。 */
export const ERP_RECEIPT_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已到货', value: 'RECEIVED' },
  { label: '检验中', value: 'INSPECTING' },
  { label: '已检验', value: 'INSPECTED' },
  { label: '已入库', value: 'INBOUND' },
  { label: '已关闭', value: 'CLOSED' },
  { label: '已取消', value: 'CANCELLED' },
] as const;
export const ERP_RECEIPT_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  RECEIVED: '已到货',
  INSPECTING: '检验中',
  INSPECTED: '已检验',
  INBOUND: '已入库',
  CLOSED: '已关闭',
  CANCELLED: '已取消',
};

/** 检验结果：PENDING/PASS/FAIL/CONCESSION。 */
export const ERP_INSPECTION_RESULT_OPTIONS = [
  { label: '待检验', value: 'PENDING' },
  { label: '合格', value: 'PASS' },
  { label: '不合格', value: 'FAIL' },
  { label: '让步接收', value: 'CONCESSION' },
] as const;
export const ERP_INSPECTION_RESULT_LABEL: Record<string, string> = {
  PENDING: '待检验',
  PASS: '合格',
  FAIL: '不合格',
  CONCESSION: '让步接收',
};

/** 报检类型：FULL/SAMPLE/EXEMPT。 */
export const ERP_PURCHASE_INSPECTION_TYPE_OPTIONS = [
  { label: '全检', value: 'FULL' },
  { label: '抽检', value: 'SAMPLE' },
  { label: '免检', value: 'EXEMPT' },
] as const;
export const ERP_PURCHASE_INSPECTION_TYPE_LABEL: Record<string, string> = {
  FULL: '全检',
  SAMPLE: '抽检',
  EXEMPT: '免检',
};

/** 报检单状态：OPEN/CLOSED。 */
export const ERP_PURCHASE_INSPECTION_STATUS_OPTIONS = [
  { label: '待检验', value: 'OPEN' },
  { label: '已关闭', value: 'CLOSED' },
] as const;
export const ERP_PURCHASE_INSPECTION_STATUS_LABEL: Record<string, string> = {
  OPEN: '待检验',
  CLOSED: '已关闭',
};

/** 采购入库状态：DRAFT/CONFIRMED/POSTED/CANCELLED。 */
export const ERP_PURCHASE_INBOUND_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已确认', value: 'CONFIRMED' },
  { label: '已过账', value: 'POSTED' },
  { label: '已取消', value: 'CANCELLED' },
] as const;
export const ERP_PURCHASE_INBOUND_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  CONFIRMED: '已确认',
  POSTED: '已过账',
  CANCELLED: '已取消',
};

/** 采购发票类型：SPECIAL/GENERAL/TRANSPORT。 */
export const ERP_PURCHASE_INVOICE_TYPE_OPTIONS = [
  { label: '增值税专用发票', value: 'SPECIAL' },
  { label: '增值税普通发票', value: 'GENERAL' },
  { label: '运输发票', value: 'TRANSPORT' },
] as const;
export const ERP_PURCHASE_INVOICE_TYPE_LABEL: Record<string, string> = {
  SPECIAL: '增值税专用发票',
  GENERAL: '增值税普通发票',
  TRANSPORT: '运输发票',
};

/** 采购发票状态：DRAFT/RECEIVED/VERIFIED/POSTED/RED_REVERSED/CANCELLED。 */
export const ERP_PURCHASE_INVOICE_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已收票', value: 'RECEIVED' },
  { label: '已认证', value: 'VERIFIED' },
  { label: '已过账', value: 'POSTED' },
  { label: '已红冲', value: 'RED_REVERSED' },
  { label: '已作废', value: 'CANCELLED' },
] as const;
export const ERP_PURCHASE_INVOICE_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  RECEIVED: '已收票',
  VERIFIED: '已认证',
  POSTED: '已过账',
  RED_REVERSED: '已红冲',
  CANCELLED: '已作废',
};

/** 采购退货状态：DRAFT/SUBMITTED/APPROVED/SHIPPED/CLOSED/CANCELLED。 */
export const ERP_PURCHASE_RETURN_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已提交', value: 'SUBMITTED' },
  { label: '已批准', value: 'APPROVED' },
  { label: '已退货', value: 'SHIPPED' },
  { label: '已关闭', value: 'CLOSED' },
  { label: '已取消', value: 'CANCELLED' },
] as const;
export const ERP_PURCHASE_RETURN_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  SUBMITTED: '已提交',
  APPROVED: '已批准',
  SHIPPED: '已退货',
  CLOSED: '已关闭',
  CANCELLED: '已取消',
};

/** 采购结算状态：OPEN/PARTIAL/CLOSED/CANCELLED。 */
export const ERP_PURCHASE_SETTLEMENT_STATUS_OPTIONS = [
  { label: '未结算', value: 'OPEN' },
  { label: '部分结算', value: 'PARTIAL' },
  { label: '已结清', value: 'CLOSED' },
  { label: '已取消', value: 'CANCELLED' },
] as const;
export const ERP_PURCHASE_SETTLEMENT_STATUS_LABEL: Record<string, string> = {
  OPEN: '未结算',
  PARTIAL: '部分结算',
  CLOSED: '已结清',
  CANCELLED: '已取消',
};
