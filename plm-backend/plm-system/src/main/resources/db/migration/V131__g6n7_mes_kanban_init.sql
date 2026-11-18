-- G6-N7 MES—生产看板（WBS T043）初始化：菜单/按钮权限、角色授权、字典与可配置项。
-- 号段基线（V130 之后已占用的最大值）：sys_permission=4926（本脚本从 4927 起）、
-- sys_role_permission=15261（从 15262 起）、sys_dictionary=8897（从 8898 起）、sys_config=6731（从 6732 起）。
-- 菜单说明：MES 顶级菜单域（4830）已由 G6-N1 建立；生产看板（4927）为其下二级分组，
--          覆盖计划达成、产量看板、良率看板、停机看板、在制品看板、异常安灯。

-- ========== 生产看板分组菜单（4927，挂在 4830 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4927, 'mes:kanban', '生产看板', 'menu', 4830, '/mes/kanban', 'DashboardOutlined', 7, 1);

-- ========== 生产看板业务菜单（4928-4933，挂在 4927 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4928, 'mes:kanban:plan', '计划达成', 'menu', 4927, '/mes/kanban/plans', 'AimOutlined', 1, 1),
(4929, 'mes:kanban:output', '产量看板', 'menu', 4927, '/mes/kanban/outputs', 'BarChartOutlined', 2, 1),
(4930, 'mes:kanban:yield', '良率看板', 'menu', 4927, '/mes/kanban/yields', 'RiseOutlined', 3, 1),
(4931, 'mes:kanban:downtime', '停机看板', 'menu', 4927, '/mes/kanban/downtimes', 'FieldTimeOutlined', 4, 1),
(4932, 'mes:kanban:wip', '在制品看板', 'menu', 4927, '/mes/kanban/wips', 'DatabaseOutlined', 5, 1),
(4933, 'mes:kanban:andon', '异常安灯', 'menu', 4927, '/mes/kanban/andons', 'AlertOutlined', 6, 1);

-- ========== 生产看板按钮（4934-4945） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4934, 'mes:kanban:plan:list', '查询计划达成', 'button', 4928, NULL, NULL, 1, 1),
(4935, 'mes:kanban:plan:manage', '维护计划达成', 'button', 4928, NULL, NULL, 2, 1),
(4936, 'mes:kanban:output:list', '查询产量看板', 'button', 4929, NULL, NULL, 1, 1),
(4937, 'mes:kanban:output:manage', '维护产量看板', 'button', 4929, NULL, NULL, 2, 1),
(4938, 'mes:kanban:yield:list', '查询良率看板', 'button', 4930, NULL, NULL, 1, 1),
(4939, 'mes:kanban:yield:manage', '维护良率看板', 'button', 4930, NULL, NULL, 2, 1),
(4940, 'mes:kanban:downtime:list', '查询停机看板', 'button', 4931, NULL, NULL, 1, 1),
(4941, 'mes:kanban:downtime:manage', '维护停机看板', 'button', 4931, NULL, NULL, 2, 1),
(4942, 'mes:kanban:wip:list', '查询在制品看板', 'button', 4932, NULL, NULL, 1, 1),
(4943, 'mes:kanban:wip:manage', '维护在制品看板', 'button', 4932, NULL, NULL, 2, 1),
(4944, 'mes:kanban:andon:list', '查询异常安灯', 'button', 4933, NULL, NULL, 1, 1),
(4945, 'mes:kanban:andon:manage', '维护异常安灯', 'button', 4933, NULL, NULL, 2, 1);

-- ========== 角色授权 ==========

-- 管理员（2001）：授予全部权限（1 分组 + 6 菜单 + 12 按钮，共 19 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(15262, 2001, 4927), (15263, 2001, 4928), (15264, 2001, 4929), (15265, 2001, 4930),
(15266, 2001, 4931), (15267, 2001, 4932), (15268, 2001, 4933), (15269, 2001, 4934),
(15270, 2001, 4935), (15271, 2001, 4936), (15272, 2001, 4937), (15273, 2001, 4938),
(15274, 2001, 4939), (15275, 2001, 4940), (15276, 2001, 4941), (15277, 2001, 4942),
(15278, 2001, 4943), (15279, 2001, 4944), (15280, 2001, 4945);

-- 质量工程师（2003）：授予全部权限（生产看板与质量指标强相关，共 19 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(15281, 2003, 4927), (15282, 2003, 4928), (15283, 2003, 4929), (15284, 2003, 4930),
(15285, 2003, 4931), (15286, 2003, 4932), (15287, 2003, 4933), (15288, 2003, 4934),
(15289, 2003, 4935), (15290, 2003, 4936), (15291, 2003, 4937), (15292, 2003, 4938),
(15293, 2003, 4939), (15294, 2003, 4940), (15295, 2003, 4941), (15296, 2003, 4942),
(15297, 2003, 4943), (15298, 2003, 4944), (15299, 2003, 4945);

-- 研发工程师（2002）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(15300, 2002, 4927), (15301, 2002, 4928), (15302, 2002, 4929), (15303, 2002, 4930),
(15304, 2002, 4931), (15305, 2002, 4932), (15306, 2002, 4933), (15307, 2002, 4934),
(15308, 2002, 4936), (15309, 2002, 4938), (15310, 2002, 4940), (15311, 2002, 4942),
(15312, 2002, 4944);

-- 供应链专员（2004）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(15313, 2004, 4927), (15314, 2004, 4928), (15315, 2004, 4929), (15316, 2004, 4930),
(15317, 2004, 4931), (15318, 2004, 4932), (15319, 2004, 4933), (15320, 2004, 4934),
(15321, 2004, 4936), (15322, 2004, 4938), (15323, 2004, 4940), (15324, 2004, 4942),
(15325, 2004, 4944);

