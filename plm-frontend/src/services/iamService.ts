import { request } from '@/services/request';
import type { PageResult } from '@/types/common';
import type {
  IamFieldPermissionItem,
  IamFieldPermissionSaveParams,
  IamFieldPermissionStats,
  IamMfaBindingItem,
  IamMfaBindingSaveParams,
  IamMfaBindingStats,
  IamMfaVerifyLogItem,
  IamMfaVerifyLogSaveParams,
  IamMfaVerifyLogStats,
  IamQueryParams,
  IamSodRuleItem,
  IamSodRuleSaveParams,
  IamSodRuleStats,
  IamSodViolationItem,
  IamSodViolationSaveParams,
  IamSodViolationStats,
  IamSsoProviderItem,
  IamSsoProviderSaveParams,
  IamSsoProviderStats,
} from '@/types/iam';

/** G1-N4 公共平台底座—身份与权限增强（后端 WBS T006/T008）服务定义。 */

const BASE = '/platform/iam';

/* ---------------- 1. 多因素认证绑定 ---------------- */

export const iamMfaBindingService = {
  page: (params: IamQueryParams): Promise<PageResult<IamMfaBindingItem>> =>
    request<PageResult<IamMfaBindingItem>>({ method: 'GET', url: `${BASE}/mfa-bindings`, params }),

  stats: (): Promise<IamMfaBindingStats> =>
    request<IamMfaBindingStats>({ method: 'GET', url: `${BASE}/mfa-bindings/stats` }),

  detail: (id: number): Promise<IamMfaBindingItem> =>
    request<IamMfaBindingItem>({ method: 'GET', url: `${BASE}/mfa-bindings/${id}` }),

  create: (data: IamMfaBindingSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/mfa-bindings`, data }),

  update: (id: number, data: IamMfaBindingSaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/mfa-bindings/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/mfa-bindings/${id}` }),

  bind: (id: number): Promise<IamMfaBindingItem> =>
    request<IamMfaBindingItem>({ method: 'POST', url: `${BASE}/mfa-bindings/${id}/bind` }),

  unbind: (id: number): Promise<IamMfaBindingItem> =>
    request<IamMfaBindingItem>({ method: 'POST', url: `${BASE}/mfa-bindings/${id}/unbind` }),

  disable: (id: number): Promise<IamMfaBindingItem> =>
    request<IamMfaBindingItem>({ method: 'POST', url: `${BASE}/mfa-bindings/${id}/disable` }),
};

/* ---------------- 2. MFA 校验日志 ---------------- */

export const iamMfaVerifyLogService = {
  page: (params: IamQueryParams): Promise<PageResult<IamMfaVerifyLogItem>> =>
    request<PageResult<IamMfaVerifyLogItem>>({ method: 'GET', url: `${BASE}/mfa-verify-logs`, params }),

  stats: (): Promise<IamMfaVerifyLogStats> =>
    request<IamMfaVerifyLogStats>({ method: 'GET', url: `${BASE}/mfa-verify-logs/stats` }),

  detail: (id: number): Promise<IamMfaVerifyLogItem> =>
    request<IamMfaVerifyLogItem>({ method: 'GET', url: `${BASE}/mfa-verify-logs/${id}` }),

  create: (data: IamMfaVerifyLogSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/mfa-verify-logs`, data }),

  update: (id: number, data: IamMfaVerifyLogSaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/mfa-verify-logs/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/mfa-verify-logs/${id}` }),
};

/* ---------------- 3. 单点登录 ---------------- */

export const iamSsoProviderService = {
  page: (params: IamQueryParams): Promise<PageResult<IamSsoProviderItem>> =>
    request<PageResult<IamSsoProviderItem>>({ method: 'GET', url: `${BASE}/sso-providers`, params }),

  stats: (): Promise<IamSsoProviderStats> =>
    request<IamSsoProviderStats>({ method: 'GET', url: `${BASE}/sso-providers/stats` }),

  detail: (id: number): Promise<IamSsoProviderItem> =>
    request<IamSsoProviderItem>({ method: 'GET', url: `${BASE}/sso-providers/${id}` }),

  create: (data: IamSsoProviderSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/sso-providers`, data }),

  update: (id: number, data: IamSsoProviderSaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/sso-providers/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/sso-providers/${id}` }),

  publish: (id: number): Promise<IamSsoProviderItem> =>
    request<IamSsoProviderItem>({ method: 'POST', url: `${BASE}/sso-providers/${id}/publish` }),

  disable: (id: number): Promise<IamSsoProviderItem> =>
    request<IamSsoProviderItem>({ method: 'POST', url: `${BASE}/sso-providers/${id}/disable` }),
};

