-- G8-N1 六系统集成—PLM→ERP（WBS T062）初始化：菜单/按钮权限、角色授权、字典与可配置项。
-- 号段基线（V134 之后仍以 V133 已占用最大值为准）：sys_permission=4961（本脚本从 4962 起）、
-- sys_role_permission=15427（从 15428 起）、sys_dictionary=8952（从 8953 起）、sys_config=6755（从 6756 起）。
-- 菜单说明：G8「系统集成」顶级菜单域（4962）随本节点建立，按集成方向挂二级分组，
--          PLM→ERP（4963）为首个方向，覆盖集成接口、字段映射、同步批次、接收回执、异常补偿、对账。

-- ========== G8 系统集成顶级菜单（4962） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4962, 'intg-domain', '系统集成', 'menu', 0, NULL, 'ShareAltOutlined', 19, 1);

-- ========== PLM→ERP 集成方向分组（4963，挂在 4962 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4963, 'intg:plm-erp', 'PLM→ERP 集成', 'menu', 4962, '/intg/plm-erp', 'SwapRightOutlined', 1, 1);

-- ========== PLM→ERP 业务菜单（4964-4969，挂在 4963 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4964, 'intg:plm-erp:interface', '集成接口', 'menu', 4963, '/intg/plm-erp/interfaces', 'ApiOutlined', 1, 1),
(4965, 'intg:plm-erp:mapping', '字段映射', 'menu', 4963, '/intg/plm-erp/mappings', 'PartitionOutlined', 2, 1),
(4966, 'intg:plm-erp:batch', '同步批次', 'menu', 4963, '/intg/plm-erp/batches', 'SyncOutlined', 3, 1),
(4967, 'intg:plm-erp:receipt', '接收回执', 'menu', 4963, '/intg/plm-erp/receipts', 'AuditOutlined', 4, 1),
(4968, 'intg:plm-erp:compensation', '异常补偿', 'menu', 4963, '/intg/plm-erp/compensations', 'ToolOutlined', 5, 1),
(4969, 'intg:plm-erp:reconcile', '对账', 'menu', 4963, '/intg/plm-erp/reconciles', 'BalanceOutlined', 6, 1);

-- ========== PLM→ERP 按钮（4970-4981） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4970, 'intg:plm-erp:interface:list', '查询集成接口', 'button', 4964, NULL, NULL, 1, 1),
(4971, 'intg:plm-erp:interface:manage', '维护集成接口', 'button', 4964, NULL, NULL, 2, 1),
(4972, 'intg:plm-erp:mapping:list', '查询字段映射', 'button', 4965, NULL, NULL, 1, 1),
(4973, 'intg:plm-erp:mapping:manage', '维护字段映射', 'button', 4965, NULL, NULL, 2, 1),
(4974, 'intg:plm-erp:batch:list', '查询同步批次', 'button', 4966, NULL, NULL, 1, 1),
(4975, 'intg:plm-erp:batch:manage', '维护同步批次', 'button', 4966, NULL, NULL, 2, 1),
(4976, 'intg:plm-erp:receipt:list', '查询接收回执', 'button', 4967, NULL, NULL, 1, 1),
(4977, 'intg:plm-erp:receipt:manage', '维护接收回执', 'button', 4967, NULL, NULL, 2, 1),
(4978, 'intg:plm-erp:compensation:list', '查询异常补偿', 'button', 4968, NULL, NULL, 1, 1),
(4979, 'intg:plm-erp:compensation:manage', '维护异常补偿', 'button', 4968, NULL, NULL, 2, 1),
(4980, 'intg:plm-erp:reconcile:list', '查询对账', 'button', 4969, NULL, NULL, 1, 1),
(4981, 'intg:plm-erp:reconcile:manage', '维护对账', 'button', 4969, NULL, NULL, 2, 1);

-- ========== 角色授权（15428-15523） ==========

-- 系统管理员（2001）：授予全部权限（20 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(15428, 2001, 4962), (15429, 2001, 4963), (15430, 2001, 4964), (15431, 2001, 4965),
(15432, 2001, 4966), (15433, 2001, 4967), (15434, 2001, 4968), (15435, 2001, 4969),
(15436, 2001, 4970), (15437, 2001, 4971), (15438, 2001, 4972), (15439, 2001, 4973),
(15440, 2001, 4974), (15441, 2001, 4975), (15442, 2001, 4976), (15443, 2001, 4977),
(15444, 2001, 4978), (15445, 2001, 4979), (15446, 2001, 4980), (15447, 2001, 4981);

