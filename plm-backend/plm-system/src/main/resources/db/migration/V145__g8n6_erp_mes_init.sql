-- G8-N6 六系统集成—ERP→MES（WBS T067）初始化：菜单/按钮权限、角色授权、字典与可配置项。
-- 号段基线（V143 之后实测）：sys_permission=5057（本脚本从 5058 起）、
-- sys_role_permission=15883（从 15884 起）、sys_dictionary=9158（从 9159 起）、sys_config=6820（从 6821 起）。
-- 菜单说明：G8「系统集成」顶级菜单域（4962，V135 建立）复用，本节点新增二级方向分组
--          ERP→MES（5058），覆盖集成接口、字段映射、同步批次、接收回执、异常补偿、对账。

-- ========== ERP→MES 集成方向分组（5058，挂在 4962 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(5058, 'intg:erp-mes', 'ERP→MES 集成', 'menu', 4962, '/intg/erp-mes', 'SwapRightOutlined', 6, 1);

-- ========== ERP→MES 业务菜单（5059-5064，挂在 5058 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(5059, 'intg:erp-mes:interface', '集成接口', 'menu', 5058, '/intg/erp-mes/interfaces', 'ApiOutlined', 1, 1),
(5060, 'intg:erp-mes:mapping', '字段映射', 'menu', 5058, '/intg/erp-mes/mappings', 'PartitionOutlined', 2, 1),
(5061, 'intg:erp-mes:batch', '同步批次', 'menu', 5058, '/intg/erp-mes/batches', 'SyncOutlined', 3, 1),
(5062, 'intg:erp-mes:receipt', '接收回执', 'menu', 5058, '/intg/erp-mes/receipts', 'AuditOutlined', 4, 1),
(5063, 'intg:erp-mes:compensation', '异常补偿', 'menu', 5058, '/intg/erp-mes/compensations', 'ToolOutlined', 5, 1),
(5064, 'intg:erp-mes:reconcile', '对账', 'menu', 5058, '/intg/erp-mes/reconciles', 'BalanceOutlined', 6, 1);

-- ========== ERP→MES 按钮（5065-5076） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(5065, 'intg:erp-mes:interface:list', '查询集成接口', 'button', 5059, NULL, NULL, 1, 1),
(5066, 'intg:erp-mes:interface:manage', '维护集成接口', 'button', 5059, NULL, NULL, 2, 1),
(5067, 'intg:erp-mes:mapping:list', '查询字段映射', 'button', 5060, NULL, NULL, 1, 1),
(5068, 'intg:erp-mes:mapping:manage', '维护字段映射', 'button', 5060, NULL, NULL, 2, 1),
(5069, 'intg:erp-mes:batch:list', '查询同步批次', 'button', 5061, NULL, NULL, 1, 1),
(5070, 'intg:erp-mes:batch:manage', '维护同步批次', 'button', 5061, NULL, NULL, 2, 1),
(5071, 'intg:erp-mes:receipt:list', '查询接收回执', 'button', 5062, NULL, NULL, 1, 1),
(5072, 'intg:erp-mes:receipt:manage', '维护接收回执', 'button', 5062, NULL, NULL, 2, 1),
(5073, 'intg:erp-mes:compensation:list', '查询异常补偿', 'button', 5063, NULL, NULL, 1, 1),
(5074, 'intg:erp-mes:compensation:manage', '维护异常补偿', 'button', 5063, NULL, NULL, 2, 1),
(5075, 'intg:erp-mes:reconcile:list', '查询对账', 'button', 5064, NULL, NULL, 1, 1),
(5076, 'intg:erp-mes:reconcile:manage', '维护对账', 'button', 5064, NULL, NULL, 2, 1);

-- ========== 角色授权（15884-15973） ==========

-- 系统管理员（2001）：授予全部权限（19 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(15884, 2001, 5058), (15885, 2001, 5059), (15886, 2001, 5060), (15887, 2001, 5061),
(15888, 2001, 5062), (15889, 2001, 5063), (15890, 2001, 5064), (15891, 2001, 5065),
(15892, 2001, 5066), (15893, 2001, 5067), (15894, 2001, 5068), (15895, 2001, 5069),
(15896, 2001, 5070), (15897, 2001, 5071), (15898, 2001, 5072), (15899, 2001, 5073),
(15900, 2001, 5074), (15901, 2001, 5075), (15902, 2001, 5076);

