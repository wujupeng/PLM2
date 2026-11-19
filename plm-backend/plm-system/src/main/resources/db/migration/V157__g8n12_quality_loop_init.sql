-- G8-N12 六系统集成—质量闭环（WBS T073）初始化：菜单/按钮权限、角色授权、字典与可配置项。
-- 号段基线（V155 之后实测）：sys_permission=5171（本脚本从 5172 起）、
-- sys_role_permission=16423（从 16424 起）、sys_dictionary=9408（从 9409 起）、sys_config=6898（从 6899 起）。
-- 菜单说明：G8「系统集成」顶级菜单域（4962，V135 建立）复用，本节点新增二级方向分组
--          质量闭环（5172），覆盖集成接口、字段映射、同步批次、接收回执、异常补偿、对账。

-- ========== 质量闭环集成方向分组（5172，挂在 4962 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(5172, 'intg:quality-loop', '质量闭环集成', 'menu', 4962, '/intg/quality-loop', 'SwapOutlined', 12, 1);

-- ========== 质量闭环业务菜单（5173-5178，挂在 5172 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(5173, 'intg:quality-loop:interface', '集成接口', 'menu', 5172, '/intg/quality-loop/interfaces', 'ApiOutlined', 1, 1),
(5174, 'intg:quality-loop:mapping', '字段映射', 'menu', 5172, '/intg/quality-loop/mappings', 'PartitionOutlined', 2, 1),
(5175, 'intg:quality-loop:batch', '同步批次', 'menu', 5172, '/intg/quality-loop/batches', 'SyncOutlined', 3, 1),
(5176, 'intg:quality-loop:receipt', '接收回执', 'menu', 5172, '/intg/quality-loop/receipts', 'AuditOutlined', 4, 1),
(5177, 'intg:quality-loop:compensation', '异常补偿', 'menu', 5172, '/intg/quality-loop/compensations', 'ToolOutlined', 5, 1),
(5178, 'intg:quality-loop:reconcile', '对账', 'menu', 5172, '/intg/quality-loop/reconciles', 'BalanceOutlined', 6, 1);

-- ========== 质量闭环按钮（5179-5190） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(5179, 'intg:quality-loop:interface:list', '查询集成接口', 'button', 5173, NULL, NULL, 1, 1),
(5180, 'intg:quality-loop:interface:manage', '维护集成接口', 'button', 5173, NULL, NULL, 2, 1),
(5181, 'intg:quality-loop:mapping:list', '查询字段映射', 'button', 5174, NULL, NULL, 1, 1),
(5182, 'intg:quality-loop:mapping:manage', '维护字段映射', 'button', 5174, NULL, NULL, 2, 1),
(5183, 'intg:quality-loop:batch:list', '查询同步批次', 'button', 5175, NULL, NULL, 1, 1),
(5184, 'intg:quality-loop:batch:manage', '维护同步批次', 'button', 5175, NULL, NULL, 2, 1),
(5185, 'intg:quality-loop:receipt:list', '查询接收回执', 'button', 5176, NULL, NULL, 1, 1),
(5186, 'intg:quality-loop:receipt:manage', '维护接收回执', 'button', 5176, NULL, NULL, 2, 1),
(5187, 'intg:quality-loop:compensation:list', '查询异常补偿', 'button', 5177, NULL, NULL, 1, 1),
(5188, 'intg:quality-loop:compensation:manage', '维护异常补偿', 'button', 5177, NULL, NULL, 2, 1),
(5189, 'intg:quality-loop:reconcile:list', '查询对账', 'button', 5178, NULL, NULL, 1, 1),
(5190, 'intg:quality-loop:reconcile:manage', '维护对账', 'button', 5178, NULL, NULL, 2, 1);

-- ========== 角色授权（16424-16513） ==========

-- 系统管理员（2001）：授予全部权限（19 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(16424, 2001, 5172), (16425, 2001, 5173), (16426, 2001, 5174), (16427, 2001, 5175),
(16428, 2001, 5176), (16429, 2001, 5177), (16430, 2001, 5178), (16431, 2001, 5179),
(16432, 2001, 5180), (16433, 2001, 5181), (16434, 2001, 5182), (16435, 2001, 5183),
(16436, 2001, 5184), (16437, 2001, 5185), (16438, 2001, 5186), (16439, 2001, 5187),
(16440, 2001, 5188), (16441, 2001, 5189), (16442, 2001, 5190);

