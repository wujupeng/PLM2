-- G8-N2 六系统集成—PLM→MES（WBS T063）初始化：菜单/按钮权限、角色授权、字典与可配置项。
-- 号段基线（V135 之后）：sys_permission=4981（本脚本从 4982 起）、
-- sys_role_permission=15523（从 15524 起）、sys_dictionary=8994（从 8995 起）、sys_config=6768（从 6769 起）。
-- 菜单说明：G8「系统集成」顶级菜单域（4962）已由 G8-N1 建立；PLM→MES（4982）为其下第二个方向分组，
--          覆盖集成接口、字段映射、同步批次、接收回执、异常补偿、对账。

-- ========== PLM→MES 集成方向分组（4982，挂在 4962 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4982, 'intg:plm-mes', 'PLM→MES 集成', 'menu', 4962, '/intg/plm-mes', 'SwapRightOutlined', 2, 1);

-- ========== PLM→MES 业务菜单（4983-4988，挂在 4982 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4983, 'intg:plm-mes:interface', '集成接口', 'menu', 4982, '/intg/plm-mes/interfaces', 'ApiOutlined', 1, 1),
(4984, 'intg:plm-mes:mapping', '字段映射', 'menu', 4982, '/intg/plm-mes/mappings', 'PartitionOutlined', 2, 1),
(4985, 'intg:plm-mes:batch', '同步批次', 'menu', 4982, '/intg/plm-mes/batches', 'SyncOutlined', 3, 1),
(4986, 'intg:plm-mes:receipt', '接收回执', 'menu', 4982, '/intg/plm-mes/receipts', 'AuditOutlined', 4, 1),
(4987, 'intg:plm-mes:compensation', '异常补偿', 'menu', 4982, '/intg/plm-mes/compensations', 'ToolOutlined', 5, 1),
(4988, 'intg:plm-mes:reconcile', '对账', 'menu', 4982, '/intg/plm-mes/reconciles', 'BalanceOutlined', 6, 1);

-- ========== PLM→MES 按钮（4989-5000） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4989, 'intg:plm-mes:interface:list', '查询集成接口', 'button', 4983, NULL, NULL, 1, 1),
(4990, 'intg:plm-mes:interface:manage', '维护集成接口', 'button', 4983, NULL, NULL, 2, 1),
(4991, 'intg:plm-mes:mapping:list', '查询字段映射', 'button', 4984, NULL, NULL, 1, 1),
(4992, 'intg:plm-mes:mapping:manage', '维护字段映射', 'button', 4984, NULL, NULL, 2, 1),
(4993, 'intg:plm-mes:batch:list', '查询同步批次', 'button', 4985, NULL, NULL, 1, 1),
(4994, 'intg:plm-mes:batch:manage', '维护同步批次', 'button', 4985, NULL, NULL, 2, 1),
(4995, 'intg:plm-mes:receipt:list', '查询接收回执', 'button', 4986, NULL, NULL, 1, 1),
(4996, 'intg:plm-mes:receipt:manage', '维护接收回执', 'button', 4986, NULL, NULL, 2, 1),
(4997, 'intg:plm-mes:compensation:list', '查询异常补偿', 'button', 4987, NULL, NULL, 1, 1),
(4998, 'intg:plm-mes:compensation:manage', '维护异常补偿', 'button', 4987, NULL, NULL, 2, 1),
(4999, 'intg:plm-mes:reconcile:list', '查询对账', 'button', 4988, NULL, NULL, 1, 1),
(5000, 'intg:plm-mes:reconcile:manage', '维护对账', 'button', 4988, NULL, NULL, 2, 1);

-- ========== 角色授权（15524-15613） ==========

-- 系统管理员（2001）：授予全部权限（19 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(15524, 2001, 4982), (15525, 2001, 4983), (15526, 2001, 4984), (15527, 2001, 4985),
(15528, 2001, 4986), (15529, 2001, 4987), (15530, 2001, 4988), (15531, 2001, 4989),
(15532, 2001, 4990), (15533, 2001, 4991), (15534, 2001, 4992), (15535, 2001, 4993),
(15536, 2001, 4994), (15537, 2001, 4995), (15538, 2001, 4996), (15539, 2001, 4997),
(15540, 2001, 4998), (15541, 2001, 4999), (15542, 2001, 5000);

