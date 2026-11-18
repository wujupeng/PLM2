-- G8-N8 六系统集成—ERP↔WMS（WBS T069）初始化：菜单/按钮权限、角色授权、字典与可配置项。
-- 号段基线（V147 之后实测）：sys_permission=5095（本脚本从 5096 起）、
-- sys_role_permission=16063（从 16064 起）、sys_dictionary=9241（从 9242 起）、sys_config=6846（从 6847 起）。
-- 菜单说明：G8「系统集成」顶级菜单域（4962，V135 建立）复用，本节点新增二级方向分组
--          ERP↔WMS（5096），覆盖集成接口、字段映射、同步批次、接收回执、异常补偿、对账。

-- ========== ERP↔WMS 集成方向分组（5096，挂在 4962 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(5096, 'intg:erp-wms', 'ERP↔WMS 集成', 'menu', 4962, '/intg/erp-wms', 'SwapOutlined', 8, 1);

-- ========== ERP↔WMS 业务菜单（5097-5102，挂在 5096 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(5097, 'intg:erp-wms:interface', '集成接口', 'menu', 5096, '/intg/erp-wms/interfaces', 'ApiOutlined', 1, 1),
(5098, 'intg:erp-wms:mapping', '字段映射', 'menu', 5096, '/intg/erp-wms/mappings', 'PartitionOutlined', 2, 1),
(5099, 'intg:erp-wms:batch', '同步批次', 'menu', 5096, '/intg/erp-wms/batches', 'SyncOutlined', 3, 1),
(5100, 'intg:erp-wms:receipt', '接收回执', 'menu', 5096, '/intg/erp-wms/receipts', 'AuditOutlined', 4, 1),
(5101, 'intg:erp-wms:compensation', '异常补偿', 'menu', 5096, '/intg/erp-wms/compensations', 'ToolOutlined', 5, 1),
(5102, 'intg:erp-wms:reconcile', '对账', 'menu', 5096, '/intg/erp-wms/reconciles', 'BalanceOutlined', 6, 1);

-- ========== ERP↔WMS 按钮（5103-5114） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(5103, 'intg:erp-wms:interface:list', '查询集成接口', 'button', 5097, NULL, NULL, 1, 1),
(5104, 'intg:erp-wms:interface:manage', '维护集成接口', 'button', 5097, NULL, NULL, 2, 1),
(5105, 'intg:erp-wms:mapping:list', '查询字段映射', 'button', 5098, NULL, NULL, 1, 1),
(5106, 'intg:erp-wms:mapping:manage', '维护字段映射', 'button', 5098, NULL, NULL, 2, 1),
(5107, 'intg:erp-wms:batch:list', '查询同步批次', 'button', 5099, NULL, NULL, 1, 1),
(5108, 'intg:erp-wms:batch:manage', '维护同步批次', 'button', 5099, NULL, NULL, 2, 1),
(5109, 'intg:erp-wms:receipt:list', '查询接收回执', 'button', 5100, NULL, NULL, 1, 1),
(5110, 'intg:erp-wms:receipt:manage', '维护接收回执', 'button', 5100, NULL, NULL, 2, 1),
(5111, 'intg:erp-wms:compensation:list', '查询异常补偿', 'button', 5101, NULL, NULL, 1, 1),
(5112, 'intg:erp-wms:compensation:manage', '维护异常补偿', 'button', 5101, NULL, NULL, 2, 1),
(5113, 'intg:erp-wms:reconcile:list', '查询对账', 'button', 5102, NULL, NULL, 1, 1),
(5114, 'intg:erp-wms:reconcile:manage', '维护对账', 'button', 5102, NULL, NULL, 2, 1);

-- ========== 角色授权（16064-16153） ==========

-- 系统管理员（2001）：授予全部权限（19 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(16064, 2001, 5096), (16065, 2001, 5097), (16066, 2001, 5098), (16067, 2001, 5099),
(16068, 2001, 5100), (16069, 2001, 5101), (16070, 2001, 5102), (16071, 2001, 5103),
(16072, 2001, 5104), (16073, 2001, 5105), (16074, 2001, 5106), (16075, 2001, 5107),
(16076, 2001, 5108), (16077, 2001, 5109), (16078, 2001, 5110), (16079, 2001, 5111),
(16080, 2001, 5112), (16081, 2001, 5113), (16082, 2001, 5114);

-- 供应链专员（2004）：授予全部权限（WMS 为收发存执行方、ERP 为核算方，共 19 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(16083, 2004, 5096), (16084, 2004, 5097), (16085, 2004, 5098), (16086, 2004, 5099),
(16087, 2004, 5100), (16088, 2004, 5101), (16089, 2004, 5102), (16090, 2004, 5103),
(16091, 2004, 5104), (16092, 2004, 5105), (16093, 2004, 5106), (16094, 2004, 5107),
(16095, 2004, 5108), (16096, 2004, 5109), (16097, 2004, 5110), (16098, 2004, 5111),
(16099, 2004, 5112), (16100, 2004, 5113), (16101, 2004, 5114);

