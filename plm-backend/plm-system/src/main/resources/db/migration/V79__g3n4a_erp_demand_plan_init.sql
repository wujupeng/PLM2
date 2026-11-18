-- G3-N4a ERP—需求计划（WBS T025 需求计划 / T095 LRP/MRP需求计划）初始化：菜单/按钮权限、角色授权、字典与可配置项。
-- 号段基线（V77 之后已占用的最大值）：sys_permission=4387（本脚本从 4388 起）、
-- sys_role_permission=13101（从 13110 起）、sys_dictionary=7785（从 7790 起）、sys_config=6217（从 6220 起）。
-- 菜单说明：需求计划为 ERP 顶级菜单（4260）下的二级分组（4388），其下挂 6 个业务单据页面；
--           物料/客户/币种/仓库复用既有基础资料与平台底座，不在此重复定义。

-- ========== ERP 需求计划分组菜单（4388，挂在 ERP 顶级菜单 4260 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4388, 'erp:demand-plan', '需求计划', 'menu', 4260, '/erp/demand-plan', 'FundProjectionScreenOutlined', 23, 1);

-- ========== ERP 需求计划业务菜单（4389-4394，挂在需求计划 4388 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4389, 'erp:demand-plan:plan', '需求计划单', 'menu', 4388, '/erp/demand-plan/plans', 'NodeIndexOutlined', 1, 1),
(4390, 'erp:demand-plan:mrprun', 'MRP/LRP运算', 'menu', 4388, '/erp/demand-plan/mrp-runs', 'CalculatorOutlined', 2, 1),
(4391, 'erp:demand-plan:netreq', '净需求', 'menu', 4388, '/erp/demand-plan/net-requirements', 'FunnelPlotOutlined', 3, 1),
(4392, 'erp:demand-plan:purchasesuggestion', '采购建议', 'menu', 4388, '/erp/demand-plan/purchase-suggestions', 'ContainerOutlined', 4, 1),
(4393, 'erp:demand-plan:productionsuggestion', '生产建议', 'menu', 4388, '/erp/demand-plan/production-suggestions', 'ToolOutlined', 5, 1),
(4394, 'erp:demand-plan:adjustment', '计划调整', 'menu', 4388, '/erp/demand-plan/plan-adjustments', 'ScheduleOutlined', 6, 1);

-- ========== ERP 需求计划按钮（4395-4406） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4395, 'erp:demand-plan:plan:list', '查询需求计划单', 'button', 4389, NULL, NULL, 1, 1),
(4396, 'erp:demand-plan:plan:manage', '维护需求计划单', 'button', 4389, NULL, NULL, 2, 1),
(4397, 'erp:demand-plan:mrprun:list', '查询MRP/LRP运算', 'button', 4390, NULL, NULL, 1, 1),
(4398, 'erp:demand-plan:mrprun:manage', '维护MRP/LRP运算', 'button', 4390, NULL, NULL, 2, 1),
(4399, 'erp:demand-plan:netreq:list', '查询净需求', 'button', 4391, NULL, NULL, 1, 1),
(4400, 'erp:demand-plan:netreq:manage', '维护净需求', 'button', 4391, NULL, NULL, 2, 1),
(4401, 'erp:demand-plan:purchasesuggestion:list', '查询采购建议', 'button', 4392, NULL, NULL, 1, 1),
(4402, 'erp:demand-plan:purchasesuggestion:manage', '维护采购建议', 'button', 4392, NULL, NULL, 2, 1),
(4403, 'erp:demand-plan:productionsuggestion:list', '查询生产建议', 'button', 4393, NULL, NULL, 1, 1),
(4404, 'erp:demand-plan:productionsuggestion:manage', '维护生产建议', 'button', 4393, NULL, NULL, 2, 1),
(4405, 'erp:demand-plan:adjustment:list', '查询计划调整', 'button', 4394, NULL, NULL, 1, 1),
(4406, 'erp:demand-plan:adjustment:manage', '维护计划调整', 'button', 4394, NULL, NULL, 2, 1);

-- ========== 角色授权 ==========

-- 管理员（2001）：授予 ERP 需求计划全部权限（1 分组 + 6 菜单 + 12 按钮）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(13110, 2001, 4388),
(13111, 2001, 4389), (13112, 2001, 4390), (13113, 2001, 4391), (13114, 2001, 4392),
(13115, 2001, 4393), (13116, 2001, 4394),
(13117, 2001, 4395), (13118, 2001, 4396), (13119, 2001, 4397), (13120, 2001, 4398),
(13121, 2001, 4399), (13122, 2001, 4400), (13123, 2001, 4401), (13124, 2001, 4402),
(13125, 2001, 4403), (13126, 2001, 4404), (13127, 2001, 4405), (13128, 2001, 4406);

