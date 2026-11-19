import { request } from '@/services/request';
import type { PageResult } from '@/types/common';
import type {
  MigInventoryInterface,
  MigInventoryInterfaceQuery,
  MigInventoryInterfaceSaveRequest,
  MigInventoryMapping,
  MigInventoryMappingQuery,
  MigInventoryMappingSaveRequest,
  MigInventoryBatch,
  MigInventoryBatchQuery,
  MigInventoryBatchSaveRequest,
  MigInventoryReceipt,
  MigInventoryReceiptQuery,
  MigInventoryReceiptSaveRequest,
  MigInventoryCompensation,
  MigInventoryCompensationQuery,
  MigInventoryCompensationSaveRequest,
  MigInventoryReconcile,
  MigInventoryReconcileQuery,
  MigInventoryReconcileSaveRequest,
} from '@/types/migInventory';

/** G9-N3 六系统集成—库存迁移（T078，后端 Base: /mig/inventory）服务定义。 */

const BASE = '/mig/inventory';

/* ---------------- 1. 集成接口定义 ---------------- */

export const migInventoryInterfaceService = {
  page: (params: MigInventoryInterfaceQuery): Promise<PageResult<MigInventoryInterface>> =>
    request<PageResult<MigInventoryInterface>>({ method: 'GET', url: `${BASE}/interfaces`, params }),

  detail: (id: number): Promise<MigInventoryInterface> =>
    request<MigInventoryInterface>({ method: 'GET', url: `${BASE}/interfaces/${id}` }),

  create: (data: MigInventoryInterfaceSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/interfaces`, data }),

  update: (id: number, data: MigInventoryInterfaceSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/interfaces/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/interfaces/${id}` }),
};

/* ---------------- 2. 字段映射 ---------------- */

export const migInventoryMappingService = {
  page: (params: MigInventoryMappingQuery): Promise<PageResult<MigInventoryMapping>> =>
    request<PageResult<MigInventoryMapping>>({ method: 'GET', url: `${BASE}/mappings`, params }),

  detail: (id: number): Promise<MigInventoryMapping> =>
    request<MigInventoryMapping>({ method: 'GET', url: `${BASE}/mappings/${id}` }),

  create: (data: MigInventoryMappingSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/mappings`, data }),

  update: (id: number, data: MigInventoryMappingSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/mappings/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/mappings/${id}` }),
};

/* ---------------- 3. 同步批次 ---------------- */

export const migInventoryBatchService = {
  page: (params: MigInventoryBatchQuery): Promise<PageResult<MigInventoryBatch>> =>
    request<PageResult<MigInventoryBatch>>({ method: 'GET', url: `${BASE}/batches`, params }),

  detail: (id: number): Promise<MigInventoryBatch> =>
    request<MigInventoryBatch>({ method: 'GET', url: `${BASE}/batches/${id}` }),

  create: (data: MigInventoryBatchSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/batches`, data }),

  update: (id: number, data: MigInventoryBatchSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/batches/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/batches/${id}` }),
};

/* ---------------- 4. 系统接收回执 ---------------- */

export const migInventoryReceiptService = {
  page: (params: MigInventoryReceiptQuery): Promise<PageResult<MigInventoryReceipt>> =>
    request<PageResult<MigInventoryReceipt>>({ method: 'GET', url: `${BASE}/receipts`, params }),

  detail: (id: number): Promise<MigInventoryReceipt> =>
    request<MigInventoryReceipt>({ method: 'GET', url: `${BASE}/receipts/${id}` }),

  create: (data: MigInventoryReceiptSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/receipts`, data }),

  update: (id: number, data: MigInventoryReceiptSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/receipts/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/receipts/${id}` }),
};

/* ---------------- 5. 异常补偿 ---------------- */

export const migInventoryCompensationService = {
  page: (params: MigInventoryCompensationQuery): Promise<PageResult<MigInventoryCompensation>> =>
    request<PageResult<MigInventoryCompensation>>({ method: 'GET', url: `${BASE}/compensations`, params }),

  detail: (id: number): Promise<MigInventoryCompensation> =>
    request<MigInventoryCompensation>({ method: 'GET', url: `${BASE}/compensations/${id}` }),

  create: (data: MigInventoryCompensationSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/compensations`, data }),

  update: (id: number, data: MigInventoryCompensationSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/compensations/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/compensations/${id}` }),
};

/* ---------------- 6. 对账 ---------------- */

export const migInventoryReconcileService = {
  page: (params: MigInventoryReconcileQuery): Promise<PageResult<MigInventoryReconcile>> =>
    request<PageResult<MigInventoryReconcile>>({ method: 'GET', url: `${BASE}/reconciles`, params }),

  detail: (id: number): Promise<MigInventoryReconcile> =>
    request<MigInventoryReconcile>({ method: 'GET', url: `${BASE}/reconciles/${id}` }),

  create: (data: MigInventoryReconcileSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/reconciles`, data }),

  update: (id: number, data: MigInventoryReconcileSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/reconciles/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/reconciles/${id}` }),
};
