import { request } from '@/services/request';
import type { PageResult } from '@/types/common';
import type {
  ErpDeliveryOrder,
  ErpDeliveryOrderDetail,
  ErpDeliveryOrderLineSaveRequest,
  ErpDeliveryOrderQuery,
  ErpDeliveryOrderSaveRequest,
  ErpDeliveryReview,
  ErpDeliveryReviewQuery,
  ErpDeliveryReviewSaveRequest,
  ErpOrderChange,
  ErpOrderChangeQuery,
  ErpOrderChangeSaveRequest,
  ErpSalesForecast,
  ErpSalesForecastQuery,
  ErpSalesForecastSaveRequest,
  ErpSalesInvoice,
  ErpSalesInvoiceQuery,
  ErpSalesInvoiceSaveRequest,
  ErpSalesOrder,
  ErpSalesOrderDetail,
  ErpSalesOrderLineSaveRequest,
  ErpSalesOrderQuery,
  ErpSalesOrderSaveRequest,
  ErpSalesOutbound,
  ErpSalesOutboundQuery,
  ErpSalesOutboundSaveRequest,
  ErpSalesReceivable,
  ErpSalesReceivableQuery,
  ErpSalesReceivableSaveRequest,
  ErpSalesReturn,
  ErpSalesReturnQuery,
  ErpSalesReturnSaveRequest,
} from '@/types/erpSales';

/** G3-N2 ERP 销售管理（后端 Base: /erp/sales）服务定义。 */

const BASE = '/erp/sales';

/* ---------------- 1. 销售预测 ---------------- */

export const erpSalesForecastService = {
  page: (params: ErpSalesForecastQuery): Promise<PageResult<ErpSalesForecast>> =>
    request<PageResult<ErpSalesForecast>>({ method: 'GET', url: `${BASE}/forecasts`, params }),

  detail: (id: number): Promise<ErpSalesForecast> =>
    request<ErpSalesForecast>({ method: 'GET', url: `${BASE}/forecasts/${id}` }),

  create: (data: ErpSalesForecastSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/forecasts`, data }),

  update: (id: number, data: ErpSalesForecastSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/forecasts/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/forecasts/${id}` }),
};

/* ---------------- 2. 销售订单（主子表） ---------------- */

export const erpSalesOrderService = {
  page: (params: ErpSalesOrderQuery): Promise<PageResult<ErpSalesOrder>> =>
    request<PageResult<ErpSalesOrder>>({ method: 'GET', url: `${BASE}/orders`, params }),

  detail: (id: number): Promise<ErpSalesOrderDetail> =>
    request<ErpSalesOrderDetail>({ method: 'GET', url: `${BASE}/orders/${id}` }),

  create: (data: ErpSalesOrderSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/orders`, data }),

  update: (id: number, data: ErpSalesOrderSaveRequest): Promise<void> =>
    request<void>({ method: 'PUT', url: `${BASE}/orders/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/orders/${id}` }),

  addLine: (headerId: number, data: ErpSalesOrderLineSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/orders/${headerId}/lines`, data }),

  updateLine: (lineId: number, data: ErpSalesOrderLineSaveRequest): Promise<void> =>
    request<void>({ method: 'PUT', url: `${BASE}/orders/lines/${lineId}`, data }),

  removeLine: (lineId: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/orders/lines/${lineId}` }),
};

/* ---------------- 3. 订单变更 ---------------- */

export const erpOrderChangeService = {
  page: (params: ErpOrderChangeQuery): Promise<PageResult<ErpOrderChange>> =>
    request<PageResult<ErpOrderChange>>({ method: 'GET', url: `${BASE}/order-changes`, params }),

  detail: (id: number): Promise<ErpOrderChange> =>
    request<ErpOrderChange>({ method: 'GET', url: `${BASE}/order-changes/${id}` }),

  create: (data: ErpOrderChangeSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/order-changes`, data }),

  update: (id: number, data: ErpOrderChangeSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/order-changes/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/order-changes/${id}` }),
};

/* ---------------- 4. 交期评审 ---------------- */

export const erpDeliveryReviewService = {
  page: (params: ErpDeliveryReviewQuery): Promise<PageResult<ErpDeliveryReview>> =>
    request<PageResult<ErpDeliveryReview>>({ method: 'GET', url: `${BASE}/delivery-reviews`, params }),

  detail: (id: number): Promise<ErpDeliveryReview> =>
    request<ErpDeliveryReview>({ method: 'GET', url: `${BASE}/delivery-reviews/${id}` }),

  create: (data: ErpDeliveryReviewSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/delivery-reviews`, data }),

  update: (id: number, data: ErpDeliveryReviewSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/delivery-reviews/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/delivery-reviews/${id}` }),
};

/* ---------------- 5. 发货单（主子表） ---------------- */

export const erpDeliveryOrderService = {
  page: (params: ErpDeliveryOrderQuery): Promise<PageResult<ErpDeliveryOrder>> =>
    request<PageResult<ErpDeliveryOrder>>({ method: 'GET', url: `${BASE}/deliveries`, params }),

  detail: (id: number): Promise<ErpDeliveryOrderDetail> =>
    request<ErpDeliveryOrderDetail>({ method: 'GET', url: `${BASE}/deliveries/${id}` }),

  create: (data: ErpDeliveryOrderSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/deliveries`, data }),

  update: (id: number, data: ErpDeliveryOrderSaveRequest): Promise<void> =>
    request<void>({ method: 'PUT', url: `${BASE}/deliveries/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/deliveries/${id}` }),

  addLine: (headerId: number, data: ErpDeliveryOrderLineSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/deliveries/${headerId}/lines`, data }),

  updateLine: (lineId: number, data: ErpDeliveryOrderLineSaveRequest): Promise<void> =>
    request<void>({ method: 'PUT', url: `${BASE}/deliveries/lines/${lineId}`, data }),

  removeLine: (lineId: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/deliveries/lines/${lineId}` }),
};

