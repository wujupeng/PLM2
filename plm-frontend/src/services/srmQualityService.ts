import { request } from '@/services/request';
import type { PageResult } from '@/types/common';
import type {
  SrmEightDReport,
  SrmEightDReportQuery,
  SrmEightDReportSaveRequest,
  SrmIncomingQuality,
  SrmIncomingQualityQuery,
  SrmIncomingQualitySaveRequest,
  SrmRectification,
  SrmRectificationQuery,
  SrmRectificationSaveRequest,
  SrmSupplierAssessment,
  SrmSupplierAssessmentQuery,
  SrmSupplierAssessmentSaveRequest,
} from '@/types/srmQuality';

/** G4-N4 SRM 供应商质量（T034，后端 Base: /srm）服务定义。 */

const BASE = '/srm';

/* ---------------- 1. 来料质量 ---------------- */

export const srmIncomingQualityService = {
  page: (params: SrmIncomingQualityQuery): Promise<PageResult<SrmIncomingQuality>> =>
    request<PageResult<SrmIncomingQuality>>({ method: 'GET', url: `${BASE}/iqc`, params }),

  detail: (id: number): Promise<SrmIncomingQuality> =>
    request<SrmIncomingQuality>({ method: 'GET', url: `${BASE}/iqc/${id}` }),

  create: (data: SrmIncomingQualitySaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/iqc`, data }),

  update: (id: number, data: SrmIncomingQualitySaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/iqc/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/iqc/${id}` }),
};

/* ---------------- 2. 供应商考评 ---------------- */

export const srmSupplierAssessmentService = {
  page: (params: SrmSupplierAssessmentQuery): Promise<PageResult<SrmSupplierAssessment>> =>
    request<PageResult<SrmSupplierAssessment>>({ method: 'GET', url: `${BASE}/assessments`, params }),

  detail: (id: number): Promise<SrmSupplierAssessment> =>
    request<SrmSupplierAssessment>({ method: 'GET', url: `${BASE}/assessments/${id}` }),

  create: (data: SrmSupplierAssessmentSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/assessments`, data }),

  update: (id: number, data: SrmSupplierAssessmentSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/assessments/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/assessments/${id}` }),
};

/* ---------------- 3. 8D 报告 ---------------- */

export const srmEightDReportService = {
  page: (params: SrmEightDReportQuery): Promise<PageResult<SrmEightDReport>> =>
    request<PageResult<SrmEightDReport>>({ method: 'GET', url: `${BASE}/eightd`, params }),

  detail: (id: number): Promise<SrmEightDReport> =>
    request<SrmEightDReport>({ method: 'GET', url: `${BASE}/eightd/${id}` }),

  create: (data: SrmEightDReportSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/eightd`, data }),

  update: (id: number, data: SrmEightDReportSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/eightd/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/eightd/${id}` }),
};

/* ---------------- 4. 整改跟踪 ---------------- */

export const srmRectificationService = {
  page: (params: SrmRectificationQuery): Promise<PageResult<SrmRectification>> =>
    request<PageResult<SrmRectification>>({ method: 'GET', url: `${BASE}/rectifications`, params }),

  detail: (id: number): Promise<SrmRectification> =>
    request<SrmRectification>({ method: 'GET', url: `${BASE}/rectifications/${id}` }),

  create: (data: SrmRectificationSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/rectifications`, data }),

  update: (id: number, data: SrmRectificationSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/rectifications/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/rectifications/${id}` }),
};