-- 研发工程师（2002）：授予分组与菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(13129, 2002, 4388),
(13130, 2002, 4389), (13131, 2002, 4390), (13132, 2002, 4391), (13133, 2002, 4392),
(13134, 2002, 4393), (13135, 2002, 4394),
(13136, 2002, 4395), (13137, 2002, 4397), (13138, 2002, 4399), (13139, 2002, 4401),
(13140, 2002, 4403), (13141, 2002, 4405);

-- 质量工程师（2003）：授予分组与菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(13142, 2003, 4388),
(13143, 2003, 4389), (13144, 2003, 4390), (13145, 2003, 4391), (13146, 2003, 4392),
(13147, 2003, 4393), (13148, 2003, 4394),
(13149, 2003, 4395), (13150, 2003, 4397), (13151, 2003, 4399), (13152, 2003, 4401),
(13153, 2003, 4403), (13154, 2003, 4405);

-- 生产现场（2005）：授予分组与菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(13155, 2005, 4388),
(13156, 2005, 4389), (13157, 2005, 4390), (13158, 2005, 4391), (13159, 2005, 4392),
(13160, 2005, 4393), (13161, 2005, 4394),
(13162, 2005, 4395), (13163, 2005, 4397), (13164, 2005, 4399), (13165, 2005, 4401),
(13166, 2005, 4403), (13167, 2005, 4405);

-- 只读用户（2006）：授予分组与菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(13168, 2006, 4388),
(13169, 2006, 4389), (13170, 2006, 4390), (13171, 2006, 4391), (13172, 2006, 4392),
(13173, 2006, 4393), (13174, 2006, 4394),
(13175, 2006, 4395), (13176, 2006, 4397), (13177, 2006, 4399), (13178, 2006, 4401),
(13179, 2006, 4403), (13180, 2006, 4405);

-- 供应链专员（2004）：授予全部查询与维护按钮（12 项，不含分组与菜单）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(13181, 2004, 4395), (13182, 2004, 4396), (13183, 2004, 4397), (13184, 2004, 4398),
(13185, 2004, 4399), (13186, 2004, 4400), (13187, 2004, 4401), (13188, 2004, 4402),
(13189, 2004, 4403), (13190, 2004, 4404), (13191, 2004, 4405), (13192, 2004, 4406);

