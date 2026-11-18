-- N5 初始化数据：编码与标签的菜单与按钮权限、字典、可配置项、统一码表、编码规则与分段、标签模板
-- 注意：示例数据仅用于联调与验收演示，实施时由业务方通过导入或界面替换。

-- ========== N5 权限 ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(3060, 'label-domain', '编码与标签', 'menu', 0, NULL, 'QrcodeOutlined', 50, 1),
(3061, 'code-rule', '编码规则', 'menu', 3060, '/code-rule', 'CodeOutlined', 1, 1),
(3062, 'code-dict', '统一码表', 'menu', 3060, '/code-dict', 'BookOutlined', 2, 1),
(3063, 'label-template', '标签模板', 'menu', 3060, '/label-template', 'PictureOutlined', 3, 1),
(3064, 'relabel', '扫描换标', 'menu', 3060, '/relabel', 'ScanOutlined', 4, 1),
(3065, 'label-print', '打印与补打', 'menu', 3060, '/label-print', 'PrinterOutlined', 5, 1),
(3371, 'code:rule:list', '查询编码规则', 'button', 3061, NULL, NULL, 1, 1),
(3372, 'code:rule:save', '维护编码规则', 'button', 3061, NULL, NULL, 2, 1),
(3373, 'code:rule:delete', '删除编码规则', 'button', 3061, NULL, NULL, 3, 1),
(3374, 'code:dict:list', '查询统一码表', 'button', 3062, NULL, NULL, 1, 1),
(3375, 'code:dict:save', '维护统一码表', 'button', 3062, NULL, NULL, 2, 1),
(3376, 'code:dict:delete', '删除统一码表', 'button', 3062, NULL, NULL, 3, 1),
(3377, 'label:template:list', '查询标签模板', 'button', 3063, NULL, NULL, 1, 1),
(3378, 'label:template:save', '维护标签模板', 'button', 3063, NULL, NULL, 2, 1),
(3379, 'label:template:delete', '删除标签模板', 'button', 3063, NULL, NULL, 3, 1),
(3381, 'relabel:workbench', '查询换标记录', 'button', 3064, NULL, NULL, 1, 1),
(3382, 'relabel:scan', '扫描换标', 'button', 3064, NULL, NULL, 2, 1),
(3383, 'label:print', '标签打印', 'button', 3065, NULL, NULL, 1, 1),
(3384, 'label:reprint', '标签补打', 'button', 3065, NULL, NULL, 2, 1),
(3385, 'label:print:log', '查询打印日志', 'button', 3065, NULL, NULL, 3, 1);

-- 管理员：授予 N5 全部权限
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(9701, 2001, 3060), (9702, 2001, 3061), (9703, 2001, 3062), (9704, 2001, 3063),
(9705, 2001, 3064), (9706, 2001, 3065),
(9707, 2001, 3371), (9708, 2001, 3372), (9709, 2001, 3373),
(9710, 2001, 3374), (9711, 2001, 3375), (9712, 2001, 3376),
(9713, 2001, 3377), (9714, 2001, 3378), (9715, 2001, 3379),
(9716, 2001, 3381), (9717, 2001, 3382),
(9718, 2001, 3383), (9719, 2001, 3384), (9720, 2001, 3385);

-- 研发工程师（2002）：可维护编码规则、统一码表、标签模板，并执行换标与打印
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(9721, 2002, 3060), (9722, 2002, 3061), (9723, 2002, 3062), (9724, 2002, 3063),
(9725, 2002, 3064), (9726, 2002, 3065),
(9727, 2002, 3371), (9728, 2002, 3372),
(9729, 2002, 3374), (9730, 2002, 3375),
(9731, 2002, 3377), (9732, 2002, 3378),
(9733, 2002, 3381), (9734, 2002, 3382),
(9735, 2002, 3383), (9736, 2002, 3384), (9737, 2002, 3385);

-- 供应链（2004）：维护统一码表，执行换标与打印
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(9741, 2004, 3060), (9742, 2004, 3061), (9743, 2004, 3062), (9744, 2004, 3063),
(9745, 2004, 3064), (9746, 2004, 3065),
(9747, 2004, 3371), (9748, 2004, 3374), (9749, 2004, 3375), (9750, 2004, 3377),
(9751, 2004, 3381), (9752, 2004, 3382),
(9753, 2004, 3383), (9754, 2004, 3384), (9755, 2004, 3385);

