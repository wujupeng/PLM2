import type { PageQuery } from './common';

/* ================= 通用：枚举常量 ================= */

/** 编码类型 */
export const CODE_TYPE_OPTIONS = [
  { label: '14 位原编码', value: 'CODE14' },
  { label: '24 位追溯码', value: 'CODE24' },
  { label: '28 位旧追溯码', value: 'CODE28' },
];

export const CODE_TYPE_LABEL: Record<string, string> = {
  CODE14: '14 位原编码',
  CODE24: '24 位追溯码',
  CODE28: '28 位旧追溯码',
};

/** 编码规则状态 */
export const CODE_RULE_STATUS_OPTIONS = [
  { label: '草稿', value: 'draft' },
  { label: '已启用', value: 'enabled' },
  { label: '已停用', value: 'disabled' },
];

export const CODE_RULE_STATUS_LABEL: Record<string, string> = {
  draft: '草稿',
  enabled: '已启用',
  disabled: '已停用',
};

export const CODE_RULE_STATUS_COLOR: Record<string, string> = {
  draft: 'default',
  enabled: 'success',
  disabled: 'error',
};

/** 分段取值类型 */
export const SEGMENT_VALUE_TYPE_OPTIONS = [
  { label: '固定值', value: 'FIXED' },
  { label: '业务字段', value: 'FIELD' },
  { label: '日期', value: 'DATE' },
  { label: '码表取值', value: 'DICT' },
  { label: '每日序列', value: 'SEQ' },
];

export const SEGMENT_VALUE_TYPE_LABEL: Record<string, string> = {
  FIXED: '固定值',
  FIELD: '业务字段',
  DATE: '日期',
  DICT: '码表取值',
  SEQ: '每日序列',
};

/** 日期格式 */
export const DATE_PATTERN_OPTIONS = [
  { label: '年份末位（2026→6）', value: 'YEAR_LAST1' },
  { label: '两位年份（2026→26）', value: 'YEAR2' },
  { label: '自然日（三位 001-366）', value: 'DAY_OF_YEAR' },
  { label: '两位月份', value: 'MONTH2' },
  { label: '两位日期', value: 'DAY2' },
  { label: '一位月份码', value: 'MONTH_CODE' },
  { label: '一位日期码', value: 'DAY_CODE' },
];

export const DATE_PATTERN_LABEL: Record<string, string> = {
  YEAR_LAST1: '年份末位',
  YEAR2: '两位年份',
  DAY_OF_YEAR: '自然日',
  MONTH2: '两位月份',
  DAY2: '两位日期',
  MONTH_CODE: '一位月份码',
  DAY_CODE: '一位日期码',
};

/** 补位方式 */
export const FILL_MODE_OPTIONS = [
  { label: '左补位', value: 'LEFT' },
  { label: '右补位', value: 'RIGHT' },
  { label: '不补位', value: 'NONE' },
];

/** 流水号维度 */
export const SEQ_DIMENSION_OPTIONS = [
  { label: '按日', value: 'DAY' },
  { label: '按月', value: 'MONTH' },
  { label: '全局', value: 'GLOBAL' },
  { label: '无流水号', value: 'NONE' },
];

export const SEQ_DIMENSION_LABEL: Record<string, string> = {
  DAY: '按日',
  MONTH: '按月',
  GLOBAL: '全局',
  NONE: '无流水号',
};

/** 标签类型 */
export const LABEL_TYPE_OPTIONS = [
  { label: '24 位追溯标签', value: 'CODE24' },
  { label: '14 位原编码标签', value: 'CODE14' },
  { label: '28 位追溯标签', value: 'CODE28' },
];

export const LABEL_TYPE_LABEL: Record<string, string> = {
  CODE24: '24 位追溯标签',
  CODE14: '14 位原编码标签',
  CODE28: '28 位追溯标签',
};

/** 条码类型 */
export const BARCODE_TYPE_OPTIONS = [
  { label: 'Data Matrix', value: 'DATA_MATRIX' },
  { label: '二维码 QR', value: 'QR' },
  { label: '一维码 Code128', value: 'CODE128' },
];

export const BARCODE_TYPE_LABEL: Record<string, string> = {
  DATA_MATRIX: 'Data Matrix',
  QR: '二维码 QR',
  CODE128: '一维码 Code128',
};

