import type { PageQuery } from './common';

/* ================= 通用：枚举常量（与后端 sys_dictionary 对齐） ================= */

/** 通用启用/停用 */
export const INT_ENABLED_OPTIONS = [
  { label: '启用', value: 1 },
  { label: '停用', value: 0 },
];

export const INT_ENABLED_LABEL: Record<string, string> = {
  '1': '是',
  '0': '否',
};

export const INT_ENABLED_COLOR: Record<string, string> = {
  '1': 'success',
  '0': 'default',
};

/** 所属域 */
export const INT_DOMAIN_OPTIONS = [
  { label: 'PLM', value: 'PLM' },
  { label: 'ERP', value: 'ERP' },
  { label: 'MES', value: 'MES' },
  { label: 'QMS', value: 'QMS' },
  { label: 'EDI', value: 'EDI' },
];

export const INT_DOMAIN_LABEL: Record<string, string> = {
  PLM: 'PLM',
  ERP: 'ERP',
  MES: 'MES',
  QMS: 'QMS',
  EDI: 'EDI',
};

/** 接口方向 */
export const INT_DIRECTION_OPTIONS = [
  { label: '入站', value: 'INBOUND' },
  { label: '出站', value: 'OUTBOUND' },
];

export const INT_DIRECTION_LABEL: Record<string, string> = {
  INBOUND: '入站',
  OUTBOUND: '出站',
};

/** 协议 */
export const INT_PROTOCOL_OPTIONS = [
  { label: 'REST', value: 'REST' },
  { label: 'SOAP', value: 'SOAP' },
  { label: '文件', value: 'FILE' },
  { label: '消息队列', value: 'MQ' },
];

export const INT_PROTOCOL_LABEL: Record<string, string> = {
  REST: 'REST',
  SOAP: 'SOAP',
  FILE: '文件',
  MQ: '消息队列',
};

/** 接口状态 */
export const INT_ENDPOINT_STATUS_OPTIONS = [
  { label: '启用', value: 'enabled' },
  { label: '停用', value: 'disabled' },
];

export const INT_ENDPOINT_STATUS_LABEL: Record<string, string> = {
  enabled: '启用',
  disabled: '停用',
};

export const INT_ENDPOINT_STATUS_COLOR: Record<string, string> = {
  enabled: 'success',
  disabled: 'default',
};

/** 接口调用结果状态 */
export const INT_RESULT_STATUS_OPTIONS = [
  { label: '成功', value: 'SUCCESS' },
  { label: '失败', value: 'FAILED' },
  { label: '重试中', value: 'RETRYING' },
  { label: '已补偿', value: 'COMPENSATED' },
];

export const INT_RESULT_STATUS_LABEL: Record<string, string> = {
  SUCCESS: '成功',
  FAILED: '失败',
  RETRYING: '重试中',
  COMPENSATED: '已补偿',
};

export const INT_RESULT_STATUS_COLOR: Record<string, string> = {
  SUCCESS: 'success',
  FAILED: 'error',
  RETRYING: 'processing',
  COMPENSATED: 'warning',
};

/** 主数据类型 */
export const INT_MASTER_TYPE_OPTIONS = [
  { label: '物料', value: 'MATERIAL' },
  { label: 'BOM', value: 'BOM' },
  { label: '供应商', value: 'SUPPLIER' },
  { label: '产品', value: 'PRODUCT' },
  { label: '工艺', value: 'PROCESS' },
];

export const INT_MASTER_TYPE_LABEL: Record<string, string> = {
  MATERIAL: '物料',
  BOM: 'BOM',
  SUPPLIER: '供应商',
  PRODUCT: '产品',
  PROCESS: '工艺',
};

/** 同步方向 */
export const INT_SYNC_DIRECTION_OPTIONS = [
  { label: 'PLM→ERP', value: 'PLM_TO_ERP' },
  { label: 'ERP→PLM', value: 'ERP_TO_PLM' },
  { label: 'PLM→MES', value: 'PLM_TO_MES' },
  { label: 'MES→PLM', value: 'MES_TO_PLM' },
];

export const INT_SYNC_DIRECTION_LABEL: Record<string, string> = {
  PLM_TO_ERP: 'PLM→ERP',
  ERP_TO_PLM: 'ERP→PLM',
  PLM_TO_MES: 'PLM→MES',
  MES_TO_PLM: 'MES→PLM',
};

/** 同步状态 */
export const INT_SYNC_STATUS_OPTIONS = [
  { label: '待同步', value: 'PENDING' },
  { label: '已同步', value: 'SYNCED' },
  { label: '同步失败', value: 'FAILED' },
  { label: '存在差异', value: 'DIFF' },
];

