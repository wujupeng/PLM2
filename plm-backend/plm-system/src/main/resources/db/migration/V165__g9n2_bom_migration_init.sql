-- G9-N2 数据迁移—BOM迁移（WBS T077）初始化：菜单/按钮权限、角色授权、字典与可配置项。
-- 号段基线（V163 之后实测）：sys_permission=5248（本脚本从 5249 起）、
-- sys_role_permission=16789（从 16790 起）、sys_dictionary=9572（从 9573 起）、sys_config=6950（从 6951 起）。
-- 菜单说明：G9「数据迁移」顶级菜单域（5229，V163 建立）复用，本节点新增二级方向分组
--          BOM迁移（5249），覆盖集成接口、字段映射、同步批次、接收回执、异常补偿、对账。

-- ========== BOM迁移方向分组（5249，挂在 5229 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(5249, 'mig:bom', 'BOM迁移', 'menu', 5229, '/mig/bom', 'SwapOutlined', 2, 1);

-- ========== BOM迁移业务菜单（5250-5255，挂在 5249 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(5250, 'mig:bom:interface', '集成接口', 'menu', 5249, '/mig/bom/interfaces', 'ApiOutlined', 1, 1),
(5251, 'mig:bom:mapping', '字段映射', 'menu', 5249, '/mig/bom/mappings', 'PartitionOutlined', 2, 1),
(5252, 'mig:bom:batch', '同步批次', 'menu', 5249, '/mig/bom/batches', 'SyncOutlined', 3, 1),
(5253, 'mig:bom:receipt', '接收回执', 'menu', 5249, '/mig/bom/receipts', 'AuditOutlined', 4, 1),
(5254, 'mig:bom:compensation', '异常补偿', 'menu', 5249, '/mig/bom/compensations', 'ToolOutlined', 5, 1),
(5255, 'mig:bom:reconcile', '对账', 'menu', 5249, '/mig/bom/reconciles', 'BalanceOutlined', 6, 1);

-- ========== BOM迁移按钮（5256-5267） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(5256, 'mig:bom:interface:list', '查询集成接口', 'button', 5250, NULL, NULL, 1, 1),
(5257, 'mig:bom:interface:manage', '维护集成接口', 'button', 5250, NULL, NULL, 2, 1),
(5258, 'mig:bom:mapping:list', '查询字段映射', 'button', 5251, NULL, NULL, 1, 1),
(5259, 'mig:bom:mapping:manage', '维护字段映射', 'button', 5251, NULL, NULL, 2, 1),
(5260, 'mig:bom:batch:list', '查询同步批次', 'button', 5252, NULL, NULL, 1, 1),
(5261, 'mig:bom:batch:manage', '维护同步批次', 'button', 5252, NULL, NULL, 2, 1),
(5262, 'mig:bom:receipt:list', '查询接收回执', 'button', 5253, NULL, NULL, 1, 1),
(5263, 'mig:bom:receipt:manage', '维护接收回执', 'button', 5253, NULL, NULL, 2, 1),
(5264, 'mig:bom:compensation:list', '查询异常补偿', 'button', 5254, NULL, NULL, 1, 1),
(5265, 'mig:bom:compensation:manage', '维护异常补偿', 'button', 5254, NULL, NULL, 2, 1),
(5266, 'mig:bom:reconcile:list', '查询对账', 'button', 5255, NULL, NULL, 1, 1),
(5267, 'mig:bom:reconcile:manage', '维护对账', 'button', 5255, NULL, NULL, 2, 1);

-- ========== 角色授权（16790-16879） ==========

-- 系统管理员（2001）：授予全部权限（19 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(16790, 2001, 5249), (16791, 2001, 5250), (16792, 2001, 5251), (16793, 2001, 5252),
(16794, 2001, 5253), (16795, 2001, 5254), (16796, 2001, 5255), (16797, 2001, 5256),
(16798, 2001, 5257), (16799, 2001, 5258), (16800, 2001, 5259), (16801, 2001, 5260),
(16802, 2001, 5261), (16803, 2001, 5262), (16804, 2001, 5263), (16805, 2001, 5264),
(16806, 2001, 5265), (16807, 2001, 5266), (16808, 2001, 5267);

