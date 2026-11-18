import type { PageQuery } from './common';

/* ---------------- 通用枚举 ---------------- */

/** 变更来源类型 */
export type EcoSourceType = 'internal' | 'customer' | 'quality' | 'supplier';

/** 风险等级 */
export type EcoRiskLevel = 'low' | 'middle' | 'high';

/** 紧急程度 */
export type EcoUrgency = 'normal' | 'urgent' | 'emergency';

/** ECR 状态 */
export type EcrStatus =
  | 'draft'
  | 'submitted'
  | 'reviewing'
  | 'approved'
  | 'rejected'
  | 'converted'
  | 'closed';

/** ECO 审批状态 */
export type EcoApprovalStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

/** ECO 执行状态 */
export type EcoExecutionStatus = 'pending' | 'executing' | 'completed';

/** 变更对象类型 */
export type EcoObjectType = 'product' | 'material' | 'document' | 'bom' | 'process';

/** 变更动作 */
export type EcoChangeAction = 'add' | 'modify' | 'delete' | 'switch';

/** 版本切换状态 */
export type EcoSwitchStatus = 'pending' | 'switched' | 'failed';

/** 影响类型 */
export type EcoImpactType = 'bom' | 'inventory' | 'po' | 'wip' | 'supplier' | 'customer';

/** 影响处理状态 */
export type EcoImpactHandleStatus = 'pending' | 'handled' | 'ignored';

/** 通知对象类型 */
export type EcoNoticeTarget = 'internal' | 'supplier' | 'customer';

/** 通知状态 */
export type EcoNoticeStatus = 'draft' | 'sent' | 'confirmed';

/** 变更来源类型选项 */
export const ECO_SOURCE_TYPE_OPTIONS: { value: EcoSourceType; label: string }[] = [
  { value: 'internal', label: '内部提出' },
  { value: 'customer', label: '客户要求' },
  { value: 'quality', label: '质量问题' },
  { value: 'supplier', label: '供应商提出' },
];

/** 风险等级选项 */
export const ECO_RISK_LEVEL_OPTIONS: { value: EcoRiskLevel; label: string }[] = [
  { value: 'low', label: '低' },
  { value: 'middle', label: '中' },
  { value: 'high', label: '高' },
];

/** 紧急程度选项 */
export const ECO_URGENCY_OPTIONS: { value: EcoUrgency; label: string }[] = [
  { value: 'normal', label: '一般' },
  { value: 'urgent', label: '紧急' },
  { value: 'emergency', label: '特急' },
];

/** ECR 状态选项 */
export const ECR_STATUS_OPTIONS: { value: EcrStatus; label: string }[] = [
  { value: 'draft', label: '草稿' },
  { value: 'submitted', label: '已提交' },
  { value: 'reviewing', label: '评审中' },
  { value: 'approved', label: '已批准' },
  { value: 'rejected', label: '已驳回' },
  { value: 'converted', label: '已转 ECO' },
  { value: 'closed', label: '已关闭' },
];

/** ECO 审批状态选项 */
export const ECO_APPROVAL_STATUS_OPTIONS: { value: EcoApprovalStatus; label: string }[] = [
  { value: 'draft', label: '草稿' },
  { value: 'submitted', label: '已提交' },
  { value: 'approved', label: '已批准' },
  { value: 'rejected', label: '已驳回' },
];

/** ECO 执行状态选项 */
export const ECO_EXECUTION_STATUS_OPTIONS: { value: EcoExecutionStatus; label: string }[] = [
  { value: 'pending', label: '待执行' },
  { value: 'executing', label: '执行中' },
  { value: 'completed', label: '已完成' },
];

/** 变更对象类型选项 */
export const ECO_OBJECT_TYPE_OPTIONS: { value: EcoObjectType; label: string }[] = [
  { value: 'product', label: '产品型号' },
  { value: 'material', label: '物料' },
  { value: 'document', label: '图文档' },
  { value: 'bom', label: 'BOM' },
  { value: 'process', label: '工艺' },
];

/** 变更动作选项 */
export const ECO_CHANGE_ACTION_OPTIONS: { value: EcoChangeAction; label: string }[] = [
  { value: 'add', label: '新增' },
  { value: 'modify', label: '修改' },
  { value: 'delete', label: '删除' },
  { value: 'switch', label: '版本切换' },
];

/** 版本切换状态选项 */
export const ECO_SWITCH_STATUS_OPTIONS: { value: EcoSwitchStatus; label: string }[] = [
  { value: 'pending', label: '待切换' },
  { value: 'switched', label: '已切换' },
  { value: 'failed', label: '切换失败' },
];

