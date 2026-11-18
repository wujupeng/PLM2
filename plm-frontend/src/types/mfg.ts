import type { PageQuery } from './common';

/* ================= 通用：枚举常量（与后端 sys_dictionary 对齐） ================= */

/** 批次状态 */
export const MFG_BATCH_STATUS_OPTIONS = [
  { label: '计划中', value: 'PLANNED' },
  { label: '生产中', value: 'IN_PROCESS' },
  { label: '已完工', value: 'COMPLETED' },
  { label: '已关闭', value: 'CLOSED' },
];

export const MFG_BATCH_STATUS_LABEL: Record<string, string> = {
  PLANNED: '计划中',
  IN_PROCESS: '生产中',
  COMPLETED: '已完工',
  CLOSED: '已关闭',
};

export const MFG_BATCH_STATUS_COLOR: Record<string, string> = {
  PLANNED: 'default',
  IN_PROCESS: 'processing',
  COMPLETED: 'success',
  CLOSED: 'default',
};

/** 放行状态 */
export const MFG_RELEASE_STATUS_OPTIONS = [
  { label: '未放行', value: 'UNRELEASED' },
  { label: '已放行', value: 'RELEASED' },
  { label: '暂停', value: 'HOLD' },
];

export const MFG_RELEASE_STATUS_LABEL: Record<string, string> = {
  UNRELEASED: '未放行',
  RELEASED: '已放行',
  HOLD: '暂停',
};

export const MFG_RELEASE_STATUS_COLOR: Record<string, string> = {
  UNRELEASED: 'default',
  RELEASED: 'success',
  HOLD: 'warning',
};

/** 工序结果 */
export const MFG_OPERATION_RESULT_OPTIONS = [
  { label: '合格', value: 'OK' },
  { label: '不合格', value: 'NG' },
  { label: '返工', value: 'REWORK' },
];

export const MFG_OPERATION_RESULT_LABEL: Record<string, string> = {
  OK: '合格',
  NG: '不合格',
  REWORK: '返工',
};

export const MFG_OPERATION_RESULT_COLOR: Record<string, string> = {
  OK: 'success',
  NG: 'error',
  REWORK: 'warning',
};

/** 接口状态 */
export const MFG_INTERFACE_STATUS_OPTIONS = [
  { label: '已接收', value: 'RECEIVED' },
  { label: '已处理', value: 'PROCESSED' },
  { label: '处理失败', value: 'FAILED' },
  { label: '已补偿', value: 'COMPENSATED' },
];

export const MFG_INTERFACE_STATUS_LABEL: Record<string, string> = {
  RECEIVED: '已接收',
  PROCESSED: '已处理',
  FAILED: '处理失败',
  COMPENSATED: '已补偿',
};

export const MFG_INTERFACE_STATUS_COLOR: Record<string, string> = {
  RECEIVED: 'processing',
  PROCESSED: 'success',
  FAILED: 'error',
  COMPENSATED: 'warning',
};

/** 测试类型 */
export const MFG_TEST_TYPE_OPTIONS = [
  { label: '电气测试', value: 'ELECTRICAL' },
  { label: '尺寸检测', value: 'DIMENSION' },
  { label: '装配检查', value: 'ASSEMBLY' },
  { label: '焊接质量', value: 'WELDING' },
  { label: '点胶灌封', value: 'POTTING' },
  { label: '功能测试', value: 'FUNCTION' },
];

export const MFG_TEST_TYPE_LABEL: Record<string, string> = {
  ELECTRICAL: '电气测试',
  DIMENSION: '尺寸检测',
  ASSEMBLY: '装配检查',
  WELDING: '焊接质量',
  POTTING: '点胶灌封',
  FUNCTION: '功能测试',
};

/** 测试结果 */
export const MFG_TEST_RESULT_OPTIONS = [
  { label: '合格', value: 'OK' },
  { label: '不合格', value: 'NG' },
];

export const MFG_TEST_RESULT_LABEL: Record<string, string> = {
  OK: '合格',
  NG: '不合格',
};

export const MFG_TEST_RESULT_COLOR: Record<string, string> = {
  OK: 'success',
  NG: 'error',
};

