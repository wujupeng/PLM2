import { request } from '@/services/request';
import type { PageResult } from '@/types/common';
import type {
  IntgOaSystemsInterface,
  IntgOaSystemsInterfaceQuery,
  IntgOaSystemsInterfaceSaveRequest,
  IntgOaSystemsMapping,
  IntgOaSystemsMappingQuery,
  IntgOaSystemsMappingSaveRequest,
  IntgOaSystemsBatch,
  IntgOaSystemsBatchQuery,
  IntgOaSystemsBatchSaveRequest,
  IntgOaSystemsReceipt,
  IntgOaSystemsReceiptQuery,
  IntgOaSystemsReceiptSaveRequest,
  IntgOaSystemsCompensation,
  IntgOaSystemsCompensationQuery,
  IntgOaSystemsCompensationSaveRequest,
  IntgOaSystemsReconcile,
  IntgOaSystemsReconcileQuery,
  IntgOaSystemsReconcileSaveRequest,
} from '@/types/intgOaSystems';

/** G8-N10 六系统集成—OA↔六系统（T071，后端 Base: /intg/oa-systems）服务定义。 */

const BASE = '/intg/oa-systems';

/* ---------------- 1. 集成接口定义 ---------------- */

export const intgOaSystemsInterfaceService = {
  page: (params: IntgOaSystemsInterfaceQuery): Promise<PageResult<IntgOaSystemsInterface>> =>
    request<PageResult<IntgOaSystemsInterface>>({ method: 'GET', url: `${BASE}/interfaces`, params }),

  detail: (id: number): Promise<IntgOaSystemsInterface> =>
    request<IntgOaSystemsInterface>({ method: 'GET', url: `${BASE}/interfaces/${id}` }),

  create: (data: IntgOaSystemsInterfaceSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/interfaces`, data }),

  update: (id: number, data: IntgOaSystemsInterfaceSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/interfaces/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/interfaces/${id}` }),
};

/* ---------------- 2. 字段映射 ---------------- */

export const intgOaSystemsMappingService = {
  page: (params: IntgOaSystemsMappingQuery): Promise<PageResult<IntgOaSystemsMapping>> =>
    request<PageResult<IntgOaSystemsMapping>>({ method: 'GET', url: `${BASE}/mappings`, params }),

  detail: (id: number): Promise<IntgOaSystemsMapping> =>
    request<IntgOaSystemsMapping>({ method: 'GET', url: `${BASE}/mappings/${id}` }),

  create: (data: IntgOaSystemsMappingSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/mappings`, data }),

  update: (id: number, data: IntgOaSystemsMappingSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/mappings/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/mappings/${id}` }),
};

/* ---------------- 3. 同步批次 ---------------- */

export const intgOaSystemsBatchService = {
  page: (params: IntgOaSystemsBatchQuery): Promise<PageResult<IntgOaSystemsBatch>> =>
    request<PageResult<IntgOaSystemsBatch>>({ method: 'GET', url: `${BASE}/batches`, params }),

  detail: (id: number): Promise<IntgOaSystemsBatch> =>
    request<IntgOaSystemsBatch>({ method: 'GET', url: `${BASE}/batches/${id}` }),

  create: (data: IntgOaSystemsBatchSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/batches`, data }),

  update: (id: number, data: IntgOaSystemsBatchSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/batches/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/batches/${id}` }),
};

/* ---------------- 4. 系统接收回执 ---------------- */

export const intgOaSystemsReceiptService = {
  page: (params: IntgOaSystemsReceiptQuery): Promise<PageResult<IntgOaSystemsReceipt>> =>
    request<PageResult<IntgOaSystemsReceipt>>({ method: 'GET', url: `${BASE}/receipts`, params }),

  detail: (id: number): Promise<IntgOaSystemsReceipt> =>
    request<IntgOaSystemsReceipt>({ method: 'GET', url: `${BASE}/receipts/${id}` }),

  create: (data: IntgOaSystemsReceiptSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/receipts`, data }),

  update: (id: number, data: IntgOaSystemsReceiptSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/receipts/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/receipts/${id}` }),
};

/* ---------------- 5. 异常补偿 ---------------- */

export const intgOaSystemsCompensationService = {
  page: (params: IntgOaSystemsCompensationQuery): Promise<PageResult<IntgOaSystemsCompensation>> =>
    request<PageResult<IntgOaSystemsCompensation>>({ method: 'GET', url: `${BASE}/compensations`, params }),

  detail: (id: number): Promise<IntgOaSystemsCompensation> =>
    request<IntgOaSystemsCompensation>({ method: 'GET', url: `${BASE}/compensations/${id}` }),

  create: (data: IntgOaSystemsCompensationSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/compensations`, data }),

  update: (id: number, data: IntgOaSystemsCompensationSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/compensations/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/compensations/${id}` }),
};

/* ---------------- 6. 对账 ---------------- */

export const intgOaSystemsReconcileService = {
  page: (params: IntgOaSystemsReconcileQuery): Promise<PageResult<IntgOaSystemsReconcile>> =>
    request<PageResult<IntgOaSystemsReconcile>>({ method: 'GET', url: `${BASE}/reconciles`, params }),

  detail: (id: number): Promise<IntgOaSystemsReconcile> =>
    request<IntgOaSystemsReconcile>({ method: 'GET', url: `${BASE}/reconciles/${id}` }),

  create: (data: IntgOaSystemsReconcileSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/reconciles`, data }),

  update: (id: number, data: IntgOaSystemsReconcileSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/reconciles/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/reconciles/${id}` }),
};
