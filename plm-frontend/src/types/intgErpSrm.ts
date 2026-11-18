import type { PageQuery } from '@/types/common';

/** G8-N4 六系统集成—ERP→SRM（T065，后端 Base: /intg/erp-srm）类型与枚举定义。 */

/* ---------------- 分页查询条件 ---------------- */

/** 集成接口分页查询条件。keyword 匹配 interfaceNo/interfaceName/endpoint。 */
export interface IntgErpSrmInterfaceQuery extends PageQuery {
  objectType?: string;
  protocol?: string;
  interfaceStatus?: string;
  direction?: string;
}

/** 字段映射分页查询条件。keyword 匹配 mappingNo/mappingName/sourceField/targetField。 */
export interface IntgErpSrmMappingQuery extends PageQuery {
  objectType?: string;
  mappingStatus?: string;
  interfaceNo?: string;
}

/** 同步批次分页查询条件。keyword 匹配 batchNo/batchName/message。 */
export interface IntgErpSrmBatchQuery extends PageQuery {
  objectType?: string;
  batchStatus?: string;
  interfaceNo?: string;
}

/** 接收回执分页查询条件。keyword 匹配 receiptNo/objectNo/srmObjectId。 */
export interface IntgErpSrmReceiptQuery extends PageQuery {
  objectType?: string;
  receiptStatus?: string;
  batchNo?: string;
}

/** 异常补偿分页查询条件。keyword 匹配 compensationNo/objectNo/errorMessage。 */
export interface IntgErpSrmCompensationQuery extends PageQuery {
  objectType?: string;
  errorType?: string;
  compensationStatus?: string;
  batchNo?: string;
}

/** 对账分页查询条件。keyword 匹配 reconcileNo/reconcileName/resultMessage。 */
export interface IntgErpSrmReconcileQuery extends PageQuery {
  objectType?: string;
  reconcileStatus?: string;
  interfaceNo?: string;
}

/* ---------------- 1. 集成接口定义 ---------------- */

