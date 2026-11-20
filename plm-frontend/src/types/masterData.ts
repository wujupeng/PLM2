import type { PageQuery } from './common';

/* ---------------- 通用枚举 ---------------- */

/** 产品型号状态：draft 草稿 / released 已发布 / obsolete 已作废 */
export type ProductStatus = 'draft' | 'released' | 'obsolete';

/** 物料生命周期状态：draft 草稿 / released 已发布 / obsolete 已作废 */
export type LifecycleStatus = 'draft' | 'released' | 'obsolete';

/** 物料类型：part 零件 / raw 原材料 / consumable 耗材 */
export type MaterialType = 'part' | 'raw' | 'consumable';

/** 物料来源类型：make 自制 / buy 采购 */
export type SourceType = 'make' | 'buy';

/** 产品状态选项 */
export const PRODUCT_STATUS_OPTIONS: { value: ProductStatus; label: string }[] = [
  { value: 'draft', label: '草稿' },
  { value: 'released', label: '已发布' },
  { value: 'obsolete', label: '已作废' },
];

/** 生命周期状态选项 */
export const LIFECYCLE_STATUS_OPTIONS: { value: LifecycleStatus; label: string }[] = [
  { value: 'draft', label: '草稿' },
  { value: 'released', label: '已发布' },
  { value: 'obsolete', label: '已作废' },
];

/** 物料类型选项 */
export const MATERIAL_TYPE_OPTIONS: { value: MaterialType; label: string }[] = [
  { value: 'part', label: '零件' },
  { value: 'raw', label: '原材料' },
  { value: 'consumable', label: '耗材' },
];

/** 来源类型选项 */
export const SOURCE_TYPE_OPTIONS: { value: SourceType; label: string }[] = [
  { value: 'make', label: '自制' },
  { value: 'buy', label: '采购' },
];

/** 状态值到中文文案映射 */
export const PRODUCT_STATUS_TEXT: Record<string, string> = {
  draft: '草稿',
  released: '已发布',
  obsolete: '已作废',
};

export const LIFECYCLE_STATUS_TEXT: Record<string, string> = { ...PRODUCT_STATUS_TEXT };

export const MATERIAL_TYPE_TEXT: Record<string, string> = {
  part: '零件',
  raw: '原材料',
  consumable: '耗材',
};

export const SOURCE_TYPE_TEXT: Record<string, string> = { make: '自制', buy: '采购' };

export const QUALITY_SEVERITY_TEXT: Record<string, string> = {
  high: '高',
  medium: '中',
  low: '低',
};

/* ---------------- 产品型号 ---------------- */

/** 产品型号列表项 */
export interface ProductItem {
  id: number;
  productCode: string;
  productName: string;
  seriesCode?: string;
  seriesName?: string;
  customerCode?: string;
  model?: string;
  unit?: string;
  status: ProductStatus;
  description?: string;
  remark?: string;
}

/** 产品型号分页查询入参 */
export interface ProductQuery extends PageQuery {
  seriesCode?: string;
  customerCode?: string;
  status?: ProductStatus;
}

/** 产品型号新增/编辑入参 */
export interface ProductSaveParams {
  productCode: string;
  productName: string;
  seriesCode?: string;
  seriesName?: string;
  customerCode?: string;
  model?: string;
  unit: string;
  status?: ProductStatus;
  description?: string;
  remark?: string;
}

/* ---------------- 物料分类 ---------------- */

/** 物料分类项 */
export interface MaterialCategoryItem {
  id: number;
  categoryCode: string;
  categoryName: string;
  parentId?: number | null;
  codeRuleKey?: string;
  requiredFields?: string;
  sortNo?: number;
  status?: number;
  remark?: string;
}

/** 物料分类新增/编辑入参 */
export interface MaterialCategorySaveParams {
  categoryCode: string;
  categoryName: string;
  parentId?: number | null;
  codeRuleKey?: string;
  requiredFields?: string;
  sortNo?: number;
  status?: number;
  remark?: string;
}

/* ---------------- 供应商 ---------------- */

/** 供应商列表项（status：1 启用 / 0 停用） */
export interface SupplierItem {
  id: number;
  supplierCode: string;
  supplierName: string;
  contact?: string;
  phone?: string;
  email?: string;
  status: number;
  remark?: string;
}

