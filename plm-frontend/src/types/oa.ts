import type { PageQuery } from './common';

/* ---------------- 通用枚举 ---------------- */

/** 岗位层级 */
export const OA_POSITION_LEVEL_OPTIONS = [
  { value: 'STAFF', label: '员工' },
  { value: 'SUPERVISOR', label: '主管' },
  { value: 'MANAGER', label: '经理' },
  { value: 'DIRECTOR', label: '总监' },
  { value: 'EXECUTIVE', label: '高管' },
];

export const OA_POSITION_LEVEL_LABEL: Record<string, string> = {
  STAFF: '员工',
  SUPERVISOR: '主管',
  MANAGER: '经理',
  DIRECTOR: '总监',
  EXECUTIVE: '高管',
};

/** 用工性质 */
export const OA_EMPLOYMENT_TYPE_OPTIONS = [
  { value: 'FULL_TIME', label: '全职' },
  { value: 'PART_TIME', label: '兼职' },
  { value: 'INTERN', label: '实习' },
  { value: 'OUTSOURCE', label: '外包' },
  { value: 'DISPATCH', label: '劳务派遣' },
];

export const OA_EMPLOYMENT_TYPE_LABEL: Record<string, string> = {
  FULL_TIME: '全职',
  PART_TIME: '兼职',
  INTERN: '实习',
  OUTSOURCE: '外包',
  DISPATCH: '劳务派遣',
};

/** 在职状态 */
export const OA_EMPLOYMENT_STATUS_OPTIONS = [
  { value: 'ACTIVE', label: '在职' },
  { value: 'PROBATION', label: '试用' },
  { value: 'SUSPENDED', label: '停薪留职' },
  { value: 'RESIGNED', label: '离职' },
  { value: 'RETIRED', label: '退休' },
];

export const OA_EMPLOYMENT_STATUS_LABEL: Record<string, string> = {
  ACTIVE: '在职',
  PROBATION: '试用',
  SUSPENDED: '停薪留职',
  RESIGNED: '离职',
  RETIRED: '退休',
};

export const OA_EMPLOYMENT_STATUS_COLOR: Record<string, string> = {
  ACTIVE: 'green',
  PROBATION: 'blue',
  SUSPENDED: 'orange',
  RESIGNED: 'default',
  RETIRED: 'default',
};

/** 代理授权范围 */
export const OA_DELEGATION_SCOPE_OPTIONS = [
  { value: 'ALL', label: '全部流程' },
  { value: 'PROCESS', label: '指定流程' },
];

export const OA_DELEGATION_SCOPE_LABEL: Record<string, string> = {
  ALL: '全部流程',
  PROCESS: '指定流程',
};

/** 代理授权状态 */
export const OA_DELEGATION_STATUS_OPTIONS = [
  { value: 'ACTIVE', label: '生效' },
  { value: 'REVOKED', label: '已撤回' },
  { value: 'EXPIRED', label: '已过期' },
];

export const OA_DELEGATION_STATUS_LABEL: Record<string, string> = {
  ACTIVE: '生效',
  REVOKED: '已撤回',
  EXPIRED: '已过期',
};

export const OA_DELEGATION_STATUS_COLOR: Record<string, string> = {
  ACTIVE: 'green',
  REVOKED: 'default',
  EXPIRED: 'orange',
};

/** 应用类型 */
export const OA_APPLICATION_TYPE_OPTIONS = [
  { value: 'INTERNAL', label: '内部系统' },
  { value: 'EXTERNAL', label: '外部系统' },
  { value: 'SAAS', label: 'SaaS 服务' },
  { value: 'TOOL', label: '工具类' },
];

export const OA_APPLICATION_TYPE_LABEL: Record<string, string> = {
  INTERNAL: '内部系统',
  EXTERNAL: '外部系统',
  SAAS: 'SaaS 服务',
  TOOL: '工具类',
};

/** 应用可见范围 */
export const OA_VISIBLE_SCOPE_OPTIONS = [
  { value: 'ALL', label: '全员可见' },
  { value: 'ORG', label: '指定部门' },
  { value: 'ROLE', label: '指定角色' },
];

export const OA_VISIBLE_SCOPE_LABEL: Record<string, string> = {
  ALL: '全员可见',
  ORG: '指定部门',
  ROLE: '指定角色',
};

/** 启用状态 */
export const OA_ENABLED_STATUS_OPTIONS = [
  { value: 'enabled', label: '启用' },
  { value: 'disabled', label: '停用' },
];

export const OA_ENABLED_STATUS_LABEL: Record<string, string> = {
  enabled: '启用',
  disabled: '停用',
};

export const OA_ENABLED_STATUS_COLOR: Record<string, string> = {
  enabled: 'green',
  disabled: 'default',
};

/** 是/否（1=是，0=否） */
export const OA_YES_NO_OPTIONS = [
  { value: 1, label: '是' },
  { value: 0, label: '否' },
];

/** 启用状态（1=启用，0=停用） */
export const OA_STATUS_OPTIONS = [
  { value: 1, label: '启用' },
  { value: 0, label: '停用' },
];

export const OA_STATUS_COLOR: Record<string, string> = {
  '1': 'green',
  '0': 'default',
};

/* ---------------- 岗位管理 ---------------- */

export interface OaPositionItem {
  id: number;
  positionCode: string;
  positionName: string;
  orgId?: number;
  positionLevel?: string;
  sortNo?: number;
  status: number;
  remark?: string;
  createdAt?: string;
}

export interface OaPositionQuery extends PageQuery {
  orgId?: number;
  status?: number;
}

export interface OaPositionSaveParams {
  positionCode: string;
  positionName: string;
  orgId?: number;
  positionLevel?: string;
  sortNo?: number;
  status?: number;
  remark?: string;
}

/* ---------------- 员工档案 ---------------- */

export interface OaEmploymentItem {
  id: number;
  employeeNo: string;
  userId?: number;
  employeeName: string;
  orgId?: number;
  positionId?: number;
  positionName?: string;
  employmentType?: string;
  employmentStatus?: string;
  hireDate?: string;
  leaveDate?: string;
  managerUserId?: number;
  workLocation?: string;
  remark?: string;
  createdAt?: string;
}

export interface OaEmploymentQuery extends PageQuery {
  orgId?: number;
  positionId?: number;
  employmentStatus?: string;
}

export interface OaEmploymentSaveParams {
  employeeNo: string;
  userId?: number;
  employeeName: string;
  orgId?: number;
  positionId?: number;
  positionName?: string;
  employmentType?: string;
  employmentStatus?: string;
  hireDate?: string;
  leaveDate?: string;
  managerUserId?: number;
  workLocation?: string;
  remark?: string;
}

/* ---------------- 流程代理授权 ---------------- */

export interface OaDelegationItem {
  id: number;
  delegationNo: string;
  delegatorUserId: number;
  delegatorName?: string;
  delegateUserId: number;
  delegateName?: string;
  applyScope?: string;
  processCode?: string;
  startAt?: string;
  endAt?: string;
  delegationStatus?: string;
  reason?: string;
  remark?: string;
  createdAt?: string;
}

export interface OaDelegationQuery extends PageQuery {
  delegatorUserId?: number;
  delegateUserId?: number;
  delegationStatus?: string;
}

export interface OaDelegationSaveParams {
  delegatorUserId?: number;
  delegateUserId?: number;
  applyScope?: string;
  processCode?: string;
  startAt?: string;
  endAt?: string;
  delegationStatus?: string;
  reason?: string;
  remark?: string;
}

/* ---------------- 应用中心 ---------------- */

export interface OaApplicationItem {
  id: number;
  appCode: string;
  appName: string;
  appType?: string;
  entryUrl?: string;
  icon?: string;
  appCategory?: string;
  visibleScope?: string;
  ssoEnabled?: number;
  sortNo?: number;
  status?: string;
  owner?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
}

export interface OaApplicationQuery extends PageQuery {
  appType?: string;
  appCategory?: string;
  status?: string;
}

export interface OaApplicationSaveParams {
  appCode: string;
  appName: string;
  appType?: string;
  entryUrl?: string;
  icon?: string;
  appCategory?: string;
  visibleScope?: string;
  ssoEnabled?: number;
  sortNo?: number;
  status?: string;
  owner?: string;
  description?: string;
  remark?: string;
}

/* ---------------- SSO 客户端 ---------------- */

export interface OaSsoClientItem {
  id: number;
  clientId: string;
  clientSecret?: string;
  clientName: string;
  redirectUri?: string;
  grantTypes?: string;
  scopes?: string;
  tokenTtlSeconds?: number;
  status?: string;
  remark?: string;
  createdAt?: string;
}

export interface OaSsoClientQuery extends PageQuery {
  status?: string;
}

export interface OaSsoClientSaveParams {
  clientId: string;
  clientSecret?: string;
  clientName: string;
  redirectUri?: string;
  grantTypes?: string;
  scopes?: string;
  tokenTtlSeconds?: number;
  status?: string;
  remark?: string;
}

/* ---------------- 门户首页 ---------------- */

export interface OaPortalApplicationItem {
  id: number;
  appCode: string;
  appName: string;
  appType?: string;
  entryUrl?: string;
  icon?: string;
  appCategory?: string;
  ssoEnabled?: number;
}

export interface OaPortalHome {
  userId: number;
  username: string;
  displayName?: string;
  roles?: string[];
  orgId?: number;
  organization?: string;
  myDelegationCount: number;
  delegatedToMeCount: number;
  applications?: OaPortalApplicationItem[];
}

/* ---------------- 表单与工作流引擎（OA-N3）---------------- */

/** 表单单据状态 */
export const OA_FORM_STATUS_OPTIONS = [
  { value: 'DRAFT', label: '草稿' },
  { value: 'PUBLISHED', label: '已发布' },
  { value: 'DISABLED', label: '已停用' },
];

export const OA_FORM_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  PUBLISHED: '已发布',
  DISABLED: '已停用',
};

export const OA_FORM_STATUS_COLOR: Record<string, string> = {
  DRAFT: 'default',
  PUBLISHED: 'green',
  DISABLED: 'orange',
};

/** 表单字段类型 */
export const OA_FIELD_TYPE_OPTIONS = [
  { value: 'TEXT', label: '单行文本' },
  { value: 'TEXTAREA', label: '多行文本' },
  { value: 'NUMBER', label: '数字' },
  { value: 'AMOUNT', label: '金额' },
  { value: 'DATE', label: '日期' },
  { value: 'DATETIME', label: '日期时间' },
  { value: 'SELECT', label: '下拉单选' },
  { value: 'MULTI_SELECT', label: '下拉多选' },
  { value: 'USER', label: '人员' },
  { value: 'ORG', label: '部门' },
];

export const OA_FIELD_TYPE_LABEL: Record<string, string> = {
  TEXT: '单行文本',
  TEXTAREA: '多行文本',
  NUMBER: '数字',
  AMOUNT: '金额',
  DATE: '日期',
  DATETIME: '日期时间',
  SELECT: '下拉单选',
  MULTI_SELECT: '下拉多选',
  USER: '人员',
  ORG: '部门',
};

/** 字段数据来源 */
export const OA_FIELD_DATA_SOURCE_OPTIONS = [
  { value: 'MANUAL', label: '手工输入' },
  { value: 'DICT', label: '数据字典' },
  { value: 'USER', label: '用户选择' },
  { value: 'ORG', label: '部门选择' },
  { value: 'FORMULA', label: '公式计算' },
];

export const OA_FIELD_DATA_SOURCE_LABEL: Record<string, string> = {
  MANUAL: '手工输入',
  DICT: '数据字典',
  USER: '用户选择',
  ORG: '部门选择',
  FORMULA: '公式计算',
};

/** 流程节点类型 */
export const OA_NODE_TYPE_OPTIONS = [
  { value: 'START', label: '开始' },
  { value: 'APPROVAL', label: '审批' },
  { value: 'CC', label: '抄送' },
  { value: 'END', label: '结束' },
];

export const OA_NODE_TYPE_LABEL: Record<string, string> = {
  START: '开始',
  APPROVAL: '审批',
  CC: '抄送',
  END: '结束',
};

export const OA_NODE_TYPE_COLOR: Record<string, string> = {
  START: 'default',
  APPROVAL: 'blue',
  CC: 'purple',
  END: 'default',
};

/** 节点审批人类型 */
export const OA_APPROVER_TYPE_OPTIONS = [
  { value: 'USER', label: '指定人员' },
  { value: 'ROLE', label: '指定角色' },
  { value: 'ORG_MANAGER', label: '部门负责人' },
  { value: 'APPLICANT_MANAGER', label: '申请人上级' },
  { value: 'PROCESS_STARTER', label: '发起人本人' },
];

export const OA_APPROVER_TYPE_LABEL: Record<string, string> = {
  USER: '指定人员',
  ROLE: '指定角色',
  ORG_MANAGER: '部门负责人',
  APPLICANT_MANAGER: '申请人上级',
  PROCESS_STARTER: '发起人本人',
};

/** 审批人参数填写提示 */
export const OA_APPROVER_VALUE_HINT: Record<string, string> = {
  USER: '请输入用户 ID，多个用逗号分隔',
  ROLE: '请输入角色 ID，多个用逗号分隔',
  ORG_MANAGER: '无需填写，系统取申请人所属部门负责人',
  APPLICANT_MANAGER: '无需填写，系统取申请人直属上级',
  PROCESS_STARTER: '无需填写，系统取流程发起人本人',
};

/** 流程实例状态 */
export const OA_INSTANCE_STATUS_OPTIONS = [
  { value: 'DRAFT', label: '草稿' },
  { value: 'RUNNING', label: '审批中' },
  { value: 'APPROVED', label: '已通过' },
  { value: 'REJECTED', label: '已驳回' },
  { value: 'CANCELLED', label: '已撤回' },
];

export const OA_INSTANCE_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  RUNNING: '审批中',
  APPROVED: '已通过',
  REJECTED: '已驳回',
  CANCELLED: '已撤回',
};

export const OA_INSTANCE_STATUS_COLOR: Record<string, string> = {
  DRAFT: 'default',
  RUNNING: 'processing',
  APPROVED: 'green',
  REJECTED: 'red',
  CANCELLED: 'orange',
};

/** 审批任务状态 */
export const OA_TASK_STATUS_OPTIONS = [
  { value: 'PENDING', label: '待处理' },
  { value: 'APPROVED', label: '已同意' },
  { value: 'REJECTED', label: '已驳回' },
  { value: 'TRANSFERRED', label: '已转办' },
  { value: 'CANCELLED', label: '已取消' },
];

export const OA_TASK_STATUS_LABEL: Record<string, string> = {
  PENDING: '待处理',
  APPROVED: '已同意',
  REJECTED: '已驳回',
  TRANSFERRED: '已转办',
  CANCELLED: '已取消',
};

export const OA_TASK_STATUS_COLOR: Record<string, string> = {
  PENDING: 'processing',
  APPROVED: 'green',
  REJECTED: 'red',
  TRANSFERRED: 'blue',
  CANCELLED: 'default',
};

/** 审批动作 */
export const OA_TASK_ACTION_LABEL: Record<string, string> = {
  SUBMIT: '提交',
  APPROVE: '同意',
  REJECT: '驳回',
  CANCEL: '撤回',
  TRANSFER: '转办',
  CC: '抄送',
  SKIP: '跳过',
};

export const OA_TASK_ACTION_COLOR: Record<string, string> = {
  SUBMIT: 'blue',
  APPROVE: 'green',
  REJECT: 'red',
  CANCEL: 'orange',
  TRANSFER: 'purple',
  CC: 'cyan',
  SKIP: 'default',
};

/* ---------------- 表单定义 ---------------- */

export interface OaFormDefinitionItem {
  id: number;
  formCode: string;
  formName: string;
  category?: string;
  versionNo?: number;
  status?: string;
  schemaJson?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
}

export interface OaFormFieldItem {
  id?: number;
  formId?: number;
  fieldCode: string;
  fieldName: string;
  fieldType?: string;
  requiredFlag?: number;
  dataSource?: string;
  sourceValue?: string;
  optionsJson?: string;
  rulesJson?: string;
  placeholder?: string;
  sortNo?: number;
  remark?: string;
}

export interface OaFormDetail {
  form: OaFormDefinitionItem;
  fields: OaFormFieldItem[];
}

export interface OaFormQuery extends PageQuery {
  category?: string;
  status?: string;
}

export interface OaFormSaveParams {
  formCode: string;
  formName: string;
  category?: string;
  status?: string;
  schemaJson?: string;
  description?: string;
  remark?: string;
  fields?: OaFormFieldItem[];
}

/* ---------------- 流程定义 ---------------- */

export interface OaProcessDefinitionItem {
  id: number;
  processCode: string;
  processName: string;
  formId?: number;
  category?: string;
  versionNo?: number;
  status?: string;
  definitionJson?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
}

export interface OaProcessNodeItem {
  id?: number;
  processId?: number;
  nodeCode: string;
  nodeName: string;
  nodeType?: string;
  approverType?: string;
  approverValue?: string;
  allowDelegate?: number;
  sortNo?: number;
  remark?: string;
}

export interface OaProcessDetail {
  process: OaProcessDefinitionItem;
  nodes: OaProcessNodeItem[];
}

export interface OaProcessQuery extends PageQuery {
  formId?: number;
  category?: string;
  status?: string;
}

export interface OaProcessSaveParams {
  processCode: string;
  processName: string;
  formId?: number;
  category?: string;
  status?: string;
  definitionJson?: string;
  description?: string;
  remark?: string;
  nodes?: OaProcessNodeItem[];
}

/* ---------------- 流程实例 ---------------- */

export interface OaProcessInstanceItem {
  id: number;
  instanceNo: string;
  processId?: number;
  processCode?: string;
  processName?: string;
  formId?: number;
  businessKey?: string;
  title?: string;
  applicantUserId?: number;
  applicantName?: string;
  instanceStatus?: string;
  currentNodeCode?: string;
  formDataJson?: string;
  submittedAt?: string;
  finishedAt?: string;
  remark?: string;
  createdAt?: string;
}

export interface OaTaskRecordItem {
  id: number;
  instanceId?: number;
  taskId?: number;
  nodeCode?: string;
  nodeName?: string;
  operatorUserId?: number;
  operatorName?: string;
  action?: string;
  commentText?: string;
  operatedAt?: string;
}

/** 实例详情内的待办任务明细 */
export interface OaPendingTaskItem {
  id: number;
  taskNo?: string;
  instanceId?: number;
  nodeCode?: string;
  nodeName?: string;
  assigneeUserId?: number;
  assigneeName?: string;
  taskStatus?: string;
  action?: string;
  commentText?: string;
  dueAt?: string;
  handledAt?: string;
  remark?: string;
  createdAt?: string;
}

export interface OaInstanceDetail {
  instance: OaProcessInstanceItem;
  records: OaTaskRecordItem[];
  pendingTasks: OaPendingTaskItem[];
}

export interface OaInstanceQuery extends PageQuery {
  processId?: number;
  applicantUserId?: number;
  instanceStatus?: string;
  category?: string;
}

export interface OaInstanceStartParams {
  processId: number;
  title?: string;
  businessKey?: string;
  formDataJson?: string;
  remark?: string;
}

/* ---------------- 审批任务 ---------------- */

export interface OaTaskItem {
  taskId: number;
  taskNo?: string;
  instanceId?: number;
  instanceNo?: string;
  processName?: string;
  title?: string;
  applicantName?: string;
  nodeCode?: string;
  nodeName?: string;
  taskStatus?: string;
  action?: string;
  commentText?: string;
  dueAt?: string;
  handledAt?: string;
  createdAt?: string;
}

export interface OaTaskQuery extends PageQuery {
  instanceId?: number;
  taskStatus?: string;
}

export interface OaTaskApproveParams {
  action: string;
  commentText?: string;
}

/* ---------------- 内部邮件与统一消息中心（OA-N4）---------------- */

/** 邮件文件夹类型 */
export const MAIL_FOLDER_TYPE_OPTIONS = [
  { value: 'SYSTEM', label: '系统文件夹' },
  { value: 'CUSTOM', label: '自定义文件夹' },
];

export const MAIL_FOLDER_TYPE_LABEL: Record<string, string> = {
  SYSTEM: '系统文件夹',
  CUSTOM: '自定义文件夹',
};

/** 系统文件夹编码 */
export const MAIL_SYSTEM_FOLDER_OPTIONS = [
  { value: 'INBOX', label: '收件箱' },
  { value: 'SENT', label: '已发送' },
  { value: 'DRAFT', label: '草稿箱' },
  { value: 'TRASH', label: '已删除' },
  { value: 'STARRED', label: '星标邮件' },
];

export const MAIL_SYSTEM_FOLDER_LABEL: Record<string, string> = {
  INBOX: '收件箱',
  SENT: '已发送',
  DRAFT: '草稿箱',
  TRASH: '已删除',
  STARRED: '星标邮件',
};

/** 邮件紧急程度 */
export const MAIL_PRIORITY_OPTIONS = [
  { value: 'LOW', label: '低' },
  { value: 'NORMAL', label: '普通' },
  { value: 'HIGH', label: '紧急' },
];

export const MAIL_PRIORITY_LABEL: Record<string, string> = {
  LOW: '低',
  NORMAL: '普通',
  HIGH: '紧急',
};

export const MAIL_PRIORITY_COLOR: Record<string, string> = {
  LOW: 'default',
  NORMAL: 'blue',
  HIGH: 'red',
};

/** 邮件状态 */
export const MAIL_MESSAGE_STATUS_OPTIONS = [
  { value: 'DRAFT', label: '草稿' },
  { value: 'SENT', label: '已发送' },
];

export const MAIL_MESSAGE_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  SENT: '已发送',
};

export const MAIL_MESSAGE_STATUS_COLOR: Record<string, string> = {
  DRAFT: 'default',
  SENT: 'green',
};

/** 收件类型 */
export const MAIL_RECIPIENT_TYPE_OPTIONS = [
  { value: 'TO', label: '收件人' },
  { value: 'CC', label: '抄送' },
  { value: 'BCC', label: '密送' },
];

export const MAIL_RECIPIENT_TYPE_LABEL: Record<string, string> = {
  TO: '收件人',
  CC: '抄送',
  BCC: '密送',
};

/** 邮件发送类型 */
export const MAIL_SEND_TYPE_LABEL: Record<string, string> = {
  NEW: '新建',
  REPLY: '回复',
  FORWARD: '转发',
};

