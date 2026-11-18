-- G3-N4b ERP—生产管理（WBS T026 生产管理 / T096 生产订单与补料）初始化：菜单/按钮权限、角色授权、字典与可配置项。
-- 号段基线（V79 之后已占用的最大值）：sys_permission=4406（本脚本从 4410 起）、
-- sys_role_permission=13192（从 13200 起）、sys_dictionary=7834（从 7840 起）、sys_config=6227（从 6230 起）。
-- 菜单说明：生产管理为 ERP 顶级菜单（4260）下的二级分组（4410），其下挂 5 个业务单据页面；
--           物料/BOM/工艺/仓库/车间复用既有基础资料与平台底座，不在此重复定义。

-- ========== ERP 生产管理分组菜单（4410，挂在 ERP 顶级菜单 4260 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4410, 'erp:production', '生产管理', 'menu', 4260, '/erp/production', 'BuildOutlined', 24, 1);

-- ========== ERP 生产管理业务菜单（4411-4415，挂在生产管理 4410 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4411, 'erp:production:order', '生产订单', 'menu', 4410, '/erp/production/orders', 'ProfileOutlined', 1, 1),
(4412, 'erp:production:split', '订单拆分', 'menu', 4410, '/erp/production/splits', 'PartitionOutlined', 2, 1),
(4413, 'erp:production:issue', '材料领用', 'menu', 4410, '/erp/production/material-issues', 'ExportOutlined', 3, 1),
(4414, 'erp:production:addition', '生产补料', 'menu', 4410, '/erp/production/material-additions', 'ExperimentOutlined', 4, 1),
(4415, 'erp:production:receipt', '完工入库', 'menu', 4410, '/erp/production/completion-receipts', 'ImportOutlined', 5, 1);

-- ========== ERP 生产管理按钮（4416-4425） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4416, 'erp:production:order:list', '查询生产订单', 'button', 4411, NULL, NULL, 1, 1),
(4417, 'erp:production:order:manage', '维护生产订单', 'button', 4411, NULL, NULL, 2, 1),
(4418, 'erp:production:split:list', '查询订单拆分', 'button', 4412, NULL, NULL, 1, 1),
(4419, 'erp:production:split:manage', '维护订单拆分', 'button', 4412, NULL, NULL, 2, 1),
(4420, 'erp:production:issue:list', '查询材料领用', 'button', 4413, NULL, NULL, 1, 1),
(4421, 'erp:production:issue:manage', '维护材料领用', 'button', 4413, NULL, NULL, 2, 1),
(4422, 'erp:production:addition:list', '查询生产补料', 'button', 4414, NULL, NULL, 1, 1),
(4423, 'erp:production:addition:manage', '维护生产补料', 'button', 4414, NULL, NULL, 2, 1),
(4424, 'erp:production:receipt:list', '查询完工入库', 'button', 4415, NULL, NULL, 1, 1),
(4425, 'erp:production:receipt:manage', '维护完工入库', 'button', 4415, NULL, NULL, 2, 1);

-- ========== 角色授权 ==========

-- 管理员（2001）：授予 ERP 生产管理全部权限（1 分组 + 5 菜单 + 10 按钮）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(13200, 2001, 4410),
(13201, 2001, 4411), (13202, 2001, 4412), (13203, 2001, 4413), (13204, 2001, 4414),
(13205, 2001, 4415),
(13206, 2001, 4416), (13207, 2001, 4417), (13208, 2001, 4418), (13209, 2001, 4419),
(13210, 2001, 4420), (13211, 2001, 4421), (13212, 2001, 4422), (13213, 2001, 4423),
(13214, 2001, 4424), (13215, 2001, 4425);

-- 研发工程师（2002）：授予分组与菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(13216, 2002, 4410),
(13217, 2002, 4411), (13218, 2002, 4412), (13219, 2002, 4413), (13220, 2002, 4414),
(13221, 2002, 4415),
(13222, 2002, 4416), (13223, 2002, 4418), (13224, 2002, 4420), (13225, 2002, 4422),
(13226, 2002, 4424);

-- 质量工程师（2003）：授予分组与菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(13227, 2003, 4410),
(13228, 2003, 4411), (13229, 2003, 4412), (13230, 2003, 4413), (13231, 2003, 4414),
(13232, 2003, 4415),
(13233, 2003, 4416), (13234, 2003, 4418), (13235, 2003, 4420), (13236, 2003, 4422),
(13237, 2003, 4424);

-- 生产现场（2005）：授予分组与菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(13238, 2005, 4410),
(13239, 2005, 4411), (13240, 2005, 4412), (13241, 2005, 4413), (13242, 2005, 4414),
(13243, 2005, 4415),
(13244, 2005, 4416), (13245, 2005, 4418), (13246, 2005, 4420), (13247, 2005, 4422),
(13248, 2005, 4424);

-- 只读用户（2006）：授予分组与菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(13249, 2006, 4410),
(13250, 2006, 4411), (13251, 2006, 4412), (13252, 2006, 4413), (13253, 2006, 4414),
(13254, 2006, 4415),
(13255, 2006, 4416), (13256, 2006, 4418), (13257, 2006, 4420), (13258, 2006, 4422),
(13259, 2006, 4424);

-- 供应链专员（2004）：授予全部查询与维护按钮（10 项，不含分组与菜单）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(13260, 2004, 4416), (13261, 2004, 4417), (13262, 2004, 4418), (13263, 2004, 4419),
(13264, 2004, 4420), (13265, 2004, 4421), (13266, 2004, 4422), (13267, 2004, 4423),
(13268, 2004, 4424), (13269, 2004, 4425);

