-- G9-N5 数据迁移—PLM文档迁移（WBS T080）初始化：菜单/按钮权限、角色授权、字典与可配置项。
-- 号段基线（V163 之后实测）：sys_permission=5305（本脚本从 5306 起）、
-- sys_role_permission=17059（从 17060 起）、sys_dictionary=9695（从 9696 起）、sys_config=6989（从 6990 起）。
-- 菜单说明：G9「数据迁移」顶级菜单域（5229，V163 建立）复用，本节点新增二级方向分组
--          PLM文档迁移（5306），覆盖集成接口、字段映射、同步批次、接收回执、异常补偿、对账。

-- ========== PLM文档迁移方向分组（5306，挂在 5229 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(5306, 'mig:plm-document', 'PLM文档迁移', 'menu', 5229, '/mig/plm-document', 'SwapOutlined', 5, 1);

-- ========== PLM文档迁移业务菜单（5307-5312，挂在 5306 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(5307, 'mig:plm-document:interface', '集成接口', 'menu', 5306, '/mig/plm-document/interfaces', 'ApiOutlined', 1, 1),
(5308, 'mig:plm-document:mapping', '字段映射', 'menu', 5306, '/mig/plm-document/mappings', 'PartitionOutlined', 2, 1),
(5309, 'mig:plm-document:batch', '同步批次', 'menu', 5306, '/mig/plm-document/batches', 'SyncOutlined', 3, 1),
(5310, 'mig:plm-document:receipt', '接收回执', 'menu', 5306, '/mig/plm-document/receipts', 'AuditOutlined', 4, 1),
(5311, 'mig:plm-document:compensation', '异常补偿', 'menu', 5306, '/mig/plm-document/compensations', 'ToolOutlined', 5, 1),
(5312, 'mig:plm-document:reconcile', '对账', 'menu', 5306, '/mig/plm-document/reconciles', 'BalanceOutlined', 6, 1);

-- ========== PLM文档迁移按钮（5313-5324） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(5313, 'mig:plm-document:interface:list', '查询集成接口', 'button', 5307, NULL, NULL, 1, 1),
(5314, 'mig:plm-document:interface:manage', '维护集成接口', 'button', 5307, NULL, NULL, 2, 1),
(5315, 'mig:plm-document:mapping:list', '查询字段映射', 'button', 5308, NULL, NULL, 1, 1),
(5316, 'mig:plm-document:mapping:manage', '维护字段映射', 'button', 5308, NULL, NULL, 2, 1),
(5317, 'mig:plm-document:batch:list', '查询同步批次', 'button', 5309, NULL, NULL, 1, 1),
(5318, 'mig:plm-document:batch:manage', '维护同步批次', 'button', 5309, NULL, NULL, 2, 1),
(5319, 'mig:plm-document:receipt:list', '查询接收回执', 'button', 5310, NULL, NULL, 1, 1),
(5320, 'mig:plm-document:receipt:manage', '维护接收回执', 'button', 5310, NULL, NULL, 2, 1),
(5321, 'mig:plm-document:compensation:list', '查询异常补偿', 'button', 5311, NULL, NULL, 1, 1),
(5322, 'mig:plm-document:compensation:manage', '维护异常补偿', 'button', 5311, NULL, NULL, 2, 1),
(5323, 'mig:plm-document:reconcile:list', '查询对账', 'button', 5312, NULL, NULL, 1, 1),
(5324, 'mig:plm-document:reconcile:manage', '维护对账', 'button', 5312, NULL, NULL, 2, 1);

-- ========== 角色授权（17060-17149） ==========

-- 系统管理员（2001）：授予全部权限（19 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(17060, 2001, 5306), (17061, 2001, 5307), (17062, 2001, 5308), (17063, 2001, 5309),
(17064, 2001, 5310), (17065, 2001, 5311), (17066, 2001, 5312), (17067, 2001, 5313),
(17068, 2001, 5314), (17069, 2001, 5315), (17070, 2001, 5316), (17071, 2001, 5317),
(17072, 2001, 5318), (17073, 2001, 5319), (17074, 2001, 5320), (17075, 2001, 5321),
(17076, 2001, 5322), (17077, 2001, 5323), (17078, 2001, 5324);

