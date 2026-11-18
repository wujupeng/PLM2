-- G3-N5 ERP—库存核算（WBS T027 库存核算 / T097 库存业务）初始化：菜单/按钮权限、角色授权、字典与可配置项。
-- 号段基线（V81 之后已占用的最大值）：sys_permission=4425（本脚本从 4430 起）、
-- sys_role_permission=13269（从 13280 起）、sys_dictionary=7878（从 7890 起）、sys_config=6237（从 6250 起）。
-- 菜单说明：库存核算为 ERP 顶级菜单（4260）下的二级分组（4430），其下挂 8 个库存业务页面；
--           物料/仓库/库位/批次复用既有基础资料与平台底座，不在此重复定义。

-- ========== ERP 库存核算分组菜单（4430，挂在 ERP 顶级菜单 4260 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4430, 'erp:inventory', '库存核算', 'menu', 4260, '/erp/inventory', 'DatabaseOutlined', 25, 1);

-- ========== ERP 库存核算业务菜单（4431-4438，挂在库存核算 4430 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4431, 'erp:inventory:balance', '库存余额', 'menu', 4430, '/erp/inventory/balances', 'NumberOutlined', 1, 1),
(4432, 'erp:inventory:transaction', '库存流水', 'menu', 4430, '/erp/inventory/transactions', 'SwapOutlined', 2, 1),
(4433, 'erp:inventory:transfer', '库存调拨', 'menu', 4430, '/erp/inventory/transfers', 'NodeExpandOutlined', 3, 1),
(4434, 'erp:inventory:count', '库存盘点', 'menu', 4430, '/erp/inventory/counts', 'AuditOutlined', 4, 1),
(4435, 'erp:inventory:conversion', '形态转换', 'menu', 4430, '/erp/inventory/conversions', 'RetweetOutlined', 5, 1),
(4436, 'erp:inventory:scrap', '报废管理', 'menu', 4430, '/erp/inventory/scraps', 'DeleteOutlined', 6, 1),
(4437, 'erp:inventory:freeze', '库存冻结', 'menu', 4430, '/erp/inventory/freezes', 'LockOutlined', 7, 1),
(4438, 'erp:inventory:cost', '库存成本', 'menu', 4430, '/erp/inventory/costs', 'MoneyCollectOutlined', 8, 1);

-- ========== ERP 库存核算按钮（4439-4454） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4439, 'erp:inventory:balance:list', '查询库存余额', 'button', 4431, NULL, NULL, 1, 1),
(4440, 'erp:inventory:balance:manage', '维护库存余额', 'button', 4431, NULL, NULL, 2, 1),
(4441, 'erp:inventory:transaction:list', '查询库存流水', 'button', 4432, NULL, NULL, 1, 1),
(4442, 'erp:inventory:transaction:manage', '维护库存流水', 'button', 4432, NULL, NULL, 2, 1),
(4443, 'erp:inventory:transfer:list', '查询库存调拨', 'button', 4433, NULL, NULL, 1, 1),
(4444, 'erp:inventory:transfer:manage', '维护库存调拨', 'button', 4433, NULL, NULL, 2, 1),
(4445, 'erp:inventory:count:list', '查询库存盘点', 'button', 4434, NULL, NULL, 1, 1),
(4446, 'erp:inventory:count:manage', '维护库存盘点', 'button', 4434, NULL, NULL, 2, 1),
(4447, 'erp:inventory:conversion:list', '查询形态转换', 'button', 4435, NULL, NULL, 1, 1),
(4448, 'erp:inventory:conversion:manage', '维护形态转换', 'button', 4435, NULL, NULL, 2, 1),
(4449, 'erp:inventory:scrap:list', '查询报废管理', 'button', 4436, NULL, NULL, 1, 1),
(4450, 'erp:inventory:scrap:manage', '维护报废管理', 'button', 4436, NULL, NULL, 2, 1),
(4451, 'erp:inventory:freeze:list', '查询库存冻结', 'button', 4437, NULL, NULL, 1, 1),
(4452, 'erp:inventory:freeze:manage', '维护库存冻结', 'button', 4437, NULL, NULL, 2, 1),
(4453, 'erp:inventory:cost:list', '查询库存成本', 'button', 4438, NULL, NULL, 1, 1),
(4454, 'erp:inventory:cost:manage', '维护库存成本', 'button', 4438, NULL, NULL, 2, 1);

