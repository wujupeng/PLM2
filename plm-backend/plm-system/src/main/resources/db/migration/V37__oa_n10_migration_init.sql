-- OA-N10 初始化数据：历史数据迁移与新旧并行验证的菜单、按钮权限、角色授权、字典与可配置项
-- 号段避让：菜单 3841-3846、按钮 3847-3858、角色授权 11539-11596、字典 6722-6759、配置 6031-6040。
-- 复用既有字典：oa_biz_flow_status、oa_data_source 等；本节点不新增流程表单（迁移为数据与验证型能力）。

-- ========== OA-N10 权限（菜单 3841-3846，按钮 3847-3858） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(3841, 'oa-migration-object', '迁移对象与映射', 'menu', 3600, '/oa/migration/object', 'DatabaseOutlined', 40, 1),
(3842, 'oa-migration-batch', '迁移批次与清洗', 'menu', 3600, '/oa/migration/batch', 'PartitionOutlined', 41, 1),
(3843, 'oa-migration-attachment', '附件迁移', 'menu', 3600, '/oa/migration/attachment', 'CloudUploadOutlined', 42, 1),
(3844, 'oa-migration-history', '历史流程档案', 'menu', 3600, '/oa/migration/history-flow', 'HistoryOutlined', 43, 1),
(3845, 'oa-migration-reconcile', '迁移对账', 'menu', 3600, '/oa/migration/reconcile', 'FileSearchOutlined', 44, 1),
(3846, 'oa-migration-dual', '双跑对照', 'menu', 3600, '/oa/migration/dual-run', 'DiffOutlined', 45, 1),
(3847, 'oa:migration:object:list', '查询迁移对象与字段映射', 'button', 3841, NULL, NULL, 1, 1),
(3848, 'oa:migration:object:manage', '维护迁移对象与字段映射', 'button', 3841, NULL, NULL, 2, 1),
(3849, 'oa:migration:batch:list', '查询迁移批次与清洗记录', 'button', 3842, NULL, NULL, 1, 1),
(3850, 'oa:migration:batch:manage', '维护迁移批次与清洗规则', 'button', 3842, NULL, NULL, 2, 1),
(3851, 'oa:migration:attachment:list', '查询附件迁移任务', 'button', 3843, NULL, NULL, 1, 1),
(3852, 'oa:migration:attachment:manage', '维护附件迁移任务', 'button', 3843, NULL, NULL, 2, 1),
(3853, 'oa:migration:history:list', '查询历史流程档案', 'button', 3844, NULL, NULL, 1, 1),
(3854, 'oa:migration:history:manage', '维护历史流程档案', 'button', 3844, NULL, NULL, 2, 1),
(3855, 'oa:migration:reconcile:list', '查询迁移对账', 'button', 3845, NULL, NULL, 1, 1),
(3856, 'oa:migration:reconcile:manage', '维护迁移对账', 'button', 3845, NULL, NULL, 2, 1),
(3857, 'oa:migration:dual:list', '查询双跑对照', 'button', 3846, NULL, NULL, 1, 1),
(3858, 'oa:migration:dual:manage', '维护双跑对照', 'button', 3846, NULL, NULL, 2, 1);

-- 管理员（2001）：授予 OA-N10 全部权限
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11539, 2001, 3841), (11540, 2001, 3842), (11541, 2001, 3843), (11542, 2001, 3844),
(11543, 2001, 3845), (11544, 2001, 3846), (11545, 2001, 3847), (11546, 2001, 3848),
(11547, 2001, 3849), (11548, 2001, 3850), (11549, 2001, 3851), (11550, 2001, 3852),
(11551, 2001, 3853), (11552, 2001, 3854), (11553, 2001, 3855), (11554, 2001, 3856),
(11555, 2001, 3857), (11556, 2001, 3858);

-- 研发工程师（2002）：迁移全流程只读
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11557, 2002, 3841), (11558, 2002, 3842), (11559, 2002, 3843), (11560, 2002, 3844),
(11561, 2002, 3845), (11562, 2002, 3846), (11563, 2002, 3847), (11564, 2002, 3849),
(11565, 2002, 3851), (11566, 2002, 3853), (11567, 2002, 3855), (11568, 2002, 3857);

-- 质量工程师（2003）：历史流程、对账与双跑只读
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11569, 2003, 3844), (11570, 2003, 3853), (11571, 2003, 3845),
(11572, 2003, 3855), (11573, 2003, 3846), (11574, 2003, 3857);

-- 供应链专员（2004）：对象、批次、历史流程与对账只读
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11575, 2004, 3841), (11576, 2004, 3847), (11577, 2004, 3842), (11578, 2004, 3849),
(11579, 2004, 3844), (11580, 2004, 3853), (11581, 2004, 3845), (11582, 2004, 3855);

-- 生产现场（2005）：历史流程只读
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11583, 2005, 3844), (11584, 2005, 3853);

-- 只读用户（2006）：全部菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11585, 2006, 3841), (11586, 2006, 3842), (11587, 2006, 3843), (11588, 2006, 3844),
(11589, 2006, 3845), (11590, 2006, 3846), (11591, 2006, 3847), (11592, 2006, 3849),
(11593, 2006, 3851), (11594, 2006, 3853), (11595, 2006, 3855), (11596, 2006, 3857);

