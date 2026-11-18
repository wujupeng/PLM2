import { request } from '@/services/request';
import type { PageResult } from '@/types/common';
import type {
  ErpDocTrack,
  ErpDocTrackEvent,
  ErpDocTrackEventQuery,
  ErpDocTrackEventSaveRequest,
  ErpDocTrackQuery,
  ErpDocTrackSaveRequest,
} from '@/types/erpTrace';

/** G3-N7a ERP 业务单据追踪（T029，后端 Base: /erp/trace）服务定义。 */

const BASE = '/erp/trace';

/* ---------------- 1. 单据追溯 ---------------- */

export const erpDocTrackService = {
  page: (params: ErpDocTrackQuery): Promise<PageResult<ErpDocTrack>> =>
    request<PageResult<ErpDocTrack>>({ method: 'GET', url: `${BASE}/docs`, params }),

  detail: (id: number): Promise<ErpDocTrack> =>
    request<ErpDocTrack>({ method: 'GET', url: `${BASE}/docs/${id}` }),

  create: (data: ErpDocTrackSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/docs`, data }),

  update: (id: number, data: ErpDocTrackSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/docs/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/docs/${id}` }),
};

/* ---------------- 2. 业务事件 ---------------- */

export const erpDocTrackEventService = {
  page: (params: ErpDocTrackEventQuery): Promise<PageResult<ErpDocTrackEvent>> =>
    request<PageResult<ErpDocTrackEvent>>({ method: 'GET', url: `${BASE}/events`, params }),

  detail: (id: number): Promise<ErpDocTrackEvent> =>
    request<ErpDocTrackEvent>({ method: 'GET', url: `${BASE}/events/${id}` }),

  create: (data: ErpDocTrackEventSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/events`, data }),

  update: (id: number, data: ErpDocTrackEventSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/events/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/events/${id}` }),
};
