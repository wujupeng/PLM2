import type { PageQuery } from '@/types/common';

/** G6-N6 MES 产品追溯（T042，后端 Base: /mes/trace）类型与枚举定义。 */

/* ---------------- 分页查询条件 ---------------- */

/** 序列号台账分页查询条件。keyword 匹配 serialNo/materialCode/materialName/batchNo。 */
export interface MesSerialNumberQuery extends PageQuery {
  serialStatus?: string;
  materialCode?: string;
  batchNo?: string;
}

/** 批次追溯分页查询条件。keyword 匹配 batchNo/materialCode/materialName/workOrderNo。 */
export interface MesBatchTraceQuery extends PageQuery {
  batchStatus?: string;
  materialCode?: string;
  workOrderNo?: string;
}

/** 追溯码分页查询条件。keyword 匹配 codeNo/codeContent/objectCode。 */
export interface MesTraceCodeQuery extends PageQuery {
  codeType?: string;
  codeStatus?: string;
  objectType?: string;
  objectCode?: string;
}

/** 追溯关联分页查询条件。keyword 匹配 linkNo/objectCode/linkCode/linkName。 */
export interface MesTraceLinkQuery extends PageQuery {
  objectType?: string;
  linkType?: string;
  objectCode?: string;
  linkCode?: string;
}

/** 追溯记录分页查询条件。keyword 匹配 recordNo/objectCode/recorder/tracePath。 */
export interface MesTraceRecordQuery extends PageQuery {
  objectType?: string;
  recordStatus?: string;
  objectCode?: string;
}

/* ---------------- 1. 序列号台账 ---------------- */

export interface MesSerialNumber {
  id?: number;
  serialNo?: string;
  materialCode?: string;
  materialName?: string;
  batchNo?: string;
  serialStatus?: string;
  workOrderNo?: string;
  produceTime?: string;
  shipTime?: string;
  customerCode?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type MesSerialNumberSaveRequest = Omit<
  MesSerialNumber,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 2. 批次追溯 ---------------- */

export interface MesBatchTrace {
  id?: number;
  batchNo?: string;
  materialCode?: string;
  materialName?: string;
  batchStatus?: string;
  workOrderNo?: string;
  quantity?: number | null;
  unit?: string;
  produceTime?: string;
  expireTime?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type MesBatchTraceSaveRequest = Omit<
  MesBatchTrace,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 3. 追溯码（Data Matrix） ---------------- */

export interface MesTraceCode {
  id?: number;
  codeNo?: string;
  codeType?: string;
  codeStatus?: string;
  codeContent?: string;
  objectType?: string;
  objectCode?: string;
  printTime?: string;
  printCount?: number | null;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type MesTraceCodeSaveRequest = Omit<
  MesTraceCode,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 4. 追溯关联 ---------------- */

export interface MesTraceLink {
  id?: number;
  linkNo?: string;
  objectType?: string;
  objectCode?: string;
  linkType?: string;
  linkCode?: string;
  linkName?: string;
  linkValue?: string;
  linkTime?: string;
  operator?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type MesTraceLinkSaveRequest = Omit<
  MesTraceLink,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 5. 追溯记录 ---------------- */

export interface MesTraceRecord {
  id?: number;
  recordNo?: string;
  objectType?: string;
  objectCode?: string;
  recordStatus?: string;
  tracePath?: string;
  nodeCount?: number | null;
  recordTime?: string;
  recorder?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type MesTraceRecordSaveRequest = Omit<
  MesTraceRecord,
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

/** 序列号状态：CREATED/IN_STOCK/SHIPPED/CONSUMED/SCRAPPED。 */
const SERIAL_STATUS = build([
  { label: '已创建', value: 'CREATED' },
  { label: '在库', value: 'IN_STOCK' },
  { label: '已发货', value: 'SHIPPED' },
  { label: '已使用', value: 'CONSUMED' },
  { label: '已报废', value: 'SCRAPPED' },
]);
export const MES_SERIAL_NUMBER_STATUS_OPTIONS = SERIAL_STATUS.options;
export const MES_SERIAL_NUMBER_STATUS_LABEL = SERIAL_STATUS.label;

/** 批次状态：PENDING/IN_PROCESS/COMPLETED/SHIPPED/FROZEN。 */
const BATCH_STATUS = build([
  { label: '待检', value: 'PENDING' },
  { label: '在制', value: 'IN_PROCESS' },
  { label: '已完工', value: 'COMPLETED' },
  { label: '已出货', value: 'SHIPPED' },
  { label: '已冻结', value: 'FROZEN' },
]);
export const MES_BATCH_STATUS_OPTIONS = BATCH_STATUS.options;
export const MES_BATCH_STATUS_LABEL = BATCH_STATUS.label;

/** 追溯码码制：DATAMATRIX/QRCODE/BARCODE/RFID。 */
const TRACE_CODE_TYPE = build([
  { label: 'Data Matrix', value: 'DATAMATRIX' },
  { label: '二维码', value: 'QRCODE' },
  { label: '条形码', value: 'BARCODE' },
  { label: 'RFID', value: 'RFID' },
]);
export const MES_TRACE_CODE_TYPE_OPTIONS = TRACE_CODE_TYPE.options;
export const MES_TRACE_CODE_TYPE_LABEL = TRACE_CODE_TYPE.label;

/** 追溯码状态：INACTIVE/ACTIVE/VOID。 */
const TRACE_CODE_STATUS = build([
  { label: '未激活', value: 'INACTIVE' },
  { label: '已激活', value: 'ACTIVE' },
  { label: '已作废', value: 'VOID' },
]);
export const MES_TRACE_CODE_STATUS_OPTIONS = TRACE_CODE_STATUS.options;
export const MES_TRACE_CODE_STATUS_LABEL = TRACE_CODE_STATUS.label;

/** 追溯关联类型：PERSON/EQUIPMENT/PROCESS/MATERIAL/PARAMETER。 */
const TRACE_LINK_TYPE = build([
  { label: '人员', value: 'PERSON' },
  { label: '设备', value: 'EQUIPMENT' },
  { label: '工艺', value: 'PROCESS' },
  { label: '物料', value: 'MATERIAL' },
  { label: '参数', value: 'PARAMETER' },
]);
export const MES_TRACE_LINK_TYPE_OPTIONS = TRACE_LINK_TYPE.options;
export const MES_TRACE_LINK_TYPE_LABEL = TRACE_LINK_TYPE.label;

/** 追溯对象类型：SERIAL/BATCH/CODE。 */
const TRACE_OBJECT_TYPE = build([
  { label: '序列号', value: 'SERIAL' },
  { label: '批次', value: 'BATCH' },
  { label: '追溯码', value: 'CODE' },
]);
export const MES_TRACE_OBJECT_TYPE_OPTIONS = TRACE_OBJECT_TYPE.options;
export const MES_TRACE_OBJECT_TYPE_LABEL = TRACE_OBJECT_TYPE.label;

/** 追溯记录状态：DRAFT/ARCHIVED/CANCELLED。 */
const TRACE_RECORD_STATUS = build([
  { label: '草稿', value: 'DRAFT' },
  { label: '已归档', value: 'ARCHIVED' },
  { label: '已作废', value: 'CANCELLED' },
]);
export const MES_TRACE_RECORD_STATUS_OPTIONS = TRACE_RECORD_STATUS.options;
export const MES_TRACE_RECORD_STATUS_LABEL = TRACE_RECORD_STATUS.label;
