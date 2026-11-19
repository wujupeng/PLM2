import { request } from '@/services/request';
import type { PageResult } from '@/types/common';
import type {
  IntgDocumentChainInterface,
  IntgDocumentChainInterfaceQuery,
  IntgDocumentChainInterfaceSaveRequest,
  IntgDocumentChainMapping,
  IntgDocumentChainMappingQuery,
  IntgDocumentChainMappingSaveRequest,
  IntgDocumentChainBatch,
  IntgDocumentChainBatchQuery,
  IntgDocumentChainBatchSaveRequest,
  IntgDocumentChainReceipt,
  IntgDocumentChainReceiptQuery,
  IntgDocumentChainReceiptSaveRequest,
  IntgDocumentChainCompensation,
  IntgDocumentChainCompensationQuery,
  IntgDocumentChainCompensationSaveRequest,
  IntgDocumentChainReconcile,
  IntgDocumentChainReconcileQuery,
  IntgDocumentChainReconcileSaveRequest,
} from '@/types/intgDocumentChain';

/** G8-N14 六系统集成—单据全链路（T075，后端 Base: /intg/document-chain）服务定义。 */

const BASE = '/intg/document-chain';

/* ---------------- 1. 集成接口定义 ---------------- */

export const intgDocumentChainInterfaceService = {
  page: (params: IntgDocumentChainInterfaceQuery): Promise<PageResult<IntgDocumentChainInterface>> =>
    request<PageResult<IntgDocumentChainInterface>>({ method: 'GET', url: `${BASE}/interfaces`, params }),

  detail: (id: number): Promise<IntgDocumentChainInterface> =>
    request<IntgDocumentChainInterface>({ method: 'GET', url: `${BASE}/interfaces/${id}` }),

  create: (data: IntgDocumentChainInterfaceSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/interfaces`, data }),

  update: (id: number, data: IntgDocumentChainInterfaceSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/interfaces/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/interfaces/${id}` }),
};

/* ---------------- 2. 字段映射 ---------------- */

export const intgDocumentChainMappingService = {
  page: (params: IntgDocumentChainMappingQuery): Promise<PageResult<IntgDocumentChainMapping>> =>
    request<PageResult<IntgDocumentChainMapping>>({ method: 'GET', url: `${BASE}/mappings`, params }),

  detail: (id: number): Promise<IntgDocumentChainMapping> =>
    request<IntgDocumentChainMapping>({ method: 'GET', url: `${BASE}/mappings/${id}` }),

  create: (data: IntgDocumentChainMappingSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/mappings`, data }),

  update: (id: number, data: IntgDocumentChainMappingSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/mappings/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/mappings/${id}` }),
};

/* ---------------- 3. 同步批次 ---------------- */

export const intgDocumentChainBatchService = {
  page: (params: IntgDocumentChainBatchQuery): Promise<PageResult<IntgDocumentChainBatch>> =>
    request<PageResult<IntgDocumentChainBatch>>({ method: 'GET', url: `${BASE}/batches`, params }),

  detail: (id: number): Promise<IntgDocumentChainBatch> =>
    request<IntgDocumentChainBatch>({ method: 'GET', url: `${BASE}/batches/${id}` }),

  create: (data: IntgDocumentChainBatchSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/batches`, data }),

  update: (id: number, data: IntgDocumentChainBatchSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/batches/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/batches/${id}` }),
};

/* ---------------- 4. 系统接收回执 ---------------- */

export const intgDocumentChainReceiptService = {
  page: (params: IntgDocumentChainReceiptQuery): Promise<PageResult<IntgDocumentChainReceipt>> =>
    request<PageResult<IntgDocumentChainReceipt>>({ method: 'GET', url: `${BASE}/receipts`, params }),

  detail: (id: number): Promise<IntgDocumentChainReceipt> =>
    request<IntgDocumentChainReceipt>({ method: 'GET', url: `${BASE}/receipts/${id}` }),

  create: (data: IntgDocumentChainReceiptSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/receipts`, data }),

  update: (id: number, data: IntgDocumentChainReceiptSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/receipts/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/receipts/${id}` }),
};

/* ---------------- 5. 异常补偿 ---------------- */

export const intgDocumentChainCompensationService = {
  page: (params: IntgDocumentChainCompensationQuery): Promise<PageResult<IntgDocumentChainCompensation>> =>
    request<PageResult<IntgDocumentChainCompensation>>({ method: 'GET', url: `${BASE}/compensations`, params }),

  detail: (id: number): Promise<IntgDocumentChainCompensation> =>
    request<IntgDocumentChainCompensation>({ method: 'GET', url: `${BASE}/compensations/${id}` }),

  create: (data: IntgDocumentChainCompensationSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/compensations`, data }),

  update: (id: number, data: IntgDocumentChainCompensationSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/compensations/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/compensations/${id}` }),
};

/* ---------------- 6. 对账 ---------------- */

export const intgDocumentChainReconcileService = {
  page: (params: IntgDocumentChainReconcileQuery): Promise<PageResult<IntgDocumentChainReconcile>> =>
    request<PageResult<IntgDocumentChainReconcile>>({ method: 'GET', url: `${BASE}/reconciles`, params }),

  detail: (id: number): Promise<IntgDocumentChainReconcile> =>
    request<IntgDocumentChainReconcile>({ method: 'GET', url: `${BASE}/reconciles/${id}` }),

  create: (data: IntgDocumentChainReconcileSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/reconciles`, data }),

  update: (id: number, data: IntgDocumentChainReconcileSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/reconciles/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/reconciles/${id}` }),
};
