import type { PageQuery } from '@/types/common';

/** G1-N1 公共平台底座—集成平台（后端 WBS T009）类型与枚举定义。 */

/* ---------------- 通用分页查询 ---------------- */

/** 集成平台通用分页查询条件（各资源按需使用对应状态字段）。 */
export interface PlatformIntegrationQuery extends PageQuery {
  systemCode?: string;
  direction?: string;
  apiStatus?: string;
  changeType?: string;
  versionStatus?: string;
  domain?: string;
  topicStatus?: string;
  subscriptionStatus?: string;
  deliveryMode?: string;
  messageStatus?: string;
  targetType?: string;
  deadStatus?: string;
  recordStatus?: string;
  healthStatus?: string;
  startDate?: string;
  endDate?: string;
}

/* ---------------- 1. 接口注册中心 ---------------- */

export interface PlatformApiRegistryItem {
  id: number;
  apiCode: string;
  apiName: string;
  systemCode: string;
  direction: string;
  protocol: string;
  httpMethod?: string;
  urlPath?: string;
  apiVersion: string;
  authType: string;
  timeoutMs?: number;
  slaMs?: number;
  ownerName?: string;
  apiStatus: string;
  description?: string;
  orgName?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PlatformApiRegistrySaveParams {
  apiCode?: string;
  apiName: string;
  systemCode: string;
  direction?: string;
  protocol?: string;
  httpMethod?: string;
  urlPath?: string;
  apiVersion?: string;
  authType?: string;
  timeoutMs?: number;
  slaMs?: number;
  ownerName?: string;
  apiStatus?: string;
  description?: string;
  orgName?: string;
  remark?: string;
}

/* ---------------- 2. 接口版本记录 ---------------- */

export interface PlatformApiVersionItem {
  id: number;
  recordNo: string;
  apiCode: string;
  apiName?: string;
  versionNo: string;
  changeType: string;
  compatibility: string;
  changeLog?: string;
  releaseDate?: string;
  versionStatus: string;
  operatorName?: string;
  orgName?: string;
  remark?: string;
  createdAt?: string;
}

export interface PlatformApiVersionSaveParams {
  recordNo?: string;
  apiCode: string;
  apiName?: string;
  versionNo: string;
  changeType?: string;
  compatibility?: string;
  changeLog?: string;
  releaseDate?: string;
  versionStatus?: string;
  operatorName?: string;
  orgName?: string;
  remark?: string;
}

/* ---------------- 3. 事件主题 ---------------- */

export interface PlatformEventTopicItem {
  id: number;
  topicCode: string;
  topicName: string;
  domain?: string;
  payloadSchema?: string;
  persistent?: number;
  retentionDays?: number;
  topicStatus: string;
  ownerName?: string;
  description?: string;
  orgName?: string;
  remark?: string;
  createdAt?: string;
}

export interface PlatformEventTopicSaveParams {
  topicCode?: string;
  topicName: string;
  domain?: string;
  payloadSchema?: string;
  persistent?: number;
  retentionDays?: number;
  topicStatus?: string;
  ownerName?: string;
  description?: string;
  orgName?: string;
  remark?: string;
}

/* ---------------- 4. 事件订阅 ---------------- */

export interface PlatformEventSubscriptionItem {
  id: number;
  subscriptionCode: string;
  topicCode: string;
  topicName?: string;
  subscriberSystem: string;
  endpoint?: string;
  deliveryMode: string;
  maxRetry?: number;
  retryIntervalSec?: number;
  idempotentEnabled?: number;
  subscriptionStatus: string;
  lastTestResult?: string;
  lastTestTime?: string;
  operatorName?: string;
  orgName?: string;
  remark?: string;
  createdAt?: string;
}

export interface PlatformEventSubscriptionSaveParams {
  subscriptionCode?: string;
  topicCode: string;
  topicName?: string;
  subscriberSystem: string;
  endpoint?: string;
  deliveryMode?: string;
  maxRetry?: number;
  retryIntervalSec?: number;
  idempotentEnabled?: number;
  subscriptionStatus?: string;
  lastTestResult?: string;
  lastTestTime?: string;
  operatorName?: string;
  orgName?: string;
  remark?: string;
}

/* ---------------- 5. 事件消息 ---------------- */

export interface PlatformEventMessageItem {
  id: number;
  messageKey: string;
  topicCode: string;
  subscriptionCode?: string;
  bizType?: string;
  bizId?: string;
  payload?: string;
  messageStatus: string;
  retryCount?: number;
  maxRetry?: number;
  nextRetryAt?: string;
  publishedAt?: string;
  deliveredAt?: string;
  errorMessage?: string;
  idempotentKey?: string;
  deadLetter?: number;
  operatorName?: string;
  orgName?: string;
  remark?: string;
  createdAt?: string;
}

export interface PlatformEventMessageSaveParams {
  messageKey?: string;
  topicCode: string;
  subscriptionCode?: string;
  bizType?: string;
  bizId?: string;
  payload?: string;
  messageStatus?: string;
  retryCount?: number;
  maxRetry?: number;
  nextRetryAt?: string;
  publishedAt?: string;
  deliveredAt?: string;
  errorMessage?: string;
  idempotentKey?: string;
  deadLetter?: number;
  operatorName?: string;
  orgName?: string;
  remark?: string;
}

/* ---------------- 6. 死信队列 ---------------- */

export interface PlatformDeadLetterItem {
  id: number;
  letterNo: string;
  messageKey: string;
  topicCode?: string;
  subscriberSystem?: string;
  payload?: string;
  failReason?: string;
  retryCount?: number;
  deadStatus: string;
  handlerName?: string;
  handledAt?: string;
  handleResult?: string;
  orgName?: string;
  remark?: string;
  createdAt?: string;
}

export interface PlatformDeadLetterSaveParams {
  letterNo?: string;
  messageKey: string;
  topicCode?: string;
  subscriberSystem?: string;
  payload?: string;
  failReason?: string;
  retryCount?: number;
  deadStatus?: string;
  handlerName?: string;
  handledAt?: string;
  handleResult?: string;
  orgName?: string;
  remark?: string;
}

/** 死信人工处理入参（POST /{id}/handle 的查询参数）。 */
export interface PlatformDeadLetterHandleParams {
  handleResult?: string;
  handlerName?: string;
}

/* ---------------- 7. 幂等记录 ---------------- */

export interface PlatformIdempotentRecordItem {
  id: number;
  idempotentKey: string;
  bizType?: string;
  bizId?: string;
  requestHash?: string;
  resultCode?: number;
  expireAt?: string;
  recordStatus: string;
  operatorName?: string;
  orgName?: string;
  remark?: string;
  createdAt?: string;
}

export interface PlatformIdempotentRecordSaveParams {
  idempotentKey: string;
  bizType?: string;
  bizId?: string;
  requestHash?: string;
  resultCode?: number;
  expireAt?: string;
  recordStatus?: string;
  operatorName?: string;
  orgName?: string;
  remark?: string;
}

/** 幂等键检查结果（GET /check）。 */
export interface PlatformIdempotentCheckResult {
  exists: boolean;
  recordStatus?: string | null;
  bizType?: string | null;
  bizId?: string | null;
}

/* ---------------- 8. 集成监控 ---------------- */

export interface PlatformMonitorItem {
  id: number;
  monitorNo: string;
  monitorDay: string;
  statHour?: number;
  systemCode: string;
  targetType: string;
  targetCode?: string;
  targetName?: string;
  totalCount?: number;
  successCount?: number;
  failCount?: number;
  avgCostMs?: number;
  maxCostMs?: number;
  healthStatus: string;
  alertFlag?: number;
  alertMessage?: string;
  orgName?: string;
  remark?: string;
  createdAt?: string;
}

export interface PlatformMonitorSaveParams {
  monitorNo?: string;
  monitorDay?: string;
  statHour?: number;
  systemCode: string;
  targetType?: string;
  targetCode?: string;
  targetName?: string;
  totalCount?: number;
  successCount?: number;
  failCount?: number;
  avgCostMs?: number;
  maxCostMs?: number;
  orgName?: string;
  remark?: string;
}

/* ---------------- 统计结果 ---------------- */

/** 后端 stats 接口返回的统计指标（键名以后端为准）。 */
export type PlatformStats = Record<string, number>;

/* ---------------- 枚举选项与文案 ---------------- */

/** 归属系统：PLM/ERP/SRM/MES/WMS/OA/EDI。 */
export const PLATFORM_SYSTEM_OPTIONS = [
  { label: 'PLM', value: 'PLM' },
  { label: 'ERP', value: 'ERP' },
  { label: 'SRM', value: 'SRM' },
  { label: 'MES', value: 'MES' },
  { label: 'WMS', value: 'WMS' },
  { label: 'OA', value: 'OA' },
  { label: 'EDI', value: 'EDI' },
] as const;

export const PLATFORM_SYSTEM_LABEL: Record<string, string> = {
  PLM: 'PLM',
  ERP: 'ERP',
  SRM: 'SRM',
  MES: 'MES',
  WMS: 'WMS',
  OA: 'OA',
  EDI: 'EDI',
};

/** 接口状态：DRAFT/ACTIVE/DEPRECATED/OFFLINE。 */
export const PLATFORM_API_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已发布', value: 'ACTIVE' },
  { label: '已废弃', value: 'DEPRECATED' },
  { label: '已下线', value: 'OFFLINE' },
] as const;

