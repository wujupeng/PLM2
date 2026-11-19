-- G9-N1 数据迁移—主数据迁移（WBS T076）初始化：菜单/按钮权限、角色授权、字典与可配置项。
-- 号段基线（V161 之后实测）：sys_permission=5228（本脚本从 5229 起）、
-- sys_role_permission=16693（从 16694 起）、sys_dictionary=9531（从 9532 起）、sys_config=6937（从 6938 起）。
-- 菜单说明：G9「数据迁移」顶级菜单域（5229）随本节点建立，按迁移方向挂二级分组，
--          主数据迁移（5230）为首个方向，覆盖集成接口、字段映射、同步批次、接收回执、异常补偿、对账。

-- ========== G9 数据迁移顶级菜单（5229） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(5229, 'mig-domain', '数据迁移', 'menu', 0, NULL, 'ImportOutlined', 20, 1);

-- ========== 主数据迁移方向分组（5230，挂在 5229 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(5230, 'mig:master-data', '主数据迁移', 'menu', 5229, '/mig/master-data', 'SwapOutlined', 1, 1);

-- ========== 主数据迁移业务菜单（5231-5236，挂在 5230 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(5231, 'mig:master-data:interface', '集成接口', 'menu', 5230, '/mig/master-data/interfaces', 'ApiOutlined', 1, 1),
(5232, 'mig:master-data:mapping', '字段映射', 'menu', 5230, '/mig/master-data/mappings', 'PartitionOutlined', 2, 1),
(5233, 'mig:master-data:batch', '同步批次', 'menu', 5230, '/mig/master-data/batches', 'SyncOutlined', 3, 1),
(5234, 'mig:master-data:receipt', '接收回执', 'menu', 5230, '/mig/master-data/receipts', 'AuditOutlined', 4, 1),
(5235, 'mig:master-data:compensation', '异常补偿', 'menu', 5230, '/mig/master-data/compensations', 'ToolOutlined', 5, 1),
(5236, 'mig:master-data:reconcile', '对账', 'menu', 5230, '/mig/master-data/reconciles', 'BalanceOutlined', 6, 1);

-- ========== 主数据迁移按钮（5237-5248） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(5237, 'mig:master-data:interface:list', '查询集成接口', 'button', 5231, NULL, NULL, 1, 1),
(5238, 'mig:master-data:interface:manage', '维护集成接口', 'button', 5231, NULL, NULL, 2, 1),
(5239, 'mig:master-data:mapping:list', '查询字段映射', 'button', 5232, NULL, NULL, 1, 1),
(5240, 'mig:master-data:mapping:manage', '维护字段映射', 'button', 5232, NULL, NULL, 2, 1),
(5241, 'mig:master-data:batch:list', '查询同步批次', 'button', 5233, NULL, NULL, 1, 1),
(5242, 'mig:master-data:batch:manage', '维护同步批次', 'button', 5233, NULL, NULL, 2, 1),
(5243, 'mig:master-data:receipt:list', '查询接收回执', 'button', 5234, NULL, NULL, 1, 1),
(5244, 'mig:master-data:receipt:manage', '维护接收回执', 'button', 5234, NULL, NULL, 2, 1),
(5245, 'mig:master-data:compensation:list', '查询异常补偿', 'button', 5235, NULL, NULL, 1, 1),
(5246, 'mig:master-data:compensation:manage', '维护异常补偿', 'button', 5235, NULL, NULL, 2, 1),
(5247, 'mig:master-data:reconcile:list', '查询对账', 'button', 5236, NULL, NULL, 1, 1),
(5248, 'mig:master-data:reconcile:manage', '维护对账', 'button', 5236, NULL, NULL, 2, 1);

-- ========== 角色授权（16694-16789） ==========

-- 系统管理员（2001）：授予全部权限（20 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(16694, 2001, 5229), (16695, 2001, 5230), (16696, 2001, 5231), (16697, 2001, 5232),
(16698, 2001, 5233), (16699, 2001, 5234), (16700, 2001, 5235), (16701, 2001, 5236),
(16702, 2001, 5237), (16703, 2001, 5238), (16704, 2001, 5239), (16705, 2001, 5240),
(16706, 2001, 5241), (16707, 2001, 5242), (16708, 2001, 5243), (16709, 2001, 5244),
(16710, 2001, 5245), (16711, 2001, 5246), (16712, 2001, 5247), (16713, 2001, 5248);

