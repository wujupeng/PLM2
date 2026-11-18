import { request } from '@/services/request';
import type { PageResult } from '@/types/common';
import type {
  BizRuleEvaluateParams,
  BizRuleEvaluateResult,
  BizRuleItem,
  BizRuleLogItem,
  BizRuleLogSaveParams,
  BizRuleLogStats,
  BizRuleParamItem,
  BizRuleParamSaveParams,
  BizRuleParamStats,
  BizRuleQueryParams,
  BizRuleSaveParams,
  BizRuleStats,
} from '@/types/bizRule';

/** G1-N6 T104 业务规则引擎（后端 Base: /platform/biz-rule）服务定义。 */

const BASE = '/platform/biz-rule';

/* ---------------- 1. 业务规则 ---------------- */

export const bizRuleService = {
  page: (params: BizRuleQueryParams): Promise<PageResult<BizRuleItem>> =>
    request<PageResult<BizRuleItem>>({ method: 'GET', url: `${BASE}/rules`, params }),

  stats: (): Promise<BizRuleStats> => request<BizRuleStats>({ method: 'GET', url: `${BASE}/rules/stats` }),

  /** 规则试算：按规则类型 + 业务模块 + 业务键 + 输入数据求值返回命中规则与参数。 */
  evaluate: (data: BizRuleEvaluateParams): Promise<BizRuleEvaluateResult> =>
    request<BizRuleEvaluateResult>({ method: 'POST', url: `${BASE}/evaluate`, data }),

  detail: (id: number): Promise<BizRuleItem> => request<BizRuleItem>({ method: 'GET', url: `${BASE}/rules/${id}` }),

  create: (data: BizRuleSaveParams): Promise<number> => request<number>({ method: 'POST', url: `${BASE}/rules`, data }),

  update: (id: number, data: BizRuleSaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/rules/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/rules/${id}` }),

  enable: (id: number): Promise<void> => request<void>({ method: 'POST', url: `${BASE}/rules/${id}/enable` }),

  disable: (id: number): Promise<void> => request<void>({ method: 'POST', url: `${BASE}/rules/${id}/disable` }),
};

/* ---------------- 2. 规则参数 ---------------- */

export const bizRuleParamService = {
  page: (params: BizRuleQueryParams): Promise<PageResult<BizRuleParamItem>> =>
    request<PageResult<BizRuleParamItem>>({ method: 'GET', url: `${BASE}/params`, params }),

  stats: (): Promise<BizRuleParamStats> => request<BizRuleParamStats>({ method: 'GET', url: `${BASE}/params/stats` }),

  detail: (id: number): Promise<BizRuleParamItem> =>
    request<BizRuleParamItem>({ method: 'GET', url: `${BASE}/params/${id}` }),

  create: (data: BizRuleParamSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/params`, data }),

  update: (id: number, data: BizRuleParamSaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/params/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/params/${id}` }),

  enable: (id: number): Promise<void> => request<void>({ method: 'POST', url: `${BASE}/params/${id}/enable` }),

  disable: (id: number): Promise<void> => request<void>({ method: 'POST', url: `${BASE}/params/${id}/disable` }),
};

/* ---------------- 3. 规则执行日志 ---------------- */

export const bizRuleLogService = {
  page: (params: BizRuleQueryParams): Promise<PageResult<BizRuleLogItem>> =>
    request<PageResult<BizRuleLogItem>>({ method: 'GET', url: `${BASE}/logs`, params }),

  stats: (): Promise<BizRuleLogStats> => request<BizRuleLogStats>({ method: 'GET', url: `${BASE}/logs/stats` }),

  detail: (id: number): Promise<BizRuleLogItem> => request<BizRuleLogItem>({ method: 'GET', url: `${BASE}/logs/${id}` }),

  create: (data: BizRuleLogSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/logs`, data }),

  update: (id: number, data: BizRuleLogSaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/logs/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/logs/${id}` }),
};
