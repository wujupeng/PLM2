import { request } from '@/services/request';
import type { PageResult } from '@/types/common';
import type {
  ErpOutsourceInbound,
  ErpOutsourceInboundQuery,
  ErpOutsourceInboundSaveRequest,
  ErpOutsourceInspection,
  ErpOutsourceInspectionQuery,
  ErpOutsourceInspectionSaveRequest,
  ErpOutsourceInvoice,
  ErpOutsourceInvoiceQuery,
  ErpOutsourceInvoiceSaveRequest,
  ErpOutsourceIssue,
  ErpOutsourceIssueDetail,
  ErpOutsourceIssueLineSaveRequest,
  ErpOutsourceIssueQuery,
  ErpOutsourceIssueSaveRequest,
  ErpOutsourceOrder,
  ErpOutsourceOrderDetail,
  ErpOutsourceOrderLineSaveRequest,
  ErpOutsourceOrderQuery,
  ErpOutsourceOrderSaveRequest,
  ErpOutsourceReceipt,
  ErpOutsourceReceiptDetail,
  ErpOutsourceReceiptLineSaveRequest,
  ErpOutsourceReceiptQuery,
  ErpOutsourceReceiptSaveRequest,
  ErpOutsourceReturn,
  ErpOutsourceReturnQuery,
  ErpOutsourceReturnSaveRequest,
  ErpOutsourceSettlement,
  ErpOutsourceSettlementQuery,
  ErpOutsourceSettlementSaveRequest,
  ErpOutsourceWriteoff,
  ErpOutsourceWriteoffQuery,
  ErpOutsourceWriteoffSaveRequest,
} from '@/types/erpOutsource';

/** G3-N3b ERP 委外管理（后端 Base: /erp/outsource）服务定义。 */

const BASE = '/erp/outsource';

/* ---------------- 1. 委外订单（主子表） ---------------- */

export const erpOutsourceOrderService = {
  page: (params: ErpOutsourceOrderQuery): Promise<PageResult<ErpOutsourceOrder>> =>
    request<PageResult<ErpOutsourceOrder>>({ method: 'GET', url: `${BASE}/orders`, params }),

  detail: (id: number): Promise<ErpOutsourceOrderDetail> =>
    request<ErpOutsourceOrderDetail>({ method: 'GET', url: `${BASE}/orders/${id}` }),

  create: (data: ErpOutsourceOrderSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/orders`, data }),

  update: (id: number, data: ErpOutsourceOrderSaveRequest): Promise<void> =>
    request<void>({ method: 'PUT', url: `${BASE}/orders/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/orders/${id}` }),

  addLine: (headerId: number, data: ErpOutsourceOrderLineSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/orders/${headerId}/lines`, data }),

  updateLine: (lineId: number, data: ErpOutsourceOrderLineSaveRequest): Promise<void> =>
    request<void>({ method: 'PUT', url: `${BASE}/orders/lines/${lineId}`, data }),

  removeLine: (lineId: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/orders/lines/${lineId}` }),
};

/* ---------------- 2. 委外发料（主子表） ---------------- */

export const erpOutsourceIssueService = {
  page: (params: ErpOutsourceIssueQuery): Promise<PageResult<ErpOutsourceIssue>> =>
    request<PageResult<ErpOutsourceIssue>>({ method: 'GET', url: `${BASE}/issues`, params }),

  detail: (id: number): Promise<ErpOutsourceIssueDetail> =>
    request<ErpOutsourceIssueDetail>({ method: 'GET', url: `${BASE}/issues/${id}` }),

  create: (data: ErpOutsourceIssueSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/issues`, data }),

  update: (id: number, data: ErpOutsourceIssueSaveRequest): Promise<void> =>
    request<void>({ method: 'PUT', url: `${BASE}/issues/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/issues/${id}` }),

  addLine: (headerId: number, data: ErpOutsourceIssueLineSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/issues/${headerId}/lines`, data }),

  updateLine: (lineId: number, data: ErpOutsourceIssueLineSaveRequest): Promise<void> =>
    request<void>({ method: 'PUT', url: `${BASE}/issues/lines/${lineId}`, data }),

  removeLine: (lineId: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/issues/lines/${lineId}` }),
};

/* ---------------- 3. 委外到货（主子表） ---------------- */

