-- G8-N7 六系统集成—MES→ERP（WBS T068）初始化：菜单/按钮权限、角色授权、字典与可配置项。
-- 号段基线（V145 之后实测）：sys_permission=5076（本脚本从 5077 起）、
-- sys_role_permission=15973（从 15974 起）、sys_dictionary=9199（从 9200 起）、sys_config=6833（从 6834 起）。
-- 菜单说明：G8「系统集成」顶级菜单域（4962，V135 建立）复用，本节点新增二级方向分组
--          MES→ERP（5077），覆盖集成接口、字段映射、同步批次、接收回执、异常补偿、对账。

-- ========== MES→ERP 集成方向分组（5077，挂在 4962 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(5077, 'intg:mes-erp', 'MES→ERP 集成', 'menu', 4962, '/intg/mes-erp', 'SwapRightOutlined', 7, 1);

-- ========== MES→ERP 业务菜单（5078-5083，挂在 5077 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(5078, 'intg:mes-erp:interface', '集成接口', 'menu', 5077, '/intg/mes-erp/interfaces', 'ApiOutlined', 1, 1),
(5079, 'intg:mes-erp:mapping', '字段映射', 'menu', 5077, '/intg/mes-erp/mappings', 'PartitionOutlined', 2, 1),
(5080, 'intg:mes-erp:batch', '同步批次', 'menu', 5077, '/intg/mes-erp/batches', 'SyncOutlined', 3, 1),
(5081, 'intg:mes-erp:receipt', '接收回执', 'menu', 5077, '/intg/mes-erp/receipts', 'AuditOutlined', 4, 1),
(5082, 'intg:mes-erp:compensation', '异常补偿', 'menu', 5077, '/intg/mes-erp/compensations', 'ToolOutlined', 5, 1),
(5083, 'intg:mes-erp:reconcile', '对账', 'menu', 5077, '/intg/mes-erp/reconciles', 'BalanceOutlined', 6, 1);

-- ========== MES→ERP 按钮（5084-5095） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(5084, 'intg:mes-erp:interface:list', '查询集成接口', 'button', 5078, NULL, NULL, 1, 1),
(5085, 'intg:mes-erp:interface:manage', '维护集成接口', 'button', 5078, NULL, NULL, 2, 1),
(5086, 'intg:mes-erp:mapping:list', '查询字段映射', 'button', 5079, NULL, NULL, 1, 1),
(5087, 'intg:mes-erp:mapping:manage', '维护字段映射', 'button', 5079, NULL, NULL, 2, 1),
(5088, 'intg:mes-erp:batch:list', '查询同步批次', 'button', 5080, NULL, NULL, 1, 1),
(5089, 'intg:mes-erp:batch:manage', '维护同步批次', 'button', 5080, NULL, NULL, 2, 1),
(5090, 'intg:mes-erp:receipt:list', '查询接收回执', 'button', 5081, NULL, NULL, 1, 1),
(5091, 'intg:mes-erp:receipt:manage', '维护接收回执', 'button', 5081, NULL, NULL, 2, 1),
(5092, 'intg:mes-erp:compensation:list', '查询异常补偿', 'button', 5082, NULL, NULL, 1, 1),
(5093, 'intg:mes-erp:compensation:manage', '维护异常补偿', 'button', 5082, NULL, NULL, 2, 1),
(5094, 'intg:mes-erp:reconcile:list', '查询对账', 'button', 5083, NULL, NULL, 1, 1),
(5095, 'intg:mes-erp:reconcile:manage', '维护对账', 'button', 5083, NULL, NULL, 2, 1);

-- ========== 角色授权（15974-16063） ==========

-- 系统管理员（2001）：授予全部权限（19 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(15974, 2001, 5077), (15975, 2001, 5078), (15976, 2001, 5079), (15977, 2001, 5080),
(15978, 2001, 5081), (15979, 2001, 5082), (15980, 2001, 5083), (15981, 2001, 5084),
(15982, 2001, 5085), (15983, 2001, 5086), (15984, 2001, 5087), (15985, 2001, 5088),
(15986, 2001, 5089), (15987, 2001, 5090), (15988, 2001, 5091), (15989, 2001, 5092),
(15990, 2001, 5093), (15991, 2001, 5094), (15992, 2001, 5095);

-- 生产现场（2005）：授予全部权限（MES 为发布方、ERP 为消费方，共 19 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(15993, 2005, 5077), (15994, 2005, 5078), (15995, 2005, 5079), (15996, 2005, 5080),
(15997, 2005, 5081), (15998, 2005, 5082), (15999, 2005, 5083), (16000, 2005, 5084),
(16001, 2005, 5085), (16002, 2005, 5086), (16003, 2005, 5087), (16004, 2005, 5088),
(16005, 2005, 5089), (16006, 2005, 5090), (16007, 2005, 5091), (16008, 2005, 5092),
(16009, 2005, 5093), (16010, 2005, 5094), (16011, 2005, 5095);