-- 生产（2005）：换标与打印
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(9761, 2005, 3060), (9762, 2005, 3061), (9763, 2005, 3063), (9764, 2005, 3064), (9765, 2005, 3065),
(9766, 2005, 3371), (9767, 2005, 3377), (9768, 2005, 3381), (9769, 2005, 3382),
(9770, 2005, 3383), (9771, 2005, 3384), (9772, 2005, 3385);

-- 只读（2006）：仅查询
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(9781, 2006, 3060), (9782, 2006, 3061), (9783, 2006, 3062), (9784, 2006, 3063),
(9785, 2006, 3064), (9786, 2006, 3065),
(9787, 2006, 3371), (9788, 2006, 3374), (9789, 2006, 3377),
(9790, 2006, 3381), (9791, 2006, 3385);

-- ========== N5 字典 ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(4701, 'code_type', '14 位原编码', 'CODE14', 1, 1, '客户原零件号 + 版本号'),
(4702, 'code_type', '24 位追溯码', 'CODE24', 2, 1, '站点/年份/自然日/每日序列/零件号'),
(4703, 'code_type', '28 位旧追溯码', 'CODE28', 3, 1, '历史遗留追溯格式，仅兼容解析'),
(4711, 'code_rule_status', '草稿', 'draft', 1, 1, NULL),
(4712, 'code_rule_status', '已启用', 'enabled', 2, 1, NULL),
(4713, 'code_rule_status', '已停用', 'disabled', 3, 1, NULL),
(4721, 'code_segment_value_type', '固定值', 'FIXED', 1, 1, NULL),
(4722, 'code_segment_value_type', '业务字段', 'FIELD', 2, 1, NULL),
(4723, 'code_segment_value_type', '日期', 'DATE', 3, 1, NULL),
(4724, 'code_segment_value_type', '码表取值', 'DICT', 4, 1, NULL),
(4725, 'code_segment_value_type', '每日序列', 'SEQ', 5, 1, NULL),
(4731, 'code_date_pattern', '年份末位', 'YEAR_LAST1', 1, 1, '如 2026 → 6'),
(4732, 'code_date_pattern', '两位年份', 'YEAR2', 2, 1, '如 2026 → 26'),
(4733, 'code_date_pattern', '自然日（三位）', 'DAY_OF_YEAR', 3, 1, '平年 001-365，闰年 001-366'),
(4734, 'code_date_pattern', '两位月份', 'MONTH2', 4, 1, NULL),
(4735, 'code_date_pattern', '两位日期', 'DAY2', 5, 1, NULL),
(4736, 'code_date_pattern', '一位月份码', 'MONTH_CODE', 6, 1, '1-9 用数字，10/11/12 用 X/Y/Z，待业务方确认'),
(4737, 'code_date_pattern', '一位日期码', 'DAY_CODE', 7, 1, '1-9 数字、10-19 用 A-J、20-29 用 K-T、30/31 用 U/V，待业务方确认'),
(4741, 'label_type', '24 位追溯标签', 'CODE24', 1, 1, NULL),
(4742, 'label_type', '14 位原编码标签', 'CODE14', 2, 1, NULL),
(4743, 'label_type', '28 位追溯标签', 'CODE28', 3, 1, NULL),
(4751, 'barcode_type', 'Data Matrix', 'DATA_MATRIX', 1, 1, 'ECC200，默认条码类型'),
(4752, 'barcode_type', '二维码 QR', 'QR', 2, 1, NULL),
(4753, 'barcode_type', '一维码 Code128', 'CODE128', 3, 1, NULL),
(4761, 'scan_action_type', '首次换标', 'NEW', 1, 1, NULL),
(4762, 'scan_action_type', '复用已有映射', 'REUSE', 2, 1, NULL),
(4763, 'scan_action_type', '补打标签', 'REPRINT', 3, 1, NULL),
(4764, 'scan_action_type', '扫描失败', 'FAIL', 4, 1, NULL),
(4771, 'label_print_status', '打印成功', 'success', 1, 1, NULL),
(4772, 'label_print_status', '打印失败', 'failed', 2, 1, NULL),
(4773, 'label_print_status', '待打印', 'pending', 3, 1, NULL),
(4781, 'print_action_type', '首次打印', 'PRINT', 1, 1, NULL),
(4782, 'print_action_type', '补打', 'REPRINT', 2, 1, NULL),
(4783, 'print_action_type', '作废', 'VOID', 3, 1, NULL),
(4791, 'code_mapping_status', '有效', 'active', 1, 1, NULL),
(4792, 'code_mapping_status', '已作废', 'void', 2, 1, NULL),
(4801, 'label_template_status', '草稿', 'draft', 1, 1, NULL),
(4802, 'label_template_status', '已发布', 'released', 2, 1, NULL),
(4803, 'label_template_status', '已停用', 'disabled', 3, 1, NULL),
(4811, 'code_dict_type', '制造地', 'code_plant', 1, 1, '24 位追溯码 3-4 位取值来源'),
(4812, 'code_dict_type', '年份', 'code_year', 2, 1, NULL),
(4813, 'code_dict_type', '零件类别', 'code_part_category', 3, 1, '28 位旧追溯码类别位取值来源'),
(4814, 'code_dict_type', '厂商', 'code_vendor', 4, 1, '28 位旧追溯码厂商位取值来源'),
(4815, 'code_dict_type', '线别', 'code_line', 5, 1, '28 位旧追溯码线别位取值来源');

