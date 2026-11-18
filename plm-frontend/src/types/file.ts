import type { PageQuery } from '@/types/common';

/** G1-N3 公共平台底座—统一文件服务（后端 WBS T011）类型与枚举定义。 */

/* ---------------- 通用分页查询 ---------------- */

/** 统一文件服务通用分页查询条件（各资源按需使用对应状态字段）。 */
export interface FileQueryParams extends PageQuery {
  bizModule?: string;
  bizType?: string;
  storageType?: string;
  securityLevel?: string;
  scanStatus?: string;
  fileStatus?: string;
  archiveStatus?: string;
  versionStatus?: string;
  taskStatus?: string;
  convertMode?: string;
  scanResult?: string;
  archiveType?: string;
  restoreStatus?: string;
  startDate?: string;
  endDate?: string;
}

/* ---------------- 1. 统一附件 ---------------- */

export interface FileAttachmentItem {
  id: number;
  fileNo: string;
  fileName: string;
  originalName?: string;
  fileExt?: string;
  bizModule?: string;
  bizType?: string;
  bizId?: string;
  bizNo?: string;
  storageType?: string;
  storageBucket?: string;
  objectKey?: string;
  fileSize?: number;
  contentType?: string;
  checksum?: string;
  securityLevel?: string;
  scanStatus?: string;
  previewSupported?: number;
  latestVersionNo?: number;
  uploadBy?: string;
  uploadTime?: string;
  retentionYears?: number;
  archiveStatus?: string;
  fileStatus: string;
  description?: string;
  orgId?: string;
  orgName?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FileAttachmentSaveParams {
  fileNo?: string;
  fileName: string;
  originalName?: string;
  fileExt?: string;
  bizModule?: string;
  bizType?: string;
  bizId?: string;
  bizNo?: string;
  storageType?: string;
  storageBucket?: string;
  objectKey?: string;
  fileSize?: number;
  contentType?: string;
  checksum?: string;
  securityLevel?: string;
  scanStatus?: string;
  previewSupported?: number;
  latestVersionNo?: number;
  uploadBy?: string;
  uploadTime?: string;
  retentionYears?: number;
  archiveStatus?: string;
  fileStatus?: string;
  description?: string;
  orgId?: string;
  orgName?: string;
  remark?: string;
}

export interface FileAttachmentStats {
  total?: number;
  normal?: number;
  quarantined?: number;
  archived?: number;
  deleted?: number;
  pendingScan?: number;
  infected?: number;
}

/* ---------------- 2. 文件版本 ---------------- */

export interface FileVersionItem {
  id: number;
  versionNo: string;
  fileNo: string;
  fileName?: string;
  seqNo?: number;
  storageBucket?: string;
  objectKey?: string;
  fileSize?: number;
  checksum?: string;
  changeNote?: string;
  currentFlag?: number;
  uploadBy?: string;
  uploadTime?: string;
  versionStatus: string;
  orgId?: string;
  orgName?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FileVersionSaveParams {
  versionNo?: string;
  fileNo: string;
  fileName?: string;
  seqNo?: number;
  storageBucket?: string;
  objectKey?: string;
  fileSize?: number;
  checksum?: string;
  changeNote?: string;
  currentFlag?: number;
  uploadBy?: string;
  uploadTime?: string;
  versionStatus?: string;
  orgId?: string;
  orgName?: string;
  remark?: string;
}

export interface FileVersionStats {
  total?: number;
  current?: number;
  history?: number;
  totalSize?: number;
}

/* ---------------- 3. 预览转换任务 ---------------- */

export interface FilePreviewTaskItem {
  id: number;
  taskNo: string;
  fileNo: string;
  fileName?: string;
  sourceExt?: string;
  targetFormat?: string;
  convertMode?: string;
  convertEngine?: string;
  taskStatus: string;
  previewUrl?: string;
  errorMessage?: string;
  retryCount?: number;
  startTime?: string;
  endTime?: string;
  costMs?: number;
  orgId?: string;
  orgName?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FilePreviewTaskSaveParams {
  taskNo?: string;
  fileNo: string;
  fileName?: string;
  sourceExt?: string;
  targetFormat?: string;
  convertMode?: string;
  convertEngine?: string;
  taskStatus?: string;
  previewUrl?: string;
  errorMessage?: string;
  retryCount?: number;
  startTime?: string;
  endTime?: string;
  costMs?: number;
  orgId?: string;
  orgName?: string;
  remark?: string;
}

export interface FilePreviewTaskStats {
  total?: number;
  pending?: number;
  processing?: number;
  success?: number;
  failed?: number;
  totalCostMs?: number;
}

/* ---------------- 4. 病毒扫描记录 ---------------- */

export interface FileScanRecordItem {
  id: number;
  scanNo: string;
  fileNo: string;
  fileName?: string;
  scanEngine?: string;
  engineVersion?: string;
  virusName?: string;
  scanResult: string;
  actionTaken?: string;
  scanTime?: string;
  costMs?: number;
  orgId?: string;
  orgName?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FileScanRecordSaveParams {
  scanNo?: string;
  fileNo: string;
  fileName?: string;
  scanEngine?: string;
  engineVersion?: string;
  virusName?: string;
  scanResult?: string;
  actionTaken?: string;
  scanTime?: string;
  costMs?: number;
  orgId?: string;
  orgName?: string;
  remark?: string;
}

export interface FileScanRecordStats {
  total?: number;
  clean?: number;
  infected?: number;
  error?: number;
  totalCostMs?: number;
}

/* ---------------- 5. 文件归档 ---------------- */

export interface FileArchiveItem {
  id: number;
  archiveNo: string;
  fileNo: string;
  fileName?: string;
  archiveType?: string;
  storageClass?: string;
  retentionYears?: number;
  storagePath?: string;
  archiveTime?: string;
  expireTime?: string;
  archiveStatus: string;
  restoreStatus?: string;
  orgId?: string;
  orgName?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FileArchiveSaveParams {
  archiveNo?: string;
  fileNo: string;
  fileName?: string;
  archiveType?: string;
  storageClass?: string;
  retentionYears?: number;
  storagePath?: string;
  archiveTime?: string;
  expireTime?: string;
  archiveStatus?: string;
  restoreStatus?: string;
  orgId?: string;
  orgName?: string;
  remark?: string;
}

export interface FileArchiveStats {
  total?: number;
  pending?: number;
  archived?: number;
  restoring?: number;
  restored?: number;
  expired?: number;
}

/* ---------------- 枚举选项与文案 ---------------- */

/** 业务模块：PLM/ERP/SRM/MES/WMS/OA。 */
export const FILE_BIZ_MODULE_OPTIONS = [
  { label: 'PLM 产品研发', value: 'PLM' },
  { label: 'ERP 经营管理', value: 'ERP' },
  { label: 'SRM 供应商协同', value: 'SRM' },
  { label: 'MES 制造执行', value: 'MES' },
  { label: 'WMS 仓储管理', value: 'WMS' },
  { label: 'OA 企业协同', value: 'OA' },
] as const;

export const FILE_BIZ_MODULE_LABEL: Record<string, string> = {
  PLM: 'PLM 产品研发',
  ERP: 'ERP 经营管理',
  SRM: 'SRM 供应商协同',
  MES: 'MES 制造执行',
  WMS: 'WMS 仓储管理',
  OA: 'OA 企业协同',
};

/** 存储类型：OBJECT/LOCAL。 */
export const FILE_STORAGE_TYPE_OPTIONS = [
  { label: '对象存储', value: 'OBJECT' },
  { label: '本地存储', value: 'LOCAL' },
] as const;

export const FILE_STORAGE_TYPE_LABEL: Record<string, string> = {
  OBJECT: '对象存储',
  LOCAL: '本地存储',
};

/** 密级：PUBLIC/INTERNAL/CONFIDENTIAL/SECRET。 */
export const FILE_SECURITY_LEVEL_OPTIONS = [
  { label: '公开', value: 'PUBLIC' },
  { label: '内部', value: 'INTERNAL' },
  { label: '机密', value: 'CONFIDENTIAL' },
  { label: '绝密', value: 'SECRET' },
] as const;

export const FILE_SECURITY_LEVEL_LABEL: Record<string, string> = {
  PUBLIC: '公开',
  INTERNAL: '内部',
  CONFIDENTIAL: '机密',
  SECRET: '绝密',
};

/** 扫描状态：PENDING/CLEAN/INFECTED/ERROR。 */
export const FILE_SCAN_STATUS_OPTIONS = [
  { label: '待扫描', value: 'PENDING' },
  { label: '安全', value: 'CLEAN' },
  { label: '已感染', value: 'INFECTED' },
  { label: '扫描异常', value: 'ERROR' },
] as const;

export const FILE_SCAN_STATUS_LABEL: Record<string, string> = {
  PENDING: '待扫描',
  CLEAN: '安全',
  INFECTED: '已感染',
  ERROR: '扫描异常',
};

/** 文件状态：NORMAL/QUARANTINED/ARCHIVED/DELETED。 */
export const FILE_FILE_STATUS_OPTIONS = [
  { label: '正常', value: 'NORMAL' },
  { label: '隔离', value: 'QUARANTINED' },
  { label: '已归档', value: 'ARCHIVED' },
  { label: '已删除', value: 'DELETED' },
] as const;

export const FILE_FILE_STATUS_LABEL: Record<string, string> = {
  NORMAL: '正常',
  QUARANTINED: '隔离',
  ARCHIVED: '已归档',
  DELETED: '已删除',
};

/** 版本状态：ACTIVE/HISTORY。 */
export const FILE_VERSION_STATUS_OPTIONS = [
  { label: '当前版本', value: 'ACTIVE' },
  { label: '历史版本', value: 'HISTORY' },
] as const;

export const FILE_VERSION_STATUS_LABEL: Record<string, string> = {
  ACTIVE: '当前版本',
  HISTORY: '历史版本',
};

/** 转换模式：OFFICE/CAD/PDF/IMAGE。 */
export const FILE_CONVERT_MODE_OPTIONS = [
  { label: 'Office 转换', value: 'OFFICE' },
  { label: 'CAD 转换', value: 'CAD' },
  { label: 'PDF 处理', value: 'PDF' },
  { label: '图片处理', value: 'IMAGE' },
] as const;

export const FILE_CONVERT_MODE_LABEL: Record<string, string> = {
  OFFICE: 'Office 转换',
  CAD: 'CAD 转换',
  PDF: 'PDF 处理',
  IMAGE: '图片处理',
};

/** 目标格式：PDF/IMAGE/HTML。 */
export const FILE_TARGET_FORMAT_OPTIONS = [
  { label: 'PDF', value: 'PDF' },
  { label: '图片', value: 'IMAGE' },
  { label: 'HTML', value: 'HTML' },
] as const;

export const FILE_TARGET_FORMAT_LABEL: Record<string, string> = {
  PDF: 'PDF',
  IMAGE: '图片',
  HTML: 'HTML',
};

/** 任务状态：PENDING/PROCESSING/SUCCESS/FAILED。 */
export const FILE_TASK_STATUS_OPTIONS = [
  { label: '待处理', value: 'PENDING' },
  { label: '处理中', value: 'PROCESSING' },
  { label: '成功', value: 'SUCCESS' },
  { label: '失败', value: 'FAILED' },
] as const;

export const FILE_TASK_STATUS_LABEL: Record<string, string> = {
  PENDING: '待处理',
  PROCESSING: '处理中',
  SUCCESS: '成功',
  FAILED: '失败',
};

/** 扫描结果：CLEAN/INFECTED/ERROR。 */
export const FILE_SCAN_RESULT_OPTIONS = [
  { label: '安全', value: 'CLEAN' },
  { label: '已感染', value: 'INFECTED' },
  { label: '扫描异常', value: 'ERROR' },
] as const;

export const FILE_SCAN_RESULT_LABEL: Record<string, string> = {
  CLEAN: '安全',
  INFECTED: '已感染',
  ERROR: '扫描异常',
};

/** 处置动作：PASS/QUARANTINE/DELETE。 */
export const FILE_ACTION_TAKEN_OPTIONS = [
  { label: '放行', value: 'PASS' },
  { label: '隔离', value: 'QUARANTINE' },
  { label: '删除', value: 'DELETE' },
] as const;

export const FILE_ACTION_TAKEN_LABEL: Record<string, string> = {
  PASS: '放行',
  QUARANTINE: '隔离',
  DELETE: '删除',
};

/** 归档类型：HOT/COLD/PERMANENT。 */
export const FILE_ARCHIVE_TYPE_OPTIONS = [
  { label: '热归档', value: 'HOT' },
  { label: '冷归档', value: 'COLD' },
  { label: '永久保留', value: 'PERMANENT' },
] as const;

export const FILE_ARCHIVE_TYPE_LABEL: Record<string, string> = {
  HOT: '热归档',
  COLD: '冷归档',
  PERMANENT: '永久保留',
};

/** 存储级别：STANDARD/IA/ARCHIVE。 */
export const FILE_STORAGE_CLASS_OPTIONS = [
  { label: '标准存储', value: 'STANDARD' },
  { label: '低频访问', value: 'IA' },
  { label: '归档存储', value: 'ARCHIVE' },
] as const;

export const FILE_STORAGE_CLASS_LABEL: Record<string, string> = {
  STANDARD: '标准存储',
  IA: '低频访问',
  ARCHIVE: '归档存储',
};

/** 归档状态：PENDING/ARCHIVED/RESTORING/RESTORED/EXPIRED。 */
export const FILE_ARCHIVE_STATUS_OPTIONS = [
  { label: '待归档', value: 'PENDING' },
  { label: '已归档', value: 'ARCHIVED' },
  { label: '恢复中', value: 'RESTORING' },
  { label: '已恢复', value: 'RESTORED' },
  { label: '已过期', value: 'EXPIRED' },
] as const;

export const FILE_ARCHIVE_STATUS_LABEL: Record<string, string> = {
  PENDING: '待归档',
  ARCHIVED: '已归档',
  RESTORING: '恢复中',
  RESTORED: '已恢复',
  EXPIRED: '已过期',
};

/** 恢复状态：NONE/REQUESTED/DONE。 */
export const FILE_RESTORE_STATUS_OPTIONS = [
  { label: '未恢复', value: 'NONE' },
  { label: '已申请', value: 'REQUESTED' },
  { label: '已完成', value: 'DONE' },
] as const;

export const FILE_RESTORE_STATUS_LABEL: Record<string, string> = {
  NONE: '未恢复',
  REQUESTED: '已申请',
  DONE: '已完成',
};

/** 是否标志下拉选项（1=是，0=否）。 */
export const FILE_BOOLEAN_OPTIONS = [
  { label: '是', value: 1 },
  { label: '否', value: 0 },
] as const;
