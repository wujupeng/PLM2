-- G3-N2 ERP—销售管理（WBS T022 销售管理 / T092 销售订单到发货）初始化：菜单/按钮权限、角色授权、字典与可配置项。
-- 号段基线（V71 之后已占用的最大值）：sys_permission=4281（本脚本从 4290 起）、
-- sys_role_permission=12706（从 12710 起）、sys_dictionary=7536（从 7540 起）、sys_config=6176（从 6180 起）。
-- 菜单说明：销售管理为 ERP 顶级菜单（4260）下的二级分组（4290），其下挂 9 个业务单据页面；
--           客户/物料/币种/税率/仓库复用既有基础资料与平台底座，不在此重复定义。

-- ========== ERP 销售管理分组菜单（4290，挂在 ERP 顶级菜单 4260 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4290, 'erp:sales', '销售管理', 'menu', 4260, '/erp/sales', 'ShoppingCartOutlined', 20, 1);

-- ========== ERP 销售管理业务菜单（4291-4299，挂在销售管理 4290 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4291, 'erp:sales:forecast', '销售预测', 'menu', 4290, '/erp/sales/forecasts', 'LineChartOutlined', 1, 1),
(4292, 'erp:sales:order', '销售订单', 'menu', 4290, '/erp/sales/orders', 'FileTextOutlined', 2, 1),
(4293, 'erp:sales:orderchange', '订单变更', 'menu', 4290, '/erp/sales/order-changes', 'EditOutlined', 3, 1),
(4294, 'erp:sales:deliveryreview', '交期评审', 'menu', 4290, '/erp/sales/delivery-reviews', 'ScheduleOutlined', 4, 1),
(4295, 'erp:sales:delivery', '发货单', 'menu', 4290, '/erp/sales/deliveries', 'CarOutlined', 5, 1),
(4296, 'erp:sales:outbound', '销售出库', 'menu', 4290, '/erp/sales/outbounds', 'ExportOutlined', 6, 1),
(4297, 'erp:sales:return', '销售退货', 'menu', 4290, '/erp/sales/returns', 'RollbackOutlined', 7, 1),
(4298, 'erp:sales:invoice', '销售发票', 'menu', 4290, '/erp/sales/invoices', 'AccountBookOutlined', 8, 1),
(4299, 'erp:sales:receivable', '应收账款', 'menu', 4290, '/erp/sales/receivables', 'MoneyCollectOutlined', 9, 1);

-- ========== ERP 销售管理按钮（4300-4317） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4300, 'erp:sales:forecast:list', '查询销售预测', 'button', 4291, NULL, NULL, 1, 1),
(4301, 'erp:sales:forecast:manage', '维护销售预测', 'button', 4291, NULL, NULL, 2, 1),
(4302, 'erp:sales:order:list', '查询销售订单', 'button', 4292, NULL, NULL, 1, 1),
(4303, 'erp:sales:order:manage', '维护销售订单', 'button', 4292, NULL, NULL, 2, 1),
(4304, 'erp:sales:orderchange:list', '查询订单变更', 'button', 4293, NULL, NULL, 1, 1),
(4305, 'erp:sales:orderchange:manage', '维护订单变更', 'button', 4293, NULL, NULL, 2, 1),
(4306, 'erp:sales:deliveryreview:list', '查询交期评审', 'button', 4294, NULL, NULL, 1, 1),
(4307, 'erp:sales:deliveryreview:manage', '维护交期评审', 'button', 4294, NULL, NULL, 2, 1),
(4308, 'erp:sales:delivery:list', '查询发货单', 'button', 4295, NULL, NULL, 1, 1),
(4309, 'erp:sales:delivery:manage', '维护发货单', 'button', 4295, NULL, NULL, 2, 1),
(4310, 'erp:sales:outbound:list', '查询销售出库', 'button', 4296, NULL, NULL, 1, 1),
(4311, 'erp:sales:outbound:manage', '维护销售出库', 'button', 4296, NULL, NULL, 2, 1),
(4312, 'erp:sales:return:list', '查询销售退货', 'button', 4297, NULL, NULL, 1, 1),
(4313, 'erp:sales:return:manage', '维护销售退货', 'button', 4297, NULL, NULL, 2, 1),
(4314, 'erp:sales:invoice:list', '查询销售发票', 'button', 4298, NULL, NULL, 1, 1),
(4315, 'erp:sales:invoice:manage', '维护销售发票', 'button', 4298, NULL, NULL, 2, 1),
(4316, 'erp:sales:receivable:list', '查询应收账款', 'button', 4299, NULL, NULL, 1, 1),
(4317, 'erp:sales:receivable:manage', '维护应收账款', 'button', 4299, NULL, NULL, 2, 1);

