-- G8-N5 六系统集成—SRM→ERP（WBS T066）初始化：菜单/按钮权限、角色授权、字典与可配置项。
-- 号段基线（V141 之后实测）：sys_permission=5038（本脚本从 5039 起）、
-- sys_role_permission=15793（从 15794 起）、sys_dictionary=9116（从 9117 起）、sys_config=6807（从 6808 起）。
-- 菜单说明：G8「系统集成」顶级菜单域（4962，V135 建立）复用，本节点新增二级方向分组
--          SRM→ERP（5039），覆盖集成接口、字段映射、同步批次、接收回执、异常补偿、对账。

-- ========== SRM→ERP 集成方向分组（5039，挂在 4962 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(5039, 'intg:srm-erp', 'SRM→ERP 集成', 'menu', 4962, '/intg/srm-erp', 'SwapRightOutlined', 5, 1);

-- ========== SRM→ERP 业务菜单（5040-5045，挂在 5039 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(5040, 'intg:srm-erp:interface', '集成接口', 'menu', 5039, '/intg/srm-erp/interfaces', 'ApiOutlined', 1, 1),
(5041, 'intg:srm-erp:mapping', '字段映射', 'menu', 5039, '/intg/srm-erp/mappings', 'PartitionOutlined', 2, 1),
(5042, 'intg:srm-erp:batch', '同步批次', 'menu', 5039, '/intg/srm-erp/batches', 'SyncOutlined', 3, 1),
(5043, 'intg:srm-erp:receipt', '接收回执', 'menu', 5039, '/intg/srm-erp/receipts', 'AuditOutlined', 4, 1),
(5044, 'intg:srm-erp:compensation', '异常补偿', 'menu', 5039, '/intg/srm-erp/compensations', 'ToolOutlined', 5, 1),
(5045, 'intg:srm-erp:reconcile', '对账', 'menu', 5039, '/intg/srm-erp/reconciles', 'BalanceOutlined', 6, 1);

-- ========== SRM→ERP 按钮（5046-5057） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(5046, 'intg:srm-erp:interface:list', '查询集成接口', 'button', 5040, NULL, NULL, 1, 1),
(5047, 'intg:srm-erp:interface:manage', '维护集成接口', 'button', 5040, NULL, NULL, 2, 1),
(5048, 'intg:srm-erp:mapping:list', '查询字段映射', 'button', 5041, NULL, NULL, 1, 1),
(5049, 'intg:srm-erp:mapping:manage', '维护字段映射', 'button', 5041, NULL, NULL, 2, 1),
(5050, 'intg:srm-erp:batch:list', '查询同步批次', 'button', 5042, NULL, NULL, 1, 1),
(5051, 'intg:srm-erp:batch:manage', '维护同步批次', 'button', 5042, NULL, NULL, 2, 1),
(5052, 'intg:srm-erp:receipt:list', '查询接收回执', 'button', 5043, NULL, NULL, 1, 1),
(5053, 'intg:srm-erp:receipt:manage', '维护接收回执', 'button', 5043, NULL, NULL, 2, 1),
(5054, 'intg:srm-erp:compensation:list', '查询异常补偿', 'button', 5044, NULL, NULL, 1, 1),
(5055, 'intg:srm-erp:compensation:manage', '维护异常补偿', 'button', 5044, NULL, NULL, 2, 1),
(5056, 'intg:srm-erp:reconcile:list', '查询对账', 'button', 5045, NULL, NULL, 1, 1),
(5057, 'intg:srm-erp:reconcile:manage', '维护对账', 'button', 5045, NULL, NULL, 2, 1);

-- ========== 角色授权（15794-15883） ==========

-- 系统管理员（2001）：授予全部权限（19 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(15794, 2001, 5039), (15795, 2001, 5040), (15796, 2001, 5041), (15797, 2001, 5042),
(15798, 2001, 5043), (15799, 2001, 5044), (15800, 2001, 5045), (15801, 2001, 5046),
(15802, 2001, 5047), (15803, 2001, 5048), (15804, 2001, 5049), (15805, 2001, 5050),
(15806, 2001, 5051), (15807, 2001, 5052), (15808, 2001, 5053), (15809, 2001, 5054),
(15810, 2001, 5055), (15811, 2001, 5056), (15812, 2001, 5057);

-- 供应链专员（2004）：授予全部权限（SRM 为发布方、ERP 为消费方，共 19 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(15813, 2004, 5039), (15814, 2004, 5040), (15815, 2004, 5041), (15816, 2004, 5042),
(15817, 2004, 5043), (15818, 2004, 5044), (15819, 2004, 5045), (15820, 2004, 5046),
(15821, 2004, 5047), (15822, 2004, 5048), (15823, 2004, 5049), (15824, 2004, 5050),
(15825, 2004, 5051), (15826, 2004, 5052), (15827, 2004, 5053), (15828, 2004, 5054),
(15829, 2004, 5055), (15830, 2004, 5056), (15831, 2004, 5057);