export const erpOutsourceReceiptService = {
  page: (params: ErpOutsourceReceiptQuery): Promise<PageResult<ErpOutsourceReceipt>> =>
    request<PageResult<ErpOutsourceReceipt>>({ method: 'GET', url: `${BASE}/receipts`, params }),

  detail: (id: number): Promise<ErpOutsourceReceiptDetail> =>
    request<ErpOutsourceReceiptDetail>({ method: 'GET', url: `${BASE}/receipts/${id}` }),

  create: (data: ErpOutsourceReceiptSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/receipts`, data }),

  update: (id: number, data: ErpOutsourceReceiptSaveRequest): Promise<void> =>
    request<void>({ method: 'PUT', url: `${BASE}/receipts/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/receipts/${id}` }),

  addLine: (headerId: number, data: ErpOutsourceReceiptLineSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/receipts/${headerId}/lines`, data }),

  updateLine: (lineId: number, data: ErpOutsourceReceiptLineSaveRequest): Promise<void> =>
    request<void>({ method: 'PUT', url: `${BASE}/receipts/lines/${lineId}`, data }),

  removeLine: (lineId: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/receipts/lines/${lineId}` }),
};

/* ---------------- 4. 委外报检 ---------------- */

export const erpOutsourceInspectionService = {
  page: (params: ErpOutsourceInspectionQuery): Promise<PageResult<ErpOutsourceInspection>> =>
    request<PageResult<ErpOutsourceInspection>>({ method: 'GET', url: `${BASE}/inspections`, params }),

  detail: (id: number): Promise<ErpOutsourceInspection> =>
    request<ErpOutsourceInspection>({ method: 'GET', url: `${BASE}/inspections/${id}` }),

  create: (data: ErpOutsourceInspectionSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/inspections`, data }),

  update: (id: number, data: ErpOutsourceInspectionSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/inspections/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/inspections/${id}` }),
};

/* ---------------- 5. 委外入库 ---------------- */

export const erpOutsourceInboundService = {
  page: (params: ErpOutsourceInboundQuery): Promise<PageResult<ErpOutsourceInbound>> =>
    request<PageResult<ErpOutsourceInbound>>({ method: 'GET', url: `${BASE}/inbounds`, params }),

  detail: (id: number): Promise<ErpOutsourceInbound> =>
    request<ErpOutsourceInbound>({ method: 'GET', url: `${BASE}/inbounds/${id}` }),

  create: (data: ErpOutsourceInboundSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/inbounds`, data }),

  update: (id: number, data: ErpOutsourceInboundSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/inbounds/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/inbounds/${id}` }),
};

/* ---------------- 6. 委外发票 ---------------- */

export const erpOutsourceInvoiceService = {
  page: (params: ErpOutsourceInvoiceQuery): Promise<PageResult<ErpOutsourceInvoice>> =>
    request<PageResult<ErpOutsourceInvoice>>({ method: 'GET', url: `${BASE}/invoices`, params }),

  detail: (id: number): Promise<ErpOutsourceInvoice> =>
    request<ErpOutsourceInvoice>({ method: 'GET', url: `${BASE}/invoices/${id}` }),

  create: (data: ErpOutsourceInvoiceSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/invoices`, data }),

  update: (id: number, data: ErpOutsourceInvoiceSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/invoices/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/invoices/${id}` }),
};

/* ---------------- 7. 委外结算 ---------------- */

export const erpOutsourceSettlementService = {
  page: (params: ErpOutsourceSettlementQuery): Promise<PageResult<ErpOutsourceSettlement>> =>
    request<PageResult<ErpOutsourceSettlement>>({ method: 'GET', url: `${BASE}/settlements`, params }),

  detail: (id: number): Promise<ErpOutsourceSettlement> =>
    request<ErpOutsourceSettlement>({ method: 'GET', url: `${BASE}/settlements/${id}` }),

  create: (data: ErpOutsourceSettlementSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/settlements`, data }),

  update: (id: number, data: ErpOutsourceSettlementSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/settlements/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/settlements/${id}` }),
};

/* ---------------- 8. 委外核销 ---------------- */

export const erpOutsourceWriteoffService = {
  page: (params: ErpOutsourceWriteoffQuery): Promise<PageResult<ErpOutsourceWriteoff>> =>
    request<PageResult<ErpOutsourceWriteoff>>({ method: 'GET', url: `${BASE}/writeoffs`, params }),

  detail: (id: number): Promise<ErpOutsourceWriteoff> =>
    request<ErpOutsourceWriteoff>({ method: 'GET', url: `${BASE}/writeoffs/${id}` }),

  create: (data: ErpOutsourceWriteoffSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/writeoffs`, data }),

  update: (id: number, data: ErpOutsourceWriteoffSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/writeoffs/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/writeoffs/${id}` }),
};

/* ---------------- 9. 委外退货 ---------------- */

export const erpOutsourceReturnService = {
  page: (params: ErpOutsourceReturnQuery): Promise<PageResult<ErpOutsourceReturn>> =>
    request<PageResult<ErpOutsourceReturn>>({ method: 'GET', url: `${BASE}/returns`, params }),

  detail: (id: number): Promise<ErpOutsourceReturn> =>
    request<ErpOutsourceReturn>({ method: 'GET', url: `${BASE}/returns/${id}` }),

  create: (data: ErpOutsourceReturnSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/returns`, data }),

  update: (id: number, data: ErpOutsourceReturnSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/returns/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/returns/${id}` }),
};
