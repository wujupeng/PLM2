import { request } from '@/services/request';
import type { PageResult } from '@/types/common';
import type {
  IntgLabelTraceInterface,
  IntgLabelTraceInterfaceQuery,
  IntgLabelTraceInterfaceSaveRequest,
  IntgLabelTraceMapping,
  IntgLabelTraceMappingQuery,
  IntgLabelTraceMappingSaveRequest,
  IntgLabelTraceBatch,
  IntgLabelTraceBatchQuery,
  IntgLabelTraceBatchSaveRequest,
  IntgLabelTraceReceipt,
  IntgLabelTraceReceiptQuery,
  IntgLabelTraceReceiptSaveRequest,
  IntgLabelTraceCompensation,
  IntgLabelTraceCompensationQuery,
  IntgLabelTraceCompensationSaveRequest,
  IntgLabelTraceReconcile,
  IntgLabelTraceReconcileQuery,
  IntgLabelTraceReconcileSaveRequest,
} from '@/types/intgLabelTrace';

/** G8-N13 六系统集成—标签追溯（T074，后端 Base: /intg/label-trace）服务定义。 */

const BASE = '/intg/label-trace';

/* ---------------- 1. 集成接口定义 ---------------- */

export const intgLabelTraceInterfaceService = {
  page: (params: IntgLabelTraceInterfaceQuery): Promise<PageResult<IntgLabelTraceInterface>> =>
    request<PageResult<IntgLabelTraceInterface>>({ method: 'GET', url: `${BASE}/interfaces`, params }),

  detail: (id: number): Promise<IntgLabelTraceInterface> =>
    request<IntgLabelTraceInterface>({ method: 'GET', url: `${BASE}/interfaces/${id}` }),

  create: (data: IntgLabelTraceInterfaceSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/interfaces`, data }),

  update: (id: number, data: IntgLabelTraceInterfaceSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/interfaces/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/interfaces/${id}` }),
};

/* ---------------- 2. 字段映射 ---------------- */

export const intgLabelTraceMappingService = {
  page: (params: IntgLabelTraceMappingQuery): Promise<PageResult<IntgLabelTraceMapping>> =>
    request<PageResult<IntgLabelTraceMapping>>({ method: 'GET', url: `${BASE}/mappings`, params }),

  detail: (id: number): Promise<IntgLabelTraceMapping> =>
    request<IntgLabelTraceMapping>({ method: 'GET', url: `${BASE}/mappings/${id}` }),

  create: (data: IntgLabelTraceMappingSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/mappings`, data }),

  update: (id: number, data: IntgLabelTraceMappingSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/mappings/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/mappings/${id}` }),
};

/* ---------------- 3. 同步批次 ---------------- */

export const intgLabelTraceBatchService = {
  page: (params: IntgLabelTraceBatchQuery): Promise<PageResult<IntgLabelTraceBatch>> =>
    request<PageResult<IntgLabelTraceBatch>>({ method: 'GET', url: `${BASE}/batches`, params }),

  detail: (id: number): Promise<IntgLabelTraceBatch> =>
    request<IntgLabelTraceBatch>({ method: 'GET', url: `${BASE}/batches/${id}` }),

  create: (data: IntgLabelTraceBatchSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/batches`, data }),

  update: (id: number, data: IntgLabelTraceBatchSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/batches/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/batches/${id}` }),
};

/* ---------------- 4. 系统接收回执 ---------------- */

export const intgLabelTraceReceiptService = {
  page: (params: IntgLabelTraceReceiptQuery): Promise<PageResult<IntgLabelTraceReceipt>> =>
    request<PageResult<IntgLabelTraceReceipt>>({ method: 'GET', url: `${BASE}/receipts`, params }),

  detail: (id: number): Promise<IntgLabelTraceReceipt> =>
    request<IntgLabelTraceReceipt>({ method: 'GET', url: `${BASE}/receipts/${id}` }),

  create: (data: IntgLabelTraceReceiptSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/receipts`, data }),

  update: (id: number, data: IntgLabelTraceReceiptSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/receipts/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/receipts/${id}` }),
};

/* ---------------- 5. 异常补偿 ---------------- */

export const intgLabelTraceCompensationService = {
  page: (params: IntgLabelTraceCompensationQuery): Promise<PageResult<IntgLabelTraceCompensation>> =>
    request<PageResult<IntgLabelTraceCompensation>>({ method: 'GET', url: `${BASE}/compensations`, params }),

  detail: (id: number): Promise<IntgLabelTraceCompensation> =>
    request<IntgLabelTraceCompensation>({ method: 'GET', url: `${BASE}/compensations/${id}` }),

  create: (data: IntgLabelTraceCompensationSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/compensations`, data }),

  update: (id: number, data: IntgLabelTraceCompensationSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/compensations/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/compensations/${id}` }),
};

/* ---------------- 6. 对账 ---------------- */

export const intgLabelTraceReconcileService = {
  page: (params: IntgLabelTraceReconcileQuery): Promise<PageResult<IntgLabelTraceReconcile>> =>
    request<PageResult<IntgLabelTraceReconcile>>({ method: 'GET', url: `${BASE}/reconciles`, params }),

  detail: (id: number): Promise<IntgLabelTraceReconcile> =>
    request<IntgLabelTraceReconcile>({ method: 'GET', url: `${BASE}/reconciles/${id}` }),

  create: (data: IntgLabelTraceReconcileSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/reconciles`, data }),

  update: (id: number, data: IntgLabelTraceReconcileSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/reconciles/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/reconciles/${id}` }),
};
