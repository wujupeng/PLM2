-- G8-N13 六系统集成—标签追溯（WBS T074）初始化：菜单/按钮权限、角色授权、字典与可配置项。
-- 号段基线（V157 之后实测）：sys_permission=5190（本脚本从 5191 起）、
-- sys_role_permission=16513（从 16514 起）、sys_dictionary=9449（从 9450 起）、sys_config=6911（从 6912 起）。
-- 菜单说明：G8「系统集成」顶级菜单域（4962，V135 建立）复用，本节点新增二级方向分组
--          标签追溯（5191），覆盖集成接口、字段映射、同步批次、接收回执、异常补偿、对账。

-- ========== 标签追溯集成方向分组（5191，挂在 4962 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(5191, 'intg:label-trace', '标签追溯集成', 'menu', 4962, '/intg/label-trace', 'SwapOutlined', 13, 1);

-- ========== 标签追溯业务菜单（5192-5197，挂在 5191 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(5192, 'intg:label-trace:interface', '集成接口', 'menu', 5191, '/intg/label-trace/interfaces', 'ApiOutlined', 1, 1),
(5193, 'intg:label-trace:mapping', '字段映射', 'menu', 5191, '/intg/label-trace/mappings', 'PartitionOutlined', 2, 1),
(5194, 'intg:label-trace:batch', '同步批次', 'menu', 5191, '/intg/label-trace/batches', 'SyncOutlined', 3, 1),
(5195, 'intg:label-trace:receipt', '接收回执', 'menu', 5191, '/intg/label-trace/receipts', 'AuditOutlined', 4, 1),
(5196, 'intg:label-trace:compensation', '异常补偿', 'menu', 5191, '/intg/label-trace/compensations', 'ToolOutlined', 5, 1),
(5197, 'intg:label-trace:reconcile', '对账', 'menu', 5191, '/intg/label-trace/reconciles', 'BalanceOutlined', 6, 1);

-- ========== 标签追溯按钮（5198-5209） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(5198, 'intg:label-trace:interface:list', '查询集成接口', 'button', 5192, NULL, NULL, 1, 1),
(5199, 'intg:label-trace:interface:manage', '维护集成接口', 'button', 5192, NULL, NULL, 2, 1),
(5200, 'intg:label-trace:mapping:list', '查询字段映射', 'button', 5193, NULL, NULL, 1, 1),
(5201, 'intg:label-trace:mapping:manage', '维护字段映射', 'button', 5193, NULL, NULL, 2, 1),
(5202, 'intg:label-trace:batch:list', '查询同步批次', 'button', 5194, NULL, NULL, 1, 1),
(5203, 'intg:label-trace:batch:manage', '维护同步批次', 'button', 5194, NULL, NULL, 2, 1),
(5204, 'intg:label-trace:receipt:list', '查询接收回执', 'button', 5195, NULL, NULL, 1, 1),
(5205, 'intg:label-trace:receipt:manage', '维护接收回执', 'button', 5195, NULL, NULL, 2, 1),
(5206, 'intg:label-trace:compensation:list', '查询异常补偿', 'button', 5196, NULL, NULL, 1, 1),
(5207, 'intg:label-trace:compensation:manage', '维护异常补偿', 'button', 5196, NULL, NULL, 2, 1),
(5208, 'intg:label-trace:reconcile:list', '查询对账', 'button', 5197, NULL, NULL, 1, 1),
(5209, 'intg:label-trace:reconcile:manage', '维护对账', 'button', 5197, NULL, NULL, 2, 1);

-- ========== 角色授权（16514-16603） ==========

-- 系统管理员（2001）：授予全部权限（19 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(16514, 2001, 5191), (16515, 2001, 5192), (16516, 2001, 5193), (16517, 2001, 5194),
(16518, 2001, 5195), (16519, 2001, 5196), (16520, 2001, 5197), (16521, 2001, 5198),
(16522, 2001, 5199), (16523, 2001, 5200), (16524, 2001, 5201), (16525, 2001, 5202),
(16526, 2001, 5203), (16527, 2001, 5204), (16528, 2001, 5205), (16529, 2001, 5206),
(16530, 2001, 5207), (16531, 2001, 5208), (16532, 2001, 5209);

