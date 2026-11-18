-- G5-N1 WMS—仓库基础（WBS T045）初始化：菜单/按钮权限、角色授权、字典与可配置项。
-- 号段基线（V101 之后已占用的最大值）：sys_permission=4679（本脚本从 4690 起）、
-- sys_role_permission=14277（从 14280 起）、sys_dictionary=8449（从 8450 起）、sys_config=6441（从 6450 起）。
-- 菜单说明：WMS 仓储管理（4690）为新增顶级菜单域；仓库基础（4691）为其下二级分组；
--           组织/权限/审批复用既有平台底座；与既有旧版「物料供应与看板」（3080）相互独立，旧模块于 G11 退役。

-- ========== WMS 顶级菜单域（4690，parent_id=0） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4690, 'wms', 'WMS 仓储管理', 'menu', 0, '/wms', 'ClusterOutlined', 17, 1);

-- ========== WMS 仓库基础分组菜单（4691，挂在 4690 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4691, 'wms:base', '仓库基础', 'menu', 4690, '/wms/base', 'GoldOutlined', 1, 1);

-- ========== WMS 仓库基础业务菜单（4692-4697，挂在 4691 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4692, 'wms:base:warehouse', '仓库管理', 'menu', 4691, '/wms/base/warehouses', 'BankOutlined', 1, 1),
(4693, 'wms:base:zone', '库区管理', 'menu', 4691, '/wms/base/zones', 'PartitionOutlined', 2, 1),
(4694, 'wms:base:bin', '库位管理', 'menu', 4691, '/wms/base/bins', 'ClusterOutlined', 3, 1),
(4695, 'wms:base:rack', '货架管理', 'menu', 4691, '/wms/base/racks', 'BuildOutlined', 4, 1),
(4696, 'wms:base:container', '容器管理', 'menu', 4691, '/wms/base/containers', 'InboxOutlined', 5, 1),
(4697, 'wms:base:strategy', '作业策略', 'menu', 4691, '/wms/base/strategies', 'ControlOutlined', 6, 1);

-- ========== WMS 仓库基础按钮（4698-4709） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4698, 'wms:base:warehouse:list', '查询仓库', 'button', 4692, NULL, NULL, 1, 1),
(4699, 'wms:base:warehouse:manage', '维护仓库', 'button', 4692, NULL, NULL, 2, 1),
(4700, 'wms:base:zone:list', '查询库区', 'button', 4693, NULL, NULL, 1, 1),
(4701, 'wms:base:zone:manage', '维护库区', 'button', 4693, NULL, NULL, 2, 1),
(4702, 'wms:base:bin:list', '查询库位', 'button', 4694, NULL, NULL, 1, 1),
(4703, 'wms:base:bin:manage', '维护库位', 'button', 4694, NULL, NULL, 2, 1),
(4704, 'wms:base:rack:list', '查询货架', 'button', 4695, NULL, NULL, 1, 1),
(4705, 'wms:base:rack:manage', '维护货架', 'button', 4695, NULL, NULL, 2, 1),
(4706, 'wms:base:container:list', '查询容器', 'button', 4696, NULL, NULL, 1, 1),
(4707, 'wms:base:container:manage', '维护容器', 'button', 4696, NULL, NULL, 2, 1),
(4708, 'wms:base:strategy:list', '查询作业策略', 'button', 4697, NULL, NULL, 1, 1),
(4709, 'wms:base:strategy:manage', '维护作业策略', 'button', 4697, NULL, NULL, 2, 1);

-- ========== 角色授权 ==========

-- 管理员（2001）：授予全部权限（1 顶级 + 1 分组 + 6 菜单 + 12 按钮，共 20 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14280, 2001, 4690), (14281, 2001, 4691), (14282, 2001, 4692), (14283, 2001, 4693),
(14284, 2001, 4694), (14285, 2001, 4695), (14286, 2001, 4696), (14287, 2001, 4697),
(14288, 2001, 4698), (14289, 2001, 4699), (14290, 2001, 4700), (14291, 2001, 4701),
(14292, 2001, 4702), (14293, 2001, 4703), (14294, 2001, 4704), (14295, 2001, 4705),
(14296, 2001, 4706), (14297, 2001, 4707), (14298, 2001, 4708), (14299, 2001, 4709);

-- 供应链专员（2004）：授予全部权限（仓储作业为供应链主责，共 20 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14300, 2004, 4690), (14301, 2004, 4691), (14302, 2004, 4692), (14303, 2004, 4693),
(14304, 2004, 4694), (14305, 2004, 4695), (14306, 2004, 4696), (14307, 2004, 4697),
(14308, 2004, 4698), (14309, 2004, 4699), (14310, 2004, 4700), (14311, 2004, 4701),
(14312, 2004, 4702), (14313, 2004, 4703), (14314, 2004, 4704), (14315, 2004, 4705),
(14316, 2004, 4706), (14317, 2004, 4707), (14318, 2004, 4708), (14319, 2004, 4709);

