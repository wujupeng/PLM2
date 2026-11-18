import { request } from '@/services/request';
import type { PageResult } from '@/types/common';
import type {
  IntgPlmSrmInterface,
  IntgPlmSrmInterfaceQuery,
  IntgPlmSrmInterfaceSaveRequest,
  IntgPlmSrmMapping,
  IntgPlmSrmMappingQuery,
  IntgPlmSrmMappingSaveRequest,
  IntgPlmSrmBatch,
  IntgPlmSrmBatchQuery,
  IntgPlmSrmBatchSaveRequest,
  IntgPlmSrmReceipt,
  IntgPlmSrmReceiptQuery,
  IntgPlmSrmReceiptSaveRequest,
  IntgPlmSrmCompensation,
  IntgPlmSrmCompensationQuery,
  IntgPlmSrmCompensationSaveRequest,
  IntgPlmSrmReconcile,
  IntgPlmSrmReconcileQuery,
  IntgPlmSrmReconcileSaveRequest,
} from '@/types/intgPlmSrm';

/** G8-N3 六系统集成—PLM→SRM（T064，后端 Base: /intg/plm-srm）服务定义。 */

const BASE = '/intg/plm-srm';

/* ---------------- 1. 集成接口定义 ---------------- */

export const intgPlmSrmInterfaceService = {
  page: (params: IntgPlmSrmInterfaceQuery): Promise<PageResult<IntgPlmSrmInterface>> =>
    request<PageResult<IntgPlmSrmInterface>>({ method: 'GET', url: `${BASE}/interfaces`, params }),

  detail: (id: number): Promise<IntgPlmSrmInterface> =>
    request<IntgPlmSrmInterface>({ method: 'GET', url: `${BASE}/interfaces/${id}` }),

  create: (data: IntgPlmSrmInterfaceSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/interfaces`, data }),

  update: (id: number, data: IntgPlmSrmInterfaceSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/interfaces/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/interfaces/${id}` }),
};

/* ---------------- 2. 字段映射 ---------------- */

export const intgPlmSrmMappingService = {
  page: (params: IntgPlmSrmMappingQuery): Promise<PageResult<IntgPlmSrmMapping>> =>
    request<PageResult<IntgPlmSrmMapping>>({ method: 'GET', url: `${BASE}/mappings`, params }),

  detail: (id: number): Promise<IntgPlmSrmMapping> =>
    request<IntgPlmSrmMapping>({ method: 'GET', url: `${BASE}/mappings/${id}` }),

  create: (data: IntgPlmSrmMappingSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/mappings`, data }),

  update: (id: number, data: IntgPlmSrmMappingSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/mappings/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/mappings/${id}` }),
};

/* ---------------- 3. 同步批次 ---------------- */

export const intgPlmSrmBatchService = {
  page: (params: IntgPlmSrmBatchQuery): Promise<PageResult<IntgPlmSrmBatch>> =>
    request<PageResult<IntgPlmSrmBatch>>({ method: 'GET', url: `${BASE}/batches`, params }),

  detail: (id: number): Promise<IntgPlmSrmBatch> =>
    request<IntgPlmSrmBatch>({ method: 'GET', url: `${BASE}/batches/${id}` }),

  create: (data: IntgPlmSrmBatchSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/batches`, data }),

  update: (id: number, data: IntgPlmSrmBatchSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/batches/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/batches/${id}` }),
};

/* ---------------- 4. SRM 接收回执 ---------------- */

export const intgPlmSrmReceiptService = {
  page: (params: IntgPlmSrmReceiptQuery): Promise<PageResult<IntgPlmSrmReceipt>> =>
    request<PageResult<IntgPlmSrmReceipt>>({ method: 'GET', url: `${BASE}/receipts`, params }),

  detail: (id: number): Promise<IntgPlmSrmReceipt> =>
    request<IntgPlmSrmReceipt>({ method: 'GET', url: `${BASE}/receipts/${id}` }),

  create: (data: IntgPlmSrmReceiptSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/receipts`, data }),

  update: (id: number, data: IntgPlmSrmReceiptSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/receipts/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/receipts/${id}` }),
};

/* ---------------- 5. 异常补偿 ---------------- */

export const intgPlmSrmCompensationService = {
  page: (params: IntgPlmSrmCompensationQuery): Promise<PageResult<IntgPlmSrmCompensation>> =>
    request<PageResult<IntgPlmSrmCompensation>>({ method: 'GET', url: `${BASE}/compensations`, params }),

  detail: (id: number): Promise<IntgPlmSrmCompensation> =>
    request<IntgPlmSrmCompensation>({ method: 'GET', url: `${BASE}/compensations/${id}` }),

  create: (data: IntgPlmSrmCompensationSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/compensations`, data }),

  update: (id: number, data: IntgPlmSrmCompensationSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/compensations/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/compensations/${id}` }),
};

/* ---------------- 6. 对账 ---------------- */

export const intgPlmSrmReconcileService = {
  page: (params: IntgPlmSrmReconcileQuery): Promise<PageResult<IntgPlmSrmReconcile>> =>
    request<PageResult<IntgPlmSrmReconcile>>({ method: 'GET', url: `${BASE}/reconciles`, params }),

  detail: (id: number): Promise<IntgPlmSrmReconcile> =>
    request<IntgPlmSrmReconcile>({ method: 'GET', url: `${BASE}/reconciles/${id}` }),

  create: (data: IntgPlmSrmReconcileSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/reconciles`, data }),

  update: (id: number, data: IntgPlmSrmReconcileSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/reconciles/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/reconciles/${id}` }),
};
