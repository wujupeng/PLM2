-- G3-N3b ERP—委外管理（WBS T024 委外管理 / T094 委外加工闭环）初始化：菜单/按钮权限、角色授权、字典与可配置项。
-- 号段基线（V75 之后已占用的最大值）：sys_permission=4347（本脚本从 4360 起）、
-- sys_role_permission=12961（从 12980 起）、sys_dictionary=7698（从 7720 起）、sys_config=6197（从 6210 起）。
-- 菜单说明：委外管理为 ERP 顶级菜单（4260）下的二级分组（4360），其下挂 9 个业务单据页面；
--           加工商/物料/币种/税率/仓库复用既有基础资料与平台底座，不在此重复定义。

-- ========== ERP 委外管理分组菜单（4360，挂在 ERP 顶级菜单 4260 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4360, 'erp:outsource', '委外管理', 'menu', 4260, '/erp/outsource', 'BranchesOutlined', 22, 1);

-- ========== ERP 委外管理业务菜单（4361-4369，挂在委外管理 4360 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4361, 'erp:outsource:order', '委外订单', 'menu', 4360, '/erp/outsource/orders', 'ProfileOutlined', 1, 1),
(4362, 'erp:outsource:issue', '委外发料', 'menu', 4360, '/erp/outsource/issues', 'ExportOutlined', 2, 1),
(4363, 'erp:outsource:receipt', '委外到货', 'menu', 4360, '/erp/outsource/receipts', 'InboxOutlined', 3, 1),
(4364, 'erp:outsource:inspection', '委外报检', 'menu', 4360, '/erp/outsource/inspections', 'SafetyCertificateOutlined', 4, 1),
(4365, 'erp:outsource:inbound', '委外入库', 'menu', 4360, '/erp/outsource/inbounds', 'ImportOutlined', 5, 1),
(4366, 'erp:outsource:invoice', '委外发票', 'menu', 4360, '/erp/outsource/invoices', 'FileTextOutlined', 6, 1),
(4367, 'erp:outsource:settlement', '委外结算', 'menu', 4360, '/erp/outsource/settlements', 'MoneyCollectOutlined', 7, 1),
(4368, 'erp:outsource:writeoff', '委外核销', 'menu', 4360, '/erp/outsource/writeoffs', 'ReconciliationOutlined', 8, 1),
(4369, 'erp:outsource:return', '委外退货', 'menu', 4360, '/erp/outsource/returns', 'RollbackOutlined', 9, 1);

-- ========== ERP 委外管理按钮（4370-4387） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4370, 'erp:outsource:order:list', '查询委外订单', 'button', 4361, NULL, NULL, 1, 1),
(4371, 'erp:outsource:order:manage', '维护委外订单', 'button', 4361, NULL, NULL, 2, 1),
(4372, 'erp:outsource:issue:list', '查询委外发料', 'button', 4362, NULL, NULL, 1, 1),
(4373, 'erp:outsource:issue:manage', '维护委外发料', 'button', 4362, NULL, NULL, 2, 1),
(4374, 'erp:outsource:receipt:list', '查询委外到货', 'button', 4363, NULL, NULL, 1, 1),
(4375, 'erp:outsource:receipt:manage', '维护委外到货', 'button', 4363, NULL, NULL, 2, 1),
(4376, 'erp:outsource:inspection:list', '查询委外报检', 'button', 4364, NULL, NULL, 1, 1),
(4377, 'erp:outsource:inspection:manage', '维护委外报检', 'button', 4364, NULL, NULL, 2, 1),
(4378, 'erp:outsource:inbound:list', '查询委外入库', 'button', 4365, NULL, NULL, 1, 1),
(4379, 'erp:outsource:inbound:manage', '维护委外入库', 'button', 4365, NULL, NULL, 2, 1),
(4380, 'erp:outsource:invoice:list', '查询委外发票', 'button', 4366, NULL, NULL, 1, 1),
(4381, 'erp:outsource:invoice:manage', '维护委外发票', 'button', 4366, NULL, NULL, 2, 1),
(4382, 'erp:outsource:settlement:list', '查询委外结算', 'button', 4367, NULL, NULL, 1, 1),
(4383, 'erp:outsource:settlement:manage', '维护委外结算', 'button', 4367, NULL, NULL, 2, 1),
(4384, 'erp:outsource:writeoff:list', '查询委外核销', 'button', 4368, NULL, NULL, 1, 1),
(4385, 'erp:outsource:writeoff:manage', '维护委外核销', 'button', 4368, NULL, NULL, 2, 1),
(4386, 'erp:outsource:return:list', '查询委外退货', 'button', 4369, NULL, NULL, 1, 1),
(4387, 'erp:outsource:return:manage', '维护委外退货', 'button', 4369, NULL, NULL, 2, 1);