-- ========== N5 可配置项：编码与标签的未明确规则，先落默认值，待业务方集中确认 ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(5401, 'LABEL', 'code.rule.scope', '编码规则适用范围', '按客户+项目+工厂可配置，未配置时取该编码类型的默认启用规则', 1, 1, '待业务方确认多客户/多工厂的规则差异口径'),
(5402, 'LABEL', 'code.14.version.length', '14 位原编码版本号位数', '3', 1, 1, '待业务方确认客户零件号位数与版本号位数是否固定为 11+3'),
(5403, 'LABEL', 'code.24.default.plant', '24 位追溯码默认制造地代码', 'XA', 1, 1, '待业务方提供制造地代码清单（示例 XA）'),
(5404, 'LABEL', 'code.24.reserved.prefix', '24 位追溯码前两位备用位默认值', '00', 1, 1, '待业务方确认备用位是否启用及取值规则'),
(5405, 'LABEL', 'code.24.reserved.middle', '24 位追溯码 13-16 位备用位默认值', '0000', 1, 1, '待业务方确认备用位是否启用及取值规则'),
(5406, 'LABEL', 'code.partNo8.mapping', '八位零件号取值来源', 'material.code', 1, 1, '待业务方提供八位零件号与 14 位原编码/物料编码的映射关系'),
(5407, 'LABEL', 'code.seq.dimension', '每日流水号维度', 'DAY', 0, 1, '按自然日切换，维度标识可由 code.rule.seq.scope 覆盖'),
(5408, 'LABEL', 'code.seq.scope', '每日流水号分组维度', 'plant+partNo8', 1, 1, '待业务方确认流水号按制造地+零件号还是按客户+项目分组'),
(5409, 'LABEL', 'code.seq.max', '每日流水号上限', '9999', 0, 1, '达到上限不回绕，直接报错提示业务方处理'),
(5410, 'LABEL', 'code.seq.warn.threshold', '每日流水号超限告警阈值', '9000', 0, 1, '达到阈值标记 warn_flag 并返回告警提示，不阻断生成'),
(5411, 'LABEL', 'code.relabel.idempotent', '重复扫描处理策略', 'reuse', 0, 1, 'reuse=返回已有映射（防重） / new=重新生成'),
(5412, 'LABEL', 'code.relabel.allow.void', '是否允许作废原映射后重新换标', 'false', 1, 1, '待业务方确认原码换标作废与重做流程'),
(5413, 'LABEL', 'code.relabel.auto.print', '换标成功后是否自动打印新标签', 'false', 0, 1, NULL),
(5414, 'LABEL', 'code.28.compat.policy', '28 位旧追溯码兼容策略', 'parse_only', 0, 1, 'parse_only=仅解析查询不新生成 / generate=允许生成'),
(5415, 'LABEL', 'code.28.month.code.map', '28 位月份码映射', '1-9 用数字,10=X,11=Y,12=Z', 1, 1, '待业务方确认 28 位旧追溯码月份位编码方式'),
(5416, 'LABEL', 'code.28.day.code.map', '28 位日期码映射', '1-9 数字,10-19=A-J,20-29=K-T,30=U,31=V', 1, 1, '待业务方确认 28 位旧追溯码日期位编码方式'),
(5421, 'LABEL', 'label.dm.ecc.level', 'Data Matrix 纠错等级', 'ECC200', 0, 1, NULL),
(5422, 'LABEL', 'label.dm.module.size', 'Data Matrix 模块尺寸(mm)', '0.40', 1, 1, '待业务方按打印精度确认模块尺寸'),
(5423, 'LABEL', 'label.paper.default', '默认标签纸尺寸(mm)', '50x30', 1, 1, '待业务方提供标签纸张尺寸与样张'),
(5424, 'LABEL', 'label.print.driver', '打印驱动与调用方式', '待业务方提供（打印机型号/驱动/端口）', 1, 1, '任务书标注“打印联调阻塞”，需业务方提供打印机型号、驱动与端口'),
(5425, 'LABEL', 'label.print.mode', '打印输出方式', 'service_local', 1, 1, 'service_local=本机打印服务 / browser=浏览器打印 / agent=现场打印代理；待业务方确认'),
(5426, 'LABEL', 'label.reprint.policy', '补打策略', '补打生成新任务并保留原任务，补打原因必填', 0, 1, NULL),
(5427, 'LABEL', 'label.scan.terminal.auth', '扫描终端与操作员绑定校验', 'false', 1, 1, '待业务方确认是否需要终端与操作员强绑定'),
(5428, 'LABEL', 'label.scan.valid.rule', '原标签扫描校验规则', '格式校验 + 未作废校验', 1, 1, '待业务方提供原标签格式清单与作废流程');