/* ---------------- 4. 字段权限 ---------------- */

export const iamFieldPermissionService = {
  page: (params: IamQueryParams): Promise<PageResult<IamFieldPermissionItem>> =>
    request<PageResult<IamFieldPermissionItem>>({ method: 'GET', url: `${BASE}/field-permissions`, params }),

  stats: (): Promise<IamFieldPermissionStats> =>
    request<IamFieldPermissionStats>({ method: 'GET', url: `${BASE}/field-permissions/stats` }),

  detail: (id: number): Promise<IamFieldPermissionItem> =>
    request<IamFieldPermissionItem>({ method: 'GET', url: `${BASE}/field-permissions/${id}` }),

  create: (data: IamFieldPermissionSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/field-permissions`, data }),

  update: (id: number, data: IamFieldPermissionSaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/field-permissions/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/field-permissions/${id}` }),

  enable: (id: number): Promise<IamFieldPermissionItem> =>
    request<IamFieldPermissionItem>({ method: 'POST', url: `${BASE}/field-permissions/${id}/enable` }),

  disable: (id: number): Promise<IamFieldPermissionItem> =>
    request<IamFieldPermissionItem>({ method: 'POST', url: `${BASE}/field-permissions/${id}/disable` }),
};

/* ---------------- 5. 职责分离规则 ---------------- */

export const iamSodRuleService = {
  page: (params: IamQueryParams): Promise<PageResult<IamSodRuleItem>> =>
    request<PageResult<IamSodRuleItem>>({ method: 'GET', url: `${BASE}/sod-rules`, params }),

  stats: (): Promise<IamSodRuleStats> => request<IamSodRuleStats>({ method: 'GET', url: `${BASE}/sod-rules/stats` }),

  detail: (id: number): Promise<IamSodRuleItem> =>
    request<IamSodRuleItem>({ method: 'GET', url: `${BASE}/sod-rules/${id}` }),

  create: (data: IamSodRuleSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/sod-rules`, data }),

  update: (id: number, data: IamSodRuleSaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/sod-rules/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/sod-rules/${id}` }),

  enable: (id: number): Promise<IamSodRuleItem> =>
    request<IamSodRuleItem>({ method: 'POST', url: `${BASE}/sod-rules/${id}/enable` }),

  disable: (id: number): Promise<IamSodRuleItem> =>
    request<IamSodRuleItem>({ method: 'POST', url: `${BASE}/sod-rules/${id}/disable` }),
};

/* ---------------- 6. 职责分离违规 ---------------- */

export const iamSodViolationService = {
  page: (params: IamQueryParams): Promise<PageResult<IamSodViolationItem>> =>
    request<PageResult<IamSodViolationItem>>({ method: 'GET', url: `${BASE}/sod-violations`, params }),

  stats: (): Promise<IamSodViolationStats> =>
    request<IamSodViolationStats>({ method: 'GET', url: `${BASE}/sod-violations/stats` }),

  detail: (id: number): Promise<IamSodViolationItem> =>
    request<IamSodViolationItem>({ method: 'GET', url: `${BASE}/sod-violations/${id}` }),

  create: (data: IamSodViolationSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/sod-violations`, data }),

  update: (id: number, data: IamSodViolationSaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/sod-violations/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/sod-violations/${id}` }),

  resolve: (id: number): Promise<IamSodViolationItem> =>
    request<IamSodViolationItem>({ method: 'POST', url: `${BASE}/sod-violations/${id}/resolve` }),

  ignore: (id: number): Promise<IamSodViolationItem> =>
    request<IamSodViolationItem>({ method: 'POST', url: `${BASE}/sod-violations/${id}/ignore` }),
};
