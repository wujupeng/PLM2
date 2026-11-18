import type { PageQuery } from '@/types/common';

/** G3-N2 ERP 销售管理（后端 Base: /erp/sales）类型与枚举定义。 */

/* ---------------- 通用分页查询 ---------------- */

/** 销售预测分页查询条件。 */
export interface ErpSalesForecastQuery extends PageQuery {
  forecastStatus?: string;
  forecastType?: string;
  customerCode?: string;
  materialCode?: string;
}

/** 销售订单分页查询条件。 */
export interface ErpSalesOrderQuery extends PageQuery {
  orderStatus?: string;
  reviewStatus?: string;
  orderType?: string;
  customerCode?: string;
}

/** 订单变更分页查询条件。 */
export interface ErpOrderChangeQuery extends PageQuery {
  changeStatus?: string;
  changeType?: string;
  orderNo?: string;
}

/** 交期评审分页查询条件。 */
export interface ErpDeliveryReviewQuery extends PageQuery {
  reviewStatus?: string;
  reviewResult?: string;
  orderNo?: string;
}

/** 发货单分页查询条件。 */
export interface ErpDeliveryOrderQuery extends PageQuery {
  deliveryStatus?: string;
  deliveryType?: string;
  orderNo?: string;
  customerCode?: string;
}

/** 销售出库分页查询条件。 */
export interface ErpSalesOutboundQuery extends PageQuery {
  outboundStatus?: string;
  orderNo?: string;
  deliveryNo?: string;
  customerCode?: string;
}

/** 销售退货分页查询条件。 */
export interface ErpSalesReturnQuery extends PageQuery {
  returnStatus?: string;
  orderNo?: string;
  customerCode?: string;
}

/** 销售发票分页查询条件。 */
export interface ErpSalesInvoiceQuery extends PageQuery {
  invoiceStatus?: string;
  invoiceType?: string;
  orderNo?: string;
  customerCode?: string;
}

/** 应收账款分页查询条件。 */
export interface ErpSalesReceivableQuery extends PageQuery {
  arStatus?: string;
  invoiceNo?: string;
  customerCode?: string;
}

/* ---------------- 1. 销售预测 ---------------- */

