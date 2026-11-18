-- G6-N3 MES—工序报工（WBS T039）初始化：菜单/按钮权限、角色授权、字典与可配置项。
-- 号段基线（V121 之后已占用的最大值）：sys_permission=4856（本脚本从 4857 起）、
-- sys_role_permission=14929（从 14930 起）、sys_dictionary=8783（从 8784 起）、sys_config=6683（从 6684 起）。
-- 菜单说明：MES 顶级菜单域（4830）已由 G6-N1 建立；工序报工（4857）为其下二级分组，
--          覆盖开工、暂停、完工、良品、不良、返工、补料、工时。

-- ========== 工序报工分组菜单（4857，挂在 4830 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4857, 'mes:report', '工序报工', 'menu', 4830, '/mes/report', 'SolutionOutlined', 3, 1);

-- ========== 工序报工业务菜单（4858-4860，挂在 4857 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4858, 'mes:report:work', '工序报工单', 'menu', 4857, '/mes/report/works', 'SolutionOutlined', 1, 1),
(4859, 'mes:report:replenish', '补料记录', 'menu', 4857, '/mes/report/replenishes', 'PlusSquareOutlined', 2, 1),
(4860, 'mes:report:labor', '工时记录', 'menu', 4857, '/mes/report/labors', 'FieldTimeOutlined', 3, 1);

-- ========== 工序报工按钮（4861-4866） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4861, 'mes:report:work:list', '查询工序报工单', 'button', 4858, NULL, NULL, 1, 1),
(4862, 'mes:report:work:manage', '维护工序报工单', 'button', 4858, NULL, NULL, 2, 1),
(4863, 'mes:report:replenish:list', '查询补料记录', 'button', 4859, NULL, NULL, 1, 1),
(4864, 'mes:report:replenish:manage', '维护补料记录', 'button', 4859, NULL, NULL, 2, 1),
(4865, 'mes:report:labor:list', '查询工时记录', 'button', 4860, NULL, NULL, 1, 1),
(4866, 'mes:report:labor:manage', '维护工时记录', 'button', 4860, NULL, NULL, 2, 1);

-- ========== 角色授权 ==========

-- 管理员（2001）：授予全部权限（1 分组 + 3 菜单 + 6 按钮，共 10 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14930, 2001, 4857), (14931, 2001, 4858), (14932, 2001, 4859), (14933, 2001, 4860),
(14934, 2001, 4861), (14935, 2001, 4862), (14936, 2001, 4863), (14937, 2001, 4864),
(14938, 2001, 4865), (14939, 2001, 4866);

-- 生产现场（2005）：授予全部权限（工序报工为生产主责，共 10 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14940, 2005, 4857), (14941, 2005, 4858), (14942, 2005, 4859), (14943, 2005, 4860),
(14944, 2005, 4861), (14945, 2005, 4862), (14946, 2005, 4863), (14947, 2005, 4864),
(14948, 2005, 4865), (14949, 2005, 4866);

-- 研发工程师（2002）：授予分组/菜单 + 仅查询按钮（7 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14950, 2002, 4857), (14951, 2002, 4858), (14952, 2002, 4859), (14953, 2002, 4860),
(14954, 2002, 4861), (14955, 2002, 4863), (14956, 2002, 4865);

-- 质量工程师（2003）：授予分组/菜单 + 仅查询按钮（7 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14957, 2003, 4857), (14958, 2003, 4858), (14959, 2003, 4859), (14960, 2003, 4860),
(14961, 2003, 4861), (14962, 2003, 4863), (14963, 2003, 4865);

-- 供应链专员（2004）：授予分组/菜单 + 仅查询按钮（7 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14964, 2004, 4857), (14965, 2004, 4858), (14966, 2004, 4859), (14967, 2004, 4860),
(14968, 2004, 4861), (14969, 2004, 4863), (14970, 2004, 4865);