export interface IntgErpSrmInterface {
  id?: number;
  interfaceNo?: string;
  interfaceName?: string;
  direction?: string;
  objectType?: string;
  protocol?: string;
  endpoint?: string;
  triggerType?: string;
  syncMode?: string;
  interfaceStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type IntgErpSrmInterfaceSaveRequest = Omit<
  IntgErpSrmInterface,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 2. 字段映射 ---------------- */

export interface IntgErpSrmMapping {
  id?: number;
  mappingNo?: string;
  mappingName?: string;
  interfaceNo?: string;
  objectType?: string;
  sourceField?: string;
  targetField?: string;
  transformRule?: string;
  defaultValue?: string;
  requiredFlag?: number | null;
  mappingStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type IntgErpSrmMappingSaveRequest = Omit<
  IntgErpSrmMapping,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 3. 同步批次 ---------------- */

export interface IntgErpSrmBatch {
  id?: number;
  batchNo?: string;
  batchName?: string;
  interfaceNo?: string;
  direction?: string;
  objectType?: string;
  triggerType?: string;
  totalCount?: number | null;
  successCount?: number | null;
  failCount?: number | null;
  startTime?: string;
  endTime?: string;
  batchStatus?: string;
  message?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type IntgErpSrmBatchSaveRequest = Omit<
  IntgErpSrmBatch,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 4. SRM 接收回执 ---------------- */

export interface IntgErpSrmReceipt {
  id?: number;
  receiptNo?: string;
  batchNo?: string;
  interfaceNo?: string;
  objectType?: string;
  objectNo?: string;
  objectVersion?: string;
  srmObjectId?: string;
  receiptStatus?: string;
  checkMessage?: string;
  receiptTime?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type IntgErpSrmReceiptSaveRequest = Omit<
  IntgErpSrmReceipt,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 5. 异常补偿 ---------------- */

export interface IntgErpSrmCompensation {
  id?: number;
  compensationNo?: string;
  batchNo?: string;
  interfaceNo?: string;
  objectType?: string;
  objectNo?: string;
  errorType?: string;
  errorMessage?: string;
  retryCount?: number | null;
  handler?: string;
  handleTime?: string;
  compensationStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type IntgErpSrmCompensationSaveRequest = Omit<
  IntgErpSrmCompensation,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 6. 对账 ---------------- */

export interface IntgErpSrmReconcile {
  id?: number;
  reconcileNo?: string;
  reconcileName?: string;
  interfaceNo?: string;
  objectType?: string;
  sourceCount?: number | null;
  targetCount?: number | null;
  diffCount?: number | null;
  reconcileDate?: string;
  reconcileStatus?: string;
  resultMessage?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type IntgErpSrmReconcileSaveRequest = Omit<
  IntgErpSrmReconcile,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 枚举选项与标签 ---------------- */

function build(options: Array<{ label: string; value: string }>) {
  return {
    options: options as ReadonlyArray<{ label: string; value: string }>,
    label: options.reduce<Record<string, string>>((acc, cur) => {
      acc[cur.value] = cur.label;
      return acc;
    }, {}),
  };
}

/** 集成对象类型：PURCHASE_REQUIREMENT/PURCHASE_ORDER/DELIVERY_CHANGE/RECEIVING_RESULT/RECONCILE_INFO。 */
const OBJECT_TYPE = build([
  { label: '采购需求', value: 'PURCHASE_REQUIREMENT' },
  { label: '采购订单', value: 'PURCHASE_ORDER' },
  { label: '交期变更', value: 'DELIVERY_CHANGE' },
  { label: '收货结果', value: 'RECEIVING_RESULT' },
  { label: '对账信息', value: 'RECONCILE_INFO' },
]);
export const INTG_ERP_SRM_OBJECT_TYPE_OPTIONS = OBJECT_TYPE.options;
export const INTG_ERP_SRM_OBJECT_TYPE_LABEL = OBJECT_TYPE.label;

/** 传输协议：API/EVENT/FILE。 */
const INTG_PROTOCOL = build([
  { label: 'API 接口', value: 'API' },
  { label: '事件消息', value: 'EVENT' },
  { label: '批量文件', value: 'FILE' },
]);
export const INTG_ERP_SRM_PROTOCOL_OPTIONS = INTG_PROTOCOL.options;
export const INTG_ERP_SRM_PROTOCOL_LABEL = INTG_PROTOCOL.label;

/** 触发方式：MANUAL/SCHEDULED/EVENT。 */
const TRIGGER_TYPE = build([
  { label: '手工触发', value: 'MANUAL' },
  { label: '定时触发', value: 'SCHEDULED' },
  { label: '事件触发', value: 'EVENT' },
]);
export const INTG_ERP_SRM_TRIGGER_TYPE_OPTIONS = TRIGGER_TYPE.options;
export const INTG_ERP_SRM_TRIGGER_TYPE_LABEL = TRIGGER_TYPE.label;

/** 同步方式：FULL/INCREMENTAL。 */
const SYNC_MODE = build([
  { label: '全量', value: 'FULL' },
  { label: '增量', value: 'INCREMENTAL' },
]);
export const INTG_ERP_SRM_SYNC_MODE_OPTIONS = SYNC_MODE.options;
export const INTG_ERP_SRM_SYNC_MODE_LABEL = SYNC_MODE.label;

/** 接口状态：DRAFT/ACTIVE/DISABLED。 */
const INTERFACE_STATUS = build([
  { label: '草稿', value: 'DRAFT' },
  { label: '启用', value: 'ACTIVE' },
  { label: '停用', value: 'DISABLED' },
]);
export const INTG_ERP_SRM_INTERFACE_STATUS_OPTIONS = INTERFACE_STATUS.options;
export const INTG_ERP_SRM_INTERFACE_STATUS_LABEL = INTERFACE_STATUS.label;

/** 映射状态：DRAFT/ACTIVE/DISABLED。 */
const MAPPING_STATUS = build([
  { label: '草稿', value: 'DRAFT' },
  { label: '启用', value: 'ACTIVE' },
  { label: '停用', value: 'DISABLED' },
]);
export const INTG_ERP_SRM_MAPPING_STATUS_OPTIONS = MAPPING_STATUS.options;
export const INTG_ERP_SRM_MAPPING_STATUS_LABEL = MAPPING_STATUS.label;

/** 批次状态：PENDING/RUNNING/SUCCESS/PARTIAL/FAILED。 */
const BATCH_STATUS = build([
  { label: '待执行', value: 'PENDING' },
  { label: '执行中', value: 'RUNNING' },
  { label: '成功', value: 'SUCCESS' },
  { label: '部分成功', value: 'PARTIAL' },
  { label: '失败', value: 'FAILED' },
]);
export const INTG_ERP_SRM_BATCH_STATUS_OPTIONS = BATCH_STATUS.options;
export const INTG_ERP_SRM_BATCH_STATUS_LABEL = BATCH_STATUS.label;

/** 回执状态：PENDING/ACCEPTED/REJECTED/WARN。 */
const RECEIPT_STATUS = build([
  { label: '待回执', value: 'PENDING' },
  { label: '已接收', value: 'ACCEPTED' },
  { label: '已拒绝', value: 'REJECTED' },
  { label: '警告', value: 'WARN' },
]);
export const INTG_ERP_SRM_RECEIPT_STATUS_OPTIONS = RECEIPT_STATUS.options;
export const INTG_ERP_SRM_RECEIPT_STATUS_LABEL = RECEIPT_STATUS.label;

/** 异常类型：VALIDATION/TIMEOUT/CONFLICT/NETWORK/OTHER。 */
const ERROR_TYPE = build([
  { label: '校验失败', value: 'VALIDATION' },
  { label: '超时', value: 'TIMEOUT' },
  { label: '数据冲突', value: 'CONFLICT' },
  { label: '网络异常', value: 'NETWORK' },
  { label: '其他', value: 'OTHER' },
]);
export const INTG_ERP_SRM_ERROR_TYPE_OPTIONS = ERROR_TYPE.options;
export const INTG_ERP_SRM_ERROR_TYPE_LABEL = ERROR_TYPE.label;

/** 补偿状态：PENDING/PROCESSING/RESOLVED/IGNORED。 */
const COMPENSATION_STATUS = build([
  { label: '待处理', value: 'PENDING' },
  { label: '处理中', value: 'PROCESSING' },
  { label: '已解决', value: 'RESOLVED' },
  { label: '已忽略', value: 'IGNORED' },
]);
export const INTG_ERP_SRM_COMPENSATION_STATUS_OPTIONS = COMPENSATION_STATUS.options;
export const INTG_ERP_SRM_COMPENSATION_STATUS_LABEL = COMPENSATION_STATUS.label;

/** 对账状态：PENDING/BALANCED/DIFF/CLOSED。 */
const RECONCILE_STATUS = build([
  { label: '待对账', value: 'PENDING' },
  { label: '已平账', value: 'BALANCED' },
  { label: '存在差异', value: 'DIFF' },
  { label: '已关闭', value: 'CLOSED' },
]);
export const INTG_ERP_SRM_RECONCILE_STATUS_OPTIONS = RECONCILE_STATUS.options;
export const INTG_ERP_SRM_RECONCILE_STATUS_LABEL = RECONCILE_STATUS.label;

/** 是否必填：1=是，0=否。 */
export const INTG_ERP_SRM_REQUIRED_FLAG_OPTIONS: ReadonlyArray<{ label: string; value: number }> = [
  { label: '是', value: 1 },
  { label: '否', value: 0 },
];