export const INT_SYNC_STATUS_LABEL: Record<string, string> = {
  PENDING: '待同步',
  SYNCED: '已同步',
  FAILED: '同步失败',
  DIFF: '存在差异',
};

export const INT_SYNC_STATUS_COLOR: Record<string, string> = {
  PENDING: 'default',
  SYNCED: 'success',
  FAILED: 'error',
  DIFF: 'warning',
};

/** 差异类型 */
export const INT_DIFF_TYPE_OPTIONS = [
  { label: '取值不一致', value: 'VALUE_DIFF' },
  { label: '目标端缺失', value: 'MISSING_IN_TARGET' },
  { label: '源端缺失', value: 'MISSING_IN_SOURCE' },
];

export const INT_DIFF_TYPE_LABEL: Record<string, string> = {
  VALUE_DIFF: '取值不一致',
  MISSING_IN_TARGET: '目标端缺失',
  MISSING_IN_SOURCE: '源端缺失',
};

/** 处理状态 */
export const INT_HANDLE_STATUS_OPTIONS = [
  { label: '待处理', value: 'OPEN' },
  { label: '已处理', value: 'RESOLVED' },
  { label: '已忽略', value: 'IGNORED' },
];

export const INT_HANDLE_STATUS_LABEL: Record<string, string> = {
  OPEN: '待处理',
  RESOLVED: '已处理',
  IGNORED: '已忽略',
};

export const INT_HANDLE_STATUS_COLOR: Record<string, string> = {
  OPEN: 'warning',
  RESOLVED: 'success',
  IGNORED: 'default',
};

/** QMS 记录类型 */
export const INT_QMS_RECORD_TYPE_OPTIONS = [
  { label: '来料检验', value: 'INCOMING' },
  { label: '过程检验', value: 'IN_PROCESS' },
  { label: '成品检验', value: 'FINAL' },
  { label: '客户投诉', value: 'COMPLAINT' },
  { label: '供应商质量', value: 'SUPPLIER' },
];

export const INT_QMS_RECORD_TYPE_LABEL: Record<string, string> = {
  INCOMING: '来料检验',
  IN_PROCESS: '过程检验',
  FINAL: '成品检验',
  COMPLAINT: '客户投诉',
  SUPPLIER: '供应商质量',
};

/** 检验结果 */
export const INT_INSPECTION_RESULT_OPTIONS = [
  { label: '合格', value: 'PASS' },
  { label: '不合格', value: 'FAIL' },
  { label: '让步接收', value: 'CONCESSION' },
];

export const INT_INSPECTION_RESULT_LABEL: Record<string, string> = {
  PASS: '合格',
  FAIL: '不合格',
  CONCESSION: '让步接收',
};

export const INT_INSPECTION_RESULT_COLOR: Record<string, string> = {
  PASS: 'success',
  FAIL: 'error',
  CONCESSION: 'warning',
};

/** 缺陷等级 */
export const INT_DEFECT_LEVEL_OPTIONS = [
  { label: '致命', value: 'CRITICAL' },
  { label: '严重', value: 'MAJOR' },
  { label: '轻微', value: 'MINOR' },
];

export const INT_DEFECT_LEVEL_LABEL: Record<string, string> = {
  CRITICAL: '致命',
  MAJOR: '严重',
  MINOR: '轻微',
};

export const INT_DEFECT_LEVEL_COLOR: Record<string, string> = {
  CRITICAL: 'error',
  MAJOR: 'warning',
  MINOR: 'default',
};

/** 接口状态（QMS 记录） */
export const INT_INTERFACE_STATUS_OPTIONS = [
  { label: '已接收', value: 'RECEIVED' },
  { label: '已处理', value: 'PROCESSED' },
  { label: '处理失败', value: 'FAILED' },
];

export const INT_INTERFACE_STATUS_LABEL: Record<string, string> = {
  RECEIVED: '已接收',
  PROCESSED: '已处理',
  FAILED: '处理失败',
};

export const INT_INTERFACE_STATUS_COLOR: Record<string, string> = {
  RECEIVED: 'processing',
  PROCESSED: 'success',
  FAILED: 'error',
};

/** 迁移范围 */
export const INT_MIGRATION_SCOPE_OPTIONS = [
  { label: '物料', value: 'MATERIAL' },
  { label: 'BOM', value: 'BOM' },
  { label: '供应商', value: 'SUPPLIER' },
  { label: '产品', value: 'PRODUCT' },
  { label: '图文档', value: 'DOCUMENT' },
  { label: '追溯数据', value: 'TRACE' },
];

export const INT_MIGRATION_SCOPE_LABEL: Record<string, string> = {
  MATERIAL: '物料',
  BOM: 'BOM',
  SUPPLIER: '供应商',
  PRODUCT: '产品',
  DOCUMENT: '图文档',
  TRACE: '追溯数据',
};

