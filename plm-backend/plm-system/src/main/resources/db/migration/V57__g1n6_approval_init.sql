-- G1-N6 公共平台底座—通用能力（WBS T103 可配置审批）初始化：菜单/按钮权限、角色授权、字典与可配置项。
-- 号段基线（V56 之前已占用的最大值）：sys_permission=4088、sys_role_permission=12076、
-- sys_dictionary=7180、sys_config=6122；本脚本从各自之后继续编号，避免主键冲突。
-- 菜单继续挂在「平台底座」（parent_id=3920）下，与集成/报表/文件/身份权限/多组织多工厂/多币种多税率/单据状态机并列。

-- ========== 可配置审批菜单（4090-4094，挂在平台底座 3920 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4090, 'platform:approval:flow', '审批流定义', 'menu', 3920, '/platform/approval/flows', 'AuditOutlined', 71, 1),
(4091, 'platform:approval:condition', '审批条件', 'menu', 3920, '/platform/approval/conditions', 'FilterOutlined', 72, 1),
(4092, 'platform:approval:node', '审批节点', 'menu', 3920, '/platform/approval/nodes', 'ApartmentOutlined', 73, 1),
(4093, 'platform:approval:instance', '审批实例', 'menu', 3920, '/platform/approval/instances', 'ScheduleOutlined', 74, 1),
(4094, 'platform:approval:task', '审批任务', 'menu', 3920, '/platform/approval/tasks', 'CheckCircleOutlined', 75, 1);

-- ========== 可配置审批按钮（4095-4104） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4095, 'platform:approval:flow:list', '查询审批流', 'button', 4090, NULL, NULL, 1, 1),
(4096, 'platform:approval:flow:manage', '维护审批流', 'button', 4090, NULL, NULL, 2, 1),
(4097, 'platform:approval:condition:list', '查询审批条件', 'button', 4091, NULL, NULL, 1, 1),
(4098, 'platform:approval:condition:manage', '维护审批条件', 'button', 4091, NULL, NULL, 2, 1),
(4099, 'platform:approval:node:list', '查询审批节点', 'button', 4092, NULL, NULL, 1, 1),
(4100, 'platform:approval:node:manage', '维护审批节点', 'button', 4092, NULL, NULL, 2, 1),
(4101, 'platform:approval:instance:list', '查询审批实例', 'button', 4093, NULL, NULL, 1, 1),
(4102, 'platform:approval:instance:manage', '维护审批实例', 'button', 4093, NULL, NULL, 2, 1),
(4103, 'platform:approval:task:list', '查询审批任务', 'button', 4094, NULL, NULL, 1, 1),
(4104, 'platform:approval:task:manage', '处理审批任务', 'button', 4094, NULL, NULL, 2, 1);

-- ========== 角色授权 ==========

-- 管理员（2001）：授予可配置审批全部权限
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(12077, 2001, 4090), (12078, 2001, 4091), (12079, 2001, 4092), (12080, 2001, 4093), (12081, 2001, 4094),
(12082, 2001, 4095), (12083, 2001, 4096), (12084, 2001, 4097), (12085, 2001, 4098), (12086, 2001, 4099),
(12087, 2001, 4100), (12088, 2001, 4101), (12089, 2001, 4102), (12090, 2001, 4103), (12091, 2001, 4104);

-- 只读用户（2006）：全部菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(12092, 2006, 4090), (12093, 2006, 4091), (12094, 2006, 4092), (12095, 2006, 4093), (12096, 2006, 4094),
(12097, 2006, 4095), (12098, 2006, 4097), (12099, 2006, 4099), (12100, 2006, 4101), (12101, 2006, 4103);

-- 供应链专员（2004）：全部菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(12102, 2004, 4090), (12103, 2004, 4091), (12104, 2004, 4092), (12105, 2004, 4093), (12106, 2004, 4094),
(12107, 2004, 4095), (12108, 2004, 4097), (12109, 2004, 4099), (12110, 2004, 4101), (12111, 2004, 4103);

