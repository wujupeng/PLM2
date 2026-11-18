import type { PageQuery } from '@/types/common';

/** G1-N8 WBS T007 主数据平台（后端 Base: /platform/mdm）类型与枚举定义。 */

/* ---------------- 通用分页查询 ---------------- */

/** 主数据域分页查询条件。 */
export interface MdmDomainQueryParams extends PageQuery {
  masterType?: string;
  domainStatus?: string;
}

/** 权威源登记分页查询条件。 */
export interface MdmSourceQueryParams extends PageQuery {
  domainCode?: string;
  sourceSystem?: string;
  authorityLevel?: string;
  sourceStatus?: string;
}

/** 编码标准分页查询条件。 */
export interface MdmCodeStandardQueryParams extends PageQuery {
  domainCode?: string;
  resetCycle?: string;
  standardStatus?: string;
}

/** 主数据分页查询条件。 */
export interface MdmDistributionQueryParams extends PageQuery {
  domainCode?: string;
  targetSystem?: string;
  distStatus?: string;
  distType?: string;
}

/** 变更申请分页查询条件。 */
export interface MdmChangeRequestQueryParams extends PageQuery {
  domainCode?: string;
  changeType?: string;
  requestStatus?: string;
}

/** 数据质量校验分页查询条件。 */
export interface MdmQualityCheckQueryParams extends PageQuery {
  domainCode?: string;
  checkResult?: string;
  checkItem?: string;
}

/** 同步日志分页查询条件。 */
export interface MdmSyncLogQueryParams extends PageQuery {
  domainCode?: string;
  sourceSystem?: string;
  targetSystem?: string;
  syncStatus?: string;
}

/** 编码发放分页查询条件。 */
export interface MdmCodeIssueQueryParams extends PageQuery {
  domainCode?: string;
  standardCode?: string;
  issueStatus?: string;
}

/* ---------------- 1. 主数据域 ---------------- */

