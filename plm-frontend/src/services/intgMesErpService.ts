import { request } from '@/services/request';
import type { PageResult } from '@/types/common';
import type {
  IntgMesErpInterface,
  IntgMesErpInterfaceQuery,
  IntgMesErpInterfaceSaveRequest,
  IntgMesErpMapping,
  IntgMesErpMappingQuery,
  IntgMesErpMappingSaveRequest,
  IntgMesErpBatch,
  IntgMesErpBatchQuery,
  IntgMesErpBatchSaveRequest,
  IntgMesErpReceipt,
  IntgMesErpReceiptQuery,
  IntgMesErpReceiptSaveRequest,
  IntgMesErpCompensation,
  IntgMesErpCompensationQuery,
  IntgMesErpCompensationSaveRequest,
  IntgMesErpReconcile,
  IntgMesErpReconcileQuery,
  IntgMesErpReconcileSaveRequest,
} from '@/types/intgMesErp';

/** G8-N7 六系统集成—MES→ERP（T068，后端 Base: /intg/mes-erp）服务定义。 */

const BASE = '/intg/mes-erp';

/* ---------------- 1. 集成接口定义 ---------------- */

export const intgMesErpInterfaceService = {
  page: (params: IntgMesErpInterfaceQuery): Promise<PageResult<IntgMesErpInterface>> =>
    request<PageResult<IntgMesErpInterface>>({ method: 'GET', url: `${BASE}/interfaces`, params }),

  detail: (id: number): Promise<IntgMesErpInterface> =>
    request<IntgMesErpInterface>({ method: 'GET', url: `${BASE}/interfaces/${id}` }),

  create: (data: IntgMesErpInterfaceSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/interfaces`, data }),

  update: (id: number, data: IntgMesErpInterfaceSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/interfaces/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/interfaces/${id}` }),
};

/* ---------------- 2. 字段映射 ---------------- */

export const intgMesErpMappingService = {
  page: (params: IntgMesErpMappingQuery): Promise<PageResult<IntgMesErpMapping>> =>
    request<PageResult<IntgMesErpMapping>>({ method: 'GET', url: `${BASE}/mappings`, params }),

  detail: (id: number): Promise<IntgMesErpMapping> =>
    request<IntgMesErpMapping>({ method: 'GET', url: `${BASE}/mappings/${id}` }),

  create: (data: IntgMesErpMappingSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/mappings`, data }),

  update: (id: number, data: IntgMesErpMappingSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/mappings/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/mappings/${id}` }),
};

/* ---------------- 3. 同步批次 ---------------- */

export const intgMesErpBatchService = {
  page: (params: IntgMesErpBatchQuery): Promise<PageResult<IntgMesErpBatch>> =>
    request<PageResult<IntgMesErpBatch>>({ method: 'GET', url: `${BASE}/batches`, params }),

  detail: (id: number): Promise<IntgMesErpBatch> =>
    request<IntgMesErpBatch>({ method: 'GET', url: `${BASE}/batches/${id}` }),

  create: (data: IntgMesErpBatchSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/batches`, data }),

  update: (id: number, data: IntgMesErpBatchSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/batches/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/batches/${id}` }),
};

/* ---------------- 4. ERP 接收回执 ---------------- */

export const intgMesErpReceiptService = {
  page: (params: IntgMesErpReceiptQuery): Promise<PageResult<IntgMesErpReceipt>> =>
    request<PageResult<IntgMesErpReceipt>>({ method: 'GET', url: `${BASE}/receipts`, params }),

  detail: (id: number): Promise<IntgMesErpReceipt> =>
    request<IntgMesErpReceipt>({ method: 'GET', url: `${BASE}/receipts/${id}` }),

  create: (data: IntgMesErpReceiptSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/receipts`, data }),

  update: (id: number, data: IntgMesErpReceiptSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/receipts/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/receipts/${id}` }),
};

/* ---------------- 5. 异常补偿 ---------------- */

export const intgMesErpCompensationService = {
  page: (params: IntgMesErpCompensationQuery): Promise<PageResult<IntgMesErpCompensation>> =>
    request<PageResult<IntgMesErpCompensation>>({ method: 'GET', url: `${BASE}/compensations`, params }),

  detail: (id: number): Promise<IntgMesErpCompensation> =>
    request<IntgMesErpCompensation>({ method: 'GET', url: `${BASE}/compensations/${id}` }),

  create: (data: IntgMesErpCompensationSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/compensations`, data }),

  update: (id: number, data: IntgMesErpCompensationSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/compensations/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/compensations/${id}` }),
};

/* ---------------- 6. 对账 ---------------- */

export const intgMesErpReconcileService = {
  page: (params: IntgMesErpReconcileQuery): Promise<PageResult<IntgMesErpReconcile>> =>
    request<PageResult<IntgMesErpReconcile>>({ method: 'GET', url: `${BASE}/reconciles`, params }),

  detail: (id: number): Promise<IntgMesErpReconcile> =>
    request<IntgMesErpReconcile>({ method: 'GET', url: `${BASE}/reconciles/${id}` }),

  create: (data: IntgMesErpReconcileSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/reconciles`, data }),

  update: (id: number, data: IntgMesErpReconcileSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/reconciles/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/reconciles/${id}` }),
};
