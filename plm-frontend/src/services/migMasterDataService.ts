import { request } from '@/services/request';
import type { PageResult } from '@/types/common';
import type {
  MigMasterDataInterface,
  MigMasterDataInterfaceQuery,
  MigMasterDataInterfaceSaveRequest,
  MigMasterDataMapping,
  MigMasterDataMappingQuery,
  MigMasterDataMappingSaveRequest,
  MigMasterDataBatch,
  MigMasterDataBatchQuery,
  MigMasterDataBatchSaveRequest,
  MigMasterDataReceipt,
  MigMasterDataReceiptQuery,
  MigMasterDataReceiptSaveRequest,
  MigMasterDataCompensation,
  MigMasterDataCompensationQuery,
  MigMasterDataCompensationSaveRequest,
  MigMasterDataReconcile,
  MigMasterDataReconcileQuery,
  MigMasterDataReconcileSaveRequest,
} from '@/types/migMasterData';

/** G9-N1 六系统集成—主数据迁移（T076，后端 Base: /mig/master-data）服务定义。 */

const BASE = '/mig/master-data';

/* ---------------- 1. 集成接口定义 ---------------- */

export const migMasterDataInterfaceService = {
  page: (params: MigMasterDataInterfaceQuery): Promise<PageResult<MigMasterDataInterface>> =>
    request<PageResult<MigMasterDataInterface>>({ method: 'GET', url: `${BASE}/interfaces`, params }),

  detail: (id: number): Promise<MigMasterDataInterface> =>
    request<MigMasterDataInterface>({ method: 'GET', url: `${BASE}/interfaces/${id}` }),

  create: (data: MigMasterDataInterfaceSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/interfaces`, data }),

  update: (id: number, data: MigMasterDataInterfaceSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/interfaces/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/interfaces/${id}` }),
};

/* ---------------- 2. 字段映射 ---------------- */

export const migMasterDataMappingService = {
  page: (params: MigMasterDataMappingQuery): Promise<PageResult<MigMasterDataMapping>> =>
    request<PageResult<MigMasterDataMapping>>({ method: 'GET', url: `${BASE}/mappings`, params }),

  detail: (id: number): Promise<MigMasterDataMapping> =>
    request<MigMasterDataMapping>({ method: 'GET', url: `${BASE}/mappings/${id}` }),

  create: (data: MigMasterDataMappingSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/mappings`, data }),

  update: (id: number, data: MigMasterDataMappingSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/mappings/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/mappings/${id}` }),
};

/* ---------------- 3. 同步批次 ---------------- */

export const migMasterDataBatchService = {
  page: (params: MigMasterDataBatchQuery): Promise<PageResult<MigMasterDataBatch>> =>
    request<PageResult<MigMasterDataBatch>>({ method: 'GET', url: `${BASE}/batches`, params }),

  detail: (id: number): Promise<MigMasterDataBatch> =>
    request<MigMasterDataBatch>({ method: 'GET', url: `${BASE}/batches/${id}` }),

  create: (data: MigMasterDataBatchSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/batches`, data }),

  update: (id: number, data: MigMasterDataBatchSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/batches/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/batches/${id}` }),
};

/* ---------------- 4. 系统接收回执 ---------------- */

export const migMasterDataReceiptService = {
  page: (params: MigMasterDataReceiptQuery): Promise<PageResult<MigMasterDataReceipt>> =>
    request<PageResult<MigMasterDataReceipt>>({ method: 'GET', url: `${BASE}/receipts`, params }),

  detail: (id: number): Promise<MigMasterDataReceipt> =>
    request<MigMasterDataReceipt>({ method: 'GET', url: `${BASE}/receipts/${id}` }),

  create: (data: MigMasterDataReceiptSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/receipts`, data }),

  update: (id: number, data: MigMasterDataReceiptSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/receipts/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/receipts/${id}` }),
};

/* ---------------- 5. 异常补偿 ---------------- */

export const migMasterDataCompensationService = {
  page: (params: MigMasterDataCompensationQuery): Promise<PageResult<MigMasterDataCompensation>> =>
    request<PageResult<MigMasterDataCompensation>>({ method: 'GET', url: `${BASE}/compensations`, params }),

  detail: (id: number): Promise<MigMasterDataCompensation> =>
    request<MigMasterDataCompensation>({ method: 'GET', url: `${BASE}/compensations/${id}` }),

  create: (data: MigMasterDataCompensationSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/compensations`, data }),

  update: (id: number, data: MigMasterDataCompensationSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/compensations/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/compensations/${id}` }),
};

/* ---------------- 6. 对账 ---------------- */

export const migMasterDataReconcileService = {
  page: (params: MigMasterDataReconcileQuery): Promise<PageResult<MigMasterDataReconcile>> =>
    request<PageResult<MigMasterDataReconcile>>({ method: 'GET', url: `${BASE}/reconciles`, params }),

  detail: (id: number): Promise<MigMasterDataReconcile> =>
    request<MigMasterDataReconcile>({ method: 'GET', url: `${BASE}/reconciles/${id}` }),

  create: (data: MigMasterDataReconcileSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/reconciles`, data }),

  update: (id: number, data: MigMasterDataReconcileSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/reconciles/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/reconciles/${id}` }),
};
