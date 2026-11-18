-- G4-N3 SRM—采购协同（WBS T033）初始化：菜单/按钮权限、角色授权、字典与可配置项。
-- 号段基线（V93 之后已占用的最大值）：sys_permission=4601（本脚本从 4610 起）、
-- sys_role_permission=13983（从 14000 起）、sys_dictionary=8312（从 8320 起）、sys_config=6361（从 6370 起）。
-- 菜单说明：复用 V91 已建的 SRM 顶级菜单域（4550）；
--           采购协同（4610）为其下二级分组；采购/审批复用既有平台底座。

-- ========== SRM 采购协同分组菜单（4610，挂在 4550 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4610, 'srm:collab', '采购协同', 'menu', 4550, '/srm/collab', 'SwapOutlined', 3, 1);

-- ========== SRM 采购协同业务菜单（4611-4615，挂在 4610 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4611, 'srm:collab:po-confirm', '订单确认', 'menu', 4610, '/srm/collab/po-confirms', 'AuditOutlined', 1, 1),
(4612, 'srm:collab:commitment', '交期承诺', 'menu', 4610, '/srm/collab/commitments', 'FieldTimeOutlined', 2, 1),
(4613, 'srm:collab:change', '变更确认', 'menu', 4610, '/srm/collab/changes', 'DiffOutlined', 3, 1),
(4614, 'srm:collab:appointment', '送货预约', 'menu', 4610, '/srm/collab/appointments', 'CalendarOutlined', 4, 1),
(4615, 'srm:collab:asn', 'ASN发货通知', 'menu', 4610, '/srm/collab/asns', 'CarOutlined', 5, 1);

-- ========== SRM 采购协同按钮（4616-4625） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4616, 'srm:collab:po-confirm:list', '查询订单确认', 'button', 4611, NULL, NULL, 1, 1),
(4617, 'srm:collab:po-confirm:manage', '维护订单确认', 'button', 4611, NULL, NULL, 2, 1),
(4618, 'srm:collab:commitment:list', '查询交期承诺', 'button', 4612, NULL, NULL, 1, 1),
(4619, 'srm:collab:commitment:manage', '维护交期承诺', 'button', 4612, NULL, NULL, 2, 1),
(4620, 'srm:collab:change:list', '查询变更确认', 'button', 4613, NULL, NULL, 1, 1),
(4621, 'srm:collab:change:manage', '维护变更确认', 'button', 4613, NULL, NULL, 2, 1),
(4622, 'srm:collab:appointment:list', '查询送货预约', 'button', 4614, NULL, NULL, 1, 1),
(4623, 'srm:collab:appointment:manage', '维护送货预约', 'button', 4614, NULL, NULL, 2, 1),
(4624, 'srm:collab:asn:list', '查询ASN发货通知', 'button', 4615, NULL, NULL, 1, 1),
(4625, 'srm:collab:asn:manage', '维护ASN发货通知', 'button', 4615, NULL, NULL, 2, 1);

-- ========== 角色授权 ==========

-- 管理员（2001）：授予全部权限（1 分组 + 5 菜单 + 10 按钮，共 16 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14000, 2001, 4610), (14001, 2001, 4611), (14002, 2001, 4612), (14003, 2001, 4613),
(14004, 2001, 4614), (14005, 2001, 4615), (14006, 2001, 4616), (14007, 2001, 4617),
(14008, 2001, 4618), (14009, 2001, 4619), (14010, 2001, 4620), (14011, 2001, 4621),
(14012, 2001, 4622), (14013, 2001, 4623), (14014, 2001, 4624), (14015, 2001, 4625);

-- 供应链专员（2004）：授予全部权限（采购协同为供应链职能主责，共 16 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14016, 2004, 4610), (14017, 2004, 4611), (14018, 2004, 4612), (14019, 2004, 4613),
(14020, 2004, 4614), (14021, 2004, 4615), (14022, 2004, 4616), (14023, 2004, 4617),
(14024, 2004, 4618), (14025, 2004, 4619), (14026, 2004, 4620), (14027, 2004, 4621),
(14028, 2004, 4622), (14029, 2004, 4623), (14030, 2004, 4624), (14031, 2004, 4625);

-- 研发工程师（2002）：授予分组/菜单 + 仅查询按钮（11 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14032, 2002, 4610), (14033, 2002, 4611), (14034, 2002, 4612), (14035, 2002, 4613),
(14036, 2002, 4614), (14037, 2002, 4615), (14038, 2002, 4616), (14039, 2002, 4618),
(14040, 2002, 4620), (14041, 2002, 4622), (14042, 2002, 4624);

-- 质量工程师（2003）：授予分组/菜单 + 仅查询按钮（11 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14043, 2003, 4610), (14044, 2003, 4611), (14045, 2003, 4612), (14046, 2003, 4613),
(14047, 2003, 4614), (14048, 2003, 4615), (14049, 2003, 4616), (14050, 2003, 4618),
(14051, 2003, 4620), (14052, 2003, 4622), (14053, 2003, 4624);

-- 生产现场（2005）：授予分组/菜单 + 仅查询按钮（11 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14054, 2005, 4610), (14055, 2005, 4611), (14056, 2005, 4612), (14057, 2005, 4613),
(14058, 2005, 4614), (14059, 2005, 4615), (14060, 2005, 4616), (14061, 2005, 4618),
(14062, 2005, 4620), (14063, 2005, 4622), (14064, 2005, 4624);