-- 研发工程师（2002）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(16102, 2002, 5096), (16103, 2002, 5097), (16104, 2002, 5098), (16105, 2002, 5099),
(16106, 2002, 5100), (16107, 2002, 5101), (16108, 2002, 5102), (16109, 2002, 5103),
(16110, 2002, 5105), (16111, 2002, 5107), (16112, 2002, 5109), (16113, 2002, 5111),
(16114, 2002, 5113);

-- 质量工程师（2003）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(16115, 2003, 5096), (16116, 2003, 5097), (16117, 2003, 5098), (16118, 2003, 5099),
(16119, 2003, 5100), (16120, 2003, 5101), (16121, 2003, 5102), (16122, 2003, 5103),
(16123, 2003, 5105), (16124, 2003, 5107), (16125, 2003, 5109), (16126, 2003, 5111),
(16127, 2003, 5113);

-- 生产现场（2005）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(16128, 2005, 5096), (16129, 2005, 5097), (16130, 2005, 5098), (16131, 2005, 5099),
(16132, 2005, 5100), (16133, 2005, 5101), (16134, 2005, 5102), (16135, 2005, 5103),
(16136, 2005, 5105), (16137, 2005, 5107), (16138, 2005, 5109), (16139, 2005, 5111),
(16140, 2005, 5113);

-- 只读用户（2006）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(16141, 2006, 5096), (16142, 2006, 5097), (16143, 2006, 5098), (16144, 2006, 5099),
(16145, 2006, 5100), (16146, 2006, 5101), (16147, 2006, 5102), (16148, 2006, 5103),
(16149, 2006, 5105), (16150, 2006, 5107), (16151, 2006, 5109), (16152, 2006, 5111),
(16153, 2006, 5113);

-- ========== ERP↔WMS 集成字典（9242-9285） ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(9242, 'intg_erp_wms_object_type', '采购/委外收货', 'PURCHASE_RECEIPT', 1, 1, NULL),
(9243, 'intg_erp_wms_object_type', '质检状态', 'QUALITY_STATUS', 2, 1, NULL),
(9244, 'intg_erp_wms_object_type', '入库', 'INBOUND', 3, 1, NULL),
(9245, 'intg_erp_wms_object_type', '领料', 'MATERIAL_PICKING', 4, 1, NULL),
(9246, 'intg_erp_wms_object_type', '退料', 'MATERIAL_RETURN', 5, 1, NULL),
(9247, 'intg_erp_wms_object_type', '调拨', 'TRANSFER', 6, 1, NULL),
(9248, 'intg_erp_wms_object_type', '盘点', 'STOCKTAKE', 7, 1, NULL),
(9249, 'intg_erp_wms_object_type', '出库', 'OUTBOUND', 8, 1, NULL),
(9250, 'intg_erp_wms_protocol', 'API 接口', 'API', 1, 1, NULL),
(9251, 'intg_erp_wms_protocol', '事件消息', 'EVENT', 2, 1, NULL),
(9252, 'intg_erp_wms_protocol', '批量文件', 'FILE', 3, 1, NULL),
(9253, 'intg_erp_wms_trigger_type', '手工触发', 'MANUAL', 1, 1, NULL),
(9254, 'intg_erp_wms_trigger_type', '定时触发', 'SCHEDULED', 2, 1, NULL),
(9255, 'intg_erp_wms_trigger_type', '事件触发', 'EVENT', 3, 1, NULL),
(9256, 'intg_erp_wms_sync_mode', '全量', 'FULL', 1, 1, NULL),
(9257, 'intg_erp_wms_sync_mode', '增量', 'INCREMENTAL', 2, 1, NULL),
(9258, 'intg_erp_wms_interface_status', '草稿', 'DRAFT', 1, 1, NULL),
(9259, 'intg_erp_wms_interface_status', '启用', 'ACTIVE', 2, 1, NULL),
(9260, 'intg_erp_wms_interface_status', '停用', 'DISABLED', 3, 1, NULL),
(9261, 'intg_erp_wms_mapping_status', '草稿', 'DRAFT', 1, 1, NULL),
(9262, 'intg_erp_wms_mapping_status', '启用', 'ACTIVE', 2, 1, NULL),
(9263, 'intg_erp_wms_mapping_status', '停用', 'DISABLED', 3, 1, NULL),
(9264, 'intg_erp_wms_batch_status', '待执行', 'PENDING', 1, 1, NULL),
(9265, 'intg_erp_wms_batch_status', '执行中', 'RUNNING', 2, 1, NULL),
(9266, 'intg_erp_wms_batch_status', '成功', 'SUCCESS', 3, 1, NULL),
(9267, 'intg_erp_wms_batch_status', '部分成功', 'PARTIAL', 4, 1, NULL),
(9268, 'intg_erp_wms_batch_status', '失败', 'FAILED', 5, 1, NULL),
(9269, 'intg_erp_wms_receipt_status', '待回执', 'PENDING', 1, 1, NULL),
(9270, 'intg_erp_wms_receipt_status', '已接收', 'ACCEPTED', 2, 1, NULL),
(9271, 'intg_erp_wms_receipt_status', '已拒绝', 'REJECTED', 3, 1, NULL),
(9272, 'intg_erp_wms_receipt_status', '警告', 'WARN', 4, 1, NULL),
(9273, 'intg_erp_wms_error_type', '校验失败', 'VALIDATION', 1, 1, NULL),
(9274, 'intg_erp_wms_error_type', '超时', 'TIMEOUT', 2, 1, NULL),
(9275, 'intg_erp_wms_error_type', '数据冲突', 'CONFLICT', 3, 1, NULL),
(9276, 'intg_erp_wms_error_type', '网络异常', 'NETWORK', 4, 1, NULL),
(9277, 'intg_erp_wms_error_type', '其他', 'OTHER', 5, 1, NULL),
(9278, 'intg_erp_wms_compensation_status', '待处理', 'PENDING', 1, 1, NULL),
(9279, 'intg_erp_wms_compensation_status', '处理中', 'PROCESSING', 2, 1, NULL),
(9280, 'intg_erp_wms_compensation_status', '已解决', 'RESOLVED', 3, 1, NULL),
(9281, 'intg_erp_wms_compensation_status', '已忽略', 'IGNORED', 4, 1, NULL),
(9282, 'intg_erp_wms_reconcile_status', '待对账', 'PENDING', 1, 1, NULL),
(9283, 'intg_erp_wms_reconcile_status', '已平账', 'BALANCED', 2, 1, NULL),
(9284, 'intg_erp_wms_reconcile_status', '存在差异', 'DIFF', 3, 1, NULL),
(9285, 'intg_erp_wms_reconcile_status', '已关闭', 'CLOSED', 4, 1, NULL);