-- ========== 角色授权 ==========

-- 管理员（2001）：授予 ERP 委外管理全部权限（1 分组 + 9 菜单 + 18 按钮）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(12980, 2001, 4360),
(12981, 2001, 4361), (12982, 2001, 4362), (12983, 2001, 4363), (12984, 2001, 4364),
(12985, 2001, 4365), (12986, 2001, 4366), (12987, 2001, 4367), (12988, 2001, 4368),
(12989, 2001, 4369),
(12990, 2001, 4370), (12991, 2001, 4371), (12992, 2001, 4372), (12993, 2001, 4373),
(12994, 2001, 4374), (12995, 2001, 4375), (12996, 2001, 4376), (12997, 2001, 4377),
(12998, 2001, 4378), (12999, 2001, 4379), (13000, 2001, 4380), (13001, 2001, 4381),
(13002, 2001, 4382), (13003, 2001, 4383), (13004, 2001, 4384), (13005, 2001, 4385),
(13006, 2001, 4386), (13007, 2001, 4387);

-- 研发工程师（2002）：授予分组与菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(13008, 2002, 4360),
(13009, 2002, 4361), (13010, 2002, 4362), (13011, 2002, 4363), (13012, 2002, 4364),
(13013, 2002, 4365), (13014, 2002, 4366), (13015, 2002, 4367), (13016, 2002, 4368),
(13017, 2002, 4369),
(13018, 2002, 4370), (13019, 2002, 4372), (13020, 2002, 4374), (13021, 2002, 4376),
(13022, 2002, 4378), (13023, 2002, 4380), (13024, 2002, 4382), (13025, 2002, 4384),
(13026, 2002, 4386);

-- 质量工程师（2003）：授予分组与菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(13027, 2003, 4360),
(13028, 2003, 4361), (13029, 2003, 4362), (13030, 2003, 4363), (13031, 2003, 4364),
(13032, 2003, 4365), (13033, 2003, 4366), (13034, 2003, 4367), (13035, 2003, 4368),
(13036, 2003, 4369),
(13037, 2003, 4370), (13038, 2003, 4372), (13039, 2003, 4374), (13040, 2003, 4376),
(13041, 2003, 4378), (13042, 2003, 4380), (13043, 2003, 4382), (13044, 2003, 4384),
(13045, 2003, 4386);

-- 生产现场（2005）：授予分组与菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(13046, 2005, 4360),
(13047, 2005, 4361), (13048, 2005, 4362), (13049, 2005, 4363), (13050, 2005, 4364),
(13051, 2005, 4365), (13052, 2005, 4366), (13053, 2005, 4367), (13054, 2005, 4368),
(13055, 2005, 4369),
(13056, 2005, 4370), (13057, 2005, 4372), (13058, 2005, 4374), (13059, 2005, 4376),
(13060, 2005, 4378), (13061, 2005, 4380), (13062, 2005, 4382), (13063, 2005, 4384),
(13064, 2005, 4386);

-- 只读用户（2006）：授予分组与菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(13065, 2006, 4360),
(13066, 2006, 4361), (13067, 2006, 4362), (13068, 2006, 4363), (13069, 2006, 4364),
(13070, 2006, 4365), (13071, 2006, 4366), (13072, 2006, 4367), (13073, 2006, 4368),
(13074, 2006, 4369),
(13075, 2006, 4370), (13076, 2006, 4372), (13077, 2006, 4374), (13078, 2006, 4376),
(13079, 2006, 4378), (13080, 2006, 4380), (13081, 2006, 4382), (13082, 2006, 4384),
(13083, 2006, 4386);

-- 供应链专员（2004）：授予全部查询与维护按钮（18 项，不含分组与菜单）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(13084, 2004, 4370), (13085, 2004, 4371), (13086, 2004, 4372), (13087, 2004, 4373),
(13088, 2004, 4374), (13089, 2004, 4375), (13090, 2004, 4376), (13091, 2004, 4377),
(13092, 2004, 4378), (13093, 2004, 4379), (13094, 2004, 4380), (13095, 2004, 4381),
(13096, 2004, 4382), (13097, 2004, 4383), (13098, 2004, 4384), (13099, 2004, 4385),
(13100, 2004, 4386), (13101, 2004, 4387);

