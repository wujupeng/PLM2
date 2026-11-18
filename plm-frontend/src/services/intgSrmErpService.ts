import { request } from '@/services/request';
import type { PageResult } from '@/types/common';
import type {
  IntgSrmErpInterface,
  IntgSrmErpInterfaceQuery,
  IntgSrmErpInterfaceSaveRequest,
  IntgSrmErpMapping,
  IntgSrmErpMappingQuery,
  IntgSrmErpMappingSaveRequest,
  IntgSrmErpBatch,
  IntgSrmErpBatchQuery,
  IntgSrmErpBatchSaveRequest,
  IntgSrmErpReceipt,
  IntgSrmErpReceiptQuery,
  IntgSrmErpReceiptSaveRequest,
  IntgSrmErpCompensation,
  IntgSrmErpCompensationQuery,
  IntgSrmErpCompensationSaveRequest,
  IntgSrmErpReconcile,
  IntgSrmErpReconcileQuery,
  IntgSrmErpReconcileSaveRequest,
} from '@/types/intgSrmErp';

/** G8-N5 六系统集成—SRM→ERP（T066，后端 Base: /intg/srm-erp）服务定义。 */

const BASE = '/intg/srm-erp';

/* ---------------- 1. 集成接口定义 ---------------- */

export const intgSrmErpInterfaceService = {
  page: (params: IntgSrmErpInterfaceQuery): Promise<PageResult<IntgSrmErpInterface>> =>
    request<PageResult<IntgSrmErpInterface>>({ method: 'GET', url: `${BASE}/interfaces`, params }),

  detail: (id: number): Promise<IntgSrmErpInterface> =>
    request<IntgSrmErpInterface>({ method: 'GET', url: `${BASE}/interfaces/${id}` }),

  create: (data: IntgSrmErpInterfaceSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/interfaces`, data }),

  update: (id: number, data: IntgSrmErpInterfaceSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/interfaces/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/interfaces/${id}` }),
};

/* ---------------- 2. 字段映射 ---------------- */

export const intgSrmErpMappingService = {
  page: (params: IntgSrmErpMappingQuery): Promise<PageResult<IntgSrmErpMapping>> =>
    request<PageResult<IntgSrmErpMapping>>({ method: 'GET', url: `${BASE}/mappings`, params }),

  detail: (id: number): Promise<IntgSrmErpMapping> =>
    request<IntgSrmErpMapping>({ method: 'GET', url: `${BASE}/mappings/${id}` }),

  create: (data: IntgSrmErpMappingSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/mappings`, data }),

  update: (id: number, data: IntgSrmErpMappingSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/mappings/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/mappings/${id}` }),
};

/* ---------------- 3. 同步批次 ---------------- */

export const intgSrmErpBatchService = {
  page: (params: IntgSrmErpBatchQuery): Promise<PageResult<IntgSrmErpBatch>> =>
    request<PageResult<IntgSrmErpBatch>>({ method: 'GET', url: `${BASE}/batches`, params }),

  detail: (id: number): Promise<IntgSrmErpBatch> =>
    request<IntgSrmErpBatch>({ method: 'GET', url: `${BASE}/batches/${id}` }),

  create: (data: IntgSrmErpBatchSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/batches`, data }),

  update: (id: number, data: IntgSrmErpBatchSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/batches/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/batches/${id}` }),
};

/* ---------------- 4. ERP 接收回执 ---------------- */

export const intgSrmErpReceiptService = {
  page: (params: IntgSrmErpReceiptQuery): Promise<PageResult<IntgSrmErpReceipt>> =>
    request<PageResult<IntgSrmErpReceipt>>({ method: 'GET', url: `${BASE}/receipts`, params }),

  detail: (id: number): Promise<IntgSrmErpReceipt> =>
    request<IntgSrmErpReceipt>({ method: 'GET', url: `${BASE}/receipts/${id}` }),

  create: (data: IntgSrmErpReceiptSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/receipts`, data }),

  update: (id: number, data: IntgSrmErpReceiptSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/receipts/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/receipts/${id}` }),
};

/* ---------------- 5. 异常补偿 ---------------- */

export const intgSrmErpCompensationService = {
  page: (params: IntgSrmErpCompensationQuery): Promise<PageResult<IntgSrmErpCompensation>> =>
    request<PageResult<IntgSrmErpCompensation>>({ method: 'GET', url: `${BASE}/compensations`, params }),

  detail: (id: number): Promise<IntgSrmErpCompensation> =>
    request<IntgSrmErpCompensation>({ method: 'GET', url: `${BASE}/compensations/${id}` }),

  create: (data: IntgSrmErpCompensationSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/compensations`, data }),

  update: (id: number, data: IntgSrmErpCompensationSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/compensations/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/compensations/${id}` }),
};

/* ---------------- 6. 对账 ---------------- */

export const intgSrmErpReconcileService = {
  page: (params: IntgSrmErpReconcileQuery): Promise<PageResult<IntgSrmErpReconcile>> =>
    request<PageResult<IntgSrmErpReconcile>>({ method: 'GET', url: `${BASE}/reconciles`, params }),

  detail: (id: number): Promise<IntgSrmErpReconcile> =>
    request<IntgSrmErpReconcile>({ method: 'GET', url: `${BASE}/reconciles/${id}` }),

  create: (data: IntgSrmErpReconcileSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/reconciles`, data }),

  update: (id: number, data: IntgSrmErpReconcileSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/reconciles/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/reconciles/${id}` }),
};