/** 附件扫描状态 */
export const MAIL_SCAN_STATUS_OPTIONS = [
  { value: 'PENDING', label: '待扫描' },
  { value: 'CLEAN', label: '安全' },
  { value: 'INFECTED', label: '存在风险' },
];

export const MAIL_SCAN_STATUS_LABEL: Record<string, string> = {
  PENDING: '待扫描',
  CLEAN: '安全',
  INFECTED: '存在风险',
};

export const MAIL_SCAN_STATUS_COLOR: Record<string, string> = {
  PENDING: 'default',
  CLEAN: 'green',
  INFECTED: 'red',
};

/** 通知类型 */
export const NOTIFICATION_TYPE_OPTIONS = [
  { value: 'WORKFLOW', label: '流程待办' },
  { value: 'ANNOUNCEMENT', label: '公告' },
  { value: 'SYSTEM', label: '系统消息' },
  { value: 'INTEGRATION', label: '集成提醒' },
  { value: 'BUSINESS', label: '业务通知' },
];

export const NOTIFICATION_TYPE_LABEL: Record<string, string> = {
  WORKFLOW: '流程待办',
  ANNOUNCEMENT: '公告',
  SYSTEM: '系统消息',
  INTEGRATION: '集成提醒',
  BUSINESS: '业务通知',
};

export const NOTIFICATION_TYPE_COLOR: Record<string, string> = {
  WORKFLOW: 'blue',
  ANNOUNCEMENT: 'purple',
  SYSTEM: 'default',
  INTEGRATION: 'orange',
  BUSINESS: 'cyan',
};

/** 通知渠道 */
export const NOTIFICATION_CHANNEL_OPTIONS = [
  { value: 'STATION', label: '站内' },
  { value: 'EMAIL', label: '邮件' },
  { value: 'MOBILE', label: '移动推送' },
  { value: 'SMS', label: '短信' },
  { value: 'IM', label: '企业 IM' },
];

export const NOTIFICATION_CHANNEL_LABEL: Record<string, string> = {
  STATION: '站内',
  EMAIL: '邮件',
  MOBILE: '移动推送',
  SMS: '短信',
  IM: '企业 IM',
};

/** 通知发送状态 */
export const NOTIFICATION_SEND_STATUS_OPTIONS = [
  { value: 'PENDING', label: '待发送' },
  { value: 'SENT', label: '已发送' },
  { value: 'FAILED', label: '发送失败' },
];

export const NOTIFICATION_SEND_STATUS_LABEL: Record<string, string> = {
  PENDING: '待发送',
  SENT: '已发送',
  FAILED: '发送失败',
};

export const NOTIFICATION_SEND_STATUS_COLOR: Record<string, string> = {
  PENDING: 'orange',
  SENT: 'green',
  FAILED: 'red',
};

/* ---------------- 邮件文件夹 ---------------- */

export interface MailFolderItem {
  id: number;
  folderCode: string;
  folderName: string;
  folderType?: string;
  ownerUserId?: number;
  sortNo?: number;
  status?: string;
  remark?: string;
  createdAt?: string;
}

export interface MailFolderSaveParams {
  folderCode: string;
  folderName: string;
  sortNo?: number;
  remark?: string;
}

/* ---------------- 邮件列表与详情 ---------------- */

export interface MailItem {
  messageId: number;
  messageNo?: string;
  subject?: string;
  preview?: string;
  priority?: string;
  messageStatus?: string;
  senderName?: string;
  senderDept?: string;
  hasAttachment?: number;
  readFlag?: number;
  starFlag?: number;
  recipientSummary?: string;
  folderCode?: string;
  sentAt?: string;
  createdAt?: string;
}

export interface MailMessageDetail {
  id: number;
  messageNo?: string;
  subject?: string;
  content?: string;
  priority?: string;
  senderUserId?: number;
  senderName?: string;
  senderDept?: string;
  messageStatus?: string;
  hasAttachment?: number;
  parentMessageId?: number;
  sendType?: string;
  sentAt?: string;
  createdAt?: string;
  remark?: string;
}

export interface MailRecipientItem {
  recipientId: number;
  recipientUserId?: number;
  recipientName?: string;
  recipientType?: string;
  readFlag?: number;
  readAt?: string;
  starFlag?: number;
  deletedFlag?: number;
  folderCode?: string;
}

export interface MailAttachmentItem {
  attachmentId: number;
  fileName?: string;
  fileSize?: number;
  contentType?: string;
  fileHash?: string;
  scanStatus?: string;
  scanAt?: string;
  createdAt?: string;
}

export interface MailDetail {
  message: MailMessageDetail;
  recipients?: MailRecipientItem[];
  attachments?: MailAttachmentItem[];
  readFlag?: number;
  starFlag?: number;
  folderCode?: string;
}

export interface MailQuery extends PageQuery {
  folderCode?: string;
  priority?: string;
  readFlag?: number;
  starFlag?: number;
  senderKeyword?: string;
  hasAttachment?: number;
  startDate?: string;
  endDate?: string;
}

export interface MailSendParams {
  subject?: string;
  content?: string;
  priority?: string;
  recipientUserIds?: number[];
  ccUserIds?: number[];
  bccUserIds?: number[];
  attachmentIds?: number[];
  draftFlag?: boolean;
  draftId?: number;
  parentMessageId?: number;
  sendType: string;
  remark?: string;
}

/* ---------------- 消息中心 ---------------- */

export interface NotificationItem {
  id: number;
  notificationNo?: string;
  receiverUserId?: number;
  receiverName?: string;
  messageType?: string;
  title?: string;
  content?: string;
  bizType?: string;
  bizId?: number;
  bizNo?: string;
  linkUrl?: string;
  priority?: string;
  readFlag?: number;
  readAt?: string;
  archivedFlag?: number;
  templateCode?: string;
  channel?: string;
  sendStatus?: string;
  sentAt?: string;
  remark?: string;
  createdAt?: string;
}

export interface NotificationQueryParams extends PageQuery {
  messageType?: string;
  readFlag?: number;
  archivedFlag?: number;
  channel?: string;
  bizType?: string;
}

export interface NotificationBroadcastParams {
  receiverUserIds: number[];
  messageType?: string;
  title: string;
  content?: string;
  linkUrl?: string;
  priority?: string;
  templateCode?: string;
  channel?: string;
  remark?: string;
}

/* ---------------- 通知模板 ---------------- */

export interface NotifyTemplateItem {
  id: number;
  templateCode: string;
  templateName: string;
  messageType?: string;
  channel?: string;
  titleTemplate?: string;
  contentTemplate?: string;
  variableJson?: string;
  status?: string;
  remark?: string;
  createdAt?: string;
}

export interface NotifyTemplateQueryParams extends PageQuery {
  messageType?: string;
  channel?: string;
  status?: string;
}

export interface NotifyTemplateSaveParams {
  templateCode: string;
  templateName: string;
  messageType?: string;
  channel?: string;
  titleTemplate?: string;
  contentTemplate?: string;
  variableJson?: string;
  status?: string;
  remark?: string;
}

/* ---------------- 企业文档中心与知识管理（OA-N5）---------------- */

/** 文档目录类型 */
export const OA_DOC_FOLDER_TYPE_OPTIONS = [
  { value: 'PUBLIC', label: '公共目录' },
  { value: 'DEPARTMENT', label: '部门目录' },
  { value: 'PROJECT', label: '项目目录' },
  { value: 'PERSONAL', label: '个人目录' },
  { value: 'SHARED', label: '共享目录' },
  { value: 'ARCHIVE', label: '流程归档' },
  { value: 'KNOWLEDGE', label: '知识库' },
];

export const OA_DOC_FOLDER_TYPE_LABEL: Record<string, string> = {
  PUBLIC: '公共目录',
  DEPARTMENT: '部门目录',
  PROJECT: '项目目录',
  PERSONAL: '个人目录',
  SHARED: '共享目录',
  ARCHIVE: '流程归档',
  KNOWLEDGE: '知识库',
};

export const OA_DOC_FOLDER_TYPE_COLOR: Record<string, string> = {
  PUBLIC: 'blue',
  DEPARTMENT: 'geekblue',
  PROJECT: 'purple',
  PERSONAL: 'default',
  SHARED: 'cyan',
  ARCHIVE: 'orange',
  KNOWLEDGE: 'green',
};

/** 文档状态 */
export const OA_DOC_STATUS_OPTIONS = [
  { value: 'DRAFT', label: '草稿' },
  { value: 'IN_REVIEW', label: '审批中' },
  { value: 'PUBLISHED', label: '已发布' },
  { value: 'VOID', label: '已作废' },
  { value: 'ARCHIVED', label: '已归档' },
];

export const OA_DOC_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  IN_REVIEW: '审批中',
  PUBLISHED: '已发布',
  VOID: '已作废',
  ARCHIVED: '已归档',
};

export const OA_DOC_STATUS_COLOR: Record<string, string> = {
  DRAFT: 'default',
  IN_REVIEW: 'processing',
  PUBLISHED: 'green',
  VOID: 'red',
  ARCHIVED: 'orange',
};

/** 文档权限级别 */
export const OA_DOC_PERMISSION_LEVEL_OPTIONS = [
  { value: 'READ', label: '只读' },
  { value: 'WRITE', label: '可写' },
  { value: 'MANAGE', label: '管理' },
];

export const OA_DOC_PERMISSION_LEVEL_LABEL: Record<string, string> = {
  READ: '只读',
  WRITE: '可写',
  MANAGE: '管理',
};

export const OA_DOC_PERMISSION_LEVEL_COLOR: Record<string, string> = {
  READ: 'default',
  WRITE: 'blue',
  MANAGE: 'green',
};

/** 目录授权对象类型 */
export const OA_DOC_SUBJECT_TYPE_OPTIONS = [
  { value: 'ALL', label: '所有人' },
  { value: 'DEPT', label: '部门' },
  { value: 'ROLE', label: '角色' },
  { value: 'USER', label: '指定用户' },
];

export const OA_DOC_SUBJECT_TYPE_LABEL: Record<string, string> = {
  ALL: '所有人',
  DEPT: '部门',
  ROLE: '角色',
  USER: '指定用户',
};

/** 文档分享方式 */
export const OA_DOC_SHARE_TYPE_OPTIONS = [
  { value: 'INTERNAL', label: '内部分享' },
  { value: 'LINK', label: '链接分享' },
];

export const OA_DOC_SHARE_TYPE_LABEL: Record<string, string> = {
  INTERNAL: '内部分享',
  LINK: '链接分享',
};

export const OA_DOC_SHARE_TYPE_COLOR: Record<string, string> = {
  INTERNAL: 'blue',
  LINK: 'purple',
};

/** 文档访问动作 */
export const OA_DOC_ACCESS_ACTION_OPTIONS = [
  { value: 'VIEW', label: '查看' },
  { value: 'PREVIEW', label: '预览' },
  { value: 'DOWNLOAD', label: '下载' },
  { value: 'EDIT', label: '编辑' },
  { value: 'DELETE', label: '删除' },
  { value: 'SHARE', label: '分享' },
  { value: 'RESTORE', label: '恢复' },
];

export const OA_DOC_ACCESS_ACTION_LABEL: Record<string, string> = {
  VIEW: '查看',
  PREVIEW: '预览',
  DOWNLOAD: '下载',
  EDIT: '编辑',
  DELETE: '删除',
  SHARE: '分享',
  RESTORE: '恢复',
};

export const OA_DOC_ACCESS_ACTION_COLOR: Record<string, string> = {
  VIEW: 'default',
  PREVIEW: 'blue',
  DOWNLOAD: 'cyan',
  EDIT: 'geekblue',
  DELETE: 'red',
  SHARE: 'purple',
  RESTORE: 'green',
};

/** 文档来源类型 */
export const OA_DOC_SOURCE_TYPE_OPTIONS = [
  { value: 'MANUAL', label: '手工创建' },
  { value: 'WORKFLOW', label: '流程归档' },
  { value: 'MAIL', label: '邮件归档' },
  { value: 'IMPORT', label: '迁移导入' },
];

export const OA_DOC_SOURCE_TYPE_LABEL: Record<string, string> = {
  MANUAL: '手工创建',
  WORKFLOW: '流程归档',
  MAIL: '邮件归档',
  IMPORT: '迁移导入',
};

/** 文件扫描状态 */
export const OA_DOC_SCAN_STATUS_OPTIONS = [
  { value: 'PENDING', label: '待扫描' },
  { value: 'CLEAN', label: '安全' },
  { value: 'INFECTED', label: '存在风险' },
];

export const OA_DOC_SCAN_STATUS_LABEL: Record<string, string> = {
  PENDING: '待扫描',
  CLEAN: '安全',
  INFECTED: '存在风险',
};

export const OA_DOC_SCAN_STATUS_COLOR: Record<string, string> = {
  PENDING: 'default',
  CLEAN: 'green',
  INFECTED: 'red',
};

/** 知识库分类编码 */
export const OA_KNOWLEDGE_CATEGORY_OPTIONS = [
  { value: 'ISO', label: 'ISO 体系' },
  { value: 'LESSON', label: '经验教训库' },
  { value: 'CUSTOMER', label: '客户明示要求' },
  { value: 'QUALITY', label: '质量数据库' },
];

export const OA_KNOWLEDGE_CATEGORY_LABEL: Record<string, string> = {
  ISO: 'ISO 体系',
  LESSON: '经验教训库',
  CUSTOMER: '客户明示要求',
  QUALITY: '质量数据库',
};

/* ---------------- 文档目录 ---------------- */

export interface OaDocFolderItem {
  id: number;
  folderCode: string;
  folderName: string;
  folderType?: string;
  parentId?: number;
  folderPath?: string;
  folderLevel?: number;
  ownerUserId?: number;
  ownerDeptId?: number;
  categoryCode?: string;
  sortNo?: number;
  status?: string;
  remark?: string;
  childCount?: number;
  docCount?: number;
  effectivePermission?: string;
  createdAt?: string;
  children?: OaDocFolderItem[];
}

export interface OaDocFolderSaveParams {
  folderCode: string;
  folderName: string;
  folderType?: string;
  parentId?: number;
  ownerDeptId?: number;
  categoryCode?: string;
  sortNo?: number;
  status?: string;
  remark?: string;
}

/* ---------------- 目录权限 ---------------- */

export interface OaDocFolderPermissionItem {
  id: number;
  folderId?: number;
  subjectType?: string;
  subjectId?: number;
  subjectName?: string;
  permissionLevel?: string;
  inheritFlag?: number;
  remark?: string;
  createdAt?: string;
}

export interface OaDocFolderPermissionSaveParams {
  subjectType: string;
  subjectId?: number;
  permissionLevel: string;
  inheritFlag?: number;
  remark?: string;
}

/* ---------------- 文档主数据 ---------------- */

export interface OaDocumentItem {
  id: number;
  docNo?: string;
  title?: string;
  folderId?: number;
  folderName?: string;
  docType?: string;
  status?: string;
  sourceType?: string;
  sourceBizId?: number;
  sourceBizNo?: string;
  ownerUserId?: number;
  ownerName?: string;
  ownerDeptId?: number;
  ownerDeptName?: string;
  currentVersionId?: number;
  currentVersionNo?: number;
  fileName?: string;
  fileSize?: number;
  contentType?: string;
  summary?: string;
  keywords?: string;
  tags?: string;
  publishedAt?: string;
  archivedFlag?: number;
  viewCount?: number;
  downloadCount?: number;
  lockFlag?: number;
  extJson?: string;
  remark?: string;
  effectivePermission?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OaDocQuery extends PageQuery {
  folderId?: number;
  includeSub?: boolean;
  docType?: string;
  status?: string;
  ownerUserId?: number;
  tag?: string;
  startDate?: string;
  endDate?: string;
}

export interface OaDocSaveParams {
  title: string;
  folderId?: number;
  docType?: string;
  status?: string;
  sourceType?: string;
  sourceBizId?: number;
  sourceBizNo?: string;
  summary?: string;
  keywords?: string;
  tags?: string;
  extJson?: string;
  remark?: string;
  revisionNote?: string;
}

/* ---------------- 文档版本 ---------------- */

export interface OaDocVersionItem {
  versionId: number;
  docId?: number;
  versionNo?: number;
  revisionNote?: string;
  fileName?: string;
  fileSize?: number;
  contentType?: string;
  fileHash?: string;
  scanStatus?: string;
  publishedFlag?: number;
  currentFlag?: number;
  lockFlag?: number;
  uploadedByUserId?: number;
  uploadedByName?: string;
  createdAt?: string;
}

/* ---------------- 文档评论 ---------------- */

export interface OaDocCommentItem {
  id: number;
  docId?: number;
  versionId?: number;
  parentCommentId?: number;
  content?: string;
  mentionUserIds?: string;
  authorUserId?: number;
  authorName?: string;
  status?: string;
  createdAt?: string;
}

export interface OaDocCommentSaveParams {
  content: string;
  versionId?: number;
  parentCommentId?: number;
  mentionUserIds?: string;
  remark?: string;
}

/* ---------------- 文档分享 ---------------- */

export interface OaDocShareItem {
  id: number;
  shareNo?: string;
  docId?: number;
  shareType?: string;
  targetUserId?: number;
  targetUserName?: string;
  targetDeptId?: number;
  targetDeptName?: string;
  permissionLevel?: string;
  downloadAllowed?: number;
  expireAt?: string;
  revokedFlag?: number;
  viewCount?: number;
  expired?: boolean;
  remark?: string;
  createdBy?: number;
  createdAt?: string;
}

export interface OaDocShareSaveParams {
  shareType: string;
  targetUserId?: number;
  targetDeptId?: number;
  permissionLevel?: string;
  downloadAllowed?: number;
  expireDays?: number;
  remark?: string;
}

/* ---------------- 全文检索 ---------------- */

export interface OaDocSearchItem {
  indexId: number;
  sourceType?: string;
  sourceId?: number;
  bizNo?: string;
  title?: string;
  snippet?: string;
  keywords?: string;
  folderId?: number;
  docId?: number;
  ownerUserId?: number;
  indexedAt?: string;
}

export interface OaDocSearchQuery extends PageQuery {
  sourceType?: string;
  folderId?: number;
  includeSub?: boolean;
  ownerUserId?: number;
  startDate?: string;
  endDate?: string;
}

/* ---------------- 访问审计 ---------------- */

export interface OaDocAccessLogItem {
  id: number;
  docId?: number;
  versionId?: number;
  folderId?: number;
  userId?: number;
  userName?: string;
  action?: string;
  actionDetail?: string;
  clientIp?: string;
  userAgent?: string;
  occurredAt?: string;
  createdAt?: string;
}

export interface OaDocAccessLogQuery extends PageQuery {
  docId?: number;
  userId?: number;
  action?: string;
  startDate?: string;
  endDate?: string;
}

/* ---------------- 文档详情 ---------------- */

export interface OaDocDetail {
  doc: OaDocumentItem;
  versions?: OaDocVersionItem[];
  comments?: OaDocCommentItem[];
  shares?: OaDocShareItem[];
  effectivePermission?: string;
  downloadAllowed?: boolean;
}

/* ---------------- 通用行政人事与办公应用（OA-N6）---------------- */

/** 人事流程单审批状态 */
export const OA_HR_FLOW_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '审批中', value: 'RUNNING' },
  { label: '已通过', value: 'APPROVED' },
  { label: '已驳回', value: 'REJECTED' },
  { label: '已撤回', value: 'CANCELLED' },
] as const;

export const OA_HR_FLOW_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  RUNNING: '审批中',
  APPROVED: '已通过',
  REJECTED: '已驳回',
  CANCELLED: '已撤回',
};

/** 请假类型 */
export const OA_HR_LEAVE_TYPE_OPTIONS = [
  { label: '事假', value: 'PERSONAL' },
  { label: '病假', value: 'SICK' },
  { label: '年假', value: 'ANNUAL' },
  { label: '调休', value: 'COMPENSATORY' },
  { label: '婚假', value: 'MARRIAGE' },
  { label: '产假', value: 'MATERNITY' },
  { label: '陪产假', value: 'PATERNITY' },
] as const;

export const OA_HR_LEAVE_TYPE_LABEL: Record<string, string> = {
  PERSONAL: '事假',
  SICK: '病假',
  ANNUAL: '年假',
  COMPENSATORY: '调休',
  MARRIAGE: '婚假',
  MATERNITY: '产假',
  PATERNITY: '陪产假',
};

/** 加班类型 */
export const OA_HR_OVERTIME_TYPE_OPTIONS = [
  { label: '工作日加班', value: 'WORKDAY' },
  { label: '休息日加班', value: 'WEEKEND' },
  { label: '节假日加班', value: 'HOLIDAY' },
] as const;

export const OA_HR_OVERTIME_TYPE_LABEL: Record<string, string> = {
  WORKDAY: '工作日加班',
  WEEKEND: '休息日加班',
  HOLIDAY: '节假日加班',
};

/** 加班补偿方式 */
export const OA_HR_COMPENSATE_TYPE_OPTIONS = [
  { label: '调休', value: 'COMPENSATORY' },
  { label: '加班费', value: 'OVERTIME_PAY' },
] as const;

export const OA_HR_COMPENSATE_TYPE_LABEL: Record<string, string> = {
  COMPENSATORY: '调休',
  OVERTIME_PAY: '加班费',
};

/** 离职类型 */
export const OA_HR_RESIGNATION_TYPE_OPTIONS = [
  { label: '主动离职', value: 'VOLUNTARY' },
  { label: '协商解除', value: 'MUTUAL' },
  { label: '合同到期', value: 'EXPIRED' },
  { label: '辞退', value: 'TERMINATED' },
] as const;

export const OA_HR_RESIGNATION_TYPE_LABEL: Record<string, string> = {
  VOLUNTARY: '主动离职',
  MUTUAL: '协商解除',
  EXPIRED: '合同到期',
  TERMINATED: '辞退',
};

/** 访客状态 */
export const OA_HR_VISITOR_STATUS_OPTIONS = [
  { label: '已申请', value: 'APPLIED' },
  { label: '已批准', value: 'APPROVED' },
  { label: '已到访', value: 'CHECKED_IN' },
  { label: '已离开', value: 'CHECKED_OUT' },
  { label: '已拒绝', value: 'REJECTED' },
] as const;

export const OA_HR_VISITOR_STATUS_LABEL: Record<string, string> = {
  APPLIED: '已申请',
  APPROVED: '已批准',
  CHECKED_IN: '已到访',
  CHECKED_OUT: '已离开',
  REJECTED: '已拒绝',
};

