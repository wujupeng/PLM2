import { request } from '@/services/request';
import type { PageResult } from '@/types/common';
import type {
  ErpDemandPlan,
  ErpDemandPlanDetail,
  ErpDemandPlanLineSaveRequest,
  ErpDemandPlanQuery,
  ErpDemandPlanSaveRequest,
  ErpMrpRun,
  ErpMrpRunQuery,
  ErpMrpRunSaveRequest,
  ErpNetRequirement,
  ErpNetRequirementQuery,
  ErpNetRequirementSaveRequest,
  ErpPlanAdjustment,
  ErpPlanAdjustmentQuery,
  ErpPlanAdjustmentSaveRequest,
  ErpProductionSuggestion,
  ErpProductionSuggestionQuery,
  ErpProductionSuggestionSaveRequest,
  ErpPurchaseSuggestion,
  ErpPurchaseSuggestionQuery,
  ErpPurchaseSuggestionSaveRequest,
} from '@/types/erpDemandPlan';

/** G3-N4a ERP 需求计划（T025/T095，后端 Base: /erp/demand-plan）服务定义。 */

const BASE = '/erp/demand-plan';

/* ---------------- 1. 需求计划（主子表） ---------------- */

export const erpDemandPlanService = {
  page: (params: ErpDemandPlanQuery): Promise<PageResult<ErpDemandPlan>> =>
    request<PageResult<ErpDemandPlan>>({ method: 'GET', url: `${BASE}/plans`, params }),

  detail: (id: number): Promise<ErpDemandPlanDetail> =>
    request<ErpDemandPlanDetail>({ method: 'GET', url: `${BASE}/plans/${id}` }),

  create: (data: ErpDemandPlanSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/plans`, data }),

  update: (id: number, data: ErpDemandPlanSaveRequest): Promise<void> =>
    request<void>({ method: 'PUT', url: `${BASE}/plans/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/plans/${id}` }),

  addLine: (headerId: number, data: ErpDemandPlanLineSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/plans/${headerId}/lines`, data }),

  updateLine: (lineId: number, data: ErpDemandPlanLineSaveRequest): Promise<void> =>
    request<void>({ method: 'PUT', url: `${BASE}/plans/lines/${lineId}`, data }),

  removeLine: (lineId: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/plans/lines/${lineId}` }),
};

/* ---------------- 2. MRP 运算单 ---------------- */

export const erpMrpRunService = {
  page: (params: ErpMrpRunQuery): Promise<PageResult<ErpMrpRun>> =>
    request<PageResult<ErpMrpRun>>({ method: 'GET', url: `${BASE}/mrp-runs`, params }),

  detail: (id: number): Promise<ErpMrpRun> =>
    request<ErpMrpRun>({ method: 'GET', url: `${BASE}/mrp-runs/${id}` }),

  create: (data: ErpMrpRunSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/mrp-runs`, data }),

  update: (id: number, data: ErpMrpRunSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/mrp-runs/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/mrp-runs/${id}` }),
};

/* ---------------- 3. 净需求 ---------------- */

export const erpNetRequirementService = {
  page: (params: ErpNetRequirementQuery): Promise<PageResult<ErpNetRequirement>> =>
    request<PageResult<ErpNetRequirement>>({ method: 'GET', url: `${BASE}/net-requirements`, params }),

  detail: (id: number): Promise<ErpNetRequirement> =>
    request<ErpNetRequirement>({ method: 'GET', url: `${BASE}/net-requirements/${id}` }),

  create: (data: ErpNetRequirementSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/net-requirements`, data }),

  update: (id: number, data: ErpNetRequirementSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/net-requirements/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/net-requirements/${id}` }),
};

/* ---------------- 4. 采购建议 ---------------- */

export const erpPurchaseSuggestionService = {
  page: (params: ErpPurchaseSuggestionQuery): Promise<PageResult<ErpPurchaseSuggestion>> =>
    request<PageResult<ErpPurchaseSuggestion>>({ method: 'GET', url: `${BASE}/purchase-suggestions`, params }),

  detail: (id: number): Promise<ErpPurchaseSuggestion> =>
    request<ErpPurchaseSuggestion>({ method: 'GET', url: `${BASE}/purchase-suggestions/${id}` }),

  create: (data: ErpPurchaseSuggestionSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/purchase-suggestions`, data }),

  update: (id: number, data: ErpPurchaseSuggestionSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/purchase-suggestions/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/purchase-suggestions/${id}` }),
};

/* ---------------- 5. 生产建议 ---------------- */

export const erpProductionSuggestionService = {
  page: (params: ErpProductionSuggestionQuery): Promise<PageResult<ErpProductionSuggestion>> =>
    request<PageResult<ErpProductionSuggestion>>({ method: 'GET', url: `${BASE}/production-suggestions`, params }),

  detail: (id: number): Promise<ErpProductionSuggestion> =>
    request<ErpProductionSuggestion>({ method: 'GET', url: `${BASE}/production-suggestions/${id}` }),

  create: (data: ErpProductionSuggestionSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/production-suggestions`, data }),

  update: (id: number, data: ErpProductionSuggestionSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/production-suggestions/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/production-suggestions/${id}` }),
};

/* ---------------- 6. 计划调整单 ---------------- */

export const erpPlanAdjustmentService = {
  page: (params: ErpPlanAdjustmentQuery): Promise<PageResult<ErpPlanAdjustment>> =>
    request<PageResult<ErpPlanAdjustment>>({ method: 'GET', url: `${BASE}/plan-adjustments`, params }),

  detail: (id: number): Promise<ErpPlanAdjustment> =>
    request<ErpPlanAdjustment>({ method: 'GET', url: `${BASE}/plan-adjustments/${id}` }),

  create: (data: ErpPlanAdjustmentSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/plan-adjustments`, data }),

  update: (id: number, data: ErpPlanAdjustmentSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/plan-adjustments/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/plan-adjustments/${id}` }),
};
