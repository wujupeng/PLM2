-- N2 初始化数据：N2 菜单与按钮权限、字典、可配置项，以及用于 UAT-01 验证的示例主数据
-- 注意：示例数据仅用于联调与验收演示，实施时由业务方通过导入或界面替换。

-- ========== N2 权限：产品型号、供应商菜单与产品物料/BOM 按钮 ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(3013, 'product-model', '产品型号', 'menu', 3010, '/products', 'AppstoreOutlined', 3, 1),
(3014, 'supplier', '供应商', 'menu', 3010, '/suppliers', 'ShopOutlined', 4, 1),
(3161, 'product:create', '新增产品', 'button', 3013, NULL, NULL, 1, 1),
(3162, 'product:update', '修改产品', 'button', 3013, NULL, NULL, 2, 1),
(3163, 'product:delete', '删除产品', 'button', 3013, NULL, NULL, 3, 1),
(3164, 'product:list', '查询产品', 'button', 3013, NULL, NULL, 4, 1),
(3171, 'material:list', '查询物料', 'button', 3011, NULL, NULL, 1, 1),
(3172, 'material:create', '新增物料', 'button', 3011, NULL, NULL, 2, 1),
(3173, 'material:update', '修改物料', 'button', 3011, NULL, NULL, 3, 1),
(3174, 'material:delete', '删除物料', 'button', 3011, NULL, NULL, 4, 1),
(3175, 'material:import', '物料批量导入', 'button', 3011, NULL, NULL, 5, 1),
(3176, 'material:substitute', '物料替代维护', 'button', 3011, NULL, NULL, 6, 1),
(3177, 'material:quality:list', '数据质量清单', 'button', 3011, NULL, NULL, 7, 1),
(3178, 'material:quality:scan', '执行数据质量扫描', 'button', 3011, NULL, NULL, 8, 1),
(3181, 'bom:list', '查询 BOM', 'button', 3012, NULL, NULL, 1, 1),
(3182, 'bom:create', '新增 BOM', 'button', 3012, NULL, NULL, 2, 1),
(3183, 'bom:update', '修改 BOM', 'button', 3012, NULL, NULL, 3, 1),
(3184, 'bom:delete', '删除 BOM', 'button', 3012, NULL, NULL, 4, 1),
(3185, 'bom:import', 'BOM 单阶导入', 'button', 3012, NULL, NULL, 5, 1),
(3186, 'bom:validate', 'BOM 异常校验', 'button', 3012, NULL, NULL, 6, 1),
(3187, 'bom:publish', 'BOM 发布', 'button', 3012, NULL, NULL, 7, 1),
(3188, 'bom:convert', 'EBOM 转 MBOM', 'button', 3012, NULL, NULL, 8, 1),
(3189, 'bom:compare', 'BOM 版本比较', 'button', 3012, NULL, NULL, 9, 1),
(3191, 'supplier:list', '查询供应商', 'button', 3014, NULL, NULL, 1, 1),
(3192, 'supplier:create', '新增供应商', 'button', 3014, NULL, NULL, 2, 1),
(3193, 'supplier:update', '修改供应商', 'button', 3014, NULL, NULL, 3, 1),
(3194, 'supplier:delete', '删除供应商', 'button', 3014, NULL, NULL, 4, 1);

-- 管理员：授予 N2 全部权限
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(9301, 2001, 3013), (9302, 2001, 3014),
(9303, 2001, 3161), (9304, 2001, 3162), (9305, 2001, 3163), (9306, 2001, 3164),
(9307, 2001, 3171), (9308, 2001, 3172), (9309, 2001, 3173), (9310, 2001, 3174),
(9311, 2001, 3175), (9312, 2001, 3176), (9313, 2001, 3177), (9314, 2001, 3178),
(9315, 2001, 3181), (9316, 2001, 3182), (9317, 2001, 3183), (9318, 2001, 3184),
(9319, 2001, 3185), (9320, 2001, 3186), (9321, 2001, 3187), (9322, 2001, 3188), (9323, 2001, 3189),
(9324, 2001, 3191), (9325, 2001, 3192), (9326, 2001, 3193), (9327, 2001, 3194);

-- 研发工程师：产品、物料、BOM 维护（不含删除）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(9331, 2002, 3013), (9332, 2002, 3014),
(9333, 2002, 3161), (9334, 2002, 3162), (9335, 2002, 3164),
(9336, 2002, 3171), (9337, 2002, 3172), (9338, 2002, 3173), (9339, 2002, 3175),
(9340, 2002, 3176), (9341, 2002, 3177), (9342, 2002, 3178),
(9343, 2002, 3181), (9344, 2002, 3182), (9345, 2002, 3183), (9346, 2002, 3185),
(9347, 2002, 3186), (9348, 2002, 3187), (9349, 2002, 3188), (9350, 2002, 3189),
(9351, 2002, 3191);

