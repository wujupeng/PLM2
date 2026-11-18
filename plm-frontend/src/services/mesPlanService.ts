import { request } from '@/services/request';
import type { PageResult } from '@/types/common';
import type {
  MesProdOrder,
  MesProdOrderQuery,
  MesProdOrderSaveRequest,
  MesSchedule,
  MesScheduleQuery,
  MesScheduleSaveRequest,
  MesDispatch,
  MesDispatchQuery,
  MesDispatchSaveRequest,
} from '@/types/mesPlan';

/** G6-N1 MES 生产计划执行（T037，后端 Base: /mes/plan）服务定义。 */

const BASE = '/mes/plan';

/* ---------------- 1. 生产工单 ---------------- */

export const mesProdOrderService = {
  page: (params: MesProdOrderQuery): Promise<PageResult<MesProdOrder>> =>
    request<PageResult<MesProdOrder>>({ method: 'GET', url: `${BASE}/orders`, params }),

  detail: (id: number): Promise<MesProdOrder> =>
    request<MesProdOrder>({ method: 'GET', url: `${BASE}/orders/${id}` }),

  create: (data: MesProdOrderSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/orders`, data }),

  update: (id: number, data: MesProdOrderSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/orders/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/orders/${id}` }),
};

/* ---------------- 2. 排产计划 ---------------- */

export const mesScheduleService = {
  page: (params: MesScheduleQuery): Promise<PageResult<MesSchedule>> =>
    request<PageResult<MesSchedule>>({ method: 'GET', url: `${BASE}/schedules`, params }),

  detail: (id: number): Promise<MesSchedule> =>
    request<MesSchedule>({ method: 'GET', url: `${BASE}/schedules/${id}` }),

  create: (data: MesScheduleSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/schedules`, data }),

  update: (id: number, data: MesScheduleSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/schedules/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/schedules/${id}` }),
};

/* ---------------- 3. 派工任务 ---------------- */

export const mesDispatchService = {
  page: (params: MesDispatchQuery): Promise<PageResult<MesDispatch>> =>
    request<PageResult<MesDispatch>>({ method: 'GET', url: `${BASE}/dispatches`, params }),

  detail: (id: number): Promise<MesDispatch> =>
    request<MesDispatch>({ method: 'GET', url: `${BASE}/dispatches/${id}` }),

  create: (data: MesDispatchSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/dispatches`, data }),

  update: (id: number, data: MesDispatchSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/dispatches/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/dispatches/${id}` }),
};
