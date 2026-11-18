-- G5-N5 WMS—生产退补料（WBS T049）初始化：菜单/按钮权限、角色授权、字典与可配置项。
-- 号段基线（V109 之后已占用的最大值）：sys_permission=4759（本脚本从 4760 起）、
-- sys_role_permission=14547（从 14560 起）、sys_dictionary=8587（从 8600 起）、sys_config=6531（从 6540 起）。
-- 菜单说明：复用 V103 已建的 WMS 顶级菜单域（4690）；
--           生产退补料（4760）为其下二级分组，覆盖退料、补料、超领、余料回库、差异处理。

-- ========== 生产退补料分组菜单（4760，挂在 4690 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4760, 'wms:return', '生产退补料', 'menu', 4690, '/wms/return', 'RollbackOutlined', 5, 1);

-- ========== 生产退补料业务菜单（4761-4763，挂在 4760 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4761, 'wms:return:return', '生产退料', 'menu', 4760, '/wms/return/returns', 'RollbackOutlined', 1, 1),
(4762, 'wms:return:replenish', '生产补料', 'menu', 4760, '/wms/return/replenishes', 'PlusSquareOutlined', 2, 1),
(4763, 'wms:return:diff', '差异处理', 'menu', 4760, '/wms/return/diffs', 'DiffOutlined', 3, 1);

-- ========== 生产退补料按钮（4764-4769） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4764, 'wms:return:return:list', '查询生产退料', 'button', 4761, NULL, NULL, 1, 1),
(4765, 'wms:return:return:manage', '维护生产退料', 'button', 4761, NULL, NULL, 2, 1),
(4766, 'wms:return:replenish:list', '查询生产补料', 'button', 4762, NULL, NULL, 1, 1),
(4767, 'wms:return:replenish:manage', '维护生产补料', 'button', 4762, NULL, NULL, 2, 1),
(4768, 'wms:return:diff:list', '查询差异处理', 'button', 4763, NULL, NULL, 1, 1),
(4769, 'wms:return:diff:manage', '维护差异处理', 'button', 4763, NULL, NULL, 2, 1);

-- ========== 角色授权 ==========

-- 管理员（2001）：授予全部权限（1 分组 + 3 菜单 + 6 按钮，共 10 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14560, 2001, 4760), (14561, 2001, 4761), (14562, 2001, 4762), (14563, 2001, 4763),
(14564, 2001, 4764), (14565, 2001, 4765), (14566, 2001, 4766), (14567, 2001, 4767),
(14568, 2001, 4768), (14569, 2001, 4769);

-- 供应链专员（2004）：授予全部权限（退补料为供应链主责，共 10 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14570, 2004, 4760), (14571, 2004, 4761), (14572, 2004, 4762), (14573, 2004, 4763),
(14574, 2004, 4764), (14575, 2004, 4765), (14576, 2004, 4766), (14577, 2004, 4767),
(14578, 2004, 4768), (14579, 2004, 4769);

-- 研发工程师（2002）：授予分组/菜单 + 仅查询按钮（7 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14580, 2002, 4760), (14581, 2002, 4761), (14582, 2002, 4762), (14583, 2002, 4763),
(14584, 2002, 4764), (14585, 2002, 4766), (14586, 2002, 4768);

-- 质量工程师（2003）：授予分组/菜单 + 仅查询按钮（差异处理为质量主责，7 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14587, 2003, 4760), (14588, 2003, 4761), (14589, 2003, 4762), (14590, 2003, 4763),
(14591, 2003, 4764), (14592, 2003, 4766), (14593, 2003, 4768);

-- 生产现场（2005）：授予分组/菜单 + 仅查询按钮（退补料为生产主责，7 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14594, 2005, 4760), (14595, 2005, 4761), (14596, 2005, 4762), (14597, 2005, 4763),
(14598, 2005, 4764), (14599, 2005, 4766), (14600, 2005, 4768);

-- 只读用户（2006）：授予分组/菜单 + 仅查询按钮（7 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14601, 2006, 4760), (14602, 2006, 4761), (14603, 2006, 4762), (14604, 2006, 4763),
(14605, 2006, 4764), (14606, 2006, 4766), (14607, 2006, 4768);

