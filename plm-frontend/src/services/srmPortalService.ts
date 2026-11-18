import { request } from '@/services/request';
import type { PageResult } from '@/types/common';
import type {
  SrmPortalAccount,
  SrmPortalAccountQuery,
  SrmPortalAccountSaveRequest,
  SrmPortalAttachment,
  SrmPortalAttachmentQuery,
  SrmPortalAttachmentSaveRequest,
  SrmPortalMessage,
  SrmPortalMessageQuery,
  SrmPortalMessageSaveRequest,
} from '@/types/srmPortal';

/** G4-N5 SRM 供应商门户（T035，后端 Base: /srm/portal）服务定义。 */

const BASE = '/srm/portal';

/* ---------------- 1. 供应商账号 ---------------- */

export const srmPortalAccountService = {
  page: (params: SrmPortalAccountQuery): Promise<PageResult<SrmPortalAccount>> =>
    request<PageResult<SrmPortalAccount>>({ method: 'GET', url: `${BASE}/accounts`, params }),

  detail: (id: number): Promise<SrmPortalAccount> =>
    request<SrmPortalAccount>({ method: 'GET', url: `${BASE}/accounts/${id}` }),

  create: (data: SrmPortalAccountSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/accounts`, data }),

  update: (id: number, data: SrmPortalAccountSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/accounts/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/accounts/${id}` }),
};

/* ---------------- 2. 门户消息 ---------------- */

export const srmPortalMessageService = {
  page: (params: SrmPortalMessageQuery): Promise<PageResult<SrmPortalMessage>> =>
    request<PageResult<SrmPortalMessage>>({ method: 'GET', url: `${BASE}/messages`, params }),

  detail: (id: number): Promise<SrmPortalMessage> =>
    request<SrmPortalMessage>({ method: 'GET', url: `${BASE}/messages/${id}` }),

  create: (data: SrmPortalMessageSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/messages`, data }),

  update: (id: number, data: SrmPortalMessageSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/messages/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/messages/${id}` }),
};

/* ---------------- 3. 门户附件 ---------------- */

export const srmPortalAttachmentService = {
  page: (params: SrmPortalAttachmentQuery): Promise<PageResult<SrmPortalAttachment>> =>
    request<PageResult<SrmPortalAttachment>>({ method: 'GET', url: `${BASE}/attachments`, params }),

  detail: (id: number): Promise<SrmPortalAttachment> =>
    request<SrmPortalAttachment>({ method: 'GET', url: `${BASE}/attachments/${id}` }),

  create: (data: SrmPortalAttachmentSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/attachments`, data }),

  update: (id: number, data: SrmPortalAttachmentSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/attachments/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/attachments/${id}` }),
};
