import type { PageQuery } from '@/types/common';

/** G1-N6 T106 移动端与PDA（后端 Base: /platform/mobile）类型与枚举定义。 */

/* ---------------- 通用分页查询 ---------------- */

/** PDA设备分页查询条件。 */
export interface MobileDeviceQueryParams extends PageQuery {
  deviceType?: string;
  deviceStatus?: string;
}

/** 移动场景分页查询条件。 */
export interface MobileSceneQueryParams extends PageQuery {
  scanType?: string;
  sceneStatus?: string;
  bizModule?: string;
}

/** 扫码日志分页查询条件。 */
export interface MobileScanLogQueryParams extends PageQuery {
  sceneCode?: string;
  scanType?: string;
  scanResult?: string;
  barcode?: string;
  deviceNo?: string;
  startDate?: string;
  endDate?: string;
}

/** 标签校验规则分页查询条件。 */
export interface MobileLabelRuleQueryParams extends PageQuery {
  labelType?: string;
  checkType?: string;
  ruleStatus?: string;
}

/** 移动异常队列分页查询条件。 */
export interface MobileExceptionQueryParams extends PageQuery {
  sceneCode?: string;
  errorType?: string;
  exceptionStatus?: string;
}

/* ---------------- 1. PDA设备 ---------------- */