-- ========== 角色授权 ==========

-- 管理员（2001）：授予 ERP 销售管理全部权限（1 分组 + 9 菜单 + 18 按钮）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(12710, 2001, 4290),
(12711, 2001, 4291), (12712, 2001, 4292), (12713, 2001, 4293), (12714, 2001, 4294),
(12715, 2001, 4295), (12716, 2001, 4296), (12717, 2001, 4297), (12718, 2001, 4298),
(12719, 2001, 4299),
(12720, 2001, 4300), (12721, 2001, 4301), (12722, 2001, 4302), (12723, 2001, 4303),
(12724, 2001, 4304), (12725, 2001, 4305), (12726, 2001, 4306), (12727, 2001, 4307),
(12728, 2001, 4308), (12729, 2001, 4309), (12730, 2001, 4310), (12731, 2001, 4311),
(12732, 2001, 4312), (12733, 2001, 4313), (12734, 2001, 4314), (12735, 2001, 4315),
(12736, 2001, 4316), (12737, 2001, 4317);

-- 研发工程师（2002）：全部分组与菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(12738, 2002, 4290),
(12739, 2002, 4291), (12740, 2002, 4292), (12741, 2002, 4293), (12742, 2002, 4294),
(12743, 2002, 4295), (12744, 2002, 4296), (12745, 2002, 4297), (12746, 2002, 4298),
(12747, 2002, 4299),
(12748, 2002, 4300), (12749, 2002, 4302), (12750, 2002, 4304), (12751, 2002, 4306),
(12752, 2002, 4308), (12753, 2002, 4310), (12754, 2002, 4312), (12755, 2002, 4314),
(12756, 2002, 4316);

-- 质量工程师（2003）：全部分组与菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(12757, 2003, 4290),
(12758, 2003, 4291), (12759, 2003, 4292), (12760, 2003, 4293), (12761, 2003, 4294),
(12762, 2003, 4295), (12763, 2003, 4296), (12764, 2003, 4297), (12765, 2003, 4298),
(12766, 2003, 4299),
(12767, 2003, 4300), (12768, 2003, 4302), (12769, 2003, 4304), (12770, 2003, 4306),
(12771, 2003, 4308), (12772, 2003, 4310), (12773, 2003, 4312), (12774, 2003, 4314),
(12775, 2003, 4316);

-- 供应链专员（2004）：全部分组与菜单 + 全部业务按钮（销售为供应链核心职责）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(12776, 2004, 4290),
(12777, 2004, 4291), (12778, 2004, 4292), (12779, 2004, 4293), (12780, 2004, 4294),
(12781, 2004, 4295), (12782, 2004, 4296), (12783, 2004, 4297), (12784, 2004, 4298),
(12785, 2004, 4299),
(12786, 2004, 4300), (12787, 2004, 4301), (12788, 2004, 4302), (12789, 2004, 4303),
(12790, 2004, 4304), (12791, 2004, 4305), (12792, 2004, 4306), (12793, 2004, 4307),
(12794, 2004, 4308);

-- 生产现场（2005）：全部分组与菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(12795, 2005, 4290),
(12796, 2005, 4291), (12797, 2005, 4292), (12798, 2005, 4293), (12799, 2005, 4294),
(12800, 2005, 4295), (12801, 2005, 4296), (12802, 2005, 4297), (12803, 2005, 4298),
(12804, 2005, 4299),
(12805, 2005, 4300), (12806, 2005, 4302), (12807, 2005, 4304), (12808, 2005, 4306),
(12809, 2005, 4308), (12810, 2005, 4310), (12811, 2005, 4312), (12812, 2005, 4314),
(12813, 2005, 4316);

-- 只读用户（2006）：全部分组与菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(12814, 2006, 4290),
(12815, 2006, 4291), (12816, 2006, 4292), (12817, 2006, 4293), (12818, 2006, 4294),
(12819, 2006, 4295), (12820, 2006, 4296), (12821, 2006, 4297), (12822, 2006, 4298),
(12823, 2006, 4299),
(12824, 2006, 4300), (12825, 2006, 4302), (12826, 2006, 4304), (12827, 2006, 4306),
(12828, 2006, 4308), (12829, 2006, 4310), (12830, 2006, 4312), (12831, 2006, 4314),
(12832, 2006, 4316);

