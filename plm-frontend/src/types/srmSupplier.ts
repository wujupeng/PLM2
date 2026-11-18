import type { PageQuery } from '@/types/common';

/** G4-N1 SRM 供应商全生命周期（T031，后端 Base: /srm）类型与枚举定义。 */

/* ---------------- 分页查询条件 ---------------- */

/** 供应商主档分页查询条件。keyword 匹配 supplierCode/supplierName/shortName/contact。 */
export interface SrmSupplierQuery extends PageQuery {
  supplierType?: string;
  supplierStatus?: string;
  gradeLevel?: string;
}

/** 供应商准入分页查询条件。keyword 匹配 admissionNo/supplierCode/supplierName/applyBy。 */
export interface SrmSupplierAdmissionQuery extends PageQuery {
  admissionType?: string;
  admissionStatus?: string;
  supplierCode?: string;
}

/** 供应商资质分页查询条件。keyword 匹配 qualificationNo/supplierCode/supplierName/certNo。 */
export interface SrmSupplierQualificationQuery extends PageQuery {
  qualificationType?: string;
  qualificationStatus?: string;
  supplierCode?: string;
}

/** 供应商风险分页查询条件。keyword 匹配 riskNo/supplierCode/supplierName/riskSource。 */
export interface SrmSupplierRiskQuery extends PageQuery {
  riskType?: string;
  riskLevel?: string;
  riskStatus?: string;
  supplierCode?: string;
}

/** 供应商分级分页查询条件。keyword 匹配 gradeNo/supplierCode/supplierName/evaluator。 */
export interface SrmSupplierGradeQuery extends PageQuery {
  gradeLevel?: string;
  gradeStatus?: string;
  supplierCode?: string;
}

/** 供应商黑名单分页查询条件。keyword 匹配 blacklistNo/supplierCode/supplierName/applyBy。 */
export interface SrmSupplierBlacklistQuery extends PageQuery {
  blacklistType?: string;
  blacklistStatus?: string;
  supplierCode?: string;
}

/** 年度复审分页查询条件。keyword 匹配 reviewNo/supplierCode/supplierName/reviewer。 */
export interface SrmSupplierReviewQuery extends PageQuery {
  reviewType?: string;
  reviewStatus?: string;
  supplierCode?: string;
}

/* ---------------- 1. 供应商主档 ---------------- */