-- 研发工程师（2002）：授予全部权限（BOM 迁移主责角色，共 19 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(16809, 2002, 5249), (16810, 2002, 5250), (16811, 2002, 5251), (16812, 2002, 5252),
(16813, 2002, 5253), (16814, 2002, 5254), (16815, 2002, 5255), (16816, 2002, 5256),
(16817, 2002, 5257), (16818, 2002, 5258), (16819, 2002, 5259), (16820, 2002, 5260),
(16821, 2002, 5261), (16822, 2002, 5262), (16823, 2002, 5263), (16824, 2002, 5264),
(16825, 2002, 5265), (16826, 2002, 5266), (16827, 2002, 5267);

-- 质量工程师（2003）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(16828, 2003, 5249), (16829, 2003, 5250), (16830, 2003, 5251), (16831, 2003, 5252),
(16832, 2003, 5253), (16833, 2003, 5254), (16834, 2003, 5255), (16835, 2003, 5256),
(16836, 2003, 5258), (16837, 2003, 5260), (16838, 2003, 5262), (16839, 2003, 5264),
(16840, 2003, 5266);

-- 供应链专员（2004）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(16841, 2004, 5249), (16842, 2004, 5250), (16843, 2004, 5251), (16844, 2004, 5252),
(16845, 2004, 5253), (16846, 2004, 5254), (16847, 2004, 5255), (16848, 2004, 5256),
(16849, 2004, 5258), (16850, 2004, 5260), (16851, 2004, 5262), (16852, 2004, 5264),
(16853, 2004, 5266);

-- 生产现场（2005）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(16854, 2005, 5249), (16855, 2005, 5250), (16856, 2005, 5251), (16857, 2005, 5252),
(16858, 2005, 5253), (16859, 2005, 5254), (16860, 2005, 5255), (16861, 2005, 5256),
(16862, 2005, 5258), (16863, 2005, 5260), (16864, 2005, 5262), (16865, 2005, 5264),
(16866, 2005, 5266);

-- 只读用户（2006）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(16867, 2006, 5249), (16868, 2006, 5250), (16869, 2006, 5251), (16870, 2006, 5252),
(16871, 2006, 5253), (16872, 2006, 5254), (16873, 2006, 5255), (16874, 2006, 5256),
(16875, 2006, 5258), (16876, 2006, 5260), (16877, 2006, 5262), (16878, 2006, 5264),
(16879, 2006, 5266);

-- ========== BOM迁移集成字典（9573-9613） ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(9573, 'mig_bom_object_type', 'BOM 主表', 'BOM_HEADER', 1, 1, NULL),
(9574, 'mig_bom_object_type', 'BOM 行', 'BOM_ITEM', 2, 1, NULL),
(9575, 'mig_bom_object_type', 'BOM 版本', 'BOM_VERSION', 3, 1, NULL),
(9576, 'mig_bom_object_type', '替代料', 'SUBSTITUTE', 4, 1, NULL),
(9577, 'mig_bom_object_type', '虚拟件', 'PHANTOM_BOM', 5, 1, NULL),
(9578, 'mig_bom_protocol', 'API 接口', 'API', 1, 1, NULL),
(9579, 'mig_bom_protocol', '事件消息', 'EVENT', 2, 1, NULL),
(9580, 'mig_bom_protocol', '批量文件', 'FILE', 3, 1, NULL),
(9581, 'mig_bom_trigger_type', '手工触发', 'MANUAL', 1, 1, NULL),
(9582, 'mig_bom_trigger_type', '定时触发', 'SCHEDULED', 2, 1, NULL),
(9583, 'mig_bom_trigger_type', '事件触发', 'EVENT', 3, 1, NULL),
(9584, 'mig_bom_sync_mode', '全量', 'FULL', 1, 1, NULL),
(9585, 'mig_bom_sync_mode', '增量', 'INCREMENTAL', 2, 1, NULL),
(9586, 'mig_bom_interface_status', '草稿', 'DRAFT', 1, 1, NULL),
(9587, 'mig_bom_interface_status', '启用', 'ACTIVE', 2, 1, NULL),
(9588, 'mig_bom_interface_status', '停用', 'DISABLED', 3, 1, NULL),
(9589, 'mig_bom_mapping_status', '草稿', 'DRAFT', 1, 1, NULL),
(9590, 'mig_bom_mapping_status', '启用', 'ACTIVE', 2, 1, NULL),
(9591, 'mig_bom_mapping_status', '停用', 'DISABLED', 3, 1, NULL),
(9592, 'mig_bom_batch_status', '待执行', 'PENDING', 1, 1, NULL),
(9593, 'mig_bom_batch_status', '执行中', 'RUNNING', 2, 1, NULL),
(9594, 'mig_bom_batch_status', '成功', 'SUCCESS', 3, 1, NULL),
(9595, 'mig_bom_batch_status', '部分成功', 'PARTIAL', 4, 1, NULL),
(9596, 'mig_bom_batch_status', '失败', 'FAILED', 5, 1, NULL),
(9597, 'mig_bom_receipt_status', '待回执', 'PENDING', 1, 1, NULL),
(9598, 'mig_bom_receipt_status', '已接收', 'ACCEPTED', 2, 1, NULL),
(9599, 'mig_bom_receipt_status', '已拒绝', 'REJECTED', 3, 1, NULL),
(9600, 'mig_bom_receipt_status', '警告', 'WARN', 4, 1, NULL),
(9601, 'mig_bom_error_type', '校验失败', 'VALIDATION', 1, 1, NULL),
(9602, 'mig_bom_error_type', '超时', 'TIMEOUT', 2, 1, NULL),
(9603, 'mig_bom_error_type', '数据冲突', 'CONFLICT', 3, 1, NULL),
(9604, 'mig_bom_error_type', '网络异常', 'NETWORK', 4, 1, NULL),
(9605, 'mig_bom_error_type', '其他', 'OTHER', 5, 1, NULL),
(9606, 'mig_bom_compensation_status', '待处理', 'PENDING', 1, 1, NULL),
(9607, 'mig_bom_compensation_status', '处理中', 'PROCESSING', 2, 1, NULL),
(9608, 'mig_bom_compensation_status', '已解决', 'RESOLVED', 3, 1, NULL),
(9609, 'mig_bom_compensation_status', '已忽略', 'IGNORED', 4, 1, NULL),
(9610, 'mig_bom_reconcile_status', '待对账', 'PENDING', 1, 1, NULL),
(9611, 'mig_bom_reconcile_status', '已平账', 'BALANCED', 2, 1, NULL),
(9612, 'mig_bom_reconcile_status', '存在差异', 'DIFF', 3, 1, NULL),
(9613, 'mig_bom_reconcile_status', '已关闭', 'CLOSED', 4, 1, NULL);

