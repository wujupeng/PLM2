-- OA-N7 初始化数据：销售采购生产品质研发流程包的菜单、按钮权限、角色授权、字典、可配置项与样例流程
-- 说明：流程与表单均为可配置数据，样例仅用于联调与验收演示，实施时由业务方通过设计器维护。
-- 号段避让：菜单 3782-3785、按钮 3786-3798、角色授权 11342-11395、字典 6523-6630、配置 5981-6002、
--           样例表单 7510-7521、样例流程 7530-7541、样例节点 7560-7583、样例表单字段 7600-7663。

-- ========== OA-N7 权限（菜单 3782-3785，按钮 3786-3798） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(3782, 'oa-biz-sales', '销售生产流程', 'menu', 3600, '/oa/biz/sales', 'ShoppingCartOutlined', 23, 1),
(3783, 'oa-biz-quality', '品质流程', 'menu', 3600, '/oa/biz/quality', 'SafetyCertificateOutlined', 24, 1),
(3784, 'oa-biz-purchase', '采购流程', 'menu', 3600, '/oa/biz/purchase', 'ShopOutlined', 25, 1),
(3785, 'oa-biz-rd', '研发技术流程', 'menu', 3600, '/oa/biz/rd', 'ExperimentOutlined', 26, 1),
(3786, 'oa:biz:sales:list', '查询销售生产流程', 'button', 3782, NULL, NULL, 1, 1),
(3787, 'oa:biz:sales:apply', '发起销售生产流程', 'button', 3782, NULL, NULL, 2, 1),
(3788, 'oa:biz:sales:manage', '维护销售生产台账', 'button', 3782, NULL, NULL, 3, 1),
(3789, 'oa:biz:quality:list', '查询品质流程', 'button', 3783, NULL, NULL, 1, 1),
(3790, 'oa:biz:quality:apply', '发起品质流程', 'button', 3783, NULL, NULL, 2, 1),
(3791, 'oa:biz:quality:manage', '维护品质台账', 'button', 3783, NULL, NULL, 3, 1),
(3792, 'oa:biz:purchase:list', '查询采购流程', 'button', 3784, NULL, NULL, 1, 1),
(3793, 'oa:biz:purchase:apply', '发起采购流程', 'button', 3784, NULL, NULL, 2, 1),
(3794, 'oa:biz:purchase:manage', '维护采购台账', 'button', 3784, NULL, NULL, 3, 1),
(3795, 'oa:biz:rd:list', '查询研发技术流程', 'button', 3785, NULL, NULL, 1, 1),
(3796, 'oa:biz:rd:apply', '发起研发技术流程', 'button', 3785, NULL, NULL, 2, 1),
(3797, 'oa:biz:rd:manage', '维护研发技术台账', 'button', 3785, NULL, NULL, 3, 1),
(3798, 'oa:biz:notice:receipt', '变更通知签收', 'button', 3785, NULL, NULL, 4, 1);

-- 管理员（2001）：授予 OA-N7 全部权限
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11342, 2001, 3782), (11343, 2001, 3783), (11344, 2001, 3784), (11345, 2001, 3785),
(11346, 2001, 3786), (11347, 2001, 3787), (11348, 2001, 3788), (11349, 2001, 3789),
(11350, 2001, 3790), (11351, 2001, 3791), (11352, 2001, 3792), (11353, 2001, 3793),
(11354, 2001, 3794), (11355, 2001, 3795), (11356, 2001, 3796), (11357, 2001, 3797),
(11358, 2001, 3798);

-- 研发工程师（2002）：研发技术流程（含变更通知签收）+ 销售生产流程发起/查询
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11359, 2002, 3785), (11360, 2002, 3795), (11361, 2002, 3796),
(11362, 2002, 3782), (11363, 2002, 3786), (11364, 2002, 3787), (11365, 2002, 3798);

-- 质量工程师（2003）：品质流程全部 + 研发技术流程查询/发起 + 变更通知签收
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11366, 2003, 3783), (11367, 2003, 3789), (11368, 2003, 3790), (11369, 2003, 3791),
(11370, 2003, 3785), (11371, 2003, 3795), (11372, 2003, 3796), (11373, 2003, 3798);

-- 供应链专员（2004）：采购流程全部 + 销售生产发起/查询 + 品质流程查询
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11374, 2004, 3784), (11375, 2004, 3792), (11376, 2004, 3793), (11377, 2004, 3794),
(11378, 2004, 3782), (11379, 2004, 3786), (11380, 2004, 3787),
(11381, 2004, 3783), (11382, 2004, 3789);

-- 生产现场（2005）：销售生产查询 + 品质查询 + 变更通知签收
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11383, 2005, 3782), (11384, 2005, 3786), (11385, 2005, 3783), (11386, 2005, 3789),
(11387, 2005, 3798);

-- 只读用户（2006）：全部菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11388, 2006, 3782), (11389, 2006, 3783), (11390, 2006, 3784), (11391, 2006, 3785),
(11392, 2006, 3786), (11393, 2006, 3789), (11394, 2006, 3792), (11395, 2006, 3795);