export interface SrmSupplier {
  id?: number;
  supplierCode: string;
  supplierName: string;
  shortName?: string;
  supplierType?: string;
  unifiedSocialCode?: string;
  legalPerson?: string;
  registeredCapital?: number | null;
  businessScope?: string;
  region?: string;
  industry?: string;
  contact?: string;
  phone?: string;
  email?: string;
  address?: string;
  gradeLevel?: string;
  supplierStatus?: string;
  blacklistFlag?: number | null;
  admissionDate?: string;
  source?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type SrmSupplierSaveRequest = Omit<
  SrmSupplier,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 2. 供应商准入 ---------------- */

export interface SrmSupplierAdmission {
  id?: number;
  admissionNo?: string;
  supplierCode?: string;
  supplierName?: string;
  admissionType?: string;
  source?: string;
  applyBy?: string;
  applyDate?: string;
  assessScore?: number | null;
  assessConclusion?: string;
  approver?: string;
  approveDate?: string;
  admissionStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type SrmSupplierAdmissionSaveRequest = Omit<
  SrmSupplierAdmission,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 3. 供应商资质 ---------------- */

export interface SrmSupplierQualification {
  id?: number;
  qualificationNo?: string;
  supplierCode?: string;
  supplierName?: string;
  qualificationType?: string;
  qualificationName?: string;
  certNo?: string;
  issueAuthority?: string;
  issueDate?: string;
  expireDate?: string;
  attachmentUrl?: string;
  qualificationStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type SrmSupplierQualificationSaveRequest = Omit<
  SrmSupplierQualification,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 4. 供应商风险 ---------------- */

export interface SrmSupplierRisk {
  id?: number;
  riskNo?: string;
  supplierCode?: string;
  supplierName?: string;
  riskType?: string;
  riskLevel?: string;
  riskSource?: string;
  riskDesc?: string;
  discoverDate?: string;
  handleMeasure?: string;
  handler?: string;
  handleDate?: string;
  riskStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type SrmSupplierRiskSaveRequest = Omit<
  SrmSupplierRisk,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 5. 供应商分级 ---------------- */

export interface SrmSupplierGrade {
  id?: number;
  gradeNo?: string;
  supplierCode?: string;
  supplierName?: string;
  gradeLevel?: string;
  gradePeriod?: string;
  gradeScore?: number | null;
  gradeBasis?: string;
  evaluator?: string;
  gradeDate?: string;
  gradeStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type SrmSupplierGradeSaveRequest = Omit<
  SrmSupplierGrade,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 6. 供应商黑名单 ---------------- */

export interface SrmSupplierBlacklist {
  id?: number;
  blacklistNo?: string;
  supplierCode?: string;
  supplierName?: string;
  blacklistType?: string;
  blacklistReason?: string;
  effectiveDate?: string;
  expireDate?: string;
  applyBy?: string;
  approver?: string;
  approveDate?: string;
  releaseReason?: string;
  blacklistStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type SrmSupplierBlacklistSaveRequest = Omit<
  SrmSupplierBlacklist,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 7. 年度复审 ---------------- */

export interface SrmSupplierReview {
  id?: number;
  reviewNo?: string;
  supplierCode?: string;
  supplierName?: string;
  reviewPeriod?: string;
  reviewType?: string;
  currentGrade?: string;
  reviewScore?: number | null;
  reviewResult?: string;
  reviewer?: string;
  reviewDate?: string;
  nextReviewDate?: string;
  reviewStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type SrmSupplierReviewSaveRequest = Omit<
  SrmSupplierReview,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 枚举 OPTIONS / LABEL ---------------- */

/** 供应商类型：RAW/PART/SERVICE/EQUIPMENT/OUTSOURCE/OTHER。 */
export const SRM_SUPPLIER_TYPE_OPTIONS = [
  { label: '原材料', value: 'RAW' },
  { label: '零部件', value: 'PART' },
  { label: '服务类', value: 'SERVICE' },
  { label: '设备类', value: 'EQUIPMENT' },
  { label: '外协加工', value: 'OUTSOURCE' },
  { label: '其他', value: 'OTHER' },
] as const;
export const SRM_SUPPLIER_TYPE_LABEL: Record<string, string> = {
  RAW: '原材料',
  PART: '零部件',
  SERVICE: '服务类',
  EQUIPMENT: '设备类',
  OUTSOURCE: '外协加工',
  OTHER: '其他',
};

/** 供应商状态：PENDING/ACTIVE/SUSPENDED/BLACKLIST/OBSOLETE。 */
export const SRM_SUPPLIER_STATUS_OPTIONS = [
  { label: '待准入', value: 'PENDING' },
  { label: '合格供应商', value: 'ACTIVE' },
  { label: '暂停合作', value: 'SUSPENDED' },
  { label: '黑名单', value: 'BLACKLIST' },
  { label: '已失效', value: 'OBSOLETE' },
] as const;
export const SRM_SUPPLIER_STATUS_LABEL: Record<string, string> = {
  PENDING: '待准入',
  ACTIVE: '合格供应商',
  SUSPENDED: '暂停合作',
  BLACKLIST: '黑名单',
  OBSOLETE: '已失效',
};

/** 供应商来源：RECOMMEND/SELF/SOURCING/INHERIT/OTHER。 */
export const SRM_SUPPLIER_SOURCE_OPTIONS = [
  { label: '内部推荐', value: 'RECOMMEND' },
  { label: '供应商自荐', value: 'SELF' },
  { label: '寻源引入', value: 'SOURCING' },
  { label: '历史继承', value: 'INHERIT' },
  { label: '其他', value: 'OTHER' },
] as const;
export const SRM_SUPPLIER_SOURCE_LABEL: Record<string, string> = {
  RECOMMEND: '内部推荐',
  SELF: '供应商自荐',
  SOURCING: '寻源引入',
  INHERIT: '历史继承',
  OTHER: '其他',
};

/** 准入类型：NEW/CHANGE/EXPAND。 */
export const SRM_SUPPLIER_ADMISSION_TYPE_OPTIONS = [
  { label: '新准入', value: 'NEW' },
  { label: '变更准入', value: 'CHANGE' },
  { label: '扩品类', value: 'EXPAND' },
] as const;
export const SRM_SUPPLIER_ADMISSION_TYPE_LABEL: Record<string, string> = {
  NEW: '新准入',
  CHANGE: '变更准入',
  EXPAND: '扩品类',
};

/** 准入状态：DRAFT/SUBMITTED/APPROVED/REJECTED/CANCELLED。 */
export const SRM_SUPPLIER_ADMISSION_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '待审批', value: 'SUBMITTED' },
  { label: '已通过', value: 'APPROVED' },
  { label: '已驳回', value: 'REJECTED' },
  { label: '已取消', value: 'CANCELLED' },
] as const;
export const SRM_SUPPLIER_ADMISSION_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  SUBMITTED: '待审批',
  APPROVED: '已通过',
  REJECTED: '已驳回',
  CANCELLED: '已取消',
};

/** 资质类型：BUSINESS_LICENSE/ISO9001/ISO14001/PRODUCTION_LICENSE/QUALITY_CERT/OTHER。 */
export const SRM_SUPPLIER_QUALIFICATION_TYPE_OPTIONS = [
  { label: '营业执照', value: 'BUSINESS_LICENSE' },
  { label: '质量体系(ISO9001)', value: 'ISO9001' },
  { label: '环境体系(ISO14001)', value: 'ISO14001' },
  { label: '生产许可', value: 'PRODUCTION_LICENSE' },
  { label: '质量认证', value: 'QUALITY_CERT' },
  { label: '其他', value: 'OTHER' },
] as const;
export const SRM_SUPPLIER_QUALIFICATION_TYPE_LABEL: Record<string, string> = {
  BUSINESS_LICENSE: '营业执照',
  ISO9001: '质量体系(ISO9001)',
  ISO14001: '环境体系(ISO14001)',
  PRODUCTION_LICENSE: '生产许可',
  QUALITY_CERT: '质量认证',
  OTHER: '其他',
};

/** 资质状态：VALID/EXPIRING/EXPIRED。 */
export const SRM_SUPPLIER_QUALIFICATION_STATUS_OPTIONS = [
  { label: '有效', value: 'VALID' },
  { label: '即将到期', value: 'EXPIRING' },
  { label: '已过期', value: 'EXPIRED' },
] as const;
export const SRM_SUPPLIER_QUALIFICATION_STATUS_LABEL: Record<string, string> = {
  VALID: '有效',
  EXPIRING: '即将到期',
  EXPIRED: '已过期',
};

/** 风险类型：FINANCE/QUALITY/DELIVERY/COMPLIANCE/REPUTATION/OTHER。 */
export const SRM_SUPPLIER_RISK_TYPE_OPTIONS = [
  { label: '财务风险', value: 'FINANCE' },
  { label: '质量风险', value: 'QUALITY' },
  { label: '交付风险', value: 'DELIVERY' },
  { label: '合规风险', value: 'COMPLIANCE' },
  { label: '舆情风险', value: 'REPUTATION' },
  { label: '其他', value: 'OTHER' },
] as const;
export const SRM_SUPPLIER_RISK_TYPE_LABEL: Record<string, string> = {
  FINANCE: '财务风险',
  QUALITY: '质量风险',
  DELIVERY: '交付风险',
  COMPLIANCE: '合规风险',
  REPUTATION: '舆情风险',
  OTHER: '其他',
};

/** 风险等级：LOW/MEDIUM/HIGH/CRITICAL。 */
export const SRM_SUPPLIER_RISK_LEVEL_OPTIONS = [
  { label: '低', value: 'LOW' },
  { label: '中', value: 'MEDIUM' },
  { label: '高', value: 'HIGH' },
  { label: '严重', value: 'CRITICAL' },
] as const;
export const SRM_SUPPLIER_RISK_LEVEL_LABEL: Record<string, string> = {
  LOW: '低',
  MEDIUM: '中',
  HIGH: '高',
  CRITICAL: '严重',
};

/** 风险状态：OPEN/HANDLING/CLOSED。 */
export const SRM_SUPPLIER_RISK_STATUS_OPTIONS = [
  { label: '待处理', value: 'OPEN' },
  { label: '处理中', value: 'HANDLING' },
  { label: '已关闭', value: 'CLOSED' },
] as const;
export const SRM_SUPPLIER_RISK_STATUS_LABEL: Record<string, string> = {
  OPEN: '待处理',
  HANDLING: '处理中',
  CLOSED: '已关闭',
};

/** 供应商分级级别：A/B/C/D。 */
export const SRM_SUPPLIER_GRADE_LEVEL_OPTIONS = [
  { label: 'A级(战略)', value: 'A' },
  { label: 'B级(核心)', value: 'B' },
  { label: 'C级(一般)', value: 'C' },
  { label: 'D级(观察)', value: 'D' },
] as const;
export const SRM_SUPPLIER_GRADE_LEVEL_LABEL: Record<string, string> = {
  A: 'A级(战略)',
  B: 'B级(核心)',
  C: 'C级(一般)',
  D: 'D级(观察)',
};

/** 分级状态：DRAFT/CONFIRMED/OBSOLETE。 */
export const SRM_SUPPLIER_GRADE_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已确认', value: 'CONFIRMED' },
  { label: '已失效', value: 'OBSOLETE' },
] as const;
export const SRM_SUPPLIER_GRADE_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  CONFIRMED: '已确认',
  OBSOLETE: '已失效',
};

/** 黑名单类型：PERMANENT/TEMPORARY。 */
export const SRM_SUPPLIER_BLACKLIST_TYPE_OPTIONS = [
  { label: '永久', value: 'PERMANENT' },
  { label: '临时', value: 'TEMPORARY' },
] as const;
export const SRM_SUPPLIER_BLACKLIST_TYPE_LABEL: Record<string, string> = {
  PERMANENT: '永久',
  TEMPORARY: '临时',
};

/** 黑名单状态：ACTIVE/RELEASED。 */
export const SRM_SUPPLIER_BLACKLIST_STATUS_OPTIONS = [
  { label: '生效', value: 'ACTIVE' },
  { label: '已解除', value: 'RELEASED' },
] as const;
export const SRM_SUPPLIER_BLACKLIST_STATUS_LABEL: Record<string, string> = {
  ACTIVE: '生效',
  RELEASED: '已解除',
};

/** 复审类型：ANNUAL/QUARTERLY/SPECIAL/TRIGGERED。 */
export const SRM_SUPPLIER_REVIEW_TYPE_OPTIONS = [
  { label: '年度复审', value: 'ANNUAL' },
  { label: '季度复审', value: 'QUARTERLY' },
  { label: '专项复审', value: 'SPECIAL' },
  { label: '触发复审', value: 'TRIGGERED' },
] as const;
export const SRM_SUPPLIER_REVIEW_TYPE_LABEL: Record<string, string> = {
  ANNUAL: '年度复审',
  QUARTERLY: '季度复审',
  SPECIAL: '专项复审',
  TRIGGERED: '触发复审',
};

/** 复审状态：PENDING/IN_PROGRESS/PASSED/FAILED/CLOSED。 */
export const SRM_SUPPLIER_REVIEW_STATUS_OPTIONS = [
  { label: '待复审', value: 'PENDING' },
  { label: '复审中', value: 'IN_PROGRESS' },
  { label: '复审通过', value: 'PASSED' },
  { label: '复审不通过', value: 'FAILED' },
  { label: '已关闭', value: 'CLOSED' },
] as const;
export const SRM_SUPPLIER_REVIEW_STATUS_LABEL: Record<string, string> = {
  PENDING: '待复审',
  IN_PROGRESS: '复审中',
  PASSED: '复审通过',
  FAILED: '复审不通过',
  CLOSED: '已关闭',
};

/** 复审结果：KEEP/UPGRADE/DOWNGRADE/SUSPEND/BLACKLIST。 */
export const SRM_SUPPLIER_REVIEW_RESULT_OPTIONS = [
  { label: '保留', value: 'KEEP' },
  { label: '升级', value: 'UPGRADE' },
  { label: '降级', value: 'DOWNGRADE' },
  { label: '暂停', value: 'SUSPEND' },
  { label: '拉黑', value: 'BLACKLIST' },
] as const;
export const SRM_SUPPLIER_REVIEW_RESULT_LABEL: Record<string, string> = {
  KEEP: '保留',
  UPGRADE: '升级',
  DOWNGRADE: '降级',
  SUSPEND: '暂停',
  BLACKLIST: '拉黑',
};
