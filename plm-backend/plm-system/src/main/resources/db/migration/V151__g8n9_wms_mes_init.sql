-- G8-N9 六系统集成—WMS↔MES（WBS T070）初始化：菜单/按钮权限、角色授权、字典与可配置项。
-- 号段基线（V149 之后实测）：sys_permission=5114（本脚本从 5115 起）、
-- sys_role_permission=16153（从 16154 起）、sys_dictionary=9285（从 9286 起）、sys_config=6859（从 6860 起）。
-- 菜单说明：G8「系统集成」顶级菜单域（4962，V135 建立）复用，本节点新增二级方向分组
--          WMS↔MES（5115），覆盖集成接口、字段映射、同步批次、接收回执、异常补偿、对账。

-- ========== WMS↔MES 集成方向分组（5115，挂在 4962 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(5115, 'intg:wms-mes', 'WMS↔MES 集成', 'menu', 4962, '/intg/wms-mes', 'SwapOutlined', 9, 1);

-- ========== WMS↔MES 业务菜单（5116-5121，挂在 5115 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(5116, 'intg:wms-mes:interface', '集成接口', 'menu', 5115, '/intg/wms-mes/interfaces', 'ApiOutlined', 1, 1),
(5117, 'intg:wms-mes:mapping', '字段映射', 'menu', 5115, '/intg/wms-mes/mappings', 'PartitionOutlined', 2, 1),
(5118, 'intg:wms-mes:batch', '同步批次', 'menu', 5115, '/intg/wms-mes/batches', 'SyncOutlined', 3, 1),
(5119, 'intg:wms-mes:receipt', '接收回执', 'menu', 5115, '/intg/wms-mes/receipts', 'AuditOutlined', 4, 1),
(5120, 'intg:wms-mes:compensation', '异常补偿', 'menu', 5115, '/intg/wms-mes/compensations', 'ToolOutlined', 5, 1),
(5121, 'intg:wms-mes:reconcile', '对账', 'menu', 5115, '/intg/wms-mes/reconciles', 'BalanceOutlined', 6, 1);

-- ========== WMS↔MES 按钮（5122-5133） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(5122, 'intg:wms-mes:interface:list', '查询集成接口', 'button', 5116, NULL, NULL, 1, 1),
(5123, 'intg:wms-mes:interface:manage', '维护集成接口', 'button', 5116, NULL, NULL, 2, 1),
(5124, 'intg:wms-mes:mapping:list', '查询字段映射', 'button', 5117, NULL, NULL, 1, 1),
(5125, 'intg:wms-mes:mapping:manage', '维护字段映射', 'button', 5117, NULL, NULL, 2, 1),
(5126, 'intg:wms-mes:batch:list', '查询同步批次', 'button', 5118, NULL, NULL, 1, 1),
(5127, 'intg:wms-mes:batch:manage', '维护同步批次', 'button', 5118, NULL, NULL, 2, 1),
(5128, 'intg:wms-mes:receipt:list', '查询接收回执', 'button', 5119, NULL, NULL, 1, 1),
(5129, 'intg:wms-mes:receipt:manage', '维护接收回执', 'button', 5119, NULL, NULL, 2, 1),
(5130, 'intg:wms-mes:compensation:list', '查询异常补偿', 'button', 5120, NULL, NULL, 1, 1),
(5131, 'intg:wms-mes:compensation:manage', '维护异常补偿', 'button', 5120, NULL, NULL, 2, 1),
(5132, 'intg:wms-mes:reconcile:list', '查询对账', 'button', 5121, NULL, NULL, 1, 1),
(5133, 'intg:wms-mes:reconcile:manage', '维护对账', 'button', 5121, NULL, NULL, 2, 1);

-- ========== 角色授权（16154-16243） ==========

-- 系统管理员（2001）：授予全部权限（19 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(16154, 2001, 5115), (16155, 2001, 5116), (16156, 2001, 5117), (16157, 2001, 5118),
(16158, 2001, 5119), (16159, 2001, 5120), (16160, 2001, 5121), (16161, 2001, 5122),
(16162, 2001, 5123), (16163, 2001, 5124), (16164, 2001, 5125), (16165, 2001, 5126),
(16166, 2001, 5127), (16167, 2001, 5128), (16168, 2001, 5129), (16169, 2001, 5130),
(16170, 2001, 5131), (16171, 2001, 5132), (16172, 2001, 5133);