/** 考勤异常类型 */
export const OA_HR_ATT_EXCEPTION_TYPE_OPTIONS = [
  { label: '迟到', value: 'LATE' },
  { label: '早退', value: 'EARLY_LEAVE' },
  { label: '缺卡', value: 'MISSING' },
  { label: '旷工', value: 'ABSENT' },
  { label: '其他', value: 'OTHER' },
] as const;

export const OA_HR_ATT_EXCEPTION_TYPE_LABEL: Record<string, string> = {
  LATE: '迟到',
  EARLY_LEAVE: '早退',
  MISSING: '缺卡',
  ABSENT: '旷工',
  OTHER: '其他',
};

/** 车辆类型 */
export const OA_HR_VEHICLE_TYPE_OPTIONS = [
  { label: '轿车', value: 'SEDAN' },
  { label: '商务车', value: 'MPV' },
  { label: '客车', value: 'BUS' },
  { label: '货车', value: 'TRUCK' },
  { label: '其他', value: 'OTHER' },
] as const;

export const OA_HR_VEHICLE_TYPE_LABEL: Record<string, string> = {
  SEDAN: '轿车',
  MPV: '商务车',
  BUS: '客车',
  TRUCK: '货车',
  OTHER: '其他',
};

/** 车辆状态 */
export const OA_HR_VEHICLE_STATUS_OPTIONS = [
  { label: '空闲', value: 'IDLE' },
  { label: '使用中', value: 'IN_USE' },
  { label: '维保中', value: 'MAINTENANCE' },
  { label: '停用', value: 'DISABLED' },
] as const;

export const OA_HR_VEHICLE_STATUS_LABEL: Record<string, string> = {
  IDLE: '空闲',
  IN_USE: '使用中',
  MAINTENANCE: '维保中',
  DISABLED: '停用',
};

/** 会议室预约状态 */
export const OA_MEETING_BOOKING_STATUS_OPTIONS = [
  { label: '已预约', value: 'BOOKED' },
  { label: '已取消', value: 'CANCELLED' },
  { label: '已完成', value: 'FINISHED' },
] as const;

export const OA_MEETING_BOOKING_STATUS_LABEL: Record<string, string> = {
  BOOKED: '已预约',
  CANCELLED: '已取消',
  FINISHED: '已完成',
};

/** 日程类型 */
export const OA_SCHEDULE_TYPE_OPTIONS = [
  { label: '个人日程', value: 'PERSONAL' },
  { label: '部门日程', value: 'DEPT' },
  { label: '共享日程', value: 'SHARED' },
] as const;

export const OA_SCHEDULE_TYPE_LABEL: Record<string, string> = {
  PERSONAL: '个人日程',
  DEPT: '部门日程',
  SHARED: '共享日程',
};

/** 日程共享范围 */
export const OA_SCHEDULE_SHARE_SCOPE_OPTIONS = [
  { label: '私有', value: 'PRIVATE' },
  { label: '部门可见', value: 'DEPT' },
  { label: '公开', value: 'PUBLIC' },
] as const;

export const OA_SCHEDULE_SHARE_SCOPE_LABEL: Record<string, string> = {
  PRIVATE: '私有',
  DEPT: '部门可见',
  PUBLIC: '公开',
};

/** 公告分类 */
export const OA_ANNOUNCEMENT_CATEGORY_OPTIONS = [
  { label: '公告', value: 'ANNOUNCEMENT' },
  { label: '新闻', value: 'NEWS' },
] as const;

export const OA_ANNOUNCEMENT_CATEGORY_LABEL: Record<string, string> = {
  ANNOUNCEMENT: '公告',
  NEWS: '新闻',
};

/** 发布范围 */
export const OA_PUBLISH_SCOPE_OPTIONS = [
  { label: '全员', value: 'ALL' },
  { label: '部门', value: 'DEPT' },
  { label: '角色', value: 'ROLE' },
  { label: '指定人员', value: 'USER' },
] as const;

export const OA_PUBLISH_SCOPE_LABEL: Record<string, string> = {
  ALL: '全员',
  DEPT: '部门',
  ROLE: '角色',
  USER: '指定人员',
};

/** 发布状态 */
export const OA_PUBLISH_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已发布', value: 'PUBLISHED' },
  { label: '已下线', value: 'OFFLINE' },
] as const;

export const OA_PUBLISH_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  PUBLISHED: '已发布',
  OFFLINE: '已下线',
};

/** 投票类型 */
export const OA_VOTE_TYPE_OPTIONS = [
  { label: '单选', value: 'SINGLE' },
  { label: '多选', value: 'MULTI' },
] as const;

export const OA_VOTE_TYPE_LABEL: Record<string, string> = {
  SINGLE: '单选',
  MULTI: '多选',
};

/** 投票状态 */
export const OA_VOTE_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '进行中', value: 'RUNNING' },
  { label: '已结束', value: 'CLOSED' },
] as const;

export const OA_VOTE_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  RUNNING: '进行中',
  CLOSED: '已结束',
};

/** 相册状态 */
export const OA_ALBUM_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已发布', value: 'PUBLISHED' },
  { label: '已归档', value: 'ARCHIVED' },
] as const;

export const OA_ALBUM_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  PUBLISHED: '已发布',
  ARCHIVED: '已归档',
};

/** 汇报类型 */
export const OA_REPORT_TYPE_OPTIONS = [
  { label: '日报', value: 'DAILY' },
  { label: '周报', value: 'WEEKLY' },
  { label: '月报', value: 'MONTHLY' },
] as const;

export const OA_REPORT_TYPE_LABEL: Record<string, string> = {
  DAILY: '日报',
  WEEKLY: '周报',
  MONTHLY: '月报',
};

/** 协作任务状态 */
export const OA_COLLAB_TASK_STATUS_OPTIONS = [
  { label: '待办', value: 'TODO' },
  { label: '进行中', value: 'DOING' },
  { label: '已完成', value: 'DONE' },
  { label: '已关闭', value: 'CLOSED' },
] as const;

export const OA_COLLAB_TASK_STATUS_LABEL: Record<string, string> = {
  TODO: '待办',
  DOING: '进行中',
  DONE: '已完成',
  CLOSED: '已关闭',
};

/** 协作任务优先级 */
export const OA_COLLAB_TASK_PRIORITY_OPTIONS = [
  { label: '低', value: 'LOW' },
  { label: '普通', value: 'NORMAL' },
  { label: '高', value: 'HIGH' },
  { label: '紧急', value: 'URGENT' },
] as const;

export const OA_COLLAB_TASK_PRIORITY_LABEL: Record<string, string> = {
  LOW: '低',
  NORMAL: '普通',
  HIGH: '高',
  URGENT: '紧急',
};

/** 移动端配置类型 */
export const OA_MOBILE_CONFIG_TYPE_OPTIONS = [
  { label: '菜单', value: 'MENU' },
  { label: '推送', value: 'PUSH' },
  { label: '策略', value: 'POLICY' },
] as const;

export const OA_MOBILE_CONFIG_TYPE_LABEL: Record<string, string> = {
  MENU: '菜单',
  PUSH: '推送',
  POLICY: '策略',
};

/* ---------------- 行政人事流程单（OA-N6）---------------- */

export interface OaHrFlowQuery extends PageQuery {
  flowStatus?: string;
  applicantUserId?: number;
  orgId?: number;
  startDate?: string;
  endDate?: string;
}

/** 人事流程单（请假/加班/离职/访客/考勤异常/用车 6 类单据共用响应结构） */
export interface OaHrFlowItem {
  id: number;
  leaveNo?: string;
  overtimeNo?: string;
  resignationNo?: string;
  visitorNo?: string;
  exceptionNo?: string;
  applyNo?: string;
  vehicleCode?: string;
  plateNo?: string;
  applicantUserId?: number;
  applicantName?: string;
  orgId?: number;
  orgName?: string;
  leaveType?: string;
  startTime?: string;
  endTime?: string;
  leaveDays?: number;
  overtimeType?: string;
  overtimeHours?: number;
  compensateType?: string;
  resignationType?: string;
  lastWorkDate?: string;
  handoverJson?: string;
  handoverUserId?: number;
  handoverUserName?: string;
  accountDisableFlag?: number;
  accountDisabled?: number;
  visitorName?: string;
  visitorCompany?: string;
  visitorPhone?: string;
  visitorCount?: number;
  visitReason?: string;
  visitArea?: string;
  visitStart?: string;
  visitEnd?: string;
  hostUserId?: number;
  hostName?: string;
  vehicleNo?: string;
  checkinAt?: string;
  checkoutAt?: string;
  exceptionType?: string;
  exceptionDate?: string;
  exceptionDesc?: string;
  applyReason?: string;
  handleResult?: string;
  vehicleId?: number;
  driverUserId?: number;
  driverName?: string;
  destination?: string;
  purpose?: string;
  passengerCount?: number;
  mileage?: number;
  costAmount?: number;
  reason?: string;
  attachmentJson?: string;
  flowStatus?: string;
  instanceId?: number;
  instanceNo?: string;
  cancelFlag?: number;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** 请假申请保存参数 */
export interface OaHrLeaveSaveParams {
  leaveType?: string;
  startTime?: string;
  endTime?: string;
  leaveDays?: number;
  reason?: string;
  attachmentJson?: string;
  remark?: string;
  submit?: boolean;
}

/** 加班申请保存参数 */
export interface OaHrOvertimeSaveParams {
  overtimeType?: string;
  startTime?: string;
  endTime?: string;
  overtimeHours?: number;
  compensateType?: string;
  reason?: string;
  attachmentJson?: string;
  remark?: string;
  submit?: boolean;
}

/** 离职申请保存参数 */
export interface OaHrResignationSaveParams {
  lastWorkDate?: string;
  resignationType?: string;
  reason?: string;
  handoverJson?: string;
  handoverUserId?: number;
  accountDisableFlag?: number;
  remark?: string;
  submit?: boolean;
}

/** 访客申请保存参数 */
export interface OaHrVisitorSaveParams {
  visitorName?: string;
  visitorCompany?: string;
  visitorPhone?: string;
  visitorCount?: number;
  visitReason?: string;
  visitArea?: string;
  visitStart?: string;
  visitEnd?: string;
  hostUserId?: number;
  vehicleNo?: string;
  remark?: string;
  submit?: boolean;
}

/** 考勤异常保存参数 */
export interface OaHrAttExceptionSaveParams {
  exceptionType?: string;
  exceptionDate?: string;
  exceptionDesc?: string;
  applyReason?: string;
  attachmentJson?: string;
  remark?: string;
  submit?: boolean;
}

/** 用车申请保存参数 */
export interface OaHrVehicleApplySaveParams {
  vehicleId?: number;
  driverUserId?: number;
  startTime?: string;
  endTime?: string;
  destination?: string;
  purpose?: string;
  passengerCount?: number;
  mileage?: number;
  costAmount?: number;
  remark?: string;
  submit?: boolean;
}

/* ---------------- 车辆档案（OA-N6）---------------- */

export interface OaHrVehicleItem {
  id: number;
  vehicleCode: string;
  plateNo: string;
  vehicleType?: string;
  brandModel?: string;
  seatCount?: number;
  driverUserId?: number;
  driverName?: string;
  vehicleStatus?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OaHrVehicleQuery extends PageQuery {
  vehicleStatus?: string;
}

export interface OaHrVehicleSaveParams {
  vehicleCode: string;
  plateNo: string;
  vehicleType?: string;
  brandModel?: string;
  seatCount?: number;
  driverUserId?: number;
  vehicleStatus?: string;
  remark?: string;
}

/* ---------------- 会议室与会议室预约（OA-N6）---------------- */

export interface OaMeetingRoomItem {
  id: number;
  roomCode: string;
  roomName: string;
  location?: string;
  capacity?: number;
  deviceJson?: string;
  roomStatus?: string;
  managerUserId?: number;
  managerName?: string;
  remark?: string;
  createdAt?: string;
}

export interface OaMeetingRoomQuery extends PageQuery {
  roomStatus?: string;
}

export interface OaMeetingRoomSaveParams {
  roomCode: string;
  roomName: string;
  location?: string;
  capacity?: number;
  deviceJson?: string;
  roomStatus?: string;
  managerUserId?: number;
  remark?: string;
}

export interface OaMeetingBookingItem {
  id: number;
  bookingNo: string;
  roomId: number;
  roomName?: string;
  subject: string;
  organizerUserId?: number;
  organizerName?: string;
  orgId?: number;
  startTime: string;
  endTime: string;
  attendeeJson?: string;
  attendeeCount?: number;
  bookingStatus?: string;
  remark?: string;
  createdAt?: string;
}

export interface OaMeetingBookingQuery extends PageQuery {
  roomId?: number;
  bookingStatus?: string;
  organizerUserId?: number;
  startDate?: string;
  endDate?: string;
}

export interface OaMeetingBookingSaveParams {
  roomId: number;
  subject: string;
  startTime: string;
  endTime: string;
  attendeeJson?: string;
  attendeeCount?: number;
  remark?: string;
}

/* ---------------- 日程（OA-N6）---------------- */

export interface OaScheduleItem {
  id: number;
  scheduleNo: string;
  ownerUserId: number;
  ownerName?: string;
  orgId?: number;
  title: string;
  scheduleType?: string;
  startTime: string;
  endTime?: string;
  allDayFlag?: number;
  location?: string;
  participantJson?: string;
  shareScope?: string;
  remindMinutes?: number;
  content?: string;
  scheduleStatus?: string;
  remark?: string;
  createdAt?: string;
}

export interface OaScheduleQuery extends PageQuery {
  scheduleType?: string;
  ownerUserId?: number;
  startDate?: string;
  endDate?: string;
}

export interface OaScheduleSaveParams {
  title: string;
  scheduleType?: string;
  startTime: string;
  endTime?: string;
  allDayFlag?: number;
  location?: string;
  participantJson?: string;
  shareScope?: string;
  remindMinutes?: number;
  content?: string;
  remark?: string;
}

/* ---------------- 公告与新闻（OA-N6）---------------- */

export interface OaAnnouncementItem {
  id: number;
  announcementNo: string;
  title: string;
  category?: string;
  content?: string;
  publishScope?: string;
  scopeValue?: string;
  publishStatus?: string;
  publishAt?: string;
  expireAt?: string;
  needReadFlag?: number;
  topFlag?: number;
  viewCount?: number;
  authorUserId?: number;
  authorName?: string;
  attachmentJson?: string;
  remark?: string;
  createdAt?: string;
  readFlag?: number;
}

export interface OaAnnouncementQuery extends PageQuery {
  category?: string;
  publishStatus?: string;
}

export interface OaAnnouncementSaveParams {
  title: string;
  category?: string;
  content?: string;
  publishScope?: string;
  scopeValue?: string;
  publishStatus?: string;
  publishAt?: string;
  expireAt?: string;
  needReadFlag?: number;
  topFlag?: number;
  attachmentJson?: string;
  remark?: string;
}

/* ---------------- 投票调查（OA-N6）---------------- */

export interface OaVoteItem {
  id: number;
  voteNo: string;
  title: string;
  description?: string;
  voteType?: string;
  anonymousFlag?: number;
  maxChoice?: number;
  startAt?: string;
  endAt?: string;
  voteStatus?: string;
  publishScope?: string;
  scopeValue?: string;
  creatorUserId?: number;
  creatorName?: string;
  remark?: string;
  createdAt?: string;
  totalVotes?: number;
  voted?: boolean;
}

export interface OaVoteOptionItem {
  id: number;
  voteId: number;
  optionText: string;
  voteCount?: number;
  sortNo?: number;
}

export interface OaVoteQuery extends PageQuery {
  voteStatus?: string;
}

export interface OaVoteSaveParams {
  title: string;
  description?: string;
  voteType?: string;
  anonymousFlag?: number;
  maxChoice?: number;
  startAt?: string;
  endAt?: string;
  voteStatus?: string;
  publishScope?: string;
  scopeValue?: string;
  options: string[];
  remark?: string;
}

/* ---------------- 相册（OA-N6）---------------- */

export interface OaAlbumItem {
  id: number;
  albumNo: string;
  albumName: string;
  category?: string;
  description?: string;
  coverPhotoId?: number;
  publishScope?: string;
  scopeValue?: string;
  albumStatus?: string;
  photoCount?: number;
  creatorUserId?: number;
  creatorName?: string;
  remark?: string;
  createdAt?: string;
}

export interface OaAlbumPhotoItem {
  id: number;
  albumId: number;
  fileId?: number;
  fileName?: string;
  fileSize?: number;
  contentType?: string;
  filePath?: string;
  description?: string;
  sortNo?: number;
  uploaderUserId?: number;
  uploaderName?: string;
  createdAt?: string;
}

export interface OaAlbumQuery extends PageQuery {
  albumStatus?: string;
}

export interface OaAlbumSaveParams {
  albumName: string;
  category?: string;
  description?: string;
  publishScope?: string;
  scopeValue?: string;
  albumStatus?: string;
  remark?: string;
}

export interface OaAlbumPhotoSaveParams {
  fileId?: number;
  fileName?: string;
  fileSize?: number;
  contentType?: string;
  filePath?: string;
  description?: string;
  sortNo?: number;
}

/* ---------------- 协作任务、评论与工作汇报（OA-N6）---------------- */

export interface OaCollabTaskItem {
  id: number;
  taskNo: string;
  title: string;
  content?: string;
  ownerUserId: number;
  ownerName?: string;
  orgId?: number;
  participantJson?: string;
  priority?: string;
  dueAt?: string;
  progress?: number;
  taskStatus?: string;
  parentId?: number;
  remark?: string;
  createdAt?: string;
}

export interface OaCollabTaskQuery extends PageQuery {
  taskStatus?: string;
  ownerUserId?: number;
}

export interface OaCollabTaskSaveParams {
  title: string;
  content?: string;
  ownerUserId?: number;
  participantJson?: string;
  priority?: string;
  dueAt?: string;
  progress?: number;
  taskStatus?: string;
  parentId?: number;
  remark?: string;
}

export interface OaCollabCommentItem {
  id: number;
  bizType: string;
  bizId: number;
  content?: string;
  authorUserId?: number;
  authorName?: string;
  parentId?: number;
  createdAt?: string;
}

export interface OaCollabCommentSaveParams {
  bizType: string;
  bizId: number;
  content?: string;
  parentId?: number;
}

export interface OaWorkReportItem {
  id: number;
  reportNo: string;
  reportType?: string;
  title: string;
  content?: string;
  reporterUserId?: number;
  reporterName?: string;
  orgId?: number;
  orgName?: string;
  reportDate?: string;
  receiverUserId?: number;
  receiverName?: string;
  attachmentJson?: string;
  reportStatus?: string;
  readFlag?: number;
  readAt?: string;
  remark?: string;
  createdAt?: string;
}

export interface OaWorkReportQuery extends PageQuery {
  reportType?: string;
  reporterUserId?: number;
  startDate?: string;
  endDate?: string;
}

export interface OaWorkReportSaveParams {
  reportType?: string;
  title: string;
  content?: string;
  reportDate?: string;
  receiverUserId?: number;
  attachmentJson?: string;
  remark?: string;
}

/* ---------------- 移动端配置与通讯录（OA-N6）---------------- */

export interface OaMobileConfigItem {
  id: number;
  configType?: string;
  configKey: string;
  configName: string;
  configValue?: string;
  icon?: string;
  sortNo?: number;
  configStatus?: string;
  remark?: string;
  createdAt?: string;
}

export interface OaMobileConfigQuery extends PageQuery {
  configType?: string;
  configStatus?: string;
}

export interface OaMobileConfigSaveParams {
  configType?: string;
  configKey: string;
  configName: string;
  configValue?: string;
  icon?: string;
  sortNo?: number;
  configStatus?: string;
  remark?: string;
}

/** 移动端工作台聚合数据 */
export interface OaMobileWorkbench {
  menus: OaMobileConfigItem[];
  policies: OaMobileConfigItem[];
  pendingTaskCount?: number;
  unreadNotificationCount?: number;
  unreadMailCount?: number;
}

export interface OaAddressBookItem {
  userId: number;
  username: string;
  displayName?: string;
  email?: string;
  phone?: string;
  employeeNo?: string;
  orgId?: number;
  orgName?: string;
  positionName?: string;
  employmentType?: string;
  employmentStatus?: string;
  managerUserId?: number;
  managerName?: string;
  workLocation?: string;
}

export interface OaAddressBookQuery {
  keyword?: string;
  orgId?: number;
  pageNum: number;
  pageSize: number;
}

/* ---------------- 销售采购生产品质研发流程（OA-N7）---------------- */

export interface OaBizFlowQuery extends PageQuery {
  flowStatus?: string;
  applicantUserId?: number;
  orgId?: number;
  startDate?: string;
  endDate?: string;
  typeCode?: string;
}

/**
 * OA-N7 业务流程单（15 类单据 + 子表）响应字段并集。
 * 字段名与后端实体（驼峰）保持一致，全部可选（id 必填）。
 */
export interface OaBizFlowItem {
  id: number;
  /* 客户授信（OA-DEV-062） */
  creditNo?: string;
  customerCode?: string;
  customerName?: string;
  creditType?: string;
  applyAmount?: number;
  creditLimit?: number;
  currency?: string;
  creditDays?: number;
  validFrom?: string;
  validTo?: string;
  riskLevel?: string;
  riskOpinion?: string;
  /* 价格审批（OA-DEV-063/071） */
  priceNo?: string;
  priceCategory?: string;
  changeType?: string;
  materialCode?: string;
  materialName?: string;
  supplierCode?: string;
  supplierName?: string;
  priceAmount?: number;
  oldPrice?: number;
  priceUnit?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  costBasis?: string;
  approvalOpinion?: string;
  /* 交期延误协调（OA-DEV-064） */
  coordNo?: string;
  orderNo?: string;
  demandQty?: number;
  originalDelivery?: string;
  promisedDelivery?: string;
  delayDays?: number;
  delayReason?: string;
  capacityNote?: string;
  shortageReason?: string;
  responsibleDept?: string;
  responsibleUserId?: number;
  responsibleName?: string;
  correctiveAction?: string;
  closeStatus?: string;
  closeTime?: string;
  /* 生产顺序表（OA-DEV-065） */
  sequenceNo?: string;
  sequenceName?: string;
  sequenceVersion?: number;
  planPeriod?: string;
  workshop?: string;
  planSource?: string;
  seqStatus?: string;
  itemCount?: number;
  publishTime?: string;
  publisherUserId?: number;
  publisherName?: string;
  ownerUserId?: number;
  ownerName?: string;
  /* 生产顺序表明细行（OA-DEV-065） */
  sequenceId?: number;
  lineNo?: number;
  planQty?: number;
  planStart?: string;
  planEnd?: string;
  workstation?: string;
  priorityNo?: number;
  /* 订货传票（OA-DEV-066/071） */
  voucherNo?: string;
  voucherType?: string;
  importFlag?: number;
  erpOrderNo?: string;
  qty?: number;
  unit?: string;
  deliveryDate?: string;
  amount?: number;
  tradeTerms?: string;
  /* 车间生产日报（OA-DEV-067） */
  reportNo?: string;
  reportDate?: string;
  shiftCode?: string;
  deptId?: number;
  deptName?: string;
  outputQty?: number;
  qualifiedQty?: number;
  defectQty?: number;
  completeRate?: number;
  downtimeMinutes?: number;
  abnormalDesc?: string;
  dataSource?: string;
  reconcileFlag?: number;
  reporterUserId?: number;
  reporterName?: string;
  reportStatus?: string;
  /* 供方考评（OA-DEV-068） */
  evalNo?: string;
  evalPeriod?: string;
  evalYear?: number;
  evalQuarter?: number;
  evalMonth?: number;
  evalItemCount?: number;
  totalScore?: number;
  grade?: string;
  evalBasis?: string;
  evalOpinion?: string;
  evaluatorUserId?: number;
  evaluatorName?: string;
  evalStatus?: string;
  /* 供方考评评分项（OA-DEV-068） */
  evaluationId?: number;
  itemCode?: string;
  itemName?: string;
  weight?: number;
  maxScore?: number;
  score?: number;
  scoreBasis?: string;
  sortNo?: number;
  /* 质量报表与指标（OA-DEV-069） */
  metricNo?: string;
  metricType?: string;
  metricCode?: string;
  metricName?: string;
  metricPeriod?: string;
  targetValue?: number;
  actualValue?: number;
  achieveRate?: number;
  calcFormula?: string;
  sourceRef?: string;
  refreshTime?: string;
  metricStatus?: string;
  /* 检测委托（OA-DEV-070） */
  requestNo?: string;
  requestDeptId?: number;
  requestDeptName?: string;
  requesterUserId?: number;
  requesterName?: string;
  batchNo?: string;
  sampleQty?: number;
  inspectionItems?: string;
  requireDate?: string;
  labName?: string;
  resultStatus?: string;
  resultDesc?: string;
  reportAttachmentJson?: string;
  qmsRefNo?: string;
  /* 5M 变更（OA-DEV-072） */
  changeNo?: string;
  changeCategory?: string;
  changeTitle?: string;
  productCode?: string;
  productName?: string;
  partCode?: string;
  partName?: string;
  changeDesc?: string;
  riskAnalysis?: string;
  verificationPlan?: string;
  verificationResult?: string;
  effectiveDate?: string;
  closeCondition?: string;
  /* 样品试制问题改善（OA-DEV-073） */
  issueNo?: string;
  projectCode?: string;
  projectName?: string;
  bomCode?: string;
  issueType?: string;
  issueDesc?: string;
  severity?: string;
  dueDate?: string;
  measure?: string;
  verifyResult?: string;
  issueStatus?: string;
  plmRefNo?: string;
  /* 内部审核（OA-DEV-074） */
  auditNo?: string;
  auditPlanName?: string;
  auditScope?: string;
  auditStandard?: string;
  auditStatus?: string;
  issueCount?: number;
  auditConclusion?: string;
  auditorNames?: string;
  auditedDeptName?: string;
  /* 内部审核不符合项（OA-DEV-074） */
  auditId?: number;
  issueLevel?: string;
  correctAction?: string;
  /* ECR 风险评审（OA-DEV-075） */
  ecrNo?: string;
  ecrTitle?: string;
  changeReason?: string;
  riskDesc?: string;
  impactAnalysis?: string;
  countermeasure?: string;
  reviewConclusion?: string;
  plmChangeNo?: string;
  plmChangeStatus?: string;
  /* 变更通知（OA-DEV-076） */
  noticeNo?: string;
  noticeType?: string;
  changeSource?: string;
  sourceRefNo?: string;
  docCode?: string;
  docName?: string;
  docVersion?: string;
  noticeTitle?: string;
  noticeContent?: string;
  receiverUserIds?: string;
  receiverNames?: string;
  receiptCount?: number;
  needReceipt?: number;
  /* 变更通知回执（OA-DEV-076） */
  noticeId?: number;
  receiverUserId?: number;
  receiverName?: string;
  receiptStatus?: string;
  receiptTime?: string;
  receiptRemark?: string;
  /* 新开模检查与零件试流（OA-DEV-077） */
  trialNo?: string;
  trialType?: string;
  moldCode?: string;
  moldName?: string;
  checkItems?: string;
  checkResult?: string;
  trialQty?: number;
  trialResult?: string;
  trialIssue?: string;
  verifyConclusion?: string;
  trialDate?: string;
  /* 公共字段 */
  applicantUserId?: number;
  applicantName?: string;
  orgId?: number;
  orgName?: string;
  attachmentJson?: string;
  flowStatus?: string;
  instanceId?: number;
  instanceNo?: string;
  cancelFlag?: number;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
  /* ---------------- 资产维修与专项业务应用（OA-N8）---------------- */
  /* 设备维修工单（OA-DEV-078） */
  repairNo?: string;
  assetCategory?: string;
  assetCode?: string;
  assetName?: string;
  assetModel?: string;
  location?: string;
  faultType?: string;
  faultDesc?: string;
  priority?: string;
  reportTime?: string;
  requireFinish?: string;
  repairStatus?: string;
  assigneeUserId?: number;
  assigneeName?: string;
  dispatchTime?: string;
  dispatchRemark?: string;
  faultCause?: string;
  repairMeasure?: string;
  spareParts?: string;
  workHours?: number;
  repairCost?: number;
  repairFinishTime?: string;
  repeatFlag?: number;
  acceptResult?: string;
  acceptOpinion?: string;
  acceptUserId?: number;
  acceptUserName?: string;
  acceptTime?: string;
  /* 维修知识库（OA-DEV-079） */
  knowledgeNo?: string;
  faultSymptom?: string;
  solution?: string;
  referenceCost?: number;
  sourceRepairNo?: string;
  keyword?: string;
  hitCount?: number;
  /* 合同与合约评审（OA-DEV-080） */
  contractNo?: string;
  contractName?: string;
  contractType?: string;
  partyA?: string;
  partyB?: string;
  signDate?: string;
  expireDate?: string;
  contractStatus?: string;
  legalReviewFlag?: number;
  reviewOpinion?: string;
  currentVersion?: number;
  archiveTime?: string;
  versionNo?: number;
  versionDesc?: string;
  changeSummary?: string;
  fileName?: string;
  /* 办公用品目录与台账（OA-DEV-081） */
  category?: string;
  specification?: string;
  unitPrice?: number;
  stockQty?: number;
  safetyStock?: number;
  needStock?: number;
  status?: number;
  /* 办公用品申请（OA-DEV-081） */
  purpose?: string;
  totalQty?: number;
  issueTime?: string;
  issueRemark?: string;
  requestId?: number;
  requestQty?: number;
  issueQty?: number;
  itemId?: number;
  /* 办公用品库存台账（OA-DEV-081） */
  txnType?: string;
  txnQty?: number;
  beforeQty?: number;
  afterQty?: number;
  sourceNo?: string;
  txnTime?: string;
  /* 图书档案与借阅（OA-DEV-082） */
  bookCode?: string;
  bookName?: string;
  author?: string;
  publisher?: string;
  isbn?: string;
  publishDate?: string;
  availableQty?: number;
  borrowNo?: string;
  bookId?: number;
  borrowerUserId?: number;
  borrowerName?: string;
  borrowDate?: string;
  returnDate?: string;
  renewCount?: number;
  borrowStatus?: string;
  overdueDays?: number;
  /* 客户档案与联系人（OA-DEV-083） */
  shortName?: string;
  customerLevel?: string;
  customerStatus?: string;
  industry?: string;
  region?: string;
  address?: string;
  creditCode?: string;
  taxNo?: string;
  salesOwnerUserId?: number;
  salesOwnerName?: string;
  contactCount?: number;
  erpRefNo?: string;
  contactName?: string;
  position?: string;
  phone?: string;
  mobile?: string;
  email?: string;
  isPrimary?: number;
  customerId?: number;
  /* 国际化与多工厂参数（OA-DEV-084） */
  localeCode?: string;
  localeName?: string;
  languageCode?: string;
  countryCode?: string;
  timezone?: string;
  dateFormat?: string;
  timeFormat?: string;
  numberFormat?: string;
  currencyCode?: string;
  isDefault?: number;
  messageKey?: string;
  messageValue?: string;
  module?: string;
  factoryCode?: string;
  factoryName?: string;
  paramKey?: string;
  paramValue?: string;
  /* 日志中心与移动后台（OA-DEV-085） */
  logType?: string;
  logLevel?: string;
  logModule?: string;
  logTitle?: string;
  logContent?: string;
  bizType?: string;
  bizId?: string;
  requestUri?: string;
  httpMethod?: string;
  ipAddress?: string;
  userAgent?: string;
  errorStack?: string;
  alertFlag?: number;
  alertStatus?: string;
  handleRemark?: string;
  costMs?: number;
  logTime?: string;
  sessionNo?: string;
  userId?: number;
  userName?: string;
  operatorUserId?: number;
  operatorName?: string;
  deviceId?: string;
  deviceModel?: string;
  osVersion?: string;
  appVersion?: string;
  clientType?: string;
  loginIp?: string;
  pushToken?: string;
  loginTime?: string;
  lastActiveTime?: string;
  expireTime?: string;
  sessionStatus?: string;
  revokeReason?: string;
}

/** OA-N8 字典选项与展示映射。 */
export const OA_ASSET_CATEGORY_OPTIONS = [
  { label: '机工设备', value: 'MACHINE' },
  { label: '模具', value: 'MOLD' },
  { label: '测试仪表/量具/夹具', value: 'GAUGE' },
  { label: '电脑', value: 'COMPUTER' },
] as const;

export const OA_ASSET_CATEGORY_LABEL: Record<string, string> = {
  MACHINE: '机工设备',
  MOLD: '模具',
  GAUGE: '测试仪表/量具/夹具',
  COMPUTER: '电脑',
};

export const OA_REPAIR_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '待派工', value: 'PENDING_DISPATCH' },
  { label: '已派工', value: 'DISPATCHED' },
  { label: '已处理', value: 'HANDLED' },
  { label: '已验收', value: 'ACCEPTED' },
  { label: '已关闭', value: 'CLOSED' },
] as const;

