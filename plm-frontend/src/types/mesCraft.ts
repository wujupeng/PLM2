import type { PageQuery } from '@/types/common';

/** G6-N2 MES 工艺与作业（T038，后端 Base: /mes/craft）类型与枚举定义。 */

/* ---------------- 分页查询条件 ---------------- */

/** 工艺版本分页查询条件。keyword 匹配 processVersionNo/processCode/materialCode/materialName。 */
export interface MesProcessVersionQuery extends PageQuery {
  versionStatus?: string;
  processCode?: string;
  materialCode?: string;
  routeCode?: string;
}

/** SOP作业指导书分页查询条件。keyword 匹配 sopNo/sopName/processCode/materialCode。 */
export interface MesSopQuery extends PageQuery {
  sopStatus?: string;
  processCode?: string;
  materialCode?: string;
  sopVersion?: string;
}

/** 参数配方分页查询条件。keyword 匹配 recipeNo/recipeName/processCode/materialCode。 */
export interface MesRecipeQuery extends PageQuery {
  recipeStatus?: string;
  processCode?: string;
  materialCode?: string;
  paramCode?: string;
}

/** 首件确认分页查询条件。keyword 匹配 faiNo/workOrderNo/processCode/materialCode。 */
export interface MesFaiQuery extends PageQuery {
  faiStatus?: string;
  faiResult?: string;
  processCode?: string;
  materialCode?: string;
}

/** 换线换型分页查询条件。keyword 匹配 changeoverNo/workOrderNo/lineCode/materialCode。 */
export interface MesChangeoverQuery extends PageQuery {
  changeoverStatus?: string;
  changeoverType?: string;
  lineCode?: string;
  materialCode?: string;
}

/* ---------------- 1. 工艺版本 ---------------- */

export interface MesProcessVersion {
  id?: number;
  processVersionNo?: string;
  processCode?: string;
  processName?: string;
  versionNo?: string;
  materialCode?: string;
  materialName?: string;
  spec?: string;
  routeCode?: string;
  routeName?: string;
  effectiveDate?: string;
  expireDate?: string;
  versionStatus?: string;
  approver?: string;
  approveTime?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type MesProcessVersionSaveRequest = Omit<
  MesProcessVersion,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 2. SOP作业指导书 ---------------- */

export interface MesSop {
  id?: number;
  sopNo?: string;
  sopName?: string;
  processCode?: string;
  materialCode?: string;
  materialName?: string;
  spec?: string;
  sopVersion?: string;
  fileName?: string;
  fileUrl?: string;
  effectiveDate?: string;
  sopStatus?: string;
  author?: string;
  publishTime?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type MesSopSaveRequest = Omit<
  MesSop,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 3. 参数配方 ---------------- */

export interface MesRecipe {
  id?: number;
  recipeNo?: string;
  recipeName?: string;
  processCode?: string;
  materialCode?: string;
  materialName?: string;
  spec?: string;
  paramCode?: string;
  paramName?: string;
  paramValue?: string;
  paramUnit?: string;
  upperLimit?: number | null;
  lowerLimit?: number | null;
  recipeStatus?: string;
  effectiveDate?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type MesRecipeSaveRequest = Omit<
  MesRecipe,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 4. 首件确认 ---------------- */

export interface MesFai {
  id?: number;
  faiNo?: string;
  workOrderNo?: string;
  processCode?: string;
  materialCode?: string;
  materialName?: string;
  spec?: string;
  equipmentCode?: string;
  inspector?: string;
  inspectTime?: string;
  faiResult?: string;
  faiStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type MesFaiSaveRequest = Omit<
  MesFai,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 5. 换线换型 ---------------- */

export interface MesChangeover {
  id?: number;
  changeoverNo?: string;
  workOrderNo?: string;
  lineCode?: string;
  materialCode?: string;
  materialName?: string;
  changeoverType?: string;
  startTime?: string;
  endTime?: string;
  durationMinutes?: number | null;
  changeoverStatus?: string;
  operator?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type MesChangeoverSaveRequest = Omit<
  MesChangeover,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 枚举选项与标签 ---------------- */

/** 工艺版本状态：DRAFT/RELEASED/OBSOLETE/CANCELLED。 */
export const MES_PROCESS_VERSION_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已发布', value: 'RELEASED' },
  { label: '已失效', value: 'OBSOLETE' },
  { label: '已取消', value: 'CANCELLED' },
] as const;
export const MES_PROCESS_VERSION_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  RELEASED: '已发布',
  OBSOLETE: '已失效',
  CANCELLED: '已取消',
};

/** SOP状态：DRAFT/RELEASED/OBSOLETE。 */
export const MES_SOP_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已发布', value: 'RELEASED' },
  { label: '已失效', value: 'OBSOLETE' },
] as const;
export const MES_SOP_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  RELEASED: '已发布',
  OBSOLETE: '已失效',
};

/** 配方状态：DRAFT/RELEASED/OBSOLETE。 */
export const MES_RECIPE_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已发布', value: 'RELEASED' },
  { label: '已失效', value: 'OBSOLETE' },
] as const;
export const MES_RECIPE_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  RELEASED: '已发布',
  OBSOLETE: '已失效',
};

/** 首件状态：PENDING/PASSED/FAILED/CANCELLED。 */
export const MES_FAI_STATUS_OPTIONS = [
  { label: '待确认', value: 'PENDING' },
  { label: '已通过', value: 'PASSED' },
  { label: '未通过', value: 'FAILED' },
  { label: '已取消', value: 'CANCELLED' },
] as const;
export const MES_FAI_STATUS_LABEL: Record<string, string> = {
  PENDING: '待确认',
  PASSED: '已通过',
  FAILED: '未通过',
  CANCELLED: '已取消',
};

/** 首件结果：PASS/FAIL/CONCESSION。 */
export const MES_FAI_RESULT_OPTIONS = [
  { label: '合格', value: 'PASS' },
  { label: '不合格', value: 'FAIL' },
  { label: '让步接收', value: 'CONCESSION' },
] as const;
export const MES_FAI_RESULT_LABEL: Record<string, string> = {
  PASS: '合格',
  FAIL: '不合格',
  CONCESSION: '让步接收',
};

/** 换型类型：MODEL/MATERIAL/ROUTE。 */
export const MES_CHANGEOVER_TYPE_OPTIONS = [
  { label: '换型', value: 'MODEL' },
  { label: '换料', value: 'MATERIAL' },
  { label: '换工艺', value: 'ROUTE' },
] as const;
export const MES_CHANGEOVER_TYPE_LABEL: Record<string, string> = {
  MODEL: '换型',
  MATERIAL: '换料',
  ROUTE: '换工艺',
};

/** 换型状态：DRAFT/IN_PROGRESS/COMPLETED/CANCELLED。 */
export const MES_CHANGEOVER_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '进行中', value: 'IN_PROGRESS' },
  { label: '已完成', value: 'COMPLETED' },
  { label: '已取消', value: 'CANCELLED' },
] as const;
export const MES_CHANGEOVER_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  IN_PROGRESS: '进行中',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
};