-- 研发工程师（2002）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(16012, 2002, 5077), (16013, 2002, 5078), (16014, 2002, 5079), (16015, 2002, 5080),
(16016, 2002, 5081), (16017, 2002, 5082), (16018, 2002, 5083), (16019, 2002, 5084),
(16020, 2002, 5086), (16021, 2002, 5088), (16022, 2002, 5090), (16023, 2002, 5092),
(16024, 2002, 5094);

-- 质量工程师（2003）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(16025, 2003, 5077), (16026, 2003, 5078), (16027, 2003, 5079), (16028, 2003, 5080),
(16029, 2003, 5081), (16030, 2003, 5082), (16031, 2003, 5083), (16032, 2003, 5084),
(16033, 2003, 5086), (16034, 2003, 5088), (16035, 2003, 5090), (16036, 2003, 5092),
(16037, 2003, 5094);

-- 供应链专员（2004）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(16038, 2004, 5077), (16039, 2004, 5078), (16040, 2004, 5079), (16041, 2004, 5080),
(16042, 2004, 5081), (16043, 2004, 5082), (16044, 2004, 5083), (16045, 2004, 5084),
(16046, 2004, 5086), (16047, 2004, 5088), (16048, 2004, 5090), (16049, 2004, 5092),
(16050, 2004, 5094);

-- 只读用户（2006）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(16051, 2006, 5077), (16052, 2006, 5078), (16053, 2006, 5079), (16054, 2006, 5080),
(16055, 2006, 5081), (16056, 2006, 5082), (16057, 2006, 5083), (16058, 2006, 5084),
(16059, 2006, 5086), (16060, 2006, 5088), (16061, 2006, 5090), (16062, 2006, 5092),
(16063, 2006, 5094);

-- ========== MES→ERP 集成字典（9200-9241） ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(9200, 'intg_mes_erp_object_type', '工单开工', 'WORK_ORDER_START', 1, 1, NULL),
(9201, 'intg_mes_erp_object_type', '工单完工', 'WORK_ORDER_FINISH', 2, 1, NULL),
(9202, 'intg_mes_erp_object_type', '良品不良', 'YIELD_SCRAP', 3, 1, NULL),
(9203, 'intg_mes_erp_object_type', '工时', 'LABOR_HOURS', 4, 1, NULL),
(9204, 'intg_mes_erp_object_type', '材料消耗', 'MATERIAL_CONSUMPTION', 5, 1, NULL),
(9205, 'intg_mes_erp_object_type', '产成品入库请求', 'FG_INBOUND_REQUEST', 6, 1, NULL),
(9206, 'intg_mes_erp_protocol', 'API 接口', 'API', 1, 1, NULL),
(9207, 'intg_mes_erp_protocol', '事件消息', 'EVENT', 2, 1, NULL),
(9208, 'intg_mes_erp_protocol', '批量文件', 'FILE', 3, 1, NULL),
(9209, 'intg_mes_erp_trigger_type', '手工触发', 'MANUAL', 1, 1, NULL),
(9210, 'intg_mes_erp_trigger_type', '定时触发', 'SCHEDULED', 2, 1, NULL),
(9211, 'intg_mes_erp_trigger_type', '事件触发', 'EVENT', 3, 1, NULL),
(9212, 'intg_mes_erp_sync_mode', '全量', 'FULL', 1, 1, NULL),
(9213, 'intg_mes_erp_sync_mode', '增量', 'INCREMENTAL', 2, 1, NULL),
(9214, 'intg_mes_erp_interface_status', '草稿', 'DRAFT', 1, 1, NULL),
(9215, 'intg_mes_erp_interface_status', '启用', 'ACTIVE', 2, 1, NULL),
(9216, 'intg_mes_erp_interface_status', '停用', 'DISABLED', 3, 1, NULL),
(9217, 'intg_mes_erp_mapping_status', '草稿', 'DRAFT', 1, 1, NULL),
(9218, 'intg_mes_erp_mapping_status', '启用', 'ACTIVE', 2, 1, NULL),
(9219, 'intg_mes_erp_mapping_status', '停用', 'DISABLED', 3, 1, NULL),
(9220, 'intg_mes_erp_batch_status', '待执行', 'PENDING', 1, 1, NULL),
(9221, 'intg_mes_erp_batch_status', '执行中', 'RUNNING', 2, 1, NULL),
(9222, 'intg_mes_erp_batch_status', '成功', 'SUCCESS', 3, 1, NULL),
(9223, 'intg_mes_erp_batch_status', '部分成功', 'PARTIAL', 4, 1, NULL),
(9224, 'intg_mes_erp_batch_status', '失败', 'FAILED', 5, 1, NULL),
(9225, 'intg_mes_erp_receipt_status', '待回执', 'PENDING', 1, 1, NULL),
(9226, 'intg_mes_erp_receipt_status', '已接收', 'ACCEPTED', 2, 1, NULL),
(9227, 'intg_mes_erp_receipt_status', '已拒绝', 'REJECTED', 3, 1, NULL),
(9228, 'intg_mes_erp_receipt_status', '警告', 'WARN', 4, 1, NULL),
(9229, 'intg_mes_erp_error_type', '校验失败', 'VALIDATION', 1, 1, NULL),
(9230, 'intg_mes_erp_error_type', '超时', 'TIMEOUT', 2, 1, NULL),
(9231, 'intg_mes_erp_error_type', '数据冲突', 'CONFLICT', 3, 1, NULL),
(9232, 'intg_mes_erp_error_type', '网络异常', 'NETWORK', 4, 1, NULL),
(9233, 'intg_mes_erp_error_type', '其他', 'OTHER', 5, 1, NULL),
(9234, 'intg_mes_erp_compensation_status', '待处理', 'PENDING', 1, 1, NULL),
(9235, 'intg_mes_erp_compensation_status', '处理中', 'PROCESSING', 2, 1, NULL),
(9236, 'intg_mes_erp_compensation_status', '已解决', 'RESOLVED', 3, 1, NULL),
(9237, 'intg_mes_erp_compensation_status', '已忽略', 'IGNORED', 4, 1, NULL),
(9238, 'intg_mes_erp_reconcile_status', '待对账', 'PENDING', 1, 1, NULL),
(9239, 'intg_mes_erp_reconcile_status', '已平账', 'BALANCED', 2, 1, NULL),
(9240, 'intg_mes_erp_reconcile_status', '存在差异', 'DIFF', 3, 1, NULL),
(9241, 'intg_mes_erp_reconcile_status', '已关闭', 'CLOSED', 4, 1, NULL);