-- ========== 生产退补料字典（8600-8617） ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(8600, 'wms_return_type', '生产退料', 'RETURN', 1, 1, NULL),
(8601, 'wms_return_type', '余料回库', 'SURPLUS', 2, 1, NULL),
(8602, 'wms_return_status', '草稿', 'DRAFT', 1, 1, NULL),
(8603, 'wms_return_status', '已提交', 'SUBMITTED', 2, 1, NULL),
(8604, 'wms_return_status', '已收货', 'RECEIVED', 3, 1, NULL),
(8605, 'wms_return_status', '已取消', 'CANCELLED', 4, 1, NULL),
(8606, 'wms_replenish_type', '生产补料', 'REPLENISH', 1, 1, NULL),
(8607, 'wms_replenish_type', '超领', 'OVER_ISSUE', 2, 1, NULL),
(8608, 'wms_replenish_status', '草稿', 'DRAFT', 1, 1, NULL),
(8609, 'wms_replenish_status', '已提交', 'SUBMITTED', 2, 1, NULL),
(8610, 'wms_replenish_status', '已发料', 'ISSUED', 3, 1, NULL),
(8611, 'wms_replenish_status', '已取消', 'CANCELLED', 4, 1, NULL),
(8612, 'wms_material_diff_type', '数量差异', 'QTY', 1, 1, NULL),
(8613, 'wms_material_diff_type', '质量差异', 'QUALITY', 2, 1, NULL),
(8614, 'wms_material_diff_status', '待处理', 'PENDING', 1, 1, NULL),
(8615, 'wms_material_diff_status', '处理中', 'PROCESSING', 2, 1, NULL),
(8616, 'wms_material_diff_status', '已解决', 'RESOLVED', 3, 1, NULL),
(8617, 'wms_material_diff_status', '已关闭', 'CLOSED', 4, 1, NULL);

-- ========== 生产退补料可配置项（6540-6551） ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(6540, 'WMS', 'wms.return.enabled', '生产退补料启用开关', 'true', 0, 1, 'WMS 生产退补料总开关，默认启用'),
(6541, 'WMS', 'wms.return.no.prefix', '退料单号前缀', 'RTN', 0, 1, '退料单号自动生成前缀'),
(6542, 'WMS', 'wms.return.surplus.auto', '余料自动回库开关', 'true', 1, 1, '待业务方确认：余料是否自动生成回库单'),
(6543, 'WMS', 'wms.return.need.approve', '退料需审批开关', 'false', 1, 1, '待业务方确认：生产退料是否需走审批流程'),
(6544, 'WMS', 'wms.return.reason.required', '退料必填原因开关', 'true', 0, 1, '退料单是否必填退料原因'),
(6545, 'WMS', 'wms.replenish.no.prefix', '补料单号前缀', 'RPL', 0, 1, '补料单号自动生成前缀'),
(6546, 'WMS', 'wms.replenish.over.issue.enabled', '允许超领开关', 'true', 1, 1, '待业务方确认：是否允许超领（超出工单需求数量补料）'),
(6547, 'WMS', 'wms.replenish.over.issue.ratio', '超领比例上限(%)', '0', 1, 1, '待业务方确认：超领数量相对计划数量的比例上限，0 表示不限制'),
(6548, 'WMS', 'wms.replenish.need.approve', '补料需审批开关', 'false', 1, 1, '待业务方确认：生产补料是否需走审批流程'),
(6549, 'WMS', 'wms.diff.no.prefix', '差异处理单号前缀', 'DIF', 0, 1, '差异处理单号自动生成前缀'),
(6550, 'WMS', 'wms.diff.auto.create', '差异自动生成开关', 'false', 1, 1, '待业务方确认：退补料差异是否自动生成处理单'),
(6551, 'WMS', 'wms.diff.tolerance.qty', '差异容忍数量', '0', 1, 1, '待业务方确认：允许的差异数量容忍度，超出后需差异处理');
