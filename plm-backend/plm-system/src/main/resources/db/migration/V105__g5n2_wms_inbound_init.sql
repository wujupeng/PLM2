-- G5-N2 WMS—收货上架（WBS T046）初始化：菜单/按钮权限、角色授权、字典与可配置项。
-- 号段基线（V103 之后已占用的最大值）：sys_permission=4709（本脚本从 4710 起）、
-- sys_role_permission=14375（从 14380 起）、sys_dictionary=8496（从 8510 起）、sys_config=6461（从 6470 起）。
-- 菜单说明：复用 V103 已建的 WMS 顶级菜单域（4690）；
--           收货上架（4710）为其下二级分组，覆盖采购/委外 ASN、扫码收货、待检与质检放行、上架任务。

-- ========== 收货上架分组菜单（4710，挂在 4690 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4710, 'wms:inbound', '收货上架', 'menu', 4690, '/wms/inbound', 'ImportOutlined', 2, 1);

-- ========== 收货上架业务菜单（4711-4713，挂在 4710 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4711, 'wms:inbound:asn', '收货通知', 'menu', 4710, '/wms/inbound/asns', 'FileAddOutlined', 1, 1),
(4712, 'wms:inbound:receipt', '收货单', 'menu', 4710, '/wms/inbound/receipts', 'InboxOutlined', 2, 1),
(4713, 'wms:inbound:putaway', '上架任务', 'menu', 4710, '/wms/inbound/putaways', 'VerticalAlignTopOutlined', 3, 1);

-- ========== 收货上架按钮（4714-4719） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4714, 'wms:inbound:asn:list', '查询收货通知', 'button', 4711, NULL, NULL, 1, 1),
(4715, 'wms:inbound:asn:manage', '维护收货通知', 'button', 4711, NULL, NULL, 2, 1),
(4716, 'wms:inbound:receipt:list', '查询收货单', 'button', 4712, NULL, NULL, 1, 1),
(4717, 'wms:inbound:receipt:manage', '维护收货单', 'button', 4712, NULL, NULL, 2, 1),
(4718, 'wms:inbound:putaway:list', '查询上架任务', 'button', 4713, NULL, NULL, 1, 1),
(4719, 'wms:inbound:putaway:manage', '维护上架任务', 'button', 4713, NULL, NULL, 2, 1);

-- ========== 角色授权 ==========

-- 管理员（2001）：授予全部权限（1 分组 + 3 菜单 + 6 按钮，共 10 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14380, 2001, 4710), (14381, 2001, 4711), (14382, 2001, 4712), (14383, 2001, 4713),
(14384, 2001, 4714), (14385, 2001, 4715), (14386, 2001, 4716), (14387, 2001, 4717),
(14388, 2001, 4718), (14389, 2001, 4719);

-- 供应链专员（2004）：授予全部权限（收货上架为供应链主责，共 10 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14390, 2004, 4710), (14391, 2004, 4711), (14392, 2004, 4712), (14393, 2004, 4713),
(14394, 2004, 4714), (14395, 2004, 4715), (14396, 2004, 4716), (14397, 2004, 4717),
(14398, 2004, 4718), (14399, 2004, 4719);

-- 研发工程师（2002）：授予分组/菜单 + 仅查询按钮（7 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14400, 2002, 4710), (14401, 2002, 4711), (14402, 2002, 4712), (14403, 2002, 4713),
(14404, 2002, 4714), (14405, 2002, 4716), (14406, 2002, 4718);

-- 质量工程师（2003）：授予分组/菜单 + 仅查询按钮（质检放行为质量主责，7 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14407, 2003, 4710), (14408, 2003, 4711), (14409, 2003, 4712), (14410, 2003, 4713),
(14411, 2003, 4714), (14412, 2003, 4716), (14413, 2003, 4718);

-- 生产现场（2005）：授予分组/菜单 + 仅查询按钮（7 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14414, 2005, 4710), (14415, 2005, 4711), (14416, 2005, 4712), (14417, 2005, 4713),
(14418, 2005, 4714), (14419, 2005, 4716), (14420, 2005, 4718);

-- 只读用户（2006）：授予分组/菜单 + 仅查询按钮（7 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14421, 2006, 4710), (14422, 2006, 4711), (14423, 2006, 4712), (14424, 2006, 4713),
(14425, 2006, 4714), (14426, 2006, 4716), (14427, 2006, 4718);