-- ========== ERP 需求计划字典（7790-7834） ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(7790, 'erp_demand_plan_type', '订单需求', 'ORDER', 1, 1, NULL),
(7791, 'erp_demand_plan_type', '预测需求', 'FORECAST', 2, 1, NULL),
(7792, 'erp_demand_plan_type', '混合需求', 'MIXED', 3, 1, NULL),
(7793, 'erp_demand_plan_source', '销售订单', 'SALES', 1, 1, NULL),
(7794, 'erp_demand_plan_source', '销售预测', 'FORECAST', 2, 1, NULL),
(7795, 'erp_demand_plan_source', '手工录入', 'MANUAL', 3, 1, NULL),
(7796, 'erp_demand_plan_status', '草稿', 'DRAFT', 1, 1, NULL),
(7797, 'erp_demand_plan_status', '已下发', 'RELEASED', 2, 1, NULL),
(7798, 'erp_demand_plan_status', '运算中', 'RUNNING', 3, 1, NULL),
(7799, 'erp_demand_plan_status', '已关闭', 'CLOSED', 4, 1, NULL),
(7800, 'erp_demand_plan_status', '已取消', 'CANCELLED', 5, 1, NULL),
(7801, 'erp_demand_line_status', '未计划', 'OPEN', 1, 1, NULL),
(7802, 'erp_demand_line_status', '已计划', 'PLANNED', 2, 1, NULL),
(7803, 'erp_demand_line_status', '已关闭', 'CLOSED', 3, 1, NULL),
(7804, 'erp_demand_line_status', '已取消', 'CANCELLED', 4, 1, NULL),
(7805, 'erp_demand_source_type', '销售订单', 'SALES', 1, 1, NULL),
(7806, 'erp_demand_source_type', '销售预测', 'FORECAST', 2, 1, NULL),
(7807, 'erp_demand_source_type', '手工录入', 'MANUAL', 3, 1, NULL),
(7808, 'erp_mrp_run_type', 'MRP物料需求计划', 'MRP', 1, 1, NULL),
(7809, 'erp_mrp_run_type', 'LRP批次需求计划', 'LRP', 2, 1, NULL),
(7810, 'erp_mrp_run_scope', '全量', 'ALL', 1, 1, NULL),
(7811, 'erp_mrp_run_scope', '按计划', 'PLANNED', 2, 1, NULL),
(7812, 'erp_mrp_run_scope', '按物料', 'MATERIAL', 3, 1, NULL),
(7813, 'erp_mrp_run_status', '草稿', 'DRAFT', 1, 1, NULL),
(7814, 'erp_mrp_run_status', '运算中', 'RUNNING', 2, 1, NULL),
(7815, 'erp_mrp_run_status', '已完成', 'COMPLETED', 3, 1, NULL),
(7816, 'erp_mrp_run_status', '运算失败', 'FAILED', 4, 1, NULL),
(7817, 'erp_net_requirement_status', '未计划', 'OPEN', 1, 1, NULL),
(7818, 'erp_net_requirement_status', '已转建议', 'PLANNED', 2, 1, NULL),
(7819, 'erp_net_requirement_status', '已关闭', 'CLOSED', 3, 1, NULL),
(7820, 'erp_purchase_suggestion_status', '未处理', 'OPEN', 1, 1, NULL),
(7821, 'erp_purchase_suggestion_status', '已转单', 'CONVERTED', 2, 1, NULL),
(7822, 'erp_purchase_suggestion_status', '已忽略', 'IGNORED', 3, 1, NULL),
(7823, 'erp_production_suggestion_status', '未处理', 'OPEN', 1, 1, NULL),
(7824, 'erp_production_suggestion_status', '已转单', 'CONVERTED', 2, 1, NULL),
(7825, 'erp_production_suggestion_status', '已忽略', 'IGNORED', 3, 1, NULL),
(7826, 'erp_plan_adjustment_type', '需求量调整', 'DEMAND', 1, 1, NULL),
(7827, 'erp_plan_adjustment_type', '需求日期调整', 'DATE', 2, 1, NULL),
(7828, 'erp_plan_adjustment_type', '数量调整', 'QUANTITY', 3, 1, NULL),
(7829, 'erp_plan_adjustment_type', '计划拆分', 'SPLIT', 4, 1, NULL),
(7830, 'erp_plan_adjustment_status', '草稿', 'DRAFT', 1, 1, NULL),
(7831, 'erp_plan_adjustment_status', '已提交', 'SUBMITTED', 2, 1, NULL),
(7832, 'erp_plan_adjustment_status', '已批准', 'APPROVED', 3, 1, NULL),
(7833, 'erp_plan_adjustment_status', '已驳回', 'REJECTED', 4, 1, NULL),
(7834, 'erp_plan_adjustment_status', '已取消', 'CANCELLED', 5, 1, NULL);

-- ========== ERP 需求计划可配置项（6220-6227） ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(6220, 'ERP', 'erp.demand-plan.enabled', '需求计划启用开关', 'true', 0, 1, 'ERP 需求计划总开关，默认启用'),
(6221, 'ERP', 'erp.mrp.run.type.default', '默认运算类型', 'MRP', 1, 1, '待业务方确认：MRP/LRP 运算默认类型（MRP/MRP、LRP）'),
(6222, 'ERP', 'erp.mrp.horizon.days', '计划展望期(天)', '90', 1, 1, '待业务方确认：MRP/LRP 运算默认计划展望期天数'),
(6223, 'ERP', 'erp.mrp.loss.rate.default', '默认损耗率(%)', '2', 1, 1, '待业务方确认：净需求计算采用的默认损耗率，可被物料/工艺覆盖'),
(6224, 'ERP', 'erp.mrp.lead-time.default', '默认提前期(天)', '7', 1, 1, '待业务方确认：净需求与建议日期推算采用的默认提前期天数'),
(6225, 'ERP', 'erp.mrp.explode.bom.levels', 'BOM展开层级上限', '10', 1, 1, '待业务方确认：MRP 运算时 BOM 多层展开的最大层级'),
(6226, 'ERP', 'erp.suggestion.split.by.supplier', '建议按供应商拆分', 'true', 1, 1, '待业务方确认：采购建议是否按建议供应商拆分生成'),
(6227, 'ERP', 'erp.plan.adjustment.approval.required', '计划调整需审批', 'true', 1, 1, '待业务方确认：计划调整是否必须经审批后方可生效');