export const OA_REPAIR_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  PENDING_DISPATCH: '待派工',
  DISPATCHED: '已派工',
  HANDLED: '已处理',
  ACCEPTED: '已验收',
  CLOSED: '已关闭',
};

export const OA_REPAIR_STATUS_COLOR: Record<string, string> = {
  DRAFT: 'default',
  PENDING_DISPATCH: 'orange',
  DISPATCHED: 'blue',
  HANDLED: 'cyan',
  ACCEPTED: 'green',
  CLOSED: 'default',
};

export const OA_REPAIR_PRIORITY_OPTIONS = [
  { label: '低', value: 'LOW' },
  { label: '普通', value: 'NORMAL' },
  { label: '高', value: 'HIGH' },
  { label: '紧急', value: 'URGENT' },
] as const;

export const OA_REPAIR_PRIORITY_LABEL: Record<string, string> = {
  LOW: '低',
  NORMAL: '普通',
  HIGH: '高',
  URGENT: '紧急',
};

export const OA_CONTRACT_TYPE_OPTIONS = [
  { label: '销售合同', value: 'SALES' },
  { label: '采购合同', value: 'PURCHASE' },
  { label: '服务合同', value: 'SERVICE' },
  { label: '其他', value: 'OTHER' },
] as const;

export const OA_CONTRACT_TYPE_LABEL: Record<string, string> = {
  SALES: '销售合同',
  PURCHASE: '采购合同',
  SERVICE: '服务合同',
  OTHER: '其他',
};

export const OA_CONTRACT_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '生效中', value: 'EFFECTIVE' },
  { label: '已到期', value: 'EXPIRED' },
  { label: '已归档', value: 'ARCHIVED' },
  { label: '已终止', value: 'TERMINATED' },
] as const;

export const OA_CONTRACT_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  EFFECTIVE: '生效中',
  EXPIRED: '已到期',
  ARCHIVED: '已归档',
  TERMINATED: '已终止',
};

export const OA_CONTRACT_STATUS_COLOR: Record<string, string> = {
  DRAFT: 'default',
  EFFECTIVE: 'green',
  EXPIRED: 'orange',
  ARCHIVED: 'blue',
  TERMINATED: 'red',
};

export const OA_SUPPLY_ISSUE_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '部分发放', value: 'PARTIAL' },
  { label: '已发放', value: 'ISSUED' },
] as const;

export const OA_SUPPLY_ISSUE_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  PARTIAL: '部分发放',
  ISSUED: '已发放',
};

export const OA_SUPPLY_ISSUE_STATUS_COLOR: Record<string, string> = {
  DRAFT: 'default',
  PARTIAL: 'orange',
  ISSUED: 'green',
};

export const OA_SUPPLY_TXN_TYPE_LABEL: Record<string, string> = {
  IN: '入库',
  OUT: '出库',
  ISSUE: '发放',
  RETURN: '退回',
};

export const OA_LIBRARY_BORROW_STATUS_OPTIONS = [
  { label: '借出中', value: 'BORROWED' },
  { label: '已归还', value: 'RETURNED' },
  { label: '已逾期', value: 'OVERDUE' },
] as const;

export const OA_LIBRARY_BORROW_STATUS_LABEL: Record<string, string> = {
  BORROWED: '借出中',
  RETURNED: '已归还',
  OVERDUE: '已逾期',
};

export const OA_LIBRARY_BORROW_STATUS_COLOR: Record<string, string> = {
  BORROWED: 'blue',
  RETURNED: 'green',
  OVERDUE: 'red',
};

export const OA_CUSTOMER_LEVEL_OPTIONS = [
  { label: '重点客户', value: 'KEY' },
  { label: '普通客户', value: 'NORMAL' },
  { label: '潜在客户', value: 'POTENTIAL' },
] as const;

export const OA_CUSTOMER_LEVEL_LABEL: Record<string, string> = {
  KEY: '重点客户',
  NORMAL: '普通客户',
  POTENTIAL: '潜在客户',
};

export const OA_CUSTOMER_STATUS_OPTIONS = [
  { label: '合作中', value: 'ACTIVE' },
  { label: '已停用', value: 'INACTIVE' },
  { label: '黑名单', value: 'BLACKLIST' },
] as const;

export const OA_CUSTOMER_STATUS_LABEL: Record<string, string> = {
  ACTIVE: '合作中',
  INACTIVE: '已停用',
  BLACKLIST: '黑名单',
};

export const OA_CUSTOMER_STATUS_COLOR: Record<string, string> = {
  ACTIVE: 'green',
  INACTIVE: 'default',
  BLACKLIST: 'red',
};

export const OA_LOG_TYPE_OPTIONS = [
  { label: '登录日志', value: 'LOGIN' },
  { label: '操作日志', value: 'OPERATION' },
  { label: '业务日志', value: 'BUSINESS' },
  { label: '异常日志', value: 'EXCEPTION' },
] as const;

export const OA_LOG_TYPE_LABEL: Record<string, string> = {
  LOGIN: '登录日志',
  OPERATION: '操作日志',
  BUSINESS: '业务日志',
  EXCEPTION: '异常日志',
};

export const OA_LOG_LEVEL_OPTIONS = [
  { label: 'DEBUG', value: 'DEBUG' },
  { label: 'INFO', value: 'INFO' },
  { label: 'WARN', value: 'WARN' },
  { label: 'ERROR', value: 'ERROR' },
] as const;

export const OA_LOG_LEVEL_LABEL: Record<string, string> = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
};

export const OA_LOG_LEVEL_COLOR: Record<string, string> = {
  DEBUG: 'default',
  INFO: 'blue',
  WARN: 'orange',
  ERROR: 'red',
};

export const OA_MOBILE_SESSION_STATUS_OPTIONS = [
  { label: '在线', value: 'ACTIVE' },
  { label: '已注销', value: 'REVOKED' },
  { label: '已过期', value: 'EXPIRED' },
] as const;

export const OA_MOBILE_SESSION_STATUS_LABEL: Record<string, string> = {
  ACTIVE: '在线',
  REVOKED: '已注销',
  EXPIRED: '已过期',
};

export const OA_MOBILE_SESSION_STATUS_COLOR: Record<string, string> = {
  ACTIVE: 'green',
  REVOKED: 'default',
  EXPIRED: 'orange',
};

/** 设备维修工单保存参数（OA-DEV-078） */
export interface OaAssetRepairSaveParams {
  assetCategory?: string;
  assetCode?: string;
  assetName?: string;
  assetModel?: string;
  location?: string;
  faultType?: string;
  faultDesc?: string;
  priority?: string;
  requireFinish?: string;
  attachmentJson?: string;
  remark?: string;
  submit?: boolean;
}

/** 设备维修派工参数（OA-DEV-078） */
export interface OaAssetRepairDispatchParams {
  assigneeUserId: number;
  assigneeName?: string;
  dispatchRemark?: string;
}

/** 设备维修处理参数（OA-DEV-078） */
export interface OaAssetRepairHandleParams {
  faultCause?: string;
  repairMeasure: string;
  spareParts?: string;
  workHours?: number;
  repairCost?: number;
  downtimeMinutes?: number;
  repeatFlag?: boolean;
}

/** 设备维修验收参数（OA-DEV-078） */
export interface OaAssetRepairAcceptParams {
  acceptResult: string;
  acceptOpinion?: string;
}

/** 维修知识库保存参数（OA-DEV-079） */
export interface OaAssetKnowledgeSaveParams {
  assetCategory?: string;
  faultType?: string;
  faultSymptom?: string;
  faultCause?: string;
  solution?: string;
  spareParts?: string;
  referenceCost?: number;
  sourceRepairNo?: string;
  keyword?: string;
  remark?: string;
}

/** 合同保存参数（OA-DEV-080） */
export interface OaContractSaveParams {
  contractName?: string;
  contractType?: string;
  customerCode?: string;
  supplierCode?: string;
  partyA?: string;
  partyB?: string;
  amount?: number;
  currency?: string;
  signDate?: string;
  effectiveDate?: string;
  expireDate?: string;
  legalReviewFlag?: boolean;
  attachmentJson?: string;
  remark?: string;
  submit?: boolean;
}

/** 合同版本保存参数（OA-DEV-080） */
export interface OaContractVersionSaveParams {
  versionDesc?: string;
  changeSummary?: string;
  fileName?: string;
  attachmentJson?: string;
}

/** 办公用品目录保存参数（OA-DEV-081） */
export interface OaOfficeSupplyItemSaveParams {
  itemCode?: string;
  itemName?: string;
  category?: string;
  specification?: string;
  unit?: string;
  unitPrice?: number;
  stockQty?: number;
  safetyStock?: number;
  needStock?: boolean;
  status?: number;
  remark?: string;
}

/** 办公用品申请明细参数（OA-DEV-081） */
export interface OaOfficeSupplyRequestItemParams {
  itemId?: number;
  itemCode?: string;
  itemName?: string;
  unit?: string;
  requestQty?: number;
}

/** 办公用品申请保存参数（OA-DEV-081） */
export interface OaOfficeSupplyRequestSaveParams {
  requireDate?: string;
  purpose?: string;
  receiverName?: string;
  attachmentJson?: string;
  remark?: string;
  items?: OaOfficeSupplyRequestItemParams[];
  submit?: boolean;
}

/** 图书档案保存参数（OA-DEV-082） */
export interface OaLibraryBookSaveParams {
  bookCode?: string;
  bookName?: string;
  author?: string;
  publisher?: string;
  isbn?: string;
  category?: string;
  publishDate?: string;
  location?: string;
  totalQty?: number;
  status?: number;
  remark?: string;
}

/** 图书借阅保存参数（OA-DEV-082） */
export interface OaLibraryBorrowSaveParams {
  bookId: number;
  borrowDate?: string;
  dueDate?: string;
  remark?: string;
}

/** 客户档案保存参数（OA-DEV-083） */
export interface OaCustomerSaveParams {
  customerCode?: string;
  customerName?: string;
  shortName?: string;
  customerLevel?: string;
  customerStatus?: string;
  industry?: string;
  region?: string;
  address?: string;
  creditCode?: string;
  taxNo?: string;
  salesOwnerUserId?: number;
  salesOwnerName?: string;
  erpRefNo?: string;
  remark?: string;
}

/** 客户联系人保存参数（OA-DEV-083） */
export interface OaCustomerContactSaveParams {
  contactName: string;
  position?: string;
  phone?: string;
  mobile?: string;
  email?: string;
  isPrimary?: boolean;
  remark?: string;
}

/** 语言区域保存参数（OA-DEV-084） */
export interface OaI18nLocaleSaveParams {
  localeCode?: string;
  localeName?: string;
  languageCode?: string;
  countryCode?: string;
  timezone?: string;
  dateFormat?: string;
  timeFormat?: string;
  numberFormat?: string;
  currencyCode?: string;
  isDefault?: boolean;
  status?: number;
  remark?: string;
}

/** 语言包保存参数（OA-DEV-084） */
export interface OaI18nMessageSaveParams {
  localeCode?: string;
  messageKey?: string;
  messageValue?: string;
  module?: string;
  remark?: string;
}

/** 工厂参数保存参数（OA-DEV-084） */
export interface OaFactoryParamSaveParams {
  factoryCode?: string;
  factoryName?: string;
  countryCode?: string;
  timezone?: string;
  localeCode?: string;
  paramKey?: string;
  paramValue?: string;
  status?: number;
  remark?: string;
}

