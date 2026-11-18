import { request } from '@/services/request';
import type { PageResult } from '@/types/common';
import type {
  ErpCompletionReceipt,
  ErpCompletionReceiptQuery,
  ErpCompletionReceiptSaveRequest,
  ErpMaterialAddition,
  ErpMaterialAdditionQuery,
  ErpMaterialAdditionSaveRequest,
  ErpMaterialIssue,
  ErpMaterialIssueDetail,
  ErpMaterialIssueLineSaveRequest,
  ErpMaterialIssueQuery,
  ErpMaterialIssueSaveRequest,
  ErpProductionOrder,
  ErpProductionOrderDetail,
  ErpProductionOrderLineSaveRequest,
  ErpProductionOrderQuery,
  ErpProductionOrderSaveRequest,
  ErpProductionOrderSplit,
  ErpProductionOrderSplitQuery,
  ErpProductionOrderSplitSaveRequest,
} from '@/types/erpProduction';

/** G3-N4b ERP 生产管理（T026/T096，后端 Base: /erp/production）服务定义。 */

const BASE = '/erp/production';

/* ---------------- 1. 生产订单（主子表） ---------------- */

export const erpProductionOrderService = {
  page: (params: ErpProductionOrderQuery): Promise<PageResult<ErpProductionOrder>> =>
    request<PageResult<ErpProductionOrder>>({ method: 'GET', url: `${BASE}/orders`, params }),

  detail: (id: number): Promise<ErpProductionOrderDetail> =>
    request<ErpProductionOrderDetail>({ method: 'GET', url: `${BASE}/orders/${id}` }),

  create: (data: ErpProductionOrderSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/orders`, data }),

  update: (id: number, data: ErpProductionOrderSaveRequest): Promise<void> =>
    request<void>({ method: 'PUT', url: `${BASE}/orders/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/orders/${id}` }),

  addLine: (headerId: number, data: ErpProductionOrderLineSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/orders/${headerId}/lines`, data }),

  updateLine: (lineId: number, data: ErpProductionOrderLineSaveRequest): Promise<void> =>
    request<void>({ method: 'PUT', url: `${BASE}/orders/lines/${lineId}`, data }),

  removeLine: (lineId: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/orders/lines/${lineId}` }),
};

/* ---------------- 2. 订单拆分单 ---------------- */

export const erpProductionOrderSplitService = {
  page: (params: ErpProductionOrderSplitQuery): Promise<PageResult<ErpProductionOrderSplit>> =>
    request<PageResult<ErpProductionOrderSplit>>({ method: 'GET', url: `${BASE}/splits`, params }),

  detail: (id: number): Promise<ErpProductionOrderSplit> =>
    request<ErpProductionOrderSplit>({ method: 'GET', url: `${BASE}/splits/${id}` }),

  create: (data: ErpProductionOrderSplitSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/splits`, data }),

  update: (id: number, data: ErpProductionOrderSplitSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/splits/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/splits/${id}` }),
};

/* ---------------- 3. 材料领用单（主子表） ---------------- */

export const erpMaterialIssueService = {
  page: (params: ErpMaterialIssueQuery): Promise<PageResult<ErpMaterialIssue>> =>
    request<PageResult<ErpMaterialIssue>>({ method: 'GET', url: `${BASE}/material-issues`, params }),

  detail: (id: number): Promise<ErpMaterialIssueDetail> =>
    request<ErpMaterialIssueDetail>({ method: 'GET', url: `${BASE}/material-issues/${id}` }),

  create: (data: ErpMaterialIssueSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/material-issues`, data }),

  update: (id: number, data: ErpMaterialIssueSaveRequest): Promise<void> =>
    request<void>({ method: 'PUT', url: `${BASE}/material-issues/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/material-issues/${id}` }),

  addLine: (headerId: number, data: ErpMaterialIssueLineSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/material-issues/${headerId}/lines`, data }),

  updateLine: (lineId: number, data: ErpMaterialIssueLineSaveRequest): Promise<void> =>
    request<void>({ method: 'PUT', url: `${BASE}/material-issues/lines/${lineId}`, data }),

  removeLine: (lineId: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/material-issues/lines/${lineId}` }),
};

/* ---------------- 4. 生产补料单 ---------------- */

export const erpMaterialAdditionService = {
  page: (params: ErpMaterialAdditionQuery): Promise<PageResult<ErpMaterialAddition>> =>
    request<PageResult<ErpMaterialAddition>>({ method: 'GET', url: `${BASE}/material-additions`, params }),

  detail: (id: number): Promise<ErpMaterialAddition> =>
    request<ErpMaterialAddition>({ method: 'GET', url: `${BASE}/material-additions/${id}` }),

  create: (data: ErpMaterialAdditionSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/material-additions`, data }),

  update: (id: number, data: ErpMaterialAdditionSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/material-additions/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/material-additions/${id}` }),
};

/* ---------------- 5. 完工入库单 ---------------- */

export const erpCompletionReceiptService = {
  page: (params: ErpCompletionReceiptQuery): Promise<PageResult<ErpCompletionReceipt>> =>
    request<PageResult<ErpCompletionReceipt>>({ method: 'GET', url: `${BASE}/completion-receipts`, params }),

  detail: (id: number): Promise<ErpCompletionReceipt> =>
    request<ErpCompletionReceipt>({ method: 'GET', url: `${BASE}/completion-receipts/${id}` }),

  create: (data: ErpCompletionReceiptSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/completion-receipts`, data }),

  update: (id: number, data: ErpCompletionReceiptSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/completion-receipts/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/completion-receipts/${id}` }),
};