-- 生产现场（2005）：授予全部权限（标签生成与扫描追溯主责角色，共 19 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(16533, 2005, 5191), (16534, 2005, 5192), (16535, 2005, 5193), (16536, 2005, 5194),
(16537, 2005, 5195), (16538, 2005, 5196), (16539, 2005, 5197), (16540, 2005, 5198),
(16541, 2005, 5199), (16542, 2005, 5200), (16543, 2005, 5201), (16544, 2005, 5202),
(16545, 2005, 5203), (16546, 2005, 5204), (16547, 2005, 5205), (16548, 2005, 5206),
(16549, 2005, 5207), (16550, 2005, 5208), (16551, 2005, 5209);

-- 质量工程师（2003）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(16552, 2003, 5191), (16553, 2003, 5192), (16554, 2003, 5193), (16555, 2003, 5194),
(16556, 2003, 5195), (16557, 2003, 5196), (16558, 2003, 5197), (16559, 2003, 5198),
(16560, 2003, 5200), (16561, 2003, 5202), (16562, 2003, 5204), (16563, 2003, 5206),
(16564, 2003, 5208);

-- 供应链专员（2004）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(16565, 2004, 5191), (16566, 2004, 5192), (16567, 2004, 5193), (16568, 2004, 5194),
(16569, 2004, 5195), (16570, 2004, 5196), (16571, 2004, 5197), (16572, 2004, 5198),
(16573, 2004, 5200), (16574, 2004, 5202), (16575, 2004, 5204), (16576, 2004, 5206),
(16577, 2004, 5208);

-- 研发工程师（2002）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(16578, 2002, 5191), (16579, 2002, 5192), (16580, 2002, 5193), (16581, 2002, 5194),
(16582, 2002, 5195), (16583, 2002, 5196), (16584, 2002, 5197), (16585, 2002, 5198),
(16586, 2002, 5200), (16587, 2002, 5202), (16588, 2002, 5204), (16589, 2002, 5206),
(16590, 2002, 5208);

-- 只读用户（2006）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(16591, 2006, 5191), (16592, 2006, 5192), (16593, 2006, 5193), (16594, 2006, 5194),
(16595, 2006, 5195), (16596, 2006, 5196), (16597, 2006, 5197), (16598, 2006, 5198),
(16599, 2006, 5200), (16600, 2006, 5202), (16601, 2006, 5204), (16602, 2006, 5206),
(16603, 2006, 5208);

-- ========== 标签追溯集成字典（9450-9490） ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(9450, 'intg_label_trace_object_type', '标签规则', 'LABEL_RULE', 1, 1, NULL),
(9451, 'intg_label_trace_object_type', 'Data Matrix 标签', 'DATA_MATRIX', 2, 1, NULL),
(9452, 'intg_label_trace_object_type', '扫描解析', 'SCAN_PARSE', 3, 1, NULL),
(9453, 'intg_label_trace_object_type', '追溯关联', 'TRACE_BINDING', 4, 1, NULL),
(9454, 'intg_label_trace_object_type', '流水号反馈', 'SERIAL_FEEDBACK', 5, 1, NULL),
(9455, 'intg_label_trace_protocol', 'API 接口', 'API', 1, 1, NULL),
(9456, 'intg_label_trace_protocol', '事件消息', 'EVENT', 2, 1, NULL),
(9457, 'intg_label_trace_protocol', '批量文件', 'FILE', 3, 1, NULL),
(9458, 'intg_label_trace_trigger_type', '手工触发', 'MANUAL', 1, 1, NULL),
(9459, 'intg_label_trace_trigger_type', '定时触发', 'SCHEDULED', 2, 1, NULL),
(9460, 'intg_label_trace_trigger_type', '事件触发', 'EVENT', 3, 1, NULL),
(9461, 'intg_label_trace_sync_mode', '全量', 'FULL', 1, 1, NULL),
(9462, 'intg_label_trace_sync_mode', '增量', 'INCREMENTAL', 2, 1, NULL),
(9463, 'intg_label_trace_interface_status', '草稿', 'DRAFT', 1, 1, NULL),
(9464, 'intg_label_trace_interface_status', '启用', 'ACTIVE', 2, 1, NULL),
(9465, 'intg_label_trace_interface_status', '停用', 'DISABLED', 3, 1, NULL),
(9466, 'intg_label_trace_mapping_status', '草稿', 'DRAFT', 1, 1, NULL),
(9467, 'intg_label_trace_mapping_status', '启用', 'ACTIVE', 2, 1, NULL),
(9468, 'intg_label_trace_mapping_status', '停用', 'DISABLED', 3, 1, NULL),
(9469, 'intg_label_trace_batch_status', '待执行', 'PENDING', 1, 1, NULL),
(9470, 'intg_label_trace_batch_status', '执行中', 'RUNNING', 2, 1, NULL),
(9471, 'intg_label_trace_batch_status', '成功', 'SUCCESS', 3, 1, NULL),
(9472, 'intg_label_trace_batch_status', '部分成功', 'PARTIAL', 4, 1, NULL),
(9473, 'intg_label_trace_batch_status', '失败', 'FAILED', 5, 1, NULL),
(9474, 'intg_label_trace_receipt_status', '待回执', 'PENDING', 1, 1, NULL),
(9475, 'intg_label_trace_receipt_status', '已接收', 'ACCEPTED', 2, 1, NULL),
(9476, 'intg_label_trace_receipt_status', '已拒绝', 'REJECTED', 3, 1, NULL),
(9477, 'intg_label_trace_receipt_status', '警告', 'WARN', 4, 1, NULL),
(9478, 'intg_label_trace_error_type', '校验失败', 'VALIDATION', 1, 1, NULL),
(9479, 'intg_label_trace_error_type', '超时', 'TIMEOUT', 2, 1, NULL),
(9480, 'intg_label_trace_error_type', '数据冲突', 'CONFLICT', 3, 1, NULL),
(9481, 'intg_label_trace_error_type', '网络异常', 'NETWORK', 4, 1, NULL),
(9482, 'intg_label_trace_error_type', '其他', 'OTHER', 5, 1, NULL),
(9483, 'intg_label_trace_compensation_status', '待处理', 'PENDING', 1, 1, NULL),
(9484, 'intg_label_trace_compensation_status', '处理中', 'PROCESSING', 2, 1, NULL),
(9485, 'intg_label_trace_compensation_status', '已解决', 'RESOLVED', 3, 1, NULL),
(9486, 'intg_label_trace_compensation_status', '已忽略', 'IGNORED', 4, 1, NULL),
(9487, 'intg_label_trace_reconcile_status', '待对账', 'PENDING', 1, 1, NULL),
(9488, 'intg_label_trace_reconcile_status', '已平账', 'BALANCED', 2, 1, NULL),
(9489, 'intg_label_trace_reconcile_status', '存在差异', 'DIFF', 3, 1, NULL),
(9490, 'intg_label_trace_reconcile_status', '已关闭', 'CLOSED', 4, 1, NULL);

