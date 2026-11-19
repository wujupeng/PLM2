import type { PageQuery } from '@/types/common';

/** G9-N4 六系统集成—未结业务迁移（T079，后端 Base: /mig/open-business）类型与枚举定义。 */

/* ---------------- 分页查询条件 ---------------- */

/** 集成接口分页查询条件。keyword 匹配 interfaceNo/interfaceName/endpoint。 */
export interface MigOpenBusinessInterfaceQuery extends PageQuery {
  objectType?: string;
  protocol?: string;
  interfaceStatus?: string;
  direction?: string;
}

/** 字段映射分页查询条件。keyword 匹配 mappingNo/mappingName/sourceField/targetField。 */
export interface MigOpenBusinessMappingQuery extends PageQuery {
  objectType?: string;
  mappingStatus?: string;
  interfaceNo?: string;
}

/** 同步批次分页查询条件。keyword 匹配 batchNo/batchName/message。 */
export interface MigOpenBusinessBatchQuery extends PageQuery {
  objectType?: string;
  batchStatus?: string;
  interfaceNo?: string;
}

/** 接收回执分页查询条件。keyword 匹配 receiptNo/objectNo/migrateObjectId。 */
export interface MigOpenBusinessReceiptQuery extends PageQuery {
  objectType?: string;
  receiptStatus?: string;
  batchNo?: string;
}

/** 异常补偿分页查询条件。keyword 匹配 compensationNo/objectNo/errorMessage。 */
export interface MigOpenBusinessCompensationQuery extends PageQuery {
  objectType?: string;
  errorType?: string;
  compensationStatus?: string;
  batchNo?: string;
}

/** 对账分页查询条件。keyword 匹配 reconcileNo/reconcileName/resultMessage。 */
export interface MigOpenBusinessReconcileQuery extends PageQuery {
  objectType?: string;
  reconcileStatus?: string;
  interfaceNo?: string;
}

/* ---------------- 1. 集成接口定义 ---------------- */

