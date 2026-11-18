import type { PageQuery } from './common';

/* ================= 通用：枚举常量 ================= */

/** 伙伴类型 */
export const EDI_PARTNER_TYPE_OPTIONS = [
  { label: '客户', value: 'CUSTOMER' },
  { label: '供应商', value: 'SUPPLIER' },
];

export const EDI_PARTNER_TYPE_LABEL: Record<string, string> = {
  CUSTOMER: '客户',
  SUPPLIER: '供应商',
};

export const EDI_PARTNER_TYPE_COLOR: Record<string, string> = {
  CUSTOMER: 'blue',
  SUPPLIER: 'green',
};

/** 传输协议 */
export const EDI_PROTOCOL_OPTIONS = [
  { label: 'SFTP', value: 'SFTP' },
  { label: 'AS2', value: 'AS2' },
  { label: 'API', value: 'API' },
];

export const EDI_PROTOCOL_LABEL: Record<string, string> = {
  SFTP: 'SFTP',
  AS2: 'AS2',
  API: 'API',
};

/** 报文方向 */
export const EDI_DIRECTION_OPTIONS = [
  { label: '接收（INBOUND）', value: 'INBOUND' },
  { label: '发送（OUTBOUND）', value: 'OUTBOUND' },
];

export const EDI_DIRECTION_LABEL: Record<string, string> = {
  INBOUND: '接收',
  OUTBOUND: '发送',
};

export const EDI_DIRECTION_COLOR: Record<string, string> = {
  INBOUND: 'blue',
  OUTBOUND: 'purple',
};

/** 报文标准 */
export const EDI_STANDARD_OPTIONS = [
  { label: 'X12', value: 'X12' },
  { label: 'EDIFACT', value: 'EDIFACT' },
  { label: 'XML', value: 'XML' },
  { label: 'CSV', value: 'CSV' },
];

export const EDI_STANDARD_LABEL: Record<string, string> = {
  X12: 'X12',
  EDIFACT: 'EDIFACT',
  XML: 'XML',
  CSV: 'CSV',
};

/** 交易代码 */
export const EDI_TRANS_CODE_OPTIONS = [
  { label: '830 预测', value: '830' },
  { label: '850 采购订单', value: '850' },
  { label: '862 交付计划', value: '862' },
  { label: '855 订单确认', value: '855' },
  { label: '856 发货通知', value: '856' },
  { label: '997 功能确认', value: '997' },
];

export const EDI_TRANS_CODE_LABEL: Record<string, string> = {
  '830': '830 预测',
  '850': '850 采购订单',
  '862': '862 交付计划',
  '855': '855 订单确认',
  '856': '856 发货通知',
  '997': '997 功能确认',
};

/** 报文解析状态 */
export const EDI_PARSE_STATUS_OPTIONS = [
  { label: '已接收', value: 'RECEIVED' },
  { label: '已解析', value: 'PARSED' },
  { label: '解析失败', value: 'FAILED' },
  { label: '重复报文', value: 'DUPLICATE' },
  { label: '死信', value: 'DEAD_LETTER' },
];

export const EDI_PARSE_STATUS_LABEL: Record<string, string> = {
  RECEIVED: '已接收',
  PARSED: '已解析',
  FAILED: '解析失败',
  DUPLICATE: '重复报文',
  DEAD_LETTER: '死信',
};

export const EDI_PARSE_STATUS_COLOR: Record<string, string> = {
  RECEIVED: 'processing',
  PARSED: 'success',
  FAILED: 'error',
  DUPLICATE: 'warning',
  DEAD_LETTER: 'error',
};

/** 客户需求状态 */
export const EDI_DEMAND_STATUS_OPTIONS = [
  { label: '新建', value: 'NEW' },
  { label: '已变更', value: 'CHANGED' },
  { label: '已分发', value: 'DISPATCHED' },
  { label: '已确认', value: 'CONFIRMED' },
  { label: '已关闭', value: 'CLOSED' },
];

export const EDI_DEMAND_STATUS_LABEL: Record<string, string> = {
  NEW: '新建',
  CHANGED: '已变更',
  DISPATCHED: '已分发',
  CONFIRMED: '已确认',
  CLOSED: '已关闭',
};

export const EDI_DEMAND_STATUS_COLOR: Record<string, string> = {
  NEW: 'blue',
  CHANGED: 'warning',
  DISPATCHED: 'processing',
  CONFIRMED: 'success',
  CLOSED: 'default',
};

