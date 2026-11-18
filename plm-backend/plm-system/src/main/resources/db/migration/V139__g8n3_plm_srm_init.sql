-- G8-N3 六系统集成—PLM→SRM（WBS T064）初始化：菜单/按钮权限、角色授权、字典与可配置项。
-- 号段基线（V137 之后实测）：sys_permission=5000（本脚本从 5001 起）、
-- sys_role_permission=15613（从 15614 起）、sys_dictionary=9035（从 9036 起）、sys_config=6781（从 6782 起）。
-- 菜单说明：G8「系统集成」顶级菜单域（4962，V135 建立）复用，本节点新增二级方向分组
--          PLM→SRM（5001），覆盖集成接口、字段映射、同步批次、接收回执、异常补偿、对账。

-- ========== PLM→SRM 集成方向分组（5001，挂在 4962 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(5001, 'intg:plm-srm', 'PLM→SRM 集成', 'menu', 4962, '/intg/plm-srm', 'SwapRightOutlined', 3, 1);

-- ========== PLM→SRM 业务菜单（5002-5007，挂在 5001 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(5002, 'intg:plm-srm:interface', '集成接口', 'menu', 5001, '/intg/plm-srm/interfaces', 'ApiOutlined', 1, 1),
(5003, 'intg:plm-srm:mapping', '字段映射', 'menu', 5001, '/intg/plm-srm/mappings', 'PartitionOutlined', 2, 1),
(5004, 'intg:plm-srm:batch', '同步批次', 'menu', 5001, '/intg/plm-srm/batches', 'SyncOutlined', 3, 1),
(5005, 'intg:plm-srm:receipt', '接收回执', 'menu', 5001, '/intg/plm-srm/receipts', 'AuditOutlined', 4, 1),
(5006, 'intg:plm-srm:compensation', '异常补偿', 'menu', 5001, '/intg/plm-srm/compensations', 'ToolOutlined', 5, 1),
(5007, 'intg:plm-srm:reconcile', '对账', 'menu', 5001, '/intg/plm-srm/reconciles', 'BalanceOutlined', 6, 1);

-- ========== PLM→SRM 按钮（5008-5019） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(5008, 'intg:plm-srm:interface:list', '查询集成接口', 'button', 5002, NULL, NULL, 1, 1),
(5009, 'intg:plm-srm:interface:manage', '维护集成接口', 'button', 5002, NULL, NULL, 2, 1),
(5010, 'intg:plm-srm:mapping:list', '查询字段映射', 'button', 5003, NULL, NULL, 1, 1),
(5011, 'intg:plm-srm:mapping:manage', '维护字段映射', 'button', 5003, NULL, NULL, 2, 1),
(5012, 'intg:plm-srm:batch:list', '查询同步批次', 'button', 5004, NULL, NULL, 1, 1),
(5013, 'intg:plm-srm:batch:manage', '维护同步批次', 'button', 5004, NULL, NULL, 2, 1),
(5014, 'intg:plm-srm:receipt:list', '查询接收回执', 'button', 5005, NULL, NULL, 1, 1),
(5015, 'intg:plm-srm:receipt:manage', '维护接收回执', 'button', 5005, NULL, NULL, 2, 1),
(5016, 'intg:plm-srm:compensation:list', '查询异常补偿', 'button', 5006, NULL, NULL, 1, 1),
(5017, 'intg:plm-srm:compensation:manage', '维护异常补偿', 'button', 5006, NULL, NULL, 2, 1),
(5018, 'intg:plm-srm:reconcile:list', '查询对账', 'button', 5007, NULL, NULL, 1, 1),
(5019, 'intg:plm-srm:reconcile:manage', '维护对账', 'button', 5007, NULL, NULL, 2, 1);

-- ========== 角色授权（15614-15703） ==========

-- 系统管理员（2001）：授予全部权限（19 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(15614, 2001, 5001), (15615, 2001, 5002), (15616, 2001, 5003), (15617, 2001, 5004),
(15618, 2001, 5005), (15619, 2001, 5006), (15620, 2001, 5007), (15621, 2001, 5008),
(15622, 2001, 5009), (15623, 2001, 5010), (15624, 2001, 5011), (15625, 2001, 5012),
(15626, 2001, 5013), (15627, 2001, 5014), (15628, 2001, 5015), (15629, 2001, 5016),
(15630, 2001, 5017), (15631, 2001, 5018), (15632, 2001, 5019);