/** 追溯类型 */
export const MFG_TRACE_TYPE_OPTIONS = [
  { label: '单件', value: 'SINGLE' },
  { label: '批次', value: 'BATCH' },
];

export const MFG_TRACE_TYPE_LABEL: Record<string, string> = {
  SINGLE: '单件',
  BATCH: '批次',
};

/** 包装层级 */
export const MFG_PACKAGE_LEVEL_OPTIONS = [
  { label: '内箱', value: 'INNER' },
  { label: '外箱', value: 'OUTER' },
  { label: '托盘', value: 'PALLET' },
];

export const MFG_PACKAGE_LEVEL_LABEL: Record<string, string> = {
  INNER: '内箱',
  OUTER: '外箱',
  PALLET: '托盘',
};

/** 包装状态 */
export const MFG_PACKAGE_STATUS_OPTIONS = [
  { label: '待封箱', value: 'OPEN' },
  { label: '已封箱', value: 'SEALED' },
  { label: '已发运', value: 'SHIPPED' },
];

export const MFG_PACKAGE_STATUS_LABEL: Record<string, string> = {
  OPEN: '待封箱',
  SEALED: '已封箱',
  SHIPPED: '已发运',
};

export const MFG_PACKAGE_STATUS_COLOR: Record<string, string> = {
  OPEN: 'default',
  SEALED: 'processing',
  SHIPPED: 'success',
};

/** 包装明细状态 */
export const MFG_PACKAGE_ITEM_STATUS_LABEL: Record<string, string> = {
  PACKED: '已装箱',
  UNPACKED: '已拆箱',
  REPLACED: '已替换',
};

/** 出货状态 */
export const MFG_SHIPMENT_STATUS_OPTIONS = [
  { label: '已创建', value: 'CREATED' },
  { label: '已复核', value: 'VERIFIED' },
  { label: '已放行', value: 'RELEASED' },
  { label: '已发运', value: 'SHIPPED' },
  { label: '已取消', value: 'CANCELLED' },
];

export const MFG_SHIPMENT_STATUS_LABEL: Record<string, string> = {
  CREATED: '已创建',
  VERIFIED: '已复核',
  RELEASED: '已放行',
  SHIPPED: '已发运',
  CANCELLED: '已取消',
};

export const MFG_SHIPMENT_STATUS_COLOR: Record<string, string> = {
  CREATED: 'default',
  VERIFIED: 'processing',
  RELEASED: 'processing',
  SHIPPED: 'success',
  CANCELLED: 'error',
};

/** 扫码结果 */
export const MFG_SCAN_RESULT_OPTIONS = [
  { label: '通过', value: 'PASS' },
  { label: '阻断', value: 'BLOCKED' },
];

export const MFG_SCAN_RESULT_LABEL: Record<string, string> = {
  PASS: '通过',
  BLOCKED: '阻断',
};

export const MFG_SCAN_RESULT_COLOR: Record<string, string> = {
  PASS: 'success',
  BLOCKED: 'error',
};

/** 扫码类型 */
export const MFG_SCAN_TYPE_OPTIONS = [
  { label: '箱码', value: 'PACKAGE' },
  { label: '单件码', value: 'SERIAL' },
  { label: '物料批次码', value: 'MATERIAL_BATCH' },
];

export const MFG_SCAN_TYPE_LABEL: Record<string, string> = {
  PACKAGE: '箱码',
  SERIAL: '单件码',
  MATERIAL_BATCH: '物料批次码',
};

/** 明细扫码状态 */
export const MFG_LINE_SCAN_STATUS_LABEL: Record<string, string> = {
  PENDING: '待扫码',
  PARTIAL: '部分扫码',
  SCANNED: '已扫码',
};

/** 明细行状态 */
export const MFG_LINE_STATUS_LABEL: Record<string, string> = {
  OPEN: '开放',
  CLOSED: '已关闭',
  CANCELLED: '已取消',
};

/** 召回类型 */
export const MFG_RECALL_TYPE_OPTIONS = [
  { label: '物料批次', value: 'MATERIAL_BATCH' },
  { label: '生产批次', value: 'PRODUCTION_BATCH' },
  { label: '客户', value: 'CUSTOMER' },
  { label: '日期范围', value: 'DATE_RANGE' },
];

