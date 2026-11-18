import { request } from '@/services/request';
import type { PageResult } from '@/types/common';
import type {
  DocStateDefItem,
  DocStateDefSaveParams,
  DocStateDefStats,
  DocStateLogItem,
  DocStateLogSaveParams,
  DocStateLogStats,
  DocStateQueryParams,
  DocTransitionItem,
  DocTransitionSaveParams,
  DocTransitionStats,
  DocTransitionValidateParams,
} from '@/types/docstate';

/** G1-N6 T102 单据状态机（后端 Base: /platform/doc-state）服务定义。 */

const BASE = '/platform/doc-state';

/* ---------------- 1. 单据状态定义 ---------------- */

export const docStateDefService = {
  page: (params: DocStateQueryParams): Promise<PageResult<DocStateDefItem>> =>
    request<PageResult<DocStateDefItem>>({ method: 'GET', url: `${BASE}/state-defs`, params }),

  stats: (): Promise<DocStateDefStats> =>
    request<DocStateDefStats>({ method: 'GET', url: `${BASE}/state-defs/stats` }),

  detail: (id: number): Promise<DocStateDefItem> =>
    request<DocStateDefItem>({ method: 'GET', url: `${BASE}/state-defs/${id}` }),

  create: (data: DocStateDefSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/state-defs`, data }),

  update: (id: number, data: DocStateDefSaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/state-defs/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/state-defs/${id}` }),

  enable: (id: number): Promise<void> => request<void>({ method: 'POST', url: `${BASE}/state-defs/${id}/enable` }),

  disable: (id: number): Promise<void> => request<void>({ method: 'POST', url: `${BASE}/state-defs/${id}/disable` }),
};

/* ---------------- 2. 状态流转规则 ---------------- */

export const docTransitionService = {
  page: (params: DocStateQueryParams): Promise<PageResult<DocTransitionItem>> =>
    request<PageResult<DocTransitionItem>>({ method: 'GET', url: `${BASE}/transitions`, params }),

  stats: (): Promise<DocTransitionStats> =>
    request<DocTransitionStats>({ method: 'GET', url: `${BASE}/transitions/stats` }),

  /** 校验流转是否允许（按单据类型 + 起始状态 + 动作返回流转规则对象）。 */
  validate: (params: DocTransitionValidateParams): Promise<DocTransitionItem> =>
    request<DocTransitionItem>({ method: 'GET', url: `${BASE}/transitions/validate`, params }),

  detail: (id: number): Promise<DocTransitionItem> =>
    request<DocTransitionItem>({ method: 'GET', url: `${BASE}/transitions/${id}` }),

  create: (data: DocTransitionSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/transitions`, data }),

  update: (id: number, data: DocTransitionSaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/transitions/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/transitions/${id}` }),

  enable: (id: number): Promise<void> => request<void>({ method: 'POST', url: `${BASE}/transitions/${id}/enable` }),

  disable: (id: number): Promise<void> => request<void>({ method: 'POST', url: `${BASE}/transitions/${id}/disable` }),
};

/* ---------------- 3. 单据状态日志 ---------------- */

export const docStateLogService = {
  page: (params: DocStateQueryParams): Promise<PageResult<DocStateLogItem>> =>
    request<PageResult<DocStateLogItem>>({ method: 'GET', url: `${BASE}/state-logs`, params }),

  stats: (): Promise<DocStateLogStats> =>
    request<DocStateLogStats>({ method: 'GET', url: `${BASE}/state-logs/stats` }),

  detail: (id: number): Promise<DocStateLogItem> =>
    request<DocStateLogItem>({ method: 'GET', url: `${BASE}/state-logs/${id}` }),

  create: (data: DocStateLogSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/state-logs`, data }),

  update: (id: number, data: DocStateLogSaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/state-logs/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/state-logs/${id}` }),
};