/** 影响类型选项 */
export const ECO_IMPACT_TYPE_OPTIONS: { value: EcoImpactType; label: string }[] = [
  { value: 'bom', label: 'BOM' },
  { value: 'inventory', label: '库存' },
  { value: 'po', label: '采购订单' },
  { value: 'wip', label: '在制工单' },
  { value: 'supplier', label: '供应商' },
  { value: 'customer', label: '客户项目' },
];

/** 影响处理状态选项 */
export const ECO_IMPACT_HANDLE_STATUS_OPTIONS: { value: EcoImpactHandleStatus; label: string }[] = [
  { value: 'pending', label: '待处理' },
  { value: 'handled', label: '已处理' },
  { value: 'ignored', label: '已忽略' },
];

/** 通知对象类型选项 */
export const ECO_NOTICE_TARGET_OPTIONS: { value: EcoNoticeTarget; label: string }[] = [
  { value: 'internal', label: '内部' },
  { value: 'supplier', label: '供应商' },
  { value: 'customer', label: '客户' },
];

/** 通知状态选项 */
export const ECO_NOTICE_STATUS_OPTIONS: { value: EcoNoticeStatus; label: string }[] = [
  { value: 'draft', label: '草稿' },
  { value: 'sent', label: '已发送' },
  { value: 'confirmed', label: '已确认' },
];

/** 变更来源类型文案映射 */
export const ECO_SOURCE_TYPE_TEXT: Record<string, string> = {
  internal: '内部提出',
  customer: '客户要求',
  quality: '质量问题',
  supplier: '供应商提出',
};

/** 风险等级文案映射 */
export const ECO_RISK_LEVEL_TEXT: Record<string, string> = {
  low: '低',
  middle: '中',
  high: '高',
};

/** 紧急程度文案映射 */
export const ECO_URGENCY_TEXT: Record<string, string> = {
  normal: '一般',
  urgent: '紧急',
  emergency: '特急',
};

/** ECR 状态文案映射 */
export const ECR_STATUS_TEXT: Record<string, string> = {
  draft: '草稿',
  submitted: '已提交',
  reviewing: '评审中',
  approved: '已批准',
  rejected: '已驳回',
  converted: '已转 ECO',
  closed: '已关闭',
};

/** ECO 审批状态文案映射 */
export const ECO_APPROVAL_STATUS_TEXT: Record<string, string> = {
  draft: '草稿',
  submitted: '已提交',
  approved: '已批准',
  rejected: '已驳回',
};

/** ECO 执行状态文案映射 */
export const ECO_EXECUTION_STATUS_TEXT: Record<string, string> = {
  pending: '待执行',
  executing: '执行中',
  completed: '已完成',
};

/** 变更对象类型文案映射 */
export const ECO_OBJECT_TYPE_TEXT: Record<string, string> = {
  product: '产品型号',
  material: '物料',
  document: '图文档',
  bom: 'BOM',
  process: '工艺',
};

/** 变更动作文案映射 */
export const ECO_CHANGE_ACTION_TEXT: Record<string, string> = {
  add: '新增',
  modify: '修改',
  delete: '删除',
  switch: '版本切换',
};

/** 版本切换状态文案映射 */
export const ECO_SWITCH_STATUS_TEXT: Record<string, string> = {
  pending: '待切换',
  switched: '已切换',
  failed: '切换失败',
};

/** 影响类型文案映射 */
export const ECO_IMPACT_TYPE_TEXT: Record<string, string> = {
  bom: 'BOM',
  inventory: '库存',
  po: '采购订单',
  wip: '在制工单',
  supplier: '供应商',
  customer: '客户项目',
};

/** 影响处理状态文案映射 */
export const ECO_IMPACT_HANDLE_STATUS_TEXT: Record<string, string> = {
  pending: '待处理',
  handled: '已处理',
  ignored: '已忽略',
};

/** 通知对象类型文案映射 */
export const ECO_NOTICE_TARGET_TEXT: Record<string, string> = {
  internal: '内部',
  supplier: '供应商',
  customer: '客户',
};

/** 通知状态文案映射 */
export const ECO_NOTICE_STATUS_TEXT: Record<string, string> = {
  draft: '草稿',
  sent: '已发送',
  confirmed: '已确认',
};

/* ---------------- 工程变更申请（ECR） ---------------- */

/** 工程变更申请项 */
export interface EcoChangeRequestItem {
  id: number;
  ecrNo?: string;
  title: string;
  sourceType?: string;
  sourceRef?: string;
  reason?: string;
  riskLevel?: string;
  urgency?: string;
  affectedProducts?: string;
  affectedMaterials?: string;
  affectedDocuments?: string;
  affectedProcesses?: string;
  applicantId?: number;
  applicantName?: string;
  status?: string;
  reviewerId?: number;
  reviewerName?: string;
  reviewComment?: string;
  reviewedAt?: string;
  remark?: string;
  createdAt?: string;
}