-- ========== 角色授权 ==========

-- 管理员（2001）：授予 ERP 库存核算全部权限（1 分组 + 8 菜单 + 16 按钮）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(13280, 2001, 4430),
(13281, 2001, 4431), (13282, 2001, 4432), (13283, 2001, 4433), (13284, 2001, 4434),
(13285, 2001, 4435), (13286, 2001, 4436), (13287, 2001, 4437), (13288, 2001, 4438),
(13289, 2001, 4439), (13290, 2001, 4440), (13291, 2001, 4441), (13292, 2001, 4442),
(13293, 2001, 4443), (13294, 2001, 4444), (13295, 2001, 4445), (13296, 2001, 4446),
(13297, 2001, 4447), (13298, 2001, 4448), (13299, 2001, 4449), (13300, 2001, 4450),
(13301, 2001, 4451), (13302, 2001, 4452), (13303, 2001, 4453), (13304, 2001, 4454);

-- 研发工程师（2002）：授予分组与菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(13305, 2002, 4430),
(13306, 2002, 4431), (13307, 2002, 4432), (13308, 2002, 4433), (13309, 2002, 4434),
(13310, 2002, 4435), (13311, 2002, 4436), (13312, 2002, 4437), (13313, 2002, 4438),
(13314, 2002, 4439), (13315, 2002, 4441), (13316, 2002, 4443), (13317, 2002, 4445),
(13318, 2002, 4447), (13319, 2002, 4449), (13320, 2002, 4451), (13321, 2002, 4453);

-- 质量工程师（2003）：授予分组与菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(13322, 2003, 4430),
(13323, 2003, 4431), (13324, 2003, 4432), (13325, 2003, 4433), (13326, 2003, 4434),
(13327, 2003, 4435), (13328, 2003, 4436), (13329, 2003, 4437), (13330, 2003, 4438),
(13331, 2003, 4439), (13332, 2003, 4441), (13333, 2003, 4443), (13334, 2003, 4445),
(13335, 2003, 4447), (13336, 2003, 4449), (13337, 2003, 4451), (13338, 2003, 4453);

-- 生产现场（2005）：授予分组与菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(13339, 2005, 4430),
(13340, 2005, 4431), (13341, 2005, 4432), (13342, 2005, 4433), (13343, 2005, 4434),
(13344, 2005, 4435), (13345, 2005, 4436), (13346, 2005, 4437), (13347, 2005, 4438),
(13348, 2005, 4439), (13349, 2005, 4441), (13350, 2005, 4443), (13351, 2005, 4445),
(13352, 2005, 4447), (13353, 2005, 4449), (13354, 2005, 4451), (13355, 2005, 4453);

-- 只读用户（2006）：授予分组与菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(13356, 2006, 4430),
(13357, 2006, 4431), (13358, 2006, 4432), (13359, 2006, 4433), (13360, 2006, 4434),
(13361, 2006, 4435), (13362, 2006, 4436), (13363, 2006, 4437), (13364, 2006, 4438),
(13365, 2006, 4439), (13366, 2006, 4441), (13367, 2006, 4443), (13368, 2006, 4445),
(13369, 2006, 4447), (13370, 2006, 4449), (13371, 2006, 4451), (13372, 2006, 4453);

-- 供应链专员（2004）：授予全部查询与维护按钮（16 项，不含分组与菜单）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(13373, 2004, 4439), (13374, 2004, 4440), (13375, 2004, 4441), (13376, 2004, 4442),
(13377, 2004, 4443), (13378, 2004, 4444), (13379, 2004, 4445), (13380, 2004, 4446),
(13381, 2004, 4447), (13382, 2004, 4448), (13383, 2004, 4449), (13384, 2004, 4450),
(13385, 2004, 4451), (13386, 2004, 4452), (13387, 2004, 4453), (13388, 2004, 4454);

