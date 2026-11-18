import { request } from '@/services/request';
import type { PageResult } from '@/types/common';
import type {
  WmsInventoryBatch,
  WmsInventoryBatchQuery,
  WmsInventoryBatchSaveRequest,
  WmsSerialNumber,
  WmsSerialNumberQuery,
  WmsSerialNumberSaveRequest,
  WmsStockFreeze,
  WmsStockFreezeQuery,
  WmsStockFreezeSaveRequest,
} from '@/types/wmsInventory';

/** G5-N3 WMS 库存控制（T047，后端 Base: /wms/inventory）服务定义。 */

const BASE = '/wms/inventory';

/* ---------------- 1. 库存批次 ---------------- */

export const wmsInventoryBatchService = {
  page: (params: WmsInventoryBatchQuery): Promise<PageResult<WmsInventoryBatch>> =>
    request<PageResult<WmsInventoryBatch>>({ method: 'GET', url: `${BASE}/batches`, params }),

  detail: (id: number): Promise<WmsInventoryBatch> =>
    request<WmsInventoryBatch>({ method: 'GET', url: `${BASE}/batches/${id}` }),

  create: (data: WmsInventoryBatchSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/batches`, data }),

  update: (id: number, data: WmsInventoryBatchSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/batches/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/batches/${id}` }),
};

/* ---------------- 2. 序列号 ---------------- */

export const wmsSerialNumberService = {
  page: (params: WmsSerialNumberQuery): Promise<PageResult<WmsSerialNumber>> =>
    request<PageResult<WmsSerialNumber>>({ method: 'GET', url: `${BASE}/serials`, params }),

  detail: (id: number): Promise<WmsSerialNumber> =>
    request<WmsSerialNumber>({ method: 'GET', url: `${BASE}/serials/${id}` }),

  create: (data: WmsSerialNumberSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/serials`, data }),

  update: (id: number, data: WmsSerialNumberSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/serials/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/serials/${id}` }),
};

/* ---------------- 3. 库存冻结 ---------------- */

export const wmsStockFreezeService = {
  page: (params: WmsStockFreezeQuery): Promise<PageResult<WmsStockFreeze>> =>
    request<PageResult<WmsStockFreeze>>({ method: 'GET', url: `${BASE}/freezes`, params }),

  detail: (id: number): Promise<WmsStockFreeze> =>
    request<WmsStockFreeze>({ method: 'GET', url: `${BASE}/freezes/${id}` }),

  create: (data: WmsStockFreezeSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/freezes`, data }),

  update: (id: number, data: WmsStockFreezeSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/freezes/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/freezes/${id}` }),
};
