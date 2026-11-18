import { request } from '@/services/request';
import type { PageResult } from '@/types/common';
import type {
  WmsReturnOrder,
  WmsReturnOrderQuery,
  WmsReturnOrderSaveRequest,
  WmsReplenishOrder,
  WmsReplenishOrderQuery,
  WmsReplenishOrderSaveRequest,
  WmsMaterialDiff,
  WmsMaterialDiffQuery,
  WmsMaterialDiffSaveRequest,
} from '@/types/wmsReturn';

/** G5-N5 WMS 生产退补料（T049，后端 Base: /wms/return）服务定义。 */

const BASE = '/wms/return';

/* ---------------- 1. 生产退料 ---------------- */

export const wmsReturnOrderService = {
  page: (params: WmsReturnOrderQuery): Promise<PageResult<WmsReturnOrder>> =>
    request<PageResult<WmsReturnOrder>>({ method: 'GET', url: `${BASE}/returns`, params }),

  detail: (id: number): Promise<WmsReturnOrder> =>
    request<WmsReturnOrder>({ method: 'GET', url: `${BASE}/returns/${id}` }),

  create: (data: WmsReturnOrderSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/returns`, data }),

  update: (id: number, data: WmsReturnOrderSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/returns/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/returns/${id}` }),
};

/* ---------------- 2. 生产补料 ---------------- */

export const wmsReplenishOrderService = {
  page: (params: WmsReplenishOrderQuery): Promise<PageResult<WmsReplenishOrder>> =>
    request<PageResult<WmsReplenishOrder>>({ method: 'GET', url: `${BASE}/replenishes`, params }),

  detail: (id: number): Promise<WmsReplenishOrder> =>
    request<WmsReplenishOrder>({ method: 'GET', url: `${BASE}/replenishes/${id}` }),

  create: (data: WmsReplenishOrderSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/replenishes`, data }),

  update: (id: number, data: WmsReplenishOrderSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/replenishes/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/replenishes/${id}` }),
};

/* ---------------- 3. 差异处理 ---------------- */

export const wmsMaterialDiffService = {
  page: (params: WmsMaterialDiffQuery): Promise<PageResult<WmsMaterialDiff>> =>
    request<PageResult<WmsMaterialDiff>>({ method: 'GET', url: `${BASE}/diffs`, params }),

  detail: (id: number): Promise<WmsMaterialDiff> =>
    request<WmsMaterialDiff>({ method: 'GET', url: `${BASE}/diffs/${id}` }),

  create: (data: WmsMaterialDiffSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/diffs`, data }),

  update: (id: number, data: WmsMaterialDiffSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/diffs/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/diffs/${id}` }),
};