-- 供应链专员（2004）：授予全部权限（ERP 为发布方、MES 为消费方，共 19 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(15903, 2004, 5058), (15904, 2004, 5059), (15905, 2004, 5060), (15906, 2004, 5061),
(15907, 2004, 5062), (15908, 2004, 5063), (15909, 2004, 5064), (15910, 2004, 5065),
(15911, 2004, 5066), (15912, 2004, 5067), (15913, 2004, 5068), (15914, 2004, 5069),
(15915, 2004, 5070), (15916, 2004, 5071), (15917, 2004, 5072), (15918, 2004, 5073),
(15919, 2004, 5074), (15920, 2004, 5075), (15921, 2004, 5076);

-- 研发工程师（2002）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(15922, 2002, 5058), (15923, 2002, 5059), (15924, 2002, 5060), (15925, 2002, 5061),
(15926, 2002, 5062), (15927, 2002, 5063), (15928, 2002, 5064), (15929, 2002, 5065),
(15930, 2002, 5067), (15931, 2002, 5069), (15932, 2002, 5071), (15933, 2002, 5073),
(15934, 2002, 5075);

-- 质量工程师（2003）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(15935, 2003, 5058), (15936, 2003, 5059), (15937, 2003, 5060), (15938, 2003, 5061),
(15939, 2003, 5062), (15940, 2003, 5063), (15941, 2003, 5064), (15942, 2003, 5065),
(15943, 2003, 5067), (15944, 2003, 5069), (15945, 2003, 5071), (15946, 2003, 5073),
(15947, 2003, 5075);

-- 生产现场（2005）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(15948, 2005, 5058), (15949, 2005, 5059), (15950, 2005, 5060), (15951, 2005, 5061),
(15952, 2005, 5062), (15953, 2005, 5063), (15954, 2005, 5064), (15955, 2005, 5065),
(15956, 2005, 5067), (15957, 2005, 5069), (15958, 2005, 5071), (15959, 2005, 5073),
(15960, 2005, 5075);

-- 只读用户（2006）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(15961, 2006, 5058), (15962, 2006, 5059), (15963, 2006, 5060), (15964, 2006, 5061),
(15965, 2006, 5062), (15966, 2006, 5063), (15967, 2006, 5064), (15968, 2006, 5065),
(15969, 2006, 5067), (15970, 2006, 5069), (15971, 2006, 5071), (15972, 2006, 5073),
(15973, 2006, 5075);

-- ========== ERP→MES 集成字典（9159-9199） ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(9159, 'intg_erp_mes_object_type', '生产订单', 'PRODUCTION_ORDER', 1, 1, NULL),
(9160, 'intg_erp_mes_object_type', 'BOM 需求', 'BOM_REQUIREMENT', 2, 1, NULL),
(9161, 'intg_erp_mes_object_type', '计划日期', 'PLAN_DATE', 3, 1, NULL),
(9162, 'intg_erp_mes_object_type', '工单变更', 'WORK_ORDER_CHANGE', 4, 1, NULL),
(9163, 'intg_erp_mes_object_type', '优先级', 'PRIORITY', 5, 1, NULL),
(9164, 'intg_erp_mes_protocol', 'API 接口', 'API', 1, 1, NULL),
(9165, 'intg_erp_mes_protocol', '事件消息', 'EVENT', 2, 1, NULL),
(9166, 'intg_erp_mes_protocol', '批量文件', 'FILE', 3, 1, NULL),
(9167, 'intg_erp_mes_trigger_type', '手工触发', 'MANUAL', 1, 1, NULL),
(9168, 'intg_erp_mes_trigger_type', '定时触发', 'SCHEDULED', 2, 1, NULL),
(9169, 'intg_erp_mes_trigger_type', '事件触发', 'EVENT', 3, 1, NULL),
(9170, 'intg_erp_mes_sync_mode', '全量', 'FULL', 1, 1, NULL),
(9171, 'intg_erp_mes_sync_mode', '增量', 'INCREMENTAL', 2, 1, NULL),
(9172, 'intg_erp_mes_interface_status', '草稿', 'DRAFT', 1, 1, NULL),
(9173, 'intg_erp_mes_interface_status', '启用', 'ACTIVE', 2, 1, NULL),
(9174, 'intg_erp_mes_interface_status', '停用', 'DISABLED', 3, 1, NULL),
(9175, 'intg_erp_mes_mapping_status', '草稿', 'DRAFT', 1, 1, NULL),
(9176, 'intg_erp_mes_mapping_status', '启用', 'ACTIVE', 2, 1, NULL),
(9177, 'intg_erp_mes_mapping_status', '停用', 'DISABLED', 3, 1, NULL),
(9178, 'intg_erp_mes_batch_status', '待执行', 'PENDING', 1, 1, NULL),
(9179, 'intg_erp_mes_batch_status', '执行中', 'RUNNING', 2, 1, NULL),
(9180, 'intg_erp_mes_batch_status', '成功', 'SUCCESS', 3, 1, NULL),
(9181, 'intg_erp_mes_batch_status', '部分成功', 'PARTIAL', 4, 1, NULL),
(9182, 'intg_erp_mes_batch_status', '失败', 'FAILED', 5, 1, NULL),
(9183, 'intg_erp_mes_receipt_status', '待回执', 'PENDING', 1, 1, NULL),
(9184, 'intg_erp_mes_receipt_status', '已接收', 'ACCEPTED', 2, 1, NULL),
(9185, 'intg_erp_mes_receipt_status', '已拒绝', 'REJECTED', 3, 1, NULL),
(9186, 'intg_erp_mes_receipt_status', '警告', 'WARN', 4, 1, NULL),
(9187, 'intg_erp_mes_error_type', '校验失败', 'VALIDATION', 1, 1, NULL),
(9188, 'intg_erp_mes_error_type', '超时', 'TIMEOUT', 2, 1, NULL),
(9189, 'intg_erp_mes_error_type', '数据冲突', 'CONFLICT', 3, 1, NULL),
(9190, 'intg_erp_mes_error_type', '网络异常', 'NETWORK', 4, 1, NULL),
(9191, 'intg_erp_mes_error_type', '其他', 'OTHER', 5, 1, NULL),
(9192, 'intg_erp_mes_compensation_status', '待处理', 'PENDING', 1, 1, NULL),
(9193, 'intg_erp_mes_compensation_status', '处理中', 'PROCESSING', 2, 1, NULL),
(9194, 'intg_erp_mes_compensation_status', '已解决', 'RESOLVED', 3, 1, NULL),
(9195, 'intg_erp_mes_compensation_status', '已忽略', 'IGNORED', 4, 1, NULL),
(9196, 'intg_erp_mes_reconcile_status', '待对账', 'PENDING', 1, 1, NULL),
(9197, 'intg_erp_mes_reconcile_status', '已平账', 'BALANCED', 2, 1, NULL),
(9198, 'intg_erp_mes_reconcile_status', '存在差异', 'DIFF', 3, 1, NULL),
(9199, 'intg_erp_mes_reconcile_status', '已关闭', 'CLOSED', 4, 1, NULL);

