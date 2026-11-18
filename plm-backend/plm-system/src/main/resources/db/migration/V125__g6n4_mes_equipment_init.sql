-- G6-N4 MES—设备与工装（WBS T040）初始化：菜单/按钮权限、角色授权、字典与可配置项。
-- 号段基线（V123 之后已占用的最大值）：sys_permission=4866（本脚本从 4867 起）、
-- sys_role_permission=14977（从 14978 起）、sys_dictionary=8801（从 8802 起）、sys_config=6695（从 6696 起）。
-- 菜单说明：MES 顶级菜单域（4830）已由 G6-N1 建立；设备与工装（4867）为其下二级分组，
--          覆盖设备台账、状态、点检、保养、故障、工装寿命。

-- ========== 设备与工装分组菜单（4867，挂在 4830 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4867, 'mes:equipment', '设备与工装', 'menu', 4830, '/mes/equipment', 'ToolOutlined', 4, 1);

-- ========== 设备与工装业务菜单（4868-4873，挂在 4867 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4868, 'mes:equipment:ledger', '设备台账', 'menu', 4867, '/mes/equipment/ledgers', 'DatabaseOutlined', 1, 1),
(4869, 'mes:equipment:status', '设备状态', 'menu', 4867, '/mes/equipment/statuses', 'DashboardOutlined', 2, 1),
(4870, 'mes:equipment:check', '设备点检', 'menu', 4867, '/mes/equipment/checks', 'AuditOutlined', 3, 1),
(4871, 'mes:equipment:maintenance', '设备保养', 'menu', 4867, '/mes/equipment/maintenances', 'ToolOutlined', 4, 1),
(4872, 'mes:equipment:fault', '设备故障', 'menu', 4867, '/mes/equipment/faults', 'WarningOutlined', 5, 1),
(4873, 'mes:tool:life', '工装寿命', 'menu', 4867, '/mes/equipment/tools', 'FieldTimeOutlined', 6, 1);

-- ========== 设备与工装按钮（4874-4885） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4874, 'mes:equipment:ledger:list', '查询设备台账', 'button', 4868, NULL, NULL, 1, 1),
(4875, 'mes:equipment:ledger:manage', '维护设备台账', 'button', 4868, NULL, NULL, 2, 1),
(4876, 'mes:equipment:status:list', '查询设备状态', 'button', 4869, NULL, NULL, 1, 1),
(4877, 'mes:equipment:status:manage', '维护设备状态', 'button', 4869, NULL, NULL, 2, 1),
(4878, 'mes:equipment:check:list', '查询设备点检', 'button', 4870, NULL, NULL, 1, 1),
(4879, 'mes:equipment:check:manage', '维护设备点检', 'button', 4870, NULL, NULL, 2, 1),
(4880, 'mes:equipment:maintenance:list', '查询设备保养', 'button', 4871, NULL, NULL, 1, 1),
(4881, 'mes:equipment:maintenance:manage', '维护设备保养', 'button', 4871, NULL, NULL, 2, 1),
(4882, 'mes:equipment:fault:list', '查询设备故障', 'button', 4872, NULL, NULL, 1, 1),
(4883, 'mes:equipment:fault:manage', '维护设备故障', 'button', 4872, NULL, NULL, 2, 1),
(4884, 'mes:tool:life:list', '查询工装寿命', 'button', 4873, NULL, NULL, 1, 1),
(4885, 'mes:tool:life:manage', '维护工装寿命', 'button', 4873, NULL, NULL, 2, 1);

-- ========== 角色授权 ==========

-- 管理员（2001）：授予全部权限（1 分组 + 6 菜单 + 12 按钮，共 19 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14978, 2001, 4867), (14979, 2001, 4868), (14980, 2001, 4869), (14981, 2001, 4870),
(14982, 2001, 4871), (14983, 2001, 4872), (14984, 2001, 4873), (14985, 2001, 4874),
(14986, 2001, 4875), (14987, 2001, 4876), (14988, 2001, 4877), (14989, 2001, 4878),
(14990, 2001, 4879), (14991, 2001, 4880), (14992, 2001, 4881), (14993, 2001, 4882),
(14994, 2001, 4883), (14995, 2001, 4884), (14996, 2001, 4885);

