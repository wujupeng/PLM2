import type { PageQuery } from '@/types/common';

/** G1-N6 T105 数据质量控制（后端 Base: /platform/data-quality）类型与枚举定义。 */

/* ---------------- 通用分页查询 ---------------- */

/** 数据质量规则分页查询条件。 */
export interface DataQualityRuleQueryParams extends PageQuery {
  ruleCode?: string;
  ruleName?: string;
  targetEntity?: string;
  ruleType?: string;
  errorLevel?: string;
  ruleStatus?: string;
  startDate?: string;
  endDate?: string;
}

/** 数据异常队列分页查询条件。 */
export interface DataQualityExceptionQueryParams extends PageQuery {
  ruleCode?: string;
  targetEntity?: string;
  recordKey?: string;
  errorLevel?: string;
  exceptionStatus?: string;
  handlerName?: string;
  startDate?: string;
  endDate?: string;
}

/** 编码规则分页查询条件。 */
export interface CodeRuleQueryParams extends PageQuery {
  codeCode?: string;
  codeName?: string;
  targetEntity?: string;
  resetCycle?: string;
  codeStatus?: string;
  startDate?: string;
  endDate?: string;
}

/* ---------------- 1. 数据质量规则 ---------------- */

export interface DataQualityRuleItem {
  id: number;
  ruleCode?: string;
  ruleName: string;
  targetEntity: string;
  ruleType?: string;
  ruleExpr?: string;
  errorLevel?: string;
  ruleStatus: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
}

export interface DataQualityRuleSaveParams {
  ruleCode?: string;
  ruleName: string;
  targetEntity: string;
  ruleType?: string;
  ruleExpr?: string;
  errorLevel?: string;
  ruleStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
}

export interface DataQualityRuleStats {
  total?: number;
  active?: number;
  disabled?: number;
}

/* ---------------- 2. 数据异常队列 ---------------- */

export interface DataQualityExceptionItem {
  id: number;
  ruleCode: string;
  targetEntity: string;
  recordId?: number | null;
  recordKey?: string;
  errorLevel?: string;
  errorMessage?: string;
  exceptionStatus: string;
  handlerName?: string;
  handledTime?: string;
  handleNote?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
}

export interface DataQualityExceptionSaveParams {
  ruleCode: string;
  targetEntity: string;
  recordId?: number | null;
  recordKey?: string;
  errorLevel?: string;
  errorMessage?: string;
  exceptionStatus?: string;
  handlerName?: string;
  handledTime?: string;
  handleNote?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
}

export interface DataQualityExceptionStats {
  total?: number;
  open?: number;
  handling?: number;
  resolved?: number;
  ignored?: number;
}

/** 数据异常处理/解决/忽略请求体，处理说明可选。 */
export interface DataQualityExceptionHandleParams {
  handleNote?: string;
}

/* ---------------- 3. 编码规则 ---------------- */

export interface CodeRuleItem {
  id: number;
  codeCode?: string;
  codeName: string;
  targetEntity: string;
  prefix?: string;
  datePattern?: string;
  seqLength?: number | null;
  resetCycle?: string;
  currentSeq?: number | null;
  codeStatus: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
}

export interface CodeRuleSaveParams {
  codeCode?: string;
  codeName: string;
  targetEntity: string;
  prefix?: string;
  datePattern?: string;
  seqLength?: number | null;
  resetCycle?: string;
  currentSeq?: number | null;
  codeStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
}

export interface CodeRuleStats {
  total?: number;
  active?: number;
  disabled?: number;
}

/** 编码生成结果：命中编码规则并返回本次生成的编码与当前流水号。 */
export interface CodeRuleGenerateResult {
  codeRuleId?: number;
  codeName?: string;
  targetEntity?: string;
  generatedCode?: string;
  currentSeq?: number | null;
}

/* ---------------- 枚举选项与文案 ---------------- */

/** 数据质量规则类型：必填 / 唯一性 / 编码规则 / 有效期 / 版本一致性 / 引用完整性。 */
export const DQ_RULE_TYPE_OPTIONS = [
  { label: '必填', value: 'REQUIRED' },
  { label: '唯一性', value: 'UNIQUE' },
  { label: '编码规则', value: 'CODE_PATTERN' },
  { label: '有效期', value: 'VALIDITY' },
  { label: '版本一致性', value: 'VERSION_CONSISTENCY' },
  { label: '引用完整性', value: 'REFERENCE' },
] as const;

export const DQ_RULE_TYPE_LABEL: Record<string, string> = {
  REQUIRED: '必填',
  UNIQUE: '唯一性',
  CODE_PATTERN: '编码规则',
  VALIDITY: '有效期',
  VERSION_CONSISTENCY: '版本一致性',
  REFERENCE: '引用完整性',
};

/** 错误级别：ERROR 错误 / WARN 警告。 */
export const DQ_ERROR_LEVEL_OPTIONS = [
  { label: '错误', value: 'ERROR' },
  { label: '警告', value: 'WARN' },
] as const;

export const DQ_ERROR_LEVEL_LABEL: Record<string, string> = {
  ERROR: '错误',
  WARN: '警告',
};

/** 数据质量规则状态：ACTIVE 生效 / DISABLED 停用。 */
export const DQ_RULE_STATUS_OPTIONS = [
  { label: '生效', value: 'ACTIVE' },
  { label: '停用', value: 'DISABLED' },
] as const;

export const DQ_RULE_STATUS_LABEL: Record<string, string> = {
  ACTIVE: '生效',
  DISABLED: '停用',
};

/** 编码规则状态：ACTIVE 生效 / DISABLED 停用。 */
export const CODE_RULE_STATUS_OPTIONS = [
  { label: '生效', value: 'ACTIVE' },
  { label: '停用', value: 'DISABLED' },
] as const;

export const CODE_RULE_STATUS_LABEL: Record<string, string> = {
  ACTIVE: '生效',
  DISABLED: '停用',
};

/** 数据异常状态：OPEN 待处理 / HANDLING 处理中 / RESOLVED 已解决 / IGNORED 已忽略。 */
export const DQ_EXCEPTION_STATUS_OPTIONS = [
  { label: '待处理', value: 'OPEN' },
  { label: '处理中', value: 'HANDLING' },
  { label: '已解决', value: 'RESOLVED' },
  { label: '已忽略', value: 'IGNORED' },
] as const;

export const DQ_EXCEPTION_STATUS_LABEL: Record<string, string> = {
  OPEN: '待处理',
  HANDLING: '处理中',
  RESOLVED: '已解决',
  IGNORED: '已忽略',
};

/** 编码重置周期：NONE 不重置 / DAILY 按日重置 / MONTHLY 按月重置 / YEARLY 按年重置。 */
export const CODE_RESET_CYCLE_OPTIONS = [
  { label: '不重置', value: 'NONE' },
  { label: '按日重置', value: 'DAILY' },
  { label: '按月重置', value: 'MONTHLY' },
  { label: '按年重置', value: 'YEARLY' },
] as const;

export const CODE_RESET_CYCLE_LABEL: Record<string, string> = {
  NONE: '不重置',
  DAILY: '按日重置',
  MONTHLY: '按月重置',
  YEARLY: '按年重置',
};
