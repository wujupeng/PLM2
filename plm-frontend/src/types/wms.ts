import type { PageQuery } from './common';

/* ================= 通用：枚举常量（与后端 sys_dictionary 对齐） ================= */

/** 库位类型 */
export const WMS_LOCATION_TYPE_OPTIONS = [
  { label: '货架库位', value: 'RACK' },
  { label: '存储区', value: 'STORAGE' },
  { label: '暂存区', value: 'STAGING' },
  { label: '线边库位', value: 'LINE_SIDE' },
  { label: '收货区', value: 'RECEIVING' },
];

export const WMS_LOCATION_TYPE_LABEL: Record<string, string> = {
  RACK: '货架库位',
  STORAGE: '存储区',
  STAGING: '暂存区',
  LINE_SIDE: '线边库位',
  RECEIVING: '收货区',
};

/** 看板类型 */
export const WMS_KANBAN_TYPE_OPTIONS = [
  { label: '生产看板', value: 'PRODUCTION' },
  { label: '供应商看板', value: 'SUPPLIER' },
  { label: '内部看板', value: 'IN_HOUSE' },
];

export const WMS_KANBAN_TYPE_LABEL: Record<string, string> = {
  PRODUCTION: '生产看板',
  SUPPLIER: '供应商看板',
  IN_HOUSE: '内部看板',
};

/** 看板状态 */
export const WMS_KANBAN_STATUS_OPTIONS = [
  { label: '满箱', value: 'FULL' },
  { label: '空箱待补', value: 'EMPTY' },
  { label: '补货中', value: 'REPLENISHING' },
  { label: '停用', value: 'IDLE' },
];

export const WMS_KANBAN_STATUS_LABEL: Record<string, string> = {
  FULL: '满箱',
  EMPTY: '空箱待补',
  REPLENISHING: '补货中',
  IDLE: '停用',
};

export const WMS_KANBAN_STATUS_COLOR: Record<string, string> = {
  FULL: 'success',
  EMPTY: 'error',
  REPLENISHING: 'processing',
  IDLE: 'default',
};

/** 拉动信号 */
export const WMS_PULL_SIGNAL_OPTIONS = [
  { label: '看板卡', value: 'CARD' },
  { label: '电子拉动', value: 'ELECTRONIC' },
  { label: '安灯呼叫', value: 'ANDON' },
];

/** 配送任务类型 */
export const WMS_TASK_TYPE_OPTIONS = [
  { label: '补料', value: 'REPLENISH' },
  { label: '退料', value: 'RETURN' },
  { label: '调拨', value: 'TRANSFER' },
];

export const WMS_TASK_TYPE_LABEL: Record<string, string> = {
  REPLENISH: '补料',
  RETURN: '退料',
  TRANSFER: '调拨',
};

/** 配送任务状态 */
export const WMS_DELIVERY_STATUS_OPTIONS = [
  { label: '待派发', value: 'CREATED' },
  { label: '已接单', value: 'ACCEPTED' },
  { label: '配送中', value: 'DELIVERING' },
  { label: '已签收', value: 'SIGNED' },
  { label: '已取消', value: 'CANCELLED' },
];

export const WMS_DELIVERY_STATUS_LABEL: Record<string, string> = {
  CREATED: '待派发',
  ACCEPTED: '已接单',
  DELIVERING: '配送中',
  SIGNED: '已签收',
  CANCELLED: '已取消',
};

export const WMS_DELIVERY_STATUS_COLOR: Record<string, string> = {
  CREATED: 'default',
  ACCEPTED: 'processing',
  DELIVERING: 'processing',
  SIGNED: 'success',
  CANCELLED: 'error',
};

/** 领料校验结果 */
export const WMS_PICK_RESULT_OPTIONS = [
  { label: '通过', value: 'PASS' },
  { label: '阻断', value: 'BLOCKED' },
  { label: '预警放行', value: 'WARN' },
];

export const WMS_PICK_RESULT_LABEL: Record<string, string> = {
  PASS: '通过',
  BLOCKED: '阻断',
  WARN: '预警放行',
};

