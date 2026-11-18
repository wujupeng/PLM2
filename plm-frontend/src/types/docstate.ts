import type { PageQuery } from '@/types/common';

/** G1-N6 T102 单据状态机（后端 Base: /platform/doc-state）类型与枚举定义。 */

/* ---------------- 通用分页查询 ---------------- */

/** 单据状态机通用分页查询条件（各资源按需使用对应筛选字段）。 */
export interface DocStateQueryParams extends PageQuery {
  docType?: string;
  stateCode?: string;
  stateType?: string;
  stateStatus?: string;
  fromState?: string;
  toState?: string;
  actionCode?: string;
  transitionType?: string;
  transitionStatus?: string;
  docNo?: string;
  operatorName?: string;
  startDate?: string;
  endDate?: string;
}

/* ---------------- 1. 单据状态定义 ---------------- */

export interface DocStateDefItem {
  id: number;
  docType: string;
  stateCode?: string;
  stateName: string;
  stateType?: string;
  isInitial?: number | null;
  isFinal?: number | null;
  allowEdit?: number | null;
  allowDelete?: number | null;
  sortNo?: number | null;
  stateStatus: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
}

export interface DocStateDefSaveParams {
  docType: string;
  stateCode?: string;
  stateName: string;
  stateType?: string;
  isInitial?: number | null;
  isFinal?: number | null;
  allowEdit?: number | null;
  allowDelete?: number | null;
  sortNo?: number | null;
  stateStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
}

export interface DocStateDefStats {
  total?: number;
  active?: number;
  disabled?: number;
}

/* ---------------- 2. 状态流转规则 ---------------- */

export interface DocTransitionItem {
  id: number;
  docType: string;
  fromState: string;
  toState: string;
  actionCode: string;
  actionName: string;
  transitionType?: string;
  requireApproval?: number | null;
  requireReason?: number | null;
  permissionCode?: string;
  transitionStatus: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
}

export interface DocTransitionSaveParams {
  docType: string;
  fromState: string;
  toState: string;
  actionCode: string;
  actionName: string;
  transitionType?: string;
  requireApproval?: number | null;
  requireReason?: number | null;
  permissionCode?: string;
  transitionStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
}

export interface DocTransitionStats {
  total?: number;
  active?: number;
  disabled?: number;
}

/** 流转校验参数：按单据类型 + 起始状态 + 动作校验是否允许流转。 */
export interface DocTransitionValidateParams {
  docType: string;
  fromState: string;
  actionCode: string;
}

/* ---------------- 3. 单据状态日志 ---------------- */

export interface DocStateLogItem {
  id: number;
  logNo?: string;
  docType: string;
  docNo: string;
  bizTitle?: string;
  fromState?: string;
  toState: string;
  actionCode?: string;
  actionName?: string;
  reason?: string;
  operatorId?: number | null;
  operatorName?: string;
  operateTime?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
}

export interface DocStateLogSaveParams {
  logNo?: string;
  docType: string;
  docNo: string;
  bizTitle?: string;
  fromState?: string;
  toState: string;
  actionCode?: string;
  actionName?: string;
  reason?: string;
  operatorId?: number | null;
  operatorName?: string;
  operateTime?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
}

export interface DocStateLogStats {
  total?: number;
  docTypeCount?: number;
}

/* ---------------- 枚举选项与文案 ---------------- */

/** 单据状态类型：DRAFT/SUBMITTED/APPROVED/EXECUTING/CLOSED/VOID/REVERSED。 */
export const DOC_STATE_TYPE_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已提交', value: 'SUBMITTED' },
  { label: '已审核', value: 'APPROVED' },
  { label: '执行中', value: 'EXECUTING' },
  { label: '已关闭', value: 'CLOSED' },
  { label: '已作废', value: 'VOID' },
  { label: '已红冲', value: 'REVERSED' },
] as const;

export const DOC_STATE_TYPE_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  SUBMITTED: '已提交',
  APPROVED: '已审核',
  EXECUTING: '执行中',
  CLOSED: '已关闭',
  VOID: '已作废',
  REVERSED: '已红冲',
};

/** 流转类型：FORWARD 正向流转 / REVERSE 反向流转/红冲。 */
export const TRANSITION_TYPE_OPTIONS = [
  { label: '正向流转', value: 'FORWARD' },
  { label: '反向流转/红冲', value: 'REVERSE' },
] as const;

export const TRANSITION_TYPE_LABEL: Record<string, string> = {
  FORWARD: '正向流转',
  REVERSE: '反向流转/红冲',
};

/** 单据状态：ACTIVE/DISABLED。 */
export const DOC_STATE_STATUS_OPTIONS = [
  { label: '生效', value: 'ACTIVE' },
  { label: '停用', value: 'DISABLED' },
] as const;

export const DOC_STATE_STATUS_LABEL: Record<string, string> = {
  ACTIVE: '生效',
  DISABLED: '停用',
};

/** 布尔类字段选项（0 否 / 1 是）。 */
export const DOC_STATE_BOOL_OPTIONS = [
  { label: '是', value: 1 },
  { label: '否', value: 0 },
] as const;