-- ========== OA-N7 字典 ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(6523, 'oa_biz_flow_status', '草稿', 'DRAFT', 1, 1, NULL),
(6524, 'oa_biz_flow_status', '审批中', 'RUNNING', 2, 1, NULL),
(6525, 'oa_biz_flow_status', '已通过', 'APPROVED', 3, 1, NULL),
(6526, 'oa_biz_flow_status', '已驳回', 'REJECTED', 4, 1, NULL),
(6527, 'oa_biz_flow_status', '已撤回', 'CANCELLED', 5, 1, NULL),
(6530, 'oa_credit_type', '新增授信', 'NEW', 1, 1, NULL),
(6531, 'oa_credit_type', '额度调整', 'ADJUST', 2, 1, NULL),
(6535, 'oa_risk_level', '低', 'LOW', 1, 1, NULL),
(6536, 'oa_risk_level', '中', 'MEDIUM', 2, 1, NULL),
(6537, 'oa_risk_level', '高', 'HIGH', 3, 1, NULL),
(6540, 'oa_price_category', '产品销售价', 'SALES', 1, 1, NULL),
(6541, 'oa_price_category', '零件采购价', 'PART', 2, 1, NULL),
(6545, 'oa_price_change_type', '新增价格', 'NEW', 1, 1, NULL),
(6546, 'oa_price_change_type', '变更价格', 'CHANGE', 2, 1, NULL),
(6550, 'oa_coord_close_status', '未闭环', 'OPEN', 1, 1, NULL),
(6551, 'oa_coord_close_status', '处理中', 'PROCESSING', 2, 1, NULL),
(6552, 'oa_coord_close_status', '已闭环', 'CLOSED', 3, 1, NULL),
(6555, 'oa_plan_source', 'OA 维护', 'OA', 1, 1, NULL),
(6556, 'oa_plan_source', 'MES', 'MES', 2, 1, '排产权威归属待与 MES 确认'),
(6557, 'oa_plan_source', 'ERP', 'ERP', 3, 1, NULL),
(6560, 'oa_seq_status', '草稿', 'DRAFT', 1, 1, NULL),
(6561, 'oa_seq_status', '已发布', 'PUBLISHED', 2, 1, NULL),
(6562, 'oa_seq_status', '已关闭', 'CLOSED', 3, 1, NULL),
(6565, 'oa_voucher_type', '销售订货', 'SALES', 1, 1, NULL),
(6566, 'oa_voucher_type', '采购订货', 'PURCHASE', 2, 1, NULL),
(6570, 'oa_daily_report_status', '草稿', 'DRAFT', 1, 1, NULL),
(6571, 'oa_daily_report_status', '已提交', 'SUBMITTED', 2, 1, NULL),
(6572, 'oa_daily_report_status', '已确认', 'CONFIRMED', 3, 1, NULL),
(6575, 'oa_data_source', '人工录入', 'MANUAL', 1, 1, NULL),
(6576, 'oa_data_source', 'MES', 'MES', 2, 1, NULL),
(6577, 'oa_data_source', 'ERP', 'ERP', 3, 1, NULL),
(6578, 'oa_data_source', 'QMS', 'QMS', 4, 1, '质量台账权威来源'),
(6579, 'oa_data_source', 'PLM', 'PLM', 5, 1, '技术变更与物料版本权威来源'),
(6580, 'oa_eval_period', '月度考评', 'MONTH', 1, 1, NULL),
(6581, 'oa_eval_period', '季度考评', 'QUARTER', 2, 1, NULL),
(6582, 'oa_eval_period', '年度考评', 'YEAR', 3, 1, NULL),
(6585, 'oa_supplier_grade', 'A 级', 'A', 1, 1, NULL),
(6586, 'oa_supplier_grade', 'B 级', 'B', 2, 1, NULL),
(6587, 'oa_supplier_grade', 'C 级', 'C', 3, 1, NULL),
(6588, 'oa_supplier_grade', 'D 级', 'D', 4, 1, NULL),
(6590, 'oa_quality_metric_type', '目标指标完成', 'TARGET', 1, 1, NULL),
(6591, 'oa_quality_metric_type', 'RTY 一次通过率', 'RTY', 2, 1, NULL),
(6592, 'oa_quality_metric_type', '质量月报', 'MONTHLY_REPORT', 3, 1, NULL),
(6595, 'oa_inspection_result', '待检测', 'PENDING', 1, 1, NULL),
(6596, 'oa_inspection_result', '合格', 'PASS', 2, 1, NULL),
(6597, 'oa_inspection_result', '不合格', 'FAIL', 3, 1, NULL),
(6600, 'oa_five_m_category', '人（Man）', 'MAN', 1, 1, NULL),
(6601, 'oa_five_m_category', '机（Machine）', 'MACHINE', 2, 1, NULL),
(6602, 'oa_five_m_category', '料（Material）', 'MATERIAL', 3, 1, NULL),
(6603, 'oa_five_m_category', '法（Method）', 'METHOD', 4, 1, NULL),
(6604, 'oa_five_m_category', '环（Environment）', 'ENVIRONMENT', 5, 1, NULL),
(6605, 'oa_sample_issue_status', '待处理', 'OPEN', 1, 1, NULL),
(6606, 'oa_sample_issue_status', '处理中', 'PROCESSING', 2, 1, NULL),
(6607, 'oa_sample_issue_status', '验证中', 'VERIFYING', 3, 1, NULL),
(6608, 'oa_sample_issue_status', '已关闭', 'CLOSED', 4, 1, NULL),
(6610, 'oa_issue_level', '轻微', 'MINOR', 1, 1, NULL),
(6611, 'oa_issue_level', '严重', 'MAJOR', 2, 1, NULL),
(6612, 'oa_issue_level', '致命', 'CRITICAL', 3, 1, NULL),
(6614, 'oa_audit_status', '已计划', 'PLANNED', 1, 1, NULL),
(6615, 'oa_audit_status', '实施中', 'RUNNING', 2, 1, NULL),
(6616, 'oa_audit_status', '报告编制', 'REPORTING', 3, 1, NULL),
(6617, 'oa_audit_status', '已关闭', 'CLOSED', 4, 1, NULL),
(6619, 'oa_change_notice_type', '变更通知', 'NOTICE', 1, 1, NULL),
(6620, 'oa_change_notice_type', '图纸补发', 'REDRAW', 2, 1, NULL),
(6622, 'oa_receipt_status', '待签收', 'PENDING', 1, 1, NULL),
(6623, 'oa_receipt_status', '已签收', 'RECEIVED', 2, 1, NULL),
(6625, 'oa_ecr_change_type', 'ECR 变更申请', 'ECR', 1, 1, NULL),
(6626, 'oa_ecr_change_type', 'ECO 变更执行', 'ECO', 2, 1, NULL),
(6628, 'oa_mold_trial_type', '标准件检查', 'STANDARD_CHECK', 1, 1, NULL),
(6629, 'oa_mold_trial_type', '新开模检查', 'MOLD_CHECK', 2, 1, NULL),
(6630, 'oa_mold_trial_type', '零件试流', 'PART_TRIAL', 3, 1, NULL);

