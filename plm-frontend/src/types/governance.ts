import type { PageQuery } from '@/types/common';

/** G1-N7 WBS T001-T005 治理中心（后端 Base: /platform/governance）类型与枚举定义。 */

/* ---------------- 通用分页查询 ---------------- */

/** 治理项目分页查询条件。 */
export interface GovProjectQueryParams extends PageQuery {
  projectType?: string;
  projectStatus?: string;
}

/** 治理里程碑分页查询条件。 */
export interface GovMilestoneQueryParams extends PageQuery {
  projectCode?: string;
  milestoneStatus?: string;
}

/** 治理任务分页查询条件。 */
export interface GovTaskQueryParams extends PageQuery {
  projectCode?: string;
  taskStatus?: string;
  taskPriority?: string;
}

/** 治理风险分页查询条件。 */
export interface GovRiskQueryParams extends PageQuery {
  projectCode?: string;
  riskType?: string;
  riskStatus?: string;
  riskLevel?: string;
}

/** 存量系统分页查询条件。 */
export interface GovAsisSystemQueryParams extends PageQuery {
  systemType?: string;
  systemStatus?: string;
}

/** 盘点发现分页查询条件。 */
export interface GovAsisFindingQueryParams extends PageQuery {
  systemCode?: string;
  findingType?: string;
  findingStatus?: string;
}

/** 端到端流程分页查询条件。 */
export interface GovProcessQueryParams extends PageQuery {
  processType?: string;
  processLevel?: string;
  processStatus?: string;
}

/** 流程节点分页查询条件。 */
export interface GovProcessNodeQueryParams extends PageQuery {
  processCode?: string;
  nodeType?: string;
  nodeStatus?: string;
}

/** 需求分页查询条件。 */
export interface GovRequirementQueryParams extends PageQuery {
  reqType?: string;
  reqStatus?: string;
  reqPriority?: string;
  bizModule?: string;
}

/** 追踪链接分页查询条件。 */
export interface GovTraceLinkQueryParams extends PageQuery {
  reqCode?: string;
  linkType?: string;
  linkStatus?: string;
}

/** 架构组件分页查询条件。 */
export interface GovArchComponentQueryParams extends PageQuery {
  archLayer?: string;
  systemDomain?: string;
  componentStatus?: string;
}

/** 架构关系分页查询条件。 */
export interface GovArchRelationQueryParams extends PageQuery {
  sourceComponent?: string;
  targetComponent?: string;
  relationType?: string;
  relationStatus?: string;
}

/* ---------------- 1. 项目治理：项目 ---------------- */