-- 研发工程师（2002）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(15832, 2002, 5039), (15833, 2002, 5040), (15834, 2002, 5041), (15835, 2002, 5042),
(15836, 2002, 5043), (15837, 2002, 5044), (15838, 2002, 5045), (15839, 2002, 5046),
(15840, 2002, 5048), (15841, 2002, 5050), (15842, 2002, 5052), (15843, 2002, 5054),
(15844, 2002, 5056);

-- 质量工程师（2003）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(15845, 2003, 5039), (15846, 2003, 5040), (15847, 2003, 5041), (15848, 2003, 5042),
(15849, 2003, 5043), (15850, 2003, 5044), (15851, 2003, 5045), (15852, 2003, 5046),
(15853, 2003, 5048), (15854, 2003, 5050), (15855, 2003, 5052), (15856, 2003, 5054),
(15857, 2003, 5056);

-- 生产现场（2005）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(15858, 2005, 5039), (15859, 2005, 5040), (15860, 2005, 5041), (15861, 2005, 5042),
(15862, 2005, 5043), (15863, 2005, 5044), (15864, 2005, 5045), (15865, 2005, 5046),
(15866, 2005, 5048), (15867, 2005, 5050), (15868, 2005, 5052), (15869, 2005, 5054),
(15870, 2005, 5056);

-- 只读用户（2006）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(15871, 2006, 5039), (15872, 2006, 5040), (15873, 2006, 5041), (15874, 2006, 5042),
(15875, 2006, 5043), (15876, 2006, 5044), (15877, 2006, 5045), (15878, 2006, 5046),
(15879, 2006, 5048), (15880, 2006, 5050), (15881, 2006, 5052), (15882, 2006, 5054),
(15883, 2006, 5056);

-- ========== SRM→ERP 集成字典（9117-9158） ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(9117, 'intg_srm_erp_object_type', '供应商档案', 'SUPPLIER_PROFILE', 1, 1, NULL),
(9118, 'intg_srm_erp_object_type', '准入状态', 'SUPPLIER_QUALIFICATION', 2, 1, NULL),
(9119, 'intg_srm_erp_object_type', '报价定价', 'QUOTATION_PRICING', 3, 1, NULL),
(9120, 'intg_srm_erp_object_type', '订单确认', 'ORDER_CONFIRMATION', 4, 1, NULL),
(9121, 'intg_srm_erp_object_type', 'ASN 送货通知', 'ASN', 5, 1, NULL),
(9122, 'intg_srm_erp_object_type', '发票协同状态', 'INVOICE_COLLABORATION', 6, 1, NULL),
(9123, 'intg_srm_erp_protocol', 'API 接口', 'API', 1, 1, NULL),
(9124, 'intg_srm_erp_protocol', '事件消息', 'EVENT', 2, 1, NULL),
(9125, 'intg_srm_erp_protocol', '批量文件', 'FILE', 3, 1, NULL),
(9126, 'intg_srm_erp_trigger_type', '手工触发', 'MANUAL', 1, 1, NULL),
(9127, 'intg_srm_erp_trigger_type', '定时触发', 'SCHEDULED', 2, 1, NULL),
(9128, 'intg_srm_erp_trigger_type', '事件触发', 'EVENT', 3, 1, NULL),
(9129, 'intg_srm_erp_sync_mode', '全量', 'FULL', 1, 1, NULL),
(9130, 'intg_srm_erp_sync_mode', '增量', 'INCREMENTAL', 2, 1, NULL),
(9131, 'intg_srm_erp_interface_status', '草稿', 'DRAFT', 1, 1, NULL),
(9132, 'intg_srm_erp_interface_status', '启用', 'ACTIVE', 2, 1, NULL),
(9133, 'intg_srm_erp_interface_status', '停用', 'DISABLED', 3, 1, NULL),
(9134, 'intg_srm_erp_mapping_status', '草稿', 'DRAFT', 1, 1, NULL),
(9135, 'intg_srm_erp_mapping_status', '启用', 'ACTIVE', 2, 1, NULL),
(9136, 'intg_srm_erp_mapping_status', '停用', 'DISABLED', 3, 1, NULL),
(9137, 'intg_srm_erp_batch_status', '待执行', 'PENDING', 1, 1, NULL),
(9138, 'intg_srm_erp_batch_status', '执行中', 'RUNNING', 2, 1, NULL),
(9139, 'intg_srm_erp_batch_status', '成功', 'SUCCESS', 3, 1, NULL),
(9140, 'intg_srm_erp_batch_status', '部分成功', 'PARTIAL', 4, 1, NULL),
(9141, 'intg_srm_erp_batch_status', '失败', 'FAILED', 5, 1, NULL),
(9142, 'intg_srm_erp_receipt_status', '待回执', 'PENDING', 1, 1, NULL),
(9143, 'intg_srm_erp_receipt_status', '已接收', 'ACCEPTED', 2, 1, NULL),
(9144, 'intg_srm_erp_receipt_status', '已拒绝', 'REJECTED', 3, 1, NULL),
(9145, 'intg_srm_erp_receipt_status', '警告', 'WARN', 4, 1, NULL),
(9146, 'intg_srm_erp_error_type', '校验失败', 'VALIDATION', 1, 1, NULL),
(9147, 'intg_srm_erp_error_type', '超时', 'TIMEOUT', 2, 1, NULL),
(9148, 'intg_srm_erp_error_type', '数据冲突', 'CONFLICT', 3, 1, NULL),
(9149, 'intg_srm_erp_error_type', '网络异常', 'NETWORK', 4, 1, NULL),
(9150, 'intg_srm_erp_error_type', '其他', 'OTHER', 5, 1, NULL),
(9151, 'intg_srm_erp_compensation_status', '待处理', 'PENDING', 1, 1, NULL),
(9152, 'intg_srm_erp_compensation_status', '处理中', 'PROCESSING', 2, 1, NULL),
(9153, 'intg_srm_erp_compensation_status', '已解决', 'RESOLVED', 3, 1, NULL),
(9154, 'intg_srm_erp_compensation_status', '已忽略', 'IGNORED', 4, 1, NULL),
(9155, 'intg_srm_erp_reconcile_status', '待对账', 'PENDING', 1, 1, NULL),
(9156, 'intg_srm_erp_reconcile_status', '已平账', 'BALANCED', 2, 1, NULL),
(9157, 'intg_srm_erp_reconcile_status', '存在差异', 'DIFF', 3, 1, NULL),
(9158, 'intg_srm_erp_reconcile_status', '已关闭', 'CLOSED', 4, 1, NULL);

