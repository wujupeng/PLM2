-- G3-N1 ERP—基础资料（WBS T021）初始化：菜单/按钮权限、角色授权、字典与可配置项。
-- 号段基线（V69 之后已占用的最大值）：sys_permission=4255（本脚本从 4260 起）、
-- sys_role_permission=12603（从 12610 起）、sys_dictionary=7486（从 7490 起）、sys_config=6164（从 6170 起）。
-- 菜单说明：ERP 为独立顶级菜单（parent_id=0，sort=15，与「产品与物料」10 并列）；
--           部门/仓库/币种/税率复用平台底座既有菜单，不在此重复定义。

-- ========== ERP 顶级菜单（4260） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4260, 'erp-domain', 'ERP 系统', 'menu', 0, NULL, 'ShopOutlined', 15, 1);

-- ========== ERP 基础资料菜单（4261-4267，挂在 ERP 顶级菜单 4260 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4261, 'erp:base:material', '物料业务档案', 'menu', 4260, '/erp/base/materials', 'DatabaseOutlined', 1, 1),
(4262, 'erp:base:customer', '客户档案', 'menu', 4260, '/erp/base/customers', 'TeamOutlined', 2, 1),
(4263, 'erp:base:customercontact', '客户联系人', 'menu', 4260, '/erp/base/customer-contacts', 'ContactsOutlined', 3, 1),
(4264, 'erp:base:supplier', '供应商业务档案', 'menu', 4260, '/erp/base/suppliers', 'TruckOutlined', 4, 1),
(4265, 'erp:base:uom', '计量单位', 'menu', 4260, '/erp/base/uoms', 'ProfileOutlined', 5, 1),
(4266, 'erp:base:uomconversion', '单位换算', 'menu', 4260, '/erp/base/uom-conversions', 'SwapOutlined', 6, 1),
(4267, 'erp:base:project', '项目档案', 'menu', 4260, '/erp/base/projects', 'ProjectOutlined', 7, 1);

-- ========== ERP 基础资料按钮（4268-4281） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4268, 'erp:base:material:list', '查询物料业务档案', 'button', 4261, NULL, NULL, 1, 1),
(4269, 'erp:base:material:manage', '维护物料业务档案', 'button', 4261, NULL, NULL, 2, 1),
(4270, 'erp:base:customer:list', '查询客户档案', 'button', 4262, NULL, NULL, 1, 1),
(4271, 'erp:base:customer:manage', '维护客户档案', 'button', 4262, NULL, NULL, 2, 1),
(4272, 'erp:base:customercontact:list', '查询客户联系人', 'button', 4263, NULL, NULL, 1, 1),
(4273, 'erp:base:customercontact:manage', '维护客户联系人', 'button', 4263, NULL, NULL, 2, 1),
(4274, 'erp:base:supplier:list', '查询供应商业务档案', 'button', 4264, NULL, NULL, 1, 1),
(4275, 'erp:base:supplier:manage', '维护供应商业务档案', 'button', 4264, NULL, NULL, 2, 1),
(4276, 'erp:base:uom:list', '查询计量单位', 'button', 4265, NULL, NULL, 1, 1),
(4277, 'erp:base:uom:manage', '维护计量单位', 'button', 4265, NULL, NULL, 2, 1),
(4278, 'erp:base:uomconversion:list', '查询单位换算', 'button', 4266, NULL, NULL, 1, 1),
(4279, 'erp:base:uomconversion:manage', '维护单位换算', 'button', 4266, NULL, NULL, 2, 1),
(4280, 'erp:base:project:list', '查询项目档案', 'button', 4267, NULL, NULL, 1, 1),
(4281, 'erp:base:project:manage', '维护项目档案', 'button', 4267, NULL, NULL, 2, 1);

-- ========== 角色授权 ==========

-- 管理员（2001）：授予 ERP 基础资料全部权限（1 顶级 + 7 菜单 + 14 按钮）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(12610, 2001, 4260),
(12611, 2001, 4261), (12612, 2001, 4262), (12613, 2001, 4263), (12614, 2001, 4264),
(12615, 2001, 4265), (12616, 2001, 4266), (12617, 2001, 4267),
(12618, 2001, 4268), (12619, 2001, 4269), (12620, 2001, 4270), (12621, 2001, 4271),
(12622, 2001, 4272), (12623, 2001, 4273), (12624, 2001, 4274), (12625, 2001, 4275),
(12626, 2001, 4276), (12627, 2001, 4277), (12628, 2001, 4278), (12629, 2001, 4279),
(12630, 2001, 4280), (12631, 2001, 4281);

