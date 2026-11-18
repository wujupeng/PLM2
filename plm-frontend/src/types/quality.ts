import type { PageQuery } from './common';

/* ---------------- 通用枚举 ---------------- */

/** 缺陷严重度 */
export type DefectSeverity = 'minor' | 'major' | 'critical';

/** 质量问题来源类型 */
export type QualitySourceType = 'internal' | 'customer' | 'supplier' | 'inspection';

/** 质量问题状态 */
export type QualityProblemStatus = 'open' | 'analyzing' | 'action' | 'verifying' | 'closed';

/** 质量措施类型 */
export type QualityActionType = 'containment' | 'root_cause' | 'corrective' | 'preventive' | 'verify';

/** 质量措施状态 */
export type QualityActionStatus = 'open' | 'done' | 'verified';

/** 缺陷严重度选项 */
export const DEFECT_SEVERITY_OPTIONS: { value: DefectSeverity; label: string }[] = [
  { value: 'minor', label: '轻微' },
  { value: 'major', label: '严重' },
  { value: 'critical', label: '致命' },
];

/** 缺陷严重度文案映射 */
export const DEFECT_SEVERITY_TEXT: Record<string, string> = {
  minor: '轻微',
  major: '严重',
  critical: '致命',
};

/** 缺陷严重度标签颜色 */
export const DEFECT_SEVERITY_COLOR: Record<string, string> = {
  minor: 'default',
  major: 'orange',
  critical: 'red',
};

/** 质量问题来源类型选项 */
export const QUALITY_SOURCE_TYPE_OPTIONS: { value: QualitySourceType; label: string }[] = [
  { value: 'internal', label: '内部发现' },
  { value: 'customer', label: '客户反馈' },
  { value: 'supplier', label: '供应商问题' },
  { value: 'inspection', label: '检验发现' },
];

/** 质量问题来源类型文案映射 */
export const QUALITY_SOURCE_TYPE_TEXT: Record<string, string> = {
  internal: '内部发现',
  customer: '客户反馈',
  supplier: '供应商问题',
  inspection: '检验发现',
};

/** 质量问题状态选项 */
export const QUALITY_PROBLEM_STATUS_OPTIONS: { value: QualityProblemStatus; label: string }[] = [
  { value: 'open', label: '待处理' },
  { value: 'analyzing', label: '分析中' },
  { value: 'action', label: '措施执行中' },
  { value: 'verifying', label: '验证中' },
  { value: 'closed', label: '已关闭' },
];

/** 质量问题状态文案映射 */
export const QUALITY_PROBLEM_STATUS_TEXT: Record<string, string> = {
  open: '待处理',
  analyzing: '分析中',
  action: '措施执行中',
  verifying: '验证中',
  closed: '已关闭',
};

/** 质量问题状态标签颜色 */
export const QUALITY_PROBLEM_STATUS_COLOR: Record<string, string> = {
  open: 'default',
  analyzing: 'processing',
  action: 'warning',
  verifying: 'cyan',
  closed: 'success',
};

/** 质量措施类型选项 */
export const QUALITY_ACTION_TYPE_OPTIONS: { value: QualityActionType; label: string }[] = [
  { value: 'containment', label: '临时遏制' },
  { value: 'root_cause', label: '根因分析' },
  { value: 'corrective', label: '纠正措施' },
  { value: 'preventive', label: '预防措施' },
  { value: 'verify', label: '效果验证' },
];

/** 质量措施类型文案映射 */
export const QUALITY_ACTION_TYPE_TEXT: Record<string, string> = {
  containment: '临时遏制',
  root_cause: '根因分析',
  corrective: '纠正措施',
  preventive: '预防措施',
  verify: '效果验证',
};

/** 质量措施状态选项 */
export const QUALITY_ACTION_STATUS_OPTIONS: { value: QualityActionStatus; label: string }[] = [
  { value: 'open', label: '待执行' },
  { value: 'done', label: '已完成' },
  { value: 'verified', label: '已验证' },
];

/** 质量措施状态文案映射 */
export const QUALITY_ACTION_STATUS_TEXT: Record<string, string> = {
  open: '待执行',
  done: '已完成',
  verified: '已验证',
};

/** 质量措施状态标签颜色 */
export const QUALITY_ACTION_STATUS_COLOR: Record<string, string> = {
  open: 'default',
  done: 'processing',
  verified: 'success',
};

/* ---------------- 缺陷代码库 ---------------- */

