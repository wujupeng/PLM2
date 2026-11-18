-- G4-N2 SRM—寻源与询报价（WBS T032）初始化：菜单/按钮权限、角色授权、字典与可配置项。
-- 号段基线（V91 之后已占用的最大值）：sys_permission=4572（本脚本从 4580 起）、
-- sys_role_permission=13869（从 13880 起）、sys_dictionary=8250（从 8260 起）、sys_config=6341（从 6350 起）。
-- 菜单说明：复用 V91 已建的 SRM 顶级菜单域（4550）；
--           寻源与询报价（4580）为其下二级分组；采购/审批复用既有平台底座。

-- ========== SRM 寻源与询报价分组菜单（4580，挂在 4550 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4580, 'srm:sourcing', '寻源与询报价', 'menu', 4550, '/srm/sourcing', 'ShoppingCartOutlined', 2, 1);

-- ========== SRM 寻源与询报价业务菜单（4581-4587，挂在 4580 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4581, 'srm:sourcing:request', '采购需求寻源', 'menu', 4580, '/srm/sourcing/requests', 'FileSearchOutlined', 1, 1),
(4582, 'srm:sourcing:rfq', '询价单', 'menu', 4580, '/srm/sourcing/rfqs', 'ProfileOutlined', 2, 1),
(4583, 'srm:sourcing:rfq-supplier', '询价邀请', 'menu', 4580, '/srm/sourcing/rfq-suppliers', 'UsergroupAddOutlined', 3, 1),
(4584, 'srm:sourcing:quote', '供应商报价', 'menu', 4580, '/srm/sourcing/quotes', 'AccountBookOutlined', 4, 1),
(4585, 'srm:sourcing:compare', '报价比价', 'menu', 4580, '/srm/sourcing/compares', 'BarChartOutlined', 5, 1),
(4586, 'srm:sourcing:award', '定点定标', 'menu', 4580, '/srm/sourcing/awards', 'TrophyOutlined', 6, 1),
(4587, 'srm:sourcing:price', '定点定价', 'menu', 4580, '/srm/sourcing/prices', 'MoneyCollectOutlined', 7, 1);

-- ========== SRM 寻源与询报价按钮（4588-4601） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4588, 'srm:sourcing:request:list', '查询采购需求寻源', 'button', 4581, NULL, NULL, 1, 1),
(4589, 'srm:sourcing:request:manage', '维护采购需求寻源', 'button', 4581, NULL, NULL, 2, 1),
(4590, 'srm:sourcing:rfq:list', '查询询价单', 'button', 4582, NULL, NULL, 1, 1),
(4591, 'srm:sourcing:rfq:manage', '维护询价单', 'button', 4582, NULL, NULL, 2, 1),
(4592, 'srm:sourcing:rfq-supplier:list', '查询询价邀请', 'button', 4583, NULL, NULL, 1, 1),
(4593, 'srm:sourcing:rfq-supplier:manage', '维护询价邀请', 'button', 4583, NULL, NULL, 2, 1),
(4594, 'srm:sourcing:quote:list', '查询供应商报价', 'button', 4584, NULL, NULL, 1, 1),
(4595, 'srm:sourcing:quote:manage', '维护供应商报价', 'button', 4584, NULL, NULL, 2, 1),
(4596, 'srm:sourcing:compare:list', '查询报价比价', 'button', 4585, NULL, NULL, 1, 1),
(4597, 'srm:sourcing:compare:manage', '维护报价比价', 'button', 4585, NULL, NULL, 2, 1),
(4598, 'srm:sourcing:award:list', '查询定点定标', 'button', 4586, NULL, NULL, 1, 1),
(4599, 'srm:sourcing:award:manage', '维护定点定标', 'button', 4586, NULL, NULL, 2, 1),
(4600, 'srm:sourcing:price:list', '查询定点定价', 'button', 4587, NULL, NULL, 1, 1),
(4601, 'srm:sourcing:price:manage', '维护定点定价', 'button', 4587, NULL, NULL, 2, 1);

-- ========== 角色授权 ==========

-- 管理员（2001）：授予全部权限（1 分组 + 7 菜单 + 14 按钮，共 22 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(13880, 2001, 4580), (13881, 2001, 4581), (13882, 2001, 4582), (13883, 2001, 4583),
(13884, 2001, 4584), (13885, 2001, 4585), (13886, 2001, 4586), (13887, 2001, 4587),
(13888, 2001, 4588), (13889, 2001, 4589), (13890, 2001, 4590), (13891, 2001, 4591),
(13892, 2001, 4592), (13893, 2001, 4593), (13894, 2001, 4594), (13895, 2001, 4595),
(13896, 2001, 4596), (13897, 2001, 4597), (13898, 2001, 4598), (13899, 2001, 4599),
(13900, 2001, 4600), (13901, 2001, 4601);

