-- G3-N3a ERP—采购管理（WBS T023 采购管理 / T093 采购到货入库）初始化：菜单/按钮权限、角色授权、字典与可配置项。
-- 号段基线（V73 之后已占用的最大值）：sys_permission=4317（本脚本从 4320 起）、
-- sys_role_permission=12832（从 12840 起）、sys_dictionary=7611（从 7620 起）、sys_config=6187（从 6190 起）。
-- 菜单说明：采购管理为 ERP 顶级菜单（4260）下的二级分组（4320），其下挂 9 个业务单据页面；
--           供应商/物料/币种/税率/仓库复用既有基础资料与平台底座，不在此重复定义。

-- ========== ERP 采购管理分组菜单（4320，挂在 ERP 顶级菜单 4260 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4320, 'erp:purchase', '采购管理', 'menu', 4260, '/erp/purchase', 'ShoppingOutlined', 21, 1);

-- ========== ERP 采购管理业务菜单（4321-4329，挂在采购管理 4320 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4321, 'erp:purchase:requisition', '请购单', 'menu', 4320, '/erp/purchase/requisitions', 'FileAddOutlined', 1, 1),
(4322, 'erp:purchase:inquiry', '询价单', 'menu', 4320, '/erp/purchase/inquiries', 'SearchOutlined', 2, 1),
(4323, 'erp:purchase:order', '采购订单', 'menu', 4320, '/erp/purchase/orders', 'FileTextOutlined', 3, 1),
(4324, 'erp:purchase:receipt', '到货单', 'menu', 4320, '/erp/purchase/receipts', 'InboxOutlined', 4, 1),
(4325, 'erp:purchase:inspection', '采购报检', 'menu', 4320, '/erp/purchase/inspections', 'SafetyCertificateOutlined', 5, 1),
(4326, 'erp:purchase:inbound', '采购入库', 'menu', 4320, '/erp/purchase/inbounds', 'ImportOutlined', 6, 1),
(4327, 'erp:purchase:invoice', '采购发票', 'menu', 4320, '/erp/purchase/invoices', 'AccountBookOutlined', 7, 1),
(4328, 'erp:purchase:return', '采购退货', 'menu', 4320, '/erp/purchase/returns', 'RollbackOutlined', 8, 1),
(4329, 'erp:purchase:settlement', '采购结算', 'menu', 4320, '/erp/purchase/settlements', 'MoneyCollectOutlined', 9, 1);

-- ========== ERP 采购管理按钮（4330-4347） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4330, 'erp:purchase:requisition:list', '查询请购单', 'button', 4321, NULL, NULL, 1, 1),
(4331, 'erp:purchase:requisition:manage', '维护请购单', 'button', 4321, NULL, NULL, 2, 1),
(4332, 'erp:purchase:inquiry:list', '查询询价单', 'button', 4322, NULL, NULL, 1, 1),
(4333, 'erp:purchase:inquiry:manage', '维护询价单', 'button', 4322, NULL, NULL, 2, 1),
(4334, 'erp:purchase:order:list', '查询采购订单', 'button', 4323, NULL, NULL, 1, 1),
(4335, 'erp:purchase:order:manage', '维护采购订单', 'button', 4323, NULL, NULL, 2, 1),
(4336, 'erp:purchase:receipt:list', '查询到货单', 'button', 4324, NULL, NULL, 1, 1),
(4337, 'erp:purchase:receipt:manage', '维护到货单', 'button', 4324, NULL, NULL, 2, 1),
(4338, 'erp:purchase:inspection:list', '查询采购报检', 'button', 4325, NULL, NULL, 1, 1),
(4339, 'erp:purchase:inspection:manage', '维护采购报检', 'button', 4325, NULL, NULL, 2, 1),
(4340, 'erp:purchase:inbound:list', '查询采购入库', 'button', 4326, NULL, NULL, 1, 1),
(4341, 'erp:purchase:inbound:manage', '维护采购入库', 'button', 4326, NULL, NULL, 2, 1),
(4342, 'erp:purchase:invoice:list', '查询采购发票', 'button', 4327, NULL, NULL, 1, 1),
(4343, 'erp:purchase:invoice:manage', '维护采购发票', 'button', 4327, NULL, NULL, 2, 1),
(4344, 'erp:purchase:return:list', '查询采购退货', 'button', 4328, NULL, NULL, 1, 1),
(4345, 'erp:purchase:return:manage', '维护采购退货', 'button', 4328, NULL, NULL, 2, 1),
(4346, 'erp:purchase:settlement:list', '查询采购结算', 'button', 4329, NULL, NULL, 1, 1),
(4347, 'erp:purchase:settlement:manage', '维护采购结算', 'button', 4329, NULL, NULL, 2, 1);

