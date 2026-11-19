-- G9-N3 数据迁移—库存迁移（WBS T078）初始化：菜单/按钮权限、角色授权、字典与可配置项。
-- 号段基线（V163 之后实测）：sys_permission=5267（本脚本从 5268 起）、
-- sys_role_permission=16879（从 16880 起）、sys_dictionary=9613（从 9614 起）、sys_config=6963（从 6964 起）。
-- 菜单说明：G9「数据迁移」顶级菜单域（5229，V163 建立）复用，本节点新增二级方向分组
--          库存迁移（5268），覆盖集成接口、字段映射、同步批次、接收回执、异常补偿、对账。

-- ========== 库存迁移方向分组（5268，挂在 5229 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(5268, 'mig:inventory', '库存迁移', 'menu', 5229, '/mig/inventory', 'SwapOutlined', 3, 1);

-- ========== 库存迁移业务菜单（5269-5274，挂在 5268 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(5269, 'mig:inventory:interface', '集成接口', 'menu', 5268, '/mig/inventory/interfaces', 'ApiOutlined', 1, 1),
(5270, 'mig:inventory:mapping', '字段映射', 'menu', 5268, '/mig/inventory/mappings', 'PartitionOutlined', 2, 1),
(5271, 'mig:inventory:batch', '同步批次', 'menu', 5268, '/mig/inventory/batches', 'SyncOutlined', 3, 1),
(5272, 'mig:inventory:receipt', '接收回执', 'menu', 5268, '/mig/inventory/receipts', 'AuditOutlined', 4, 1),
(5273, 'mig:inventory:compensation', '异常补偿', 'menu', 5268, '/mig/inventory/compensations', 'ToolOutlined', 5, 1),
(5274, 'mig:inventory:reconcile', '对账', 'menu', 5268, '/mig/inventory/reconciles', 'BalanceOutlined', 6, 1);

-- ========== 库存迁移按钮（5275-5286） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(5275, 'mig:inventory:interface:list', '查询集成接口', 'button', 5269, NULL, NULL, 1, 1),
(5276, 'mig:inventory:interface:manage', '维护集成接口', 'button', 5269, NULL, NULL, 2, 1),
(5277, 'mig:inventory:mapping:list', '查询字段映射', 'button', 5270, NULL, NULL, 1, 1),
(5278, 'mig:inventory:mapping:manage', '维护字段映射', 'button', 5270, NULL, NULL, 2, 1),
(5279, 'mig:inventory:batch:list', '查询同步批次', 'button', 5271, NULL, NULL, 1, 1),
(5280, 'mig:inventory:batch:manage', '维护同步批次', 'button', 5271, NULL, NULL, 2, 1),
(5281, 'mig:inventory:receipt:list', '查询接收回执', 'button', 5272, NULL, NULL, 1, 1),
(5282, 'mig:inventory:receipt:manage', '维护接收回执', 'button', 5272, NULL, NULL, 2, 1),
(5283, 'mig:inventory:compensation:list', '查询异常补偿', 'button', 5273, NULL, NULL, 1, 1),
(5284, 'mig:inventory:compensation:manage', '维护异常补偿', 'button', 5273, NULL, NULL, 2, 1),
(5285, 'mig:inventory:reconcile:list', '查询对账', 'button', 5274, NULL, NULL, 1, 1),
(5286, 'mig:inventory:reconcile:manage', '维护对账', 'button', 5274, NULL, NULL, 2, 1);

-- ========== 角色授权（16880-16969） ==========

-- 系统管理员（2001）：授予全部权限（19 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(16880, 2001, 5268), (16881, 2001, 5269), (16882, 2001, 5270), (16883, 2001, 5271),
(16884, 2001, 5272), (16885, 2001, 5273), (16886, 2001, 5274), (16887, 2001, 5275),
(16888, 2001, 5276), (16889, 2001, 5277), (16890, 2001, 5278), (16891, 2001, 5279),
(16892, 2001, 5280), (16893, 2001, 5281), (16894, 2001, 5282), (16895, 2001, 5283),
(16896, 2001, 5284), (16897, 2001, 5285), (16898, 2001, 5286);

