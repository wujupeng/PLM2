-- G3-N6 ERP—财务（WBS T028 财务业务接口）初始化：菜单/按钮权限、角色授权、字典与可配置项。
-- 号段基线（V83 之后已占用的最大值）：sys_permission=4454（本脚本从 4460 起）、
-- sys_role_permission=13388（从 13400 起）、sys_dictionary=7952（从 7970 起）、sys_config=6259（从 6270 起）。
-- 菜单说明：ERP 财务为 ERP 顶级菜单（4260）下的二级分组（4460），其下挂 11 个财务核算页面；
--           币种/税率/汇率/法人/工厂/组织复用既有平台底座与基础资料，不在此重复定义。

-- ========== ERP 财务分组菜单（4460，挂在 ERP 顶级菜单 4260 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4460, 'erp:finance', '财务核算', 'menu', 4260, '/erp/finance', 'AccountBookOutlined', 26, 1);

-- ========== ERP 财务业务菜单（4461-4471，挂在财务核算 4460 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4461, 'erp:finance:account', '会计科目', 'menu', 4460, '/erp/finance/accounts', 'ProfileOutlined', 1, 1),
(4462, 'erp:finance:period', '会计期间', 'menu', 4460, '/erp/finance/periods', 'CalendarOutlined', 2, 1),
(4463, 'erp:finance:voucher', '记账凭证', 'menu', 4460, '/erp/finance/vouchers', 'FileTextOutlined', 3, 1),
(4464, 'erp:finance:receivable', '应收单', 'menu', 4460, '/erp/finance/receivables', 'ImportOutlined', 4, 1),
(4465, 'erp:finance:payable', '应付单', 'menu', 4460, '/erp/finance/payables', 'ExportOutlined', 5, 1),
(4466, 'erp:finance:payment', '收付款单', 'menu', 4460, '/erp/finance/payments', 'TransactionOutlined', 6, 1),
(4467, 'erp:finance:writeoff', '核销单', 'menu', 4460, '/erp/finance/writeoffs', 'ReconciliationOutlined', 7, 1),
(4468, 'erp:finance:invoice', '发票登记', 'menu', 4460, '/erp/finance/invoices', 'ContainerOutlined', 8, 1),
(4469, 'erp:finance:bank-statement', '银行对账', 'menu', 4460, '/erp/finance/bank-statements', 'BankOutlined', 9, 1),
(4470, 'erp:finance:cost-collection', '成本归集', 'menu', 4460, '/erp/finance/cost-collections', 'FundProjectionScreenOutlined', 10, 1),
(4471, 'erp:finance:accrual', '暂估', 'menu', 4460, '/erp/finance/accruals', 'FieldTimeOutlined', 11, 1);

-- ========== ERP 财务按钮（4472-4493） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4472, 'erp:finance:account:list', '查询会计科目', 'button', 4461, NULL, NULL, 1, 1),
(4473, 'erp:finance:account:manage', '维护会计科目', 'button', 4461, NULL, NULL, 2, 1),
(4474, 'erp:finance:period:list', '查询会计期间', 'button', 4462, NULL, NULL, 1, 1),
(4475, 'erp:finance:period:manage', '维护会计期间', 'button', 4462, NULL, NULL, 2, 1),
(4476, 'erp:finance:voucher:list', '查询记账凭证', 'button', 4463, NULL, NULL, 1, 1),
(4477, 'erp:finance:voucher:manage', '维护记账凭证', 'button', 4463, NULL, NULL, 2, 1),
(4478, 'erp:finance:receivable:list', '查询应收单', 'button', 4464, NULL, NULL, 1, 1),
(4479, 'erp:finance:receivable:manage', '维护应收单', 'button', 4464, NULL, NULL, 2, 1),
(4480, 'erp:finance:payable:list', '查询应付单', 'button', 4465, NULL, NULL, 1, 1),
(4481, 'erp:finance:payable:manage', '维护应付单', 'button', 4465, NULL, NULL, 2, 1),
(4482, 'erp:finance:payment:list', '查询收付款单', 'button', 4466, NULL, NULL, 1, 1),
(4483, 'erp:finance:payment:manage', '维护收付款单', 'button', 4466, NULL, NULL, 2, 1),
(4484, 'erp:finance:writeoff:list', '查询核销单', 'button', 4467, NULL, NULL, 1, 1),
(4485, 'erp:finance:writeoff:manage', '维护核销单', 'button', 4467, NULL, NULL, 2, 1),
(4486, 'erp:finance:invoice:list', '查询发票登记', 'button', 4468, NULL, NULL, 1, 1),
(4487, 'erp:finance:invoice:manage', '维护发票登记', 'button', 4468, NULL, NULL, 2, 1),
(4488, 'erp:finance:bank-statement:list', '查询银行对账', 'button', 4469, NULL, NULL, 1, 1),
(4489, 'erp:finance:bank-statement:manage', '维护银行对账', 'button', 4469, NULL, NULL, 2, 1),
(4490, 'erp:finance:cost-collection:list', '查询成本归集', 'button', 4470, NULL, NULL, 1, 1),
(4491, 'erp:finance:cost-collection:manage', '维护成本归集', 'button', 4470, NULL, NULL, 2, 1),
(4492, 'erp:finance:accrual:list', '查询暂估', 'button', 4471, NULL, NULL, 1, 1),
(4493, 'erp:finance:accrual:manage', '维护暂估', 'button', 4471, NULL, NULL, 2, 1);