-- ========== 角色授权 ==========

-- 管理员（2001）：授予 ERP 采购管理全部权限（1 分组 + 9 菜单 + 18 按钮）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(12840, 2001, 4320),
(12841, 2001, 4321), (12842, 2001, 4322), (12843, 2001, 4323), (12844, 2001, 4324),
(12845, 2001, 4325), (12846, 2001, 4326), (12847, 2001, 4327), (12848, 2001, 4328),
(12849, 2001, 4329),
(12850, 2001, 4330), (12851, 2001, 4331), (12852, 2001, 4332), (12853, 2001, 4333),
(12854, 2001, 4334), (12855, 2001, 4335), (12856, 2001, 4336), (12857, 2001, 4337),
(12858, 2001, 4338), (12859, 2001, 4339), (12860, 2001, 4340), (12861, 2001, 4341),
(12862, 2001, 4342), (12863, 2001, 4343), (12864, 2001, 4344), (12865, 2001, 4345),
(12866, 2001, 4346), (12867, 2001, 4347);

-- 研发工程师（2002）：全部分组与菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(12868, 2002, 4320),
(12869, 2002, 4321), (12870, 2002, 4322), (12871, 2002, 4323), (12872, 2002, 4324),
(12873, 2002, 4325), (12874, 2002, 4326), (12875, 2002, 4327), (12876, 2002, 4328),
(12877, 2002, 4329),
(12878, 2002, 4330), (12879, 2002, 4332), (12880, 2002, 4334), (12881, 2002, 4336),
(12882, 2002, 4338), (12883, 2002, 4340), (12884, 2002, 4342), (12885, 2002, 4344),
(12886, 2002, 4346);

-- 质量工程师（2003）：全部分组与菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(12887, 2003, 4320),
(12888, 2003, 4321), (12889, 2003, 4322), (12890, 2003, 4323), (12891, 2003, 4324),
(12892, 2003, 4325), (12893, 2003, 4326), (12894, 2003, 4327), (12895, 2003, 4328),
(12896, 2003, 4329),
(12897, 2003, 4330), (12898, 2003, 4332), (12899, 2003, 4334), (12900, 2003, 4336),
(12901, 2003, 4338), (12902, 2003, 4340), (12903, 2003, 4342), (12904, 2003, 4344),
(12905, 2003, 4346);

-- 生产现场（2005）：全部分组与菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(12906, 2005, 4320),
(12907, 2005, 4321), (12908, 2005, 4322), (12909, 2005, 4323), (12910, 2005, 4324),
(12911, 2005, 4325), (12912, 2005, 4326), (12913, 2005, 4327), (12914, 2005, 4328),
(12915, 2005, 4329),
(12916, 2005, 4330), (12917, 2005, 4332), (12918, 2005, 4334), (12919, 2005, 4336),
(12920, 2005, 4338), (12921, 2005, 4340), (12922, 2005, 4342), (12923, 2005, 4344),
(12924, 2005, 4346);

-- 只读用户（2006）：全部分组与菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(12925, 2006, 4320),
(12926, 2006, 4321), (12927, 2006, 4322), (12928, 2006, 4323), (12929, 2006, 4324),
(12930, 2006, 4325), (12931, 2006, 4326), (12932, 2006, 4327), (12933, 2006, 4328),
(12934, 2006, 4329),
(12935, 2006, 4330), (12936, 2006, 4332), (12937, 2006, 4334), (12938, 2006, 4336),
(12939, 2006, 4338), (12940, 2006, 4340), (12941, 2006, 4342), (12942, 2006, 4344),
(12943, 2006, 4346);

-- 供应链专员（2004）：授予全部查询与维护按钮（18 项，不含分组与菜单）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(12944, 2004, 4330), (12945, 2004, 4331), (12946, 2004, 4332), (12947, 2004, 4333),
(12948, 2004, 4334), (12949, 2004, 4335), (12950, 2004, 4336), (12951, 2004, 4337),
(12952, 2004, 4338), (12953, 2004, 4339), (12954, 2004, 4340), (12955, 2004, 4341),
(12956, 2004, 4342), (12957, 2004, 4343), (12958, 2004, 4344), (12959, 2004, 4345),
(12960, 2004, 4346), (12961, 2004, 4347);