/** 系统日志登记参数（OA-DEV-085） */
export interface OaSysLogSaveParams {
  logType?: string;
  logLevel?: string;
  logModule?: string;
  logTitle?: string;
  logContent?: string;
  bizType?: string;
  bizId?: string;
  alertFlag?: boolean;
  remark?: string;
}
export interface OaBizCustomerCreditSaveParams {
  customerCode?: string;
  customerName?: string;
  creditType?: string;
  applyAmount?: number;
  creditLimit?: number;
  currency?: string;
  creditDays?: number;
  validFrom?: string;
  validTo?: string;
  riskLevel?: string;
  riskOpinion?: string;
  attachmentJson?: string;
  remark?: string;
  submit?: boolean;
}

/** 价格审批保存参数（OA-DEV-063/071） */
export interface OaBizPriceApprovalSaveParams {
  priceCategory?: string;
  changeType?: string;
  materialCode?: string;
  materialName?: string;
  customerCode?: string;
  customerName?: string;
  supplierCode?: string;
  supplierName?: string;
  priceAmount?: number;
  oldPrice?: number;
  currency?: string;
  priceUnit?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  costBasis?: string;
  attachmentJson?: string;
  remark?: string;
  submit?: boolean;
}

/** 交期延误协调单保存参数（OA-DEV-064） */
export interface OaBizDeliveryCoordinationSaveParams {
  orderNo?: string;
  customerCode?: string;
  customerName?: string;
  materialCode?: string;
  materialName?: string;
  demandQty?: number;
  originalDelivery?: string;
  promisedDelivery?: string;
  delayReason?: string;
  capacityNote?: string;
  shortageReason?: string;
  responsibleDept?: string;
  responsibleUserId?: number;
  responsibleName?: string;
  correctiveAction?: string;
  attachmentJson?: string;
  remark?: string;
  submit?: boolean;
}

/** 生产顺序表明细行保存参数（OA-DEV-065） */
export interface OaBizProductionSequenceItemParams {
  orderNo?: string;
  materialCode?: string;
  materialName?: string;
  planQty?: number;
  planStart?: string;
  planEnd?: string;
  workstation?: string;
  priorityNo?: number;
  remark?: string;
}

/** 生产顺序表保存参数（OA-DEV-065，无流程） */
export interface OaBizProductionSequenceSaveParams {
  sequenceName?: string;
  sequenceVersion?: number;
  planPeriod?: string;
  workshop?: string;
  planSource?: string;
  ownerUserId?: number;
  ownerName?: string;
  remark?: string;
  items?: OaBizProductionSequenceItemParams[];
}

/** 订货传票保存参数（OA-DEV-066/071） */
export interface OaBizOrderVoucherSaveParams {
  voucherType?: string;
  importFlag?: number;
  orderNo?: string;
  erpOrderNo?: string;
  customerCode?: string;
  customerName?: string;
  supplierCode?: string;
  supplierName?: string;
  materialCode?: string;
  materialName?: string;
  qty?: number;
  unit?: string;
  deliveryDate?: string;
  currency?: string;
  amount?: number;
  tradeTerms?: string;
  attachmentJson?: string;
  remark?: string;
  submit?: boolean;
}

/** 车间生产日报保存参数（OA-DEV-067，无流程） */
export interface OaBizWorkshopDailySaveParams {
  reportDate?: string;
  workshop?: string;
  shiftCode?: string;
  deptId?: number;
  deptName?: string;
  planQty?: number;
  outputQty?: number;
  qualifiedQty?: number;
  defectQty?: number;
  downtimeMinutes?: number;
  abnormalDesc?: string;
  dataSource?: string;
  reporterUserId?: number;
  remark?: string;
}

/** 供方考评评分项保存参数（OA-DEV-068） */
export interface OaBizSupplierEvalItemParams {
  itemCode?: string;
  itemName?: string;
  weight?: number;
  maxScore?: number;
  score?: number;
  scoreBasis?: string;
  remark?: string;
}

/** 供方考评保存参数（OA-DEV-068） */
export interface OaBizSupplierEvaluationSaveParams {
  evalPeriod?: string;
  evalYear?: number;
  evalQuarter?: number;
  evalMonth?: number;
  supplierCode?: string;
  supplierName?: string;
  evalBasis?: string;
  evalOpinion?: string;
  attachmentJson?: string;
  remark?: string;
  submit?: boolean;
  items?: OaBizSupplierEvalItemParams[];
}

/** 质量报表与指标保存参数（OA-DEV-069，无流程） */
export interface OaBizQualityMetricSaveParams {
  metricType?: string;
  metricCode?: string;
  metricName?: string;
  metricPeriod?: string;
  deptId?: number;
  deptName?: string;
  targetValue?: number;
  actualValue?: number;
  unit?: string;
  calcFormula?: string;
  dataSource?: string;
  sourceRef?: string;
  ownerUserId?: number;
  ownerName?: string;
  remark?: string;
}

/** 检测委托保存参数（OA-DEV-070） */
export interface OaBizInspectionRequestSaveParams {
  requestDeptId?: number;
  requestDeptName?: string;
  materialCode?: string;
  materialName?: string;
  batchNo?: string;
  sampleQty?: number;
  inspectionItems?: string;
  requireDate?: string;
  labName?: string;
  resultStatus?: string;
  resultDesc?: string;
  reportAttachmentJson?: string;
  qmsRefNo?: string;
  attachmentJson?: string;
  remark?: string;
  submit?: boolean;
}

/** 5M 变更保存参数（OA-DEV-072） */
export interface OaBizFiveMChangeSaveParams {
  changeCategory?: string;
  changeTitle?: string;
  productCode?: string;
  productName?: string;
  partCode?: string;
  changeDesc?: string;
  riskAnalysis?: string;
  riskLevel?: string;
  verificationPlan?: string;
  verificationResult?: string;
  effectiveDate?: string;
  closeCondition?: string;
  attachmentJson?: string;
  remark?: string;
  submit?: boolean;
}

/** 样品试制问题改善保存参数（OA-DEV-073） */
export interface OaBizSampleIssueSaveParams {
  projectCode?: string;
  projectName?: string;
  productCode?: string;
  bomCode?: string;
  partCode?: string;
  partName?: string;
  issueType?: string;
  issueDesc?: string;
  severity?: string;
  responsibleUserId?: number;
  responsibleName?: string;
  dueDate?: string;
  measure?: string;
  verifyResult?: string;
  plmRefNo?: string;
  attachmentJson?: string;
  remark?: string;
  submit?: boolean;
}

/** 内部审核不符合项保存参数（OA-DEV-074） */
export interface OaBizInternalAuditIssueParams {
  issueDesc?: string;
  issueLevel?: string;
  responsibleUserId?: number;
  responsibleName?: string;
  dueDate?: string;
  correctAction?: string;
  verifyResult?: string;
  remark?: string;
}

/** 内部审核保存参数（OA-DEV-074） */
export interface OaBizInternalAuditSaveParams {
  auditPlanName?: string;
  auditScope?: string;
  auditStandard?: string;
  planStart?: string;
  planEnd?: string;
  auditorUserIds?: string;
  auditorNames?: string;
  auditedDeptId?: number;
  auditedDeptName?: string;
  auditConclusion?: string;
  attachmentJson?: string;
  remark?: string;
  submit?: boolean;
  issues?: OaBizInternalAuditIssueParams[];
}

/** ECR 风险评审保存参数（OA-DEV-075） */
export interface OaBizEcrRiskReviewSaveParams {
  ecrTitle?: string;
  changeType?: string;
  productCode?: string;
  productName?: string;
  materialCode?: string;
  materialName?: string;
  changeReason?: string;
  riskDesc?: string;
  impactAnalysis?: string;
  countermeasure?: string;
  reviewConclusion?: string;
  plmChangeNo?: string;
  plmChangeStatus?: string;
  attachmentJson?: string;
  remark?: string;
  submit?: boolean;
}

/** 变更通知与图纸补发保存参数（OA-DEV-076） */
export interface OaBizChangeNoticeSaveParams {
  noticeType?: string;
  changeSource?: string;
  sourceRefNo?: string;
  materialCode?: string;
  materialName?: string;
  docCode?: string;
  docName?: string;
  docVersion?: string;
  noticeTitle?: string;
  noticeContent?: string;
  effectiveDate?: string;
  receiverUserIds?: string;
  receiverNames?: string;
  needReceipt?: number;
  attachmentJson?: string;
  remark?: string;
  submit?: boolean;
}

/** 变更通知签收参数（OA-DEV-076） */
export interface OaBizNoticeReceiptParams {
  receiptRemark?: string;
}

/** 新开模检查与零件试流保存参数（OA-DEV-077） */
export interface OaBizMoldTrialSaveParams {
  trialType?: string;
  moldCode?: string;
  moldName?: string;
  partCode?: string;
  partName?: string;
  materialCode?: string;
  materialName?: string;
  supplierCode?: string;
  supplierName?: string;
  checkItems?: string;
  checkResult?: string;
  trialQty?: number;
  trialResult?: string;
  trialIssue?: string;
  verifyConclusion?: string;
  plmRefNo?: string;
  trialDate?: string;
  attachmentJson?: string;
  remark?: string;
  submit?: boolean;
}

/** OA-N7 流程状态（oa_biz_flow_status） */
export const OA_BIZ_FLOW_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '审批中', value: 'RUNNING' },
  { label: '已通过', value: 'APPROVED' },
  { label: '已驳回', value: 'REJECTED' },
  { label: '已撤回', value: 'CANCELLED' },
] as const;

export const OA_BIZ_FLOW_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  RUNNING: '审批中',
  APPROVED: '已通过',
  REJECTED: '已驳回',
  CANCELLED: '已撤回',
};

export const OA_BIZ_FLOW_STATUS_COLOR: Record<string, string> = {
  DRAFT: 'default',
  RUNNING: 'processing',
  APPROVED: 'success',
  REJECTED: 'error',
  CANCELLED: 'warning',
};

/** 授信类型（oa_credit_type） */
export const OA_BIZ_CREDIT_TYPE_OPTIONS = [
  { label: '新增授信', value: 'NEW' },
  { label: '额度调整', value: 'ADJUST' },
] as const;

export const OA_BIZ_CREDIT_TYPE_LABEL: Record<string, string> = {
  NEW: '新增授信',
  ADJUST: '额度调整',
};

/** 风险等级（oa_risk_level） */
export const OA_BIZ_RISK_LEVEL_OPTIONS = [
  { label: '低', value: 'LOW' },
  { label: '中', value: 'MEDIUM' },
  { label: '高', value: 'HIGH' },
] as const;

export const OA_BIZ_RISK_LEVEL_LABEL: Record<string, string> = {
  LOW: '低',
  MEDIUM: '中',
  HIGH: '高',
};

/** 价格类别（oa_price_category） */
export const OA_BIZ_PRICE_CATEGORY_OPTIONS = [
  { label: '产品销售价', value: 'SALES' },
  { label: '零件采购价', value: 'PART' },
] as const;

export const OA_BIZ_PRICE_CATEGORY_LABEL: Record<string, string> = {
  SALES: '产品销售价',
  PART: '零件采购价',
};

/** 价格变更类型（oa_price_change_type） */
export const OA_BIZ_PRICE_CHANGE_TYPE_OPTIONS = [
  { label: '新增价格', value: 'NEW' },
  { label: '变更价格', value: 'CHANGE' },
] as const;

export const OA_BIZ_PRICE_CHANGE_TYPE_LABEL: Record<string, string> = {
  NEW: '新增价格',
  CHANGE: '变更价格',
};

/** 交期协调闭环状态（oa_coord_close_status） */
export const OA_BIZ_COORD_CLOSE_STATUS_OPTIONS = [
  { label: '未闭环', value: 'OPEN' },
  { label: '处理中', value: 'PROCESSING' },
  { label: '已闭环', value: 'CLOSED' },
] as const;

export const OA_BIZ_COORD_CLOSE_STATUS_LABEL: Record<string, string> = {
  OPEN: '未闭环',
  PROCESSING: '处理中',
  CLOSED: '已闭环',
};

/** 计划来源（oa_plan_source） */
export const OA_BIZ_PLAN_SOURCE_OPTIONS = [
  { label: 'OA 维护', value: 'OA' },
  { label: 'MES', value: 'MES' },
  { label: 'ERP', value: 'ERP' },
] as const;

export const OA_BIZ_PLAN_SOURCE_LABEL: Record<string, string> = {
  OA: 'OA 维护',
  MES: 'MES',
  ERP: 'ERP',
};

/** 生产顺序表状态（oa_seq_status） */
export const OA_BIZ_SEQ_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已发布', value: 'PUBLISHED' },
  { label: '已关闭', value: 'CLOSED' },
] as const;

export const OA_BIZ_SEQ_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  PUBLISHED: '已发布',
  CLOSED: '已关闭',
};

/** 传票类型（oa_voucher_type） */
export const OA_BIZ_VOUCHER_TYPE_OPTIONS = [
  { label: '销售订货', value: 'SALES' },
  { label: '采购订货', value: 'PURCHASE' },
] as const;

export const OA_BIZ_VOUCHER_TYPE_LABEL: Record<string, string> = {
  SALES: '销售订货',
  PURCHASE: '采购订货',
};

/** 车间日报状态（oa_daily_report_status） */
export const OA_BIZ_DAILY_REPORT_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已提交', value: 'SUBMITTED' },
  { label: '已确认', value: 'CONFIRMED' },
] as const;

export const OA_BIZ_DAILY_REPORT_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  SUBMITTED: '已提交',
  CONFIRMED: '已确认',
};

/** 数据来源（oa_data_source） */
export const OA_BIZ_DATA_SOURCE_OPTIONS = [
  { label: '人工录入', value: 'MANUAL' },
  { label: 'MES', value: 'MES' },
  { label: 'ERP', value: 'ERP' },
  { label: 'QMS', value: 'QMS' },
  { label: 'PLM', value: 'PLM' },
] as const;

export const OA_BIZ_DATA_SOURCE_LABEL: Record<string, string> = {
  MANUAL: '人工录入',
  MES: 'MES',
  ERP: 'ERP',
  QMS: 'QMS',
  PLM: 'PLM',
};

/** 考评周期（oa_eval_period） */
export const OA_BIZ_EVAL_PERIOD_OPTIONS = [
  { label: '月度考评', value: 'MONTH' },
  { label: '季度考评', value: 'QUARTER' },
  { label: '年度考评', value: 'YEAR' },
] as const;

export const OA_BIZ_EVAL_PERIOD_LABEL: Record<string, string> = {
  MONTH: '月度考评',
  QUARTER: '季度考评',
  YEAR: '年度考评',
};

/** 供方等级（oa_supplier_grade） */
export const OA_BIZ_SUPPLIER_GRADE_OPTIONS = [
  { label: 'A 级', value: 'A' },
  { label: 'B 级', value: 'B' },
  { label: 'C 级', value: 'C' },
  { label: 'D 级', value: 'D' },
] as const;

export const OA_BIZ_SUPPLIER_GRADE_LABEL: Record<string, string> = {
  A: 'A 级',
  B: 'B 级',
  C: 'C 级',
  D: 'D 级',
};

/** 质量指标类型（oa_quality_metric_type） */
export const OA_BIZ_QUALITY_METRIC_TYPE_OPTIONS = [
  { label: '目标指标完成', value: 'TARGET' },
  { label: 'RTY 一次通过率', value: 'RTY' },
  { label: '质量月报', value: 'MONTHLY_REPORT' },
] as const;

export const OA_BIZ_QUALITY_METRIC_TYPE_LABEL: Record<string, string> = {
  TARGET: '目标指标完成',
  RTY: 'RTY 一次通过率',
  MONTHLY_REPORT: '质量月报',
};

/** 检测结果（oa_inspection_result） */
export const OA_BIZ_INSPECTION_RESULT_OPTIONS = [
  { label: '待检测', value: 'PENDING' },
  { label: '合格', value: 'PASS' },
  { label: '不合格', value: 'FAIL' },
] as const;

export const OA_BIZ_INSPECTION_RESULT_LABEL: Record<string, string> = {
  PENDING: '待检测',
  PASS: '合格',
  FAIL: '不合格',
};

/** 5M 变更类别（oa_five_m_category） */
export const OA_BIZ_FIVE_M_CATEGORY_OPTIONS = [
  { label: '人（Man）', value: 'MAN' },
  { label: '机（Machine）', value: 'MACHINE' },
  { label: '料（Material）', value: 'MATERIAL' },
  { label: '法（Method）', value: 'METHOD' },
  { label: '环（Environment）', value: 'ENVIRONMENT' },
] as const;

export const OA_BIZ_FIVE_M_CATEGORY_LABEL: Record<string, string> = {
  MAN: '人（Man）',
  MACHINE: '机（Machine）',
  MATERIAL: '料（Material）',
  METHOD: '法（Method）',
  ENVIRONMENT: '环（Environment）',
};

/** 样品试制问题状态（oa_sample_issue_status） */
export const OA_BIZ_SAMPLE_ISSUE_STATUS_OPTIONS = [
  { label: '待处理', value: 'OPEN' },
  { label: '处理中', value: 'PROCESSING' },
  { label: '验证中', value: 'VERIFYING' },
  { label: '已关闭', value: 'CLOSED' },
] as const;

export const OA_BIZ_SAMPLE_ISSUE_STATUS_LABEL: Record<string, string> = {
  OPEN: '待处理',
  PROCESSING: '处理中',
  VERIFYING: '验证中',
  CLOSED: '已关闭',
};

/** 问题级别（oa_issue_level） */
export const OA_BIZ_ISSUE_LEVEL_OPTIONS = [
  { label: '轻微', value: 'MINOR' },
  { label: '严重', value: 'MAJOR' },
  { label: '致命', value: 'CRITICAL' },
] as const;

export const OA_BIZ_ISSUE_LEVEL_LABEL: Record<string, string> = {
  MINOR: '轻微',
  MAJOR: '严重',
  CRITICAL: '致命',
};

/** 内部审核状态（oa_audit_status） */
export const OA_BIZ_AUDIT_STATUS_OPTIONS = [
  { label: '已计划', value: 'PLANNED' },
  { label: '实施中', value: 'RUNNING' },
  { label: '报告编制', value: 'REPORTING' },
  { label: '已关闭', value: 'CLOSED' },
] as const;

export const OA_BIZ_AUDIT_STATUS_LABEL: Record<string, string> = {
  PLANNED: '已计划',
  RUNNING: '实施中',
  REPORTING: '报告编制',
  CLOSED: '已关闭',
};

/** 变更通知类型（oa_change_notice_type） */
export const OA_BIZ_CHANGE_NOTICE_TYPE_OPTIONS = [
  { label: '变更通知', value: 'NOTICE' },
  { label: '图纸补发', value: 'REDRAW' },
] as const;

export const OA_BIZ_CHANGE_NOTICE_TYPE_LABEL: Record<string, string> = {
  NOTICE: '变更通知',
  REDRAW: '图纸补发',
};

/** 回执状态（oa_receipt_status） */
export const OA_BIZ_RECEIPT_STATUS_OPTIONS = [
  { label: '待签收', value: 'PENDING' },
  { label: '已签收', value: 'RECEIVED' },
] as const;

export const OA_BIZ_RECEIPT_STATUS_LABEL: Record<string, string> = {
  PENDING: '待签收',
  RECEIVED: '已签收',
};

/** ECR 变更类型（oa_ecr_change_type） */
export const OA_BIZ_ECR_CHANGE_TYPE_OPTIONS = [
  { label: 'ECR 变更申请', value: 'ECR' },
  { label: 'ECO 变更执行', value: 'ECO' },
] as const;

export const OA_BIZ_ECR_CHANGE_TYPE_LABEL: Record<string, string> = {
  ECR: 'ECR 变更申请',
  ECO: 'ECO 变更执行',
};

/** 试流类型（oa_mold_trial_type） */
export const OA_BIZ_MOLD_TRIAL_TYPE_OPTIONS = [
  { label: '标准件检查', value: 'STANDARD_CHECK' },
  { label: '新开模检查', value: 'MOLD_CHECK' },
  { label: '零件试流', value: 'PART_TRIAL' },
] as const;

export const OA_BIZ_MOLD_TRIAL_TYPE_LABEL: Record<string, string> = {
  STANDARD_CHECK: '标准件检查',
  MOLD_CHECK: '新开模检查',
  PART_TRIAL: '零件试流',
};

/* ---------------- 开放集成平台与协同（OA-N9）---------------- */

/** 集成平台分页查询条件（OA-N9） */
export interface OaIntegrationQuery extends PageQuery {
  systemCode?: string;
  status?: number;
  eventType?: string;
  taskType?: string;
  taskStatus?: string;
  objectType?: string;
  direction?: string;
  syncStatus?: string;
  deliveryStatus?: string;
  clientSystem?: string;
  noticeType?: string;
  handleStatus?: string;
  alertFlag?: number;
  bizKey?: string;
  connectorId?: number;
  startDate?: string;
  endDate?: string;
}

/** API 网关策略（OA-DEV-086） */
export interface OaApiPolicyItem {
  id: number;
  policyNo?: string;
  policyName?: string;
  pathPrefix?: string;
  upstream?: string;
  httpMethods?: string;
  authType?: string;
  rateLimitQps?: number;
  signatureFlag?: number;
  apiVersion?: string;
  ipAllowList?: string;
  ipDenyList?: string;
  auditFlag?: number;
  status?: number;
  orgId?: number;
  orgName?: string;
  remark?: string;
}

/** API 访问凭证（OA-DEV-086） */
export interface OaApiCredentialItem {
  id: number;
  credentialNo?: string;
  credentialName?: string;
  appKey?: string;
  appSecret?: string;
  ownerSystem?: string;
  expireDate?: string;
  status?: number;
  alertFlag?: number;
  lastUsedTime?: string;
  remark?: string;
}

/** API 访问审计（OA-DEV-086/094） */
export interface OaApiAccessLogItem {
  id: number;
  traceId?: string;
  path?: string;
  httpMethod?: string;
  clientSystem?: string;
  appKey?: string;
  operatorUserId?: number;
  operatorName?: string;
  ipAddress?: string;
  statusCode?: number;
  resultCode?: string;
  costMs?: number;
  requestSummary?: string;
  errorMsg?: string;
  accessTime?: string;
  remark?: string;
}

/** Webhook 事件订阅（OA-DEV-087） */
export interface OaWebhookSubscriptionItem {
  id: number;
  subscriptionNo?: string;
  subscriptionName?: string;
  eventType?: string;
  callbackUrl?: string;
  secret?: string;
  ownerSystem?: string;
  maxRetry?: number;
  status?: number;
  lastDeliveryTime?: string;
  lastDeliveryStatus?: string;
  remark?: string;
}

