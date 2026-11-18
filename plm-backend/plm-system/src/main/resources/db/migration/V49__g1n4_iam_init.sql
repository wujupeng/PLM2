-- G1-N4 公共平台底座—身份与权限增强（WBS T006 统一身份 / T008 权限审计）初始化：
-- 菜单/按钮权限、角色授权、字典与可配置项。
-- 号段基线（V48 之前已占用的最大值）：sys_permission=3999、sys_role_permission=11892、
-- sys_dictionary=7052、sys_config=6084；本脚本从各自之后继续编号，避免主键冲突。
-- 菜单继续挂在「平台底座」（parent_id=3920）下，与集成平台（sort 1-7）、报表平台（sort 11-15）、文件服务（sort 21-25）并列。

-- ========== 身份与权限菜单（4000-4005，挂在平台底座 3920 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4000, 'platform:iam:mfa', '多因素认证', 'menu', 3920, '/platform/iam/mfa-bindings', 'SafetyCertificateOutlined', 31, 1),
(4001, 'platform:iam:mfaverify', 'MFA 校验日志', 'menu', 3920, '/platform/iam/mfa-verify-logs', 'AuditOutlined', 32, 1),
(4002, 'platform:iam:ssoprovider', '单点登录', 'menu', 3920, '/platform/iam/sso-providers', 'KeyOutlined', 33, 1),
(4003, 'platform:iam:fieldperm', '字段权限', 'menu', 3920, '/platform/iam/field-permissions', 'EyeInvisibleOutlined', 34, 1),
(4004, 'platform:iam:sodrule', '职责分离规则', 'menu', 3920, '/platform/iam/sod-rules', 'SolutionOutlined', 35, 1),
(4005, 'platform:iam:sodviolation', '违规记录', 'menu', 3920, '/platform/iam/sod-violations', 'AlertOutlined', 36, 1);

-- ========== 身份与权限按钮（4010-4021） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4010, 'platform:iam:mfa:list', '查询多因素认证', 'button', 4000, NULL, NULL, 1, 1),
(4011, 'platform:iam:mfa:manage', '维护多因素认证', 'button', 4000, NULL, NULL, 2, 1),
(4012, 'platform:iam:mfaverify:list', '查询 MFA 校验日志', 'button', 4001, NULL, NULL, 1, 1),
(4013, 'platform:iam:mfaverify:manage', '维护 MFA 校验日志', 'button', 4001, NULL, NULL, 2, 1),
(4014, 'platform:iam:ssoprovider:list', '查询单点登录', 'button', 4002, NULL, NULL, 1, 1),
(4015, 'platform:iam:ssoprovider:manage', '维护单点登录', 'button', 4002, NULL, NULL, 2, 1),
(4016, 'platform:iam:fieldperm:list', '查询字段权限', 'button', 4003, NULL, NULL, 1, 1),
(4017, 'platform:iam:fieldperm:manage', '维护字段权限', 'button', 4003, NULL, NULL, 2, 1),
(4018, 'platform:iam:sodrule:list', '查询职责分离规则', 'button', 4004, NULL, NULL, 1, 1),
(4019, 'platform:iam:sodrule:manage', '维护职责分离规则', 'button', 4004, NULL, NULL, 2, 1),
(4020, 'platform:iam:sodviolation:list', '查询违规记录', 'button', 4005, NULL, NULL, 1, 1),
(4021, 'platform:iam:sodviolation:manage', '处理违规记录', 'button', 4005, NULL, NULL, 2, 1);

-- ========== 角色授权 ==========

-- 管理员（2001）：授予身份与权限全部权限
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11900, 2001, 4000), (11901, 2001, 4001), (11902, 2001, 4002), (11903, 2001, 4003), (11904, 2001, 4004),
(11905, 2001, 4005), (11906, 2001, 4010), (11907, 2001, 4011), (11908, 2001, 4012), (11909, 2001, 4013),
(11910, 2001, 4014), (11911, 2001, 4015), (11912, 2001, 4016), (11913, 2001, 4017), (11914, 2001, 4018),
(11915, 2001, 4019), (11916, 2001, 4020), (11917, 2001, 4021);

-- 只读用户（2006）：全部菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11918, 2006, 4000), (11919, 2006, 4001), (11920, 2006, 4002), (11921, 2006, 4003), (11922, 2006, 4004),
(11923, 2006, 4005), (11924, 2006, 4010), (11925, 2006, 4012), (11926, 2006, 4014), (11927, 2006, 4016),
(11928, 2006, 4018), (11929, 2006, 4020);

-- 研发工程师（2002）：多因素认证、单点登录、字段权限只读
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11930, 2002, 4000), (11931, 2002, 4002), (11932, 2002, 4003),
(11933, 2002, 4010), (11934, 2002, 4014), (11935, 2002, 4016);

-- 质量工程师（2003）：职责分离规则与违规记录只读
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11936, 2003, 4004), (11937, 2003, 4005),
(11938, 2003, 4018), (11939, 2003, 4020);

-- 供应链专员（2004）：单点登录只读
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11940, 2004, 4002), (11941, 2004, 4014);

-- 生产现场（2005）：多因素认证只读
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11942, 2005, 4000), (11943, 2005, 4010);

