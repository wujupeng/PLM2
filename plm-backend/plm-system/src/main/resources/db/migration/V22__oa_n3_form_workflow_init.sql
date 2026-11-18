-- OA-N3 初始化数据：低代码表单与工作流引擎的菜单、按钮权限、角色授权、字典、可配置项与样例流程
-- 说明：流程与表单均为可配置数据，样例仅用于联调与验收演示，实施时由业务方通过设计器维护。

-- ========== OA-N3 权限（菜单 3700-3705，按钮 3706-3718） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(3700, 'oa-form', '表单设计器', 'menu', 3600, '/oa/forms', 'FormOutlined', 7, 1),
(3701, 'oa-process', '流程设计器', 'menu', 3600, '/oa/processes', 'PartitionOutlined', 8, 1),
(3702, 'oa-my-application', '我的申请', 'menu', 3600, '/oa/my-applications', 'FileDoneOutlined', 9, 1),
(3703, 'oa-todo', '我的待办', 'menu', 3600, '/oa/tasks', 'CarryOutOutlined', 10, 1),
(3704, 'oa-approval-record', '审批查询', 'menu', 3600, '/oa/approvals', 'AuditOutlined', 11, 1),
(3705, 'oa-process-monitor', '流程监控', 'menu', 3600, '/oa/monitor', 'MonitorOutlined', 12, 1),
(3706, 'oa:form:list', '查询表单', 'button', 3700, NULL, NULL, 1, 1),
(3707, 'oa:form:save', '维护表单', 'button', 3700, NULL, NULL, 2, 1),
(3708, 'oa:form:delete', '删除表单', 'button', 3700, NULL, NULL, 3, 1),
(3709, 'oa:form:publish', '发布表单', 'button', 3700, NULL, NULL, 4, 1),
(3710, 'oa:process:list', '查询流程', 'button', 3701, NULL, NULL, 1, 1),
(3711, 'oa:process:save', '维护流程', 'button', 3701, NULL, NULL, 2, 1),
(3712, 'oa:process:delete', '删除流程', 'button', 3701, NULL, NULL, 3, 1),
(3713, 'oa:process:publish', '发布流程', 'button', 3701, NULL, NULL, 4, 1),
(3714, 'oa:instance:list', '查询流程实例', 'button', 3704, NULL, NULL, 1, 1),
(3715, 'oa:instance:start', '发起流程', 'button', 3702, NULL, NULL, 1, 1),
(3716, 'oa:instance:cancel', '撤回流程', 'button', 3702, NULL, NULL, 2, 1),
(3717, 'oa:task:list', '查询待办任务', 'button', 3703, NULL, NULL, 1, 1),
(3718, 'oa:task:approve', '处理审批任务', 'button', 3703, NULL, NULL, 2, 1);

-- 管理员（2001）：授予 OA-N3 全部权限
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11100, 2001, 3700), (11101, 2001, 3701), (11102, 2001, 3702), (11103, 2001, 3703),
(11104, 2001, 3704), (11105, 2001, 3705), (11106, 2001, 3706), (11107, 2001, 3707),
(11108, 2001, 3708), (11109, 2001, 3709), (11110, 2001, 3710), (11111, 2001, 3711),
(11112, 2001, 3712), (11113, 2001, 3713), (11114, 2001, 3714), (11115, 2001, 3715),
(11116, 2001, 3716), (11117, 2001, 3717), (11118, 2001, 3718);

-- 只读用户（2006）：全菜单 + 仅查看按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11119, 2006, 3700), (11120, 2006, 3701), (11121, 2006, 3702), (11122, 2006, 3703),
(11123, 2006, 3704), (11124, 2006, 3705), (11125, 2006, 3706), (11126, 2006, 3710),
(11127, 2006, 3714), (11128, 2006, 3717);

-- 研发工程师（2002）：我的申请、我的待办、审批查询，可发起与审批
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11129, 2002, 3702), (11130, 2002, 3703), (11131, 2002, 3704), (11132, 2002, 3714),
(11133, 2002, 3715), (11134, 2002, 3716), (11135, 2002, 3717), (11136, 2002, 3718);

-- 质量工程师（2003）：同研发工程师
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11137, 2003, 3702), (11138, 2003, 3703), (11139, 2003, 3704), (11140, 2003, 3714),
(11141, 2003, 3715), (11142, 2003, 3716), (11143, 2003, 3717), (11144, 2003, 3718);

-- 供应链专员（2004）：同研发工程师
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11145, 2004, 3702), (11146, 2004, 3703), (11147, 2004, 3704), (11148, 2004, 3714),
(11149, 2004, 3715), (11150, 2004, 3716), (11151, 2004, 3717), (11152, 2004, 3718);