-- ========== N5 统一码表（DEV-053，示例数据） ==========

INSERT INTO code_dictionary (id, dict_type, dict_code, dict_name, ext_value, ext_text, sort_no, status, remark) VALUES
(7101, 'code_plant', 'XA', '西安工厂', 'XA', '示例制造地代码', 1, 1, '待业务方提供制造地代码清单'),
(7102, 'code_plant', 'SH', '上海工厂', 'SH', NULL, 2, 1, NULL),
(7103, 'code_plant', 'SZ', '深圳工厂', 'SZ', NULL, 3, 1, NULL),
(7111, 'code_year', '4', '2024 年', '2024', NULL, 1, 1, NULL),
(7112, 'code_year', '5', '2025 年', '2025', NULL, 2, 1, NULL),
(7113, 'code_year', '6', '2026 年', '2026', NULL, 3, 1, NULL),
(7114, 'code_year', '7', '2027 年', '2027', NULL, 4, 1, NULL),
(7121, 'code_part_category', '1', '继电器', NULL, NULL, 1, 1, NULL),
(7122, 'code_part_category', '2', '连接器', NULL, NULL, 2, 1, NULL),
(7123, 'code_part_category', '3', '线束', NULL, NULL, 3, 1, NULL),
(7124, 'code_part_category', '4', '电子模块', NULL, NULL, 4, 1, NULL),
(7131, 'code_vendor', 'V0001', '华威电子', NULL, NULL, 1, 1, NULL),
(7132, 'code_vendor', 'V0002', '东方精密', NULL, NULL, 2, 1, NULL),
(7133, 'code_vendor', 'V0003', '南方线缆', NULL, NULL, 3, 1, NULL),
(7141, 'code_line', '1', '一号线', NULL, NULL, 1, 1, NULL),
(7142, 'code_line', '2', '二号线', NULL, NULL, 2, 1, NULL),
(7143, 'code_line', '3', '三号线', NULL, NULL, 3, 1, NULL);

