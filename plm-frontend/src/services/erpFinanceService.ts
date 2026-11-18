import { request } from '@/services/request';
import type { PageResult } from '@/types/common';
import type {
  ErpFinanceAccount,
  ErpFinanceAccountQuery,
  ErpFinanceAccountSaveRequest,
  ErpFinanceAccrual,
  ErpFinanceAccrualQuery,
  ErpFinanceAccrualSaveRequest,
  ErpFinanceBankStatement,
  ErpFinanceBankStatementQuery,
  ErpFinanceBankStatementSaveRequest,
  ErpFinanceCostCollection,
  ErpFinanceCostCollectionQuery,
  ErpFinanceCostCollectionSaveRequest,
  ErpFinanceInvoice,
  ErpFinanceInvoiceQuery,
  ErpFinanceInvoiceSaveRequest,
  ErpFinancePayable,
  ErpFinancePayableQuery,
  ErpFinancePayableSaveRequest,
  ErpFinancePayment,
  ErpFinancePaymentQuery,
  ErpFinancePaymentSaveRequest,
  ErpFinancePeriod,
  ErpFinancePeriodQuery,
  ErpFinancePeriodSaveRequest,
  ErpFinanceReceivable,
  ErpFinanceReceivableQuery,
  ErpFinanceReceivableSaveRequest,
  ErpFinanceVoucher,
  ErpFinanceVoucherDetail,
  ErpFinanceVoucherLineSaveRequest,
  ErpFinanceVoucherQuery,
  ErpFinanceVoucherSaveRequest,
  ErpFinanceWriteoff,
  ErpFinanceWriteoffQuery,
  ErpFinanceWriteoffSaveRequest,
} from '@/types/erpFinance';

/** G3-N6 ERP 财务核算（T028，后端 Base: /erp/finance）服务定义。 */

const BASE = '/erp/finance';

/* ---------------- 1. 会计科目 ---------------- */

export const erpFinanceAccountService = {
  page: (params: ErpFinanceAccountQuery): Promise<PageResult<ErpFinanceAccount>> =>
    request<PageResult<ErpFinanceAccount>>({ method: 'GET', url: `${BASE}/accounts`, params }),

  detail: (id: number): Promise<ErpFinanceAccount> =>
    request<ErpFinanceAccount>({ method: 'GET', url: `${BASE}/accounts/${id}` }),

  create: (data: ErpFinanceAccountSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/accounts`, data }),

  update: (id: number, data: ErpFinanceAccountSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/accounts/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/accounts/${id}` }),
};

/* ---------------- 2. 会计期间 ---------------- */

export const erpFinancePeriodService = {
  page: (params: ErpFinancePeriodQuery): Promise<PageResult<ErpFinancePeriod>> =>
    request<PageResult<ErpFinancePeriod>>({ method: 'GET', url: `${BASE}/periods`, params }),

  detail: (id: number): Promise<ErpFinancePeriod> =>
    request<ErpFinancePeriod>({ method: 'GET', url: `${BASE}/periods/${id}` }),

  create: (data: ErpFinancePeriodSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/periods`, data }),

  update: (id: number, data: ErpFinancePeriodSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/periods/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/periods/${id}` }),
};

/* ---------------- 3. 记账凭证（主子表） ---------------- */

