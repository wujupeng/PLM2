-- G9-N4 数据迁移—未结业务迁移（WBS T079）初始化：菜单/按钮权限、角色授权、字典与可配置项。
-- 号段基线（V163 之后实测）：sys_permission=5286（本脚本从 5287 起）、
-- sys_role_permission=16969（从 16970 起）、sys_dictionary=9654（从 9655 起）、sys_config=6976（从 6977 起）。
-- 菜单说明：G9「数据迁移」顶级菜单域（5229，V163 建立）复用，本节点新增二级方向分组
--          未结业务迁移（5287），覆盖集成接口、字段映射、同步批次、接收回执、异常补偿、对账。

-- ========== 未结业务迁移方向分组（5287，挂在 5229 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(5287, 'mig:open-business', '未结业务迁移', 'menu', 5229, '/mig/open-business', 'SwapOutlined', 4, 1);

-- ========== 未结业务迁移业务菜单（5288-5293，挂在 5287 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(5288, 'mig:open-business:interface', '集成接口', 'menu', 5287, '/mig/open-business/interfaces', 'ApiOutlined', 1, 1),
(5289, 'mig:open-business:mapping', '字段映射', 'menu', 5287, '/mig/open-business/mappings', 'PartitionOutlined', 2, 1),
(5290, 'mig:open-business:batch', '同步批次', 'menu', 5287, '/mig/open-business/batches', 'SyncOutlined', 3, 1),
(5291, 'mig:open-business:receipt', '接收回执', 'menu', 5287, '/mig/open-business/receipts', 'AuditOutlined', 4, 1),
(5292, 'mig:open-business:compensation', '异常补偿', 'menu', 5287, '/mig/open-business/compensations', 'ToolOutlined', 5, 1),
(5293, 'mig:open-business:reconcile', '对账', 'menu', 5287, '/mig/open-business/reconciles', 'BalanceOutlined', 6, 1);

-- ========== 未结业务迁移按钮（5294-5305） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(5294, 'mig:open-business:interface:list', '查询集成接口', 'button', 5288, NULL, NULL, 1, 1),
(5295, 'mig:open-business:interface:manage', '维护集成接口', 'button', 5288, NULL, NULL, 2, 1),
(5296, 'mig:open-business:mapping:list', '查询字段映射', 'button', 5289, NULL, NULL, 1, 1),
(5297, 'mig:open-business:mapping:manage', '维护字段映射', 'button', 5289, NULL, NULL, 2, 1),
(5298, 'mig:open-business:batch:list', '查询同步批次', 'button', 5290, NULL, NULL, 1, 1),
(5299, 'mig:open-business:batch:manage', '维护同步批次', 'button', 5290, NULL, NULL, 2, 1),
(5300, 'mig:open-business:receipt:list', '查询接收回执', 'button', 5291, NULL, NULL, 1, 1),
(5301, 'mig:open-business:receipt:manage', '维护接收回执', 'button', 5291, NULL, NULL, 2, 1),
(5302, 'mig:open-business:compensation:list', '查询异常补偿', 'button', 5292, NULL, NULL, 1, 1),
(5303, 'mig:open-business:compensation:manage', '维护异常补偿', 'button', 5292, NULL, NULL, 2, 1),
(5304, 'mig:open-business:reconcile:list', '查询对账', 'button', 5293, NULL, NULL, 1, 1),
(5305, 'mig:open-business:reconcile:manage', '维护对账', 'button', 5293, NULL, NULL, 2, 1);

-- ========== 角色授权（16970-17059） ==========

-- 系统管理员（2001）：授予全部权限（19 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(16970, 2001, 5287), (16971, 2001, 5288), (16972, 2001, 5289), (16973, 2001, 5290),
(16974, 2001, 5291), (16975, 2001, 5292), (16976, 2001, 5293), (16977, 2001, 5294),
(16978, 2001, 5295), (16979, 2001, 5296), (16980, 2001, 5297), (16981, 2001, 5298),
(16982, 2001, 5299), (16983, 2001, 5300), (16984, 2001, 5301), (16985, 2001, 5302),
(16986, 2001, 5303), (16987, 2001, 5304), (16988, 2001, 5305);