-- ========== SRM→ERP 集成可配置项（6808-6820） ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(6808, 'INTG', 'intg.srm-erp.enabled', 'SRM→ERP 集成启用开关', 'true', 0, 1, 'SRM→ERP 集成总开关，默认启用'),
(6809, 'INTG', 'intg.srm-erp.batch.size', '同步批次单批条数', '200', 1, 1, '单批同步条数，待业务方确认并发规模后调整'),
(6810, 'INTG', 'intg.srm-erp.retry.times', '失败重试次数', '3', 1, 1, '接口失败自动重试次数，待业务方确认'),
(6811, 'INTG', 'intg.srm-erp.timeout.ms', '接口超时时间（毫秒）', '30000', 1, 1, '接口调用超时时间，待业务方确认'),
(6812, 'INTG', 'intg.srm-erp.idempotent.window.hours', '幂等窗口（小时）', '24', 1, 1, '幂等判重时间窗口，待业务方确认'),
(6813, 'INTG', 'intg.srm-erp.receipt.auto', 'ERP 回执自动生成', 'true', 0, 1, 'ERP 校验通过后自动生成回执'),
(6814, 'INTG', 'intg.srm-erp.reconcile.cron', '对账任务计划表达式', '0 0 2 * * ?', 1, 1, '每日对账任务 Cron，待业务方确认对账频率'),
(6815, 'INTG', 'intg.srm-erp.interface.no.prefix', '集成接口编号前缀', 'SEI', 0, 1, '集成接口编号自动生成前缀'),
(6816, 'INTG', 'intg.srm-erp.mapping.no.prefix', '字段映射编号前缀', 'SEM', 0, 1, '字段映射编号自动生成前缀'),
(6817, 'INTG', 'intg.srm-erp.batch.no.prefix', '同步批次编号前缀', 'SEB', 0, 1, '同步批次编号自动生成前缀'),
(6818, 'INTG', 'intg.srm-erp.receipt.no.prefix', '接收回执编号前缀', 'SER', 0, 1, '接收回执编号自动生成前缀'),
(6819, 'INTG', 'intg.srm-erp.compensation.no.prefix', '异常补偿编号前缀', 'SEC', 0, 1, '异常补偿编号自动生成前缀'),
(6820, 'INTG', 'intg.srm-erp.reconcile.no.prefix', '对账编号前缀', 'SEO', 0, 1, '对账编号自动生成前缀');