-- ========== ERP 库存核算字典（7890-7952） ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(7890, 'erp_inventory_transaction_type', '入库', 'IN', 1, 1, NULL),
(7891, 'erp_inventory_transaction_type', '出库', 'OUT', 2, 1, NULL),
(7892, 'erp_inventory_transaction_type', '调拨', 'TRANSFER', 3, 1, NULL),
(7893, 'erp_inventory_transaction_type', '调整', 'ADJUST', 4, 1, NULL),
(7894, 'erp_inventory_transaction_type', '报废', 'SCRAP', 5, 1, NULL),
(7895, 'erp_inventory_transaction_type', '形态转换', 'CONVERT', 6, 1, NULL),
(7896, 'erp_inventory_biz_type', '采购入库', 'PURCHASE_IN', 1, 1, NULL),
(7897, 'erp_inventory_biz_type', '委外入库', 'OUTSOURCE_IN', 2, 1, NULL),
(7898, 'erp_inventory_biz_type', '产成品入库', 'COMPLETION_IN', 3, 1, NULL),
(7899, 'erp_inventory_biz_type', '材料出库', 'MATERIAL_ISSUE', 4, 1, NULL),
(7900, 'erp_inventory_biz_type', '委外出库', 'OUTSOURCE_ISSUE', 5, 1, NULL),
(7901, 'erp_inventory_biz_type', '销售出库', 'SALES_OUT', 6, 1, NULL),
(7902, 'erp_inventory_biz_type', '调拨', 'TRANSFER', 7, 1, NULL),
(7903, 'erp_inventory_biz_type', '盘点', 'COUNT', 8, 1, NULL),
(7904, 'erp_inventory_biz_type', '报废', 'SCRAP', 9, 1, NULL),
(7905, 'erp_inventory_biz_type', '形态转换', 'CONVERT', 10, 1, NULL),
(7906, 'erp_inventory_biz_type', '手工', 'MANUAL', 11, 1, NULL),
(7907, 'erp_inventory_direction', '入', 'IN', 1, 1, NULL),
(7908, 'erp_inventory_direction', '出', 'OUT', 2, 1, NULL),
(7909, 'erp_inventory_transaction_status', '已过账', 'POSTED', 1, 1, NULL),
(7910, 'erp_inventory_transaction_status', '已取消', 'CANCELLED', 2, 1, NULL),
(7911, 'erp_inventory_line_status', '未处理', 'OPEN', 1, 1, NULL),
(7912, 'erp_inventory_line_status', '已确认', 'CONFIRMED', 2, 1, NULL),
(7913, 'erp_inventory_line_status', '已取消', 'CANCELLED', 3, 1, NULL),
(7914, 'erp_inventory_transfer_type', '直接调拨', 'DIRECT', 1, 1, NULL),
(7915, 'erp_inventory_transfer_type', '跨工厂调拨', 'CROSS', 2, 1, NULL),
(7916, 'erp_inventory_transfer_status', '草稿', 'DRAFT', 1, 1, NULL),
(7917, 'erp_inventory_transfer_status', '已确认', 'CONFIRMED', 2, 1, NULL),
(7918, 'erp_inventory_transfer_status', '已过账', 'POSTED', 3, 1, NULL),
(7919, 'erp_inventory_transfer_status', '已取消', 'CANCELLED', 4, 1, NULL),
(7920, 'erp_inventory_count_type', '全盘', 'FULL', 1, 1, NULL),
(7921, 'erp_inventory_count_type', '循环盘点', 'CYCLE', 2, 1, NULL),
(7922, 'erp_inventory_count_type', '抽盘', 'SPOT', 3, 1, NULL),
(7923, 'erp_inventory_count_status', '草稿', 'DRAFT', 1, 1, NULL),
(7924, 'erp_inventory_count_status', '盘点中', 'COUNTING', 2, 1, NULL),
(7925, 'erp_inventory_count_status', '已确认', 'CONFIRMED', 3, 1, NULL),
(7926, 'erp_inventory_count_status', '已过账', 'POSTED', 4, 1, NULL),
(7927, 'erp_inventory_count_status', '已取消', 'CANCELLED', 5, 1, NULL),
(7928, 'erp_inventory_conversion_type', '拆分', 'SPLIT', 1, 1, NULL),
(7929, 'erp_inventory_conversion_type', '合并', 'MERGE', 2, 1, NULL),
(7930, 'erp_inventory_conversion_type', '换包', 'REPACK', 3, 1, NULL),
(7931, 'erp_inventory_conversion_status', '草稿', 'DRAFT', 1, 1, NULL),
(7932, 'erp_inventory_conversion_status', '已确认', 'CONFIRMED', 2, 1, NULL),
(7933, 'erp_inventory_conversion_status', '已过账', 'POSTED', 3, 1, NULL),
(7934, 'erp_inventory_conversion_status', '已取消', 'CANCELLED', 4, 1, NULL),
(7935, 'erp_inventory_scrap_type', '正常报废', 'NORMAL', 1, 1, NULL),
(7936, 'erp_inventory_scrap_type', '过期报废', 'EXPIRED', 2, 1, NULL),
(7937, 'erp_inventory_scrap_type', '损坏报废', 'DAMAGED', 3, 1, NULL),
(7938, 'erp_inventory_scrap_type', '质量报废', 'QUALITY', 4, 1, NULL),
(7939, 'erp_inventory_scrap_status', '草稿', 'DRAFT', 1, 1, NULL),
(7940, 'erp_inventory_scrap_status', '已确认', 'CONFIRMED', 2, 1, NULL),
(7941, 'erp_inventory_scrap_status', '已过账', 'POSTED', 3, 1, NULL),
(7942, 'erp_inventory_scrap_status', '已取消', 'CANCELLED', 4, 1, NULL),
(7943, 'erp_inventory_freeze_type', '手工冻结', 'MANUAL', 1, 1, NULL),
(7944, 'erp_inventory_freeze_type', '质量冻结', 'QUALITY', 2, 1, NULL),
(7945, 'erp_inventory_freeze_type', '法务冻结', 'LEGAL', 3, 1, NULL),
(7946, 'erp_inventory_freeze_status', '已冻结', 'FROZEN', 1, 1, NULL),
(7947, 'erp_inventory_freeze_status', '已解冻', 'RELEASED', 2, 1, NULL),
(7948, 'erp_inventory_cost_method', '移动平均', 'MOVING_AVG', 1, 1, NULL),
(7949, 'erp_inventory_cost_method', '先进先出', 'FIFO', 2, 1, NULL),
(7950, 'erp_inventory_cost_method', '标准成本', 'STANDARD', 3, 1, NULL),
(7951, 'erp_inventory_cost_status', '草稿', 'DRAFT', 1, 1, NULL),
(7952, 'erp_inventory_cost_status', '已完成', 'COMPLETED', 2, 1, NULL);

