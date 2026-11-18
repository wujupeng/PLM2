import { request } from '@/services/request';
import type { PageResult } from '@/types/common';
import type {
  IntgErpWmsInterface,
  IntgErpWmsInterfaceQuery,
  IntgErpWmsInterfaceSaveRequest,
  IntgErpWmsMapping,
  IntgErpWmsMappingQuery,
  IntgErpWmsMappingSaveRequest,
  IntgErpWmsBatch,
  IntgErpWmsBatchQuery,
  IntgErpWmsBatchSaveRequest,
  IntgErpWmsReceipt,
  IntgErpWmsReceiptQuery,
  IntgErpWmsReceiptSaveRequest,
  IntgErpWmsCompensation,
  IntgErpWmsCompensationQuery,
  IntgErpWmsCompensationSaveRequest,
  IntgErpWmsReconcile,
  IntgErpWmsReconcileQuery,
  IntgErpWmsReconcileSaveRequest,
} from '@/types/intgErpWms';

/** G8-N8 六系统集成—ERP↔WMS（T069，后端 Base: /intg/erp-wms）服务定义。 */

const BASE = '/intg/erp-wms';

/* ---------------- 1. 集成接口定义 ---------------- */

export const intgErpWmsInterfaceService = {
  page: (params: IntgErpWmsInterfaceQuery): Promise<PageResult<IntgErpWmsInterface>> =>
    request<PageResult<IntgErpWmsInterface>>({ method: 'GET', url: `${BASE}/interfaces`, params }),

  detail: (id: number): Promise<IntgErpWmsInterface> =>
    request<IntgErpWmsInterface>({ method: 'GET', url: `${BASE}/interfaces/${id}` }),

  create: (data: IntgErpWmsInterfaceSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/interfaces`, data }),

  update: (id: number, data: IntgErpWmsInterfaceSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/interfaces/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/interfaces/${id}` }),
};

/* ---------------- 2. 字段映射 ---------------- */

export const intgErpWmsMappingService = {
  page: (params: IntgErpWmsMappingQuery): Promise<PageResult<IntgErpWmsMapping>> =>
    request<PageResult<IntgErpWmsMapping>>({ method: 'GET', url: `${BASE}/mappings`, params }),

  detail: (id: number): Promise<IntgErpWmsMapping> =>
    request<IntgErpWmsMapping>({ method: 'GET', url: `${BASE}/mappings/${id}` }),

  create: (data: IntgErpWmsMappingSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/mappings`, data }),

  update: (id: number, data: IntgErpWmsMappingSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/mappings/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/mappings/${id}` }),
};

/* ---------------- 3. 同步批次 ---------------- */

export const intgErpWmsBatchService = {
  page: (params: IntgErpWmsBatchQuery): Promise<PageResult<IntgErpWmsBatch>> =>
    request<PageResult<IntgErpWmsBatch>>({ method: 'GET', url: `${BASE}/batches`, params }),

  detail: (id: number): Promise<IntgErpWmsBatch> =>
    request<IntgErpWmsBatch>({ method: 'GET', url: `${BASE}/batches/${id}` }),

  create: (data: IntgErpWmsBatchSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/batches`, data }),

  update: (id: number, data: IntgErpWmsBatchSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/batches/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/batches/${id}` }),
};

/* ---------------- 4. WMS 接收回执 ---------------- */

export const intgErpWmsReceiptService = {
  page: (params: IntgErpWmsReceiptQuery): Promise<PageResult<IntgErpWmsReceipt>> =>
    request<PageResult<IntgErpWmsReceipt>>({ method: 'GET', url: `${BASE}/receipts`, params }),

  detail: (id: number): Promise<IntgErpWmsReceipt> =>
    request<IntgErpWmsReceipt>({ method: 'GET', url: `${BASE}/receipts/${id}` }),

  create: (data: IntgErpWmsReceiptSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/receipts`, data }),

  update: (id: number, data: IntgErpWmsReceiptSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/receipts/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/receipts/${id}` }),
};

/* ---------------- 5. 异常补偿 ---------------- */

export const intgErpWmsCompensationService = {
  page: (params: IntgErpWmsCompensationQuery): Promise<PageResult<IntgErpWmsCompensation>> =>
    request<PageResult<IntgErpWmsCompensation>>({ method: 'GET', url: `${BASE}/compensations`, params }),

  detail: (id: number): Promise<IntgErpWmsCompensation> =>
    request<IntgErpWmsCompensation>({ method: 'GET', url: `${BASE}/compensations/${id}` }),

  create: (data: IntgErpWmsCompensationSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/compensations`, data }),

  update: (id: number, data: IntgErpWmsCompensationSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/compensations/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/compensations/${id}` }),
};

/* ---------------- 6. 对账 ---------------- */

export const intgErpWmsReconcileService = {
  page: (params: IntgErpWmsReconcileQuery): Promise<PageResult<IntgErpWmsReconcile>> =>
    request<PageResult<IntgErpWmsReconcile>>({ method: 'GET', url: `${BASE}/reconciles`, params }),

  detail: (id: number): Promise<IntgErpWmsReconcile> =>
    request<IntgErpWmsReconcile>({ method: 'GET', url: `${BASE}/reconciles/${id}` }),

  create: (data: IntgErpWmsReconcileSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/reconciles`, data }),

  update: (id: number, data: IntgErpWmsReconcileSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/reconciles/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/reconciles/${id}` }),
};