-- ========== ERP 采购管理字典（7620-7698） ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(7620, 'erp_requisition_type', '普通请购', 'NORMAL', 1, 1, NULL),
(7621, 'erp_requisition_type', '紧急请购', 'URGENT', 2, 1, NULL),
(7622, 'erp_requisition_type', '项目请购', 'PROJECT', 3, 1, NULL),
(7623, 'erp_requisition_status', '草稿', 'DRAFT', 1, 1, NULL),
(7624, 'erp_requisition_status', '已提交', 'SUBMITTED', 2, 1, NULL),
(7625, 'erp_requisition_status', '已批准', 'APPROVED', 3, 1, NULL),
(7626, 'erp_requisition_status', '已转采购', 'CONVERTED', 4, 1, NULL),
(7627, 'erp_requisition_status', '已关闭', 'CLOSED', 5, 1, NULL),
(7628, 'erp_requisition_status', '已取消', 'CANCELLED', 6, 1, NULL),
(7629, 'erp_req_line_status', '未采购', 'OPEN', 1, 1, NULL),
(7630, 'erp_req_line_status', '部分采购', 'PARTIAL', 2, 1, NULL),
(7631, 'erp_req_line_status', '已关闭', 'CLOSED', 3, 1, NULL),
(7632, 'erp_req_line_status', '已取消', 'CANCELLED', 4, 1, NULL),
(7633, 'erp_purchase_source_type', '手工', 'MANUAL', 1, 1, NULL),
(7634, 'erp_purchase_source_type', 'MRP运算', 'MRP', 2, 1, NULL),
(7635, 'erp_purchase_source_type', '销售驱动', 'SALES', 3, 1, NULL),
(7636, 'erp_inquiry_status', '草稿', 'DRAFT', 1, 1, NULL),
(7637, 'erp_inquiry_status', '已发出', 'SENT', 2, 1, NULL),
(7638, 'erp_inquiry_status', '已报价', 'QUOTED', 3, 1, NULL),
(7639, 'erp_inquiry_status', '比价完成', 'COMPARED', 4, 1, NULL),
(7640, 'erp_inquiry_status', '已转订单', 'CONVERTED', 5, 1, NULL),
(7641, 'erp_inquiry_status', '已关闭', 'CLOSED', 6, 1, NULL),
(7642, 'erp_purchase_order_type', '标准采购', 'STANDARD', 1, 1, NULL),
(7643, 'erp_purchase_order_type', '紧急采购', 'URGENT', 2, 1, NULL),
(7644, 'erp_purchase_order_type', '寄售', 'CONSIGN', 3, 1, NULL),
(7645, 'erp_purchase_order_type', '委外', 'SUBCONTRACT', 4, 1, NULL),
(7646, 'erp_purchase_order_status', '草稿', 'DRAFT', 1, 1, NULL),
(7647, 'erp_purchase_order_status', '已提交', 'SUBMITTED', 2, 1, NULL),
(7648, 'erp_purchase_order_status', '已批准', 'APPROVED', 3, 1, NULL),
(7649, 'erp_purchase_order_status', '部分到货', 'PARTIAL_RECEIVED', 4, 1, NULL),
(7650, 'erp_purchase_order_status', '已到货', 'RECEIVED', 5, 1, NULL),
(7651, 'erp_purchase_order_status', '已关闭', 'CLOSED', 6, 1, NULL),
(7652, 'erp_purchase_order_status', '已取消', 'CANCELLED', 7, 1, NULL),
(7653, 'erp_po_line_status', '未到货', 'OPEN', 1, 1, NULL),
(7654, 'erp_po_line_status', '部分到货', 'PARTIAL', 2, 1, NULL),
(7655, 'erp_po_line_status', '已关闭', 'CLOSED', 3, 1, NULL),
(7656, 'erp_po_line_status', '已取消', 'CANCELLED', 4, 1, NULL),
(7657, 'erp_receipt_type', '正常到货', 'NORMAL', 1, 1, NULL),
(7658, 'erp_receipt_type', '退货到货', 'RETURN', 2, 1, NULL),
(7659, 'erp_receipt_type', '免费到货', 'FREE', 3, 1, NULL),
(7660, 'erp_receipt_status', '草稿', 'DRAFT', 1, 1, NULL),
(7661, 'erp_receipt_status', '已到货', 'RECEIVED', 2, 1, NULL),
(7662, 'erp_receipt_status', '检验中', 'INSPECTING', 3, 1, NULL),
(7663, 'erp_receipt_status', '已检验', 'INSPECTED', 4, 1, NULL),
(7664, 'erp_receipt_status', '已入库', 'INBOUND', 5, 1, NULL),
(7665, 'erp_receipt_status', '已关闭', 'CLOSED', 6, 1, NULL),
(7666, 'erp_receipt_status', '已取消', 'CANCELLED', 7, 1, NULL),
(7667, 'erp_inspection_result', '待检验', 'PENDING', 1, 1, NULL),
(7668, 'erp_inspection_result', '合格', 'PASS', 2, 1, NULL),
(7669, 'erp_inspection_result', '不合格', 'FAIL', 3, 1, NULL),
(7670, 'erp_inspection_result', '让步接收', 'CONCESSION', 4, 1, NULL),
(7671, 'erp_purchase_inspection_type', '全检', 'FULL', 1, 1, NULL),
(7672, 'erp_purchase_inspection_type', '抽检', 'SAMPLE', 2, 1, NULL),
(7673, 'erp_purchase_inspection_type', '免检', 'EXEMPT', 3, 1, NULL),
(7674, 'erp_purchase_inspection_status', '待检验', 'OPEN', 1, 1, NULL),
(7675, 'erp_purchase_inspection_status', '已关闭', 'CLOSED', 2, 1, NULL),
(7676, 'erp_purchase_inbound_status', '草稿', 'DRAFT', 1, 1, NULL),
(7677, 'erp_purchase_inbound_status', '已确认', 'CONFIRMED', 2, 1, NULL),
(7678, 'erp_purchase_inbound_status', '已过账', 'POSTED', 3, 1, NULL),
(7679, 'erp_purchase_inbound_status', '已取消', 'CANCELLED', 4, 1, NULL),
(7680, 'erp_purchase_invoice_type', '增值税专用发票', 'SPECIAL', 1, 1, NULL),
(7681, 'erp_purchase_invoice_type', '增值税普通发票', 'GENERAL', 2, 1, NULL),
(7682, 'erp_purchase_invoice_type', '运输发票', 'TRANSPORT', 3, 1, NULL),
(7683, 'erp_purchase_invoice_status', '草稿', 'DRAFT', 1, 1, NULL),
(7684, 'erp_purchase_invoice_status', '已收票', 'RECEIVED', 2, 1, NULL),
(7685, 'erp_purchase_invoice_status', '已认证', 'VERIFIED', 3, 1, NULL),
(7686, 'erp_purchase_invoice_status', '已过账', 'POSTED', 4, 1, NULL),
(7687, 'erp_purchase_invoice_status', '已红冲', 'RED_REVERSED', 5, 1, NULL),
(7688, 'erp_purchase_invoice_status', '已作废', 'CANCELLED', 6, 1, NULL),
(7689, 'erp_purchase_return_status', '草稿', 'DRAFT', 1, 1, NULL),
(7690, 'erp_purchase_return_status', '已提交', 'SUBMITTED', 2, 1, NULL),
(7691, 'erp_purchase_return_status', '已批准', 'APPROVED', 3, 1, NULL),
(7692, 'erp_purchase_return_status', '已退货', 'SHIPPED', 4, 1, NULL),
(7693, 'erp_purchase_return_status', '已关闭', 'CLOSED', 5, 1, NULL),
(7694, 'erp_purchase_return_status', '已取消', 'CANCELLED', 6, 1, NULL),
(7695, 'erp_purchase_settlement_status', '未结算', 'OPEN', 1, 1, NULL),
(7696, 'erp_purchase_settlement_status', '部分结算', 'PARTIAL', 2, 1, NULL),
(7697, 'erp_purchase_settlement_status', '已结清', 'CLOSED', 3, 1, NULL),
(7698, 'erp_purchase_settlement_status', '已取消', 'CANCELLED', 4, 1, NULL);