export const PLATFORM_API_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  ACTIVE: '已发布',
  DEPRECATED: '已废弃',
  OFFLINE: '已下线',
};

/** 交互方向：IN/OUT/BOTH。 */
export const PLATFORM_DIRECTION_OPTIONS = [
  { label: '接收(IN)', value: 'IN' },
  { label: '发布(OUT)', value: 'OUT' },
  { label: '双向(BOTH)', value: 'BOTH' },
] as const;

export const PLATFORM_DIRECTION_LABEL: Record<string, string> = {
  IN: '接收',
  OUT: '发布',
  BOTH: '双向',
};

/** 协议：HTTP/DUBBO/DB/MQ/FILE/EDI。 */
export const PLATFORM_PROTOCOL_OPTIONS = [
  { label: 'HTTP', value: 'HTTP' },
  { label: 'DUBBO', value: 'DUBBO' },
  { label: 'DB', value: 'DB' },
  { label: 'MQ', value: 'MQ' },
  { label: 'FILE', value: 'FILE' },
  { label: 'EDI', value: 'EDI' },
] as const;

export const PLATFORM_PROTOCOL_LABEL: Record<string, string> = {
  HTTP: 'HTTP',
  DUBBO: 'DUBBO',
  DB: 'DB',
  MQ: 'MQ',
  FILE: 'FILE',
  EDI: 'EDI',
};