-- 生产现场（2005）：我的申请、我的待办
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11153, 2005, 3702), (11154, 2005, 3703), (11155, 2005, 3714), (11156, 2005, 3715),
(11157, 2005, 3717), (11158, 2005, 3718);

-- ========== OA-N3 字典 ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(6111, 'oa_form_field_type', '单行文本', 'TEXT', 1, 1, NULL),
(6112, 'oa_form_field_type', '多行文本', 'TEXTAREA', 2, 1, NULL),
(6113, 'oa_form_field_type', '数字', 'NUMBER', 3, 1, NULL),
(6114, 'oa_form_field_type', '金额', 'AMOUNT', 4, 1, NULL),
(6115, 'oa_form_field_type', '日期', 'DATE', 5, 1, NULL),
(6116, 'oa_form_field_type', '日期时间', 'DATETIME', 6, 1, NULL),
(6117, 'oa_form_field_type', '下拉单选', 'SELECT', 7, 1, NULL),
(6118, 'oa_form_field_type', '下拉多选', 'MULTI_SELECT', 8, 1, NULL),
(6119, 'oa_form_field_type', '人员', 'USER', 9, 1, NULL),
(6120, 'oa_form_field_type', '部门', 'ORG', 10, 1, NULL),
(6121, 'oa_field_data_source', '手工输入', 'MANUAL', 1, 1, NULL),
(6122, 'oa_field_data_source', '数据字典', 'DICT', 2, 1, NULL),
(6123, 'oa_field_data_source', '用户选择', 'USER', 3, 1, NULL),
(6124, 'oa_field_data_source', '部门选择', 'ORG', 4, 1, NULL),
(6125, 'oa_field_data_source', '公式计算', 'FORMULA', 5, 1, NULL),
(6131, 'oa_form_status', '草稿', 'DRAFT', 1, 1, NULL),
(6132, 'oa_form_status', '已发布', 'PUBLISHED', 2, 1, NULL),
(6133, 'oa_form_status', '已停用', 'DISABLED', 3, 1, NULL),
(6141, 'oa_node_type', '开始', 'START', 1, 1, NULL),
(6142, 'oa_node_type', '审批', 'APPROVAL', 2, 1, NULL),
(6143, 'oa_node_type', '抄送', 'CC', 3, 1, NULL),
(6144, 'oa_node_type', '结束', 'END', 4, 1, NULL),
(6151, 'oa_approver_type', '指定人员', 'USER', 1, 1, NULL),
(6152, 'oa_approver_type', '指定角色', 'ROLE', 2, 1, NULL),
(6153, 'oa_approver_type', '部门负责人', 'ORG_MANAGER', 3, 1, NULL),
(6154, 'oa_approver_type', '申请人上级', 'APPLICANT_MANAGER', 4, 1, NULL),
(6155, 'oa_approver_type', '发起人本人', 'PROCESS_STARTER', 5, 1, NULL),
(6161, 'oa_instance_status', '草稿', 'DRAFT', 1, 1, NULL),
(6162, 'oa_instance_status', '审批中', 'RUNNING', 2, 1, NULL),
(6163, 'oa_instance_status', '已通过', 'APPROVED', 3, 1, NULL),
(6164, 'oa_instance_status', '已驳回', 'REJECTED', 4, 1, NULL),
(6165, 'oa_instance_status', '已撤回', 'CANCELLED', 5, 1, NULL),
(6171, 'oa_task_status', '待处理', 'PENDING', 1, 1, NULL),
(6172, 'oa_task_status', '已同意', 'APPROVED', 2, 1, NULL),
(6173, 'oa_task_status', '已驳回', 'REJECTED', 3, 1, NULL),
(6174, 'oa_task_status', '已转办', 'TRANSFERRED', 4, 1, NULL),
(6175, 'oa_task_status', '已取消', 'CANCELLED', 5, 1, NULL),
(6181, 'oa_task_action', '提交', 'SUBMIT', 1, 1, NULL),
(6182, 'oa_task_action', '同意', 'APPROVE', 2, 1, NULL),
(6183, 'oa_task_action', '驳回', 'REJECT', 3, 1, NULL),
(6184, 'oa_task_action', '撤回', 'CANCEL', 4, 1, NULL),
(6185, 'oa_task_action', '转办', 'TRANSFER', 5, 1, NULL),
(6186, 'oa_task_action', '抄送', 'CC', 6, 1, NULL);

