-- G1-N6 公共平台底座—通用能力（WBS T105 数据质量控制）初始化：菜单/按钮权限、角色授权、字典与可配置项。
-- 号段基线（V60 之前已占用的最大值）：sys_permission=4118、sys_role_permission=12156、
-- sys_dictionary=7242、sys_config=6137；本脚本从各自之后继续编号，避免主键冲突。
-- 菜单继续挂在「平台底座」（parent_id=3920）下，与前述各节点并列。

-- ========== 数据质量控制菜单（4120-4122，挂在平台底座 3920 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4120, 'platform:dq:rule', '数据质量规则', 'menu', 3920, '/platform/data-quality/rules', 'SafetyCertificateOutlined', 91, 1),
(4121, 'platform:dq:exception', '数据异常队列', 'menu', 3920, '/platform/data-quality/exceptions', 'ExceptionOutlined', 92, 1),
(4122, 'platform:dq:coderule', '编码规则', 'menu', 3920, '/platform/data-quality/code-rules', 'BarcodeOutlined', 93, 1);

-- ========== 数据质量控制按钮（4123-4128） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4123, 'platform:dq:rule:list', '查询数据质量规则', 'button', 4120, NULL, NULL, 1, 1),
(4124, 'platform:dq:rule:manage', '维护数据质量规则', 'button', 4120, NULL, NULL, 2, 1),
(4125, 'platform:dq:exception:list', '查询异常队列', 'button', 4121, NULL, NULL, 1, 1),
(4126, 'platform:dq:exception:manage', '处理异常', 'button', 4121, NULL, NULL, 2, 1),
(4127, 'platform:dq:coderule:list', '查询编码规则', 'button', 4122, NULL, NULL, 1, 1),
(4128, 'platform:dq:coderule:manage', '维护编码规则', 'button', 4122, NULL, NULL, 2, 1);

-- ========== 角色授权 ==========

-- 管理员（2001）：授予数据质量控制全部权限
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(12157, 2001, 4120), (12158, 2001, 4121), (12159, 2001, 4122),
(12160, 2001, 4123), (12161, 2001, 4124), (12162, 2001, 4125),
(12163, 2001, 4126), (12164, 2001, 4127), (12165, 2001, 4128);

-- 只读用户（2006）：全部菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(12166, 2006, 4120), (12167, 2006, 4121), (12168, 2006, 4122),
(12169, 2006, 4123), (12170, 2006, 4125), (12171, 2006, 4127);

-- 供应链专员（2004）：全部菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(12172, 2004, 4120), (12173, 2004, 4121), (12174, 2004, 4122),
(12175, 2004, 4123), (12176, 2004, 4125), (12177, 2004, 4127);

-- 质量工程师（2003）：全部菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(12178, 2003, 4120), (12179, 2003, 4121), (12180, 2003, 4122),
(12181, 2003, 4123), (12182, 2003, 4125), (12183, 2003, 4127);

-- 研发工程师（2002）：全部菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(12184, 2002, 4120), (12185, 2002, 4121), (12186, 2002, 4122),
(12187, 2002, 4123), (12188, 2002, 4125), (12189, 2002, 4127);

-- 生产现场（2005）：全部菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(12190, 2005, 4120), (12191, 2005, 4121), (12192, 2005, 4122),
(12193, 2005, 4123), (12194, 2005, 4125), (12195, 2005, 4127);

-- ========== 数据质量控制字典（7243-7262） ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(7243, 'dq_rule_type', '必填', 'REQUIRED', 1, 1, NULL),
(7244, 'dq_rule_type', '唯一性', 'UNIQUE', 2, 1, NULL),
(7245, 'dq_rule_type', '编码规则', 'CODE_PATTERN', 3, 1, NULL),
(7246, 'dq_rule_type', '有效期', 'VALIDITY', 4, 1, NULL),
(7247, 'dq_rule_type', '版本一致性', 'VERSION_CONSISTENCY', 5, 1, NULL),
(7248, 'dq_rule_type', '引用完整性', 'REFERENCE', 6, 1, NULL),
(7249, 'dq_error_level', '错误', 'ERROR', 1, 1, NULL),
(7250, 'dq_error_level', '警告', 'WARN', 2, 1, NULL),
(7251, 'dq_rule_status', '生效', 'ACTIVE', 1, 1, NULL),
(7252, 'dq_rule_status', '停用', 'DISABLED', 2, 1, NULL),
(7253, 'dq_exception_status', '待处理', 'OPEN', 1, 1, NULL),
(7254, 'dq_exception_status', '处理中', 'HANDLING', 2, 1, NULL),
(7255, 'dq_exception_status', '已解决', 'RESOLVED', 3, 1, NULL),
(7256, 'dq_exception_status', '已忽略', 'IGNORED', 4, 1, NULL),
(7257, 'code_reset_cycle', '不重置', 'NONE', 1, 1, NULL),
(7258, 'code_reset_cycle', '按日重置', 'DAILY', 2, 1, NULL),
(7259, 'code_reset_cycle', '按月重置', 'MONTHLY', 3, 1, NULL),
(7260, 'code_reset_cycle', '按年重置', 'YEARLY', 4, 1, NULL),
(7261, 'code_rule_status', '生效', 'ACTIVE', 1, 1, NULL),
(7262, 'code_rule_status', '停用', 'DISABLED', 2, 1, NULL);

-- ========== 数据质量控制可配置项（6138-6142） ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(6138, 'DQ', 'dq.enabled', '数据质量控制启用开关', 'true', 0, 1, '统一数据质量控制总开关，默认启用'),
(6139, 'DQ', 'dq.exception.auto.queue', '异常自动入队', 'true', 0, 1, '校验不通过时是否自动写入异常队列'),
(6140, 'DQ', 'dq.default.error.level', '默认异常级别', 'ERROR', 1, 1, '待业务方确认默认异常级别：ERROR 阻断/WARN 提示'),
(6141, 'DQ', 'dq.code.default.seq.length', '默认编码流水号长度', '4', 1, 1, '待业务方确认各实体编码流水号长度'),
(6142, 'DQ', 'dq.check.on.save', '保存时校验开关', 'true', 0, 1, '各业务保存时是否触发统一数据质量校验');