export interface ErpSalesForecast {
  id?: number;
  forecastNo?: string;
  customerCode?: string;
  customerName?: string;
  materialCode: string;
  materialName?: string;
  spec?: string;
  forecastPeriod?: string;
  forecastDate?: string;
  forecastQty?: number | null;
  forecastType?: string;
  forecastStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ErpSalesForecastSaveRequest = Omit<
  ErpSalesForecast,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 2. 销售订单（主子表） ---------------- */

export interface ErpSalesOrder {
  id?: number;
  orderNo?: string;
  orderType?: string;
  customerCode: string;
  customerName?: string;
  salesRegion?: string;
  salesperson?: string;
  projectCode?: string;
  orderDate?: string;
  deliveryDate?: string;
  currencyCode?: string;
  exchangeRate?: number | null;
  taxCode?: string;
  paymentTerm?: string;
  settleMethod?: string;
  creditStatus?: string;
  reviewStatus?: string;
  orderStatus?: string;
  totalAmount?: number | null;
  taxAmount?: number | null;
  netAmount?: number | null;
  deliveredAmount?: number | null;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ErpSalesOrderSaveRequest = Omit<
  ErpSalesOrder,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

export interface ErpSalesOrderLine {
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
  deliveredQty?: number | null;
  remainingQty?: number | null;
  unitPrice?: number | null;
  taxRate?: number | null;
  amount?: number | null;
  deliveryDate?: string;
  warehouseCode?: string;
  remark?: string;
}

export type ErpSalesOrderLineSaveRequest = Omit<
  ErpSalesOrderLine,
  'id' | 'orderId' | 'orderNo' | 'createdAt'
>;

export interface ErpSalesOrderDetail {
  header: ErpSalesOrder;
  lines: ErpSalesOrderLine[];
}

/* ---------------- 3. 订单变更 ---------------- */

export interface ErpOrderChange {
  id?: number;
  changeNo?: string;
  orderNo: string;
  orderLineNo?: number | null;
  changeType?: string;
  changeReason?: string;
  beforeValue?: string;
  afterValue?: string;
  applicant?: string;
  applyDate?: string;
  changeStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ErpOrderChangeSaveRequest = Omit<
  ErpOrderChange,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 4. 交期评审 ---------------- */

export interface ErpDeliveryReview {
  id?: number;
  reviewNo?: string;
  orderNo: string;
  orderLineNo?: number | null;
  materialCode?: string;
  materialName?: string;
  customerRequestDate?: string;
  promisedDate?: string;
  reviewResult?: string;
  reviewOpinion?: string;
  reviewer?: string;
  reviewDate?: string;
  reviewStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ErpDeliveryReviewSaveRequest = Omit<
  ErpDeliveryReview,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 5. 发货单（主子表） ---------------- */

export interface ErpDeliveryOrder {
  id?: number;
  deliveryNo?: string;
  deliveryType?: string;
  orderNo: string;
  customerCode: string;
  customerName?: string;
  deliveryDate?: string;
  warehouseCode?: string;
  receiverAddress?: string;
  contact?: string;
  phone?: string;
  carrier?: string;
  trackingNo?: string;
  deliveryStatus?: string;
  totalQty?: number | null;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ErpDeliveryOrderSaveRequest = Omit<
  ErpDeliveryOrder,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

export interface ErpDeliveryOrderLine {
  id?: number;
  deliveryId?: number;
  deliveryNo?: string;
  lineNo?: number;
  orderNo?: string;
  orderLineNo?: number | null;
  materialCode: string;
  materialName?: string;
  spec?: string;
  uom?: string;
  deliveryQty?: number | null;
  batchNo?: string;
  warehouseCode?: string;
  remark?: string;
}

export type ErpDeliveryOrderLineSaveRequest = Omit<
  ErpDeliveryOrderLine,
  'id' | 'deliveryId' | 'deliveryNo' | 'createdAt'
>;

export interface ErpDeliveryOrderDetail {
  header: ErpDeliveryOrder;
  lines: ErpDeliveryOrderLine[];
}

/* ---------------- 6. 销售出库 ---------------- */

export interface ErpSalesOutbound {
  id?: number;
  outboundNo?: string;
  deliveryNo?: string;
  orderNo?: string;
  customerCode?: string;
  warehouseCode?: string;
  outboundDate?: string;
  outboundQty?: number | null;
  batchNo?: string;
  operatorName?: string;
  outboundStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ErpSalesOutboundSaveRequest = Omit<
  ErpSalesOutbound,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 7. 销售退货 ---------------- */

export interface ErpSalesReturn {
  id?: number;
  returnNo?: string;
  orderNo?: string;
  deliveryNo?: string;
  customerCode: string;
  customerName?: string;
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

export type ErpSalesReturnSaveRequest = Omit<
  ErpSalesReturn,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 8. 销售发票 ---------------- */

export interface ErpSalesInvoice {
  id?: number;
  invoiceNo?: string;
  invoiceType?: string;
  invoiceCode?: string;
  orderNo?: string;
  deliveryNo?: string;
  customerCode: string;
  customerName?: string;
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

export type ErpSalesInvoiceSaveRequest = Omit<
  ErpSalesInvoice,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 9. 应收账款 ---------------- */

export interface ErpSalesReceivable {
  id?: number;
  arNo?: string;
  invoiceNo?: string;
  orderNo?: string;
  customerCode: string;
  customerName?: string;
  arAmount?: number | null;
  receivedAmount?: number | null;
  arBalance?: number | null;
  dueDate?: string;
  arStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ErpSalesReceivableSaveRequest = Omit<
  ErpSalesReceivable,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 枚举选项与标签 ---------------- */

/** 预测类型：MONTHLY/WEEKLY/QUARTERLY。 */
export const ERP_FORECAST_TYPE_OPTIONS = [
  { label: '月度', value: 'MONTHLY' },
  { label: '周度', value: 'WEEKLY' },
  { label: '季度', value: 'QUARTERLY' },
] as const;

export const ERP_FORECAST_TYPE_LABEL: Record<string, string> = {
  MONTHLY: '月度',
  WEEKLY: '周度',
  QUARTERLY: '季度',
};

/** 预测状态：OPEN/CONFIRMED/CLOSED。 */
export const ERP_FORECAST_STATUS_OPTIONS = [
  { label: '未确认', value: 'OPEN' },
  { label: '已确认', value: 'CONFIRMED' },
  { label: '已关闭', value: 'CLOSED' },
] as const;

export const ERP_FORECAST_STATUS_LABEL: Record<string, string> = {
  OPEN: '未确认',
  CONFIRMED: '已确认',
  CLOSED: '已关闭',
};

/** 销售订单类型：STANDARD/URGENT/SAMPLE。 */
export const ERP_SALES_ORDER_TYPE_OPTIONS = [
  { label: '标准订单', value: 'STANDARD' },
  { label: '紧急订单', value: 'URGENT' },
  { label: '样品订单', value: 'SAMPLE' },
] as const;

export const ERP_SALES_ORDER_TYPE_LABEL: Record<string, string> = {
  STANDARD: '标准订单',
  URGENT: '紧急订单',
  SAMPLE: '样品订单',
};

/** 销售订单状态：DRAFT/SUBMITTED/REVIEWING/CONFIRMED/PARTIAL_DELIVERED/DELIVERED/CLOSED/CANCELLED。 */
export const ERP_SALES_ORDER_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已提交', value: 'SUBMITTED' },
  { label: '评审中', value: 'REVIEWING' },
  { label: '已确认', value: 'CONFIRMED' },
  { label: '部分发货', value: 'PARTIAL_DELIVERED' },
  { label: '已发货', value: 'DELIVERED' },
  { label: '已关闭', value: 'CLOSED' },
  { label: '已取消', value: 'CANCELLED' },
] as const;

export const ERP_SALES_ORDER_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  SUBMITTED: '已提交',
  REVIEWING: '评审中',
  CONFIRMED: '已确认',
  PARTIAL_DELIVERED: '部分发货',
  DELIVERED: '已发货',
  CLOSED: '已关闭',
  CANCELLED: '已取消',
};

/** 信用状态：OK/HOLD/RELEASED。 */
export const ERP_CREDIT_STATUS_OPTIONS = [
  { label: '正常', value: 'OK' },
  { label: '信用冻结', value: 'HOLD' },
  { label: '已释放', value: 'RELEASED' },
] as const;

export const ERP_CREDIT_STATUS_LABEL: Record<string, string> = {
  OK: '正常',
  HOLD: '信用冻结',
  RELEASED: '已释放',
};

/** 订单评审状态：PENDING/PASSED/FAILED。 */
export const ERP_REVIEW_STATUS_OPTIONS = [
  { label: '待评审', value: 'PENDING' },
  { label: '已通过', value: 'PASSED' },
  { label: '未通过', value: 'FAILED' },
] as const;

export const ERP_REVIEW_STATUS_LABEL: Record<string, string> = {
  PENDING: '待评审',
  PASSED: '已通过',
  FAILED: '未通过',
};

/** 订单行状态：OPEN/PARTIAL/CLOSED/CANCELLED。 */
export const ERP_ORDER_LINE_STATUS_OPTIONS = [
  { label: '未发货', value: 'OPEN' },
  { label: '部分发货', value: 'PARTIAL' },
  { label: '已关闭', value: 'CLOSED' },
  { label: '已取消', value: 'CANCELLED' },
] as const;

export const ERP_ORDER_LINE_STATUS_LABEL: Record<string, string> = {
  OPEN: '未发货',
  PARTIAL: '部分发货',
  CLOSED: '已关闭',
  CANCELLED: '已取消',
};

/** 变更类型：QUANTITY/DATE/PRICE/CANCEL。 */
export const ERP_CHANGE_TYPE_OPTIONS = [
  { label: '数量变更', value: 'QUANTITY' },
  { label: '交期变更', value: 'DATE' },
  { label: '价格变更', value: 'PRICE' },
  { label: '取消', value: 'CANCEL' },
] as const;

export const ERP_CHANGE_TYPE_LABEL: Record<string, string> = {
  QUANTITY: '数量变更',
  DATE: '交期变更',
  PRICE: '价格变更',
  CANCEL: '取消',
};

/** 变更状态：DRAFT/SUBMITTED/APPROVED/REJECTED/EFFECTIVE。 */
export const ERP_CHANGE_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已提交', value: 'SUBMITTED' },
  { label: '已批准', value: 'APPROVED' },
  { label: '已驳回', value: 'REJECTED' },
  { label: '已生效', value: 'EFFECTIVE' },
] as const;

export const ERP_CHANGE_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  SUBMITTED: '已提交',
  APPROVED: '已批准',
  REJECTED: '已驳回',
  EFFECTIVE: '已生效',
};

/** 交期评审结果：PENDING/PASS/FAIL/ADJUST。 */
export const ERP_REVIEW_RESULT_OPTIONS = [
  { label: '待评审', value: 'PENDING' },
  { label: '通过', value: 'PASS' },
  { label: '不通过', value: 'FAIL' },
  { label: '需调整', value: 'ADJUST' },
] as const;

export const ERP_REVIEW_RESULT_LABEL: Record<string, string> = {
  PENDING: '待评审',
  PASS: '通过',
  FAIL: '不通过',
  ADJUST: '需调整',
};

/** 交期评审记录状态：OPEN/CLOSED。 */
export const ERP_REVIEW_RECORD_STATUS_OPTIONS = [
  { label: '待处理', value: 'OPEN' },
  { label: '已关闭', value: 'CLOSED' },
] as const;

export const ERP_REVIEW_RECORD_STATUS_LABEL: Record<string, string> = {
  OPEN: '待处理',
  CLOSED: '已关闭',
};

/** 发货类型：NORMAL/PARTIAL/RETURN。 */
export const ERP_DELIVERY_TYPE_OPTIONS = [
  { label: '正常发货', value: 'NORMAL' },
  { label: '分批发货', value: 'PARTIAL' },
  { label: '退货发货', value: 'RETURN' },
] as const;

export const ERP_DELIVERY_TYPE_LABEL: Record<string, string> = {
  NORMAL: '正常发货',
  PARTIAL: '分批发货',
  RETURN: '退货发货',
};

/** 发货单状态：DRAFT/CONFIRMED/SHIPPED/RECEIVED/CANCELLED。 */
export const ERP_DELIVERY_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已确认', value: 'CONFIRMED' },
  { label: '已发运', value: 'SHIPPED' },
  { label: '已签收', value: 'RECEIVED' },
  { label: '已取消', value: 'CANCELLED' },
] as const;

export const ERP_DELIVERY_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  CONFIRMED: '已确认',
  SHIPPED: '已发运',
  RECEIVED: '已签收',
  CANCELLED: '已取消',
};

/** 销售出库状态：DRAFT/CONFIRMED/POSTED/CANCELLED。 */
export const ERP_OUTBOUND_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已确认', value: 'CONFIRMED' },
  { label: '已过账', value: 'POSTED' },
  { label: '已取消', value: 'CANCELLED' },
] as const;

export const ERP_OUTBOUND_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  CONFIRMED: '已确认',
  POSTED: '已过账',
  CANCELLED: '已取消',
};

/** 销售退货状态：DRAFT/SUBMITTED/APPROVED/RECEIVED/CLOSED/CANCELLED。 */
export const ERP_RETURN_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已提交', value: 'SUBMITTED' },
  { label: '已批准', value: 'APPROVED' },
  { label: '已收货', value: 'RECEIVED' },
  { label: '已关闭', value: 'CLOSED' },
  { label: '已取消', value: 'CANCELLED' },
] as const;