/** 统一码表类型 */
export const CODE_DICT_TYPE_OPTIONS = [
  { label: '制造地（code_plant）', value: 'code_plant' },
  { label: '年份（code_year）', value: 'code_year' },
  { label: '零件类别（code_part_category）', value: 'code_part_category' },
  { label: '厂商（code_vendor）', value: 'code_vendor' },
  { label: '线别（code_line）', value: 'code_line' },
];

/** 标签模板状态 */
export const LABEL_TEMPLATE_STATUS_OPTIONS = [
  { label: '草稿', value: 'draft' },
  { label: '已发布', value: 'released' },
  { label: '已停用', value: 'disabled' },
];

export const LABEL_TEMPLATE_STATUS_LABEL: Record<string, string> = {
  draft: '草稿',
  released: '已发布',
  disabled: '已停用',
};

export const LABEL_TEMPLATE_STATUS_COLOR: Record<string, string> = {
  draft: 'default',
  released: 'success',
  disabled: 'error',
};

/** 扫描动作类型 */
export const SCAN_ACTION_OPTIONS = [
  { label: '首次换标', value: 'NEW' },
  { label: '复用已有映射', value: 'REUSE' },
  { label: '补打标签', value: 'REPRINT' },
  { label: '扫描失败', value: 'FAIL' },
];

export const SCAN_ACTION_LABEL: Record<string, string> = {
  NEW: '首次换标',
  REUSE: '复用已有映射',
  REPRINT: '补打标签',
  FAIL: '扫描失败',
};

export const SCAN_ACTION_COLOR: Record<string, string> = {
  NEW: 'success',
  REUSE: 'processing',
  REPRINT: 'warning',
  FAIL: 'error',
};

/** 打印操作类型 */
export const PRINT_ACTION_LABEL: Record<string, string> = {
  PRINT: '首次打印',
  REPRINT: '补打',
  VOID: '作废',
};

export const PRINT_ACTION_COLOR: Record<string, string> = {
  PRINT: 'success',
  REPRINT: 'warning',
  VOID: 'error',
};

/** 打印状态 */
export const PRINT_STATUS_OPTIONS = [
  { label: '打印成功', value: 'success' },
  { label: '打印失败', value: 'failed' },
  { label: '待打印', value: 'pending' },
];

export const PRINT_STATUS_LABEL: Record<string, string> = {
  success: '打印成功',
  failed: '打印失败',
  pending: '待打印',
};

export const PRINT_STATUS_COLOR: Record<string, string> = {
  success: 'success',
  failed: 'error',
  pending: 'processing',
};

/** 编码映射状态 */
export const CODE_MAPPING_STATUS_OPTIONS = [
  { label: '有效', value: 'active' },
  { label: '已作废', value: 'void' },
];

export const CODE_MAPPING_STATUS_LABEL: Record<string, string> = {
  active: '有效',
  void: '已作废',
};

export const CODE_MAPPING_STATUS_COLOR: Record<string, string> = {
  active: 'success',
  void: 'error',
};

/* ================= 编码规则 ================= */

/** 分段取值明细（生成/解析回显） */
export interface CodeSegmentValue {
  segNo?: number;
  segName?: string;
  segKey?: string;
  startPos?: number;
  endPos?: number;
  segLength?: number;
  valueType?: string;
  value?: string;
  valueName?: string;
  datePattern?: string;
  dictType?: string;
}