-- 供应链专员（2004）：授予全部权限（主数据迁移主责角色，共 20 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(16714, 2004, 5229), (16715, 2004, 5230), (16716, 2004, 5231), (16717, 2004, 5232),
(16718, 2004, 5233), (16719, 2004, 5234), (16720, 2004, 5235), (16721, 2004, 5236),
(16722, 2004, 5237), (16723, 2004, 5238), (16724, 2004, 5239), (16725, 2004, 5240),
(16726, 2004, 5241), (16727, 2004, 5242), (16728, 2004, 5243), (16729, 2004, 5244),
(16730, 2004, 5245), (16731, 2004, 5246), (16732, 2004, 5247), (16733, 2004, 5248);

-- 质量工程师（2003）：授予分组/菜单 + 仅查询按钮（14 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(16734, 2003, 5229), (16735, 2003, 5230), (16736, 2003, 5231), (16737, 2003, 5232),
(16738, 2003, 5233), (16739, 2003, 5234), (16740, 2003, 5235), (16741, 2003, 5236),
(16742, 2003, 5237), (16743, 2003, 5239), (16744, 2003, 5241), (16745, 2003, 5243),
(16746, 2003, 5245), (16747, 2003, 5247);

-- 生产现场（2005）：授予分组/菜单 + 仅查询按钮（14 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(16748, 2005, 5229), (16749, 2005, 5230), (16750, 2005, 5231), (16751, 2005, 5232),
(16752, 2005, 5233), (16753, 2005, 5234), (16754, 2005, 5235), (16755, 2005, 5236),
(16756, 2005, 5237), (16757, 2005, 5239), (16758, 2005, 5241), (16759, 2005, 5243),
(16760, 2005, 5245), (16761, 2005, 5247);

-- 研发工程师（2002）：授予分组/菜单 + 仅查询按钮（14 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(16762, 2002, 5229), (16763, 2002, 5230), (16764, 2002, 5231), (16765, 2002, 5232),
(16766, 2002, 5233), (16767, 2002, 5234), (16768, 2002, 5235), (16769, 2002, 5236),
(16770, 2002, 5237), (16771, 2002, 5239), (16772, 2002, 5241), (16773, 2002, 5243),
(16774, 2002, 5245), (16775, 2002, 5247);

-- 只读用户（2006）：授予分组/菜单 + 仅查询按钮（14 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(16776, 2006, 5229), (16777, 2006, 5230), (16778, 2006, 5231), (16779, 2006, 5232),
(16780, 2006, 5233), (16781, 2006, 5234), (16782, 2006, 5235), (16783, 2006, 5236),
(16784, 2006, 5237), (16785, 2006, 5239), (16786, 2006, 5241), (16787, 2006, 5243),
(16788, 2006, 5245), (16789, 2006, 5247);