-- 供应链专员（2004）：授予全部权限（寻源与询报价为供应链职能主责，共 22 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(13902, 2004, 4580), (13903, 2004, 4581), (13904, 2004, 4582), (13905, 2004, 4583),
(13906, 2004, 4584), (13907, 2004, 4585), (13908, 2004, 4586), (13909, 2004, 4587),
(13910, 2004, 4588), (13911, 2004, 4589), (13912, 2004, 4590), (13913, 2004, 4591),
(13914, 2004, 4592), (13915, 2004, 4593), (13916, 2004, 4594), (13917, 2004, 4595),
(13918, 2004, 4596), (13919, 2004, 4597), (13920, 2004, 4598), (13921, 2004, 4599),
(13922, 2004, 4600), (13923, 2004, 4601);

-- 研发工程师（2002）：授予分组/菜单 + 仅查询按钮（15 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(13924, 2002, 4580), (13925, 2002, 4581), (13926, 2002, 4582), (13927, 2002, 4583),
(13928, 2002, 4584), (13929, 2002, 4585), (13930, 2002, 4586), (13931, 2002, 4587),
(13932, 2002, 4588), (13933, 2002, 4590), (13934, 2002, 4592), (13935, 2002, 4594),
(13936, 2002, 4596), (13937, 2002, 4598), (13938, 2002, 4600);

-- 质量工程师（2003）：授予分组/菜单 + 仅查询按钮（15 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(13939, 2003, 4580), (13940, 2003, 4581), (13941, 2003, 4582), (13942, 2003, 4583),
(13943, 2003, 4584), (13944, 2003, 4585), (13945, 2003, 4586), (13946, 2003, 4587),
(13947, 2003, 4588), (13948, 2003, 4590), (13949, 2003, 4592), (13950, 2003, 4594),
(13951, 2003, 4596), (13952, 2003, 4598), (13953, 2003, 4600);

-- 生产现场（2005）：授予分组/菜单 + 仅查询按钮（15 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(13954, 2005, 4580), (13955, 2005, 4581), (13956, 2005, 4582), (13957, 2005, 4583),
(13958, 2005, 4584), (13959, 2005, 4585), (13960, 2005, 4586), (13961, 2005, 4587),
(13962, 2005, 4588), (13963, 2005, 4590), (13964, 2005, 4592), (13965, 2005, 4594),
(13966, 2005, 4596), (13967, 2005, 4598), (13968, 2005, 4600);

-- 只读用户（2006）：授予分组/菜单 + 仅查询按钮（15 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(13969, 2006, 4580), (13970, 2006, 4581), (13971, 2006, 4582), (13972, 2006, 4583),
(13973, 2006, 4584), (13974, 2006, 4585), (13975, 2006, 4586), (13976, 2006, 4587),
(13977, 2006, 4588), (13978, 2006, 4590), (13979, 2006, 4592), (13980, 2006, 4594),
(13981, 2006, 4596), (13982, 2006, 4598), (13983, 2006, 4600);

