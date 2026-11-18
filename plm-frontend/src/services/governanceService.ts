import { request } from '@/services/request';
import type { PageResult } from '@/types/common';
import type {
  GovArchComponentItem,
  GovArchComponentQueryParams,
  GovArchComponentSaveParams,
  GovArchRelationItem,
  GovArchRelationQueryParams,
  GovArchRelationSaveParams,
  GovAsisFindingItem,
  GovAsisFindingQueryParams,
  GovAsisFindingSaveParams,
  GovAsisSystemItem,
  GovAsisSystemQueryParams,
  GovAsisSystemSaveParams,
  GovMilestoneItem,
  GovMilestoneQueryParams,
  GovMilestoneSaveParams,
  GovProcessItem,
  GovProcessNodeItem,
  GovProcessNodeQueryParams,
  GovProcessNodeSaveParams,
  GovProcessQueryParams,
  GovProcessSaveParams,
  GovProjectItem,
  GovProjectQueryParams,
  GovProjectSaveParams,
  GovRequirementItem,
  GovRequirementQueryParams,
  GovRequirementSaveParams,
  GovRiskItem,
  GovRiskQueryParams,
  GovRiskSaveParams,
  GovTaskItem,
  GovTaskQueryParams,
  GovTaskSaveParams,
  GovTraceLinkItem,
  GovTraceLinkQueryParams,
  GovTraceLinkSaveParams,
} from '@/types/governance';

/** G1-N7 WBS T001-T005 治理中心（后端 Base: /platform/governance）服务定义。 */

const BASE = '/platform/governance';

/* ---------------- 1. 项目治理：项目 ---------------- */

export const govProjectService = {
  page: (params: GovProjectQueryParams): Promise<PageResult<GovProjectItem>> =>
    request<PageResult<GovProjectItem>>({ method: 'GET', url: `${BASE}/projects`, params }),

  detail: (id: number): Promise<GovProjectItem> =>
    request<GovProjectItem>({ method: 'GET', url: `${BASE}/projects/${id}` }),

  create: (data: GovProjectSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/projects`, data }),

  update: (id: number, data: GovProjectSaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/projects/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/projects/${id}` }),
};

/* ---------------- 2. 项目治理：里程碑 ---------------- */

export const govMilestoneService = {
  page: (params: GovMilestoneQueryParams): Promise<PageResult<GovMilestoneItem>> =>
    request<PageResult<GovMilestoneItem>>({ method: 'GET', url: `${BASE}/milestones`, params }),

  detail: (id: number): Promise<GovMilestoneItem> =>
    request<GovMilestoneItem>({ method: 'GET', url: `${BASE}/milestones/${id}` }),

  create: (data: GovMilestoneSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/milestones`, data }),

  update: (id: number, data: GovMilestoneSaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/milestones/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/milestones/${id}` }),
};

/* ---------------- 3. 项目治理：治理任务 ---------------- */

export const govTaskService = {
  page: (params: GovTaskQueryParams): Promise<PageResult<GovTaskItem>> =>
    request<PageResult<GovTaskItem>>({ method: 'GET', url: `${BASE}/tasks`, params }),

  detail: (id: number): Promise<GovTaskItem> =>
    request<GovTaskItem>({ method: 'GET', url: `${BASE}/tasks/${id}` }),

  create: (data: GovTaskSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/tasks`, data }),

  update: (id: number, data: GovTaskSaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/tasks/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/tasks/${id}` }),
};

/* ---------------- 4. 项目治理：风险/问题/变更 ---------------- */

export const govRiskService = {
  page: (params: GovRiskQueryParams): Promise<PageResult<GovRiskItem>> =>
    request<PageResult<GovRiskItem>>({ method: 'GET', url: `${BASE}/risks`, params }),

  detail: (id: number): Promise<GovRiskItem> =>
    request<GovRiskItem>({ method: 'GET', url: `${BASE}/risks/${id}` }),

  create: (data: GovRiskSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/risks`, data }),

  update: (id: number, data: GovRiskSaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/risks/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/risks/${id}` }),
};

/* ---------------- 5. 现状盘点：存量系统 ---------------- */

export const govAsisSystemService = {
  page: (params: GovAsisSystemQueryParams): Promise<PageResult<GovAsisSystemItem>> =>
    request<PageResult<GovAsisSystemItem>>({ method: 'GET', url: `${BASE}/asis-systems`, params }),

  detail: (id: number): Promise<GovAsisSystemItem> =>
    request<GovAsisSystemItem>({ method: 'GET', url: `${BASE}/asis-systems/${id}` }),

  create: (data: GovAsisSystemSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/asis-systems`, data }),

  update: (id: number, data: GovAsisSystemSaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/asis-systems/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/asis-systems/${id}` }),
};

