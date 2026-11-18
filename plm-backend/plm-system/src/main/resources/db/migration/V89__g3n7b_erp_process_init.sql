-- G3-N7b ERP—工艺资源（WBS T098 工艺资源）初始化：菜单/按钮权限、角色授权、字典与可配置项。
-- 号段基线（V87 之后已占用的最大值）：sys_permission=4522（本脚本从 4530 起）、
-- sys_role_permission=13660（从 13670 起）、sys_dictionary=8125（从 8140 起）、sys_config=6305（从 6310 起）。
-- 菜单说明：工艺资源（4530）为 ERP 顶级菜单（4260）下的二级分组；
--           组织/法人/工厂/单据状态机/审批复用既有平台底座，不在此重复定义。

-- ========== ERP 工艺资源分组菜单（4530，挂在 ERP 顶级菜单 4260 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4530, 'erp:process', '工艺资源', 'menu', 4260, '/erp/process', 'ClusterOutlined', 29, 1);

-- ========== ERP 工艺资源业务菜单（4531-4536，挂在 4530 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4531, 'erp:process:resource', '资源资料', 'menu', 4530, '/erp/process/resources', 'ToolOutlined', 1, 1),
(4532, 'erp:process:standard', '标准工艺', 'menu', 4530, '/erp/process/standards', 'ProfileOutlined', 2, 1),
(4533, 'erp:process:route', '工艺路线', 'menu', 4530, '/erp/process/routes', 'NodeIndexOutlined', 3, 1),
(4534, 'erp:process:plan', '工序计划', 'menu', 4530, '/erp/process/plans', 'ScheduleOutlined', 4, 1),
(4535, 'erp:process:report', '工序报工', 'menu', 4530, '/erp/process/reports', 'CarryOutOutlined', 5, 1),
(4536, 'erp:process:labor', '工时反馈', 'menu', 4530, '/erp/process/labor-feedback', 'FieldTimeOutlined', 6, 1);

-- ========== ERP 工艺资源按钮（4537-4548） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4537, 'erp:process:resource:list', '查询资源资料', 'button', 4531, NULL, NULL, 1, 1),
(4538, 'erp:process:resource:manage', '维护资源资料', 'button', 4531, NULL, NULL, 2, 1),
(4539, 'erp:process:standard:list', '查询标准工艺', 'button', 4532, NULL, NULL, 1, 1),
(4540, 'erp:process:standard:manage', '维护标准工艺', 'button', 4532, NULL, NULL, 2, 1),
(4541, 'erp:process:route:list', '查询工艺路线', 'button', 4533, NULL, NULL, 1, 1),
(4542, 'erp:process:route:manage', '维护工艺路线', 'button', 4533, NULL, NULL, 2, 1),
(4543, 'erp:process:plan:list', '查询工序计划', 'button', 4534, NULL, NULL, 1, 1),
(4544, 'erp:process:plan:manage', '维护工序计划', 'button', 4534, NULL, NULL, 2, 1),
(4545, 'erp:process:report:list', '查询工序报工', 'button', 4535, NULL, NULL, 1, 1),
(4546, 'erp:process:report:manage', '维护工序报工', 'button', 4535, NULL, NULL, 2, 1),
(4547, 'erp:process:labor:list', '查询工时反馈', 'button', 4536, NULL, NULL, 1, 1),
(4548, 'erp:process:labor:manage', '维护工时反馈', 'button', 4536, NULL, NULL, 2, 1);

-- ========== 角色授权 ==========

-- 管理员（2001）：授予全部权限（1 分组 + 6 菜单 + 12 按钮，共 19 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(13670, 2001, 4530), (13671, 2001, 4531), (13672, 2001, 4532), (13673, 2001, 4533),
(13674, 2001, 4534), (13675, 2001, 4535), (13676, 2001, 4536), (13677, 2001, 4537),
(13678, 2001, 4538), (13679, 2001, 4539), (13680, 2001, 4540), (13681, 2001, 4541),
(13682, 2001, 4542), (13683, 2001, 4543), (13684, 2001, 4544), (13685, 2001, 4545),
(13686, 2001, 4546), (13687, 2001, 4547), (13688, 2001, 4548);