-- 研发工程师（2002）：授予全部权限（PLM 为发布方，共 19 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(15543, 2002, 4982), (15544, 2002, 4983), (15545, 2002, 4984), (15546, 2002, 4985),
(15547, 2002, 4986), (15548, 2002, 4987), (15549, 2002, 4988), (15550, 2002, 4989),
(15551, 2002, 4990), (15552, 2002, 4991), (15553, 2002, 4992), (15554, 2002, 4993),
(15555, 2002, 4994), (15556, 2002, 4995), (15557, 2002, 4996), (15558, 2002, 4997),
(15559, 2002, 4998), (15560, 2002, 4999), (15561, 2002, 5000);

-- 质量工程师（2003）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(15562, 2003, 4982), (15563, 2003, 4983), (15564, 2003, 4984), (15565, 2003, 4985),
(15566, 2003, 4986), (15567, 2003, 4987), (15568, 2003, 4988), (15569, 2003, 4989),
(15570, 2003, 4991), (15571, 2003, 4993), (15572, 2003, 4995), (15573, 2003, 4997),
(15574, 2003, 4999);

-- 供应链专员（2004）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(15575, 2004, 4982), (15576, 2004, 4983), (15577, 2004, 4984), (15578, 2004, 4985),
(15579, 2004, 4986), (15580, 2004, 4987), (15581, 2004, 4988), (15582, 2004, 4989),
(15583, 2004, 4991), (15584, 2004, 4993), (15585, 2004, 4995), (15586, 2004, 4997),
(15587, 2004, 4999);

-- 生产现场（2005）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(15588, 2005, 4982), (15589, 2005, 4983), (15590, 2005, 4984), (15591, 2005, 4985),
(15592, 2005, 4986), (15593, 2005, 4987), (15594, 2005, 4988), (15595, 2005, 4989),
(15596, 2005, 4991), (15597, 2005, 4993), (15598, 2005, 4995), (15599, 2005, 4997),
(15600, 2005, 4999);

-- 只读用户（2006）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(15601, 2006, 4982), (15602, 2006, 4983), (15603, 2006, 4984), (15604, 2006, 4985),
(15605, 2006, 4986), (15606, 2006, 4987), (15607, 2006, 4988), (15608, 2006, 4989),
(15609, 2006, 4991), (15610, 2006, 4993), (15611, 2006, 4995), (15612, 2006, 4997),
(15613, 2006, 4999);

-- ========== PLM→MES 集成字典（8995-9035） ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(8995, 'intg_plm_mes_object_type', '工艺路线', 'ROUTING', 1, 1, NULL),
(8996, 'intg_plm_mes_object_type', '工序', 'OPERATION', 2, 1, NULL),
(8997, 'intg_plm_mes_object_type', '作业指导书', 'SOP', 3, 1, NULL),
(8998, 'intg_plm_mes_object_type', '参数规范', 'PARAM_SPEC', 4, 1, NULL),
(8999, 'intg_plm_mes_object_type', '变更切换点', 'SWITCH_POINT', 5, 1, NULL),
(9000, 'intg_plm_mes_protocol', 'API 接口', 'API', 1, 1, NULL),
(9001, 'intg_plm_mes_protocol', '事件消息', 'EVENT', 2, 1, NULL),
(9002, 'intg_plm_mes_protocol', '批量文件', 'FILE', 3, 1, NULL),
(9003, 'intg_plm_mes_trigger_type', '手工触发', 'MANUAL', 1, 1, NULL),
(9004, 'intg_plm_mes_trigger_type', '定时触发', 'SCHEDULED', 2, 1, NULL),
(9005, 'intg_plm_mes_trigger_type', '事件触发', 'EVENT', 3, 1, NULL),
(9006, 'intg_plm_mes_sync_mode', '全量', 'FULL', 1, 1, NULL),
(9007, 'intg_plm_mes_sync_mode', '增量', 'INCREMENTAL', 2, 1, NULL),
(9008, 'intg_plm_mes_interface_status', '草稿', 'DRAFT', 1, 1, NULL),
(9009, 'intg_plm_mes_interface_status', '启用', 'ACTIVE', 2, 1, NULL),
(9010, 'intg_plm_mes_interface_status', '停用', 'DISABLED', 3, 1, NULL),
(9011, 'intg_plm_mes_mapping_status', '草稿', 'DRAFT', 1, 1, NULL),
(9012, 'intg_plm_mes_mapping_status', '启用', 'ACTIVE', 2, 1, NULL),
(9013, 'intg_plm_mes_mapping_status', '停用', 'DISABLED', 3, 1, NULL),
(9014, 'intg_plm_mes_batch_status', '待执行', 'PENDING', 1, 1, NULL),
(9015, 'intg_plm_mes_batch_status', '执行中', 'RUNNING', 2, 1, NULL),
(9016, 'intg_plm_mes_batch_status', '成功', 'SUCCESS', 3, 1, NULL),
(9017, 'intg_plm_mes_batch_status', '部分成功', 'PARTIAL', 4, 1, NULL),
(9018, 'intg_plm_mes_batch_status', '失败', 'FAILED', 5, 1, NULL),
(9019, 'intg_plm_mes_receipt_status', '待回执', 'PENDING', 1, 1, NULL),
(9020, 'intg_plm_mes_receipt_status', '已接收', 'ACCEPTED', 2, 1, NULL),
(9021, 'intg_plm_mes_receipt_status', '已拒绝', 'REJECTED', 3, 1, NULL),
(9022, 'intg_plm_mes_receipt_status', '警告', 'WARN', 4, 1, NULL),
(9023, 'intg_plm_mes_error_type', '校验失败', 'VALIDATION', 1, 1, NULL),
(9024, 'intg_plm_mes_error_type', '超时', 'TIMEOUT', 2, 1, NULL),
(9025, 'intg_plm_mes_error_type', '数据冲突', 'CONFLICT', 3, 1, NULL),
(9026, 'intg_plm_mes_error_type', '网络异常', 'NETWORK', 4, 1, NULL),
(9027, 'intg_plm_mes_error_type', '其他', 'OTHER', 5, 1, NULL),
(9028, 'intg_plm_mes_compensation_status', '待处理', 'PENDING', 1, 1, NULL),
(9029, 'intg_plm_mes_compensation_status', '处理中', 'PROCESSING', 2, 1, NULL),
(9030, 'intg_plm_mes_compensation_status', '已解决', 'RESOLVED', 3, 1, NULL),
(9031, 'intg_plm_mes_compensation_status', '已忽略', 'IGNORED', 4, 1, NULL),
(9032, 'intg_plm_mes_reconcile_status', '待对账', 'PENDING', 1, 1, NULL),
(9033, 'intg_plm_mes_reconcile_status', '已平账', 'BALANCED', 2, 1, NULL),
(9034, 'intg_plm_mes_reconcile_status', '存在差异', 'DIFF', 3, 1, NULL),
(9035, 'intg_plm_mes_reconcile_status', '已关闭', 'CLOSED', 4, 1, NULL);