-- ========== N5 编码规则与分段（DEV-051 / DEV-052 / DEV-062） ==========

INSERT INTO code_rule (id, rule_code, rule_name, code_type, rule_version, customer_code, project_code, plant_code, total_length, seq_dimension, seq_start, seq_end, seq_length, is_default, status, effective_date, description) VALUES
(7001, 'CODE-RULE-14', '14 位客户原编码规则', 'CODE14', 'V1', NULL, NULL, NULL, 14, 'NONE', 0, 0, 0, 1, 'enabled', DATE '2026-01-01', '1-11 位客户零件号 + 12-14 位版本号'),
(7002, 'CODE-RULE-24', '24 位追溯码规则', 'CODE24', 'V1', NULL, NULL, 'XA', 24, 'DAY', 1, 9999, 4, 1, 'enabled', DATE '2026-01-01', '1-2 备用位 + 3-4 制造地 + 5 年份末位 + 6-8 自然日 + 9-12 每日序列 + 13-16 备用位 + 17-24 八位零件号'),
(7003, 'CODE-RULE-28', '28 位旧追溯码规则（兼容）', 'CODE28', 'V1', NULL, NULL, NULL, 28, 'DAY', 1, 9999, 4, 1, 'enabled', DATE '2026-01-01', '1-11 客户零件号 + 12-14 版本 + 15 类别 + 16-20 厂商 + 21 线别 + 22 年 + 23 月 + 24 日 + 25-28 流水号');

INSERT INTO code_rule_segment (id, rule_id, seg_no, seg_name, seg_key, start_pos, end_pos, seg_length, value_type, fixed_value, field_key, dict_type, date_pattern, day_offset, fill_char, fill_mode, source_ref, sort_no, status) VALUES
(7011, 7001, 1, '客户零件号', 'customerPartNo', 1, 11, 11, 'FIELD', NULL, 'customerPartNo', NULL, NULL, 0, '0', 'LEFT', '原码 1-11 位', 1, 1),
(7012, 7001, 2, '版本号', 'versionNo', 12, 14, 3, 'FIELD', NULL, 'versionNo', NULL, NULL, 0, '0', 'LEFT', '原码 12-14 位', 2, 1),
(7021, 7002, 1, '备用位（前）', 'reservedPrefix', 1, 2, 2, 'FIXED', '00', NULL, NULL, NULL, 0, '0', 'LEFT', '默认 00，待业务方确认', 1, 1),
(7022, 7002, 2, '制造地', 'plantCode', 3, 4, 2, 'DICT', NULL, 'plantCode', 'code_plant', NULL, 0, '0', 'RIGHT', '示例 XA', 2, 1),
(7023, 7002, 3, '年份末位', 'yearLast', 5, 5, 1, 'DATE', NULL, NULL, NULL, 'YEAR_LAST1', 0, '0', 'LEFT', '示例 4=2024', 3, 1),
(7024, 7002, 4, '自然日', 'dayOfYear', 6, 8, 3, 'DATE', NULL, NULL, NULL, 'DAY_OF_YEAR', 0, '0', 'LEFT', '365 平年 / 366 闰年', 4, 1),
(7025, 7002, 5, '每日序列', 'dailySeq', 9, 12, 4, 'SEQ', NULL, NULL, NULL, NULL, 0, '0', 'LEFT', '每日 0001-9999', 5, 1),
(7026, 7002, 6, '备用位（后）', 'reservedMiddle', 13, 16, 4, 'FIXED', '0000', NULL, NULL, NULL, 0, '0', 'LEFT', '默认 0000，待业务方确认', 6, 1),
(7027, 7002, 7, '八位零件号', 'partNo8', 17, 24, 8, 'FIELD', NULL, 'partNo8', NULL, NULL, 0, '0', 'RIGHT', '示例 12285499', 7, 1),
(7031, 7003, 1, '客户零件号', 'customerPartNo', 1, 11, 11, 'FIELD', NULL, 'customerPartNo', NULL, NULL, 0, '0', 'LEFT', '原码 1-11 位', 1, 1),
(7032, 7003, 2, '版本号', 'versionNo', 12, 14, 3, 'FIELD', NULL, 'versionNo', NULL, NULL, 0, '0', 'LEFT', '原码 12-14 位', 2, 1),
(7033, 7003, 3, '类别', 'partCategory', 15, 15, 1, 'DICT', NULL, 'partCategory', 'code_part_category', NULL, 0, '0', 'RIGHT', NULL, 3, 1),
(7034, 7003, 4, '厂商', 'vendorCode', 16, 20, 5, 'DICT', NULL, 'vendorCode', 'code_vendor', NULL, 0, '0', 'RIGHT', NULL, 4, 1),
(7035, 7003, 5, '线别', 'lineCode', 21, 21, 1, 'DICT', NULL, 'lineCode', 'code_line', NULL, 0, '0', 'RIGHT', NULL, 5, 1),
(7036, 7003, 6, '年', 'yearLast', 22, 22, 1, 'DATE', NULL, NULL, NULL, 'YEAR_LAST1', 0, '0', 'LEFT', NULL, 6, 1),
(7037, 7003, 7, '月', 'monthCode', 23, 23, 1, 'DATE', NULL, NULL, NULL, 'MONTH_CODE', 0, '0', 'LEFT', '待业务方确认月份位编码方式', 7, 1),
(7038, 7003, 8, '日', 'dayCode', 24, 24, 1, 'DATE', NULL, NULL, NULL, 'DAY_CODE', 0, '0', 'LEFT', '待业务方确认日期位编码方式', 8, 1),
(7039, 7003, 9, '流水号', 'dailySeq', 25, 28, 4, 'SEQ', NULL, NULL, NULL, NULL, 0, '0', 'LEFT', NULL, 9, 1);

