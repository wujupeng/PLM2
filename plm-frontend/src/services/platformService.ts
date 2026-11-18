import { request } from '@/services/request';
import type { PageResult } from '@/types/common';
import type {
  PlatformApiRegistryItem,
  PlatformApiRegistrySaveParams,
  PlatformApiVersionItem,
  PlatformApiVersionSaveParams,
  PlatformDeadLetterHandleParams,
  PlatformDeadLetterItem,
  PlatformDeadLetterSaveParams,
  PlatformEventMessageItem,
  PlatformEventMessageSaveParams,
  PlatformEventSubscriptionItem,
  PlatformEventSubscriptionSaveParams,
  PlatformEventTopicItem,
  PlatformEventTopicSaveParams,
  PlatformIdempotentCheckResult,
  PlatformIdempotentRecordItem,
  PlatformIdempotentRecordSaveParams,
  PlatformIntegrationQuery,
  PlatformMonitorItem,
  PlatformMonitorSaveParams,
  PlatformStats,
} from '@/types/platform';

/** G1-N1 公共平台底座—集成平台（后端 WBS T009）服务定义。 */

const BASE = '/platform/integration';

/* ---------------- 1. 接口注册中心 ---------------- */

export const platformApiRegistryService = {
  pageApis: (params: PlatformIntegrationQuery): Promise<PageResult<PlatformApiRegistryItem>> =>
    request<PageResult<PlatformApiRegistryItem>>({ method: 'GET', url: `${BASE}/api-registries`, params }),

  stats: (): Promise<PlatformStats> => request<PlatformStats>({ method: 'GET', url: `${BASE}/api-registries/stats` }),

  detail: (id: number): Promise<PlatformApiRegistryItem> =>
    request<PlatformApiRegistryItem>({ method: 'GET', url: `${BASE}/api-registries/${id}` }),

  create: (data: PlatformApiRegistrySaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/api-registries`, data }),

  update: (id: number, data: PlatformApiRegistrySaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/api-registries/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/api-registries/${id}` }),

  publish: (id: number): Promise<PlatformApiRegistryItem> =>
    request<PlatformApiRegistryItem>({ method: 'POST', url: `${BASE}/api-registries/${id}/publish` }),

  deprecate: (id: number): Promise<PlatformApiRegistryItem> =>
    request<PlatformApiRegistryItem>({ method: 'POST', url: `${BASE}/api-registries/${id}/deprecate` }),

  offline: (id: number): Promise<PlatformApiRegistryItem> =>
    request<PlatformApiRegistryItem>({ method: 'POST', url: `${BASE}/api-registries/${id}/offline` }),
};

/* ---------------- 2. 接口版本记录 ---------------- */

export const platformApiVersionService = {
  pageRecords: (params: PlatformIntegrationQuery): Promise<PageResult<PlatformApiVersionItem>> =>
    request<PageResult<PlatformApiVersionItem>>({ method: 'GET', url: `${BASE}/api-versions`, params }),

  stats: (): Promise<PlatformStats> => request<PlatformStats>({ method: 'GET', url: `${BASE}/api-versions/stats` }),

  detail: (id: number): Promise<PlatformApiVersionItem> =>
    request<PlatformApiVersionItem>({ method: 'GET', url: `${BASE}/api-versions/${id}` }),

  create: (data: PlatformApiVersionSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/api-versions`, data }),

  update: (id: number, data: PlatformApiVersionSaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/api-versions/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/api-versions/${id}` }),

  publish: (id: number): Promise<PlatformApiVersionItem> =>
    request<PlatformApiVersionItem>({ method: 'POST', url: `${BASE}/api-versions/${id}/publish` }),

  release: (id: number): Promise<PlatformApiVersionItem> =>
    request<PlatformApiVersionItem>({ method: 'POST', url: `${BASE}/api-versions/${id}/release` }),
};

/* ---------------- 3. 事件主题 ---------------- */