-- ========== ERP 采购管理可配置项（6190-6197） ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(6190, 'ERP', 'erp.purchase.enabled', 'ERP 采购管理启用开关', 'true', 0, 1, 'ERP 采购管理总开关，默认启用'),
(6191, 'ERP', 'erp.purchase.inquiry.required', '必须询价开关', 'true', 1, 1, '待业务方确认：采购订单是否必须经过询价/比价流程'),
(6192, 'ERP', 'erp.purchase.inspection.required', '到货必须报检开关', 'true', 1, 1, '待业务方确认：到货是否必须报检（免检物料除外）'),
(6193, 'ERP', 'erp.purchase.receipt.tolerance.rate', '到货超收容差(%)', '5', 1, 1, '待业务方确认：到货数量允许超出采购订单数量的容差百分比'),
(6194, 'ERP', 'erp.purchase.default.currency', '采购默认币种', 'CNY', 0, 1, '新建采购订单未指定币种时采用的默认币种编码'),
(6195, 'ERP', 'erp.purchase.default.tax.rate', '采购默认税率(%)', '13', 1, 1, '待业务方确认：采购订单默认税率（百分比）'),
(6196, 'ERP', 'erp.purchase.settle.term.days', '默认结算账期(天)', '30', 1, 1, '待业务方确认：生成采购结算时的默认账期天数'),
(6197, 'ERP', 'erp.purchase.return.approval.required', '采购退货需审批', 'true', 1, 1, '待业务方确认：采购退货是否必须经审批后方可退货');