-- 研发工程师（2002）：授予全部权限（PLM文档迁移主责角色，共 19 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(17079, 2002, 5306), (17080, 2002, 5307), (17081, 2002, 5308), (17082, 2002, 5309),
(17083, 2002, 5310), (17084, 2002, 5311), (17085, 2002, 5312), (17086, 2002, 5313),
(17087, 2002, 5314), (17088, 2002, 5315), (17089, 2002, 5316), (17090, 2002, 5317),
(17091, 2002, 5318), (17092, 2002, 5319), (17093, 2002, 5320), (17094, 2002, 5321),
(17095, 2002, 5322), (17096, 2002, 5323), (17097, 2002, 5324);

-- 质量工程师（2003）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(17098, 2003, 5306), (17099, 2003, 5307), (17100, 2003, 5308), (17101, 2003, 5309),
(17102, 2003, 5310), (17103, 2003, 5311), (17104, 2003, 5312), (17105, 2003, 5313),
(17106, 2003, 5315), (17107, 2003, 5317), (17108, 2003, 5319), (17109, 2003, 5321),
(17110, 2003, 5323);

-- 供应链专员（2004）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(17111, 2004, 5306), (17112, 2004, 5307), (17113, 2004, 5308), (17114, 2004, 5309),
(17115, 2004, 5310), (17116, 2004, 5311), (17117, 2004, 5312), (17118, 2004, 5313),
(17119, 2004, 5315), (17120, 2004, 5317), (17121, 2004, 5319), (17122, 2004, 5321),
(17123, 2004, 5323);

-- 生产现场（2005）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(17124, 2005, 5306), (17125, 2005, 5307), (17126, 2005, 5308), (17127, 2005, 5309),
(17128, 2005, 5310), (17129, 2005, 5311), (17130, 2005, 5312), (17131, 2005, 5313),
(17132, 2005, 5315), (17133, 2005, 5317), (17134, 2005, 5319), (17135, 2005, 5321),
(17136, 2005, 5323);

-- 只读用户（2006）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(17137, 2006, 5306), (17138, 2006, 5307), (17139, 2006, 5308), (17140, 2006, 5309),
(17141, 2006, 5310), (17142, 2006, 5311), (17143, 2006, 5312), (17144, 2006, 5313),
(17145, 2006, 5315), (17146, 2006, 5317), (17147, 2006, 5319), (17148, 2006, 5321),
(17149, 2006, 5323);


-- ========== PLM文档迁移集成字典（9696-9736） ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(9696, 'mig_plm_document_object_type', '图纸', 'DRAWING', 1, 1, NULL),
(9697, 'mig_plm_document_object_type', '技术规范', 'SPEC', 2, 1, NULL),
(9698, 'mig_plm_document_object_type', '文档版本', 'DOC_VERSION', 3, 1, NULL),
(9699, 'mig_plm_document_object_type', '审批记录', 'DOC_APPROVAL', 4, 1, NULL),
(9700, 'mig_plm_document_object_type', '关联产品', 'DOC_RELATION', 5, 1, NULL),
(9701, 'mig_plm_document_protocol', 'API 接口', 'API', 1, 1, NULL),
(9702, 'mig_plm_document_protocol', '事件消息', 'EVENT', 2, 1, NULL),
(9703, 'mig_plm_document_protocol', '批量文件', 'FILE', 3, 1, NULL),
(9704, 'mig_plm_document_trigger_type', '手工触发', 'MANUAL', 1, 1, NULL),
(9705, 'mig_plm_document_trigger_type', '定时触发', 'SCHEDULED', 2, 1, NULL),
(9706, 'mig_plm_document_trigger_type', '事件触发', 'EVENT', 3, 1, NULL),
(9707, 'mig_plm_document_sync_mode', '全量', 'FULL', 1, 1, NULL),
(9708, 'mig_plm_document_sync_mode', '增量', 'INCREMENTAL', 2, 1, NULL),
(9709, 'mig_plm_document_interface_status', '草稿', 'DRAFT', 1, 1, NULL),
(9710, 'mig_plm_document_interface_status', '启用', 'ACTIVE', 2, 1, NULL),
(9711, 'mig_plm_document_interface_status', '停用', 'DISABLED', 3, 1, NULL),
(9712, 'mig_plm_document_mapping_status', '草稿', 'DRAFT', 1, 1, NULL),
(9713, 'mig_plm_document_mapping_status', '启用', 'ACTIVE', 2, 1, NULL),
(9714, 'mig_plm_document_mapping_status', '停用', 'DISABLED', 3, 1, NULL),
(9715, 'mig_plm_document_batch_status', '待执行', 'PENDING', 1, 1, NULL),
(9716, 'mig_plm_document_batch_status', '执行中', 'RUNNING', 2, 1, NULL),
(9717, 'mig_plm_document_batch_status', '成功', 'SUCCESS', 3, 1, NULL),
(9718, 'mig_plm_document_batch_status', '部分成功', 'PARTIAL', 4, 1, NULL),
(9719, 'mig_plm_document_batch_status', '失败', 'FAILED', 5, 1, NULL),
(9720, 'mig_plm_document_receipt_status', '待回执', 'PENDING', 1, 1, NULL),
(9721, 'mig_plm_document_receipt_status', '已接收', 'ACCEPTED', 2, 1, NULL),
(9722, 'mig_plm_document_receipt_status', '已拒绝', 'REJECTED', 3, 1, NULL),
(9723, 'mig_plm_document_receipt_status', '警告', 'WARN', 4, 1, NULL),
(9724, 'mig_plm_document_error_type', '校验失败', 'VALIDATION', 1, 1, NULL),
(9725, 'mig_plm_document_error_type', '超时', 'TIMEOUT', 2, 1, NULL),
(9726, 'mig_plm_document_error_type', '数据冲突', 'CONFLICT', 3, 1, NULL),
(9727, 'mig_plm_document_error_type', '网络异常', 'NETWORK', 4, 1, NULL),
(9728, 'mig_plm_document_error_type', '其他', 'OTHER', 5, 1, NULL),
(9729, 'mig_plm_document_compensation_status', '待处理', 'PENDING', 1, 1, NULL),
(9730, 'mig_plm_document_compensation_status', '处理中', 'PROCESSING', 2, 1, NULL),
(9731, 'mig_plm_document_compensation_status', '已解决', 'RESOLVED', 3, 1, NULL),
(9732, 'mig_plm_document_compensation_status', '已忽略', 'IGNORED', 4, 1, NULL),
(9733, 'mig_plm_document_reconcile_status', '待对账', 'PENDING', 1, 1, NULL),
(9734, 'mig_plm_document_reconcile_status', '已平账', 'BALANCED', 2, 1, NULL),
(9735, 'mig_plm_document_reconcile_status', '存在差异', 'DIFF', 3, 1, NULL),
(9736, 'mig_plm_document_reconcile_status', '已关闭', 'CLOSED', 4, 1, NULL);

