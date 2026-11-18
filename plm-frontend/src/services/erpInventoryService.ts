import { request } from '@/services/request';
import type { PageResult } from '@/types/common';
import type {
  ErpInventoryBalance,
  ErpInventoryBalanceQuery,
  ErpInventoryBalanceSaveRequest,
  ErpInventoryConversion,
  ErpInventoryConversionQuery,
  ErpInventoryConversionSaveRequest,
  ErpInventoryCost,
  ErpInventoryCostQuery,
  ErpInventoryCostSaveRequest,
  ErpInventoryCount,
  ErpInventoryCountDetail,
  ErpInventoryCountLineSaveRequest,
  ErpInventoryCountQuery,
  ErpInventoryCountSaveRequest,
  ErpInventoryFreeze,
  ErpInventoryFreezeQuery,
  ErpInventoryFreezeSaveRequest,
  ErpInventoryScrap,
  ErpInventoryScrapQuery,
  ErpInventoryScrapSaveRequest,
  ErpInventoryTransaction,
  ErpInventoryTransactionQuery,
  ErpInventoryTransactionSaveRequest,
  ErpInventoryTransfer,
  ErpInventoryTransferDetail,
  ErpInventoryTransferLineSaveRequest,
  ErpInventoryTransferQuery,
  ErpInventoryTransferSaveRequest,
} from '@/types/erpInventory';

/** G3-N5 ERP 库存核算（T027/T097，后端 Base: /erp/inventory）服务定义。 */

const BASE = '/erp/inventory';

/* ---------------- 1. 库存余额 ---------------- */

export const erpInventoryBalanceService = {
  page: (params: ErpInventoryBalanceQuery): Promise<PageResult<ErpInventoryBalance>> =>
    request<PageResult<ErpInventoryBalance>>({ method: 'GET', url: `${BASE}/balances`, params }),

  detail: (id: number): Promise<ErpInventoryBalance> =>
    request<ErpInventoryBalance>({ method: 'GET', url: `${BASE}/balances/${id}` }),

  create: (data: ErpInventoryBalanceSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/balances`, data }),

  update: (id: number, data: ErpInventoryBalanceSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/balances/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/balances/${id}` }),
};

/* ---------------- 2. 库存流水 ---------------- */

export const erpInventoryTransactionService = {
  page: (params: ErpInventoryTransactionQuery): Promise<PageResult<ErpInventoryTransaction>> =>
    request<PageResult<ErpInventoryTransaction>>({ method: 'GET', url: `${BASE}/transactions`, params }),

  detail: (id: number): Promise<ErpInventoryTransaction> =>
    request<ErpInventoryTransaction>({ method: 'GET', url: `${BASE}/transactions/${id}` }),

  create: (data: ErpInventoryTransactionSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/transactions`, data }),

  update: (id: number, data: ErpInventoryTransactionSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/transactions/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/transactions/${id}` }),
};

/* ---------------- 3. 库存调拨（主子表） ---------------- */

