import type { PageQuery } from './common';

/* ---------------- 通用枚举 ---------------- */

/** CAD 文件格式 */
export type CadFileFormat = 'dwg' | 'dxf' | 'sldprt' | 'sldasm';

/** CAD 属性提取状态 */
export type CadExtractStatus = 'pending' | 'success' | 'partial' | 'failed';

/** CAD 属性提取异常类型 */
export type CadExtractErrorType = 'missing' | 'unmapped';

/** CAD 文件格式选项 */
export const CAD_FILE_FORMAT_OPTIONS: { value: CadFileFormat; label: string }[] = [
  { value: 'dwg', label: 'AutoCAD DWG' },
  { value: 'dxf', label: 'AutoCAD DXF' },
  { value: 'sldprt', label: 'SolidWorks 零件' },
  { value: 'sldasm', label: 'SolidWorks 装配' },
];

/** CAD 属性提取状态选项 */
export const CAD_EXTRACT_STATUS_OPTIONS: { value: CadExtractStatus; label: string }[] = [
  { value: 'pending', label: '待提取' },
  { value: 'success', label: '提取成功' },
  { value: 'partial', label: '部分成功' },
  { value: 'failed', label: '提取失败' },
];

/** CAD 文件格式文案映射 */
export const CAD_FILE_FORMAT_TEXT: Record<string, string> = {
  dwg: 'AutoCAD DWG',
  dxf: 'AutoCAD DXF',
  sldprt: 'SolidWorks 零件',
  sldasm: 'SolidWorks 装配',
};

/** CAD 属性提取状态文案映射 */
export const CAD_EXTRACT_STATUS_TEXT: Record<string, string> = {
  pending: '待提取',
  success: '提取成功',
  partial: '部分成功',
  failed: '提取失败',
};

/** CAD 属性提取异常类型文案映射 */
export const CAD_EXTRACT_ERROR_TYPE_TEXT: Record<string, string> = {
  missing: '属性缺失',
  unmapped: '未建立映射',
};

/* ---------------- CAD 文件 ---------------- */

/** CAD 文件列表项 */
export interface CadFileItem {
  id: number;
  cadNo?: string;
  fileName: string;
  filePath?: string;
  fileFormat?: string;
  cadSoftware?: string;
  softwareVersion?: string;
  compatRange?: string;
  fileSize?: number;
  fileHash?: string;
  documentId?: number;
  docNo?: string;
  productCode?: string;
  materialCode?: string;
  extractStatus?: string;
  extractMessage?: string;
  extractedJson?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** CAD 文件分页查询入参 */
export interface CadFileQuery extends PageQuery {
  cadNo?: string;
  fileFormat?: string;
  materialCode?: string;
  productCode?: string;
  extractStatus?: string;
}

/** CAD 文件新增/编辑入参 */
export interface CadFileSaveParams {
  cadNo?: string;
  fileName: string;
  filePath?: string;
  fileFormat?: string;
  cadSoftware?: string;
  softwareVersion?: string;
  compatRange?: string;
  fileSize?: number;
  fileHash?: string;
  documentId?: number;
  docNo?: string;
  productCode?: string;
  materialCode?: string;
  remark?: string;
}

/** CAD 属性提取异常项 */
export interface CadExtractErrorItem {
  id: number;
  cadFileId?: number;
  attrName?: string;
  errorType?: string;
  errorMessage?: string;
  rawValue?: string;
}

/** CAD 属性键值对 */
export interface CadAttrValue {
  name: string;
  value: string;
}

/** CAD 属性提取入参 */
export interface CadExtractParams {
  attributes: CadAttrValue[];
}

/** CAD 属性提取结果 */
export interface CadExtractResult {
  cadFileId?: number;
  extractStatus?: string;
  matched?: Record<string, string>;
  errors?: string[];
  message?: string;
}

/** CAD 文件详情组合 */
export interface CadFileDetail {
  cadFile: CadFileItem;
  errors: CadExtractErrorItem[];
  mappings: CadAttrMappingItem[];
}

/* ---------------- CAD 属性映射 ---------------- */

/** CAD 属性映射项（requiredFlag/status：1 是/启用 0 否/停用） */
export interface CadAttrMappingItem {
  id: number;
  cadAttrName: string;
  cadAttrLabel?: string;
  plmFieldName: string;
  plmFieldLabel?: string;
  targetEntity?: string;
  requiredFlag?: number;
  transformRule?: string;
  defaultValue?: string;
  sortNo?: number;
  status?: number;
  remark?: string;
}

/** CAD 属性映射分页查询入参 */
export interface CadAttrMappingQuery extends PageQuery {
  targetEntity?: string;
  status?: number;
}

/** CAD 属性映射新增/编辑入参 */
export interface CadAttrMappingSaveParams {
  cadAttrName: string;
  cadAttrLabel?: string;
  plmFieldName: string;
  plmFieldLabel?: string;
  targetEntity?: string;
  requiredFlag?: number;
  transformRule?: string;
  defaultValue?: string;
  sortNo?: number;
  status?: number;
  remark?: string;
}