-- ========== OA-N7 可配置项 ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(5981, 'OA', 'oa.biz.flow.no.prefix', '业务流程单据编号前缀', 'OABIZ', 0, 1, NULL),
(5982, 'OA', 'oa.biz.credit.need.risk.review', '客户授信需风险评审', 'true', 1, 1, '待业务方确认授信风险评审岗位与评审要素'),
(5983, 'OA', 'oa.biz.credit.default.currency', '客户授信默认币种', 'CNY', 0, 1, NULL),
(5984, 'OA', 'oa.biz.credit.amount.limit.matrix', '客户授信额度授权矩阵', '{\"MANAGER\":500000,\"DIRECTOR\":2000000,\"EXECUTIVE\":-1}', 1, 1, '待业务方确认金额/额度与审批层级的授权矩阵，-1 表示不限额'),
(5985, 'OA', 'oa.biz.price.need.cost.basis', '价格审批必须填写成本依据', 'true', 1, 1, '待业务方确认成本依据的必填范围与来源系统'),
(5986, 'OA', 'oa.biz.price.max.valid.days', '价格有效期最长天数', '365', 1, 1, '待业务方确认价格有效期上限规则'),
(5987, 'OA', 'oa.biz.delivery.delay.alert.days', '交期延误预警天数', '3', 0, 1, '承诺交期前 N 天未完成时提示'),
(5988, 'OA', 'oa.biz.production.sequence.authority', '排产权威归属系统', 'MES', 1, 1, '排产权威归属需与 MES 确认；OA 不覆盖 MES 已发布生产计划'),
(5989, 'OA', 'oa.biz.production.sequence.need.publish', '生产顺序表需发布才可车间查询', 'true', 0, 1, NULL),
(5990, 'OA', 'oa.biz.order.voucher.erp.sync.enabled', '订货传票同步 ERP', 'false', 1, 1, 'ERP 订单单据仍由 ERP 生成；开启前需确认 IF 接口与单据映射'),
(5991, 'OA', 'oa.biz.order.voucher.import.need.customs', '进口件传票需报关信息', 'true', 1, 1, '待业务方确认进口件传票必填的报关/贸易条款字段'),
(5992, 'OA', 'oa.biz.workshop.daily.reconcile.mes', '车间日报与 MES 实绩对账', 'true', 1, 1, '待业务方确认与 MES 生产实绩对账口径与频率'),
(5993, 'OA', 'oa.biz.workshop.daily.data.source.default', '车间日报默认数据来源', 'MANUAL', 0, 1, NULL),
(5994, 'OA', 'oa.biz.supplier.eval.default.period', '供方考评默认周期', 'MONTH', 0, 1, NULL),
(5995, 'OA', 'oa.biz.supplier.eval.score.weight.total', '供方考评权重合计', '100', 0, 1, '各评分项权重之和，校验用'),
(5996, 'OA', 'oa.biz.supplier.eval.grade.rule', '供方考评等级阈值', '{\"A\":90,\"B\":80,\"C\":70}', 1, 1, '待业务方确认等级阈值与降级触发规则'),
(5997, 'OA', 'oa.biz.quality.data.source', '质量指标默认数据来源', 'QMS', 1, 1, '质量台账权威在 QMS，OA 仅承载报表口径配置与展示'),
(5998, 'OA', 'oa.biz.quality.rty.target', 'RTY 一次通过率目标（%）', '98', 1, 1, '待业务方确认 RTY 目标值与计算口径'),
(5999, 'OA', 'oa.biz.inspection.qms.sync.enabled', '检测委托同步 QMS', 'false', 1, 1, '与 QMS/实验室系统接口边界需确认，见 IF 接口清单'),
(6000, 'OA', 'oa.biz.five.m.need.verification', '5M 变更需验证证据', 'true', 0, 1, NULL),
(6001, 'OA', 'oa.biz.ecr.push.plm.enabled', 'ECR 评审通过后转 PLM 工程变更', 'false', 1, 1, 'PLM 为技术变更权威记录，OA 承载审批协同；开启前需确认接口'),
(6002, 'OA', 'oa.biz.change.notice.need.receipt', '变更通知需签收确认', 'true', 0, 1, NULL);

