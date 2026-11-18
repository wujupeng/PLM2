-- G5-N8 WMS—VMI管理（WBS T052）初始化：菜单/按钮权限、角色授权、字典与可配置项。
-- 号段基线（V115 之后已占用的最大值）：sys_permission=4809（本脚本从 4820 起）、
-- sys_role_permission=14727（从 14740 起）、sys_dictionary=8699（从 8720 起）、sys_config=6611（从 6640 起）。
-- 菜单说明：复用 V103 已建的 WMS 顶级菜单域（4690）；
--           VMI管理（4820）为其下二级分组，覆盖库位容量、托盘数、扫码+/-、二维码定位、超容量预警。

-- ========== VMI管理分组菜单（4820，挂在 4690 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4820, 'wms:vmi', 'VMI管理', 'menu', 4690, '/wms/vmi', 'DatabaseOutlined', 8, 1);

-- ========== VMI管理业务菜单（4821-4823，挂在 4820 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4821, 'wms:vmi:bin', 'VMI库位', 'menu', 4820, '/wms/vmi/bins', 'DatabaseOutlined', 1, 1),
(4822, 'wms:vmi:scan', 'VMI扫码收发', 'menu', 4820, '/wms/vmi/scans', 'ScanOutlined', 2, 1),
(4823, 'wms:vmi:warning', '超容量预警', 'menu', 4820, '/wms/vmi/warnings', 'AlertOutlined', 3, 1);

-- ========== VMI管理按钮（4824-4829） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4824, 'wms:vmi:bin:list', '查询VMI库位', 'button', 4821, NULL, NULL, 1, 1),
(4825, 'wms:vmi:bin:manage', '维护VMI库位', 'button', 4821, NULL, NULL, 2, 1),
(4826, 'wms:vmi:scan:list', '查询VMI扫码', 'button', 4822, NULL, NULL, 1, 1),
(4827, 'wms:vmi:scan:manage', '维护VMI扫码', 'button', 4822, NULL, NULL, 2, 1),
(4828, 'wms:vmi:warning:list', '查询超容量预警', 'button', 4823, NULL, NULL, 1, 1),
(4829, 'wms:vmi:warning:manage', '维护超容量预警', 'button', 4823, NULL, NULL, 2, 1);

-- ========== 角色授权 ==========

-- 管理员（2001）：授予全部权限（1 分组 + 3 菜单 + 6 按钮，共 10 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14740, 2001, 4820), (14741, 2001, 4821), (14742, 2001, 4822), (14743, 2001, 4823),
(14744, 2001, 4824), (14745, 2001, 4825), (14746, 2001, 4826), (14747, 2001, 4827),
(14748, 2001, 4828), (14749, 2001, 4829);

-- 供应链专员（2004）：授予全部权限（VMI管理为供应链主责，共 10 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14750, 2004, 4820), (14751, 2004, 4821), (14752, 2004, 4822), (14753, 2004, 4823),
(14754, 2004, 4824), (14755, 2004, 4825), (14756, 2004, 4826), (14757, 2004, 4827),
(14758, 2004, 4828), (14759, 2004, 4829);

-- 研发工程师（2002）：授予分组/菜单 + 仅查询按钮（7 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14760, 2002, 4820), (14761, 2002, 4821), (14762, 2002, 4822), (14763, 2002, 4823),
(14764, 2002, 4824), (14765, 2002, 4826), (14766, 2002, 4828);

-- 质量工程师（2003）：授予分组/菜单 + 仅查询按钮（7 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14767, 2003, 4820), (14768, 2003, 4821), (14769, 2003, 4822), (14770, 2003, 4823),
(14771, 2003, 4824), (14772, 2003, 4826), (14773, 2003, 4828);

-- 生产现场（2005）：授予分组/菜单 + 仅查询按钮（7 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14774, 2005, 4820), (14775, 2005, 4821), (14776, 2005, 4822), (14777, 2005, 4823),
(14778, 2005, 4824), (14779, 2005, 4826), (14780, 2005, 4828);

-- 只读用户（2006）：授予分组/菜单 + 仅查询按钮（7 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14781, 2006, 4820), (14782, 2006, 4821), (14783, 2006, 4822), (14784, 2006, 4823),
(14785, 2006, 4824), (14786, 2006, 4826), (14787, 2006, 4828);

