-- G8-N14 六系统集成—单据全链路（WBS T075）初始化：菜单/按钮权限、角色授权、字典与可配置项。
-- 号段基线（V159 之后实测）：sys_permission=5209（本脚本从 5210 起）、
-- sys_role_permission=16603（从 16604 起）、sys_dictionary=9490（从 9491 起）、sys_config=6924（从 6925 起）。
-- 菜单说明：G8「系统集成」顶级菜单域（4962，V135 建立）复用，本节点新增二级方向分组
--          单据全链路（5210），覆盖集成接口、字段映射、同步批次、接收回执、异常补偿、对账。

-- ========== 单据全链路集成方向分组（5210，挂在 4962 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(5210, 'intg:document-chain', '单据全链路集成', 'menu', 4962, '/intg/document-chain', 'SwapOutlined', 14, 1);

-- ========== 单据全链路业务菜单（5211-5216，挂在 5210 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(5211, 'intg:document-chain:interface', '集成接口', 'menu', 5210, '/intg/document-chain/interfaces', 'ApiOutlined', 1, 1),
(5212, 'intg:document-chain:mapping', '字段映射', 'menu', 5210, '/intg/document-chain/mappings', 'PartitionOutlined', 2, 1),
(5213, 'intg:document-chain:batch', '同步批次', 'menu', 5210, '/intg/document-chain/batches', 'SyncOutlined', 3, 1),
(5214, 'intg:document-chain:receipt', '接收回执', 'menu', 5210, '/intg/document-chain/receipts', 'AuditOutlined', 4, 1),
(5215, 'intg:document-chain:compensation', '异常补偿', 'menu', 5210, '/intg/document-chain/compensations', 'ToolOutlined', 5, 1),
(5216, 'intg:document-chain:reconcile', '对账', 'menu', 5210, '/intg/document-chain/reconciles', 'BalanceOutlined', 6, 1);

-- ========== 单据全链路按钮（5217-5228） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(5217, 'intg:document-chain:interface:list', '查询集成接口', 'button', 5211, NULL, NULL, 1, 1),
(5218, 'intg:document-chain:interface:manage', '维护集成接口', 'button', 5211, NULL, NULL, 2, 1),
(5219, 'intg:document-chain:mapping:list', '查询字段映射', 'button', 5212, NULL, NULL, 1, 1),
(5220, 'intg:document-chain:mapping:manage', '维护字段映射', 'button', 5212, NULL, NULL, 2, 1),
(5221, 'intg:document-chain:batch:list', '查询同步批次', 'button', 5213, NULL, NULL, 1, 1),
(5222, 'intg:document-chain:batch:manage', '维护同步批次', 'button', 5213, NULL, NULL, 2, 1),
(5223, 'intg:document-chain:receipt:list', '查询接收回执', 'button', 5214, NULL, NULL, 1, 1),
(5224, 'intg:document-chain:receipt:manage', '维护接收回执', 'button', 5214, NULL, NULL, 2, 1),
(5225, 'intg:document-chain:compensation:list', '查询异常补偿', 'button', 5215, NULL, NULL, 1, 1),
(5226, 'intg:document-chain:compensation:manage', '维护异常补偿', 'button', 5215, NULL, NULL, 2, 1),
(5227, 'intg:document-chain:reconcile:list', '查询对账', 'button', 5216, NULL, NULL, 1, 1),
(5228, 'intg:document-chain:reconcile:manage', '维护对账', 'button', 5216, NULL, NULL, 2, 1);

-- ========== 角色授权（16604-16693） ==========

-- 系统管理员（2001）：授予全部权限（19 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(16604, 2001, 5210), (16605, 2001, 5211), (16606, 2001, 5212), (16607, 2001, 5213),
(16608, 2001, 5214), (16609, 2001, 5215), (16610, 2001, 5216), (16611, 2001, 5217),
(16612, 2001, 5218), (16613, 2001, 5219), (16614, 2001, 5220), (16615, 2001, 5221),
(16616, 2001, 5222), (16617, 2001, 5223), (16618, 2001, 5224), (16619, 2001, 5225),
(16620, 2001, 5226), (16621, 2001, 5227), (16622, 2001, 5228);