export const WMS_PICK_RESULT_COLOR: Record<string, string> = {
  PASS: 'success',
  BLOCKED: 'error',
  WARN: 'warning',
};

/** FIFO 校验结果 */
export const WMS_FIFO_RESULT_OPTIONS = [
  { label: '符合先进先出', value: 'FIFO_OK' },
  { label: '违反先进先出', value: 'FIFO_VIOLATION' },
  { label: '授权例外', value: 'FIFO_EXCEPTION' },
];

export const WMS_FIFO_RESULT_LABEL: Record<string, string> = {
  FIFO_OK: '符合先进先出',
  FIFO_VIOLATION: '违反先进先出',
  FIFO_EXCEPTION: '授权例外',
};

export const WMS_FIFO_RESULT_COLOR: Record<string, string> = {
  FIFO_OK: 'success',
  FIFO_VIOLATION: 'error',
  FIFO_EXCEPTION: 'warning',
};

/** FIFO 判定依据 */
export const WMS_FIFO_BASIS_OPTIONS = [
  { label: '入库日期', value: 'INBOUND_DATE' },
  { label: '检验放行日期', value: 'RELEASE_DATE' },
  { label: '批次日期', value: 'BATCH_DATE' },
  { label: '生产日期', value: 'PRODUCTION_DATE' },
];

export const WMS_FIFO_BASIS_LABEL: Record<string, string> = {
  INBOUND_DATE: '入库日期',
  RELEASE_DATE: '检验放行日期',
  BATCH_DATE: '批次日期',
  PRODUCTION_DATE: '生产日期',
};

/** FIFO 规则作用域 */
export const WMS_FIFO_SCOPE_OPTIONS = [
  { label: '全局', value: 'GLOBAL' },
  { label: '客户', value: 'CUSTOMER' },
  { label: '物料', value: 'MATERIAL' },
];

export const WMS_FIFO_SCOPE_LABEL: Record<string, string> = {
  GLOBAL: '全局',
  CUSTOMER: '客户',
  MATERIAL: '物料',
};

/** 检验状态 */
export const WMS_INSPECTION_STATUS_OPTIONS = [
  { label: '待检', value: 'PENDING' },
  { label: '已放行', value: 'RELEASED' },
  { label: '不合格', value: 'REJECTED' },
];

export const WMS_INSPECTION_STATUS_LABEL: Record<string, string> = {
  PENDING: '待检',
  RELEASED: '已放行',
  REJECTED: '不合格',
};

export const WMS_INSPECTION_STATUS_COLOR: Record<string, string> = {
  PENDING: 'warning',
  RELEASED: 'success',
  REJECTED: 'error',
};

/** 批次状态 */
export const WMS_BATCH_STATUS_OPTIONS = [
  { label: '在库', value: 'IN_STOCK' },
  { label: '已消耗', value: 'CONSUMED' },
  { label: '已退料', value: 'RETURNED' },
  { label: '已报废', value: 'SCRAPPED' },
  { label: '已超期', value: 'EXPIRED' },
];

export const WMS_BATCH_STATUS_LABEL: Record<string, string> = {
  IN_STOCK: '在库',
  CONSUMED: '已消耗',
  RETURNED: '已退料',
  SCRAPPED: '已报废',
  EXPIRED: '已超期',
};

export const WMS_BATCH_STATUS_COLOR: Record<string, string> = {
  IN_STOCK: 'success',
  CONSUMED: 'default',
  RETURNED: 'warning',
  SCRAPPED: 'error',
  EXPIRED: 'error',
};

/** 防混料绑定类型 */
export const WMS_BINDING_TYPE_OPTIONS = [
  { label: '产线-物料绑定', value: 'LINE_MATERIAL' },
  { label: '产线-批次绑定', value: 'LINE_BATCH' },
  { label: '工位-容器绑定', value: 'STATION_CONTAINER' },
];