-- ========== N5 标签模板（DEV-059，示例数据） ==========

INSERT INTO label_template (id, template_code, template_name, template_version, label_type, paper_width, paper_height, unit, dpi, barcode_type, dm_symbol_size, dm_ecc_level, module_size, element_json, layout_json, status, remark) VALUES
(7201, 'LBL-STD-24', '标准 24 位追溯标签', 'V1', 'CODE24', 50.00, 30.00, 'mm', 300, 'DATA_MATRIX', 'AUTO', 'ECC200', 0.40,
 '[{"key":"supplierName","label":"供应商","x":2.0,"y":2.0,"w":46.0,"h":4.0,"fontSize":8,"align":"left"},{"key":"projectName","label":"项目","x":2.0,"y":6.5,"w":46.0,"h":4.0,"fontSize":8,"align":"left"},{"key":"productionDate","label":"生产日期","x":2.0,"y":11.0,"w":22.0,"h":4.0,"fontSize":8,"align":"left"},{"key":"serialNo","label":"流水号","x":26.0,"y":11.0,"w":22.0,"h":4.0,"fontSize":8,"align":"left"},{"key":"partNo","label":"零件号","x":2.0,"y":15.5,"w":30.0,"h":4.0,"fontSize":8,"align":"left"},{"key":"barcode","label":"Data Matrix","x":33.0,"y":14.0,"w":15.0,"h":15.0,"fontSize":0,"align":"center"}]',
 '{"fields":["supplierName","projectName","productionDate","serialNo","partNo","barcode"]}', 'released', '示例标签模板，用于 UAT-04 联调；打印驱动待业务方提供'),
(7202, 'LBL-STD-14', '原 14 位编码标签', 'V1', 'CODE14', 40.00, 20.00, 'mm', 300, 'DATA_MATRIX', 'AUTO', 'ECC200', 0.35,
 '[{"key":"partNo","label":"零件号","x":2.0,"y":2.0,"w":36.0,"h":4.0,"fontSize":8,"align":"left"},{"key":"versionNo","label":"版本","x":2.0,"y":6.5,"w":36.0,"h":4.0,"fontSize":8,"align":"left"},{"key":"barcode","label":"Data Matrix","x":24.0,"y":10.0,"w":10.0,"h":10.0,"fontSize":0,"align":"center"}]',
 '{"fields":["partNo","versionNo","barcode"]}', 'draft', '原编码标签模板，用于扫描换标输入校验');
