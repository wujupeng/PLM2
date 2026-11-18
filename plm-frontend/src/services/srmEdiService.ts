import { request } from '@/services/request';
import type { PageResult } from '@/types/common';
import type {
  SrmEdiMessage,
  SrmEdiMessageQuery,
  SrmEdiMessageSaveRequest,
  SrmEdiReceipt,
  SrmEdiReceiptQuery,
  SrmEdiReceiptSaveRequest,
  SrmEdiReconcile,
  SrmEdiReconcileQuery,
  SrmEdiReconcileSaveRequest,
} from '@/types/srmEdi';

/** G4-N6 SRM EDI 协同（T036，后端 Base: /srm/edi）服务定义。 */

const BASE = '/srm/edi';

/* ---------------- 1. EDI 报文 ---------------- */

export const srmEdiMessageService = {
  page: (params: SrmEdiMessageQuery): Promise<PageResult<SrmEdiMessage>> =>
    request<PageResult<SrmEdiMessage>>({ method: 'GET', url: `${BASE}/messages`, params }),

  detail: (id: number): Promise<SrmEdiMessage> =>
    request<SrmEdiMessage>({ method: 'GET', url: `${BASE}/messages/${id}` }),

  create: (data: SrmEdiMessageSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/messages`, data }),

  update: (id: number, data: SrmEdiMessageSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/messages/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/messages/${id}` }),
};

/* ---------------- 2. EDI 回执 ---------------- */

export const srmEdiReceiptService = {
  page: (params: SrmEdiReceiptQuery): Promise<PageResult<SrmEdiReceipt>> =>
    request<PageResult<SrmEdiReceipt>>({ method: 'GET', url: `${BASE}/receipts`, params }),

  detail: (id: number): Promise<SrmEdiReceipt> =>
    request<SrmEdiReceipt>({ method: 'GET', url: `${BASE}/receipts/${id}` }),

  create: (data: SrmEdiReceiptSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/receipts`, data }),

  update: (id: number, data: SrmEdiReceiptSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/receipts/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/receipts/${id}` }),
};

/* ---------------- 3. EDI 对账 ---------------- */

export const srmEdiReconcileService = {
  page: (params: SrmEdiReconcileQuery): Promise<PageResult<SrmEdiReconcile>> =>
    request<PageResult<SrmEdiReconcile>>({ method: 'GET', url: `${BASE}/reconciles`, params }),

  detail: (id: number): Promise<SrmEdiReconcile> =>
    request<SrmEdiReconcile>({ method: 'GET', url: `${BASE}/reconciles/${id}` }),

  create: (data: SrmEdiReconcileSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/reconciles`, data }),

  update: (id: number, data: SrmEdiReconcileSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/reconciles/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/reconciles/${id}` }),
};
