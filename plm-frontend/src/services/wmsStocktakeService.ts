import { request } from '@/services/request';
import type { PageResult } from '@/types/common';
import type {
  WmsStocktakeOrder,
  WmsStocktakeOrderQuery,
  WmsStocktakeOrderSaveRequest,
  WmsStocktakeDiff,
  WmsStocktakeDiffQuery,
  WmsStocktakeDiffSaveRequest,
  WmsTransferOrder,
  WmsTransferOrderQuery,
  WmsTransferOrderSaveRequest,
} from '@/types/wmsStocktake';

/** G5-N7 WMS 盘点与调拨（T051，后端 Base: /wms/stocktake）服务定义。 */

const BASE = '/wms/stocktake';

/* ---------------- 1. 盘点单 ---------------- */

export const wmsStocktakeOrderService = {
  page: (params: WmsStocktakeOrderQuery): Promise<PageResult<WmsStocktakeOrder>> =>
    request<PageResult<WmsStocktakeOrder>>({ method: 'GET', url: `${BASE}/orders`, params }),

  detail: (id: number): Promise<WmsStocktakeOrder> =>
    request<WmsStocktakeOrder>({ method: 'GET', url: `${BASE}/orders/${id}` }),

  create: (data: WmsStocktakeOrderSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/orders`, data }),

  update: (id: number, data: WmsStocktakeOrderSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/orders/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/orders/${id}` }),
};

/* ---------------- 2. 盘点差异 ---------------- */

export const wmsStocktakeDiffService = {
  page: (params: WmsStocktakeDiffQuery): Promise<PageResult<WmsStocktakeDiff>> =>
    request<PageResult<WmsStocktakeDiff>>({ method: 'GET', url: `${BASE}/diffs`, params }),

  detail: (id: number): Promise<WmsStocktakeDiff> =>
    request<WmsStocktakeDiff>({ method: 'GET', url: `${BASE}/diffs/${id}` }),

  create: (data: WmsStocktakeDiffSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/diffs`, data }),

  update: (id: number, data: WmsStocktakeDiffSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/diffs/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/diffs/${id}` }),
};

/* ---------------- 3. 调拨单 ---------------- */

export const wmsTransferOrderService = {
  page: (params: WmsTransferOrderQuery): Promise<PageResult<WmsTransferOrder>> =>
    request<PageResult<WmsTransferOrder>>({ method: 'GET', url: `${BASE}/transfers`, params }),

  detail: (id: number): Promise<WmsTransferOrder> =>
    request<WmsTransferOrder>({ method: 'GET', url: `${BASE}/transfers/${id}` }),

  create: (data: WmsTransferOrderSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/transfers`, data }),

  update: (id: number, data: WmsTransferOrderSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/transfers/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/transfers/${id}` }),
};
