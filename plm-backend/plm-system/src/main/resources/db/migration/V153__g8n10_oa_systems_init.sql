-- G8-N10 六系统集成—OA↔六系统（WBS T071）初始化：菜单/按钮权限、角色授权、字典与可配置项。
-- 号段基线（V151 之后实测）：sys_permission=5133（本脚本从 5134 起）、
-- sys_role_permission=16243（从 16244 起）、sys_dictionary=9326（从 9327 起）、sys_config=6872（从 6873 起）。
-- 菜单说明：G8「系统集成」顶级菜单域（4962，V135 建立）复用，本节点新增二级方向分组
--          OA↔六系统（5134），覆盖集成接口、字段映射、同步批次、接收回执、异常补偿、对账。

-- ========== OA↔六系统集成方向分组（5134，挂在 4962 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(5134, 'intg:oa-systems', 'OA↔六系统集成', 'menu', 4962, '/intg/oa-systems', 'SwapOutlined', 10, 1);

-- ========== OA↔六系统业务菜单（5135-5140，挂在 5134 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(5135, 'intg:oa-systems:interface', '集成接口', 'menu', 5134, '/intg/oa-systems/interfaces', 'ApiOutlined', 1, 1),
(5136, 'intg:oa-systems:mapping', '字段映射', 'menu', 5134, '/intg/oa-systems/mappings', 'PartitionOutlined', 2, 1),
(5137, 'intg:oa-systems:batch', '同步批次', 'menu', 5134, '/intg/oa-systems/batches', 'SyncOutlined', 3, 1),
(5138, 'intg:oa-systems:receipt', '接收回执', 'menu', 5134, '/intg/oa-systems/receipts', 'AuditOutlined', 4, 1),
(5139, 'intg:oa-systems:compensation', '异常补偿', 'menu', 5134, '/intg/oa-systems/compensations', 'ToolOutlined', 5, 1),
(5140, 'intg:oa-systems:reconcile', '对账', 'menu', 5134, '/intg/oa-systems/reconciles', 'BalanceOutlined', 6, 1);

-- ========== OA↔六系统按钮（5141-5152） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(5141, 'intg:oa-systems:interface:list', '查询集成接口', 'button', 5135, NULL, NULL, 1, 1),
(5142, 'intg:oa-systems:interface:manage', '维护集成接口', 'button', 5135, NULL, NULL, 2, 1),
(5143, 'intg:oa-systems:mapping:list', '查询字段映射', 'button', 5136, NULL, NULL, 1, 1),
(5144, 'intg:oa-systems:mapping:manage', '维护字段映射', 'button', 5136, NULL, NULL, 2, 1),
(5145, 'intg:oa-systems:batch:list', '查询同步批次', 'button', 5137, NULL, NULL, 1, 1),
(5146, 'intg:oa-systems:batch:manage', '维护同步批次', 'button', 5137, NULL, NULL, 2, 1),
(5147, 'intg:oa-systems:receipt:list', '查询接收回执', 'button', 5138, NULL, NULL, 1, 1),
(5148, 'intg:oa-systems:receipt:manage', '维护接收回执', 'button', 5138, NULL, NULL, 2, 1),
(5149, 'intg:oa-systems:compensation:list', '查询异常补偿', 'button', 5139, NULL, NULL, 1, 1),
(5150, 'intg:oa-systems:compensation:manage', '维护异常补偿', 'button', 5139, NULL, NULL, 2, 1),
(5151, 'intg:oa-systems:reconcile:list', '查询对账', 'button', 5140, NULL, NULL, 1, 1),
(5152, 'intg:oa-systems:reconcile:manage', '维护对账', 'button', 5140, NULL, NULL, 2, 1);

-- ========== 角色授权（16244-16333） ==========

-- 系统管理员（2001）：授予全部权限（19 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(16244, 2001, 5134), (16245, 2001, 5135), (16246, 2001, 5136), (16247, 2001, 5137),
(16248, 2001, 5138), (16249, 2001, 5139), (16250, 2001, 5140), (16251, 2001, 5141),
(16252, 2001, 5142), (16253, 2001, 5143), (16254, 2001, 5144), (16255, 2001, 5145),
(16256, 2001, 5146), (16257, 2001, 5147), (16258, 2001, 5148), (16259, 2001, 5149),
(16260, 2001, 5150), (16261, 2001, 5151), (16262, 2001, 5152);