/** 迁移任务状态 */
export const INT_MIGRATION_STATUS_OPTIONS = [
  { label: '待执行', value: 'PENDING' },
  { label: '执行中', value: 'RUNNING' },
  { label: '成功', value: 'SUCCESS' },
  { label: '失败', value: 'FAILED' },
  { label: '部分成功', value: 'PARTIAL' },
];

export const INT_MIGRATION_STATUS_LABEL: Record<string, string> = {
  PENDING: '待执行',
  RUNNING: '执行中',
  SUCCESS: '成功',
  FAILED: '失败',
  PARTIAL: '部分成功',
};

export const INT_MIGRATION_STATUS_COLOR: Record<string, string> = {
  PENDING: 'default',
  RUNNING: 'processing',
  SUCCESS: 'success',
  FAILED: 'error',
  PARTIAL: 'warning',
};

/** 迁移异常类型 */
export const INT_EXCEPTION_TYPE_OPTIONS = [
  { label: '字段非法', value: 'FIELD_INVALID' },
  { label: '重复数据', value: 'DUPLICATE' },
  { label: '引用缺失', value: 'MISSING_REF' },
  { label: '格式错误', value: 'FORMAT_ERROR' },
];

export const INT_EXCEPTION_TYPE_LABEL: Record<string, string> = {
  FIELD_INVALID: '字段非法',
  DUPLICATE: '重复数据',
  MISSING_REF: '引用缺失',
  FORMAT_ERROR: '格式错误',
};

/** 导出范围 */
export const INT_EXPORT_SCOPE_OPTIONS = [
  { label: '主数据', value: 'MASTER_DATA' },
  { label: 'BOM', value: 'BOM' },
  { label: '追溯数据', value: 'TRACE' },
  { label: '附件索引', value: 'ATTACHMENT' },
  { label: '全量', value: 'ALL' },
];

export const INT_EXPORT_SCOPE_LABEL: Record<string, string> = {
  MASTER_DATA: '主数据',
  BOM: 'BOM',
  TRACE: '追溯数据',
  ATTACHMENT: '附件索引',
  ALL: '全量',
};

/** 导出格式 */
export const INT_EXPORT_FORMAT_OPTIONS = [
  { label: 'CSV', value: 'CSV' },
  { label: 'Excel', value: 'EXCEL' },
  { label: 'JSON', value: 'JSON' },
];

export const INT_EXPORT_FORMAT_LABEL: Record<string, string> = {
  CSV: 'CSV',
  EXCEL: 'Excel',
  JSON: 'JSON',
};

/** 任务状态（导出任务） */
export const INT_TASK_STATUS_OPTIONS = [
  { label: '待执行', value: 'PENDING' },
  { label: '执行中', value: 'RUNNING' },
  { label: '成功', value: 'SUCCESS' },
  { label: '失败', value: 'FAILED' },
  { label: '已取消', value: 'CANCELLED' },
];

export const INT_TASK_STATUS_LABEL: Record<string, string> = {
  PENDING: '待执行',
  RUNNING: '执行中',
  SUCCESS: '成功',
  FAILED: '失败',
  CANCELLED: '已取消',
};

export const INT_TASK_STATUS_COLOR: Record<string, string> = {
  PENDING: 'default',
  RUNNING: 'processing',
  SUCCESS: 'success',
  FAILED: 'error',
  CANCELLED: 'default',
};

/** 测试用例类型 */
export const INT_CASE_TYPE_OPTIONS = [
  { label: '功能测试', value: 'FUNCTION' },
  { label: '集成测试', value: 'INTEGRATION' },
  { label: '性能测试', value: 'PERFORMANCE' },
  { label: '安全测试', value: 'SECURITY' },
  { label: 'UAT 验收', value: 'UAT' },
];

export const INT_CASE_TYPE_LABEL: Record<string, string> = {
  FUNCTION: '功能测试',
  INTEGRATION: '集成测试',
  PERFORMANCE: '性能测试',
  SECURITY: '安全测试',
  UAT: 'UAT 验收',
};

/** 优先级 */
export const INT_PRIORITY_OPTIONS = [
  { label: 'P0', value: 'P0' },
  { label: 'P1', value: 'P1' },
  { label: 'P2', value: 'P2' },
];

export const INT_PRIORITY_LABEL: Record<string, string> = {
  P0: 'P0',
  P1: 'P1',
  P2: 'P2',
};

export const INT_PRIORITY_COLOR: Record<string, string> = {
  P0: 'error',
  P1: 'warning',
  P2: 'default',
};