/* ---------------- 6. 销售出库 ---------------- */

export const erpSalesOutboundService = {
  page: (params: ErpSalesOutboundQuery): Promise<PageResult<ErpSalesOutbound>> =>
    request<PageResult<ErpSalesOutbound>>({ method: 'GET', url: `${BASE}/outbounds`, params }),

  detail: (id: number): Promise<ErpSalesOutbound> =>
    request<ErpSalesOutbound>({ method: 'GET', url: `${BASE}/outbounds/${id}` }),

  create: (data: ErpSalesOutboundSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/outbounds`, data }),

  update: (id: number, data: ErpSalesOutboundSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/outbounds/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/outbounds/${id}` }),
};

/* ---------------- 7. 销售退货 ---------------- */

export const erpSalesReturnService = {
  page: (params: ErpSalesReturnQuery): Promise<PageResult<ErpSalesReturn>> =>
    request<PageResult<ErpSalesReturn>>({ method: 'GET', url: `${BASE}/returns`, params }),

  detail: (id: number): Promise<ErpSalesReturn> =>
    request<ErpSalesReturn>({ method: 'GET', url: `${BASE}/returns/${id}` }),

  create: (data: ErpSalesReturnSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/returns`, data }),

  update: (id: number, data: ErpSalesReturnSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/returns/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/returns/${id}` }),
};

/* ---------------- 8. 销售发票 ---------------- */

export const erpSalesInvoiceService = {
  page: (params: ErpSalesInvoiceQuery): Promise<PageResult<ErpSalesInvoice>> =>
    request<PageResult<ErpSalesInvoice>>({ method: 'GET', url: `${BASE}/invoices`, params }),

  detail: (id: number): Promise<ErpSalesInvoice> =>
    request<ErpSalesInvoice>({ method: 'GET', url: `${BASE}/invoices/${id}` }),

  create: (data: ErpSalesInvoiceSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/invoices`, data }),

  update: (id: number, data: ErpSalesInvoiceSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/invoices/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/invoices/${id}` }),
};

/* ---------------- 9. 应收账款 ---------------- */

export const erpSalesReceivableService = {
  page: (params: ErpSalesReceivableQuery): Promise<PageResult<ErpSalesReceivable>> =>
    request<PageResult<ErpSalesReceivable>>({ method: 'GET', url: `${BASE}/receivables`, params }),

  detail: (id: number): Promise<ErpSalesReceivable> =>
    request<ErpSalesReceivable>({ method: 'GET', url: `${BASE}/receivables/${id}` }),

  create: (data: ErpSalesReceivableSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/receivables`, data }),

  update: (id: number, data: ErpSalesReceivableSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/receivables/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/receivables/${id}` }),
};