/** Webhook 投递记录（OA-DEV-087） */
export interface OaWebhookDeliveryItem {
  id: number;
  subscriptionId?: number;
  subscriptionNo?: string;
  eventType?: string;
  eventId?: string;
  payload?: string;
  deliveryStatus?: string;
  attemptCount?: number;
  maxRetry?: number;
  responseCode?: number;
  lastError?: string;
  nextRetryTime?: string;
  deadFlag?: number;
  receiptNo?: string;
  deliveryTime?: string;
  createdAt?: string;
  remark?: string;
}

/** 消息任务（OA-DEV-088） */
export interface OaMessageTaskItem {
  id: number;
  taskNo?: string;
  taskType?: string;
  bizKey?: string;
  idempotentKey?: string;
  payload?: string;
  taskStatus?: string;
  priority?: number;
  attemptCount?: number;
  maxRetry?: number;
  lastError?: string;
  nextExecuteTime?: string;
  startTime?: string;
  finishTime?: string;
  deadFlag?: number;
  createdAt?: string;
  remark?: string;
}

/** 集成连接器（OA-DEV-089 ~ OA-DEV-093） */
export interface OaIntegrationConnectorItem {
  id: number;
  connectorNo?: string;
  connectorName?: string;
  systemCode?: string;
  systemType?: string;
  baseUrl?: string;
  authType?: string;
  authoritySystem?: string;
  syncDirection?: string;
  ssoFlag?: number;
  todoSyncFlag?: number;
  masterDataScope?: string;
  credentialId?: number;
  credentialExpireDate?: string;
  lastSyncTime?: string;
  status?: number;
  orgId?: number;
  remark?: string;
}

/** 连接器同步记录（OA-DEV-089 ~ OA-DEV-093） */
export interface OaConnectorSyncLogItem {
  id: number;
  connectorId?: number;
  connectorNo?: string;
  systemCode?: string;
  objectType?: string;
  direction?: string;
  sourceFlag?: string;
  dataTimestamp?: string;
  recordCount?: number;
  syncStatus?: string;
  receiptNo?: string;
  receiptStatus?: string;
  costMs?: number;
  errorMsg?: string;
  operatorUserId?: number;
  operatorName?: string;
  syncTime?: string;
  remark?: string;
}

/** 主数据映射（OA-DEV-090） */
export interface OaMasterDataMappingItem {
  id: number;
  mappingNo?: string;
  objectType?: string;
  localCode?: string;
  externalCode?: string;
  authoritySystem?: string;
  sourceSystem?: string;
  syncDirection?: string;
  status?: number;
  lastSyncTime?: string;
  remark?: string;
}

/** EDI 状态通知（OA-DEV-093） */
export interface OaEdiNoticeItem {
  id: number;
  noticeNo?: string;
  messageId?: string;
  partnerCode?: string;
  partnerName?: string;
  orderNo?: string;
  noticeType?: string;
  noticeStatus?: string;
  alertFlag?: number;
  todoFlag?: number;
  todoId?: number;
  receivedTime?: string;
  handleUserId?: number;
  handleUserName?: string;
  handleStatus?: string;
  handleRemark?: string;
  remark?: string;
}

/** API 网关策略保存参数（OA-DEV-086） */
export interface OaApiPolicySaveParams {
  policyNo?: string;
  policyName?: string;
  pathPrefix?: string;
  upstream?: string;
  httpMethods?: string;
  authType?: string;
  rateLimitQps?: number;
  signatureFlag?: boolean;
  apiVersion?: string;
  ipAllowList?: string;
  ipDenyList?: string;
  auditFlag?: boolean;
  status?: number;
  remark?: string;
}

/** API 访问凭证保存参数（OA-DEV-086） */
export interface OaApiCredentialSaveParams {
  credentialNo?: string;
  credentialName?: string;
  appKey?: string;
  appSecret?: string;
  ownerSystem?: string;
  expireDate?: string;
  status?: number;
  remark?: string;
}

/** API 访问审计保存参数（OA-DEV-086） */
export interface OaApiAccessLogSaveParams {
  traceId?: string;
  path?: string;
  httpMethod?: string;
  clientSystem?: string;
  appKey?: string;
  operatorUserId?: number;
  operatorName?: string;
  ipAddress?: string;
  statusCode?: number;
  resultCode?: string;
  costMs?: number;
  requestSummary?: string;
  errorMsg?: string;
  remark?: string;
}

/** Webhook 事件订阅保存参数（OA-DEV-087） */
export interface OaWebhookSubscriptionSaveParams {
  subscriptionNo?: string;
  subscriptionName?: string;
  eventType?: string;
  callbackUrl?: string;
  secret?: string;
  ownerSystem?: string;
  maxRetry?: number;
  status?: number;
  remark?: string;
}

/** Webhook 投递记录保存参数（OA-DEV-087） */
export interface OaWebhookDeliverySaveParams {
  subscriptionId?: number;
  eventType?: string;
  eventId?: string;
  payload?: string;
  deliveryStatus?: string;
  responseCode?: number;
  lastError?: string;
  receiptNo?: string;
  remark?: string;
}

/** 消息任务保存参数（OA-DEV-088） */
export interface OaMessageTaskSaveParams {
  taskNo?: string;
  taskType?: string;
  bizKey?: string;
  idempotentKey?: string;
  payload?: string;
  priority?: number;
  maxRetry?: number;
  remark?: string;
}

/** 集成连接器保存参数（OA-DEV-089 ~ OA-DEV-093） */
export interface OaIntegrationConnectorSaveParams {
  connectorNo?: string;
  connectorName?: string;
  systemCode?: string;
  systemType?: string;
  baseUrl?: string;
  authType?: string;
  authoritySystem?: string;
  syncDirection?: string;
  ssoFlag?: boolean;
  todoSyncFlag?: boolean;
  masterDataScope?: string;
  credentialId?: number;
  credentialExpireDate?: string;
  status?: number;
  remark?: string;
}

/** 连接器同步记录保存参数（OA-DEV-089 ~ OA-DEV-093） */
export interface OaConnectorSyncLogSaveParams {
  connectorId?: number;
  objectType?: string;
  direction?: string;
  sourceFlag?: string;
  dataTimestamp?: string;
  recordCount?: number;
  syncStatus?: string;
  receiptNo?: string;
  receiptStatus?: string;
  costMs?: number;
  errorMsg?: string;
  remark?: string;
}

/** 主数据映射保存参数（OA-DEV-090） */
export interface OaMasterDataMappingSaveParams {
  mappingNo?: string;
  objectType?: string;
  localCode?: string;
  externalCode?: string;
  authoritySystem?: string;
  sourceSystem?: string;
  syncDirection?: string;
  status?: number;
  remark?: string;
}

/** EDI 状态通知保存参数（OA-DEV-093） */
export interface OaEdiNoticeSaveParams {
  noticeNo?: string;
  messageId?: string;
  partnerCode?: string;
  partnerName?: string;
  orderNo?: string;
  noticeType?: string;
  noticeStatus?: string;
  alertFlag?: boolean;
  todoFlag?: boolean;
  receivedTime?: string;
  remark?: string;
}

/** 集成系统编码（oa_integration_system） */
export const OA_INTEGRATION_SYSTEM_OPTIONS = [
  { label: 'PLM', value: 'PLM' },
  { label: 'ERP', value: 'ERP' },
  { label: 'MES', value: 'MES' },
  { label: 'QMS', value: 'QMS' },
  { label: 'EDI', value: 'EDI' },
] as const;

export const OA_INTEGRATION_SYSTEM_LABEL: Record<string, string> = {
  PLM: 'PLM',
  ERP: 'ERP',
  MES: 'MES',
  QMS: 'QMS',
  EDI: 'EDI',
};

/** 同步方向（oa_sync_direction） */
export const OA_SYNC_DIRECTION_OPTIONS = [
  { label: '入站', value: 'INBOUND' },
  { label: '出站', value: 'OUTBOUND' },
  { label: '双向', value: 'BIDIRECTIONAL' },
] as const;

export const OA_SYNC_DIRECTION_LABEL: Record<string, string> = {
  INBOUND: '入站',
  OUTBOUND: '出站',
  BIDIRECTIONAL: '双向',
};

/** 消息任务类型（oa_message_task_type） */
export const OA_MESSAGE_TASK_TYPE_OPTIONS = [
  { label: '邮件', value: 'EMAIL' },
  { label: '消息通知', value: 'NOTIFY' },
  { label: '索引重建', value: 'INDEX' },
  { label: '定时扫描', value: 'SCAN' },
  { label: '数据迁移', value: 'MIGRATION' },
  { label: '数据同步', value: 'SYNC' },
] as const;

export const OA_MESSAGE_TASK_TYPE_LABEL: Record<string, string> = {
  EMAIL: '邮件',
  NOTIFY: '消息通知',
  INDEX: '索引重建',
  SCAN: '定时扫描',
  MIGRATION: '数据迁移',
  SYNC: '数据同步',
};

/** Webhook 事件类型（oa_webhook_event_type） */
export const OA_WEBHOOK_EVENT_TYPE_OPTIONS = [
  { label: '流程完成', value: 'FLOW_COMPLETED' },
  { label: '流程驳回', value: 'FLOW_REJECTED' },
  { label: '文档发布', value: 'DOC_PUBLISHED' },
  { label: '用户变更', value: 'USER_CHANGED' },
] as const;

export const OA_WEBHOOK_EVENT_TYPE_LABEL: Record<string, string> = {
  FLOW_COMPLETED: '流程完成',
  FLOW_REJECTED: '流程驳回',
  DOC_PUBLISHED: '文档发布',
  USER_CHANGED: '用户变更',
};

/** EDI 通知类型（oa_edi_notice_type） */
export const OA_EDI_NOTICE_TYPE_OPTIONS = [
  { label: '状态通知', value: 'STATUS' },
  { label: '异常告警', value: 'ALERT' },
  { label: '交付通知', value: 'DELIVERY' },
] as const;

export const OA_EDI_NOTICE_TYPE_LABEL: Record<string, string> = {
  STATUS: '状态通知',
  ALERT: '异常告警',
  DELIVERY: '交付通知',
};

/** 集成认证方式（oa_integration_auth_type） */
export const OA_INTEGRATION_AUTH_TYPE_OPTIONS = [
  { label: 'JWT', value: 'JWT' },
  { label: 'OAuth2', value: 'OAUTH2' },
  { label: 'AppKey/Secret', value: 'APPKEY' },
  { label: '签名校验', value: 'SIGN' },
] as const;

export const OA_INTEGRATION_AUTH_TYPE_LABEL: Record<string, string> = {
  JWT: 'JWT',
  OAUTH2: 'OAuth2',
  APPKEY: 'AppKey/Secret',
  SIGN: '签名校验',
};

/** 消息任务状态（oa_message_task_status） */
export const OA_MESSAGE_TASK_STATUS_OPTIONS = [
  { label: '待执行', value: 'PENDING' },
  { label: '执行中', value: 'RUNNING' },
  { label: '成功', value: 'SUCCESS' },
  { label: '失败', value: 'FAILED' },
  { label: '死信', value: 'DEAD' },
] as const;

export const OA_MESSAGE_TASK_STATUS_LABEL: Record<string, string> = {
  PENDING: '待执行',
  RUNNING: '执行中',
  SUCCESS: '成功',
  FAILED: '失败',
  DEAD: '死信',
};

/** Webhook 投递状态（oa_delivery_status） */
export const OA_DELIVERY_STATUS_OPTIONS = [
  { label: '待投递', value: 'PENDING' },
  { label: '投递成功', value: 'SUCCESS' },
  { label: '投递失败', value: 'FAILED' },
  { label: '死信', value: 'DEAD' },
] as const;

export const OA_DELIVERY_STATUS_LABEL: Record<string, string> = {
  PENDING: '待投递',
  SUCCESS: '投递成功',
  FAILED: '投递失败',
  DEAD: '死信',
};

/** 主数据对象（oa_master_data_object） */
export const OA_MASTER_DATA_OBJECT_OPTIONS = [
  { label: '客户', value: 'CUSTOMER' },
  { label: '供应商', value: 'SUPPLIER' },
  { label: '物料', value: 'MATERIAL' },
  { label: '订单', value: 'ORDER' },
  { label: '采购', value: 'PURCHASE' },
  { label: '价格', value: 'PRICE' },
] as const;

export const OA_MASTER_DATA_OBJECT_LABEL: Record<string, string> = {
  CUSTOMER: '客户',
  SUPPLIER: '供应商',
  MATERIAL: '物料',
  ORDER: '订单',
  PURCHASE: '采购',
  PRICE: '价格',
};

/** EDI 通知处理状态（oa_edi_notice_status） */
export const OA_EDI_NOTICE_STATUS_OPTIONS = [
  { label: '待处理', value: 'PENDING' },
  { label: '已处理', value: 'HANDLED' },
] as const;

export const OA_EDI_NOTICE_STATUS_LABEL: Record<string, string> = {
  PENDING: '待处理',
  HANDLED: '已处理',
};

/** 连接器同步状态（oa_sync_status） */
export const OA_SYNC_STATUS_OPTIONS = [
  { label: '成功', value: 'SUCCESS' },
  { label: '失败', value: 'FAILED' },
  { label: '部分成功', value: 'PARTIAL' },
] as const;

export const OA_SYNC_STATUS_LABEL: Record<string, string> = {
  SUCCESS: '成功',
  FAILED: '失败',
  PARTIAL: '部分成功',
};

/** 回执状态（oa_receipt_status） */
export const OA_SYNC_RECEIPT_STATUS_OPTIONS = [
  { label: '已接收', value: 'ACCEPTED' },
  { label: '已拒绝', value: 'REJECTED' },
] as const;

export const OA_SYNC_RECEIPT_STATUS_LABEL: Record<string, string> = {
  ACCEPTED: '已接收',
  REJECTED: '已拒绝',
};

/** 启用状态（通用 1/0） */
export const OA_ENABLE_STATUS_OPTIONS = [
  { label: '启用', value: 1 },
  { label: '停用', value: 0 },
] as const;

export const OA_ENABLE_STATUS_LABEL: Record<number, string> = {
  1: '启用',
  0: '停用',
};

/** API 请求方法（oa_api_http_method） */
export const OA_API_HTTP_METHOD_OPTIONS = [
  { label: 'GET', value: 'GET' },
  { label: 'POST', value: 'POST' },
  { label: 'PUT', value: 'PUT' },
  { label: 'DELETE', value: 'DELETE' },
] as const;

export const OA_API_HTTP_METHOD_LABEL: Record<string, string> = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
};

/* ---------------- 历史数据迁移与新旧并行验证（OA-N10）---------------- */

/** 迁移分页查询条件（OA-N10） */
export interface OaMigrationQuery extends PageQuery {
  objectCode?: string;
  sourceType?: string;
  status?: number;
  batchType?: string;
  batchStatus?: string;
  ruleType?: string;
  cleanResult?: string;
  transferStatus?: string;
  instanceStatus?: string;
  reconcileStatus?: string;
  compareResult?: string;
  batchId?: number;
  startDate?: string;
  endDate?: string;
}

/** 迁移对象目录（OA-DEV-095） */
export interface OaMigrationObjectItem {
  id: number;
  objectCode?: string;
  objectName?: string;
  sourceSystem?: string;
  sourceType?: string;
  sourceLocation?: string;
  targetObject?: string;
  sourceCount?: number;
  migratedCount?: number;
  migrateRequired?: number;
  status?: string;
  lastMigrateTime?: string;
  orgId?: number;
  orgName?: string;
  remark?: string;
}

/** 源目标字段映射（OA-DEV-096） */
export interface OaMigrationFieldMappingItem {
  id: number;
  mappingNo?: string;
  objectCode?: string;
  sourceField?: string;
  targetField?: string;
  dataType?: string;
  enumMapping?: string;
  valueMapping?: string;
  transformRule?: string;
  requiredFlag?: number;
  status?: number;
  orgId?: number;
  orgName?: string;
  remark?: string;
}

/** 迁移批次（OA-DEV-097/100/101） */
export interface OaMigrationBatchItem {
  id: number;
  batchNo?: string;
  batchName?: string;
  objectCode?: string;
  batchType?: string;
  extractMethod?: string;
  sourceSnapshot?: string;
  snapshotChecksum?: string;
  totalCount?: number;
  successCount?: number;
  failCount?: number;
  skipCount?: number;
  batchStatus?: string;
  trialRound?: number;
  startTime?: string;
  endTime?: string;
  operatorName?: string;
  orgId?: number;
  orgName?: string;
  remark?: string;
}

/** 数据清洗规则（OA-DEV-098） */
export interface OaMigrationCleanRuleItem {
  id: number;
  ruleNo?: string;
  ruleName?: string;
  objectCode?: string;
  ruleType?: string;
  ruleExpr?: string;
  action?: string;
  priority?: number;
  hitCount?: number;
  status?: number;
  orgId?: number;
  orgName?: string;
  remark?: string;
}

/** 数据清洗日志（OA-DEV-098） */
export interface OaMigrationCleanLogItem {
  id: number;
  batchId?: number;
  ruleId?: number;
  ruleNo?: string;
  objectCode?: string;
  recordKey?: string;
  sourceValue?: string;
  cleanedValue?: string;
  cleanResult?: string;
  message?: string;
  cleanTime?: string;
  orgId?: number;
  orgName?: string;
  remark?: string;
}

/** 附件迁移任务（OA-DEV-099） */
export interface OaMigrationAttachmentItem {
  id: number;
  taskNo?: string;
  batchId?: number;
  objectCode?: string;
  sourcePath?: string;
  targetPath?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  chunkTotal?: number;
  chunkDone?: number;
  fileHash?: string;
  targetHash?: string;
  hashMatched?: number;
  transferStatus?: string;
  retryCount?: number;
  errorMsg?: string;
  transferTime?: string;
  orgId?: number;
  orgName?: string;
  remark?: string;
}

/** 历史流程档案（OA-DEV-102） */
export interface OaMigrationHistoryFlowItem {
  id: number;
  archiveNo?: string;
  sourceInstanceNo?: string;
  processCode?: string;
  processName?: string;
  title?: string;
  formSnapshot?: string;
  applicantName?: string;
  applicantOrg?: string;
  startTime?: string;
  endTime?: string;
  instanceStatus?: string;
  approvalJson?: string;
  timelineJson?: string;
  attachmentCount?: number;
  migratedFlag?: number;
  queryUserName?: string;
  orgId?: number;
  orgName?: string;
  remark?: string;
}

/** 迁移对账（OA-DEV-103） */
export interface OaMigrationReconcileItem {
  id: number;
  reconcileNo?: string;
  batchId?: number;
  batchNo?: string;
  objectCode?: string;
  sourceCount?: number;
  targetCount?: number;
  successCount?: number;
  failCount?: number;
  skipCount?: number;
  diffCount?: number;
  diffReason?: string;
  conclusion?: string;
  reconcileStatus?: string;
  reportTime?: string;
  orgId?: number;
  orgName?: string;
  remark?: string;
}

/** 新旧流程双跑对照（OA-DEV-104） */
export interface OaMigrationDualRunItem {
  id: number;
  dualNo?: string;
  processCode?: string;
  processName?: string;
  bizKey?: string;
  newInstanceId?: number;
  oldInstanceNo?: string;
  compareResult?: string;
  approverDiff?: string;
  pathDiff?: string;
  fieldDiff?: string;
  notifyDiff?: string;
  resultDiff?: string;
  conclusion?: string;
  runTime?: string;
  orgId?: number;
  orgName?: string;
  remark?: string;
}

/** 迁移对象保存参数（OA-DEV-095） */
export interface OaMigrationObjectSaveParams {
  objectCode?: string;
  objectName?: string;
  sourceSystem?: string;
  sourceType?: string;
  sourceLocation?: string;
  targetObject?: string;
  sourceCount?: number;
  migrateRequired?: boolean;
  status?: string;
  remark?: string;
}

/** 字段映射保存参数（OA-DEV-096） */
export interface OaMigrationFieldMappingSaveParams {
  mappingNo?: string;
  objectCode?: string;
  sourceField?: string;
  targetField?: string;
  dataType?: string;
  enumMapping?: string;
  valueMapping?: string;
  transformRule?: string;
  requiredFlag?: boolean;
  status?: number;
  remark?: string;
}

/** 迁移批次保存参数（OA-DEV-097/100/101） */
export interface OaMigrationBatchSaveParams {
  batchNo?: string;
  batchName?: string;
  objectCode?: string;
  batchType?: string;
  extractMethod?: string;
  sourceSnapshot?: string;
  snapshotChecksum?: string;
  totalCount?: number;
  successCount?: number;
  failCount?: number;
  skipCount?: number;
  batchStatus?: string;
  trialRound?: number;
  startTime?: string;
  endTime?: string;
  remark?: string;
}

/** 数据清洗规则保存参数（OA-DEV-098） */
export interface OaMigrationCleanRuleSaveParams {
  ruleNo?: string;
  ruleName?: string;
  objectCode?: string;
  ruleType?: string;
  ruleExpr?: string;
  action?: string;
  priority?: number;
  status?: number;
  remark?: string;
}

/** 数据清洗日志保存参数（OA-DEV-098） */
export interface OaMigrationCleanLogSaveParams {
  batchId?: number;
  ruleId?: number;
  ruleNo?: string;
  objectCode?: string;
  recordKey?: string;
  sourceValue?: string;
  cleanedValue?: string;
  cleanResult?: string;
  message?: string;
  cleanTime?: string;
  remark?: string;
}

/** 附件迁移任务保存参数（OA-DEV-099） */
export interface OaMigrationAttachmentSaveParams {
  taskNo?: string;
  batchId?: number;
  objectCode?: string;
  sourcePath?: string;
  targetPath?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  chunkTotal?: number;
  chunkDone?: number;
  fileHash?: string;
  targetHash?: string;
  transferStatus?: string;
  retryCount?: number;
  errorMsg?: string;
  remark?: string;
}

/** 历史流程档案保存参数（OA-DEV-102） */
export interface OaMigrationHistoryFlowSaveParams {
  archiveNo?: string;
  sourceInstanceNo?: string;
  processCode?: string;
  processName?: string;
  title?: string;
  formSnapshot?: string;
  applicantName?: string;
  applicantOrg?: string;
  startTime?: string;
  endTime?: string;
  instanceStatus?: string;
  approvalJson?: string;
  timelineJson?: string;
  attachmentCount?: number;
  migratedFlag?: boolean;
  queryUserName?: string;
  remark?: string;
}