-- ========== ERP 生产管理字典（7840-7878） ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(7840, 'erp_production_order_type', '标准生产', 'STANDARD', 1, 1, NULL),
(7841, 'erp_production_order_type', '返工', 'REWORK', 2, 1, NULL),
(7842, 'erp_production_order_type', '试制', 'TRIAL', 3, 1, NULL),
(7843, 'erp_production_order_status', '草稿', 'DRAFT', 1, 1, NULL),
(7844, 'erp_production_order_status', '已下达', 'RELEASED', 2, 1, NULL),
(7845, 'erp_production_order_status', '生产中', 'IN_PROGRESS', 3, 1, NULL),
(7846, 'erp_production_order_status', '部分完工', 'PARTIAL_COMPLETED', 4, 1, NULL),
(7847, 'erp_production_order_status', '已完工', 'COMPLETED', 5, 1, NULL),
(7848, 'erp_production_order_status', '已关闭', 'CLOSED', 6, 1, NULL),
(7849, 'erp_production_order_status', '已取消', 'CANCELLED', 7, 1, NULL),
(7850, 'erp_production_line_status', '未领料', 'OPEN', 1, 1, NULL),
(7851, 'erp_production_line_status', '已领料', 'ISSUED', 2, 1, NULL),
(7852, 'erp_production_line_status', '已关闭', 'CLOSED', 3, 1, NULL),
(7853, 'erp_production_line_status', '已取消', 'CANCELLED', 4, 1, NULL),
(7854, 'erp_production_split_type', '按数量拆分', 'QTY', 1, 1, NULL),
(7855, 'erp_production_split_type', '按批次拆分', 'BATCH', 2, 1, NULL),
(7856, 'erp_production_split_status', '草稿', 'DRAFT', 1, 1, NULL),
(7857, 'erp_production_split_status', '已确认', 'CONFIRMED', 2, 1, NULL),
(7858, 'erp_production_split_status', '已取消', 'CANCELLED', 3, 1, NULL),
(7859, 'erp_material_issue_status', '草稿', 'DRAFT', 1, 1, NULL),
(7860, 'erp_material_issue_status', '已确认', 'CONFIRMED', 2, 1, NULL),
(7861, 'erp_material_issue_status', '已过账', 'POSTED', 3, 1, NULL),
(7862, 'erp_material_issue_status', '已取消', 'CANCELLED', 4, 1, NULL),
(7863, 'erp_material_issue_line_status', '未发料', 'OPEN', 1, 1, NULL),
(7864, 'erp_material_issue_line_status', '已发料', 'ISSUED', 2, 1, NULL),
(7865, 'erp_material_issue_line_status', '已取消', 'CANCELLED', 3, 1, NULL),
(7866, 'erp_material_addition_type', '正常补料', 'NORMAL', 1, 1, NULL),
(7867, 'erp_material_addition_type', '超领补料', 'OVER_ISSUE', 2, 1, NULL),
(7868, 'erp_material_addition_type', '报废补料', 'SCRAP', 3, 1, NULL),
(7869, 'erp_material_addition_status', '草稿', 'DRAFT', 1, 1, NULL),
(7870, 'erp_material_addition_status', '已提交', 'SUBMITTED', 2, 1, NULL),
(7871, 'erp_material_addition_status', '已批准', 'APPROVED', 3, 1, NULL),
(7872, 'erp_material_addition_status', '已驳回', 'REJECTED', 4, 1, NULL),
(7873, 'erp_material_addition_status', '已过账', 'POSTED', 5, 1, NULL),
(7874, 'erp_material_addition_status', '已取消', 'CANCELLED', 6, 1, NULL),
(7875, 'erp_completion_receipt_status', '草稿', 'DRAFT', 1, 1, NULL),
(7876, 'erp_completion_receipt_status', '已确认', 'CONFIRMED', 2, 1, NULL),
(7877, 'erp_completion_receipt_status', '已入库', 'POSTED', 3, 1, NULL),
(7878, 'erp_completion_receipt_status', '已取消', 'CANCELLED', 4, 1, NULL);

-- ========== ERP 生产管理可配置项（6230-6237） ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(6230, 'ERP', 'erp.production.enabled', '生产管理启用开关', 'true', 0, 1, 'ERP 生产管理总开关，默认启用'),
(6231, 'ERP', 'erp.production.over.issue.tolerance.rate', '超领容差(%)', '5', 1, 1, '待业务方确认：材料超领允许的容差百分比，超出需走审批'),
(6232, 'ERP', 'erp.production.over.issue.approval.required', '超领需审批', 'true', 1, 1, '待业务方确认：超领补料是否必须经审批后方可发料'),
(6233, 'ERP', 'erp.production.split.enabled', '生产订单拆分启用', 'true', 0, 1, '是否允许对生产订单执行拆分'),
(6234, 'ERP', 'erp.production.completion.inspection.required', '完工入库需报检', 'true', 1, 1, '待业务方确认：完工入库是否默认需要报检'),
(6235, 'ERP', 'erp.production.issue.warehouse.default', '领料默认仓库', 'WH01', 1, 1, '待业务方确认：材料领用未指定仓库时采用的默认仓库编码'),
(6236, 'ERP', 'erp.production.scrap.rate.default', '默认报废率(%)', '1', 1, 1, '待业务方确认：生产订单用料计算采用的默认报废率'),
(6237, 'ERP', 'erp.production.bom.include.substitute', 'BOM含替代料', 'false', 1, 1, '待业务方确认：子件展开是否包含替代料');