-- 供应链专员（2004）：授予全部权限（库存迁移主责角色，共 19 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(16899, 2004, 5268), (16900, 2004, 5269), (16901, 2004, 5270), (16902, 2004, 5271),
(16903, 2004, 5272), (16904, 2004, 5273), (16905, 2004, 5274), (16906, 2004, 5275),
(16907, 2004, 5276), (16908, 2004, 5277), (16909, 2004, 5278), (16910, 2004, 5279),
(16911, 2004, 5280), (16912, 2004, 5281), (16913, 2004, 5282), (16914, 2004, 5283),
(16915, 2004, 5284), (16916, 2004, 5285), (16917, 2004, 5286);

-- 质量工程师（2003）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(16918, 2003, 5268), (16919, 2003, 5269), (16920, 2003, 5270), (16921, 2003, 5271),
(16922, 2003, 5272), (16923, 2003, 5273), (16924, 2003, 5274), (16925, 2003, 5275),
(16926, 2003, 5277), (16927, 2003, 5279), (16928, 2003, 5281), (16929, 2003, 5283),
(16930, 2003, 5285);

-- 生产现场（2005）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(16931, 2005, 5268), (16932, 2005, 5269), (16933, 2005, 5270), (16934, 2005, 5271),
(16935, 2005, 5272), (16936, 2005, 5273), (16937, 2005, 5274), (16938, 2005, 5275),
(16939, 2005, 5277), (16940, 2005, 5279), (16941, 2005, 5281), (16942, 2005, 5283),
(16943, 2005, 5285);

-- 研发工程师（2002）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(16944, 2002, 5268), (16945, 2002, 5269), (16946, 2002, 5270), (16947, 2002, 5271),
(16948, 2002, 5272), (16949, 2002, 5273), (16950, 2002, 5274), (16951, 2002, 5275),
(16952, 2002, 5277), (16953, 2002, 5279), (16954, 2002, 5281), (16955, 2002, 5283),
(16956, 2002, 5285);

-- 只读用户（2006）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(16957, 2006, 5268), (16958, 2006, 5269), (16959, 2006, 5270), (16960, 2006, 5271),
(16961, 2006, 5272), (16962, 2006, 5273), (16963, 2006, 5274), (16964, 2006, 5275),
(16965, 2006, 5277), (16966, 2006, 5279), (16967, 2006, 5281), (16968, 2006, 5283),
(16969, 2006, 5285);


-- ========== 库存迁移集成字典（9614-9654） ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(9614, 'mig_inventory_object_type', '库存', 'STOCK', 1, 1, NULL),
(9615, 'mig_inventory_object_type', '批次库存', 'STOCK_BATCH', 2, 1, NULL),
(9616, 'mig_inventory_object_type', '库位库存', 'STOCK_LOCATION', 3, 1, NULL),
(9617, 'mig_inventory_object_type', '冻结库存', 'STOCK_FREEZE', 4, 1, NULL),
(9618, 'mig_inventory_object_type', '盘点单', 'STOCKTAKE', 5, 1, NULL),
(9619, 'mig_inventory_protocol', 'API 接口', 'API', 1, 1, NULL),
(9620, 'mig_inventory_protocol', '事件消息', 'EVENT', 2, 1, NULL),
(9621, 'mig_inventory_protocol', '批量文件', 'FILE', 3, 1, NULL),
(9622, 'mig_inventory_trigger_type', '手工触发', 'MANUAL', 1, 1, NULL),
(9623, 'mig_inventory_trigger_type', '定时触发', 'SCHEDULED', 2, 1, NULL),
(9624, 'mig_inventory_trigger_type', '事件触发', 'EVENT', 3, 1, NULL),
(9625, 'mig_inventory_sync_mode', '全量', 'FULL', 1, 1, NULL),
(9626, 'mig_inventory_sync_mode', '增量', 'INCREMENTAL', 2, 1, NULL),
(9627, 'mig_inventory_interface_status', '草稿', 'DRAFT', 1, 1, NULL),
(9628, 'mig_inventory_interface_status', '启用', 'ACTIVE', 2, 1, NULL),
(9629, 'mig_inventory_interface_status', '停用', 'DISABLED', 3, 1, NULL),
(9630, 'mig_inventory_mapping_status', '草稿', 'DRAFT', 1, 1, NULL),
(9631, 'mig_inventory_mapping_status', '启用', 'ACTIVE', 2, 1, NULL),
(9632, 'mig_inventory_mapping_status', '停用', 'DISABLED', 3, 1, NULL),
(9633, 'mig_inventory_batch_status', '待执行', 'PENDING', 1, 1, NULL),
(9634, 'mig_inventory_batch_status', '执行中', 'RUNNING', 2, 1, NULL),
(9635, 'mig_inventory_batch_status', '成功', 'SUCCESS', 3, 1, NULL),
(9636, 'mig_inventory_batch_status', '部分成功', 'PARTIAL', 4, 1, NULL),
(9637, 'mig_inventory_batch_status', '失败', 'FAILED', 5, 1, NULL),
(9638, 'mig_inventory_receipt_status', '待回执', 'PENDING', 1, 1, NULL),
(9639, 'mig_inventory_receipt_status', '已接收', 'ACCEPTED', 2, 1, NULL),
(9640, 'mig_inventory_receipt_status', '已拒绝', 'REJECTED', 3, 1, NULL),
(9641, 'mig_inventory_receipt_status', '警告', 'WARN', 4, 1, NULL),
(9642, 'mig_inventory_error_type', '校验失败', 'VALIDATION', 1, 1, NULL),
(9643, 'mig_inventory_error_type', '超时', 'TIMEOUT', 2, 1, NULL),
(9644, 'mig_inventory_error_type', '数据冲突', 'CONFLICT', 3, 1, NULL),
(9645, 'mig_inventory_error_type', '网络异常', 'NETWORK', 4, 1, NULL),
(9646, 'mig_inventory_error_type', '其他', 'OTHER', 5, 1, NULL),
(9647, 'mig_inventory_compensation_status', '待处理', 'PENDING', 1, 1, NULL),
(9648, 'mig_inventory_compensation_status', '处理中', 'PROCESSING', 2, 1, NULL),
(9649, 'mig_inventory_compensation_status', '已解决', 'RESOLVED', 3, 1, NULL),
(9650, 'mig_inventory_compensation_status', '已忽略', 'IGNORED', 4, 1, NULL),
(9651, 'mig_inventory_reconcile_status', '待对账', 'PENDING', 1, 1, NULL),
(9652, 'mig_inventory_reconcile_status', '已平账', 'BALANCED', 2, 1, NULL),
(9653, 'mig_inventory_reconcile_status', '存在差异', 'DIFF', 3, 1, NULL),
(9654, 'mig_inventory_reconcile_status', '已关闭', 'CLOSED', 4, 1, NULL);

