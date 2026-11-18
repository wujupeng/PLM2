import type { PageQuery } from '@/types/common';

/** G3-N6 ERP 财务核算（T028，后端 Base: /erp/finance）类型与枚举定义。 */

/* ---------------- 通用分页查询 ---------------- */

/** 会计科目分页查询条件。 */
export interface ErpFinanceAccountQuery extends PageQuery {
  accountType?: string;
  accountStatus?: string;
  parentCode?: string;
}

/** 会计期间分页查询条件。 */
export interface ErpFinancePeriodQuery extends PageQuery {
  periodStatus?: string;
  periodYear?: number;
}

/** 记账凭证分页查询条件。 */
export interface ErpFinanceVoucherQuery extends PageQuery {
  voucherStatus?: string;
  voucherType?: string;
  periodCode?: string;
}

/** 应收单分页查询条件。 */
export interface ErpFinanceReceivableQuery extends PageQuery {
  arStatus?: string;
  customerCode?: string;
}

/** 应付单分页查询条件。 */
export interface ErpFinancePayableQuery extends PageQuery {
  apStatus?: string;
  supplierCode?: string;
}

/** 收付款单分页查询条件。 */
export interface ErpFinancePaymentQuery extends PageQuery {
  paymentType?: string;
  paymentStatus?: string;
  partyCode?: string;
}

/** 核销单分页查询条件。 */
export interface ErpFinanceWriteoffQuery extends PageQuery {
  writeoffType?: string;
  writeoffStatus?: string;
  partyCode?: string;
}

/** 发票登记分页查询条件。 */
export interface ErpFinanceInvoiceQuery extends PageQuery {
  invoiceType?: string;
  direction?: string;
  invoiceStatus?: string;
  verifyStatus?: string;
}

/** 银行对账单分页查询条件。 */
export interface ErpFinanceBankStatementQuery extends PageQuery {
  direction?: string;
  matchStatus?: string;
  statementStatus?: string;
  bankAccount?: string;
}

/** 成本归集分页查询条件。 */
export interface ErpFinanceCostCollectionQuery extends PageQuery {
  objectType?: string;
  costElement?: string;
  collectionStatus?: string;
  periodCode?: string;
}

/** 暂估分页查询条件。 */
export interface ErpFinanceAccrualQuery extends PageQuery {
  accrualType?: string;
  accrualStatus?: string;
  partyCode?: string;
  periodCode?: string;
}

/* ---------------- 1. 会计科目 ---------------- */