-- ========== ERP↔WMS 集成可配置项（6847-6859） ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(6847, 'INTG', 'intg.erp-wms.enabled', 'ERP↔WMS 集成启用开关', 'true', 0, 1, 'ERP↔WMS 集成总开关，默认启用'),
(6848, 'INTG', 'intg.erp-wms.batch.size', '同步批次单批条数', '200', 1, 1, '单批同步条数，待业务方确认并发规模后调整'),
(6849, 'INTG', 'intg.erp-wms.retry.times', '失败重试次数', '3', 1, 1, '接口失败自动重试次数，待业务方确认'),
(6850, 'INTG', 'intg.erp-wms.timeout.ms', '接口超时时间（毫秒）', '30000', 1, 1, '接口调用超时时间，待业务方确认'),
(6851, 'INTG', 'intg.erp-wms.idempotent.window.hours', '幂等窗口（小时）', '24', 1, 1, '幂等判重时间窗口，待业务方确认'),
(6852, 'INTG', 'intg.erp-wms.receipt.auto', 'WMS 回执自动生成', 'true', 0, 1, 'WMS 校验通过后自动生成回执'),
(6853, 'INTG', 'intg.erp-wms.reconcile.cron', '对账任务计划表达式', '0 0 2 * * ?', 1, 1, '每日对账任务 Cron，待业务方确认对账频率'),
(6854, 'INTG', 'intg.erp-wms.interface.no.prefix', '集成接口编号前缀', 'EWI', 0, 1, '集成接口编号自动生成前缀'),
(6855, 'INTG', 'intg.erp-wms.mapping.no.prefix', '字段映射编号前缀', 'EWM', 0, 1, '字段映射编号自动生成前缀'),
(6856, 'INTG', 'intg.erp-wms.batch.no.prefix', '同步批次编号前缀', 'EWB', 0, 1, '同步批次编号自动生成前缀'),
(6857, 'INTG', 'intg.erp-wms.receipt.no.prefix', '接收回执编号前缀', 'EWR', 0, 1, '接收回执编号自动生成前缀'),
(6858, 'INTG', 'intg.erp-wms.compensation.no.prefix', '异常补偿编号前缀', 'EWC', 0, 1, '异常补偿编号自动生成前缀'),
(6859, 'INTG', 'intg.erp-wms.reconcile.no.prefix', '对账编号前缀', 'EWO', 0, 1, '对账编号自动生成前缀');