export interface MdmDomainItem {
  id: number;
  domainNo?: string;
  domainCode: string;
  domainName: string;
  masterType?: string;
  authoritySystem?: string;
  ownerDept?: string;
  syncMode?: string;
  domainStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MdmDomainSaveParams {
  domainNo?: string;
  domainCode: string;
  domainName: string;
  masterType?: string;
  authoritySystem?: string;
  ownerDept?: string;
  syncMode?: string;
  domainStatus?: string;
  orgName?: string;
  description?: string;
  remark?: string;
}

/* ---------------- 2. 权威源登记 ---------------- */

export interface MdmSourceItem {
  id: number;
  sourceNo?: string;
  domainCode: string;
  sourceSystem: string;
  sourceEntity?: string;
  authorityLevel?: string;
  syncDirection?: string;
  sourceStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MdmSourceSaveParams {
  sourceNo?: string;
  domainCode: string;
  sourceSystem: string;
  sourceEntity?: string;
  authorityLevel?: string;
  syncDirection?: string;
  sourceStatus?: string;
  orgName?: string;
  description?: string;
  remark?: string;
}

/* ---------------- 3. 编码标准 ---------------- */

export interface MdmCodeStandardItem {
  id: number;
  standardNo?: string;
  domainCode: string;
  standardCode: string;
  standardName: string;
  codePattern?: string;
  seqLength?: number | null;
  resetCycle?: string;
  sampleValue?: string;
  standardStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MdmCodeStandardSaveParams {
  standardNo?: string;
  domainCode: string;
  standardCode: string;
  standardName: string;
  codePattern?: string;
  seqLength?: number | null;
  resetCycle?: string;
  sampleValue?: string;
  standardStatus?: string;
  orgName?: string;
  description?: string;
  remark?: string;
}

/* ---------------- 4. 主数据分发 ---------------- */

export interface MdmDistributionItem {
  id: number;
  distNo?: string;
  domainCode: string;
  masterCode?: string;
  targetSystem: string;
  distType?: string;
  distStatus?: string;
  distTime?: string;
  ackTime?: string;
  retryCount?: number | null;
  message?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MdmDistributionSaveParams {
  distNo?: string;
  domainCode: string;
  masterCode?: string;
  targetSystem: string;
  distType?: string;
  distStatus?: string;
  distTime?: string;
  ackTime?: string;
  retryCount?: number | null;
  message?: string;
  orgName?: string;
  description?: string;
  remark?: string;
}

/* ---------------- 5. 变更申请 ---------------- */

export interface MdmChangeRequestItem {
  id: number;
  changeNo?: string;
  domainCode: string;
  masterCode?: string;
  changeType?: string;
  beforeValue?: string;
  afterValue?: string;
  changeReason?: string;
  requestStatus?: string;
  applicantName?: string;
  approverName?: string;
  applyTime?: string;
  approveTime?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MdmChangeRequestSaveParams {
  changeNo?: string;
  domainCode: string;
  masterCode?: string;
  changeType?: string;
  beforeValue?: string;
  afterValue?: string;
  changeReason?: string;
  requestStatus?: string;
  applicantName?: string;
  approverName?: string;
  applyTime?: string;
  approveTime?: string;
  orgName?: string;
  description?: string;
  remark?: string;
}

/* ---------------- 6. 数据质量校验 ---------------- */

export interface MdmQualityCheckItem {
  id: number;
  checkNo?: string;
  domainCode: string;
  masterCode?: string;
  checkItem?: string;
  checkResult?: string;
  score?: number | null;
  message?: string;
  checkTime?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MdmQualityCheckSaveParams {
  checkNo?: string;
  domainCode: string;
  masterCode?: string;
  checkItem?: string;
  checkResult?: string;
  score?: number | null;
  message?: string;
  checkTime?: string;
  orgName?: string;
  description?: string;
  remark?: string;
}

/* ---------------- 7. 同步日志 ---------------- */

export interface MdmSyncLogItem {
  id: number;
  logNo?: string;
  domainCode: string;
  sourceSystem?: string;
  targetSystem?: string;
  masterCode?: string;
  syncStatus?: string;
  syncTime?: string;
  message?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MdmSyncLogSaveParams {
  logNo?: string;
  domainCode: string;
  sourceSystem?: string;
  targetSystem?: string;
  masterCode?: string;
  syncStatus?: string;
  syncTime?: string;
  message?: string;
  orgName?: string;
  description?: string;
  remark?: string;
}

/* ---------------- 8. 编码发放 ---------------- */

export interface MdmCodeIssueItem {
  id: number;
  issueNo?: string;
  domainCode: string;
  standardCode?: string;
  masterCode?: string;
  seqValue?: number | null;
  issueTime?: string;
  issuedBy?: string;
  issueStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MdmCodeIssueSaveParams {
  issueNo?: string;
  domainCode: string;
  standardCode?: string;
  masterCode?: string;
  seqValue?: number | null;
  issueTime?: string;
  issuedBy?: string;
  issueStatus?: string;
  orgName?: string;
  description?: string;
  remark?: string;
}

/* ---------------- 枚举选项与文案 ---------------- */

/** 主数据类型：MATERIAL/PRODUCT/CUSTOMER/SUPPLIER/ORG/PERSONNEL/WAREHOUSE/PROCESS/EQUIPMENT。 */
export const MDM_MASTER_TYPE_OPTIONS = [
  { label: '物料', value: 'MATERIAL' },
  { label: '产品', value: 'PRODUCT' },
  { label: '客户', value: 'CUSTOMER' },
  { label: '供应商', value: 'SUPPLIER' },
  { label: '组织', value: 'ORG' },
  { label: '人员', value: 'PERSONNEL' },
  { label: '仓库', value: 'WAREHOUSE' },
  { label: '工艺', value: 'PROCESS' },
  { label: '设备', value: 'EQUIPMENT' },
] as const;

export const MDM_MASTER_TYPE_LABEL: Record<string, string> = {
  MATERIAL: '物料',
  PRODUCT: '产品',
  CUSTOMER: '客户',
  SUPPLIER: '供应商',
  ORG: '组织',
  PERSONNEL: '人员',
  WAREHOUSE: '仓库',
  PROCESS: '工艺',
  EQUIPMENT: '设备',
};

/** 权威源系统：PLM/ERP/SRM/MES/WMS/OA/PLATFORM。 */
export const MDM_AUTHORITY_SYSTEM_OPTIONS = [
  { label: 'PLM', value: 'PLM' },
  { label: 'ERP', value: 'ERP' },
  { label: 'SRM', value: 'SRM' },
  { label: 'MES', value: 'MES' },
  { label: 'WMS', value: 'WMS' },
  { label: 'OA', value: 'OA' },
  { label: '平台', value: 'PLATFORM' },
] as const;

export const MDM_AUTHORITY_SYSTEM_LABEL: Record<string, string> = {
  PLM: 'PLM',
  ERP: 'ERP',
  SRM: 'SRM',
  MES: 'MES',
  WMS: 'WMS',
  OA: 'OA',
  PLATFORM: '平台',
};

/** 同步方式：PUSH/PULL/EVENT。 */
export const MDM_SYNC_MODE_OPTIONS = [
  { label: '推送', value: 'PUSH' },
  { label: '拉取', value: 'PULL' },
  { label: '事件驱动', value: 'EVENT' },
] as const;

export const MDM_SYNC_MODE_LABEL: Record<string, string> = {
  PUSH: '推送',
  PULL: '拉取',
  EVENT: '事件驱动',
};

/** 主数据域状态：ACTIVE/DRAFT/DISABLED。 */
export const MDM_DOMAIN_STATUS_OPTIONS = [
  { label: '生效', value: 'ACTIVE' },
  { label: '草稿', value: 'DRAFT' },
  { label: '停用', value: 'DISABLED' },
] as const;

export const MDM_DOMAIN_STATUS_LABEL: Record<string, string> = {
  ACTIVE: '生效',
  DRAFT: '草稿',
  DISABLED: '停用',
};

/** 权威级别：PRIMARY/SECONDARY。 */
export const MDM_AUTHORITY_LEVEL_OPTIONS = [
  { label: '主权威源', value: 'PRIMARY' },
  { label: '次权威源', value: 'SECONDARY' },
] as const;

export const MDM_AUTHORITY_LEVEL_LABEL: Record<string, string> = {
  PRIMARY: '主权威源',
  SECONDARY: '次权威源',
};

/** 同步方向：OUT/IN/BOTH。 */
export const MDM_SYNC_DIRECTION_OPTIONS = [
  { label: '对外发布', value: 'OUT' },
  { label: '对外接收', value: 'IN' },
  { label: '双向同步', value: 'BOTH' },
] as const;

export const MDM_SYNC_DIRECTION_LABEL: Record<string, string> = {
  OUT: '对外发布',
  IN: '对外接收',
  BOTH: '双向同步',
};

/** 权威源状态：ACTIVE/DISABLED。 */
export const MDM_SOURCE_STATUS_OPTIONS = [
  { label: '生效', value: 'ACTIVE' },
  { label: '停用', value: 'DISABLED' },
] as const;

export const MDM_SOURCE_STATUS_LABEL: Record<string, string> = {
  ACTIVE: '生效',
  DISABLED: '停用',
};

/** 流水号重置周期：NONE/YEAR/MONTH/DAY。 */
export const MDM_RESET_CYCLE_OPTIONS = [
  { label: '不重置', value: 'NONE' },
  { label: '按年重置', value: 'YEAR' },
  { label: '按月重置', value: 'MONTH' },
  { label: '按日重置', value: 'DAY' },
] as const;

export const MDM_RESET_CYCLE_LABEL: Record<string, string> = {
  NONE: '不重置',
  YEAR: '按年重置',
  MONTH: '按月重置',
  DAY: '按日重置',
};

/** 编码标准状态：ACTIVE/DISABLED。 */
export const MDM_STANDARD_STATUS_OPTIONS = [
  { label: '生效', value: 'ACTIVE' },
  { label: '停用', value: 'DISABLED' },
] as const;

export const MDM_STANDARD_STATUS_LABEL: Record<string, string> = {
  ACTIVE: '生效',
  DISABLED: '停用',
};

/** 分发类型：FULL/INCREMENT。 */
export const MDM_DIST_TYPE_OPTIONS = [
  { label: '全量', value: 'FULL' },
  { label: '增量', value: 'INCREMENT' },
] as const;

export const MDM_DIST_TYPE_LABEL: Record<string, string> = {
  FULL: '全量',
  INCREMENT: '增量',
};

/** 分发状态：PENDING/SENT/ACK/FAILED。 */
export const MDM_DIST_STATUS_OPTIONS = [
  { label: '待分发', value: 'PENDING' },
  { label: '已发送', value: 'SENT' },
  { label: '已回执', value: 'ACK' },
  { label: '失败', value: 'FAILED' },
] as const;

export const MDM_DIST_STATUS_LABEL: Record<string, string> = {
  PENDING: '待分发',
  SENT: '已发送',
  ACK: '已回执',
  FAILED: '失败',
};

/** 变更类型：CREATE/UPDATE/DISABLE/MERGE。 */
export const MDM_CHANGE_TYPE_OPTIONS = [
  { label: '新增', value: 'CREATE' },
  { label: '修改', value: 'UPDATE' },
  { label: '停用', value: 'DISABLE' },
  { label: '合并', value: 'MERGE' },
] as const;

export const MDM_CHANGE_TYPE_LABEL: Record<string, string> = {
  CREATE: '新增',
  UPDATE: '修改',
  DISABLE: '停用',
  MERGE: '合并',
};

/** 申请状态：SUBMITTED/APPROVED/REJECTED/APPLIED。 */
export const MDM_REQUEST_STATUS_OPTIONS = [
  { label: '已提交', value: 'SUBMITTED' },
  { label: '已批准', value: 'APPROVED' },
  { label: '已驳回', value: 'REJECTED' },
  { label: '已生效', value: 'APPLIED' },
] as const;

export const MDM_REQUEST_STATUS_LABEL: Record<string, string> = {
  SUBMITTED: '已提交',
  APPROVED: '已批准',
  REJECTED: '已驳回',
  APPLIED: '已生效',
};

/** 校验结果：PASS/WARN/FAIL。 */
export const MDM_CHECK_RESULT_OPTIONS = [
  { label: '通过', value: 'PASS' },
  { label: '告警', value: 'WARN' },
  { label: '不通过', value: 'FAIL' },
] as const;

export const MDM_CHECK_RESULT_LABEL: Record<string, string> = {
  PASS: '通过',
  WARN: '告警',
  FAIL: '不通过',
};

/** 同步状态：SUCCESS/FAILED/IGNORED。 */
export const MDM_SYNC_STATUS_OPTIONS = [
  { label: '成功', value: 'SUCCESS' },
  { label: '失败', value: 'FAILED' },
  { label: '已忽略', value: 'IGNORED' },
] as const;

export const MDM_SYNC_STATUS_LABEL: Record<string, string> = {
  SUCCESS: '成功',
  FAILED: '失败',
  IGNORED: '已忽略',
};

/** 发放状态：ISSUED/VOID。 */
export const MDM_ISSUE_STATUS_OPTIONS = [
  { label: '已发放', value: 'ISSUED' },
  { label: '已作废', value: 'VOID' },
] as const;

export const MDM_ISSUE_STATUS_LABEL: Record<string, string> = {
  ISSUED: '已发放',
  VOID: '已作废',
};
