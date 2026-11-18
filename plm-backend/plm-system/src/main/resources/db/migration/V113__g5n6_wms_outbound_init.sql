-- G5-N6 WMS—成品与发运（WBS T050）初始化：菜单/按钮权限、角色授权、字典与可配置项。
-- 号段基线（V111 之后已占用的最大值）：sys_permission=4769（本脚本从 4780 起）、
-- sys_role_permission=14607（从 14620 起）、sys_dictionary=8617（从 8640 起）、sys_config=6551（从 6570 起）。
-- 菜单说明：复用 V103 已建的 WMS 顶级菜单域（4690）；
--           成品与发运（4780）为其下二级分组，覆盖完工入库、包装、标签、波次拣货、出库复核、装车。

-- ========== 成品与发运分组菜单（4780，挂在 4690 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4780, 'wms:outbound', '成品与发运', 'menu', 4690, '/wms/outbound', 'CarOutlined', 6, 1);

-- ========== 成品与发运业务菜单（4781-4783，挂在 4780 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4781, 'wms:outbound:finished', '成品入库', 'menu', 4780, '/wms/outbound/finished-goods', 'ImportOutlined', 1, 1),
(4782, 'wms:outbound:wave', '出库波次', 'menu', 4780, '/wms/outbound/waves', 'DeploymentUnitOutlined', 2, 1),
(4783, 'wms:outbound:shipment', '发运单', 'menu', 4780, '/wms/outbound/shipments', 'SendOutlined', 3, 1);

-- ========== 成品与发运按钮（4784-4789） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4784, 'wms:outbound:finished:list', '查询成品入库', 'button', 4781, NULL, NULL, 1, 1),
(4785, 'wms:outbound:finished:manage', '维护成品入库', 'button', 4781, NULL, NULL, 2, 1),
(4786, 'wms:outbound:wave:list', '查询出库波次', 'button', 4782, NULL, NULL, 1, 1),
(4787, 'wms:outbound:wave:manage', '维护出库波次', 'button', 4782, NULL, NULL, 2, 1),
(4788, 'wms:outbound:shipment:list', '查询发运单', 'button', 4783, NULL, NULL, 1, 1),
(4789, 'wms:outbound:shipment:manage', '维护发运单', 'button', 4783, NULL, NULL, 2, 1);

-- ========== 角色授权 ==========

-- 管理员（2001）：授予全部权限（1 分组 + 3 菜单 + 6 按钮，共 10 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14620, 2001, 4780), (14621, 2001, 4781), (14622, 2001, 4782), (14623, 2001, 4783),
(14624, 2001, 4784), (14625, 2001, 4785), (14626, 2001, 4786), (14627, 2001, 4787),
(14628, 2001, 4788), (14629, 2001, 4789);

-- 供应链专员（2004）：授予全部权限（成品与发运为供应链主责，共 10 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14630, 2004, 4780), (14631, 2004, 4781), (14632, 2004, 4782), (14633, 2004, 4783),
(14634, 2004, 4784), (14635, 2004, 4785), (14636, 2004, 4786), (14637, 2004, 4787),
(14638, 2004, 4788), (14639, 2004, 4789);

-- 研发工程师（2002）：授予分组/菜单 + 仅查询按钮（7 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14640, 2002, 4780), (14641, 2002, 4781), (14642, 2002, 4782), (14643, 2002, 4783),
(14644, 2002, 4784), (14645, 2002, 4786), (14646, 2002, 4788);

-- 质量工程师（2003）：授予分组/菜单 + 仅查询按钮（出库复核为质量关注，7 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14647, 2003, 4780), (14648, 2003, 4781), (14649, 2003, 4782), (14650, 2003, 4783),
(14651, 2003, 4784), (14652, 2003, 4786), (14653, 2003, 4788);

-- 生产现场（2005）：授予分组/菜单 + 仅查询按钮（完工入库为生产主责，7 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14654, 2005, 4780), (14655, 2005, 4781), (14656, 2005, 4782), (14657, 2005, 4783),
(14658, 2005, 4784), (14659, 2005, 4786), (14660, 2005, 4788);

-- 只读用户（2006）：授予分组/菜单 + 仅查询按钮（7 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14661, 2006, 4780), (14662, 2006, 4781), (14663, 2006, 4782), (14664, 2006, 4783),
(14665, 2006, 4784), (14666, 2006, 4786), (14667, 2006, 4788);