-- 研发工程师（2002）：授予全部权限（OA 办公门户与协同流程主要使用方，共 19 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(16263, 2002, 5134), (16264, 2002, 5135), (16265, 2002, 5136), (16266, 2002, 5137),
(16267, 2002, 5138), (16268, 2002, 5139), (16269, 2002, 5140), (16270, 2002, 5141),
(16271, 2002, 5142), (16272, 2002, 5143), (16273, 2002, 5144), (16274, 2002, 5145),
(16275, 2002, 5146), (16276, 2002, 5147), (16277, 2002, 5148), (16278, 2002, 5149),
(16279, 2002, 5150), (16280, 2002, 5151), (16281, 2002, 5152);

-- 生产现场（2005）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(16282, 2005, 5134), (16283, 2005, 5135), (16284, 2005, 5136), (16285, 2005, 5137),
(16286, 2005, 5138), (16287, 2005, 5139), (16288, 2005, 5140), (16289, 2005, 5141),
(16290, 2005, 5143), (16291, 2005, 5145), (16292, 2005, 5147), (16293, 2005, 5149),
(16294, 2005, 5151);

-- 质量工程师（2003）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(16295, 2003, 5134), (16296, 2003, 5135), (16297, 2003, 5136), (16298, 2003, 5137),
(16299, 2003, 5138), (16300, 2003, 5139), (16301, 2003, 5140), (16302, 2003, 5141),
(16303, 2003, 5143), (16304, 2003, 5145), (16305, 2003, 5147), (16306, 2003, 5149),
(16307, 2003, 5151);

-- 供应链专员（2004）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(16308, 2004, 5134), (16309, 2004, 5135), (16310, 2004, 5136), (16311, 2004, 5137),
(16312, 2004, 5138), (16313, 2004, 5139), (16314, 2004, 5140), (16315, 2004, 5141),
(16316, 2004, 5143), (16317, 2004, 5145), (16318, 2004, 5147), (16319, 2004, 5149),
(16320, 2004, 5151);

-- 只读用户（2006）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(16321, 2006, 5134), (16322, 2006, 5135), (16323, 2006, 5136), (16324, 2006, 5137),
(16325, 2006, 5138), (16326, 2006, 5139), (16327, 2006, 5140), (16328, 2006, 5141),
(16329, 2006, 5143), (16330, 2006, 5145), (16331, 2006, 5147), (16332, 2006, 5149),
(16333, 2006, 5151);

-- ========== OA↔六系统集成字典（9327-9367） ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(9327, 'intg_oa_systems_object_type', '统一待办', 'UNIFIED_TODO', 1, 1, NULL),
(9328, 'intg_oa_systems_object_type', '审批', 'APPROVAL', 2, 1, NULL),
(9329, 'intg_oa_systems_object_type', '通知', 'NOTIFICATION', 3, 1, NULL),
(9330, 'intg_oa_systems_object_type', '业务单据链接', 'BIZ_DOC_LINK', 4, 1, NULL),
(9331, 'intg_oa_systems_object_type', '组织权限同步', 'ORG_PERM_SYNC', 5, 1, NULL),
(9332, 'intg_oa_systems_protocol', 'API 接口', 'API', 1, 1, NULL),
(9333, 'intg_oa_systems_protocol', '事件消息', 'EVENT', 2, 1, NULL),
(9334, 'intg_oa_systems_protocol', '批量文件', 'FILE', 3, 1, NULL),
(9335, 'intg_oa_systems_trigger_type', '手工触发', 'MANUAL', 1, 1, NULL),
(9336, 'intg_oa_systems_trigger_type', '定时触发', 'SCHEDULED', 2, 1, NULL),
(9337, 'intg_oa_systems_trigger_type', '事件触发', 'EVENT', 3, 1, NULL),
(9338, 'intg_oa_systems_sync_mode', '全量', 'FULL', 1, 1, NULL),
(9339, 'intg_oa_systems_sync_mode', '增量', 'INCREMENTAL', 2, 1, NULL),
(9340, 'intg_oa_systems_interface_status', '草稿', 'DRAFT', 1, 1, NULL),
(9341, 'intg_oa_systems_interface_status', '启用', 'ACTIVE', 2, 1, NULL),
(9342, 'intg_oa_systems_interface_status', '停用', 'DISABLED', 3, 1, NULL),
(9343, 'intg_oa_systems_mapping_status', '草稿', 'DRAFT', 1, 1, NULL),
(9344, 'intg_oa_systems_mapping_status', '启用', 'ACTIVE', 2, 1, NULL),
(9345, 'intg_oa_systems_mapping_status', '停用', 'DISABLED', 3, 1, NULL),
(9346, 'intg_oa_systems_batch_status', '待执行', 'PENDING', 1, 1, NULL),
(9347, 'intg_oa_systems_batch_status', '执行中', 'RUNNING', 2, 1, NULL),
(9348, 'intg_oa_systems_batch_status', '成功', 'SUCCESS', 3, 1, NULL),
(9349, 'intg_oa_systems_batch_status', '部分成功', 'PARTIAL', 4, 1, NULL),
(9350, 'intg_oa_systems_batch_status', '失败', 'FAILED', 5, 1, NULL),
(9351, 'intg_oa_systems_receipt_status', '待回执', 'PENDING', 1, 1, NULL),
(9352, 'intg_oa_systems_receipt_status', '已接收', 'ACCEPTED', 2, 1, NULL),
(9353, 'intg_oa_systems_receipt_status', '已拒绝', 'REJECTED', 3, 1, NULL),
(9354, 'intg_oa_systems_receipt_status', '警告', 'WARN', 4, 1, NULL),
(9355, 'intg_oa_systems_error_type', '校验失败', 'VALIDATION', 1, 1, NULL),
(9356, 'intg_oa_systems_error_type', '超时', 'TIMEOUT', 2, 1, NULL),
(9357, 'intg_oa_systems_error_type', '数据冲突', 'CONFLICT', 3, 1, NULL),
(9358, 'intg_oa_systems_error_type', '网络异常', 'NETWORK', 4, 1, NULL),
(9359, 'intg_oa_systems_error_type', '其他', 'OTHER', 5, 1, NULL),
(9360, 'intg_oa_systems_compensation_status', '待处理', 'PENDING', 1, 1, NULL),
(9361, 'intg_oa_systems_compensation_status', '处理中', 'PROCESSING', 2, 1, NULL),
(9362, 'intg_oa_systems_compensation_status', '已解决', 'RESOLVED', 3, 1, NULL),
(9363, 'intg_oa_systems_compensation_status', '已忽略', 'IGNORED', 4, 1, NULL),
(9364, 'intg_oa_systems_reconcile_status', '待对账', 'PENDING', 1, 1, NULL),
(9365, 'intg_oa_systems_reconcile_status', '已平账', 'BALANCED', 2, 1, NULL),
(9366, 'intg_oa_systems_reconcile_status', '存在差异', 'DIFF', 3, 1, NULL),
(9367, 'intg_oa_systems_reconcile_status', '已关闭', 'CLOSED', 4, 1, NULL);