/** 执行状态 */
export const INT_RUN_STATUS_OPTIONS = [
  { label: '未执行', value: 'NOT_RUN' },
  { label: '通过', value: 'PASS' },
  { label: '失败', value: 'FAIL' },
  { label: '阻塞', value: 'BLOCKED' },
];

export const INT_RUN_STATUS_LABEL: Record<string, string> = {
  NOT_RUN: '未执行',
  PASS: '通过',
  FAIL: '失败',
  BLOCKED: '阻塞',
};

export const INT_RUN_STATUS_COLOR: Record<string, string> = {
  NOT_RUN: 'default',
  PASS: 'success',
  FAIL: 'error',
  BLOCKED: 'warning',
};

/** 性能场景 */
export const INT_PERF_SCENARIO_OPTIONS = [
  { label: 'BOM 展开', value: 'BOM_EXPLODE' },
  { label: '批量导入', value: 'BATCH_IMPORT' },
  { label: '扫码并发', value: 'SCAN_CONCURRENT' },
  { label: 'EDI 峰值', value: 'EDI_PEAK' },
  { label: '追溯查询', value: 'TRACE_QUERY' },
];

export const INT_PERF_SCENARIO_LABEL: Record<string, string> = {
  BOM_EXPLODE: 'BOM 展开',
  BATCH_IMPORT: '批量导入',
  SCAN_CONCURRENT: '扫码并发',
  EDI_PEAK: 'EDI 峰值',
  TRACE_QUERY: '追溯查询',
};

/** 性能结果 */
export const INT_PERF_RESULT_OPTIONS = [
  { label: '达标', value: 'PASS' },
  { label: '未达标', value: 'FAIL' },
];

export const INT_PERF_RESULT_LABEL: Record<string, string> = {
  PASS: '达标',
  FAIL: '未达标',
};

export const INT_PERF_RESULT_COLOR: Record<string, string> = {
  PASS: 'success',
  FAIL: 'error',
};

/** 严重程度（安全问题） */
export const INT_SEVERITY_OPTIONS = [
  { label: '高危', value: 'CRITICAL' },
  { label: '高', value: 'HIGH' },
  { label: '中', value: 'MEDIUM' },
  { label: '低', value: 'LOW' },
];

export const INT_SEVERITY_LABEL: Record<string, string> = {
  CRITICAL: '高危',
  HIGH: '高',
  MEDIUM: '中',
  LOW: '低',
};

export const INT_SEVERITY_COLOR: Record<string, string> = {
  CRITICAL: 'error',
  HIGH: 'volcano',
  MEDIUM: 'warning',
  LOW: 'default',
};

/** 安全问题类别 */
export const INT_SECURITY_CATEGORY_OPTIONS = [
  { label: '认证授权', value: 'AUTH' },
  { label: '注入攻击', value: 'INJECTION' },
  { label: '敏感数据', value: 'SENSITIVE_DATA' },
  { label: '越权访问', value: 'PERMISSION' },
  { label: '配置安全', value: 'CONFIG' },
];

export const INT_SECURITY_CATEGORY_LABEL: Record<string, string> = {
  AUTH: '认证授权',
  INJECTION: '注入攻击',
  SENSITIVE_DATA: '敏感数据',
  PERMISSION: '越权访问',
  CONFIG: '配置安全',
};

/** 安全问题状态 */
export const INT_ISSUE_STATUS_OPTIONS = [
  { label: '待处理', value: 'OPEN' },
  { label: '整改中', value: 'FIXING' },
  { label: '已整改', value: 'FIXED' },
  { label: '已验证', value: 'VERIFIED' },
  { label: '已关闭', value: 'CLOSED' },
];

export const INT_ISSUE_STATUS_LABEL: Record<string, string> = {
  OPEN: '待处理',
  FIXING: '整改中',
  FIXED: '已整改',
  VERIFIED: '已验证',
  CLOSED: '已关闭',
};

export const INT_ISSUE_STATUS_COLOR: Record<string, string> = {
  OPEN: 'error',
  FIXING: 'processing',
  FIXED: 'warning',
  VERIFIED: 'success',
  CLOSED: 'default',
};

/** 备份记录类型 */
export const INT_BACKUP_TYPE_OPTIONS = [
  { label: '备份', value: 'BACKUP' },
  { label: '恢复', value: 'RESTORE' },
  { label: '演练', value: 'DRILL' },
];

export const INT_BACKUP_TYPE_LABEL: Record<string, string> = {
  BACKUP: '备份',
  RESTORE: '恢复',
  DRILL: '演练',
};

/** 备份范围 */
export const INT_BACKUP_SCOPE_OPTIONS = [
  { label: '数据库', value: 'DB' },
  { label: '文件', value: 'FILE' },
  { label: '全量', value: 'FULL' },
];

