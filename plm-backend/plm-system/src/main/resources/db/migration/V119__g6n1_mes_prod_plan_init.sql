-- G6-N1 MES—生产计划执行（WBS T037）初始化：菜单/按钮权限、角色授权、字典与可配置项。
-- 号段基线（V117 之后已占用的最大值）：sys_permission=4829（本脚本从 4830 起）、
-- sys_role_permission=14787（从 14800 起）、sys_dictionary=8739（从 8740 起）、sys_config=6651（从 6660 起）。
-- 菜单说明：新建 MES 顶级菜单域（4830），生产计划执行（4831）为其下二级分组；
--          覆盖 ERP工单接收、排产、派工、工序任务、进度反馈。

-- ========== MES 顶级菜单域（4830） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4830, 'mes', 'MES 制造执行', 'menu', 0, '/mes', 'DeploymentUnitOutlined', 18, 1);

-- ========== 生产计划执行分组菜单（4831，挂在 4830 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4831, 'mes:plan', '生产计划执行', 'menu', 4830, '/mes/plan', 'ScheduleOutlined', 1, 1);

-- ========== 生产计划执行业务菜单（4832-4834，挂在 4831 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4832, 'mes:plan:order', '生产工单', 'menu', 4831, '/mes/plan/orders', 'ProfileOutlined', 1, 1),
(4833, 'mes:plan:schedule', '排产计划', 'menu', 4831, '/mes/plan/schedules', 'ScheduleOutlined', 2, 1),
(4834, 'mes:plan:dispatch', '派工任务', 'menu', 4831, '/mes/plan/dispatches', 'TeamOutlined', 3, 1);

-- ========== 生产计划执行按钮（4835-4840） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4835, 'mes:plan:order:list', '查询生产工单', 'button', 4832, NULL, NULL, 1, 1),
(4836, 'mes:plan:order:manage', '维护生产工单', 'button', 4832, NULL, NULL, 2, 1),
(4837, 'mes:plan:schedule:list', '查询排产计划', 'button', 4833, NULL, NULL, 1, 1),
(4838, 'mes:plan:schedule:manage', '维护排产计划', 'button', 4833, NULL, NULL, 2, 1),
(4839, 'mes:plan:dispatch:list', '查询派工任务', 'button', 4834, NULL, NULL, 1, 1),
(4840, 'mes:plan:dispatch:manage', '维护派工任务', 'button', 4834, NULL, NULL, 2, 1);

-- ========== 角色授权 ==========

-- 管理员（2001）：授予全部权限（1 顶级 + 1 分组 + 3 菜单 + 6 按钮，共 11 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14800, 2001, 4830), (14801, 2001, 4831), (14802, 2001, 4832), (14803, 2001, 4833),
(14804, 2001, 4834), (14805, 2001, 4835), (14806, 2001, 4836), (14807, 2001, 4837),
(14808, 2001, 4838), (14809, 2001, 4839), (14810, 2001, 4840);

-- 生产现场（2005）：授予全部权限（生产计划执行为生产主责，共 11 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14811, 2005, 4830), (14812, 2005, 4831), (14813, 2005, 4832), (14814, 2005, 4833),
(14815, 2005, 4834), (14816, 2005, 4835), (14817, 2005, 4836), (14818, 2005, 4837),
(14819, 2005, 4838), (14820, 2005, 4839), (14821, 2005, 4840);

-- 研发工程师（2002）：授予顶级/分组/菜单 + 仅查询按钮（8 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14822, 2002, 4830), (14823, 2002, 4831), (14824, 2002, 4832), (14825, 2002, 4833),
(14826, 2002, 4834), (14827, 2002, 4835), (14828, 2002, 4837), (14829, 2002, 4839);

-- 质量工程师（2003）：授予顶级/分组/菜单 + 仅查询按钮（8 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14830, 2003, 4830), (14831, 2003, 4831), (14832, 2003, 4832), (14833, 2003, 4833),
(14834, 2003, 4834), (14835, 2003, 4835), (14836, 2003, 4837), (14837, 2003, 4839);

-- 供应链专员（2004）：授予顶级/分组/菜单 + 仅查询按钮（8 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14838, 2004, 4830), (14839, 2004, 4831), (14840, 2004, 4832), (14841, 2004, 4833),
(14842, 2004, 4834), (14843, 2004, 4835), (14844, 2004, 4837), (14845, 2004, 4839);

