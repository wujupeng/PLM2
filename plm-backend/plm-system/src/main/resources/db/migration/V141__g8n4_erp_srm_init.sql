-- G8-N4 六系统集成—ERP→SRM（WBS T065）初始化：菜单/按钮权限、角色授权、字典与可配置项。
-- 号段基线（V139 之后实测）：sys_permission=5019（本脚本从 5020 起）、
-- sys_role_permission=15703（从 15704 起）、sys_dictionary=9075（从 9076 起）、sys_config=6794（从 6795 起）。
-- 菜单说明：G8「系统集成」顶级菜单域（4962，V135 建立）复用，本节点新增二级方向分组
--          ERP→SRM（5020），覆盖集成接口、字段映射、同步批次、接收回执、异常补偿、对账。

-- ========== ERP→SRM 集成方向分组（5020，挂在 4962 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(5020, 'intg:erp-srm', 'ERP→SRM 集成', 'menu', 4962, '/intg/erp-srm', 'SwapRightOutlined', 4, 1);

-- ========== ERP→SRM 业务菜单（5021-5026，挂在 5020 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(5021, 'intg:erp-srm:interface', '集成接口', 'menu', 5020, '/intg/erp-srm/interfaces', 'ApiOutlined', 1, 1),
(5022, 'intg:erp-srm:mapping', '字段映射', 'menu', 5020, '/intg/erp-srm/mappings', 'PartitionOutlined', 2, 1),
(5023, 'intg:erp-srm:batch', '同步批次', 'menu', 5020, '/intg/erp-srm/batches', 'SyncOutlined', 3, 1),
(5024, 'intg:erp-srm:receipt', '接收回执', 'menu', 5020, '/intg/erp-srm/receipts', 'AuditOutlined', 4, 1),
(5025, 'intg:erp-srm:compensation', '异常补偿', 'menu', 5020, '/intg/erp-srm/compensations', 'ToolOutlined', 5, 1),
(5026, 'intg:erp-srm:reconcile', '对账', 'menu', 5020, '/intg/erp-srm/reconciles', 'BalanceOutlined', 6, 1);

-- ========== ERP→SRM 按钮（5027-5038） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(5027, 'intg:erp-srm:interface:list', '查询集成接口', 'button', 5021, NULL, NULL, 1, 1),
(5028, 'intg:erp-srm:interface:manage', '维护集成接口', 'button', 5021, NULL, NULL, 2, 1),
(5029, 'intg:erp-srm:mapping:list', '查询字段映射', 'button', 5022, NULL, NULL, 1, 1),
(5030, 'intg:erp-srm:mapping:manage', '维护字段映射', 'button', 5022, NULL, NULL, 2, 1),
(5031, 'intg:erp-srm:batch:list', '查询同步批次', 'button', 5023, NULL, NULL, 1, 1),
(5032, 'intg:erp-srm:batch:manage', '维护同步批次', 'button', 5023, NULL, NULL, 2, 1),
(5033, 'intg:erp-srm:receipt:list', '查询接收回执', 'button', 5024, NULL, NULL, 1, 1),
(5034, 'intg:erp-srm:receipt:manage', '维护接收回执', 'button', 5024, NULL, NULL, 2, 1),
(5035, 'intg:erp-srm:compensation:list', '查询异常补偿', 'button', 5025, NULL, NULL, 1, 1),
(5036, 'intg:erp-srm:compensation:manage', '维护异常补偿', 'button', 5025, NULL, NULL, 2, 1),
(5037, 'intg:erp-srm:reconcile:list', '查询对账', 'button', 5026, NULL, NULL, 1, 1),
(5038, 'intg:erp-srm:reconcile:manage', '维护对账', 'button', 5026, NULL, NULL, 2, 1);

-- ========== 角色授权（15704-15793） ==========

-- 系统管理员（2001）：授予全部权限（19 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(15704, 2001, 5020), (15705, 2001, 5021), (15706, 2001, 5022), (15707, 2001, 5023),
(15708, 2001, 5024), (15709, 2001, 5025), (15710, 2001, 5026), (15711, 2001, 5027),
(15712, 2001, 5028), (15713, 2001, 5029), (15714, 2001, 5030), (15715, 2001, 5031),
(15716, 2001, 5032), (15717, 2001, 5033), (15718, 2001, 5034), (15719, 2001, 5035),
(15720, 2001, 5036), (15721, 2001, 5037), (15722, 2001, 5038);