/** 需求变更类型 */
export const EDI_CHANGE_TYPE_OPTIONS = [
  { label: '新增', value: 'CHANGE_NEW' },
  { label: '变更', value: 'CHANGE' },
  { label: '取消', value: 'CHANGE_CANCEL' },
];

export const EDI_CHANGE_TYPE_LABEL: Record<string, string> = {
  CHANGE_NEW: '新增',
  CHANGE: '变更',
  CHANGE_CANCEL: '取消',
};

export const EDI_CHANGE_TYPE_COLOR: Record<string, string> = {
  CHANGE_NEW: 'blue',
  CHANGE: 'warning',
  CHANGE_CANCEL: 'error',
};

/** 分发发送状态 */
export const EDI_SEND_STATUS_OPTIONS = [
  { label: '待发送', value: 'PENDING' },
  { label: '已发送', value: 'SENT' },
  { label: '发送失败', value: 'FAILED' },
  { label: '已回执', value: 'ACKED' },
];

export const EDI_SEND_STATUS_LABEL: Record<string, string> = {
  PENDING: '待发送',
  SENT: '已发送',
  FAILED: '发送失败',
  ACKED: '已回执',
};

export const EDI_SEND_STATUS_COLOR: Record<string, string> = {
  PENDING: 'default',
  SENT: 'processing',
  FAILED: 'error',
  ACKED: 'success',
};

/** 分发回执状态 */
export const EDI_ACK_STATUS_LABEL: Record<string, string> = {
  CONFIRMED: '已确认',
  SHORTAGE: '缺料',
  REJECTED: '已拒绝',
};

export const EDI_ACK_STATUS_COLOR: Record<string, string> = {
  CONFIRMED: 'success',
  SHORTAGE: 'warning',
  REJECTED: 'error',
};

/** 供应商回执类型 */
export const EDI_ACK_TYPE_OPTIONS = [
  { label: '确认（CONFIRM）', value: 'CONFIRM' },
  { label: '承诺（PROVIDE）', value: 'PROVIDE' },
  { label: '缺料（SHORTAGE）', value: 'SHORTAGE' },
  { label: '拒绝（REJECT）', value: 'REJECT' },
  { label: '异常（EXCEPTION）', value: 'EXCEPTION' },
];

export const EDI_ACK_TYPE_LABEL: Record<string, string> = {
  CONFIRM: '确认',
  PROVIDE: '承诺',
  SHORTAGE: '缺料',
  REJECT: '拒绝',
  EXCEPTION: '异常',
};

export const EDI_ACK_TYPE_COLOR: Record<string, string> = {
  CONFIRM: 'success',
  PROVIDE: 'processing',
  SHORTAGE: 'warning',
  REJECT: 'error',
  EXCEPTION: 'error',
};

/** ASN 状态 */
export const EDI_ASN_STATUS_OPTIONS = [
  { label: '已创建', value: 'CREATED' },
  { label: '已发送', value: 'SENT' },
  { label: '已回执', value: 'ACKED' },
  { label: '已取消', value: 'CANCELLED' },
];

export const EDI_ASN_STATUS_LABEL: Record<string, string> = {
  CREATED: '已创建',
  SENT: '已发送',
  ACKED: '已回执',
  CANCELLED: '已取消',
};

export const EDI_ASN_STATUS_COLOR: Record<string, string> = {
  CREATED: 'default',
  SENT: 'processing',
  ACKED: 'success',
  CANCELLED: 'error',
};

/** 发送渠道 */
export const EDI_SEND_CHANNEL_OPTIONS = [
  { label: 'API', value: 'API' },
  { label: '邮件（MAIL）', value: 'MAIL' },
  { label: 'EDI', value: 'EDI' },
];

export const EDI_SEND_CHANNEL_LABEL: Record<string, string> = {
  API: 'API',
  MAIL: '邮件',
  EDI: 'EDI',
};

/** 映射转换类型 */
export const EDI_TRANSFORM_TYPE_OPTIONS = [
  { label: '直接取值（DIRECT）', value: 'DIRECT' },
  { label: '码表转换（DICT）', value: 'DICT' },
  { label: '日期转换（DATE）', value: 'DATE' },
  { label: '固定值（CONST）', value: 'CONST' },
];

