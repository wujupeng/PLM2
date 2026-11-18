import type { PageQuery } from '@/types/common';

/** G4-N2 SRM 寻源与询报价（T032，后端 Base: /srm）类型与枚举定义。 */

/* ---------------- 分页查询条件 ---------------- */

/** 采购需求寻源分页查询条件。keyword 匹配 sourcingNo/sourcingTitle/materialCode/materialName。 */
export interface SrmSourcingRequestQuery extends PageQuery {
  sourcingType?: string;
  sourcingStatus?: string;
  materialCode?: string;
}

/** 询价单分页查询条件。keyword 匹配 rfqNo/rfqTitle/materialCode/materialName/buyer。 */
export interface SrmRfqQuery extends PageQuery {
  rfqType?: string;
  rfqStatus?: string;
  sourcingNo?: string;
}

/** 询价邀请分页查询条件。keyword 匹配 inviteNo/rfqNo/supplierCode/supplierName。 */
export interface SrmRfqSupplierQuery extends PageQuery {
  inviteStatus?: string;
  rfqNo?: string;
  supplierCode?: string;
}

/** 供应商报价分页查询条件。keyword 匹配 quoteNo/rfqNo/supplierCode/supplierName/materialCode。 */
export interface SrmSupplierQuoteQuery extends PageQuery {
  quoteStatus?: string;
  rfqNo?: string;
  supplierCode?: string;
  materialCode?: string;
}

/** 报价比价分页查询条件。keyword 匹配 compareNo/rfqNo/recommendSupplierCode/recommendSupplierName/compareBy。 */
export interface SrmPriceCompareQuery extends PageQuery {
  compareStatus?: string;
  rfqNo?: string;
}

/** 定点定标分页查询条件。keyword 匹配 awardNo/rfqNo/supplierCode/supplierName/materialCode。 */
export interface SrmAwardQuery extends PageQuery {
  awardType?: string;
  awardStatus?: string;
  supplierCode?: string;
  materialCode?: string;
}

/** 定点定价分页查询条件。keyword 匹配 agreementNo/supplierCode/supplierName/materialCode/materialName。 */
export interface SrmPriceAgreementQuery extends PageQuery {
  priceType?: string;
  agreementStatus?: string;
  supplierCode?: string;
  materialCode?: string;
}

/* ---------------- 1. 采购需求寻源 ---------------- */