-- 质量工程师（2003）：授予全部权限（质量闭环与 8D/ECR/ECO 主责角色，共 19 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(16443, 2003, 5172), (16444, 2003, 5173), (16445, 2003, 5174), (16446, 2003, 5175),
(16447, 2003, 5176), (16448, 2003, 5177), (16449, 2003, 5178), (16450, 2003, 5179),
(16451, 2003, 5180), (16452, 2003, 5181), (16453, 2003, 5182), (16454, 2003, 5183),
(16455, 2003, 5184), (16456, 2003, 5185), (16457, 2003, 5186), (16458, 2003, 5187),
(16459, 2003, 5188), (16460, 2003, 5189), (16461, 2003, 5190);

-- 生产现场（2005）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(16462, 2005, 5172), (16463, 2005, 5173), (16464, 2005, 5174), (16465, 2005, 5175),
(16466, 2005, 5176), (16467, 2005, 5177), (16468, 2005, 5178), (16469, 2005, 5179),
(16470, 2005, 5181), (16471, 2005, 5183), (16472, 2005, 5185), (16473, 2005, 5187),
(16474, 2005, 5189);

-- 供应链专员（2004）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(16475, 2004, 5172), (16476, 2004, 5173), (16477, 2004, 5174), (16478, 2004, 5175),
(16479, 2004, 5176), (16480, 2004, 5177), (16481, 2004, 5178), (16482, 2004, 5179),
(16483, 2004, 5181), (16484, 2004, 5183), (16485, 2004, 5185), (16486, 2004, 5187),
(16487, 2004, 5189);

-- 研发工程师（2002）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(16488, 2002, 5172), (16489, 2002, 5173), (16490, 2002, 5174), (16491, 2002, 5175),
(16492, 2002, 5176), (16493, 2002, 5177), (16494, 2002, 5178), (16495, 2002, 5179),
(16496, 2002, 5181), (16497, 2002, 5183), (16498, 2002, 5185), (16499, 2002, 5187),
(16500, 2002, 5189);

-- 只读用户（2006）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(16501, 2006, 5172), (16502, 2006, 5173), (16503, 2006, 5174), (16504, 2006, 5175),
(16505, 2006, 5176), (16506, 2006, 5177), (16507, 2006, 5178), (16508, 2006, 5179),
(16509, 2006, 5181), (16510, 2006, 5183), (16511, 2006, 5185), (16512, 2006, 5187),
(16513, 2006, 5189);

-- ========== 质量闭环集成字典（9409-9449） ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(9409, 'intg_quality_loop_object_type', '质量异常', 'QUALITY_EXCEPTION', 1, 1, NULL),
(9410, 'intg_quality_loop_object_type', '质量隔离', 'QUALITY_ISOLATION', 2, 1, NULL),
(9411, 'intg_quality_loop_object_type', '8D 报告', 'EIGHT_D', 3, 1, NULL),
(9412, 'intg_quality_loop_object_type', '工程变更请求', 'ECR', 4, 1, NULL),
(9413, 'intg_quality_loop_object_type', '工程变更单', 'ECO', 5, 1, NULL),
(9414, 'intg_quality_loop_protocol', 'API 接口', 'API', 1, 1, NULL),
(9415, 'intg_quality_loop_protocol', '事件消息', 'EVENT', 2, 1, NULL),
(9416, 'intg_quality_loop_protocol', '批量文件', 'FILE', 3, 1, NULL),
(9417, 'intg_quality_loop_trigger_type', '手工触发', 'MANUAL', 1, 1, NULL),
(9418, 'intg_quality_loop_trigger_type', '定时触发', 'SCHEDULED', 2, 1, NULL),
(9419, 'intg_quality_loop_trigger_type', '事件触发', 'EVENT', 3, 1, NULL),
(9420, 'intg_quality_loop_sync_mode', '全量', 'FULL', 1, 1, NULL),
(9421, 'intg_quality_loop_sync_mode', '增量', 'INCREMENTAL', 2, 1, NULL),
(9422, 'intg_quality_loop_interface_status', '草稿', 'DRAFT', 1, 1, NULL),
(9423, 'intg_quality_loop_interface_status', '启用', 'ACTIVE', 2, 1, NULL),
(9424, 'intg_quality_loop_interface_status', '停用', 'DISABLED', 3, 1, NULL),
(9425, 'intg_quality_loop_mapping_status', '草稿', 'DRAFT', 1, 1, NULL),
(9426, 'intg_quality_loop_mapping_status', '启用', 'ACTIVE', 2, 1, NULL),
(9427, 'intg_quality_loop_mapping_status', '停用', 'DISABLED', 3, 1, NULL),
(9428, 'intg_quality_loop_batch_status', '待执行', 'PENDING', 1, 1, NULL),
(9429, 'intg_quality_loop_batch_status', '执行中', 'RUNNING', 2, 1, NULL),
(9430, 'intg_quality_loop_batch_status', '成功', 'SUCCESS', 3, 1, NULL),
(9431, 'intg_quality_loop_batch_status', '部分成功', 'PARTIAL', 4, 1, NULL),
(9432, 'intg_quality_loop_batch_status', '失败', 'FAILED', 5, 1, NULL),
(9433, 'intg_quality_loop_receipt_status', '待回执', 'PENDING', 1, 1, NULL),
(9434, 'intg_quality_loop_receipt_status', '已接收', 'ACCEPTED', 2, 1, NULL),
(9435, 'intg_quality_loop_receipt_status', '已拒绝', 'REJECTED', 3, 1, NULL),
(9436, 'intg_quality_loop_receipt_status', '警告', 'WARN', 4, 1, NULL),
(9437, 'intg_quality_loop_error_type', '校验失败', 'VALIDATION', 1, 1, NULL),
(9438, 'intg_quality_loop_error_type', '超时', 'TIMEOUT', 2, 1, NULL),
(9439, 'intg_quality_loop_error_type', '数据冲突', 'CONFLICT', 3, 1, NULL),
(9440, 'intg_quality_loop_error_type', '网络异常', 'NETWORK', 4, 1, NULL),
(9441, 'intg_quality_loop_error_type', '其他', 'OTHER', 5, 1, NULL),
(9442, 'intg_quality_loop_compensation_status', '待处理', 'PENDING', 1, 1, NULL),
(9443, 'intg_quality_loop_compensation_status', '处理中', 'PROCESSING', 2, 1, NULL),
(9444, 'intg_quality_loop_compensation_status', '已解决', 'RESOLVED', 3, 1, NULL),
(9445, 'intg_quality_loop_compensation_status', '已忽略', 'IGNORED', 4, 1, NULL),
(9446, 'intg_quality_loop_reconcile_status', '待对账', 'PENDING', 1, 1, NULL),
(9447, 'intg_quality_loop_reconcile_status', '已平账', 'BALANCED', 2, 1, NULL),
(9448, 'intg_quality_loop_reconcile_status', '存在差异', 'DIFF', 3, 1, NULL),
(9449, 'intg_quality_loop_reconcile_status', '已关闭', 'CLOSED', 4, 1, NULL);