export const WMS_BINDING_TYPE_LABEL: Record<string, string> = {
  LINE_MATERIAL: '产线-物料绑定',
  LINE_BATCH: '产线-批次绑定',
  STATION_CONTAINER: '工位-容器绑定',
};

/** 库存流水类型 */
export const WMS_TXN_TYPE_OPTIONS = [
  { label: '入库', value: 'INBOUND' },
  { label: '发料', value: 'ISSUE' },
  { label: '消耗', value: 'CONSUME' },
  { label: '退料', value: 'RETURN' },
  { label: '报废', value: 'SCRAP' },
  { label: '盘点调整', value: 'COUNT_ADJUST' },
  { label: '调拨', value: 'TRANSFER' },
];

export const WMS_TXN_TYPE_LABEL: Record<string, string> = {
  INBOUND: '入库',
  ISSUE: '发料',
  CONSUME: '消耗',
  RETURN: '退料',
  SCRAP: '报废',
  COUNT_ADJUST: '盘点调整',
  TRANSFER: '调拨',
};

export const WMS_TXN_TYPE_COLOR: Record<string, string> = {
  INBOUND: 'success',
  ISSUE: 'processing',
  CONSUME: 'default',
  RETURN: 'warning',
  SCRAP: 'error',
  COUNT_ADJUST: 'purple',
  TRANSFER: 'blue',
};

/** 线边库存状态 */
export const WMS_STOCK_STATUS_OPTIONS = [
  { label: '正常', value: 'NORMAL' },
  { label: '预警', value: 'WARNING' },
  { label: '缺料', value: 'SHORTAGE' },
];

export const WMS_STOCK_STATUS_LABEL: Record<string, string> = {
  NORMAL: '正常',
  WARNING: '预警',
  SHORTAGE: '缺料',
};

export const WMS_STOCK_STATUS_COLOR: Record<string, string> = {
  NORMAL: 'success',
  WARNING: 'warning',
  SHORTAGE: 'error',
};

/** 缺料预警等级 */
export const WMS_WARNING_LEVEL_OPTIONS = [
  { label: '提示', value: 'L1' },
  { label: '关注', value: 'L2' },
  { label: '严重', value: 'L3' },
  { label: '紧急', value: 'CRITICAL' },
];

export const WMS_WARNING_LEVEL_LABEL: Record<string, string> = {
  L1: '提示',
  L2: '关注',
  L3: '严重',
  CRITICAL: '紧急',
};

export const WMS_WARNING_LEVEL_COLOR: Record<string, string> = {
  L1: 'default',
  L2: 'blue',
  L3: 'warning',
  CRITICAL: 'error',
};

/** 缺料预警状态 */
export const WMS_WARNING_STATUS_OPTIONS = [
  { label: '待处理', value: 'OPEN' },
  { label: '已确认', value: 'ACK' },
  { label: '处理中', value: 'PROCESSING' },
  { label: '已关闭', value: 'CLOSED' },
];

export const WMS_WARNING_STATUS_LABEL: Record<string, string> = {
  OPEN: '待处理',
  ACK: '已确认',
  PROCESSING: '处理中',
  CLOSED: '已关闭',
};

export const WMS_WARNING_STATUS_COLOR: Record<string, string> = {
  OPEN: 'error',
  ACK: 'warning',
  PROCESSING: 'processing',
  CLOSED: 'success',
};

/** 欠料异常单状态 */
export const WMS_CASE_STATUS_OPTIONS = [
  { label: '待处理', value: 'OPEN' },
  { label: '处理中', value: 'PROCESSING' },
  { label: '已关闭', value: 'CLOSED' },
];

export const WMS_CASE_STATUS_LABEL: Record<string, string> = {
  OPEN: '待处理',
  PROCESSING: '处理中',
  CLOSED: '已关闭',
};

export const WMS_CASE_STATUS_COLOR: Record<string, string> = {
  OPEN: 'error',
  PROCESSING: 'processing',
  CLOSED: 'success',
};

