import { request } from '@/services/request';
import type { PageResult } from '@/types/common';
import type {
  IntgEdiGatewayInterface,
  IntgEdiGatewayInterfaceQuery,
  IntgEdiGatewayInterfaceSaveRequest,
  IntgEdiGatewayMapping,
  IntgEdiGatewayMappingQuery,
  IntgEdiGatewayMappingSaveRequest,
  IntgEdiGatewayBatch,
  IntgEdiGatewayBatchQuery,
  IntgEdiGatewayBatchSaveRequest,
  IntgEdiGatewayReceipt,
  IntgEdiGatewayReceiptQuery,
  IntgEdiGatewayReceiptSaveRequest,
  IntgEdiGatewayCompensation,
  IntgEdiGatewayCompensationQuery,
  IntgEdiGatewayCompensationSaveRequest,
  IntgEdiGatewayReconcile,
  IntgEdiGatewayReconcileQuery,
  IntgEdiGatewayReconcileSaveRequest,
} from '@/types/intgEdiGateway';

/** G8-N11 六系统集成—EDI 网关（T072，后端 Base: /intg/edi-gateway）服务定义。 */

const BASE = '/intg/edi-gateway';

/* ---------------- 1. 集成接口定义 ---------------- */

export const intgEdiGatewayInterfaceService = {
  page: (params: IntgEdiGatewayInterfaceQuery): Promise<PageResult<IntgEdiGatewayInterface>> =>
    request<PageResult<IntgEdiGatewayInterface>>({ method: 'GET', url: `${BASE}/interfaces`, params }),

  detail: (id: number): Promise<IntgEdiGatewayInterface> =>
    request<IntgEdiGatewayInterface>({ method: 'GET', url: `${BASE}/interfaces/${id}` }),

  create: (data: IntgEdiGatewayInterfaceSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/interfaces`, data }),

  update: (id: number, data: IntgEdiGatewayInterfaceSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/interfaces/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/interfaces/${id}` }),
};

/* ---------------- 2. 字段映射 ---------------- */

export const intgEdiGatewayMappingService = {
  page: (params: IntgEdiGatewayMappingQuery): Promise<PageResult<IntgEdiGatewayMapping>> =>
    request<PageResult<IntgEdiGatewayMapping>>({ method: 'GET', url: `${BASE}/mappings`, params }),

  detail: (id: number): Promise<IntgEdiGatewayMapping> =>
    request<IntgEdiGatewayMapping>({ method: 'GET', url: `${BASE}/mappings/${id}` }),

  create: (data: IntgEdiGatewayMappingSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/mappings`, data }),

  update: (id: number, data: IntgEdiGatewayMappingSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/mappings/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/mappings/${id}` }),
};

/* ---------------- 3. 同步批次 ---------------- */

export const intgEdiGatewayBatchService = {
  page: (params: IntgEdiGatewayBatchQuery): Promise<PageResult<IntgEdiGatewayBatch>> =>
    request<PageResult<IntgEdiGatewayBatch>>({ method: 'GET', url: `${BASE}/batches`, params }),

  detail: (id: number): Promise<IntgEdiGatewayBatch> =>
    request<IntgEdiGatewayBatch>({ method: 'GET', url: `${BASE}/batches/${id}` }),

  create: (data: IntgEdiGatewayBatchSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/batches`, data }),

  update: (id: number, data: IntgEdiGatewayBatchSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/batches/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/batches/${id}` }),
};

/* ---------------- 4. 系统接收回执 ---------------- */

export const intgEdiGatewayReceiptService = {
  page: (params: IntgEdiGatewayReceiptQuery): Promise<PageResult<IntgEdiGatewayReceipt>> =>
    request<PageResult<IntgEdiGatewayReceipt>>({ method: 'GET', url: `${BASE}/receipts`, params }),

  detail: (id: number): Promise<IntgEdiGatewayReceipt> =>
    request<IntgEdiGatewayReceipt>({ method: 'GET', url: `${BASE}/receipts/${id}` }),

  create: (data: IntgEdiGatewayReceiptSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/receipts`, data }),

  update: (id: number, data: IntgEdiGatewayReceiptSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/receipts/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/receipts/${id}` }),
};

/* ---------------- 5. 异常补偿 ---------------- */

export const intgEdiGatewayCompensationService = {
  page: (params: IntgEdiGatewayCompensationQuery): Promise<PageResult<IntgEdiGatewayCompensation>> =>
    request<PageResult<IntgEdiGatewayCompensation>>({ method: 'GET', url: `${BASE}/compensations`, params }),

  detail: (id: number): Promise<IntgEdiGatewayCompensation> =>
    request<IntgEdiGatewayCompensation>({ method: 'GET', url: `${BASE}/compensations/${id}` }),

  create: (data: IntgEdiGatewayCompensationSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/compensations`, data }),

  update: (id: number, data: IntgEdiGatewayCompensationSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/compensations/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/compensations/${id}` }),
};

/* ---------------- 6. 对账 ---------------- */

export const intgEdiGatewayReconcileService = {
  page: (params: IntgEdiGatewayReconcileQuery): Promise<PageResult<IntgEdiGatewayReconcile>> =>
    request<PageResult<IntgEdiGatewayReconcile>>({ method: 'GET', url: `${BASE}/reconciles`, params }),

  detail: (id: number): Promise<IntgEdiGatewayReconcile> =>
    request<IntgEdiGatewayReconcile>({ method: 'GET', url: `${BASE}/reconciles/${id}` }),

  create: (data: IntgEdiGatewayReconcileSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/reconciles`, data }),

  update: (id: number, data: IntgEdiGatewayReconcileSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/reconciles/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/reconciles/${id}` }),
};
