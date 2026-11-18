import { request } from '@/services/request';
import type { PageResult } from '@/types/common';
import type {
  SrmAward,
  SrmAwardQuery,
  SrmAwardSaveRequest,
  SrmPriceAgreement,
  SrmPriceAgreementQuery,
  SrmPriceAgreementSaveRequest,
  SrmPriceCompare,
  SrmPriceCompareQuery,
  SrmPriceCompareSaveRequest,
  SrmRfq,
  SrmRfqQuery,
  SrmRfqSaveRequest,
  SrmRfqSupplier,
  SrmRfqSupplierQuery,
  SrmRfqSupplierSaveRequest,
  SrmSourcingRequest,
  SrmSourcingRequestQuery,
  SrmSourcingRequestSaveRequest,
  SrmSupplierQuote,
  SrmSupplierQuoteQuery,
  SrmSupplierQuoteSaveRequest,
} from '@/types/srmSourcing';

/** G4-N2 SRM 寻源与询报价（T032，后端 Base: /srm）服务定义。 */

const BASE = '/srm';

/* ---------------- 1. 采购需求寻源 ---------------- */

export const srmSourcingRequestService = {
  page: (params: SrmSourcingRequestQuery): Promise<PageResult<SrmSourcingRequest>> =>
    request<PageResult<SrmSourcingRequest>>({
      method: 'GET',
      url: `${BASE}/sourcing-requests`,
      params,
    }),

  detail: (id: number): Promise<SrmSourcingRequest> =>
    request<SrmSourcingRequest>({ method: 'GET', url: `${BASE}/sourcing-requests/${id}` }),

  create: (data: SrmSourcingRequestSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/sourcing-requests`, data }),

  update: (id: number, data: SrmSourcingRequestSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/sourcing-requests/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/sourcing-requests/${id}` }),
};

/* ---------------- 2. 询价单 ---------------- */

export const srmRfqService = {
  page: (params: SrmRfqQuery): Promise<PageResult<SrmRfq>> =>
    request<PageResult<SrmRfq>>({ method: 'GET', url: `${BASE}/rfqs`, params }),

  detail: (id: number): Promise<SrmRfq> =>
    request<SrmRfq>({ method: 'GET', url: `${BASE}/rfqs/${id}` }),

  create: (data: SrmRfqSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/rfqs`, data }),

  update: (id: number, data: SrmRfqSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/rfqs/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/rfqs/${id}` }),
};

/* ---------------- 3. 询价邀请 ---------------- */

export const srmRfqSupplierService = {
  page: (params: SrmRfqSupplierQuery): Promise<PageResult<SrmRfqSupplier>> =>
    request<PageResult<SrmRfqSupplier>>({ method: 'GET', url: `${BASE}/rfq-suppliers`, params }),

  detail: (id: number): Promise<SrmRfqSupplier> =>
    request<SrmRfqSupplier>({ method: 'GET', url: `${BASE}/rfq-suppliers/${id}` }),

  create: (data: SrmRfqSupplierSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/rfq-suppliers`, data }),

  update: (id: number, data: SrmRfqSupplierSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/rfq-suppliers/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/rfq-suppliers/${id}` }),
};

/* ---------------- 4. 供应商报价 ---------------- */

export const srmSupplierQuoteService = {
  page: (params: SrmSupplierQuoteQuery): Promise<PageResult<SrmSupplierQuote>> =>
    request<PageResult<SrmSupplierQuote>>({
      method: 'GET',
      url: `${BASE}/supplier-quotes`,
      params,
    }),

  detail: (id: number): Promise<SrmSupplierQuote> =>
    request<SrmSupplierQuote>({ method: 'GET', url: `${BASE}/supplier-quotes/${id}` }),

  create: (data: SrmSupplierQuoteSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/supplier-quotes`, data }),

  update: (id: number, data: SrmSupplierQuoteSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/supplier-quotes/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/supplier-quotes/${id}` }),
};

/* ---------------- 5. 报价比价 ---------------- */

export const srmPriceCompareService = {
  page: (params: SrmPriceCompareQuery): Promise<PageResult<SrmPriceCompare>> =>
    request<PageResult<SrmPriceCompare>>({ method: 'GET', url: `${BASE}/price-compares`, params }),

  detail: (id: number): Promise<SrmPriceCompare> =>
    request<SrmPriceCompare>({ method: 'GET', url: `${BASE}/price-compares/${id}` }),

  create: (data: SrmPriceCompareSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/price-compares`, data }),

  update: (id: number, data: SrmPriceCompareSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/price-compares/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/price-compares/${id}` }),
};

/* ---------------- 6. 定点定标 ---------------- */

export const srmAwardService = {
  page: (params: SrmAwardQuery): Promise<PageResult<SrmAward>> =>
    request<PageResult<SrmAward>>({ method: 'GET', url: `${BASE}/awards`, params }),

  detail: (id: number): Promise<SrmAward> =>
    request<SrmAward>({ method: 'GET', url: `${BASE}/awards/${id}` }),

  create: (data: SrmAwardSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/awards`, data }),

  update: (id: number, data: SrmAwardSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/awards/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/awards/${id}` }),
};

/* ---------------- 7. 定点定价 ---------------- */

export const srmPriceAgreementService = {
  page: (params: SrmPriceAgreementQuery): Promise<PageResult<SrmPriceAgreement>> =>
    request<PageResult<SrmPriceAgreement>>({
      method: 'GET',
      url: `${BASE}/price-agreements`,
      params,
    }),

  detail: (id: number): Promise<SrmPriceAgreement> =>
    request<SrmPriceAgreement>({ method: 'GET', url: `${BASE}/price-agreements/${id}` }),

  create: (data: SrmPriceAgreementSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/price-agreements`, data }),

  update: (id: number, data: SrmPriceAgreementSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/price-agreements/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/price-agreements/${id}` }),
};
