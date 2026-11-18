import type { PageQuery } from './common';

/* ---------------- 通用枚举 ---------------- */

/** 工艺路线状态 */
export type ProcessRouteStatus = 'draft' | 'released' | 'obsolete';

/** 工艺路线状态选项 */
export const PROCESS_STATUS_OPTIONS: { value: ProcessRouteStatus; label: string }[] = [
  { value: 'draft', label: '草稿' },
  { value: 'released', label: '已发布' },
  { value: 'obsolete', label: '已淘汰' },
];

/** 工艺路线状态文案映射 */
export const PROCESS_STATUS_TEXT: Record<string, string> = {
  draft: '草稿',
  released: '已发布',
  obsolete: '已淘汰',
};

/** 工艺路线状态标签颜色 */
export const PROCESS_STATUS_COLOR: Record<string, string> = {
  draft: 'default',
  released: 'success',
  obsolete: 'error',
};

/* ---------------- 工序明细 ---------------- */

/** 工序明细项 */
export interface ProcessOperationItem {
  id: number;
  routeId?: number;
  seqNo?: number;
  operationCode: string;
  operationName: string;
  workCenter?: string;
  processParams?: string;
  fixtureTooling?: string;
  workInstructionDocNo?: string;
  standardTime?: string;
  inspectionRequired?: number;
  inspectionSpecCode?: string;
  keyOperation?: number;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** 工序明细新增/编辑入参 */
export interface ProcessOperationSaveParams {
  seqNo?: number;
  operationCode: string;
  operationName: string;
  workCenter?: string;
  processParams?: string;
  fixtureTooling?: string;
  workInstructionDocNo?: string;
  standardTime?: string;
  inspectionRequired?: number;
  inspectionSpecCode?: string;
  keyOperation?: number;
  remark?: string;
}

/* ---------------- 工艺路线 ---------------- */

/** 工艺路线列表项 */
export interface ProcessRouteItem {
  id: number;
  routeCode: string;
  routeName: string;
  productCode?: string;
  productName?: string;
  versionNo?: string;
  processVersion?: string;
  status?: string;
  effectiveDate?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** 工艺路线分页查询入参 */
export interface ProcessRouteQuery extends PageQuery {
  routeCode?: string;
  productCode?: string;
  status?: string;
}

/** 工艺路线新增/编辑入参 */
export interface ProcessRouteSaveParams {
  routeCode: string;
  routeName: string;
  productCode?: string;
  productName?: string;
  versionNo?: string;
  processVersion?: string;
  status?: string;
  effectiveDate?: string;
  description?: string;
  remark?: string;
  operations?: ProcessOperationSaveParams[];
}

/** 工艺路线详情响应 */
export interface ProcessRouteDetail {
  route: ProcessRouteItem;
  operations: ProcessOperationItem[];
}