-- ========== ERP→MES 集成可配置项（6821-6833） ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(6821, 'INTG', 'intg.erp-mes.enabled', 'ERP→MES 集成启用开关', 'true', 0, 1, 'ERP→MES 集成总开关，默认启用'),
(6822, 'INTG', 'intg.erp-mes.batch.size', '同步批次单批条数', '200', 1, 1, '单批同步条数，待业务方确认并发规模后调整'),
(6823, 'INTG', 'intg.erp-mes.retry.times', '失败重试次数', '3', 1, 1, '接口失败自动重试次数，待业务方确认'),
(6824, 'INTG', 'intg.erp-mes.timeout.ms', '接口超时时间（毫秒）', '30000', 1, 1, '接口调用超时时间，待业务方确认'),
(6825, 'INTG', 'intg.erp-mes.idempotent.window.hours', '幂等窗口（小时）', '24', 1, 1, '幂等判重时间窗口，待业务方确认'),
(6826, 'INTG', 'intg.erp-mes.receipt.auto', 'MES 回执自动生成', 'true', 0, 1, 'MES 校验通过后自动生成回执'),
(6827, 'INTG', 'intg.erp-mes.reconcile.cron', '对账任务计划表达式', '0 0 2 * * ?', 1, 1, '每日对账任务 Cron，待业务方确认对账频率'),
(6828, 'INTG', 'intg.erp-mes.interface.no.prefix', '集成接口编号前缀', 'EMI', 0, 1, '集成接口编号自动生成前缀'),
(6829, 'INTG', 'intg.erp-mes.mapping.no.prefix', '字段映射编号前缀', 'EMM', 0, 1, '字段映射编号自动生成前缀'),
(6830, 'INTG', 'intg.erp-mes.batch.no.prefix', '同步批次编号前缀', 'EMB', 0, 1, '同步批次编号自动生成前缀'),
(6831, 'INTG', 'intg.erp-mes.receipt.no.prefix', '接收回执编号前缀', 'EMR', 0, 1, '接收回执编号自动生成前缀'),
(6832, 'INTG', 'intg.erp-mes.compensation.no.prefix', '异常补偿编号前缀', 'EMC', 0, 1, '异常补偿编号自动生成前缀'),
(6833, 'INTG', 'intg.erp-mes.reconcile.no.prefix', '对账编号前缀', 'EMO', 0, 1, '对账编号自动生成前缀');
