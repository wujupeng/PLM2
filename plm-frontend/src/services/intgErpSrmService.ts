import { request } from '@/services/request';
import type { PageResult } from '@/types/common';
import type {
  IntgErpSrmInterface,
  IntgErpSrmInterfaceQuery,
  IntgErpSrmInterfaceSaveRequest,
  IntgErpSrmMapping,
  IntgErpSrmMappingQuery,
  IntgErpSrmMappingSaveRequest,
  IntgErpSrmBatch,
  IntgErpSrmBatchQuery,
  IntgErpSrmBatchSaveRequest,
  IntgErpSrmReceipt,
  IntgErpSrmReceiptQuery,
  IntgErpSrmReceiptSaveRequest,
  IntgErpSrmCompensation,
  IntgErpSrmCompensationQuery,
  IntgErpSrmCompensationSaveRequest,
  IntgErpSrmReconcile,
  IntgErpSrmReconcileQuery,
  IntgErpSrmReconcileSaveRequest,
} from '@/types/intgErpSrm';

/** G8-N4 六系统集成—ERP→SRM（T065，后端 Base: /intg/erp-srm）服务定义。 */

const BASE = '/intg/erp-srm';

/* ---------------- 1. 集成接口定义 ---------------- */

export const intgErpSrmInterfaceService = {
  page: (params: IntgErpSrmInterfaceQuery): Promise<PageResult<IntgErpSrmInterface>> =>
    request<PageResult<IntgErpSrmInterface>>({ method: 'GET', url: `${BASE}/interfaces`, params }),

  detail: (id: number): Promise<IntgErpSrmInterface> =>
    request<IntgErpSrmInterface>({ method: 'GET', url: `${BASE}/interfaces/${id}` }),

  create: (data: IntgErpSrmInterfaceSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/interfaces`, data }),

  update: (id: number, data: IntgErpSrmInterfaceSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/interfaces/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/interfaces/${id}` }),
};

/* ---------------- 2. 字段映射 ---------------- */

export const intgErpSrmMappingService = {
  page: (params: IntgErpSrmMappingQuery): Promise<PageResult<IntgErpSrmMapping>> =>
    request<PageResult<IntgErpSrmMapping>>({ method: 'GET', url: `${BASE}/mappings`, params }),

  detail: (id: number): Promise<IntgErpSrmMapping> =>
    request<IntgErpSrmMapping>({ method: 'GET', url: `${BASE}/mappings/${id}` }),

  create: (data: IntgErpSrmMappingSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/mappings`, data }),

  update: (id: number, data: IntgErpSrmMappingSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/mappings/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/mappings/${id}` }),
};

/* ---------------- 3. 同步批次 ---------------- */

export const intgErpSrmBatchService = {
  page: (params: IntgErpSrmBatchQuery): Promise<PageResult<IntgErpSrmBatch>> =>
    request<PageResult<IntgErpSrmBatch>>({ method: 'GET', url: `${BASE}/batches`, params }),

  detail: (id: number): Promise<IntgErpSrmBatch> =>
    request<IntgErpSrmBatch>({ method: 'GET', url: `${BASE}/batches/${id}` }),

  create: (data: IntgErpSrmBatchSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/batches`, data }),

  update: (id: number, data: IntgErpSrmBatchSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/batches/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/batches/${id}` }),
};

/* ---------------- 4. SRM 接收回执 ---------------- */

export const intgErpSrmReceiptService = {
  page: (params: IntgErpSrmReceiptQuery): Promise<PageResult<IntgErpSrmReceipt>> =>
    request<PageResult<IntgErpSrmReceipt>>({ method: 'GET', url: `${BASE}/receipts`, params }),

  detail: (id: number): Promise<IntgErpSrmReceipt> =>
    request<IntgErpSrmReceipt>({ method: 'GET', url: `${BASE}/receipts/${id}` }),

  create: (data: IntgErpSrmReceiptSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/receipts`, data }),

  update: (id: number, data: IntgErpSrmReceiptSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/receipts/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/receipts/${id}` }),
};

/* ---------------- 5. 异常补偿 ---------------- */

export const intgErpSrmCompensationService = {
  page: (params: IntgErpSrmCompensationQuery): Promise<PageResult<IntgErpSrmCompensation>> =>
    request<PageResult<IntgErpSrmCompensation>>({ method: 'GET', url: `${BASE}/compensations`, params }),

  detail: (id: number): Promise<IntgErpSrmCompensation> =>
    request<IntgErpSrmCompensation>({ method: 'GET', url: `${BASE}/compensations/${id}` }),

  create: (data: IntgErpSrmCompensationSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/compensations`, data }),

  update: (id: number, data: IntgErpSrmCompensationSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/compensations/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/compensations/${id}` }),
};

/* ---------------- 6. 对账 ---------------- */

export const intgErpSrmReconcileService = {
  page: (params: IntgErpSrmReconcileQuery): Promise<PageResult<IntgErpSrmReconcile>> =>
    request<PageResult<IntgErpSrmReconcile>>({ method: 'GET', url: `${BASE}/reconciles`, params }),

  detail: (id: number): Promise<IntgErpSrmReconcile> =>
    request<IntgErpSrmReconcile>({ method: 'GET', url: `${BASE}/reconciles/${id}` }),

  create: (data: IntgErpSrmReconcileSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/reconciles`, data }),

  update: (id: number, data: IntgErpSrmReconcileSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/reconciles/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/reconciles/${id}` }),
};
