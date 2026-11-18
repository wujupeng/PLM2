-- OA-N8 初始化数据：资产维修与专项业务应用的菜单、按钮权限、角色授权、字典、可配置项与样例流程
-- 说明：流程与表单均为可配置数据，样例仅用于联调与验收演示，实施时由业务方通过设计器维护。
-- 号段避让：菜单 3799-3805、按钮 3806-3823、角色授权 11396-11478、字典 6631-6679、配置 6003-6020、
--           样例表单 7522-7524、样例流程 7542-7544、样例节点 7584-7589、样例表单字段 7664-7681。
-- 复用既有字典：oa_biz_flow_status（6523-6527）用于审批状态，oa_data_source（6575-6579）用于数据来源。

-- ========== OA-N8 权限（菜单 3799-3805，按钮 3806-3823） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(3799, 'oa-asset-repair', '资产维修', 'menu', 3600, '/oa/asset/repair', 'ToolOutlined', 27, 1),
(3800, 'oa-contract', '合同管理', 'menu', 3600, '/oa/special/contract', 'FileProtectOutlined', 28, 1),
(3801, 'oa-office-supply', '办公用品', 'menu', 3600, '/oa/special/office-supply', 'GiftOutlined', 29, 1),
(3802, 'oa-library', '图书管理', 'menu', 3600, '/oa/special/library', 'ReadOutlined', 30, 1),
(3803, 'oa-customer', '客户管理', 'menu', 3600, '/oa/special/customer', 'SolutionOutlined', 31, 1),
(3804, 'oa-i18n-factory', '国际化与多工厂', 'menu', 3600, '/oa/system/i18n', 'GlobalOutlined', 32, 1),
(3805, 'oa-log-center', '日志中心与移动后台', 'menu', 3600, '/oa/system/log-center', 'ReconciliationOutlined', 33, 1),
(3806, 'oa:asset:list', '查询维修工单', 'button', 3799, NULL, NULL, 1, 1),
(3807, 'oa:asset:apply', '发起维修申请', 'button', 3799, NULL, NULL, 2, 1),
(3808, 'oa:asset:manage', '维修派工与验收', 'button', 3799, NULL, NULL, 3, 1),
(3809, 'oa:contract:list', '查询合同', 'button', 3800, NULL, NULL, 1, 1),
(3810, 'oa:contract:apply', '发起合约评审', 'button', 3800, NULL, NULL, 2, 1),
(3811, 'oa:contract:manage', '维护合同台账', 'button', 3800, NULL, NULL, 3, 1),
(3812, 'oa:supply:list', '查询办公用品', 'button', 3801, NULL, NULL, 1, 1),
(3813, 'oa:supply:apply', '发起用品申请', 'button', 3801, NULL, NULL, 2, 1),
(3814, 'oa:supply:manage', '维护用品台账', 'button', 3801, NULL, NULL, 3, 1),
(3815, 'oa:library:list', '查询图书', 'button', 3802, NULL, NULL, 1, 1),
(3816, 'oa:library:apply', '申请借阅归还', 'button', 3802, NULL, NULL, 2, 1),
(3817, 'oa:library:manage', '维护图书档案', 'button', 3802, NULL, NULL, 3, 1),
(3818, 'oa:customer:list', '查询客户', 'button', 3803, NULL, NULL, 1, 1),
(3819, 'oa:customer:manage', '维护客户档案', 'button', 3803, NULL, NULL, 2, 1),
(3820, 'oa:i18n:list', '查询国际化配置', 'button', 3804, NULL, NULL, 1, 1),
(3821, 'oa:i18n:manage', '维护国际化与工厂参数', 'button', 3804, NULL, NULL, 2, 1),
(3822, 'oa:log:list', '查询日志与会话', 'button', 3805, NULL, NULL, 1, 1),
(3823, 'oa:log:manage', '维护告警与会话', 'button', 3805, NULL, NULL, 2, 1);

-- 管理员（2001）：授予 OA-N8 全部权限
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11396, 2001, 3799), (11397, 2001, 3800), (11398, 2001, 3801), (11399, 2001, 3802),
(11400, 2001, 3803), (11401, 2001, 3804), (11402, 2001, 3805), (11403, 2001, 3806),
(11404, 2001, 3807), (11405, 2001, 3808), (11406, 2001, 3809), (11407, 2001, 3810),
(11408, 2001, 3811), (11409, 2001, 3812), (11410, 2001, 3813), (11411, 2001, 3814),
(11412, 2001, 3815), (11413, 2001, 3816), (11414, 2001, 3817), (11415, 2001, 3818),
(11416, 2001, 3819), (11417, 2001, 3820), (11418, 2001, 3821), (11419, 2001, 3822),
(11420, 2001, 3823);

