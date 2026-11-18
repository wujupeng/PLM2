import { request } from '@/services/request';
import type { PageResult } from '@/types/common';
import type {
  ErpBarcode,
  ErpBarcodeQuery,
  ErpBarcodeReprint,
  ErpBarcodeReprintQuery,
  ErpBarcodeReprintSaveRequest,
  ErpBarcodeRule,
  ErpBarcodeRuleQuery,
  ErpBarcodeRuleSaveRequest,
  ErpBarcodeSaveRequest,
  ErpBarcodeScan,
  ErpBarcodeScanQuery,
  ErpBarcodeScanSaveRequest,
  ErpBarcodeTemplate,
  ErpBarcodeTemplateQuery,
  ErpBarcodeTemplateSaveRequest,
} from '@/types/erpBarcode';

/** G3-N7a ERP 条码管理（T030/T099，后端 Base: /erp/barcode）服务定义。 */

const BASE = '/erp/barcode';

/* ---------------- 1. 条码生成 ---------------- */

export const erpBarcodeService = {
  page: (params: ErpBarcodeQuery): Promise<PageResult<ErpBarcode>> =>
    request<PageResult<ErpBarcode>>({ method: 'GET', url: `${BASE}/records`, params }),

  detail: (id: number): Promise<ErpBarcode> =>
    request<ErpBarcode>({ method: 'GET', url: `${BASE}/records/${id}` }),

  create: (data: ErpBarcodeSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/records`, data }),

  update: (id: number, data: ErpBarcodeSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/records/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/records/${id}` }),
};

/* ---------------- 2. 标签模板 ---------------- */

export const erpBarcodeTemplateService = {
  page: (params: ErpBarcodeTemplateQuery): Promise<PageResult<ErpBarcodeTemplate>> =>
    request<PageResult<ErpBarcodeTemplate>>({ method: 'GET', url: `${BASE}/templates`, params }),

  detail: (id: number): Promise<ErpBarcodeTemplate> =>
    request<ErpBarcodeTemplate>({ method: 'GET', url: `${BASE}/templates/${id}` }),

  create: (data: ErpBarcodeTemplateSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/templates`, data }),

  update: (id: number, data: ErpBarcodeTemplateSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/templates/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/templates/${id}` }),
};

/* ---------------- 3. 补打记录 ---------------- */

export const erpBarcodeReprintService = {
  page: (params: ErpBarcodeReprintQuery): Promise<PageResult<ErpBarcodeReprint>> =>
    request<PageResult<ErpBarcodeReprint>>({ method: 'GET', url: `${BASE}/reprints`, params }),

  detail: (id: number): Promise<ErpBarcodeReprint> =>
    request<ErpBarcodeReprint>({ method: 'GET', url: `${BASE}/reprints/${id}` }),

  create: (data: ErpBarcodeReprintSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/reprints`, data }),

  update: (id: number, data: ErpBarcodeReprintSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/reprints/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/reprints/${id}` }),
};

/* ---------------- 4. 扫码规则 ---------------- */

export const erpBarcodeRuleService = {
  page: (params: ErpBarcodeRuleQuery): Promise<PageResult<ErpBarcodeRule>> =>
    request<PageResult<ErpBarcodeRule>>({ method: 'GET', url: `${BASE}/rules`, params }),

  detail: (id: number): Promise<ErpBarcodeRule> =>
    request<ErpBarcodeRule>({ method: 'GET', url: `${BASE}/rules/${id}` }),

  create: (data: ErpBarcodeRuleSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/rules`, data }),

  update: (id: number, data: ErpBarcodeRuleSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/rules/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/rules/${id}` }),
};

/* ---------------- 5. 扫描校验 ---------------- */

export const erpBarcodeScanService = {
  page: (params: ErpBarcodeScanQuery): Promise<PageResult<ErpBarcodeScan>> =>
    request<PageResult<ErpBarcodeScan>>({ method: 'GET', url: `${BASE}/scans`, params }),

  detail: (id: number): Promise<ErpBarcodeScan> =>
    request<ErpBarcodeScan>({ method: 'GET', url: `${BASE}/scans/${id}` }),

  create: (data: ErpBarcodeScanSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/scans`, data }),

  update: (id: number, data: ErpBarcodeScanSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/scans/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/scans/${id}` }),
};
