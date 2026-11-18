-- G1-N6 公共平台底座—通用能力（WBS T106 移动端与PDA）初始化：菜单/按钮权限、角色授权、字典与可配置项。
-- 号段基线（V62 之前已占用的最大值）：sys_permission=4128、sys_role_permission=12195、
-- sys_dictionary=7262、sys_config=6142；本脚本从各自之后继续编号，避免主键冲突。
-- 菜单继续挂在「平台底座」（parent_id=3920）下，与前述各节点并列。

-- ========== 移动端与PDA菜单（4130-4134，挂在平台底座 3920 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4130, 'platform:mobile:device', 'PDA设备', 'menu', 3920, '/platform/mobile/devices', 'MobileOutlined', 101, 1),
(4131, 'platform:mobile:scene', '移动场景', 'menu', 3920, '/platform/mobile/scenes', 'AppstoreOutlined', 102, 1),
(4132, 'platform:mobile:scanlog', '扫码日志', 'menu', 3920, '/platform/mobile/scan-logs', 'ScanOutlined', 103, 1),
(4133, 'platform:mobile:labelrule', '标签校验规则', 'menu', 3920, '/platform/mobile/label-rules', 'QrcodeOutlined', 104, 1),
(4134, 'platform:mobile:exception', '移动异常队列', 'menu', 3920, '/platform/mobile/exceptions', 'AlertOutlined', 105, 1);

-- ========== 移动端与PDA按钮（4135-4144） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4135, 'platform:mobile:device:list', '查询PDA设备', 'button', 4130, NULL, NULL, 1, 1),
(4136, 'platform:mobile:device:manage', '维护PDA设备', 'button', 4130, NULL, NULL, 2, 1),
(4137, 'platform:mobile:scene:list', '查询移动场景', 'button', 4131, NULL, NULL, 1, 1),
(4138, 'platform:mobile:scene:manage', '维护移动场景', 'button', 4131, NULL, NULL, 2, 1),
(4139, 'platform:mobile:scanlog:list', '查询扫码日志', 'button', 4132, NULL, NULL, 1, 1),
(4140, 'platform:mobile:scanlog:manage', '维护扫码日志', 'button', 4132, NULL, NULL, 2, 1),
(4141, 'platform:mobile:labelrule:list', '查询标签校验规则', 'button', 4133, NULL, NULL, 1, 1),
(4142, 'platform:mobile:labelrule:manage', '维护标签校验规则', 'button', 4133, NULL, NULL, 2, 1),
(4143, 'platform:mobile:exception:list', '查询移动异常', 'button', 4134, NULL, NULL, 1, 1),
(4144, 'platform:mobile:exception:manage', '处理移动异常', 'button', 4134, NULL, NULL, 2, 1);

-- ========== 角色授权 ==========

-- 管理员（2001）：授予移动端与PDA全部权限
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(12196, 2001, 4130), (12197, 2001, 4131), (12198, 2001, 4132), (12199, 2001, 4133), (12200, 2001, 4134),
(12201, 2001, 4135), (12202, 2001, 4136), (12203, 2001, 4137), (12204, 2001, 4138), (12205, 2001, 4139),
(12206, 2001, 4140), (12207, 2001, 4141), (12208, 2001, 4142), (12209, 2001, 4143), (12210, 2001, 4144);

-- 只读用户（2006）：全部菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(12211, 2006, 4130), (12212, 2006, 4131), (12213, 2006, 4132), (12214, 2006, 4133), (12215, 2006, 4134),
(12216, 2006, 4135), (12217, 2006, 4137), (12218, 2006, 4139), (12219, 2006, 4141), (12220, 2006, 4143);

-- 供应链专员（2004）：全部菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(12221, 2004, 4130), (12222, 2004, 4131), (12223, 2004, 4132), (12224, 2004, 4133), (12225, 2004, 4134),
(12226, 2004, 4135), (12227, 2004, 4137), (12228, 2004, 4139), (12229, 2004, 4141), (12230, 2004, 4143);

-- 质量工程师（2003）：全部菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(12231, 2003, 4130), (12232, 2003, 4131), (12233, 2003, 4132), (12234, 2003, 4133), (12235, 2003, 4134),
(12236, 2003, 4135), (12237, 2003, 4137), (12238, 2003, 4139), (12239, 2003, 4141), (12240, 2003, 4143);

-- 研发工程师（2002）：全部菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(12241, 2002, 4130), (12242, 2002, 4131), (12243, 2002, 4132), (12244, 2002, 4133), (12245, 2002, 4134),
(12246, 2002, 4135), (12247, 2002, 4137), (12248, 2002, 4139), (12249, 2002, 4141), (12250, 2002, 4143);