-- 只读用户：仅查询
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(9361, 2006, 3013), (9362, 2006, 3014), (9363, 2006, 3164), (9364, 2006, 3171),
(9365, 2006, 3181), (9366, 2006, 3191);

-- ========== N2 字典 ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(4101, 'material_source_type', '自制', 'make', 1, 1, NULL),
(4102, 'material_source_type', '外购', 'buy', 2, 1, NULL),
(4111, 'material_lifecycle', '草稿', 'draft', 1, 1, NULL),
(4112, 'material_lifecycle', '已发布', 'released', 2, 1, NULL),
(4113, 'material_lifecycle', '已淘汰', 'obsolete', 3, 1, NULL),
(4121, 'bom_type', 'EBOM 设计 BOM', 'EBOM', 1, 1, NULL),
(4122, 'bom_type', 'MBOM 制造 BOM', 'MBOM', 2, 1, NULL),
(4131, 'bom_status', '草稿', 'draft', 1, 1, NULL),
(4132, 'bom_status', '已发布', 'released', 2, 1, NULL),
(4133, 'bom_status', '已淘汰', 'obsolete', 3, 1, NULL),
(4141, 'bom_issue_type', '重复关系', 'duplicate', 1, 1, NULL),
(4142, 'bom_issue_type', '孤儿子件', 'orphan', 2, 1, NULL),
(4143, 'bom_issue_type', '循环引用', 'cycle', 3, 1, NULL),
(4144, 'bom_issue_type', '缺少用量', 'missingQty', 4, 1, NULL),
(4151, 'quality_severity', '错误', 'error', 1, 1, NULL),
(4152, 'quality_severity', '警告', 'warning', 2, 1, NULL),
(4153, 'quality_severity', '提示', 'info', 3, 1, NULL),
(4161, 'material_type', '零件', 'part', 1, 1, NULL),
(4162, 'material_type', '原材料', 'raw', 2, 1, NULL),
(4163, 'material_type', '辅料', 'consumable', 3, 1, NULL),
(4171, 'publish_status', '待同步', 'pending', 1, 1, NULL),
(4172, 'publish_status', '同步成功', 'success', 2, 1, NULL),
(4173, 'publish_status', '同步失败', 'failed', 3, 1, NULL),
(4181, 'product_status', '草稿', 'draft', 1, 1, NULL),
(4182, 'product_status', '已发布', 'released', 2, 1, NULL),
(4183, 'product_status', '已淘汰', 'obsolete', 3, 1, NULL),
(4191, 'quality_issue_status', '待处理', 'open', 1, 1, NULL),
(4192, 'quality_issue_status', '已修复', 'fixed', 2, 1, NULL),
(4193, 'quality_issue_status', '已忽略', 'ignored', 3, 1, NULL);

-- ========== N2 可配置项：物料与 BOM 的未明确规则，先落默认值，待业务方集中确认 ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(5101, 'MATERIAL', 'material.code.pattern', '物料编码规则', '分类前缀 + 4 位流水号', 1, 1, '待业务方确认编码规则、前缀与流水位数'),
(5102, 'MATERIAL', 'material.required_fields.default', '物料默认必填字段', 'materialCode,materialName,categoryCode,unit,sourceType', 0, 1, '分类上可覆盖默认必填字段'),
(5103, 'MATERIAL', 'material.version.rule', '物料版本规则', 'released 后修改自动递增 V2、V3…', 0, 1, NULL),
(5104, 'MATERIAL', 'material.released.edit.policy', '已发布物料修改策略', 'controlled_revision', 1, 1, '取值 controlled_revision=受控修订 / new_version=生成新版本；已发布版本不可无痕修改'),
(5105, 'MATERIAL', 'material.lifecycle.states', '物料生命周期状态', 'draft,released,obsolete', 0, 1, NULL),
(5106, 'MATERIAL', 'material.substitute.rule', '替代料命中规则', '按有效状态与适用条件匹配，BOM 展开时提示', 0, 1, NULL),
(5107, 'MATERIAL', 'material.supplier.required_when_buy', '外购物料是否必须填供应商', 'true', 1, 1, '待业务方确认外购物料供应商填写要求'),
(5111, 'BOM', 'bom.duplicate_relation.policy', 'BOM 重复关系处理原则', 'mark_only', 0, 1, '不直接删除重复行，标记异常并人工确认'),
(5112, 'BOM', 'bom.invalid_date.policy', 'BOM 异常日期处理原则', 'report_only', 0, 1, '不擅自改写异常日期，提供异常报告与人工映射工具'),
(5113, 'BOM', 'bom.mbom.convert.rule', 'EBOM 转 MBOM 规则', '按工艺路线映射并保留来源关系与差异', 1, 1, '待业务方确认工艺路线与转换规则'),
(5114, 'BOM', 'bom.publish.retry.max_times', 'BOM 发布失败重试次数', '3', 0, 1, NULL),
(5115, 'BOM', 'bom.default.effective_date', 'BOM 默认生效日期规则', '取发布当天', 1, 1, '待业务方确认默认生效日期规则'),
(5116, 'BOM', 'bom.cycle.check.enabled', '启用 BOM 循环引用校验', 'true', 0, 1, NULL),
(5117, 'BOM', 'bom.publish.target_systems', 'BOM 发布下游系统', 'ERP,MES', 1, 1, '待业务方确认 IF-02 下游系统与差异比对口径');