-- ========== 角色授权 ==========

-- 管理员（2001）：授予 ERP 财务全部权限（1 分组 + 11 菜单 + 22 按钮）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(13400, 2001, 4460),
(13401, 2001, 4461), (13402, 2001, 4462), (13403, 2001, 4463), (13404, 2001, 4464),
(13405, 2001, 4465), (13406, 2001, 4466), (13407, 2001, 4467), (13408, 2001, 4468),
(13409, 2001, 4469), (13410, 2001, 4470), (13411, 2001, 4471),
(13412, 2001, 4472), (13413, 2001, 4473), (13414, 2001, 4474), (13415, 2001, 4475),
(13416, 2001, 4476), (13417, 2001, 4477), (13418, 2001, 4478), (13419, 2001, 4479),
(13420, 2001, 4480), (13421, 2001, 4481), (13422, 2001, 4482), (13423, 2001, 4483),
(13424, 2001, 4484), (13425, 2001, 4485), (13426, 2001, 4486), (13427, 2001, 4487),
(13428, 2001, 4488), (13429, 2001, 4489), (13430, 2001, 4490), (13431, 2001, 4491),
(13432, 2001, 4492), (13433, 2001, 4493);

-- 研发工程师（2002）：授予分组与菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(13434, 2002, 4460),
(13435, 2002, 4461), (13436, 2002, 4462), (13437, 2002, 4463), (13438, 2002, 4464),
(13439, 2002, 4465), (13440, 2002, 4466), (13441, 2002, 4467), (13442, 2002, 4468),
(13443, 2002, 4469), (13444, 2002, 4470), (13445, 2002, 4471),
(13446, 2002, 4472), (13447, 2002, 4474), (13448, 2002, 4476), (13449, 2002, 4478),
(13450, 2002, 4480), (13451, 2002, 4482), (13452, 2002, 4484), (13453, 2002, 4486),
(13454, 2002, 4488), (13455, 2002, 4490), (13456, 2002, 4492);

-- 质量工程师（2003）：授予分组与菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(13457, 2003, 4460),
(13458, 2003, 4461), (13459, 2003, 4462), (13460, 2003, 4463), (13461, 2003, 4464),
(13462, 2003, 4465), (13463, 2003, 4466), (13464, 2003, 4467), (13465, 2003, 4468),
(13466, 2003, 4469), (13467, 2003, 4470), (13468, 2003, 4471),
(13469, 2003, 4472), (13470, 2003, 4474), (13471, 2003, 4476), (13472, 2003, 4478),
(13473, 2003, 4480), (13474, 2003, 4482), (13475, 2003, 4484), (13476, 2003, 4486),
(13477, 2003, 4488), (13478, 2003, 4490), (13479, 2003, 4492);

-- 生产现场（2005）：授予分组与菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(13480, 2005, 4460),
(13481, 2005, 4461), (13482, 2005, 4462), (13483, 2005, 4463), (13484, 2005, 4464),
(13485, 2005, 4465), (13486, 2005, 4466), (13487, 2005, 4467), (13488, 2005, 4468),
(13489, 2005, 4469), (13490, 2005, 4470), (13491, 2005, 4471),
(13492, 2005, 4472), (13493, 2005, 4474), (13494, 2005, 4476), (13495, 2005, 4478),
(13496, 2005, 4480), (13497, 2005, 4482), (13498, 2005, 4484), (13499, 2005, 4486),
(13500, 2005, 4488), (13501, 2005, 4490), (13502, 2005, 4492);

