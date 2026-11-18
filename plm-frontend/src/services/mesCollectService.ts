import { request } from '@/services/request';
import type { PageResult } from '@/types/common';
import type {
  MesCollectDevice,
  MesCollectDeviceQuery,
  MesCollectDeviceSaveRequest,
  MesCollectInterface,
  MesCollectInterfaceQuery,
  MesCollectInterfaceSaveRequest,
  MesCollectPoint,
  MesCollectPointQuery,
  MesCollectPointSaveRequest,
  MesCollectRule,
  MesCollectRuleQuery,
  MesCollectRuleSaveRequest,
  MesCollectRecord,
  MesCollectRecordQuery,
  MesCollectRecordSaveRequest,
} from '@/types/mesCollect';

/** G6-N8 MES 数据采集（T044，后端 Base: /mes/collect）服务定义。 */

const BASE = '/mes/collect';

/* ---------------- 1. 采集设备 ---------------- */

export const mesCollectDeviceService = {
  page: (params: MesCollectDeviceQuery): Promise<PageResult<MesCollectDevice>> =>
    request<PageResult<MesCollectDevice>>({ method: 'GET', url: `${BASE}/devices`, params }),

  detail: (id: number): Promise<MesCollectDevice> =>
    request<MesCollectDevice>({ method: 'GET', url: `${BASE}/devices/${id}` }),

  create: (data: MesCollectDeviceSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/devices`, data }),

  update: (id: number, data: MesCollectDeviceSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/devices/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/devices/${id}` }),
};

/* ---------------- 2. 采集接口 ---------------- */

export const mesCollectInterfaceService = {
  page: (params: MesCollectInterfaceQuery): Promise<PageResult<MesCollectInterface>> =>
    request<PageResult<MesCollectInterface>>({ method: 'GET', url: `${BASE}/interfaces`, params }),

  detail: (id: number): Promise<MesCollectInterface> =>
    request<MesCollectInterface>({ method: 'GET', url: `${BASE}/interfaces/${id}` }),

  create: (data: MesCollectInterfaceSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/interfaces`, data }),

  update: (id: number, data: MesCollectInterfaceSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/interfaces/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/interfaces/${id}` }),
};

/* ---------------- 3. 采集数据点 ---------------- */

export const mesCollectPointService = {
  page: (params: MesCollectPointQuery): Promise<PageResult<MesCollectPoint>> =>
    request<PageResult<MesCollectPoint>>({ method: 'GET', url: `${BASE}/points`, params }),

  detail: (id: number): Promise<MesCollectPoint> =>
    request<MesCollectPoint>({ method: 'GET', url: `${BASE}/points/${id}` }),

  create: (data: MesCollectPointSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/points`, data }),

  update: (id: number, data: MesCollectPointSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/points/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/points/${id}` }),
};

/* ---------------- 4. 校验规则 ---------------- */

export const mesCollectRuleService = {
  page: (params: MesCollectRuleQuery): Promise<PageResult<MesCollectRule>> =>
    request<PageResult<MesCollectRule>>({ method: 'GET', url: `${BASE}/rules`, params }),

  detail: (id: number): Promise<MesCollectRule> =>
    request<MesCollectRule>({ method: 'GET', url: `${BASE}/rules/${id}` }),

  create: (data: MesCollectRuleSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/rules`, data }),

  update: (id: number, data: MesCollectRuleSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/rules/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/rules/${id}` }),
};

/* ---------------- 5. 采集数据 ---------------- */

export const mesCollectRecordService = {
  page: (params: MesCollectRecordQuery): Promise<PageResult<MesCollectRecord>> =>
    request<PageResult<MesCollectRecord>>({ method: 'GET', url: `${BASE}/records`, params }),

  detail: (id: number): Promise<MesCollectRecord> =>
    request<MesCollectRecord>({ method: 'GET', url: `${BASE}/records/${id}` }),

  create: (data: MesCollectRecordSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/records`, data }),

  update: (id: number, data: MesCollectRecordSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/records/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/records/${id}` }),
};