-- 研发工程师（2002）：资产维修全部 + 图书借阅 + 合同/客户/国际化查询
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11421, 2002, 3799), (11422, 2002, 3806), (11423, 2002, 3807), (11424, 2002, 3808),
(11425, 2002, 3802), (11426, 2002, 3815), (11427, 2002, 3816),
(11428, 2002, 3800), (11429, 2002, 3809),
(11430, 2002, 3803), (11431, 2002, 3818),
(11432, 2002, 3804), (11433, 2002, 3820);

-- 质量工程师（2003）：资产维修查询/申请 + 合同/客户/图书查询
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11434, 2003, 3799), (11435, 2003, 3806), (11436, 2003, 3807),
(11437, 2003, 3800), (11438, 2003, 3809),
(11439, 2003, 3803), (11440, 2003, 3818),
(11441, 2003, 3802), (11442, 2003, 3815);

-- 供应链专员（2004）：合同全部 + 办公用品全部 + 客户全部 + 资产维修查询
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11443, 2004, 3800), (11444, 2004, 3809), (11445, 2004, 3810), (11446, 2004, 3811),
(11447, 2004, 3801), (11448, 2004, 3812), (11449, 2004, 3813), (11450, 2004, 3814),
(11451, 2004, 3803), (11452, 2004, 3818), (11453, 2004, 3819),
(11454, 2004, 3799), (11455, 2004, 3806);

-- 生产现场（2005）：资产维修查询/申请 + 办公用品查询/申请 + 图书借阅
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11456, 2005, 3799), (11457, 2005, 3806), (11458, 2005, 3807),
(11459, 2005, 3801), (11460, 2005, 3812), (11461, 2005, 3813),
(11462, 2005, 3802), (11463, 2005, 3815), (11464, 2005, 3816);

-- 只读用户（2006）：全部菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11465, 2006, 3799), (11466, 2006, 3800), (11467, 2006, 3801), (11468, 2006, 3802),
(11469, 2006, 3803), (11470, 2006, 3804), (11471, 2006, 3805),
(11472, 2006, 3806), (11473, 2006, 3809), (11474, 2006, 3812), (11475, 2006, 3815),
(11476, 2006, 3818), (11477, 2006, 3820), (11478, 2006, 3822);