export const platformEventTopicService = {
  pageTopics: (params: PlatformIntegrationQuery): Promise<PageResult<PlatformEventTopicItem>> =>
    request<PageResult<PlatformEventTopicItem>>({ method: 'GET', url: `${BASE}/event-topics`, params }),

  stats: (): Promise<PlatformStats> => request<PlatformStats>({ method: 'GET', url: `${BASE}/event-topics/stats` }),

  detail: (id: number): Promise<PlatformEventTopicItem> =>
    request<PlatformEventTopicItem>({ method: 'GET', url: `${BASE}/event-topics/${id}` }),

  create: (data: PlatformEventTopicSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/event-topics`, data }),

  update: (id: number, data: PlatformEventTopicSaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/event-topics/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/event-topics/${id}` }),

  publish: (id: number): Promise<PlatformEventTopicItem> =>
    request<PlatformEventTopicItem>({ method: 'POST', url: `${BASE}/event-topics/${id}/publish` }),

  disable: (id: number): Promise<PlatformEventTopicItem> =>
    request<PlatformEventTopicItem>({ method: 'POST', url: `${BASE}/event-topics/${id}/disable` }),
};

/* ---------------- 4. 事件订阅 ---------------- */

export const platformEventSubscriptionService = {
  pageSubscriptions: (params: PlatformIntegrationQuery): Promise<PageResult<PlatformEventSubscriptionItem>> =>
    request<PageResult<PlatformEventSubscriptionItem>>({
      method: 'GET',
      url: `${BASE}/event-subscriptions`,
      params,
    }),

  stats: (): Promise<PlatformStats> =>
    request<PlatformStats>({ method: 'GET', url: `${BASE}/event-subscriptions/stats` }),

  detail: (id: number): Promise<PlatformEventSubscriptionItem> =>
    request<PlatformEventSubscriptionItem>({ method: 'GET', url: `${BASE}/event-subscriptions/${id}` }),

  create: (data: PlatformEventSubscriptionSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/event-subscriptions`, data }),

  update: (id: number, data: PlatformEventSubscriptionSaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/event-subscriptions/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/event-subscriptions/${id}` }),

  enable: (id: number): Promise<PlatformEventSubscriptionItem> =>
    request<PlatformEventSubscriptionItem>({ method: 'POST', url: `${BASE}/event-subscriptions/${id}/enable` }),

  disable: (id: number): Promise<PlatformEventSubscriptionItem> =>
    request<PlatformEventSubscriptionItem>({ method: 'POST', url: `${BASE}/event-subscriptions/${id}/disable` }),

  test: (id: number): Promise<PlatformEventSubscriptionItem> =>
    request<PlatformEventSubscriptionItem>({ method: 'POST', url: `${BASE}/event-subscriptions/${id}/test` }),
};

/* ---------------- 5. 事件消息 ---------------- */

export const platformEventMessageService = {
  pageMessages: (params: PlatformIntegrationQuery): Promise<PageResult<PlatformEventMessageItem>> =>
    request<PageResult<PlatformEventMessageItem>>({ method: 'GET', url: `${BASE}/event-messages`, params }),

  stats: (): Promise<PlatformStats> => request<PlatformStats>({ method: 'GET', url: `${BASE}/event-messages/stats` }),

  detail: (id: number): Promise<PlatformEventMessageItem> =>
    request<PlatformEventMessageItem>({ method: 'GET', url: `${BASE}/event-messages/${id}` }),

  create: (data: PlatformEventMessageSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/event-messages`, data }),

  update: (id: number, data: PlatformEventMessageSaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/event-messages/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/event-messages/${id}` }),

  publish: (id: number): Promise<PlatformEventMessageItem> =>
    request<PlatformEventMessageItem>({ method: 'POST', url: `${BASE}/event-messages/${id}/publish` }),

  retry: (id: number): Promise<PlatformEventMessageItem> =>
    request<PlatformEventMessageItem>({ method: 'POST', url: `${BASE}/event-messages/${id}/retry` }),
};

/* ---------------- 6. 死信队列 ---------------- */

