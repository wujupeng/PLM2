-- OA-N2 初始化数据：统一门户与身份组织权限的菜单、按钮权限、角色授权、字典、可配置项与样例数据
-- 说明：组织、用户、角色、权限、字典、配置、审计等基础能力复用 N1 既有表，不重复建设。
-- 未明确的身份源、密码策略、会话时长等统一落为配置项并标记 pending_confirm=1，待业务方集中确认。

-- ========== OA-N2 权限（菜单 3600-3606，按钮 3607-3623） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(3600, 'oa', 'OA 办公门户', 'menu', 0, NULL, 'HomeOutlined', 5, 1),
(3601, 'oa-portal', 'OA 门户首页', 'menu', 3600, '/oa/portal', 'AppstoreOutlined', 1, 1),
(3602, 'oa-position', '岗位管理', 'menu', 3600, '/oa/positions', 'IdcardOutlined', 2, 1),
(3603, 'oa-employment', '员工档案', 'menu', 3600, '/oa/employments', 'TeamOutlined', 3, 1),
(3604, 'oa-delegation', '流程代理授权', 'menu', 3600, '/oa/delegations', 'SwapOutlined', 4, 1),
(3605, 'oa-application', '应用中心', 'menu', 3600, '/oa/applications', 'AppstoreAddOutlined', 5, 1),
(3606, 'oa-sso-client', 'SSO 客户端', 'menu', 3600, '/oa/sso-clients', 'KeyOutlined', 6, 1),
(3607, 'oa:portal:view', '查看门户', 'button', 3601, NULL, NULL, 1, 1),
(3608, 'oa:position:list', '查询岗位', 'button', 3602, NULL, NULL, 1, 1),
(3609, 'oa:position:save', '维护岗位', 'button', 3602, NULL, NULL, 2, 1),
(3610, 'oa:position:delete', '删除岗位', 'button', 3602, NULL, NULL, 3, 1),
(3611, 'oa:employment:list', '查询员工档案', 'button', 3603, NULL, NULL, 1, 1),
(3612, 'oa:employment:save', '维护员工档案', 'button', 3603, NULL, NULL, 2, 1),
(3613, 'oa:employment:delete', '删除员工档案', 'button', 3603, NULL, NULL, 3, 1),
(3614, 'oa:delegation:list', '查询代理授权', 'button', 3604, NULL, NULL, 1, 1),
(3615, 'oa:delegation:save', '维护代理授权', 'button', 3604, NULL, NULL, 2, 1),
(3616, 'oa:delegation:delete', '删除代理授权', 'button', 3604, NULL, NULL, 3, 1),
(3617, 'oa:application:list', '查询应用', 'button', 3605, NULL, NULL, 1, 1),
(3618, 'oa:application:save', '维护应用', 'button', 3605, NULL, NULL, 2, 1),
(3619, 'oa:application:delete', '删除应用', 'button', 3605, NULL, NULL, 3, 1),
(3620, 'oa:application:grant', '应用授权', 'button', 3605, NULL, NULL, 4, 1),
(3621, 'oa:sso:list', '查询 SSO 客户端', 'button', 3606, NULL, NULL, 1, 1),
(3622, 'oa:sso:save', '维护 SSO 客户端', 'button', 3606, NULL, NULL, 2, 1),
(3623, 'oa:sso:delete', '删除 SSO 客户端', 'button', 3606, NULL, NULL, 3, 1);

-- 管理员（2001）：授予 OA-N2 全部权限
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11000, 2001, 3600), (11001, 2001, 3601), (11002, 2001, 3602), (11003, 2001, 3603),
(11004, 2001, 3604), (11005, 2001, 3605), (11006, 2001, 3606), (11007, 2001, 3607),
(11008, 2001, 3608), (11009, 2001, 3609), (11010, 2001, 3610), (11011, 2001, 3611),
(11012, 2001, 3612), (11013, 2001, 3613), (11014, 2001, 3614), (11015, 2001, 3615),
(11016, 2001, 3616), (11017, 2001, 3617), (11018, 2001, 3618), (11019, 2001, 3619),
(11020, 2001, 3620), (11021, 2001, 3621), (11022, 2001, 3622), (11023, 2001, 3623);