-- ========== ERP 销售管理字典（7540-7611） ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(7540, 'erp_forecast_type', '月度', 'MONTHLY', 1, 1, NULL),
(7541, 'erp_forecast_type', '周度', 'WEEKLY', 2, 1, NULL),
(7542, 'erp_forecast_type', '季度', 'QUARTERLY', 3, 1, NULL),
(7543, 'erp_forecast_status', '未确认', 'OPEN', 1, 1, NULL),
(7544, 'erp_forecast_status', '已确认', 'CONFIRMED', 2, 1, NULL),
(7545, 'erp_forecast_status', '已关闭', 'CLOSED', 3, 1, NULL),
(7546, 'erp_sales_order_type', '标准订单', 'STANDARD', 1, 1, NULL),
(7547, 'erp_sales_order_type', '紧急订单', 'URGENT', 2, 1, NULL),
(7548, 'erp_sales_order_type', '样品订单', 'SAMPLE', 3, 1, NULL),
(7549, 'erp_sales_order_status', '草稿', 'DRAFT', 1, 1, NULL),
(7550, 'erp_sales_order_status', '已提交', 'SUBMITTED', 2, 1, NULL),
(7551, 'erp_sales_order_status', '评审中', 'REVIEWING', 3, 1, NULL),
(7552, 'erp_sales_order_status', '已确认', 'CONFIRMED', 4, 1, NULL),
(7553, 'erp_sales_order_status', '部分发货', 'PARTIAL_DELIVERED', 5, 1, NULL),
(7554, 'erp_sales_order_status', '已发货', 'DELIVERED', 6, 1, NULL),
(7555, 'erp_sales_order_status', '已关闭', 'CLOSED', 7, 1, NULL),
(7556, 'erp_sales_order_status', '已取消', 'CANCELLED', 8, 1, NULL),
(7557, 'erp_credit_status', '正常', 'OK', 1, 1, NULL),
(7558, 'erp_credit_status', '信用冻结', 'HOLD', 2, 1, NULL),
(7559, 'erp_credit_status', '已释放', 'RELEASED', 3, 1, NULL),
(7560, 'erp_review_status', '待评审', 'PENDING', 1, 1, NULL),
(7561, 'erp_review_status', '已通过', 'PASSED', 2, 1, NULL),
(7562, 'erp_review_status', '未通过', 'FAILED', 3, 1, NULL),
(7563, 'erp_order_line_status', '未发货', 'OPEN', 1, 1, NULL),
(7564, 'erp_order_line_status', '部分发货', 'PARTIAL', 2, 1, NULL),
(7565, 'erp_order_line_status', '已关闭', 'CLOSED', 3, 1, NULL),
(7566, 'erp_order_line_status', '已取消', 'CANCELLED', 4, 1, NULL),
(7567, 'erp_change_type', '数量变更', 'QUANTITY', 1, 1, NULL),
(7568, 'erp_change_type', '交期变更', 'DATE', 2, 1, NULL),
(7569, 'erp_change_type', '价格变更', 'PRICE', 3, 1, NULL),
(7570, 'erp_change_type', '取消', 'CANCEL', 4, 1, NULL),
(7571, 'erp_change_status', '草稿', 'DRAFT', 1, 1, NULL),
(7572, 'erp_change_status', '已提交', 'SUBMITTED', 2, 1, NULL),
(7573, 'erp_change_status', '已批准', 'APPROVED', 3, 1, NULL),
(7574, 'erp_change_status', '已驳回', 'REJECTED', 4, 1, NULL),
(7575, 'erp_change_status', '已生效', 'EFFECTIVE', 5, 1, NULL),
(7576, 'erp_review_result', '待评审', 'PENDING', 1, 1, NULL),
(7577, 'erp_review_result', '通过', 'PASS', 2, 1, NULL),
(7578, 'erp_review_result', '不通过', 'FAIL', 3, 1, NULL),
(7579, 'erp_review_result', '需调整', 'ADJUST', 4, 1, NULL),
(7580, 'erp_review_record_status', '待处理', 'OPEN', 1, 1, NULL),
(7581, 'erp_review_record_status', '已关闭', 'CLOSED', 2, 1, NULL),
(7582, 'erp_delivery_type', '正常发货', 'NORMAL', 1, 1, NULL),
(7583, 'erp_delivery_type', '分批发货', 'PARTIAL', 2, 1, NULL),
(7584, 'erp_delivery_type', '退货发货', 'RETURN', 3, 1, NULL),
(7585, 'erp_delivery_status', '草稿', 'DRAFT', 1, 1, NULL),
(7586, 'erp_delivery_status', '已确认', 'CONFIRMED', 2, 1, NULL),
(7587, 'erp_delivery_status', '已发运', 'SHIPPED', 3, 1, NULL),
(7588, 'erp_delivery_status', '已签收', 'RECEIVED', 4, 1, NULL),
(7589, 'erp_delivery_status', '已取消', 'CANCELLED', 5, 1, NULL),
(7590, 'erp_outbound_status', '草稿', 'DRAFT', 1, 1, NULL),
(7591, 'erp_outbound_status', '已确认', 'CONFIRMED', 2, 1, NULL),
(7592, 'erp_outbound_status', '已过账', 'POSTED', 3, 1, NULL),
(7593, 'erp_outbound_status', '已取消', 'CANCELLED', 4, 1, NULL),
(7594, 'erp_return_status', '草稿', 'DRAFT', 1, 1, NULL),
(7595, 'erp_return_status', '已提交', 'SUBMITTED', 2, 1, NULL),
(7596, 'erp_return_status', '已批准', 'APPROVED', 3, 1, NULL),
(7597, 'erp_return_status', '已收货', 'RECEIVED', 4, 1, NULL),
(7598, 'erp_return_status', '已关闭', 'CLOSED', 5, 1, NULL),
(7599, 'erp_return_status', '已取消', 'CANCELLED', 6, 1, NULL),
(7600, 'erp_invoice_type', '增值税专用发票', 'SPECIAL', 1, 1, NULL),
(7601, 'erp_invoice_type', '增值税普通发票', 'GENERAL', 2, 1, NULL),
(7602, 'erp_invoice_type', '出口发票', 'EXPORT', 3, 1, NULL),
(7603, 'erp_invoice_status', '草稿', 'DRAFT', 1, 1, NULL),
(7604, 'erp_invoice_status', '已开具', 'ISSUED', 2, 1, NULL),
(7605, 'erp_invoice_status', '已过账', 'POSTED', 3, 1, NULL),
(7606, 'erp_invoice_status', '已红冲', 'RED_REVERSED', 4, 1, NULL),
(7607, 'erp_invoice_status', '已作废', 'CANCELLED', 5, 1, NULL),
(7608, 'erp_ar_status', '未收款', 'OPEN', 1, 1, NULL),
(7609, 'erp_ar_status', '部分收款', 'PARTIAL', 2, 1, NULL),
(7610, 'erp_ar_status', '已结清', 'CLOSED', 3, 1, NULL),
(7611, 'erp_ar_status', '已逾期', 'OVERDUE', 4, 1, NULL);