-- 只读用户（2006）：授予分组/菜单 + 仅查询按钮（7 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14971, 2006, 4857), (14972, 2006, 4858), (14973, 2006, 4859), (14974, 2006, 4860),
(14975, 2006, 4861), (14976, 2006, 4863), (14977, 2006, 4865);

-- ========== 工序报工字典（8784-8801） ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(8784, 'mes_work_report_type', '开工', 'START', 1, 1, NULL),
(8785, 'mes_work_report_type', '暂停', 'PAUSE', 2, 1, NULL),
(8786, 'mes_work_report_type', '完工', 'FINISH', 3, 1, NULL),
(8787, 'mes_work_report_status', '草稿', 'DRAFT', 1, 1, NULL),
(8788, 'mes_work_report_status', '已提交', 'SUBMITTED', 2, 1, NULL),
(8789, 'mes_work_report_status', '已确认', 'CONFIRMED', 3, 1, NULL),
(8790, 'mes_work_report_status', '已取消', 'CANCELLED', 4, 1, NULL),
(8791, 'mes_replenish_type', '补料', 'SUPPLEMENT', 1, 1, NULL),
(8792, 'mes_replenish_type', '返工料', 'REWORK', 2, 1, NULL),
(8793, 'mes_replenish_type', '报废补料', 'SCRAP', 3, 1, NULL),
(8794, 'mes_replenish_status', '草稿', 'DRAFT', 1, 1, NULL),
(8795, 'mes_replenish_status', '已提交', 'SUBMITTED', 2, 1, NULL),
(8796, 'mes_replenish_status', '已发料', 'ISSUED', 3, 1, NULL),
(8797, 'mes_replenish_status', '已确认', 'CONFIRMED', 4, 1, NULL),
(8798, 'mes_replenish_status', '已取消', 'CANCELLED', 5, 1, NULL),
(8799, 'mes_labor_status', '草稿', 'DRAFT', 1, 1, NULL),
(8800, 'mes_labor_status', '已确认', 'CONFIRMED', 2, 1, NULL),
(8801, 'mes_labor_status', '已取消', 'CANCELLED', 3, 1, NULL);

-- ========== 工序报工可配置项（6684-6695） ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(6684, 'MES', 'mes.report.enabled', '工序报工启用开关', 'true', 0, 1, 'MES 工序报工总开关，默认启用'),
(6685, 'MES', 'mes.work.report.no.prefix', '工序报工单号前缀', 'MWR', 0, 1, '工序报工单号自动生成前缀'),
(6686, 'MES', 'mes.work.report.need.confirm', '报工需确认开关', 'true', 1, 1, '待业务方确认：报工提交后是否需班组长确认'),
(6687, 'MES', 'mes.work.report.default.type', '报工默认类型', 'START', 1, 1, '待业务方确认：工序报工默认类型'),
(6688, 'MES', 'mes.replenish.no.prefix', '补料单号前缀', 'MMR', 0, 1, '补料记录单号自动生成前缀'),
(6689, 'MES', 'mes.replenish.need.approve', '补料需审批开关', 'true', 1, 1, '待业务方确认：补料申请是否需审批'),
(6690, 'MES', 'mes.replenish.allow.over.qty', '补料超量开关', 'false', 1, 1, '待业务方确认：补料数量是否允许超出计划'),
(6691, 'MES', 'mes.labor.no.prefix', '工时单号前缀', 'MLH', 0, 1, '工时记录单号自动生成前缀'),
(6692, 'MES', 'mes.labor.default.total.hours', '默认标准工时', '8', 1, 1, '待业务方确认：每班默认标准工时'),
(6693, 'MES', 'mes.labor.overtime.rate', '加班工时系数', '1.5', 1, 1, '待业务方确认：加班工时折算系数'),
(6694, 'MES', 'mes.labor.need.confirm', '工时需确认开关', 'true', 0, 1, '工时记录是否需确认后生效'),
(6695, 'MES', 'mes.report.default.shift', '默认班次编码', 'DAY', 1, 1, '待业务方确认：工序报工默认班次编码');
