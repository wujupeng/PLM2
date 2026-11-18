import { request } from '@/services/request';
import type { PageResult } from '@/types/common';
import type {
  IntgErpMesInterface,
  IntgErpMesInterfaceQuery,
  IntgErpMesInterfaceSaveRequest,
  IntgErpMesMapping,
  IntgErpMesMappingQuery,
  IntgErpMesMappingSaveRequest,
  IntgErpMesBatch,
  IntgErpMesBatchQuery,
  IntgErpMesBatchSaveRequest,
  IntgErpMesReceipt,
  IntgErpMesReceiptQuery,
  IntgErpMesReceiptSaveRequest,
  IntgErpMesCompensation,
  IntgErpMesCompensationQuery,
  IntgErpMesCompensationSaveRequest,
  IntgErpMesReconcile,
  IntgErpMesReconcileQuery,
  IntgErpMesReconcileSaveRequest,
} from '@/types/intgErpMes';

/** G8-N6 六系统集成—ERP→MES（T067，后端 Base: /intg/erp-mes）服务定义。 */

const BASE = '/intg/erp-mes';

/* ---------------- 1. 集成接口定义 ---------------- */

export const intgErpMesInterfaceService = {
  page: (params: IntgErpMesInterfaceQuery): Promise<PageResult<IntgErpMesInterface>> =>
    request<PageResult<IntgErpMesInterface>>({ method: 'GET', url: `${BASE}/interfaces`, params }),

  detail: (id: number): Promise<IntgErpMesInterface> =>
    request<IntgErpMesInterface>({ method: 'GET', url: `${BASE}/interfaces/${id}` }),

  create: (data: IntgErpMesInterfaceSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/interfaces`, data }),

  update: (id: number, data: IntgErpMesInterfaceSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/interfaces/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/interfaces/${id}` }),
};

/* ---------------- 2. 字段映射 ---------------- */

export const intgErpMesMappingService = {
  page: (params: IntgErpMesMappingQuery): Promise<PageResult<IntgErpMesMapping>> =>
    request<PageResult<IntgErpMesMapping>>({ method: 'GET', url: `${BASE}/mappings`, params }),

  detail: (id: number): Promise<IntgErpMesMapping> =>
    request<IntgErpMesMapping>({ method: 'GET', url: `${BASE}/mappings/${id}` }),

  create: (data: IntgErpMesMappingSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/mappings`, data }),

  update: (id: number, data: IntgErpMesMappingSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/mappings/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/mappings/${id}` }),
};

/* ---------------- 3. 同步批次 ---------------- */

export const intgErpMesBatchService = {
  page: (params: IntgErpMesBatchQuery): Promise<PageResult<IntgErpMesBatch>> =>
    request<PageResult<IntgErpMesBatch>>({ method: 'GET', url: `${BASE}/batches`, params }),

  detail: (id: number): Promise<IntgErpMesBatch> =>
    request<IntgErpMesBatch>({ method: 'GET', url: `${BASE}/batches/${id}` }),

  create: (data: IntgErpMesBatchSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/batches`, data }),

  update: (id: number, data: IntgErpMesBatchSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/batches/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/batches/${id}` }),
};

/* ---------------- 4. MES 接收回执 ---------------- */

export const intgErpMesReceiptService = {
  page: (params: IntgErpMesReceiptQuery): Promise<PageResult<IntgErpMesReceipt>> =>
    request<PageResult<IntgErpMesReceipt>>({ method: 'GET', url: `${BASE}/receipts`, params }),

  detail: (id: number): Promise<IntgErpMesReceipt> =>
    request<IntgErpMesReceipt>({ method: 'GET', url: `${BASE}/receipts/${id}` }),

  create: (data: IntgErpMesReceiptSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/receipts`, data }),

  update: (id: number, data: IntgErpMesReceiptSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/receipts/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/receipts/${id}` }),
};

/* ---------------- 5. 异常补偿 ---------------- */

export const intgErpMesCompensationService = {
  page: (params: IntgErpMesCompensationQuery): Promise<PageResult<IntgErpMesCompensation>> =>
    request<PageResult<IntgErpMesCompensation>>({ method: 'GET', url: `${BASE}/compensations`, params }),

  detail: (id: number): Promise<IntgErpMesCompensation> =>
    request<IntgErpMesCompensation>({ method: 'GET', url: `${BASE}/compensations/${id}` }),

  create: (data: IntgErpMesCompensationSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/compensations`, data }),

  update: (id: number, data: IntgErpMesCompensationSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/compensations/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/compensations/${id}` }),
};

/* ---------------- 6. 对账 ---------------- */

export const intgErpMesReconcileService = {
  page: (params: IntgErpMesReconcileQuery): Promise<PageResult<IntgErpMesReconcile>> =>
    request<PageResult<IntgErpMesReconcile>>({ method: 'GET', url: `${BASE}/reconciles`, params }),

  detail: (id: number): Promise<IntgErpMesReconcile> =>
    request<IntgErpMesReconcile>({ method: 'GET', url: `${BASE}/reconciles/${id}` }),

  create: (data: IntgErpMesReconcileSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/reconciles`, data }),

  update: (id: number, data: IntgErpMesReconcileSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/reconciles/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/reconciles/${id}` }),
};
