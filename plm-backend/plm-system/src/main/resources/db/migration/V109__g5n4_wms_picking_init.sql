-- G5-N4 WMS—拣选发料（WBS T048）初始化：菜单/按钮权限、角色授权、字典与可配置项。
-- 号段基线（V107 之后已占用的最大值）：sys_permission=4739（本脚本从 4750 起）、
-- sys_role_permission=14487（从 14500 起）、sys_dictionary=8557（从 8570 起）、sys_config=6501（从 6520 起）。
-- 菜单说明：复用 V103 已建的 WMS 顶级菜单域（4690）；
--           拣选发料（4750）为其下二级分组，覆盖生产领料、齐套检查、先进先出、按工单配送、线边仓。

-- ========== 拣选发料分组菜单（4750，挂在 4690 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4750, 'wms:pick', '拣选发料', 'menu', 4690, '/wms/pick', 'ScheduleOutlined', 4, 1);

-- ========== 拣选发料业务菜单（4751-4753，挂在 4750 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4751, 'wms:pick:task', '拣料单', 'menu', 4750, '/wms/pick/tasks', 'PullRequestOutlined', 1, 1),
(4752, 'wms:pick:kitting', '齐套检查', 'menu', 4750, '/wms/pick/kittings', 'CheckSquareOutlined', 2, 1),
(4753, 'wms:pick:linestock', '线边仓库存', 'menu', 4750, '/wms/pick/line-stocks', 'ShopOutlined', 3, 1);

-- ========== 拣选发料按钮（4754-4759） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4754, 'wms:pick:task:list', '查询拣料单', 'button', 4751, NULL, NULL, 1, 1),
(4755, 'wms:pick:task:manage', '维护拣料单', 'button', 4751, NULL, NULL, 2, 1),
(4756, 'wms:pick:kitting:list', '查询齐套检查', 'button', 4752, NULL, NULL, 1, 1),
(4757, 'wms:pick:kitting:manage', '维护齐套检查', 'button', 4752, NULL, NULL, 2, 1),
(4758, 'wms:pick:linestock:list', '查询线边仓库存', 'button', 4753, NULL, NULL, 1, 1),
(4759, 'wms:pick:linestock:manage', '维护线边仓库存', 'button', 4753, NULL, NULL, 2, 1);

-- ========== 角色授权 ==========

-- 管理员（2001）：授予全部权限（1 分组 + 3 菜单 + 6 按钮，共 10 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14500, 2001, 4750), (14501, 2001, 4751), (14502, 2001, 4752), (14503, 2001, 4753),
(14504, 2001, 4754), (14505, 2001, 4755), (14506, 2001, 4756), (14507, 2001, 4757),
(14508, 2001, 4758), (14509, 2001, 4759);

-- 供应链专员（2004）：授予全部权限（拣选发料为供应链主责，共 10 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14510, 2004, 4750), (14511, 2004, 4751), (14512, 2004, 4752), (14513, 2004, 4753),
(14514, 2004, 4754), (14515, 2004, 4755), (14516, 2004, 4756), (14517, 2004, 4757),
(14518, 2004, 4758), (14519, 2004, 4759);

-- 研发工程师（2002）：授予分组/菜单 + 仅查询按钮（7 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14520, 2002, 4750), (14521, 2002, 4751), (14522, 2002, 4752), (14523, 2002, 4753),
(14524, 2002, 4754), (14525, 2002, 4756), (14526, 2002, 4758);

-- 质量工程师（2003）：授予分组/菜单 + 仅查询按钮（7 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14527, 2003, 4750), (14528, 2003, 4751), (14529, 2003, 4752), (14530, 2003, 4753),
(14531, 2003, 4754), (14532, 2003, 4756), (14533, 2003, 4758);

-- 生产现场（2005）：授予分组/菜单 + 仅查询按钮（拣料与线边仓为生产主责，7 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14534, 2005, 4750), (14535, 2005, 4751), (14536, 2005, 4752), (14537, 2005, 4753),
(14538, 2005, 4754), (14539, 2005, 4756), (14540, 2005, 4758);

