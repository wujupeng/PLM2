import { request } from '@/services/request';
import type { PageResult } from '@/types/common';
import type {
  ErpGoodsReceipt,
  ErpGoodsReceiptDetail,
  ErpGoodsReceiptLineSaveRequest,
  ErpGoodsReceiptQuery,
  ErpGoodsReceiptSaveRequest,
  ErpPurchaseInbound,
  ErpPurchaseInboundQuery,
  ErpPurchaseInboundSaveRequest,
  ErpPurchaseInquiry,
  ErpPurchaseInquiryQuery,
  ErpPurchaseInquirySaveRequest,
  ErpPurchaseInspection,
  ErpPurchaseInspectionQuery,
  ErpPurchaseInspectionSaveRequest,
  ErpPurchaseInvoice,
  ErpPurchaseInvoiceQuery,
  ErpPurchaseInvoiceSaveRequest,
  ErpPurchaseOrder,
  ErpPurchaseOrderDetail,
  ErpPurchaseOrderLineSaveRequest,
  ErpPurchaseOrderQuery,
  ErpPurchaseOrderSaveRequest,
  ErpPurchaseRequisition,
  ErpPurchaseRequisitionDetail,
  ErpPurchaseRequisitionLineSaveRequest,
  ErpPurchaseRequisitionQuery,
  ErpPurchaseRequisitionSaveRequest,
  ErpPurchaseReturn,
  ErpPurchaseReturnQuery,
  ErpPurchaseReturnSaveRequest,
  ErpPurchaseSettlement,
  ErpPurchaseSettlementQuery,
  ErpPurchaseSettlementSaveRequest,
} from '@/types/erpPurchase';

/** G3-N3a ERP 采购管理（后端 Base: /erp/purchase）服务定义。 */

const BASE = '/erp/purchase';

/* ---------------- 1. 请购单（主子表） ---------------- */

export const erpPurchaseRequisitionService = {
  page: (params: ErpPurchaseRequisitionQuery): Promise<PageResult<ErpPurchaseRequisition>> =>
    request<PageResult<ErpPurchaseRequisition>>({ method: 'GET', url: `${BASE}/requisitions`, params }),

  detail: (id: number): Promise<ErpPurchaseRequisitionDetail> =>
    request<ErpPurchaseRequisitionDetail>({ method: 'GET', url: `${BASE}/requisitions/${id}` }),

  create: (data: ErpPurchaseRequisitionSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/requisitions`, data }),

  update: (id: number, data: ErpPurchaseRequisitionSaveRequest): Promise<void> =>
    request<void>({ method: 'PUT', url: `${BASE}/requisitions/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/requisitions/${id}` }),

  addLine: (headerId: number, data: ErpPurchaseRequisitionLineSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/requisitions/${headerId}/lines`, data }),

  updateLine: (lineId: number, data: ErpPurchaseRequisitionLineSaveRequest): Promise<void> =>
    request<void>({ method: 'PUT', url: `${BASE}/requisitions/lines/${lineId}`, data }),

  removeLine: (lineId: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/requisitions/lines/${lineId}` }),
};

/* ---------------- 2. 询价单 ---------------- */

export const erpPurchaseInquiryService = {
  page: (params: ErpPurchaseInquiryQuery): Promise<PageResult<ErpPurchaseInquiry>> =>
    request<PageResult<ErpPurchaseInquiry>>({ method: 'GET', url: `${BASE}/inquiries`, params }),

  detail: (id: number): Promise<ErpPurchaseInquiry> =>
    request<ErpPurchaseInquiry>({ method: 'GET', url: `${BASE}/inquiries/${id}` }),

  create: (data: ErpPurchaseInquirySaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/inquiries`, data }),

  update: (id: number, data: ErpPurchaseInquirySaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/inquiries/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/inquiries/${id}` }),
};

/* ---------------- 3. 采购订单（主子表） ---------------- */

export const erpPurchaseOrderService = {
  page: (params: ErpPurchaseOrderQuery): Promise<PageResult<ErpPurchaseOrder>> =>
    request<PageResult<ErpPurchaseOrder>>({ method: 'GET', url: `${BASE}/orders`, params }),

  detail: (id: number): Promise<ErpPurchaseOrderDetail> =>
    request<ErpPurchaseOrderDetail>({ method: 'GET', url: `${BASE}/orders/${id}` }),

  create: (data: ErpPurchaseOrderSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/orders`, data }),

  update: (id: number, data: ErpPurchaseOrderSaveRequest): Promise<void> =>
    request<void>({ method: 'PUT', url: `${BASE}/orders/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/orders/${id}` }),

  addLine: (headerId: number, data: ErpPurchaseOrderLineSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/orders/${headerId}/lines`, data }),

  updateLine: (lineId: number, data: ErpPurchaseOrderLineSaveRequest): Promise<void> =>
    request<void>({ method: 'PUT', url: `${BASE}/orders/lines/${lineId}`, data }),

  removeLine: (lineId: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/orders/lines/${lineId}` }),
};