export interface SrmSourcingRequest {
  id?: number;
  sourcingNo?: string;
  sourcingTitle?: string;
  materialCode?: string;
  materialName?: string;
  spec?: string;
  demandQty?: number | null;
  unit?: string;
  demandDate?: string;
  demandDept?: string;
  applicant?: string;
  sourcingType?: string;
  budgetAmount?: number | null;
  currency?: string;
  sourcingStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type SrmSourcingRequestSaveRequest = Omit<
  SrmSourcingRequest,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 2. 询价单 ---------------- */

export interface SrmRfq {
  id?: number;
  rfqNo?: string;
  rfqTitle?: string;
  sourcingNo?: string;
  rfqType?: string;
  materialCode?: string;
  materialName?: string;
  spec?: string;
  rfqQty?: number | null;
  unit?: string;
  publishDate?: string;
  deadlineDate?: string;
  inviteCount?: number | null;
  quoteCount?: number | null;
  buyer?: string;
  rfqStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type SrmRfqSaveRequest = Omit<SrmRfq, 'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'>;

/* ---------------- 3. 询价邀请 ---------------- */

export interface SrmRfqSupplier {
  id?: number;
  inviteNo?: string;
  rfqNo?: string;
  supplierCode?: string;
  supplierName?: string;
  contact?: string;
  phone?: string;
  email?: string;
  inviteDate?: string;
  respondDate?: string;
  inviteStatus?: string;
  declineReason?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type SrmRfqSupplierSaveRequest = Omit<
  SrmRfqSupplier,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 4. 供应商报价 ---------------- */

export interface SrmSupplierQuote {
  id?: number;
  quoteNo?: string;
  rfqNo?: string;
  supplierCode?: string;
  supplierName?: string;
  materialCode?: string;
  materialName?: string;
  spec?: string;
  quoteQty?: number | null;
  unit?: string;
  unitPrice?: number | null;
  taxRate?: number | null;
  totalAmount?: number | null;
  currency?: string;
  deliveryDays?: number | null;
  paymentTerm?: string;
  quoteDate?: string;
  validUntil?: string;
  quoteStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type SrmSupplierQuoteSaveRequest = Omit<
  SrmSupplierQuote,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 5. 报价比价 ---------------- */

export interface SrmPriceCompare {
  id?: number;
  compareNo?: string;
  rfqNo?: string;
  compareTitle?: string;
  supplierCount?: number | null;
  lowestPrice?: number | null;
  highestPrice?: number | null;
  avgPrice?: number | null;
  recommendSupplierCode?: string;
  recommendSupplierName?: string;
  compareRule?: string;
  compareConclusion?: string;
  compareBy?: string;
  compareDate?: string;
  compareStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type SrmPriceCompareSaveRequest = Omit<
  SrmPriceCompare,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 6. 定点定标 ---------------- */

export interface SrmAward {
  id?: number;
  awardNo?: string;
  rfqNo?: string;
  compareNo?: string;
  materialCode?: string;
  materialName?: string;
  spec?: string;
  awardType?: string;
  supplierCode?: string;
  supplierName?: string;
  awardQty?: number | null;
  unit?: string;
  awardPrice?: number | null;
  awardAmount?: number | null;
  currency?: string;
  awardDate?: string;
  awardBy?: string;
  approver?: string;
  approveDate?: string;
  awardStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type SrmAwardSaveRequest = Omit<
  SrmAward,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 7. 定点定价 ---------------- */

export interface SrmPriceAgreement {
  id?: number;
  agreementNo?: string;
  supplierCode?: string;
  supplierName?: string;
  materialCode?: string;
  materialName?: string;
  spec?: string;
  priceType?: string;
  unit?: string;
  unitPrice?: number | null;
  currency?: string;
  taxRate?: number | null;
  moq?: number | null;
  leadTimeDays?: number | null;
  effectiveDate?: string;
  expireDate?: string;
  agreementStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type SrmPriceAgreementSaveRequest = Omit<
  SrmPriceAgreement,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 枚举 OPTIONS / LABEL ---------------- */

/** 寻源方式：RFQ/PUBLIC/INVITED/DIRECT/COMPETITIVE。 */
export const SRM_SOURCING_TYPE_OPTIONS = [
  { label: '询价采购', value: 'RFQ' },
  { label: '公开寻源', value: 'PUBLIC' },
  { label: '邀请寻源', value: 'INVITED' },
  { label: '直接采购', value: 'DIRECT' },
  { label: '竞争性谈判', value: 'COMPETITIVE' },
] as const;
export const SRM_SOURCING_TYPE_LABEL: Record<string, string> = {
  RFQ: '询价采购',
  PUBLIC: '公开寻源',
  INVITED: '邀请寻源',
  DIRECT: '直接采购',
  COMPETITIVE: '竞争性谈判',
};

/** 寻源状态：DRAFT/SUBMITTED/APPROVED/SOURCING/CLOSED/CANCELLED。 */
export const SRM_SOURCING_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '待审批', value: 'SUBMITTED' },
  { label: '已批准', value: 'APPROVED' },
  { label: '寻源中', value: 'SOURCING' },
  { label: '已关闭', value: 'CLOSED' },
  { label: '已取消', value: 'CANCELLED' },
] as const;
export const SRM_SOURCING_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  SUBMITTED: '待审批',
  APPROVED: '已批准',
  SOURCING: '寻源中',
  CLOSED: '已关闭',
  CANCELLED: '已取消',
};

/** 询价方式：PUBLIC/INVITED/DIRECT。 */
export const SRM_RFQ_TYPE_OPTIONS = [
  { label: '公开询价', value: 'PUBLIC' },
  { label: '邀请询价', value: 'INVITED' },
  { label: '直接询价', value: 'DIRECT' },
] as const;
export const SRM_RFQ_TYPE_LABEL: Record<string, string> = {
  PUBLIC: '公开询价',
  INVITED: '邀请询价',
  DIRECT: '直接询价',
};

/** 询价单状态：DRAFT/PUBLISHED/QUOTING/CLOSED/CANCELLED。 */
export const SRM_RFQ_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已发布', value: 'PUBLISHED' },
  { label: '报价中', value: 'QUOTING' },
  { label: '已截止', value: 'CLOSED' },
  { label: '已取消', value: 'CANCELLED' },
] as const;
export const SRM_RFQ_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  PUBLISHED: '已发布',
  QUOTING: '报价中',
  CLOSED: '已截止',
  CANCELLED: '已取消',
};

/** 询价邀请状态：INVITED/RESPONDED/DECLINED/EXPIRED。 */
export const SRM_RFQ_SUPPLIER_STATUS_OPTIONS = [
  { label: '已邀请', value: 'INVITED' },
  { label: '已应答', value: 'RESPONDED' },
  { label: '已拒绝', value: 'DECLINED' },
  { label: '已过期', value: 'EXPIRED' },
] as const;
export const SRM_RFQ_SUPPLIER_STATUS_LABEL: Record<string, string> = {
  INVITED: '已邀请',
  RESPONDED: '已应答',
  DECLINED: '已拒绝',
  EXPIRED: '已过期',
};

/** 报价状态：DRAFT/SUBMITTED/WITHDRAWN/ACCEPTED/REJECTED。 */
export const SRM_QUOTE_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已提交', value: 'SUBMITTED' },
  { label: '已撤回', value: 'WITHDRAWN' },
  { label: '已接受', value: 'ACCEPTED' },
  { label: '已拒绝', value: 'REJECTED' },
] as const;
export const SRM_QUOTE_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  SUBMITTED: '已提交',
  WITHDRAWN: '已撤回',
  ACCEPTED: '已接受',
  REJECTED: '已拒绝',
};

