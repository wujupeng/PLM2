import type { PageQuery } from '@/types/common';

/** G6-N5 MES 质量检验（T041，后端 Base: /mes/quality）类型与枚举定义。 */

/* ---------------- 分页查询条件 ---------------- */

/** 检验规范分页查询条件。keyword 匹配 specNo/specName/materialCode/materialName。 */
export interface MesInspectionSpecQuery extends PageQuery {
  specType?: string;
  specStatus?: string;
  materialCode?: string;
  processCode?: string;
}

/** 来料检验分页查询条件。keyword 匹配 incomingNo/materialCode/materialName/supplierName。 */
export interface MesIncomingInspectionQuery extends PageQuery {
  inspectionStatus?: string;
  inspectionResult?: string;
  materialCode?: string;
  supplierCode?: string;
}

/** 首件检验分页查询条件。keyword 匹配 firstNo/workOrderNo/materialCode/processName。 */
export interface MesFirstInspectionQuery extends PageQuery {
  inspectionStatus?: string;
  inspectionResult?: string;
  workOrderNo?: string;
  materialCode?: string;
  equipmentCode?: string;
}

/** 巡检记录分页查询条件。keyword 匹配 patrolNo/workOrderNo/materialCode/processName。 */
export interface MesPatrolInspectionQuery extends PageQuery {
  inspectionStatus?: string;
  inspectionResult?: string;
  workOrderNo?: string;
  materialCode?: string;
  equipmentCode?: string;
}

/** 末件检验分页查询条件。keyword 匹配 lastNo/workOrderNo/materialCode/processName。 */
export interface MesLastInspectionQuery extends PageQuery {
  inspectionStatus?: string;
  inspectionResult?: string;
  workOrderNo?: string;
  materialCode?: string;
  equipmentCode?: string;
}

/** 终检记录分页查询条件。keyword 匹配 finalNo/workOrderNo/materialCode/customerCode。 */
export interface MesFinalInspectionQuery extends PageQuery {
  inspectionStatus?: string;
  inspectionResult?: string;
  workOrderNo?: string;
  materialCode?: string;
  customerCode?: string;
}

/** 检验判定分页查询条件。keyword 匹配 judgeNo/sourceNo/materialCode/materialName。 */
export interface MesInspectionJudgeQuery extends PageQuery {
  judgeStatus?: string;
  judgeResult?: string;
  sourceType?: string;
  materialCode?: string;
}

/** 隔离记录分页查询条件。keyword 匹配 quarantineNo/materialCode/materialName/sourceNo。 */
export interface MesQuarantineQuery extends PageQuery {
  quarantineStatus?: string;
  quarantineType?: string;
  materialCode?: string;
}

/* ---------------- 1. 检验规范 ---------------- */

