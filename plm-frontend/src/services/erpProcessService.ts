import { request } from '@/services/request';
import type { PageResult } from '@/types/common';
import type {
  ErpProcessLabor,
  ErpProcessLaborQuery,
  ErpProcessLaborSaveRequest,
  ErpProcessPlan,
  ErpProcessPlanQuery,
  ErpProcessPlanSaveRequest,
  ErpProcessReport,
  ErpProcessReportQuery,
  ErpProcessReportSaveRequest,
  ErpProcessResource,
  ErpProcessResourceQuery,
  ErpProcessResourceSaveRequest,
  ErpProcessRoute,
  ErpProcessRouteQuery,
  ErpProcessRouteSaveRequest,
  ErpProcessStandard,
  ErpProcessStandardQuery,
  ErpProcessStandardSaveRequest,
} from '@/types/erpProcess';

/** G3-N7b ERP 工艺资源（T098，后端 Base: /erp/process）服务定义。 */

const BASE = '/erp/process';

/* ---------------- 1. 资源资料 ---------------- */

export const erpProcessResourceService = {
  page: (params: ErpProcessResourceQuery): Promise<PageResult<ErpProcessResource>> =>
    request<PageResult<ErpProcessResource>>({ method: 'GET', url: `${BASE}/resources`, params }),

  detail: (id: number): Promise<ErpProcessResource> =>
    request<ErpProcessResource>({ method: 'GET', url: `${BASE}/resources/${id}` }),

  create: (data: ErpProcessResourceSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/resources`, data }),

  update: (id: number, data: ErpProcessResourceSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/resources/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/resources/${id}` }),
};

/* ---------------- 2. 标准工艺 ---------------- */

export const erpProcessStandardService = {
  page: (params: ErpProcessStandardQuery): Promise<PageResult<ErpProcessStandard>> =>
    request<PageResult<ErpProcessStandard>>({ method: 'GET', url: `${BASE}/standards`, params }),

  detail: (id: number): Promise<ErpProcessStandard> =>
    request<ErpProcessStandard>({ method: 'GET', url: `${BASE}/standards/${id}` }),

  create: (data: ErpProcessStandardSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/standards`, data }),

  update: (id: number, data: ErpProcessStandardSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/standards/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/standards/${id}` }),
};

/* ---------------- 3. 工艺路线 ---------------- */

export const erpProcessRouteService = {
  page: (params: ErpProcessRouteQuery): Promise<PageResult<ErpProcessRoute>> =>
    request<PageResult<ErpProcessRoute>>({ method: 'GET', url: `${BASE}/routes`, params }),

  detail: (id: number): Promise<ErpProcessRoute> =>
    request<ErpProcessRoute>({ method: 'GET', url: `${BASE}/routes/${id}` }),

  create: (data: ErpProcessRouteSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/routes`, data }),

  update: (id: number, data: ErpProcessRouteSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/routes/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/routes/${id}` }),
};

/* ---------------- 4. 工序计划 ---------------- */

export const erpProcessPlanService = {
  page: (params: ErpProcessPlanQuery): Promise<PageResult<ErpProcessPlan>> =>
    request<PageResult<ErpProcessPlan>>({ method: 'GET', url: `${BASE}/plans`, params }),

  detail: (id: number): Promise<ErpProcessPlan> =>
    request<ErpProcessPlan>({ method: 'GET', url: `${BASE}/plans/${id}` }),

  create: (data: ErpProcessPlanSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/plans`, data }),

  update: (id: number, data: ErpProcessPlanSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/plans/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/plans/${id}` }),
};

/* ---------------- 5. 工序报工 ---------------- */

export const erpProcessReportService = {
  page: (params: ErpProcessReportQuery): Promise<PageResult<ErpProcessReport>> =>
    request<PageResult<ErpProcessReport>>({ method: 'GET', url: `${BASE}/reports`, params }),

  detail: (id: number): Promise<ErpProcessReport> =>
    request<ErpProcessReport>({ method: 'GET', url: `${BASE}/reports/${id}` }),

  create: (data: ErpProcessReportSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/reports`, data }),

  update: (id: number, data: ErpProcessReportSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/reports/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/reports/${id}` }),
};

/* ---------------- 6. 工时反馈 ---------------- */

export const erpProcessLaborService = {
  page: (params: ErpProcessLaborQuery): Promise<PageResult<ErpProcessLabor>> =>
    request<PageResult<ErpProcessLabor>>({ method: 'GET', url: `${BASE}/labor-feedback`, params }),

  detail: (id: number): Promise<ErpProcessLabor> =>
    request<ErpProcessLabor>({ method: 'GET', url: `${BASE}/labor-feedback/${id}` }),

  create: (data: ErpProcessLaborSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/labor-feedback`, data }),

  update: (id: number, data: ErpProcessLaborSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/labor-feedback/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/labor-feedback/${id}` }),
};
