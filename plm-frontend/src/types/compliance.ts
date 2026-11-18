import type { PageQuery } from './common';

/* ---------------- 通用枚举 ---------------- */

/** 合规要求类型 */
export type ComplianceType = 'rohs' | 'elv' | 'reach' | 'other';

/** 合规风险等级 */
export type ComplianceRisk = 'low' | 'middle' | 'high';

/** 合规状态 */
export type ComplianceStatus = 'pending' | 'valid' | 'expired' | 'missing';

/** 合规要求类型选项 */
export const COMPLIANCE_TYPE_OPTIONS: { value: ComplianceType; label: string }[] = [
  { value: 'rohs', label: 'RoHS' },
  { value: 'elv', label: 'ELV' },
  { value: 'reach', label: 'REACH' },
  { value: 'other', label: '其他要求' },
];

/** 合规要求类型文案映射 */
export const COMPLIANCE_TYPE_LABEL: Record<string, string> = {
  rohs: 'RoHS',
  elv: 'ELV',
  reach: 'REACH',
  other: '其他要求',
};

/** 合规风险等级选项 */
export const COMPLIANCE_RISK_OPTIONS: { value: ComplianceRisk; label: string }[] = [
  { value: 'low', label: '低' },
  { value: 'middle', label: '中' },
  { value: 'high', label: '高' },
];

/** 合规风险等级文案映射 */
export const COMPLIANCE_RISK_LABEL: Record<string, string> = {
  low: '低',
  middle: '中',
  high: '高',
};

/** 合规状态选项 */
export const COMPLIANCE_STATUS_OPTIONS: { value: ComplianceStatus; label: string }[] = [
  { value: 'pending', label: '待确认' },
  { value: 'valid', label: '有效' },
  { value: 'expired', label: '已过期' },
  { value: 'missing', label: '资料缺失' },
];

/** 合规状态文案映射 */
export const COMPLIANCE_STATUS_LABEL: Record<string, string> = {
  pending: '待确认',
  valid: '有效',
  expired: '已过期',
  missing: '资料缺失',
};

/* ---------------- 环保合规记录 ---------------- */

/** 环保合规记录项 */
export interface ComplianceItem {
  id: number;
  complianceCode: string;
  materialCode?: string;
  materialName?: string;
  requirementType?: string;
  riskLevel?: string;
  supplierCode?: string;
  declarationNo?: string;
  declarationFile?: string;
  effectiveDate?: string;
  expireDate?: string;
  status?: string;
  checkedAt?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** 环保合规分页查询入参 */
export interface ComplianceQuery extends PageQuery {
  complianceCode?: string;
  materialCode?: string;
  requirementType?: string;
  riskLevel?: string;
  status?: string;
}

/** 环保合规记录新增/编辑入参 */
export interface ComplianceSaveParams {
  complianceCode: string;
  materialCode?: string;
  materialName?: string;
  requirementType?: string;
  riskLevel?: string;
  supplierCode?: string;
  declarationNo?: string;
  declarationFile?: string;
  effectiveDate?: string;
  expireDate?: string;
  status?: string;
  remark?: string;
}

/** 物料合规校验结果 */
export interface ComplianceCheckResult {
  passed: boolean;
  missingTypes: string[];
  expiredTypes: string[];
  message: string;
}
