-- G1-N5 公共平台底座—多币种多税率（WBS T101）初始化：菜单/按钮权限、角色授权、字典与可配置项。
-- 号段基线（V52 之前已占用的最大值）：sys_permission=4049、sys_role_permission=11996、
-- sys_dictionary=7132、sys_config=6104；本脚本从各自之后继续编号，避免主键冲突。
-- 菜单继续挂在「平台底座」（parent_id=3920）下，与集成/报表/文件/身份权限/多组织多工厂并列。

-- ========== 多币种多税率菜单（4060-4064，挂在平台底座 3920 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4060, 'platform:finance:currency', '币种管理', 'menu', 3920, '/platform/finance/currencies', 'GlobalOutlined', 51, 1),
(4061, 'platform:finance:exchangerate', '汇率管理', 'menu', 3920, '/platform/finance/exchange-rates', 'SwapOutlined', 52, 1),
(4062, 'platform:finance:taxrate', '税率管理', 'menu', 3920, '/platform/finance/tax-rates', 'PercentageOutlined', 53, 1),
(4063, 'platform:finance:pricerule', '价格规则', 'menu', 3920, '/platform/finance/price-rules', 'TagsOutlined', 54, 1),
(4064, 'platform:finance:roundingrule', '舍入规则', 'menu', 3920, '/platform/finance/rounding-rules', 'RetweetOutlined', 55, 1);

-- ========== 多币种多税率按钮（4070-4079） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4070, 'platform:finance:currency:list', '查询币种', 'button', 4060, NULL, NULL, 1, 1),
(4071, 'platform:finance:currency:manage', '维护币种', 'button', 4060, NULL, NULL, 2, 1),
(4072, 'platform:finance:exchangerate:list', '查询汇率', 'button', 4061, NULL, NULL, 1, 1),
(4073, 'platform:finance:exchangerate:manage', '维护汇率', 'button', 4061, NULL, NULL, 2, 1),
(4074, 'platform:finance:taxrate:list', '查询税率', 'button', 4062, NULL, NULL, 1, 1),
(4075, 'platform:finance:taxrate:manage', '维护税率', 'button', 4062, NULL, NULL, 2, 1),
(4076, 'platform:finance:pricerule:list', '查询价格规则', 'button', 4063, NULL, NULL, 1, 1),
(4077, 'platform:finance:pricerule:manage', '维护价格规则', 'button', 4063, NULL, NULL, 2, 1),
(4078, 'platform:finance:roundingrule:list', '查询舍入规则', 'button', 4064, NULL, NULL, 1, 1),
(4079, 'platform:finance:roundingrule:manage', '维护舍入规则', 'button', 4064, NULL, NULL, 2, 1);

-- ========== 角色授权 ==========

-- 管理员（2001）：授予多币种多税率全部权限
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(12000, 2001, 4060), (12001, 2001, 4061), (12002, 2001, 4062), (12003, 2001, 4063), (12004, 2001, 4064),
(12005, 2001, 4070), (12006, 2001, 4071), (12007, 2001, 4072), (12008, 2001, 4073), (12009, 2001, 4074),
(12010, 2001, 4075), (12011, 2001, 4076), (12012, 2001, 4077), (12013, 2001, 4078), (12014, 2001, 4079);

-- 只读用户（2006）：全部菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(12015, 2006, 4060), (12016, 2006, 4061), (12017, 2006, 4062), (12018, 2006, 4063), (12019, 2006, 4064),
(12020, 2006, 4070), (12021, 2006, 4072), (12022, 2006, 4074), (12023, 2006, 4076), (12024, 2006, 4078);

-- 供应链专员（2004）：币种、汇率、税率只读
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(12025, 2004, 4060), (12026, 2004, 4061), (12027, 2004, 4062),
(12028, 2004, 4070), (12029, 2004, 4072), (12030, 2004, 4074);

-- 研发工程师（2002）：币种、税率只读
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(12031, 2002, 4060), (12032, 2002, 4062),
(12033, 2002, 4070), (12034, 2002, 4074);

-- 质量工程师（2003）：币种只读
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(12035, 2003, 4060), (12036, 2003, 4070);

-- 生产现场（2005）：币种只读
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(12037, 2005, 4060), (12038, 2005, 4070);

-- ========== 多币种多税率字典（7140-7166） ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(7140, 'currency_status', '生效', 'ACTIVE', 1, 1, NULL),
(7141, 'currency_status', '停用', 'DISABLED', 2, 1, NULL),
(7142, 'rate_type', '即期汇率', 'SPOT', 1, 1, NULL),
(7143, 'rate_type', '买入价', 'BUY', 2, 1, NULL),
(7144, 'rate_type', '卖出价', 'SELL', 3, 1, NULL),
(7145, 'rate_type', '中间价', 'AVG', 4, 1, NULL),
(7146, 'rate_status', '生效', 'ACTIVE', 1, 1, NULL),
(7147, 'rate_status', '已过期', 'EXPIRED', 2, 1, NULL),
(7148, 'rate_status', '停用', 'DISABLED', 3, 1, NULL),
(7149, 'tax_type', '增值税', 'VAT', 1, 1, NULL),
(7150, 'tax_type', '企业所得税', 'CIT', 2, 1, NULL),
(7151, 'tax_type', '其他', 'OTHER', 3, 1, NULL),
(7152, 'tax_status', '生效', 'ACTIVE', 1, 1, NULL),
(7153, 'tax_status', '已过期', 'EXPIRED', 2, 1, NULL),
(7154, 'tax_status', '停用', 'DISABLED', 3, 1, NULL),
(7155, 'price_mode', '含税价', 'TAX_INCLUSIVE', 1, 1, NULL),
(7156, 'price_mode', '未税价', 'TAX_EXCLUSIVE', 2, 1, NULL),
(7157, 'rounding_mode', '四舍五入', 'HALF_UP', 1, 1, NULL),
(7158, 'rounding_mode', '银行家舍入', 'HALF_EVEN', 2, 1, NULL),
(7159, 'rounding_mode', '向上进位', 'UP', 3, 1, NULL),
(7160, 'rounding_mode', '向下截断', 'DOWN', 4, 1, NULL),
(7161, 'rounding_target', '单价', 'PRICE', 1, 1, NULL),
(7162, 'rounding_target', '金额', 'AMOUNT', 2, 1, NULL),
(7163, 'rounding_target', '税额', 'TAX', 3, 1, NULL),
(7164, 'rounding_target', '数量', 'QTY', 4, 1, NULL),
(7165, 'finance_rule_status', '生效', 'ACTIVE', 1, 1, NULL),
(7166, 'finance_rule_status', '停用', 'DISABLED', 2, 1, NULL);

-- ========== 多币种多税率可配置项（6110-6114） ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(6110, 'FIN', 'finance.base.currency', '本位币', 'CNY', 1, 1, '待业务方确认集团本位币，多法人场景由法人主体本位币优先'),
(6111, 'FIN', 'finance.exchange.rate.auto.sync', '汇率自动同步开关', 'false', 1, 1, '待业务方确认汇率来源与同步频率，默认关闭'),
(6112, 'FIN', 'finance.price.tax.inclusive.default', '默认价格口径', 'TAX_EXCLUSIVE', 1, 1, '待业务方确认默认价格口径（含税/未税）'),
(6113, 'FIN', 'finance.rounding.mode.default', '默认舍入方式', 'HALF_UP', 0, 1, '默认四舍五入，可按规则覆盖'),
(6114, 'FIN', 'finance.amount.precision', '默认金额小数位', '2', 1, 1, '待业务方确认金额精度与显示规则');