/* ---------------- 4. 采购到货单（主子表） ---------------- */

export const erpGoodsReceiptService = {
  page: (params: ErpGoodsReceiptQuery): Promise<PageResult<ErpGoodsReceipt>> =>
    request<PageResult<ErpGoodsReceipt>>({ method: 'GET', url: `${BASE}/receipts`, params }),

  detail: (id: number): Promise<ErpGoodsReceiptDetail> =>
    request<ErpGoodsReceiptDetail>({ method: 'GET', url: `${BASE}/receipts/${id}` }),

  create: (data: ErpGoodsReceiptSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/receipts`, data }),

  update: (id: number, data: ErpGoodsReceiptSaveRequest): Promise<void> =>
    request<void>({ method: 'PUT', url: `${BASE}/receipts/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/receipts/${id}` }),

  addLine: (headerId: number, data: ErpGoodsReceiptLineSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/receipts/${headerId}/lines`, data }),

  updateLine: (lineId: number, data: ErpGoodsReceiptLineSaveRequest): Promise<void> =>
    request<void>({ method: 'PUT', url: `${BASE}/receipts/lines/${lineId}`, data }),

  removeLine: (lineId: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/receipts/lines/${lineId}` }),
};

/* ---------------- 5. 采购报检 ---------------- */

export const erpPurchaseInspectionService = {
  page: (params: ErpPurchaseInspectionQuery): Promise<PageResult<ErpPurchaseInspection>> =>
    request<PageResult<ErpPurchaseInspection>>({ method: 'GET', url: `${BASE}/inspections`, params }),

  detail: (id: number): Promise<ErpPurchaseInspection> =>
    request<ErpPurchaseInspection>({ method: 'GET', url: `${BASE}/inspections/${id}` }),

  create: (data: ErpPurchaseInspectionSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/inspections`, data }),

  update: (id: number, data: ErpPurchaseInspectionSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/inspections/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/inspections/${id}` }),
};

/* ---------------- 6. 采购入库 ---------------- */

export const erpPurchaseInboundService = {
  page: (params: ErpPurchaseInboundQuery): Promise<PageResult<ErpPurchaseInbound>> =>
    request<PageResult<ErpPurchaseInbound>>({ method: 'GET', url: `${BASE}/inbounds`, params }),

  detail: (id: number): Promise<ErpPurchaseInbound> =>
    request<ErpPurchaseInbound>({ method: 'GET', url: `${BASE}/inbounds/${id}` }),

  create: (data: ErpPurchaseInboundSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/inbounds`, data }),

  update: (id: number, data: ErpPurchaseInboundSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/inbounds/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/inbounds/${id}` }),
};

/* ---------------- 7. 采购发票 ---------------- */

export const erpPurchaseInvoiceService = {
  page: (params: ErpPurchaseInvoiceQuery): Promise<PageResult<ErpPurchaseInvoice>> =>
    request<PageResult<ErpPurchaseInvoice>>({ method: 'GET', url: `${BASE}/invoices`, params }),

  detail: (id: number): Promise<ErpPurchaseInvoice> =>
    request<ErpPurchaseInvoice>({ method: 'GET', url: `${BASE}/invoices/${id}` }),

  create: (data: ErpPurchaseInvoiceSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/invoices`, data }),

  update: (id: number, data: ErpPurchaseInvoiceSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/invoices/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/invoices/${id}` }),
};

/* ---------------- 8. 采购退货 ---------------- */

export const erpPurchaseReturnService = {
  page: (params: ErpPurchaseReturnQuery): Promise<PageResult<ErpPurchaseReturn>> =>
    request<PageResult<ErpPurchaseReturn>>({ method: 'GET', url: `${BASE}/returns`, params }),

  detail: (id: number): Promise<ErpPurchaseReturn> =>
    request<ErpPurchaseReturn>({ method: 'GET', url: `${BASE}/returns/${id}` }),

  create: (data: ErpPurchaseReturnSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/returns`, data }),

  update: (id: number, data: ErpPurchaseReturnSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/returns/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/returns/${id}` }),
};

/* ---------------- 9. 采购结算 ---------------- */

export const erpPurchaseSettlementService = {
  page: (params: ErpPurchaseSettlementQuery): Promise<PageResult<ErpPurchaseSettlement>> =>
    request<PageResult<ErpPurchaseSettlement>>({ method: 'GET', url: `${BASE}/settlements`, params }),

  detail: (id: number): Promise<ErpPurchaseSettlement> =>
    request<ErpPurchaseSettlement>({ method: 'GET', url: `${BASE}/settlements/${id}` }),

  create: (data: ErpPurchaseSettlementSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/settlements`, data }),

  update: (id: number, data: ErpPurchaseSettlementSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/settlements/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/settlements/${id}` }),
};