export interface MigOpenBusinessInterface {
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

export type MigOpenBusinessInterfaceSaveRequest = Omit<
  MigOpenBusinessInterface,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 2. 字段映射 ---------------- */

export interface MigOpenBusinessMapping {
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

export type MigOpenBusinessMappingSaveRequest = Omit<
  MigOpenBusinessMapping,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 3. 同步批次 ---------------- */

export interface MigOpenBusinessBatch {
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

export type MigOpenBusinessBatchSaveRequest = Omit<
  MigOpenBusinessBatch,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 4. 系统接收回执 ---------------- */

export interface MigOpenBusinessReceipt {
  id?: number;
  receiptNo?: string;
  batchNo?: string;
  interfaceNo?: string;
  objectType?: string;
  objectNo?: string;
  objectVersion?: string;
  migrateObjectId?: string;
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

export type MigOpenBusinessReceiptSaveRequest = Omit<
  MigOpenBusinessReceipt,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 5. 异常补偿 ---------------- */

export interface MigOpenBusinessCompensation {
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

export type MigOpenBusinessCompensationSaveRequest = Omit<
  MigOpenBusinessCompensation,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 6. 对账 ---------------- */

export interface MigOpenBusinessReconcile {
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

export type MigOpenBusinessReconcileSaveRequest = Omit<
  MigOpenBusinessReconcile,
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

/** 集成对象类型：OPEN_SALES_ORDER/OPEN_PURCHASE_ORDER/OUTSOURCE_ORDER/PRODUCTION_ORDER/IN_TRANSIT。 */
const OBJECT_TYPE = build([
  { label: '未结销售订单', value: 'OPEN_SALES_ORDER' },
  { label: '未结采购订单', value: 'OPEN_PURCHASE_ORDER' },
  { label: '委外单', value: 'OUTSOURCE_ORDER' },
  { label: '生产工单', value: 'PRODUCTION_ORDER' },
  { label: '在途/待检', value: 'IN_TRANSIT' },
]);
export const MIG_OPEN_BUSINESS_OBJECT_TYPE_OPTIONS = OBJECT_TYPE.options;
export const MIG_OPEN_BUSINESS_OBJECT_TYPE_LABEL = OBJECT_TYPE.label;

/** 传输协议：API/EVENT/FILE。 */
const INTG_PROTOCOL = build([
  { label: 'API 接口', value: 'API' },
  { label: '事件消息', value: 'EVENT' },
  { label: '批量文件', value: 'FILE' },
]);
export const MIG_OPEN_BUSINESS_PROTOCOL_OPTIONS = INTG_PROTOCOL.options;
export const MIG_OPEN_BUSINESS_PROTOCOL_LABEL = INTG_PROTOCOL.label;

/** 触发方式：MANUAL/SCHEDULED/EVENT。 */
const TRIGGER_TYPE = build([
  { label: '手工触发', value: 'MANUAL' },
  { label: '定时触发', value: 'SCHEDULED' },
  { label: '事件触发', value: 'EVENT' },
]);
export const MIG_OPEN_BUSINESS_TRIGGER_TYPE_OPTIONS = TRIGGER_TYPE.options;
export const MIG_OPEN_BUSINESS_TRIGGER_TYPE_LABEL = TRIGGER_TYPE.label;

/** 同步方式：FULL/INCREMENTAL。 */
const SYNC_MODE = build([
  { label: '全量', value: 'FULL' },
  { label: '增量', value: 'INCREMENTAL' },
]);
export const MIG_OPEN_BUSINESS_SYNC_MODE_OPTIONS = SYNC_MODE.options;
export const MIG_OPEN_BUSINESS_SYNC_MODE_LABEL = SYNC_MODE.label;

/** 接口状态：DRAFT/ACTIVE/DISABLED。 */
const INTERFACE_STATUS = build([
  { label: '草稿', value: 'DRAFT' },
  { label: '启用', value: 'ACTIVE' },
  { label: '停用', value: 'DISABLED' },
]);
export const MIG_OPEN_BUSINESS_INTERFACE_STATUS_OPTIONS = INTERFACE_STATUS.options;
export const MIG_OPEN_BUSINESS_INTERFACE_STATUS_LABEL = INTERFACE_STATUS.label;

/** 映射状态：DRAFT/ACTIVE/DISABLED。 */
const MAPPING_STATUS = build([
  { label: '草稿', value: 'DRAFT' },
  { label: '启用', value: 'ACTIVE' },
  { label: '停用', value: 'DISABLED' },
]);
export const MIG_OPEN_BUSINESS_MAPPING_STATUS_OPTIONS = MAPPING_STATUS.options;
export const MIG_OPEN_BUSINESS_MAPPING_STATUS_LABEL = MAPPING_STATUS.label;

/** 批次状态：PENDING/RUNNING/SUCCESS/PARTIAL/FAILED。 */
const BATCH_STATUS = build([
  { label: '待执行', value: 'PENDING' },
  { label: '执行中', value: 'RUNNING' },
  { label: '成功', value: 'SUCCESS' },
  { label: '部分成功', value: 'PARTIAL' },
  { label: '失败', value: 'FAILED' },
]);
export const MIG_OPEN_BUSINESS_BATCH_STATUS_OPTIONS = BATCH_STATUS.options;
export const MIG_OPEN_BUSINESS_BATCH_STATUS_LABEL = BATCH_STATUS.label;

/** 回执状态：PENDING/ACCEPTED/REJECTED/WARN。 */
const RECEIPT_STATUS = build([
  { label: '待回执', value: 'PENDING' },
  { label: '已接收', value: 'ACCEPTED' },
  { label: '已拒绝', value: 'REJECTED' },
  { label: '警告', value: 'WARN' },
]);
export const MIG_OPEN_BUSINESS_RECEIPT_STATUS_OPTIONS = RECEIPT_STATUS.options;
export const MIG_OPEN_BUSINESS_RECEIPT_STATUS_LABEL = RECEIPT_STATUS.label;

/** 异常类型：VALIDATION/TIMEOUT/CONFLICT/NETWORK/OTHER。 */
const ERROR_TYPE = build([
  { label: '校验失败', value: 'VALIDATION' },
  { label: '超时', value: 'TIMEOUT' },
  { label: '数据冲突', value: 'CONFLICT' },
  { label: '网络异常', value: 'NETWORK' },
  { label: '其他', value: 'OTHER' },
]);
export const MIG_OPEN_BUSINESS_ERROR_TYPE_OPTIONS = ERROR_TYPE.options;
export const MIG_OPEN_BUSINESS_ERROR_TYPE_LABEL = ERROR_TYPE.label;

/** 补偿状态：PENDING/PROCESSING/RESOLVED/IGNORED。 */
const COMPENSATION_STATUS = build([
  { label: '待处理', value: 'PENDING' },
  { label: '处理中', value: 'PROCESSING' },
  { label: '已解决', value: 'RESOLVED' },
  { label: '已忽略', value: 'IGNORED' },
]);
export const MIG_OPEN_BUSINESS_COMPENSATION_STATUS_OPTIONS = COMPENSATION_STATUS.options;
export const MIG_OPEN_BUSINESS_COMPENSATION_STATUS_LABEL = COMPENSATION_STATUS.label;

/** 对账状态：PENDING/BALANCED/DIFF/CLOSED。 */
const RECONCILE_STATUS = build([
  { label: '待对账', value: 'PENDING' },
  { label: '已平账', value: 'BALANCED' },
  { label: '存在差异', value: 'DIFF' },
  { label: '已关闭', value: 'CLOSED' },
]);
export const MIG_OPEN_BUSINESS_RECONCILE_STATUS_OPTIONS = RECONCILE_STATUS.options;
export const MIG_OPEN_BUSINESS_RECONCILE_STATUS_LABEL = RECONCILE_STATUS.label;

/** 是否必填：1=是，0=否。 */
export const MIG_OPEN_BUSINESS_REQUIRED_FLAG_OPTIONS: ReadonlyArray<{ label: string; value: number }> = [
  { label: '是', value: 1 },
  { label: '否', value: 0 },
];
