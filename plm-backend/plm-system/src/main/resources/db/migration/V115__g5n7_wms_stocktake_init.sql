-- G5-N7 WMS—盘点与调拨（WBS T051）初始化：菜单/按钮权限、角色授权、字典与可配置项。
-- 号段基线（V113 之后已占用的最大值）：sys_permission=4789（本脚本从 4800 起）、
-- sys_role_permission=14667（从 14680 起）、sys_dictionary=8659（从 8680 起）、sys_config=6581（从 6600 起）。
-- 菜单说明：复用 V103 已建的 WMS 顶级菜单域（4690）；
--           盘点与调拨（4800）为其下二级分组，覆盖循环盘点、全盘、差异审批、仓间调拨。

-- ========== 盘点与调拨分组菜单（4800，挂在 4690 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4800, 'wms:stocktake', '盘点与调拨', 'menu', 4690, '/wms/stocktake', 'AuditOutlined', 7, 1);

-- ========== 盘点与调拨业务菜单（4801-4803，挂在 4800 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4801, 'wms:stocktake:order', '盘点单', 'menu', 4800, '/wms/stocktake/orders', 'AuditOutlined', 1, 1),
(4802, 'wms:stocktake:diff', '盘点差异', 'menu', 4800, '/wms/stocktake/diffs', 'DiffOutlined', 2, 1),
(4803, 'wms:stocktake:transfer', '调拨单', 'menu', 4800, '/wms/stocktake/transfers', 'SwapOutlined', 3, 1);

-- ========== 盘点与调拨按钮（4804-4809） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4804, 'wms:stocktake:order:list', '查询盘点单', 'button', 4801, NULL, NULL, 1, 1),
(4805, 'wms:stocktake:order:manage', '维护盘点单', 'button', 4801, NULL, NULL, 2, 1),
(4806, 'wms:stocktake:diff:list', '查询盘点差异', 'button', 4802, NULL, NULL, 1, 1),
(4807, 'wms:stocktake:diff:manage', '维护盘点差异', 'button', 4802, NULL, NULL, 2, 1),
(4808, 'wms:stocktake:transfer:list', '查询调拨单', 'button', 4803, NULL, NULL, 1, 1),
(4809, 'wms:stocktake:transfer:manage', '维护调拨单', 'button', 4803, NULL, NULL, 2, 1);

-- ========== 角色授权 ==========

-- 管理员（2001）：授予全部权限（1 分组 + 3 菜单 + 6 按钮，共 10 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14680, 2001, 4800), (14681, 2001, 4801), (14682, 2001, 4802), (14683, 2001, 4803),
(14684, 2001, 4804), (14685, 2001, 4805), (14686, 2001, 4806), (14687, 2001, 4807),
(14688, 2001, 4808), (14689, 2001, 4809);

-- 供应链专员（2004）：授予全部权限（盘点与调拨为供应链主责，共 10 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14690, 2004, 4800), (14691, 2004, 4801), (14692, 2004, 4802), (14693, 2004, 4803),
(14694, 2004, 4804), (14695, 2004, 4805), (14696, 2004, 4806), (14697, 2004, 4807),
(14698, 2004, 4808), (14699, 2004, 4809);

-- 研发工程师（2002）：授予分组/菜单 + 仅查询按钮（7 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14700, 2002, 4800), (14701, 2002, 4801), (14702, 2002, 4802), (14703, 2002, 4803),
(14704, 2002, 4804), (14705, 2002, 4806), (14706, 2002, 4808);

-- 质量工程师（2003）：授予分组/菜单 + 仅查询按钮（差异审批为质量关注，7 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14707, 2003, 4800), (14708, 2003, 4801), (14709, 2003, 4802), (14710, 2003, 4803),
(14711, 2003, 4804), (14712, 2003, 4806), (14713, 2003, 4808);

-- 生产现场（2005）：授予分组/菜单 + 仅查询按钮（7 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14714, 2005, 4800), (14715, 2005, 4801), (14716, 2005, 4802), (14717, 2005, 4803),
(14718, 2005, 4804), (14719, 2005, 4806), (14720, 2005, 4808);

-- 只读用户（2006）：授予分组/菜单 + 仅查询按钮（7 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14721, 2006, 4800), (14722, 2006, 4801), (14723, 2006, 4802), (14724, 2006, 4803),
(14725, 2006, 4804), (14726, 2006, 4806), (14727, 2006, 4808);