-- ========== ERP 委外管理字典（7720-7785） ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(7720, 'erp_outsource_order_type', '标准委外', 'STANDARD', 1, 1, NULL),
(7721, 'erp_outsource_order_type', '返工', 'REWORK', 2, 1, NULL),
(7722, 'erp_outsource_order_status', '草稿', 'DRAFT', 1, 1, NULL),
(7723, 'erp_outsource_order_status', '已提交', 'SUBMITTED', 2, 1, NULL),
(7724, 'erp_outsource_order_status', '已批准', 'APPROVED', 3, 1, NULL),
(7725, 'erp_outsource_order_status', '部分到货', 'PARTIAL_RECEIVED', 4, 1, NULL),
(7726, 'erp_outsource_order_status', '已到货', 'RECEIVED', 5, 1, NULL),
(7727, 'erp_outsource_order_status', '已关闭', 'CLOSED', 6, 1, NULL),
(7728, 'erp_outsource_order_status', '已取消', 'CANCELLED', 7, 1, NULL),
(7729, 'erp_outsource_line_status', '未到货', 'OPEN', 1, 1, NULL),
(7730, 'erp_outsource_line_status', '部分到货', 'PARTIAL', 2, 1, NULL),
(7731, 'erp_outsource_line_status', '已关闭', 'CLOSED', 3, 1, NULL),
(7732, 'erp_outsource_line_status', '已取消', 'CANCELLED', 4, 1, NULL),
(7733, 'erp_outsource_review_status', '待评审', 'PENDING', 1, 1, NULL),
(7734, 'erp_outsource_review_status', '已通过', 'PASSED', 2, 1, NULL),
(7735, 'erp_outsource_review_status', '未通过', 'FAILED', 3, 1, NULL),
(7736, 'erp_outsource_issue_status', '草稿', 'DRAFT', 1, 1, NULL),
(7737, 'erp_outsource_issue_status', '已确认', 'CONFIRMED', 2, 1, NULL),
(7738, 'erp_outsource_issue_status', '已过账', 'POSTED', 3, 1, NULL),
(7739, 'erp_outsource_issue_status', '已取消', 'CANCELLED', 4, 1, NULL),
(7740, 'erp_outsource_receipt_type', '正常到货', 'NORMAL', 1, 1, NULL),
(7741, 'erp_outsource_receipt_type', '退货到货', 'RETURN', 2, 1, NULL),
(7742, 'erp_outsource_receipt_type', '免费到货', 'FREE', 3, 1, NULL),
(7743, 'erp_outsource_receipt_status', '草稿', 'DRAFT', 1, 1, NULL),
(7744, 'erp_outsource_receipt_status', '已到货', 'RECEIVED', 2, 1, NULL),
(7745, 'erp_outsource_receipt_status', '检验中', 'INSPECTING', 3, 1, NULL),
(7746, 'erp_outsource_receipt_status', '已检验', 'INSPECTED', 4, 1, NULL),
(7747, 'erp_outsource_receipt_status', '已入库', 'INBOUND', 5, 1, NULL),
(7748, 'erp_outsource_receipt_status', '已关闭', 'CLOSED', 6, 1, NULL),
(7749, 'erp_outsource_receipt_status', '已取消', 'CANCELLED', 7, 1, NULL),
(7750, 'erp_outsource_inspection_type', '全检', 'FULL', 1, 1, NULL),
(7751, 'erp_outsource_inspection_type', '抽检', 'SAMPLE', 2, 1, NULL),
(7752, 'erp_outsource_inspection_type', '免检', 'EXEMPT', 3, 1, NULL),
(7753, 'erp_outsource_inspection_result', '待检验', 'PENDING', 1, 1, NULL),
(7754, 'erp_outsource_inspection_result', '合格', 'PASS', 2, 1, NULL),
(7755, 'erp_outsource_inspection_result', '不合格', 'FAIL', 3, 1, NULL),
(7756, 'erp_outsource_inspection_result', '让步接收', 'CONCESSION', 4, 1, NULL),
(7757, 'erp_outsource_inspection_status', '待检验', 'OPEN', 1, 1, NULL),
(7758, 'erp_outsource_inspection_status', '已关闭', 'CLOSED', 2, 1, NULL),
(7759, 'erp_outsource_inbound_status', '草稿', 'DRAFT', 1, 1, NULL),
(7760, 'erp_outsource_inbound_status', '已确认', 'CONFIRMED', 2, 1, NULL),
(7761, 'erp_outsource_inbound_status', '已过账', 'POSTED', 3, 1, NULL),
(7762, 'erp_outsource_inbound_status', '已取消', 'CANCELLED', 4, 1, NULL),
(7763, 'erp_outsource_invoice_type', '增值税专用发票', 'SPECIAL', 1, 1, NULL),
(7764, 'erp_outsource_invoice_type', '增值税普通发票', 'GENERAL', 2, 1, NULL),
(7765, 'erp_outsource_invoice_type', '运输发票', 'TRANSPORT', 3, 1, NULL),
(7766, 'erp_outsource_invoice_status', '草稿', 'DRAFT', 1, 1, NULL),
(7767, 'erp_outsource_invoice_status', '已收票', 'RECEIVED', 2, 1, NULL),
(7768, 'erp_outsource_invoice_status', '已认证', 'VERIFIED', 3, 1, NULL),
(7769, 'erp_outsource_invoice_status', '已过账', 'POSTED', 4, 1, NULL),
(7770, 'erp_outsource_invoice_status', '已红冲', 'RED_REVERSED', 5, 1, NULL),
(7771, 'erp_outsource_invoice_status', '已作废', 'CANCELLED', 6, 1, NULL),
(7772, 'erp_outsource_settlement_status', '未结算', 'OPEN', 1, 1, NULL),
(7773, 'erp_outsource_settlement_status', '部分结算', 'PARTIAL', 2, 1, NULL),
(7774, 'erp_outsource_settlement_status', '已结清', 'CLOSED', 3, 1, NULL),
(7775, 'erp_outsource_settlement_status', '已取消', 'CANCELLED', 4, 1, NULL),
(7776, 'erp_outsource_writeoff_status', '未核销', 'OPEN', 1, 1, NULL),
(7777, 'erp_outsource_writeoff_status', '部分核销', 'PARTIAL', 2, 1, NULL),
(7778, 'erp_outsource_writeoff_status', '已核销', 'CLOSED', 3, 1, NULL),
(7779, 'erp_outsource_writeoff_status', '已取消', 'CANCELLED', 4, 1, NULL),
(7780, 'erp_outsource_return_status', '草稿', 'DRAFT', 1, 1, NULL),
(7781, 'erp_outsource_return_status', '已提交', 'SUBMITTED', 2, 1, NULL),
(7782, 'erp_outsource_return_status', '已批准', 'APPROVED', 3, 1, NULL),
(7783, 'erp_outsource_return_status', '已退货', 'SHIPPED', 4, 1, NULL),
(7784, 'erp_outsource_return_status', '已关闭', 'CLOSED', 5, 1, NULL),
(7785, 'erp_outsource_return_status', '已取消', 'CANCELLED', 6, 1, NULL);