/** 迁移对账保存参数（OA-DEV-103） */
export interface OaMigrationReconcileSaveParams {
  reconcileNo?: string;
  batchId?: number;
  batchNo?: string;
  objectCode?: string;
  sourceCount?: number;
  targetCount?: number;
  successCount?: number;
  failCount?: number;
  skipCount?: number;
  diffCount?: number;
  diffReason?: string;
  conclusion?: string;
  reconcileStatus?: string;
  reportTime?: string;
  remark?: string;
}

/** 双跑对照保存参数（OA-DEV-104） */
export interface OaMigrationDualRunSaveParams {
  dualNo?: string;
  processCode?: string;
  processName?: string;
  bizKey?: string;
  newInstanceId?: number;
  oldInstanceNo?: string;
  compareResult?: string;
  approverDiff?: string;
  pathDiff?: string;
  fieldDiff?: string;
  notifyDiff?: string;
  resultDiff?: string;
  conclusion?: string;
  runTime?: string;
  remark?: string;
}

/** 迁移对象状态（oa_migration_object_status） */
export const OA_MIGRATION_OBJECT_STATUS_OPTIONS = [
  { label: '待迁移', value: 'PENDING' },
  { label: '已就绪', value: 'READY' },
  { label: '迁移中', value: 'RUNNING' },
  { label: '已完成', value: 'DONE' },
  { label: '已跳过', value: 'SKIPPED' },
] as const;

export const OA_MIGRATION_OBJECT_STATUS_LABEL: Record<string, string> = {
  PENDING: '待迁移',
  READY: '已就绪',
  RUNNING: '迁移中',
  DONE: '已完成',
  SKIPPED: '已跳过',
};

/** 迁移方式（oa_migration_method） */
export const OA_MIGRATION_METHOD_OPTIONS = [
  { label: 'API 接口', value: 'API' },
  { label: '数据库直连', value: 'DB' },
  { label: '文件导入', value: 'FILE' },
  { label: '导出文件', value: 'EXPORT' },
] as const;

export const OA_MIGRATION_METHOD_LABEL: Record<string, string> = {
  API: 'API 接口',
  DB: '数据库直连',
  FILE: '文件导入',
  EXPORT: '导出文件',
};

/** 迁移批次类型（oa_migration_batch_type） */
export const OA_MIGRATION_BATCH_TYPE_OPTIONS = [
  { label: '全量试迁', value: 'FULL' },
  { label: '增量试迁', value: 'INCREMENT' },
  { label: '数据抽取', value: 'EXTRACT' },
  { label: '附件迁移', value: 'ATTACHMENT' },
] as const;

export const OA_MIGRATION_BATCH_TYPE_LABEL: Record<string, string> = {
  FULL: '全量试迁',
  INCREMENT: '增量试迁',
  EXTRACT: '数据抽取',
  ATTACHMENT: '附件迁移',
};

/** 迁移批次状态（oa_migration_batch_status） */
export const OA_MIGRATION_BATCH_STATUS_OPTIONS = [
  { label: '待执行', value: 'PENDING' },
  { label: '执行中', value: 'RUNNING' },
  { label: '成功', value: 'SUCCESS' },
  { label: '失败', value: 'FAILED' },
  { label: '部分成功', value: 'PARTIAL' },
] as const;

export const OA_MIGRATION_BATCH_STATUS_LABEL: Record<string, string> = {
  PENDING: '待执行',
  RUNNING: '执行中',
  SUCCESS: '成功',
  FAILED: '失败',
  PARTIAL: '部分成功',
};

/** 清洗规则类型（oa_migration_clean_rule_type） */
export const OA_MIGRATION_CLEAN_RULE_TYPE_OPTIONS = [
  { label: '重复用户', value: 'DEDUP_USER' },
  { label: '无效组织', value: 'INVALID_ORG' },
  { label: '缺失附件', value: 'MISSING_ATTACH' },
  { label: '异常日期', value: 'BAD_DATE' },
  { label: '孤儿记录', value: 'ORPHAN' },
  { label: '不合法状态', value: 'ILLEGAL_STATUS' },
] as const;

export const OA_MIGRATION_CLEAN_RULE_TYPE_LABEL: Record<string, string> = {
  DEDUP_USER: '重复用户',
  INVALID_ORG: '无效组织',
  MISSING_ATTACH: '缺失附件',
  BAD_DATE: '异常日期',
  ORPHAN: '孤儿记录',
  ILLEGAL_STATUS: '不合法状态',
};

/** 清洗结果（oa_migration_clean_result） */
export const OA_MIGRATION_CLEAN_RESULT_OPTIONS = [
  { label: '已清洗', value: 'CLEANED' },
  { label: '已跳过', value: 'SKIPPED' },
  { label: '清洗失败', value: 'FAILED' },
] as const;

export const OA_MIGRATION_CLEAN_RESULT_LABEL: Record<string, string> = {
  CLEANED: '已清洗',
  SKIPPED: '已跳过',
  FAILED: '清洗失败',
};

/** 附件迁移状态（oa_transfer_status） */
export const OA_MIGRATION_TRANSFER_STATUS_OPTIONS = [
  { label: '待迁移', value: 'PENDING' },
  { label: '迁移中', value: 'RUNNING' },
  { label: '成功', value: 'SUCCESS' },
  { label: '失败', value: 'FAILED' },
  { label: '重试中', value: 'RETRYING' },
] as const;

export const OA_MIGRATION_TRANSFER_STATUS_LABEL: Record<string, string> = {
  PENDING: '待迁移',
  RUNNING: '迁移中',
  SUCCESS: '成功',
  FAILED: '失败',
  RETRYING: '重试中',
};

/** 迁移对账状态（oa_reconcile_status） */
export const OA_MIGRATION_RECONCILE_STATUS_OPTIONS = [
  { label: '待确认', value: 'PENDING' },
  { label: '已确认', value: 'CONFIRMED' },
  { label: '异常', value: 'EXCEPTION' },
] as const;

export const OA_MIGRATION_RECONCILE_STATUS_LABEL: Record<string, string> = {
  PENDING: '待确认',
  CONFIRMED: '已确认',
  EXCEPTION: '异常',
};

/** 双跑对照结果（oa_dual_run_result） */
export const OA_MIGRATION_DUAL_RESULT_OPTIONS = [
  { label: '待对照', value: 'PENDING' },
  { label: '一致', value: 'MATCH' },
  { label: '存在差异', value: 'DIFF' },
] as const;

export const OA_MIGRATION_DUAL_RESULT_LABEL: Record<string, string> = {
  PENDING: '待对照',
  MATCH: '一致',
  DIFF: '存在差异',
};

/* ---------------- 安全性能测试与用户验收（OA-N11）---------------- */

/** 测试与验收分页查询条件（OA-N11） */
export interface OaTestQuery extends PageQuery {
  module?: string;
  caseType?: string;
  priority?: string;
  execStatus?: string;
  sceneType?: string;
  result?: string;
  checkType?: string;
  severity?: string;
  fixStatus?: string;
  envType?: string;
  drillType?: string;
  restoreResult?: string;
  dept?: string;
  uatStatus?: string;
  materialType?: string;
  targetRole?: string;
  status?: number;
  planType?: string;
  cutoverStatus?: string;
  rehearsalResult?: string;
  startDate?: string;
  endDate?: string;
}

/** 功能与回归测试用例（OA-DEV-105） */
export interface OaTestCaseItem {
  id: number;
  caseNo?: string;
  caseName?: string;
  module?: string;
  requirementRef?: string;
  pageRef?: string;
  apiRef?: string;
  tableRef?: string;
  caseType?: string;
  priority?: string;
  precondition?: string;
  steps?: string;
  expected?: string;
  execStatus?: string;
  testResult?: string;
  tester?: string;
  lastRunTime?: string;
  status?: number;
  orgId?: number;
  orgName?: string;
  remark?: string;
}

/** 角色与数据隔离测试（OA-DEV-106） */
export interface OaPermissionTestItem {
  id: number;
  testNo?: string;
  sceneName?: string;
  sceneType?: string;
  roleName?: string;
  subject?: string;
  dataScope?: string;
  expectedResult?: string;
  actualResult?: string;
  isolationPass?: number;
  result?: string;
  defectNo?: string;
  tester?: string;
  testTime?: string;
  orgId?: number;
  orgName?: string;
  remark?: string;
}

/** 安全测试（OA-DEV-107） */
export interface OaSecurityTestItem {
  id: number;
  scanNo?: string;
  checkName?: string;
  checkType?: string;
  severity?: string;
  target?: string;
  toolName?: string;
  finding?: string;
  suggestion?: string;
  fixStatus?: string;
  riskAccepted?: number;
  verifyResult?: string;
  tester?: string;
  testTime?: string;
  orgId?: number;
  orgName?: string;
  remark?: string;
}

/** 性能与容量测试（OA-DEV-108） */
export interface OaPerfTestItem {
  id: number;
  testNo?: string;
  sceneName?: string;
  loadModel?: string;
  concurrentUsers?: number;
  flowConcurrency?: number;
  mailVolume?: number;
  docVolume?: number;
  attachCapacity?: number;
  targetTps?: number;
  targetRtMs?: number;
  actualTps?: number;
  actualRtMs?: number;
  errorRate?: number;
  cpuUsage?: number;
  memUsage?: number;
  result?: string;
  tester?: string;
  testTime?: string;
  orgId?: number;
  orgName?: string;
  remark?: string;
}

/** 兼容性测试（OA-DEV-109） */
export interface OaCompatTestItem {
  id: number;
  testNo?: string;
  envType?: string;
  envName?: string;
  envVersion?: string;
  network?: string;
  scene?: string;
  result?: string;
  blockLevel?: string;
  issue?: string;
  tester?: string;
  testTime?: string;
  orgId?: number;
  orgName?: string;
  remark?: string;
}

/** 备份恢复演练（OA-DEV-110） */
export interface OaBackupDrillItem {
  id: number;
  drillNo?: string;
  drillName?: string;
  drillType?: string;
  backupSource?: string;
  backupTime?: string;
  targetRpoMinutes?: number;
  targetRtoMinutes?: number;
  restoreStart?: string;
  restoreEnd?: string;
  actualRpoMinutes?: number;
  actualRtoMinutes?: number;
  restoreResult?: string;
  dataVerified?: number;
  operatorName?: string;
  drillTime?: string;
  orgId?: number;
  orgName?: string;
  remark?: string;
}

/** 用户验收（UAT）记录（OA-DEV-111） */
export interface OaUatRecordItem {
  id: number;
  uatNo?: string;
  dept?: string;
  sceneName?: string;
  scenarioRef?: string;
  uatStatus?: string;
  ownerDept?: string;
  participant?: string;
  expected?: string;
  actual?: string;
  issueCount?: number;
  blockerCount?: number;
  conclusion?: string;
  uatTime?: string;
  orgId?: number;
  orgName?: string;
  remark?: string;
}

/** 培训交付材料（OA-DEV-112） */
export interface OaTrainingMaterialItem {
  id: number;
  materialNo?: string;
  materialName?: string;
  materialType?: string;
  targetRole?: string;
  format?: string;
  location?: string;
  materialVersion?: string;
  publishTime?: string;
  audienceCount?: number;
  signedCount?: number;
  status?: number;
  orgId?: number;
  orgName?: string;
  remark?: string;
}

/** 上线切换与回退预案（OA-DEV-113） */
export interface OaCutoverPlanItem {
  id: number;
  planNo?: string;
  planName?: string;
  planType?: string;
  cutoverWindow?: string;
  freezeTime?: string;
  incrementSync?: string;
  entrySwitch?: string;
  notifyPlan?: string;
  dutyPerson?: string;
  rollbackTrigger?: string;
  rollbackOwner?: string;
  rehearsalResult?: string;
  rehearsalTime?: string;
  status?: string;
  approver?: string;
  orgId?: number;
  orgName?: string;
  remark?: string;
}

/** 测试用例保存参数（OA-DEV-105） */
export interface OaTestCaseSaveParams {
  caseNo?: string;
  caseName?: string;
  module?: string;
  requirementRef?: string;
  pageRef?: string;
  apiRef?: string;
  tableRef?: string;
  caseType?: string;
  priority?: string;
  precondition?: string;
  steps?: string;
  expected?: string;
  execStatus?: string;
  testResult?: string;
  tester?: string;
  lastRunTime?: string;
  status?: number;
  remark?: string;
}

/** 权限测试保存参数（OA-DEV-106） */
export interface OaPermissionTestSaveParams {
  testNo?: string;
  sceneName?: string;
  sceneType?: string;
  roleName?: string;
  subject?: string;
  dataScope?: string;
  expectedResult?: string;
  actualResult?: string;
  isolationPass?: number;
  result?: string;
  defectNo?: string;
  tester?: string;
  testTime?: string;
  remark?: string;
}

/** 安全测试保存参数（OA-DEV-107） */
export interface OaSecurityTestSaveParams {
  scanNo?: string;
  checkName?: string;
  checkType?: string;
  severity?: string;
  target?: string;
  toolName?: string;
  finding?: string;
  suggestion?: string;
  fixStatus?: string;
  riskAccepted?: number;
  verifyResult?: string;
  tester?: string;
  testTime?: string;
  remark?: string;
}

/** 性能测试保存参数（OA-DEV-108） */
export interface OaPerfTestSaveParams {
  testNo?: string;
  sceneName?: string;
  loadModel?: string;
  concurrentUsers?: number;
  flowConcurrency?: number;
  mailVolume?: number;
  docVolume?: number;
  attachCapacity?: number;
  targetTps?: number;
  targetRtMs?: number;
  actualTps?: number;
  actualRtMs?: number;
  errorRate?: number;
  cpuUsage?: number;
  memUsage?: number;
  result?: string;
  tester?: string;
  testTime?: string;
  remark?: string;
}

/** 兼容性测试保存参数（OA-DEV-109） */
export interface OaCompatTestSaveParams {
  testNo?: string;
  envType?: string;
  envName?: string;
  envVersion?: string;
  network?: string;
  scene?: string;
  result?: string;
  blockLevel?: string;
  issue?: string;
  tester?: string;
  testTime?: string;
  remark?: string;
}

/** 备份恢复演练保存参数（OA-DEV-110） */
export interface OaBackupDrillSaveParams {
  drillNo?: string;
  drillName?: string;
  drillType?: string;
  backupSource?: string;
  backupTime?: string;
  targetRpoMinutes?: number;
  targetRtoMinutes?: number;
  restoreStart?: string;
  restoreEnd?: string;
  actualRpoMinutes?: number;
  actualRtoMinutes?: number;
  restoreResult?: string;
  dataVerified?: number;
  operatorName?: string;
  drillTime?: string;
  remark?: string;
}

/** UAT 记录保存参数（OA-DEV-111） */
export interface OaUatRecordSaveParams {
  uatNo?: string;
  dept?: string;
  sceneName?: string;
  scenarioRef?: string;
  uatStatus?: string;
  ownerDept?: string;
  participant?: string;
  expected?: string;
  actual?: string;
  issueCount?: number;
  blockerCount?: number;
  conclusion?: string;
  uatTime?: string;
  remark?: string;
}

/** 培训材料保存参数（OA-DEV-112） */
export interface OaTrainingMaterialSaveParams {
  materialNo?: string;
  materialName?: string;
  materialType?: string;
  targetRole?: string;
  format?: string;
  location?: string;
  materialVersion?: string;
  publishTime?: string;
  audienceCount?: number;
  signedCount?: number;
  status?: number;
  remark?: string;
}

/** 切换预案保存参数（OA-DEV-113） */
export interface OaCutoverPlanSaveParams {
  planNo?: string;
  planName?: string;
  planType?: string;
  cutoverWindow?: string;
  freezeTime?: string;
  incrementSync?: string;
  entrySwitch?: string;
  notifyPlan?: string;
  dutyPerson?: string;
  rollbackTrigger?: string;
  rollbackOwner?: string;
  rehearsalResult?: string;
  rehearsalTime?: string;
  status?: string;
  approver?: string;
  remark?: string;
}

/** 用例类型（oa_test_case_type） */
export const OA_TEST_CASE_TYPE_OPTIONS = [
  { label: '功能测试', value: 'FUNCTION' },
  { label: '回归测试', value: 'REGRESSION' },
] as const;

export const OA_TEST_CASE_TYPE_LABEL: Record<string, string> = {
  FUNCTION: '功能测试',
  REGRESSION: '回归测试',
};

/** 用例优先级（oa_test_priority） */
export const OA_TEST_PRIORITY_OPTIONS = [
  { label: 'P0-阻断', value: 'P0' },
  { label: 'P1-重要', value: 'P1' },
  { label: 'P2-一般', value: 'P2' },
] as const;

export const OA_TEST_PRIORITY_LABEL: Record<string, string> = {
  P0: 'P0-阻断',
  P1: 'P1-重要',
  P2: 'P2-一般',
};

/** 用例执行状态（oa_test_exec_status） */
export const OA_TEST_EXEC_STATUS_OPTIONS = [
  { label: '未执行', value: 'NOT_RUN' },
  { label: '通过', value: 'PASS' },
  { label: '失败', value: 'FAIL' },
  { label: '阻塞', value: 'BLOCKED' },
] as const;

export const OA_TEST_EXEC_STATUS_LABEL: Record<string, string> = {
  NOT_RUN: '未执行',
  PASS: '通过',
  FAIL: '失败',
  BLOCKED: '阻塞',
};

/** 权限测试场景类型（oa_permission_scene_type） */
export const OA_PERMISSION_SCENE_TYPE_OPTIONS = [
  { label: '跨部门', value: 'CROSS_DEPT' },
  { label: '跨工厂', value: 'CROSS_FACTORY' },
] as const;

export const OA_PERMISSION_SCENE_TYPE_LABEL: Record<string, string> = {
  CROSS_DEPT: '跨部门',
  CROSS_FACTORY: '跨工厂',
};

/** 权限测试结论（oa_permission_test_result） */
export const OA_PERMISSION_TEST_RESULT_OPTIONS = [
  { label: '通过', value: 'PASS' },
  { label: '失败', value: 'FAIL' },
  { label: '待执行', value: 'PENDING' },
] as const;

export const OA_PERMISSION_TEST_RESULT_LABEL: Record<string, string> = {
  PASS: '通过',
  FAIL: '失败',
  PENDING: '待执行',
};

/** 安全检查类型（oa_security_check_type） */
export const OA_SECURITY_CHECK_TYPE_OPTIONS = [
  { label: '代码扫描', value: 'CODE_SCAN' },
  { label: '渗透测试', value: 'PENETRATION' },
  { label: '漏洞扫描', value: 'VULNERABILITY' },
] as const;

export const OA_SECURITY_CHECK_TYPE_LABEL: Record<string, string> = {
  CODE_SCAN: '代码扫描',
  PENETRATION: '渗透测试',
  VULNERABILITY: '漏洞扫描',
};

/** 安全风险级别（oa_security_severity） */
export const OA_SECURITY_SEVERITY_OPTIONS = [
  { label: '严重', value: 'CRITICAL' },
  { label: '高', value: 'HIGH' },
  { label: '中', value: 'MEDIUM' },
  { label: '低', value: 'LOW' },
] as const;

export const OA_SECURITY_SEVERITY_LABEL: Record<string, string> = {
  CRITICAL: '严重',
  HIGH: '高',
  MEDIUM: '中',
  LOW: '低',
};

/** 安全整改状态（oa_security_fix_status） */
export const OA_SECURITY_FIX_STATUS_OPTIONS = [
  { label: '待整改', value: 'OPEN' },
  { label: '已修复', value: 'FIXED' },
  { label: '已接受风险', value: 'ACCEPTED' },
] as const;

export const OA_SECURITY_FIX_STATUS_LABEL: Record<string, string> = {
  OPEN: '待整改',
  FIXED: '已修复',
  ACCEPTED: '已接受风险',
};

/** 性能负载模型（oa_perf_load_model） */
export const OA_PERF_LOAD_MODEL_OPTIONS = [
  { label: '恒定负载', value: 'CONSTANT' },
  { label: '阶梯加压', value: 'STEP' },
  { label: '峰值冲击', value: 'SPIKE' },
] as const;

export const OA_PERF_LOAD_MODEL_LABEL: Record<string, string> = {
  CONSTANT: '恒定负载',
  STEP: '阶梯加压',
  SPIKE: '峰值冲击',
};

/** 性能测试结论（oa_perf_test_result） */
export const OA_PERF_TEST_RESULT_OPTIONS = [
  { label: '通过', value: 'PASS' },
  { label: '失败', value: 'FAIL' },
  { label: '待判定', value: 'PENDING' },
] as const;

export const OA_PERF_TEST_RESULT_LABEL: Record<string, string> = {
  PASS: '通过',
  FAIL: '失败',
  PENDING: '待判定',
};

/** 兼容测试环境类型（oa_compat_env_type） */
export const OA_COMPAT_ENV_TYPE_OPTIONS = [
  { label: '浏览器', value: 'BROWSER' },
  { label: '客户端', value: 'CLIENT' },
  { label: '操作系统', value: 'OS' },
  { label: '网络环境', value: 'NETWORK' },
] as const;

export const OA_COMPAT_ENV_TYPE_LABEL: Record<string, string> = {
  BROWSER: '浏览器',
  CLIENT: '客户端',
  OS: '操作系统',
  NETWORK: '网络环境',
};

/** 兼容测试结论（oa_compat_test_result） */
export const OA_COMPAT_TEST_RESULT_OPTIONS = [
  { label: '通过', value: 'PASS' },
  { label: '部分通过', value: 'PARTIAL' },
  { label: '失败', value: 'FAIL' },
  { label: '待测试', value: 'PENDING' },
] as const;

export const OA_COMPAT_TEST_RESULT_LABEL: Record<string, string> = {
  PASS: '通过',
  PARTIAL: '部分通过',
  FAIL: '失败',
  PENDING: '待测试',
};

/** 兼容问题阻塞级别（oa_compat_block_level） */
export const OA_COMPAT_BLOCK_LEVEL_OPTIONS = [
  { label: '阻断', value: 'BLOCKER' },
  { label: '主要', value: 'MAJOR' },
  { label: '次要', value: 'MINOR' },
] as const;

export const OA_COMPAT_BLOCK_LEVEL_LABEL: Record<string, string> = {
  BLOCKER: '阻断',
  MAJOR: '主要',
  MINOR: '次要',
};

