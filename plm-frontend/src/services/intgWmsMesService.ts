import { request } from '@/services/request';
import type { PageResult } from '@/types/common';
import type {
  IntgWmsMesInterface,
  IntgWmsMesInterfaceQuery,
  IntgWmsMesInterfaceSaveRequest,
  IntgWmsMesMapping,
  IntgWmsMesMappingQuery,
  IntgWmsMesMappingSaveRequest,
  IntgWmsMesBatch,
  IntgWmsMesBatchQuery,
  IntgWmsMesBatchSaveRequest,
  IntgWmsMesReceipt,
  IntgWmsMesReceiptQuery,
  IntgWmsMesReceiptSaveRequest,
  IntgWmsMesCompensation,
  IntgWmsMesCompensationQuery,
  IntgWmsMesCompensationSaveRequest,
  IntgWmsMesReconcile,
  IntgWmsMesReconcileQuery,
  IntgWmsMesReconcileSaveRequest,
} from '@/types/intgWmsMes';

/** G8-N9 六系统集成—WMS↔MES（T070，后端 Base: /intg/wms-mes）服务定义。 */

const BASE = '/intg/wms-mes';

/* ---------------- 1. 集成接口定义 ---------------- */

export const intgWmsMesInterfaceService = {
  page: (params: IntgWmsMesInterfaceQuery): Promise<PageResult<IntgWmsMesInterface>> =>
    request<PageResult<IntgWmsMesInterface>>({ method: 'GET', url: `${BASE}/interfaces`, params }),

  detail: (id: number): Promise<IntgWmsMesInterface> =>
    request<IntgWmsMesInterface>({ method: 'GET', url: `${BASE}/interfaces/${id}` }),

  create: (data: IntgWmsMesInterfaceSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/interfaces`, data }),

  update: (id: number, data: IntgWmsMesInterfaceSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/interfaces/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/interfaces/${id}` }),
};

/* ---------------- 2. 字段映射 ---------------- */

export const intgWmsMesMappingService = {
  page: (params: IntgWmsMesMappingQuery): Promise<PageResult<IntgWmsMesMapping>> =>
    request<PageResult<IntgWmsMesMapping>>({ method: 'GET', url: `${BASE}/mappings`, params }),

  detail: (id: number): Promise<IntgWmsMesMapping> =>
    request<IntgWmsMesMapping>({ method: 'GET', url: `${BASE}/mappings/${id}` }),

  create: (data: IntgWmsMesMappingSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/mappings`, data }),

  update: (id: number, data: IntgWmsMesMappingSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/mappings/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/mappings/${id}` }),
};

/* ---------------- 3. 同步批次 ---------------- */

export const intgWmsMesBatchService = {
  page: (params: IntgWmsMesBatchQuery): Promise<PageResult<IntgWmsMesBatch>> =>
    request<PageResult<IntgWmsMesBatch>>({ method: 'GET', url: `${BASE}/batches`, params }),

  detail: (id: number): Promise<IntgWmsMesBatch> =>
    request<IntgWmsMesBatch>({ method: 'GET', url: `${BASE}/batches/${id}` }),

  create: (data: IntgWmsMesBatchSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/batches`, data }),

  update: (id: number, data: IntgWmsMesBatchSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/batches/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/batches/${id}` }),
};

/* ---------------- 4. MES 接收回执 ---------------- */

export const intgWmsMesReceiptService = {
  page: (params: IntgWmsMesReceiptQuery): Promise<PageResult<IntgWmsMesReceipt>> =>
    request<PageResult<IntgWmsMesReceipt>>({ method: 'GET', url: `${BASE}/receipts`, params }),

  detail: (id: number): Promise<IntgWmsMesReceipt> =>
    request<IntgWmsMesReceipt>({ method: 'GET', url: `${BASE}/receipts/${id}` }),

  create: (data: IntgWmsMesReceiptSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/receipts`, data }),

  update: (id: number, data: IntgWmsMesReceiptSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/receipts/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/receipts/${id}` }),
};

/* ---------------- 5. 异常补偿 ---------------- */

export const intgWmsMesCompensationService = {
  page: (params: IntgWmsMesCompensationQuery): Promise<PageResult<IntgWmsMesCompensation>> =>
    request<PageResult<IntgWmsMesCompensation>>({ method: 'GET', url: `${BASE}/compensations`, params }),

  detail: (id: number): Promise<IntgWmsMesCompensation> =>
    request<IntgWmsMesCompensation>({ method: 'GET', url: `${BASE}/compensations/${id}` }),

  create: (data: IntgWmsMesCompensationSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/compensations`, data }),

  update: (id: number, data: IntgWmsMesCompensationSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/compensations/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/compensations/${id}` }),
};

/* ---------------- 6. 对账 ---------------- */

export const intgWmsMesReconcileService = {
  page: (params: IntgWmsMesReconcileQuery): Promise<PageResult<IntgWmsMesReconcile>> =>
    request<PageResult<IntgWmsMesReconcile>>({ method: 'GET', url: `${BASE}/reconciles`, params }),

  detail: (id: number): Promise<IntgWmsMesReconcile> =>
    request<IntgWmsMesReconcile>({ method: 'GET', url: `${BASE}/reconciles/${id}` }),

  create: (data: IntgWmsMesReconcileSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/reconciles`, data }),

  update: (id: number, data: IntgWmsMesReconcileSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/reconciles/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/reconciles/${id}` }),
};
