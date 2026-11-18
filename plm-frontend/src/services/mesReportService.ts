import { request } from '@/services/request';
import type { PageResult } from '@/types/common';
import type {
  MesWorkReport,
  MesWorkReportQuery,
  MesWorkReportSaveRequest,
  MesMaterialReplenish,
  MesMaterialReplenishQuery,
  MesMaterialReplenishSaveRequest,
  MesLaborHour,
  MesLaborHourQuery,
  MesLaborHourSaveRequest,
} from '@/types/mesReport';

/** G6-N3 MES 工序报工（T039，后端 Base: /mes/report）服务定义。 */

const BASE = '/mes/report';

/* ---------------- 1. 工序报工单 ---------------- */

export const mesWorkReportService = {
  page: (params: MesWorkReportQuery): Promise<PageResult<MesWorkReport>> =>
    request<PageResult<MesWorkReport>>({ method: 'GET', url: `${BASE}/works`, params }),

  detail: (id: number): Promise<MesWorkReport> =>
    request<MesWorkReport>({ method: 'GET', url: `${BASE}/works/${id}` }),

  create: (data: MesWorkReportSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/works`, data }),

  update: (id: number, data: MesWorkReportSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/works/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/works/${id}` }),
};

/* ---------------- 2. 补料记录 ---------------- */

export const mesMaterialReplenishService = {
  page: (params: MesMaterialReplenishQuery): Promise<PageResult<MesMaterialReplenish>> =>
    request<PageResult<MesMaterialReplenish>>({ method: 'GET', url: `${BASE}/replenishes`, params }),

  detail: (id: number): Promise<MesMaterialReplenish> =>
    request<MesMaterialReplenish>({ method: 'GET', url: `${BASE}/replenishes/${id}` }),

  create: (data: MesMaterialReplenishSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/replenishes`, data }),

  update: (id: number, data: MesMaterialReplenishSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/replenishes/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/replenishes/${id}` }),
};

/* ---------------- 3. 工时记录 ---------------- */

export const mesLaborHourService = {
  page: (params: MesLaborHourQuery): Promise<PageResult<MesLaborHour>> =>
    request<PageResult<MesLaborHour>>({ method: 'GET', url: `${BASE}/labors`, params }),

  detail: (id: number): Promise<MesLaborHour> =>
    request<MesLaborHour>({ method: 'GET', url: `${BASE}/labors/${id}` }),

  create: (data: MesLaborHourSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/labors`, data }),

  update: (id: number, data: MesLaborHourSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/labors/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/labors/${id}` }),
};