/* ---------------- 6. 现状盘点：盘点发现 ---------------- */

export const govAsisFindingService = {
  page: (params: GovAsisFindingQueryParams): Promise<PageResult<GovAsisFindingItem>> =>
    request<PageResult<GovAsisFindingItem>>({ method: 'GET', url: `${BASE}/asis-findings`, params }),

  detail: (id: number): Promise<GovAsisFindingItem> =>
    request<GovAsisFindingItem>({ method: 'GET', url: `${BASE}/asis-findings/${id}` }),

  create: (data: GovAsisFindingSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/asis-findings`, data }),

  update: (id: number, data: GovAsisFindingSaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/asis-findings/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/asis-findings/${id}` }),
};

/* ---------------- 7. 流程建模：端到端流程 ---------------- */

export const govProcessService = {
  page: (params: GovProcessQueryParams): Promise<PageResult<GovProcessItem>> =>
    request<PageResult<GovProcessItem>>({ method: 'GET', url: `${BASE}/processes`, params }),

  detail: (id: number): Promise<GovProcessItem> =>
    request<GovProcessItem>({ method: 'GET', url: `${BASE}/processes/${id}` }),

  create: (data: GovProcessSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/processes`, data }),

  update: (id: number, data: GovProcessSaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/processes/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/processes/${id}` }),
};

/* ---------------- 8. 流程建模：流程节点 ---------------- */

export const govProcessNodeService = {
  page: (params: GovProcessNodeQueryParams): Promise<PageResult<GovProcessNodeItem>> =>
    request<PageResult<GovProcessNodeItem>>({ method: 'GET', url: `${BASE}/process-nodes`, params }),

  detail: (id: number): Promise<GovProcessNodeItem> =>
    request<GovProcessNodeItem>({ method: 'GET', url: `${BASE}/process-nodes/${id}` }),

  create: (data: GovProcessNodeSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/process-nodes`, data }),

  update: (id: number, data: GovProcessNodeSaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/process-nodes/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/process-nodes/${id}` }),
};

/* ---------------- 9. 需求追踪：需求 ---------------- */

export const govRequirementService = {
  page: (params: GovRequirementQueryParams): Promise<PageResult<GovRequirementItem>> =>
    request<PageResult<GovRequirementItem>>({ method: 'GET', url: `${BASE}/requirements`, params }),

  detail: (id: number): Promise<GovRequirementItem> =>
    request<GovRequirementItem>({ method: 'GET', url: `${BASE}/requirements/${id}` }),

  create: (data: GovRequirementSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/requirements`, data }),

  update: (id: number, data: GovRequirementSaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/requirements/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/requirements/${id}` }),
};

/* ---------------- 10. 需求追踪：追踪链接 ---------------- */

export const govTraceLinkService = {
  page: (params: GovTraceLinkQueryParams): Promise<PageResult<GovTraceLinkItem>> =>
    request<PageResult<GovTraceLinkItem>>({ method: 'GET', url: `${BASE}/trace-links`, params }),

  detail: (id: number): Promise<GovTraceLinkItem> =>
    request<GovTraceLinkItem>({ method: 'GET', url: `${BASE}/trace-links/${id}` }),

  create: (data: GovTraceLinkSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/trace-links`, data }),

  update: (id: number, data: GovTraceLinkSaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/trace-links/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/trace-links/${id}` }),
};

/* ---------------- 11. 总体架构：架构组件 ---------------- */

export const govArchComponentService = {
  page: (params: GovArchComponentQueryParams): Promise<PageResult<GovArchComponentItem>> =>
    request<PageResult<GovArchComponentItem>>({ method: 'GET', url: `${BASE}/arch-components`, params }),

  detail: (id: number): Promise<GovArchComponentItem> =>
    request<GovArchComponentItem>({ method: 'GET', url: `${BASE}/arch-components/${id}` }),

  create: (data: GovArchComponentSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/arch-components`, data }),

  update: (id: number, data: GovArchComponentSaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/arch-components/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/arch-components/${id}` }),
};

/* ---------------- 12. 总体架构：架构关系 ---------------- */

export const govArchRelationService = {
  page: (params: GovArchRelationQueryParams): Promise<PageResult<GovArchRelationItem>> =>
    request<PageResult<GovArchRelationItem>>({ method: 'GET', url: `${BASE}/arch-relations`, params }),

  detail: (id: number): Promise<GovArchRelationItem> =>
    request<GovArchRelationItem>({ method: 'GET', url: `${BASE}/arch-relations/${id}` }),

  create: (data: GovArchRelationSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/arch-relations`, data }),

  update: (id: number, data: GovArchRelationSaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/arch-relations/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/arch-relations/${id}` }),
};
