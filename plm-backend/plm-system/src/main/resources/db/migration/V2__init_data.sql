-- N1 初始化数据：组织、角色、权限、管理员账号、字典与可配置项
-- 注意：管理员初始密码为 admin123，首次登录后必须修改。

INSERT INTO sys_organization (id, org_code, org_name, parent_id, org_type, sort_no, status, remark) VALUES
(1000, 'PLM-ROOT', 'PLM 制造有限公司', 0, 'company', 1, 1, '示例顶层组织，实施时按实际公司结构调整'),
(1101, 'PLM-RD', '研发中心', 1000, 'department', 1, 1, NULL),
(1102, 'PLM-SCM', '供应链中心', 1000, 'department', 2, 1, NULL),
(1103, 'PLM-MFG', '制造中心', 1000, 'department', 3, 1, NULL),
(1104, 'PLM-QA', '质量管理部', 1000, 'department', 4, 1, NULL);

INSERT INTO sys_role (id, role_code, role_name, data_scope, status, remark) VALUES
(2001, 'ADMIN', '系统管理员', 'all', 1, '拥有全部权限'),
(2002, 'ENGINEER', '研发工程师', 'org', 1, '产品、物料、BOM、图文档与工程变更'),
(2003, 'QUALITY', '质量工程师', 'org', 1, '检验规范与质量问题闭环'),
(2004, 'SUPPLY', '供应链专员', 'org', 1, 'EDI 客户需求与供应商协同'),
(2005, 'PRODUCTION', '生产现场', 'self', 1, '标签扫描、Kanban、FIFO 领料与发货复核'),
(2006, 'VIEWER', '只读用户', 'self', 1, '仅查询权限');

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(3001, 'dashboard', '工作台', 'menu', 0, '/dashboard', 'SmileOutlined', 1, 1),
(3010, 'product', '产品与物料', 'menu', 0, NULL, 'DatabaseOutlined', 10, 1),
(3011, 'material', '物料管理', 'menu', 3010, '/material', 'DatabaseOutlined', 1, 1),
(3012, 'bom', 'BOM 管理', 'menu', 3010, '/bom', 'ApartmentOutlined', 2, 1),
(3020, 'engineering', '工程与文档', 'menu', 0, NULL, 'FileTextOutlined', 20, 1),
(3021, 'document', '文档图纸', 'menu', 3020, '/document', 'FileTextOutlined', 1, 1),
(3022, 'eco', '工程变更', 'menu', 3020, '/eco', 'SwapOutlined', 2, 1),
(3023, 'cad', 'CAD 集成', 'menu', 3020, '/cad', 'BlockOutlined', 3, 1),
(3030, 'manufacturing-domain', '制造协同', 'menu', 0, NULL, 'ToolOutlined', 30, 1),
(3031, 'manufacturing', '制造协同', 'menu', 3030, '/manufacturing', 'ToolOutlined', 1, 1),
(3040, 'system', '系统管理', 'menu', 0, '/system', 'SettingOutlined', 90, 1),
(3041, 'system:user', '用户管理', 'menu', 3040, '/system/users', 'UserOutlined', 1, 1),
(3042, 'system:org', '组织管理', 'menu', 3040, '/system/organizations', 'ApartmentOutlined', 2, 1),
(3043, 'system:role', '角色权限', 'menu', 3040, '/system/roles', 'SafetyOutlined', 3, 1),
(3044, 'system:dict', '数据字典', 'menu', 3040, '/system/dictionaries', 'BookOutlined', 4, 1),
(3045, 'system:config', '配置项', 'menu', 3040, '/system/configs', 'ControlOutlined', 5, 1),
(3046, 'system:audit', '审计日志', 'menu', 3040, '/system/audit-logs', 'AuditOutlined', 6, 1),
(3101, 'system:user:list', '查询用户', 'button', 3041, NULL, NULL, 1, 1),
(3102, 'system:user:create', '新增用户', 'button', 3041, NULL, NULL, 2, 1),
(3103, 'system:user:update', '修改用户', 'button', 3041, NULL, NULL, 3, 1),
(3104, 'system:user:delete', '删除用户', 'button', 3041, NULL, NULL, 4, 1),
(3105, 'system:user:reset-password', '重置密码', 'button', 3041, NULL, NULL, 5, 1),
(3111, 'system:org:list', '查询组织', 'button', 3042, NULL, NULL, 1, 1),
(3112, 'system:org:create', '新增组织', 'button', 3042, NULL, NULL, 2, 1),
(3113, 'system:org:update', '修改组织', 'button', 3042, NULL, NULL, 3, 1),
(3114, 'system:org:delete', '删除组织', 'button', 3042, NULL, NULL, 4, 1),
(3121, 'system:role:list', '查询角色', 'button', 3043, NULL, NULL, 1, 1),
(3122, 'system:role:create', '新增角色', 'button', 3043, NULL, NULL, 2, 1),
(3123, 'system:role:update', '修改角色', 'button', 3043, NULL, NULL, 3, 1),
(3124, 'system:role:delete', '删除角色', 'button', 3043, NULL, NULL, 4, 1),
(3125, 'system:role:assign', '分配权限', 'button', 3043, NULL, NULL, 5, 1),
(3131, 'system:dict:list', '查询字典', 'button', 3044, NULL, NULL, 1, 1),
(3132, 'system:dict:create', '新增字典', 'button', 3044, NULL, NULL, 2, 1),
(3133, 'system:dict:update', '修改字典', 'button', 3044, NULL, NULL, 3, 1),
(3134, 'system:dict:delete', '删除字典', 'button', 3044, NULL, NULL, 4, 1),
(3141, 'system:config:list', '查询配置项', 'button', 3045, NULL, NULL, 1, 1),
(3142, 'system:config:create', '新增配置项', 'button', 3045, NULL, NULL, 2, 1),
(3143, 'system:config:update', '修改配置项', 'button', 3045, NULL, NULL, 3, 1),
(3144, 'system:config:delete', '删除配置项', 'button', 3045, NULL, NULL, 4, 1),
(3151, 'system:audit:list', '查询审计日志', 'button', 3046, NULL, NULL, 1, 1);

