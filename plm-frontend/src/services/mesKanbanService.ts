import { request } from '@/services/request';
import type { PageResult } from '@/types/common';
import type {
  MesKanbanPlan,
  MesKanbanPlanQuery,
  MesKanbanPlanSaveRequest,
  MesKanbanOutput,
  MesKanbanOutputQuery,
  MesKanbanOutputSaveRequest,
  MesKanbanYield,
  MesKanbanYieldQuery,
  MesKanbanYieldSaveRequest,
  MesKanbanDowntime,
  MesKanbanDowntimeQuery,
  MesKanbanDowntimeSaveRequest,
  MesKanbanWip,
  MesKanbanWipQuery,
  MesKanbanWipSaveRequest,
  MesKanbanAndon,
  MesKanbanAndonQuery,
  MesKanbanAndonSaveRequest,
} from '@/types/mesKanban';

/** G6-N7 MES 生产看板（T043，后端 Base: /mes/kanban）服务定义。 */

const BASE = '/mes/kanban';

/* ---------------- 1. 计划达成 ---------------- */

export const mesKanbanPlanService = {
  page: (params: MesKanbanPlanQuery): Promise<PageResult<MesKanbanPlan>> =>
    request<PageResult<MesKanbanPlan>>({ method: 'GET', url: `${BASE}/plans`, params }),

  detail: (id: number): Promise<MesKanbanPlan> =>
    request<MesKanbanPlan>({ method: 'GET', url: `${BASE}/plans/${id}` }),

  create: (data: MesKanbanPlanSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/plans`, data }),

  update: (id: number, data: MesKanbanPlanSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/plans/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/plans/${id}` }),
};

/* ---------------- 2. 产量看板 ---------------- */

export const mesKanbanOutputService = {
  page: (params: MesKanbanOutputQuery): Promise<PageResult<MesKanbanOutput>> =>
    request<PageResult<MesKanbanOutput>>({ method: 'GET', url: `${BASE}/outputs`, params }),

  detail: (id: number): Promise<MesKanbanOutput> =>
    request<MesKanbanOutput>({ method: 'GET', url: `${BASE}/outputs/${id}` }),

  create: (data: MesKanbanOutputSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/outputs`, data }),

  update: (id: number, data: MesKanbanOutputSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/outputs/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/outputs/${id}` }),
};

/* ---------------- 3. 良率看板 ---------------- */

export const mesKanbanYieldService = {
  page: (params: MesKanbanYieldQuery): Promise<PageResult<MesKanbanYield>> =>
    request<PageResult<MesKanbanYield>>({ method: 'GET', url: `${BASE}/yields`, params }),

  detail: (id: number): Promise<MesKanbanYield> =>
    request<MesKanbanYield>({ method: 'GET', url: `${BASE}/yields/${id}` }),

  create: (data: MesKanbanYieldSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/yields`, data }),

  update: (id: number, data: MesKanbanYieldSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/yields/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/yields/${id}` }),
};

/* ---------------- 4. 停机看板 ---------------- */

export const mesKanbanDowntimeService = {
  page: (params: MesKanbanDowntimeQuery): Promise<PageResult<MesKanbanDowntime>> =>
    request<PageResult<MesKanbanDowntime>>({ method: 'GET', url: `${BASE}/downtimes`, params }),

  detail: (id: number): Promise<MesKanbanDowntime> =>
    request<MesKanbanDowntime>({ method: 'GET', url: `${BASE}/downtimes/${id}` }),

  create: (data: MesKanbanDowntimeSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/downtimes`, data }),

  update: (id: number, data: MesKanbanDowntimeSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/downtimes/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/downtimes/${id}` }),
};

/* ---------------- 5. 在制品看板 ---------------- */

export const mesKanbanWipService = {
  page: (params: MesKanbanWipQuery): Promise<PageResult<MesKanbanWip>> =>
    request<PageResult<MesKanbanWip>>({ method: 'GET', url: `${BASE}/wips`, params }),

  detail: (id: number): Promise<MesKanbanWip> =>
    request<MesKanbanWip>({ method: 'GET', url: `${BASE}/wips/${id}` }),

  create: (data: MesKanbanWipSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/wips`, data }),

  update: (id: number, data: MesKanbanWipSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/wips/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/wips/${id}` }),
};

/* ---------------- 6. 异常安灯 ---------------- */

export const mesKanbanAndonService = {
  page: (params: MesKanbanAndonQuery): Promise<PageResult<MesKanbanAndon>> =>
    request<PageResult<MesKanbanAndon>>({ method: 'GET', url: `${BASE}/andons`, params }),

  detail: (id: number): Promise<MesKanbanAndon> =>
    request<MesKanbanAndon>({ method: 'GET', url: `${BASE}/andons/${id}` }),

  create: (data: MesKanbanAndonSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/andons`, data }),

  update: (id: number, data: MesKanbanAndonSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/andons/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/andons/${id}` }),
};