-- ========== OA↔六系统集成可配置项（6873-6885） ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(6873, 'INTG', 'intg.oa-systems.enabled', 'OA↔六系统集成启用开关', 'true', 0, 1, 'OA↔六系统集成总开关，默认启用'),
(6874, 'INTG', 'intg.oa-systems.batch.size', '同步批次单批条数', '200', 1, 1, '单批同步条数，待业务方确认并发规模后调整'),
(6875, 'INTG', 'intg.oa-systems.retry.times', '失败重试次数', '3', 1, 1, '接口失败自动重试次数，待业务方确认'),
(6876, 'INTG', 'intg.oa-systems.timeout.ms', '接口超时时间（毫秒）', '30000', 1, 1, '接口调用超时时间，待业务方确认'),
(6877, 'INTG', 'intg.oa-systems.idempotent.window.hours', '幂等窗口（小时）', '24', 1, 1, '幂等判重时间窗口，待业务方确认'),
(6878, 'INTG', 'intg.oa-systems.receipt.auto', '系统回执自动生成', 'true', 0, 1, '系统校验通过后自动生成回执'),
(6879, 'INTG', 'intg.oa-systems.reconcile.cron', '对账任务计划表达式', '0 0 2 * * ?', 1, 1, '每日对账任务 Cron，待业务方确认对账频率'),
(6880, 'INTG', 'intg.oa-systems.interface.no.prefix', '集成接口编号前缀', 'OAI', 0, 1, '集成接口编号自动生成前缀'),
(6881, 'INTG', 'intg.oa-systems.mapping.no.prefix', '字段映射编号前缀', 'OAM', 0, 1, '字段映射编号自动生成前缀'),
(6882, 'INTG', 'intg.oa-systems.batch.no.prefix', '同步批次编号前缀', 'OAB', 0, 1, '同步批次编号自动生成前缀'),
(6883, 'INTG', 'intg.oa-systems.receipt.no.prefix', '接收回执编号前缀', 'OAR', 0, 1, '接收回执编号自动生成前缀'),
(6884, 'INTG', 'intg.oa-systems.compensation.no.prefix', '异常补偿编号前缀', 'OAC', 0, 1, '异常补偿编号自动生成前缀'),
(6885, 'INTG', 'intg.oa-systems.reconcile.no.prefix', '对账编号前缀', 'OAO', 0, 1, '对账编号自动生成前缀');