-- ========== 质量闭环集成可配置项（6899-6911） ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(6899, 'INTG', 'intg.quality-loop.enabled', '质量闭环集成启用开关', 'true', 0, 1, '质量闭环集成总开关，默认启用'),
(6900, 'INTG', 'intg.quality-loop.batch.size', '同步批次单批条数', '200', 1, 1, '单批同步条数，待业务方确认并发规模后调整'),
(6901, 'INTG', 'intg.quality-loop.retry.times', '失败重试次数', '3', 1, 1, '质量闭环重传次数，待业务方确认'),
(6902, 'INTG', 'intg.quality-loop.timeout.ms', '接口超时时间（毫秒）', '30000', 1, 1, '接口调用超时时间，待业务方确认'),
(6903, 'INTG', 'intg.quality-loop.idempotent.window.hours', '幂等窗口（小时）', '24', 1, 1, '幂等判重时间窗口，待业务方确认'),
(6904, 'INTG', 'intg.quality-loop.receipt.auto', '系统回执自动生成', 'true', 0, 1, '系统校验通过后自动生成回执'),
(6905, 'INTG', 'intg.quality-loop.reconcile.cron', '对账任务计划表达式', '0 0 2 * * ?', 1, 1, '每日对账任务 Cron，待业务方确认对账频率'),
(6906, 'INTG', 'intg.quality-loop.interface.no.prefix', '集成接口编号前缀', 'QLI', 0, 1, '集成接口编号自动生成前缀'),
(6907, 'INTG', 'intg.quality-loop.mapping.no.prefix', '字段映射编号前缀', 'QLM', 0, 1, '字段映射编号自动生成前缀'),
(6908, 'INTG', 'intg.quality-loop.batch.no.prefix', '同步批次编号前缀', 'QLB', 0, 1, '同步批次编号自动生成前缀'),
(6909, 'INTG', 'intg.quality-loop.receipt.no.prefix', '接收回执编号前缀', 'QLR', 0, 1, '接收回执编号自动生成前缀'),
(6910, 'INTG', 'intg.quality-loop.compensation.no.prefix', '异常补偿编号前缀', 'QLC', 0, 1, '异常补偿编号自动生成前缀'),
(6911, 'INTG', 'intg.quality-loop.reconcile.no.prefix', '对账编号前缀', 'QLO', 0, 1, '对账编号自动生成前缀');