export const INT_BACKUP_SCOPE_LABEL: Record<string, string> = {
  DB: '数据库',
  FILE: '文件',
  FULL: '全量',
};

/** 结果状态（备份） */
export const INT_RESULT_OPTIONS = [
  { label: '成功', value: 'SUCCESS' },
  { label: '失败', value: 'FAILED' },
];

export const INT_RESULT_LABEL: Record<string, string> = {
  SUCCESS: '成功',
  FAILED: '失败',
};

export const INT_RESULT_COLOR: Record<string, string> = {
  SUCCESS: 'success',
  FAILED: 'error',
};

/** 切换状态 */
export const INT_CUTOVER_STATUS_OPTIONS = [
  { label: '已计划', value: 'PLANNED' },
  { label: '切换中', value: 'RUNNING' },
  { label: '切换成功', value: 'SUCCESS' },
  { label: '已回退', value: 'ROLLED_BACK' },
];

export const INT_CUTOVER_STATUS_LABEL: Record<string, string> = {
  PLANNED: '已计划',
  RUNNING: '切换中',
  SUCCESS: '切换成功',
  ROLLED_BACK: '已回退',
};

export const INT_CUTOVER_STATUS_COLOR: Record<string, string> = {
  PLANNED: 'default',
  RUNNING: 'processing',
  SUCCESS: 'success',
  ROLLED_BACK: 'error',
};

/** 交付物类别 */
export const INT_DELIVERY_CATEGORY_OPTIONS = [
  { label: '源代码', value: 'SOURCE_CODE' },
  { label: '技术文档', value: 'DOC' },
  { label: '部署脚本', value: 'SCRIPT' },
  { label: '配置清单', value: 'CONFIG' },
];

export const INT_DELIVERY_CATEGORY_LABEL: Record<string, string> = {
  SOURCE_CODE: '源代码',
  DOC: '技术文档',
  SCRIPT: '部署脚本',
  CONFIG: '配置清单',
};

/** 交付物状态 */
export const INT_DELIVERY_STATUS_OPTIONS = [
  { label: '待交付', value: 'PENDING' },
  { label: '已交付', value: 'DELIVERED' },
  { label: '已验收', value: 'ACCEPTED' },
];

export const INT_DELIVERY_STATUS_LABEL: Record<string, string> = {
  PENDING: '待交付',
  DELIVERED: '已交付',
  ACCEPTED: '已验收',
};

export const INT_DELIVERY_STATUS_COLOR: Record<string, string> = {
  PENDING: 'default',
  DELIVERED: 'processing',
  ACCEPTED: 'success',
};

/** 缺陷来源 */
export const INT_DEFECT_SOURCE_OPTIONS = [
  { label: 'UAT', value: 'UAT' },
  { label: '生产', value: 'PRODUCTION' },
  { label: '测试', value: 'TEST' },
  { label: '安全', value: 'SECURITY' },
];

export const INT_DEFECT_SOURCE_LABEL: Record<string, string> = {
  UAT: 'UAT',
  PRODUCTION: '生产',
  TEST: '测试',
  SECURITY: '安全',
};

/** 缺陷状态 */
export const INT_DEFECT_STATUS_OPTIONS = [
  { label: '待处理', value: 'OPEN' },
  { label: '已分派', value: 'ASSIGNED' },
  { label: '处理中', value: 'FIXING' },
  { label: '已修复', value: 'FIXED' },
  { label: '已验证', value: 'VERIFIED' },
  { label: '已关闭', value: 'CLOSED' },
];

export const INT_DEFECT_STATUS_LABEL: Record<string, string> = {
  OPEN: '待处理',
  ASSIGNED: '已分派',
  FIXING: '处理中',
  FIXED: '已修复',
  VERIFIED: '已验证',
  CLOSED: '已关闭',
};

export const INT_DEFECT_STATUS_COLOR: Record<string, string> = {
  OPEN: 'error',
  ASSIGNED: 'warning',
  FIXING: 'processing',
  FIXED: 'cyan',
  VERIFIED: 'success',
  CLOSED: 'default',
};

/* ================= 实体类型 ================= */

/** 基础字段（与后端 BaseEntity 对齐） */
export interface IntBaseModel {
  id?: number;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
  deleted?: number;
  version?: number;
}

/** 接口配置 */
export interface IntEndpointItem extends IntBaseModel {
  endpointCode: string;
  endpointName?: string;
  domain?: string;
  direction?: string;
  protocol?: string;
  endpointUrl?: string;
  authType?: string;
  timeoutMs?: number;
  retryMax?: number;
  idempotentEnabled?: number;
  compensateEnabled?: number;
  status?: string;
  remark?: string;
}