-- ========== 主数据迁移集成字典（9532-9572） ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(9532, 'mig_master_data_object_type', '物料', 'MATERIAL', 1, 1, NULL),
(9533, 'mig_master_data_object_type', '客户', 'CUSTOMER', 2, 1, NULL),
(9534, 'mig_master_data_object_type', '供应商', 'SUPPLIER', 3, 1, NULL),
(9535, 'mig_master_data_object_type', '计量单位', 'UNIT', 4, 1, NULL),
(9536, 'mig_master_data_object_type', '仓库', 'WAREHOUSE', 5, 1, NULL),
(9537, 'mig_master_data_protocol', 'API 接口', 'API', 1, 1, NULL),
(9538, 'mig_master_data_protocol', '事件消息', 'EVENT', 2, 1, NULL),
(9539, 'mig_master_data_protocol', '批量文件', 'FILE', 3, 1, NULL),
(9540, 'mig_master_data_trigger_type', '手工触发', 'MANUAL', 1, 1, NULL),
(9541, 'mig_master_data_trigger_type', '定时触发', 'SCHEDULED', 2, 1, NULL),
(9542, 'mig_master_data_trigger_type', '事件触发', 'EVENT', 3, 1, NULL),
(9543, 'mig_master_data_sync_mode', '全量', 'FULL', 1, 1, NULL),
(9544, 'mig_master_data_sync_mode', '增量', 'INCREMENTAL', 2, 1, NULL),
(9545, 'mig_master_data_interface_status', '草稿', 'DRAFT', 1, 1, NULL),
(9546, 'mig_master_data_interface_status', '启用', 'ACTIVE', 2, 1, NULL),
(9547, 'mig_master_data_interface_status', '停用', 'DISABLED', 3, 1, NULL),
(9548, 'mig_master_data_mapping_status', '草稿', 'DRAFT', 1, 1, NULL),
(9549, 'mig_master_data_mapping_status', '启用', 'ACTIVE', 2, 1, NULL),
(9550, 'mig_master_data_mapping_status', '停用', 'DISABLED', 3, 1, NULL),
(9551, 'mig_master_data_batch_status', '待执行', 'PENDING', 1, 1, NULL),
(9552, 'mig_master_data_batch_status', '执行中', 'RUNNING', 2, 1, NULL),
(9553, 'mig_master_data_batch_status', '成功', 'SUCCESS', 3, 1, NULL),
(9554, 'mig_master_data_batch_status', '部分成功', 'PARTIAL', 4, 1, NULL),
(9555, 'mig_master_data_batch_status', '失败', 'FAILED', 5, 1, NULL),
(9556, 'mig_master_data_receipt_status', '待回执', 'PENDING', 1, 1, NULL),
(9557, 'mig_master_data_receipt_status', '已接收', 'ACCEPTED', 2, 1, NULL),
(9558, 'mig_master_data_receipt_status', '已拒绝', 'REJECTED', 3, 1, NULL),
(9559, 'mig_master_data_receipt_status', '警告', 'WARN', 4, 1, NULL),
(9560, 'mig_master_data_error_type', '校验失败', 'VALIDATION', 1, 1, NULL),
(9561, 'mig_master_data_error_type', '超时', 'TIMEOUT', 2, 1, NULL),
(9562, 'mig_master_data_error_type', '数据冲突', 'CONFLICT', 3, 1, NULL),
(9563, 'mig_master_data_error_type', '网络异常', 'NETWORK', 4, 1, NULL),
(9564, 'mig_master_data_error_type', '其他', 'OTHER', 5, 1, NULL),
(9565, 'mig_master_data_compensation_status', '待处理', 'PENDING', 1, 1, NULL),
(9566, 'mig_master_data_compensation_status', '处理中', 'PROCESSING', 2, 1, NULL),
(9567, 'mig_master_data_compensation_status', '已解决', 'RESOLVED', 3, 1, NULL),
(9568, 'mig_master_data_compensation_status', '已忽略', 'IGNORED', 4, 1, NULL),
(9569, 'mig_master_data_reconcile_status', '待对账', 'PENDING', 1, 1, NULL),
(9570, 'mig_master_data_reconcile_status', '已平账', 'BALANCED', 2, 1, NULL),
(9571, 'mig_master_data_reconcile_status', '存在差异', 'DIFF', 3, 1, NULL),
(9572, 'mig_master_data_reconcile_status', '已关闭', 'CLOSED', 4, 1, NULL);

-- ========== 主数据迁移集成可配置项（6938-6950） ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(6938, 'MIG', 'mig.master-data.enabled', '主数据迁移启用开关', 'true', 0, 1, '主数据迁移总开关，默认启用'),
(6939, 'MIG', 'mig.master-data.batch.size', '迁移批次单批条数', '200', 1, 1, '单批迁移条数，待业务方确认数据规模后调整'),
(6940, 'MIG', 'mig.master-data.retry.times', '失败重试次数', '3', 1, 1, '主数据迁移重试次数，待业务方确认'),
(6941, 'MIG', 'mig.master-data.timeout.ms', '接口超时时间（毫秒）', '30000', 1, 1, '接口调用超时时间，待业务方确认'),
(6942, 'MIG', 'mig.master-data.idempotent.window.hours', '幂等窗口（小时）', '24', 1, 1, '幂等判重时间窗口，待业务方确认'),
(6943, 'MIG', 'mig.master-data.receipt.auto', '系统回执自动生成', 'true', 0, 1, '系统校验通过后自动生成回执'),
(6944, 'MIG', 'mig.master-data.reconcile.cron', '对账任务计划表达式', '0 0 2 * * ?', 1, 1, '每日对账任务 Cron，待业务方确认对账频率'),
(6945, 'MIG', 'mig.master-data.interface.no.prefix', '集成接口编号前缀', 'MGI', 0, 1, '集成接口编号自动生成前缀'),
(6946, 'MIG', 'mig.master-data.mapping.no.prefix', '字段映射编号前缀', 'MGM', 0, 1, '字段映射编号自动生成前缀'),
(6947, 'MIG', 'mig.master-data.batch.no.prefix', '同步批次编号前缀', 'MGB', 0, 1, '同步批次编号自动生成前缀'),
(6948, 'MIG', 'mig.master-data.receipt.no.prefix', '接收回执编号前缀', 'MGR', 0, 1, '接收回执编号自动生成前缀'),
(6949, 'MIG', 'mig.master-data.compensation.no.prefix', '异常补偿编号前缀', 'MGC', 0, 1, '异常补偿编号自动生成前缀'),
(6950, 'MIG', 'mig.master-data.reconcile.no.prefix', '对账编号前缀', 'MGO', 0, 1, '对账编号自动生成前缀');