-- 生产现场（2005）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(15326, 2005, 4927), (15327, 2005, 4928), (15328, 2005, 4929), (15329, 2005, 4930),
(15330, 2005, 4931), (15331, 2005, 4932), (15332, 2005, 4933), (15333, 2005, 4934),
(15334, 2005, 4936), (15335, 2005, 4938), (15336, 2005, 4940), (15337, 2005, 4942),
(15338, 2005, 4944);

-- 只读用户（2006）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(15339, 2006, 4927), (15340, 2006, 4928), (15341, 2006, 4929), (15342, 2006, 4930),
(15343, 2006, 4931), (15344, 2006, 4932), (15345, 2006, 4933), (15346, 2006, 4934),
(15347, 2006, 4936), (15348, 2006, 4938), (15349, 2006, 4940), (15350, 2006, 4942),
(15351, 2006, 4944);

-- ========== 生产看板字典（8898-8920） ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(8898, 'mes_kanban_record_status', '草稿', 'DRAFT', 1, 1, NULL),
(8899, 'mes_kanban_record_status', '已发布', 'PUBLISHED', 2, 1, NULL),
(8900, 'mes_kanban_record_status', '已归档', 'ARCHIVED', 3, 1, NULL),
(8901, 'mes_kanban_downtime_type', '设备故障', 'EQUIPMENT', 1, 1, NULL),
(8902, 'mes_kanban_downtime_type', '物料短缺', 'MATERIAL', 2, 1, NULL),
(8903, 'mes_kanban_downtime_type', '换型换线', 'CHANGEOVER', 3, 1, NULL),
(8904, 'mes_kanban_downtime_type', '计划停机', 'PLANNED', 4, 1, NULL),
(8905, 'mes_kanban_downtime_type', '质量异常', 'QUALITY', 5, 1, NULL),
(8906, 'mes_kanban_downtime_type', '其他', 'OTHER', 6, 1, NULL),
(8907, 'mes_kanban_andon_type', '设备异常', 'EQUIPMENT', 1, 1, NULL),
(8908, 'mes_kanban_andon_type', '质量异常', 'QUALITY', 2, 1, NULL),
(8909, 'mes_kanban_andon_type', '物料异常', 'MATERIAL', 3, 1, NULL),
(8910, 'mes_kanban_andon_type', '工艺异常', 'PROCESS', 4, 1, NULL),
(8911, 'mes_kanban_andon_type', '安全异常', 'SAFETY', 5, 1, NULL),
(8912, 'mes_kanban_andon_type', '其他', 'OTHER', 6, 1, NULL),
(8913, 'mes_kanban_andon_level', '低', 'LOW', 1, 1, NULL),
(8914, 'mes_kanban_andon_level', '中', 'MEDIUM', 2, 1, NULL),
(8915, 'mes_kanban_andon_level', '高', 'HIGH', 3, 1, NULL),
(8916, 'mes_kanban_andon_level', '紧急', 'CRITICAL', 4, 1, NULL),
(8917, 'mes_kanban_andon_status', '已触发', 'TRIGGERED', 1, 1, NULL),
(8918, 'mes_kanban_andon_status', '已响应', 'RESPONDED', 2, 1, NULL),
(8919, 'mes_kanban_andon_status', '已关闭', 'CLOSED', 3, 1, NULL),
(8920, 'mes_kanban_andon_status', '已取消', 'CANCELLED', 4, 1, NULL);

-- ========== 生产看板可配置项（6732-6743） ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(6732, 'MES', 'mes.kanban.enabled', '生产看板启用开关', 'true', 0, 1, 'MES 生产看板总开关，默认启用'),
(6733, 'MES', 'mes.kanban.plan.no.prefix', '计划达成编号前缀', 'MKP', 0, 1, '计划达成记录编号自动生成前缀'),
(6734, 'MES', 'mes.kanban.output.no.prefix', '产量看板编号前缀', 'MKO', 0, 1, '产量看板记录编号自动生成前缀'),
(6735, 'MES', 'mes.kanban.yield.no.prefix', '良率看板编号前缀', 'MKY', 0, 1, '良率看板记录编号自动生成前缀'),
(6736, 'MES', 'mes.kanban.downtime.no.prefix', '停机看板编号前缀', 'MKD', 0, 1, '停机看板记录编号自动生成前缀'),
(6737, 'MES', 'mes.kanban.wip.no.prefix', '在制品看板编号前缀', 'MKW', 0, 1, '在制品看板记录编号自动生成前缀'),
(6738, 'MES', 'mes.kanban.andon.no.prefix', '异常安灯编号前缀', 'MKA', 0, 1, '异常安灯记录编号自动生成前缀'),
(6739, 'MES', 'mes.kanban.andon.auto.close.minutes', '安灯自动关闭时长', '60', 1, 1, '待业务方确认：安灯未关闭超时自动关闭时长（分钟）'),
(6740, 'MES', 'mes.kanban.refresh.interval.seconds', '看板刷新间隔', '30', 1, 1, '待业务方确认：看板数据自动刷新间隔（秒）'),
(6741, 'MES', 'mes.kanban.achieve.rate.warning', '计划达成率预警阈值', '90', 1, 1, '待业务方确认：计划达成率低于该阈值时预警（%）'),
(6742, 'MES', 'mes.kanban.yield.rate.warning', '良率预警阈值', '95', 1, 1, '待业务方确认：良率低于该阈值时预警（%）'),
(6743, 'MES', 'mes.kanban.output.uom', '产量默认计量单位', 'PCS', 1, 1, '待业务方确认：产量看板默认计量单位');