-- ========== ERP 委外管理可配置项（6210-6217） ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(6210, 'ERP', 'erp.outsource.enabled', 'ERP 委外管理启用开关', 'true', 0, 1, 'ERP 委外管理总开关，默认启用'),
(6211, 'ERP', 'erp.outsource.issue.required', '委外必须发料开关', 'true', 1, 1, '待业务方确认：委外订单是否必须先发料后方可到货'),
(6212, 'ERP', 'erp.outsource.inspection.required', '委外到货必须报检开关', 'true', 1, 1, '待业务方确认：委外到货是否必须报检（免检物料除外）'),
(6213, 'ERP', 'erp.outsource.default.currency', '委外默认币种', 'CNY', 0, 1, '新建委外订单未指定币种时采用的默认币种编码'),
(6214, 'ERP', 'erp.outsource.default.tax.rate', '委外默认税率(%)', '13', 1, 1, '待业务方确认：委外订单加工费默认税率（百分比）'),
(6215, 'ERP', 'erp.outsource.writeoff.tolerance.rate', '委外核销损耗容差(%)', '3', 1, 1, '待业务方确认：委外核销允许的材料损耗容差百分比'),
(6216, 'ERP', 'erp.outsource.settle.term.days', '委外默认结算账期(天)', '30', 1, 1, '待业务方确认：生成委外结算时的默认账期天数'),
(6217, 'ERP', 'erp.outsource.return.approval.required', '委外退货需审批', 'true', 1, 1, '待业务方确认：委外退货是否必须经审批后方可退货');
