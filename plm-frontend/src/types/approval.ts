import type { PageQuery } from '@/types/common';

/** G1-N6 T103 可配置审批（后端 Base: /platform/approval）类型与枚举定义。 */

/* ---------------- 通用分页查询 ---------------- */

/** 可配置审批通用分页查询条件（各资源按需使用对应筛选字段）。 */
export interface ApprovalQueryParams extends PageQuery {
  flowCode?: string;
  flowName?: string;
  docType?: string;
  bizModule?: string;
  flowStatus?: string;
  fieldKey?: string;
  compareOperator?: string;
  logicType?: string;
  conditionStatus?: string;
  nodeName?: string;
  approverType?: string;
  approveMode?: string;
  nodeStatus?: string;
  docNo?: string;
  instanceStatus?: string;
  submitterName?: string;
  instanceNo?: string;
  nodeNo?: string;
  approverName?: string;
  taskStatus?: string;
  startDate?: string;
  endDate?: string;
}

/* ---------------- 1. 审批流定义 ---------------- */

export interface ApprovalFlowItem {
  id: number;
  flowCode?: string;
  flowName: string;
  docType: string;
  bizModule?: string;
  conditionExpr?: string;
  priority?: number | null;
  flowStatus: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
}

export interface ApprovalFlowSaveParams {
  flowCode?: string;
  flowName: string;
  docType: string;
  bizModule?: string;
  conditionExpr?: string;
  priority?: number | null;
  flowStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
}

export interface ApprovalFlowStats {
  total?: number;
  active?: number;
  disabled?: number;
}

/** 审批流匹配参数：按单据类型 + 业务模块 + 条件值匹配适用流程。 */
export interface ApprovalFlowMatchParams {
  docType: string;
  bizModule?: string;
  values: Record<string, unknown>;
}

/* ---------------- 2. 审批条件 ---------------- */

export interface ApprovalConditionItem {
  id: number;
  flowCode: string;
  seqNo?: number | null;
  fieldKey: string;
  compareOperator?: string;
  compareValue?: string;
  logicType?: string;
  conditionStatus: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
}

export interface ApprovalConditionSaveParams {
  flowCode: string;
  seqNo?: number | null;
  fieldKey: string;
  compareOperator?: string;
  compareValue?: string;
  logicType?: string;
  conditionStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
}

export interface ApprovalConditionStats {
  total?: number;
  active?: number;
  disabled?: number;
}

/* ---------------- 3. 审批节点 ---------------- */

export interface ApprovalNodeItem {
  id: number;
  flowCode: string;
  nodeOrder?: number | null;
  nodeName: string;
  approverType?: string;
  approverValue?: string;
  approveMode?: string;
  allowTransfer?: number | null;
  nodeStatus: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
}

export interface ApprovalNodeSaveParams {
  flowCode: string;
  nodeOrder?: number | null;
  nodeName: string;
  approverType?: string;
  approverValue?: string;
  approveMode?: string;
  allowTransfer?: number | null;
  nodeStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
}

export interface ApprovalNodeStats {
  total?: number;
  active?: number;
  disabled?: number;
}

/* ---------------- 4. 审批实例 ---------------- */

export interface ApprovalInstanceItem {
  id: number;
  flowCode: string;
  docType: string;
  docNo: string;
  bizTitle?: string;
  submitterId?: number | null;
  submitterName?: string;
  submitTime?: string;
  currentNode?: string;
  instanceStatus: string;
  finishedTime?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
}

export interface ApprovalInstanceSaveParams {
  flowCode: string;
  docType: string;
  docNo: string;
  bizTitle?: string;
  submitterId?: number | null;
  submitterName?: string;
  submitTime?: string;
  currentNode?: string;
  instanceStatus?: string;
  finishedTime?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
}

export interface ApprovalInstanceStats {
  total?: number;
  pending?: number;
  approved?: number;
  rejected?: number;
  canceled?: number;
}

/* ---------------- 5. 审批任务 ---------------- */

export interface ApprovalTaskItem {
  id: number;
  instanceNo: string;
  nodeNo: string;
  approverId?: number | null;
  approverName?: string;
  taskStatus: string;
  handleComment?: string;
  handledTime?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
}

export interface ApprovalTaskSaveParams {
  instanceNo: string;
  nodeNo: string;
  approverId?: number | null;
  approverName?: string;
  taskStatus?: string;
  handleComment?: string;
  handledTime?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
}

export interface ApprovalTaskStats {
  total?: number;
  pending?: number;
  approved?: number;
  rejected?: number;
  transferred?: number;
}

/** 审批任务处理参数（通过 / 驳回 / 转办 / 重置）。 */
export interface ApprovalTaskActionParams {
  handleComment?: string;
}