-- ========== PLM→MES 集成可配置项（6769-6781） ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(6769, 'INTG', 'intg.plm-mes.enabled', 'PLM→MES 集成启用开关', 'true', 0, 1, 'PLM→MES 集成总开关，默认启用'),
(6770, 'INTG', 'intg.plm-mes.batch.size', '同步批次单批条数', '200', 1, 1, '单批同步条数，待业务方确认并发规模后调整'),
(6771, 'INTG', 'intg.plm-mes.retry.times', '失败重试次数', '3', 1, 1, '接口失败自动重试次数，待业务方确认'),
(6772, 'INTG', 'intg.plm-mes.timeout.ms', '接口超时时间（毫秒）', '30000', 1, 1, '接口调用超时时间，待业务方确认'),
(6773, 'INTG', 'intg.plm-mes.idempotent.window.hours', '幂等窗口（小时）', '24', 1, 1, '幂等判重时间窗口，待业务方确认'),
(6774, 'INTG', 'intg.plm-mes.receipt.auto', 'MES 回执自动生成', 'true', 0, 1, 'MES 校验通过后自动生成回执'),
(6775, 'INTG', 'intg.plm-mes.reconcile.cron', '对账任务计划表达式', '0 0 2 * * ?', 1, 1, '每日对账任务 Cron，待业务方确认对账频率'),
(6776, 'INTG', 'intg.plm-mes.interface.no.prefix', '集成接口编号前缀', 'PMI', 0, 1, '集成接口编号自动生成前缀'),
(6777, 'INTG', 'intg.plm-mes.mapping.no.prefix', '字段映射编号前缀', 'PMM', 0, 1, '字段映射编号自动生成前缀'),
(6778, 'INTG', 'intg.plm-mes.batch.no.prefix', '同步批次编号前缀', 'PMB', 0, 1, '同步批次编号自动生成前缀'),
(6779, 'INTG', 'intg.plm-mes.receipt.no.prefix', '接收回执编号前缀', 'PMR', 0, 1, '接收回执编号自动生成前缀'),
(6780, 'INTG', 'intg.plm-mes.compensation.no.prefix', '异常补偿编号前缀', 'PMC', 0, 1, '异常补偿编号自动生成前缀'),
(6781, 'INTG', 'intg.plm-mes.reconcile.no.prefix', '对账编号前缀', 'PMO', 0, 1, '对账编号自动生成前缀');