-- 研发工程师（2002）：全部菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(12632, 2002, 4260),
(12633, 2002, 4261), (12634, 2002, 4262), (12635, 2002, 4263), (12636, 2002, 4264),
(12637, 2002, 4265), (12638, 2002, 4266), (12639, 2002, 4267),
(12640, 2002, 4268), (12641, 2002, 4270), (12642, 2002, 4272), (12643, 2002, 4274),
(12644, 2002, 4276), (12645, 2002, 4278), (12646, 2002, 4280);

-- 质量工程师（2003）：全部菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(12647, 2003, 4260),
(12648, 2003, 4261), (12649, 2003, 4262), (12650, 2003, 4263), (12651, 2003, 4264),
(12652, 2003, 4265), (12653, 2003, 4266), (12654, 2003, 4267),
(12655, 2003, 4268), (12656, 2003, 4270), (12657, 2003, 4272), (12658, 2003, 4274),
(12659, 2003, 4276), (12660, 2003, 4278), (12661, 2003, 4280);

-- 供应链专员（2004）：全部菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(12662, 2004, 4260),
(12663, 2004, 4261), (12664, 2004, 4262), (12665, 2004, 4263), (12666, 2004, 4264),
(12667, 2004, 4265), (12668, 2004, 4266), (12669, 2004, 4267),
(12670, 2004, 4268), (12671, 2004, 4270), (12672, 2004, 4272), (12673, 2004, 4274),
(12674, 2004, 4276), (12675, 2004, 4278), (12676, 2004, 4280);

-- 生产现场（2005）：全部菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(12677, 2005, 4260),
(12678, 2005, 4261), (12679, 2005, 4262), (12680, 2005, 4263), (12681, 2005, 4264),
(12682, 2005, 4265), (12683, 2005, 4266), (12684, 2005, 4267),
(12685, 2005, 4268), (12686, 2005, 4270), (12687, 2005, 4272), (12688, 2005, 4274),
(12689, 2005, 4276), (12690, 2005, 4278), (12691, 2005, 4280);

-- 只读用户（2006）：全部菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(12692, 2006, 4260),
(12693, 2006, 4261), (12694, 2006, 4262), (12695, 2006, 4263), (12696, 2006, 4264),
(12697, 2006, 4265), (12698, 2006, 4266), (12699, 2006, 4267),
(12700, 2006, 4268), (12701, 2006, 4270), (12702, 2006, 4272), (12703, 2006, 4274),
(12704, 2006, 4276), (12705, 2006, 4278), (12706, 2006, 4280);