-- ========== OA-N10 字典 ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(6722, 'oa_migration_object_status', '待盘点', 'PENDING', 1, 1, NULL),
(6723, 'oa_migration_object_status', '就绪', 'READY', 2, 1, NULL),
(6724, 'oa_migration_object_status', '迁移中', 'RUNNING', 3, 1, NULL),
(6725, 'oa_migration_object_status', '已迁移', 'DONE', 4, 1, NULL),
(6726, 'oa_migration_object_status', '已跳过', 'SKIPPED', 5, 1, '经批准不迁移的对象需登记例外清单'),
(6727, 'oa_migration_method', 'API 接口', 'API', 1, 1, NULL),
(6728, 'oa_migration_method', '数据库只读', 'DB', 2, 1, NULL),
(6729, 'oa_migration_method', '文件导出', 'FILE', 3, 1, NULL),
(6730, 'oa_migration_method', '离线导出包', 'EXPORT', 4, 1, NULL),
(6731, 'oa_migration_batch_type', '全量试迁', 'FULL', 1, 1, NULL),
(6732, 'oa_migration_batch_type', '增量试迁', 'INCREMENT', 2, 1, NULL),
(6733, 'oa_migration_batch_type', '抽取批次', 'EXTRACT', 3, 1, NULL),
(6734, 'oa_migration_batch_type', '附件迁移', 'ATTACHMENT', 4, 1, NULL),
(6735, 'oa_migration_batch_status', '待执行', 'PENDING', 1, 1, NULL),
(6736, 'oa_migration_batch_status', '执行中', 'RUNNING', 2, 1, NULL),
(6737, 'oa_migration_batch_status', '成功', 'SUCCESS', 3, 1, NULL),
(6738, 'oa_migration_batch_status', '失败', 'FAILED', 4, 1, NULL),
(6739, 'oa_migration_batch_status', '部分成功', 'PARTIAL', 5, 1, NULL),
(6740, 'oa_migration_clean_rule_type', '重复用户合并', 'DEDUP_USER', 1, 1, NULL),
(6741, 'oa_migration_clean_rule_type', '无效组织修正', 'INVALID_ORG', 2, 1, NULL),
(6742, 'oa_migration_clean_rule_type', '缺失附件标记', 'MISSING_ATTACH', 3, 1, NULL),
(6743, 'oa_migration_clean_rule_type', '异常日期修正', 'BAD_DATE', 4, 1, NULL),
(6744, 'oa_migration_clean_rule_type', '孤儿记录处理', 'ORPHAN', 5, 1, NULL),
(6745, 'oa_migration_clean_rule_type', '不合法状态纠正', 'ILLEGAL_STATUS', 6, 1, NULL),
(6746, 'oa_migration_clean_result', '已清洗', 'CLEANED', 1, 1, NULL),
(6747, 'oa_migration_clean_result', '已跳过', 'SKIPPED', 2, 1, NULL),
(6748, 'oa_migration_clean_result', '清洗失败', 'FAILED', 3, 1, NULL),
(6749, 'oa_transfer_status', '待迁移', 'PENDING', 1, 1, NULL),
(6750, 'oa_transfer_status', '迁移中', 'RUNNING', 2, 1, NULL),
(6751, 'oa_transfer_status', '迁移成功', 'SUCCESS', 3, 1, NULL),
(6752, 'oa_transfer_status', '迁移失败', 'FAILED', 4, 1, NULL),
(6753, 'oa_transfer_status', '重试中', 'RETRYING', 5, 1, NULL),
(6754, 'oa_reconcile_status', '待核对', 'PENDING', 1, 1, NULL),
(6755, 'oa_reconcile_status', '核对通过', 'CONFIRMED', 2, 1, NULL),
(6756, 'oa_reconcile_status', '存在例外', 'EXCEPTION', 3, 1, '关键对象差异需业务方批准例外清单'),
(6757, 'oa_dual_run_result', '待对照', 'PENDING', 1, 1, NULL),
(6758, 'oa_dual_run_result', '一致', 'MATCH', 2, 1, NULL),
(6759, 'oa_dual_run_result', '存在差异', 'DIFF', 3, 1, '差异需修正或经业务方批准');

-- ========== OA-N10 可配置项 ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(6031, 'OA', 'oa.migration.extract.snapshot.enabled', '抽取保留原始快照', 'true', 0, 1, NULL),
(6032, 'OA', 'oa.migration.batch.default.size', '迁移批次默认单批条数', '1000', 0, 1, NULL),
(6033, 'OA', 'oa.migration.attachment.chunk.size.mb', '附件分片大小(MB)', '10', 0, 1, NULL),
(6034, 'OA', 'oa.migration.attachment.max.retry', '附件迁移最大重试次数', '3', 0, 1, NULL),
(6035, 'OA', 'oa.migration.attachment.hash.algorithm', '附件哈希校验算法', 'SHA-256', 1, 1, '哈希算法与校验方式待业务方确认(IF-OA-08)'),
(6036, 'OA', 'oa.migration.clean.overwrite.source', '清洗直接覆盖原始数据', 'false', 1, 1, '默认不覆盖原始数据，仅记录原值与清洗值，策略待确认'),
(6037, 'OA', 'oa.migration.diff.tolerance', '迁移差异容差(条)', '0', 1, 1, '关键对象差异容差与例外清单待业务方确认'),
(6038, 'OA', 'oa.migration.history.flow.retention.years', '历史流程档案保留年限', '5', 1, 1, '历史流程与邮件保留年限待业务方确认'),
(6039, 'OA', 'oa.migration.dual.run.enabled', '新旧流程双跑对照启用', 'true', 1, 1, '双跑对照范围与开展周期待业务方确认(OA-DEV-104)'),
(6040, 'OA', 'oa.migration.increment.window.minutes', '增量同步窗口(分钟)', '30', 1, 1, '增量同步窗口与触发频率待业务方确认(OA-DEV-101)');