/** HTTP 方法：GET/POST/PUT/DELETE。 */
export const PLATFORM_HTTP_METHOD_OPTIONS = [
  { label: 'GET', value: 'GET' },
  { label: 'POST', value: 'POST' },
  { label: 'PUT', value: 'PUT' },
  { label: 'DELETE', value: 'DELETE' },
] as const;

export const PLATFORM_HTTP_METHOD_LABEL: Record<string, string> = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
};

/** 认证方式：JWT/API_KEY/OAUTH2/MTLS/NONE。 */
export const PLATFORM_AUTH_TYPE_OPTIONS = [
  { label: 'JWT', value: 'JWT' },
  { label: 'API Key', value: 'API_KEY' },
  { label: 'OAuth2', value: 'OAUTH2' },
  { label: '双向 TLS', value: 'MTLS' },
  { label: '无认证', value: 'NONE' },
] as const;

export const PLATFORM_AUTH_TYPE_LABEL: Record<string, string> = {
  JWT: 'JWT',
  API_KEY: 'API Key',
  OAUTH2: 'OAuth2',
  MTLS: '双向 TLS',
  NONE: '无认证',
};

/** 版本变更类型：MAJOR/MINOR/PATCH。 */
export const PLATFORM_CHANGE_TYPE_OPTIONS = [
  { label: '主版本(MAJOR)', value: 'MAJOR' },
  { label: '次版本(MINOR)', value: 'MINOR' },
  { label: '补丁(PATCH)', value: 'PATCH' },
] as const;

export const PLATFORM_CHANGE_TYPE_LABEL: Record<string, string> = {
  MAJOR: '主版本',
  MINOR: '次版本',
  PATCH: '补丁',
};

/** 兼容性：COMPATIBLE/BREAKING。 */
export const PLATFORM_COMPATIBILITY_OPTIONS = [
  { label: '向后兼容', value: 'COMPATIBLE' },
  { label: '破坏性变更', value: 'BREAKING' },
] as const;

export const PLATFORM_COMPATIBILITY_LABEL: Record<string, string> = {
  COMPATIBLE: '向后兼容',
  BREAKING: '破坏性变更',
};

/** 版本状态：DRAFT/PUBLISHED/RELEASED。 */
export const PLATFORM_VERSION_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已发布', value: 'PUBLISHED' },
  { label: '已生效', value: 'RELEASED' },
] as const;