-- ========== OA-N8 字典 ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(6631, 'oa_asset_category', '设备维修（机工）', 'MACHINE', 1, 1, NULL),
(6632, 'oa_asset_category', '设备维修（模具）', 'MOLD', 2, 1, NULL),
(6633, 'oa_asset_category', '设备维修（测试仪表/量具/夹具）', 'GAUGE', 3, 1, NULL),
(6634, 'oa_asset_category', '设备维修（电脑）', 'COMPUTER', 4, 1, NULL),
(6635, 'oa_repair_status', '草稿', 'DRAFT', 1, 1, NULL),
(6636, 'oa_repair_status', '待派工', 'PENDING_DISPATCH', 2, 1, NULL),
(6637, 'oa_repair_status', '已派工', 'DISPATCHED', 3, 1, NULL),
(6638, 'oa_repair_status', '处理完成', 'HANDLED', 4, 1, NULL),
(6639, 'oa_repair_status', '已验收', 'ACCEPTED', 5, 1, NULL),
(6640, 'oa_repair_status', '已关闭', 'CLOSED', 6, 1, NULL),
(6641, 'oa_repair_priority', '低', 'LOW', 1, 1, NULL),
(6642, 'oa_repair_priority', '普通', 'NORMAL', 2, 1, NULL),
(6643, 'oa_repair_priority', '高', 'HIGH', 3, 1, NULL),
(6644, 'oa_repair_priority', '紧急', 'URGENT', 4, 1, NULL),
(6645, 'oa_contract_type', '销售合同', 'SALES', 1, 1, NULL),
(6646, 'oa_contract_type', '采购合同', 'PURCHASE', 2, 1, NULL),
(6647, 'oa_contract_type', '服务合同', 'SERVICE', 3, 1, NULL),
(6648, 'oa_contract_type', '其他合同', 'OTHER', 4, 1, NULL),
(6649, 'oa_contract_status', '草稿', 'DRAFT', 1, 1, NULL),
(6650, 'oa_contract_status', '生效中', 'EFFECTIVE', 2, 1, NULL),
(6651, 'oa_contract_status', '已到期', 'EXPIRED', 3, 1, NULL),
(6652, 'oa_contract_status', '已归档', 'ARCHIVED', 4, 1, NULL),
(6653, 'oa_contract_status', '已终止', 'TERMINATED', 5, 1, '合同提前终止，待业务方确认终止审批规则'),
(6654, 'oa_supply_issue_status', '未发料', 'DRAFT', 1, 1, NULL),
(6655, 'oa_supply_issue_status', '已发料', 'ISSUED', 2, 1, NULL),
(6656, 'oa_supply_txn_type', '入库', 'IN', 1, 1, NULL),
(6657, 'oa_supply_txn_type', '出库', 'OUT', 2, 1, NULL),
(6658, 'oa_supply_txn_type', '领用发料', 'ISSUE', 3, 1, NULL),
(6659, 'oa_supply_txn_type', '退库', 'RETURN', 4, 1, NULL),
(6660, 'oa_library_borrow_status', '借出中', 'BORROWED', 1, 1, NULL),
(6661, 'oa_library_borrow_status', '已归还', 'RETURNED', 2, 1, NULL),
(6662, 'oa_library_borrow_status', '已逾期', 'OVERDUE', 3, 1, NULL),
(6663, 'oa_customer_level', '重点客户', 'KEY', 1, 1, NULL),
(6664, 'oa_customer_level', '普通客户', 'NORMAL', 2, 1, NULL),
(6665, 'oa_customer_level', '潜在客户', 'POTENTIAL', 3, 1, NULL),
(6666, 'oa_customer_status', '启用', 'ACTIVE', 1, 1, NULL),
(6667, 'oa_customer_status', '停用', 'INACTIVE', 2, 1, NULL),
(6668, 'oa_customer_status', '黑名单', 'BLACKLIST', 3, 1, '黑名单客户授信/订货需业务方确认拦截规则'),
(6669, 'oa_log_type', '登录日志', 'LOGIN', 1, 1, NULL),
(6670, 'oa_log_type', '操作日志', 'OPERATION', 2, 1, NULL),
(6671, 'oa_log_type', '业务日志', 'BUSINESS', 3, 1, NULL),
(6672, 'oa_log_type', '异常告警', 'EXCEPTION', 4, 1, NULL),
(6673, 'oa_log_level', '调试', 'DEBUG', 1, 1, NULL),
(6674, 'oa_log_level', '信息', 'INFO', 2, 1, NULL),
(6675, 'oa_log_level', '警告', 'WARN', 3, 1, NULL),
(6676, 'oa_log_level', '错误', 'ERROR', 4, 1, NULL),
(6677, 'oa_mobile_session_status', '在线', 'ACTIVE', 1, 1, NULL),
(6678, 'oa_mobile_session_status', '已吊销', 'REVOKED', 2, 1, NULL),
(6679, 'oa_mobile_session_status', '已过期', 'EXPIRED', 3, 1, NULL);

-- ========== OA-N8 可配置项 ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(6003, 'OA', 'oa.asset.repair.category.config', '资产类别与维修字段/审批路径配置', '{"MACHINE":{},"MOLD":{},"GAUGE":{},"COMPUTER":{}}', 1, 1, '待业务方确认四类维修的可配置字段与审批路径'),
(6004, 'OA', 'oa.asset.repair.need.acceptance', '维修处理完成需验收', 'true', 0, 1, NULL),
(6005, 'OA', 'oa.asset.repair.sla.hours', '维修响应时限（小时）', '48', 1, 1, '待业务方确认各类资产的响应/完工时限'),
(6006, 'OA', 'oa.asset.repair.asset.ledger.sync.enabled', '维修工单同步资产台账', 'false', 1, 1, '资产台账权威归属资产/财务系统，开启前需确认接口边界'),
(6007, 'OA', 'oa.asset.repair.repeat.fault.window.days', '重复故障判定窗口（天）', '90', 1, 1, '同一资产在该窗口内再次报修视为重复故障，阈值待确认'),
(6008, 'OA', 'oa.contract.expire.alert.days', '合同到期提醒提前天数', '30', 0, 1, NULL),
(6009, 'OA', 'oa.contract.need.legal.review', '合同需法务评审', 'true', 1, 1, '待业务方确认法务评审的合同类型与金额门槛'),
(6010, 'OA', 'oa.contract.terminate.need.approval', '合同终止需审批', 'true', 1, 1, '待业务方确认合同终止的审批层级'),
(6011, 'OA', 'oa.office.supply.stock.enabled', '办公用品启用库存台账', 'true', 1, 1, '库存权威归属需与 ERP/WMS 确认，接口或台账方式待定'),
(6012, 'OA', 'oa.office.supply.stock.verify', '领用前校验库存', 'true', 0, 1, NULL),
(6013, 'OA', 'oa.office.supply.item.approval.limit', '用品申请免审批数量上限', '10', 1, 1, '待业务方确认小量申领免审批阈值，0 表示全部需审批'),
(6014, 'OA', 'oa.library.borrow.max.days', '图书借阅期限（天）', '30', 0, 1, NULL),
(6015, 'OA', 'oa.library.overdue.alert.days', '图书逾期提醒提前天数', '3', 0, 1, NULL),
(6016, 'OA', 'oa.customer.master.authority', '客户主数据权威归属系统', 'ERP', 1, 1, '客户主数据权威归属需确认，OA 轻量档案不产生冲突副本'),
(6017, 'OA', 'oa.customer.sync.enabled', '客户档案同步 ERP/CRM', 'false', 1, 1, '开启前需确认客户主数据同步接口与冲突处理规则'),
(6018, 'OA', 'oa.i18n.default.locale', '默认语言区域', 'zh-CN', 0, 1, NULL),
(6019, 'OA', 'oa.factory.default.code', '默认工厂编码', 'F01', 1, 1, '待业务方确认多工厂编码与组织隔离规则'),
(6020, 'OA', 'oa.log.retention.days', '日志保留天数', '180', 1, 1, '待业务方确认日志与审计数据的保留期限');

