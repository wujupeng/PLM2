import type { PageQuery } from '@/types/common';

/** G6-N4 MES 设备与工装（T040，后端 Base: /mes/equipment）类型与枚举定义。 */

/* ---------------- 分页查询条件 ---------------- */

/** 设备台账分页查询条件。keyword 匹配 equipmentNo/equipmentName/equipmentType/model/workshopCode。 */
export interface MesEquipmentQuery extends PageQuery {
  equipmentStatus?: string;
  equipmentType?: string;
  workshopCode?: string;
  lineCode?: string;
}

/** 设备状态分页查询条件。keyword 匹配 statusNo/equipmentCode/equipmentName/operator。 */
export interface MesEquipmentStatusQuery extends PageQuery {
  statusType?: string;
  recordStatus?: string;
  equipmentCode?: string;
  operator?: string;
}

/** 设备点检分页查询条件。keyword 匹配 checkNo/equipmentCode/equipmentName/inspector。 */
export interface MesEquipmentCheckQuery extends PageQuery {
  checkType?: string;
  checkStatus?: string;
  checkResult?: string;
  equipmentCode?: string;
}

/** 设备保养分页查询条件。keyword 匹配 maintenanceNo/equipmentCode/equipmentName/maintainer。 */
export interface MesEquipmentMaintenanceQuery extends PageQuery {
  maintenanceType?: string;
  maintenanceStatus?: string;
  equipmentCode?: string;
  maintainer?: string;
}

/** 设备故障分页查询条件。keyword 匹配 faultNo/equipmentCode/equipmentName/faultType。 */
export interface MesEquipmentFaultQuery extends PageQuery {
  faultLevel?: string;
  faultStatus?: string;
  faultType?: string;
  equipmentCode?: string;
}

/** 工装寿命分页查询条件。keyword 匹配 toolNo/toolCode/toolName/toolType。 */
export interface MesToolLifeQuery extends PageQuery {
  lifeStatus?: string;
  toolType?: string;
  toolCode?: string;
  equipmentCode?: string;
}

/* ---------------- 1. 设备台账 ---------------- */