/** 供应商分页查询入参 */
export interface SupplierQuery extends PageQuery {
  status?: number;
}

/** 供应商新增/编辑入参 */
export interface SupplierSaveParams {
  supplierCode: string;
  supplierName: string;
  contact?: string;
  phone?: string;
  email?: string;
  status?: number;
  remark?: string;
}

/* ---------------- 物料主档 ---------------- */

/** 物料主档列表项 */
export interface MaterialItem {
  id: number;
  materialCode: string;
  materialName: string;
  categoryId?: number;
  categoryCode?: string;
  spec?: string;
  materialType?: MaterialType;
  unit?: string;
  sourceType?: SourceType;
  supplierId?: number;
  supplierCode?: string;
  lifecycleStatus?: LifecycleStatus;
  versionNo?: string;
  effectiveDate?: string;
  obsoleteDate?: string;
  stdCost?: number;
  remark?: string;
}

/** 物料主档分页查询入参 */
export interface MaterialQuery extends PageQuery {
  categoryCode?: string;
  lifecycleStatus?: LifecycleStatus;
  sourceType?: SourceType;
  materialType?: MaterialType;
}

/** 物料主档新增/编辑入参 */
export interface MaterialSaveParams {
  materialCode: string;
  materialName: string;
  categoryId?: number;
  categoryCode?: string;
  spec?: string;
  materialType?: MaterialType;
  unit?: string;
  sourceType?: SourceType;
  supplierId?: number;
  supplierCode?: string;
  lifecycleStatus?: LifecycleStatus;
  stdCost?: number;
  effectiveDate?: string;
  obsoleteDate?: string;
  remark?: string;
}

/** 物料替代关系项 */
export interface MaterialSubstituteItem {
  id: number;
  materialId?: number;
  materialCode?: string;
  substituteMaterialId?: number;
  substituteMaterialCode: string;
  priority?: number;
  applicableCondition?: string;
  validFrom?: string;
  validTo?: string;
  status?: number;
  remark?: string;
}

/** 物料替代关系新增入参 */
export interface MaterialSubstituteParams {
  substituteMaterialCode: string;
  priority?: number;
  applicableCondition?: string;
  validFrom?: string;
  validTo?: string;
  remark?: string;
}

/** 变更留痕记录项 */
export interface ChangeLogItem {
  id: number;
  entityType?: string;
  entityId?: number;
  entityCode?: string;
  changeType?: string;
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
  operatorId?: number;
  operatorName?: string;
  remark?: string;
  createdAt?: string;
}

/* ---------------- 数据质量 ---------------- */

/** 质量问题项 */
export interface QualityIssueItem {
  id: number;
  ruleCode?: string;
  ruleName?: string;
  entityType?: string;
  entityId?: number;
  entityCode?: string;
  severity?: string;
  message?: string;
  status?: string;
  remark?: string;
}

/** 质量问题分页查询入参 */
export interface QualityIssueQuery extends PageQuery {
  status?: string;
  severity?: string;
  ruleCode?: string;
  entityType?: string;
}

/** 数据质量扫描结果 */
export interface QualityScanResult {
  scannedRules: number;
  issueCount: number;
}

/* ---------------- 物料批量导入 ---------------- */

/** 物料导入行 */
export interface MaterialImportRow {
  sheetName?: string;
  rowNumber?: number;
  materialCode?: string;
  materialName?: string;
  categoryCode?: string;
  spec?: string;
  materialType?: string;
  unit?: string;
  sourceType?: string;
  supplierCode?: string;
  lifecycleStatus?: string;
  stdCost?: number;
}

/** 物料导入入参 */
export interface MaterialImportRequest {
  sourceFile?: string;
  rows: MaterialImportRow[];
}

/** 导入失败行明细 */
export interface ImportRowError {
  sheetName?: string;
  rowNumber?: number;
  field?: string;
  message?: string;
}

/** 物料导入结果 */
export interface MaterialImportResult {
  sourceFile?: string;
  totalRows: number;
  successRows: number;
  failRows: number;
  errors: ImportRowError[];
}