-- 研发工程师（2002）：授予分组与菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(13689, 2002, 4530), (13690, 2002, 4531), (13691, 2002, 4532), (13692, 2002, 4533),
(13693, 2002, 4534), (13694, 2002, 4535), (13695, 2002, 4536), (13696, 2002, 4537),
(13697, 2002, 4539), (13698, 2002, 4541), (13699, 2002, 4543), (13700, 2002, 4545),
(13701, 2002, 4547);

-- 质量工程师（2003）：授予分组与菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(13702, 2003, 4530), (13703, 2003, 4531), (13704, 2003, 4532), (13705, 2003, 4533),
(13706, 2003, 4534), (13707, 2003, 4535), (13708, 2003, 4536), (13709, 2003, 4537),
(13710, 2003, 4539), (13711, 2003, 4541), (13712, 2003, 4543), (13713, 2003, 4545),
(13714, 2003, 4547);

-- 生产现场（2005）：授予分组与菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(13715, 2005, 4530), (13716, 2005, 4531), (13717, 2005, 4532), (13718, 2005, 4533),
(13719, 2005, 4534), (13720, 2005, 4535), (13721, 2005, 4536), (13722, 2005, 4537),
(13723, 2005, 4539), (13724, 2005, 4541), (13725, 2005, 4543), (13726, 2005, 4545),
(13727, 2005, 4547);

-- 只读用户（2006）：授予分组与菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(13728, 2006, 4530), (13729, 2006, 4531), (13730, 2006, 4532), (13731, 2006, 4533),
(13732, 2006, 4534), (13733, 2006, 4535), (13734, 2006, 4536), (13735, 2006, 4537),
(13736, 2006, 4539), (13737, 2006, 4541), (13738, 2006, 4543), (13739, 2006, 4545),
(13740, 2006, 4547);

-- 供应链专员（2004）：授予全部查询与维护按钮（12 项，不含分组与菜单）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(13741, 2004, 4537), (13742, 2004, 4538), (13743, 2004, 4539), (13744, 2004, 4540),
(13745, 2004, 4541), (13746, 2004, 4542), (13747, 2004, 4543), (13748, 2004, 4544),
(13749, 2004, 4545), (13750, 2004, 4546), (13751, 2004, 4547), (13752, 2004, 4548);