export interface MesEquipment {
  id?: number;
  equipmentNo?: string;
  equipmentName?: string;
  equipmentType?: string;
  model?: string;
  spec?: string;
  manufacturer?: string;
  workshopCode?: string;
  lineCode?: string;
  location?: string;
  purchaseDate?: string;
  installDate?: string;
  warrantyEndDate?: string;
  equipmentStatus?: string;
  manager?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type MesEquipmentSaveRequest = Omit<
  MesEquipment,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 2. 设备状态 ---------------- */

export interface MesEquipmentStatus {
  id?: number;
  statusNo?: string;
  equipmentCode?: string;
  equipmentName?: string;
  statusType?: string;
  startTime?: string;
  endTime?: string;
  durationMinutes?: number | null;
  operator?: string;
  shiftCode?: string;
  recordStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type MesEquipmentStatusSaveRequest = Omit<
  MesEquipmentStatus,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 3. 设备点检 ---------------- */

export interface MesEquipmentCheck {
  id?: number;
  checkNo?: string;
  equipmentCode?: string;
  equipmentName?: string;
  checkType?: string;
  checkItem?: string;
  checkResult?: string;
  checkStatus?: string;
  inspector?: string;
  checkTime?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type MesEquipmentCheckSaveRequest = Omit<
  MesEquipmentCheck,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 4. 设备保养 ---------------- */

export interface MesEquipmentMaintenance {
  id?: number;
  maintenanceNo?: string;
  equipmentCode?: string;
  equipmentName?: string;
  maintenanceType?: string;
  planTime?: string;
  actualTime?: string;
  maintainer?: string;
  cost?: number | null;
  maintenanceStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type MesEquipmentMaintenanceSaveRequest = Omit<
  MesEquipmentMaintenance,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 5. 设备故障 ---------------- */

export interface MesEquipmentFault {
  id?: number;
  faultNo?: string;
  equipmentCode?: string;
  equipmentName?: string;
  faultType?: string;
  faultLevel?: string;
  faultDesc?: string;
  occurTime?: string;
  reporter?: string;
  repairer?: string;
  repairTime?: string;
  downtimeMinutes?: number | null;
  faultStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type MesEquipmentFaultSaveRequest = Omit<
  MesEquipmentFault,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 6. 工装寿命 ---------------- */

export interface MesToolLife {
  id?: number;
  toolNo?: string;
  toolCode?: string;
  toolName?: string;
  toolType?: string;
  equipmentCode?: string;
  totalLife?: number | null;
  usedLife?: number | null;
  remainingLife?: number | null;
  lifeUnit?: string;
  lifeStatus?: string;
  installDate?: string;
  scrappedDate?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type MesToolLifeSaveRequest = Omit<
  MesToolLife,
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

/** 设备状态：RUNNING/IDLE/FAULT/MAINTENANCE/SCRAPPED。 */
const EQUIPMENT_STATUS = build([
  { label: '运行', value: 'RUNNING' },
  { label: '空闲', value: 'IDLE' },
  { label: '故障', value: 'FAULT' },
  { label: '保养中', value: 'MAINTENANCE' },
  { label: '已报废', value: 'SCRAPPED' },
]);
export const MES_EQUIPMENT_STATUS_OPTIONS = EQUIPMENT_STATUS.options;
export const MES_EQUIPMENT_STATUS_LABEL = EQUIPMENT_STATUS.label;

/** 设备状态记录类型：RUNNING/IDLE/FAULT/MAINTENANCE。 */
const STATUS_TYPE = build([
  { label: '运行', value: 'RUNNING' },
  { label: '空闲', value: 'IDLE' },
  { label: '故障', value: 'FAULT' },
  { label: '保养', value: 'MAINTENANCE' },
]);
export const MES_EQUIPMENT_STATUS_TYPE_OPTIONS = STATUS_TYPE.options;
export const MES_EQUIPMENT_STATUS_TYPE_LABEL = STATUS_TYPE.label;

/** 点检类型：DAILY/WEEKLY/SHIFT。 */
const CHECK_TYPE = build([
  { label: '日点检', value: 'DAILY' },
  { label: '周点检', value: 'WEEKLY' },
  { label: '班点检', value: 'SHIFT' },
]);
export const MES_EQUIPMENT_CHECK_TYPE_OPTIONS = CHECK_TYPE.options;
export const MES_EQUIPMENT_CHECK_TYPE_LABEL = CHECK_TYPE.label;

/** 点检状态：PENDING/PASSED/FAILED。 */
const CHECK_STATUS = build([
  { label: '待点检', value: 'PENDING' },
  { label: '已通过', value: 'PASSED' },
  { label: '未通过', value: 'FAILED' },
]);
export const MES_EQUIPMENT_CHECK_STATUS_OPTIONS = CHECK_STATUS.options;
export const MES_EQUIPMENT_CHECK_STATUS_LABEL = CHECK_STATUS.label;

/** 点检结果：PASS/FAIL/CONCESSION。 */
const CHECK_RESULT = build([
  { label: '合格', value: 'PASS' },
  { label: '不合格', value: 'FAIL' },
  { label: '让步接收', value: 'CONCESSION' },
]);
export const MES_EQUIPMENT_CHECK_RESULT_OPTIONS = CHECK_RESULT.options;
export const MES_EQUIPMENT_CHECK_RESULT_LABEL = CHECK_RESULT.label;

/** 保养类型：DAILY/WEEKLY/MONTHLY/YEARLY。 */
const MAINTENANCE_TYPE = build([
  { label: '日常保养', value: 'DAILY' },
  { label: '周保养', value: 'WEEKLY' },
  { label: '月保养', value: 'MONTHLY' },
  { label: '年保养', value: 'YEARLY' },
]);
export const MES_EQUIPMENT_MAINTENANCE_TYPE_OPTIONS = MAINTENANCE_TYPE.options;
export const MES_EQUIPMENT_MAINTENANCE_TYPE_LABEL = MAINTENANCE_TYPE.label;

/** 保养状态：PLANNED/DONE/CANCELLED。 */
const MAINTENANCE_STATUS = build([
  { label: '已计划', value: 'PLANNED' },
  { label: '已完成', value: 'DONE' },
  { label: '已取消', value: 'CANCELLED' },
]);
export const MES_EQUIPMENT_MAINTENANCE_STATUS_OPTIONS = MAINTENANCE_STATUS.options;
export const MES_EQUIPMENT_MAINTENANCE_STATUS_LABEL = MAINTENANCE_STATUS.label;

/** 故障等级：LOW/MEDIUM/HIGH/CRITICAL。 */
const FAULT_LEVEL = build([
  { label: '低', value: 'LOW' },
  { label: '中', value: 'MEDIUM' },
  { label: '高', value: 'HIGH' },
  { label: '紧急', value: 'CRITICAL' },
]);
export const MES_EQUIPMENT_FAULT_LEVEL_OPTIONS = FAULT_LEVEL.options;
export const MES_EQUIPMENT_FAULT_LEVEL_LABEL = FAULT_LEVEL.label;

/** 故障状态：REPORTED/PROCESSING/RESOLVED/CLOSED。 */
const FAULT_STATUS = build([
  { label: '已报修', value: 'REPORTED' },
  { label: '维修中', value: 'PROCESSING' },
  { label: '已修复', value: 'RESOLVED' },
  { label: '已关闭', value: 'CLOSED' },
]);
export const MES_EQUIPMENT_FAULT_STATUS_OPTIONS = FAULT_STATUS.options;
export const MES_EQUIPMENT_FAULT_STATUS_LABEL = FAULT_STATUS.label;

/** 工装寿命状态：NORMAL/WARNING/EXPIRED/SCRAPPED。 */
const TOOL_LIFE_STATUS = build([
  { label: '正常', value: 'NORMAL' },
  { label: '预警', value: 'WARNING' },
  { label: '已超期', value: 'EXPIRED' },
  { label: '已报废', value: 'SCRAPPED' },
]);
export const MES_TOOL_LIFE_STATUS_OPTIONS = TOOL_LIFE_STATUS.options;
export const MES_TOOL_LIFE_STATUS_LABEL = TOOL_LIFE_STATUS.label;
