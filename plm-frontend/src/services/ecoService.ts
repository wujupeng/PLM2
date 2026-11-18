import { request } from './request';
import type { PageResult } from '@/types/common';
import type {
  EcoChangeRequestItem,
  EcoChangeRequestQuery,
  EcoChangeRequestSaveParams,
  EcrReviewParams,
  EcrConvertParams,
  EcrDetail,
  EcoChangeOrderItem,
  EcoChangeOrderQuery,
  EcoChangeOrderSaveParams,
  EcoDetail,
  EcoChangeItemItem,
  EcoChangeItemSaveParams,
  EcoNoticeItem,
  EcoNoticeSaveParams,
  EcoImpactAnalysisItem,
  EcoApproveParams,
  EcoImpactAnalyzeParams,
  EcoImpactHandleParams,
  EcoExecuteParams,
  EcoExecuteResult,
} from '@/types/eco';

/** 工程变更申请（ECR） */
export const ecrService = {
  page: (params: EcoChangeRequestQuery): Promise<PageResult<EcoChangeRequestItem>> =>
    request<PageResult<EcoChangeRequestItem>>({ method: 'GET', url: '/eco/change-requests', params }),

  detail: (ecrId: number): Promise<EcrDetail> =>
    request<EcrDetail>({ method: 'GET', url: `/eco/change-requests/${ecrId}` }),

  create: (data: EcoChangeRequestSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/eco/change-requests', data }),

  update: (ecrId: number, data: EcoChangeRequestSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/eco/change-requests/${ecrId}`, data }),

  remove: (ecrId: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/eco/change-requests/${ecrId}` }),

  submit: (ecrId: number): Promise<void> =>
    request<void>({ method: 'POST', url: `/eco/change-requests/${ecrId}/submit` }),

  review: (ecrId: number, data: EcrReviewParams): Promise<void> =>
    request<void>({ method: 'POST', url: `/eco/change-requests/${ecrId}/review`, data }),

  convert: (ecrId: number, data: EcrConvertParams): Promise<number> =>
    request<number>({ method: 'POST', url: `/eco/change-requests/${ecrId}/convert`, data }),
};

/** 工程变更单（ECO） */
export const ecoService = {
  page: (params: EcoChangeOrderQuery): Promise<PageResult<EcoChangeOrderItem>> =>
    request<PageResult<EcoChangeOrderItem>>({ method: 'GET', url: '/eco/change-orders', params }),

  detail: (ecoId: number): Promise<EcoDetail> =>
    request<EcoDetail>({ method: 'GET', url: `/eco/change-orders/${ecoId}` }),

  items: (ecoId: number): Promise<EcoChangeItemItem[]> =>
    request<EcoChangeItemItem[]>({ method: 'GET', url: `/eco/change-orders/${ecoId}/items` }),

  notices: (ecoId: number): Promise<EcoNoticeItem[]> =>
    request<EcoNoticeItem[]>({ method: 'GET', url: `/eco/change-orders/${ecoId}/notices` }),

  impacts: (ecoId: number): Promise<EcoImpactAnalysisItem[]> =>
    request<EcoImpactAnalysisItem[]>({ method: 'GET', url: `/eco/change-orders/${ecoId}/impacts` }),

  update: (ecoId: number, data: EcoChangeOrderSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/eco/change-orders/${ecoId}`, data }),

  addItem: (ecoId: number, data: EcoChangeItemSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `/eco/change-orders/${ecoId}/items`, data }),

  updateItem: (itemId: number, data: EcoChangeItemSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/eco/change-orders/items/${itemId}`, data }),

  removeItem: (itemId: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/eco/change-orders/items/${itemId}` }),

  submit: (ecoId: number): Promise<void> =>
    request<void>({ method: 'POST', url: `/eco/change-orders/${ecoId}/submit` }),

  approve: (ecoId: number, data: EcoApproveParams): Promise<void> =>
    request<void>({ method: 'POST', url: `/eco/change-orders/${ecoId}/approve`, data }),

  analyzeImpacts: (ecoId: number, data: EcoImpactAnalyzeParams): Promise<EcoImpactAnalysisItem[]> =>
    request<EcoImpactAnalysisItem[]>({
      method: 'POST',
      url: `/eco/change-orders/${ecoId}/impacts/analyze`,
      data,
    }),

  handleImpact: (impactId: number, data: EcoImpactHandleParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/eco/change-orders/impacts/${impactId}`, data }),

  execute: (ecoId: number, data: EcoExecuteParams): Promise<EcoExecuteResult> =>
    request<EcoExecuteResult>({ method: 'POST', url: `/eco/change-orders/${ecoId}/execute`, data }),

  createNotice: (ecoId: number, data: EcoNoticeSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `/eco/change-orders/${ecoId}/notices`, data }),

  sendNotice: (noticeId: number): Promise<void> =>
    request<void>({ method: 'POST', url: `/eco/change-orders/notices/${noticeId}/send` }),

  confirmNotice: (noticeId: number): Promise<void> =>
    request<void>({ method: 'POST', url: `/eco/change-orders/notices/${noticeId}/confirm` }),
};