-- ========== N2 示例主数据（用于 UAT-01 联调与验收演示） ==========

INSERT INTO md_product (id, product_code, product_name, series_code, series_name, customer_code, model, status, description) VALUES
(6001, 'SP-A100', '智能控制器 A100', 'S-A', 'A 系列', 'CUST-01', 'A100', 'released', '示例产品，用于多级 BOM 展开验证'),
(6002, 'SP-B200', '智能控制器 B200', 'S-B', 'B 系列', 'CUST-02', 'B200', 'draft', '示例产品');

INSERT INTO md_material_category (id, category_code, category_name, parent_id, code_rule_key, required_fields, sort_no, status) VALUES
(6111, 'MC-ELEC', '电子件', 0, 'material.code.pattern', 'materialCode,materialName,unit,sourceType', 1, 1),
(6112, 'MC-MECH', '结构件', 0, 'material.code.pattern', 'materialCode,materialName,unit,sourceType', 2, 1),
(6113, 'MC-STD', '标准件', 0, 'material.code.pattern', 'materialCode,materialName,unit,sourceType', 3, 1);

INSERT INTO md_supplier (id, supplier_code, supplier_name, contact, phone, email, status) VALUES
(6201, 'SUP-001', '示例电子供应商', '张工', '13800000001', 'sup001@example.com', 1),
(6202, 'SUP-002', '示例结构供应商', '李工', '13800000002', 'sup002@example.com', 1);

INSERT INTO md_material (id, material_code, material_name, category_id, category_code, spec, material_type, unit, source_type, supplier_id, supplier_code, lifecycle_status, version_no, effective_date) VALUES
(6301, 'M-0001', '主控板', 6111, 'MC-ELEC', 'PCB 4 层', 'part', 'PCS', 'buy', 6201, 'SUP-001', 'released', 'V1', DATE '2026-01-01'),
(6302, 'M-0002', '贴片电阻 10K', 6111, 'MC-ELEC', '0805 10K', 'part', 'PCS', 'buy', 6201, 'SUP-001', 'released', 'V1', DATE '2026-01-01'),
(6303, 'M-0003', '贴片电容 100nF', 6111, 'MC-ELEC', '0805 100nF', 'part', 'PCS', 'buy', 6201, 'SUP-001', 'released', 'V1', DATE '2026-01-01'),
(6304, 'M-0004', '上壳', 6112, 'MC-MECH', 'ABS 白色', 'part', 'PCS', 'make', NULL, NULL, 'released', 'V1', DATE '2026-01-01'),
(6305, 'M-0005', '自攻螺钉 M3x8', 6113, 'MC-STD', 'M3x8', 'part', 'PCS', 'buy', 6202, 'SUP-002', 'released', 'V1', DATE '2026-01-01');

INSERT INTO md_material_substitute (id, material_id, material_code, substitute_material_id, substitute_material_code, priority, applicable_condition, status) VALUES
(6601, 6302, 'M-0002', 6303, 'M-0003', 1, '缺料时按此优先级替换', 1);

INSERT INTO bom_header (id, bom_code, product_id, product_code, bom_type, version_no, status, effective_from, description) VALUES
(6401, 'BOM-SP-A100-EBOM-V1', 6001, 'SP-A100', 'EBOM', 'V1', 'released', DATE '2026-01-01', '示例产品 A100 设计 BOM'),
(6402, 'BOM-M-0001-EBOM-V1', 6301, 'M-0001', 'EBOM', 'V1', 'released', DATE '2026-01-01', '主控板子级 BOM');

INSERT INTO bom_line (id, header_id, line_no, parent_material_code, child_material_code, child_material_name, qty, unit, item_seq, substitute_allowed) VALUES
(6501, 6401, 1, 'SP-A100', 'M-0001', '主控板', 1, 'PCS', 'U1', 0),
(6502, 6401, 2, 'SP-A100', 'M-0004', '上壳', 1, 'PCS', NULL, 0),
(6503, 6401, 3, 'SP-A100', 'M-0005', '自攻螺钉 M3x8', 4, 'PCS', NULL, 0),
(6504, 6402, 1, 'M-0001', 'M-0002', '贴片电阻 10K', 10, 'PCS', 'R1-R10', 1),
(6505, 6402, 2, 'M-0001', 'M-0003', '贴片电容 100nF', 2, 'PCS', 'C1-C2', 1);
