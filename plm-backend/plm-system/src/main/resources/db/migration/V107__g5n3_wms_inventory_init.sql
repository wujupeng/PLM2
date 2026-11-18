-- G5-N3 WMS—库存控制（WBS T047）初始化：菜单/按钮权限、角色授权、字典与可配置项。
-- 号段基线（V105 之后已占用的最大值）：sys_permission=4719（本脚本从 4730 起）、
-- sys_role_permission=14427（从 14440 起）、sys_dictionary=8527（从 8540 起）、sys_config=6481（从 6490 起）。
-- 菜单说明：复用 V103 已建的 WMS 顶级菜单域（4690）；
--           库存控制（4730）为其下二级分组，覆盖批次/序列号、库位库存、冻结/解冻、效期、库存状态。

-- ========== 库存控制分组菜单（4730，挂在 4690 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4730, 'wms:inventory', '库存控制', 'menu', 4690, '/wms/inventory', 'DatabaseOutlined', 3, 1);

-- ========== 库存控制业务菜单（4731-4733，挂在 4730 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4731, 'wms:inventory:batch', '库存批次', 'menu', 4730, '/wms/inventory/batches', 'DatabaseOutlined', 1, 1),
(4732, 'wms:inventory:serial', '序列号', 'menu', 4730, '/wms/inventory/serials', 'NumberOutlined', 2, 1),
(4733, 'wms:inventory:freeze', '库存冻结', 'menu', 4730, '/wms/inventory/freezes', 'LockOutlined', 3, 1);

-- ========== 库存控制按钮（4734-4739） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4734, 'wms:inventory:batch:list', '查询库存批次', 'button', 4731, NULL, NULL, 1, 1),
(4735, 'wms:inventory:batch:manage', '维护库存批次', 'button', 4731, NULL, NULL, 2, 1),
(4736, 'wms:inventory:serial:list', '查询序列号', 'button', 4732, NULL, NULL, 1, 1),
(4737, 'wms:inventory:serial:manage', '维护序列号', 'button', 4732, NULL, NULL, 2, 1),
(4738, 'wms:inventory:freeze:list', '查询库存冻结', 'button', 4733, NULL, NULL, 1, 1),
(4739, 'wms:inventory:freeze:manage', '维护库存冻结', 'button', 4733, NULL, NULL, 2, 1);

-- ========== 角色授权 ==========

-- 管理员（2001）：授予全部权限（1 分组 + 3 菜单 + 6 按钮，共 10 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14440, 2001, 4730), (14441, 2001, 4731), (14442, 2001, 4732), (14443, 2001, 4733),
(14444, 2001, 4734), (14445, 2001, 4735), (14446, 2001, 4736), (14447, 2001, 4737),
(14448, 2001, 4738), (14449, 2001, 4739);

-- 供应链专员（2004）：授予全部权限（库存控制为供应链主责，共 10 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14450, 2004, 4730), (14451, 2004, 4731), (14452, 2004, 4732), (14453, 2004, 4733),
(14454, 2004, 4734), (14455, 2004, 4735), (14456, 2004, 4736), (14457, 2004, 4737),
(14458, 2004, 4738), (14459, 2004, 4739);

-- 研发工程师（2002）：授予分组/菜单 + 仅查询按钮（7 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14460, 2002, 4730), (14461, 2002, 4731), (14462, 2002, 4732), (14463, 2002, 4733),
(14464, 2002, 4734), (14465, 2002, 4736), (14466, 2002, 4738);

-- 质量工程师（2003）：授予分组/菜单 + 仅查询按钮（7 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14467, 2003, 4730), (14468, 2003, 4731), (14469, 2003, 4732), (14470, 2003, 4733),
(14471, 2003, 4734), (14472, 2003, 4736), (14473, 2003, 4738);

-- 生产现场（2005）：授予分组/菜单 + 仅查询按钮（7 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14474, 2005, 4730), (14475, 2005, 4731), (14476, 2005, 4732), (14477, 2005, 4733),
(14478, 2005, 4734), (14479, 2005, 4736), (14480, 2005, 4738);