export const MFG_RECALL_TYPE_LABEL: Record<string, string> = {
  MATERIAL_BATCH: '物料批次',
  PRODUCTION_BATCH: '生产批次',
  CUSTOMER: '客户',
  DATE_RANGE: '日期范围',
};

/** 召回状态 */
export const MFG_RECALL_STATUS_OPTIONS = [
  { label: '已发起', value: 'OPEN' },
  { label: '隔离中', value: 'ISOLATING' },
  { label: '已隔离', value: 'ISOLATED' },
  { label: '已关闭', value: 'CLOSED' },
];

export const MFG_RECALL_STATUS_LABEL: Record<string, string> = {
  OPEN: '已发起',
  ISOLATING: '隔离中',
  ISOLATED: '已隔离',
  CLOSED: '已关闭',
};

export const MFG_RECALL_STATUS_COLOR: Record<string, string> = {
  OPEN: 'error',
  ISOLATING: 'processing',
  ISOLATED: 'warning',
  CLOSED: 'default',
};

/** 风险等级 */
export const MFG_RISK_LEVEL_OPTIONS = [
  { label: '低', value: 'LOW' },
  { label: '中', value: 'MEDIUM' },
  { label: '高', value: 'HIGH' },
];

export const MFG_RISK_LEVEL_LABEL: Record<string, string> = {
  LOW: '低',
  MEDIUM: '中',
  HIGH: '高',
};

export const MFG_RISK_LEVEL_COLOR: Record<string, string> = {
  LOW: 'default',
  MEDIUM: 'warning',
  HIGH: 'error',
};

/** 影响类型 */
export const MFG_IMPACT_TYPE_OPTIONS = [
  { label: '产品', value: 'PRODUCT' },
  { label: '库存', value: 'STOCK' },
  { label: '工单', value: 'WORK_ORDER' },
  { label: '客户', value: 'CUSTOMER' },
];

export const MFG_IMPACT_TYPE_LABEL: Record<string, string> = {
  PRODUCT: '产品',
  STOCK: '库存',
  WORK_ORDER: '工单',
  CUSTOMER: '客户',
};

/** 影响状态 */
export const MFG_IMPACT_STATUS_LABEL: Record<string, string> = {
  IDENTIFIED: '已识别',
  ISOLATED: '已隔离',
  RELEASED: '已释放',
  CLOSED: '已关闭',
};

export const MFG_IMPACT_STATUS_COLOR: Record<string, string> = {
  IDENTIFIED: 'warning',
  ISOLATED: 'processing',
  RELEASED: 'default',
  CLOSED: 'success',
};

/** 启用状态（enabled/disabled） */
export const MFG_ENABLED_OPTIONS = [
  { label: '启用', value: 'enabled' },
  { label: '停用', value: 'disabled' },
];

export const MFG_ENABLED_LABEL: Record<string, string> = {
  enabled: '启用',
  disabled: '停用',
};

export const MFG_ENABLED_COLOR: Record<string, string> = {
  enabled: 'success',
  disabled: 'default',
};

/* ================= 生产批次（DEV-085） ================= */