export const platformDeadLetterService = {
  pageDeadLetters: (params: PlatformIntegrationQuery): Promise<PageResult<PlatformDeadLetterItem>> =>
    request<PageResult<PlatformDeadLetterItem>>({ method: 'GET', url: `${BASE}/dead-letters`, params }),

  stats: (): Promise<PlatformStats> => request<PlatformStats>({ method: 'GET', url: `${BASE}/dead-letters/stats` }),

  detail: (id: number): Promise<PlatformDeadLetterItem> =>
    request<PlatformDeadLetterItem>({ method: 'GET', url: `${BASE}/dead-letters/${id}` }),

  create: (data: PlatformDeadLetterSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/dead-letters`, data }),

  update: (id: number, data: PlatformDeadLetterSaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/dead-letters/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/dead-letters/${id}` }),

  handle: (id: number, params: PlatformDeadLetterHandleParams): Promise<PlatformDeadLetterItem> =>
    request<PlatformDeadLetterItem>({ method: 'POST', url: `${BASE}/dead-letters/${id}/handle`, params }),

  ignore: (id: number): Promise<PlatformDeadLetterItem> =>
    request<PlatformDeadLetterItem>({ method: 'POST', url: `${BASE}/dead-letters/${id}/ignore` }),

  retry: (id: number): Promise<PlatformDeadLetterItem> =>
    request<PlatformDeadLetterItem>({ method: 'POST', url: `${BASE}/dead-letters/${id}/retry` }),
};

/* ---------------- 7. 幂等记录 ---------------- */

export const platformIdempotentService = {
  pageRecords: (params: PlatformIntegrationQuery): Promise<PageResult<PlatformIdempotentRecordItem>> =>
    request<PageResult<PlatformIdempotentRecordItem>>({ method: 'GET', url: `${BASE}/idempotent-records`, params }),

  stats: (): Promise<PlatformStats> =>
    request<PlatformStats>({ method: 'GET', url: `${BASE}/idempotent-records/stats` }),

  check: (idempotentKey: string): Promise<PlatformIdempotentCheckResult> =>
    request<PlatformIdempotentCheckResult>({
      method: 'GET',
      url: `${BASE}/idempotent-records/check`,
      params: { idempotentKey },
    }),

  detail: (id: number): Promise<PlatformIdempotentRecordItem> =>
    request<PlatformIdempotentRecordItem>({ method: 'GET', url: `${BASE}/idempotent-records/${id}` }),

  create: (data: PlatformIdempotentRecordSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/idempotent-records`, data }),

  update: (id: number, data: PlatformIdempotentRecordSaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/idempotent-records/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/idempotent-records/${id}` }),

  markSuccess: (id: number): Promise<PlatformIdempotentRecordItem> =>
    request<PlatformIdempotentRecordItem>({ method: 'POST', url: `${BASE}/idempotent-records/${id}/success` }),

  markDuplicate: (id: number): Promise<PlatformIdempotentRecordItem> =>
    request<PlatformIdempotentRecordItem>({ method: 'POST', url: `${BASE}/idempotent-records/${id}/duplicate` }),

  markFail: (id: number): Promise<PlatformIdempotentRecordItem> =>
    request<PlatformIdempotentRecordItem>({ method: 'POST', url: `${BASE}/idempotent-records/${id}/fail` }),
};

/* ---------------- 8. 集成监控 ---------------- */

export const platformMonitorService = {
  pageMonitors: (params: PlatformIntegrationQuery): Promise<PageResult<PlatformMonitorItem>> =>
    request<PageResult<PlatformMonitorItem>>({ method: 'GET', url: `${BASE}/monitor`, params }),

  stats: (): Promise<PlatformStats> => request<PlatformStats>({ method: 'GET', url: `${BASE}/monitor/stats` }),

  detail: (id: number): Promise<PlatformMonitorItem> =>
    request<PlatformMonitorItem>({ method: 'GET', url: `${BASE}/monitor/${id}` }),

  create: (data: PlatformMonitorSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/monitor`, data }),

  update: (id: number, data: PlatformMonitorSaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/monitor/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/monitor/${id}` }),

  aggregate: (id: number): Promise<PlatformMonitorItem> =>
    request<PlatformMonitorItem>({ method: 'POST', url: `${BASE}/monitor/${id}/aggregate` }),
};
