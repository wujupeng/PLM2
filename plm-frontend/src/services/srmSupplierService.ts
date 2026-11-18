import { request } from '@/services/request';
import type { PageResult } from '@/types/common';
import type {
  SrmSupplier,
  SrmSupplierAdmission,
  SrmSupplierAdmissionQuery,
  SrmSupplierAdmissionSaveRequest,
  SrmSupplierBlacklist,
  SrmSupplierBlacklistQuery,
  SrmSupplierBlacklistSaveRequest,
  SrmSupplierGrade,
  SrmSupplierGradeQuery,
  SrmSupplierGradeSaveRequest,
  SrmSupplierQualification,
  SrmSupplierQualificationQuery,
  SrmSupplierQualificationSaveRequest,
  SrmSupplierQuery,
  SrmSupplierReview,
  SrmSupplierReviewQuery,
  SrmSupplierReviewSaveRequest,
  SrmSupplierRisk,
  SrmSupplierRiskQuery,
  SrmSupplierRiskSaveRequest,
  SrmSupplierSaveRequest,
} from '@/types/srmSupplier';

/** G4-N1 SRM 供应商全生命周期（T031，后端 Base: /srm）服务定义。 */

const BASE = '/srm';

/* ---------------- 1. 供应商主档 ---------------- */

export const srmSupplierService = {
  page: (params: SrmSupplierQuery): Promise<PageResult<SrmSupplier>> =>
    request<PageResult<SrmSupplier>>({ method: 'GET', url: `${BASE}/suppliers`, params }),

  detail: (id: number): Promise<SrmSupplier> =>
    request<SrmSupplier>({ method: 'GET', url: `${BASE}/suppliers/${id}` }),

  create: (data: SrmSupplierSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/suppliers`, data }),

  update: (id: number, data: SrmSupplierSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/suppliers/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/suppliers/${id}` }),
};

/* ---------------- 2. 供应商准入 ---------------- */

export const srmSupplierAdmissionService = {
  page: (params: SrmSupplierAdmissionQuery): Promise<PageResult<SrmSupplierAdmission>> =>
    request<PageResult<SrmSupplierAdmission>>({
      method: 'GET',
      url: `${BASE}/supplier-admissions`,
      params,
    }),

  detail: (id: number): Promise<SrmSupplierAdmission> =>
    request<SrmSupplierAdmission>({ method: 'GET', url: `${BASE}/supplier-admissions/${id}` }),

  create: (data: SrmSupplierAdmissionSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/supplier-admissions`, data }),

  update: (id: number, data: SrmSupplierAdmissionSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/supplier-admissions/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/supplier-admissions/${id}` }),
};

/* ---------------- 3. 供应商资质 ---------------- */

export const srmSupplierQualificationService = {
  page: (params: SrmSupplierQualificationQuery): Promise<PageResult<SrmSupplierQualification>> =>
    request<PageResult<SrmSupplierQualification>>({
      method: 'GET',
      url: `${BASE}/supplier-qualifications`,
      params,
    }),

  detail: (id: number): Promise<SrmSupplierQualification> =>
    request<SrmSupplierQualification>({
      method: 'GET',
      url: `${BASE}/supplier-qualifications/${id}`,
    }),

  create: (data: SrmSupplierQualificationSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/supplier-qualifications`, data }),

  update: (id: number, data: SrmSupplierQualificationSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/supplier-qualifications/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/supplier-qualifications/${id}` }),
};

/* ---------------- 4. 供应商风险 ---------------- */

export const srmSupplierRiskService = {
  page: (params: SrmSupplierRiskQuery): Promise<PageResult<SrmSupplierRisk>> =>
    request<PageResult<SrmSupplierRisk>>({ method: 'GET', url: `${BASE}/supplier-risks`, params }),

  detail: (id: number): Promise<SrmSupplierRisk> =>
    request<SrmSupplierRisk>({ method: 'GET', url: `${BASE}/supplier-risks/${id}` }),

  create: (data: SrmSupplierRiskSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/supplier-risks`, data }),

  update: (id: number, data: SrmSupplierRiskSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/supplier-risks/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/supplier-risks/${id}` }),
};

/* ---------------- 5. 供应商分级 ---------------- */

export const srmSupplierGradeService = {
  page: (params: SrmSupplierGradeQuery): Promise<PageResult<SrmSupplierGrade>> =>
    request<PageResult<SrmSupplierGrade>>({ method: 'GET', url: `${BASE}/supplier-grades`, params }),

  detail: (id: number): Promise<SrmSupplierGrade> =>
    request<SrmSupplierGrade>({ method: 'GET', url: `${BASE}/supplier-grades/${id}` }),

  create: (data: SrmSupplierGradeSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/supplier-grades`, data }),

  update: (id: number, data: SrmSupplierGradeSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/supplier-grades/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/supplier-grades/${id}` }),
};

/* ---------------- 6. 供应商黑名单 ---------------- */

export const srmSupplierBlacklistService = {
  page: (params: SrmSupplierBlacklistQuery): Promise<PageResult<SrmSupplierBlacklist>> =>
    request<PageResult<SrmSupplierBlacklist>>({
      method: 'GET',
      url: `${BASE}/supplier-blacklists`,
      params,
    }),

  detail: (id: number): Promise<SrmSupplierBlacklist> =>
    request<SrmSupplierBlacklist>({ method: 'GET', url: `${BASE}/supplier-blacklists/${id}` }),

  create: (data: SrmSupplierBlacklistSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/supplier-blacklists`, data }),

  update: (id: number, data: SrmSupplierBlacklistSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/supplier-blacklists/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/supplier-blacklists/${id}` }),
};

/* ---------------- 7. 年度复审 ---------------- */

export const srmSupplierReviewService = {
  page: (params: SrmSupplierReviewQuery): Promise<PageResult<SrmSupplierReview>> =>
    request<PageResult<SrmSupplierReview>>({
      method: 'GET',
      url: `${BASE}/supplier-reviews`,
      params,
    }),

  detail: (id: number): Promise<SrmSupplierReview> =>
    request<SrmSupplierReview>({ method: 'GET', url: `${BASE}/supplier-reviews/${id}` }),

  create: (data: SrmSupplierReviewSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/supplier-reviews`, data }),

  update: (id: number, data: SrmSupplierReviewSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/supplier-reviews/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/supplier-reviews/${id}` }),
};