-- 只读用户（2006）：授予分组/菜单 + 仅查询按钮（11 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14065, 2006, 4610), (14066, 2006, 4611), (14067, 2006, 4612), (14068, 2006, 4613),
(14069, 2006, 4614), (14070, 2006, 4615), (14071, 2006, 4616), (14072, 2006, 4618),
(14073, 2006, 4620), (14074, 2006, 4622), (14075, 2006, 4624);

-- ========== SRM 采购协同字典（8320-8346） ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(8320, 'srm_po_confirm_status', '待确认', 'PENDING', 1, 1, NULL),
(8321, 'srm_po_confirm_status', '已确认', 'CONFIRMED', 2, 1, NULL),
(8322, 'srm_po_confirm_status', '已拒绝', 'REJECTED', 3, 1, NULL),
(8323, 'srm_po_confirm_status', '已取消', 'CANCELLED', 4, 1, NULL),
(8324, 'srm_commitment_status', '待承诺', 'PENDING', 1, 1, NULL),
(8325, 'srm_commitment_status', '已承诺', 'COMMITTED', 2, 1, NULL),
(8326, 'srm_commitment_status', '延期承诺', 'DELAYED', 3, 1, NULL),
(8327, 'srm_commitment_status', '已取消', 'CANCELLED', 4, 1, NULL),
(8328, 'srm_po_change_type', '数量变更', 'QTY', 1, 1, NULL),
(8329, 'srm_po_change_type', '交期变更', 'DATE', 2, 1, NULL),
(8330, 'srm_po_change_type', '价格变更', 'PRICE', 3, 1, NULL),
(8331, 'srm_po_change_type', '取消订单', 'CANCEL', 4, 1, NULL),
(8332, 'srm_po_change_status', '待确认', 'PENDING', 1, 1, NULL),
(8333, 'srm_po_change_status', '已确认', 'CONFIRMED', 2, 1, NULL),
(8334, 'srm_po_change_status', '已拒绝', 'REJECTED', 3, 1, NULL),
(8335, 'srm_po_change_status', '已取消', 'CANCELLED', 4, 1, NULL),
(8336, 'srm_appointment_status', '待审核', 'PENDING', 1, 1, NULL),
(8337, 'srm_appointment_status', '已批准', 'APPROVED', 2, 1, NULL),
(8338, 'srm_appointment_status', '已确认', 'CONFIRMED', 3, 1, NULL),
(8339, 'srm_appointment_status', '已到货', 'ARRIVED', 4, 1, NULL),
(8340, 'srm_appointment_status', '已取消', 'CANCELLED', 5, 1, NULL),
(8341, 'srm_asn_status', '草稿', 'DRAFT', 1, 1, NULL),
(8342, 'srm_asn_status', '已发货', 'SHIPPED', 2, 1, NULL),
(8343, 'srm_asn_status', '在途', 'IN_TRANSIT', 3, 1, NULL),
(8344, 'srm_asn_status', '已到达', 'ARRIVED', 4, 1, NULL),
(8345, 'srm_asn_status', '已收货', 'RECEIVED', 5, 1, NULL),
(8346, 'srm_asn_status', '已取消', 'CANCELLED', 6, 1, NULL);

-- ========== SRM 采购协同可配置项（6370-6380） ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(6370, 'SRM', 'srm.collab.enabled', '采购协同启用开关', 'true', 0, 1, 'SRM 采购协同总开关，默认启用'),
(6371, 'SRM', 'srm.collab.po.confirm.required', '订单确认必填', 'true', 1, 1, '待业务方确认：采购订单是否必须供应商确认'),
(6372, 'SRM', 'srm.collab.po.confirm.timeout.days', '订单确认时限天数', '3', 1, 1, '待业务方确认：供应商订单确认时限（天）'),
(6373, 'SRM', 'srm.collab.commitment.delay.warn.days', '交期延期预警天数', '2', 1, 1, '待业务方确认：承诺交期晚于需求交期的预警阈值'),
(6374, 'SRM', 'srm.collab.po.change.approve.required', '订单变更审批必填', 'true', 1, 1, '待业务方确认：采购订单变更是否需审批'),
(6375, 'SRM', 'srm.collab.appointment.advance.days', '送货预约提前天数', '1', 1, 1, '待业务方确认：送货预约需提前天数'),
(6376, 'SRM', 'srm.collab.appointment.time.slot.enabled', '送货时段管理启用', 'true', 0, 1, '是否启用送货预约时间段管理'),
(6377, 'SRM', 'srm.collab.asn.require.appointment', 'ASN 关联预约必填', 'true', 1, 1, '待业务方确认：ASN 是否必须关联送货预约'),
(6378, 'SRM', 'srm.collab.asn.receive.tolerance.percent', '收货数量容差百分比', '5', 1, 1, '待业务方确认：ASN 发货数量与订单数量容差（%）'),
(6379, 'SRM', 'srm.collab.delivery.warehouse.default', '默认收货仓库', 'WH01', 1, 1, '待业务方确认：送货预约默认收货仓库编码'),
(6380, 'SRM', 'srm.collab.asn.auto.number', 'ASN 单号自动生成', 'true', 0, 1, 'ASN 单号为空时是否自动生成');