-- ========== OA-N8 样例流程包（仅用于联调与验收演示） ==========

INSERT INTO oa_form_definition (id, form_code, form_name, category, version_no, status, schema_json, description, remark, created_by, created_at) VALUES
(7522, 'OA_ASSET_REPAIR', '设备维修申请单', '资产维修', 1, 'PUBLISHED', NULL, '设备/模具/量具夹具/电脑维修申请，含资产信息、故障描述、优先级与附件', '示例表单，实施时由业务方通过表单设计器维护', 9001, CURRENT_TIMESTAMP),
(7523, 'OA_CONTRACT_REVIEW', '合同与合约评审单', '专项应用', 1, 'PUBLISHED', NULL, '合同登记与合约评审，含合同类型、双方、金额、有效期与附件', '示例表单，实施时由业务方通过表单设计器维护', 9001, CURRENT_TIMESTAMP),
(7524, 'OA_OFFICE_SUPPLY', '办公用品申请单', '专项应用', 1, 'PUBLISHED', NULL, '办公用品申请，含需求日期、用途、用品明细与领用人', '示例表单，实施时由业务方通过表单设计器维护', 9001, CURRENT_TIMESTAMP);

INSERT INTO oa_form_field (id, form_id, field_code, field_name, field_type, required_flag, data_source, source_value, options_json, rules_json, placeholder, sort_no, remark, created_by, created_at) VALUES
(7664, 7522, 'assetCategory', '资产类别', 'SELECT', 1, 'DICT', 'oa_asset_category', NULL, NULL, '请选择资产类别', 1, NULL, 9001, CURRENT_TIMESTAMP),
(7665, 7522, 'assetName', '资产名称', 'TEXT', 1, 'MANUAL', NULL, NULL, NULL, '请输入资产名称', 2, NULL, 9001, CURRENT_TIMESTAMP),
(7666, 7522, 'assetCode', '资产编码', 'TEXT', 0, 'MANUAL', NULL, NULL, NULL, '请输入资产编码', 3, NULL, 9001, CURRENT_TIMESTAMP),
(7667, 7522, 'faultType', '故障类型', 'TEXT', 1, 'MANUAL', NULL, NULL, NULL, '请输入故障类型', 4, NULL, 9001, CURRENT_TIMESTAMP),
(7668, 7522, 'faultDesc', '故障描述', 'TEXTAREA', 1, 'MANUAL', NULL, NULL, NULL, '请描述故障现象', 5, NULL, 9001, CURRENT_TIMESTAMP),
(7669, 7522, 'priority', '优先级', 'SELECT', 1, 'DICT', 'oa_repair_priority', NULL, NULL, '请选择优先级', 6, NULL, 9001, CURRENT_TIMESTAMP),
(7670, 7523, 'contractName', '合同名称', 'TEXT', 1, 'MANUAL', NULL, NULL, NULL, '请输入合同名称', 1, NULL, 9001, CURRENT_TIMESTAMP),
(7671, 7523, 'contractType', '合同类型', 'SELECT', 1, 'DICT', 'oa_contract_type', NULL, NULL, '请选择合同类型', 2, NULL, 9001, CURRENT_TIMESTAMP),
(7672, 7523, 'partyB', '对方单位', 'TEXT', 1, 'MANUAL', NULL, NULL, NULL, '请输入对方单位名称', 3, NULL, 9001, CURRENT_TIMESTAMP),
(7673, 7523, 'amount', '合同金额', 'NUMBER', 1, 'MANUAL', NULL, NULL, NULL, '请输入合同金额', 4, NULL, 9001, CURRENT_TIMESTAMP),
(7674, 7523, 'effectiveDate', '生效日期', 'DATE', 1, 'MANUAL', NULL, NULL, NULL, '请选择生效日期', 5, NULL, 9001, CURRENT_TIMESTAMP),
(7675, 7523, 'expireDate', '到期日期', 'DATE', 1, 'MANUAL', NULL, NULL, NULL, '请选择到期日期', 6, NULL, 9001, CURRENT_TIMESTAMP),
(7676, 7524, 'requireDate', '需求日期', 'DATE', 1, 'MANUAL', NULL, NULL, NULL, '请选择需求日期', 1, NULL, 9001, CURRENT_TIMESTAMP),
(7677, 7524, 'purpose', '用途说明', 'TEXTAREA', 1, 'MANUAL', NULL, NULL, NULL, '请说明领用用途', 2, NULL, 9001, CURRENT_TIMESTAMP),
(7678, 7524, 'itemCode', '用品编码', 'TEXT', 1, 'MANUAL', NULL, NULL, NULL, '请输入用品编码', 3, NULL, 9001, CURRENT_TIMESTAMP),
(7679, 7524, 'itemName', '用品名称', 'TEXT', 1, 'MANUAL', NULL, NULL, NULL, '请输入用品名称', 4, NULL, 9001, CURRENT_TIMESTAMP),
(7680, 7524, 'requestQty', '申请数量', 'NUMBER', 1, 'MANUAL', NULL, NULL, NULL, '请输入申请数量', 5, NULL, 9001, CURRENT_TIMESTAMP),
(7681, 7524, 'receiverName', '领用人', 'USER', 1, 'USER', NULL, NULL, NULL, '请选择领用人', 6, NULL, 9001, CURRENT_TIMESTAMP);