-- ========== 身份与权限字典（7060-7099） ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(7060, 'iam_mfa_type', '动态口令 TOTP', 'TOTP', 1, 1, NULL),
(7061, 'iam_mfa_type', '短信验证码', 'SMS', 2, 1, NULL),
(7062, 'iam_mfa_type', '邮件验证码', 'EMAIL', 3, 1, NULL),
(7063, 'iam_mfa_bind_status', '待绑定', 'PENDING', 1, 1, NULL),
(7064, 'iam_mfa_bind_status', '已绑定', 'BOUND', 2, 1, NULL),
(7065, 'iam_mfa_bind_status', '已解绑', 'UNBOUND', 3, 1, NULL),
(7066, 'iam_mfa_bind_status', '已停用', 'DISABLED', 4, 1, NULL),
(7067, 'iam_mfa_verify_scene', '登录认证', 'LOGIN', 1, 1, NULL),
(7068, 'iam_mfa_verify_scene', '敏感操作', 'SENSITIVE_OP', 2, 1, NULL),
(7069, 'iam_mfa_verify_scene', '解绑认证', 'UNBIND', 3, 1, NULL),
(7070, 'iam_mfa_verify_result', '成功', 'SUCCESS', 1, 1, NULL),
(7071, 'iam_mfa_verify_result', '失败', 'FAIL', 2, 1, NULL),
(7072, 'iam_mfa_verify_result', '已过期', 'EXPIRED', 3, 1, NULL),
(7073, 'iam_sso_protocol', 'SAML 2.0', 'SAML', 1, 1, NULL),
(7074, 'iam_sso_protocol', 'OIDC', 'OIDC', 2, 1, NULL),
(7075, 'iam_sso_protocol', 'CAS', 'CAS', 3, 1, NULL),
(7076, 'iam_sso_status', '草稿', 'DRAFT', 1, 1, NULL),
(7077, 'iam_sso_status', '已启用', 'ACTIVE', 2, 1, NULL),
(7078, 'iam_sso_status', '已停用', 'DISABLED', 3, 1, NULL),
(7079, 'iam_field_access_level', '不可见', 'HIDDEN', 1, 1, NULL),
(7080, 'iam_field_access_level', '脱敏可见', 'MASKED', 2, 1, NULL),
(7081, 'iam_field_access_level', '只读', 'READONLY', 3, 1, NULL),
(7082, 'iam_field_access_level', '可编辑', 'EDITABLE', 4, 1, NULL),
(7083, 'iam_field_perm_status', '生效', 'ACTIVE', 1, 1, NULL),
(7084, 'iam_field_perm_status', '停用', 'DISABLED', 2, 1, NULL),
(7085, 'iam_sod_risk_level', '高风险', 'HIGH', 1, 1, NULL),
(7086, 'iam_sod_risk_level', '中风险', 'MEDIUM', 2, 1, NULL),
(7087, 'iam_sod_risk_level', '低风险', 'LOW', 3, 1, NULL),
(7088, 'iam_sod_rule_status', '生效', 'ACTIVE', 1, 1, NULL),
(7089, 'iam_sod_rule_status', '停用', 'DISABLED', 2, 1, NULL),
(7090, 'iam_sod_handle_status', '待处理', 'OPEN', 1, 1, NULL),
(7091, 'iam_sod_handle_status', '处理中', 'HANDLING', 2, 1, NULL),
(7092, 'iam_sod_handle_status', '已整改', 'RESOLVED', 3, 1, NULL),
(7093, 'iam_sod_handle_status', '已忽略', 'IGNORED', 4, 1, NULL),
(7094, 'iam_biz_module', 'PLM 产品研发', 'PLM', 1, 1, NULL),
(7095, 'iam_biz_module', 'ERP 经营管理', 'ERP', 2, 1, NULL),
(7096, 'iam_biz_module', 'SRM 供应商协同', 'SRM', 3, 1, NULL),
(7097, 'iam_biz_module', 'MES 制造执行', 'MES', 4, 1, NULL),
(7098, 'iam_biz_module', 'WMS 仓储管理', 'WMS', 5, 1, NULL),
(7099, 'iam_biz_module', 'OA 企业协同', 'OA', 6, 1, NULL);

-- ========== 身份与权限可配置项（6090-6094） ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(6090, 'IAM', 'iam.mfa.enabled', '多因素认证总开关', 'true', 0, 1, '关闭后所有用户不启用二次认证，默认开启'),
(6091, 'IAM', 'iam.mfa.required.scenes', '强制二次认证场景', 'SENSITIVE_OP', 1, 1, '待业务方确认强制二次认证的敏感操作清单，逗号分隔'),
(6092, 'IAM', 'iam.mfa.max.fail.count', 'MFA 连续失败上限', '5', 1, 1, '待业务方确认连续失败锁定阈值与锁定时长'),
(6093, 'IAM', 'iam.password.expire.days', '密码有效期（天）', '90', 1, 1, '待业务方按安全合规要求确认，0 表示不过期'),
(6094, 'IAM', 'iam.sod.auto.detect', '职责分离自动检测开关', 'true', 0, 1, '开启后在角色/权限变更时自动检测互斥并生成违规记录');