export const erpInventoryTransferService = {
  page: (params: ErpInventoryTransferQuery): Promise<PageResult<ErpInventoryTransfer>> =>
    request<PageResult<ErpInventoryTransfer>>({ method: 'GET', url: `${BASE}/transfers`, params }),

  detail: (id: number): Promise<ErpInventoryTransferDetail> =>
    request<ErpInventoryTransferDetail>({ method: 'GET', url: `${BASE}/transfers/${id}` }),

  create: (data: ErpInventoryTransferSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/transfers`, data }),

  update: (id: number, data: ErpInventoryTransferSaveRequest): Promise<void> =>
    request<void>({ method: 'PUT', url: `${BASE}/transfers/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/transfers/${id}` }),

  addLine: (headerId: number, data: ErpInventoryTransferLineSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/transfers/${headerId}/lines`, data }),

  updateLine: (lineId: number, data: ErpInventoryTransferLineSaveRequest): Promise<void> =>
    request<void>({ method: 'PUT', url: `${BASE}/transfers/lines/${lineId}`, data }),

  removeLine: (lineId: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/transfers/lines/${lineId}` }),
};

/* ---------------- 4. 库存盘点（主子表） ---------------- */

export const erpInventoryCountService = {
  page: (params: ErpInventoryCountQuery): Promise<PageResult<ErpInventoryCount>> =>
    request<PageResult<ErpInventoryCount>>({ method: 'GET', url: `${BASE}/counts`, params }),

  detail: (id: number): Promise<ErpInventoryCountDetail> =>
    request<ErpInventoryCountDetail>({ method: 'GET', url: `${BASE}/counts/${id}` }),

  create: (data: ErpInventoryCountSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/counts`, data }),

  update: (id: number, data: ErpInventoryCountSaveRequest): Promise<void> =>
    request<void>({ method: 'PUT', url: `${BASE}/counts/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/counts/${id}` }),

  addLine: (headerId: number, data: ErpInventoryCountLineSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/counts/${headerId}/lines`, data }),

  updateLine: (lineId: number, data: ErpInventoryCountLineSaveRequest): Promise<void> =>
    request<void>({ method: 'PUT', url: `${BASE}/counts/lines/${lineId}`, data }),

  removeLine: (lineId: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/counts/lines/${lineId}` }),
};

/* ---------------- 5. 形态转换 ---------------- */

export const erpInventoryConversionService = {
  page: (params: ErpInventoryConversionQuery): Promise<PageResult<ErpInventoryConversion>> =>
    request<PageResult<ErpInventoryConversion>>({ method: 'GET', url: `${BASE}/conversions`, params }),

  detail: (id: number): Promise<ErpInventoryConversion> =>
    request<ErpInventoryConversion>({ method: 'GET', url: `${BASE}/conversions/${id}` }),

  create: (data: ErpInventoryConversionSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/conversions`, data }),

  update: (id: number, data: ErpInventoryConversionSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/conversions/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/conversions/${id}` }),
};

/* ---------------- 6. 库存报废 ---------------- */

export const erpInventoryScrapService = {
  page: (params: ErpInventoryScrapQuery): Promise<PageResult<ErpInventoryScrap>> =>
    request<PageResult<ErpInventoryScrap>>({ method: 'GET', url: `${BASE}/scraps`, params }),

  detail: (id: number): Promise<ErpInventoryScrap> =>
    request<ErpInventoryScrap>({ method: 'GET', url: `${BASE}/scraps/${id}` }),

  create: (data: ErpInventoryScrapSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/scraps`, data }),

  update: (id: number, data: ErpInventoryScrapSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/scraps/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/scraps/${id}` }),
};

/* ---------------- 7. 库存冻结 ---------------- */

export const erpInventoryFreezeService = {
  page: (params: ErpInventoryFreezeQuery): Promise<PageResult<ErpInventoryFreeze>> =>
    request<PageResult<ErpInventoryFreeze>>({ method: 'GET', url: `${BASE}/freezes`, params }),

  detail: (id: number): Promise<ErpInventoryFreeze> =>
    request<ErpInventoryFreeze>({ method: 'GET', url: `${BASE}/freezes/${id}` }),

  create: (data: ErpInventoryFreezeSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/freezes`, data }),

  update: (id: number, data: ErpInventoryFreezeSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/freezes/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/freezes/${id}` }),
};

/* ---------------- 8. 库存成本 ---------------- */

export const erpInventoryCostService = {
  page: (params: ErpInventoryCostQuery): Promise<PageResult<ErpInventoryCost>> =>
    request<PageResult<ErpInventoryCost>>({ method: 'GET', url: `${BASE}/costs`, params }),

  detail: (id: number): Promise<ErpInventoryCost> =>
    request<ErpInventoryCost>({ method: 'GET', url: `${BASE}/costs/${id}` }),

  create: (data: ErpInventoryCostSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/costs`, data }),

  update: (id: number, data: ErpInventoryCostSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/costs/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/costs/${id}` }),
};