-- 供应链专员（2004）：授予全部权限（未结业务迁移主责角色，共 19 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(16989, 2004, 5287), (16990, 2004, 5288), (16991, 2004, 5289), (16992, 2004, 5290),
(16993, 2004, 5291), (16994, 2004, 5292), (16995, 2004, 5293), (16996, 2004, 5294),
(16997, 2004, 5295), (16998, 2004, 5296), (16999, 2004, 5297), (17000, 2004, 5298),
(17001, 2004, 5299), (17002, 2004, 5300), (17003, 2004, 5301), (17004, 2004, 5302),
(17005, 2004, 5303), (17006, 2004, 5304), (17007, 2004, 5305);

-- 质量工程师（2003）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(17008, 2003, 5287), (17009, 2003, 5288), (17010, 2003, 5289), (17011, 2003, 5290),
(17012, 2003, 5291), (17013, 2003, 5292), (17014, 2003, 5293), (17015, 2003, 5294),
(17016, 2003, 5296), (17017, 2003, 5298), (17018, 2003, 5300), (17019, 2003, 5302),
(17020, 2003, 5304);

-- 生产现场（2005）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(17021, 2005, 5287), (17022, 2005, 5288), (17023, 2005, 5289), (17024, 2005, 5290),
(17025, 2005, 5291), (17026, 2005, 5292), (17027, 2005, 5293), (17028, 2005, 5294),
(17029, 2005, 5296), (17030, 2005, 5298), (17031, 2005, 5300), (17032, 2005, 5302),
(17033, 2005, 5304);

-- 研发工程师（2002）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(17034, 2002, 5287), (17035, 2002, 5288), (17036, 2002, 5289), (17037, 2002, 5290),
(17038, 2002, 5291), (17039, 2002, 5292), (17040, 2002, 5293), (17041, 2002, 5294),
(17042, 2002, 5296), (17043, 2002, 5298), (17044, 2002, 5300), (17045, 2002, 5302),
(17046, 2002, 5304);

-- 只读用户（2006）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(17047, 2006, 5287), (17048, 2006, 5288), (17049, 2006, 5289), (17050, 2006, 5290),
(17051, 2006, 5291), (17052, 2006, 5292), (17053, 2006, 5293), (17054, 2006, 5294),
(17055, 2006, 5296), (17056, 2006, 5298), (17057, 2006, 5300), (17058, 2006, 5302),
(17059, 2006, 5304);


-- ========== 未结业务迁移集成字典（9655-9695） ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(9655, 'mig_open_business_object_type', '未结销售订单', 'OPEN_SALES_ORDER', 1, 1, NULL),
(9656, 'mig_open_business_object_type', '未结采购订单', 'OPEN_PURCHASE_ORDER', 2, 1, NULL),
(9657, 'mig_open_business_object_type', '委外单', 'OUTSOURCE_ORDER', 3, 1, NULL),
(9658, 'mig_open_business_object_type', '生产工单', 'PRODUCTION_ORDER', 4, 1, NULL),
(9659, 'mig_open_business_object_type', '在途/待检', 'IN_TRANSIT', 5, 1, NULL),
(9660, 'mig_open_business_protocol', 'API 接口', 'API', 1, 1, NULL),
(9661, 'mig_open_business_protocol', '事件消息', 'EVENT', 2, 1, NULL),
(9662, 'mig_open_business_protocol', '批量文件', 'FILE', 3, 1, NULL),
(9663, 'mig_open_business_trigger_type', '手工触发', 'MANUAL', 1, 1, NULL),
(9664, 'mig_open_business_trigger_type', '定时触发', 'SCHEDULED', 2, 1, NULL),
(9665, 'mig_open_business_trigger_type', '事件触发', 'EVENT', 3, 1, NULL),
(9666, 'mig_open_business_sync_mode', '全量', 'FULL', 1, 1, NULL),
(9667, 'mig_open_business_sync_mode', '增量', 'INCREMENTAL', 2, 1, NULL),
(9668, 'mig_open_business_interface_status', '草稿', 'DRAFT', 1, 1, NULL),
(9669, 'mig_open_business_interface_status', '启用', 'ACTIVE', 2, 1, NULL),
(9670, 'mig_open_business_interface_status', '停用', 'DISABLED', 3, 1, NULL),
(9671, 'mig_open_business_mapping_status', '草稿', 'DRAFT', 1, 1, NULL),
(9672, 'mig_open_business_mapping_status', '启用', 'ACTIVE', 2, 1, NULL),
(9673, 'mig_open_business_mapping_status', '停用', 'DISABLED', 3, 1, NULL),
(9674, 'mig_open_business_batch_status', '待执行', 'PENDING', 1, 1, NULL),
(9675, 'mig_open_business_batch_status', '执行中', 'RUNNING', 2, 1, NULL),
(9676, 'mig_open_business_batch_status', '成功', 'SUCCESS', 3, 1, NULL),
(9677, 'mig_open_business_batch_status', '部分成功', 'PARTIAL', 4, 1, NULL),
(9678, 'mig_open_business_batch_status', '失败', 'FAILED', 5, 1, NULL),
(9679, 'mig_open_business_receipt_status', '待回执', 'PENDING', 1, 1, NULL),
(9680, 'mig_open_business_receipt_status', '已接收', 'ACCEPTED', 2, 1, NULL),
(9681, 'mig_open_business_receipt_status', '已拒绝', 'REJECTED', 3, 1, NULL),
(9682, 'mig_open_business_receipt_status', '警告', 'WARN', 4, 1, NULL),
(9683, 'mig_open_business_error_type', '校验失败', 'VALIDATION', 1, 1, NULL),
(9684, 'mig_open_business_error_type', '超时', 'TIMEOUT', 2, 1, NULL),
(9685, 'mig_open_business_error_type', '数据冲突', 'CONFLICT', 3, 1, NULL),
(9686, 'mig_open_business_error_type', '网络异常', 'NETWORK', 4, 1, NULL),
(9687, 'mig_open_business_error_type', '其他', 'OTHER', 5, 1, NULL),
(9688, 'mig_open_business_compensation_status', '待处理', 'PENDING', 1, 1, NULL),
(9689, 'mig_open_business_compensation_status', '处理中', 'PROCESSING', 2, 1, NULL),
(9690, 'mig_open_business_compensation_status', '已解决', 'RESOLVED', 3, 1, NULL),
(9691, 'mig_open_business_compensation_status', '已忽略', 'IGNORED', 4, 1, NULL),
(9692, 'mig_open_business_reconcile_status', '待对账', 'PENDING', 1, 1, NULL),
(9693, 'mig_open_business_reconcile_status', '已平账', 'BALANCED', 2, 1, NULL),
(9694, 'mig_open_business_reconcile_status', '存在差异', 'DIFF', 3, 1, NULL),
(9695, 'mig_open_business_reconcile_status', '已关闭', 'CLOSED', 4, 1, NULL);