/** 接口调用日志 */
export interface IntInterfaceLogItem extends IntBaseModel {
  logNo: string;
  endpointCode?: string;
  interfaceCode?: string;
  direction?: string;
  bizKey?: string;
  idempotentKey?: string;
  requestBody?: string;
  requestHash?: string;
  responseBody?: string;
  httpStatus?: number;
  resultStatus?: string;
  retryCount?: number;
  retryMax?: number;
  nextRetryAt?: string;
  compensated?: number;
  errorMessage?: string;
  sourceSystem?: string;
  targetSystem?: string;
  costMs?: number;
  operator?: string;
  remark?: string;
}

/** 主数据同步 */
export interface IntMasterDataSyncItem extends IntBaseModel {
  syncNo: string;
  masterType?: string;
  masterCode?: string;
  masterName?: string;
  masterVersion?: string;
  sourceSystem?: string;
  targetSystem?: string;
  syncDirection?: string;
  syncStatus?: string;
  sourceVersion?: string;
  targetVersion?: string;
  sourceHash?: string;
  targetHash?: string;
  diffFlag?: number;
  lastSyncAt?: string;
  retryCount?: number;
  remark?: string;
}

/** 主数据差异 */
export interface IntMasterDataDiffItem extends IntBaseModel {
  syncNo?: string;
  masterType?: string;
  masterCode?: string;
  fieldName?: string;
  sourceValue?: string;
  targetValue?: string;
  diffType?: string;
  handleStatus?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  resolution?: string;
  remark?: string;
}

/** QMS 质量记录 */
export interface IntQmsRecordItem extends IntBaseModel {
  recordNo: string;
  recordType?: string;
  sourceNo?: string;
  productCode?: string;
  materialCode?: string;
  batchNo?: string;
  productVersion?: string;
  inspectionItem?: string;
  result?: string;
  defectCode?: string;
  defectLevel?: string;
  disposition?: string;
  occurredAt?: string;
  sourceSystem?: string;
  relatedProductCode?: string;
  attachmentUrl?: string;
  interfaceStatus?: string;
  remark?: string;
}

/** 迁移任务 */
export interface IntMigrationTaskItem extends IntBaseModel {
  taskNo: string;
  scope?: string;
  sourceSystem?: string;
  targetTable?: string;
  sourceCount?: number;
  successCount?: number;
  failCount?: number;
  skipCount?: number;
  taskStatus?: string;
  startedAt?: string;
  finishedAt?: string;
  reportPath?: string;
  operator?: string;
  remark?: string;
}

/** 迁移异常 */
export interface IntMigrationExceptionItem extends IntBaseModel {
  taskNo?: string;
  sourceKey?: string;
  exceptionType?: string;
  fieldName?: string;
  reason?: string;
  rawData?: string;
  handleStatus?: string;
  handler?: string;
  handledAt?: string;
  remark?: string;
}

/** 导出任务 */
export interface IntExportTaskItem extends IntBaseModel {
  taskNo: string;
  scope?: string;
  exportFormat?: string;
  includeAttachment?: number;
  recordCount?: number;
  filePath?: string;
  fileSize?: number;
  taskStatus?: string;
  requestedBy?: string;
  startedAt?: string;
  finishedAt?: string;
  errorMessage?: string;
  remark?: string;
}

/** 测试用例 */
export interface IntTestCaseItem extends IntBaseModel {
  caseNo: string;
  caseType?: string;
  relatedNode?: string;
  title?: string;
  precondition?: string;
  steps?: string;
  expected?: string;
  priority?: string;
  runStatus?: string;
  runResult?: string;
  runAt?: string;
  runner?: string;
  defectNo?: string;
  remark?: string;
}

/** 性能测试 */
export interface IntPerfTestItem extends IntBaseModel {
  testNo: string;
  scenario?: string;
  targetRps?: number;
  targetP95Ms?: number;
  actualRps?: number;
  actualP95Ms?: number;
  concurrency?: number;
  durationSec?: number;
  result?: string;
  testAt?: string;
  reportPath?: string;
  remark?: string;
}

/** 安全问题 */
export interface IntSecurityIssueItem extends IntBaseModel {
  issueNo: string;
  category?: string;
  severity?: string;
  title?: string;
  detail?: string;
  discoveredBy?: string;
  discoveredAt?: string;
  status?: string;
  fixPlan?: string;
  fixedAt?: string;
  verifier?: string;
  verifiedAt?: string;
  remark?: string;
}

/** 备份恢复记录 */
export interface IntBackupRecordItem extends IntBaseModel {
  recordNo: string;
  recordType?: string;
  scope?: string;
  backupAt?: string;
  sizeMb?: number;
  targetPath?: string;
  rpoMinutes?: number;
  rtoMinutes?: number;
  elapsedMinutes?: number;
  resultStatus?: string;
  verified?: number;
  operator?: string;
  remark?: string;
}