-- 供应链专员（2004）：授予全部权限（单据全链路追溯主责角色，共 19 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(16623, 2004, 5210), (16624, 2004, 5211), (16625, 2004, 5212), (16626, 2004, 5213),
(16627, 2004, 5214), (16628, 2004, 5215), (16629, 2004, 5216), (16630, 2004, 5217),
(16631, 2004, 5218), (16632, 2004, 5219), (16633, 2004, 5220), (16634, 2004, 5221),
(16635, 2004, 5222), (16636, 2004, 5223), (16637, 2004, 5224), (16638, 2004, 5225),
(16639, 2004, 5226), (16640, 2004, 5227), (16641, 2004, 5228);

-- 质量工程师（2003）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(16642, 2003, 5210), (16643, 2003, 5211), (16644, 2003, 5212), (16645, 2003, 5213),
(16646, 2003, 5214), (16647, 2003, 5215), (16648, 2003, 5216), (16649, 2003, 5217),
(16650, 2003, 5219), (16651, 2003, 5221), (16652, 2003, 5223), (16653, 2003, 5225),
(16654, 2003, 5227);

-- 生产现场（2005）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(16655, 2005, 5210), (16656, 2005, 5211), (16657, 2005, 5212), (16658, 2005, 5213),
(16659, 2005, 5214), (16660, 2005, 5215), (16661, 2005, 5216), (16662, 2005, 5217),
(16663, 2005, 5219), (16664, 2005, 5221), (16665, 2005, 5223), (16666, 2005, 5225),
(16667, 2005, 5227);

-- 研发工程师（2002）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(16668, 2002, 5210), (16669, 2002, 5211), (16670, 2002, 5212), (16671, 2002, 5213),
(16672, 2002, 5214), (16673, 2002, 5215), (16674, 2002, 5216), (16675, 2002, 5217),
(16676, 2002, 5219), (16677, 2002, 5221), (16678, 2002, 5223), (16679, 2002, 5225),
(16680, 2002, 5227);

-- 只读用户（2006）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(16681, 2006, 5210), (16682, 2006, 5211), (16683, 2006, 5212), (16684, 2006, 5213),
(16685, 2006, 5214), (16686, 2006, 5215), (16687, 2006, 5216), (16688, 2006, 5217),
(16689, 2006, 5219), (16690, 2006, 5221), (16691, 2006, 5223), (16692, 2006, 5225),
(16693, 2006, 5227);

-- ========== 单据全链路集成字典（9491-9531） ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(9491, 'intg_document_chain_object_type', '销售订单', 'SALES_ORDER', 1, 1, NULL),
(9492, 'intg_document_chain_object_type', '采购订单', 'PURCHASE_ORDER', 2, 1, NULL),
(9493, 'intg_document_chain_object_type', '生产订单', 'PRODUCTION_ORDER', 3, 1, NULL),
(9494, 'intg_document_chain_object_type', '入库单', 'INBOUND_DOC', 4, 1, NULL),
(9495, 'intg_document_chain_object_type', '发货单', 'SHIPMENT_DOC', 5, 1, NULL),
(9496, 'intg_document_chain_protocol', 'API 接口', 'API', 1, 1, NULL),
(9497, 'intg_document_chain_protocol', '事件消息', 'EVENT', 2, 1, NULL),
(9498, 'intg_document_chain_protocol', '批量文件', 'FILE', 3, 1, NULL),
(9499, 'intg_document_chain_trigger_type', '手工触发', 'MANUAL', 1, 1, NULL),
(9500, 'intg_document_chain_trigger_type', '定时触发', 'SCHEDULED', 2, 1, NULL),
(9501, 'intg_document_chain_trigger_type', '事件触发', 'EVENT', 3, 1, NULL),
(9502, 'intg_document_chain_sync_mode', '全量', 'FULL', 1, 1, NULL),
(9503, 'intg_document_chain_sync_mode', '增量', 'INCREMENTAL', 2, 1, NULL),
(9504, 'intg_document_chain_interface_status', '草稿', 'DRAFT', 1, 1, NULL),
(9505, 'intg_document_chain_interface_status', '启用', 'ACTIVE', 2, 1, NULL),
(9506, 'intg_document_chain_interface_status', '停用', 'DISABLED', 3, 1, NULL),
(9507, 'intg_document_chain_mapping_status', '草稿', 'DRAFT', 1, 1, NULL),
(9508, 'intg_document_chain_mapping_status', '启用', 'ACTIVE', 2, 1, NULL),
(9509, 'intg_document_chain_mapping_status', '停用', 'DISABLED', 3, 1, NULL),
(9510, 'intg_document_chain_batch_status', '待执行', 'PENDING', 1, 1, NULL),
(9511, 'intg_document_chain_batch_status', '执行中', 'RUNNING', 2, 1, NULL),
(9512, 'intg_document_chain_batch_status', '成功', 'SUCCESS', 3, 1, NULL),
(9513, 'intg_document_chain_batch_status', '部分成功', 'PARTIAL', 4, 1, NULL),
(9514, 'intg_document_chain_batch_status', '失败', 'FAILED', 5, 1, NULL),
(9515, 'intg_document_chain_receipt_status', '待回执', 'PENDING', 1, 1, NULL),
(9516, 'intg_document_chain_receipt_status', '已接收', 'ACCEPTED', 2, 1, NULL),
(9517, 'intg_document_chain_receipt_status', '已拒绝', 'REJECTED', 3, 1, NULL),
(9518, 'intg_document_chain_receipt_status', '警告', 'WARN', 4, 1, NULL),
(9519, 'intg_document_chain_error_type', '校验失败', 'VALIDATION', 1, 1, NULL),
(9520, 'intg_document_chain_error_type', '超时', 'TIMEOUT', 2, 1, NULL),
(9521, 'intg_document_chain_error_type', '数据冲突', 'CONFLICT', 3, 1, NULL),
(9522, 'intg_document_chain_error_type', '网络异常', 'NETWORK', 4, 1, NULL),
(9523, 'intg_document_chain_error_type', '其他', 'OTHER', 5, 1, NULL),
(9524, 'intg_document_chain_compensation_status', '待处理', 'PENDING', 1, 1, NULL),
(9525, 'intg_document_chain_compensation_status', '处理中', 'PROCESSING', 2, 1, NULL),
(9526, 'intg_document_chain_compensation_status', '已解决', 'RESOLVED', 3, 1, NULL),
(9527, 'intg_document_chain_compensation_status', '已忽略', 'IGNORED', 4, 1, NULL),
(9528, 'intg_document_chain_reconcile_status', '待对账', 'PENDING', 1, 1, NULL),
(9529, 'intg_document_chain_reconcile_status', '已平账', 'BALANCED', 2, 1, NULL),
(9530, 'intg_document_chain_reconcile_status', '存在差异', 'DIFF', 3, 1, NULL),
(9531, 'intg_document_chain_reconcile_status', '已关闭', 'CLOSED', 4, 1, NULL);