-- 研发工程师（2002）：授予顶级/分组/菜单 + 仅查询按钮（14 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14320, 2002, 4690), (14321, 2002, 4691), (14322, 2002, 4692), (14323, 2002, 4693),
(14324, 2002, 4694), (14325, 2002, 4695), (14326, 2002, 4696), (14327, 2002, 4697),
(14328, 2002, 4698), (14329, 2002, 4700), (14330, 2002, 4702), (14331, 2002, 4704),
(14332, 2002, 4706), (14333, 2002, 4708);

-- 质量工程师（2003）：授予顶级/分组/菜单 + 仅查询按钮（14 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14334, 2003, 4690), (14335, 2003, 4691), (14336, 2003, 4692), (14337, 2003, 4693),
(14338, 2003, 4694), (14339, 2003, 4695), (14340, 2003, 4696), (14341, 2003, 4697),
(14342, 2003, 4698), (14343, 2003, 4700), (14344, 2003, 4702), (14345, 2003, 4704),
(14346, 2003, 4706), (14347, 2003, 4708);

-- 生产现场（2005）：授予顶级/分组/菜单 + 仅查询按钮（14 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14348, 2005, 4690), (14349, 2005, 4691), (14350, 2005, 4692), (14351, 2005, 4693),
(14352, 2005, 4694), (14353, 2005, 4695), (14354, 2005, 4696), (14355, 2005, 4697),
(14356, 2005, 4698), (14357, 2005, 4700), (14358, 2005, 4702), (14359, 2005, 4704),
(14360, 2005, 4706), (14361, 2005, 4708);

-- 只读用户（2006）：授予顶级/分组/菜单 + 仅查询按钮（14 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14362, 2006, 4690), (14363, 2006, 4691), (14364, 2006, 4692), (14365, 2006, 4693),
(14366, 2006, 4694), (14367, 2006, 4695), (14368, 2006, 4696), (14369, 2006, 4697),
(14370, 2006, 4698), (14371, 2006, 4700), (14372, 2006, 4702), (14373, 2006, 4704),
(14374, 2006, 4706), (14375, 2006, 4708);