/** 培训记录 */
export interface IntTrainingRecordItem extends IntBaseModel {
  trainingNo: string;
  roleCode?: string;
  title?: string;
  trainer?: string;
  traineeCount?: number;
  passedCount?: number;
  trainedAt?: string;
  materialUrl?: string;
  passRate?: number;
  remark?: string;
}

/** 上线切换记录 */
export interface IntGoliveRecordItem extends IntBaseModel {
  goliveNo: string;
  planName?: string;
  scope?: string;
  plannedAt?: string;
  actualAt?: string;
  cutoverStatus?: string;
  rollbackPlan?: string;
  rollbackAt?: string;
  owner?: string;
  remark?: string;
}

/** 交付物 */
export interface IntDeliveryItemModel extends IntBaseModel {
  itemNo: string;
  category?: string;
  name?: string;
  itemVersion?: string;
  filePath?: string;
  checksum?: string;
  deliveredAt?: string;
  status?: string;
  verifier?: string;
  remark?: string;
}

/** 缺陷 */
export interface IntDefectItem extends IntBaseModel {
  defectNo: string;
  source?: string;
  severity?: string;
  title?: string;
  detail?: string;
  module?: string;
  foundAt?: string;
  slaResponseHours?: number;
  slaFixHours?: number;
  responseAt?: string;
  fixedAt?: string;
  verifiedAt?: string;
  status?: string;
  escalationLevel?: number;
  assignee?: string;
  slaBreached?: number;
  remark?: string;
}

/* ================= 查询条件 ================= */

export interface IntEndpointQuery extends PageQuery {
  endpointCode?: string;
  domain?: string;
  direction?: string;
  protocol?: string;
  status?: string;
}

export interface IntInterfaceLogQuery extends PageQuery {
  logNo?: string;
  endpointCode?: string;
  interfaceCode?: string;
  bizKey?: string;
  resultStatus?: string;
  direction?: string;
}

export interface IntMasterDataSyncQuery extends PageQuery {
  syncNo?: string;
  masterType?: string;
  masterCode?: string;
  syncStatus?: string;
  syncDirection?: string;
  targetSystem?: string;
}

export interface IntMasterDataDiffQuery extends PageQuery {
  syncNo?: string;
  masterType?: string;
  masterCode?: string;
  diffType?: string;
  handleStatus?: string;
}

export interface IntQmsRecordQuery extends PageQuery {
  recordNo?: string;
  recordType?: string;
  productCode?: string;
  materialCode?: string;
  batchNo?: string;
  result?: string;
  defectLevel?: string;
  interfaceStatus?: string;
  sourceSystem?: string;
}

export interface IntMigrationTaskQuery extends PageQuery {
  taskNo?: string;
  scope?: string;
  sourceSystem?: string;
  targetTable?: string;
  taskStatus?: string;
}

export interface IntMigrationExceptionQuery extends PageQuery {
  taskNo?: string;
  exceptionType?: string;
  handleStatus?: string;
  sourceKey?: string;
}

export interface IntExportTaskQuery extends PageQuery {
  taskNo?: string;
  scope?: string;
  exportFormat?: string;
  taskStatus?: string;
  requestedBy?: string;
}

export interface IntTestCaseQuery extends PageQuery {
  caseNo?: string;
  caseType?: string;
  relatedNode?: string;
  priority?: string;
  runStatus?: string;
}

export interface IntPerfTestQuery extends PageQuery {
  testNo?: string;
  scenario?: string;
  result?: string;
}

export interface IntSecurityIssueQuery extends PageQuery {
  issueNo?: string;
  category?: string;
  severity?: string;
  status?: string;
}

export interface IntBackupRecordQuery extends PageQuery {
  recordNo?: string;
  recordType?: string;
  scope?: string;
  resultStatus?: string;
  verified?: number;
}

export interface IntTrainingRecordQuery extends PageQuery {
  trainingNo?: string;
  roleCode?: string;
  trainer?: string;
}

export interface IntGoliveRecordQuery extends PageQuery {
  goliveNo?: string;
  cutoverStatus?: string;
  owner?: string;
}

export interface IntDeliveryItemQuery extends PageQuery {
  itemNo?: string;
  category?: string;
  status?: string;
  name?: string;
}

export interface IntDefectQuery extends PageQuery {
  defectNo?: string;
  source?: string;
  severity?: string;
  status?: string;
  assignee?: string;
  slaBreached?: number;
}

/* ================= 保存/操作参数 ================= */