-- ========== OA-N7 样例流程包（仅用于联调与验收演示） ==========

INSERT INTO oa_form_definition (id, form_code, form_name, category, version_no, status, schema_json, description, remark, created_by, created_at) VALUES
(7510, 'OA_CUSTOMER_CREDIT', '客户授信申请单', '销售生产', 1, 'PUBLISHED', NULL, '客户授信申请，含客户信息、申请额度、期限、风险评审与附件', '示例表单，实施时由业务方通过表单设计器维护', 9001, CURRENT_TIMESTAMP),
(7511, 'OA_PRICE_APPROVAL', '价格审批单', '销售生产', 1, 'PUBLISHED', NULL, '产品销售价与零件采购价审批，含物料、客户/供方、价格、币种与有效期', '示例表单，实施时由业务方通过表单设计器维护', 9001, CURRENT_TIMESTAMP),
(7512, 'OA_DELIVERY_COORD', '交期延误协调单', '销售生产', 1, 'PUBLISHED', NULL, '交期延误协调，含订单、物料、原因、责任部门与承诺交期', '示例表单，实施时由业务方通过表单设计器维护', 9001, CURRENT_TIMESTAMP),
(7513, 'OA_ORDER_VOUCHER', '订货传票', '销售生产', 1, 'PUBLISHED', NULL, '销售订货/采购订货与进口件订货传票，含订单、物料、数量与交期', '示例表单，实施时由业务方通过表单设计器维护', 9001, CURRENT_TIMESTAMP),
(7514, 'OA_SUPPLIER_EVAL', '供方考评单', '品质', 1, 'PUBLISHED', NULL, '供方月度/季度/年度考评，含评分项、权重、评价依据与等级', '示例表单，实施时由业务方通过表单设计器维护', 9001, CURRENT_TIMESTAMP),
(7515, 'OA_INSPECTION_REQUEST', '检测委托单', '品质', 1, 'PUBLISHED', NULL, '检测委托申请，含委托部门、样品、批次、检测项目与要求日期', '示例表单，实施时由业务方通过表单设计器维护', 9001, CURRENT_TIMESTAMP),
(7516, 'OA_FIVE_M_CHANGE', '5M 变更单', '研发技术', 1, 'PUBLISHED', NULL, '人机料法环变更追踪，含变更描述、风险分析、验证与生效日期', '示例表单，实施时由业务方通过表单设计器维护', 9001, CURRENT_TIMESTAMP),
(7517, 'OA_SAMPLE_ISSUE', '样品试制问题改善单', '研发技术', 1, 'PUBLISHED', NULL, '样品试制问题改善，含问题描述、责任人、措施、期限与验证结果', '示例表单，实施时由业务方通过表单设计器维护', 9001, CURRENT_TIMESTAMP),
(7518, 'OA_INTERNAL_AUDIT', '内部审核实施计划', '研发技术', 1, 'PUBLISHED', NULL, '内部审核实施计划，含审核范围、标准、时间、审核员与问题整改', '示例表单，实施时由业务方通过表单设计器维护', 9001, CURRENT_TIMESTAMP),
(7519, 'OA_ECR_REVIEW', '设计工程变更风险评审单', '研发技术', 1, 'PUBLISHED', NULL, 'ECR 风险评审，含变更原因、风险描述、影响分析与评审结论', '示例表单，实施时由业务方通过表单设计器维护', 9001, CURRENT_TIMESTAMP),
(7520, 'OA_CHANGE_NOTICE', '变更通知与图纸补发单', '研发技术', 1, 'PUBLISHED', NULL, '变更通知与图纸补发，含通知对象、版本、生效日期与签收记录', '示例表单，实施时由业务方通过表单设计器维护', 9001, CURRENT_TIMESTAMP),
(7521, 'OA_MOLD_TRIAL', '新开模检查与零件试流单', '研发技术', 1, 'PUBLISHED', NULL, '新开模检查与零件试流，含检查项、试流数量、问题与验证结论', '示例表单，实施时由业务方通过表单设计器维护', 9001, CURRENT_TIMESTAMP);

