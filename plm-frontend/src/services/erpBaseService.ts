import { request } from '@/services/request';
import type { PageResult } from '@/types/common';
import type {
  ErpCustomer,
  ErpCustomerContact,
  ErpCustomerContactQuery,
  ErpCustomerContactSaveRequest,
  ErpCustomerQuery,
  ErpCustomerSaveRequest,
  ErpMaterial,
  ErpMaterialQuery,
  ErpMaterialSaveRequest,
  ErpProject,
  ErpProjectQuery,
  ErpProjectSaveRequest,
  ErpSupplier,
  ErpSupplierQuery,
  ErpSupplierSaveRequest,
  ErpUom,
  ErpUomConversion,
  ErpUomConversionQuery,
  ErpUomConversionSaveRequest,
  ErpUomQuery,
  ErpUomSaveRequest,
} from '@/types/erpBase';

/** G3-N1 ERP 基础资料（后端 Base: /erp/base）服务定义。 */

const BASE = '/erp/base';

/* ---------------- 1. 物料业务档案 ---------------- */

export const erpMaterialService = {
  page: (params: ErpMaterialQuery): Promise<PageResult<ErpMaterial>> =>
    request<PageResult<ErpMaterial>>({ method: 'GET', url: `${BASE}/materials`, params }),

  detail: (id: number): Promise<ErpMaterial> =>
    request<ErpMaterial>({ method: 'GET', url: `${BASE}/materials/${id}` }),

  create: (data: ErpMaterialSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/materials`, data }),

  update: (id: number, data: ErpMaterialSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/materials/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/materials/${id}` }),
};

/* ---------------- 2. 客户档案 ---------------- */

export const erpCustomerService = {
  page: (params: ErpCustomerQuery): Promise<PageResult<ErpCustomer>> =>
    request<PageResult<ErpCustomer>>({ method: 'GET', url: `${BASE}/customers`, params }),

  detail: (id: number): Promise<ErpCustomer> =>
    request<ErpCustomer>({ method: 'GET', url: `${BASE}/customers/${id}` }),

  create: (data: ErpCustomerSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/customers`, data }),

  update: (id: number, data: ErpCustomerSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/customers/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/customers/${id}` }),
};

/* ---------------- 3. 客户联系人 ---------------- */

export const erpCustomerContactService = {
  page: (params: ErpCustomerContactQuery): Promise<PageResult<ErpCustomerContact>> =>
    request<PageResult<ErpCustomerContact>>({ method: 'GET', url: `${BASE}/customer-contacts`, params }),

  detail: (id: number): Promise<ErpCustomerContact> =>
    request<ErpCustomerContact>({ method: 'GET', url: `${BASE}/customer-contacts/${id}` }),

  create: (data: ErpCustomerContactSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/customer-contacts`, data }),

  update: (id: number, data: ErpCustomerContactSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/customer-contacts/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/customer-contacts/${id}` }),
};

/* ---------------- 4. 供应商业务档案 ---------------- */

export const erpSupplierService = {
  page: (params: ErpSupplierQuery): Promise<PageResult<ErpSupplier>> =>
    request<PageResult<ErpSupplier>>({ method: 'GET', url: `${BASE}/suppliers`, params }),

  detail: (id: number): Promise<ErpSupplier> =>
    request<ErpSupplier>({ method: 'GET', url: `${BASE}/suppliers/${id}` }),

  create: (data: ErpSupplierSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/suppliers`, data }),

  update: (id: number, data: ErpSupplierSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/suppliers/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/suppliers/${id}` }),
};

/* ---------------- 5. 计量单位 ---------------- */

export const erpUomService = {
  page: (params: ErpUomQuery): Promise<PageResult<ErpUom>> =>
    request<PageResult<ErpUom>>({ method: 'GET', url: `${BASE}/uoms`, params }),

  detail: (id: number): Promise<ErpUom> => request<ErpUom>({ method: 'GET', url: `${BASE}/uoms/${id}` }),

  create: (data: ErpUomSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/uoms`, data }),

  update: (id: number, data: ErpUomSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/uoms/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/uoms/${id}` }),
};

/* ---------------- 6. 单位换算 ---------------- */

export const erpUomConversionService = {
  page: (params: ErpUomConversionQuery): Promise<PageResult<ErpUomConversion>> =>
    request<PageResult<ErpUomConversion>>({ method: 'GET', url: `${BASE}/uom-conversions`, params }),

  detail: (id: number): Promise<ErpUomConversion> =>
    request<ErpUomConversion>({ method: 'GET', url: `${BASE}/uom-conversions/${id}` }),

  create: (data: ErpUomConversionSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/uom-conversions`, data }),

  update: (id: number, data: ErpUomConversionSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/uom-conversions/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/uom-conversions/${id}` }),
};

/* ---------------- 7. 项目档案 ---------------- */

export const erpProjectService = {
  page: (params: ErpProjectQuery): Promise<PageResult<ErpProject>> =>
    request<PageResult<ErpProject>>({ method: 'GET', url: `${BASE}/projects`, params }),

  detail: (id: number): Promise<ErpProject> =>
    request<ErpProject>({ method: 'GET', url: `${BASE}/projects/${id}` }),

  create: (data: ErpProjectSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/projects`, data }),

  update: (id: number, data: ErpProjectSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/projects/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/projects/${id}` }),
};