export const ERP_RETURN_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  SUBMITTED: '已提交',
  APPROVED: '已批准',
  RECEIVED: '已收货',
  CLOSED: '已关闭',
  CANCELLED: '已取消',
};

/** 发票类型：SPECIAL/GENERAL/EXPORT。 */
export const ERP_INVOICE_TYPE_OPTIONS = [
  { label: '增值税专用发票', value: 'SPECIAL' },
  { label: '增值税普通发票', value: 'GENERAL' },
  { label: '出口发票', value: 'EXPORT' },
] as const;

export const ERP_INVOICE_TYPE_LABEL: Record<string, string> = {
  SPECIAL: '增值税专用发票',
  GENERAL: '增值税普通发票',
  EXPORT: '出口发票',
};

/** 发票状态：DRAFT/ISSUED/POSTED/RED_REVERSED/CANCELLED。 */
export const ERP_INVOICE_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已开具', value: 'ISSUED' },
  { label: '已过账', value: 'POSTED' },
  { label: '已红冲', value: 'RED_REVERSED' },
  { label: '已作废', value: 'CANCELLED' },
] as const;

export const ERP_INVOICE_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  ISSUED: '已开具',
  POSTED: '已过账',
  RED_REVERSED: '已红冲',
  CANCELLED: '已作废',
};

/** 应收账款状态：OPEN/PARTIAL/CLOSED/OVERDUE。 */
export const ERP_AR_STATUS_OPTIONS = [
  { label: '未收款', value: 'OPEN' },
  { label: '部分收款', value: 'PARTIAL' },
  { label: '已结清', value: 'CLOSED' },
  { label: '已逾期', value: 'OVERDUE' },
] as const;

export const ERP_AR_STATUS_LABEL: Record<string, string> = {
  OPEN: '未收款',
  PARTIAL: '部分收款',
  CLOSED: '已结清',
  OVERDUE: '已逾期',
};