-- ========== ERP 工艺资源字典（8140-8170） ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(8140, 'erp_process_resource_type', '设备', 'MACHINE', 1, 1, NULL),
(8141, 'erp_process_resource_type', '装备', 'EQUIPMENT', 2, 1, NULL),
(8142, 'erp_process_resource_type', '模具', 'MOLD', 3, 1, NULL),
(8143, 'erp_process_resource_type', '工装夹具', 'FIXTURE', 4, 1, NULL),
(8144, 'erp_process_resource_type', '量具', 'GAUGE', 5, 1, NULL),
(8145, 'erp_process_resource_type', '人工', 'LABOR', 6, 1, NULL),
(8146, 'erp_process_resource_type', '其他', 'OTHER', 7, 1, NULL),
(8147, 'erp_process_standard_status', '草稿', 'DRAFT', 1, 1, NULL),
(8148, 'erp_process_standard_status', '生效', 'ACTIVE', 2, 1, NULL),
(8149, 'erp_process_standard_status', '已失效', 'OBSOLETE', 3, 1, NULL),
(8150, 'erp_process_route_type', '主路线', 'MAIN', 1, 1, NULL),
(8151, 'erp_process_route_type', '替代路线', 'ALTERNATE', 2, 1, NULL),
(8152, 'erp_process_route_status', '草稿', 'DRAFT', 1, 1, NULL),
(8153, 'erp_process_route_status', '已发布', 'RELEASED', 2, 1, NULL),
(8154, 'erp_process_route_status', '已废止', 'OBSOLETE', 3, 1, NULL),
(8155, 'erp_process_plan_status', '待开工', 'PENDING', 1, 1, NULL),
(8156, 'erp_process_plan_status', '加工中', 'IN_PROGRESS', 2, 1, NULL),
(8157, 'erp_process_plan_status', '已完工', 'COMPLETED', 3, 1, NULL),
(8158, 'erp_process_plan_status', '已关闭', 'CLOSED', 4, 1, NULL),
(8159, 'erp_process_plan_status', '已取消', 'CANCELLED', 5, 1, NULL),
(8160, 'erp_process_report_status', '已提交', 'SUBMITTED', 1, 1, NULL),
(8161, 'erp_process_report_status', '已确认', 'CONFIRMED', 2, 1, NULL),
(8162, 'erp_process_report_status', '已驳回', 'REJECTED', 3, 1, NULL),
(8163, 'erp_process_labor_type', '准备', 'SETUP', 1, 1, NULL),
(8164, 'erp_process_labor_type', '加工', 'RUN', 2, 1, NULL),
(8165, 'erp_process_labor_type', '等待', 'WAIT', 3, 1, NULL),
(8166, 'erp_process_labor_type', '停机', 'DOWN', 4, 1, NULL),
(8167, 'erp_process_labor_type', '其他', 'OTHER', 5, 1, NULL),
(8168, 'erp_process_labor_status', '草稿', 'DRAFT', 1, 1, NULL),
(8169, 'erp_process_labor_status', '已提交', 'SUBMITTED', 2, 1, NULL),
(8170, 'erp_process_labor_status', '已确认', 'CONFIRMED', 3, 1, NULL);

-- ========== ERP 工艺资源可配置项（6310-6321） ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(6310, 'ERP', 'erp.process.enabled', '工艺资源启用开关', 'true', 0, 1, 'ERP 工艺资源总开关，默认启用'),
(6311, 'ERP', 'erp.process.standard.default.version', '标准工艺默认版本号', 'V1.0', 0, 1, '新建标准工艺未指定版本时使用'),
(6312, 'ERP', 'erp.process.route.default.type', '工艺路线默认类型', 'MAIN', 0, 1, '新建工艺路线未指定类型时使用'),
(6313, 'ERP', 'erp.process.labor.feedback.enabled', '工时反馈启用开关', 'true', 0, 1, '是否启用工序工时反馈'),
(6314, 'ERP', 'erp.process.resource.capacity.unit', '资源能力默认单位', 'HOUR', 1, 1, '待业务方确认：资源产能的默认计量单位'),
(6315, 'ERP', 'erp.process.standard.time.unit', '标准工时单位', 'MINUTE', 1, 1, '待业务方确认：标准工时计量单位（分钟/小时）'),
(6316, 'ERP', 'erp.process.report.auto.confirm', '报工自动确认', 'false', 1, 1, '待业务方确认：工序报工提交后是否自动确认'),
(6317, 'ERP', 'erp.process.plan.auto.dispatch', '工序计划自动派工', 'false', 1, 1, '待业务方确认：工序计划是否按资源自动派工'),
(6318, 'ERP', 'erp.process.report.over.report.check', '超额报工校验', 'true', 1, 1, '待业务方确认：报工数量是否校验不得超过计划数量'),
(6319, 'ERP', 'erp.process.labor.overtime.threshold', '工时超时阈值(小时)', '8', 1, 1, '待业务方确认：单个工序工时超过该阈值需提示'),
(6320, 'ERP', 'erp.process.route.version.rule', '工艺路线版本规则', 'V{序号}', 1, 1, '待业务方确认：工艺路线版本号生成规则'),
(6321, 'ERP', 'erp.process.resource.calendar.enabled', '资源日历启用', 'true', 1, 1, '待业务方确认：资源排产是否考虑工作日历');
