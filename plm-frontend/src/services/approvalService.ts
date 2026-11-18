import { request } from '@/services/request';
import type { PageResult } from '@/types/common';
import type {
  ApprovalConditionItem,
  ApprovalConditionSaveParams,
  ApprovalConditionStats,
  ApprovalFlowItem,
  ApprovalFlowMatchParams,
  ApprovalFlowSaveParams,
  ApprovalFlowStats,
  ApprovalInstanceItem,
  ApprovalInstanceSaveParams,
  ApprovalInstanceStats,
  ApprovalNodeItem,
  ApprovalNodeSaveParams,
  ApprovalNodeStats,
  ApprovalQueryParams,
  ApprovalTaskActionParams,
  ApprovalTaskItem,
  ApprovalTaskSaveParams,
  ApprovalTaskStats,
} from '@/types/approval';

/** G1-N6 T103 可配置审批（后端 Base: /platform/approval）服务定义。 */

const BASE = '/platform/approval';

/* ---------------- 1. 审批流定义 ---------------- */

export const approvalFlowService = {
  page: (params: ApprovalQueryParams): Promise<PageResult<ApprovalFlowItem>> =>
    request<PageResult<ApprovalFlowItem>>({ method: 'GET', url: `${BASE}/flows`, params }),

  stats: (): Promise<ApprovalFlowStats> => request<ApprovalFlowStats>({ method: 'GET', url: `${BASE}/flows/stats` }),

  /** 按单据类型 + 业务模块 + 条件值匹配适用审批流。 */
  match: (data: ApprovalFlowMatchParams): Promise<ApprovalFlowItem[]> =>
    request<ApprovalFlowItem[]>({ method: 'POST', url: `${BASE}/flows/match`, data }),

  detail: (id: number): Promise<ApprovalFlowItem> =>
    request<ApprovalFlowItem>({ method: 'GET', url: `${BASE}/flows/${id}` }),

  create: (data: ApprovalFlowSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/flows`, data }),

  update: (id: number, data: ApprovalFlowSaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/flows/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/flows/${id}` }),

  enable: (id: number): Promise<void> => request<void>({ method: 'POST', url: `${BASE}/flows/${id}/enable` }),

  disable: (id: number): Promise<void> => request<void>({ method: 'POST', url: `${BASE}/flows/${id}/disable` }),
};

/* ---------------- 2. 审批条件 ---------------- */

export const approvalConditionService = {
  page: (params: ApprovalQueryParams): Promise<PageResult<ApprovalConditionItem>> =>
    request<PageResult<ApprovalConditionItem>>({ method: 'GET', url: `${BASE}/conditions`, params }),

  stats: (): Promise<ApprovalConditionStats> =>
    request<ApprovalConditionStats>({ method: 'GET', url: `${BASE}/conditions/stats` }),

  detail: (id: number): Promise<ApprovalConditionItem> =>
    request<ApprovalConditionItem>({ method: 'GET', url: `${BASE}/conditions/${id}` }),

  create: (data: ApprovalConditionSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/conditions`, data }),

  update: (id: number, data: ApprovalConditionSaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/conditions/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/conditions/${id}` }),

  enable: (id: number): Promise<void> => request<void>({ method: 'POST', url: `${BASE}/conditions/${id}/enable` }),

  disable: (id: number): Promise<void> => request<void>({ method: 'POST', url: `${BASE}/conditions/${id}/disable` }),
};

/* ---------------- 3. 审批节点 ---------------- */

export const approvalNodeService = {
  page: (params: ApprovalQueryParams): Promise<PageResult<ApprovalNodeItem>> =>
    request<PageResult<ApprovalNodeItem>>({ method: 'GET', url: `${BASE}/nodes`, params }),

  stats: (): Promise<ApprovalNodeStats> => request<ApprovalNodeStats>({ method: 'GET', url: `${BASE}/nodes/stats` }),

  detail: (id: number): Promise<ApprovalNodeItem> =>
    request<ApprovalNodeItem>({ method: 'GET', url: `${BASE}/nodes/${id}` }),

  create: (data: ApprovalNodeSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/nodes`, data }),

  update: (id: number, data: ApprovalNodeSaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/nodes/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/nodes/${id}` }),

  enable: (id: number): Promise<void> => request<void>({ method: 'POST', url: `${BASE}/nodes/${id}/enable` }),

  disable: (id: number): Promise<void> => request<void>({ method: 'POST', url: `${BASE}/nodes/${id}/disable` }),
};

/* ---------------- 4. 审批实例 ---------------- */

export const approvalInstanceService = {
  page: (params: ApprovalQueryParams): Promise<PageResult<ApprovalInstanceItem>> =>
    request<PageResult<ApprovalInstanceItem>>({ method: 'GET', url: `${BASE}/instances`, params }),

  stats: (): Promise<ApprovalInstanceStats> =>
    request<ApprovalInstanceStats>({ method: 'GET', url: `${BASE}/instances/stats` }),

  detail: (id: number): Promise<ApprovalInstanceItem> =>
    request<ApprovalInstanceItem>({ method: 'GET', url: `${BASE}/instances/${id}` }),

  create: (data: ApprovalInstanceSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/instances`, data }),

  update: (id: number, data: ApprovalInstanceSaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/instances/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/instances/${id}` }),

  cancel: (id: number): Promise<void> => request<void>({ method: 'POST', url: `${BASE}/instances/${id}/cancel` }),
};

/* ---------------- 5. 审批任务 ---------------- */

export const approvalTaskService = {
  page: (params: ApprovalQueryParams): Promise<PageResult<ApprovalTaskItem>> =>
    request<PageResult<ApprovalTaskItem>>({ method: 'GET', url: `${BASE}/tasks`, params }),

  stats: (): Promise<ApprovalTaskStats> => request<ApprovalTaskStats>({ method: 'GET', url: `${BASE}/tasks/stats` }),

  detail: (id: number): Promise<ApprovalTaskItem> =>
    request<ApprovalTaskItem>({ method: 'GET', url: `${BASE}/tasks/${id}` }),

  create: (data: ApprovalTaskSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/tasks`, data }),

  update: (id: number, data: ApprovalTaskSaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/tasks/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/tasks/${id}` }),

  approve: (id: number, data: ApprovalTaskActionParams): Promise<void> =>
    request<void>({ method: 'POST', url: `${BASE}/tasks/${id}/approve`, data }),

  reject: (id: number, data: ApprovalTaskActionParams): Promise<void> =>
    request<void>({ method: 'POST', url: `${BASE}/tasks/${id}/reject`, data }),

  transfer: (id: number, data: ApprovalTaskActionParams): Promise<void> =>
    request<void>({ method: 'POST', url: `${BASE}/tasks/${id}/transfer`, data }),

  reset: (id: number, data: ApprovalTaskActionParams): Promise<void> =>
    request<void>({ method: 'POST', url: `${BASE}/tasks/${id}/reset`, data }),
};
