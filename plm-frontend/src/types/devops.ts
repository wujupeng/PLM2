import type { PageQuery } from '@/types/common';

/** G1-N7 WBS T012 DevSecOps（后端 Base: /platform/devops）类型与枚举定义。 */

/* ---------------- 通用分页查询 ---------------- */

/** 代码仓库分页查询条件。 */
export interface DevopsRepositoryQueryParams extends PageQuery {
  repoType?: string;
  branchStrategy?: string;
  systemDomain?: string;
  repoStatus?: string;
}

/** 流水线分页查询条件。 */
export interface DevopsPipelineQueryParams extends PageQuery {
  repoCode?: string;
  triggerType?: string;
  pipelineStatus?: string;
}

/** 环境分页查询条件。 */
export interface DevopsEnvironmentQueryParams extends PageQuery {
  envType?: string;
  envStatus?: string;
}

/** 构建部署记录分页查询条件。 */
export interface DevopsBuildRunQueryParams extends PageQuery {
  pipelineCode?: string;
  envCode?: string;
  buildStatus?: string;
  /** 起始日期（yyyy-MM-dd），作用于开始时间。 */
  startDate?: string;
  /** 结束日期（yyyy-MM-dd），作用于开始时间。 */
  endDate?: string;
}

/** 质量与安全门禁分页查询条件。 */
export interface DevopsGateQueryParams extends PageQuery {
  pipelineCode?: string;
  runNo?: string;
  gateType?: string;
  gateResult?: string;
}

/* ---------------- 1. 代码仓库 ---------------- */