INSERT INTO sys_user (id, username, password, display_name, email, org_id, status, remark) VALUES
(9001, 'admin', '$2a$10$HkUOgoEDxwDBjE1zI6hM/.JNSH6AlgNPuizMYqFxP5oAWrq8c8fD2', '系统管理员', NULL, 1101, 1, '初始管理员，首次登录后请修改密码');

INSERT INTO sys_user_role (id, user_id, role_id) VALUES (9101, 9001, 2001);

INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(9201, 2001, 3001), (9202, 2001, 3010), (9203, 2001, 3011), (9204, 2001, 3012),
(9205, 2001, 3020), (9206, 2001, 3021), (9207, 2001, 3022), (9208, 2001, 3023),
(9209, 2001, 3030), (9210, 2001, 3031), (9211, 2001, 3040), (9212, 2001, 3041),
(9213, 2001, 3042), (9214, 2001, 3043), (9215, 2001, 3044), (9216, 2001, 3045),
(9217, 2001, 3046),
(9221, 2001, 3101), (9222, 2001, 3102), (9223, 2001, 3103), (9224, 2001, 3104), (9225, 2001, 3105),
(9226, 2001, 3111), (9227, 2001, 3112), (9228, 2001, 3113), (9229, 2001, 3114),
(9230, 2001, 3121), (9231, 2001, 3122), (9232, 2001, 3123), (9233, 2001, 3124), (9234, 2001, 3125),
(9235, 2001, 3131), (9236, 2001, 3132), (9237, 2001, 3133), (9238, 2001, 3134),
(9239, 2001, 3141), (9240, 2001, 3142), (9241, 2001, 3143), (9242, 2001, 3144),
(9243, 2001, 3151),
-- 研发工程师
(9251, 2002, 3001), (9252, 2002, 3010), (9253, 2002, 3011), (9254, 2002, 3012),
(9255, 2002, 3020), (9256, 2002, 3021), (9257, 2002, 3022), (9258, 2002, 3023),
-- 质量工程师
(9261, 2003, 3001), (9262, 2003, 3010), (9263, 2003, 3020), (9264, 2003, 3021),
-- 供应链专员
(9271, 2004, 3001), (9272, 2004, 3010), (9273, 2004, 3030), (9274, 2004, 3031),
-- 生产现场
(9281, 2005, 3001), (9282, 2005, 3030), (9283, 2005, 3031),
-- 只读用户
(9291, 2006, 3001);

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(4001, 'org_type', '公司', 'company', 1, 1, NULL),
(4002, 'org_type', '部门', 'department', 2, 1, NULL),
(4003, 'org_type', '班组', 'team', 3, 1, NULL),
(4011, 'enable_status', '启用', '1', 1, 1, NULL),
(4012, 'enable_status', '停用', '0', 2, 1, NULL),
(4021, 'data_scope', '全部数据', 'all', 1, 1, NULL),
(4022, 'data_scope', '本组织', 'org', 2, 1, NULL),
(4023, 'data_scope', '本组织及下级', 'orgAndChild', 3, 1, NULL),
(4024, 'data_scope', '仅本人', 'self', 4, 1, NULL),
(4031, 'plant_code', '示例制造地 A', 'XA', 1, 1, '待业务方集中确认完整制造地代码清单'),
(4041, 'reprint_reason', '标签破损', 'damaged', 1, 1, NULL),
(4042, 'reprint_reason', '打印不良', 'print_defect', 2, 1, NULL);