export interface GovProjectItem {
  id: number;
  projectNo?: string;
  projectCode?: string;
  projectName: string;
  projectType?: string;
  sponsor?: string;
  managerName?: string;
  startDate?: string;
  endDate?: string;
  projectStatus?: string;
  scopeDesc?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GovProjectSaveParams {
  projectNo?: string;
  projectCode?: string;
  projectName: string;
  projectType?: string;
  sponsor?: string;
  managerName?: string;
  startDate?: string;
  endDate?: string;
  projectStatus?: string;
  scopeDesc?: string;
  orgName?: string;
  description?: string;
  remark?: string;
}

/* ---------------- 2. 项目治理：里程碑 ---------------- */

export interface GovMilestoneItem {
  id: number;
  milestoneNo?: string;
  projectCode?: string;
  milestoneCode?: string;
  milestoneName: string;
  planDate?: string;
  actualDate?: string;
  milestoneStatus?: string;
  ownerName?: string;
  deliverable?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GovMilestoneSaveParams {
  milestoneNo?: string;
  projectCode: string;
  milestoneCode?: string;
  milestoneName: string;
  planDate?: string;
  actualDate?: string;
  milestoneStatus?: string;
  ownerName?: string;
  deliverable?: string;
  orgName?: string;
  description?: string;
  remark?: string;
}

/* ---------------- 3. 项目治理：治理任务 ---------------- */

export interface GovTaskItem {
  id: number;
  taskNo?: string;
  projectCode?: string;
  milestoneCode?: string;
  taskName: string;
  taskType?: string;
  assignee?: string;
  planStart?: string;
  planEnd?: string;
  actualEnd?: string;
  progress?: number | null;
  taskStatus?: string;
  taskPriority?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GovTaskSaveParams {
  taskNo?: string;
  projectCode: string;
  milestoneCode?: string;
  taskName: string;
  taskType?: string;
  assignee?: string;
  planStart?: string;
  planEnd?: string;
  actualEnd?: string;
  progress?: number | null;
  taskStatus?: string;
  taskPriority?: string;
  orgName?: string;
  description?: string;
  remark?: string;
}

/* ---------------- 4. 项目治理：风险/问题/变更 ---------------- */

export interface GovRiskItem {
  id: number;
  riskNo?: string;
  projectCode?: string;
  riskTitle: string;
  riskType?: string;
  riskLevel?: string;
  probability?: string;
  impact?: string;
  mitigation?: string;
  riskStatus?: string;
  ownerName?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GovRiskSaveParams {
  riskNo?: string;
  projectCode: string;
  riskTitle: string;
  riskType?: string;
  riskLevel?: string;
  probability?: string;
  impact?: string;
  mitigation?: string;
  riskStatus?: string;
  ownerName?: string;
  orgName?: string;
  description?: string;
  remark?: string;
}

/* ---------------- 5. 现状盘点：存量系统 ---------------- */

export interface GovAsisSystemItem {
  id: number;
  systemNo?: string;
  systemCode?: string;
  systemName: string;
  systemType?: string;
  vendor?: string;
  deployMode?: string;
  userCount?: number | null;
  systemStatus?: string;
  migrateStrategy?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GovAsisSystemSaveParams {
  systemNo?: string;
  systemCode?: string;
  systemName: string;
  systemType?: string;
  vendor?: string;
  deployMode?: string;
  userCount?: number | null;
  systemStatus?: string;
  migrateStrategy?: string;
  orgName?: string;
  description?: string;
  remark?: string;
}

/* ---------------- 6. 现状盘点：盘点发现 ---------------- */

export interface GovAsisFindingItem {
  id: number;
  findingNo?: string;
  systemCode?: string;
  findingType?: string;
  findingTitle: string;
  findingDesc?: string;
  severity?: string;
  suggestion?: string;
  findingStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GovAsisFindingSaveParams {
  findingNo?: string;
  systemCode?: string;
  findingType?: string;
  findingTitle: string;
  findingDesc?: string;
  severity?: string;
  suggestion?: string;
  findingStatus?: string;
  orgName?: string;
  description?: string;
  remark?: string;
}

/* ---------------- 7. 流程建模：端到端流程 ---------------- */

export interface GovProcessItem {
  id: number;
  processNo?: string;
  processCode: string;
  processName: string;
  processType?: string;
  processLevel?: string;
  ownerDept?: string;
  processStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GovProcessSaveParams {
  processNo?: string;
  processCode: string;
  processName: string;
  processType?: string;
  processLevel?: string;
  ownerDept?: string;
  processStatus?: string;
  orgName?: string;
  description?: string;
  remark?: string;
}

/* ---------------- 8. 流程建模：流程节点 ---------------- */

export interface GovProcessNodeItem {
  id: number;
  nodeNo?: string;
  processCode?: string;
  nodeCode?: string;
  nodeName: string;
  nodeType?: string;
  seqNo?: number | null;
  roleName?: string;
  systemDomain?: string;
  inputArtifact?: string;
  outputArtifact?: string;
  nodeStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GovProcessNodeSaveParams {
  nodeNo?: string;
  processCode: string;
  nodeCode?: string;
  nodeName: string;
  nodeType?: string;
  seqNo?: number | null;
  roleName?: string;
  systemDomain?: string;
  inputArtifact?: string;
  outputArtifact?: string;
  nodeStatus?: string;
  orgName?: string;
  description?: string;
  remark?: string;
}

/* ---------------- 9. 需求追踪：需求 ---------------- */

export interface GovRequirementItem {
  id: number;
  reqNo?: string;
  reqCode?: string;
  reqName: string;
  reqType?: string;
  source?: string;
  bizModule?: string;
  reqPriority?: string;
  reqStatus?: string;
  acceptanceCriteria?: string;
  ownerName?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GovRequirementSaveParams {
  reqNo?: string;
  reqCode?: string;
  reqName: string;
  reqType?: string;
  source?: string;
  bizModule?: string;
  reqPriority?: string;
  reqStatus?: string;
  acceptanceCriteria?: string;
  ownerName?: string;
  orgName?: string;
  description?: string;
  remark?: string;
}

/* ---------------- 10. 需求追踪：追踪链接 ---------------- */

export interface GovTraceLinkItem {
  id: number;
  linkNo?: string;
  reqCode?: string;
  linkType?: string;
  targetRef?: string;
  targetName?: string;
  linkDesc?: string;
  linkStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GovTraceLinkSaveParams {
  linkNo?: string;
  reqCode: string;
  linkType?: string;
  targetRef?: string;
  targetName?: string;
  linkDesc?: string;
  linkStatus?: string;
  orgName?: string;
  description?: string;
  remark?: string;
}

/* ---------------- 11. 总体架构：架构组件 ---------------- */

export interface GovArchComponentItem {
  id: number;
  componentNo?: string;
  componentCode?: string;
  componentName: string;
  archLayer?: string;
  systemDomain?: string;
  componentType?: string;
  techStack?: string;
  deployUnit?: string;
  componentStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GovArchComponentSaveParams {
  componentNo?: string;
  componentCode?: string;
  componentName: string;
  archLayer?: string;
  systemDomain?: string;
  componentType?: string;
  techStack?: string;
  deployUnit?: string;
  componentStatus?: string;
  orgName?: string;
  description?: string;
  remark?: string;
}

/* ---------------- 12. 总体架构：架构关系 ---------------- */

export interface GovArchRelationItem {
  id: number;
  relationNo?: string;
  sourceComponent?: string;
  targetComponent?: string;
  relationType?: string;
  protocol?: string;
  relationDesc?: string;
  relationStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GovArchRelationSaveParams {
  relationNo?: string;
  sourceComponent: string;
  targetComponent: string;
  relationType?: string;
  protocol?: string;
  relationDesc?: string;
  relationStatus?: string;
  orgName?: string;
  description?: string;
  remark?: string;
}

/* ---------------- 枚举选项与文案 ---------------- */

/** 项目状态：PLANNING/ACTIVE/HOLDING/CLOSED。 */
export const GOV_PROJECT_STATUS_OPTIONS = [
  { label: '规划中', value: 'PLANNING' },
  { label: '进行中', value: 'ACTIVE' },
  { label: '暂挂', value: 'HOLDING' },
  { label: '已关闭', value: 'CLOSED' },
] as const;

export const GOV_PROJECT_STATUS_LABEL: Record<string, string> = {
  PLANNING: '规划中',
  ACTIVE: '进行中',
  HOLDING: '暂挂',
  CLOSED: '已关闭',
};

/** 里程碑状态：PENDING/IN_PROGRESS/DONE/DELAYED。 */
export const GOV_MILESTONE_STATUS_OPTIONS = [
  { label: '待启动', value: 'PENDING' },
  { label: '进行中', value: 'IN_PROGRESS' },
  { label: '已完成', value: 'DONE' },
  { label: '已延期', value: 'DELAYED' },
] as const;

export const GOV_MILESTONE_STATUS_LABEL: Record<string, string> = {
  PENDING: '待启动',
  IN_PROGRESS: '进行中',
  DONE: '已完成',
  DELAYED: '已延期',
};

/** 治理任务状态：TODO/DOING/DONE/BLOCKED。 */
export const GOV_TASK_STATUS_OPTIONS = [
  { label: '待办', value: 'TODO' },
  { label: '进行中', value: 'DOING' },
  { label: '已完成', value: 'DONE' },
  { label: '受阻', value: 'BLOCKED' },
] as const;

export const GOV_TASK_STATUS_LABEL: Record<string, string> = {
  TODO: '待办',
  DOING: '进行中',
  DONE: '已完成',
  BLOCKED: '受阻',
};

/** 优先级：P0/P1/P2/P3。 */
export const GOV_PRIORITY_OPTIONS = [
  { label: 'P0-最高', value: 'P0' },
  { label: 'P1-高', value: 'P1' },
  { label: 'P2-中', value: 'P2' },
  { label: 'P3-低', value: 'P3' },
] as const;

export const GOV_PRIORITY_LABEL: Record<string, string> = {
  P0: 'P0-最高',
  P1: 'P1-高',
  P2: 'P2-中',
  P3: 'P3-低',
};

/** 风险类型：RISK/ISSUE/CHANGE。 */
export const GOV_RISK_TYPE_OPTIONS = [
  { label: '风险', value: 'RISK' },
  { label: '问题', value: 'ISSUE' },
  { label: '变更', value: 'CHANGE' },
] as const;

export const GOV_RISK_TYPE_LABEL: Record<string, string> = {
  RISK: '风险',
  ISSUE: '问题',
  CHANGE: '变更',
};

/** 风险等级：HIGH/MEDIUM/LOW。 */
export const GOV_RISK_LEVEL_OPTIONS = [
  { label: '高', value: 'HIGH' },
  { label: '中', value: 'MEDIUM' },
  { label: '低', value: 'LOW' },
] as const;

export const GOV_RISK_LEVEL_LABEL: Record<string, string> = {
  HIGH: '高',
  MEDIUM: '中',
  LOW: '低',
};

/** 风险状态：OPEN/TRACKING/CLOSED。 */
export const GOV_RISK_STATUS_OPTIONS = [
  { label: '开启', value: 'OPEN' },
  { label: '跟踪中', value: 'TRACKING' },
  { label: '已关闭', value: 'CLOSED' },
] as const;

export const GOV_RISK_STATUS_LABEL: Record<string, string> = {
  OPEN: '开启',
  TRACKING: '跟踪中',
  CLOSED: '已关闭',
};

/** 存量系统类型：ERP/PLM/OA/MES/WMS/SRM/OTHER。 */
export const GOV_ASIS_SYSTEM_TYPE_OPTIONS = [
  { label: 'ERP', value: 'ERP' },
  { label: 'PLM', value: 'PLM' },
  { label: 'OA', value: 'OA' },
  { label: 'MES', value: 'MES' },
  { label: 'WMS', value: 'WMS' },
  { label: 'SRM', value: 'SRM' },
  { label: '其他', value: 'OTHER' },
] as const;

export const GOV_ASIS_SYSTEM_TYPE_LABEL: Record<string, string> = {
  ERP: 'ERP',
  PLM: 'PLM',
  OA: 'OA',
  MES: 'MES',
  WMS: 'WMS',
  SRM: 'SRM',
  OTHER: '其他',
};

/** 存量系统状态：ACTIVE/PLANNED/RETIRING/RETIRED。 */
export const GOV_ASIS_SYSTEM_STATUS_OPTIONS = [
  { label: '在用', value: 'ACTIVE' },
  { label: '规划中', value: 'PLANNED' },
  { label: '退役中', value: 'RETIRING' },
  { label: '已退役', value: 'RETIRED' },
] as const;

export const GOV_ASIS_SYSTEM_STATUS_LABEL: Record<string, string> = {
  ACTIVE: '在用',
  PLANNED: '规划中',
  RETIRING: '退役中',
  RETIRED: '已退役',
};

/** 发现类型：PROCESS/DATA/INTEGRATION/MANUAL/PAIN_POINT。 */
export const GOV_FINDING_TYPE_OPTIONS = [
  { label: '流程', value: 'PROCESS' },
  { label: '数据', value: 'DATA' },
  { label: '集成', value: 'INTEGRATION' },
  { label: '人工环节', value: 'MANUAL' },
  { label: '痛点', value: 'PAIN_POINT' },
] as const;

export const GOV_FINDING_TYPE_LABEL: Record<string, string> = {
  PROCESS: '流程',
  DATA: '数据',
  INTEGRATION: '集成',
  MANUAL: '人工环节',
  PAIN_POINT: '痛点',
};

/** 发现状态：OPEN/CONFIRMED/CLOSED。 */
export const GOV_FINDING_STATUS_OPTIONS = [
  { label: '待确认', value: 'OPEN' },
  { label: '已确认', value: 'CONFIRMED' },
  { label: '已关闭', value: 'CLOSED' },
] as const;

export const GOV_FINDING_STATUS_LABEL: Record<string, string> = {
  OPEN: '待确认',
  CONFIRMED: '已确认',
  CLOSED: '已关闭',
};

/** 严重程度：HIGH/MEDIUM/LOW。 */
export const GOV_SEVERITY_OPTIONS = [
  { label: '高', value: 'HIGH' },
  { label: '中', value: 'MEDIUM' },
  { label: '低', value: 'LOW' },
] as const;

export const GOV_SEVERITY_LABEL: Record<string, string> = {
  HIGH: '高',
  MEDIUM: '中',
  LOW: '低',
};

/** 流程类型：O2C/P2P/P2M/R2S/D2M。 */
export const GOV_PROCESS_TYPE_OPTIONS = [
  { label: '订单到收款', value: 'O2C' },
  { label: '采购到付款', value: 'P2P' },
  { label: '计划到生产', value: 'P2M' },
  { label: '收货到发运', value: 'R2S' },
  { label: '设计到量产', value: 'D2M' },
] as const;

export const GOV_PROCESS_TYPE_LABEL: Record<string, string> = {
  O2C: '订单到收款',
  P2P: '采购到付款',
  P2M: '计划到生产',
  R2S: '收货到发运',
  D2M: '设计到量产',
};

/** 流程层级：L0/L1/L2/L3。 */
export const GOV_PROCESS_LEVEL_OPTIONS = [
  { label: 'L0-价值链', value: 'L0' },
  { label: 'L1-流程域', value: 'L1' },
  { label: 'L2-子流程', value: 'L2' },
  { label: 'L3-作业', value: 'L3' },
] as const;

export const GOV_PROCESS_LEVEL_LABEL: Record<string, string> = {
  L0: 'L0-价值链',
  L1: 'L1-流程域',
  L2: 'L2-子流程',
  L3: 'L3-作业',
};

/** 流程状态：DRAFT/PUBLISHED/ARCHIVED。 */
export const GOV_PROCESS_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已发布', value: 'PUBLISHED' },
  { label: '已归档', value: 'ARCHIVED' },
] as const;

export const GOV_PROCESS_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  PUBLISHED: '已发布',
  ARCHIVED: '已归档',
};

/** 节点类型：START/ACTIVITY/DECISION/END。 */
export const GOV_NODE_TYPE_OPTIONS = [
  { label: '开始', value: 'START' },
  { label: '活动', value: 'ACTIVITY' },
  { label: '判断', value: 'DECISION' },
  { label: '结束', value: 'END' },
] as const;

export const GOV_NODE_TYPE_LABEL: Record<string, string> = {
  START: '开始',
  ACTIVITY: '活动',
  DECISION: '判断',
  END: '结束',
};

/** 节点状态：ACTIVE/DISABLED。 */
export const GOV_NODE_STATUS_OPTIONS = [
  { label: '生效', value: 'ACTIVE' },
  { label: '停用', value: 'DISABLED' },
] as const;

export const GOV_NODE_STATUS_LABEL: Record<string, string> = {
  ACTIVE: '生效',
  DISABLED: '停用',
};

/** 需求类型：BUSINESS/FUNCTIONAL/DATA/TECHNICAL。 */
export const GOV_REQ_TYPE_OPTIONS = [
  { label: '业务需求', value: 'BUSINESS' },
  { label: '功能需求', value: 'FUNCTIONAL' },
  { label: '数据需求', value: 'DATA' },
  { label: '技术需求', value: 'TECHNICAL' },
] as const;

export const GOV_REQ_TYPE_LABEL: Record<string, string> = {
  BUSINESS: '业务需求',
  FUNCTIONAL: '功能需求',
  DATA: '数据需求',
  TECHNICAL: '技术需求',
};

/** 需求状态：PROPOSED/APPROVED/IN_PROGRESS/DONE/REJECTED。 */
export const GOV_REQ_STATUS_OPTIONS = [
  { label: '已提出', value: 'PROPOSED' },
  { label: '已评审', value: 'APPROVED' },
  { label: '实现中', value: 'IN_PROGRESS' },
  { label: '已完成', value: 'DONE' },
  { label: '已驳回', value: 'REJECTED' },
] as const;

export const GOV_REQ_STATUS_LABEL: Record<string, string> = {
  PROPOSED: '已提出',
  APPROVED: '已评审',
  IN_PROGRESS: '实现中',
  DONE: '已完成',
  REJECTED: '已驳回',
};

/** 追踪链接类型：FUNCTION/DATA_API/TEST_CASE/ACCEPTANCE。 */
export const GOV_LINK_TYPE_OPTIONS = [
  { label: '功能', value: 'FUNCTION' },
  { label: '数据/API', value: 'DATA_API' },
  { label: '测试用例', value: 'TEST_CASE' },
  { label: '验收证据', value: 'ACCEPTANCE' },
] as const;

export const GOV_LINK_TYPE_LABEL: Record<string, string> = {
  FUNCTION: '功能',
  DATA_API: '数据/API',
  TEST_CASE: '测试用例',
  ACCEPTANCE: '验收证据',
};

/** 追踪链接状态：ACTIVE/DISABLED。 */
export const GOV_LINK_STATUS_OPTIONS = [
  { label: '生效', value: 'ACTIVE' },
  { label: '停用', value: 'DISABLED' },
] as const;

export const GOV_LINK_STATUS_LABEL: Record<string, string> = {
  ACTIVE: '生效',
  DISABLED: '停用',
};

/** 架构分层：APPLICATION/DATA/TECHNICAL/SECURITY。 */
export const GOV_ARCH_LAYER_OPTIONS = [
  { label: '应用层', value: 'APPLICATION' },
  { label: '数据层', value: 'DATA' },
  { label: '技术层', value: 'TECHNICAL' },
  { label: '安全层', value: 'SECURITY' },
] as const;

export const GOV_ARCH_LAYER_LABEL: Record<string, string> = {
  APPLICATION: '应用层',
  DATA: '数据层',
  TECHNICAL: '技术层',
  SECURITY: '安全层',
};

/** 组件状态：ACTIVE/DISABLED。 */
export const GOV_COMPONENT_STATUS_OPTIONS = [
  { label: '生效', value: 'ACTIVE' },
  { label: '停用', value: 'DISABLED' },
] as const;

export const GOV_COMPONENT_STATUS_LABEL: Record<string, string> = {
  ACTIVE: '生效',
  DISABLED: '停用',
};

/** 架构关系类型：CALL/DEPEND/SYNC/REPLICATE。 */
export const GOV_RELATION_TYPE_OPTIONS = [
  { label: '调用', value: 'CALL' },
  { label: '依赖', value: 'DEPEND' },
  { label: '同步', value: 'SYNC' },
  { label: '复制', value: 'REPLICATE' },
] as const;

export const GOV_RELATION_TYPE_LABEL: Record<string, string> = {
  CALL: '调用',
  DEPEND: '依赖',
  SYNC: '同步',
  REPLICATE: '复制',
};

/** 关系状态：ACTIVE/DISABLED。 */
export const GOV_RELATION_STATUS_OPTIONS = [
  { label: '生效', value: 'ACTIVE' },
  { label: '停用', value: 'DISABLED' },
] as const;

export const GOV_RELATION_STATUS_LABEL: Record<string, string> = {
  ACTIVE: '生效',
  DISABLED: '停用',
};