-- ========== SRM 寻源与询报价字典（8260-8312） ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(8260, 'srm_sourcing_type', '询价采购', 'RFQ', 1, 1, NULL),
(8261, 'srm_sourcing_type', '公开寻源', 'PUBLIC', 2, 1, NULL),
(8262, 'srm_sourcing_type', '邀请寻源', 'INVITED', 3, 1, NULL),
(8263, 'srm_sourcing_type', '直接采购', 'DIRECT', 4, 1, NULL),
(8264, 'srm_sourcing_type', '竞争性谈判', 'COMPETITIVE', 5, 1, NULL),
(8265, 'srm_sourcing_status', '草稿', 'DRAFT', 1, 1, NULL),
(8266, 'srm_sourcing_status', '待审批', 'SUBMITTED', 2, 1, NULL),
(8267, 'srm_sourcing_status', '已批准', 'APPROVED', 3, 1, NULL),
(8268, 'srm_sourcing_status', '寻源中', 'SOURCING', 4, 1, NULL),
(8269, 'srm_sourcing_status', '已关闭', 'CLOSED', 5, 1, NULL),
(8270, 'srm_sourcing_status', '已取消', 'CANCELLED', 6, 1, NULL),
(8271, 'srm_rfq_type', '公开询价', 'PUBLIC', 1, 1, NULL),
(8272, 'srm_rfq_type', '邀请询价', 'INVITED', 2, 1, NULL),
(8273, 'srm_rfq_type', '直接询价', 'DIRECT', 3, 1, NULL),
(8274, 'srm_rfq_status', '草稿', 'DRAFT', 1, 1, NULL),
(8275, 'srm_rfq_status', '已发布', 'PUBLISHED', 2, 1, NULL),
(8276, 'srm_rfq_status', '报价中', 'QUOTING', 3, 1, NULL),
(8277, 'srm_rfq_status', '已截止', 'CLOSED', 4, 1, NULL),
(8278, 'srm_rfq_status', '已取消', 'CANCELLED', 5, 1, NULL),
(8279, 'srm_rfq_supplier_status', '已邀请', 'INVITED', 1, 1, NULL),
(8280, 'srm_rfq_supplier_status', '已应答', 'RESPONDED', 2, 1, NULL),
(8281, 'srm_rfq_supplier_status', '已拒绝', 'DECLINED', 3, 1, NULL),
(8282, 'srm_rfq_supplier_status', '已过期', 'EXPIRED', 4, 1, NULL),
(8283, 'srm_quote_status', '草稿', 'DRAFT', 1, 1, NULL),
(8284, 'srm_quote_status', '已提交', 'SUBMITTED', 2, 1, NULL),
(8285, 'srm_quote_status', '已撤回', 'WITHDRAWN', 3, 1, NULL),
(8286, 'srm_quote_status', '已接受', 'ACCEPTED', 4, 1, NULL),
(8287, 'srm_quote_status', '已拒绝', 'REJECTED', 5, 1, NULL),
(8288, 'srm_price_compare_status', '草稿', 'DRAFT', 1, 1, NULL),
(8289, 'srm_price_compare_status', '已比价', 'COMPARED', 2, 1, NULL),
(8290, 'srm_price_compare_status', '已确认', 'CONFIRMED', 3, 1, NULL),
(8291, 'srm_price_compare_status', '已取消', 'CANCELLED', 4, 1, NULL),
(8292, 'srm_award_type', '单一供应商', 'SINGLE', 1, 1, NULL),
(8293, 'srm_award_type', '多供应商', 'MULTI', 2, 1, NULL),
(8294, 'srm_award_type', '拆分定点', 'SPLIT', 3, 1, NULL),
(8295, 'srm_award_status', '草稿', 'DRAFT', 1, 1, NULL),
(8296, 'srm_award_status', '待审批', 'SUBMITTED', 2, 1, NULL),
(8297, 'srm_award_status', '已批准', 'APPROVED', 3, 1, NULL),
(8298, 'srm_award_status', '已定点', 'AWARDED', 4, 1, NULL),
(8299, 'srm_award_status', '已取消', 'CANCELLED', 5, 1, NULL),
(8300, 'srm_price_type', '协议价', 'AGREEMENT', 1, 1, NULL),
(8301, 'srm_price_type', '一次性价格', 'ONE_TIME', 2, 1, NULL),
(8302, 'srm_price_type', '年度框架', 'ANNUAL', 3, 1, NULL),
(8303, 'srm_price_type', '季度框架', 'QUARTERLY', 4, 1, NULL),
(8304, 'srm_price_agreement_status', '草稿', 'DRAFT', 1, 1, NULL),
(8305, 'srm_price_agreement_status', '生效', 'ACTIVE', 2, 1, NULL),
(8306, 'srm_price_agreement_status', '已过期', 'EXPIRED', 3, 1, NULL),
(8307, 'srm_price_agreement_status', '已终止', 'TERMINATED', 4, 1, NULL),
(8308, 'srm_currency', '人民币', 'CNY', 1, 1, NULL),
(8309, 'srm_currency', '美元', 'USD', 2, 1, NULL),
(8310, 'srm_currency', '欧元', 'EUR', 3, 1, NULL),
(8311, 'srm_currency', '日元', 'JPY', 4, 1, NULL),
(8312, 'srm_currency', '港币', 'HKD', 5, 1, NULL);

-- ========== SRM 寻源与询报价可配置项（6350-6361） ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(6350, 'SRM', 'srm.sourcing.enabled', '寻源与询报价启用开关', 'true', 0, 1, 'SRM 寻源与询报价总开关，默认启用'),
(6351, 'SRM', 'srm.sourcing.request.auto.number', '寻源需求单自动编号', 'true', 0, 1, '寻源需求单号为空时是否自动生成'),
(6352, 'SRM', 'srm.sourcing.rfq.auto.number', '询价单自动编号', 'true', 0, 1, '询价单号为空时是否自动生成'),
(6353, 'SRM', 'srm.sourcing.rfq.supplier.min.count', '询价邀请最少供应商数', '3', 1, 1, '待业务方确认：RFQ 邀请供应商数量下限'),
(6354, 'SRM', 'srm.sourcing.quote.currency.default', '报价默认币种', 'CNY', 1, 1, '待业务方确认：供应商报价默认币种'),
(6355, 'SRM', 'srm.sourcing.quote.valid.days', '报价有效期天数', '90', 1, 1, '待业务方确认：报价默认有效天数'),
(6356, 'SRM', 'srm.sourcing.compare.rule', '比价规则', 'LOWEST_PRICE', 1, 1, '待业务方确认：比价默认规则（最低价/综合评分）'),
(6357, 'SRM', 'srm.sourcing.award.approve.required', '定点审批必填', 'true', 1, 1, '待业务方确认：定点定标是否需审批'),
(6358, 'SRM', 'srm.sourcing.award.split.enabled', '拆分定点启用', 'true', 1, 1, '待业务方确认：是否允许按数量拆分定点多供应商'),
(6359, 'SRM', 'srm.sourcing.price.agreement.enabled', '定点定价协议启用开关', 'true', 0, 1, '是否启用定点定价协议（价格库）'),
(6360, 'SRM', 'srm.sourcing.price.expire.warn.days', '定价协议到期预警天数', '30', 1, 1, '待业务方确认：协议价到期前预警天数'),
(6361, 'SRM', 'srm.sourcing.rfq.deadline.reminder.days', '报价截止提醒天数', '2', 1, 1, '待业务方确认：报价截止前提醒天数');