-- 研发工程师（2002）：授予全部权限（PLM 为发布方，共 19 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(15633, 2002, 5001), (15634, 2002, 5002), (15635, 2002, 5003), (15636, 2002, 5004),
(15637, 2002, 5005), (15638, 2002, 5006), (15639, 2002, 5007), (15640, 2002, 5008),
(15641, 2002, 5009), (15642, 2002, 5010), (15643, 2002, 5011), (15644, 2002, 5012),
(15645, 2002, 5013), (15646, 2002, 5014), (15647, 2002, 5015), (15648, 2002, 5016),
(15649, 2002, 5017), (15650, 2002, 5018), (15651, 2002, 5019);

-- 质量工程师（2003）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(15652, 2003, 5001), (15653, 2003, 5002), (15654, 2003, 5003), (15655, 2003, 5004),
(15656, 2003, 5005), (15657, 2003, 5006), (15658, 2003, 5007), (15659, 2003, 5008),
(15660, 2003, 5010), (15661, 2003, 5012), (15662, 2003, 5014), (15663, 2003, 5016),
(15664, 2003, 5018);

-- 供应链专员（2004）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(15665, 2004, 5001), (15666, 2004, 5002), (15667, 2004, 5003), (15668, 2004, 5004),
(15669, 2004, 5005), (15670, 2004, 5006), (15671, 2004, 5007), (15672, 2004, 5008),
(15673, 2004, 5010), (15674, 2004, 5012), (15675, 2004, 5014), (15676, 2004, 5016),
(15677, 2004, 5018);

-- 生产现场（2005）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(15678, 2005, 5001), (15679, 2005, 5002), (15680, 2005, 5003), (15681, 2005, 5004),
(15682, 2005, 5005), (15683, 2005, 5006), (15684, 2005, 5007), (15685, 2005, 5008),
(15686, 2005, 5010), (15687, 2005, 5012), (15688, 2005, 5014), (15689, 2005, 5016),
(15690, 2005, 5018);

-- 只读用户（2006）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(15691, 2006, 5001), (15692, 2006, 5002), (15693, 2006, 5003), (15694, 2006, 5004),
(15695, 2006, 5005), (15696, 2006, 5006), (15697, 2006, 5007), (15698, 2006, 5008),
(15699, 2006, 5010), (15700, 2006, 5012), (15701, 2006, 5014), (15702, 2006, 5016),
(15703, 2006, 5018);

-- ========== PLM→SRM 集成字典（9036-9075） ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(9036, 'intg_plm_srm_object_type', '采购技术规范', 'PURCHASE_SPEC', 1, 1, NULL),
(9037, 'intg_plm_srm_object_type', '图纸', 'DRAWING', 2, 1, NULL),
(9038, 'intg_plm_srm_object_type', '质量要求', 'QUALITY_REQUIREMENT', 3, 1, NULL),
(9039, 'intg_plm_srm_object_type', '供应商受控文件', 'CONTROLLED_DOC', 4, 1, NULL),
(9040, 'intg_plm_srm_protocol', 'API 接口', 'API', 1, 1, NULL),
(9041, 'intg_plm_srm_protocol', '事件消息', 'EVENT', 2, 1, NULL),
(9042, 'intg_plm_srm_protocol', '批量文件', 'FILE', 3, 1, NULL),
(9043, 'intg_plm_srm_trigger_type', '手工触发', 'MANUAL', 1, 1, NULL),
(9044, 'intg_plm_srm_trigger_type', '定时触发', 'SCHEDULED', 2, 1, NULL),
(9045, 'intg_plm_srm_trigger_type', '事件触发', 'EVENT', 3, 1, NULL),
(9046, 'intg_plm_srm_sync_mode', '全量', 'FULL', 1, 1, NULL),
(9047, 'intg_plm_srm_sync_mode', '增量', 'INCREMENTAL', 2, 1, NULL),
(9048, 'intg_plm_srm_interface_status', '草稿', 'DRAFT', 1, 1, NULL),
(9049, 'intg_plm_srm_interface_status', '启用', 'ACTIVE', 2, 1, NULL),
(9050, 'intg_plm_srm_interface_status', '停用', 'DISABLED', 3, 1, NULL),
(9051, 'intg_plm_srm_mapping_status', '草稿', 'DRAFT', 1, 1, NULL),
(9052, 'intg_plm_srm_mapping_status', '启用', 'ACTIVE', 2, 1, NULL),
(9053, 'intg_plm_srm_mapping_status', '停用', 'DISABLED', 3, 1, NULL),
(9054, 'intg_plm_srm_batch_status', '待执行', 'PENDING', 1, 1, NULL),
(9055, 'intg_plm_srm_batch_status', '执行中', 'RUNNING', 2, 1, NULL),
(9056, 'intg_plm_srm_batch_status', '成功', 'SUCCESS', 3, 1, NULL),
(9057, 'intg_plm_srm_batch_status', '部分成功', 'PARTIAL', 4, 1, NULL),
(9058, 'intg_plm_srm_batch_status', '失败', 'FAILED', 5, 1, NULL),
(9059, 'intg_plm_srm_receipt_status', '待回执', 'PENDING', 1, 1, NULL),
(9060, 'intg_plm_srm_receipt_status', '已接收', 'ACCEPTED', 2, 1, NULL),
(9061, 'intg_plm_srm_receipt_status', '已拒绝', 'REJECTED', 3, 1, NULL),
(9062, 'intg_plm_srm_receipt_status', '警告', 'WARN', 4, 1, NULL),
(9063, 'intg_plm_srm_error_type', '校验失败', 'VALIDATION', 1, 1, NULL),
(9064, 'intg_plm_srm_error_type', '超时', 'TIMEOUT', 2, 1, NULL),
(9065, 'intg_plm_srm_error_type', '数据冲突', 'CONFLICT', 3, 1, NULL),
(9066, 'intg_plm_srm_error_type', '网络异常', 'NETWORK', 4, 1, NULL),
(9067, 'intg_plm_srm_error_type', '其他', 'OTHER', 5, 1, NULL),
(9068, 'intg_plm_srm_compensation_status', '待处理', 'PENDING', 1, 1, NULL),
(9069, 'intg_plm_srm_compensation_status', '处理中', 'PROCESSING', 2, 1, NULL),
(9070, 'intg_plm_srm_compensation_status', '已解决', 'RESOLVED', 3, 1, NULL),
(9071, 'intg_plm_srm_compensation_status', '已忽略', 'IGNORED', 4, 1, NULL),
(9072, 'intg_plm_srm_reconcile_status', '待对账', 'PENDING', 1, 1, NULL),
(9073, 'intg_plm_srm_reconcile_status', '已平账', 'BALANCED', 2, 1, NULL),
(9074, 'intg_plm_srm_reconcile_status', '存在差异', 'DIFF', 3, 1, NULL),
(9075, 'intg_plm_srm_reconcile_status', '已关闭', 'CLOSED', 4, 1, NULL);