export interface DevopsRepositoryItem {
  id: number;
  repoNo?: string;
  repoCode: string;
  repoName: string;
  repoType?: string;
  repoUrl?: string;
  branchStrategy?: string;
  systemDomain?: string;
  ownerName?: string;
  repoStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DevopsRepositorySaveParams {
  repoNo?: string;
  repoCode: string;
  repoName: string;
  repoType?: string;
  repoUrl?: string;
  branchStrategy?: string;
  systemDomain?: string;
  ownerName?: string;
  repoStatus?: string;
  orgName?: string;
  description?: string;
  remark?: string;
}

/* ---------------- 2. 流水线 ---------------- */

export interface DevopsPipelineItem {
  id: number;
  pipelineNo?: string;
  pipelineCode: string;
  pipelineName: string;
  repoCode?: string;
  triggerType?: string;
  pipelineStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DevopsPipelineSaveParams {
  pipelineNo?: string;
  pipelineCode: string;
  pipelineName: string;
  repoCode?: string;
  triggerType?: string;
  pipelineStatus?: string;
  orgName?: string;
  description?: string;
  remark?: string;
}

/* ---------------- 3. 环境 ---------------- */

export interface DevopsEnvironmentItem {
  id: number;
  envNo?: string;
  envCode: string;
  envName: string;
  envType?: string;
  deployTarget?: string;
  isolated?: number | null;
  ownerName?: string;
  envStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DevopsEnvironmentSaveParams {
  envNo?: string;
  envCode: string;
  envName: string;
  envType?: string;
  deployTarget?: string;
  isolated?: number | null;
  ownerName?: string;
  envStatus?: string;
  orgName?: string;
  description?: string;
  remark?: string;
}

/* ---------------- 4. 构建部署记录 ---------------- */

export interface DevopsBuildRunItem {
  id: number;
  runNo?: string;
  pipelineCode?: string;
  buildNo?: string;
  envCode?: string;
  commitId?: string;
  buildStatus?: string;
  startTime?: string;
  endTime?: string;
  durationMs?: number | null;
  artifactRef?: string;
  message?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DevopsBuildRunSaveParams {
  runNo?: string;
  pipelineCode: string;
  buildNo?: string;
  envCode?: string;
  commitId?: string;
  buildStatus?: string;
  startTime?: string;
  endTime?: string;
  durationMs?: number | null;
  artifactRef?: string;
  message?: string;
  orgName?: string;
  description?: string;
  remark?: string;
}

/* ---------------- 5. 质量与安全门禁 ---------------- */

export interface DevopsGateItem {
  id: number;
  gateNo?: string;
  pipelineCode?: string;
  runNo?: string;
  gateName: string;
  gateType?: string;
  thresholdExpr?: string;
  issueCount?: number | null;
  severity?: string;
  gateResult?: string;
  checkTime?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DevopsGateSaveParams {
  gateNo?: string;
  pipelineCode: string;
  runNo?: string;
  gateName: string;
  gateType?: string;
  thresholdExpr?: string;
  issueCount?: number | null;
  severity?: string;
  gateResult?: string;
  checkTime?: string;
  orgName?: string;
  description?: string;
  remark?: string;
}

/* ---------------- 枚举选项与文案 ---------------- */

/** 仓库类型：GIT/SVN。 */
export const DEVOPS_REPO_TYPE_OPTIONS = [
  { label: 'Git', value: 'GIT' },
  { label: 'SVN', value: 'SVN' },
] as const;

export const DEVOPS_REPO_TYPE_LABEL: Record<string, string> = {
  GIT: 'Git',
  SVN: 'SVN',
};

/** 分支策略：GITFLOW/TRUNK_BASED/RELEASE。 */
export const DEVOPS_BRANCH_STRATEGY_OPTIONS = [
  { label: 'GitFlow', value: 'GITFLOW' },
  { label: '主干开发', value: 'TRUNK_BASED' },
  { label: '发布分支', value: 'RELEASE' },
] as const;

export const DEVOPS_BRANCH_STRATEGY_LABEL: Record<string, string> = {
  GITFLOW: 'GitFlow',
  TRUNK_BASED: '主干开发',
  RELEASE: '发布分支',
};

/** 仓库/流水线状态：ACTIVE/DISABLED。 */
export const DEVOPS_REPO_STATUS_OPTIONS = [
  { label: '生效', value: 'ACTIVE' },
  { label: '停用', value: 'DISABLED' },
] as const;

export const DEVOPS_REPO_STATUS_LABEL: Record<string, string> = {
  ACTIVE: '生效',
  DISABLED: '停用',
};

/** 系统域：PLM/ERP/SRM/MES/WMS/OA/PLATFORM。 */
export const DEVOPS_DOMAIN_OPTIONS = [
  { label: 'PLM', value: 'PLM' },
  { label: 'ERP', value: 'ERP' },
  { label: 'SRM', value: 'SRM' },
  { label: 'MES', value: 'MES' },
  { label: 'WMS', value: 'WMS' },
  { label: 'OA', value: 'OA' },
  { label: '平台', value: 'PLATFORM' },
] as const;

export const DEVOPS_DOMAIN_LABEL: Record<string, string> = {
  PLM: 'PLM',
  ERP: 'ERP',
  SRM: 'SRM',
  MES: 'MES',
  WMS: 'WMS',
  OA: 'OA',
  PLATFORM: '平台',
};

/** 触发方式：PUSH/MANUAL/SCHEDULE。 */
export const DEVOPS_PIPELINE_TRIGGER_OPTIONS = [
  { label: '推送触发', value: 'PUSH' },
  { label: '手动触发', value: 'MANUAL' },
  { label: '定时触发', value: 'SCHEDULE' },
] as const;

export const DEVOPS_PIPELINE_TRIGGER_LABEL: Record<string, string> = {
  PUSH: '推送触发',
  MANUAL: '手动触发',
  SCHEDULE: '定时触发',
};

/** 流水线状态：ACTIVE/DISABLED。 */
export const DEVOPS_PIPELINE_STATUS_OPTIONS = [
  { label: '生效', value: 'ACTIVE' },
  { label: '停用', value: 'DISABLED' },
] as const;

export const DEVOPS_PIPELINE_STATUS_LABEL: Record<string, string> = {
  ACTIVE: '生效',
  DISABLED: '停用',
};

/** 环境类型：DEV/TEST/UAT/PROD。 */
export const DEVOPS_ENV_TYPE_OPTIONS = [
  { label: '开发', value: 'DEV' },
  { label: '测试', value: 'TEST' },
  { label: '验收', value: 'UAT' },
  { label: '生产', value: 'PROD' },
] as const;

export const DEVOPS_ENV_TYPE_LABEL: Record<string, string> = {
  DEV: '开发',
  TEST: '测试',
  UAT: '验收',
  PROD: '生产',
};

/** 环境状态：ACTIVE/MAINTENANCE/OFFLINE。 */
export const DEVOPS_ENV_STATUS_OPTIONS = [
  { label: '生效', value: 'ACTIVE' },
  { label: '维护中', value: 'MAINTENANCE' },
  { label: '离线', value: 'OFFLINE' },
] as const;

export const DEVOPS_ENV_STATUS_LABEL: Record<string, string> = {
  ACTIVE: '生效',
  MAINTENANCE: '维护中',
  OFFLINE: '离线',
};

/** 构建状态：SUCCESS/FAILED/RUNNING。 */
export const DEVOPS_BUILD_STATUS_OPTIONS = [
  { label: '成功', value: 'SUCCESS' },
  { label: '失败', value: 'FAILED' },
  { label: '运行中', value: 'RUNNING' },
] as const;

export const DEVOPS_BUILD_STATUS_LABEL: Record<string, string> = {
  SUCCESS: '成功',
  FAILED: '失败',
  RUNNING: '运行中',
};

/** 门禁类型：UNIT_TEST/COVERAGE/SONAR/SECURITY_SCAN/PERFORMANCE。 */
export const DEVOPS_GATE_TYPE_OPTIONS = [
  { label: '单元测试', value: 'UNIT_TEST' },
  { label: '覆盖率', value: 'COVERAGE' },
  { label: '代码扫描', value: 'SONAR' },
  { label: '漏洞扫描', value: 'SECURITY_SCAN' },
  { label: '性能测试', value: 'PERFORMANCE' },
] as const;

export const DEVOPS_GATE_TYPE_LABEL: Record<string, string> = {
  UNIT_TEST: '单元测试',
  COVERAGE: '覆盖率',
  SONAR: '代码扫描',
  SECURITY_SCAN: '漏洞扫描',
  PERFORMANCE: '性能测试',
};

/** 门禁结果：PASS/FAIL/WARN。 */
export const DEVOPS_GATE_RESULT_OPTIONS = [
  { label: '通过', value: 'PASS' },
  { label: '失败', value: 'FAIL' },
  { label: '告警', value: 'WARN' },
] as const;

export const DEVOPS_GATE_RESULT_LABEL: Record<string, string> = {
  PASS: '通过',
  FAIL: '失败',
  WARN: '告警',
};

/** 严重级别：HIGH/MEDIUM/LOW。 */
export const DEVOPS_SEVERITY_OPTIONS = [
  { label: '高', value: 'HIGH' },
  { label: '中', value: 'MEDIUM' },
  { label: '低', value: 'LOW' },
] as const;

export const DEVOPS_SEVERITY_LABEL: Record<string, string> = {
  HIGH: '高',
  MEDIUM: '中',
  LOW: '低',
};

/** 是否隔离：1 是 / 0 否。 */
export const DEVOPS_ISOLATED_OPTIONS = [
  { label: '隔离', value: 1 },
  { label: '不隔离', value: 0 },
] as const;

export const DEVOPS_ISOLATED_LABEL: Record<string, string> = {
  '1': '隔离',
  '0': '不隔离',
};
