import type { PageQuery } from '@/types/common';

/** G1-N4 公共平台底座—身份与权限增强（后端 WBS T006/T008）类型与枚举定义。 */

/* ---------------- 通用分页查询 ---------------- */

/** 身份与权限通用分页查询条件（各资源按需使用对应状态字段）。 */
export interface IamQueryParams extends PageQuery {
  mfaType?: string;
  bindStatus?: string;
  verifyScene?: string;
  verifyResult?: string;
  protocol?: string;
  providerStatus?: string;
  roleCode?: string;
  bizModule?: string;
  accessLevel?: string;
  permStatus?: string;
  tableName?: string;
  riskLevel?: string;
  ruleStatus?: string;
  handleStatus?: string;
  startDate?: string;
  endDate?: string;
}

/* ---------------- 1. 多因素认证绑定 ---------------- */

export interface IamMfaBindingItem {
  id: number;
  bindNo: string;
  userId?: number;
  username?: string;
  mfaType?: string;
  secretKey?: string;
  keyVer?: string;
  contactPhone?: string;
  contactEmail?: string;
  bindStatus: string;
  bindTime?: string;
  lastVerifyAt?: string;
  verifyCount?: number;
  failCount?: number;
  expireTime?: string;
  orgId?: string;
  orgName?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IamMfaBindingSaveParams {
  bindNo?: string;
  userId?: number;
  username?: string;
  mfaType?: string;
  secretKey?: string;
  keyVer?: string;
  contactPhone?: string;
  contactEmail?: string;
  bindStatus?: string;
  bindTime?: string;
  lastVerifyAt?: string;
  verifyCount?: number;
  failCount?: number;
  expireTime?: string;
  orgId?: string;
  orgName?: string;
  remark?: string;
}

export interface IamMfaBindingStats {
  total?: number;
  pending?: number;
  bound?: number;
  unbound?: number;
  disabled?: number;
}

/* ---------------- 2. MFA 校验日志 ---------------- */

export interface IamMfaVerifyLogItem {
  id: number;
  logNo: string;
  userId?: number;
  username?: string;
  mfaType?: string;
  verifyScene?: string;
  verifyResult: string;
  failReason?: string;
  clientIp?: string;
  verifyTime?: string;
  costMs?: number;
  orgId?: string;
  orgName?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IamMfaVerifyLogSaveParams {
  logNo?: string;
  userId?: number;
  username?: string;
  mfaType?: string;
  verifyScene?: string;
  verifyResult?: string;
  failReason?: string;
  clientIp?: string;
  verifyTime?: string;
  costMs?: number;
  orgId?: string;
  orgName?: string;
  remark?: string;
}

export interface IamMfaVerifyLogStats {
  total?: number;
  success?: number;
  fail?: number;
  expired?: number;
  totalCostMs?: number;
}

/* ---------------- 3. 单点登录 ---------------- */

export interface IamSsoProviderItem {
  id: number;
  providerCode: string;
  providerName: string;
  protocol?: string;
  protocolVer?: string;
  issuer?: string;
  ssoUrl?: string;
  logoutUrl?: string;
  metadataUrl?: string;
  clientId?: string;
  certificateAlgo?: string;
  providerStatus: string;
  lastSyncAt?: string;
  orgId?: string;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IamSsoProviderSaveParams {
  providerCode?: string;
  providerName: string;
  protocol?: string;
  protocolVer?: string;
  issuer?: string;
  ssoUrl?: string;
  logoutUrl?: string;
  metadataUrl?: string;
  clientId?: string;
  certificateAlgo?: string;
  providerStatus?: string;
  lastSyncAt?: string;
  orgId?: string;
  orgName?: string;
  description?: string;
  remark?: string;
}

export interface IamSsoProviderStats {
  total?: number;
  draft?: number;
  active?: number;
  disabled?: number;
}

/* ---------------- 4. 字段权限 ---------------- */

export interface IamFieldPermissionItem {
  id: number;
  permNo: string;
  roleCode: string;
  bizModule?: string;
  tableName: string;
  fieldName: string;
  fieldLabel?: string;
  accessLevel: string;
  maskRule?: string;
  permStatus: string;
  description?: string;
  orgId?: string;
  orgName?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IamFieldPermissionSaveParams {
  permNo?: string;
  roleCode: string;
  bizModule?: string;
  tableName: string;
  fieldName: string;
  fieldLabel?: string;
  accessLevel?: string;
  maskRule?: string;
  permStatus?: string;
  description?: string;
  orgId?: string;
  orgName?: string;
  remark?: string;
}

export interface IamFieldPermissionStats {
  total?: number;
  active?: number;
  disabled?: number;
  hiddenCount?: number;
  maskedCount?: number;
}

/* ---------------- 5. 职责分离规则 ---------------- */

export interface IamSodRuleItem {
  id: number;
  ruleNo: string;
  ruleName: string;
  bizModule?: string;
  conflictRoleA?: string;
  conflictRoleB?: string;
  conflictPermA?: string;
  conflictPermB?: string;
  riskLevel: string;
  ruleStatus: string;
  description?: string;
  orgId?: string;
  orgName?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IamSodRuleSaveParams {
  ruleNo?: string;
  ruleName: string;
  bizModule?: string;
  conflictRoleA?: string;
  conflictRoleB?: string;
  conflictPermA?: string;
  conflictPermB?: string;
  riskLevel?: string;
  ruleStatus?: string;
  description?: string;
  orgId?: string;
  orgName?: string;
  remark?: string;
}

export interface IamSodRuleStats {
  total?: number;
  active?: number;
  disabled?: number;
  highRisk?: number;
}

/* ---------------- 6. 职责分离违规 ---------------- */

export interface IamSodViolationItem {
  id: number;
  violationNo: string;
  ruleNo: string;
  ruleName?: string;
  userId?: number;
  username?: string;
  conflictDetail?: string;
  riskLevel: string;
  handleStatus: string;
  handler?: string;
  handleTime?: string;
  handleNote?: string;
  detectTime?: string;
  orgId?: string;
  orgName?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IamSodViolationSaveParams {
  violationNo?: string;
  ruleNo: string;
  ruleName?: string;
  userId?: number;
  username?: string;
  conflictDetail?: string;
  riskLevel?: string;
  handleStatus?: string;
  handler?: string;
  handleTime?: string;
  handleNote?: string;
  detectTime?: string;
  orgId?: string;
  orgName?: string;
  remark?: string;
}

export interface IamSodViolationStats {
  total?: number;
  open?: number;
  handling?: number;
  resolved?: number;
  ignored?: number;
}

/* ---------------- 枚举选项与文案 ---------------- */

/** MFA 类型：TOTP/SMS/EMAIL。 */
export const IAM_MFA_TYPE_OPTIONS = [
  { label: '动态口令 TOTP', value: 'TOTP' },
  { label: '短信验证码', value: 'SMS' },
  { label: '邮件验证码', value: 'EMAIL' },
] as const;

export const IAM_MFA_TYPE_LABEL: Record<string, string> = {
  TOTP: '动态口令 TOTP',
  SMS: '短信验证码',
  EMAIL: '邮件验证码',
};

/** 绑定状态：PENDING/BOUND/UNBOUND/DISABLED。 */
export const IAM_BIND_STATUS_OPTIONS = [
  { label: '待绑定', value: 'PENDING' },
  { label: '已绑定', value: 'BOUND' },
  { label: '已解绑', value: 'UNBOUND' },
  { label: '已停用', value: 'DISABLED' },
] as const;

export const IAM_BIND_STATUS_LABEL: Record<string, string> = {
  PENDING: '待绑定',
  BOUND: '已绑定',
  UNBOUND: '已解绑',
  DISABLED: '已停用',
};

/** 校验场景：LOGIN/SENSITIVE_OP/UNBIND。 */
export const IAM_VERIFY_SCENE_OPTIONS = [
  { label: '登录认证', value: 'LOGIN' },
  { label: '敏感操作', value: 'SENSITIVE_OP' },
  { label: '解绑认证', value: 'UNBIND' },
] as const;

export const IAM_VERIFY_SCENE_LABEL: Record<string, string> = {
  LOGIN: '登录认证',
  SENSITIVE_OP: '敏感操作',
  UNBIND: '解绑认证',
};

/** 校验结果：SUCCESS/FAIL/EXPIRED。 */
export const IAM_VERIFY_RESULT_OPTIONS = [
  { label: '成功', value: 'SUCCESS' },
  { label: '失败', value: 'FAIL' },
  { label: '已过期', value: 'EXPIRED' },
] as const;

export const IAM_VERIFY_RESULT_LABEL: Record<string, string> = {
  SUCCESS: '成功',
  FAIL: '失败',
  EXPIRED: '已过期',
};

/** 单点登录协议：SAML/OIDC/CAS。 */
export const IAM_PROTOCOL_OPTIONS = [
  { label: 'SAML 2.0', value: 'SAML' },
  { label: 'OIDC', value: 'OIDC' },
  { label: 'CAS', value: 'CAS' },
] as const;

export const IAM_PROTOCOL_LABEL: Record<string, string> = {
  SAML: 'SAML 2.0',
  OIDC: 'OIDC',
  CAS: 'CAS',
};

/** 单点登录提供方状态：DRAFT/ACTIVE/DISABLED。 */
export const IAM_PROVIDER_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已启用', value: 'ACTIVE' },
  { label: '已停用', value: 'DISABLED' },
] as const;

export const IAM_PROVIDER_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  ACTIVE: '已启用',
  DISABLED: '已停用',
};

/** 字段访问级别：HIDDEN/MASKED/READONLY/EDITABLE。 */
export const IAM_ACCESS_LEVEL_OPTIONS = [
  { label: '不可见', value: 'HIDDEN' },
  { label: '脱敏可见', value: 'MASKED' },
  { label: '只读', value: 'READONLY' },
  { label: '可编辑', value: 'EDITABLE' },
] as const;

export const IAM_ACCESS_LEVEL_LABEL: Record<string, string> = {
  HIDDEN: '不可见',
  MASKED: '脱敏可见',
  READONLY: '只读',
  EDITABLE: '可编辑',
};

/** 字段权限状态：ACTIVE/DISABLED。 */
export const IAM_PERM_STATUS_OPTIONS = [
  { label: '生效', value: 'ACTIVE' },
  { label: '停用', value: 'DISABLED' },
] as const;

export const IAM_PERM_STATUS_LABEL: Record<string, string> = {
  ACTIVE: '生效',
  DISABLED: '停用',
};

/** 风险级别：HIGH/MEDIUM/LOW。 */
export const IAM_RISK_LEVEL_OPTIONS = [
  { label: '高风险', value: 'HIGH' },
  { label: '中风险', value: 'MEDIUM' },
  { label: '低风险', value: 'LOW' },
] as const;

export const IAM_RISK_LEVEL_LABEL: Record<string, string> = {
  HIGH: '高风险',
  MEDIUM: '中风险',
  LOW: '低风险',
};

/** 规则状态：ACTIVE/DISABLED。 */
export const IAM_RULE_STATUS_OPTIONS = [
  { label: '生效', value: 'ACTIVE' },
  { label: '停用', value: 'DISABLED' },
] as const;

export const IAM_RULE_STATUS_LABEL: Record<string, string> = {
  ACTIVE: '生效',
  DISABLED: '停用',
};

/** 违规处理状态：OPEN/HANDLING/RESOLVED/IGNORED。 */
export const IAM_HANDLE_STATUS_OPTIONS = [
  { label: '待处理', value: 'OPEN' },
  { label: '处理中', value: 'HANDLING' },
  { label: '已整改', value: 'RESOLVED' },
  { label: '已忽略', value: 'IGNORED' },
] as const;

export const IAM_HANDLE_STATUS_LABEL: Record<string, string> = {
  OPEN: '待处理',
  HANDLING: '处理中',
  RESOLVED: '已整改',
  IGNORED: '已忽略',
};

/** 业务模块：PLM/ERP/SRM/MES/WMS/OA。 */
export const IAM_BIZ_MODULE_OPTIONS = [
  { label: 'PLM 产品研发', value: 'PLM' },
  { label: 'ERP 经营管理', value: 'ERP' },
  { label: 'SRM 供应商协同', value: 'SRM' },
  { label: 'MES 制造执行', value: 'MES' },
  { label: 'WMS 仓储管理', value: 'WMS' },
  { label: 'OA 企业协同', value: 'OA' },
] as const;

export const IAM_BIZ_MODULE_LABEL: Record<string, string> = {
  PLM: 'PLM 产品研发',
  ERP: 'ERP 经营管理',
  SRM: 'SRM 供应商协同',
  MES: 'MES 制造执行',
  WMS: 'WMS 仓储管理',
  OA: 'OA 企业协同',
};
