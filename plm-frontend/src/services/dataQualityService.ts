import { request } from '@/services/request';
import type { PageResult } from '@/types/common';
import type {
  CodeRuleGenerateResult,
  CodeRuleItem,
  CodeRuleQueryParams,
  CodeRuleSaveParams,
  CodeRuleStats,
  DataQualityExceptionHandleParams,
  DataQualityExceptionItem,
  DataQualityExceptionQueryParams,
  DataQualityExceptionSaveParams,
  DataQualityExceptionStats,
  DataQualityRuleItem,
  DataQualityRuleQueryParams,
  DataQualityRuleSaveParams,
  DataQualityRuleStats,
} from '@/types/dataQuality';

/** G1-N6 T105 数据质量控制（后端 Base: /platform/data-quality）服务定义。 */

const BASE = '/platform/data-quality';

/* ---------------- 1. 数据质量规则 ---------------- */

export const dataQualityRuleService = {
  page: (params: DataQualityRuleQueryParams): Promise<PageResult<DataQualityRuleItem>> =>
    request<PageResult<DataQualityRuleItem>>({ method: 'GET', url: `${BASE}/rules`, params }),

  stats: (): Promise<DataQualityRuleStats> =>
    request<DataQualityRuleStats>({ method: 'GET', url: `${BASE}/rules/stats` }),

  detail: (id: number): Promise<DataQualityRuleItem> =>
    request<DataQualityRuleItem>({ method: 'GET', url: `${BASE}/rules/${id}` }),

  create: (data: DataQualityRuleSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/rules`, data }),

  update: (id: number, data: DataQualityRuleSaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/rules/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/rules/${id}` }),

  enable: (id: number): Promise<void> => request<void>({ method: 'POST', url: `${BASE}/rules/${id}/enable` }),

  disable: (id: number): Promise<void> => request<void>({ method: 'POST', url: `${BASE}/rules/${id}/disable` }),
};

/* ---------------- 2. 数据异常队列 ---------------- */

export const dataQualityExceptionService = {
  page: (params: DataQualityExceptionQueryParams): Promise<PageResult<DataQualityExceptionItem>> =>
    request<PageResult<DataQualityExceptionItem>>({ method: 'GET', url: `${BASE}/exceptions`, params }),

  stats: (): Promise<DataQualityExceptionStats> =>
    request<DataQualityExceptionStats>({ method: 'GET', url: `${BASE}/exceptions/stats` }),

  detail: (id: number): Promise<DataQualityExceptionItem> =>
    request<DataQualityExceptionItem>({ method: 'GET', url: `${BASE}/exceptions/${id}` }),

  create: (data: DataQualityExceptionSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/exceptions`, data }),

  update: (id: number, data: DataQualityExceptionSaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/exceptions/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/exceptions/${id}` }),

  /** 受理数据异常。 */
  handle: (id: number): Promise<void> =>
    request<void>({ method: 'POST', url: `${BASE}/exceptions/${id}/handle` }),

  /** 解决数据异常，处理说明可选。 */
  resolve: (id: number, data?: DataQualityExceptionHandleParams): Promise<void> =>
    request<void>({ method: 'POST', url: `${BASE}/exceptions/${id}/resolve`, data }),

  /** 忽略数据异常，处理说明可选。 */
  ignore: (id: number, data?: DataQualityExceptionHandleParams): Promise<void> =>
    request<void>({ method: 'POST', url: `${BASE}/exceptions/${id}/ignore`, data }),
};

/* ---------------- 3. 编码规则 ---------------- */

export const codeRuleService = {
  page: (params: CodeRuleQueryParams): Promise<PageResult<CodeRuleItem>> =>
    request<PageResult<CodeRuleItem>>({ method: 'GET', url: `${BASE}/code-rules`, params }),

  stats: (): Promise<CodeRuleStats> => request<CodeRuleStats>({ method: 'GET', url: `${BASE}/code-rules/stats` }),

  detail: (id: number): Promise<CodeRuleItem> =>
    request<CodeRuleItem>({ method: 'GET', url: `${BASE}/code-rules/${id}` }),

  create: (data: CodeRuleSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/code-rules`, data }),

  update: (id: number, data: CodeRuleSaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/code-rules/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/code-rules/${id}` }),

  enable: (id: number): Promise<void> => request<void>({ method: 'POST', url: `${BASE}/code-rules/${id}/enable` }),

  disable: (id: number): Promise<void> => request<void>({ method: 'POST', url: `${BASE}/code-rules/${id}/disable` }),

  /** 按编码规则生成编码。 */
  generate: (id: number): Promise<CodeRuleGenerateResult> =>
    request<CodeRuleGenerateResult>({ method: 'POST', url: `${BASE}/code-rules/${id}/generate` }),
};
