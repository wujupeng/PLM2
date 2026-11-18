-- G1-N5 公共平台底座—多组织多工厂（WBS T100）初始化：菜单/按钮权限、角色授权、字典与可配置项。
-- 号段基线（V50 之前已占用的最大值）：sys_permission=4021、sys_role_permission=11943、
-- sys_dictionary=7099、sys_config=6094；本脚本从各自之后继续编号，避免主键冲突。
-- 菜单继续挂在「平台底座」（parent_id=3920）下，与集成/报表/文件/身份权限并列。

-- ========== 多组织多工厂菜单（4030-4034，挂在平台底座 3920 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4030, 'platform:org:legalentity', '法人主体', 'menu', 3920, '/platform/org/legal-entities', 'BankOutlined', 41, 1),
(4031, 'platform:org:factory', '工厂管理', 'menu', 3920, '/platform/org/factories', 'ShopOutlined', 42, 1),
(4032, 'platform:org:warehouse', '仓库管理', 'menu', 3920, '/platform/org/warehouses', 'HomeOutlined', 43, 1),
(4033, 'platform:org:productionline', '产线管理', 'menu', 3920, '/platform/org/production-lines', 'ClusterOutlined', 44, 1),
(4034, 'platform:org:orggrant', '跨组织授权', 'menu', 3920, '/platform/org/org-grants', 'SafetyOutlined', 45, 1);

-- ========== 多组织多工厂按钮（4040-4049） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4040, 'platform:org:legalentity:list', '查询法人主体', 'button', 4030, NULL, NULL, 1, 1),
(4041, 'platform:org:legalentity:manage', '维护法人主体', 'button', 4030, NULL, NULL, 2, 1),
(4042, 'platform:org:factory:list', '查询工厂', 'button', 4031, NULL, NULL, 1, 1),
(4043, 'platform:org:factory:manage', '维护工厂', 'button', 4031, NULL, NULL, 2, 1),
(4044, 'platform:org:warehouse:list', '查询仓库', 'button', 4032, NULL, NULL, 1, 1),
(4045, 'platform:org:warehouse:manage', '维护仓库', 'button', 4032, NULL, NULL, 2, 1),
(4046, 'platform:org:productionline:list', '查询产线', 'button', 4033, NULL, NULL, 1, 1),
(4047, 'platform:org:productionline:manage', '维护产线', 'button', 4033, NULL, NULL, 2, 1),
(4048, 'platform:org:orggrant:list', '查询跨组织授权', 'button', 4034, NULL, NULL, 1, 1),
(4049, 'platform:org:orggrant:manage', '维护跨组织授权', 'button', 4034, NULL, NULL, 2, 1);

-- ========== 角色授权 ==========

-- 管理员（2001）：授予多组织多工厂全部权限
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11950, 2001, 4030), (11951, 2001, 4031), (11952, 2001, 4032), (11953, 2001, 4033), (11954, 2001, 4034),
(11955, 2001, 4040), (11956, 2001, 4041), (11957, 2001, 4042), (11958, 2001, 4043), (11959, 2001, 4044),
(11960, 2001, 4045), (11961, 2001, 4046), (11962, 2001, 4047), (11963, 2001, 4048), (11964, 2001, 4049);

-- 只读用户（2006）：全部菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11965, 2006, 4030), (11966, 2006, 4031), (11967, 2006, 4032), (11968, 2006, 4033), (11969, 2006, 4034),
(11970, 2006, 4040), (11971, 2006, 4042), (11972, 2006, 4044), (11973, 2006, 4046), (11974, 2006, 4048);

-- 研发工程师（2002）：法人、工厂、产线只读
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11975, 2002, 4030), (11976, 2002, 4031), (11977, 2002, 4033),
(11978, 2002, 4040), (11979, 2002, 4042), (11980, 2002, 4046);

-- 质量工程师（2003）：工厂、产线只读
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11981, 2003, 4031), (11982, 2003, 4033),
(11983, 2003, 4042), (11984, 2003, 4046);

-- 供应链专员（2004）：法人、工厂、仓库只读
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11985, 2004, 4030), (11986, 2004, 4031), (11987, 2004, 4032),
(11988, 2004, 4040), (11989, 2004, 4042), (11990, 2004, 4044);