INSERT INTO oa_form_field (id, form_id, field_code, field_name, field_type, required_flag, data_source, source_value, options_json, rules_json, placeholder, sort_no, remark, created_by, created_at) VALUES
(7600, 7510, 'customerName', '客户名称', 'TEXT', 1, 'MANUAL', NULL, NULL, NULL, '请输入客户名称', 1, NULL, 9001, CURRENT_TIMESTAMP),
(7601, 7510, 'creditType', '授信类型', 'SELECT', 1, 'DICT', 'oa_credit_type', NULL, NULL, '请选择授信类型', 2, NULL, 9001, CURRENT_TIMESTAMP),
(7602, 7510, 'applyAmount', '申请额度', 'NUMBER', 1, 'MANUAL', NULL, NULL, NULL, '请输入申请额度', 3, NULL, 9001, CURRENT_TIMESTAMP),
(7603, 7510, 'currency', '币种', 'TEXT', 1, 'MANUAL', NULL, NULL, NULL, '请输入币种', 4, NULL, 9001, CURRENT_TIMESTAMP),
(7604, 7510, 'validTo', '额度有效期', 'DATE', 1, 'MANUAL', NULL, NULL, NULL, '请选择额度有效期', 5, NULL, 9001, CURRENT_TIMESTAMP),
(7605, 7510, 'riskLevel', '风险等级', 'SELECT', 1, 'DICT', 'oa_risk_level', NULL, NULL, '请选择风险等级', 6, NULL, 9001, CURRENT_TIMESTAMP),
(7606, 7511, 'priceCategory', '价格类别', 'SELECT', 1, 'DICT', 'oa_price_category', NULL, NULL, '请选择价格类别', 1, NULL, 9001, CURRENT_TIMESTAMP),
(7607, 7511, 'materialCode', '物料编码', 'TEXT', 1, 'MANUAL', NULL, NULL, NULL, '请输入物料编码', 2, NULL, 9001, CURRENT_TIMESTAMP),
(7608, 7511, 'priceAmount', '价格', 'NUMBER', 1, 'MANUAL', NULL, NULL, NULL, '请输入价格', 3, NULL, 9001, CURRENT_TIMESTAMP),
(7609, 7511, 'currency', '币种', 'TEXT', 1, 'MANUAL', NULL, NULL, NULL, '请输入币种', 4, NULL, 9001, CURRENT_TIMESTAMP),
(7610, 7511, 'effectiveFrom', '生效日期', 'DATE', 1, 'MANUAL', NULL, NULL, NULL, '请选择生效日期', 5, NULL, 9001, CURRENT_TIMESTAMP),
(7611, 7511, 'effectiveTo', '失效日期', 'DATE', 1, 'MANUAL', NULL, NULL, NULL, '请选择失效日期', 6, NULL, 9001, CURRENT_TIMESTAMP),
(7612, 7512, 'orderNo', '订单号', 'TEXT', 1, 'MANUAL', NULL, NULL, NULL, '请输入订单号', 1, NULL, 9001, CURRENT_TIMESTAMP),
(7613, 7512, 'materialCode', '物料编码', 'TEXT', 1, 'MANUAL', NULL, NULL, NULL, '请输入物料编码', 2, NULL, 9001, CURRENT_TIMESTAMP),
(7614, 7512, 'originalDelivery', '原交期', 'DATE', 1, 'MANUAL', NULL, NULL, NULL, '请选择原交期', 3, NULL, 9001, CURRENT_TIMESTAMP),
(7615, 7512, 'promisedDelivery', '承诺交期', 'DATE', 1, 'MANUAL', NULL, NULL, NULL, '请选择承诺交期', 4, NULL, 9001, CURRENT_TIMESTAMP),
(7616, 7512, 'delayReason', '延误原因', 'TEXTAREA', 1, 'MANUAL', NULL, NULL, NULL, '请说明延误原因', 5, NULL, 9001, CURRENT_TIMESTAMP),
(7617, 7513, 'voucherType', '传票类型', 'SELECT', 1, 'DICT', 'oa_voucher_type', NULL, NULL, '请选择传票类型', 1, NULL, 9001, CURRENT_TIMESTAMP),
(7618, 7513, 'importFlag', '是否进口件', 'RADIO', 1, 'MANUAL', NULL, NULL, NULL, '请选择是否进口件', 2, NULL, 9001, CURRENT_TIMESTAMP),
(7619, 7513, 'customerName', '客户/供方', 'TEXT', 1, 'MANUAL', NULL, NULL, NULL, '请输入客户或供方名称', 3, NULL, 9001, CURRENT_TIMESTAMP),
(7620, 7513, 'materialCode', '物料编码', 'TEXT', 1, 'MANUAL', NULL, NULL, NULL, '请输入物料编码', 4, NULL, 9001, CURRENT_TIMESTAMP),
(7621, 7513, 'qty', '数量', 'NUMBER', 1, 'MANUAL', NULL, NULL, NULL, '请输入数量', 5, NULL, 9001, CURRENT_TIMESTAMP),
(7622, 7513, 'deliveryDate', '要求交期', 'DATE', 1, 'MANUAL', NULL, NULL, NULL, '请选择要求交期', 6, NULL, 9001, CURRENT_TIMESTAMP),
(7623, 7514, 'evalPeriod', '考评周期', 'SELECT', 1, 'DICT', 'oa_eval_period', NULL, NULL, '请选择考评周期', 1, NULL, 9001, CURRENT_TIMESTAMP),
(7624, 7514, 'evalYear', '考评年度', 'NUMBER', 1, 'MANUAL', NULL, NULL, NULL, '请输入考评年度', 2, NULL, 9001, CURRENT_TIMESTAMP),
(7625, 7514, 'supplierName', '供应商名称', 'TEXT', 1, 'MANUAL', NULL, NULL, NULL, '请输入供应商名称', 3, NULL, 9001, CURRENT_TIMESTAMP),
(7626, 7514, 'totalScore', '考评总分', 'NUMBER', 1, 'MANUAL', NULL, NULL, NULL, '请输入考评总分', 4, NULL, 9001, CURRENT_TIMESTAMP),
(7627, 7514, 'grade', '考评等级', 'SELECT', 1, 'DICT', 'oa_supplier_grade', NULL, NULL, '请选择考评等级', 5, NULL, 9001, CURRENT_TIMESTAMP),
(7628, 7515, 'materialCode', '物料编码', 'TEXT', 1, 'MANUAL', NULL, NULL, NULL, '请输入物料编码', 1, NULL, 9001, CURRENT_TIMESTAMP),
(7629, 7515, 'batchNo', '批次号', 'TEXT', 1, 'MANUAL', NULL, NULL, NULL, '请输入批次号', 2, NULL, 9001, CURRENT_TIMESTAMP),
(7630, 7515, 'sampleQty', '样品数量', 'NUMBER', 1, 'MANUAL', NULL, NULL, NULL, '请输入样品数量', 3, NULL, 9001, CURRENT_TIMESTAMP),
(7631, 7515, 'inspectionItems', '检测项目', 'TEXTAREA', 1, 'MANUAL', NULL, NULL, NULL, '请填写检测项目', 4, NULL, 9001, CURRENT_TIMESTAMP),
(7632, 7515, 'requireDate', '要求完成日期', 'DATE', 1, 'MANUAL', NULL, NULL, NULL, '请选择要求完成日期', 5, NULL, 9001, CURRENT_TIMESTAMP),
(7633, 7516, 'changeCategory', '变更类别', 'SELECT', 1, 'DICT', 'oa_five_m_category', NULL, NULL, '请选择 5M 变更类别', 1, NULL, 9001, CURRENT_TIMESTAMP),
(7634, 7516, 'changeTitle', '变更标题', 'TEXT', 1, 'MANUAL', NULL, NULL, NULL, '请输入变更标题', 2, NULL, 9001, CURRENT_TIMESTAMP),
(7635, 7516, 'changeDesc', '变更描述', 'TEXTAREA', 1, 'MANUAL', NULL, NULL, NULL, '请描述变更内容', 3, NULL, 9001, CURRENT_TIMESTAMP),
(7636, 7516, 'riskLevel', '风险等级', 'SELECT', 1, 'DICT', 'oa_risk_level', NULL, NULL, '请选择风险等级', 4, NULL, 9001, CURRENT_TIMESTAMP),
(7637, 7516, 'verificationPlan', '验证方案', 'TEXTAREA', 1, 'MANUAL', NULL, NULL, NULL, '请填写验证方案', 5, NULL, 9001, CURRENT_TIMESTAMP),
(7638, 7517, 'projectCode', '项目编号', 'TEXT', 1, 'MANUAL', NULL, NULL, NULL, '请输入项目编号', 1, NULL, 9001, CURRENT_TIMESTAMP),
(7639, 7517, 'partCode', '零件编码', 'TEXT', 1, 'MANUAL', NULL, NULL, NULL, '请输入零件编码', 2, NULL, 9001, CURRENT_TIMESTAMP),
(7640, 7517, 'issueType', '问题类型', 'TEXT', 1, 'MANUAL', NULL, NULL, NULL, '请输入问题类型', 3, NULL, 9001, CURRENT_TIMESTAMP),
(7641, 7517, 'issueDesc', '问题描述', 'TEXTAREA', 1, 'MANUAL', NULL, NULL, NULL, '请描述试制问题', 4, NULL, 9001, CURRENT_TIMESTAMP),
(7642, 7517, 'responsibleUser', '责任人', 'USER', 1, 'USER', NULL, NULL, NULL, '请选择责任人', 5, NULL, 9001, CURRENT_TIMESTAMP),
(7643, 7517, 'dueDate', '要求完成日期', 'DATE', 1, 'MANUAL', NULL, NULL, NULL, '请选择要求完成日期', 6, NULL, 9001, CURRENT_TIMESTAMP),
(7644, 7518, 'auditPlanName', '审核计划名称', 'TEXT', 1, 'MANUAL', NULL, NULL, NULL, '请输入审核计划名称', 1, NULL, 9001, CURRENT_TIMESTAMP),
(7645, 7518, 'auditScope', '审核范围', 'TEXTAREA', 1, 'MANUAL', NULL, NULL, NULL, '请填写审核范围', 2, NULL, 9001, CURRENT_TIMESTAMP),
(7646, 7518, 'auditStandard', '审核标准', 'TEXT', 1, 'MANUAL', NULL, NULL, NULL, '请输入审核标准', 3, NULL, 9001, CURRENT_TIMESTAMP),
(7647, 7518, 'planStart', '计划开始', 'DATE', 1, 'MANUAL', NULL, NULL, NULL, '请选择计划开始日期', 4, NULL, 9001, CURRENT_TIMESTAMP),
(7648, 7518, 'planEnd', '计划结束', 'DATE', 1, 'MANUAL', NULL, NULL, NULL, '请选择计划结束日期', 5, NULL, 9001, CURRENT_TIMESTAMP),
(7649, 7519, 'changeType', '变更类型', 'SELECT', 1, 'DICT', 'oa_ecr_change_type', NULL, NULL, '请选择变更类型', 1, NULL, 9001, CURRENT_TIMESTAMP),
(7650, 7519, 'materialCode', '物料编码', 'TEXT', 1, 'MANUAL', NULL, NULL, NULL, '请输入物料编码', 2, NULL, 9001, CURRENT_TIMESTAMP),
(7651, 7519, 'changeReason', '变更原因', 'TEXTAREA', 1, 'MANUAL', NULL, NULL, NULL, '请说明变更原因', 3, NULL, 9001, CURRENT_TIMESTAMP),
(7652, 7519, 'riskDesc', '风险描述', 'TEXTAREA', 1, 'MANUAL', NULL, NULL, NULL, '请描述变更风险', 4, NULL, 9001, CURRENT_TIMESTAMP),
(7653, 7519, 'impactAnalysis', '影响分析', 'TEXTAREA', 1, 'MANUAL', NULL, NULL, NULL, '请填写影响分析', 5, NULL, 9001, CURRENT_TIMESTAMP),
(7654, 7520, 'noticeType', '通知类型', 'SELECT', 1, 'DICT', 'oa_change_notice_type', NULL, NULL, '请选择通知类型', 1, NULL, 9001, CURRENT_TIMESTAMP),
(7655, 7520, 'materialCode', '物料编码', 'TEXT', 1, 'MANUAL', NULL, NULL, NULL, '请输入物料编码', 2, NULL, 9001, CURRENT_TIMESTAMP),
(7656, 7520, 'docCode', '图纸/文档编号', 'TEXT', 1, 'MANUAL', NULL, NULL, NULL, '请输入图纸或文档编号', 3, NULL, 9001, CURRENT_TIMESTAMP),
(7657, 7520, 'noticeTitle', '通知标题', 'TEXT', 1, 'MANUAL', NULL, NULL, NULL, '请输入通知标题', 4, NULL, 9001, CURRENT_TIMESTAMP),
(7658, 7520, 'receiverUserIds', '接收人', 'USER', 1, 'USER', NULL, NULL, NULL, '请选择接收人', 5, NULL, 9001, CURRENT_TIMESTAMP),
(7659, 7521, 'trialType', '试流类型', 'SELECT', 1, 'DICT', 'oa_mold_trial_type', NULL, NULL, '请选择检查/试流类型', 1, NULL, 9001, CURRENT_TIMESTAMP),
(7660, 7521, 'moldCode', '模具编码', 'TEXT', 0, 'MANUAL', NULL, NULL, NULL, '请输入模具编码', 2, NULL, 9001, CURRENT_TIMESTAMP),
(7661, 7521, 'partCode', '零件编码', 'TEXT', 1, 'MANUAL', NULL, NULL, NULL, '请输入零件编码', 3, NULL, 9001, CURRENT_TIMESTAMP),
(7662, 7521, 'materialCode', '物料编码', 'TEXT', 1, 'MANUAL', NULL, NULL, NULL, '请输入物料编码', 4, NULL, 9001, CURRENT_TIMESTAMP),
(7663, 7521, 'trialResult', '试流结论', 'TEXTAREA', 1, 'MANUAL', NULL, NULL, NULL, '请填写试流结论', 5, NULL, 9001, CURRENT_TIMESTAMP);