-- ========== WMS 仓库基础字典（8450-8496） ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(8450, 'wms_warehouse_type', '原料仓', 'RAW', 1, 1, NULL),
(8451, 'wms_warehouse_type', '半成品仓', 'SEMI', 2, 1, NULL),
(8452, 'wms_warehouse_type', '成品仓', 'FINISHED', 3, 1, NULL),
(8453, 'wms_warehouse_type', 'VMI仓', 'VMI', 4, 1, NULL),
(8454, 'wms_warehouse_type', '其他', 'OTHER', 5, 1, NULL),
(8455, 'wms_warehouse_status', '草稿', 'DRAFT', 1, 1, NULL),
(8456, 'wms_warehouse_status', '启用', 'ACTIVE', 2, 1, NULL),
(8457, 'wms_warehouse_status', '锁定', 'LOCKED', 3, 1, NULL),
(8458, 'wms_warehouse_status', '停用', 'DISABLED', 4, 1, NULL),
(8459, 'wms_zone_type', '存储区', 'STORAGE', 1, 1, NULL),
(8460, 'wms_zone_type', '收货区', 'RECEIVING', 2, 1, NULL),
(8461, 'wms_zone_type', '发货区', 'SHIPPING', 3, 1, NULL),
(8462, 'wms_zone_type', '待检区', 'QUARANTINE', 4, 1, NULL),
(8463, 'wms_zone_type', '不合格区', 'DEFECT', 5, 1, NULL),
(8464, 'wms_zone_type', 'VMI区', 'VMI', 6, 1, NULL),
(8465, 'wms_temperature_type', '常温', 'NORMAL', 1, 1, NULL),
(8466, 'wms_temperature_type', '恒温', 'CONSTANT', 2, 1, NULL),
(8467, 'wms_temperature_type', '冷藏', 'COLD', 3, 1, NULL),
(8468, 'wms_bin_type', '存储位', 'STORAGE', 1, 1, NULL),
(8469, 'wms_bin_type', '拣选位', 'PICK', 2, 1, NULL),
(8470, 'wms_bin_type', '地堆位', 'FLOOR', 3, 1, NULL),
(8471, 'wms_bin_type', '暂存位', 'STAGE', 4, 1, NULL),
(8472, 'wms_bin_status', '空闲', 'IDLE', 1, 1, NULL),
(8473, 'wms_bin_status', '占用', 'OCCUPIED', 2, 1, NULL),
(8474, 'wms_bin_status', '锁定', 'LOCKED', 3, 1, NULL),
(8475, 'wms_bin_status', '停用', 'DISABLED', 4, 1, NULL),
(8476, 'wms_rack_type', '层板货架', 'SHELF', 1, 1, NULL),
(8477, 'wms_rack_type', '托盘货架', 'PALLET', 2, 1, NULL),
(8478, 'wms_rack_type', '驶入式货架', 'DRIVEIN', 3, 1, NULL),
(8479, 'wms_rack_type', '悬臂式货架', 'CANTILEVER', 4, 1, NULL),
(8480, 'wms_container_type', '托盘', 'PALLET', 1, 1, NULL),
(8481, 'wms_container_type', '周转箱', 'BIN', 2, 1, NULL),
(8482, 'wms_container_type', '料盒', 'BOX', 3, 1, NULL),
(8483, 'wms_container_type', '料架', 'RACK', 4, 1, NULL),
(8484, 'wms_container_type', '周转车', 'TROLLEY', 5, 1, NULL),
(8485, 'wms_container_status', '空闲', 'IDLE', 1, 1, NULL),
(8486, 'wms_container_status', '使用中', 'IN_USE', 2, 1, NULL),
(8487, 'wms_container_status', '满载', 'FULL', 3, 1, NULL),
(8488, 'wms_container_status', '维护中', 'MAINTENANCE', 4, 1, NULL),
(8489, 'wms_container_status', '已报废', 'SCRAPPED', 5, 1, NULL),
(8490, 'wms_strategy_type', '上架策略', 'PUTAWAY', 1, 1, NULL),
(8491, 'wms_strategy_type', '拣选策略', 'PICK', 2, 1, NULL),
(8492, 'wms_strategy_type', '补货策略', 'REPLENISH', 3, 1, NULL),
(8493, 'wms_strategy_type', '分配策略', 'ALLOCATE', 4, 1, NULL),
(8494, 'wms_strategy_status', '草稿', 'DRAFT', 1, 1, NULL),
(8495, 'wms_strategy_status', '启用', 'ENABLED', 2, 1, NULL),
(8496, 'wms_strategy_status', '停用', 'DISABLED', 3, 1, NULL);

-- ========== WMS 仓库基础可配置项（6450-6461） ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(6450, 'WMS', 'wms.base.enabled', '仓储基础启用开关', 'true', 0, 1, 'WMS 仓库基础总开关，默认启用'),
(6451, 'WMS', 'wms.base.code.separator', '库位编码分隔符', '-', 1, 1, '待业务方确认：库位编码分隔符（如 仓库-库区-序号）'),
(6452, 'WMS', 'wms.warehouse.default.type', '仓库默认类型', 'FINISHED', 1, 1, '待业务方确认：新建仓库默认类型（RAW/SEMI/FINISHED/VMI/OTHER）'),
(6453, 'WMS', 'wms.putaway.default.strategy', '默认上架策略', 'FIFO', 1, 1, '待业务方确认：默认上架策略（FIFO/LIFO/就近/定置）'),
(6454, 'WMS', 'wms.pick.default.strategy', '默认拣选策略', 'FIFO', 1, 1, '待业务方确认：默认拣选策略（FIFO/LIFO/就近/整箱优先）'),
(6455, 'WMS', 'wms.capacity.warning.percent', '库位容量预警阈值(%)', '90', 1, 1, '待业务方确认：库位容量使用率预警阈值（百分比）'),
(6456, 'WMS', 'wms.container.enabled', '容器管理启用开关', 'true', 0, 1, '是否启用容器（托盘/周转箱）管理'),
(6457, 'WMS', 'wms.barcode.enabled', '条码管理启用开关', 'true', 0, 1, '是否启用库位/容器条码'),
(6458, 'WMS', 'wms.strategy.default.priority', '作业策略默认优先级', '10', 1, 1, '待业务方确认：作业策略默认优先级'),
(6459, 'WMS', 'wms.multi.warehouse.enabled', '多仓管理启用开关', 'true', 1, 1, '待业务方确认：是否启用多仓管理'),
(6460, 'WMS', 'wms.bin.mixed.batch.enabled', '库位多批次混放开关', 'true', 1, 1, '待业务方确认：同一库位是否允许多批次混放'),
(6461, 'WMS', 'wms.stock.snapshot.period', '库存快照周期', 'DAILY', 1, 1, '待业务方确认：库存快照周期（DAILY/WEEKLY/MONTHLY）');