/** 工程变更申请分页查询入参 */
export interface EcoChangeRequestQuery extends PageQuery {
  ecrNo?: string;
  status?: string;
  sourceType?: string;
  riskLevel?: string;
  urgency?: string;
}

/** 工程变更申请新增/编辑入参 */
export interface EcoChangeRequestSaveParams {
  title: string;
  sourceType?: string;
  sourceRef?: string;
  reason?: string;
  riskLevel?: string;
  urgency?: string;
  affectedProducts?: string;
  affectedMaterials?: string;
  affectedDocuments?: string;
  affectedProcesses?: string;
  remark?: string;
}

/* ---------------- 工程变更单（ECO） ---------------- */

/** 工程变更单项 */
export interface EcoChangeOrderItem {
  id: number;
  ecoNo?: string;
  ecrId?: number;
  ecrNo?: string;
  title?: string;
  changeType?: string;
  planDesc?: string;
  approvalStatus?: string;
  approverId?: number;
  approverName?: string;
  approvalComment?: string;
  approvedAt?: string;
  effectiveDate?: string;
  effectiveBatch?: string;
  executionStatus?: string;
  executedAt?: string;
  remark?: string;
}

/** 工程变更单分页查询入参 */
export interface EcoChangeOrderQuery extends PageQuery {
  ecoNo?: string;
  ecrNo?: string;
  approvalStatus?: string;
  executionStatus?: string;
}

/** 工程变更单编辑入参 */
export interface EcoChangeOrderSaveParams {
  title?: string;
  changeType?: string;
  planDesc?: string;
  effectiveDate?: string;
  effectiveBatch?: string;
  remark?: string;
}

/** 变更对象明细项 */
export interface EcoChangeItemItem {
  id: number;
  ecoId?: number;
  objectType: string;
  objectCode: string;
  objectName?: string;
  changeAction?: string;
  beforeVersion?: string;
  afterVersion?: string;
  switchStatus?: string;
  switchedAt?: string;
  remark?: string;
}

/** 变更对象明细新增/编辑入参 */
export interface EcoChangeItemSaveParams {
  objectType: string;
  objectCode: string;
  objectName?: string;
  changeAction?: string;
  beforeVersion?: string;
  afterVersion?: string;
  remark?: string;
}

/** 变更通知项 */
export interface EcoNoticeItem {
  id: number;
  ecoId?: number;
  ecoNo?: string;
  noticeNo?: string;
  title: string;
  content?: string;
  targetType?: string;
  targetCode?: string;
  targetName?: string;
  status?: string;
  sentAt?: string;
  confirmedAt?: string;
  remark?: string;
}

/** 变更通知新增入参 */
export interface EcoNoticeSaveParams {
  title: string;
  content?: string;
  targetType: string;
  targetCode?: string;
  targetName?: string;
  remark?: string;
}

/** 影响分析项 */
export interface EcoImpactAnalysisItem {
  id: number;
  ecoId?: number;
  impactType?: string;
  objectCode?: string;
  objectName?: string;
  currentValue?: string;
  impactDesc?: string;
  handleStatus?: string;
  handleRemark?: string;
  handledAt?: string;
}

/* ---------------- 各操作入参 ---------------- */

/** 评审入参（ECR） */
export interface EcrReviewParams {
  decision: string;
  comment?: string;
}

/** ECR 转 ECO 明细入参 */
export interface EcrConvertItem {
  objectType: string;
  objectCode: string;
  objectName?: string;
  changeAction?: string;
  beforeVersion?: string;
  afterVersion?: string;
  remark?: string;
}

/** ECR 转 ECO 入参 */
export interface EcrConvertParams {
  planDesc?: string;
  changeType?: string;
  effectiveDate?: string;
  effectiveBatch?: string;
  items: EcrConvertItem[];
}

/** ECO 提交/审批入参 */
export interface EcoApproveParams {
  decision: string;
  comment?: string;
}

/** 影响分析请求入参 */
export interface EcoImpactAnalyzeParams {
  includeTypes?: string[];
}

/** 影响处理入参 */
export interface EcoImpactHandleParams {
  handleStatus: string;
  handleRemark?: string;
}

/** 变更执行入参 */
export interface EcoExecuteParams {
  effectiveDate?: string;
  effectiveBatch?: string;
  switchedItems?: number[];
}

/** 变更执行结果 */
export interface EcoExecuteResult {
  ecoId?: number;
  executionStatus?: string;
  switched?: number;
  pending?: number;
  message?: string;
}

/** ECR 详情组合 */
export interface EcrDetail {
  changeRequest: EcoChangeRequestItem;
  orders: EcoChangeOrderItem[];
}

/** ECO 详情组合 */
export interface EcoDetail {
  order: EcoChangeOrderItem;
  items: EcoChangeItemItem[];
  notices: EcoNoticeItem[];
  impacts: EcoImpactAnalysisItem[];
}
