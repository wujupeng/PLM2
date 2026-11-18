import { request } from '@/services/request';
import type { PageResult } from '@/types/common';
import type {
  WmsPickTask,
  WmsPickTaskQuery,
  WmsPickTaskSaveRequest,
  WmsKittingCheck,
  WmsKittingCheckQuery,
  WmsKittingCheckSaveRequest,
  WmsLineSideInventory,
  WmsLineSideInventoryQuery,
  WmsLineSideInventorySaveRequest,
} from '@/types/wmsPicking';

/** G5-N4 WMS 拣选发料（T048，后端 Base: /wms/pick）服务定义。 */

const BASE = '/wms/pick';

/* ---------------- 1. 拣料单 ---------------- */

export const wmsPickTaskService = {
  page: (params: WmsPickTaskQuery): Promise<PageResult<WmsPickTask>> =>
    request<PageResult<WmsPickTask>>({ method: 'GET', url: `${BASE}/tasks`, params }),

  detail: (id: number): Promise<WmsPickTask> =>
    request<WmsPickTask>({ method: 'GET', url: `${BASE}/tasks/${id}` }),

  create: (data: WmsPickTaskSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/tasks`, data }),

  update: (id: number, data: WmsPickTaskSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/tasks/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/tasks/${id}` }),
};

/* ---------------- 2. 齐套检查 ---------------- */

export const wmsKittingCheckService = {
  page: (params: WmsKittingCheckQuery): Promise<PageResult<WmsKittingCheck>> =>
    request<PageResult<WmsKittingCheck>>({ method: 'GET', url: `${BASE}/kittings`, params }),

  detail: (id: number): Promise<WmsKittingCheck> =>
    request<WmsKittingCheck>({ method: 'GET', url: `${BASE}/kittings/${id}` }),

  create: (data: WmsKittingCheckSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/kittings`, data }),

  update: (id: number, data: WmsKittingCheckSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/kittings/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/kittings/${id}` }),
};

/* ---------------- 3. 线边仓库存 ---------------- */

export const wmsLineSideInventoryService = {
  page: (params: WmsLineSideInventoryQuery): Promise<PageResult<WmsLineSideInventory>> =>
    request<PageResult<WmsLineSideInventory>>({ method: 'GET', url: `${BASE}/line-stocks`, params }),

  detail: (id: number): Promise<WmsLineSideInventory> =>
    request<WmsLineSideInventory>({ method: 'GET', url: `${BASE}/line-stocks/${id}` }),

  create: (data: WmsLineSideInventorySaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/line-stocks`, data }),

  update: (id: number, data: WmsLineSideInventorySaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/line-stocks/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/line-stocks/${id}` }),
};