-- ========== ERP 销售管理可配置项（6180-6187） ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(6180, 'ERP', 'erp.sales.enabled', 'ERP 销售管理启用开关', 'true', 0, 1, 'ERP 销售管理总开关，默认启用'),
(6181, 'ERP', 'erp.sales.credit.check.enabled', '销售订单信用校验开关', 'true', 1, 1, '待业务方确认：销售订单是否强制校验客户信用额度与账期'),
(6182, 'ERP', 'erp.sales.delivery.review.required', '交期评审必填开关', 'true', 1, 1, '待业务方确认：销售订单确认前是否必须完成交期评审'),
(6183, 'ERP', 'erp.sales.partial.delivery.allowed', '允许分批交付', 'true', 0, 1, '是否允许同一销售订单分多次发货与出库'),
(6184, 'ERP', 'erp.sales.default.currency', '销售默认币种', 'CNY', 0, 1, '新建销售订单未指定币种时采用的默认币种编码'),
(6185, 'ERP', 'erp.sales.default.tax.rate', '销售默认税率(%)', '13', 1, 1, '待业务方确认：销售订单默认税率（百分比）'),
(6186, 'ERP', 'erp.sales.return.approval.required', '退货需审批', 'true', 1, 1, '待业务方确认：销售退货是否必须经审批后方可收货'),
(6187, 'ERP', 'erp.sales.receivable.credit.days', '默认应收账期(天)', '30', 1, 1, '待业务方确认：生成应收账款时的默认账期天数');