/** 编码规则列表项 */
export interface CodeRuleItem {
  id: number;
  ruleCode: string;
  ruleName: string;
  codeType: string;
  ruleVersion?: string;
  customerCode?: string;
  projectCode?: string;
  plantCode?: string;
  totalLength: number;
  seqDimension?: string;
  seqStart?: number;
  seqEnd?: number;
  seqLength?: number;
  isDefault?: number;
  status?: string;
  effectiveDate?: string;
  expireDate?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CodeRuleQuery extends PageQuery {
  codeType?: string;
  status?: string;
  customerCode?: string;
  plantCode?: string;
  isDefault?: number;
}

/** 分段明细（保存与详情共用） */
export interface CodeRuleSegmentItem {
  id?: number;
  ruleId?: number;
  segNo: number;
  segName: string;
  segKey: string;
  startPos: number;
  endPos: number;
  segLength: number;
  valueType?: string;
  fixedValue?: string;
  fieldKey?: string;
  dictType?: string;
  datePattern?: string;
  dayOffset?: number;
  fillChar?: string;
  fillMode?: string;
  sourceRef?: string;
  sortNo?: number;
  status?: number;
  remark?: string;
}

export interface CodeRuleSaveParams {
  ruleCode: string;
  ruleName: string;
  codeType: string;
  ruleVersion?: string;
  customerCode?: string;
  projectCode?: string;
  plantCode?: string;
  totalLength: number;
  seqDimension?: string;
  seqStart?: number;
  seqEnd?: number;
  seqLength?: number;
  isDefault?: number;
  status?: string;
  effectiveDate?: string;
  expireDate?: string;
  description?: string;
  remark?: string;
}

export interface CodeRuleDetail {
  rule: CodeRuleItem;
  segments: CodeRuleSegmentItem[];
}

export interface CodeRulePreviewParams {
  codeType?: string;
  ruleCode?: string;
  totalLength?: number;
  segments?: CodeRuleSegmentItem[];
}

export interface CodeRulePreviewResult {
  totalLength: number;
  valid: boolean;
  message?: string;
  segmentDescriptions?: string[];
}

/* ================= 统一码表 ================= */

export interface CodeDictionaryItem {
  id: number;
  dictType: string;
  dictCode: string;
  dictName: string;
  extValue?: string;
  extText?: string;
  sortNo?: number;
  status?: number;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CodeDictionaryQuery extends PageQuery {
  dictType?: string;
  status?: number;
}

export interface CodeDictionarySaveParams {
  dictType: string;
  dictCode: string;
  dictName: string;
  extValue?: string;
  extText?: string;
  sortNo?: number;
  status?: number;
  remark?: string;
}

/* ================= 编码生成与解析 ================= */

export interface CodeGenerateParams {
  codeType?: string;
  ruleCode?: string;
  customerCode?: string;
  projectCode?: string;
  plantCode?: string;
  generateDate?: string;
  qty?: number;
  fieldValues?: Record<string, string>;
  remark?: string;
}

export interface CodeGenerateResult {
  code: string;
  codeType?: string;
  ruleId?: number;
  ruleCode?: string;
  generateDate?: string;
  sequenceValue?: number;
  sequenceCode?: string;
  sequenceWarn?: boolean;
  sequenceMessage?: string;
  segments?: CodeSegmentValue[];
  warnings?: string[];
  codes?: string[];
}

export interface CodeParseParams {
  code: string;
  codeType?: string;
}

export interface CodeParseResult {
  code?: string;
  codeType?: string;
  codeLength?: number;
  validFlag?: boolean;
  failReason?: string;
  ruleId?: number;
  ruleCode?: string;
  parsedDate?: string;
  sequenceValue?: number;
  segments?: CodeSegmentValue[];
  fieldValues?: Record<string, string>;
  warnings?: string[];
}

/* ================= 编码映射 ================= */

export interface CodeMappingItem {
  id: number;
  sourceCode: string;
  sourceCodeType?: string;
  sourceRuleCode?: string;
  targetCode: string;
  targetCodeType?: string;
  ruleId?: number;
  ruleCode?: string;
  productCode?: string;
  materialCode?: string;
  batchNo?: string;
  qty?: number;
  plantCode?: string;
  customerCode?: string;
  versionNo?: string;
  status?: string;
  scanCount?: number;
  firstScanAt?: string;
  lastScanAt?: string;
  operatorId?: number;
  operatorName?: string;
  printTaskNo?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CodeMappingQuery extends PageQuery {
  sourceCode?: string;
  targetCode?: string;
  sourceCodeType?: string;
  status?: string;
  productCode?: string;
  materialCode?: string;
  plantCode?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface CodeMappingDetail {
  mapping: CodeMappingItem;
  logs: ScanLogItem[];
}

export interface CodeVoidParams {
  reason?: string;
}

/* ================= 扫描日志与换标 ================= */

export interface ScanLogItem {
  id: number;
  scanNo: string;
  sourceCode?: string;
  sourceType?: string;
  parseJson?: string;
  validFlag?: number;
  failReason?: string;
  targetCode?: string;
  mappingId?: number;
  actionType?: string;
  reprintFlag?: number;
  ruleCode?: string;
  terminalNo?: string;
  operatorId?: number;
  operatorName?: string;
  scanAt?: string;
  remark?: string;
  createdAt?: string;
}

export interface ScanLogQuery extends PageQuery {
  scanNo?: string;
  sourceCode?: string;
  targetCode?: string;
  actionType?: string;
  validFlag?: number;
  terminalNo?: string;
  ruleCode?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface RelabelScanParams {
  sourceCode: string;
  codeType?: string;
  plantCode?: string;
  terminalNo?: string;
  customerCode?: string;
  projectCode?: string;
  productCode?: string;
  materialCode?: string;
  batchNo?: string;
  qty?: number;
  reprint?: boolean;
  fieldValues?: Record<string, string>;
  remark?: string;
}

export interface RelabelBatchParams {
  sourceCodes: string[];
  codeType?: string;
  plantCode?: string;
  terminalNo?: string;
  fieldValues?: Record<string, string>;
}

export interface RelabelScanResult {
  scanLogId?: number;
  scanNo?: string;
  actionType?: string;
  validFlag?: boolean;
  failReason?: string;
  sourceCode?: string;
  sourceType?: string;
  targetCode?: string;
  mappingId?: number;
  printTaskNo?: string;
  segments?: CodeSegmentValue[];
  warnings?: string[];
  sequenceValue?: number;
  sequenceWarn?: boolean;
  sequenceMessage?: string;
  existing?: boolean;
}

/* ================= 标签模板 ================= */

export interface LabelTemplateItem {
  id: number;
  templateCode: string;
  templateName: string;
  templateVersion?: string;
  labelType: string;
  paperWidth?: number;
  paperHeight?: number;
  unit?: string;
  dpi?: number;
  barcodeType?: string;
  dmSymbolSize?: string;
  dmEccLevel?: string;
  moduleSize?: number;
  elementJson?: string;
  layoutJson?: string;
  status?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LabelTemplateQuery extends PageQuery {
  templateCode?: string;
  templateName?: string;
  labelType?: string;
  status?: string;
}

export interface LabelTemplateSaveParams {
  templateCode: string;
  templateName: string;
  templateVersion?: string;
  labelType: string;
  paperWidth?: number;
  paperHeight?: number;
  unit?: string;
  dpi?: number;
  barcodeType?: string;
  dmSymbolSize?: string;
  dmEccLevel?: string;
  moduleSize?: number;
  elementJson?: string;
  layoutJson?: string;
  status?: string;
  remark?: string;
}

export interface LabelRenderElement {
  key?: string;
  label?: string;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  fontSize?: number;
  align?: string;
  value?: string;
}

export interface LabelRenderParams {
  templateCode?: string;
  labelType?: string;
  barcodeContent?: string;
  fieldValues?: Record<string, string>;
  sizePx?: number;
}

export interface LabelRenderResult {
  templateCode?: string;
  templateName?: string;
  labelType?: string;
  paperWidth?: number;
  paperHeight?: number;
  unit?: string;
  dpi?: number;
  barcodeType?: string;
  moduleSize?: number;
  barcodeContent?: string;
  barcodeBase64?: string;
  items?: LabelRenderElement[];
  warnings?: string[];
}

/* ================= 标签打印 ================= */

export interface LabelPrintTaskItem {
  id: number;
  taskNo: string;
  templateId?: number;
  templateCode?: string;
  labelType?: string;
  sourceCode?: string;
  targetCode?: string;
  productCode?: string;
  materialCode?: string;
  qty?: number;
  printedQty?: number;
  reprintFlag?: number;
  reprintReason?: string;
  originTaskNo?: string;
  printerName?: string;
  printStatus?: string;
  printAt?: string;
  contentText?: string;
  scanLogId?: number;
  operatorId?: number;
  operatorName?: string;
  remark?: string;
  createdAt?: string;
}

export interface LabelPrintQuery extends PageQuery {
  taskNo?: string;
  targetCode?: string;
  sourceCode?: string;
  productCode?: string;
  templateCode?: string;
  printStatus?: string;
  reprintFlag?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface LabelPrintParams {
  targetCode: string;
  templateCode?: string;
  labelType?: string;
  sourceCode?: string;
  productCode?: string;
  materialCode?: string;
  qty?: number;
  printerName?: string;
  scanLogId?: number;
  fieldValues?: Record<string, string>;
  remark?: string;
}

export interface LabelReprintParams {
  reason: string;
  qty?: number;
  printerName?: string;
}

export interface LabelPrintLogItem {
  id: number;
  taskId?: number;
  taskNo?: string;
  actionType?: string;
  targetCode?: string;
  templateCode?: string;
  printerName?: string;
  result?: string;
  message?: string;
  printAt?: string;
  operatorId?: number;
  operatorName?: string;
  remark?: string;
}

export interface LabelPrintLogQuery extends PageQuery {
  taskNo?: string;
  targetCode?: string;
  actionType?: string;
  result?: string;
  dateFrom?: string;
  dateTo?: string;
}
