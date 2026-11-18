import { request } from '@/services/request';
import type { PageResult } from '@/types/common';
import type {
  MobileDeviceItem,
  MobileDeviceQueryParams,
  MobileDeviceSaveParams,
  MobileExceptionItem,
  MobileExceptionQueryParams,
  MobileExceptionResolveParams,
  MobileExceptionSaveParams,
  MobileLabelRuleItem,
  MobileLabelRuleQueryParams,
  MobileLabelRuleSaveParams,
  MobileLabelValidateParams,
  MobileLabelValidateResult,
  MobileScanLogItem,
  MobileScanLogQueryParams,
  MobileScanLogSaveParams,
  MobileScanParams,
  MobileScanResult,
  MobileSceneItem,
  MobileSceneQueryParams,
  MobileSceneSaveParams,
} from '@/types/mobile';

/** G1-N6 T106 移动端与PDA（后端 Base: /platform/mobile，WBS T106）服务定义。 */

const BASE = '/platform/mobile';

/* ---------------- 1. PDA设备 ---------------- */

export const deviceService = {
  page: (params: MobileDeviceQueryParams): Promise<PageResult<MobileDeviceItem>> =>
    request<PageResult<MobileDeviceItem>>({ method: 'GET', url: `${BASE}/devices`, params }),

  detail: (id: number): Promise<MobileDeviceItem> =>
    request<MobileDeviceItem>({ method: 'GET', url: `${BASE}/devices/${id}` }),

  create: (data: MobileDeviceSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/devices`, data }),

  update: (id: number, data: MobileDeviceSaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/devices/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/devices/${id}` }),

  enable: (id: number): Promise<void> => request<void>({ method: 'POST', url: `${BASE}/devices/${id}/enable` }),

  disable: (id: number): Promise<void> => request<void>({ method: 'POST', url: `${BASE}/devices/${id}/disable` }),
};

/* ---------------- 2. 移动场景 ---------------- */

export const sceneService = {
  page: (params: MobileSceneQueryParams): Promise<PageResult<MobileSceneItem>> =>
    request<PageResult<MobileSceneItem>>({ method: 'GET', url: `${BASE}/scenes`, params }),

  detail: (id: number): Promise<MobileSceneItem> =>
    request<MobileSceneItem>({ method: 'GET', url: `${BASE}/scenes/${id}` }),

  create: (data: MobileSceneSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/scenes`, data }),

  update: (id: number, data: MobileSceneSaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/scenes/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/scenes/${id}` }),
};

/* ---------------- 3. 扫码日志 ---------------- */

export const scanLogService = {
  page: (params: MobileScanLogQueryParams): Promise<PageResult<MobileScanLogItem>> =>
    request<PageResult<MobileScanLogItem>>({ method: 'GET', url: `${BASE}/scan-logs`, params }),

  detail: (id: number): Promise<MobileScanLogItem> =>
    request<MobileScanLogItem>({ method: 'GET', url: `${BASE}/scan-logs/${id}` }),

  create: (data: MobileScanLogSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/scan-logs`, data }),

  update: (id: number, data: MobileScanLogSaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/scan-logs/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/scan-logs/${id}` }),

  /** 扫码入口：解析条码并按场景生成扫码日志。 */
  scan: (data: MobileScanParams): Promise<MobileScanResult> =>
    request<MobileScanResult>({ method: 'POST', url: `${BASE}/scan-logs/scan`, data }),
};

/* ---------------- 4. 标签校验规则 ---------------- */

export const labelRuleService = {
  page: (params: MobileLabelRuleQueryParams): Promise<PageResult<MobileLabelRuleItem>> =>
    request<PageResult<MobileLabelRuleItem>>({ method: 'GET', url: `${BASE}/label-rules`, params }),

  detail: (id: number): Promise<MobileLabelRuleItem> =>
    request<MobileLabelRuleItem>({ method: 'GET', url: `${BASE}/label-rules/${id}` }),

  create: (data: MobileLabelRuleSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/label-rules`, data }),

  update: (id: number, data: MobileLabelRuleSaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/label-rules/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/label-rules/${id}` }),

  /** 校验条码是否符合标签规则。 */
  validate: (data: MobileLabelValidateParams): Promise<MobileLabelValidateResult> =>
    request<MobileLabelValidateResult>({ method: 'POST', url: `${BASE}/label-rules/validate`, data }),
};

/* ---------------- 5. 移动异常队列 ---------------- */

export const mobileExceptionService = {
  page: (params: MobileExceptionQueryParams): Promise<PageResult<MobileExceptionItem>> =>
    request<PageResult<MobileExceptionItem>>({ method: 'GET', url: `${BASE}/exceptions`, params }),

  detail: (id: number): Promise<MobileExceptionItem> =>
    request<MobileExceptionItem>({ method: 'GET', url: `${BASE}/exceptions/${id}` }),

  create: (data: MobileExceptionSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/exceptions`, data }),

  update: (id: number, data: MobileExceptionSaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/exceptions/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/exceptions/${id}` }),

  /** 受理移动异常。 */
  handle: (id: number): Promise<void> => request<void>({ method: 'POST', url: `${BASE}/exceptions/${id}/handle` }),

  /** 解决移动异常，处理说明可选。 */
  resolve: (id: number, data?: MobileExceptionResolveParams): Promise<void> =>
    request<void>({ method: 'POST', url: `${BASE}/exceptions/${id}/resolve`, data }),

  /** 忽略移动异常。 */
  ignore: (id: number): Promise<void> => request<void>({ method: 'POST', url: `${BASE}/exceptions/${id}/ignore` }),
};