/** 比价状态：DRAFT/COMPARED/CONFIRMED/CANCELLED。 */
export const SRM_PRICE_COMPARE_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已比价', value: 'COMPARED' },
  { label: '已确认', value: 'CONFIRMED' },
  { label: '已取消', value: 'CANCELLED' },
] as const;
export const SRM_PRICE_COMPARE_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  COMPARED: '已比价',
  CONFIRMED: '已确认',
  CANCELLED: '已取消',
};

/** 定点类型：SINGLE/MULTI/SPLIT。 */
export const SRM_AWARD_TYPE_OPTIONS = [
  { label: '单一供应商', value: 'SINGLE' },
  { label: '多供应商', value: 'MULTI' },
  { label: '拆分定点', value: 'SPLIT' },
] as const;
export const SRM_AWARD_TYPE_LABEL: Record<string, string> = {
  SINGLE: '单一供应商',
  MULTI: '多供应商',
  SPLIT: '拆分定点',
};

/** 定点状态：DRAFT/SUBMITTED/APPROVED/AWARDED/CANCELLED。 */
export const SRM_AWARD_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '待审批', value: 'SUBMITTED' },
  { label: '已批准', value: 'APPROVED' },
  { label: '已定点', value: 'AWARDED' },
  { label: '已取消', value: 'CANCELLED' },
] as const;
export const SRM_AWARD_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  SUBMITTED: '待审批',
  APPROVED: '已批准',
  AWARDED: '已定点',
  CANCELLED: '已取消',
};

/** 价格类型：AGREEMENT/ONE_TIME/ANNUAL/QUARTERLY。 */
export const SRM_PRICE_TYPE_OPTIONS = [
  { label: '协议价', value: 'AGREEMENT' },
  { label: '一次性价格', value: 'ONE_TIME' },
  { label: '年度框架', value: 'ANNUAL' },
  { label: '季度框架', value: 'QUARTERLY' },
] as const;
export const SRM_PRICE_TYPE_LABEL: Record<string, string> = {
  AGREEMENT: '协议价',
  ONE_TIME: '一次性价格',
  ANNUAL: '年度框架',
  QUARTERLY: '季度框架',
};

/** 定价协议状态：DRAFT/ACTIVE/EXPIRED/TERMINATED。 */
export const SRM_PRICE_AGREEMENT_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '生效', value: 'ACTIVE' },
  { label: '已过期', value: 'EXPIRED' },
  { label: '已终止', value: 'TERMINATED' },
] as const;
export const SRM_PRICE_AGREEMENT_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  ACTIVE: '生效',
  EXPIRED: '已过期',
  TERMINATED: '已终止',
};

/** 币种：CNY/USD/EUR/JPY/HKD。 */
export const SRM_CURRENCY_OPTIONS = [
  { label: '人民币', value: 'CNY' },
  { label: '美元', value: 'USD' },
  { label: '欧元', value: 'EUR' },
  { label: '日元', value: 'JPY' },
  { label: '港币', value: 'HKD' },
] as const;
export const SRM_CURRENCY_LABEL: Record<string, string> = {
  CNY: '人民币',
  USD: '美元',
  EUR: '欧元',
  JPY: '日元',
  HKD: '港币',
};
