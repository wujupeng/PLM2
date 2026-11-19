import { request } from '@/services/request';
import type { PageResult } from '@/types/common';
import type {
  MigOpenBusinessInterface,
  MigOpenBusinessInterfaceQuery,
  MigOpenBusinessInterfaceSaveRequest,
  MigOpenBusinessMapping,
  MigOpenBusinessMappingQuery,
  MigOpenBusinessMappingSaveRequest,
  MigOpenBusinessBatch,
  MigOpenBusinessBatchQuery,
  MigOpenBusinessBatchSaveRequest,
  MigOpenBusinessReceipt,
  MigOpenBusinessReceiptQuery,
  MigOpenBusinessReceiptSaveRequest,
  MigOpenBusinessCompensation,
  MigOpenBusinessCompensationQuery,
  MigOpenBusinessCompensationSaveRequest,
  MigOpenBusinessReconcile,
  MigOpenBusinessReconcileQuery,
  MigOpenBusinessReconcileSaveRequest,
} from '@/types/migOpenBusiness';

/** G9-N4 六系统集成—未结业务迁移（T079，后端 Base: /mig/open-business）服务定义。 */

const BASE = '/mig/open-business';

/* ---------------- 1. 集成接口定义 ---------------- */

export const migOpenBusinessInterfaceService = {
  page: (params: MigOpenBusinessInterfaceQuery): Promise<PageResult<MigOpenBusinessInterface>> =>
    request<PageResult<MigOpenBusinessInterface>>({ method: 'GET', url: `${BASE}/interfaces`, params }),

  detail: (id: number): Promise<MigOpenBusinessInterface> =>
    request<MigOpenBusinessInterface>({ method: 'GET', url: `${BASE}/interfaces/${id}` }),

  create: (data: MigOpenBusinessInterfaceSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/interfaces`, data }),

  update: (id: number, data: MigOpenBusinessInterfaceSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/interfaces/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/interfaces/${id}` }),
};

/* ---------------- 2. 字段映射 ---------------- */

export const migOpenBusinessMappingService = {
  page: (params: MigOpenBusinessMappingQuery): Promise<PageResult<MigOpenBusinessMapping>> =>
    request<PageResult<MigOpenBusinessMapping>>({ method: 'GET', url: `${BASE}/mappings`, params }),

  detail: (id: number): Promise<MigOpenBusinessMapping> =>
    request<MigOpenBusinessMapping>({ method: 'GET', url: `${BASE}/mappings/${id}` }),

  create: (data: MigOpenBusinessMappingSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/mappings`, data }),

  update: (id: number, data: MigOpenBusinessMappingSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/mappings/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/mappings/${id}` }),
};

/* ---------------- 3. 同步批次 ---------------- */

export const migOpenBusinessBatchService = {
  page: (params: MigOpenBusinessBatchQuery): Promise<PageResult<MigOpenBusinessBatch>> =>
    request<PageResult<MigOpenBusinessBatch>>({ method: 'GET', url: `${BASE}/batches`, params }),

  detail: (id: number): Promise<MigOpenBusinessBatch> =>
    request<MigOpenBusinessBatch>({ method: 'GET', url: `${BASE}/batches/${id}` }),

  create: (data: MigOpenBusinessBatchSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/batches`, data }),

  update: (id: number, data: MigOpenBusinessBatchSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/batches/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/batches/${id}` }),
};

/* ---------------- 4. 系统接收回执 ---------------- */

export const migOpenBusinessReceiptService = {
  page: (params: MigOpenBusinessReceiptQuery): Promise<PageResult<MigOpenBusinessReceipt>> =>
    request<PageResult<MigOpenBusinessReceipt>>({ method: 'GET', url: `${BASE}/receipts`, params }),

  detail: (id: number): Promise<MigOpenBusinessReceipt> =>
    request<MigOpenBusinessReceipt>({ method: 'GET', url: `${BASE}/receipts/${id}` }),

  create: (data: MigOpenBusinessReceiptSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/receipts`, data }),

  update: (id: number, data: MigOpenBusinessReceiptSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/receipts/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/receipts/${id}` }),
};

/* ---------------- 5. 异常补偿 ---------------- */

export const migOpenBusinessCompensationService = {
  page: (params: MigOpenBusinessCompensationQuery): Promise<PageResult<MigOpenBusinessCompensation>> =>
    request<PageResult<MigOpenBusinessCompensation>>({ method: 'GET', url: `${BASE}/compensations`, params }),

  detail: (id: number): Promise<MigOpenBusinessCompensation> =>
    request<MigOpenBusinessCompensation>({ method: 'GET', url: `${BASE}/compensations/${id}` }),

  create: (data: MigOpenBusinessCompensationSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/compensations`, data }),

  update: (id: number, data: MigOpenBusinessCompensationSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/compensations/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/compensations/${id}` }),
};

/* ---------------- 6. 对账 ---------------- */

export const migOpenBusinessReconcileService = {
  page: (params: MigOpenBusinessReconcileQuery): Promise<PageResult<MigOpenBusinessReconcile>> =>
    request<PageResult<MigOpenBusinessReconcile>>({ method: 'GET', url: `${BASE}/reconciles`, params }),

  detail: (id: number): Promise<MigOpenBusinessReconcile> =>
    request<MigOpenBusinessReconcile>({ method: 'GET', url: `${BASE}/reconciles/${id}` }),

  create: (data: MigOpenBusinessReconcileSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/reconciles`, data }),

  update: (id: number, data: MigOpenBusinessReconcileSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/reconciles/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/reconciles/${id}` }),
};