/* ---------------- 枚举选项与文案 ---------------- */

/** 审批流状态：ACTIVE/DISABLED。 */
export const APPROVAL_FLOW_STATUS_OPTIONS = [
  { label: '生效', value: 'ACTIVE' },
  { label: '停用', value: 'DISABLED' },
] as const;

export const APPROVAL_FLOW_STATUS_LABEL: Record<string, string> = {
  ACTIVE: '生效',
  DISABLED: '停用',
};

/** 条件逻辑类型：AND 且 / OR 或。 */
export const APPROVAL_LOGIC_TYPE_OPTIONS = [
  { label: '且', value: 'AND' },
  { label: '或', value: 'OR' },
] as const;

export const APPROVAL_LOGIC_TYPE_LABEL: Record<string, string> = {
  AND: '且',
  OR: '或',
};

/** 比较运算符。 */
export const APPROVAL_OPERATOR_OPTIONS = [
  { label: '等于', value: 'EQ' },
  { label: '不等于', value: 'NE' },
  { label: '大于', value: 'GT' },
  { label: '大于等于', value: 'GE' },
  { label: '小于', value: 'LT' },
  { label: '小于等于', value: 'LE' },
  { label: '包含', value: 'IN' },
  { label: '区间', value: 'BETWEEN' },
] as const;

export const APPROVAL_OPERATOR_LABEL: Record<string, string> = {
  EQ: '等于',
  NE: '不等于',
  GT: '大于',
  GE: '大于等于',
  LT: '小于',
  LE: '小于等于',
  IN: '包含',
  BETWEEN: '区间',
};

/** 审批人类型：ROLE 按角色 / USER 按用户 / ORG 按组织。 */
export const APPROVER_TYPE_OPTIONS = [
  { label: '按角色', value: 'ROLE' },
  { label: '按用户', value: 'USER' },
  { label: '按组织', value: 'ORG' },
] as const;

export const APPROVER_TYPE_LABEL: Record<string, string> = {
  ROLE: '按角色',
  USER: '按用户',
  ORG: '按组织',
};

/** 审批方式：ANY 或签 / ALL 会签。 */
export const APPROVE_MODE_OPTIONS = [
  { label: '或签', value: 'ANY' },
  { label: '会签', value: 'ALL' },
] as const;

export const APPROVE_MODE_LABEL: Record<string, string> = {
  ANY: '或签',
  ALL: '会签',
};

/** 审批实例状态：PENDING/APPROVED/REJECTED/CANCELED。 */
export const APPROVAL_INSTANCE_STATUS_OPTIONS = [
  { label: '审批中', value: 'PENDING' },
  { label: '已通过', value: 'APPROVED' },
  { label: '已驳回', value: 'REJECTED' },
  { label: '已取消', value: 'CANCELED' },
] as const;

export const APPROVAL_INSTANCE_STATUS_LABEL: Record<string, string> = {
  PENDING: '审批中',
  APPROVED: '已通过',
  REJECTED: '已驳回',
  CANCELED: '已取消',
};

/** 审批任务状态：PENDING/APPROVED/REJECTED/TRANSFERRED。 */
export const APPROVAL_TASK_STATUS_OPTIONS = [
  { label: '待处理', value: 'PENDING' },
  { label: '已通过', value: 'APPROVED' },
  { label: '已驳回', value: 'REJECTED' },
  { label: '已转办', value: 'TRANSFERRED' },
] as const;

export const APPROVAL_TASK_STATUS_LABEL: Record<string, string> = {
  PENDING: '待处理',
  APPROVED: '已通过',
  REJECTED: '已驳回',
  TRANSFERRED: '已转办',
};

/** 审批节点状态：ACTIVE/DISABLED。 */
export const APPROVAL_NODE_STATUS_OPTIONS = [
  { label: '生效', value: 'ACTIVE' },
  { label: '停用', value: 'DISABLED' },
] as const;

export const APPROVAL_NODE_STATUS_LABEL: Record<string, string> = {
  ACTIVE: '生效',
  DISABLED: '停用',
};

/** 审批条件状态：ACTIVE/DISABLED。 */
export const APPROVAL_CONDITION_STATUS_OPTIONS = [
  { label: '生效', value: 'ACTIVE' },
  { label: '停用', value: 'DISABLED' },
] as const;

export const APPROVAL_CONDITION_STATUS_LABEL: Record<string, string> = {
  ACTIVE: '生效',
  DISABLED: '停用',
};

/** 是否允许转办（0 否 / 1 是）。 */
export const APPROVAL_ALLOW_TRANSFER_OPTIONS = [
  { label: '是', value: 1 },
  { label: '否', value: 0 },
] as const;