-- 研发工程师（2002）：授予全部权限（PLM 为发布方，共 20 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(15448, 2002, 4962), (15449, 2002, 4963), (15450, 2002, 4964), (15451, 2002, 4965),
(15452, 2002, 4966), (15453, 2002, 4967), (15454, 2002, 4968), (15455, 2002, 4969),
(15456, 2002, 4970), (15457, 2002, 4971), (15458, 2002, 4972), (15459, 2002, 4973),
(15460, 2002, 4974), (15461, 2002, 4975), (15462, 2002, 4976), (15463, 2002, 4977),
(15464, 2002, 4978), (15465, 2002, 4979), (15466, 2002, 4980), (15467, 2002, 4981);

-- 质量工程师（2003）：授予分组/菜单 + 仅查询按钮（14 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(15468, 2003, 4962), (15469, 2003, 4963), (15470, 2003, 4964), (15471, 2003, 4965),
(15472, 2003, 4966), (15473, 2003, 4967), (15474, 2003, 4968), (15475, 2003, 4969),
(15476, 2003, 4970), (15477, 2003, 4972), (15478, 2003, 4974), (15479, 2003, 4976),
(15480, 2003, 4978), (15481, 2003, 4980);

-- 供应链专员（2004）：授予分组/菜单 + 仅查询按钮（14 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(15482, 2004, 4962), (15483, 2004, 4963), (15484, 2004, 4964), (15485, 2004, 4965),
(15486, 2004, 4966), (15487, 2004, 4967), (15488, 2004, 4968), (15489, 2004, 4969),
(15490, 2004, 4970), (15491, 2004, 4972), (15492, 2004, 4974), (15493, 2004, 4976),
(15494, 2004, 4978), (15495, 2004, 4980);

-- 生产现场（2005）：授予分组/菜单 + 仅查询按钮（14 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(15496, 2005, 4962), (15497, 2005, 4963), (15498, 2005, 4964), (15499, 2005, 4965),
(15500, 2005, 4966), (15501, 2005, 4967), (15502, 2005, 4968), (15503, 2005, 4969),
(15504, 2005, 4970), (15505, 2005, 4972), (15506, 2005, 4974), (15507, 2005, 4976),
(15508, 2005, 4978), (15509, 2005, 4980);

-- 只读用户（2006）：授予分组/菜单 + 仅查询按钮（14 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(15510, 2006, 4962), (15511, 2006, 4963), (15512, 2006, 4964), (15513, 2006, 4965),
(15514, 2006, 4966), (15515, 2006, 4967), (15516, 2006, 4968), (15517, 2006, 4969),
(15518, 2006, 4970), (15519, 2006, 4972), (15520, 2006, 4974), (15521, 2006, 4976),
(15522, 2006, 4978), (15523, 2006, 4980);

