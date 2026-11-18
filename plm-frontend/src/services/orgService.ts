import { request } from '@/services/request';
import type { PageResult } from '@/types/common';
import type {
  OrgFactoryItem,
  OrgFactorySaveParams,
  OrgFactoryStats,
  OrgGrantItem,
  OrgGrantSaveParams,
  OrgGrantStats,
  OrgLegalEntityItem,
  OrgLegalEntitySaveParams,
  OrgLegalEntityStats,
  OrgProductionLineItem,
  OrgProductionLineSaveParams,
  OrgProductionLineStats,
  OrgQueryParams,
  OrgWarehouseItem,
  OrgWarehouseSaveParams,
  OrgWarehouseStats,
} from '@/types/org';

/** G1-N5 公共平台底座—多组织多工厂（后端 WBS T100）服务定义。 */

const BASE = '/platform/org';

/* ---------------- 1. 法人主体 ---------------- */

export const orgLegalEntityService = {
  page: (params: OrgQueryParams): Promise<PageResult<OrgLegalEntityItem>> =>
    request<PageResult<OrgLegalEntityItem>>({ method: 'GET', url: `${BASE}/legal-entities`, params }),

  stats: (): Promise<OrgLegalEntityStats> =>
    request<OrgLegalEntityStats>({ method: 'GET', url: `${BASE}/legal-entities/stats` }),

  detail: (id: number): Promise<OrgLegalEntityItem> =>
    request<OrgLegalEntityItem>({ method: 'GET', url: `${BASE}/legal-entities/${id}` }),

  create: (data: OrgLegalEntitySaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/legal-entities`, data }),

  update: (id: number, data: OrgLegalEntitySaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/legal-entities/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/legal-entities/${id}` }),

  enable: (id: number): Promise<void> =>
    request<void>({ method: 'POST', url: `${BASE}/legal-entities/${id}/enable` }),

  disable: (id: number): Promise<void> =>
    request<void>({ method: 'POST', url: `${BASE}/legal-entities/${id}/disable` }),
};

/* ---------------- 2. 工厂 ---------------- */

export const orgFactoryService = {
  page: (params: OrgQueryParams): Promise<PageResult<OrgFactoryItem>> =>
    request<PageResult<OrgFactoryItem>>({ method: 'GET', url: `${BASE}/factories`, params }),

  stats: (): Promise<OrgFactoryStats> => request<OrgFactoryStats>({ method: 'GET', url: `${BASE}/factories/stats` }),

  detail: (id: number): Promise<OrgFactoryItem> =>
    request<OrgFactoryItem>({ method: 'GET', url: `${BASE}/factories/${id}` }),

  create: (data: OrgFactorySaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/factories`, data }),

  update: (id: number, data: OrgFactorySaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/factories/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/factories/${id}` }),

  enable: (id: number): Promise<void> => request<void>({ method: 'POST', url: `${BASE}/factories/${id}/enable` }),

  disable: (id: number): Promise<void> => request<void>({ method: 'POST', url: `${BASE}/factories/${id}/disable` }),
};

/* ---------------- 3. 仓库 ---------------- */

export const orgWarehouseService = {
  page: (params: OrgQueryParams): Promise<PageResult<OrgWarehouseItem>> =>
    request<PageResult<OrgWarehouseItem>>({ method: 'GET', url: `${BASE}/warehouses`, params }),

  stats: (): Promise<OrgWarehouseStats> =>
    request<OrgWarehouseStats>({ method: 'GET', url: `${BASE}/warehouses/stats` }),

  detail: (id: number): Promise<OrgWarehouseItem> =>
    request<OrgWarehouseItem>({ method: 'GET', url: `${BASE}/warehouses/${id}` }),

  create: (data: OrgWarehouseSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/warehouses`, data }),

  update: (id: number, data: OrgWarehouseSaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/warehouses/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/warehouses/${id}` }),

  enable: (id: number): Promise<void> => request<void>({ method: 'POST', url: `${BASE}/warehouses/${id}/enable` }),

  disable: (id: number): Promise<void> => request<void>({ method: 'POST', url: `${BASE}/warehouses/${id}/disable` }),
};

/* ---------------- 4. 产线 ---------------- */

export const orgProductionLineService = {
  page: (params: OrgQueryParams): Promise<PageResult<OrgProductionLineItem>> =>
    request<PageResult<OrgProductionLineItem>>({ method: 'GET', url: `${BASE}/production-lines`, params }),

  stats: (): Promise<OrgProductionLineStats> =>
    request<OrgProductionLineStats>({ method: 'GET', url: `${BASE}/production-lines/stats` }),

  detail: (id: number): Promise<OrgProductionLineItem> =>
    request<OrgProductionLineItem>({ method: 'GET', url: `${BASE}/production-lines/${id}` }),

  create: (data: OrgProductionLineSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/production-lines`, data }),

  update: (id: number, data: OrgProductionLineSaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/production-lines/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/production-lines/${id}` }),

  enable: (id: number): Promise<void> =>
    request<void>({ method: 'POST', url: `${BASE}/production-lines/${id}/enable` }),

  disable: (id: number): Promise<void> =>
    request<void>({ method: 'POST', url: `${BASE}/production-lines/${id}/disable` }),
};

/* ---------------- 5. 跨组织授权 ---------------- */

export const orgGrantService = {
  page: (params: OrgQueryParams): Promise<PageResult<OrgGrantItem>> =>
    request<PageResult<OrgGrantItem>>({ method: 'GET', url: `${BASE}/org-grants`, params }),

  stats: (): Promise<OrgGrantStats> => request<OrgGrantStats>({ method: 'GET', url: `${BASE}/org-grants/stats` }),

  detail: (id: number): Promise<OrgGrantItem> =>
    request<OrgGrantItem>({ method: 'GET', url: `${BASE}/org-grants/${id}` }),

  create: (data: OrgGrantSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/org-grants`, data }),

  update: (id: number, data: OrgGrantSaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/org-grants/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/org-grants/${id}` }),

  revoke: (id: number): Promise<void> => request<void>({ method: 'POST', url: `${BASE}/org-grants/${id}/revoke` }),

  expire: (id: number): Promise<void> => request<void>({ method: 'POST', url: `${BASE}/org-grants/${id}/expire` }),
};