export const PLATFORM_VERSION_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  PUBLISHED: '已发布',
  RELEASED: '已生效',
};

/** 主题状态：DRAFT/ACTIVE/DISABLED。 */
export const PLATFORM_TOPIC_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已启用', value: 'ACTIVE' },
  { label: '已停用', value: 'DISABLED' },
] as const;

export const PLATFORM_TOPIC_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  ACTIVE: '已启用',
  DISABLED: '已停用',
};

/** 投递方式：PUSH/PULL。 */
export const PLATFORM_DELIVERY_MODE_OPTIONS = [
  { label: '推送(PUSH)', value: 'PUSH' },
  { label: '拉取(PULL)', value: 'PULL' },
] as const;

export const PLATFORM_DELIVERY_MODE_LABEL: Record<string, string> = {
  PUSH: '推送',
  PULL: '拉取',
};

/** 订阅状态：ENABLED/DISABLED。 */
export const PLATFORM_SUBSCRIPTION_STATUS_OPTIONS = [
  { label: '已启用', value: 'ENABLED' },
  { label: '已停用', value: 'DISABLED' },
] as const;

export const PLATFORM_SUBSCRIPTION_STATUS_LABEL: Record<string, string> = {
  ENABLED: '已启用',
  DISABLED: '已停用',
};

/** 联通测试结果：TEST_OK。 */
export const PLATFORM_TEST_RESULT_LABEL: Record<string, string> = {
  TEST_OK: '联通正常',
};

/** 消息状态：PENDING/SENT/FAILED/DEAD_LETTER。 */
export const PLATFORM_MESSAGE_STATUS_OPTIONS = [
  { label: '待发送', value: 'PENDING' },
  { label: '已发送', value: 'SENT' },
  { label: '发送失败', value: 'FAILED' },
  { label: '已入死信', value: 'DEAD_LETTER' },
] as const;

export const PLATFORM_MESSAGE_STATUS_LABEL: Record<string, string> = {
  PENDING: '待发送',
  SENT: '已发送',
  FAILED: '发送失败',
  DEAD_LETTER: '已入死信',
};

/** 死信状态：PENDING/HANDLED/IGNORED。 */
export const PLATFORM_DEAD_STATUS_OPTIONS = [
  { label: '待处理', value: 'PENDING' },
  { label: '已处理', value: 'HANDLED' },
  { label: '已忽略', value: 'IGNORED' },
] as const;

export const PLATFORM_DEAD_STATUS_LABEL: Record<string, string> = {
  PENDING: '待处理',
  HANDLED: '已处理',
  IGNORED: '已忽略',
};

/** 幂等记录状态：PROCESSING/SUCCESS/DUPLICATE/FAILED。 */
export const PLATFORM_RECORD_STATUS_OPTIONS = [
  { label: '处理中', value: 'PROCESSING' },
  { label: '成功', value: 'SUCCESS' },
  { label: '重复请求', value: 'DUPLICATE' },
  { label: '失败', value: 'FAILED' },
] as const;

export const PLATFORM_RECORD_STATUS_LABEL: Record<string, string> = {
  PROCESSING: '处理中',
  SUCCESS: '成功',
  DUPLICATE: '重复请求',
  FAILED: '失败',
};

/** 健康度：HEALTHY/WARNING/CRITICAL。 */
export const PLATFORM_HEALTH_STATUS_OPTIONS = [
  { label: '健康', value: 'HEALTHY' },
  { label: '告警', value: 'WARNING' },
  { label: '严重', value: 'CRITICAL' },
] as const;

export const PLATFORM_HEALTH_STATUS_LABEL: Record<string, string> = {
  HEALTHY: '健康',
  WARNING: '告警',
  CRITICAL: '严重',
};

/** 目标类型：API/EVENT。 */
export const PLATFORM_TARGET_TYPE_OPTIONS = [
  { label: '接口(API)', value: 'API' },
  { label: '事件(EVENT)', value: 'EVENT' },
] as const;

export const PLATFORM_TARGET_TYPE_LABEL: Record<string, string> = {
  API: '接口',
  EVENT: '事件',
};

/** 是否标志下拉选项。 */
export const PLATFORM_BOOLEAN_OPTIONS = [
  { label: '是', value: 1 },
  { label: '否', value: 0 },
] as const;
