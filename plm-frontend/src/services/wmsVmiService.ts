import { request } from '@/services/request';
import type { PageResult } from '@/types/common';
import type {
  WmsVmiBin,
  WmsVmiBinQuery,
  WmsVmiBinSaveRequest,
  WmsVmiScan,
  WmsVmiScanQuery,
  WmsVmiScanSaveRequest,
  WmsVmiWarning,
  WmsVmiWarningQuery,
  WmsVmiWarningSaveRequest,
} from '@/types/wmsVmi';

/** G5-N8 WMS VMI管理（T052，后端 Base: /wms/vmi）服务定义。 */

const BASE = '/wms/vmi';

/* ---------------- 1. VMI 库位 ---------------- */

export const wmsVmiBinService = {
  page: (params: WmsVmiBinQuery): Promise<PageResult<WmsVmiBin>> =>
    request<PageResult<WmsVmiBin>>({ method: 'GET', url: `${BASE}/bins`, params }),

  detail: (id: number): Promise<WmsVmiBin> =>
    request<WmsVmiBin>({ method: 'GET', url: `${BASE}/bins/${id}` }),

  create: (data: WmsVmiBinSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/bins`, data }),

  update: (id: number, data: WmsVmiBinSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/bins/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/bins/${id}` }),
};

/* ---------------- 2. VMI 扫码收发 ---------------- */

export const wmsVmiScanService = {
  page: (params: WmsVmiScanQuery): Promise<PageResult<WmsVmiScan>> =>
    request<PageResult<WmsVmiScan>>({ method: 'GET', url: `${BASE}/scans`, params }),

  detail: (id: number): Promise<WmsVmiScan> =>
    request<WmsVmiScan>({ method: 'GET', url: `${BASE}/scans/${id}` }),

  create: (data: WmsVmiScanSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/scans`, data }),

  update: (id: number, data: WmsVmiScanSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/scans/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/scans/${id}` }),
};

/* ---------------- 3. VMI 超容量预警 ---------------- */

export const wmsVmiWarningService = {
  page: (params: WmsVmiWarningQuery): Promise<PageResult<WmsVmiWarning>> =>
    request<PageResult<WmsVmiWarning>>({ method: 'GET', url: `${BASE}/warnings`, params }),

  detail: (id: number): Promise<WmsVmiWarning> =>
    request<WmsVmiWarning>({ method: 'GET', url: `${BASE}/warnings/${id}` }),

  create: (data: WmsVmiWarningSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/warnings`, data }),

  update: (id: number, data: WmsVmiWarningSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/warnings/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/warnings/${id}` }),
};
