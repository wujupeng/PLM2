import { request } from '@/services/request';
import type { PageResult } from '@/types/common';
import type {
  MigBomInterface,
  MigBomInterfaceQuery,
  MigBomInterfaceSaveRequest,
  MigBomMapping,
  MigBomMappingQuery,
  MigBomMappingSaveRequest,
  MigBomBatch,
  MigBomBatchQuery,
  MigBomBatchSaveRequest,
  MigBomReceipt,
  MigBomReceiptQuery,
  MigBomReceiptSaveRequest,
  MigBomCompensation,
  MigBomCompensationQuery,
  MigBomCompensationSaveRequest,
  MigBomReconcile,
  MigBomReconcileQuery,
  MigBomReconcileSaveRequest,
} from '@/types/migBom';

/** G9-N2 六系统集成—BOM迁移（T077，后端 Base: /mig/bom）服务定义。 */

const BASE = '/mig/bom';

/* ---------------- 1. 集成接口定义 ---------------- */

export const migBomInterfaceService = {
  page: (params: MigBomInterfaceQuery): Promise<PageResult<MigBomInterface>> =>
    request<PageResult<MigBomInterface>>({ method: 'GET', url: `${BASE}/interfaces`, params }),

  detail: (id: number): Promise<MigBomInterface> =>
    request<MigBomInterface>({ method: 'GET', url: `${BASE}/interfaces/${id}` }),

  create: (data: MigBomInterfaceSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/interfaces`, data }),

  update: (id: number, data: MigBomInterfaceSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/interfaces/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/interfaces/${id}` }),
};

/* ---------------- 2. 字段映射 ---------------- */

export const migBomMappingService = {
  page: (params: MigBomMappingQuery): Promise<PageResult<MigBomMapping>> =>
    request<PageResult<MigBomMapping>>({ method: 'GET', url: `${BASE}/mappings`, params }),

  detail: (id: number): Promise<MigBomMapping> =>
    request<MigBomMapping>({ method: 'GET', url: `${BASE}/mappings/${id}` }),

  create: (data: MigBomMappingSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/mappings`, data }),

  update: (id: number, data: MigBomMappingSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/mappings/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/mappings/${id}` }),
};

/* ---------------- 3. 同步批次 ---------------- */

export const migBomBatchService = {
  page: (params: MigBomBatchQuery): Promise<PageResult<MigBomBatch>> =>
    request<PageResult<MigBomBatch>>({ method: 'GET', url: `${BASE}/batches`, params }),

  detail: (id: number): Promise<MigBomBatch> =>
    request<MigBomBatch>({ method: 'GET', url: `${BASE}/batches/${id}` }),

  create: (data: MigBomBatchSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/batches`, data }),

  update: (id: number, data: MigBomBatchSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/batches/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/batches/${id}` }),
};

/* ---------------- 4. 系统接收回执 ---------------- */

export const migBomReceiptService = {
  page: (params: MigBomReceiptQuery): Promise<PageResult<MigBomReceipt>> =>
    request<PageResult<MigBomReceipt>>({ method: 'GET', url: `${BASE}/receipts`, params }),

  detail: (id: number): Promise<MigBomReceipt> =>
    request<MigBomReceipt>({ method: 'GET', url: `${BASE}/receipts/${id}` }),

  create: (data: MigBomReceiptSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/receipts`, data }),

  update: (id: number, data: MigBomReceiptSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/receipts/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/receipts/${id}` }),
};

/* ---------------- 5. 异常补偿 ---------------- */

export const migBomCompensationService = {
  page: (params: MigBomCompensationQuery): Promise<PageResult<MigBomCompensation>> =>
    request<PageResult<MigBomCompensation>>({ method: 'GET', url: `${BASE}/compensations`, params }),

  detail: (id: number): Promise<MigBomCompensation> =>
    request<MigBomCompensation>({ method: 'GET', url: `${BASE}/compensations/${id}` }),

  create: (data: MigBomCompensationSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/compensations`, data }),

  update: (id: number, data: MigBomCompensationSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/compensations/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/compensations/${id}` }),
};

/* ---------------- 6. 对账 ---------------- */

export const migBomReconcileService = {
  page: (params: MigBomReconcileQuery): Promise<PageResult<MigBomReconcile>> =>
    request<PageResult<MigBomReconcile>>({ method: 'GET', url: `${BASE}/reconciles`, params }),

  detail: (id: number): Promise<MigBomReconcile> =>
    request<MigBomReconcile>({ method: 'GET', url: `${BASE}/reconciles/${id}` }),

  create: (data: MigBomReconcileSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/reconciles`, data }),

  update: (id: number, data: MigBomReconcileSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/reconciles/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/reconciles/${id}` }),
};