-- ========== 成品与发运字典（8640-8659） ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(8640, 'wms_fg_type', '成品入库', 'FINISHED', 1, 1, NULL),
(8641, 'wms_fg_type', '返工入库', 'REWORK', 2, 1, NULL),
(8642, 'wms_fg_status', '草稿', 'DRAFT', 1, 1, NULL),
(8643, 'wms_fg_status', '已包装', 'PACKED', 2, 1, NULL),
(8644, 'wms_fg_status', '已入库', 'INBOUND', 3, 1, NULL),
(8645, 'wms_fg_status', '已取消', 'CANCELLED', 4, 1, NULL),
(8646, 'wms_wave_type', '波次拣货', 'WAVE', 1, 1, NULL),
(8647, 'wms_wave_type', '手工拣货', 'MANUAL', 2, 1, NULL),
(8648, 'wms_wave_status', '草稿', 'DRAFT', 1, 1, NULL),
(8649, 'wms_wave_status', '拣货中', 'PICKING', 2, 1, NULL),
(8650, 'wms_wave_status', '已拣货', 'PICKED', 3, 1, NULL),
(8651, 'wms_wave_status', '已复核', 'CHECKED', 4, 1, NULL),
(8652, 'wms_shipment_type', '销售发运', 'SALES', 1, 1, NULL),
(8653, 'wms_shipment_type', '调拨发运', 'TRANSFER', 2, 1, NULL),
(8654, 'wms_shipment_type', '样品发运', 'SAMPLE', 3, 1, NULL),
(8655, 'wms_shipment_status', '草稿', 'DRAFT', 1, 1, NULL),
(8656, 'wms_shipment_status', '已装车', 'LOADED', 2, 1, NULL),
(8657, 'wms_shipment_status', '已发运', 'SHIPPED', 3, 1, NULL),
(8658, 'wms_shipment_status', '已签收', 'SIGNED', 4, 1, NULL),
(8659, 'wms_shipment_status', '已取消', 'CANCELLED', 5, 1, NULL);

-- ========== 成品与发运可配置项（6570-6581） ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(6570, 'WMS', 'wms.outbound.enabled', '成品与发运启用开关', 'true', 0, 1, 'WMS 成品与发运总开关，默认启用'),
(6571, 'WMS', 'wms.outbound.fg.no.prefix', '成品入库单号前缀', 'FG', 0, 1, '成品入库单号自动生成前缀'),
(6572, 'WMS', 'wms.outbound.fg.need.qc', '入库需质检开关', 'true', 1, 1, '待业务方确认：完工入库是否需先质检合格再入库'),
(6573, 'WMS', 'wms.outbound.fg.label.required', '包装标签必填开关', 'true', 1, 1, '待业务方确认：成品入库是否必填包装号与标签号'),
(6574, 'WMS', 'wms.outbound.wave.no.prefix', '波次单号前缀', 'WAV', 0, 1, '出库波次单号自动生成前缀'),
(6575, 'WMS', 'wms.outbound.wave.max.order', '波次最大订单数', '20', 1, 1, '待业务方确认：单个波次可合并的最大出库单数量'),
(6576, 'WMS', 'wms.outbound.check.required', '出库复核必填开关', 'true', 0, 1, '出库是否必须完成复核后才可发运'),
(6577, 'WMS', 'wms.outbound.shipment.no.prefix', '发运单号前缀', 'SHP', 0, 1, '发运单号自动生成前缀'),
(6578, 'WMS', 'wms.outbound.load.scan', '装车需扫描开关', 'true', 1, 1, '待业务方确认：装车是否强制逐件扫描'),
(6579, 'WMS', 'wms.outbound.shipment.weigh', '发运需称重开关', 'false', 1, 1, '待业务方确认：发运前是否需称重记录'),
(6580, 'WMS', 'wms.outbound.partial.enabled', '允许部分发运开关', 'true', 1, 1, '待业务方确认：是否允许对同一订单部分数量发运'),
(6581, 'WMS', 'wms.outbound.diff.tolerance.qty', '发运差异容忍数量', '0', 1, 1, '待业务方确认：允许的发运数量差异容忍度，超出后需差异处理');