-- 只读用户（2006）：授予分组/菜单 + 仅查询按钮（7 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14541, 2006, 4750), (14542, 2006, 4751), (14543, 2006, 4752), (14544, 2006, 4753),
(14545, 2006, 4754), (14546, 2006, 4756), (14547, 2006, 4758);

-- ========== 拣选发料字典（8570-8587） ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(8570, 'wms_pick_type', '生产领料', 'PRODUCTION', 1, 1, NULL),
(8571, 'wms_pick_type', '配送领料', 'DELIVERY', 2, 1, NULL),
(8572, 'wms_pick_type', '退料', 'RETURN', 3, 1, NULL),
(8573, 'wms_pick_status', '待拣', 'PENDING', 1, 1, NULL),
(8574, 'wms_pick_status', '拣选中', 'PICKING', 2, 1, NULL),
(8575, 'wms_pick_status', '已拣', 'PICKED', 3, 1, NULL),
(8576, 'wms_pick_status', '已发料', 'ISSUED', 4, 1, NULL),
(8577, 'wms_pick_status', '已取消', 'CANCELLED', 5, 1, NULL),
(8578, 'wms_pick_strategy', '先进先出', 'FIFO', 1, 1, NULL),
(8579, 'wms_pick_strategy', '后进先出', 'LIFO', 2, 1, NULL),
(8580, 'wms_pick_strategy', '就近拣选', 'NEAREST', 3, 1, NULL),
(8581, 'wms_kit_status', '待检', 'PENDING', 1, 1, NULL),
(8582, 'wms_kit_status', '齐套', 'KITTED', 2, 1, NULL),
(8583, 'wms_kit_status', '缺料', 'SHORTAGE', 3, 1, NULL),
(8584, 'wms_kit_status', '部分齐套', 'PARTIAL', 4, 1, NULL),
(8585, 'wms_linestock_status', '正常', 'NORMAL', 1, 1, NULL),
(8586, 'wms_linestock_status', '低于下限', 'SHORTAGE', 2, 1, NULL),
(8587, 'wms_linestock_status', '冻结', 'FROZEN', 3, 1, NULL);

-- ========== 拣选发料可配置项（6520-6531） ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(6520, 'WMS', 'wms.pick.enabled', '拣选发料启用开关', 'true', 0, 1, 'WMS 拣选发料总开关，默认启用'),
(6521, 'WMS', 'wms.pick.strategy.default', '默认拣选策略', 'FIFO', 1, 1, '待业务方确认：拣料默认策略（FIFO/LIFO/NEAREST）'),
(6522, 'WMS', 'wms.pick.fifo.enabled', '先进先出启用开关', 'true', 0, 1, '是否强制按先进先出拣选批次'),
(6523, 'WMS', 'wms.pick.shortage.check.enabled', '齐套检查启用开关', 'true', 1, 1, '待业务方确认：发料前是否必须完成齐套检查'),
(6524, 'WMS', 'wms.pick.allow.shortage.issue', '允许缺料发料开关', 'false', 1, 1, '待业务方确认：齐套检查不通过时是否允许缺料发料'),
(6525, 'WMS', 'wms.pick.line.side.enabled', '线边仓启用开关', 'true', 0, 1, '是否启用线边仓库存管理'),
(6526, 'WMS', 'wms.pick.line.side.min.qty', '线边仓默认下限', '0', 1, 1, '待业务方确认：线边仓默认最低库存数量'),
(6527, 'WMS', 'wms.pick.auto.create.task', '自动生成拣料任务开关', 'true', 0, 1, '生产工单下达后是否自动生成拣料任务'),
(6528, 'WMS', 'wms.pick.task.default.priority', '拣料任务默认优先级', '10', 1, 1, '待业务方确认：拣料任务默认优先级'),
(6529, 'WMS', 'wms.pick.no.prefix', '拣料单号前缀', 'PCK', 0, 1, '拣料单号自动生成前缀'),
(6530, 'WMS', 'wms.pick.kitting.no.prefix', '齐套检查单号前缀', 'KIT', 0, 1, '齐套检查单号自动生成前缀'),
(6531, 'WMS', 'wms.pick.line.side.warn.enabled', '线边仓库存预警开关', 'true', 1, 1, '待业务方确认：线边仓低于下限时是否预警');
