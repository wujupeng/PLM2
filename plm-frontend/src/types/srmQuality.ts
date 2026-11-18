import type { PageQuery } from '@/types/common';

/** G4-N4 SRM 供应商质量（T034，后端 Base: /srm）类型与枚举定义。 */

/* ---------------- 分页查询条件 ---------------- */

/** 来料质量分页查询条件。keyword 匹配 iqcNo/poNo/supplierCode/supplierName/materialCode/batchNo。 */
export interface SrmIncomingQualityQuery extends PageQuery {
  inspectionResult?: string;
  iqcStatus?: string;
  supplierCode?: string;
  poNo?: string;
}

/** 供应商考评分页查询条件。keyword 匹配 assessmentNo/supplierCode/supplierName/assessmentPeriod。 */
export interface SrmSupplierAssessmentQuery extends PageQuery {
  assessmentType?: string;
  assessmentStatus?: string;
  supplierCode?: string;
}

/** 8D 报告分页查询条件。keyword 匹配 eightdNo/supplierCode/supplierName/materialCode/problemSource。 */
export interface SrmEightDReportQuery extends PageQuery {
  eightdStatus?: string;
  supplierCode?: string;
  materialCode?: string;
}

/** 整改跟踪分页查询条件。keyword 匹配 rectificationNo/sourceNo/supplierCode/supplierName/materialCode。 */
export interface SrmRectificationQuery extends PageQuery {
  rectificationStatus?: string;
  supplierCode?: string;
  sourceNo?: string;
}

/* ---------------- 1. 来料质量 ---------------- */