export interface MesInspectionSpec {
  id?: number;
  specNo?: string;
  specName?: string;
  specType?: string;
  materialCode?: string;
  materialName?: string;
  processCode?: string;
  inspectionItem?: string;
  inspectionMethod?: string;
  standardValue?: string;
  upperLimit?: number | null;
  lowerLimit?: number | null;
  samplePlan?: string;
  aql?: string;
  specVersion?: string;
  specStatus?: string;
  effectiveDate?: string;
  expireDate?: string;
  owner?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type MesInspectionSpecSaveRequest = Omit<
  MesInspectionSpec,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 2. 来料检验 ---------------- */

export interface MesIncomingInspection {
  id?: number;
  incomingNo?: string;
  materialCode?: string;
  materialName?: string;
  spec?: string;
  batchNo?: string;
  supplierCode?: string;
  supplierName?: string;
  purchaseOrderNo?: string;
  inspectionQty?: number | null;
  sampleQty?: number | null;
  qualifiedQty?: number | null;
  unqualifiedQty?: number | null;
  inspectionResult?: string;
  inspectionStatus?: string;
  inspector?: string;
  inspectionTime?: string;
  judgeNo?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type MesIncomingInspectionSaveRequest = Omit<
  MesIncomingInspection,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 3. 首件检验 ---------------- */

export interface MesFirstInspection {
  id?: number;
  firstNo?: string;
  workOrderNo?: string;
  dispatchNo?: string;
  materialCode?: string;
  materialName?: string;
  processCode?: string;
  processName?: string;
  equipmentCode?: string;
  batchNo?: string;
  inspectionItem?: string;
  inspectionResult?: string;
  inspectionStatus?: string;
  inspector?: string;
  inspectionTime?: string;
  judgeNo?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type MesFirstInspectionSaveRequest = Omit<
  MesFirstInspection,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 4. 巡检记录 ---------------- */

export interface MesPatrolInspection {
  id?: number;
  patrolNo?: string;
  workOrderNo?: string;
  materialCode?: string;
  materialName?: string;
  processCode?: string;
  processName?: string;
  equipmentCode?: string;
  inspectionItem?: string;
  standardValue?: string;
  actualValue?: string;
  inspectionResult?: string;
  inspectionStatus?: string;
  inspector?: string;
  inspectionTime?: string;
  shiftCode?: string;
  judgeNo?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type MesPatrolInspectionSaveRequest = Omit<
  MesPatrolInspection,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 5. 末件检验 ---------------- */

export interface MesLastInspection {
  id?: number;
  lastNo?: string;
  workOrderNo?: string;
  dispatchNo?: string;
  materialCode?: string;
  materialName?: string;
  processCode?: string;
  processName?: string;
  equipmentCode?: string;
  batchNo?: string;
  inspectionItem?: string;
  inspectionResult?: string;
  inspectionStatus?: string;
  inspector?: string;
  inspectionTime?: string;
  judgeNo?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type MesLastInspectionSaveRequest = Omit<
  MesLastInspection,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 6. 终检记录 ---------------- */

export interface MesFinalInspection {
  id?: number;
  finalNo?: string;
  workOrderNo?: string;
  materialCode?: string;
  materialName?: string;
  spec?: string;
  batchNo?: string;
  inspectionQty?: number | null;
  sampleQty?: number | null;
  qualifiedQty?: number | null;
  unqualifiedQty?: number | null;
  inspectionResult?: string;
  inspectionStatus?: string;
  inspector?: string;
  inspectionTime?: string;
  judgeNo?: string;
  customerCode?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type MesFinalInspectionSaveRequest = Omit<
  MesFinalInspection,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 7. 检验判定 ---------------- */

export interface MesInspectionJudge {
  id?: number;
  judgeNo?: string;
  sourceType?: string;
  sourceNo?: string;
  materialCode?: string;
  materialName?: string;
  batchNo?: string;
  judgeResult?: string;
  judgeStatus?: string;
  judgeQty?: number | null;
  qualifiedQty?: number | null;
  unqualifiedQty?: number | null;
  judgeOpinion?: string;
  disposition?: string;
  judgeBy?: string;
  judgeTime?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type MesInspectionJudgeSaveRequest = Omit<
  MesInspectionJudge,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 8. 隔离记录 ---------------- */

export interface MesQuarantine {
  id?: number;
  quarantineNo?: string;
  materialCode?: string;
  materialName?: string;
  batchNo?: string;
  quarantineQty?: number | null;
  quarantineType?: string;
  quarantineStatus?: string;
  sourceNo?: string;
  location?: string;
  reason?: string;
  applicant?: string;
  applyTime?: string;
  handler?: string;
  handleTime?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type MesQuarantineSaveRequest = Omit<
  MesQuarantine,
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

/** 检验规范类型：INCOMING/FIRST/PATROL/LAST/FINAL。 */
const SPEC_TYPE = build([
  { label: '来料检验', value: 'INCOMING' },
  { label: '首件检验', value: 'FIRST' },
  { label: '巡检', value: 'PATROL' },
  { label: '末件检验', value: 'LAST' },
  { label: '终检', value: 'FINAL' },
]);
export const MES_INSPECTION_SPEC_TYPE_OPTIONS = SPEC_TYPE.options;
export const MES_INSPECTION_SPEC_TYPE_LABEL = SPEC_TYPE.label;

/** 检验规范状态：DRAFT/ACTIVE/EXPIRED/CANCELLED。 */
const SPEC_STATUS = build([
  { label: '草稿', value: 'DRAFT' },
  { label: '生效', value: 'ACTIVE' },
  { label: '失效', value: 'EXPIRED' },
  { label: '已取消', value: 'CANCELLED' },
]);
export const MES_INSPECTION_SPEC_STATUS_OPTIONS = SPEC_STATUS.options;
export const MES_INSPECTION_SPEC_STATUS_LABEL = SPEC_STATUS.label;

/** 检验状态：PENDING/INSPECTING/PASSED/FAILED。 */
const INSPECTION_STATUS = build([
  { label: '待检', value: 'PENDING' },
  { label: '检验中', value: 'INSPECTING' },
  { label: '合格', value: 'PASSED' },
  { label: '不合格', value: 'FAILED' },
]);
export const MES_INSPECTION_STATUS_OPTIONS = INSPECTION_STATUS.options;
export const MES_INSPECTION_STATUS_LABEL = INSPECTION_STATUS.label;

/** 检验结果：PASS/FAIL/CONCESSION。 */
const INSPECTION_RESULT = build([
  { label: '合格', value: 'PASS' },
  { label: '不合格', value: 'FAIL' },
  { label: '让步接收', value: 'CONCESSION' },
]);
export const MES_INSPECTION_RESULT_OPTIONS = INSPECTION_RESULT.options;
export const MES_INSPECTION_RESULT_LABEL = INSPECTION_RESULT.label;

/** 判定结果：PASS/FAIL/REWORK/SCRAP/CONCESSION。 */
const JUDGE_RESULT = build([
  { label: '合格', value: 'PASS' },
  { label: '不合格', value: 'FAIL' },
  { label: '返工', value: 'REWORK' },
  { label: '报废', value: 'SCRAP' },
  { label: '让步接收', value: 'CONCESSION' },
]);
export const MES_INSPECTION_JUDGE_RESULT_OPTIONS = JUDGE_RESULT.options;
export const MES_INSPECTION_JUDGE_RESULT_LABEL = JUDGE_RESULT.label;

/** 判定状态：DRAFT/CONFIRMED/CANCELLED。 */
const JUDGE_STATUS = build([
  { label: '草稿', value: 'DRAFT' },
  { label: '已确认', value: 'CONFIRMED' },
  { label: '已取消', value: 'CANCELLED' },
]);
export const MES_INSPECTION_JUDGE_STATUS_OPTIONS = JUDGE_STATUS.options;
export const MES_INSPECTION_JUDGE_STATUS_LABEL = JUDGE_STATUS.label;

/** 隔离类型：SUSPECT/DEFECT/REWORK。 */
const QUARANTINE_TYPE = build([
  { label: '疑似不合格', value: 'SUSPECT' },
  { label: '不合格', value: 'DEFECT' },
  { label: '返工待处理', value: 'REWORK' },
]);
export const MES_QUARANTINE_TYPE_OPTIONS = QUARANTINE_TYPE.options;
export const MES_QUARANTINE_TYPE_LABEL = QUARANTINE_TYPE.label;

/** 隔离状态：PENDING/RELEASED/SCRAPPED/RETURNED。 */
const QUARANTINE_STATUS = build([
  { label: '待处理', value: 'PENDING' },
  { label: '已放行', value: 'RELEASED' },
  { label: '已报废', value: 'SCRAPPED' },
  { label: '已退货', value: 'RETURNED' },
]);
export const MES_QUARANTINE_STATUS_OPTIONS = QUARANTINE_STATUS.options;
export const MES_QUARANTINE_STATUS_LABEL = QUARANTINE_STATUS.label;