/** 缺陷代码项 */
export interface QualityDefectCodeItem {
  id: number;
  defectCode: string;
  defectName: string;
  defectCategory?: string;
  operationCode?: string;
  station?: string;
  responsibleDept?: string;
  defaultCause?: string;
  defaultAction?: string;
  severity?: string;
  status?: number;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** 缺陷代码分页查询入参 */
export interface QualityDefectCodeQuery extends PageQuery {
  defectCode?: string;
  defectCategory?: string;
  operationCode?: string;
  severity?: string;
  status?: number;
}

/** 缺陷代码新增/编辑入参 */
export interface QualityDefectCodeSaveParams {
  defectCode: string;
  defectName: string;
  defectCategory?: string;
  operationCode?: string;
  station?: string;
  responsibleDept?: string;
  defaultCause?: string;
  defaultAction?: string;
  severity?: string;
  status?: number;
  remark?: string;
}

/* ---------------- 质量问题单 ---------------- */

/** 质量问题单列表项 */
export interface QualityIssueItem {
  id: number;
  issueNo?: string;
  title: string;
  sourceType?: string;
  productCode?: string;
  materialCode?: string;
  batchNo?: string;
  workOrderNo?: string;
  operationCode?: string;
  defectCode?: string;
  defectName?: string;
  severity?: string;
  foundQty?: number;
  issueDesc?: string;
  responsibleDept?: string;
  responsibleId?: number;
  responsibleName?: string;
  tempAction?: string;
  rootCause?: string;
  permanentAction?: string;
  verifyResult?: string;
  status?: string;
  foundAt?: string;
  closedAt?: string;
  ecrId?: number;
  ecrNo?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** 质量问题单分页查询入参 */
export interface QualityIssueQuery extends PageQuery {
  issueNo?: string;
  sourceType?: string;
  productCode?: string;
  materialCode?: string;
  batchNo?: string;
  workOrderNo?: string;
  operationCode?: string;
  defectCode?: string;
  severity?: string;
  status?: string;
}

/** 质量问题登记入参 */
export interface QualityIssueSaveParams {
  title: string;
  sourceType?: string;
  productCode?: string;
  materialCode?: string;
  batchNo?: string;
  workOrderNo?: string;
  operationCode?: string;
  defectCode?: string;
  defectName?: string;
  severity?: string;
  foundQty?: number;
  issueDesc?: string;
  responsibleDept?: string;
  responsibleId?: number;
  responsibleName?: string;
  tempAction?: string;
  rootCause?: string;
  permanentAction?: string;
  foundAt?: string;
  remark?: string;
}

/** 质量问题处理信息更新入参 */
export interface QualityIssueUpdateParams {
  title?: string;
  severity?: string;
  issueDesc?: string;
  responsibleDept?: string;
  responsibleId?: number;
  responsibleName?: string;
  tempAction?: string;
  rootCause?: string;
  permanentAction?: string;
  remark?: string;
}

/** 质量问题关闭入参 */
export interface QualityIssueCloseParams {
  verifyResult?: string;
  remark?: string;
  tempAction?: string;
  rootCause?: string;
  permanentAction?: string;
}

/** 质量问题转 ECR 入参 */
export interface QualityIssueToEcrParams {
  title?: string;
  reason?: string;
  riskLevel?: string;
  urgency?: string;
  affectedProducts?: string;
  affectedMaterials?: string;
  affectedDocuments?: string;
  affectedProcesses?: string;
  remark?: string;
}

/** 质量问题转 ECR 结果 */
export interface QualityIssueEcrResult {
  ecrId?: number;
  ecrNo?: string;
  message?: string;
}

/* ---------------- 措施记录 ---------------- */

/** 措施记录项 */
export interface QualityIssueActionItem {
  id: number;
  issueId?: number;
  actionType?: string;
  content?: string;
  ownerId?: number;
  ownerName?: string;
  dueDate?: string;
  completedAt?: string;
  result?: string;
  evidence?: string;
  status?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** 措施记录新增/编辑入参 */
export interface QualityIssueActionSaveParams {
  actionType: string;
  content: string;
  ownerId?: number;
  ownerName?: string;
  dueDate?: string;
}

/** 措施验证入参 */
export interface QualityIssueActionVerifyParams {
  result?: string;
  evidence?: string;
}

/** 质量问题详情响应 */
export interface QualityIssueDetail {
  issue: QualityIssueItem;
  actions: QualityIssueActionItem[];
}