-- ========== 标签追溯集成可配置项（6912-6924） ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(6912, 'INTG', 'intg.label-trace.enabled', '标签追溯集成启用开关', 'true', 0, 1, '标签追溯集成总开关，默认启用'),
(6913, 'INTG', 'intg.label-trace.batch.size', '同步批次单批条数', '200', 1, 1, '单批同步条数，待业务方确认并发规模后调整'),
(6914, 'INTG', 'intg.label-trace.retry.times', '失败重试次数', '3', 1, 1, '标签追溯重传次数，待业务方确认'),
(6915, 'INTG', 'intg.label-trace.timeout.ms', '接口超时时间（毫秒）', '30000', 1, 1, '接口调用超时时间，待业务方确认'),
(6916, 'INTG', 'intg.label-trace.idempotent.window.hours', '幂等窗口（小时）', '24', 1, 1, '幂等判重时间窗口，待业务方确认'),
(6917, 'INTG', 'intg.label-trace.receipt.auto', '系统回执自动生成', 'true', 0, 1, '系统校验通过后自动生成回执'),
(6918, 'INTG', 'intg.label-trace.reconcile.cron', '对账任务计划表达式', '0 0 2 * * ?', 1, 1, '每日对账任务 Cron，待业务方确认对账频率'),
(6919, 'INTG', 'intg.label-trace.interface.no.prefix', '集成接口编号前缀', 'LTI', 0, 1, '集成接口编号自动生成前缀'),
(6920, 'INTG', 'intg.label-trace.mapping.no.prefix', '字段映射编号前缀', 'LTM', 0, 1, '字段映射编号自动生成前缀'),
(6921, 'INTG', 'intg.label-trace.batch.no.prefix', '同步批次编号前缀', 'LTB', 0, 1, '同步批次编号自动生成前缀'),
(6922, 'INTG', 'intg.label-trace.receipt.no.prefix', '接收回执编号前缀', 'LTR', 0, 1, '接收回执编号自动生成前缀'),
(6923, 'INTG', 'intg.label-trace.compensation.no.prefix', '异常补偿编号前缀', 'LTC', 0, 1, '异常补偿编号自动生成前缀'),
(6924, 'INTG', 'intg.label-trace.reconcile.no.prefix', '对账编号前缀', 'LTO', 0, 1, '对账编号自动生成前缀');