INSERT INTO oa_process_definition (id, process_code, process_name, form_id, category, version_no, status, definition_json, description, remark, created_by, created_at) VALUES
(7530, 'OA_CREDIT_FLOW', '客户授信审批流程', 7510, '销售生产', 1, 'PUBLISHED', NULL, '授信申请经部门主管、财务、销售总监按额度授权矩阵审批', '示例流程，实施时由业务方通过流程设计器维护', 9001, CURRENT_TIMESTAMP),
(7531, 'OA_PRICE_FLOW', '价格审批流程', 7511, '销售生产', 1, 'PUBLISHED', NULL, '价格申请经成本核价、销售/采购主管审批后生效', '示例流程，实施时由业务方通过流程设计器维护', 9001, CURRENT_TIMESTAMP),
(7532, 'OA_DELIVERY_FLOW', '交期延误协调流程', 7512, '销售生产', 1, 'PUBLISHED', NULL, '交期协调经责任部门确认措施、销售确认承诺交期', '示例流程，实施时由业务方通过流程设计器维护', 9001, CURRENT_TIMESTAMP),
(7533, 'OA_VOUCHER_FLOW', '订货传票审批流程', 7513, '销售生产', 1, 'PUBLISHED', NULL, '订货传票经部门主管、供应链审批', '示例流程，实施时由业务方通过流程设计器维护', 9001, CURRENT_TIMESTAMP),
(7534, 'OA_SUPPLIER_EVAL_FLOW', '供方考评审批流程', 7514, '品质', 1, 'PUBLISHED', NULL, '供方考评经质量主管、采购会签后生效', '示例流程，实施时由业务方通过流程设计器维护', 9001, CURRENT_TIMESTAMP),
(7535, 'OA_INSPECTION_FLOW', '检测委托审批流程', 7515, '品质', 1, 'PUBLISHED', NULL, '检测委托经部门主管、实验室受理', '示例流程，实施时由业务方通过流程设计器维护', 9001, CURRENT_TIMESTAMP),
(7536, 'OA_FIVE_M_FLOW', '5M 变更审批流程', 7516, '研发技术', 1, 'PUBLISHED', NULL, '5M 变更经技术评审、质量会签后批准生效', '示例流程，实施时由业务方通过流程设计器维护', 9001, CURRENT_TIMESTAMP),
(7537, 'OA_SAMPLE_ISSUE_FLOW', '样品试制问题改善流程', 7517, '研发技术', 1, 'PUBLISHED', NULL, '样品问题改善经责任人制定措施、技术验证后关闭', '示例流程，实施时由业务方通过流程设计器维护', 9001, CURRENT_TIMESTAMP),
(7538, 'OA_AUDIT_FLOW', '内部审核实施计划流程', 7518, '研发技术', 1, 'PUBLISHED', NULL, '内部审核计划经管理者代表批准后实施', '示例流程，实施时由业务方通过流程设计器维护', 9001, CURRENT_TIMESTAMP),
(7539, 'OA_ECR_FLOW', '工程变更风险评审流程', 7519, '研发技术', 1, 'PUBLISHED', NULL, 'ECR 经跨部门风险评审会签后转 PLM 工程变更', '示例流程，实施时由业务方通过流程设计器维护', 9001, CURRENT_TIMESTAMP),
(7540, 'OA_CHANGE_NOTICE_FLOW', '变更通知与图纸补发流程', 7520, '研发技术', 1, 'PUBLISHED', NULL, '变更通知经技术审批后发放并收集签收记录', '示例流程，实施时由业务方通过流程设计器维护', 9001, CURRENT_TIMESTAMP),
(7541, 'OA_MOLD_TRIAL_FLOW', '新开模检查与试流流程', 7521, '研发技术', 1, 'PUBLISHED', NULL, '新开模检查与试流经技术、质量确认结论后关闭', '示例流程，实施时由业务方通过流程设计器维护', 9001, CURRENT_TIMESTAMP);

