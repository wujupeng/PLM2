import { request } from '@/services/request';
import type { PageResult } from '@/types/common';
import type {
  IntgPlmMesInterface,
  IntgPlmMesInterfaceQuery,
  IntgPlmMesInterfaceSaveRequest,
  IntgPlmMesMapping,
  IntgPlmMesMappingQuery,
  IntgPlmMesMappingSaveRequest,
  IntgPlmMesBatch,
  IntgPlmMesBatchQuery,
  IntgPlmMesBatchSaveRequest,
  IntgPlmMesReceipt,
  IntgPlmMesReceiptQuery,
  IntgPlmMesReceiptSaveRequest,
  IntgPlmMesCompensation,
  IntgPlmMesCompensationQuery,
  IntgPlmMesCompensationSaveRequest,
  IntgPlmMesReconcile,
  IntgPlmMesReconcileQuery,
  IntgPlmMesReconcileSaveRequest,
} from '@/types/intgPlmMes';

/** G8-N2 六系统集成—PLM→MES（T063，后端 Base: /intg/plm-mes）服务定义。 */

const BASE = '/intg/plm-mes';

/* ---------------- 1. 集成接口定义 ---------------- */

export const intgPlmMesInterfaceService = {
  page: (params: IntgPlmMesInterfaceQuery): Promise<PageResult<IntgPlmMesInterface>> =>
    request<PageResult<IntgPlmMesInterface>>({ method: 'GET', url: `${BASE}/interfaces`, params }),

  detail: (id: number): Promise<IntgPlmMesInterface> =>
    request<IntgPlmMesInterface>({ method: 'GET', url: `${BASE}/interfaces/${id}` }),

  create: (data: IntgPlmMesInterfaceSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/interfaces`, data }),

  update: (id: number, data: IntgPlmMesInterfaceSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/interfaces/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/interfaces/${id}` }),
};

/* ---------------- 2. 字段映射 ---------------- */

export const intgPlmMesMappingService = {
  page: (params: IntgPlmMesMappingQuery): Promise<PageResult<IntgPlmMesMapping>> =>
    request<PageResult<IntgPlmMesMapping>>({ method: 'GET', url: `${BASE}/mappings`, params }),

  detail: (id: number): Promise<IntgPlmMesMapping> =>
    request<IntgPlmMesMapping>({ method: 'GET', url: `${BASE}/mappings/${id}` }),

  create: (data: IntgPlmMesMappingSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/mappings`, data }),

  update: (id: number, data: IntgPlmMesMappingSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/mappings/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/mappings/${id}` }),
};

/* ---------------- 3. 同步批次 ---------------- */

export const intgPlmMesBatchService = {
  page: (params: IntgPlmMesBatchQuery): Promise<PageResult<IntgPlmMesBatch>> =>
    request<PageResult<IntgPlmMesBatch>>({ method: 'GET', url: `${BASE}/batches`, params }),

  detail: (id: number): Promise<IntgPlmMesBatch> =>
    request<IntgPlmMesBatch>({ method: 'GET', url: `${BASE}/batches/${id}` }),

  create: (data: IntgPlmMesBatchSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/batches`, data }),

  update: (id: number, data: IntgPlmMesBatchSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/batches/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/batches/${id}` }),
};

/* ---------------- 4. MES 接收回执 ---------------- */

export const intgPlmMesReceiptService = {
  page: (params: IntgPlmMesReceiptQuery): Promise<PageResult<IntgPlmMesReceipt>> =>
    request<PageResult<IntgPlmMesReceipt>>({ method: 'GET', url: `${BASE}/receipts`, params }),

  detail: (id: number): Promise<IntgPlmMesReceipt> =>
    request<IntgPlmMesReceipt>({ method: 'GET', url: `${BASE}/receipts/${id}` }),

  create: (data: IntgPlmMesReceiptSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/receipts`, data }),

  update: (id: number, data: IntgPlmMesReceiptSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/receipts/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/receipts/${id}` }),
};

/* ---------------- 5. 异常补偿 ---------------- */

export const intgPlmMesCompensationService = {
  page: (params: IntgPlmMesCompensationQuery): Promise<PageResult<IntgPlmMesCompensation>> =>
    request<PageResult<IntgPlmMesCompensation>>({ method: 'GET', url: `${BASE}/compensations`, params }),

  detail: (id: number): Promise<IntgPlmMesCompensation> =>
    request<IntgPlmMesCompensation>({ method: 'GET', url: `${BASE}/compensations/${id}` }),

  create: (data: IntgPlmMesCompensationSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/compensations`, data }),

  update: (id: number, data: IntgPlmMesCompensationSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/compensations/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/compensations/${id}` }),
};

/* ---------------- 6. 对账 ---------------- */

export const intgPlmMesReconcileService = {
  page: (params: IntgPlmMesReconcileQuery): Promise<PageResult<IntgPlmMesReconcile>> =>
    request<PageResult<IntgPlmMesReconcile>>({ method: 'GET', url: `${BASE}/reconciles`, params }),

  detail: (id: number): Promise<IntgPlmMesReconcile> =>
    request<IntgPlmMesReconcile>({ method: 'GET', url: `${BASE}/reconciles/${id}` }),

  create: (data: IntgPlmMesReconcileSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/reconciles`, data }),

  update: (id: number, data: IntgPlmMesReconcileSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/reconciles/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/reconciles/${id}` }),
};