-- 只读用户（2006）：授予分组/菜单 + 仅查询按钮（7 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14481, 2006, 4730), (14482, 2006, 4731), (14483, 2006, 4732), (14484, 2006, 4733),
(14485, 2006, 4734), (14486, 2006, 4736), (14487, 2006, 4738);

-- ========== 库存控制字典（8540-8557） ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(8540, 'wms_inventory_batch_status', '正常', 'NORMAL', 1, 1, NULL),
(8541, 'wms_inventory_batch_status', '冻结', 'FROZEN', 2, 1, NULL),
(8542, 'wms_inventory_batch_status', '暂扣', 'HOLD', 3, 1, NULL),
(8543, 'wms_inventory_batch_status', '过期', 'EXPIRED', 4, 1, NULL),
(8544, 'wms_inventory_batch_status', '报废', 'SCRAPPED', 5, 1, NULL),
(8545, 'wms_serial_status', '在库', 'IN_STOCK', 1, 1, NULL),
(8546, 'wms_serial_status', '已分配', 'ALLOCATED', 2, 1, NULL),
(8547, 'wms_serial_status', '已出库', 'OUT_STOCK', 3, 1, NULL),
(8548, 'wms_serial_status', '已退货', 'RETURNED', 4, 1, NULL),
(8549, 'wms_serial_status', '报废', 'SCRAPPED', 5, 1, NULL),
(8550, 'wms_freeze_type', '冻结', 'FREEZE', 1, 1, NULL),
(8551, 'wms_freeze_type', '解冻', 'UNFREEZE', 2, 1, NULL),
(8552, 'wms_freeze_status', '已冻结', 'FROZEN', 1, 1, NULL),
(8553, 'wms_freeze_status', '已解冻', 'RELEASED', 2, 1, NULL),
(8554, 'wms_freeze_status', '已取消', 'CANCELLED', 3, 1, NULL),
(8555, 'wms_batch_source', '采购入库', 'PURCHASE', 1, 1, NULL),
(8556, 'wms_batch_source', '生产入库', 'PRODUCTION', 2, 1, NULL),
(8557, 'wms_batch_source', '退货入库', 'RETURN', 3, 1, NULL);

-- ========== 库存控制可配置项（6490-6501） ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(6490, 'WMS', 'wms.inventory.enabled', '库存控制启用开关', 'true', 0, 1, 'WMS 库存控制总开关，默认启用'),
(6491, 'WMS', 'wms.inventory.batch.auto.create', '收货自动建批次开关', 'true', 0, 1, '收货放行后是否自动创建库存批次'),
(6492, 'WMS', 'wms.inventory.serial.enabled', '序列号管理启用开关', 'false', 1, 1, '待业务方确认：是否启用序列号全程管理'),
(6493, 'WMS', 'wms.inventory.serial.auto.generate', '序列号自动生成开关', 'false', 1, 1, '待业务方确认：入库时是否自动生成序列号'),
(6494, 'WMS', 'wms.inventory.expiry.warn.days', '效期预警天数', '30', 1, 1, '待业务方确认：距到期日多少天开始预警'),
(6495, 'WMS', 'wms.inventory.expiry.control.enabled', '效期控制启用开关', 'true', 1, 1, '待业务方确认：是否启用效期批次先进先出与到期禁发控制'),
(6496, 'WMS', 'wms.inventory.freeze.require.reason', '冻结必填原因开关', 'true', 0, 1, '库存冻结是否必须填写冻结原因'),
(6497, 'WMS', 'wms.inventory.freeze.require.approval', '冻结需审批开关', 'false', 1, 1, '待业务方确认：库存冻结是否需走审批流程'),
(6498, 'WMS', 'wms.inventory.negative.allowed', '允许负库存开关', 'false', 0, 1, '是否允许库存出现负数（默认不允许）'),
(6499, 'WMS', 'wms.inventory.default.stock.status', '默认库存状态', 'NORMAL', 1, 1, '待业务方确认：新建库存批次默认状态'),
(6500, 'WMS', 'wms.inventory.serial.no.prefix', '序列号前缀', 'SNR', 0, 1, '序列号自动生成前缀'),
(6501, 'WMS', 'wms.inventory.freeze.no.prefix', '冻结单号前缀', 'FRZ', 0, 1, '库存冻结单号自动生成前缀');