-- ========== VMI管理字典（8720-8739） ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(8720, 'wms_vmi_bin_type', '存储区', 'STORAGE', 1, 1, NULL),
(8721, 'wms_vmi_bin_type', '暂存区', 'STAGING', 2, 1, NULL),
(8722, 'wms_vmi_bin_type', '拣选区', 'PICKING', 3, 1, NULL),
(8723, 'wms_vmi_bin_status', '空闲', 'IDLE', 1, 1, NULL),
(8724, 'wms_vmi_bin_status', '占用', 'OCCUPIED', 2, 1, NULL),
(8725, 'wms_vmi_bin_status', '已满', 'FULL', 3, 1, NULL),
(8726, 'wms_vmi_bin_status', '预留', 'RESERVED', 4, 1, NULL),
(8727, 'wms_vmi_bin_status', '已取消', 'CANCELLED', 5, 1, NULL),
(8728, 'wms_vmi_scan_type', '扫码入库', 'IN', 1, 1, NULL),
(8729, 'wms_vmi_scan_type', '扫码出库', 'OUT', 2, 1, NULL),
(8730, 'wms_vmi_scan_status', '草稿', 'DRAFT', 1, 1, NULL),
(8731, 'wms_vmi_scan_status', '已确认', 'CONFIRMED', 2, 1, NULL),
(8732, 'wms_vmi_scan_status', '已取消', 'CANCELLED', 3, 1, NULL),
(8733, 'wms_vmi_warning_level', '低', 'LOW', 1, 1, NULL),
(8734, 'wms_vmi_warning_level', '中', 'MEDIUM', 2, 1, NULL),
(8735, 'wms_vmi_warning_level', '高', 'HIGH', 3, 1, NULL),
(8736, 'wms_vmi_warning_status', '待处理', 'PENDING', 1, 1, NULL),
(8737, 'wms_vmi_warning_status', '已确认', 'ACKNOWLEDGED', 2, 1, NULL),
(8738, 'wms_vmi_warning_status', '已处理', 'HANDLED', 3, 1, NULL),
(8739, 'wms_vmi_warning_status', '已关闭', 'CLOSED', 4, 1, NULL);

-- ========== VMI管理可配置项（6640-6651） ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(6640, 'WMS', 'wms.vmi.enabled', 'VMI管理启用开关', 'true', 0, 1, 'WMS VMI 管理总开关，默认启用'),
(6641, 'WMS', 'wms.vmi.bin.no.prefix', 'VMI库位单号前缀', 'VBIN', 0, 1, 'VMI 库位单号自动生成前缀'),
(6642, 'WMS', 'wms.vmi.bin.default.capacity', '库位默认容量', '1000', 1, 1, '待业务方确认：VMI 库位默认容量数量'),
(6643, 'WMS', 'wms.vmi.bin.default.pallet', '库位默认托盘数', '10', 1, 1, '待业务方确认：VMI 库位默认最大托盘数'),
(6644, 'WMS', 'wms.vmi.scan.no.prefix', 'VMI扫码单号前缀', 'VSC', 0, 1, 'VMI 扫码收发单号自动生成前缀'),
(6645, 'WMS', 'wms.vmi.scan.need.recheck', '扫码需复核开关', 'true', 1, 1, '待业务方确认：扫码收发是否需复核确认'),
(6646, 'WMS', 'wms.vmi.scan.allow.negative', '允许负库存开关', 'false', 0, 1, '扫码出库是否允许库存为负'),
(6647, 'WMS', 'wms.vmi.warning.no.prefix', '预警单号前缀', 'VWR', 0, 1, '超容量预警单号自动生成前缀'),
(6648, 'WMS', 'wms.vmi.warning.threshold.rate', '容量预警阈值(%)', '90', 1, 1, '待业务方确认：库位使用率超过该阈值触发预警'),
(6649, 'WMS', 'wms.vmi.warning.auto', '预警自动生成开关', 'true', 1, 1, '待业务方确认：超容量预警是否自动生成'),
(6650, 'WMS', 'wms.vmi.warning.need.handle', '预警需处理开关', 'true', 0, 1, '预警是否需人工确认处理后关闭'),
(6651, 'WMS', 'wms.vmi.warning.default.level', '默认预警等级', 'MEDIUM', 1, 1, '待业务方确认：预警默认等级（LOW/MEDIUM/HIGH）');