-- 只读用户（2006）：全菜单 + 仅查看按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11024, 2006, 3600), (11025, 2006, 3601), (11026, 2006, 3602), (11027, 2006, 3603),
(11028, 2006, 3604), (11029, 2006, 3605), (11030, 2006, 3606), (11031, 2006, 3607),
(11032, 2006, 3608), (11033, 2006, 3611), (11034, 2006, 3614), (11035, 2006, 3617),
(11036, 2006, 3621);

-- 研发工程师（2002）：门户、岗位只读、流程代理授权
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11037, 2002, 3600), (11038, 2002, 3601), (11039, 2002, 3604), (11040, 2002, 3614),
(11041, 2002, 3615);

-- 质量工程师（2003）：门户、岗位只读、流程代理授权
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11042, 2003, 3600), (11043, 2003, 3601), (11044, 2003, 3604), (11045, 2003, 3614),
(11046, 2003, 3615);

-- 供应链专员（2004）：门户、岗位只读、流程代理授权
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11047, 2004, 3600), (11048, 2004, 3601), (11049, 2004, 3604), (11050, 2004, 3614),
(11051, 2004, 3615);

-- 生产现场（2005）：门户、岗位只读、代理授权只读
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11052, 2005, 3600), (11053, 2005, 3601), (11054, 2005, 3604), (11055, 2005, 3614);

-- 门户首页面向全员开放：为各业务角色补充门户查看权限
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11056, 2002, 3607), (11057, 2003, 3607), (11058, 2004, 3607), (11059, 2005, 3607);

-- ========== OA-N2 字典 ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(6001, 'oa_position_level', '员工', 'STAFF', 1, 1, NULL),
(6002, 'oa_position_level', '主管', 'SUPERVISOR', 2, 1, NULL),
(6003, 'oa_position_level', '经理', 'MANAGER', 3, 1, NULL),
(6004, 'oa_position_level', '总监', 'DIRECTOR', 4, 1, NULL),
(6005, 'oa_position_level', '高管', 'EXECUTIVE', 5, 1, NULL),
(6011, 'oa_employment_type', '全职', 'FULL_TIME', 1, 1, NULL),
(6012, 'oa_employment_type', '兼职', 'PART_TIME', 2, 1, NULL),
(6013, 'oa_employment_type', '实习', 'INTERN', 3, 1, NULL),
(6014, 'oa_employment_type', '外包', 'OUTSOURCE', 4, 1, NULL),
(6015, 'oa_employment_type', '劳务派遣', 'DISPATCH', 5, 1, NULL),
(6021, 'oa_employment_status', '在职', 'ACTIVE', 1, 1, NULL),
(6022, 'oa_employment_status', '试用', 'PROBATION', 2, 1, NULL),
(6023, 'oa_employment_status', '停薪留职', 'SUSPENDED', 3, 1, NULL),
(6024, 'oa_employment_status', '离职', 'RESIGNED', 4, 1, NULL),
(6025, 'oa_employment_status', '退休', 'RETIRED', 5, 1, NULL),
(6031, 'oa_delegation_scope', '全部流程', 'ALL', 1, 1, NULL),
(6032, 'oa_delegation_scope', '指定流程', 'PROCESS', 2, 1, NULL),
(6041, 'oa_delegation_status', '生效', 'ACTIVE', 1, 1, NULL),
(6042, 'oa_delegation_status', '已撤回', 'REVOKED', 2, 1, NULL),
(6043, 'oa_delegation_status', '已过期', 'EXPIRED', 3, 1, NULL),
(6051, 'oa_application_type', '内部系统', 'INTERNAL', 1, 1, NULL),
(6052, 'oa_application_type', '外部系统', 'EXTERNAL', 2, 1, NULL),
(6053, 'oa_application_type', 'SaaS 服务', 'SAAS', 3, 1, NULL),
(6054, 'oa_application_type', '工具类', 'TOOL', 4, 1, NULL),
(6061, 'oa_visible_scope', '全员可见', 'ALL', 1, 1, NULL),
(6062, 'oa_visible_scope', '指定部门', 'ORG', 2, 1, NULL),
(6063, 'oa_visible_scope', '指定角色', 'ROLE', 3, 1, NULL),
(6071, 'oa_enabled_status', '启用', 'enabled', 1, 1, NULL),
(6072, 'oa_enabled_status', '停用', 'disabled', 2, 1, NULL),
(6081, 'oa_identity_source', '本地账号', 'LOCAL', 1, 1, '待业务方确认是否接入 AD/LDAP'),
(6082, 'oa_identity_source', 'AD 域', 'AD', 2, 1, '待业务方提供域控地址与同步策略'),
(6083, 'oa_identity_source', 'LDAP 目录', 'LDAP', 3, 1, '待业务方提供目录服务地址与同步策略');