-- ========== PLM→ERP 集成字典（8953-8994） ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(8953, 'intg_plm_erp_object_type', '物料', 'MATERIAL', 1, 1, NULL),
(8954, 'intg_plm_erp_object_type', '产品', 'PRODUCT', 2, 1, NULL),
(8955, 'intg_plm_erp_object_type', 'BOM', 'BOM', 3, 1, NULL),
(8956, 'intg_plm_erp_object_type', '版本', 'VERSION', 4, 1, NULL),
(8957, 'intg_plm_erp_object_type', '生效日期', 'EFFECTIVE_DATE', 5, 1, NULL),
(8958, 'intg_plm_erp_object_type', '工程变更', 'ECO', 6, 1, NULL),
(8959, 'intg_plm_erp_protocol', 'API 接口', 'API', 1, 1, NULL),
(8960, 'intg_plm_erp_protocol', '事件消息', 'EVENT', 2, 1, NULL),
(8961, 'intg_plm_erp_protocol', '批量文件', 'FILE', 3, 1, NULL),
(8962, 'intg_plm_erp_trigger_type', '手工触发', 'MANUAL', 1, 1, NULL),
(8963, 'intg_plm_erp_trigger_type', '定时触发', 'SCHEDULED', 2, 1, NULL),
(8964, 'intg_plm_erp_trigger_type', '事件触发', 'EVENT', 3, 1, NULL),
(8965, 'intg_plm_erp_sync_mode', '全量', 'FULL', 1, 1, NULL),
(8966, 'intg_plm_erp_sync_mode', '增量', 'INCREMENTAL', 2, 1, NULL),
(8967, 'intg_plm_erp_interface_status', '草稿', 'DRAFT', 1, 1, NULL),
(8968, 'intg_plm_erp_interface_status', '启用', 'ACTIVE', 2, 1, NULL),
(8969, 'intg_plm_erp_interface_status', '停用', 'DISABLED', 3, 1, NULL),
(8970, 'intg_plm_erp_mapping_status', '草稿', 'DRAFT', 1, 1, NULL),
(8971, 'intg_plm_erp_mapping_status', '启用', 'ACTIVE', 2, 1, NULL),
(8972, 'intg_plm_erp_mapping_status', '停用', 'DISABLED', 3, 1, NULL),
(8973, 'intg_plm_erp_batch_status', '待执行', 'PENDING', 1, 1, NULL),
(8974, 'intg_plm_erp_batch_status', '执行中', 'RUNNING', 2, 1, NULL),
(8975, 'intg_plm_erp_batch_status', '成功', 'SUCCESS', 3, 1, NULL),
(8976, 'intg_plm_erp_batch_status', '部分成功', 'PARTIAL', 4, 1, NULL),
(8977, 'intg_plm_erp_batch_status', '失败', 'FAILED', 5, 1, NULL),
(8978, 'intg_plm_erp_receipt_status', '待回执', 'PENDING', 1, 1, NULL),
(8979, 'intg_plm_erp_receipt_status', '已接收', 'ACCEPTED', 2, 1, NULL),
(8980, 'intg_plm_erp_receipt_status', '已拒绝', 'REJECTED', 3, 1, NULL),
(8981, 'intg_plm_erp_receipt_status', '警告', 'WARN', 4, 1, NULL),
(8982, 'intg_plm_erp_error_type', '校验失败', 'VALIDATION', 1, 1, NULL),
(8983, 'intg_plm_erp_error_type', '超时', 'TIMEOUT', 2, 1, NULL),
(8984, 'intg_plm_erp_error_type', '数据冲突', 'CONFLICT', 3, 1, NULL),
(8985, 'intg_plm_erp_error_type', '网络异常', 'NETWORK', 4, 1, NULL),
(8986, 'intg_plm_erp_error_type', '其他', 'OTHER', 5, 1, NULL),
(8987, 'intg_plm_erp_compensation_status', '待处理', 'PENDING', 1, 1, NULL),
(8988, 'intg_plm_erp_compensation_status', '处理中', 'PROCESSING', 2, 1, NULL),
(8989, 'intg_plm_erp_compensation_status', '已解决', 'RESOLVED', 3, 1, NULL),
(8990, 'intg_plm_erp_compensation_status', '已忽略', 'IGNORED', 4, 1, NULL),
(8991, 'intg_plm_erp_reconcile_status', '待对账', 'PENDING', 1, 1, NULL),
(8992, 'intg_plm_erp_reconcile_status', '已平账', 'BALANCED', 2, 1, NULL),
(8993, 'intg_plm_erp_reconcile_status', '存在差异', 'DIFF', 3, 1, NULL),
(8994, 'intg_plm_erp_reconcile_status', '已关闭', 'CLOSED', 4, 1, NULL);

-- ========== PLM→ERP 集成可配置项（6756-6768） ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(6756, 'INTG', 'intg.plm-erp.enabled', 'PLM→ERP 集成启用开关', 'true', 0, 1, 'PLM→ERP 集成总开关，默认启用'),
(6757, 'INTG', 'intg.plm-erp.batch.size', '同步批次单批条数', '200', 1, 1, '单批同步条数，待业务方确认并发规模后调整'),
(6758, 'INTG', 'intg.plm-erp.retry.times', '失败重试次数', '3', 1, 1, '接口失败自动重试次数，待业务方确认'),
(6759, 'INTG', 'intg.plm-erp.timeout.ms', '接口超时时间（毫秒）', '30000', 1, 1, '接口调用超时时间，待业务方确认'),
(6760, 'INTG', 'intg.plm-erp.idempotent.window.hours', '幂等窗口（小时）', '24', 1, 1, '幂等判重时间窗口，待业务方确认'),
(6761, 'INTG', 'intg.plm-erp.receipt.auto', 'ERP 回执自动生成', 'true', 0, 1, 'ERP 校验通过后自动生成回执'),
(6762, 'INTG', 'intg.plm-erp.reconcile.cron', '对账任务计划表达式', '0 0 2 * * ?', 1, 1, '每日对账任务 Cron，待业务方确认对账频率'),
(6763, 'INTG', 'intg.plm-erp.interface.no.prefix', '集成接口编号前缀', 'PEI', 0, 1, '集成接口编号自动生成前缀'),
(6764, 'INTG', 'intg.plm-erp.mapping.no.prefix', '字段映射编号前缀', 'PEM', 0, 1, '字段映射编号自动生成前缀'),
(6765, 'INTG', 'intg.plm-erp.batch.no.prefix', '同步批次编号前缀', 'PEB', 0, 1, '同步批次编号自动生成前缀'),
(6766, 'INTG', 'intg.plm-erp.receipt.no.prefix', '接收回执编号前缀', 'PER', 0, 1, '接收回执编号自动生成前缀'),
(6767, 'INTG', 'intg.plm-erp.compensation.no.prefix', '异常补偿编号前缀', 'PEC', 0, 1, '异常补偿编号自动生成前缀'),
(6768, 'INTG', 'intg.plm-erp.reconcile.no.prefix', '对账编号前缀', 'PEO', 0, 1, '对账编号自动生成前缀');