-- 生产现场（2005）：全部菜单 + 设备/场景/标签规则查询 + 扫码日志与异常队列可维护
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(12251, 2005, 4130), (12252, 2005, 4131), (12253, 2005, 4132), (12254, 2005, 4133), (12255, 2005, 4134),
(12256, 2005, 4135), (12257, 2005, 4137), (12258, 2005, 4139), (12259, 2005, 4140), (12260, 2005, 4141),
(12261, 2005, 4143), (12262, 2005, 4144);

-- ========== 移动端与PDA字典（7263-7298） ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(7263, 'mobile_device_type', 'PDA', 'PDA', 1, 1, NULL),
(7264, 'mobile_device_type', '手机', 'PHONE', 2, 1, NULL),
(7265, 'mobile_device_type', '扫码枪', 'SCANNER', 3, 1, NULL),
(7266, 'mobile_device_type', '平板', 'TABLET', 4, 1, NULL),
(7267, 'mobile_device_status', '在线', 'ACTIVE', 1, 1, NULL),
(7268, 'mobile_device_status', '离线', 'OFFLINE', 2, 1, NULL),
(7269, 'mobile_device_status', '停用', 'DISABLED', 3, 1, NULL),
(7270, 'mobile_scan_type', '扫码收货', 'RECEIVE', 1, 1, NULL),
(7271, 'mobile_scan_type', '上架', 'SHELVE', 2, 1, NULL),
(7272, 'mobile_scan_type', '盘点', 'STOCKTAKE', 3, 1, NULL),
(7273, 'mobile_scan_type', '拣料', 'PICK', 4, 1, NULL),
(7274, 'mobile_scan_type', '报工', 'REPORT', 5, 1, NULL),
(7275, 'mobile_scan_type', '标签校验', 'LABEL_CHECK', 6, 1, NULL),
(7276, 'mobile_scene_status', '生效', 'ACTIVE', 1, 1, NULL),
(7277, 'mobile_scene_status', '停用', 'DISABLED', 2, 1, NULL),
(7278, 'mobile_scan_result', '成功', 'SUCCESS', 1, 1, NULL),
(7279, 'mobile_scan_result', '失败', 'FAIL', 2, 1, NULL),
(7280, 'label_type', '物料标签', 'MATERIAL', 1, 1, NULL),
(7281, 'label_type', '产品标签', 'PRODUCT', 2, 1, NULL),
(7282, 'label_type', '箱码', 'BOX', 3, 1, NULL),
(7283, 'label_type', '库位标签', 'WAREHOUSE', 4, 1, NULL),
(7284, 'label_check_type', '格式', 'FORMAT', 1, 1, NULL),
(7285, 'label_check_type', '校验位', 'CHECKSUM', 2, 1, NULL),
(7286, 'label_check_type', '长度', 'LENGTH', 3, 1, NULL),
(7287, 'label_check_type', '前缀', 'PREFIX', 4, 1, NULL),
(7288, 'label_rule_status', '生效', 'ACTIVE', 1, 1, NULL),
(7289, 'label_rule_status', '停用', 'DISABLED', 2, 1, NULL),
(7290, 'mobile_exception_type', '扫码失败', 'SCAN_FAIL', 1, 1, NULL),
(7291, 'mobile_exception_type', '标签非法', 'LABEL_INVALID', 2, 1, NULL),
(7292, 'mobile_exception_type', '离线同步失败', 'OFFLINE_SYNC', 3, 1, NULL),
(7293, 'mobile_exception_type', '权限不足', 'PERMISSION', 4, 1, NULL),
(7294, 'mobile_exception_type', '数据不一致', 'DATA_MISMATCH', 5, 1, NULL),
(7295, 'mobile_exception_status', '待处理', 'OPEN', 1, 1, NULL),
(7296, 'mobile_exception_status', '处理中', 'HANDLING', 2, 1, NULL),
(7297, 'mobile_exception_status', '已解决', 'RESOLVED', 3, 1, NULL),
(7298, 'mobile_exception_status', '已忽略', 'IGNORED', 4, 1, NULL);

-- ========== 移动端与PDA可配置项（6143-6147） ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(6143, 'MOBILE', 'mobile.enabled', '移动端与PDA启用开关', 'true', 0, 1, '统一移动作业总开关，默认启用'),
(6144, 'MOBILE', 'mobile.offline.enabled', '离线作业启用开关', 'true', 0, 1, 'PDA 是否允许离线扫码并在恢复网络后同步'),
(6145, 'MOBILE', 'mobile.offline.sync.interval', '离线同步间隔(秒)', '300', 1, 1, '待业务方确认离线数据自动同步间隔'),
(6146, 'MOBILE', 'mobile.label.default.rule', '默认标签校验规则', '14位零件号/28位追溯码', 1, 1, '待业务方确认零件号与追溯码标签位数规则'),
(6147, 'MOBILE', 'mobile.scan.duplicate.check', '扫码重复校验', 'true', 1, 1, '待业务方确认同一单据内条码是否允许重复扫码');