-- 供应链专员（2004）：授予全部权限（ERP 为发布方、SRM 为消费方，共 19 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(15723, 2004, 5020), (15724, 2004, 5021), (15725, 2004, 5022), (15726, 2004, 5023),
(15727, 2004, 5024), (15728, 2004, 5025), (15729, 2004, 5026), (15730, 2004, 5027),
(15731, 2004, 5028), (15732, 2004, 5029), (15733, 2004, 5030), (15734, 2004, 5031),
(15735, 2004, 5032), (15736, 2004, 5033), (15737, 2004, 5034), (15738, 2004, 5035),
(15739, 2004, 5036), (15740, 2004, 5037), (15741, 2004, 5038);

-- 研发工程师（2002）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(15742, 2002, 5020), (15743, 2002, 5021), (15744, 2002, 5022), (15745, 2002, 5023),
(15746, 2002, 5024), (15747, 2002, 5025), (15748, 2002, 5026), (15749, 2002, 5027),
(15750, 2002, 5029), (15751, 2002, 5031), (15752, 2002, 5033), (15753, 2002, 5035),
(15754, 2002, 5037);

-- 质量工程师（2003）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(15755, 2003, 5020), (15756, 2003, 5021), (15757, 2003, 5022), (15758, 2003, 5023),
(15759, 2003, 5024), (15760, 2003, 5025), (15761, 2003, 5026), (15762, 2003, 5027),
(15763, 2003, 5029), (15764, 2003, 5031), (15765, 2003, 5033), (15766, 2003, 5035),
(15767, 2003, 5037);

-- 生产现场（2005）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(15768, 2005, 5020), (15769, 2005, 5021), (15770, 2005, 5022), (15771, 2005, 5023),
(15772, 2005, 5024), (15773, 2005, 5025), (15774, 2005, 5026), (15775, 2005, 5027),
(15776, 2005, 5029), (15777, 2005, 5031), (15778, 2005, 5033), (15779, 2005, 5035),
(15780, 2005, 5037);

-- 只读用户（2006）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(15781, 2006, 5020), (15782, 2006, 5021), (15783, 2006, 5022), (15784, 2006, 5023),
(15785, 2006, 5024), (15786, 2006, 5025), (15787, 2006, 5026), (15788, 2006, 5027),
(15789, 2006, 5029), (15790, 2006, 5031), (15791, 2006, 5033), (15792, 2006, 5035),
(15793, 2006, 5037);

-- ========== ERP→SRM 集成字典（9076-9116） ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(9076, 'intg_erp_srm_object_type', '采购需求', 'PURCHASE_REQUIREMENT', 1, 1, NULL),
(9077, 'intg_erp_srm_object_type', '采购订单', 'PURCHASE_ORDER', 2, 1, NULL),
(9078, 'intg_erp_srm_object_type', '交期变更', 'DELIVERY_CHANGE', 3, 1, NULL),
(9079, 'intg_erp_srm_object_type', '收货结果', 'RECEIVING_RESULT', 4, 1, NULL),
(9080, 'intg_erp_srm_object_type', '对账信息', 'RECONCILE_INFO', 5, 1, NULL),
(9081, 'intg_erp_srm_protocol', 'API 接口', 'API', 1, 1, NULL),
(9082, 'intg_erp_srm_protocol', '事件消息', 'EVENT', 2, 1, NULL),
(9083, 'intg_erp_srm_protocol', '批量文件', 'FILE', 3, 1, NULL),
(9084, 'intg_erp_srm_trigger_type', '手工触发', 'MANUAL', 1, 1, NULL),
(9085, 'intg_erp_srm_trigger_type', '定时触发', 'SCHEDULED', 2, 1, NULL),
(9086, 'intg_erp_srm_trigger_type', '事件触发', 'EVENT', 3, 1, NULL),
(9087, 'intg_erp_srm_sync_mode', '全量', 'FULL', 1, 1, NULL),
(9088, 'intg_erp_srm_sync_mode', '增量', 'INCREMENTAL', 2, 1, NULL),
(9089, 'intg_erp_srm_interface_status', '草稿', 'DRAFT', 1, 1, NULL),
(9090, 'intg_erp_srm_interface_status', '启用', 'ACTIVE', 2, 1, NULL),
(9091, 'intg_erp_srm_interface_status', '停用', 'DISABLED', 3, 1, NULL),
(9092, 'intg_erp_srm_mapping_status', '草稿', 'DRAFT', 1, 1, NULL),
(9093, 'intg_erp_srm_mapping_status', '启用', 'ACTIVE', 2, 1, NULL),
(9094, 'intg_erp_srm_mapping_status', '停用', 'DISABLED', 3, 1, NULL),
(9095, 'intg_erp_srm_batch_status', '待执行', 'PENDING', 1, 1, NULL),
(9096, 'intg_erp_srm_batch_status', '执行中', 'RUNNING', 2, 1, NULL),
(9097, 'intg_erp_srm_batch_status', '成功', 'SUCCESS', 3, 1, NULL),
(9098, 'intg_erp_srm_batch_status', '部分成功', 'PARTIAL', 4, 1, NULL),
(9099, 'intg_erp_srm_batch_status', '失败', 'FAILED', 5, 1, NULL),
(9100, 'intg_erp_srm_receipt_status', '待回执', 'PENDING', 1, 1, NULL),
(9101, 'intg_erp_srm_receipt_status', '已接收', 'ACCEPTED', 2, 1, NULL),
(9102, 'intg_erp_srm_receipt_status', '已拒绝', 'REJECTED', 3, 1, NULL),
(9103, 'intg_erp_srm_receipt_status', '警告', 'WARN', 4, 1, NULL),
(9104, 'intg_erp_srm_error_type', '校验失败', 'VALIDATION', 1, 1, NULL),
(9105, 'intg_erp_srm_error_type', '超时', 'TIMEOUT', 2, 1, NULL),
(9106, 'intg_erp_srm_error_type', '数据冲突', 'CONFLICT', 3, 1, NULL),
(9107, 'intg_erp_srm_error_type', '网络异常', 'NETWORK', 4, 1, NULL),
(9108, 'intg_erp_srm_error_type', '其他', 'OTHER', 5, 1, NULL),
(9109, 'intg_erp_srm_compensation_status', '待处理', 'PENDING', 1, 1, NULL),
(9110, 'intg_erp_srm_compensation_status', '处理中', 'PROCESSING', 2, 1, NULL),
(9111, 'intg_erp_srm_compensation_status', '已解决', 'RESOLVED', 3, 1, NULL),
(9112, 'intg_erp_srm_compensation_status', '已忽略', 'IGNORED', 4, 1, NULL),
(9113, 'intg_erp_srm_reconcile_status', '待对账', 'PENDING', 1, 1, NULL),
(9114, 'intg_erp_srm_reconcile_status', '已平账', 'BALANCED', 2, 1, NULL),
(9115, 'intg_erp_srm_reconcile_status', '存在差异', 'DIFF', 3, 1, NULL),
(9116, 'intg_erp_srm_reconcile_status', '已关闭', 'CLOSED', 4, 1, NULL);