-- ========== ERP 基础资料字典（7490-7536） ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(7490, 'erp_material_status', '生效', 'ACTIVE', 1, 1, NULL),
(7491, 'erp_material_status', '停用', 'DISABLED', 2, 1, NULL),
(7492, 'erp_material_status', '冻结', 'HOLD', 3, 1, NULL),
(7493, 'erp_valuation_method', '先进先出', 'FIFO', 1, 1, NULL),
(7494, 'erp_valuation_method', '移动平均', 'MOVING_AVG', 2, 1, NULL),
(7495, 'erp_valuation_method', '标准成本', 'STANDARD', 3, 1, NULL),
(7496, 'erp_customer_type', '直销客户', 'DIRECT', 1, 1, NULL),
(7497, 'erp_customer_type', '代理商', 'AGENT', 2, 1, NULL),
(7498, 'erp_customer_type', '内部客户', 'INTERNAL', 3, 1, NULL),
(7499, 'erp_customer_type', '出口客户', 'EXPORT', 4, 1, NULL),
(7500, 'erp_customer_status', '生效', 'ACTIVE', 1, 1, NULL),
(7501, 'erp_customer_status', '停用', 'DISABLED', 2, 1, NULL),
(7502, 'erp_customer_status', '信用冻结', 'CREDIT_HOLD', 3, 1, NULL),
(7503, 'erp_supplier_type', '原材料', 'RAW', 1, 1, NULL),
(7504, 'erp_supplier_type', '零部件', 'PART', 2, 1, NULL),
(7505, 'erp_supplier_type', '委外加工', 'OUTSOURCE', 3, 1, NULL),
(7506, 'erp_supplier_type', '服务类', 'SERVICE', 4, 1, NULL),
(7507, 'erp_supplier_status', '生效', 'ACTIVE', 1, 1, NULL),
(7508, 'erp_supplier_status', '停用', 'DISABLED', 2, 1, NULL),
(7509, 'erp_supplier_status', '黑名单', 'BLACKLIST', 3, 1, NULL),
(7510, 'erp_settle_method', '现金', 'CASH', 1, 1, NULL),
(7511, 'erp_settle_method', '电汇', 'TRANSFER', 2, 1, NULL),
(7512, 'erp_settle_method', '承兑', 'ACCEPTANCE', 3, 1, NULL),
(7513, 'erp_settle_method', '赊销', 'CREDIT', 4, 1, NULL),
(7514, 'erp_payment_term', '预付', 'PREPAY', 1, 1, NULL),
(7515, 'erp_payment_term', '货到付款', 'COD', 2, 1, NULL),
(7516, 'erp_payment_term', '月结30天', 'NET30', 3, 1, NULL),
(7517, 'erp_payment_term', '月结60天', 'NET60', 4, 1, NULL),
(7518, 'erp_payment_term', '月结90天', 'NET90', 5, 1, NULL),
(7519, 'erp_uom_type', '基本单位', 'BASE', 1, 1, NULL),
(7520, 'erp_uom_type', '采购单位', 'PURCHASE', 2, 1, NULL),
(7521, 'erp_uom_type', '销售单位', 'SALE', 3, 1, NULL),
(7522, 'erp_uom_type', '库存单位', 'INVENTORY', 4, 1, NULL),
(7523, 'erp_uom_status', '生效', 'ACTIVE', 1, 1, NULL),
(7524, 'erp_uom_status', '停用', 'DISABLED', 2, 1, NULL),
(7525, 'erp_conversion_status', '生效', 'ACTIVE', 1, 1, NULL),
(7526, 'erp_conversion_status', '停用', 'DISABLED', 2, 1, NULL),
(7527, 'erp_contact_status', '生效', 'ACTIVE', 1, 1, NULL),
(7528, 'erp_contact_status', '停用', 'DISABLED', 2, 1, NULL),
(7529, 'erp_project_type', '内部项目', 'INTERNAL', 1, 1, NULL),
(7530, 'erp_project_type', '客户项目', 'CUSTOMER', 2, 1, NULL),
(7531, 'erp_project_type', '研发项目', 'RESEARCH', 3, 1, NULL),
(7532, 'erp_project_type', '招标项目', 'BID', 4, 1, NULL),
(7533, 'erp_project_status', '筹划', 'PLANNING', 1, 1, NULL),
(7534, 'erp_project_status', '进行中', 'ACTIVE', 2, 1, NULL),
(7535, 'erp_project_status', '暂停', 'SUSPENDED', 3, 1, NULL),
(7536, 'erp_project_status', '已关闭', 'CLOSED', 4, 1, NULL);

-- ========== ERP 基础资料可配置项（6170-6176） ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(6170, 'ERP', 'erp.enabled', 'ERP 启用开关', 'true', 0, 1, 'ERP 基础资料总开关，默认启用'),
(6171, 'ERP', 'erp.material.authority.plm', '物料权威源为 PLM', 'true', 1, 1, '待业务方确认：ERP 物料档案仅维护经营属性，主档以 PLM 下发的物料编码为准'),
(6172, 'ERP', 'erp.supplier.authority.srm', '供应商权威源为 SRM', 'true', 1, 1, '待业务方确认：ERP 供应商档案仅维护结算属性，主档以 SRM 下发的供应商编码为准'),
(6173, 'ERP', 'erp.default.valuation.method', '默认计价方式', 'MOVING_AVG', 1, 1, '待业务方确认新建物料的默认存货计价方式（FIFO/MOVING_AVG/STANDARD）'),
(6174, 'ERP', 'erp.customer.credit.check', '客户信用校验开关', 'true', 1, 1, '待业务方确认销售订单是否强制校验客户信用额度与账期'),
(6175, 'ERP', 'erp.uom.default.base', '默认基本计量单位', 'PCS', 0, 1, '未指定基本单位时物料默认采用的基本计量单位编码'),
(6176, 'ERP', 'erp.project.code.required', '项目编码必填', 'false', 1, 1, '待业务方确认项目档案的自行编码规则是否必填');
