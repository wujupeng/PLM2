import type { PageQuery } from './common';

/* ---------------- 通用枚举 ---------------- */

/** 规格分类 */
export type SpecCategory = 'electrical' | 'mechanical' | 'environment' | 'life' | 'material';

/** 规格状态 */
export type SpecStatus = 'draft' | 'released' | 'obsolete';

/** 规格字段数据类型 */
export type SpecFieldDataType = 'number' | 'range' | 'text' | 'bool' | 'option';

/** 规格分类选项 */
export const SPEC_CATEGORY_OPTIONS: { value: SpecCategory; label: string }[] = [
  { value: 'electrical', label: '电气规格' },
  { value: 'mechanical', label: '机械规格' },
  { value: 'environment', label: '环境规格' },
  { value: 'life', label: '寿命规格' },
  { value: 'material', label: '材料规格' },
];

/** 规格分类文案映射 */
export const SPEC_CATEGORY_LABEL: Record<string, string> = {
  electrical: '电气规格',
  mechanical: '机械规格',
  environment: '环境规格',
  life: '寿命规格',
  material: '材料规格',
};

/** 规格状态选项 */
export const SPEC_STATUS_OPTIONS: { value: SpecStatus; label: string }[] = [
  { value: 'draft', label: '草稿' },
  { value: 'released', label: '已发布' },
  { value: 'obsolete', label: '已淘汰' },
];

/** 规格状态文案映射 */
export const SPEC_STATUS_LABEL: Record<string, string> = {
  draft: '草稿',
  released: '已发布',
  obsolete: '已淘汰',
};

/** 规格字段数据类型选项 */
export const SPEC_FIELD_DATA_TYPE_OPTIONS: { value: SpecFieldDataType; label: string }[] = [
  { value: 'number', label: '数值' },
  { value: 'range', label: '范围' },
  { value: 'text', label: '文本' },
  { value: 'bool', label: '是否' },
  { value: 'option', label: '选项' },
];

/** 规格字段数据类型文案映射 */
export const SPEC_FIELD_DATA_TYPE_LABEL: Record<string, string> = {
  number: '数值',
  range: '范围',
  text: '文本',
  bool: '是否',
  option: '选项',
};

/* ---------------- 规格模板 ---------------- */

/** 规格模板列表项 */
export interface SpecTemplateItem {
  id: number;
  templateCode: string;
  templateName: string;
  productSeries?: string;
  productCode?: string;
  specCategory?: string;
  versionNo?: string;
  status?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** 规格模板分页查询入参 */
export interface SpecTemplateQuery extends PageQuery {
  templateCode?: string;
  specCategory?: string;
  productSeries?: string;
  status?: string;
}

/** 规格模板字段明细项（requiredFlag/status：1 是/启用 0 否/停用） */
export interface SpecTemplateFieldItem {
  id?: number;
  templateId?: number;
  fieldCode: string;
  fieldName: string;
  fieldCategory?: string;
  dataType?: string;
  unit?: string;
  minValue?: number;
  maxValue?: number;
  targetValue?: string;
  requiredFlag?: number;
  defaultValue?: string;
  optionsText?: string;
  inspectionMethod?: string;
  sortNo?: number;
  status?: number;
  remark?: string;
}

/** 规格模板字段明细新增/编辑入参 */
export interface SpecTemplateFieldSaveParams {
  fieldCode: string;
  fieldName: string;
  fieldCategory?: string;
  dataType?: string;
  unit?: string;
  minValue?: number;
  maxValue?: number;
  targetValue?: string;
  requiredFlag?: number;
  defaultValue?: string;
  optionsText?: string;
  inspectionMethod?: string;
  sortNo?: number;
  status?: number;
  remark?: string;
}

/** 规格模板新增/编辑入参 */
export interface SpecTemplateSaveParams {
  templateCode: string;
  templateName: string;
  productSeries?: string;
  productCode?: string;
  specCategory?: string;
  versionNo?: string;
  status?: string;
  description?: string;
  remark?: string;
  fields?: SpecTemplateFieldSaveParams[];
}

/** 规格模板详情 */
export interface SpecTemplateDetail {
  template: SpecTemplateItem;
  fields: SpecTemplateFieldItem[];
}

/* ---------------- 规格实例 ---------------- */

/** 规格实例列表项 */
export interface SpecInstanceItem {
  id: number;
  instanceCode: string;
  templateId?: number;
  templateCode?: string;
  productCode?: string;
  productName?: string;
  versionNo?: string;
  status?: string;
  effectiveDate?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** 规格实例分页查询入参 */
export interface SpecInstanceQuery extends PageQuery {
  instanceCode?: string;
  productCode?: string;
  templateCode?: string;
  status?: string;
}

/** 规格实例取值项（passFlag：1 合格 0 超界） */
export interface SpecInstanceValueItem {
  id?: number;
  instanceId?: number;
  fieldCode: string;
  fieldName?: string;
  fieldCategory?: string;
  unit?: string;
  minValue?: number;
  maxValue?: number;
  targetValue?: string;
  valueText?: string;
  valueNumber?: number;
  passFlag?: number;
  inspectionMethod?: string;
  sortNo?: number;
  remark?: string;
}

/** 规格实例取值新增/编辑入参 */
export interface SpecInstanceValueSaveParams {
  fieldCode: string;
  fieldName?: string;
  fieldCategory?: string;
  unit?: string;
  minValue?: number;
  maxValue?: number;
  targetValue?: string;
  valueText?: string;
  valueNumber?: number;
  remark?: string;
}

/** 规格实例新增/编辑入参 */
export interface SpecInstanceSaveParams {
  instanceCode: string;
  templateId?: number;
  templateCode?: string;
  productCode?: string;
  productName?: string;
  versionNo?: string;
  status?: string;
  effectiveDate?: string;
  remark?: string;
  values?: SpecInstanceValueSaveParams[];
}

/** 规格实例详情 */
export interface SpecInstanceDetail {
  instance: SpecInstanceItem;
  values: SpecInstanceValueItem[];
}