INSERT INTO oa_process_node (id, process_id, node_code, node_name, node_type, approver_type, approver_value, allow_delegate, sort_no, remark, created_by, created_at) VALUES
(7560, 7530, 'N1', '部门主管审批', 'APPROVAL', 'ROLE', '2001', 1, 1, '示例节点，按角色审批', 9001, CURRENT_TIMESTAMP),
(7561, 7530, 'N2', '财务与销售总监审批', 'APPROVAL', 'ROLE', '2001', 1, 2, '示例节点，额度授权矩阵待业务方确认', 9001, CURRENT_TIMESTAMP),
(7562, 7531, 'N1', '成本核价', 'APPROVAL', 'ROLE', '2001', 1, 1, '示例节点，按角色审批', 9001, CURRENT_TIMESTAMP),
(7563, 7531, 'N2', '主管审批', 'APPROVAL', 'ROLE', '2001', 1, 2, '示例节点，按角色审批', 9001, CURRENT_TIMESTAMP),
(7564, 7532, 'N1', '责任部门确认措施', 'APPROVAL', 'ROLE', '2001', 1, 1, '示例节点，按角色审批', 9001, CURRENT_TIMESTAMP),
(7565, 7532, 'N2', '销售确认承诺交期', 'APPROVAL', 'ROLE', '2001', 1, 2, '示例节点，按角色审批', 9001, CURRENT_TIMESTAMP),
(7566, 7533, 'N1', '部门主管审批', 'APPROVAL', 'ROLE', '2001', 1, 1, '示例节点，按角色审批', 9001, CURRENT_TIMESTAMP),
(7567, 7533, 'N2', '供应链审批', 'APPROVAL', 'ROLE', '2001', 1, 2, '示例节点，按角色审批', 9001, CURRENT_TIMESTAMP),
(7568, 7534, 'N1', '质量主管审批', 'APPROVAL', 'ROLE', '2001', 1, 1, '示例节点，按角色审批', 9001, CURRENT_TIMESTAMP),
(7569, 7534, 'N2', '采购会签', 'APPROVAL', 'ROLE', '2001', 1, 2, '示例节点，按角色审批', 9001, CURRENT_TIMESTAMP),
(7570, 7535, 'N1', '部门主管审批', 'APPROVAL', 'ROLE', '2001', 1, 1, '示例节点，按角色审批', 9001, CURRENT_TIMESTAMP),
(7571, 7535, 'N2', '实验室受理', 'APPROVAL', 'ROLE', '2001', 1, 2, '示例节点，按角色审批', 9001, CURRENT_TIMESTAMP),
(7572, 7536, 'N1', '技术评审', 'APPROVAL', 'ROLE', '2001', 1, 1, '示例节点，按角色审批', 9001, CURRENT_TIMESTAMP),
(7573, 7536, 'N2', '质量会签', 'APPROVAL', 'ROLE', '2001', 1, 2, '示例节点，按角色审批', 9001, CURRENT_TIMESTAMP),
(7574, 7537, 'N1', '责任人措施评审', 'APPROVAL', 'ROLE', '2001', 1, 1, '示例节点，按角色审批', 9001, CURRENT_TIMESTAMP),
(7575, 7537, 'N2', '技术验证', 'APPROVAL', 'ROLE', '2001', 1, 2, '示例节点，按角色审批', 9001, CURRENT_TIMESTAMP),
(7576, 7538, 'N1', '管理者代表批准', 'APPROVAL', 'ROLE', '2001', 1, 1, '示例节点，按角色审批', 9001, CURRENT_TIMESTAMP),
(7577, 7538, 'N2', '审核组长确认', 'APPROVAL', 'ROLE', '2001', 1, 2, '示例节点，按角色审批', 9001, CURRENT_TIMESTAMP),
(7578, 7539, 'N1', '跨部门风险评审核', 'APPROVAL', 'ROLE', '2001', 1, 1, '示例节点，按角色审批', 9001, CURRENT_TIMESTAMP),
(7579, 7539, 'N2', '技术总监批准', 'APPROVAL', 'ROLE', '2001', 1, 2, '示例节点，转 PLM 工程变更', 9001, CURRENT_TIMESTAMP),
(7580, 7540, 'N1', '技术审批', 'APPROVAL', 'ROLE', '2001', 1, 1, '示例节点，按角色审批', 9001, CURRENT_TIMESTAMP),
(7581, 7540, 'N2', '文控发放', 'APPROVAL', 'ROLE', '2001', 1, 2, '示例节点，按角色审批', 9001, CURRENT_TIMESTAMP),
(7582, 7541, 'N1', '技术与质量确认', 'APPROVAL', 'ROLE', '2001', 1, 1, '示例节点，按角色审批', 9001, CURRENT_TIMESTAMP),
(7583, 7541, 'N2', '结论批准', 'APPROVAL', 'ROLE', '2001', 1, 2, '示例节点，按角色审批', 9001, CURRENT_TIMESTAMP);