-- ========== BOM迁移集成可配置项（6951-6963） ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(6951, 'MIG', 'mig.bom.enabled', 'BOM迁移启用开关', 'true', 0, 1, 'BOM迁移总开关，默认启用'),
(6952, 'MIG', 'mig.bom.batch.size', '迁移批次单批条数', '200', 1, 1, '单批迁移条数，待业务方确认数据规模后调整'),
(6953, 'MIG', 'mig.bom.retry.times', '失败重试次数', '3', 1, 1, 'BOM迁移重试次数，待业务方确认'),
(6954, 'MIG', 'mig.bom.timeout.ms', '接口超时时间（毫秒）', '30000', 1, 1, '接口调用超时时间，待业务方确认'),
(6955, 'MIG', 'mig.bom.idempotent.window.hours', '幂等窗口（小时）', '24', 1, 1, '幂等判重时间窗口，待业务方确认'),
(6956, 'MIG', 'mig.bom.receipt.auto', '系统回执自动生成', 'true', 0, 1, '系统校验通过后自动生成回执'),
(6957, 'MIG', 'mig.bom.reconcile.cron', '对账任务计划表达式', '0 0 2 * * ?', 1, 1, '每日对账任务 Cron，待业务方确认对账频率'),
(6958, 'MIG', 'mig.bom.interface.no.prefix', '集成接口编号前缀', 'BMI', 0, 1, '集成接口编号自动生成前缀'),
(6959, 'MIG', 'mig.bom.mapping.no.prefix', '字段映射编号前缀', 'BMM', 0, 1, '字段映射编号自动生成前缀'),
(6960, 'MIG', 'mig.bom.batch.no.prefix', '同步批次编号前缀', 'BMB', 0, 1, '同步批次编号自动生成前缀'),
(6961, 'MIG', 'mig.bom.receipt.no.prefix', '接收回执编号前缀', 'BMR', 0, 1, '接收回执编号自动生成前缀'),
(6962, 'MIG', 'mig.bom.compensation.no.prefix', '异常补偿编号前缀', 'BMC', 0, 1, '异常补偿编号自动生成前缀'),
(6963, 'MIG', 'mig.bom.reconcile.no.prefix', '对账编号前缀', 'BMO', 0, 1, '对账编号自动生成前缀');