/** 备份演练类型（oa_backup_drill_type） */
export const OA_BACKUP_DRILL_TYPE_OPTIONS = [
  { label: '数据库', value: 'DB' },
  { label: '文件', value: 'FILE' },
  { label: '全量', value: 'FULL' },
] as const;

export const OA_BACKUP_DRILL_TYPE_LABEL: Record<string, string> = {
  DB: '数据库',
  FILE: '文件',
  FULL: '全量',
};

/** 备份恢复结果（oa_backup_restore_result） */
export const OA_BACKUP_RESTORE_RESULT_OPTIONS = [
  { label: '成功', value: 'SUCCESS' },
  { label: '部分成功', value: 'PARTIAL' },
  { label: '失败', value: 'FAILED' },
  { label: '待恢复', value: 'PENDING' },
] as const;

export const OA_BACKUP_RESTORE_RESULT_LABEL: Record<string, string> = {
  SUCCESS: '成功',
  PARTIAL: '部分成功',
  FAILED: '失败',
  PENDING: '待恢复',
};

/** UAT 验收状态（oa_uat_status） */
export const OA_UAT_STATUS_OPTIONS = [
  { label: '待验收', value: 'PENDING' },
  { label: '验收中', value: 'RUNNING' },
  { label: '已通过', value: 'PASSED' },
  { label: '未通过', value: 'FAILED' },
] as const;

export const OA_UAT_STATUS_LABEL: Record<string, string> = {
  PENDING: '待验收',
  RUNNING: '验收中',
  PASSED: '已通过',
  FAILED: '未通过',
};

/** 培训材料类型（oa_training_material_type） */
export const OA_TRAINING_MATERIAL_TYPE_OPTIONS = [
  { label: '操作手册', value: 'MANUAL' },
  { label: '视频教程', value: 'VIDEO' },
  { label: '常见问题', value: 'FAQ' },
  { label: '角色培训', value: 'ROLE_TRAINING' },
] as const;

export const OA_TRAINING_MATERIAL_TYPE_LABEL: Record<string, string> = {
  MANUAL: '操作手册',
  VIDEO: '视频教程',
  FAQ: '常见问题',
  ROLE_TRAINING: '角色培训',
};

/** 切换预案类型（oa_cutover_plan_type） */
export const OA_CUTOVER_PLAN_TYPE_OPTIONS = [
  { label: '正式切换', value: 'CUTOVER' },
  { label: '回退预案', value: 'ROLLBACK' },
] as const;

export const OA_CUTOVER_PLAN_TYPE_LABEL: Record<string, string> = {
  CUTOVER: '正式切换',
  ROLLBACK: '回退预案',
};

/** 切换预案状态（oa_cutover_status） */
export const OA_CUTOVER_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已评审', value: 'REVIEWED' },
  { label: '已批准', value: 'APPROVED' },
] as const;

export const OA_CUTOVER_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  REVIEWED: '已评审',
  APPROVED: '已批准',
};

/** 切换演练结果（oa_rehearsal_result） */
export const OA_REHEARSAL_RESULT_OPTIONS = [
  { label: '未演练', value: 'NOT_RUN' },
  { label: '通过', value: 'PASS' },
  { label: '失败', value: 'FAIL' },
] as const;

export const OA_REHEARSAL_RESULT_LABEL: Record<string, string> = {
  NOT_RUN: '未演练',
  PASS: '通过',
  FAIL: '失败',
};

/* ---------------- OA-N12 正式切换与现有OA退役 ---------------- */

/** OA-N12 通用分页查询条件 */
export interface OaGoliveQuery extends PageQuery {
  freezeType?: string;
  freezeStatus?: string;
  migType?: string;
  migStatus?: string;
  verifyStatus?: string;
  switchType?: string;
  switchStatus?: string;
  dutyRole?: string;
  watchStatus?: string;
  rollbackType?: string;
  decisionResult?: string;
  drillResult?: string;
  archiveType?: string;
  archiveStatus?: string;
  resourceType?: string;
  decommissionStatus?: string;
  deliverableType?: string;
  handoverStatus?: string;
  startDate?: string;
  endDate?: string;
}

/** 冻结旧OA关键写入（OA-DEV-114） */
export interface OaGoliveFreezeItem {
  id: number;
  freezeNo?: string;
  freezeName?: string;
  freezeType?: string;
  freezeScope?: string;
  freezeStart?: string;
  freezeEnd?: string;
  readOnlyRetained?: number;
  emergencyPlan?: string;
  noticePublished?: number;
  noticeTime?: string;
  freezeStatus?: string;
  dutyPerson?: string;
  operatorName?: string;
  orgId?: number;
  orgName?: string;
  remark?: string;
}

/** 冻结旧OA关键写入保存参数（OA-DEV-114） */
export interface OaGoliveFreezeSaveParams {
  freezeNo?: string;
  freezeName?: string;
  freezeType?: string;
  freezeScope?: string;
  freezeStart?: string;
  freezeEnd?: string;
  readOnlyRetained?: number;
  emergencyPlan?: string;
  noticePublished?: number;
  noticeTime?: string;
  freezeStatus?: string;
  dutyPerson?: string;
  operatorName?: string;
  orgName?: string;
  remark?: string;
}

/** 执行最终全量及增量迁移（OA-DEV-115） */
export interface OaFinalMigrationItem {
  id: number;
  migNo?: string;
  migName?: string;
  migType?: string;
  sourceScope?: string;
  extractStart?: string;
  extractEnd?: string;
  importedCount?: number;
  failedCount?: number;
  attachmentCount?: number;
  verifyStatus?: string;
  verifyPass?: number;
  migStatus?: string;
  operatorName?: string;
  migTime?: string;
  orgId?: number;
  orgName?: string;
  remark?: string;
}

/** 执行最终全量及增量迁移保存参数（OA-DEV-115） */
export interface OaFinalMigrationSaveParams {
  migNo?: string;
  migName?: string;
  migType?: string;
  sourceScope?: string;
  extractStart?: string;
  extractEnd?: string;
  importedCount?: number;
  failedCount?: number;
  attachmentCount?: number;
  verifyStatus?: string;
  verifyPass?: number;
  migStatus?: string;
  operatorName?: string;
  migTime?: string;
  orgName?: string;
  remark?: string;
}

/** 切换门户入口与身份（OA-DEV-116） */
export interface OaEntrySwitchItem {
  id: number;
  switchNo?: string;
  switchName?: string;
  switchType?: string;
  oldEntry?: string;
  newEntry?: string;
  switchPlan?: string;
  dnsTtlMinutes?: number;
  ssoEnabled?: number;
  mobileEnabled?: number;
  switchStatus?: string;
  switchTime?: string;
  verifyResult?: string;
  operatorName?: string;
  orgId?: number;
  orgName?: string;
  remark?: string;
}

/** 切换门户入口与身份保存参数（OA-DEV-116） */
export interface OaEntrySwitchSaveParams {
  switchNo?: string;
  switchName?: string;
  switchType?: string;
  oldEntry?: string;
  newEntry?: string;
  switchPlan?: string;
  dnsTtlMinutes?: number;
  ssoEnabled?: number;
  mobileEnabled?: number;
  switchStatus?: string;
  switchTime?: string;
  verifyResult?: string;
  operatorName?: string;
  orgName?: string;
  remark?: string;
}

/** 上线值守与问题响应（OA-DEV-117） */
export interface OaGoliveWatchItem {
  id: number;
  watchNo?: string;
  watchName?: string;
  watchShift?: string;
  dutyRole?: string;
  dutyPerson?: string;
  monitorScope?: string;
  loginCount?: number;
  flowCount?: number;
  mailCount?: number;
  docCount?: number;
  apiCount?: number;
  issueCount?: number;
  criticalIssueCount?: number;
  closedIssueCount?: number;
  watchStatus?: string;
  reportSummary?: string;
  watchTime?: string;
  orgId?: number;
  orgName?: string;
  remark?: string;
}

/** 上线值守与问题响应保存参数（OA-DEV-117） */
export interface OaGoliveWatchSaveParams {
  watchNo?: string;
  watchName?: string;
  watchShift?: string;
  dutyRole?: string;
  dutyPerson?: string;
  monitorScope?: string;
  loginCount?: number;
  flowCount?: number;
  mailCount?: number;
  docCount?: number;
  apiCount?: number;
  issueCount?: number;
  criticalIssueCount?: number;
  closedIssueCount?: number;
  watchStatus?: string;
  reportSummary?: string;
  watchTime?: string;
  remark?: string;
}

/** 回退决策和演练（OA-DEV-118） */
export interface OaRollbackRecordItem {
  id: number;
  rollbackNo?: string;
  rollbackName?: string;
  rollbackType?: string;
  rollbackReason?: string;
  triggerCondition?: string;
  rollbackScope?: string;
  dataBoundary?: string;
  decisionResult?: string;
  decisionTime?: string;
  drillResult?: string;
  drillTime?: string;
  windowMinutes?: number;
  doubleWriteAvoided?: number;
  rollbackOwner?: string;
  orgId?: number;
  orgName?: string;
  remark?: string;
}

/** 回退决策和演练保存参数（OA-DEV-118） */
export interface OaRollbackRecordSaveParams {
  rollbackNo?: string;
  rollbackName?: string;
  rollbackType?: string;
  rollbackReason?: string;
  triggerCondition?: string;
  rollbackScope?: string;
  dataBoundary?: string;
  decisionResult?: string;
  decisionTime?: string;
  drillResult?: string;
  drillTime?: string;
  windowMinutes?: number;
  doubleWriteAvoided?: number;
  rollbackOwner?: string;
  remark?: string;
}

/** 现有OA只读封存（OA-DEV-119） */
export interface OaLegacyArchiveItem {
  id: number;
  archiveNo?: string;
  archiveName?: string;
  archiveType?: string;
  archiveScope?: string;
  snapshotPath?: string;
  snapshotChecksum?: string;
  retentionYears?: number;
  retentionPolicy?: string;
  backupVerified?: number;
  queryEntry?: string;
  archiveStatus?: string;
  archiveTime?: string;
  approver?: string;
  orgId?: number;
  orgName?: string;
  remark?: string;
}

/** 现有OA只读封存保存参数（OA-DEV-119） */
export interface OaLegacyArchiveSaveParams {
  archiveNo?: string;
  archiveName?: string;
  archiveType?: string;
  archiveScope?: string;
  snapshotPath?: string;
  snapshotChecksum?: string;
  retentionYears?: number;
  retentionPolicy?: string;
  backupVerified?: number;
  queryEntry?: string;
  archiveStatus?: string;
  archiveTime?: string;
  approver?: string;
  remark?: string;
}

/** 完成授权和资源回收（OA-DEV-120） */
export interface OaDecommissionRecordItem {
  id: number;
  decommissionNo?: string;
  decommissionName?: string;
  resourceType?: string;
  resourceDesc?: string;
  revokeScope?: string;
  approved?: number;
  approver?: string;
  decommissionStatus?: string;
  executeTime?: string;
  backupKept?: number;
  riskNote?: string;
  operatorName?: string;
  orgId?: number;
  orgName?: string;
  remark?: string;
}

/** 完成授权和资源回收保存参数（OA-DEV-120） */
export interface OaDecommissionRecordSaveParams {
  decommissionNo?: string;
  decommissionName?: string;
  resourceType?: string;
  resourceDesc?: string;
  revokeScope?: string;
  approved?: number;
  approver?: string;
  decommissionStatus?: string;
  executeTime?: string;
  backupKept?: number;
  riskNote?: string;
  operatorName?: string;
  orgName?: string;
  remark?: string;
}

/** 完成知识转移和质保（OA-DEV-121） */
export interface OaOpsHandoverItem {
  id: number;
  handoverNo?: string;
  handoverName?: string;
  deliverableType?: string;
  deliverableDesc?: string;
  location?: string;
  handoverStatus?: string;
  deliveredTime?: string;
  receiver?: string;
  confirmTime?: string;
  warrantyMonths?: number;
  warrantyStart?: string;
  warrantyEnd?: string;
  acceptanceVerified?: number;
  orgId?: number;
  orgName?: string;
  remark?: string;
}

/** 完成知识转移和质保保存参数（OA-DEV-121） */
export interface OaOpsHandoverSaveParams {
  handoverNo?: string;
  handoverName?: string;
  deliverableType?: string;
  deliverableDesc?: string;
  location?: string;
  handoverStatus?: string;
  deliveredTime?: string;
  receiver?: string;
  confirmTime?: string;
  warrantyMonths?: number;
  warrantyStart?: string;
  warrantyEnd?: string;
  acceptanceVerified?: number;
  orgName?: string;
  remark?: string;
}

/** 切换冻结类型（oa_golive_freeze_type） */
export const OA_GOLIVE_FREEZE_TYPE_OPTIONS = [
  { label: '流程发起冻结', value: 'FLOW' },
  { label: '文档写入冻结', value: 'DOC' },
  { label: '邮件变更冻结', value: 'MAIL' },
  { label: '全部冻结', value: 'ALL' },
] as const;

export const OA_GOLIVE_FREEZE_TYPE_LABEL: Record<string, string> = {
  FLOW: '流程发起冻结',
  DOC: '文档写入冻结',
  MAIL: '邮件变更冻结',
  ALL: '全部冻结',
};

/** 切换冻结状态（oa_golive_freeze_status） */
export const OA_GOLIVE_FREEZE_STATUS_OPTIONS = [
  { label: '待冻结', value: 'PENDING' },
  { label: '冻结中', value: 'ACTIVE' },
  { label: '已解除', value: 'RELEASED' },
] as const;

export const OA_GOLIVE_FREEZE_STATUS_LABEL: Record<string, string> = {
  PENDING: '待冻结',
  ACTIVE: '冻结中',
  RELEASED: '已解除',
};

/** 最终迁移类型（oa_golive_mig_type） */
export const OA_GOLIVE_MIG_TYPE_OPTIONS = [
  { label: '全量迁移', value: 'FULL' },
  { label: '增量迁移', value: 'INCREMENT' },
] as const;

export const OA_GOLIVE_MIG_TYPE_LABEL: Record<string, string> = {
  FULL: '全量迁移',
  INCREMENT: '增量迁移',
};

/** 最终迁移状态（oa_golive_mig_status） */
export const OA_GOLIVE_MIG_STATUS_OPTIONS = [
  { label: '待执行', value: 'PENDING' },
  { label: '执行中', value: 'RUNNING' },
  { label: '成功', value: 'SUCCESS' },
  { label: '部分成功', value: 'PARTIAL' },
  { label: '失败', value: 'FAILED' },
] as const;

export const OA_GOLIVE_MIG_STATUS_LABEL: Record<string, string> = {
  PENDING: '待执行',
  RUNNING: '执行中',
  SUCCESS: '成功',
  PARTIAL: '部分成功',
  FAILED: '失败',
};

/** 最终迁移校验状态（oa_golive_verify_status） */
export const OA_GOLIVE_VERIFY_STATUS_OPTIONS = [
  { label: '待核对', value: 'PENDING' },
  { label: '核对通过', value: 'VERIFIED' },
  { label: '存在差异', value: 'EXCEPTION' },
] as const;

export const OA_GOLIVE_VERIFY_STATUS_LABEL: Record<string, string> = {
  PENDING: '待核对',
  VERIFIED: '核对通过',
  EXCEPTION: '存在差异',
};

/** 入口切换类型（oa_golive_entry_type） */
export const OA_GOLIVE_ENTRY_TYPE_OPTIONS = [
  { label: '门户入口', value: 'PORTAL' },
  { label: '域名解析', value: 'DNS' },
  { label: '反向代理', value: 'PROXY' },
  { label: '统一身份(SSO)', value: 'SSO' },
  { label: '移动端入口', value: 'MOBILE' },
] as const;

export const OA_GOLIVE_ENTRY_TYPE_LABEL: Record<string, string> = {
  PORTAL: '门户入口',
  DNS: '域名解析',
  PROXY: '反向代理',
  SSO: '统一身份(SSO)',
  MOBILE: '移动端入口',
};

/** 入口切换状态（oa_golive_entry_status） */
export const OA_GOLIVE_ENTRY_STATUS_OPTIONS = [
  { label: '待切换', value: 'PENDING' },
  { label: '已切换', value: 'DONE' },
  { label: '已回退', value: 'ROLLBACK' },
] as const;

export const OA_GOLIVE_ENTRY_STATUS_LABEL: Record<string, string> = {
  PENDING: '待切换',
  DONE: '已切换',
  ROLLBACK: '已回退',
};

/** 值守角色（oa_golive_duty_role） */
export const OA_GOLIVE_DUTY_ROLE_OPTIONS = [
  { label: '业务值守', value: 'BUSINESS' },
  { label: '技术值守', value: 'TECH' },
  { label: '数据值守', value: 'DATA' },
  { label: '安全值守', value: 'SECURITY' },
] as const;

export const OA_GOLIVE_DUTY_ROLE_LABEL: Record<string, string> = {
  BUSINESS: '业务值守',
  TECH: '技术值守',
  DATA: '数据值守',
  SECURITY: '安全值守',
};

/** 上线值守状态（oa_golive_watch_status） */
export const OA_GOLIVE_WATCH_STATUS_OPTIONS = [
  { label: '值守中', value: 'PENDING' },
  { label: '已归档', value: 'CLOSED' },
] as const;

export const OA_GOLIVE_WATCH_STATUS_LABEL: Record<string, string> = {
  PENDING: '值守中',
  CLOSED: '已归档',
};

/** 回退记录类型（oa_golive_rollback_type） */
export const OA_GOLIVE_ROLLBACK_TYPE_OPTIONS = [
  { label: '回退决策', value: 'DECISION' },
  { label: '回退演练', value: 'DRILL' },
] as const;

export const OA_GOLIVE_ROLLBACK_TYPE_LABEL: Record<string, string> = {
  DECISION: '回退决策',
  DRILL: '回退演练',
};

/** 回退决策结果（oa_golive_decision_result） */
export const OA_GOLIVE_DECISION_RESULT_OPTIONS = [
  { label: '待决策', value: 'PENDING' },
  { label: '继续运行', value: 'GO' },
  { label: '执行回退', value: 'ROLLBACK' },
] as const;

export const OA_GOLIVE_DECISION_RESULT_LABEL: Record<string, string> = {
  PENDING: '待决策',
  GO: '继续运行',
  ROLLBACK: '执行回退',
};

/** 回退演练结果（oa_golive_drill_result） */
export const OA_GOLIVE_DRILL_RESULT_OPTIONS = [
  { label: '未演练', value: 'NOT_RUN' },
  { label: '演练通过', value: 'PASS' },
  { label: '演练失败', value: 'FAIL' },
] as const;

export const OA_GOLIVE_DRILL_RESULT_LABEL: Record<string, string> = {
  NOT_RUN: '未演练',
  PASS: '演练通过',
  FAIL: '演练失败',
};

/** 旧系统封存类型（oa_golive_archive_type） */
export const OA_GOLIVE_ARCHIVE_TYPE_OPTIONS = [
  { label: '只读封存', value: 'READONLY' },
  { label: '离线封存', value: 'OFFLINE' },
] as const;

export const OA_GOLIVE_ARCHIVE_TYPE_LABEL: Record<string, string> = {
  READONLY: '只读封存',
  OFFLINE: '离线封存',
};

/** 旧系统封存状态（oa_golive_archive_status） */
export const OA_GOLIVE_ARCHIVE_STATUS_OPTIONS = [
  { label: '待封存', value: 'PENDING' },
  { label: '已封存', value: 'ARCHIVED' },
] as const;

export const OA_GOLIVE_ARCHIVE_STATUS_LABEL: Record<string, string> = {
  PENDING: '待封存',
  ARCHIVED: '已封存',
};

/** 资源回收类型（oa_golive_resource_type） */
export const OA_GOLIVE_RESOURCE_TYPE_OPTIONS = [
  { label: '外部访问', value: 'ACCESS' },
  { label: '服务账号', value: 'SERVICE_ACCOUNT' },
  { label: '证书', value: 'CERTIFICATE' },
  { label: '存储资源', value: 'STORAGE' },
  { label: '软件许可', value: 'LICENSE' },
] as const;

export const OA_GOLIVE_RESOURCE_TYPE_LABEL: Record<string, string> = {
  ACCESS: '外部访问',
  SERVICE_ACCOUNT: '服务账号',
  CERTIFICATE: '证书',
  STORAGE: '存储资源',
  LICENSE: '软件许可',
};

/** 资源回收状态（oa_golive_decommission_status） */
export const OA_GOLIVE_DECOMMISSION_STATUS_OPTIONS = [
  { label: '待回收', value: 'PENDING' },
  { label: '已回收', value: 'EXECUTED' },
] as const;

export const OA_GOLIVE_DECOMMISSION_STATUS_LABEL: Record<string, string> = {
  PENDING: '待回收',
  EXECUTED: '已回收',
};

/** 运维交接交付物类型（oa_golive_deliverable_type） */
export const OA_GOLIVE_DELIVERABLE_TYPE_OPTIONS = [
  { label: '源代码', value: 'SOURCE' },
  { label: '构建产物', value: 'BUILD' },
  { label: '部署脚本', value: 'DEPLOY' },
  { label: '监控方案', value: 'MONITOR' },
  { label: '备份方案', value: 'BACKUP' },
  { label: '故障手册', value: 'INCIDENT' },
  { label: '账号权限', value: 'ACCOUNT' },
  { label: '质保服务', value: 'WARRANTY' },
] as const;

export const OA_GOLIVE_DELIVERABLE_TYPE_LABEL: Record<string, string> = {
  SOURCE: '源代码',
  BUILD: '构建产物',
  DEPLOY: '部署脚本',
  MONITOR: '监控方案',
  BACKUP: '备份方案',
  INCIDENT: '故障手册',
  ACCOUNT: '账号权限',
  WARRANTY: '质保服务',
};

/** 运维交接状态（oa_golive_handover_status） */
export const OA_GOLIVE_HANDOVER_STATUS_OPTIONS = [
  { label: '待交付', value: 'PENDING' },
  { label: '已交付', value: 'DELIVERED' },
  { label: '已确认', value: 'CONFIRMED' },
] as const;

export const OA_GOLIVE_HANDOVER_STATUS_LABEL: Record<string, string> = {
  PENDING: '待交付',
  DELIVERED: '已交付',
  CONFIRMED: '已确认',
};
