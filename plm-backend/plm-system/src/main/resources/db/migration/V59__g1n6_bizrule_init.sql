-- G1-N6 公共平台底座—通用能力（WBS T104 业务规则引擎）初始化：菜单/按钮权限、角色授权、字典与可配置项。
-- 号段基线（V58 之前已占用的最大值）：sys_permission=4104、sys_role_permission=12125、
-- sys_dictionary=7218、sys_config=6133；本脚本从各自之后继续编号，避免主键冲突。
-- 菜单继续挂在「平台底座」（parent_id=3920）下，与前述各节点并列。

-- ========== 业务规则引擎菜单（4110-4112，挂在平台底座 3920 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4110, 'platform:bizrule:rule', '业务规则', 'menu', 3920, '/platform/biz-rule/rules', 'ControlOutlined', 81, 1),
(4111, 'platform:bizrule:param', '规则参数', 'menu', 3920, '/platform/biz-rule/params', 'NumberOutlined', 82, 1),
(4112, 'platform:bizrule:log', '规则执行日志', 'menu', 3920, '/platform/biz-rule/logs', 'ProfileOutlined', 83, 1);

-- ========== 业务规则引擎按钮（4113-4118） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4113, 'platform:bizrule:rule:list', '查询业务规则', 'button', 4110, NULL, NULL, 1, 1),
(4114, 'platform:bizrule:rule:manage', '维护业务规则', 'button', 4110, NULL, NULL, 2, 1),
(4115, 'platform:bizrule:param:list', '查询规则参数', 'button', 4111, NULL, NULL, 1, 1),
(4116, 'platform:bizrule:param:manage', '维护规则参数', 'button', 4111, NULL, NULL, 2, 1),
(4117, 'platform:bizrule:log:list', '查询规则日志', 'button', 4112, NULL, NULL, 1, 1),
(4118, 'platform:bizrule:log:manage', '维护规则日志', 'button', 4112, NULL, NULL, 2, 1);

-- ========== 角色授权 ==========

-- 管理员（2001）：授予业务规则引擎全部权限
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(12126, 2001, 4110), (12127, 2001, 4111), (12128, 2001, 4112),
(12129, 2001, 4113), (12130, 2001, 4114), (12131, 2001, 4115),
(12132, 2001, 4116), (12133, 2001, 4117), (12134, 2001, 4118);

-- 只读用户（2006）：全部菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(12135, 2006, 4110), (12136, 2006, 4111), (12137, 2006, 4112),
(12138, 2006, 4113), (12139, 2006, 4115), (12140, 2006, 4117);

-- 供应链专员（2004）：全部菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(12141, 2004, 4110), (12142, 2004, 4111), (12143, 2004, 4112),
(12144, 2004, 4113), (12145, 2004, 4115), (12146, 2004, 4117);

-- 质量工程师（2003）：全部菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(12147, 2003, 4110), (12148, 2003, 4111), (12149, 2003, 4112),
(12150, 2003, 4113), (12151, 2003, 4115), (12152, 2003, 4117);

-- 研发工程师（2002）：业务规则只读
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(12153, 2002, 4110), (12154, 2002, 4113);

-- 生产现场（2005）：业务规则只读
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(12155, 2005, 4110), (12156, 2005, 4113);

-- ========== 业务规则引擎字典（7219-7242） ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(7219, 'biz_rule_type', '交期规则', 'LEAD_TIME', 1, 1, NULL),
(7220, 'biz_rule_type', '最小起订量', 'MOQ', 2, 1, NULL),
(7221, 'biz_rule_type', '批量规则', 'LOT_SIZE', 3, 1, NULL),
(7222, 'biz_rule_type', '替代料', 'SUBSTITUTE', 4, 1, NULL),
(7223, 'biz_rule_type', '先进先出', 'FIFO', 5, 1, NULL),
(7224, 'biz_rule_type', '质量放行', 'QUALITY_RELEASE', 6, 1, NULL),
(7225, 'biz_rule_type', '信用额度', 'CREDIT_LIMIT', 7, 1, NULL),
(7226, 'rule_status', '生效', 'ACTIVE', 1, 1, NULL),
(7227, 'rule_status', '停用', 'DISABLED', 2, 1, NULL),
(7228, 'biz_rule_module', 'PLM 研发', 'PLM', 1, 1, NULL),
(7229, 'biz_rule_module', 'ERP 经营', 'ERP', 2, 1, NULL),
(7230, 'biz_rule_module', 'SRM 供应商', 'SRM', 3, 1, NULL),
(7231, 'biz_rule_module', 'MES 制造', 'MES', 4, 1, NULL),
(7232, 'biz_rule_module', 'WMS 仓储', 'WMS', 5, 1, NULL),
(7233, 'biz_rule_module', 'OA 办公', 'OA', 6, 1, NULL),
(7234, 'rule_value_type', '字符串', 'STRING', 1, 1, NULL),
(7235, 'rule_value_type', '数值', 'NUMBER', 2, 1, NULL),
(7236, 'rule_value_type', '布尔', 'BOOLEAN', 3, 1, NULL),
(7237, 'rule_value_type', '列表', 'LIST', 4, 1, NULL),
(7238, 'rule_match_result', '命中', 'MATCH', 1, 1, NULL),
(7239, 'rule_match_result', '未命中', 'NOT_MATCH', 2, 1, NULL),
(7240, 'rule_match_result', '异常', 'ERROR', 3, 1, NULL),
(7241, 'rule_param_status', '生效', 'ACTIVE', 1, 1, NULL),
(7242, 'rule_param_status', '停用', 'DISABLED', 2, 1, NULL);

-- ========== 业务规则引擎可配置项（6134-6137） ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(6134, 'RULE', 'rule.engine.enabled', '业务规则引擎启用开关', 'true', 0, 1, '统一业务规则引擎总开关，默认启用'),
(6135, 'RULE', 'rule.default.priority', '默认规则优先级', '100', 1, 1, '待业务方确认规则默认优先级（数值越小优先级越高）'),
(6136, 'RULE', 'rule.fifo.enabled', 'FIFO 规则启用', 'true', 0, 1, '先进先出规则默认启用'),
(6137, 'RULE', 'rule.credit.limit.enabled', '信用额度规则启用', 'true', 1, 1, '待业务方确认信用额度校验范围与阈值来源');