-- 生产现场（2005）：授予全部权限（设备运维为生产主责，共 19 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14997, 2005, 4867), (14998, 2005, 4868), (14999, 2005, 4869), (15000, 2005, 4870),
(15001, 2005, 4871), (15002, 2005, 4872), (15003, 2005, 4873), (15004, 2005, 4874),
(15005, 2005, 4875), (15006, 2005, 4876), (15007, 2005, 4877), (15008, 2005, 4878),
(15009, 2005, 4879), (15010, 2005, 4880), (15011, 2005, 4881), (15012, 2005, 4882),
(15013, 2005, 4883), (15014, 2005, 4884), (15015, 2005, 4885);

-- 研发工程师（2002）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(15016, 2002, 4867), (15017, 2002, 4868), (15018, 2002, 4869), (15019, 2002, 4870),
(15020, 2002, 4871), (15021, 2002, 4872), (15022, 2002, 4873), (15023, 2002, 4874),
(15024, 2002, 4876), (15025, 2002, 4878), (15026, 2002, 4880), (15027, 2002, 4882),
(15028, 2002, 4884);

-- 质量工程师（2003）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(15029, 2003, 4867), (15030, 2003, 4868), (15031, 2003, 4869), (15032, 2003, 4870),
(15033, 2003, 4871), (15034, 2003, 4872), (15035, 2003, 4873), (15036, 2003, 4874),
(15037, 2003, 4876), (15038, 2003, 4878), (15039, 2003, 4880), (15040, 2003, 4882),
(15041, 2003, 4884);

-- 供应链专员（2004）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(15042, 2004, 4867), (15043, 2004, 4868), (15044, 2004, 4869), (15045, 2004, 4870),
(15046, 2004, 4871), (15047, 2004, 4872), (15048, 2004, 4873), (15049, 2004, 4874),
(15050, 2004, 4876), (15051, 2004, 4878), (15052, 2004, 4880), (15053, 2004, 4882),
(15054, 2004, 4884);

-- 只读用户（2006）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(15055, 2006, 4867), (15056, 2006, 4868), (15057, 2006, 4869), (15058, 2006, 4870),
(15059, 2006, 4871), (15060, 2006, 4872), (15061, 2006, 4873), (15062, 2006, 4874),
(15063, 2006, 4876), (15064, 2006, 4878), (15065, 2006, 4880), (15066, 2006, 4882),
(15067, 2006, 4884);

