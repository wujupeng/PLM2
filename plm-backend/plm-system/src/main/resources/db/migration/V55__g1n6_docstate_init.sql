-- G1-N6 公共平台底座—通用能力（WBS T102 单据状态机）初始化：菜单/按钮权限、角色授权、字典与可配置项。
-- 号段基线（V54 之前已占用的最大值）：sys_permission=4079、sys_role_permission=12038、
-- sys_dictionary=7166、sys_config=6114；本脚本从各自之后继续编号，避免主键冲突。
-- 菜单继续挂在「平台底座」（parent_id=3920）下，与集成/报表/文件/身份权限/多组织多工厂/多币种多税率并列。

-- ========== 单据状态机菜单（4080-4082，挂在平台底座 3920 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4080, 'platform:docstate:docstate', '单据状态定义', 'menu', 3920, '/platform/doc-state/state-defs', 'NodeIndexOutlined', 61, 1),
(4081, 'platform:docstate:transition', '状态流转规则', 'menu', 3920, '/platform/doc-state/transitions', 'BranchesOutlined', 62, 1),
(4082, 'platform:docstate:statelog', '单据状态日志', 'menu', 3920, '/platform/doc-state/state-logs', 'HistoryOutlined', 63, 1);

-- ========== 单据状态机按钮（4083-4088） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4083, 'platform:docstate:docstate:list', '查询状态定义', 'button', 4080, NULL, NULL, 1, 1),
(4084, 'platform:docstate:docstate:manage', '维护状态定义', 'button', 4080, NULL, NULL, 2, 1),
(4085, 'platform:docstate:transition:list', '查询流转规则', 'button', 4081, NULL, NULL, 1, 1),
(4086, 'platform:docstate:transition:manage', '维护流转规则', 'button', 4081, NULL, NULL, 2, 1),
(4087, 'platform:docstate:statelog:list', '查询状态日志', 'button', 4082, NULL, NULL, 1, 1),
(4088, 'platform:docstate:statelog:manage', '维护状态日志', 'button', 4082, NULL, NULL, 2, 1);

-- ========== 角色授权 ==========

-- 管理员（2001）：授予单据状态机全部权限
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(12040, 2001, 4080), (12041, 2001, 4081), (12042, 2001, 4082),
(12043, 2001, 4083), (12044, 2001, 4084), (12045, 2001, 4085),
(12046, 2001, 4086), (12047, 2001, 4087), (12048, 2001, 4088);

-- 只读用户（2006）：全部菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(12049, 2006, 4080), (12050, 2006, 4081), (12051, 2006, 4082),
(12052, 2006, 4083), (12053, 2006, 4085), (12054, 2006, 4087);

-- 供应链专员（2004）：单据状态定义/流转规则/状态日志只读
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(12055, 2004, 4080), (12056, 2004, 4081), (12057, 2004, 4082),
(12058, 2004, 4083), (12059, 2004, 4085), (12060, 2004, 4087);

-- 质量工程师（2003）：单据状态定义/流转规则/状态日志只读
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(12061, 2003, 4080), (12062, 2003, 4081), (12063, 2003, 4082),
(12064, 2003, 4083), (12065, 2003, 4085), (12066, 2003, 4087);

-- 研发工程师（2002）：单据状态定义/状态日志只读
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(12067, 2002, 4080), (12068, 2002, 4082),
(12069, 2002, 4083), (12070, 2002, 4087);

-- 生产现场（2005）：单据状态定义/流转规则/状态日志只读
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(12071, 2005, 4080), (12072, 2005, 4081), (12073, 2005, 4082),
(12074, 2005, 4083), (12075, 2005, 4085), (12076, 2005, 4087);

-- ========== 单据状态机字典（7170-7180） ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(7170, 'doc_state_type', '草稿', 'DRAFT', 1, 1, NULL),
(7171, 'doc_state_type', '已提交', 'SUBMITTED', 2, 1, NULL),
(7172, 'doc_state_type', '已审核', 'APPROVED', 3, 1, NULL),
(7173, 'doc_state_type', '执行中', 'EXECUTING', 4, 1, NULL),
(7174, 'doc_state_type', '已关闭', 'CLOSED', 5, 1, NULL),
(7175, 'doc_state_type', '已作废', 'VOID', 6, 1, NULL),
(7176, 'doc_state_type', '已红冲', 'REVERSED', 7, 1, NULL),
(7177, 'transition_type', '正向流转', 'FORWARD', 1, 1, NULL),
(7178, 'transition_type', '反向流转/红冲', 'REVERSE', 2, 1, NULL),
(7179, 'doc_state_status', '生效', 'ACTIVE', 1, 1, NULL),
(7180, 'doc_state_status', '停用', 'DISABLED', 2, 1, NULL);

-- ========== 单据状态机可配置项（6120-6122） ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(6120, 'DOC', 'doc.state.machine.enabled', '单据状态机启用开关', 'true', 0, 1, '统一单据状态机总开关，默认启用'),
(6121, 'DOC', 'doc.state.void.require.approval', '作废是否需要审批', 'false', 1, 1, '待业务方确认作废单是否走审批'),
(6122, 'DOC', 'doc.state.reverse.strategy', '反向控制默认策略', 'STRICT', 1, 1, '待业务方确认反向流转（红冲/冲销）默认策略：STRICT 严格校验/PASS 放行');
