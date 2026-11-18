import { request } from '@/services/request';
import type { PageResult } from '@/types/common';
import type {
  WmsWarehouse,
  WmsWarehouseQuery,
  WmsWarehouseSaveRequest,
  WmsZone,
  WmsZoneQuery,
  WmsZoneSaveRequest,
  WmsBin,
  WmsBinQuery,
  WmsBinSaveRequest,
  WmsRack,
  WmsRackQuery,
  WmsRackSaveRequest,
  WmsContainer,
  WmsContainerQuery,
  WmsContainerSaveRequest,
  WmsStrategy,
  WmsStrategyQuery,
  WmsStrategySaveRequest,
} from '@/types/wmsBase';

/** G5-N1 WMS 仓库基础（T045，后端 Base: /wms/base）服务定义。 */

const BASE = '/wms/base';

/* ---------------- 1. 仓库管理 ---------------- */

export const wmsWarehouseService = {
  page: (params: WmsWarehouseQuery): Promise<PageResult<WmsWarehouse>> =>
    request<PageResult<WmsWarehouse>>({ method: 'GET', url: `${BASE}/warehouses`, params }),

  detail: (id: number): Promise<WmsWarehouse> =>
    request<WmsWarehouse>({ method: 'GET', url: `${BASE}/warehouses/${id}` }),

  create: (data: WmsWarehouseSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/warehouses`, data }),

  update: (id: number, data: WmsWarehouseSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/warehouses/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/warehouses/${id}` }),
};

/* ---------------- 2. 库区管理 ---------------- */

export const wmsZoneService = {
  page: (params: WmsZoneQuery): Promise<PageResult<WmsZone>> =>
    request<PageResult<WmsZone>>({ method: 'GET', url: `${BASE}/zones`, params }),

  detail: (id: number): Promise<WmsZone> =>
    request<WmsZone>({ method: 'GET', url: `${BASE}/zones/${id}` }),

  create: (data: WmsZoneSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/zones`, data }),

  update: (id: number, data: WmsZoneSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/zones/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/zones/${id}` }),
};

/* ---------------- 3. 库位管理 ---------------- */

export const wmsBinService = {
  page: (params: WmsBinQuery): Promise<PageResult<WmsBin>> =>
    request<PageResult<WmsBin>>({ method: 'GET', url: `${BASE}/bins`, params }),

  detail: (id: number): Promise<WmsBin> =>
    request<WmsBin>({ method: 'GET', url: `${BASE}/bins/${id}` }),

  create: (data: WmsBinSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/bins`, data }),

  update: (id: number, data: WmsBinSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/bins/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/bins/${id}` }),
};

/* ---------------- 4. 货架管理 ---------------- */

export const wmsRackService = {
  page: (params: WmsRackQuery): Promise<PageResult<WmsRack>> =>
    request<PageResult<WmsRack>>({ method: 'GET', url: `${BASE}/racks`, params }),

  detail: (id: number): Promise<WmsRack> =>
    request<WmsRack>({ method: 'GET', url: `${BASE}/racks/${id}` }),

  create: (data: WmsRackSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/racks`, data }),

  update: (id: number, data: WmsRackSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/racks/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/racks/${id}` }),
};

/* ---------------- 5. 容器管理 ---------------- */

export const wmsContainerService = {
  page: (params: WmsContainerQuery): Promise<PageResult<WmsContainer>> =>
    request<PageResult<WmsContainer>>({ method: 'GET', url: `${BASE}/containers`, params }),

  detail: (id: number): Promise<WmsContainer> =>
    request<WmsContainer>({ method: 'GET', url: `${BASE}/containers/${id}` }),

  create: (data: WmsContainerSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/containers`, data }),

  update: (id: number, data: WmsContainerSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/containers/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/containers/${id}` }),
};

/* ---------------- 6. 作业策略 ---------------- */

export const wmsStrategyService = {
  page: (params: WmsStrategyQuery): Promise<PageResult<WmsStrategy>> =>
    request<PageResult<WmsStrategy>>({ method: 'GET', url: `${BASE}/strategies`, params }),

  detail: (id: number): Promise<WmsStrategy> =>
    request<WmsStrategy>({ method: 'GET', url: `${BASE}/strategies/${id}` }),

  create: (data: WmsStrategySaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/strategies`, data }),

  update: (id: number, data: WmsStrategySaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/strategies/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/strategies/${id}` }),
};
