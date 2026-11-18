import type { PageQuery } from './common';

/* ---------------- 通用枚举 ---------------- */

/** 检验类型 */
export type InspectionType = 'iqc' | 'ipqc' | 'fqc' | 'oqc';

/** 检验规范状态 */
export type InspectionSpecStatus = 'draft' | 'released' | 'obsolete';

/** 检验类型选项 */
export const INSPECTION_TYPE_OPTIONS: { value: InspectionType; label: string }[] = [
  { value: 'iqc', label: '来料检验' },
  { value: 'ipqc', label: '制程检验' },
  { value: 'fqc', label: '成品检验' },
  { value: 'oqc', label: '出货检验' },
];

/** 检验类型文案映射 */
export const INSPECTION_TYPE_TEXT: Record<string, string> = {
  iqc: '来料检验',
  ipqc: '制程检验',
  fqc: '成品检验',
  oqc: '出货检验',
};

/** 检验规范状态选项 */
export const INSPECTION_STATUS_OPTIONS: { value: InspectionSpecStatus; label: string }[] = [
  { value: 'draft', label: '草稿' },
  { value: 'released', label: '已发布' },
  { value: 'obsolete', label: '已淘汰' },
];

/** 检验规范状态文案映射 */
export const INSPECTION_STATUS_TEXT: Record<string, string> = {
  draft: '草稿',
  released: '已发布',
  obsolete: '已淘汰',
};

/** 检验规范状态标签颜色 */
export const INSPECTION_STATUS_COLOR: Record<string, string> = {
  draft: 'default',
  released: 'success',
  obsolete: 'error',
};

/* ---------------- 检验项目明细 ---------------- */

/** 检验项目明细项 */
export interface InspectionItemItem {
  id: number;
  specId?: number;
  seqNo?: number;
  itemCode?: string;
  itemName: string;
  inspectionMethod?: string;
  equipment?: string;
  unit?: string;
  standardValue?: string;
  upperLimit?: number;
  lowerLimit?: number;
  verdictRule?: string;
  keyItem?: number;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** 检验项目明细新增/编辑入参 */
export interface InspectionItemSaveParams {
  seqNo?: number;
  itemCode?: string;
  itemName: string;
  inspectionMethod?: string;
  equipment?: string;
  unit?: string;
  standardValue?: string;
  upperLimit?: number;
  lowerLimit?: number;
  verdictRule?: string;
  keyItem?: number;
  remark?: string;
}

/* ---------------- 检验规范 ---------------- */

/** 检验规范列表项 */
export interface InspectionSpecItem {
  id: number;
  specCode: string;
  specName: string;
  inspectionType?: string;
  productCode?: string;
  materialCode?: string;
  versionNo?: string;
  samplingPlan?: string;
  aqlLevel?: string;
  status?: string;
  effectiveDate?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** 检验规范分页查询入参 */
export interface InspectionSpecQuery extends PageQuery {
  specCode?: string;
  inspectionType?: string;
  productCode?: string;
  materialCode?: string;
  status?: string;
}

/** 检验规范新增/编辑入参 */
export interface InspectionSpecSaveParams {
  specCode: string;
  specName: string;
  inspectionType?: string;
  productCode?: string;
  materialCode?: string;
  versionNo?: string;
  samplingPlan?: string;
  aqlLevel?: string;
  status?: string;
  effectiveDate?: string;
  remark?: string;
  items?: InspectionItemSaveParams[];
}

/** 检验规范详情响应 */
export interface InspectionSpecDetail {
  spec: InspectionSpecItem;
  items: InspectionItemItem[];
}

/** 检验规范自动匹配入参 */
export interface InspectionMatchParams {
  productCode?: string;
  materialCode?: string;
  inspectionType?: string;
}

/** 工序关联检验规范响应（兼容 { spec, message } 包装结构与直接返回规范对象两种情况） */
export type OperationInspectionSpecResponse =
  | InspectionSpecItem
  | { spec?: InspectionSpecItem | null; message?: string }
  | null;
