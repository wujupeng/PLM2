import { request } from '@/services/request';
import type { PageResult } from '@/types/common';
import type {
  MesSerialNumber,
  MesSerialNumberQuery,
  MesSerialNumberSaveRequest,
  MesBatchTrace,
  MesBatchTraceQuery,
  MesBatchTraceSaveRequest,
  MesTraceCode,
  MesTraceCodeQuery,
  MesTraceCodeSaveRequest,
  MesTraceLink,
  MesTraceLinkQuery,
  MesTraceLinkSaveRequest,
  MesTraceRecord,
  MesTraceRecordQuery,
  MesTraceRecordSaveRequest,
} from '@/types/mesTrace';

/** G6-N6 MES 产品追溯（T042，后端 Base: /mes/trace）服务定义。 */

const BASE = '/mes/trace';

/* ---------------- 1. 序列号台账 ---------------- */

export const mesSerialNumberService = {
  page: (params: MesSerialNumberQuery): Promise<PageResult<MesSerialNumber>> =>
    request<PageResult<MesSerialNumber>>({ method: 'GET', url: `${BASE}/serials`, params }),

  detail: (id: number): Promise<MesSerialNumber> =>
    request<MesSerialNumber>({ method: 'GET', url: `${BASE}/serials/${id}` }),

  create: (data: MesSerialNumberSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/serials`, data }),

  update: (id: number, data: MesSerialNumberSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/serials/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/serials/${id}` }),
};

/* ---------------- 2. 批次追溯 ---------------- */

export const mesBatchTraceService = {
  page: (params: MesBatchTraceQuery): Promise<PageResult<MesBatchTrace>> =>
    request<PageResult<MesBatchTrace>>({ method: 'GET', url: `${BASE}/batches`, params }),

  detail: (id: number): Promise<MesBatchTrace> =>
    request<MesBatchTrace>({ method: 'GET', url: `${BASE}/batches/${id}` }),

  create: (data: MesBatchTraceSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/batches`, data }),

  update: (id: number, data: MesBatchTraceSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/batches/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/batches/${id}` }),
};

/* ---------------- 3. 追溯码（Data Matrix） ---------------- */

export const mesTraceCodeService = {
  page: (params: MesTraceCodeQuery): Promise<PageResult<MesTraceCode>> =>
    request<PageResult<MesTraceCode>>({ method: 'GET', url: `${BASE}/codes`, params }),

  detail: (id: number): Promise<MesTraceCode> =>
    request<MesTraceCode>({ method: 'GET', url: `${BASE}/codes/${id}` }),

  create: (data: MesTraceCodeSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/codes`, data }),

  update: (id: number, data: MesTraceCodeSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/codes/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/codes/${id}` }),
};

/* ---------------- 4. 追溯关联 ---------------- */

export const mesTraceLinkService = {
  page: (params: MesTraceLinkQuery): Promise<PageResult<MesTraceLink>> =>
    request<PageResult<MesTraceLink>>({ method: 'GET', url: `${BASE}/links`, params }),

  detail: (id: number): Promise<MesTraceLink> =>
    request<MesTraceLink>({ method: 'GET', url: `${BASE}/links/${id}` }),

  create: (data: MesTraceLinkSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/links`, data }),

  update: (id: number, data: MesTraceLinkSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/links/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/links/${id}` }),
};

/* ---------------- 5. 追溯记录 ---------------- */

export const mesTraceRecordService = {
  page: (params: MesTraceRecordQuery): Promise<PageResult<MesTraceRecord>> =>
    request<PageResult<MesTraceRecord>>({ method: 'GET', url: `${BASE}/records`, params }),

  detail: (id: number): Promise<MesTraceRecord> =>
    request<MesTraceRecord>({ method: 'GET', url: `${BASE}/records/${id}` }),

  create: (data: MesTraceRecordSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/records`, data }),

  update: (id: number, data: MesTraceRecordSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/records/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/records/${id}` }),
};
