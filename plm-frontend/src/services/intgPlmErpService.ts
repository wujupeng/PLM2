import { request } from '@/services/request';
import type { PageResult } from '@/types/common';
import type {
  IntgPlmErpInterface,
  IntgPlmErpInterfaceQuery,
  IntgPlmErpInterfaceSaveRequest,
  IntgPlmErpMapping,
  IntgPlmErpMappingQuery,
  IntgPlmErpMappingSaveRequest,
  IntgPlmErpBatch,
  IntgPlmErpBatchQuery,
  IntgPlmErpBatchSaveRequest,
  IntgPlmErpReceipt,
  IntgPlmErpReceiptQuery,
  IntgPlmErpReceiptSaveRequest,
  IntgPlmErpCompensation,
  IntgPlmErpCompensationQuery,
  IntgPlmErpCompensationSaveRequest,
  IntgPlmErpReconcile,
  IntgPlmErpReconcileQuery,
  IntgPlmErpReconcileSaveRequest,
} from '@/types/intgPlmErp';

/** G8-N1 六系统集成—PLM→ERP（T062，后端 Base: /intg/plm-erp）服务定义。 */

const BASE = '/intg/plm-erp';

/* ---------------- 1. 集成接口定义 ---------------- */

export const intgPlmErpInterfaceService = {
  page: (params: IntgPlmErpInterfaceQuery): Promise<PageResult<IntgPlmErpInterface>> =>
    request<PageResult<IntgPlmErpInterface>>({ method: 'GET', url: `${BASE}/interfaces`, params }),

  detail: (id: number): Promise<IntgPlmErpInterface> =>
    request<IntgPlmErpInterface>({ method: 'GET', url: `${BASE}/interfaces/${id}` }),

  create: (data: IntgPlmErpInterfaceSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/interfaces`, data }),

  update: (id: number, data: IntgPlmErpInterfaceSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/interfaces/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/interfaces/${id}` }),
};

/* ---------------- 2. 字段映射 ---------------- */

export const intgPlmErpMappingService = {
  page: (params: IntgPlmErpMappingQuery): Promise<PageResult<IntgPlmErpMapping>> =>
    request<PageResult<IntgPlmErpMapping>>({ method: 'GET', url: `${BASE}/mappings`, params }),

  detail: (id: number): Promise<IntgPlmErpMapping> =>
    request<IntgPlmErpMapping>({ method: 'GET', url: `${BASE}/mappings/${id}` }),

  create: (data: IntgPlmErpMappingSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/mappings`, data }),

  update: (id: number, data: IntgPlmErpMappingSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/mappings/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/mappings/${id}` }),
};

/* ---------------- 3. 同步批次 ---------------- */

export const intgPlmErpBatchService = {
  page: (params: IntgPlmErpBatchQuery): Promise<PageResult<IntgPlmErpBatch>> =>
    request<PageResult<IntgPlmErpBatch>>({ method: 'GET', url: `${BASE}/batches`, params }),

  detail: (id: number): Promise<IntgPlmErpBatch> =>
    request<IntgPlmErpBatch>({ method: 'GET', url: `${BASE}/batches/${id}` }),

  create: (data: IntgPlmErpBatchSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/batches`, data }),

  update: (id: number, data: IntgPlmErpBatchSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/batches/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/batches/${id}` }),
};

/* ---------------- 4. ERP 接收回执 ---------------- */

export const intgPlmErpReceiptService = {
  page: (params: IntgPlmErpReceiptQuery): Promise<PageResult<IntgPlmErpReceipt>> =>
    request<PageResult<IntgPlmErpReceipt>>({ method: 'GET', url: `${BASE}/receipts`, params }),

  detail: (id: number): Promise<IntgPlmErpReceipt> =>
    request<IntgPlmErpReceipt>({ method: 'GET', url: `${BASE}/receipts/${id}` }),

  create: (data: IntgPlmErpReceiptSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/receipts`, data }),

  update: (id: number, data: IntgPlmErpReceiptSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/receipts/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/receipts/${id}` }),
};

/* ---------------- 5. 异常补偿 ---------------- */

export const intgPlmErpCompensationService = {
  page: (params: IntgPlmErpCompensationQuery): Promise<PageResult<IntgPlmErpCompensation>> =>
    request<PageResult<IntgPlmErpCompensation>>({ method: 'GET', url: `${BASE}/compensations`, params }),

  detail: (id: number): Promise<IntgPlmErpCompensation> =>
    request<IntgPlmErpCompensation>({ method: 'GET', url: `${BASE}/compensations/${id}` }),

  create: (data: IntgPlmErpCompensationSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/compensations`, data }),

  update: (id: number, data: IntgPlmErpCompensationSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/compensations/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/compensations/${id}` }),
};

/* ---------------- 6. 对账 ---------------- */

export const intgPlmErpReconcileService = {
  page: (params: IntgPlmErpReconcileQuery): Promise<PageResult<IntgPlmErpReconcile>> =>
    request<PageResult<IntgPlmErpReconcile>>({ method: 'GET', url: `${BASE}/reconciles`, params }),

  detail: (id: number): Promise<IntgPlmErpReconcile> =>
    request<IntgPlmErpReconcile>({ method: 'GET', url: `${BASE}/reconciles/${id}` }),

  create: (data: IntgPlmErpReconcileSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/reconciles`, data }),

  update: (id: number, data: IntgPlmErpReconcileSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/reconciles/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/reconciles/${id}` }),
};