-- ========== 设备与工装字典（8802-8838） ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(8802, 'mes_equipment_status', '运行', 'RUNNING', 1, 1, NULL),
(8803, 'mes_equipment_status', '空闲', 'IDLE', 2, 1, NULL),
(8804, 'mes_equipment_status', '故障', 'FAULT', 3, 1, NULL),
(8805, 'mes_equipment_status', '保养中', 'MAINTENANCE', 4, 1, NULL),
(8806, 'mes_equipment_status', '已报废', 'SCRAPPED', 5, 1, NULL),
(8807, 'mes_equipment_status_type', '运行', 'RUNNING', 1, 1, NULL),
(8808, 'mes_equipment_status_type', '空闲', 'IDLE', 2, 1, NULL),
(8809, 'mes_equipment_status_type', '故障', 'FAULT', 3, 1, NULL),
(8810, 'mes_equipment_status_type', '保养', 'MAINTENANCE', 4, 1, NULL),
(8811, 'mes_equipment_check_type', '日点检', 'DAILY', 1, 1, NULL),
(8812, 'mes_equipment_check_type', '周点检', 'WEEKLY', 2, 1, NULL),
(8813, 'mes_equipment_check_type', '班点检', 'SHIFT', 3, 1, NULL),
(8814, 'mes_equipment_check_status', '待点检', 'PENDING', 1, 1, NULL),
(8815, 'mes_equipment_check_status', '已通过', 'PASSED', 2, 1, NULL),
(8816, 'mes_equipment_check_status', '未通过', 'FAILED', 3, 1, NULL),
(8817, 'mes_equipment_check_result', '合格', 'PASS', 1, 1, NULL),
(8818, 'mes_equipment_check_result', '不合格', 'FAIL', 2, 1, NULL),
(8819, 'mes_equipment_check_result', '让步接收', 'CONCESSION', 3, 1, NULL),
(8820, 'mes_equipment_maintenance_type', '日常保养', 'DAILY', 1, 1, NULL),
(8821, 'mes_equipment_maintenance_type', '周保养', 'WEEKLY', 2, 1, NULL),
(8822, 'mes_equipment_maintenance_type', '月保养', 'MONTHLY', 3, 1, NULL),
(8823, 'mes_equipment_maintenance_type', '年保养', 'YEARLY', 4, 1, NULL),
(8824, 'mes_equipment_maintenance_status', '已计划', 'PLANNED', 1, 1, NULL),
(8825, 'mes_equipment_maintenance_status', '已完成', 'DONE', 2, 1, NULL),
(8826, 'mes_equipment_maintenance_status', '已取消', 'CANCELLED', 3, 1, NULL),
(8827, 'mes_equipment_fault_level', '低', 'LOW', 1, 1, NULL),
(8828, 'mes_equipment_fault_level', '中', 'MEDIUM', 2, 1, NULL),
(8829, 'mes_equipment_fault_level', '高', 'HIGH', 3, 1, NULL),
(8830, 'mes_equipment_fault_level', '紧急', 'CRITICAL', 4, 1, NULL),
(8831, 'mes_equipment_fault_status', '已报修', 'REPORTED', 1, 1, NULL),
(8832, 'mes_equipment_fault_status', '维修中', 'PROCESSING', 2, 1, NULL),
(8833, 'mes_equipment_fault_status', '已修复', 'RESOLVED', 3, 1, NULL),
(8834, 'mes_equipment_fault_status', '已关闭', 'CLOSED', 4, 1, NULL),
(8835, 'mes_tool_life_status', '正常', 'NORMAL', 1, 1, NULL),
(8836, 'mes_tool_life_status', '预警', 'WARNING', 2, 1, NULL),
(8837, 'mes_tool_life_status', '已超期', 'EXPIRED', 3, 1, NULL),
(8838, 'mes_tool_life_status', '已报废', 'SCRAPPED', 4, 1, NULL);

-- ========== 设备与工装可配置项（6696-6707） ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(6696, 'MES', 'mes.equipment.enabled', '设备与工装启用开关', 'true', 0, 1, 'MES 设备与工装总开关，默认启用'),
(6697, 'MES', 'mes.equipment.no.prefix', '设备台账编号前缀', 'MEQ', 0, 1, '设备台账编号自动生成前缀'),
(6698, 'MES', 'mes.equipment.default.status', '设备默认状态', 'IDLE', 1, 1, '待业务方确认：新建设备默认状态'),
(6699, 'MES', 'mes.equipment.status.no.prefix', '设备状态记录编号前缀', 'MEQST', 0, 1, '设备状态记录编号自动生成前缀'),
(6700, 'MES', 'mes.equipment.check.no.prefix', '设备点检编号前缀', 'MEC', 0, 1, '设备点检编号自动生成前缀'),
(6701, 'MES', 'mes.equipment.check.need.confirm', '点检需确认开关', 'true', 1, 1, '待业务方确认：点检结果是否需班组长确认'),
(6702, 'MES', 'mes.equipment.maintenance.no.prefix', '设备保养编号前缀', 'MEM', 0, 1, '设备保养编号自动生成前缀'),
(6703, 'MES', 'mes.equipment.maintenance.need.approve', '保养需审批开关', 'true', 1, 1, '待业务方确认：保养工单是否需审批'),
(6704, 'MES', 'mes.equipment.fault.no.prefix', '设备故障编号前缀', 'MEF', 0, 1, '设备故障编号自动生成前缀'),
(6705, 'MES', 'mes.equipment.fault.auto.notify', '故障自动通知开关', 'true', 0, 1, '设备故障报修后是否自动通知维修人员'),
(6706, 'MES', 'mes.tool.life.no.prefix', '工装寿命编号前缀', 'MTL', 0, 1, '工装寿命记录编号自动生成前缀'),
(6707, 'MES', 'mes.tool.life.warn.percent', '工装寿命预警阈值(%)', '80', 1, 1, '待业务方确认：工装寿命剩余百分比预警阈值');