export const erpFinanceVoucherService = {
  page: (params: ErpFinanceVoucherQuery): Promise<PageResult<ErpFinanceVoucher>> =>
    request<PageResult<ErpFinanceVoucher>>({ method: 'GET', url: `${BASE}/vouchers`, params }),

  detail: (id: number): Promise<ErpFinanceVoucherDetail> =>
    request<ErpFinanceVoucherDetail>({ method: 'GET', url: `${BASE}/vouchers/${id}` }),

  create: (data: ErpFinanceVoucherSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/vouchers`, data }),

  update: (id: number, data: ErpFinanceVoucherSaveRequest): Promise<void> =>
    request<void>({ method: 'PUT', url: `${BASE}/vouchers/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/vouchers/${id}` }),

  addLine: (headerId: number, data: ErpFinanceVoucherLineSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/vouchers/${headerId}/lines`, data }),

  updateLine: (lineId: number, data: ErpFinanceVoucherLineSaveRequest): Promise<void> =>
    request<void>({ method: 'PUT', url: `${BASE}/vouchers/lines/${lineId}`, data }),

  removeLine: (lineId: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/vouchers/lines/${lineId}` }),
};

/* ---------------- 4. 应收单 ---------------- */

export const erpFinanceReceivableService = {
  page: (params: ErpFinanceReceivableQuery): Promise<PageResult<ErpFinanceReceivable>> =>
    request<PageResult<ErpFinanceReceivable>>({ method: 'GET', url: `${BASE}/receivables`, params }),

  detail: (id: number): Promise<ErpFinanceReceivable> =>
    request<ErpFinanceReceivable>({ method: 'GET', url: `${BASE}/receivables/${id}` }),

  create: (data: ErpFinanceReceivableSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/receivables`, data }),

  update: (id: number, data: ErpFinanceReceivableSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/receivables/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/receivables/${id}` }),
};

/* ---------------- 5. 应付单 ---------------- */

export const erpFinancePayableService = {
  page: (params: ErpFinancePayableQuery): Promise<PageResult<ErpFinancePayable>> =>
    request<PageResult<ErpFinancePayable>>({ method: 'GET', url: `${BASE}/payables`, params }),

  detail: (id: number): Promise<ErpFinancePayable> =>
    request<ErpFinancePayable>({ method: 'GET', url: `${BASE}/payables/${id}` }),

  create: (data: ErpFinancePayableSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/payables`, data }),

  update: (id: number, data: ErpFinancePayableSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/payables/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/payables/${id}` }),
};

/* ---------------- 6. 收付款单 ---------------- */

export const erpFinancePaymentService = {
  page: (params: ErpFinancePaymentQuery): Promise<PageResult<ErpFinancePayment>> =>
    request<PageResult<ErpFinancePayment>>({ method: 'GET', url: `${BASE}/payments`, params }),

  detail: (id: number): Promise<ErpFinancePayment> =>
    request<ErpFinancePayment>({ method: 'GET', url: `${BASE}/payments/${id}` }),

  create: (data: ErpFinancePaymentSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/payments`, data }),

  update: (id: number, data: ErpFinancePaymentSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/payments/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/payments/${id}` }),
};

/* ---------------- 7. 核销单 ---------------- */

export const erpFinanceWriteoffService = {
  page: (params: ErpFinanceWriteoffQuery): Promise<PageResult<ErpFinanceWriteoff>> =>
    request<PageResult<ErpFinanceWriteoff>>({ method: 'GET', url: `${BASE}/writeoffs`, params }),

  detail: (id: number): Promise<ErpFinanceWriteoff> =>
    request<ErpFinanceWriteoff>({ method: 'GET', url: `${BASE}/writeoffs/${id}` }),

  create: (data: ErpFinanceWriteoffSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/writeoffs`, data }),

  update: (id: number, data: ErpFinanceWriteoffSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/writeoffs/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/writeoffs/${id}` }),
};

/* ---------------- 8. 发票登记 ---------------- */

export const erpFinanceInvoiceService = {
  page: (params: ErpFinanceInvoiceQuery): Promise<PageResult<ErpFinanceInvoice>> =>
    request<PageResult<ErpFinanceInvoice>>({ method: 'GET', url: `${BASE}/invoices`, params }),

  detail: (id: number): Promise<ErpFinanceInvoice> =>
    request<ErpFinanceInvoice>({ method: 'GET', url: `${BASE}/invoices/${id}` }),

  create: (data: ErpFinanceInvoiceSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/invoices`, data }),

  update: (id: number, data: ErpFinanceInvoiceSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/invoices/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/invoices/${id}` }),
};

/* ---------------- 9. 银行对账单 ---------------- */

export const erpFinanceBankStatementService = {
  page: (params: ErpFinanceBankStatementQuery): Promise<PageResult<ErpFinanceBankStatement>> =>
    request<PageResult<ErpFinanceBankStatement>>({ method: 'GET', url: `${BASE}/bank-statements`, params }),

  detail: (id: number): Promise<ErpFinanceBankStatement> =>
    request<ErpFinanceBankStatement>({ method: 'GET', url: `${BASE}/bank-statements/${id}` }),

  create: (data: ErpFinanceBankStatementSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/bank-statements`, data }),

  update: (id: number, data: ErpFinanceBankStatementSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/bank-statements/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/bank-statements/${id}` }),
};

/* ---------------- 10. 成本归集 ---------------- */

export const erpFinanceCostCollectionService = {
  page: (params: ErpFinanceCostCollectionQuery): Promise<PageResult<ErpFinanceCostCollection>> =>
    request<PageResult<ErpFinanceCostCollection>>({ method: 'GET', url: `${BASE}/cost-collections`, params }),

  detail: (id: number): Promise<ErpFinanceCostCollection> =>
    request<ErpFinanceCostCollection>({ method: 'GET', url: `${BASE}/cost-collections/${id}` }),

  create: (data: ErpFinanceCostCollectionSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/cost-collections`, data }),

  update: (id: number, data: ErpFinanceCostCollectionSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/cost-collections/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/cost-collections/${id}` }),
};

/* ---------------- 11. 暂估 ---------------- */

export const erpFinanceAccrualService = {
  page: (params: ErpFinanceAccrualQuery): Promise<PageResult<ErpFinanceAccrual>> =>
    request<PageResult<ErpFinanceAccrual>>({ method: 'GET', url: `${BASE}/accruals`, params }),

  detail: (id: number): Promise<ErpFinanceAccrual> =>
    request<ErpFinanceAccrual>({ method: 'GET', url: `${BASE}/accruals/${id}` }),

  create: (data: ErpFinanceAccrualSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/accruals`, data }),

  update: (id: number, data: ErpFinanceAccrualSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/accruals/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/accruals/${id}` }),
};
