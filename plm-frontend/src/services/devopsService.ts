import { request } from '@/services/request';
import type { PageResult } from '@/types/common';
import type {
  DevopsBuildRunItem,
  DevopsBuildRunQueryParams,
  DevopsBuildRunSaveParams,
  DevopsEnvironmentItem,
  DevopsEnvironmentQueryParams,
  DevopsEnvironmentSaveParams,
  DevopsGateItem,
  DevopsGateQueryParams,
  DevopsGateSaveParams,
  DevopsPipelineItem,
  DevopsPipelineQueryParams,
  DevopsPipelineSaveParams,
  DevopsRepositoryItem,
  DevopsRepositoryQueryParams,
  DevopsRepositorySaveParams,
} from '@/types/devops';

/** G1-N7 WBS T012 DevSecOps（后端 Base: /platform/devops）服务定义。 */

const BASE = '/platform/devops';

/* ---------------- 1. 代码仓库 ---------------- */

export const devopsRepositoryService = {
  page: (params: DevopsRepositoryQueryParams): Promise<PageResult<DevopsRepositoryItem>> =>
    request<PageResult<DevopsRepositoryItem>>({ method: 'GET', url: `${BASE}/repositories`, params }),

  detail: (id: number): Promise<DevopsRepositoryItem> =>
    request<DevopsRepositoryItem>({ method: 'GET', url: `${BASE}/repositories/${id}` }),

  create: (data: DevopsRepositorySaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/repositories`, data }),

  update: (id: number, data: DevopsRepositorySaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/repositories/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/repositories/${id}` }),
};

/* ---------------- 2. 流水线 ---------------- */

export const devopsPipelineService = {
  page: (params: DevopsPipelineQueryParams): Promise<PageResult<DevopsPipelineItem>> =>
    request<PageResult<DevopsPipelineItem>>({ method: 'GET', url: `${BASE}/pipelines`, params }),

  detail: (id: number): Promise<DevopsPipelineItem> =>
    request<DevopsPipelineItem>({ method: 'GET', url: `${BASE}/pipelines/${id}` }),

  create: (data: DevopsPipelineSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/pipelines`, data }),

  update: (id: number, data: DevopsPipelineSaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/pipelines/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/pipelines/${id}` }),
};

/* ---------------- 3. 环境 ---------------- */

export const devopsEnvironmentService = {
  page: (params: DevopsEnvironmentQueryParams): Promise<PageResult<DevopsEnvironmentItem>> =>
    request<PageResult<DevopsEnvironmentItem>>({ method: 'GET', url: `${BASE}/environments`, params }),

  detail: (id: number): Promise<DevopsEnvironmentItem> =>
    request<DevopsEnvironmentItem>({ method: 'GET', url: `${BASE}/environments/${id}` }),

  create: (data: DevopsEnvironmentSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/environments`, data }),

  update: (id: number, data: DevopsEnvironmentSaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/environments/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/environments/${id}` }),
};

/* ---------------- 4. 构建部署记录 ---------------- */

export const devopsBuildRunService = {
  page: (params: DevopsBuildRunQueryParams): Promise<PageResult<DevopsBuildRunItem>> =>
    request<PageResult<DevopsBuildRunItem>>({ method: 'GET', url: `${BASE}/build-runs`, params }),

  detail: (id: number): Promise<DevopsBuildRunItem> =>
    request<DevopsBuildRunItem>({ method: 'GET', url: `${BASE}/build-runs/${id}` }),

  create: (data: DevopsBuildRunSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/build-runs`, data }),

  update: (id: number, data: DevopsBuildRunSaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/build-runs/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/build-runs/${id}` }),
};

/* ---------------- 5. 质量与安全门禁 ---------------- */

export const devopsGateService = {
  page: (params: DevopsGateQueryParams): Promise<PageResult<DevopsGateItem>> =>
    request<PageResult<DevopsGateItem>>({ method: 'GET', url: `${BASE}/gates`, params }),

  detail: (id: number): Promise<DevopsGateItem> =>
    request<DevopsGateItem>({ method: 'GET', url: `${BASE}/gates/${id}` }),

  create: (data: DevopsGateSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/gates`, data }),

  update: (id: number, data: DevopsGateSaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/gates/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/gates/${id}` }),
};