export interface MfgProductionBatchItem {
  id: number;
  batchNo: string;
  workOrderNo?: string;
  productCode: string;
  productName?: string;
  productVersion?: string;
  bomVersion?: string;
  processVersion?: string;
  productionDate?: string;
  shiftCode?: string;
  lineCode?: string;
  workStation?: string;
  plannedQty?: number;
  completedQty?: number;
  scrapQty?: number;
  batchStatus?: string;
  releaseStatus?: string;
  sourceSystem?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MfgBatchQuery extends PageQuery {
  batchNo?: string;
  workOrderNo?: string;
  productCode?: string;
  lineCode?: string;
  batchStatus?: string;
  releaseStatus?: string;
  productionDateFrom?: string;
  productionDateTo?: string;
}

export interface MfgBatchSaveParams {
  batchNo?: string;
  workOrderNo?: string;
  productCode: string;
  productName?: string;
  productVersion?: string;
  bomVersion?: string;
  processVersion?: string;
  productionDate?: string;
  shiftCode?: string;
  lineCode?: string;
  workStation?: string;
  plannedQty?: number;
  completedQty?: number;
  scrapQty?: number;
  batchStatus?: string;
  releaseStatus?: string;
  sourceSystem?: string;
  remark?: string;
}

/* ================= 工序过站（DEV-086） ================= */

export interface MfgOperationRecordItem {
  id: number;
  recordNo: string;
  batchNo: string;
  workOrderNo?: string;
  productCode?: string;
  serialNo?: string;
  operationCode?: string;
  operationName?: string;
  seqNo?: number;
  workStation?: string;
  lineCode?: string;
  equipmentCode?: string;
  operator?: string;
  startTime?: string;
  endTime?: string;
  inQty?: number;
  outQty?: number;
  scrapQty?: number;
  result?: string;
  sourceSystem?: string;
  collectTime?: string;
  interfaceStatus?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MfgOperationQuery extends PageQuery {
  recordNo?: string;
  batchNo?: string;
  serialNo?: string;
  operationCode?: string;
  workStation?: string;
  result?: string;
  interfaceStatus?: string;
}

export interface MfgOperationSaveParams {
  recordNo?: string;
  batchNo: string;
  workOrderNo?: string;
  productCode?: string;
  serialNo?: string;
  operationCode?: string;
  operationName?: string;
  seqNo?: number;
  workStation?: string;
  lineCode?: string;
  equipmentCode?: string;
  operator?: string;
  startTime?: string;
  endTime?: string;
  inQty?: number;
  outQty?: number;
  scrapQty?: number;
  result?: string;
  sourceSystem?: string;
  collectTime?: string;
  interfaceStatus?: string;
  remark?: string;
}

/* ================= 测试结果（DEV-087） ================= */

export interface MfgTestResultItem {
  id: number;
  resultNo: string;
  batchNo: string;
  serialNo?: string;
  productCode?: string;
  operationCode?: string;
  operationName?: string;
  testType?: string;
  testItemCode: string;
  testItemName?: string;
  standardValue?: string;
  lowerLimit?: number;
  upperLimit?: number;
  actualValue?: number;
  actualText?: string;
  unit?: string;
  result?: string;
  equipmentCode?: string;
  tester?: string;
  testedAt?: string;
  sourceSystem?: string;
  attachmentUrl?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MfgTestQuery extends PageQuery {
  resultNo?: string;
  batchNo?: string;
  serialNo?: string;
  testType?: string;
  result?: string;
}

export interface MfgTestSaveParams {
  resultNo?: string;
  batchNo: string;
  serialNo?: string;
  productCode?: string;
  operationCode?: string;
  operationName?: string;
  testType?: string;
  testItemCode: string;
  testItemName?: string;
  standardValue?: string;
  lowerLimit?: number;
  upperLimit?: number;
  actualValue?: number;
  actualText?: string;
  unit?: string;
  result?: string;
  equipmentCode?: string;
  tester?: string;
  testedAt?: string;
  sourceSystem?: string;
  attachmentUrl?: string;
  remark?: string;
}

/* ================= 追溯绑定（DEV-088） ================= */

export interface MfgTraceBindingItem {
  id: number;
  bindingNo: string;
  traceCode: string;
  traceType?: string;
  batchNo?: string;
  serialNo?: string;
  productCode?: string;
  materialCode?: string;
  materialName?: string;
  materialBatchNo?: string;
  materialSupplier?: string;
  operationCode?: string;
  quantity?: number;
  unit?: string;
  bindTime?: string;
  sourceSystem?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MfgTraceBindingQuery extends PageQuery {
  traceCode?: string;
  batchNo?: string;
  serialNo?: string;
  productCode?: string;
  materialCode?: string;
  materialBatchNo?: string;
  traceType?: string;
}

export interface MfgTraceBindingSaveParams {
  bindingNo?: string;
  traceCode: string;
  traceType?: string;
  batchNo?: string;
  serialNo?: string;
  productCode?: string;
  materialCode?: string;
  materialName?: string;
  materialBatchNo?: string;
  materialSupplier?: string;
  operationCode?: string;
  quantity?: number;
  unit?: string;
  bindTime?: string;
  sourceSystem?: string;
  remark?: string;
}

/* ================= 包装规则与箱码（DEV-089） ================= */

export interface MfgPackageRuleItem {
  id: number;
  ruleNo: string;
  productCode: string;
  packageLevel?: string;
  packageQty?: number;
  innerQtyPerBox?: number;
  boxPerPallet?: number;
  labelTemplateCode?: string;
  customerCode?: string;
  status?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MfgPackageRuleQuery extends PageQuery {
  ruleNo?: string;
  productCode?: string;
  packageLevel?: string;
  customerCode?: string;
  status?: string;
}

export interface MfgPackageRuleSaveParams {
  ruleNo?: string;
  productCode: string;
  packageLevel?: string;
  packageQty?: number;
  innerQtyPerBox?: number;
  boxPerPallet?: number;
  labelTemplateCode?: string;
  customerCode?: string;
  status?: string;
  remark?: string;
}

export interface MfgPackageItem {
  id: number;
  packageNo: string;
  serialNo?: string;
  traceCode?: string;
  materialCode?: string;
  materialBatchNo?: string;
  quantity?: number;
  itemStatus?: string;
  remark?: string;
}

export interface MfgPackageItemParams {
  serialNo?: string;
  traceCode?: string;
  materialCode?: string;
  materialBatchNo?: string;
  quantity?: number;
  itemStatus?: string;
  remark?: string;
}

export interface MfgPackageItemModel {
  id: number;
  packageNo: string;
  packageCode?: string;
  packageLevel?: string;
  parentPackageNo?: string;
  productCode?: string;
  batchNo?: string;
  workOrderNo?: string;
  packageQty?: number;
  customerCode?: string;
  packageStatus?: string;
  packedAt?: string;
  operator?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MfgPackageQuery extends PageQuery {
  packageNo?: string;
  packageCode?: string;
  packageLevel?: string;
  batchNo?: string;
  productCode?: string;
  customerCode?: string;
  packageStatus?: string;
}

export interface MfgPackageSaveParams {
  packageNo?: string;
  packageCode?: string;
  packageLevel?: string;
  parentPackageNo?: string;
  productCode?: string;
  batchNo?: string;
  workOrderNo?: string;
  packageQty?: number;
  customerCode?: string;
  operator?: string;
  items?: MfgPackageItemParams[];
  remark?: string;
}

export interface MfgPackageDetailResponse {
  pkg: MfgPackageItemModel;
  items: MfgPackageItem[];
}

export interface MfgPackageSealParams {
  operator?: string;
  remark?: string;
}

export interface MfgPackByBatchParams {
  batchNo: string;
  productCode?: string;
  customerCode?: string;
  maxQty?: number;
  operator?: string;
}

/* ================= 出货与放行（DEV-090/091/092） ================= */

export interface MfgShipmentItem {
  id: number;
  shipmentNo: string;
  customerCode?: string;
  customerName?: string;
  orderNo?: string;
  deliveryPlanNo?: string;
  productCode?: string;
  productName?: string;
  productVersion?: string;
  orderQty?: number;
  plannedQty?: number;
  scannedQty?: number;
  shippedQty?: number;
  packageCount?: number;
  shipmentStatus?: string;
  releaseStatus?: string;
  carrier?: string;
  vehicleNo?: string;
  driver?: string;
  driverPhone?: string;
  shipDate?: string;
  asnNo?: string;
  asnStatus?: string;
  releaseBy?: string;
  releaseAt?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MfgShipmentLineItem {
  id: number;
  shipmentNo: string;
  lineNo?: number;
  orderNo?: string;
  orderLineNo?: number;
  productCode?: string;
  productVersion?: string;
  batchNo?: string;
  serialNo?: string;
  traceCode?: string;
  packageNo?: string;
  qty?: number;
  scanStatus?: string;
  lineStatus?: string;
  remark?: string;
}

export interface MfgShipmentLineParams {
  lineNo?: number;
  orderNo?: string;
  orderLineNo?: number;
  productCode?: string;
  productVersion?: string;
  batchNo?: string;
  serialNo?: string;
  traceCode?: string;
  packageNo?: string;
  qty?: number;
  scanStatus?: string;
  lineStatus?: string;
  remark?: string;
}

export interface MfgShipmentQuery extends PageQuery {
  shipmentNo?: string;
  customerCode?: string;
  orderNo?: string;
  productCode?: string;
  batchNo?: string;
  shipmentStatus?: string;
  releaseStatus?: string;
}

export interface MfgShipmentSaveParams {
  shipmentNo?: string;
  customerCode?: string;
  customerName?: string;
  orderNo?: string;
  deliveryPlanNo?: string;
  productCode?: string;
  productName?: string;
  productVersion?: string;
  orderQty?: number;
  plannedQty?: number;
  packageCount?: number;
  carrier?: string;
  vehicleNo?: string;
  driver?: string;
  driverPhone?: string;
  shipDate?: string;
  lines?: MfgShipmentLineParams[];
  remark?: string;
}

export interface MfgShipmentDetailResponse {
  shipment: MfgShipmentItem;
  lines: MfgShipmentLineItem[];
}

export interface MfgShipScanLogItem {
  id: number;
  logNo: string;
  shipmentNo?: string;
  scanCode?: string;
  scanType?: string;
  scanResult?: string;
  blockReason?: string;
  customerCode?: string;
  productCode?: string;
  productVersion?: string;
  batchNo?: string;
  qty?: number;
  operator?: string;
  scanTime?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MfgShipScanLogQuery extends PageQuery {
  shipmentNo?: string;
  scanCode?: string;
  scanType?: string;
  scanResult?: string;
  customerCode?: string;
}

export interface MfgShipScanParams {
  scanCode: string;
  scanType?: string;
  qty?: number;
  operator?: string;
  remark?: string;
}

export interface MfgShipScanResponse {
  scanResult?: string;
  blockReason?: string;
  scannedQty?: number;
  plannedQty?: number;
  log?: MfgShipScanLogItem;
}

export interface MfgShipReleaseParams {
  carrier?: string;
  vehicleNo?: string;
  driver?: string;
  driverPhone?: string;
  shipDate?: string;
  sendAsn?: boolean;
  remark?: string;
}

/* ================= 追溯查询（DEV-093） ================= */

export interface MfgTraceResponse {
  traceCode?: string;
  traceType?: string;
  productionBatch?: MfgProductionBatchItem;
  materialBindings?: MfgTraceBindingItem[];
  operationRecords?: MfgOperationRecordItem[];
  testResults?: MfgTestResultItem[];
  packages?: MfgPackageItemModel[];
  shipments?: MfgShipmentItem[];
  recalled?: boolean;
}

export interface MfgForwardTraceResponse {
  materialCode?: string;
  materialBatchNo?: string;
  bindings?: MfgTraceBindingItem[];
  productionBatches?: MfgProductionBatchItem[];
  affectedTraceCodes?: string[];
  shipments?: MfgShipmentItem[];
  affectedCount?: number;
}

export interface MfgTraceForwardQuery {
  materialCode?: string;
  materialBatchNo?: string;
}

/* ================= 召回与隔离（DEV-094） ================= */

export interface MfgRecallOrderItem {
  id: number;
  recallNo: string;
  recallType?: string;
  triggerSource?: string;
  targetValue?: string;
  riskLevel?: string;
  recallStatus?: string;
  affectedCount?: number;
  owner?: string;
  openedAt?: string;
  closedAt?: string;
  closeEvidence?: string;
  reason?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MfgRecallImpactItem {
  id: number;
  recallNo: string;
  impactType?: string;
  impactRefNo?: string;
  productCode?: string;
  batchNo?: string;
  materialCode?: string;
  materialBatchNo?: string;
  customerCode?: string;
  qty?: number;
  impactStatus?: string;
  remark?: string;
}

export interface MfgRecallQuery extends PageQuery {
  recallNo?: string;
  recallType?: string;
  recallStatus?: string;
  riskLevel?: string;
  owner?: string;
}

export interface MfgRecallSaveParams {
  recallNo?: string;
  recallType: string;
  triggerSource?: string;
  targetValue: string;
  riskLevel?: string;
  owner?: string;
  reason?: string;
  remark?: string;
}

export interface MfgRecallDetailResponse {
  recall: MfgRecallOrderItem;
  impacts: MfgRecallImpactItem[];
}

export interface MfgRecallCloseParams {
  closeEvidence: string;
  remark?: string;
}
