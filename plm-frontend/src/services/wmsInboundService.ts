import { request } from '@/services/request';
import type { PageResult } from '@/types/common';
import type {
  WmsAsn,
  WmsAsnQuery,
  WmsAsnSaveRequest,
  WmsReceipt,
  WmsReceiptQuery,
  WmsReceiptSaveRequest,
  WmsPutawayTask,
  WmsPutawayTaskQuery,
  WmsPutawayTaskSaveRequest,
} from '@/types/wmsInbound';

/** G5-N2 WMS 收货上架（T046，后端 Base: /wms/inbound）服务定义。 */

const BASE = '/wms/inbound';

/* ---------------- 1. 收货通知（ASN） ---------------- */

export const wmsAsnService = {
  page: (params: WmsAsnQuery): Promise<PageResult<WmsAsn>> =>
    request<PageResult<WmsAsn>>({ method: 'GET', url: `${BASE}/asns`, params }),

  detail: (id: number): Promise<WmsAsn> =>
    request<WmsAsn>({ method: 'GET', url: `${BASE}/asns/${id}` }),

  create: (data: WmsAsnSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/asns`, data }),

  update: (id: number, data: WmsAsnSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/asns/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/asns/${id}` }),
};

/* ---------------- 2. 收货单 ---------------- */

export const wmsReceiptService = {
  page: (params: WmsReceiptQuery): Promise<PageResult<WmsReceipt>> =>
    request<PageResult<WmsReceipt>>({ method: 'GET', url: `${BASE}/receipts`, params }),

  detail: (id: number): Promise<WmsReceipt> =>
    request<WmsReceipt>({ method: 'GET', url: `${BASE}/receipts/${id}` }),

  create: (data: WmsReceiptSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/receipts`, data }),

  update: (id: number, data: WmsReceiptSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/receipts/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/receipts/${id}` }),
};

/* ---------------- 3. 上架任务 ---------------- */

export const wmsPutawayTaskService = {
  page: (params: WmsPutawayTaskQuery): Promise<PageResult<WmsPutawayTask>> =>
    request<PageResult<WmsPutawayTask>>({ method: 'GET', url: `${BASE}/putaways`, params }),

  detail: (id: number): Promise<WmsPutawayTask> =>
    request<WmsPutawayTask>({ method: 'GET', url: `${BASE}/putaways/${id}` }),

  create: (data: WmsPutawayTaskSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/putaways`, data }),

  update: (id: number, data: WmsPutawayTaskSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/putaways/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/putaways/${id}` }),
};