-- 生产现场（2005）：授予全部权限（MES 为生产领用方、WMS 为配送执行方，共 19 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(16173, 2005, 5115), (16174, 2005, 5116), (16175, 2005, 5117), (16176, 2005, 5118),
(16177, 2005, 5119), (16178, 2005, 5120), (16179, 2005, 5121), (16180, 2005, 5122),
(16181, 2005, 5123), (16182, 2005, 5124), (16183, 2005, 5125), (16184, 2005, 5126),
(16185, 2005, 5127), (16186, 2005, 5128), (16187, 2005, 5129), (16188, 2005, 5130),
(16189, 2005, 5131), (16190, 2005, 5132), (16191, 2005, 5133);

-- 研发工程师（2002）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(16192, 2002, 5115), (16193, 2002, 5116), (16194, 2002, 5117), (16195, 2002, 5118),
(16196, 2002, 5119), (16197, 2002, 5120), (16198, 2002, 5121), (16199, 2002, 5122),
(16200, 2002, 5124), (16201, 2002, 5126), (16202, 2002, 5128), (16203, 2002, 5130),
(16204, 2002, 5132);

-- 质量工程师（2003）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(16205, 2003, 5115), (16206, 2003, 5116), (16207, 2003, 5117), (16208, 2003, 5118),
(16209, 2003, 5119), (16210, 2003, 5120), (16211, 2003, 5121), (16212, 2003, 5122),
(16213, 2003, 5124), (16214, 2003, 5126), (16215, 2003, 5128), (16216, 2003, 5130),
(16217, 2003, 5132);

-- 供应链专员（2004）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(16218, 2004, 5115), (16219, 2004, 5116), (16220, 2004, 5117), (16221, 2004, 5118),
(16222, 2004, 5119), (16223, 2004, 5120), (16224, 2004, 5121), (16225, 2004, 5122),
(16226, 2004, 5124), (16227, 2004, 5126), (16228, 2004, 5128), (16229, 2004, 5130),
(16230, 2004, 5132);

-- 只读用户（2006）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(16231, 2006, 5115), (16232, 2006, 5116), (16233, 2006, 5117), (16234, 2006, 5118),
(16235, 2006, 5119), (16236, 2006, 5120), (16237, 2006, 5121), (16238, 2006, 5122),
(16239, 2006, 5124), (16240, 2006, 5126), (16241, 2006, 5128), (16242, 2006, 5130),
(16243, 2006, 5132);

-- ========== WMS↔MES 集成字典（9286-9326） ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(9286, 'intg_wms_mes_object_type', '线边配送', 'LINE_SIDE_DELIVERY', 1, 1, NULL),
(9287, 'intg_wms_mes_object_type', '工单齐套', 'WORK_ORDER_KITTING', 2, 1, NULL),
(9288, 'intg_wms_mes_object_type', '领料消耗', 'MATERIAL_CONSUMPTION', 3, 1, NULL),
(9289, 'intg_wms_mes_object_type', '退补料', 'REPLENISH_RETURN', 4, 1, NULL),
(9290, 'intg_wms_mes_object_type', '批次/序列号反馈', 'BATCH_SERIAL_FEEDBACK', 5, 1, NULL),
(9291, 'intg_wms_mes_protocol', 'API 接口', 'API', 1, 1, NULL),
(9292, 'intg_wms_mes_protocol', '事件消息', 'EVENT', 2, 1, NULL),
(9293, 'intg_wms_mes_protocol', '批量文件', 'FILE', 3, 1, NULL),
(9294, 'intg_wms_mes_trigger_type', '手工触发', 'MANUAL', 1, 1, NULL),
(9295, 'intg_wms_mes_trigger_type', '定时触发', 'SCHEDULED', 2, 1, NULL),
(9296, 'intg_wms_mes_trigger_type', '事件触发', 'EVENT', 3, 1, NULL),
(9297, 'intg_wms_mes_sync_mode', '全量', 'FULL', 1, 1, NULL),
(9298, 'intg_wms_mes_sync_mode', '增量', 'INCREMENTAL', 2, 1, NULL),
(9299, 'intg_wms_mes_interface_status', '草稿', 'DRAFT', 1, 1, NULL),
(9300, 'intg_wms_mes_interface_status', '启用', 'ACTIVE', 2, 1, NULL),
(9301, 'intg_wms_mes_interface_status', '停用', 'DISABLED', 3, 1, NULL),
(9302, 'intg_wms_mes_mapping_status', '草稿', 'DRAFT', 1, 1, NULL),
(9303, 'intg_wms_mes_mapping_status', '启用', 'ACTIVE', 2, 1, NULL),
(9304, 'intg_wms_mes_mapping_status', '停用', 'DISABLED', 3, 1, NULL),
(9305, 'intg_wms_mes_batch_status', '待执行', 'PENDING', 1, 1, NULL),
(9306, 'intg_wms_mes_batch_status', '执行中', 'RUNNING', 2, 1, NULL),
(9307, 'intg_wms_mes_batch_status', '成功', 'SUCCESS', 3, 1, NULL),
(9308, 'intg_wms_mes_batch_status', '部分成功', 'PARTIAL', 4, 1, NULL),
(9309, 'intg_wms_mes_batch_status', '失败', 'FAILED', 5, 1, NULL),
(9310, 'intg_wms_mes_receipt_status', '待回执', 'PENDING', 1, 1, NULL),
(9311, 'intg_wms_mes_receipt_status', '已接收', 'ACCEPTED', 2, 1, NULL),
(9312, 'intg_wms_mes_receipt_status', '已拒绝', 'REJECTED', 3, 1, NULL),
(9313, 'intg_wms_mes_receipt_status', '警告', 'WARN', 4, 1, NULL),
(9314, 'intg_wms_mes_error_type', '校验失败', 'VALIDATION', 1, 1, NULL),
(9315, 'intg_wms_mes_error_type', '超时', 'TIMEOUT', 2, 1, NULL),
(9316, 'intg_wms_mes_error_type', '数据冲突', 'CONFLICT', 3, 1, NULL),
(9317, 'intg_wms_mes_error_type', '网络异常', 'NETWORK', 4, 1, NULL),
(9318, 'intg_wms_mes_error_type', '其他', 'OTHER', 5, 1, NULL),
(9319, 'intg_wms_mes_compensation_status', '待处理', 'PENDING', 1, 1, NULL),
(9320, 'intg_wms_mes_compensation_status', '处理中', 'PROCESSING', 2, 1, NULL),
(9321, 'intg_wms_mes_compensation_status', '已解决', 'RESOLVED', 3, 1, NULL),
(9322, 'intg_wms_mes_compensation_status', '已忽略', 'IGNORED', 4, 1, NULL),
(9323, 'intg_wms_mes_reconcile_status', '待对账', 'PENDING', 1, 1, NULL),
(9324, 'intg_wms_mes_reconcile_status', '已平账', 'BALANCED', 2, 1, NULL),
(9325, 'intg_wms_mes_reconcile_status', '存在差异', 'DIFF', 3, 1, NULL),
(9326, 'intg_wms_mes_reconcile_status', '已关闭', 'CLOSED', 4, 1, NULL);