/** 欠料处理动作 */
export const WMS_CASE_ACTION_OPTIONS = [
  { label: '登记', value: 'REGISTER' },
  { label: '措施', value: 'MEASURE' },
  { label: '升级', value: 'ESCALATE' },
  { label: '恢复', value: 'RECOVER' },
  { label: '关闭', value: 'CLOSE' },
];

export const WMS_CASE_ACTION_LABEL: Record<string, string> = {
  REGISTER: '登记',
  MEASURE: '措施',
  ESCALATE: '升级',
  RECOVER: '恢复',
  CLOSE: '关闭',
};

/** 应急预案类型 */
export const WMS_PLAN_TYPE_OPTIONS = [
  { label: '替代料', value: 'SUBSTITUTE' },
  { label: '跨仓调拨', value: 'TRANSFER' },
  { label: '供应商加急', value: 'EXPEDITE' },
  { label: '计划调整', value: 'RESCHEDULE' },
  { label: '升级上报', value: 'ESCALATE' },
];

export const WMS_PLAN_TYPE_LABEL: Record<string, string> = {
  SUBSTITUTE: '替代料',
  TRANSFER: '跨仓调拨',
  EXPEDITE: '供应商加急',
  RESCHEDULE: '计划调整',
  ESCALATE: '升级上报',
};

/** 应急预案状态 */
export const WMS_PLAN_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已审批', value: 'APPROVED' },
  { label: '执行中', value: 'EXECUTING' },
  { label: '已完成', value: 'COMPLETED' },
  { label: '已取消', value: 'CANCELLED' },
];

export const WMS_PLAN_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  APPROVED: '已审批',
  EXECUTING: '执行中',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
};

export const WMS_PLAN_STATUS_COLOR: Record<string, string> = {
  DRAFT: 'default',
  APPROVED: 'processing',
  EXECUTING: 'processing',
  COMPLETED: 'success',
  CANCELLED: 'error',
};

/** 启用状态 */
export const WMS_ENABLED_OPTIONS = [
  { label: '启用', value: 'enabled' },
  { label: '停用', value: 'disabled' },
];

export const WMS_ENABLED_LABEL: Record<string, string> = {
  enabled: '启用',
  disabled: '停用',
};

export const WMS_ENABLED_COLOR: Record<string, string> = {
  enabled: 'success',
  disabled: 'default',
};

/* ================= 库位货架（DEV-075） ================= */