-- ========== 收货上架字典（8510-8527） ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(8510, 'wms_asn_type', '采购 ASN', 'PURCHASE', 1, 1, NULL),
(8511, 'wms_asn_type', '委外 ASN', 'OUTSOURCE', 2, 1, NULL),
(8512, 'wms_asn_status', '草稿', 'DRAFT', 1, 1, NULL),
(8513, 'wms_asn_status', '已下达', 'RELEASED', 2, 1, NULL),
(8514, 'wms_asn_status', '收货中', 'RECEIVING', 3, 1, NULL),
(8515, 'wms_asn_status', '已收货', 'RECEIVED', 4, 1, NULL),
(8516, 'wms_asn_status', '已关闭', 'CLOSED', 5, 1, NULL),
(8517, 'wms_receive_type', '扫码收货', 'SCAN', 1, 1, NULL),
(8518, 'wms_receive_type', '手工收货', 'MANUAL', 2, 1, NULL),
(8519, 'wms_receive_status', '待检', 'PENDING', 1, 1, NULL),
(8520, 'wms_receive_status', '检验中', 'INSPECTING', 2, 1, NULL),
(8521, 'wms_receive_status', '合格放行', 'QUALIFIED', 3, 1, NULL),
(8522, 'wms_receive_status', '拒收', 'REJECTED', 4, 1, NULL),
(8523, 'wms_receive_status', '已上架', 'PUTAWAY_DONE', 5, 1, NULL),
(8524, 'wms_putaway_status', '待上架', 'PENDING', 1, 1, NULL),
(8525, 'wms_putaway_status', '上架中', 'IN_PROGRESS', 2, 1, NULL),
(8526, 'wms_putaway_status', '已完成', 'DONE', 3, 1, NULL),
(8527, 'wms_putaway_status', '已取消', 'CANCELLED', 4, 1, NULL);

-- ========== 收货上架可配置项（6470-6481） ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(6470, 'WMS', 'wms.inbound.enabled', '收货上架启用开关', 'true', 0, 1, 'WMS 收货上架总开关，默认启用'),
(6471, 'WMS', 'wms.inbound.asn.default.type', '收货通知默认类型', 'PURCHASE', 1, 1, '待业务方确认：新建 ASN 默认类型（PURCHASE/OUTSOURCE）'),
(6472, 'WMS', 'wms.inbound.receive.zone', '收货暂存库区', 'RECEIVING', 1, 1, '待业务方确认：扫码收货默认进入的库区类型'),
(6473, 'WMS', 'wms.inbound.quarantine.zone', '待检库区', 'QUARANTINE', 1, 1, '待业务方确认：待检物料默认存放库区类型'),
(6474, 'WMS', 'wms.inbound.putaway.strategy', '上架默认策略', 'FIFO', 1, 1, '待业务方确认：上架任务默认策略（FIFO/就近/定置）'),
(6475, 'WMS', 'wms.inbound.over.receive.ratio', '收货超收比例(%)', '0', 1, 1, '待业务方确认：允许超收比例（百分比，0 表示不允许超收）'),
(6476, 'WMS', 'wms.inbound.scan.enabled', '扫码收货启用开关', 'true', 0, 1, '是否启用扫码收货'),
(6477, 'WMS', 'wms.inbound.qc.release.required', '质检放行必需开关', 'true', 1, 1, '待业务方确认：上架前是否必须完成质检放行'),
(6478, 'WMS', 'wms.inbound.auto.putaway.task', '自动生成上架任务开关', 'true', 0, 1, '质检放行后是否自动生成上架任务'),
(6479, 'WMS', 'wms.inbound.asn.close.threshold', 'ASN 关闭阈值(%)', '100', 1, 1, '待业务方确认：收货数量达到 ASN 数量的百分比阈值时自动关闭 ASN'),
(6480, 'WMS', 'wms.inbound.putaway.default.priority', '上架任务默认优先级', '10', 1, 1, '待业务方确认：上架任务默认优先级'),
(6481, 'WMS', 'wms.inbound.receipt.no.prefix', '收货单号前缀', 'RCV', 0, 1, '收货单号自动生成前缀');