-- ========== ERP 库存核算可配置项（6250-6259） ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(6250, 'ERP', 'erp.inventory.enabled', '库存核算启用开关', 'true', 0, 1, 'ERP 库存核算总开关，默认启用'),
(6251, 'ERP', 'erp.inventory.cost.method.default', '默认成本核算方式', 'MOVING_AVG', 1, 1, '待业务方确认：库存成本默认核算方式（移动平均/先进先出/标准成本）'),
(6252, 'ERP', 'erp.inventory.allow.negative.stock', '允许负库存', 'false', 1, 1, '待业务方确认：是否允许库存出现负结存'),
(6253, 'ERP', 'erp.inventory.batch.required', '批次必填', 'true', 1, 1, '待业务方确认：库存业务是否必须指定批次'),
(6254, 'ERP', 'erp.inventory.location.required', '库位必填', 'true', 1, 1, '待业务方确认：库存业务是否必须指定库位'),
(6255, 'ERP', 'erp.inventory.transfer.approval.required', '调拨需审批', 'true', 1, 1, '待业务方确认：库存调拨是否必须经审批后方可过账'),
(6256, 'ERP', 'erp.inventory.count.diff.tolerance.rate', '盘点差异容差(%)', '5', 1, 1, '待业务方确认：盘点差异允许的容差百分比，超出需走审批'),
(6257, 'ERP', 'erp.inventory.scrap.approval.required', '报废需审批', 'true', 1, 1, '待业务方确认：库存报废是否必须经审批后方可过账'),
(6258, 'ERP', 'erp.inventory.freeze.unfreeze.approval.required', '解冻需审批', 'true', 1, 1, '待业务方确认：库存解冻是否必须经审批'),
(6259, 'ERP', 'erp.inventory.cost.recalc.frequency', '成本重算频率', 'MONTHLY', 1, 1, '待业务方确认：库存成本重算频率（DAILY/WEEKLY/MONTHLY）');