-- ========== OA-N2 可配置项：未明确的身份源、密码策略、会话与审计规则先落默认值，待业务方集中确认 ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(5901, 'OA', 'oa.identity.source.type', '统一身份源类型', 'LOCAL', 1, 1, 'LOCAL=本地账号 / AD=域控 / LDAP=目录；待业务方确认（IF-OA-01）'),
(5902, 'OA', 'oa.sso.token.ttl.seconds', 'SSO 令牌有效期（秒）', '3600', 1, 1, '待业务方确认单点登录令牌有效期'),
(5903, 'OA', 'oa.sso.default.scopes', 'SSO 客户端默认授权范围', 'openid,profile', 1, 1, '待业务方确认各接入系统的授权范围'),
(5904, 'OA', 'oa.password.min.length', '密码最小长度', '8', 1, 1, '待业务方确认密码复杂度策略'),
(5905, 'OA', 'oa.password.complexity.required', '密码复杂度校验（大小写/数字/符号）', 'true', 1, 1, '待业务方确认密码复杂度要求'),
(5906, 'OA', 'oa.password.expire.days', '密码有效期（天，0=不过期）', '0', 1, 1, '待业务方确认密码更换周期'),
(5907, 'OA', 'oa.login.fail.lock.threshold', '登录失败锁定阈值（次）', '5', 1, 1, '待业务方确认锁定策略与解锁方式'),
(5908, 'OA', 'oa.session.idle.timeout.minutes', '会话空闲超时（分钟）', '30', 1, 1, '待业务方确认会话超时时长'),
(5909, 'OA', 'oa.delegation.max.days', '流程代理授权最长天数', '30', 1, 1, '待业务方确认代理授权时长上限'),
(5910, 'OA', 'oa.delegation.auto.expire', '代理授权到期自动失效', 'true', 0, 1, NULL),
(5911, 'OA', 'oa.offboard.disable.user', '离职后自动禁用账号', 'true', 1, 1, '待业务方确认离职停用账号的触发时机'),
(5912, 'OA', 'oa.multi.org.enabled', '启用多组织', 'true', 0, 1, '多组织、多工厂统一身份与数据隔离'),
(5913, 'OA', 'oa.audit.retain.years', '审计日志保留年限', '3', 1, 1, '待业务方确认审计日志合规保留期限'),
(5914, 'OA', 'oa.portal.default.entry', '门户默认入口路径', '/oa/portal', 0, 1, NULL);

-- ========== OA-N2 样例数据：仅用于联调与验收演示，实施时由业务方通过界面或导入替换 ==========

-- 岗位
INSERT INTO sys_position (id, position_code, position_name, org_id, position_level, sort_no, status, remark, created_by, created_at) VALUES
(7001, 'POS-ADMIN', '系统管理员', 1101, 'STAFF', 1, 1, '示例岗位，实施时按实际岗位体系调整', 9001, CURRENT_TIMESTAMP),
(7002, 'POS-DEV', '研发工程师', 1101, 'STAFF', 2, 1, NULL, 9001, CURRENT_TIMESTAMP),
(7003, 'POS-QE', '质量工程师', 1104, 'STAFF', 3, 1, NULL, 9001, CURRENT_TIMESTAMP),
(7004, 'POS-SCM', '供应链专员', 1102, 'STAFF', 4, 1, NULL, 9001, CURRENT_TIMESTAMP),
(7005, 'POS-MFG', '生产现场操作员', 1103, 'STAFF', 5, 1, NULL, 9001, CURRENT_TIMESTAMP),
(7006, 'POS-HR', '人事行政专员', 1000, 'STAFF', 6, 1, NULL, 9001, CURRENT_TIMESTAMP);

-- 员工任职档案（与 admin 账号关联）
INSERT INTO sys_employment (id, employee_no, user_id, employee_name, org_id, position_id, position_name, employment_type, employment_status, hire_date, leave_date, manager_user_id, work_location, remark, created_by, created_at) VALUES
(7101, 'EMP9001', 9001, '系统管理员', 1101, 7001, '系统管理员', 'FULL_TIME', 'ACTIVE', DATE '2024-01-01', NULL, NULL, '总部', '示例任职记录，实施时由人事系统或导入替换', 9001, CURRENT_TIMESTAMP);