-- ========== 未结业务迁移集成可配置项（6977-6989） ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(6977, 'MIG', 'mig.open-business.enabled', '未结业务迁移启用开关', 'true', 0, 1, '未结业务迁移总开关，默认启用'),
(6978, 'MIG', 'mig.open-business.batch.size', '迁移批次单批条数', '200', 1, 1, '单批迁移条数，待业务方确认数据规模后调整'),
(6979, 'MIG', 'mig.open-business.retry.times', '失败重试次数', '3', 1, 1, '未结业务迁移重试次数，待业务方确认'),
(6980, 'MIG', 'mig.open-business.timeout.ms', '接口超时时间（毫秒）', '30000', 1, 1, '接口调用超时时间，待业务方确认'),
(6981, 'MIG', 'mig.open-business.idempotent.window.hours', '幂等窗口（小时）', '24', 1, 1, '幂等判重时间窗口，待业务方确认'),
(6982, 'MIG', 'mig.open-business.receipt.auto', '系统回执自动生成', 'true', 0, 1, '系统校验通过后自动生成回执'),
(6983, 'MIG', 'mig.open-business.reconcile.cron', '对账任务计划表达式', '0 0 2 * * ?', 1, 1, '每日对账任务 Cron，待业务方确认对账频率'),
(6984, 'MIG', 'mig.open-business.interface.no.prefix', '集成接口编号前缀', 'OBI', 0, 1, '集成接口编号自动生成前缀'),
(6985, 'MIG', 'mig.open-business.mapping.no.prefix', '字段映射编号前缀', 'OBM', 0, 1, '字段映射编号自动生成前缀'),
(6986, 'MIG', 'mig.open-business.batch.no.prefix', '同步批次编号前缀', 'OBB', 0, 1, '同步批次编号自动生成前缀'),
(6987, 'MIG', 'mig.open-business.receipt.no.prefix', '接收回执编号前缀', 'OBR', 0, 1, '接收回执编号自动生成前缀'),
(6988, 'MIG', 'mig.open-business.compensation.no.prefix', '异常补偿编号前缀', 'OBC', 0, 1, '异常补偿编号自动生成前缀'),
(6989, 'MIG', 'mig.open-business.reconcile.no.prefix', '对账编号前缀', 'OBO', 0, 1, '对账编号自动生成前缀');