-- ========== 单据全链路集成可配置项（6925-6937） ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(6925, 'INTG', 'intg.document-chain.enabled', '单据全链路集成启用开关', 'true', 0, 1, '单据全链路集成总开关，默认启用'),
(6926, 'INTG', 'intg.document-chain.batch.size', '同步批次单批条数', '200', 1, 1, '单批同步条数，待业务方确认并发规模后调整'),
(6927, 'INTG', 'intg.document-chain.retry.times', '失败重试次数', '3', 1, 1, '单据全链路重传次数，待业务方确认'),
(6928, 'INTG', 'intg.document-chain.timeout.ms', '接口超时时间（毫秒）', '30000', 1, 1, '接口调用超时时间，待业务方确认'),
(6929, 'INTG', 'intg.document-chain.idempotent.window.hours', '幂等窗口（小时）', '24', 1, 1, '幂等判重时间窗口，待业务方确认'),
(6930, 'INTG', 'intg.document-chain.receipt.auto', '系统回执自动生成', 'true', 0, 1, '系统校验通过后自动生成回执'),
(6931, 'INTG', 'intg.document-chain.reconcile.cron', '对账任务计划表达式', '0 0 2 * * ?', 1, 1, '每日对账任务 Cron，待业务方确认对账频率'),
(6932, 'INTG', 'intg.document-chain.interface.no.prefix', '集成接口编号前缀', 'DCI', 0, 1, '集成接口编号自动生成前缀'),
(6933, 'INTG', 'intg.document-chain.mapping.no.prefix', '字段映射编号前缀', 'DCM', 0, 1, '字段映射编号自动生成前缀'),
(6934, 'INTG', 'intg.document-chain.batch.no.prefix', '同步批次编号前缀', 'DCB', 0, 1, '同步批次编号自动生成前缀'),
(6935, 'INTG', 'intg.document-chain.receipt.no.prefix', '接收回执编号前缀', 'DCR', 0, 1, '接收回执编号自动生成前缀'),
(6936, 'INTG', 'intg.document-chain.compensation.no.prefix', '异常补偿编号前缀', 'DCC', 0, 1, '异常补偿编号自动生成前缀'),
(6937, 'INTG', 'intg.document-chain.reconcile.no.prefix', '对账编号前缀', 'DCO', 0, 1, '对账编号自动生成前缀');