-- 只读用户（2006）：授予分组与菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(13503, 2006, 4460),
(13504, 2006, 4461), (13505, 2006, 4462), (13506, 2006, 4463), (13507, 2006, 4464),
(13508, 2006, 4465), (13509, 2006, 4466), (13510, 2006, 4467), (13511, 2006, 4468),
(13512, 2006, 4469), (13513, 2006, 4470), (13514, 2006, 4471),
(13515, 2006, 4472), (13516, 2006, 4474), (13517, 2006, 4476), (13518, 2006, 4478),
(13519, 2006, 4480), (13520, 2006, 4482), (13521, 2006, 4484), (13522, 2006, 4486),
(13523, 2006, 4488), (13524, 2006, 4490), (13525, 2006, 4492);

-- 供应链专员（2004）：授予全部查询与维护按钮（22 项，不含分组与菜单）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(13526, 2004, 4472), (13527, 2004, 4473), (13528, 2004, 4474), (13529, 2004, 4475),
(13530, 2004, 4476), (13531, 2004, 4477), (13532, 2004, 4478), (13533, 2004, 4479),
(13534, 2004, 4480), (13535, 2004, 4481), (13536, 2004, 4482), (13537, 2004, 4483),
(13538, 2004, 4484), (13539, 2004, 4485), (13540, 2004, 4486), (13541, 2004, 4487),
(13542, 2004, 4488), (13543, 2004, 4489), (13544, 2004, 4490), (13545, 2004, 4491),
(13546, 2004, 4492), (13547, 2004, 4493);