export interface ErpFinanceAccount {
  id?: number;
  accountCode: string;
  accountName?: string;
  accountType?: string;
  balanceDirection?: string;
  parentCode?: string;
  levelNo?: number | null;
  isLeaf?: number | null;
  currencyCode?: string;
  accountStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ErpFinanceAccountSaveRequest = Omit<
  ErpFinanceAccount,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 2. 会计期间 ---------------- */

export interface ErpFinancePeriod {
  id?: number;
  periodCode: string;
  periodYear?: number | null;
  periodMonth?: number | null;
  startDate?: string;
  endDate?: string;
  periodStatus?: string;
  closedAt?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ErpFinancePeriodSaveRequest = Omit<
  ErpFinancePeriod,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 3. 记账凭证（主子表） ---------------- */

export interface ErpFinanceVoucher {
  id?: number;
  voucherNo?: string;
  voucherWord?: string;
  periodCode?: string;
  voucherDate?: string;
  bizType?: string;
  sourceNo?: string;
  totalDebit?: number | null;
  totalCredit?: number | null;
  attachmentCount?: number | null;
  voucherStatus?: string;
  summary?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ErpFinanceVoucherSaveRequest = Omit<
  ErpFinanceVoucher,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

export interface ErpFinanceVoucherLine {
  id?: number;
  voucherId?: number;
  lineNo?: number | null;
  accountCode: string;
  accountName?: string;
  summary?: string;
  debitAmount?: number | null;
  creditAmount?: number | null;
  currencyCode?: string;
  exchangeRate?: number | null;
  deptCode?: string;
  projectCode?: string;
  materialCode?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ErpFinanceVoucherLineSaveRequest = Omit<
  ErpFinanceVoucherLine,
  'id' | 'voucherId' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

export interface ErpFinanceVoucherDetail {
  header?: ErpFinanceVoucher;
  lines?: ErpFinanceVoucherLine[];
}

/* ---------------- 4. 应收单 ---------------- */

export interface ErpFinanceReceivable {
  id?: number;
  arNo?: string;
  customerCode: string;
  customerName?: string;
  invoiceNo?: string;
  sourceNo?: string;
  arAmount?: number | null;
  settledAmount?: number | null;
  arBalance?: number | null;
  currencyCode?: string;
  arDate?: string;
  dueDate?: string;
  arStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ErpFinanceReceivableSaveRequest = Omit<
  ErpFinanceReceivable,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 5. 应付单 ---------------- */

export interface ErpFinancePayable {
  id?: number;
  apNo?: string;
  supplierCode: string;
  supplierName?: string;
  invoiceNo?: string;
  sourceNo?: string;
  apAmount?: number | null;
  settledAmount?: number | null;
  apBalance?: number | null;
  currencyCode?: string;
  apDate?: string;
  dueDate?: string;
  apStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ErpFinancePayableSaveRequest = Omit<
  ErpFinancePayable,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 6. 收付款单 ---------------- */

export interface ErpFinancePayment {
  id?: number;
  paymentNo?: string;
  paymentType?: string;
  partyType?: string;
  partyCode: string;
  partyName?: string;
  bankAccount?: string;
  bankName?: string;
  paymentMethod?: string;
  amount?: number | null;
  currencyCode?: string;
  paymentDate?: string;
  sourceNo?: string;
  paymentStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ErpFinancePaymentSaveRequest = Omit<
  ErpFinancePayment,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 7. 核销单 ---------------- */

export interface ErpFinanceWriteoff {
  id?: number;
  writeoffNo?: string;
  writeoffType?: string;
  partyCode: string;
  partyName?: string;
  sourceNo?: string;
  targetNo?: string;
  writeoffAmount?: number | null;
  currencyCode?: string;
  writeoffDate?: string;
  writeoffStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ErpFinanceWriteoffSaveRequest = Omit<
  ErpFinanceWriteoff,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 8. 发票登记 ---------------- */

export interface ErpFinanceInvoice {
  id?: number;
  invoiceNo: string;
  invoiceCode?: string;
  invoiceType?: string;
  direction?: string;
  partyType?: string;
  partyCode?: string;
  partyName?: string;
  sourceNo?: string;
  amount?: number | null;
  taxRate?: number | null;
  taxAmount?: number | null;
  totalAmount?: number | null;
  currencyCode?: string;
  invoiceDate?: string;
  verifyStatus?: string;
  invoiceStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ErpFinanceInvoiceSaveRequest = Omit<
  ErpFinanceInvoice,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 9. 银行对账单 ---------------- */

export interface ErpFinanceBankStatement {
  id?: number;
  statementNo?: string;
  bankAccount: string;
  bankName?: string;
  transactionNo?: string;
  transactionDate?: string;
  direction?: string;
  amount?: number | null;
  balance?: number | null;
  counterpartyName?: string;
  counterpartyAccount?: string;
  currencyCode?: string;
  matchStatus?: string;
  statementStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ErpFinanceBankStatementSaveRequest = Omit<
  ErpFinanceBankStatement,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 10. 成本归集 ---------------- */

export interface ErpFinanceCostCollection {
  id?: number;
  collectionNo?: string;
  periodCode?: string;
  objectType?: string;
  objectCode: string;
  objectName?: string;
  costElement?: string;
  amount?: number | null;
  currencyCode?: string;
  collectionDate?: string;
  collectionStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ErpFinanceCostCollectionSaveRequest = Omit<
  ErpFinanceCostCollection,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 11. 暂估 ---------------- */

export interface ErpFinanceAccrual {
  id?: number;
  accrualNo?: string;
  accrualType?: string;
  partyCode: string;
  partyName?: string;
  sourceNo?: string;
  periodCode?: string;
  amount?: number | null;
  taxAmount?: number | null;
  currencyCode?: string;
  accrualDate?: string;
  reversed?: number | null;
  accrualStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ErpFinanceAccrualSaveRequest = Omit<
  ErpFinanceAccrual,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 枚举 OPTIONS / LABEL ---------------- */

/** 科目类型：ASSET/LIABILITY/EQUITY/COST/PROFIT_LOSS。 */
export const ERP_FINANCE_ACCOUNT_TYPE_OPTIONS = [
  { label: '资产', value: 'ASSET' },
  { label: '负债', value: 'LIABILITY' },
  { label: '所有者权益', value: 'EQUITY' },
  { label: '成本', value: 'COST' },
  { label: '损益', value: 'PROFIT_LOSS' },
] as const;
export const ERP_FINANCE_ACCOUNT_TYPE_LABEL: Record<string, string> = {
  ASSET: '资产',
  LIABILITY: '负债',
  EQUITY: '所有者权益',
  COST: '成本',
  PROFIT_LOSS: '损益',
};

/** 余额方向：DEBIT/CREDIT。 */
export const ERP_FINANCE_BALANCE_DIRECTION_OPTIONS = [
  { label: '借', value: 'DEBIT' },
  { label: '贷', value: 'CREDIT' },
] as const;
export const ERP_FINANCE_BALANCE_DIRECTION_LABEL: Record<string, string> = {
  DEBIT: '借',
  CREDIT: '贷',
};

/** 科目状态：ACTIVE/INACTIVE。 */
export const ERP_FINANCE_ACCOUNT_STATUS_OPTIONS = [
  { label: '启用', value: 'ACTIVE' },
  { label: '停用', value: 'INACTIVE' },
] as const;
export const ERP_FINANCE_ACCOUNT_STATUS_LABEL: Record<string, string> = {
  ACTIVE: '启用',
  INACTIVE: '停用',
};

/** 会计期间状态：OPEN/CLOSING/CLOSED。 */
export const ERP_FINANCE_PERIOD_STATUS_OPTIONS = [
  { label: '未结账', value: 'OPEN' },
  { label: '结账中', value: 'CLOSING' },
  { label: '已结账', value: 'CLOSED' },
] as const;
export const ERP_FINANCE_PERIOD_STATUS_LABEL: Record<string, string> = {
  OPEN: '未结账',
  CLOSING: '结账中',
  CLOSED: '已结账',
};

/** 凭证字：记/收/付/转。 */
export const ERP_FINANCE_VOUCHER_WORD_OPTIONS = [
  { label: '记', value: '记' },
  { label: '收', value: '收' },
  { label: '付', value: '付' },
  { label: '转', value: '转' },
] as const;
export const ERP_FINANCE_VOUCHER_WORD_LABEL: Record<string, string> = {
  记: '记',
  收: '收',
  付: '付',
  转: '转',
};

/** 凭证业务类型：MANUAL/SALES/PURCHASE/INVENTORY/PAYMENT/COST/PERIOD。 */
export const ERP_FINANCE_VOUCHER_TYPE_OPTIONS = [
  { label: '手工', value: 'MANUAL' },
  { label: '销售', value: 'SALES' },
  { label: '采购', value: 'PURCHASE' },
  { label: '库存', value: 'INVENTORY' },
  { label: '收付款', value: 'PAYMENT' },
  { label: '成本', value: 'COST' },
  { label: '期末', value: 'PERIOD' },
] as const;
export const ERP_FINANCE_VOUCHER_TYPE_LABEL: Record<string, string> = {
  MANUAL: '手工',
  SALES: '销售',
  PURCHASE: '采购',
  INVENTORY: '库存',
  PAYMENT: '收付款',
  COST: '成本',
  PERIOD: '期末',
};

/** 凭证状态：DRAFT/APPROVED/POSTED/VOID。 */
export const ERP_FINANCE_VOUCHER_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已审核', value: 'APPROVED' },
  { label: '已过账', value: 'POSTED' },
  { label: '已作废', value: 'VOID' },
] as const;
export const ERP_FINANCE_VOUCHER_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  APPROVED: '已审核',
  POSTED: '已过账',
  VOID: '已作废',
};

/** 应收状态：OPEN/PARTIAL/SETTLED/VOID。 */
export const ERP_FINANCE_AR_STATUS_OPTIONS = [
  { label: '未结算', value: 'OPEN' },
  { label: '部分结算', value: 'PARTIAL' },
  { label: '已结算', value: 'SETTLED' },
  { label: '作废', value: 'VOID' },
] as const;
export const ERP_FINANCE_AR_STATUS_LABEL: Record<string, string> = {
  OPEN: '未结算',
  PARTIAL: '部分结算',
  SETTLED: '已结算',
  VOID: '作废',
};

/** 应付状态：OPEN/PARTIAL/SETTLED/VOID。 */
export const ERP_FINANCE_AP_STATUS_OPTIONS = [
  { label: '未结算', value: 'OPEN' },
  { label: '部分结算', value: 'PARTIAL' },
  { label: '已结算', value: 'SETTLED' },
  { label: '作废', value: 'VOID' },
] as const;
export const ERP_FINANCE_AP_STATUS_LABEL: Record<string, string> = {
  OPEN: '未结算',
  PARTIAL: '部分结算',
  SETTLED: '已结算',
  VOID: '作废',
};

/** 收付款类型：RECEIPT/PAYMENT。 */
export const ERP_FINANCE_PAYMENT_TYPE_OPTIONS = [
  { label: '收款', value: 'RECEIPT' },
  { label: '付款', value: 'PAYMENT' },
] as const;
export const ERP_FINANCE_PAYMENT_TYPE_LABEL: Record<string, string> = {
  RECEIPT: '收款',
  PAYMENT: '付款',
};

/** 往来单位类型：CUSTOMER/SUPPLIER。 */
export const ERP_FINANCE_PARTY_TYPE_OPTIONS = [
  { label: '客户', value: 'CUSTOMER' },
  { label: '供应商', value: 'SUPPLIER' },
] as const;
export const ERP_FINANCE_PARTY_TYPE_LABEL: Record<string, string> = {
  CUSTOMER: '客户',
  SUPPLIER: '供应商',
};

/** 结算方式：CASH/TRANSFER/CHECK/ONLINE。 */
export const ERP_FINANCE_PAYMENT_METHOD_OPTIONS = [
  { label: '现金', value: 'CASH' },
  { label: '转账', value: 'TRANSFER' },
  { label: '支票', value: 'CHECK' },
  { label: '网银', value: 'ONLINE' },
] as const;
export const ERP_FINANCE_PAYMENT_METHOD_LABEL: Record<string, string> = {
  CASH: '现金',
  TRANSFER: '转账',
  CHECK: '支票',
  ONLINE: '网银',
};

/** 收付款状态：DRAFT/CONFIRMED/POSTED/VOID。 */
export const ERP_FINANCE_PAYMENT_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已确认', value: 'CONFIRMED' },
  { label: '已过账', value: 'POSTED' },
  { label: '已作废', value: 'VOID' },
] as const;
export const ERP_FINANCE_PAYMENT_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  CONFIRMED: '已确认',
  POSTED: '已过账',
  VOID: '已作废',
};

/** 核销类型：AR/AP。 */
export const ERP_FINANCE_WRITEOFF_TYPE_OPTIONS = [
  { label: '应收核销', value: 'AR' },
  { label: '应付核销', value: 'AP' },
] as const;
export const ERP_FINANCE_WRITEOFF_TYPE_LABEL: Record<string, string> = {
  AR: '应收核销',
  AP: '应付核销',
};

/** 核销状态：DRAFT/CONFIRMED/VOID。 */
export const ERP_FINANCE_WRITEOFF_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已确认', value: 'CONFIRMED' },
  { label: '已作废', value: 'VOID' },
] as const;
export const ERP_FINANCE_WRITEOFF_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  CONFIRMED: '已确认',
  VOID: '已作废',
};

/** 发票类型：VAT_SPECIAL/VAT_NORMAL/E_INVOICE/OTHER。 */
export const ERP_FINANCE_INVOICE_TYPE_OPTIONS = [
  { label: '增值税专用发票', value: 'VAT_SPECIAL' },
  { label: '增值税普通发票', value: 'VAT_NORMAL' },
  { label: '电子发票', value: 'E_INVOICE' },
  { label: '其他', value: 'OTHER' },
] as const;
export const ERP_FINANCE_INVOICE_TYPE_LABEL: Record<string, string> = {
  VAT_SPECIAL: '增值税专用发票',
  VAT_NORMAL: '增值税普通发票',
  E_INVOICE: '电子发票',
  OTHER: '其他',
};

/** 发票收发方向：OUT/IN。 */
export const ERP_FINANCE_INVOICE_DIRECTION_OPTIONS = [
  { label: '销项', value: 'OUT' },
  { label: '进项', value: 'IN' },
] as const;
export const ERP_FINANCE_INVOICE_DIRECTION_LABEL: Record<string, string> = {
  OUT: '销项',
  IN: '进项',
};

/** 发票状态：DRAFT/ISSUED/VOID。 */
export const ERP_FINANCE_INVOICE_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已开具', value: 'ISSUED' },
  { label: '已作废', value: 'VOID' },
] as const;
export const ERP_FINANCE_INVOICE_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  ISSUED: '已开具',
  VOID: '已作废',
};

/** 发票查验状态：UNVERIFIED/VERIFIED/REJECTED。 */
export const ERP_FINANCE_INVOICE_VERIFY_STATUS_OPTIONS = [
  { label: '未认证', value: 'UNVERIFIED' },
  { label: '已认证', value: 'VERIFIED' },
  { label: '认证不通过', value: 'REJECTED' },
] as const;
export const ERP_FINANCE_INVOICE_VERIFY_STATUS_LABEL: Record<string, string> = {
  UNVERIFIED: '未认证',
  VERIFIED: '已认证',
  REJECTED: '认证不通过',
};

/** 银行收付方向：IN/OUT。 */
export const ERP_FINANCE_BANK_DIRECTION_OPTIONS = [
  { label: '收入', value: 'IN' },
  { label: '支出', value: 'OUT' },
] as const;
export const ERP_FINANCE_BANK_DIRECTION_LABEL: Record<string, string> = {
  IN: '收入',
  OUT: '支出',
};

/** 对账匹配状态：UNMATCHED/MATCHED/PARTIAL。 */
export const ERP_FINANCE_BANK_MATCH_STATUS_OPTIONS = [
  { label: '未匹配', value: 'UNMATCHED' },
  { label: '已匹配', value: 'MATCHED' },
  { label: '部分匹配', value: 'PARTIAL' },
] as const;
export const ERP_FINANCE_BANK_MATCH_STATUS_LABEL: Record<string, string> = {
  UNMATCHED: '未匹配',
  MATCHED: '已匹配',
  PARTIAL: '部分匹配',
};

/** 对账单状态：IMPORTED/RECONCILED/VOID。 */
export const ERP_FINANCE_BANK_STATEMENT_STATUS_OPTIONS = [
  { label: '已导入', value: 'IMPORTED' },
  { label: '已对账', value: 'RECONCILED' },
  { label: '作废', value: 'VOID' },
] as const;
export const ERP_FINANCE_BANK_STATEMENT_STATUS_LABEL: Record<string, string> = {
  IMPORTED: '已导入',
  RECONCILED: '已对账',
  VOID: '作废',
};

/** 成本归集对象类型：PRODUCT/PRODUCTION_ORDER/PROJECT/PERIOD。 */
export const ERP_FINANCE_COST_OBJECT_TYPE_OPTIONS = [
  { label: '产品', value: 'PRODUCT' },
  { label: '生产订单', value: 'PRODUCTION_ORDER' },
  { label: '项目', value: 'PROJECT' },
  { label: '期间', value: 'PERIOD' },
] as const;
export const ERP_FINANCE_COST_OBJECT_TYPE_LABEL: Record<string, string> = {
  PRODUCT: '产品',
  PRODUCTION_ORDER: '生产订单',
  PROJECT: '项目',
  PERIOD: '期间',
};

/** 成本要素：MATERIAL/LABOR/OVERHEAD/OUTSOURCE/OTHER。 */
export const ERP_FINANCE_COST_ELEMENT_OPTIONS = [
  { label: '材料', value: 'MATERIAL' },
  { label: '人工', value: 'LABOR' },
  { label: '制造费用', value: 'OVERHEAD' },
  { label: '委外', value: 'OUTSOURCE' },
  { label: '其他', value: 'OTHER' },
] as const;
export const ERP_FINANCE_COST_ELEMENT_LABEL: Record<string, string> = {
  MATERIAL: '材料',
  LABOR: '人工',
  OVERHEAD: '制造费用',
  OUTSOURCE: '委外',
  OTHER: '其他',
};

/** 成本归集状态：DRAFT/CONFIRMED/POSTED。 */
export const ERP_FINANCE_COST_COLLECTION_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已确认', value: 'CONFIRMED' },
  { label: '已过账', value: 'POSTED' },
] as const;
export const ERP_FINANCE_COST_COLLECTION_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  CONFIRMED: '已确认',
  POSTED: '已过账',
};

/** 暂估类型：AR/AP。 */
export const ERP_FINANCE_ACCRUAL_TYPE_OPTIONS = [
  { label: '暂估应收', value: 'AR' },
  { label: '暂估应付', value: 'AP' },
] as const;
export const ERP_FINANCE_ACCRUAL_TYPE_LABEL: Record<string, string> = {
  AR: '暂估应收',
  AP: '暂估应付',
};

/** 暂估状态：DRAFT/CONFIRMED/REVERSED/VOID。 */
export const ERP_FINANCE_ACCRUAL_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已确认', value: 'CONFIRMED' },
  { label: '已冲回', value: 'REVERSED' },
  { label: '作废', value: 'VOID' },
] as const;
export const ERP_FINANCE_ACCRUAL_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  CONFIRMED: '已确认',
  REVERSED: '已冲回',
  VOID: '作废',
};