-- ========== PLM→SRM 集成可配置项（6782-6794） ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(6782, 'INTG', 'intg.plm-srm.enabled', 'PLM→SRM 集成启用开关', 'true', 0, 1, 'PLM→SRM 集成总开关，默认启用'),
(6783, 'INTG', 'intg.plm-srm.batch.size', '同步批次单批条数', '200', 1, 1, '单批同步条数，待业务方确认并发规模后调整'),
(6784, 'INTG', 'intg.plm-srm.retry.times', '失败重试次数', '3', 1, 1, '接口失败自动重试次数，待业务方确认'),
(6785, 'INTG', 'intg.plm-srm.timeout.ms', '接口超时时间（毫秒）', '30000', 1, 1, '接口调用超时时间，待业务方确认'),
(6786, 'INTG', 'intg.plm-srm.idempotent.window.hours', '幂等窗口（小时）', '24', 1, 1, '幂等判重时间窗口，待业务方确认'),
(6787, 'INTG', 'intg.plm-srm.receipt.auto', 'SRM 回执自动生成', 'true', 0, 1, 'SRM 校验通过后自动生成回执'),
(6788, 'INTG', 'intg.plm-srm.reconcile.cron', '对账任务计划表达式', '0 0 2 * * ?', 1, 1, '每日对账任务 Cron，待业务方确认对账频率'),
(6789, 'INTG', 'intg.plm-srm.interface.no.prefix', '集成接口编号前缀', 'PSI', 0, 1, '集成接口编号自动生成前缀'),
(6790, 'INTG', 'intg.plm-srm.mapping.no.prefix', '字段映射编号前缀', 'PSM', 0, 1, '字段映射编号自动生成前缀'),
(6791, 'INTG', 'intg.plm-srm.batch.no.prefix', '同步批次编号前缀', 'PSB', 0, 1, '同步批次编号自动生成前缀'),
(6792, 'INTG', 'intg.plm-srm.receipt.no.prefix', '接收回执编号前缀', 'PSR', 0, 1, '接收回执编号自动生成前缀'),
(6793, 'INTG', 'intg.plm-srm.compensation.no.prefix', '异常补偿编号前缀', 'PSC', 0, 1, '异常补偿编号自动生成前缀'),
(6794, 'INTG', 'intg.plm-srm.reconcile.no.prefix', '对账编号前缀', 'PSO', 0, 1, '对账编号自动生成前缀');