export interface MobileDeviceItem {
  id: number;
  deviceNo?: string;
  deviceName: string;
  deviceType?: string;
  deviceModel?: string;
  deviceStatus: string;
  bindUserId?: number | null;
  bindUserName?: string;
  lastActiveTime?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MobileDeviceSaveParams {
  deviceNo?: string;
  deviceName: string;
  deviceType?: string;
  deviceModel?: string;
  deviceStatus?: string;
  bindUserId?: number | null;
  bindUserName?: string;
  lastActiveTime?: string;
  orgName?: string;
  description?: string;
  remark?: string;
}

/* ---------------- 2. 移动场景 ---------------- */

export interface MobileSceneItem {
  id: number;
  sceneNo?: string;
  sceneCode: string;
  sceneName: string;
  scanType?: string;
  bizModule?: string;
  requireOffline?: number | null;
  sortNo?: number | null;
  sceneStatus: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MobileSceneSaveParams {
  sceneNo?: string;
  sceneCode: string;
  sceneName: string;
  scanType?: string;
  bizModule?: string;
  requireOffline?: number | null;
  sortNo?: number | null;
  sceneStatus?: string;
  orgName?: string;
  description?: string;
  remark?: string;
}

/* ---------------- 3. 扫码日志 ---------------- */

export interface MobileScanLogItem {
  id: number;
  logNo?: string;
  barcode?: string;
  sceneCode?: string;
  scanType?: string;
  scanResult?: string;
  message?: string;
  labelValid?: number | null;
  bizKey?: string;
  docNo?: string;
  deviceNo?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MobileScanLogSaveParams {
  logNo?: string;
  barcode?: string;
  sceneCode?: string;
  scanType?: string;
  scanResult?: string;
  message?: string;
  labelValid?: number | null;
  bizKey?: string;
  docNo?: string;
  deviceNo?: string;
  orgName?: string;
  description?: string;
  remark?: string;
}

/** 扫码入口请求体。 */
export interface MobileScanParams {
  barcode: string;
  sceneCode?: string;
  scanType?: string;
  bizKey?: string;
  docNo?: string;
  deviceNo?: string;
}

/** 扫码处理结果。 */
export interface MobileScanResult {
  logNo?: string;
  barcode?: string;
  scanResult?: string;
  message?: string;
  labelValid?: number | null;
}

/* ---------------- 4. 标签校验规则 ---------------- */

export interface MobileLabelRuleItem {
  id: number;
  ruleNo?: string;
  ruleCode?: string;
  ruleName: string;
  labelType?: string;
  checkType?: string;
  barcodePattern?: string;
  expectedLength?: number | null;
  errorLevel?: string;
  ruleStatus: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MobileLabelRuleSaveParams {
  ruleNo?: string;
  ruleCode?: string;
  ruleName: string;
  labelType?: string;
  checkType?: string;
  barcodePattern?: string;
  expectedLength?: number | null;
  errorLevel?: string;
  ruleStatus?: string;
  orgName?: string;
  description?: string;
  remark?: string;
}

/** 标签校验请求体。 */
export interface MobileLabelValidateParams {
  barcode: string;
  labelType?: string;
}

/** 标签校验结果。 */
export interface MobileLabelValidateResult {
  valid?: boolean;
  labelType?: string;
  ruleCode?: string;
  message?: string;
}

/* ---------------- 5. 移动异常队列 ---------------- */

export interface MobileExceptionItem {
  id: number;
  exceptionNo?: string;
  sceneCode?: string;
  barcode?: string;
  errorType?: string;
  errorMessage?: string;
  exceptionStatus: string;
  handlerName?: string;
  handledTime?: string;
  handleNote?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MobileExceptionSaveParams {
  exceptionNo?: string;
  sceneCode?: string;
  barcode?: string;
  errorType?: string;
  errorMessage?: string;
  exceptionStatus?: string;
  handlerName?: string;
  handledTime?: string;
  handleNote?: string;
  orgName?: string;
  description?: string;
  remark?: string;
}

/** 移动异常解决请求体，处理说明可选。 */
export interface MobileExceptionResolveParams {
  handleNote?: string;
}

/* ---------------- 枚举选项与文案 ---------------- */

/** 设备类型：PDA/PHONE/SCANNER/TABLET。 */
export const DEVICE_TYPE_OPTIONS = [
  { label: 'PDA', value: 'PDA' },
  { label: '手机', value: 'PHONE' },
  { label: '扫码枪', value: 'SCANNER' },
  { label: '平板', value: 'TABLET' },
] as const;

export const DEVICE_TYPE_LABEL: Record<string, string> = {
  PDA: 'PDA',
  PHONE: '手机',
  SCANNER: '扫码枪',
  TABLET: '平板',
};

/** 设备状态：ACTIVE 在线 / OFFLINE 离线 / DISABLED 停用。 */
export const DEVICE_STATUS_OPTIONS = [
  { label: '在线', value: 'ACTIVE' },
  { label: '离线', value: 'OFFLINE' },
  { label: '停用', value: 'DISABLED' },
] as const;

export const DEVICE_STATUS_LABEL: Record<string, string> = {
  ACTIVE: '在线',
  OFFLINE: '离线',
  DISABLED: '停用',
};

/** 扫码类型：RECEIVE/SHELVE/STOCKTAKE/PICK/REPORT/LABEL_CHECK。 */
export const SCAN_TYPE_OPTIONS = [
  { label: '扫码收货', value: 'RECEIVE' },
  { label: '上架', value: 'SHELVE' },
  { label: '盘点', value: 'STOCKTAKE' },
  { label: '拣料', value: 'PICK' },
  { label: '报工', value: 'REPORT' },
  { label: '标签校验', value: 'LABEL_CHECK' },
] as const;

export const SCAN_TYPE_LABEL: Record<string, string> = {
  RECEIVE: '扫码收货',
  SHELVE: '上架',
  STOCKTAKE: '盘点',
  PICK: '拣料',
  REPORT: '报工',
  LABEL_CHECK: '标签校验',
};

/** 场景状态：ACTIVE 生效 / DISABLED 停用。 */
export const SCENE_STATUS_OPTIONS = [
  { label: '生效', value: 'ACTIVE' },
  { label: '停用', value: 'DISABLED' },
] as const;

export const SCENE_STATUS_LABEL: Record<string, string> = {
  ACTIVE: '生效',
  DISABLED: '停用',
};

/** 扫码结果：SUCCESS 成功 / FAIL 失败。 */
export const SCAN_RESULT_OPTIONS = [
  { label: '成功', value: 'SUCCESS' },
  { label: '失败', value: 'FAIL' },
] as const;

export const SCAN_RESULT_LABEL: Record<string, string> = {
  SUCCESS: '成功',
  FAIL: '失败',
};

/** 标签类型：MATERIAL/PRODUCT/BOX/WAREHOUSE。 */
export const LABEL_TYPE_OPTIONS = [
  { label: '物料标签', value: 'MATERIAL' },
  { label: '产品标签', value: 'PRODUCT' },
  { label: '箱码', value: 'BOX' },
  { label: '库位标签', value: 'WAREHOUSE' },
] as const;

export const LABEL_TYPE_LABEL: Record<string, string> = {
  MATERIAL: '物料标签',
  PRODUCT: '产品标签',
  BOX: '箱码',
  WAREHOUSE: '库位标签',
};

/** 标签校验方式：FORMAT/CHECKSUM/LENGTH/PREFIX。 */
export const LABEL_CHECK_TYPE_OPTIONS = [
  { label: '格式', value: 'FORMAT' },
  { label: '校验位', value: 'CHECKSUM' },
  { label: '长度', value: 'LENGTH' },
  { label: '前缀', value: 'PREFIX' },
] as const;

export const LABEL_CHECK_TYPE_LABEL: Record<string, string> = {
  FORMAT: '格式',
  CHECKSUM: '校验位',
  LENGTH: '长度',
  PREFIX: '前缀',
};

/** 标签规则状态：ACTIVE 生效 / DISABLED 停用。 */
export const LABEL_RULE_STATUS_OPTIONS = [
  { label: '生效', value: 'ACTIVE' },
  { label: '停用', value: 'DISABLED' },
] as const;

export const LABEL_RULE_STATUS_LABEL: Record<string, string> = {
  ACTIVE: '生效',
  DISABLED: '停用',
};

/** 异常类型：SCAN_FAIL/LABEL_INVALID/OFFLINE_SYNC/PERMISSION/DATA_MISMATCH。 */
export const EXCEPTION_TYPE_OPTIONS = [
  { label: '扫码失败', value: 'SCAN_FAIL' },
  { label: '标签非法', value: 'LABEL_INVALID' },
  { label: '离线同步失败', value: 'OFFLINE_SYNC' },
  { label: '权限不足', value: 'PERMISSION' },
  { label: '数据不一致', value: 'DATA_MISMATCH' },
] as const;

export const EXCEPTION_TYPE_LABEL: Record<string, string> = {
  SCAN_FAIL: '扫码失败',
  LABEL_INVALID: '标签非法',
  OFFLINE_SYNC: '离线同步失败',
  PERMISSION: '权限不足',
  DATA_MISMATCH: '数据不一致',
};

/** 异常状态：OPEN 待处理 / HANDLING 处理中 / RESOLVED 已解决 / IGNORED 已忽略。 */
export const EXCEPTION_STATUS_OPTIONS = [
  { label: '待处理', value: 'OPEN' },
  { label: '处理中', value: 'HANDLING' },
  { label: '已解决', value: 'RESOLVED' },
  { label: '已忽略', value: 'IGNORED' },
] as const;

export const EXCEPTION_STATUS_LABEL: Record<string, string> = {
  OPEN: '待处理',
  HANDLING: '处理中',
  RESOLVED: '已解决',
  IGNORED: '已忽略',
};

/** 标签校验错误级别：ERROR 错误 / WARN 警告。 */
export const LABEL_ERROR_LEVEL_OPTIONS = [
  { label: '错误', value: 'ERROR' },
  { label: '警告', value: 'WARN' },
] as const;

export const LABEL_ERROR_LEVEL_LABEL: Record<string, string> = {
  ERROR: '错误',
  WARN: '警告',
};