-- ========== ERP 财务字典（7970-8059） ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(7970, 'erp_finance_account_type', '资产', 'ASSET', 1, 1, NULL),
(7971, 'erp_finance_account_type', '负债', 'LIABILITY', 2, 1, NULL),
(7972, 'erp_finance_account_type', '所有者权益', 'EQUITY', 3, 1, NULL),
(7973, 'erp_finance_account_type', '成本', 'COST', 4, 1, NULL),
(7974, 'erp_finance_account_type', '损益', 'PROFIT_LOSS', 5, 1, NULL),
(7975, 'erp_finance_balance_direction', '借', 'DEBIT', 1, 1, NULL),
(7976, 'erp_finance_balance_direction', '贷', 'CREDIT', 2, 1, NULL),
(7977, 'erp_finance_account_status', '启用', 'ACTIVE', 1, 1, NULL),
(7978, 'erp_finance_account_status', '停用', 'INACTIVE', 2, 1, NULL),
(7979, 'erp_finance_period_status', '未结账', 'OPEN', 1, 1, NULL),
(7980, 'erp_finance_period_status', '结账中', 'CLOSING', 2, 1, NULL),
(7981, 'erp_finance_period_status', '已结账', 'CLOSED', 3, 1, NULL),
(7982, 'erp_finance_voucher_word', '记', '记', 1, 1, NULL),
(7983, 'erp_finance_voucher_word', '收', '收', 2, 1, NULL),
(7984, 'erp_finance_voucher_word', '付', '付', 3, 1, NULL),
(7985, 'erp_finance_voucher_word', '转', '转', 4, 1, NULL),
(7986, 'erp_finance_voucher_type', '手工', 'MANUAL', 1, 1, NULL),
(7987, 'erp_finance_voucher_type', '销售', 'SALES', 2, 1, NULL),
(7988, 'erp_finance_voucher_type', '采购', 'PURCHASE', 3, 1, NULL),
(7989, 'erp_finance_voucher_type', '库存', 'INVENTORY', 4, 1, NULL),
(7990, 'erp_finance_voucher_type', '收付款', 'PAYMENT', 5, 1, NULL),
(7991, 'erp_finance_voucher_type', '成本', 'COST', 6, 1, NULL),
(7992, 'erp_finance_voucher_type', '期末', 'PERIOD', 7, 1, NULL),
(7993, 'erp_finance_voucher_status', '草稿', 'DRAFT', 1, 1, NULL),
(7994, 'erp_finance_voucher_status', '已审核', 'APPROVED', 2, 1, NULL),
(7995, 'erp_finance_voucher_status', '已过账', 'POSTED', 3, 1, NULL),
(7996, 'erp_finance_voucher_status', '已作废', 'VOID', 4, 1, NULL),
(7997, 'erp_finance_ar_status', '未结算', 'OPEN', 1, 1, NULL),
(7998, 'erp_finance_ar_status', '部分结算', 'PARTIAL', 2, 1, NULL),
(7999, 'erp_finance_ar_status', '已结算', 'SETTLED', 3, 1, NULL),
(8000, 'erp_finance_ar_status', '作废', 'VOID', 4, 1, NULL),
(8001, 'erp_finance_ap_status', '未结算', 'OPEN', 1, 1, NULL),
(8002, 'erp_finance_ap_status', '部分结算', 'PARTIAL', 2, 1, NULL),
(8003, 'erp_finance_ap_status', '已结算', 'SETTLED', 3, 1, NULL),
(8004, 'erp_finance_ap_status', '作废', 'VOID', 4, 1, NULL),
(8005, 'erp_finance_payment_type', '收款', 'RECEIPT', 1, 1, NULL),
(8006, 'erp_finance_payment_type', '付款', 'PAYMENT', 2, 1, NULL),
(8007, 'erp_finance_party_type', '客户', 'CUSTOMER', 1, 1, NULL),
(8008, 'erp_finance_party_type', '供应商', 'SUPPLIER', 2, 1, NULL),
(8009, 'erp_finance_payment_method', '现金', 'CASH', 1, 1, NULL),
(8010, 'erp_finance_payment_method', '转账', 'TRANSFER', 2, 1, NULL),
(8011, 'erp_finance_payment_method', '支票', 'CHECK', 3, 1, NULL),
(8012, 'erp_finance_payment_method', '网银', 'ONLINE', 4, 1, NULL),
(8013, 'erp_finance_payment_status', '草稿', 'DRAFT', 1, 1, NULL),
(8014, 'erp_finance_payment_status', '已确认', 'CONFIRMED', 2, 1, NULL),
(8015, 'erp_finance_payment_status', '已过账', 'POSTED', 3, 1, NULL),
(8016, 'erp_finance_payment_status', '已作废', 'VOID', 4, 1, NULL),
(8017, 'erp_finance_writeoff_type', '应收核销', 'AR', 1, 1, NULL),
(8018, 'erp_finance_writeoff_type', '应付核销', 'AP', 2, 1, NULL),
(8019, 'erp_finance_writeoff_status', '草稿', 'DRAFT', 1, 1, NULL),
(8020, 'erp_finance_writeoff_status', '已确认', 'CONFIRMED', 2, 1, NULL),
(8021, 'erp_finance_writeoff_status', '已作废', 'VOID', 3, 1, NULL),
(8022, 'erp_finance_invoice_type', '增值税专用发票', 'VAT_SPECIAL', 1, 1, NULL),
(8023, 'erp_finance_invoice_type', '增值税普通发票', 'VAT_NORMAL', 2, 1, NULL),
(8024, 'erp_finance_invoice_type', '电子发票', 'E_INVOICE', 3, 1, NULL),
(8025, 'erp_finance_invoice_type', '其他', 'OTHER', 4, 1, NULL),
(8026, 'erp_finance_invoice_direction', '销项', 'OUT', 1, 1, NULL),
(8027, 'erp_finance_invoice_direction', '进项', 'IN', 2, 1, NULL),
(8028, 'erp_finance_invoice_status', '草稿', 'DRAFT', 1, 1, NULL),
(8029, 'erp_finance_invoice_status', '已开具', 'ISSUED', 2, 1, NULL),
(8030, 'erp_finance_invoice_status', '已作废', 'VOID', 3, 1, NULL),
(8031, 'erp_finance_invoice_verify_status', '未认证', 'UNVERIFIED', 1, 1, NULL),
(8032, 'erp_finance_invoice_verify_status', '已认证', 'VERIFIED', 2, 1, NULL),
(8033, 'erp_finance_invoice_verify_status', '认证不通过', 'REJECTED', 3, 1, NULL),
(8034, 'erp_finance_bank_direction', '收入', 'IN', 1, 1, NULL),
(8035, 'erp_finance_bank_direction', '支出', 'OUT', 2, 1, NULL),
(8036, 'erp_finance_bank_match_status', '未匹配', 'UNMATCHED', 1, 1, NULL),
(8037, 'erp_finance_bank_match_status', '已匹配', 'MATCHED', 2, 1, NULL),
(8038, 'erp_finance_bank_match_status', '部分匹配', 'PARTIAL', 3, 1, NULL),
(8039, 'erp_finance_bank_statement_status', '已导入', 'IMPORTED', 1, 1, NULL),
(8040, 'erp_finance_bank_statement_status', '已对账', 'RECONCILED', 2, 1, NULL),
(8041, 'erp_finance_bank_statement_status', '作废', 'VOID', 3, 1, NULL),
(8042, 'erp_finance_cost_object_type', '产品', 'PRODUCT', 1, 1, NULL),
(8043, 'erp_finance_cost_object_type', '生产订单', 'PRODUCTION_ORDER', 2, 1, NULL),
(8044, 'erp_finance_cost_object_type', '项目', 'PROJECT', 3, 1, NULL),
(8045, 'erp_finance_cost_object_type', '期间', 'PERIOD', 4, 1, NULL),
(8046, 'erp_finance_cost_element', '材料', 'MATERIAL', 1, 1, NULL),
(8047, 'erp_finance_cost_element', '人工', 'LABOR', 2, 1, NULL),
(8048, 'erp_finance_cost_element', '制造费用', 'OVERHEAD', 3, 1, NULL),
(8049, 'erp_finance_cost_element', '委外', 'OUTSOURCE', 4, 1, NULL),
(8050, 'erp_finance_cost_element', '其他', 'OTHER', 5, 1, NULL),
(8051, 'erp_finance_cost_collection_status', '草稿', 'DRAFT', 1, 1, NULL),
(8052, 'erp_finance_cost_collection_status', '已确认', 'CONFIRMED', 2, 1, NULL),
(8053, 'erp_finance_cost_collection_status', '已过账', 'POSTED', 3, 1, NULL),
(8054, 'erp_finance_accrual_type', '暂估应收', 'AR', 1, 1, NULL),
(8055, 'erp_finance_accrual_type', '暂估应付', 'AP', 2, 1, NULL),
(8056, 'erp_finance_accrual_status', '草稿', 'DRAFT', 1, 1, NULL),
(8057, 'erp_finance_accrual_status', '已确认', 'CONFIRMED', 2, 1, NULL),
(8058, 'erp_finance_accrual_status', '已冲回', 'REVERSED', 3, 1, NULL),
(8059, 'erp_finance_accrual_status', '作废', 'VOID', 4, 1, NULL);