-- 生产现场（2005）：工厂、仓库、产线只读
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11991, 2005, 4031), (11992, 2005, 4032), (11993, 2005, 4033),
(11994, 2005, 4042), (11995, 2005, 4044), (11996, 2005, 4046);

-- ========== 多组织多工厂字典（7100-7132） ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(7100, 'org_legal_status', '生效', 'ACTIVE', 1, 1, NULL),
(7101, 'org_legal_status', '停用', 'DISABLED', 2, 1, NULL),
(7102, 'org_factory_type', '制造工厂', 'MANUFACTURE', 1, 1, NULL),
(7103, 'org_factory_type', '装配工厂', 'ASSEMBLY', 2, 1, NULL),
(7104, 'org_factory_type', '仓储中心', 'WAREHOUSE', 3, 1, NULL),
(7105, 'org_factory_type', '外协工厂', 'OEM', 4, 1, NULL),
(7106, 'org_factory_status', '生效', 'ACTIVE', 1, 1, NULL),
(7107, 'org_factory_status', '停用', 'DISABLED', 2, 1, NULL),
(7108, 'org_warehouse_type', '原料仓', 'RAW', 1, 1, NULL),
(7109, 'org_warehouse_type', '半成品仓', 'SEMI', 2, 1, NULL),
(7110, 'org_warehouse_type', '成品仓', 'FINISHED', 3, 1, NULL),
(7111, 'org_warehouse_type', '备件仓', 'SPARE', 4, 1, NULL),
(7112, 'org_warehouse_type', '在途仓', 'INTRANSIT', 5, 1, NULL),
(7113, 'org_warehouse_status', '生效', 'ACTIVE', 1, 1, NULL),
(7114, 'org_warehouse_status', '停用', 'DISABLED', 2, 1, NULL),
(7115, 'org_line_type', '装配线', 'ASSEMBLY', 1, 1, NULL),
(7116, 'org_line_type', '机加线', 'MACHINING', 2, 1, NULL),
(7117, 'org_line_type', '包装线', 'PACKAGING', 3, 1, NULL),
(7118, 'org_line_type', '测试线', 'TESTING', 4, 1, NULL),
(7119, 'org_line_status', '生效', 'ACTIVE', 1, 1, NULL),
(7120, 'org_line_status', '停用', 'DISABLED', 2, 1, NULL),
(7121, 'org_grant_type', '法人授权', 'LEGAL', 1, 1, NULL),
(7122, 'org_grant_type', '工厂授权', 'FACTORY', 2, 1, NULL),
(7123, 'org_grant_type', '仓库授权', 'WAREHOUSE', 3, 1, NULL),
(7124, 'org_grant_type', '产线授权', 'LINE', 4, 1, NULL),
(7125, 'org_grant_type', '组织授权', 'ORG', 5, 1, NULL),
(7126, 'org_grant_status', '生效', 'ACTIVE', 1, 1, NULL),
(7127, 'org_grant_status', '已过期', 'EXPIRED', 2, 1, NULL),
(7128, 'org_grant_status', '已撤销', 'REVOKED', 3, 1, NULL),
(7129, 'org_scope_type', '全部', 'ALL', 1, 1, NULL),
(7130, 'org_scope_type', '按工厂', 'FACTORY', 2, 1, NULL),
(7131, 'org_scope_type', '按仓库', 'WAREHOUSE', 3, 1, NULL),
(7132, 'org_scope_type', '按产线', 'LINE', 4, 1, NULL);

-- ========== 多组织多工厂可配置项（6100-6104） ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(6100, 'ORG', 'org.multi.factory.enabled', '多工厂隔离开关', 'true', 0, 1, '关闭后不按工厂维度隔离数据，默认开启'),
(6101, 'ORG', 'org.default.legal.code', '默认法人主体编码', 'LEGAL-DEFAULT', 1, 1, '待业务方确认默认法人主体，单法人场景可直接沿用'),
(6102, 'ORG', 'org.cross.grant.required', '跨组织访问需授权', 'true', 0, 1, '开启后访问非本组织维度数据需显式授权，默认开启'),
(6103, 'ORG', 'org.warehouse.capacity.unit', '仓库容量单位', 'm3', 1, 1, '待业务方确认容量计量单位与换算规则'),
(6104, 'ORG', 'org.data.scope.default', '默认数据权限范围', 'ORG', 1, 1, '待业务方确认默认范围（ALL/ORG/ORG_AND_CHILD/SELF/FACTORY）');