export const EDI_TRANSFORM_TYPE_LABEL: Record<string, string> = {
  DIRECT: '直接取值',
  DICT: '码表转换',
  DATE: '日期转换',
  CONST: '固定值',
};

/** 映射作用域 */
export const EDI_MESSAGE_SCOPE_OPTIONS = [
  { label: '报文头（HEADER）', value: 'HEADER' },
  { label: '明细行（LINE）', value: 'LINE' },
];

export const EDI_MESSAGE_SCOPE_LABEL: Record<string, string> = {
  HEADER: '报文头',
  LINE: '明细行',
};

/** 启用/停用（字符串状态） */
export const EDI_ENABLED_OPTIONS = [
  { label: '启用', value: 'enabled' },
  { label: '停用', value: 'disabled' },
];

export const EDI_ENABLED_LABEL: Record<string, string> = {
  enabled: '启用',
  disabled: '停用',
};

export const EDI_ENABLED_COLOR: Record<string, string> = {
  enabled: 'success',
  disabled: 'error',
};

/** 启用/停用（整型状态） */
export const EDI_FLAG_OPTIONS = [
  { label: '启用', value: 1 },
  { label: '停用', value: 0 },
];

/** 分配规则 */
export const EDI_ALLOCATION_RULE_OPTIONS = [
  { label: '按供货份额', value: 'BY_SUPPLIER_SHARE' },
  { label: '按优先级', value: 'PRIORITY' },
  { label: '手工指定', value: 'MANUAL' },
];

export const EDI_ALLOCATION_RULE_LABEL: Record<string, string> = {
  BY_SUPPLIER_SHARE: '按供货份额',
  PRIORITY: '按优先级',
  MANUAL: '手工指定',
};

/** 交易日志动作类型 */
export const EDI_LOG_ACTION_LABEL: Record<string, string> = {
  RECEIVE: '接收',
  PARSE: '解析',
  SEND: '发送',
  ACK: '回执',
  RETRY: '重试',
  REPLAY: '重放',
  DISPATCH: '分发',
};

/** 交易日志结果 */
export const EDI_LOG_RESULT_OPTIONS = [
  { label: '成功', value: 'SUCCESS' },
  { label: '失败', value: 'FAIL' },
];

export const EDI_LOG_RESULT_LABEL: Record<string, string> = {
  SUCCESS: '成功',
  FAIL: '失败',
};

export const EDI_LOG_RESULT_COLOR: Record<string, string> = {
  SUCCESS: 'success',
  FAIL: 'error',
};

/** ASN 类型 */
export const EDI_ASN_TYPE_OPTIONS = [
  { label: '出库（OUTBOUND）', value: 'OUTBOUND' },
  { label: '入库（INBOUND）', value: 'INBOUND' },
];

/* ================= 伙伴与通道 ================= */