-- ========== 盘点与调拨字典（8680-8699） ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(8680, 'wms_stocktake_type', '循环盘点', 'CYCLE', 1, 1, NULL),
(8681, 'wms_stocktake_type', '全盘', 'FULL', 2, 1, NULL),
(8682, 'wms_stocktake_status', '草稿', 'DRAFT', 1, 1, NULL),
(8683, 'wms_stocktake_status', '盘点中', 'COUNTING', 2, 1, NULL),
(8684, 'wms_stocktake_status', '已盘点', 'COUNTED', 3, 1, NULL),
(8685, 'wms_stocktake_status', '已审批', 'APPROVED', 4, 1, NULL),
(8686, 'wms_stocktake_status', '已取消', 'CANCELLED', 5, 1, NULL),
(8687, 'wms_stocktake_diff_type', '盘盈', 'PROFIT', 1, 1, NULL),
(8688, 'wms_stocktake_diff_type', '盘亏', 'LOSS', 2, 1, NULL),
(8689, 'wms_stocktake_diff_status', '待审批', 'PENDING', 1, 1, NULL),
(8690, 'wms_stocktake_diff_status', '已审批', 'APPROVED', 2, 1, NULL),
(8691, 'wms_stocktake_diff_status', '已驳回', 'REJECTED', 3, 1, NULL),
(8692, 'wms_stocktake_diff_status', '已关闭', 'CLOSED', 4, 1, NULL),
(8693, 'wms_transfer_type', '仓间调拨', 'WAREHOUSE', 1, 1, NULL),
(8694, 'wms_transfer_type', '库位调拨', 'BIN', 2, 1, NULL),
(8695, 'wms_transfer_status', '草稿', 'DRAFT', 1, 1, NULL),
(8696, 'wms_transfer_status', '调拨中', 'TRANSFERRING', 2, 1, NULL),
(8697, 'wms_transfer_status', '已调拨', 'TRANSFERRED', 3, 1, NULL),
(8698, 'wms_transfer_status', '已收货', 'RECEIVED', 4, 1, NULL),
(8699, 'wms_transfer_status', '已取消', 'CANCELLED', 5, 1, NULL);

-- ========== 盘点与调拨可配置项（6600-6611） ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(6600, 'WMS', 'wms.stocktake.enabled', '盘点与调拨启用开关', 'true', 0, 1, 'WMS 盘点与调拨总开关，默认启用'),
(6601, 'WMS', 'wms.stocktake.no.prefix', '盘点单号前缀', 'STK', 0, 1, '盘点单号自动生成前缀'),
(6602, 'WMS', 'wms.stocktake.cycle.days', '循环盘点周期(天)', '30', 1, 1, '待业务方确认：默认循环盘点周期天数'),
(6603, 'WMS', 'wms.stocktake.blind', '盲盘开关', 'true', 1, 1, '待业务方确认：盘点时是否隐藏账面数量（盲盘）'),
(6604, 'WMS', 'wms.stocktake.diff.auto', '差异自动生成开关', 'true', 1, 1, '待业务方确认：盘点差异是否自动生成差异单'),
(6605, 'WMS', 'wms.stocktake.diff.no.prefix', '差异单号前缀', 'STD', 0, 1, '盘点差异单号自动生成前缀'),
(6606, 'WMS', 'wms.stocktake.diff.tolerance.qty', '差异容忍数量', '0', 1, 1, '待业务方确认：允许的盘点差异容忍度，超出后需差异处理'),
(6607, 'WMS', 'wms.stocktake.diff.need.approve', '差异需审批开关', 'true', 0, 1, '盘点差异是否需审批后才回写实物库存'),
(6608, 'WMS', 'wms.transfer.no.prefix', '调拨单号前缀', 'TRF', 0, 1, '调拨单号自动生成前缀'),
(6609, 'WMS', 'wms.transfer.need.approve', '调拨需审批开关', 'false', 1, 1, '待业务方确认：仓间调拨是否需走审批流程'),
(6610, 'WMS', 'wms.transfer.auto.receive', '调拨自动收货开关', 'false', 1, 1, '待业务方确认：目标仓是否自动确认收货'),
(6611, 'WMS', 'wms.transfer.tolerance.qty', '调拨差异容忍数量', '0', 1, 1, '待业务方确认：调拨数量差异容忍度，超出后需差异处理');