-- ========== OA-N3 可配置项 ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(5920, 'OA', 'oa.workflow.task.due.hours', '审批任务默认处理时限（小时）', '48', 1, 1, '待业务方确认各类流程的审批时限与超时提醒策略'),
(5921, 'OA', 'oa.workflow.reject.strategy', '驳回后流转策略', 'BACK_TO_APPLICANT', 1, 1, 'BACK_TO_APPLICANT=退回发起人 / BACK_TO_PREV=退回上一节点 / BACK_TO_START=退回开始节点'),
(5922, 'OA', 'oa.workflow.allow.revoke', '允许发起人撤回审批中的流程', 'true', 0, 1, '撤回后流程实例置为已撤回，已产生的待办任务同时取消'),
(5923, 'OA', 'oa.workflow.cc.notify', '抄送节点发送消息通知', 'true', 0, 1, '消息通道在 OA-N4 统一消息中心落地'),
(5924, 'OA', 'oa.workflow.instance.no.prefix', '流程实例编号前缀', 'OA-', 0, 1, NULL),
(5925, 'OA', 'oa.workflow.form.schema.strict', '表单严格校验模式', 'false', 1, 1, '严格模式下按字段必填与规则校验提交数据');

-- ========== OA-N3 样例数据：请假申请表单与审批流程（仅用于联调与验收演示） ==========

INSERT INTO oa_form_definition (id, form_code, form_name, category, version_no, status, schema_json, description, remark, created_by, created_at) VALUES
(7501, 'OA_LEAVE', '请假申请单', '人事行政', 1, 'PUBLISHED', NULL, '员工请假申请，含请假类型、起止时间与事由', '示例表单，实施时由业务方通过表单设计器维护', 9001, CURRENT_TIMESTAMP);

INSERT INTO oa_form_field (id, form_id, field_code, field_name, field_type, required_flag, data_source, source_value, options_json, rules_json, placeholder, sort_no, remark, created_by, created_at) VALUES
(7511, 7501, 'leaveType', '请假类型', 'SELECT', 1, 'DICT', 'oa_leave_type', NULL, NULL, '请选择请假类型', 1, NULL, 9001, CURRENT_TIMESTAMP),
(7512, 7501, 'startTime', '开始时间', 'DATETIME', 1, 'MANUAL', NULL, NULL, NULL, '请选择开始时间', 2, NULL, 9001, CURRENT_TIMESTAMP),
(7513, 7501, 'endTime', '结束时间', 'DATETIME', 1, 'MANUAL', NULL, NULL, NULL, '请选择结束时间', 3, NULL, 9001, CURRENT_TIMESTAMP),
(7514, 7501, 'leaveDays', '请假天数', 'NUMBER', 1, 'MANUAL', NULL, NULL, NULL, '请输入请假天数', 4, NULL, 9001, CURRENT_TIMESTAMP),
(7515, 7501, 'reason', '请假事由', 'TEXTAREA', 1, 'MANUAL', NULL, NULL, NULL, '请输入请假事由', 5, NULL, 9001, CURRENT_TIMESTAMP);

INSERT INTO oa_process_definition (id, process_code, process_name, form_id, category, version_no, status, definition_json, description, remark, created_by, created_at) VALUES
(7521, 'OA_LEAVE_FLOW', '请假审批流程', 7501, '人事行政', 1, 'PUBLISHED', NULL, '请假申请提交后依次经部门主管、人事备案', '示例流程，实施时由业务方通过流程设计器维护', 9001, CURRENT_TIMESTAMP);

INSERT INTO oa_process_node (id, process_id, node_code, node_name, node_type, approver_type, approver_value, allow_delegate, sort_no, remark, created_by, created_at) VALUES
(7531, 7521, 'N1', '部门主管审批', 'APPROVAL', 'ROLE', '2001', 1, 1, '示例节点，按角色审批', 9001, CURRENT_TIMESTAMP),
(7532, 7521, 'N2', '人事备案', 'APPROVAL', 'ROLE', '2001', 1, 2, '示例节点，按角色审批', 9001, CURRENT_TIMESTAMP);

-- 请假类型字典（示例表单引用）
INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(6191, 'oa_leave_type', '事假', 'PERSONAL', 1, 1, NULL),
(6192, 'oa_leave_type', '病假', 'SICK', 2, 1, NULL),
(6193, 'oa_leave_type', '年假', 'ANNUAL', 3, 1, NULL),
(6194, 'oa_leave_type', '调休', 'COMPENSATORY', 4, 1, NULL),
(6195, 'oa_leave_type', '婚假', 'MARRIAGE', 5, 1, NULL);