export interface SrmIncomingQuality {
  id?: number;
  iqcNo?: string;
  poNo?: string;
  supplierCode?: string;
  supplierName?: string;
  materialCode?: string;
  materialName?: string;
  spec?: string;
  batchNo?: string;
  receiveQty?: number | null;
  unit?: string;
  sampleQty?: number | null;
  defectQty?: number | null;
  defectRate?: number | null;
  inspectionResult?: string;
  defectDesc?: string;
  inspector?: string;
  inspectDate?: string;
  iqcStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type SrmIncomingQualitySaveRequest = Omit<
  SrmIncomingQuality,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 2. 供应商考评 ---------------- */

export interface SrmSupplierAssessment {
  id?: number;
  assessmentNo?: string;
  supplierCode?: string;
  supplierName?: string;
  assessmentPeriod?: string;
  assessmentType?: string;
  qualityScore?: number | null;
  deliveryScore?: number | null;
  priceScore?: number | null;
  serviceScore?: number | null;
  totalScore?: number | null;
  gradeLevel?: string;
  assessmentResult?: string;
  assessor?: string;
  assessDate?: string;
  assessmentStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type SrmSupplierAssessmentSaveRequest = Omit<
  SrmSupplierAssessment,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 3. 8D 报告 ---------------- */

export interface SrmEightDReport {
  id?: number;
  eightdNo?: string;
  supplierCode?: string;
  supplierName?: string;
  materialCode?: string;
  materialName?: string;
  spec?: string;
  problemSource?: string;
  problemDesc?: string;
  d1Team?: string;
  d2Problem?: string;
  d3Containment?: string;
  d4RootCause?: string;
  d5Corrective?: string;
  d6Implement?: string;
  d7Prevent?: string;
  d8Congratulate?: string;
  issueDate?: string;
  closeDate?: string;
  owner?: string;
  eightdStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type SrmEightDReportSaveRequest = Omit<
  SrmEightDReport,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 4. 整改跟踪 ---------------- */

export interface SrmRectification {
  id?: number;
  rectificationNo?: string;
  sourceNo?: string;
  supplierCode?: string;
  supplierName?: string;
  materialCode?: string;
  materialName?: string;
  issueDesc?: string;
  rectifyAction?: string;
  responsible?: string;
  planDate?: string;
  completeDate?: string;
  verifyBy?: string;
  verifyDate?: string;
  verifyResult?: string;
  rectificationStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type SrmRectificationSaveRequest = Omit<
  SrmRectification,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 枚举选项与标签 ---------------- */

/** 检验结果：PASS/FAIL/CONCESSION/PENDING。 */
export const SRM_IQC_RESULT_OPTIONS = [
  { label: '合格', value: 'PASS' },
  { label: '不合格', value: 'FAIL' },
  { label: '让步接收', value: 'CONCESSION' },
  { label: '待检', value: 'PENDING' },
] as const;
export const SRM_IQC_RESULT_LABEL: Record<string, string> = {
  PASS: '合格',
  FAIL: '不合格',
  CONCESSION: '让步接收',
  PENDING: '待检',
};

/** 来料检验状态：DRAFT/SUBMITTED/CONFIRMED/CANCELLED。 */
export const SRM_IQC_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已提交', value: 'SUBMITTED' },
  { label: '已确认', value: 'CONFIRMED' },
  { label: '已取消', value: 'CANCELLED' },
] as const;
export const SRM_IQC_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  SUBMITTED: '已提交',
  CONFIRMED: '已确认',
  CANCELLED: '已取消',
};

/** 考评类型：MONTHLY/QUARTERLY/ANNUAL。 */
export const SRM_ASSESSMENT_TYPE_OPTIONS = [
  { label: '月度考评', value: 'MONTHLY' },
  { label: '季度考评', value: 'QUARTERLY' },
  { label: '年度考评', value: 'ANNUAL' },
] as const;
export const SRM_ASSESSMENT_TYPE_LABEL: Record<string, string> = {
  MONTHLY: '月度考评',
  QUARTERLY: '季度考评',
  ANNUAL: '年度考评',
};

/** 等级评定：A/B/C/D。 */
export const SRM_ASSESSMENT_GRADE_OPTIONS = [
  { label: 'A级', value: 'A' },
  { label: 'B级', value: 'B' },
  { label: 'C级', value: 'C' },
  { label: 'D级', value: 'D' },
] as const;
export const SRM_ASSESSMENT_GRADE_LABEL: Record<string, string> = {
  A: 'A级',
  B: 'B级',
  C: 'C级',
  D: 'D级',
};

/** 考评状态：DRAFT/SUBMITTED/APPROVED/CANCELLED。 */
export const SRM_ASSESSMENT_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已提交', value: 'SUBMITTED' },
  { label: '已批准', value: 'APPROVED' },
  { label: '已取消', value: 'CANCELLED' },
] as const;
export const SRM_ASSESSMENT_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  SUBMITTED: '已提交',
  APPROVED: '已批准',
  CANCELLED: '已取消',
};

/** 8D 报告状态：DRAFT/IN_PROGRESS/SUBMITTED/CLOSED/CANCELLED。 */
export const SRM_EIGHTD_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '处理中', value: 'IN_PROGRESS' },
  { label: '已提交', value: 'SUBMITTED' },
  { label: '已关闭', value: 'CLOSED' },
  { label: '已取消', value: 'CANCELLED' },
] as const;
export const SRM_EIGHTD_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  IN_PROGRESS: '处理中',
  SUBMITTED: '已提交',
  CLOSED: '已关闭',
  CANCELLED: '已取消',
};

/** 整改状态：PENDING/IN_PROGRESS/COMPLETED/VERIFIED/CLOSED/CANCELLED。 */
export const SRM_RECTIFICATION_STATUS_OPTIONS = [
  { label: '待处理', value: 'PENDING' },
  { label: '整改中', value: 'IN_PROGRESS' },
  { label: '已完成', value: 'COMPLETED' },
  { label: '已验证', value: 'VERIFIED' },
  { label: '已关闭', value: 'CLOSED' },
  { label: '已取消', value: 'CANCELLED' },
] as const;
export const SRM_RECTIFICATION_STATUS_LABEL: Record<string, string> = {
  PENDING: '待处理',
  IN_PROGRESS: '整改中',
  COMPLETED: '已完成',
  VERIFIED: '已验证',
  CLOSED: '已关闭',
  CANCELLED: '已取消',
};