-- ========== ERP 财务可配置项（6270-6284） ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(6270, 'ERP', 'erp.finance.enabled', '财务核算启用开关', 'true', 0, 1, 'ERP 财务核算总开关，默认启用'),
(6271, 'ERP', 'erp.finance.base.currency', '本位币', 'CNY', 0, 1, '财务核算本位币，默认人民币'),
(6272, 'ERP', 'erp.finance.voucher.approval.required', '凭证需审核', 'true', 1, 1, '待业务方确认：记账凭证是否必须经审核后方可过账'),
(6273, 'ERP', 'erp.finance.period.close.approval.required', '期末结账需审批', 'true', 1, 1, '待业务方确认：会计期间结账是否必须经审批'),
(6274, 'ERP', 'erp.finance.ar.aging.days', '应收账龄分档天数', '30', 1, 1, '待业务方确认：应收账龄分档基准天数'),
(6275, 'ERP', 'erp.finance.ap.aging.days', '应付账龄分档天数', '30', 1, 1, '待业务方确认：应付账龄分档基准天数'),
(6276, 'ERP', 'erp.finance.tax.default.rate', '默认税率(%)', '13', 1, 1, '待业务方确认：默认增值税税率'),
(6277, 'ERP', 'erp.finance.invoice.vat.enabled', '增值税发票台账启用', 'true', 1, 1, '待业务方确认：是否启用增值税发票登记与认证管理'),
(6278, 'ERP', 'erp.finance.bank.direct.connect.enabled', '银行直连启用', 'true', 1, 1, '待业务方确认：是否启用银行直连获取流水与回单'),
(6279, 'ERP', 'erp.finance.bank.reconcile.tolerance', '银行对账容差(元)', '0', 1, 1, '待业务方确认：银行对账允许的金额容差，超出需人工处理'),
(6280, 'ERP', 'erp.finance.cost.collection.method', '成本归集方式', 'BY_ORDER', 1, 1, '待业务方确认：成本归集方式（BY_ORDER 按订单/BY_PRODUCT 按产品/BY_PERIOD 按期间）'),
(6281, 'ERP', 'erp.finance.accrual.reverse.enabled', '暂估自动冲回', 'true', 1, 1, '待业务方确认：暂估是否在次期自动冲回'),
(6282, 'ERP', 'erp.finance.multi.legal.entity.enabled', '多法人核算启用', 'true', 1, 1, '待业务方确认：是否启用多法人独立核算与合并'),
(6283, 'ERP', 'erp.finance.multi.factory.enabled', '多工厂核算启用', 'true', 1, 1, '待业务方确认：是否启用多工厂成本中心核算'),
(6284, 'ERP', 'erp.finance.cross.org.settlement.rule', '跨组织结算规则', 'NONE', 1, 1, '待业务方确认：跨法人/跨工厂内部结算规则（NONE 不结算/TRANSFER 调拨价/COST 成本价）');