-- ========== MES→ERP 集成可配置项（6834-6846） ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(6834, 'INTG', 'intg.mes-erp.enabled', 'MES→ERP 集成启用开关', 'true', 0, 1, 'MES→ERP 集成总开关，默认启用'),
(6835, 'INTG', 'intg.mes-erp.batch.size', '同步批次单批条数', '200', 1, 1, '单批同步条数，待业务方确认并发规模后调整'),
(6836, 'INTG', 'intg.mes-erp.retry.times', '失败重试次数', '3', 1, 1, '接口失败自动重试次数，待业务方确认'),
(6837, 'INTG', 'intg.mes-erp.timeout.ms', '接口超时时间（毫秒）', '30000', 1, 1, '接口调用超时时间，待业务方确认'),
(6838, 'INTG', 'intg.mes-erp.idempotent.window.hours', '幂等窗口（小时）', '24', 1, 1, '幂等判重时间窗口，待业务方确认'),
(6839, 'INTG', 'intg.mes-erp.receipt.auto', 'ERP 回执自动生成', 'true', 0, 1, 'ERP 校验通过后自动生成回执'),
(6840, 'INTG', 'intg.mes-erp.reconcile.cron', '对账任务计划表达式', '0 0 2 * * ?', 1, 1, '每日对账任务 Cron，待业务方确认对账频率'),
(6841, 'INTG', 'intg.mes-erp.interface.no.prefix', '集成接口编号前缀', 'MEI', 0, 1, '集成接口编号自动生成前缀'),
(6842, 'INTG', 'intg.mes-erp.mapping.no.prefix', '字段映射编号前缀', 'MEM', 0, 1, '字段映射编号自动生成前缀'),
(6843, 'INTG', 'intg.mes-erp.batch.no.prefix', '同步批次编号前缀', 'MEB', 0, 1, '同步批次编号自动生成前缀'),
(6844, 'INTG', 'intg.mes-erp.receipt.no.prefix', '接收回执编号前缀', 'MER', 0, 1, '接收回执编号自动生成前缀'),
(6845, 'INTG', 'intg.mes-erp.compensation.no.prefix', '异常补偿编号前缀', 'MEC', 0, 1, '异常补偿编号自动生成前缀'),
(6846, 'INTG', 'intg.mes-erp.reconcile.no.prefix', '对账编号前缀', 'MEO', 0, 1, '对账编号自动生成前缀');