-- 质量工程师（2003）：全部菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(12112, 2003, 4090), (12113, 2003, 4091), (12114, 2003, 4092), (12115, 2003, 4093), (12116, 2003, 4094),
(12117, 2003, 4095), (12118, 2003, 4097), (12119, 2003, 4099), (12120, 2003, 4101), (12121, 2003, 4103);

-- 研发工程师（2002）：审批流定义只读
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(12122, 2002, 4090), (12123, 2002, 4095);

-- 生产现场（2005）：审批实例只读
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(12124, 2005, 4093), (12125, 2005, 4101);

-- ========== 可配置审批字典（7190-7218） ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(7190, 'approval_flow_status', '生效', 'ACTIVE', 1, 1, NULL),
(7191, 'approval_flow_status', '停用', 'DISABLED', 2, 1, NULL),
(7192, 'approval_logic_type', '且', 'AND', 1, 1, NULL),
(7193, 'approval_logic_type', '或', 'OR', 2, 1, NULL),
(7194, 'approval_operator', '等于', 'EQ', 1, 1, NULL),
(7195, 'approval_operator', '不等于', 'NE', 2, 1, NULL),
(7196, 'approval_operator', '大于', 'GT', 3, 1, NULL),
(7197, 'approval_operator', '大于等于', 'GE', 4, 1, NULL),
(7198, 'approval_operator', '小于', 'LT', 5, 1, NULL),
(7199, 'approval_operator', '小于等于', 'LE', 6, 1, NULL),
(7200, 'approval_operator', '包含', 'IN', 7, 1, NULL),
(7201, 'approval_operator', '区间', 'BETWEEN', 8, 1, NULL),
(7202, 'approver_type', '按角色', 'ROLE', 1, 1, NULL),
(7203, 'approver_type', '按用户', 'USER', 2, 1, NULL),
(7204, 'approver_type', '按组织', 'ORG', 3, 1, NULL),
(7205, 'approve_mode', '或签', 'ANY', 1, 1, NULL),
(7206, 'approve_mode', '会签', 'ALL', 2, 1, NULL),
(7207, 'approval_instance_status', '审批中', 'PENDING', 1, 1, NULL),
(7208, 'approval_instance_status', '已通过', 'APPROVED', 2, 1, NULL),
(7209, 'approval_instance_status', '已驳回', 'REJECTED', 3, 1, NULL),
(7210, 'approval_instance_status', '已取消', 'CANCELED', 4, 1, NULL),
(7211, 'approval_task_status', '待处理', 'PENDING', 1, 1, NULL),
(7212, 'approval_task_status', '已通过', 'APPROVED', 2, 1, NULL),
(7213, 'approval_task_status', '已驳回', 'REJECTED', 3, 1, NULL),
(7214, 'approval_task_status', '已转办', 'TRANSFERRED', 4, 1, NULL),
(7215, 'approval_node_status', '生效', 'ACTIVE', 1, 1, NULL),
(7216, 'approval_node_status', '停用', 'DISABLED', 2, 1, NULL),
(7217, 'approval_condition_status', '生效', 'ACTIVE', 1, 1, NULL),
(7218, 'approval_condition_status', '停用', 'DISABLED', 2, 1, NULL);

-- ========== 可配置审批可配置项（6130-6133） ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(6130, 'APV', 'approval.enabled', '审批中心启用开关', 'true', 0, 1, '统一可配置审批总开关，默认启用'),
(6131, 'APV', 'approval.default.approve.mode', '默认审批方式', 'ANY', 1, 1, '待业务方确认默认审批方式：ANY 或签/ALL 会签'),
(6132, 'APV', 'approval.condition.default.logic', '默认条件逻辑', 'AND', 1, 1, '待业务方确认审批条件默认逻辑关系：AND/OR'),
(6133, 'APV', 'approval.allow.transfer', '允许转办', 'true', 0, 1, '是否允许审批人转办');