export interface IntEndpointSaveParams {
  endpointCode?: string;
  endpointName?: string;
  domain: string;
  direction?: string;
  protocol?: string;
  endpointUrl?: string;
  authType?: string;
  timeoutMs?: number;
  retryMax?: number;
  idempotentEnabled?: number;
  compensateEnabled?: number;
  status?: string;
  remark?: string;
}

export interface IntInterfaceLogSaveParams {
  endpointCode?: string;
  interfaceCode?: string;
  direction?: string;
  bizKey?: string;
  idempotentKey: string;
  requestBody?: string;
  responseBody?: string;
  httpStatus?: number;
  resultStatus?: string;
  retryMax?: number;
  errorMessage?: string;
  sourceSystem?: string;
  targetSystem?: string;
  costMs?: number;
  remark?: string;
}

export interface IntMasterDataSyncSaveParams {
  syncNo?: string;
  masterType: string;
  masterCode: string;
  masterName?: string;
  masterVersion?: string;
  sourceSystem?: string;
  targetSystem?: string;
  syncDirection?: string;
  sourceVersion?: string;
  sourceHash?: string;
  remark?: string;
}

export interface IntMasterDataDiffResolveParams {
  handleStatus: string;
  resolution?: string;
}

export interface IntQmsRecordSaveParams {
  recordNo?: string;
  recordType: string;
  sourceNo?: string;
  productCode?: string;
  materialCode?: string;
  batchNo?: string;
  productVersion?: string;
  inspectionItem?: string;
  result?: string;
  defectCode?: string;
  defectLevel?: string;
  disposition?: string;
  occurredAt?: string;
  sourceSystem?: string;
  relatedProductCode?: string;
  attachmentUrl?: string;
  interfaceStatus?: string;
  remark?: string;
}

export interface IntMigrationTaskSaveParams {
  taskNo?: string;
  scope: string;
  sourceSystem?: string;
  targetTable?: string;
  sourceCount?: number;
  failCount?: number;
  skipCount?: number;
  remark?: string;
}

export interface IntMigrationExceptionHandleParams {
  handleStatus: string;
  remark?: string;
}

export interface IntExportTaskSaveParams {
  taskNo?: string;
  scope: string;
  exportFormat?: string;
  includeAttachment?: number;
  remark?: string;
}

export interface IntTestCaseSaveParams {
  caseNo?: string;
  caseType: string;
  relatedNode?: string;
  title: string;
  precondition?: string;
  steps?: string;
  expected?: string;
  priority?: string;
  remark?: string;
}

export interface IntTestCaseRunParams {
  runStatus: string;
  runResult?: string;
  defectNo?: string;
}

export interface IntPerfTestSaveParams {
  testNo?: string;
  scenario: string;
  targetRps?: number;
  targetP95Ms?: number;
  actualRps?: number;
  actualP95Ms?: number;
  concurrency?: number;
  durationSec?: number;
  reportPath?: string;
  remark?: string;
}

export interface IntSecurityIssueSaveParams {
  issueNo?: string;
  category: string;
  severity?: string;
  title: string;
  detail?: string;
  discoveredBy?: string;
  remark?: string;
}

export interface IntSecurityIssueFixParams {
  fixPlan?: string;
  status?: string;
}

export interface IntBackupRecordSaveParams {
  recordNo?: string;
  recordType: string;
  scope?: string;
  backupAt?: string;
  sizeMb?: number;
  targetPath?: string;
  rpoMinutes?: number;
  rtoMinutes?: number;
  elapsedMinutes?: number;
  resultStatus?: string;
  verified?: number;
  operator?: string;
  remark?: string;
}

export interface IntTrainingRecordSaveParams {
  trainingNo?: string;
  roleCode: string;
  title?: string;
  trainer?: string;
  traineeCount?: number;
  passedCount?: number;
  trainedAt?: string;
  materialUrl?: string;
  remark?: string;
}

export interface IntGoliveRecordSaveParams {
  goliveNo?: string;
  planName: string;
  scope?: string;
  plannedAt?: string;
  rollbackPlan?: string;
  owner?: string;
  remark?: string;
}

export interface IntGoliveExecuteParams {
  cutoverStatus: string;
  note?: string;
}

export interface IntDeliveryItemSaveParams {
  itemNo?: string;
  category: string;
  name: string;
  version?: string;
  filePath?: string;
  checksum?: string;
  remark?: string;
}

export interface IntDefectSaveParams {
  defectNo?: string;
  source: string;
  severity?: string;
  title: string;
  detail?: string;
  module?: string;
  foundAt?: string;
  slaResponseHours?: number;
  slaFixHours?: number;
  assignee?: string;
  remark?: string;
}

export interface IntDefectAssignParams {
  assignee: string;
  remark?: string;
}
