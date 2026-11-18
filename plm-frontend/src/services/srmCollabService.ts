import { request } from '@/services/request';
import type { PageResult } from '@/types/common';
import type {
  SrmAsn,
  SrmAsnQuery,
  SrmAsnSaveRequest,
  SrmDeliveryAppointment,
  SrmDeliveryAppointmentQuery,
  SrmDeliveryAppointmentSaveRequest,
  SrmDeliveryCommitment,
  SrmDeliveryCommitmentQuery,
  SrmDeliveryCommitmentSaveRequest,
  SrmPoChange,
  SrmPoChangeQuery,
  SrmPoChangeSaveRequest,
  SrmPoConfirmation,
  SrmPoConfirmationQuery,
  SrmPoConfirmationSaveRequest,
} from '@/types/srmCollab';

/** G4-N3 SRM 采购协同（T033，后端 Base: /srm）服务定义。 */

const BASE = '/srm';

/* ---------------- 1. 订单确认 ---------------- */

export const srmPoConfirmationService = {
  page: (params: SrmPoConfirmationQuery): Promise<PageResult<SrmPoConfirmation>> =>
    request<PageResult<SrmPoConfirmation>>({
      method: 'GET',
      url: `${BASE}/po-confirmations`,
      params,
    }),

  detail: (id: number): Promise<SrmPoConfirmation> =>
    request<SrmPoConfirmation>({ method: 'GET', url: `${BASE}/po-confirmations/${id}` }),

  create: (data: SrmPoConfirmationSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/po-confirmations`, data }),

  update: (id: number, data: SrmPoConfirmationSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/po-confirmations/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/po-confirmations/${id}` }),
};

/* ---------------- 2. 交期承诺 ---------------- */

export const srmDeliveryCommitmentService = {
  page: (params: SrmDeliveryCommitmentQuery): Promise<PageResult<SrmDeliveryCommitment>> =>
    request<PageResult<SrmDeliveryCommitment>>({
      method: 'GET',
      url: `${BASE}/commitments`,
      params,
    }),

  detail: (id: number): Promise<SrmDeliveryCommitment> =>
    request<SrmDeliveryCommitment>({ method: 'GET', url: `${BASE}/commitments/${id}` }),

  create: (data: SrmDeliveryCommitmentSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/commitments`, data }),

  update: (id: number, data: SrmDeliveryCommitmentSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/commitments/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/commitments/${id}` }),
};

/* ---------------- 3. 变更确认 ---------------- */

export const srmPoChangeService = {
  page: (params: SrmPoChangeQuery): Promise<PageResult<SrmPoChange>> =>
    request<PageResult<SrmPoChange>>({ method: 'GET', url: `${BASE}/changes`, params }),

  detail: (id: number): Promise<SrmPoChange> =>
    request<SrmPoChange>({ method: 'GET', url: `${BASE}/changes/${id}` }),

  create: (data: SrmPoChangeSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/changes`, data }),

  update: (id: number, data: SrmPoChangeSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/changes/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/changes/${id}` }),
};

/* ---------------- 4. 送货预约 ---------------- */

export const srmDeliveryAppointmentService = {
  page: (params: SrmDeliveryAppointmentQuery): Promise<PageResult<SrmDeliveryAppointment>> =>
    request<PageResult<SrmDeliveryAppointment>>({
      method: 'GET',
      url: `${BASE}/appointments`,
      params,
    }),

  detail: (id: number): Promise<SrmDeliveryAppointment> =>
    request<SrmDeliveryAppointment>({ method: 'GET', url: `${BASE}/appointments/${id}` }),

  create: (data: SrmDeliveryAppointmentSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/appointments`, data }),

  update: (id: number, data: SrmDeliveryAppointmentSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/appointments/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/appointments/${id}` }),
};

/* ---------------- 5. ASN 发货通知 ---------------- */

export const srmAsnService = {
  page: (params: SrmAsnQuery): Promise<PageResult<SrmAsn>> =>
    request<PageResult<SrmAsn>>({ method: 'GET', url: `${BASE}/asns`, params }),

  detail: (id: number): Promise<SrmAsn> =>
    request<SrmAsn>({ method: 'GET', url: `${BASE}/asns/${id}` }),

  create: (data: SrmAsnSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/asns`, data }),

  update: (id: number, data: SrmAsnSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/asns/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/asns/${id}` }),
};