-- 可配置项：任务书中尚未明确的编码、标签、EDI、物料规则，先以默认规则落库，业务方集中确认后修改。
INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(5001, 'CODE', 'code.14.template', '14 位原客户零件号规则', '客户零件号 11 位 + 版本号 3 位', 0, 1, '固定长度校验，原码保留不做改写'),
(5002, 'CODE', 'code.14.pad_char', '客户零件号不足 11 位时的补位字符', '0', 1, 1, '待业务方确认补位字符与字符集'),
(5003, 'CODE', 'code.24.template', '24 位新追溯码规则', '备用位2位 + 制造地2位 + 年份1位 + 自然日3位 + 每日序列4位 + 固定0000 + 零件号8位', 0, 1, '自然日按公历天数计算，含闰年处理'),
(5004, 'CODE', 'code.24.reserved', '24 位追溯码备用位默认值', '00', 1, 1, '待确认是否允许其他取值'),
(5005, 'CODE', 'code.24.year_code_rule', '年份代码规则', '取公历年份末位', 1, 1, '待业务方确认年份代码表'),
(5006, 'CODE', 'code.24.plant_dict', '制造地代码清单', '', 1, 1, '待业务方提供全部工厂/制造地代码'),
(5007, 'CODE', 'code.28.enabled', '保留 28 位追溯码规则模板', 'true', 0, 1, '独立规则模板，不得与 24 位混用'),
(5008, 'CODE', 'code.28.template', '28 位追溯码规则', '按此前图示的 28 位字段分段', 1, 1, '待业务方提供年月代码表与类别/厂商/线别字典'),
(5011, 'LABEL', 'label.datamatrix.enabled', '启用 Data Matrix 二维码', 'true', 0, 1, NULL),
(5012, 'LABEL', 'label.reprint.require_authorization', '补打标签需授权', 'true', 0, 1, '补打必须记录操作人与授权凭据'),
(5013, 'LABEL', 'label.duplicate_scan.policy', '重复扫描处理策略', 'reject', 0, 1, '取值 reject=拒绝 / warn=告警放行'),
(5021, 'EDI', 'edi.partner.list', 'EDI 客户与供应商清单', '', 1, 1, '待业务方提供客户规范与二级供应商清单'),
(5022, 'EDI', 'edi.retry.max_times', '报文失败重试次数', '5', 0, 1, NULL),
(5023, 'EDI', 'edi.dedup.window_minutes', '报文防重时间窗（分钟）', '1440', 0, 1, NULL),
(5031, 'MATERIAL', 'material.fifo.enabled', '启用 FIFO 先进先出', 'true', 0, 1, NULL),
(5032, 'MATERIAL', 'material.kanban.shortage_rule', 'Kanban 缺料预警规则', '', 1, 1, '待业务方确认安全库存与预警阈值'),
(5033, 'MATERIAL', 'material.trace.batch_prefix', '生产批次号前缀规则', '', 1, 1, '待业务方确认批次号编码规则');