-- ========== WMS↔MES 集成可配置项（6860-6872） ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(6860, 'INTG', 'intg.wms-mes.enabled', 'WMS↔MES 集成启用开关', 'true', 0, 1, 'WMS↔MES 集成总开关，默认启用'),
(6861, 'INTG', 'intg.wms-mes.batch.size', '同步批次单批条数', '200', 1, 1, '单批同步条数，待业务方确认并发规模后调整'),
(6862, 'INTG', 'intg.wms-mes.retry.times', '失败重试次数', '3', 1, 1, '接口失败自动重试次数，待业务方确认'),
(6863, 'INTG', 'intg.wms-mes.timeout.ms', '接口超时时间（毫秒）', '30000', 1, 1, '接口调用超时时间，待业务方确认'),
(6864, 'INTG', 'intg.wms-mes.idempotent.window.hours', '幂等窗口（小时）', '24', 1, 1, '幂等判重时间窗口，待业务方确认'),
(6865, 'INTG', 'intg.wms-mes.receipt.auto', 'MES 回执自动生成', 'true', 0, 1, 'MES 校验通过后自动生成回执'),
(6866, 'INTG', 'intg.wms-mes.reconcile.cron', '对账任务计划表达式', '0 0 2 * * ?', 1, 1, '每日对账任务 Cron，待业务方确认对账频率'),
(6867, 'INTG', 'intg.wms-mes.interface.no.prefix', '集成接口编号前缀', 'WMI', 0, 1, '集成接口编号自动生成前缀'),
(6868, 'INTG', 'intg.wms-mes.mapping.no.prefix', '字段映射编号前缀', 'WMM', 0, 1, '字段映射编号自动生成前缀'),
(6869, 'INTG', 'intg.wms-mes.batch.no.prefix', '同步批次编号前缀', 'WMB', 0, 1, '同步批次编号自动生成前缀'),
(6870, 'INTG', 'intg.wms-mes.receipt.no.prefix', '接收回执编号前缀', 'WMR', 0, 1, '接收回执编号自动生成前缀'),
(6871, 'INTG', 'intg.wms-mes.compensation.no.prefix', '异常补偿编号前缀', 'WMC', 0, 1, '异常补偿编号自动生成前缀'),
(6872, 'INTG', 'intg.wms-mes.reconcile.no.prefix', '对账编号前缀', 'WMO', 0, 1, '对账编号自动生成前缀');