-- ========== ERP→SRM 集成可配置项（6795-6807） ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(6795, 'INTG', 'intg.erp-srm.enabled', 'ERP→SRM 集成启用开关', 'true', 0, 1, 'ERP→SRM 集成总开关，默认启用'),
(6796, 'INTG', 'intg.erp-srm.batch.size', '同步批次单批条数', '200', 1, 1, '单批同步条数，待业务方确认并发规模后调整'),
(6797, 'INTG', 'intg.erp-srm.retry.times', '失败重试次数', '3', 1, 1, '接口失败自动重试次数，待业务方确认'),
(6798, 'INTG', 'intg.erp-srm.timeout.ms', '接口超时时间（毫秒）', '30000', 1, 1, '接口调用超时时间，待业务方确认'),
(6799, 'INTG', 'intg.erp-srm.idempotent.window.hours', '幂等窗口（小时）', '24', 1, 1, '幂等判重时间窗口，待业务方确认'),
(6800, 'INTG', 'intg.erp-srm.receipt.auto', 'SRM 回执自动生成', 'true', 0, 1, 'SRM 校验通过后自动生成回执'),
(6801, 'INTG', 'intg.erp-srm.reconcile.cron', '对账任务计划表达式', '0 0 2 * * ?', 1, 1, '每日对账任务 Cron，待业务方确认对账频率'),
(6802, 'INTG', 'intg.erp-srm.interface.no.prefix', '集成接口编号前缀', 'ESI', 0, 1, '集成接口编号自动生成前缀'),
(6803, 'INTG', 'intg.erp-srm.mapping.no.prefix', '字段映射编号前缀', 'ESM', 0, 1, '字段映射编号自动生成前缀'),
(6804, 'INTG', 'intg.erp-srm.batch.no.prefix', '同步批次编号前缀', 'ESB', 0, 1, '同步批次编号自动生成前缀'),
(6805, 'INTG', 'intg.erp-srm.receipt.no.prefix', '接收回执编号前缀', 'ESR', 0, 1, '接收回执编号自动生成前缀'),
(6806, 'INTG', 'intg.erp-srm.compensation.no.prefix', '异常补偿编号前缀', 'ESC', 0, 1, '异常补偿编号自动生成前缀'),
(6807, 'INTG', 'intg.erp-srm.reconcile.no.prefix', '对账编号前缀', 'ESO', 0, 1, '对账编号自动生成前缀');