export interface WmsStorageLocationItem {
  id: number;
  locationCode: string;
  locationName?: string;
  warehouseCode?: string;
  areaCode?: string;
  rackCode?: string;
  levelCode?: string;
  binCode?: string;
  locationType?: string;
  lineCode?: string;
  capacity?: number;
  status?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WmsLocationQuery extends PageQuery {
  locationCode?: string;
  locationName?: string;
  warehouseCode?: string;
  locationType?: string;
  lineCode?: string;
  status?: string;
}

export interface WmsLocationSaveParams {
  locationCode: string;
  locationName?: string;
  warehouseCode?: string;
  areaCode?: string;
  rackCode?: string;
  levelCode?: string;
  binCode?: string;
  locationType?: string;
  lineCode?: string;
  capacity?: number;
  status?: string;
  remark?: string;
}

/* ================= 物料批次（DEV-075/079） ================= */

export interface WmsMaterialBatchItem {
  id: number;
  batchNo: string;
  materialCode: string;
  materialName?: string;
  locationCode?: string;
  containerCode?: string;
  supplierCode?: string;
  qtyOnHand?: number;
  unit?: string;
  inboundDate?: string;
  releaseDate?: string;
  productionDate?: string;
  expiryDate?: string;
  inspectionStatus?: string;
  batchStatus?: string;
  workOrderNo?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WmsBatchQuery extends PageQuery {
  materialCode?: string;
  batchNo?: string;
  locationCode?: string;
  containerCode?: string;
  supplierCode?: string;
  inspectionStatus?: string;
  batchStatus?: string;
}

export interface WmsBatchSaveParams {
  batchNo: string;
  materialCode: string;
  materialName?: string;
  locationCode?: string;
  containerCode?: string;
  supplierCode?: string;
  qtyOnHand?: number;
  unit?: string;
  inboundDate?: string;
  releaseDate?: string;
  productionDate?: string;
  expiryDate?: string;
  inspectionStatus?: string;
  batchStatus?: string;
  workOrderNo?: string;
  remark?: string;
}

/* ================= FIFO 规则（DEV-079） ================= */

export interface WmsFifoRuleItem {
  id: number;
  ruleCode: string;
  ruleName?: string;
  scope?: string;
  customerCode?: string;
  materialCode?: string;
  fifoBasis?: string;
  expiryCheck?: number;
  expiryWarnDays?: number;
  allowException?: number;
  exceptionRole?: string;
  priority?: number;
  status?: number;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WmsFifoRuleQuery extends PageQuery {
  scope?: string;
  customerCode?: string;
  materialCode?: string;
  status?: number;
}

export interface WmsFifoRuleSaveParams {
  ruleCode: string;
  ruleName?: string;
  scope?: string;
  customerCode?: string;
  materialCode?: string;
  fifoBasis?: string;
  expiryCheck?: number;
  expiryWarnDays?: number;
  allowException?: number;
  exceptionRole?: string;
  priority?: number;
  status?: number;
  remark?: string;
}

/* ================= 防混料绑定（DEV-080） ================= */

export interface WmsMaterialBindingItem {
  id: number;
  bindingNo: string;
  bindType?: string;
  lineCode?: string;
  workStation?: string;
  materialCode: string;
  batchNo?: string;
  containerCode?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  bindStatus?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WmsBindingQuery extends PageQuery {
  bindType?: string;
  lineCode?: string;
  workStation?: string;
  materialCode?: string;
  bindStatus?: string;
}

export interface WmsBindingSaveParams {
  bindType?: string;
  lineCode?: string;
  workStation?: string;
  materialCode: string;
  batchNo?: string;
  containerCode?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  bindStatus?: string;
  remark?: string;
}

/* ================= 电子看板（DEV-076） ================= */

export interface WmsKanbanItem {
  id: number;
  kanbanNo: string;
  kanbanType?: string;
  materialCode: string;
  materialName?: string;
  fromLocationCode?: string;
  lineCode?: string;
  workStation?: string;
  containerQty?: number;
  replenishPoint?: number;
  minQty?: number;
  maxQty?: number;
  currentQty?: number;
  kanbanStatus?: string;
  pullSignal?: string;
  supplierCode?: string;
  leadTimeDays?: number;
  status?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WmsKanbanQuery extends PageQuery {
  kanbanType?: string;
  materialCode?: string;
  lineCode?: string;
  kanbanStatus?: string;
  status?: string;
}

export interface WmsKanbanSaveParams {
  kanbanNo?: string;
  kanbanType?: string;
  materialCode: string;
  materialName?: string;
  fromLocationCode?: string;
  lineCode?: string;
  workStation?: string;
  containerQty?: number;
  replenishPoint?: number;
  minQty?: number;
  maxQty?: number;
  currentQty?: number;
  kanbanStatus?: string;
  pullSignal?: string;
  supplierCode?: string;
  leadTimeDays?: number;
  status?: string;
  remark?: string;
}

export interface WmsKanbanPullParams {
  triggeredBy: string;
  qty?: number;
  remark?: string;
}

/* ================= 配送任务（DEV-077） ================= */

export interface WmsDeliveryTaskItem {
  id: number;
  taskNo: string;
  kanbanNo?: string;
  taskType?: string;
  materialCode: string;
  materialName?: string;
  qty?: number;
  unit?: string;
  fromLocationCode?: string;
  toLocationCode?: string;
  lineCode?: string;
  workStation?: string;
  batchNo?: string;
  priority?: number;
  taskStatus?: string;
  assignee?: string;
  dispatchAt?: string;
  acceptAt?: string;
  deliverAt?: string;
  signAt?: string;
  signBy?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WmsDeliveryQuery extends PageQuery {
  taskNo?: string;
  kanbanNo?: string;
  materialCode?: string;
  lineCode?: string;
  taskType?: string;
  taskStatus?: string;
  assignee?: string;
}

export interface WmsDeliveryCreateParams {
  kanbanNo?: string;
  taskType?: string;
  materialCode: string;
  materialName?: string;
  qty?: number;
  unit?: string;
  fromLocationCode?: string;
  toLocationCode?: string;
  lineCode?: string;
  workStation?: string;
  batchNo?: string;
  priority?: number;
  remark?: string;
}

export interface WmsDeliveryExecuteParams {
  assignee?: string;
  signBy?: string;
  remark?: string;
}

/* ================= 扫码领料（DEV-078/080） ================= */

export interface WmsPickRecordItem {
  id: number;
  pickNo: string;
  workOrderNo: string;
  materialCode: string;
  materialName?: string;
  batchNo?: string;
  locationCode?: string;
  containerCode?: string;
  qty?: number;
  unit?: string;
  lineCode?: string;
  workStation?: string;
  operatorName?: string;
  scanResult?: string;
  fifoResult?: string;
  fifoRuleCode?: string;
  expectedBatchNo?: string;
  mixCheckResult?: string;
  bindingNo?: string;
  blockReason?: string;
  exceptionAuthorized?: number;
  authorizedBy?: string;
  authorizeReason?: string;
  relatedDeliveryNo?: string;
  pickAt?: string;
  remark?: string;
  createdAt?: string;
}

export interface WmsPickQuery extends PageQuery {
  workOrderNo?: string;
  materialCode?: string;
  batchNo?: string;
  lineCode?: string;
  scanResult?: string;
  fifoResult?: string;
  mixCheckResult?: string;
  operatorName?: string;
}

export interface WmsPickVerifyParams {
  workOrderNo: string;
  materialCode: string;
  batchNo: string;
  lineCode: string;
  workStation: string;
  qty: number;
  locationCode?: string;
  containerCode?: string;
  unit?: string;
  operatorName?: string;
  authorizeException?: boolean;
  authorizedBy?: string;
  authorizeReason?: string;
  relatedDeliveryNo?: string;
  remark?: string;
}

/* ================= 线边库存与流水（DEV-081） ================= */

export interface WmsLineSideStockItem {
  id: number;
  lineCode: string;
  workStation?: string;
  materialCode: string;
  materialName?: string;
  batchNo?: string;
  containerCode?: string;
  unit?: string;
  qtyOnHand?: number;
  qtyIssued?: number;
  qtyConsumed?: number;
  qtyReturned?: number;
  qtyScrapped?: number;
  safetyStock?: number;
  stockStatus?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WmsLineStockQuery extends PageQuery {
  lineCode?: string;
  workStation?: string;
  materialCode?: string;
  batchNo?: string;
  stockStatus?: string;
}

export interface WmsLineStockSaveParams {
  lineCode: string;
  workStation?: string;
  materialCode: string;
  materialName?: string;
  batchNo?: string;
  containerCode?: string;
  unit?: string;
  qtyOnHand?: number;
  safetyStock?: number;
  stockStatus?: string;
  remark?: string;
}

export interface WmsLineStockTxnParams {
  qty: number;
  workOrderNo?: string;
  refNo?: string;
  containerCode?: string;
  toLocationCode?: string;
  batchNo?: string;
  operatorName?: string;
  remark?: string;
}

export interface WmsInventoryTxnItem {
  id: number;
  txnNo: string;
  txnType?: string;
  materialCode: string;
  batchNo?: string;
  fromLocationCode?: string;
  toLocationCode?: string;
  qty?: number;
  unit?: string;
  workOrderNo?: string;
  lineCode?: string;
  workStation?: string;
  refNo?: string;
  operatorName?: string;
  txnAt?: string;
  remark?: string;
  createdAt?: string;
}

export interface WmsInventoryTxnQuery extends PageQuery {
  txnType?: string;
  materialCode?: string;
  batchNo?: string;
  lineCode?: string;
  workOrderNo?: string;
  refNo?: string;
}

/* ================= 缺料预警（DEV-082） ================= */

export interface WmsShortageWarningItem {
  id: number;
  warningNo: string;
  materialCode: string;
  materialName?: string;
  lineCode?: string;
  workOrderNo?: string;
  requiredQty?: number;
  onHandQty?: number;
  inTransitQty?: number;
  safetyStock?: number;
  gapQty?: number;
  requiredDate?: string;
  purchaseLeadTimeDays?: number;
  warningLevel?: string;
  calcBasis?: string;
  warningStatus?: string;
  calcAt?: string;
  source?: string;
  remark?: string;
  createdAt?: string;
}

export interface WmsWarningQuery extends PageQuery {
  materialCode?: string;
  lineCode?: string;
  workOrderNo?: string;
  warningLevel?: string;
  warningStatus?: string;
}

export interface WmsShortageCalcParams {
  materialCode: string;
  materialName?: string;
  requiredQty: number;
  lineCode?: string;
  workOrderNo?: string;
  requiredDate?: string;
  inTransitQty?: number;
  safetyStock?: number;
  purchaseLeadTimeDays?: number;
  remark?: string;
}

/* ================= 欠料异常闭环（DEV-083） ================= */

export interface WmsShortageCaseItem {
  id: number;
  caseNo: string;
  warningNo?: string;
  materialCode: string;
  materialName?: string;
  lineCode?: string;
  affectedWorkOrders?: string;
  owner?: string;
  cause?: string;
  tempMeasure?: string;
  expectedRecoveryDate?: string;
  caseStatus?: string;
  closeEvidence?: string;
  closedBy?: string;
  closedAt?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WmsShortageActionItem {
  id: number;
  caseId?: number;
  caseNo?: string;
  actionType?: string;
  content?: string;
  operatorName?: string;
  actionAt?: string;
  remark?: string;
}

export interface WmsShortageCaseQuery extends PageQuery {
  materialCode?: string;
  lineCode?: string;
  warningNo?: string;
  owner?: string;
  caseStatus?: string;
}

export interface WmsShortageCaseCreateParams {
  warningNo?: string;
  materialCode: string;
  materialName?: string;
  lineCode?: string;
  affectedWorkOrders?: string;
  owner?: string;
  cause?: string;
  tempMeasure?: string;
  expectedRecoveryDate?: string;
  remark?: string;
}

export interface WmsShortageCaseUpdateParams {
  affectedWorkOrders?: string;
  owner?: string;
  cause?: string;
  tempMeasure?: string;
  expectedRecoveryDate?: string;
  remark?: string;
}

export interface WmsShortageCaseCloseParams {
  closeEvidence: string;
  closedBy?: string;
  remark?: string;
}

export interface WmsShortageCaseActionParams {
  actionType: string;
  content: string;
  operatorName?: string;
  remark?: string;
}

/* ================= 应急预案（DEV-084） ================= */

export interface WmsContingencyPlanItem {
  id: number;
  planNo: string;
  caseNo?: string;
  warningNo?: string;
  materialCode: string;
  planType?: string;
  substituteMaterial?: string;
  targetLocationCode?: string;
  supplierCode?: string;
  expectedQty?: number;
  expectedDate?: string;
  costImpact?: string;
  planStatus?: string;
  approver?: string;
  approvedAt?: string;
  executedAt?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WmsPlanQuery extends PageQuery {
  planType?: string;
  planStatus?: string;
  materialCode?: string;
  caseNo?: string;
  supplierCode?: string;
}

export interface WmsPlanSaveParams {
  caseNo?: string;
  warningNo?: string;
  materialCode: string;
  planType: string;
  substituteMaterial?: string;
  targetLocationCode?: string;
  supplierCode?: string;
  expectedQty?: number;
  expectedDate?: string;
  costImpact?: string;
  planStatus?: string;
  remark?: string;
}

export interface WmsPlanApproveParams {
  approver?: string;
  remark?: string;
}
