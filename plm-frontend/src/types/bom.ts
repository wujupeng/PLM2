import type { PageQuery } from './common';
import type { ImportRowError } from './masterData';

/* ---------------- 通用枚举 ---------------- */

/** BOM 类型：EBOM 设计 BOM / MBOM 制造 BOM */
export type BomType = 'EBOM' | 'MBOM';

/** BOM 状态：draft 草稿 / released 已发布 / obsolete 已作废 */
export type BomStatus = 'draft' | 'released' | 'obsolete';

/** BOM 类型选项 */
export const BOM_TYPE_OPTIONS: { value: BomType; label: string }[] = [
  { value: 'EBOM', label: 'EBOM（设计）' },
  { value: 'MBOM', label: 'MBOM（制造）' },
];

/** BOM 状态选项 */
export const BOM_STATUS_OPTIONS: { value: BomStatus; label: string }[] = [
  { value: 'draft', label: '草稿' },
  { value: 'released', label: '已发布' },
  { value: 'obsolete', label: '已作废' },
];

/** BOM 状态文案映射 */
export const BOM_STATUS_TEXT: Record<string, string> = {
  draft: '草稿',
  released: '已发布',
  obsolete: '已作废',
};

/** BOM 异常类型文案映射 */
export const BOM_ISSUE_TYPE_TEXT: Record<string, string> = {
  duplicate: '重复行',
  orphan: '孤立物料',
  cycle: '循环引用',
  missingQty: '缺失用量',
};

/** BOM 发布目标系统选项 */
export const BOM_TARGET_SYSTEMS: { value: string; label: string }[] = [
  { value: 'ERP', label: 'ERP' },
  { value: 'MES', label: 'MES' },
];

/** BOM 批次状态文案映射 */
export const BOM_BATCH_STATUS_TEXT: Record<string, string> = {
  pending: '处理中',
  success: '成功',
  partial: '部分成功',
  failed: '失败',
};

/* ---------------- BOM 头 ---------------- */

/** BOM 头信息 */
export interface BomItem {
  id: number;
  bomCode: string;
  productId?: number;
  productCode: string;
  bomType: BomType;
  versionNo?: string;
  status: BomStatus;
  effectiveFrom?: string;
  effectiveTo?: string;
  sourceBatchId?: number;
  sourceBomId?: number;
  description?: string;
  remark?: string;
}

/** BOM 分页查询入参 */
export interface BomQuery extends PageQuery {
  productCode?: string;
  bomType?: BomType;
  status?: BomStatus;
}

/** BOM 新增/编辑入参 */
export interface BomSaveParams {
  productCode: string;
  productId?: number;
  bomType: BomType;
  versionNo?: string;
  status?: BomStatus;
  effectiveFrom?: string;
  effectiveTo?: string;
  description?: string;
  remark?: string;
}

/** BOM 行项目 */
export interface BomLineItem {
  id: number;
  headerId?: number;
  lineNo?: number;
  parentMaterialCode: string;
  childMaterialCode: string;
  childMaterialName?: string;
  qty: number;
  unit: string;
  itemSeq?: number;
  substituteAllowed?: boolean;
  validFrom?: string;
  validTo?: string;
  remark?: string;
}

/** BOM 行项目新增/编辑入参 */
export interface BomLineSaveParams {
  lineNo?: number;
  parentMaterialCode: string;
  childMaterialCode: string;
  childMaterialName?: string;
  qty: number;
  unit: string;
  itemSeq?: number;
  substituteAllowed?: boolean;
  validFrom?: string;
  validTo?: string;
  remark?: string;
}

/** BOM 详情 */
export interface BomDetail {
  header: BomItem;
  lines: BomLineItem[];
}

/* ---------------- 多级展开 ---------------- */

/** BOM 多级展开节点 */
export interface BomExpandNode {
  materialCode: string;
  materialName?: string;
  qty?: number;
  unit?: string;
  level?: number;
  path?: string;
  children?: BomExpandNode[];
}

/** BOM 反查（where-used）结果项 */
export interface BomWhereUsedItem {
  headerId: number;
  bomCode?: string;
  productCode?: string;
  bomType?: BomType;
  versionNo?: string;
  status?: BomStatus;
  parentMaterialCode?: string;
  lineNo?: number;
  qty?: number;
}

/* ---------------- 版本比较 ---------------- */

/** BOM 版本比较差异项 */
export interface BomCompareDiff {
  lineKey?: string;
  fieldName?: string;
  valueA?: string;
  valueB?: string;
}

/** BOM 版本比较结果 */
export interface BomCompareResponse {
  headerA?: BomItem;
  headerB?: BomItem;
  added: BomLineItem[];
  removed: BomLineItem[];
  modified: BomCompareDiff[];
}

/* ---------------- 异常校验 ---------------- */

/** BOM 异常项 */
export interface BomIssueItem {
  id?: number;
  headerId?: number;
  issueType?: string;
  severity?: string;
  lineNo?: number;
  materialCode?: string;
  message?: string;
  status?: string;
}

/** BOM 校验结果 */
export interface BomValidationResult {
  headerId?: number;
  issueCount: number;
  issues: BomIssueItem[];
}

/* ---------------- 单阶导入 ---------------- */

/** BOM 导入行 */
export interface BomImportRow {
  sheetName?: string;
  rowNumber?: number;
  parentMaterialCode?: string;
  childMaterialCode?: string;
  childMaterialName?: string;
  qty?: number;
  unit?: string;
  itemSeq?: number;
  substituteAllowed?: boolean;
  validFrom?: string;
  validTo?: string;
}

/** BOM 导入入参 */
export interface BomImportRequest {
  bomType: BomType;
  sourceFile?: string;
  productCode: string;
  versionNo?: string;
  status?: BomStatus;
  effectiveFrom?: string;
  rows: BomImportRow[];
}

/** BOM 导入结果 */
export interface BomImportResult {
  batchId?: number;
  batchNo?: string;
  totalRows: number;
  successRows: number;
  failRows: number;
  status?: string;
  errors: ImportRowError[];
}

/** BOM 导入批次项 */
export interface BomImportBatchItem {
  id: number;
  batchNo?: string;
  bomType?: BomType;
  sourceFile?: string;
  productCode?: string;
  totalRows?: number;
  successRows?: number;
  failRows?: number;
  status?: string;
  headerId?: number;
  remark?: string;
}

/** BOM 导入批次分页查询入参 */
export interface BomBatchQuery extends PageQuery {
  bomType?: BomType;
  status?: string;
}

/** BOM 导入失败明细项 */
export interface BomImportErrorItem {
  id?: number;
  batchId?: number;
  sheetName?: string;
  rowNumber?: number;
  fieldName?: string;
  errorMessage?: string;
  rawRow?: string;
}

/* ---------------- 发布日志 ---------------- */

/** BOM 发布日志项 */
export interface BomPublishLogItem {
  id: number;
  headerId?: number;
  bomCode?: string;
  versionNo?: string;
  targetSystem?: string;
  status?: string;
  retryCount?: number;
  requestPayload?: string;
  responseMessage?: string;
  publishedAt?: string;
}