-- 应用注册中心
INSERT INTO sys_application (id, app_code, app_name, app_type, entry_url, icon, app_category, visible_scope, sso_enabled, sort_no, status, owner, description, remark, created_by, created_at) VALUES
(7201, 'OA_PORTAL', '自有 OA 门户', 'INTERNAL', '/oa/portal', 'HomeOutlined', '办公', 'ALL', 1, 1, 'enabled', '信息中心', '统一门户首页、待办与应用入口', NULL, 9001, CURRENT_TIMESTAMP),
(7202, 'PLM', '制造业 PLM 平台', 'INTERNAL', '/dashboard', 'AppstoreOutlined', '研发', 'ALL', 1, 2, 'enabled', '研发中心', '产品、物料、BOM、图纸、工程变更、工艺与质量', NULL, 9001, CURRENT_TIMESTAMP),
(7203, 'ERP', 'ERP 系统', 'EXTERNAL', '', 'DatabaseOutlined', '供应链', 'ALL', 0, 3, 'enabled', '信息中心', '客户、供应商、物料、订单与采购价格', '待业务方提供访问地址与 SSO 协议', 9001, CURRENT_TIMESTAMP),
(7204, 'MES', 'MES 制造执行', 'EXTERNAL', '', 'ToolOutlined', '生产', 'ALL', 0, 4, 'enabled', '制造中心', '生产日报、生产顺序与工单状态', '待业务方提供访问地址与 SSO 协议', 9001, CURRENT_TIMESTAMP),
(7205, 'QMS', 'QMS 质量管理系统', 'EXTERNAL', '', 'SafetyCertificateOutlined', '质量', 'ALL', 0, 5, 'enabled', '质量管理部', '检测委托、质量月报与供应商质量', '待业务方提供访问地址与 SSO 协议', 9001, CURRENT_TIMESTAMP),
(7206, 'EDI', 'EDI 协同平台', 'INTERNAL', '/edi/partner', 'ApiOutlined', '供应链', 'ALL', 1, 6, 'enabled', '供应链中心', '客户需求、报文分发与供应商协同', NULL, 9001, CURRENT_TIMESTAMP);

-- 应用授权（管理员授权全部；研发/质量/供应链/生产/只读按需授权）
INSERT INTO sys_application_role (id, application_id, role_id, created_by, created_at) VALUES
(7301, 7201, 2001, 9001, CURRENT_TIMESTAMP), (7302, 7202, 2001, 9001, CURRENT_TIMESTAMP),
(7303, 7203, 2001, 9001, CURRENT_TIMESTAMP), (7304, 7204, 2001, 9001, CURRENT_TIMESTAMP),
(7305, 7205, 2001, 9001, CURRENT_TIMESTAMP), (7306, 7206, 2001, 9001, CURRENT_TIMESTAMP),
(7307, 7201, 2006, 9001, CURRENT_TIMESTAMP), (7308, 7202, 2006, 9001, CURRENT_TIMESTAMP),
(7309, 7202, 2002, 9001, CURRENT_TIMESTAMP), (7310, 7202, 2003, 9001, CURRENT_TIMESTAMP),
(7311, 7202, 2004, 9001, CURRENT_TIMESTAMP), (7312, 7202, 2005, 9001, CURRENT_TIMESTAMP),
(7313, 7206, 2004, 9001, CURRENT_TIMESTAMP), (7314, 7205, 2003, 9001, CURRENT_TIMESTAMP),
(7315, 7204, 2005, 9001, CURRENT_TIMESTAMP);

-- SSO 客户端（口令为样例占位，实施时必须由业务方替换并密文存储）
INSERT INTO sys_sso_client (id, client_id, client_secret, client_name, redirect_uri, grant_types, scopes, token_ttl_seconds, status, remark, created_by, created_at) VALUES
(7401, 'PLM_OA_PORTAL', 'sample-secret-change-me', '自有 OA 门户', '', 'password,refresh_token', 'openid,profile', 3600, 'enabled', '样例客户端，实施时替换密钥并密文存储', 9001, CURRENT_TIMESTAMP),
(7402, 'PLM_INTEGRATION', 'sample-secret-change-me', 'PLM 集成客户端', '', 'client_credentials', 'plm.read', 3600, 'enabled', '样例客户端，实施时替换密钥并密文存储', 9001, CURRENT_TIMESTAMP);