-- 只读用户（2006）：授予顶级/分组/菜单 + 仅查询按钮（8 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14846, 2006, 4830), (14847, 2006, 4831), (14848, 2006, 4832), (14849, 2006, 4833),
(14850, 2006, 4834), (14851, 2006, 4835), (14852, 2006, 4837), (14853, 2006, 4839);

-- ========== 生产计划执行字典（8740-8759） ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(8740, 'mes_prod_order_status', '草稿', 'DRAFT', 1, 1, NULL),
(8741, 'mes_prod_order_status', '已下达', 'RELEASED', 2, 1, NULL),
(8742, 'mes_prod_order_status', '生产中', 'IN_PROGRESS', 3, 1, NULL),
(8743, 'mes_prod_order_status', '已完工', 'COMPLETED', 4, 1, NULL),
(8744, 'mes_prod_order_status', '已取消', 'CANCELLED', 5, 1, NULL),
(8745, 'mes_priority', '低', 'LOW', 1, 1, NULL),
(8746, 'mes_priority', '普通', 'NORMAL', 2, 1, NULL),
(8747, 'mes_priority', '高', 'HIGH', 3, 1, NULL),
(8748, 'mes_priority', '紧急', 'URGENT', 4, 1, NULL),
(8749, 'mes_order_source', 'ERP 下达', 'ERP', 1, 1, NULL),
(8750, 'mes_order_source', '手工录入', 'MANUAL', 2, 1, NULL),
(8751, 'mes_schedule_status', '草稿', 'DRAFT', 1, 1, NULL),
(8752, 'mes_schedule_status', '已排产', 'SCHEDULED', 2, 1, NULL),
(8753, 'mes_schedule_status', '已下达', 'RELEASED', 3, 1, NULL),
(8754, 'mes_schedule_status', '已关闭', 'CLOSED', 4, 1, NULL),
(8755, 'mes_schedule_status', '已取消', 'CANCELLED', 5, 1, NULL),
(8756, 'mes_dispatch_status', '草稿', 'DRAFT', 1, 1, NULL),
(8757, 'mes_dispatch_status', '已派工', 'DISPATCHED', 2, 1, NULL),
(8758, 'mes_dispatch_status', '进行中', 'IN_PROGRESS', 3, 1, NULL),
(8759, 'mes_dispatch_status', '已完工', 'COMPLETED', 4, 1, NULL);

-- ========== 生产计划执行可配置项（6660-6671） ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(6660, 'MES', 'mes.plan.enabled', '生产计划执行启用开关', 'true', 0, 1, 'MES 生产计划执行总开关，默认启用'),
(6661, 'MES', 'mes.prod.order.no.prefix', '生产工单号前缀', 'MPO', 0, 1, '生产工单号自动生成前缀'),
(6662, 'MES', 'mes.prod.order.auto.receive', 'ERP工单自动接收开关', 'true', 1, 1, '待业务方确认：是否自动接收并生成 ERP 下达工单'),
(6663, 'MES', 'mes.prod.order.default.priority', '工单默认优先级', 'NORMAL', 1, 1, '待业务方确认：生产工单默认优先级'),
(6664, 'MES', 'mes.schedule.no.prefix', '排产计划单号前缀', 'MSC', 0, 1, '排产计划单号自动生成前缀'),
(6665, 'MES', 'mes.schedule.capacity.check', '排产产能校验开关', 'true', 1, 1, '待业务方确认：排产是否校验产线产能'),
(6666, 'MES', 'mes.schedule.auto.split', '排产自动拆分开关', 'false', 1, 1, '待业务方确认：大工单是否自动拆分到多产线'),
(6667, 'MES', 'mes.dispatch.no.prefix', '派工单号前缀', 'MDP', 0, 1, '派工任务单号自动生成前缀'),
(6668, 'MES', 'mes.dispatch.need.confirm', '派工需确认开关', 'true', 0, 1, '派工任务是否需操作工确认接单'),
(6669, 'MES', 'mes.dispatch.auto.feedback', '进度自动反馈开关', 'false', 1, 1, '待业务方确认：工序进度是否由设备自动反馈'),
(6670, 'MES', 'mes.dispatch.progress.interval', '进度反馈间隔(分钟)', '60', 1, 1, '待业务方确认：进度反馈采集间隔分钟数'),
(6671, 'MES', 'mes.plan.default.workshop', '默认车间编码', 'WS01', 1, 1, '待业务方确认：生产工单默认车间编码');
