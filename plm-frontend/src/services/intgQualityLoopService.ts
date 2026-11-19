import { request } from '@/services/request';
import type { PageResult } from '@/types/common';
import type {
  IntgQualityLoopInterface,
  IntgQualityLoopInterfaceQuery,
  IntgQualityLoopInterfaceSaveRequest,
  IntgQualityLoopMapping,
  IntgQualityLoopMappingQuery,
  IntgQualityLoopMappingSaveRequest,
  IntgQualityLoopBatch,
  IntgQualityLoopBatchQuery,
  IntgQualityLoopBatchSaveRequest,
  IntgQualityLoopReceipt,
  IntgQualityLoopReceiptQuery,
  IntgQualityLoopReceiptSaveRequest,
  IntgQualityLoopCompensation,
  IntgQualityLoopCompensationQuery,
  IntgQualityLoopCompensationSaveRequest,
  IntgQualityLoopReconcile,
  IntgQualityLoopReconcileQuery,
  IntgQualityLoopReconcileSaveRequest,
} from '@/types/intgQualityLoop';

/** G8-N12 六系统集成—质量闭环（T073，后端 Base: /intg/quality-loop）服务定义。 */

const BASE = '/intg/quality-loop';

/* ---------------- 1. 集成接口定义 ---------------- */

export const intgQualityLoopInterfaceService = {
  page: (params: IntgQualityLoopInterfaceQuery): Promise<PageResult<IntgQualityLoopInterface>> =>
    request<PageResult<IntgQualityLoopInterface>>({ method: 'GET', url: `${BASE}/interfaces`, params }),

  detail: (id: number): Promise<IntgQualityLoopInterface> =>
    request<IntgQualityLoopInterface>({ method: 'GET', url: `${BASE}/interfaces/${id}` }),

  create: (data: IntgQualityLoopInterfaceSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/interfaces`, data }),

  update: (id: number, data: IntgQualityLoopInterfaceSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/interfaces/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/interfaces/${id}` }),
};

/* ---------------- 2. 字段映射 ---------------- */

export const intgQualityLoopMappingService = {
  page: (params: IntgQualityLoopMappingQuery): Promise<PageResult<IntgQualityLoopMapping>> =>
    request<PageResult<IntgQualityLoopMapping>>({ method: 'GET', url: `${BASE}/mappings`, params }),

  detail: (id: number): Promise<IntgQualityLoopMapping> =>
    request<IntgQualityLoopMapping>({ method: 'GET', url: `${BASE}/mappings/${id}` }),

  create: (data: IntgQualityLoopMappingSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/mappings`, data }),

  update: (id: number, data: IntgQualityLoopMappingSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/mappings/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/mappings/${id}` }),
};

/* ---------------- 3. 同步批次 ---------------- */

export const intgQualityLoopBatchService = {
  page: (params: IntgQualityLoopBatchQuery): Promise<PageResult<IntgQualityLoopBatch>> =>
    request<PageResult<IntgQualityLoopBatch>>({ method: 'GET', url: `${BASE}/batches`, params }),

  detail: (id: number): Promise<IntgQualityLoopBatch> =>
    request<IntgQualityLoopBatch>({ method: 'GET', url: `${BASE}/batches/${id}` }),

  create: (data: IntgQualityLoopBatchSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/batches`, data }),

  update: (id: number, data: IntgQualityLoopBatchSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/batches/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/batches/${id}` }),
};

/* ---------------- 4. 系统接收回执 ---------------- */

export const intgQualityLoopReceiptService = {
  page: (params: IntgQualityLoopReceiptQuery): Promise<PageResult<IntgQualityLoopReceipt>> =>
    request<PageResult<IntgQualityLoopReceipt>>({ method: 'GET', url: `${BASE}/receipts`, params }),

  detail: (id: number): Promise<IntgQualityLoopReceipt> =>
    request<IntgQualityLoopReceipt>({ method: 'GET', url: `${BASE}/receipts/${id}` }),

  create: (data: IntgQualityLoopReceiptSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/receipts`, data }),

  update: (id: number, data: IntgQualityLoopReceiptSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/receipts/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/receipts/${id}` }),
};

/* ---------------- 5. 异常补偿 ---------------- */

export const intgQualityLoopCompensationService = {
  page: (params: IntgQualityLoopCompensationQuery): Promise<PageResult<IntgQualityLoopCompensation>> =>
    request<PageResult<IntgQualityLoopCompensation>>({ method: 'GET', url: `${BASE}/compensations`, params }),

  detail: (id: number): Promise<IntgQualityLoopCompensation> =>
    request<IntgQualityLoopCompensation>({ method: 'GET', url: `${BASE}/compensations/${id}` }),

  create: (data: IntgQualityLoopCompensationSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/compensations`, data }),

  update: (id: number, data: IntgQualityLoopCompensationSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/compensations/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/compensations/${id}` }),
};

/* ---------------- 6. 对账 ---------------- */

export const intgQualityLoopReconcileService = {
  page: (params: IntgQualityLoopReconcileQuery): Promise<PageResult<IntgQualityLoopReconcile>> =>
    request<PageResult<IntgQualityLoopReconcile>>({ method: 'GET', url: `${BASE}/reconciles`, params }),

  detail: (id: number): Promise<IntgQualityLoopReconcile> =>
    request<IntgQualityLoopReconcile>({ method: 'GET', url: `${BASE}/reconciles/${id}` }),

  create: (data: IntgQualityLoopReconcileSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/reconciles`, data }),

  update: (id: number, data: IntgQualityLoopReconcileSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/reconciles/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/reconciles/${id}` }),
};
