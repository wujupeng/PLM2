import type { PageQuery } from '@/types/common';

/** G1-N6 T104 业务规则引擎（后端 Base: /platform/biz-rule）类型与枚举定义。 */

/* ---------------- 通用分页查询 ---------------- */

/** 业务规则引擎通用分页查询条件（各资源按需使用对应筛选字段）。 */
export interface BizRuleQueryParams extends PageQuery {
  ruleCode?: string;
  ruleName?: string;
  ruleType?: string;
  bizModule?: string;
  ruleStatus?: string;
  paramKey?: string;
  valueType?: string;
  paramStatus?: string;
  bizKey?: string;
  matchResult?: string;
  startDate?: string;
  endDate?: string;
}

/* ---------------- 1. 业务规则 ---------------- */

export interface BizRuleItem {
  id: number;
  ruleCode?: string;
  ruleName: string;
  ruleType: string;
  bizModule?: string;
  ruleExpr?: string;
  priority?: number | null;
  ruleStatus: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
}

export interface BizRuleSaveParams {
  ruleCode?: string;
  ruleName: string;
  ruleType: string;
  bizModule?: string;
  ruleExpr?: string;
  priority?: number | null;
  ruleStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
}

export interface BizRuleStats {
  total?: number;
  active?: number;
  disabled?: number;
}

/** 规则试算参数：按规则类型 + 业务模块 + 业务键 + 输入数据求值。 */
export interface BizRuleEvaluateParams {
  ruleType: string;
  bizModule?: string;
  bizKey?: string;
  inputData: Record<string, unknown>;
}

/** 规则试算结果：命中规则与命中参数。 */
export interface BizRuleEvaluateResult {
  ruleCode?: string;
  ruleName?: string;
  ruleType?: string;
  matched?: boolean;
  params?: Record<string, unknown>;
  matchResult?: string;
}

/* ---------------- 2. 规则参数 ---------------- */

export interface BizRuleParamItem {
  id: number;
  ruleCode: string;
  paramKey: string;
  paramName?: string;
  paramValue?: string;
  valueType?: string;
  seqNo?: number | null;
  paramStatus: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
}

export interface BizRuleParamSaveParams {
  ruleCode: string;
  paramKey: string;
  paramName?: string;
  paramValue?: string;
  valueType?: string;
  seqNo?: number | null;
  paramStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
}

export interface BizRuleParamStats {
  total?: number;
  active?: number;
  disabled?: number;
}

/* ---------------- 3. 规则执行日志 ---------------- */

export interface BizRuleLogItem {
  id: number;
  ruleCode?: string;
  bizModule?: string;
  bizKey?: string;
  inputData?: string;
  outputData?: string;
  matchResult?: string;
  costMs?: number | null;
  execTime?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
}

export interface BizRuleLogSaveParams {
  ruleCode?: string;
  bizModule?: string;
  bizKey?: string;
  inputData?: string;
  outputData?: string;
  matchResult?: string;
  costMs?: number | null;
  execTime?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
}

export interface BizRuleLogStats {
  total?: number;
  matchCount?: number;
  notMatchCount?: number;
  errorCount?: number;
}

/* ---------------- 枚举选项与文案 ---------------- */

/** 业务规则类型：交期规则 / 最小起订量 / 批量规则 / 替代料 / 先进先出 / 质量放行 / 信用额度。 */
export const BIZ_RULE_TYPE_OPTIONS = [
  { label: '交期规则', value: 'LEAD_TIME' },
  { label: '最小起订量', value: 'MOQ' },
  { label: '批量规则', value: 'LOT_SIZE' },
  { label: '替代料', value: 'SUBSTITUTE' },
  { label: '先进先出', value: 'FIFO' },
  { label: '质量放行', value: 'QUALITY_RELEASE' },
  { label: '信用额度', value: 'CREDIT_LIMIT' },
] as const;

export const BIZ_RULE_TYPE_LABEL: Record<string, string> = {
  LEAD_TIME: '交期规则',
  MOQ: '最小起订量',
  LOT_SIZE: '批量规则',
  SUBSTITUTE: '替代料',
  FIFO: '先进先出',
  QUALITY_RELEASE: '质量放行',
  CREDIT_LIMIT: '信用额度',
};

/** 业务模块：PLM 研发 / ERP 经营 / SRM 供应商 / MES 制造 / WMS 仓储 / OA 办公。 */
export const BIZ_RULE_MODULE_OPTIONS = [
  { label: 'PLM 研发', value: 'PLM' },
  { label: 'ERP 经营', value: 'ERP' },
  { label: 'SRM 供应商', value: 'SRM' },
  { label: 'MES 制造', value: 'MES' },
  { label: 'WMS 仓储', value: 'WMS' },
  { label: 'OA 办公', value: 'OA' },
] as const;

export const BIZ_RULE_MODULE_LABEL: Record<string, string> = {
  PLM: 'PLM 研发',
  ERP: 'ERP 经营',
  SRM: 'SRM 供应商',
  MES: 'MES 制造',
  WMS: 'WMS 仓储',
  OA: 'OA 办公',
};

/** 规则状态：ACTIVE 生效 / DISABLED 停用。 */
export const RULE_STATUS_OPTIONS = [
  { label: '生效', value: 'ACTIVE' },
  { label: '停用', value: 'DISABLED' },
] as const;

export const RULE_STATUS_LABEL: Record<string, string> = {
  ACTIVE: '生效',
  DISABLED: '停用',
};

/** 规则参数状态：ACTIVE 生效 / DISABLED 停用。 */
export const RULE_PARAM_STATUS_OPTIONS = [
  { label: '生效', value: 'ACTIVE' },
  { label: '停用', value: 'DISABLED' },
] as const;

export const RULE_PARAM_STATUS_LABEL: Record<string, string> = {
  ACTIVE: '生效',
  DISABLED: '停用',
};

/** 参数值类型：STRING 字符串 / NUMBER 数值 / BOOLEAN 布尔 / LIST 列表。 */
export const RULE_VALUE_TYPE_OPTIONS = [
  { label: '字符串', value: 'STRING' },
  { label: '数值', value: 'NUMBER' },
  { label: '布尔', value: 'BOOLEAN' },
  { label: '列表', value: 'LIST' },
] as const;

export const RULE_VALUE_TYPE_LABEL: Record<string, string> = {
  STRING: '字符串',
  NUMBER: '数值',
  BOOLEAN: '布尔',
  LIST: '列表',
};

/** 匹配结果：MATCH 命中 / NOT_MATCH 未命中 / ERROR 异常。 */
export const RULE_MATCH_RESULT_OPTIONS = [
  { label: '命中', value: 'MATCH' },
  { label: '未命中', value: 'NOT_MATCH' },
  { label: '异常', value: 'ERROR' },
] as const;

export const RULE_MATCH_RESULT_LABEL: Record<string, string> = {
  MATCH: '命中',
  NOT_MATCH: '未命中',
  ERROR: '异常',
};