-- ========== 库存迁移集成可配置项（6964-6976） ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(6964, 'MIG', 'mig.inventory.enabled', '库存迁移启用开关', 'true', 0, 1, '库存迁移总开关，默认启用'),
(6965, 'MIG', 'mig.inventory.batch.size', '迁移批次单批条数', '200', 1, 1, '单批迁移条数，待业务方确认数据规模后调整'),
(6966, 'MIG', 'mig.inventory.retry.times', '失败重试次数', '3', 1, 1, '库存迁移重试次数，待业务方确认'),
(6967, 'MIG', 'mig.inventory.timeout.ms', '接口超时时间（毫秒）', '30000', 1, 1, '接口调用超时时间，待业务方确认'),
(6968, 'MIG', 'mig.inventory.idempotent.window.hours', '幂等窗口（小时）', '24', 1, 1, '幂等判重时间窗口，待业务方确认'),
(6969, 'MIG', 'mig.inventory.receipt.auto', '系统回执自动生成', 'true', 0, 1, '系统校验通过后自动生成回执'),
(6970, 'MIG', 'mig.inventory.reconcile.cron', '对账任务计划表达式', '0 0 2 * * ?', 1, 1, '每日对账任务 Cron，待业务方确认对账频率'),
(6971, 'MIG', 'mig.inventory.interface.no.prefix', '集成接口编号前缀', 'IMI', 0, 1, '集成接口编号自动生成前缀'),
(6972, 'MIG', 'mig.inventory.mapping.no.prefix', '字段映射编号前缀', 'IMM', 0, 1, '字段映射编号自动生成前缀'),
(6973, 'MIG', 'mig.inventory.batch.no.prefix', '同步批次编号前缀', 'IMB', 0, 1, '同步批次编号自动生成前缀'),
(6974, 'MIG', 'mig.inventory.receipt.no.prefix', '接收回执编号前缀', 'IMR', 0, 1, '接收回执编号自动生成前缀'),
(6975, 'MIG', 'mig.inventory.compensation.no.prefix', '异常补偿编号前缀', 'IMC', 0, 1, '异常补偿编号自动生成前缀'),
(6976, 'MIG', 'mig.inventory.reconcile.no.prefix', '对账编号前缀', 'IMO', 0, 1, '对账编号自动生成前缀');