export interface EdiPartnerItem {
  id: number;
  partnerCode: string;
  partnerName: string;
  partnerType?: string;
  partnerId?: string;
  protocol?: string;
  endpoint?: string;
  port?: number;
  remotePath?: string;
  username?: string;
  secretRef?: string;
  certSubject?: string;
  certExpireDate?: string;
  charset?: string;
  contact?: string;
  email?: string;
  status?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EdiPartnerQuery extends PageQuery {
  partnerType?: string;
  protocol?: string;
  status?: string;
}

export interface EdiPartnerSaveParams {
  partnerCode: string;
  partnerName: string;
  partnerType?: string;
  partnerId?: string;
  protocol?: string;
  endpoint?: string;
  port?: number;
  remotePath?: string;
  username?: string;
  secretRef?: string;
  certSubject?: string;
  certExpireDate?: string;
  charset?: string;
  contact?: string;
  email?: string;
  status?: string;
  remark?: string;
}

/* ================= 交易集配置 ================= */

export interface EdiTransactionSetItem {
  id: number;
  partnerCode?: string;
  transCode: string;
  transName?: string;
  direction?: string;
  standard?: string;
  stdVersion?: string;
  headerSegTag?: string;
  lineSegTag?: string;
  ackTransCode?: string;
  ackRequired?: number;
  status?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EdiTransactionSetQuery extends PageQuery {
  partnerCode?: string;
  transCode?: string;
  direction?: string;
  standard?: string;
  status?: string;
}

export interface EdiTransactionSetSaveParams {
  partnerCode?: string;
  transCode: string;
  transName?: string;
  direction?: string;
  standard?: string;
  stdVersion?: string;
  headerSegTag?: string;
  lineSegTag?: string;
  ackTransCode?: string;
  ackRequired?: number;
  status?: string;
  description?: string;
  remark?: string;
}

/* ================= 报文映射 ================= */

export interface EdiMessageMapItem {
  id: number;
  mapCode: string;
  mapName: string;
  partnerCode?: string;
  transCode: string;
  standard?: string;
  direction?: string;
  scope?: string;
  sourcePath: string;
  targetField: string;
  transformType?: string;
  dictType?: string;
  datePattern?: string;
  defaultValue?: string;
  requiredFlag?: number;
  sortNo?: number;
  status?: number;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EdiMessageMapQuery extends PageQuery {
  partnerCode?: string;
  transCode?: string;
  scope?: string;
  transformType?: string;
  status?: number;
}

export interface EdiMessageMapSaveParams {
  mapCode: string;
  mapName: string;
  partnerCode?: string;
  transCode: string;
  standard?: string;
  direction?: string;
  scope?: string;
  sourcePath: string;
  targetField: string;
  transformType?: string;
  dictType?: string;
  datePattern?: string;
  defaultValue?: string;
  requiredFlag?: number;
  sortNo?: number;
  status?: number;
  remark?: string;
}

/* ================= 供应商供货关系 ================= */

export interface EdiSupplierMaterialItem {
  id: number;
  supplierCode: string;
  supplierName?: string;
  materialCode: string;
  sharePct?: number;
  leadTimeDays?: number;
  priority?: number;
  sendChannel?: string;
  status?: number;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EdiSupplierMaterialQuery extends PageQuery {
  supplierCode?: string;
  materialCode?: string;
  status?: number;
}

export interface EdiSupplierMaterialSaveParams {
  supplierCode: string;
  supplierName?: string;
  materialCode: string;
  sharePct?: number;
  leadTimeDays?: number;
  priority?: number;
  sendChannel?: string;
  status?: number;
  remark?: string;
}

/* ================= 原始报文与监控 ================= */

export interface EdiRawMessageItem {
  id: number;
  messageNo: string;
  controlNo?: string;
  partnerCode?: string;
  transCode?: string;
  direction?: string;
  standard?: string;
  protocol?: string;
  fileName?: string;
  rawContent?: string;
  rawSize?: number;
  checksum?: string;
  receivedAt?: string;
  parseStatus?: string;
  parseMessage?: string;
  parsedJson?: string;
  duplicateFlag?: number;
  retryCount?: number;
  lastRetryAt?: string;
  relatedDocNo?: string;
  remark?: string;
  createdAt?: string;
}

export interface EdiRawMessageQuery extends PageQuery {
  partnerCode?: string;
  transCode?: string;
  direction?: string;
  parseStatus?: string;
  duplicateFlag?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface EdiMessageReceiveParams {
  partnerCode: string;
  transCode?: string;
  controlNo?: string;
  standard?: string;
  protocol?: string;
  fileName?: string;
  rawContent: string;
  receivedAt?: string;
  autoParse?: boolean;
  remark?: string;
}

/* ================= 客户需求 ================= */

export interface EdiCustomerDemandItem {
  id: number;
  demandNo: string;
  messageNo?: string;
  partnerCode?: string;
  transCode?: string;
  docType?: string;
  demandVersion?: number;
  customerOrderNo?: string;
  customerLineNo?: string;
  customerCode?: string;
  materialCode?: string;
  productCode?: string;
  qty?: number;
  unit?: string;
  requiredDate?: string;
  shipTo?: string;
  plantCode?: string;
  status?: string;
  changeType?: string;
  prevQty?: number;
  prevRequiredDate?: string;
  changeReason?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EdiCustomerDemandQuery extends PageQuery {
  partnerCode?: string;
  customerCode?: string;
  transCode?: string;
  docType?: string;
  status?: string;
  materialCode?: string;
  customerOrderNo?: string;
}

export interface EdiDemandChangeLogItem {
  id: number;
  demandId?: number;
  demandNo?: string;
  changeType?: string;
  prevQty?: number;
  newQty?: number;
  prevDate?: string;
  newDate?: string;
  prevVersion?: number;
  newVersion?: number;
  messageNo?: string;
  changeReason?: string;
  operatorName?: string;
  changedAt?: string;
  remark?: string;
}

export interface EdiDemandDispatchParams {
  demandNo: string;
  supplierCodes?: string[];
  allocationRule?: string;
  sendChannel?: string;
  remark?: string;
  autoSend?: boolean;
}

/* ================= 供应商分发 ================= */

export interface EdiDemandDispatchItem {
  id: number;
  dispatchNo: string;
  demandId?: number;
  demandNo?: string;
  supplierCode?: string;
  supplierName?: string;
  materialCode?: string;
  qty?: number;
  unit?: string;
  requiredDate?: string;
  demandVersion?: number;
  allocationRule?: string;
  sharePct?: number;
  sendChannel?: string;
  sendStatus?: string;
  retryCount?: number;
  sentAt?: string;
  ackAt?: string;
  ackStatus?: string;
  failReason?: string;
  remark?: string;
  createdAt?: string;
}

export interface EdiDispatchQuery extends PageQuery {
  demandNo?: string;
  supplierCode?: string;
  sendStatus?: string;
  dispatchNo?: string;
}

/* ================= 供应商回执 ================= */

export interface EdiSupplierAckItem {
  id: number;
  ackNo: string;
  dispatchId?: number;
  dispatchNo?: string;
  supplierCode?: string;
  ackType?: string;
  confirmedQty?: number;
  confirmedDate?: string;
  shortageQty?: number;
  shortageReason?: string;
  exceptionText?: string;
  diffFlag?: number;
  source?: string;
  ackAt?: string;
  remark?: string;
  createdAt?: string;
}

export interface EdiAckQuery extends PageQuery {
  dispatchNo?: string;
  supplierCode?: string;
  ackType?: string;
}

export interface EdiAckParams {
  dispatchNo: string;
  supplierCode?: string;
  ackType?: string;
  confirmedQty?: number;
  confirmedDate?: string;
  shortageQty?: number;
  shortageReason?: string;
  exceptionText?: string;
  source?: string;
  remark?: string;
}

/* ================= ASN 交付 ================= */

export interface EdiAsnItem {
  id: number;
  asnNo: string;
  dispatchNo?: string;
  demandNo?: string;
  transCode?: string;
  asnType?: string;
  customerCode?: string;
  supplierCode?: string;
  shipTo?: string;
  carrier?: string;
  trackingNo?: string;
  plateNo?: string;
  shipDate?: string;
  etaDate?: string;
  totalQty?: number;
  packageCount?: number;
  status?: string;
  sendAt?: string;
  ackAt?: string;
  remark?: string;
  createdAt?: string;
}

export interface EdiAsnLineItem {
  id: number;
  asnId?: number;
  asnNo?: string;
  lineNo?: number;
  materialCode?: string;
  qty?: number;
  unit?: string;
  batchNo?: string;
  packageCode?: string;
  boxCode?: string;
  remark?: string;
}

export interface EdiAsnDetail {
  asn: EdiAsnItem;
  lines: EdiAsnLineItem[];
}

export interface EdiAsnQuery extends PageQuery {
  asnNo?: string;
  demandNo?: string;
  supplierCode?: string;
  customerCode?: string;
  status?: string;
}

export interface EdiAsnLineSaveParams {
  lineNo?: number;
  materialCode?: string;
  qty?: number;
  unit?: string;
  batchNo?: string;
  packageCode?: string;
  boxCode?: string;
  remark?: string;
}

export interface EdiAsnSaveParams {
  asnNo?: string;
  dispatchNo?: string;
  demandNo?: string;
  transCode?: string;
  asnType?: string;
  customerCode?: string;
  supplierCode?: string;
  shipTo?: string;
  carrier?: string;
  trackingNo?: string;
  plateNo?: string;
  shipDate?: string;
  etaDate?: string;
  packageCount?: number;
  remark?: string;
  lines?: EdiAsnLineSaveParams[];
}

/* ================= 交易日志 ================= */

export interface EdiTransactionLogItem {
  id: number;
  logNo: string;
  messageNo?: string;
  partnerCode?: string;
  transCode?: string;
  direction?: string;
  actionType?: string;
  result?: string;
  message?: string;
  refNo?: string;
  operatorId?: number;
  operatorName?: string;
  logAt?: string;
  remark?: string;
}

export interface EdiTransactionLogQuery extends PageQuery {
  messageNo?: string;
  partnerCode?: string;
  transCode?: string;
  actionType?: string;
  result?: string;
  dateFrom?: string;
  dateTo?: string;
}