-- ========== PLM文档迁移集成可配置项（6990-7002） ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(6990, 'MIG', 'mig.plm-document.enabled', 'PLM文档迁移启用开关', 'true', 0, 1, 'PLM文档迁移总开关，默认启用'),
(6991, 'MIG', 'mig.plm-document.batch.size', '迁移批次单批条数', '200', 1, 1, '单批迁移条数，待业务方确认数据规模后调整'),
(6992, 'MIG', 'mig.plm-document.retry.times', '失败重试次数', '3', 1, 1, 'PLM文档迁移重试次数，待业务方确认'),
(6993, 'MIG', 'mig.plm-document.timeout.ms', '接口超时时间（毫秒）', '30000', 1, 1, '接口调用超时时间，待业务方确认'),
(6994, 'MIG', 'mig.plm-document.idempotent.window.hours', '幂等窗口（小时）', '24', 1, 1, '幂等判重时间窗口，待业务方确认'),
(6995, 'MIG', 'mig.plm-document.receipt.auto', '系统回执自动生成', 'true', 0, 1, '系统校验通过后自动生成回执'),
(6996, 'MIG', 'mig.plm-document.reconcile.cron', '对账任务计划表达式', '0 0 2 * * ?', 1, 1, '每日对账任务 Cron，待业务方确认对账频率'),
(6997, 'MIG', 'mig.plm-document.interface.no.prefix', '集成接口编号前缀', 'PDI', 0, 1, '集成接口编号自动生成前缀'),
(6998, 'MIG', 'mig.plm-document.mapping.no.prefix', '字段映射编号前缀', 'PDM', 0, 1, '字段映射编号自动生成前缀'),
(6999, 'MIG', 'mig.plm-document.batch.no.prefix', '同步批次编号前缀', 'PDB', 0, 1, '同步批次编号自动生成前缀'),
(7000, 'MIG', 'mig.plm-document.receipt.no.prefix', '接收回执编号前缀', 'PDR', 0, 1, '接收回执编号自动生成前缀'),
(7001, 'MIG', 'mig.plm-document.compensation.no.prefix', '异常补偿编号前缀', 'PDC', 0, 1, '异常补偿编号自动生成前缀'),
(7002, 'MIG', 'mig.plm-document.reconcile.no.prefix', '对账编号前缀', 'PDO', 0, 1, '对账编号自动生成前缀');
