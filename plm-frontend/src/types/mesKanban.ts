import type { PageQuery } from '@/types/common';

/** G6-N7 MES 生产看板（T043，后端 Base: /mes/kanban）类型与枚举定义。 */

/* ---------------- 分页查询条件 ---------------- */

/** 计划达成分页查询条件。keyword 匹配 planNo/workOrderNo/materialCode/materialName。 */
export interface MesKanbanPlanQuery extends PageQuery {
  recordStatus?: string;
  workOrderNo?: string;
  materialCode?: string;
  lineCode?: string;
}

/** 产量看板分页查询条件。keyword 匹配 outputNo/materialCode/materialName/lineCode。 */
export interface MesKanbanOutputQuery extends PageQuery {
  recordStatus?: string;
  materialCode?: string;
  lineCode?: string;
  shiftCode?: string;
}

/** 良率看板分页查询条件。keyword 匹配 yieldNo/materialCode/materialName/lineCode。 */
export interface MesKanbanYieldQuery extends PageQuery {
  recordStatus?: string;
  materialCode?: string;
  lineCode?: string;
  shiftCode?: string;
}

/** 停机看板分页查询条件。keyword 匹配 downtimeNo/equipmentCode/equipmentName/lineCode。 */
export interface MesKanbanDowntimeQuery extends PageQuery {
  recordStatus?: string;
  downtimeType?: string;
  equipmentCode?: string;
  lineCode?: string;
}

/** 在制品看板分页查询条件。keyword 匹配 wipNo/workOrderNo/materialCode/materialName。 */
export interface MesKanbanWipQuery extends PageQuery {
  recordStatus?: string;
  workOrderNo?: string;
  materialCode?: string;
  lineCode?: string;
}

/** 异常安灯分页查询条件。keyword 匹配 andonNo/lineCode/stationCode/triggerBy。 */
export interface MesKanbanAndonQuery extends PageQuery {
  andonType?: string;
  andonLevel?: string;
  andonStatus?: string;
  lineCode?: string;
}

/* ---------------- 1. 计划达成 ---------------- */