INSERT INTO oa_process_definition (id, process_code, process_name, form_id, category, version_no, status, definition_json, description, remark, created_by, created_at) VALUES
(7542, 'OA_ASSET_REPAIR_FLOW', '设备维修审批流程', 7522, '资产维修', 1, 'PUBLISHED', NULL, '维修申请经部门主管确认、设备主管审批后派工处理', '示例流程，实施时由业务方通过流程设计器维护', 9001, CURRENT_TIMESTAMP),
(7543, 'OA_CONTRACT_FLOW', '合同与合约评审流程', 7523, '专项应用', 1, 'PUBLISHED', NULL, '合同经业务、法务、财务会签后批准生效', '示例流程，实施时由业务方通过流程设计器维护', 9001, CURRENT_TIMESTAMP),
(7544, 'OA_SUPPLY_FLOW', '办公用品申请审批流程', 7524, '专项应用', 1, 'PUBLISHED', NULL, '用品申请经部门主管审批后由行政发料', '示例流程，实施时由业务方通过流程设计器维护', 9001, CURRENT_TIMESTAMP);

INSERT INTO oa_process_node (id, process_id, node_code, node_name, node_type, approver_type, approver_value, allow_delegate, sort_no, remark, created_by, created_at) VALUES
(7584, 7542, 'N1', '部门主管确认', 'APPROVAL', 'ROLE', '2001', 1, 1, '示例节点，按角色审批', 9001, CURRENT_TIMESTAMP),
(7585, 7542, 'N2', '设备主管审批', 'APPROVAL', 'ROLE', '2001', 1, 2, '示例节点，按角色审批', 9001, CURRENT_TIMESTAMP),
(7586, 7543, 'N1', '业务与法务会签', 'APPROVAL', 'ROLE', '2001', 1, 1, '示例节点，法务评审门槛待业务方确认', 9001, CURRENT_TIMESTAMP),
(7587, 7543, 'N2', '财务与管理层批准', 'APPROVAL', 'ROLE', '2001', 1, 2, '示例节点，按角色审批', 9001, CURRENT_TIMESTAMP),
(7588, 7544, 'N1', '部门主管审批', 'APPROVAL', 'ROLE', '2001', 1, 1, '示例节点，按角色审批', 9001, CURRENT_TIMESTAMP),
(7589, 7544, 'N2', '行政发料确认', 'APPROVAL', 'ROLE', '2001', 1, 2, '示例节点，按角色审批', 9001, CURRENT_TIMESTAMP);