export interface MesKanbanPlan {
  id?: number;
  planNo?: string;
  workOrderNo?: string;
  materialCode?: string;
  materialName?: string;
  planQty?: number | null;
  finishQty?: number | null;
  achieveRate?: number | null;
  planDate?: string;
  lineCode?: string;
  shiftCode?: string;
  recordStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type MesKanbanPlanSaveRequest = Omit<
  MesKanbanPlan,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 2. 产量看板 ---------------- */

export interface MesKanbanOutput {
  id?: number;
  outputNo?: string;
  materialCode?: string;
  materialName?: string;
  lineCode?: string;
  shiftCode?: string;
  outputQty?: number | null;
  qualifiedQty?: number | null;
  unqualifiedQty?: number | null;
  uom?: string;
  outputDate?: string;
  recordStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type MesKanbanOutputSaveRequest = Omit<
  MesKanbanOutput,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 3. 良率看板 ---------------- */

export interface MesKanbanYield {
  id?: number;
  yieldNo?: string;
  materialCode?: string;
  materialName?: string;
  lineCode?: string;
  shiftCode?: string;
  inputQty?: number | null;
  qualifiedQty?: number | null;
  unqualifiedQty?: number | null;
  yieldRate?: number | null;
  statDate?: string;
  recordStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type MesKanbanYieldSaveRequest = Omit<
  MesKanbanYield,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 4. 停机看板 ---------------- */

export interface MesKanbanDowntime {
  id?: number;
  downtimeNo?: string;
  equipmentCode?: string;
  equipmentName?: string;
  lineCode?: string;
  downtimeType?: string;
  startTime?: string;
  endTime?: string;
  durationMinutes?: number | null;
  reason?: string;
  recordStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type MesKanbanDowntimeSaveRequest = Omit<
  MesKanbanDowntime,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 5. 在制品看板 ---------------- */

export interface MesKanbanWip {
  id?: number;
  wipNo?: string;
  workOrderNo?: string;
  materialCode?: string;
  materialName?: string;
  lineCode?: string;
  processCode?: string;
  wipQty?: number | null;
  uom?: string;
  statTime?: string;
  recordStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type MesKanbanWipSaveRequest = Omit<
  MesKanbanWip,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 6. 异常安灯 ---------------- */

export interface MesKanbanAndon {
  id?: number;
  andonNo?: string;
  lineCode?: string;
  stationCode?: string;
  andonType?: string;
  andonLevel?: string;
  andonStatus?: string;
  triggerTime?: string;
  responseTime?: string;
  closeTime?: string;
  triggerBy?: string;
  handler?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type MesKanbanAndonSaveRequest = Omit<
  MesKanbanAndon,
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

/** 看板记录状态：DRAFT/PUBLISHED/ARCHIVED。 */
const KANBAN_RECORD_STATUS = build([
  { label: '草稿', value: 'DRAFT' },
  { label: '已发布', value: 'PUBLISHED' },
  { label: '已归档', value: 'ARCHIVED' },
]);
export const MES_KANBAN_RECORD_STATUS_OPTIONS = KANBAN_RECORD_STATUS.options;
export const MES_KANBAN_RECORD_STATUS_LABEL = KANBAN_RECORD_STATUS.label;

/** 停机类型：EQUIPMENT/MATERIAL/CHANGEOVER/PLANNED/QUALITY/OTHER。 */
const KANBAN_DOWNTIME_TYPE = build([
  { label: '设备故障', value: 'EQUIPMENT' },
  { label: '物料短缺', value: 'MATERIAL' },
  { label: '换型换线', value: 'CHANGEOVER' },
  { label: '计划停机', value: 'PLANNED' },
  { label: '质量异常', value: 'QUALITY' },
  { label: '其他', value: 'OTHER' },
]);
export const MES_KANBAN_DOWNTIME_TYPE_OPTIONS = KANBAN_DOWNTIME_TYPE.options;
export const MES_KANBAN_DOWNTIME_TYPE_LABEL = KANBAN_DOWNTIME_TYPE.label;

/** 安灯类型：EQUIPMENT/QUALITY/MATERIAL/PROCESS/SAFETY/OTHER。 */
const KANBAN_ANDON_TYPE = build([
  { label: '设备异常', value: 'EQUIPMENT' },
  { label: '质量异常', value: 'QUALITY' },
  { label: '物料异常', value: 'MATERIAL' },
  { label: '工艺异常', value: 'PROCESS' },
  { label: '安全异常', value: 'SAFETY' },
  { label: '其他', value: 'OTHER' },
]);
export const MES_KANBAN_ANDON_TYPE_OPTIONS = KANBAN_ANDON_TYPE.options;
export const MES_KANBAN_ANDON_TYPE_LABEL = KANBAN_ANDON_TYPE.label;

/** 安灯等级：LOW/MEDIUM/HIGH/CRITICAL。 */
const KANBAN_ANDON_LEVEL = build([
  { label: '低', value: 'LOW' },
  { label: '中', value: 'MEDIUM' },
  { label: '高', value: 'HIGH' },
  { label: '紧急', value: 'CRITICAL' },
]);
export const MES_KANBAN_ANDON_LEVEL_OPTIONS = KANBAN_ANDON_LEVEL.options;
export const MES_KANBAN_ANDON_LEVEL_LABEL = KANBAN_ANDON_LEVEL.label;

/** 安灯状态：TRIGGERED/RESPONDED/CLOSED/CANCELLED。 */
const KANBAN_ANDON_STATUS = build([
  { label: '已触发', value: 'TRIGGERED' },
  { label: '已响应', value: 'RESPONDED' },
  { label: '已关闭', value: 'CLOSED' },
  { label: '已取消', value: 'CANCELLED' },
]);
export const MES_KANBAN_ANDON_STATUS_OPTIONS = KANBAN_ANDON_STATUS.options;
export const MES_KANBAN_ANDON_STATUS_LABEL = KANBAN_ANDON_STATUS.label;
