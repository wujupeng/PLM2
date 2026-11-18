-- N4 初始化数据：技术规格 / 工艺 / 质量与检验的菜单与按钮权限、字典、可配置项，以及用于 UAT-03 验证的示例数据
-- 注意：示例数据仅用于联调与验收演示，实施时由业务方通过导入或界面替换。

-- ========== N4 权限 ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(3025, 'tech-spec', '技术规格', 'menu', 3020, '/spec', 'ProfileOutlined', 4, 1),
(3026, 'harness', '线束端子', 'menu', 3020, '/harness', 'BranchesOutlined', 5, 1),
(3027, 'compliance', '环保合规', 'menu', 3020, '/compliance', 'SafetyCertificateOutlined', 6, 1),
(3028, 'packaging', '包装标签', 'menu', 3020, '/packaging', 'TagsOutlined', 7, 1),
(3032, 'process', '工艺路线', 'menu', 3030, '/process', 'NodeIndexOutlined', 2, 1),
(3050, 'quality-domain', '质量与检验', 'menu', 0, NULL, 'SafetyOutlined', 40, 1),
(3051, 'quality', '质量问题', 'menu', 3050, '/quality', 'AlertOutlined', 1, 1),
(3052, 'inspection', '检验规范', 'menu', 3050, '/inspection', 'SolutionOutlined', 2, 1),
(3301, 'spec:list', '查询技术规格', 'button', 3025, NULL, NULL, 1, 1),
(3302, 'spec:create', '新增技术规格', 'button', 3025, NULL, NULL, 2, 1),
(3303, 'spec:update', '修改技术规格', 'button', 3025, NULL, NULL, 3, 1),
(3304, 'spec:delete', '删除技术规格', 'button', 3025, NULL, NULL, 4, 1),
(3305, 'spec:template:list', '查询规格模板', 'button', 3025, NULL, NULL, 5, 1),
(3306, 'spec:template:save', '维护规格模板', 'button', 3025, NULL, NULL, 6, 1),
(3307, 'spec:release', '发布技术规格', 'button', 3025, NULL, NULL, 7, 1),
(3311, 'harness:list', '查询线束端子', 'button', 3026, NULL, NULL, 1, 1),
(3312, 'harness:create', '新增线束', 'button', 3026, NULL, NULL, 2, 1),
(3313, 'harness:update', '修改线束', 'button', 3026, NULL, NULL, 3, 1),
(3314, 'harness:delete', '删除线束', 'button', 3026, NULL, NULL, 4, 1),
(3321, 'compliance:list', '查询环保合规', 'button', 3027, NULL, NULL, 1, 1),
(3322, 'compliance:create', '新增环保合规', 'button', 3027, NULL, NULL, 2, 1),
(3323, 'compliance:update', '修改环保合规', 'button', 3027, NULL, NULL, 3, 1),
(3324, 'compliance:delete', '删除环保合规', 'button', 3027, NULL, NULL, 4, 1),
(3331, 'packaging:list', '查询包装标签', 'button', 3028, NULL, NULL, 1, 1),
(3332, 'packaging:create', '新增包装标签', 'button', 3028, NULL, NULL, 2, 1),
(3333, 'packaging:update', '修改包装标签', 'button', 3028, NULL, NULL, 3, 1),
(3334, 'packaging:delete', '删除包装标签', 'button', 3028, NULL, NULL, 4, 1),
(3341, 'process:list', '查询工艺路线', 'button', 3032, NULL, NULL, 1, 1),
(3342, 'process:create', '新增工艺路线', 'button', 3032, NULL, NULL, 2, 1),
(3343, 'process:update', '修改工艺路线', 'button', 3032, NULL, NULL, 3, 1),
(3344, 'process:delete', '删除工艺路线', 'button', 3032, NULL, NULL, 4, 1),
(3345, 'process:operation:save', '维护工序明细', 'button', 3032, NULL, NULL, 5, 1),
(3351, 'inspection:list', '查询检验规范', 'button', 3052, NULL, NULL, 1, 1),
(3352, 'inspection:create', '新增检验规范', 'button', 3052, NULL, NULL, 2, 1),
(3353, 'inspection:update', '修改检验规范', 'button', 3052, NULL, NULL, 3, 1),
(3354, 'inspection:delete', '删除检验规范', 'button', 3052, NULL, NULL, 4, 1),
(3355, 'inspection:item:save', '维护检验项目', 'button', 3052, NULL, NULL, 5, 1),
(3361, 'quality:list', '查询质量问题', 'button', 3051, NULL, NULL, 1, 1),
(3362, 'quality:create', '登记质量问题', 'button', 3051, NULL, NULL, 2, 1),
(3363, 'quality:update', '修改质量问题', 'button', 3051, NULL, NULL, 3, 1),
(3364, 'quality:delete', '删除质量问题', 'button', 3051, NULL, NULL, 4, 1),
(3365, 'quality:action', '措施与验证记录', 'button', 3051, NULL, NULL, 5, 1),
(3366, 'quality:close', '关闭质量问题', 'button', 3051, NULL, NULL, 6, 1),
(3367, 'quality:defect:list', '查询缺陷库', 'button', 3051, NULL, NULL, 7, 1),
(3368, 'quality:defect:save', '维护缺陷库', 'button', 3051, NULL, NULL, 8, 1),
(3369, 'quality:to-ecr', '质量问题转 ECR', 'button', 3051, NULL, NULL, 9, 1);

-- 管理员：授予 N4 全部权限
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(9501, 2001, 3025), (9502, 2001, 3026), (9503, 2001, 3027), (9504, 2001, 3028),
(9505, 2001, 3032), (9506, 2001, 3050), (9507, 2001, 3051), (9508, 2001, 3052),
(9510, 2001, 3301), (9511, 2001, 3302), (9512, 2001, 3303), (9513, 2001, 3304),
(9514, 2001, 3305), (9515, 2001, 3306), (9516, 2001, 3307),
(9517, 2001, 3311), (9518, 2001, 3312), (9519, 2001, 3313), (9520, 2001, 3314),
(9521, 2001, 3321), (9522, 2001, 3322), (9523, 2001, 3323), (9524, 2001, 3324),
(9525, 2001, 3331), (9526, 2001, 3332), (9527, 2001, 3333), (9528, 2001, 3334),
(9529, 2001, 3341), (9530, 2001, 3342), (9531, 2001, 3343), (9532, 2001, 3344), (9533, 2001, 3345),
(9534, 2001, 3351), (9535, 2001, 3352), (9536, 2001, 3353), (9537, 2001, 3354), (9538, 2001, 3355),
(9539, 2001, 3361), (9540, 2001, 3362), (9541, 2001, 3363), (9542, 2001, 3364),
(9543, 2001, 3365), (9544, 2001, 3366), (9545, 2001, 3367), (9546, 2001, 3368), (9547, 2001, 3369);

-- 研发工程师：技术规格、线束、包装标签、工艺路线
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(9551, 2002, 3025), (9552, 2002, 3026), (9553, 2002, 3028), (9554, 2002, 3032),
(9555, 2002, 3301), (9556, 2002, 3302), (9557, 2002, 3303), (9558, 2002, 3305),
(9559, 2002, 3306), (9560, 2002, 3307),
(9561, 2002, 3311), (9562, 2002, 3312), (9563, 2002, 3313),
(9564, 2002, 3331), (9565, 2002, 3332), (9566, 2002, 3333),
(9567, 2002, 3341), (9568, 2002, 3342), (9569, 2002, 3343), (9570, 2002, 3345),
(9571, 2002, 3351), (9572, 2002, 3361), (9573, 2002, 3367);

-- 质量工程师：质量问题、缺陷库、检验规范、环保合规
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(9581, 2003, 3027), (9582, 2003, 3050), (9583, 2003, 3051), (9584, 2003, 3052),
(9585, 2003, 3321), (9586, 2003, 3322), (9587, 2003, 3323),
(9588, 2003, 3351), (9589, 2003, 3352), (9590, 2003, 3353), (9591, 2003, 3355),
(9592, 2003, 3361), (9593, 2003, 3362), (9594, 2003, 3363),
(9595, 2003, 3365), (9596, 2003, 3366), (9597, 2003, 3367), (9598, 2003, 3368), (9599, 2003, 3369);

-- 只读用户：仅查询
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(9611, 2006, 3025), (9612, 2006, 3026), (9613, 2006, 3027), (9614, 2006, 3028),
(9615, 2006, 3032), (9616, 2006, 3050), (9617, 2006, 3051), (9618, 2006, 3052),
(9619, 2006, 3301), (9620, 2006, 3305), (9621, 2006, 3311), (9622, 2006, 3321),
(9623, 2006, 3331), (9624, 2006, 3341), (9625, 2006, 3351), (9626, 2006, 3361), (9627, 2006, 3367);

-- ========== N4 字典 ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(4501, 'spec_category', '电气规格', 'electrical', 1, 1, NULL),
(4502, 'spec_category', '机械规格', 'mechanical', 2, 1, NULL),
(4503, 'spec_category', '环境规格', 'environment', 3, 1, NULL),
(4504, 'spec_category', '寿命规格', 'life', 4, 1, NULL),
(4505, 'spec_category', '材料规格', 'material', 5, 1, NULL),
(4511, 'spec_status', '草稿', 'draft', 1, 1, NULL),
(4512, 'spec_status', '已发布', 'released', 2, 1, NULL),
(4513, 'spec_status', '已淘汰', 'obsolete', 3, 1, NULL),
(4521, 'spec_field_data_type', '数值', 'number', 1, 1, NULL),
(4522, 'spec_field_data_type', '范围', 'range', 2, 1, NULL),
(4523, 'spec_field_data_type', '文本', 'text', 3, 1, NULL),
(4524, 'spec_field_data_type', '是否', 'bool', 4, 1, NULL),
(4525, 'spec_field_data_type', '选项', 'option', 5, 1, NULL),
(4531, 'compliance_type', 'RoHS', 'rohs', 1, 1, NULL),
(4532, 'compliance_type', 'ELV', 'elv', 2, 1, NULL),
(4533, 'compliance_type', 'REACH', 'reach', 3, 1, NULL),
(4534, 'compliance_type', '其他要求', 'other', 4, 1, NULL),
(4541, 'compliance_risk', '低', 'low', 1, 1, NULL),
(4542, 'compliance_risk', '中', 'middle', 2, 1, NULL),
(4543, 'compliance_risk', '高', 'high', 3, 1, NULL),
(4551, 'compliance_status', '待确认', 'pending', 1, 1, NULL),
(4552, 'compliance_status', '有效', 'valid', 2, 1, NULL),
(4553, 'compliance_status', '已过期', 'expired', 3, 1, NULL),
(4554, 'compliance_status', '资料缺失', 'missing', 4, 1, NULL),
(4561, 'inspection_type', '来料检验', 'iqc', 1, 1, NULL),
(4562, 'inspection_type', '制程检验', 'ipqc', 2, 1, NULL),
(4563, 'inspection_type', '成品检验', 'fqc', 3, 1, NULL),
(4564, 'inspection_type', '出货检验', 'oqc', 4, 1, NULL),
(4571, 'defect_severity', '轻微', 'minor', 1, 1, NULL),
(4572, 'defect_severity', '严重', 'major', 2, 1, NULL),
(4573, 'defect_severity', '致命', 'critical', 3, 1, NULL),
(4581, 'quality_source_type', '内部发现', 'internal', 1, 1, NULL),
(4582, 'quality_source_type', '客户反馈', 'customer', 2, 1, NULL),
(4583, 'quality_source_type', '供应商问题', 'supplier', 3, 1, NULL),
(4584, 'quality_source_type', '检验发现', 'inspection', 4, 1, NULL),
(4591, 'quality_problem_status', '待处理', 'open', 1, 1, '质量问题单状态（区别于 N2 的物料数据质量问题 quality_issue_status）'),
(4592, 'quality_problem_status', '分析中', 'analyzing', 2, 1, NULL),
(4593, 'quality_problem_status', '措施执行中', 'action', 3, 1, NULL),
(4594, 'quality_problem_status', '验证中', 'verifying', 4, 1, NULL),
(4595, 'quality_problem_status', '已关闭', 'closed', 5, 1, NULL),
(4601, 'quality_action_type', '临时遏制', 'containment', 1, 1, NULL),
(4602, 'quality_action_type', '根因分析', 'root_cause', 2, 1, NULL),
(4603, 'quality_action_type', '纠正措施', 'corrective', 3, 1, NULL),
(4604, 'quality_action_type', '预防措施', 'preventive', 4, 1, NULL),
(4605, 'quality_action_type', '效果验证', 'verify', 5, 1, NULL),
(4611, 'quality_action_status', '待执行', 'open', 1, 1, NULL),
(4612, 'quality_action_status', '已完成', 'done', 2, 1, NULL),
(4613, 'quality_action_status', '已验证', 'verified', 3, 1, NULL),
(4621, 'process_status', '草稿', 'draft', 1, 1, NULL),
(4622, 'process_status', '已发布', 'released', 2, 1, NULL),
(4623, 'process_status', '已淘汰', 'obsolete', 3, 1, NULL);

-- ========== N4 可配置项：技术规格 / 工艺 / 质量与检验的未明确规则，先落默认值，待业务方集中确认 ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(5301, 'SPEC', 'spec.template.category.list', '规格模板分类清单', 'electrical,mechanical,environment,life,material', 0, 1, '模板字段按分类分组，可按产品系列差异化配置'),
(5302, 'SPEC', 'spec.template.version.rule', '规格模板版本规则', '模板修改生成新版本，已发布版本保留', 1, 1, '待业务方确认规格模板版本化与生效规则'),
(5303, 'SPEC', 'spec.instance.release.policy', '规格实例发布策略', 'required_fields_complete', 1, 1, '取值 required_fields_complete=必填字段完整才可发布 / manual=人工确认；待业务方确认'),
(5304, 'SPEC', 'spec.electrical.required_fields', '电气性能必填指标', 'pullInTime,releaseTime,contactResistance,dielectricStrength', 1, 1, '待业务方确认吸合/释放时间、弹跳时间、接触电阻、耐压、压降等必填项与限值'),
(5311, 'COMPLIANCE', 'compliance.required_types', '强制环保合规要求类型', 'rohs,reach', 1, 1, '待业务方确认强制合规要求范围'),
(5312, 'COMPLIANCE', 'compliance.expire.warn_days', '合规资料到期预警天数', '30', 0, 1, NULL),
(5313, 'COMPLIANCE', 'compliance.block_release', '缺少强制合规资料时是否阻断发布', 'true', 1, 1, '待业务方确认是否作为发布阻断项或仅预警'),
(5321, 'PROCESS', 'process.route.effective.policy', '工艺路线生效控制方式', 'by_date_or_version', 1, 1, '待业务方确认工艺路线生效与版本切换方式'),
(5322, 'PROCESS', 'process.operation.inspection.match', '工序与检验规范匹配规则', '按产品+工序+版本自动匹配', 1, 1, '待业务方确认工序与检验规范匹配口径'),
(5331, 'INSPECTION', 'inspection.sampling.default', '默认抽样方案', 'GB/T 2828.1 一般检验水平 II，AQL 1.0', 1, 1, '待业务方提供正式抽样标准与 AQL 取值'),
(5332, 'INSPECTION', 'inspection.auto_match.rule', '检验项目自动匹配规则', '按产品/物料+检验类型+版本匹配生效规范', 0, 1, NULL),
(5341, 'QUALITY', 'quality.issue.number.pattern', '质量问题单号规则', 'QI-{yyyyMM}-{4 位流水号}', 1, 1, '待业务方确认质量问题单编号规则'),
(5342, 'QUALITY', 'quality.defect.auto_fill', '选择缺陷代码时自动带出责任部门与默认措施', 'true', 0, 1, NULL),
(5343, 'QUALITY', 'quality.close.require_verify', '关闭前是否必须存在已验证的措施记录', 'true', 1, 1, '待业务方确认关闭质量的验证门槛'),
(5344, 'QUALITY', 'quality.to_ecr.rule', '质量问题转 ECR 的触发规则', 'severity in (major,critical) 或 需变更产品/物料/图纸时人工发起', 1, 1, '待业务方确认自动触发变更的严重度门槛'),
(5345, 'QUALITY', 'quality.to_ecr.ecr_source_type', '质量问题转 ECR 的来源类型', 'quality', 0, 1, NULL);

-- ========== N4 示例数据（用于 UAT-03 联调与验收演示） ==========

INSERT INTO spec_template (id, template_code, template_name, product_series, product_code, spec_category, version_no, status, description) VALUES
(6801, 'ST-ELE-A', 'A 系列电气规格模板', 'S-A', NULL, 'electrical', 'V1', 'released', '示例电气规格模板，用于 UAT-03'),
(6802, 'ST-MECH-A', 'A 系列机械结构规格模板', 'S-A', NULL, 'mechanical', 'V1', 'draft', '示例机械规格模板');

INSERT INTO spec_template_field (id, template_id, field_code, field_name, field_category, data_type, unit, min_value, max_value, target_value, required_flag, inspection_method, sort_no, status) VALUES
(6811, 6801, 'pullInTime', '吸合时间', 'electrical', 'range', 'ms', 0, 10, NULL, 1, '示波器测量', 1, 1),
(6812, 6801, 'releaseTime', '释放时间', 'electrical', 'range', 'ms', 0, 5, NULL, 1, '示波器测量', 2, 1),
(6813, 6801, 'bounceTime', '弹跳时间', 'electrical', 'range', 'ms', 0, 2, NULL, 0, '示波器测量', 3, 1),
(6814, 6801, 'contactResistance', '接触电阻', 'electrical', 'range', 'mΩ', 0, 100, NULL, 1, '微欧计测量', 4, 1),
(6815, 6801, 'dielectricStrength', '耐压', 'electrical', 'number', 'V', 1500, 1500, '1500', 1, '耐压测试仪', 5, 1),
(6816, 6801, 'voltageDrop', '压降', 'electrical', 'range', 'mV', 0, 100, NULL, 0, '毫伏表测量', 6, 1);

INSERT INTO spec_instance (id, instance_code, template_id, template_code, product_code, product_name, version_no, status, effective_date) VALUES
(6821, 'SI-SP-A100-ELEC', 6801, 'ST-ELE-A', 'SP-A100', '智能控制器 A100', 'V1', 'released', DATE '2026-01-01');

INSERT INTO spec_instance_value (id, instance_id, field_code, field_name, field_category, unit, min_value, max_value, target_value, value_text, value_number, pass_flag, inspection_method, sort_no) VALUES
(6831, 6821, 'pullInTime', '吸合时间', 'electrical', 'ms', 0, 10, NULL, '6.5', 6.5, 1, '示波器测量', 1),
(6832, 6821, 'releaseTime', '释放时间', 'electrical', 'ms', 0, 5, NULL, '3.2', 3.2, 1, '示波器测量', 2),
(6833, 6821, 'bounceTime', '弹跳时间', 'electrical', 'ms', 0, 2, NULL, '1.1', 1.1, 1, '示波器测量', 3),
(6834, 6821, 'contactResistance', '接触电阻', 'electrical', 'mΩ', 0, 100, NULL, '42', 42, 1, '微欧计测量', 4),
(6835, 6821, 'dielectricStrength', '耐压', 'electrical', 'V', 1500, 1500, '1500', '1500', 1500, 1, '耐压测试仪', 5),
(6836, 6821, 'voltageDrop', '压降', 'electrical', 'mV', 0, 100, NULL, '58', 58, 1, '毫伏表测量', 6);

INSERT INTO spec_harness (id, harness_code, harness_name, product_code, material_code, bom_header_id, bom_code, bom_position, doc_no, total_length, connector_qty, status, description) VALUES
(6841, 'HAR-SP-A100-001', '主控线束总成', 'SP-A100', 'M-0001', 6401, 'BOM-SP-A100-EBOM-V1', 'U1', 'DWG-SP-A100-M-0002-001', 320.00, 2, 'released', '示例线束，用于 UAT-03 关联演示');

INSERT INTO spec_harness_terminal (id, harness_id, seq_no, wire_material_code, wire_spec, wire_color, wire_length, terminal_material_code, terminal_name, sheath_material_code, sheath_name, from_connector, from_pin, to_connector, to_pin, assemble_requirement) VALUES
(6851, 6841, 1, 'M-0002', 'UL1007 22AWG', '红', 160.00, 'M-0005', '插针端子 2.8', 'M-0004', '2 位护套', 'J1', '1', 'J2', '1', '压接后拉力 ≥ 30N，不允许露铜'),
(6852, 6841, 2, 'M-0003', 'UL1007 22AWG', '黑', 160.00, 'M-0005', '插针端子 2.8', 'M-0004', '2 位护套', 'J1', '2', 'J2', '2', '压接后拉力 ≥ 30N，不允许露铜');

INSERT INTO spec_compliance (id, compliance_code, material_code, material_name, requirement_type, risk_level, supplier_code, declaration_no, effective_date, expire_date, status) VALUES
(6861, 'CPL-0001', 'M-0002', '贴片电阻 10K', 'rohs', 'low', 'SUP-001', 'DEC-SUP001-0001', DATE '2025-06-01', DATE '2027-05-31', 'valid'),
(6862, 'CPL-0002', 'M-0001', '主控板', 'reach', 'middle', 'SUP-001', NULL, DATE '2025-01-01', DATE '2026-12-31', 'missing');

INSERT INTO spec_packaging (id, packaging_code, product_code, product_name, customer_code, version_no, pack_qty, label_template_code, qr_rule_key, packaging_material, dimension_text, special_requirement, status, effective_date) VALUES
(6871, 'PKG-SP-A100', 'SP-A100', '智能控制器 A100', 'CUST-01', 'V1', 50, 'LBL-STD-24', 'code.24.template', '瓦楞纸箱 + 防静电袋', '400x300x200mm', '外箱需贴客户指定条码，唛头按客户模板', 'released', DATE '2026-01-01');

INSERT INTO process_route (id, route_code, route_name, product_code, product_name, version_no, process_version, status, effective_date, description) VALUES
(6881, 'RT-SP-A100', 'A100 主控板工艺路线', 'SP-A100', '智能控制器 A100', 'V1', 'PV1', 'released', DATE '2026-01-01', '示例工艺路线，用于 UAT-03');

INSERT INTO process_operation (id, route_id, seq_no, operation_code, operation_name, work_center, process_params, fixture_tooling, work_instruction_doc_no, standard_time, inspection_required, inspection_spec_code, key_operation) VALUES
(6891, 6881, 1, 'OP10', 'SMT 贴片', 'SMT-01', '锡膏厚度 0.12±0.02mm；回流峰值 245±5℃', '钢网 ST-SMT-01', 'WI-SMT-001', '120s', 1, 'INSP-IPQC-SMT', 1),
(6892, 6881, 2, 'OP20', '回流焊接', 'REFLOW-01', '链速 80cm/min', '治具 JIG-REFLOW-01', 'WI-REFLOW-001', '300s', 1, 'INSP-IPQC-REFLOW', 0),
(6893, 6881, 3, 'OP30', '整机装配', 'ASSY-01', '螺钉扭矩 0.5±0.1N·m', '电批 ESD-01', 'WI-ASSY-001', '180s', 1, 'INSP-FQC-A100', 1);

INSERT INTO inspection_spec (id, spec_code, spec_name, inspection_type, product_code, material_code, version_no, sampling_plan, aql_level, status, effective_date) VALUES
(6901, 'INSP-IQC-M-0002', '贴片电阻来料检验规范', 'iqc', NULL, 'M-0002', 'V1', 'GB/T 2828.1 一般检验水平 II，正常一次抽样', 'AQL 1.0', 'released', DATE '2026-01-01'),
(6902, 'INSP-FQC-A100', 'A100 成品检验规范', 'fqc', 'SP-A100', NULL, 'V1', 'GB/T 2828.1 一般检验水平 II，正常一次抽样', 'AQL 0.65', 'released', DATE '2026-01-01');

INSERT INTO inspection_item (id, spec_id, seq_no, item_code, item_name, inspection_method, equipment, unit, standard_value, upper_limit, lower_limit, verdict_rule, key_item) VALUES
(6911, 6901, 1, 'IQ-01', '阻值', '万用表测量', '数字万用表', 'Ω', '10KΩ ±1%', 10100, 9900, '超出上下限判不合格', 1),
(6912, 6901, 2, 'IQ-02', '外观', '目视检查', '放大镜 10X', NULL, '无破损、无氧化、丝印清晰', NULL, NULL, '任一项不符判不合格', 0),
(6913, 6902, 1, 'FQ-01', '吸合时间', '示波器测量', '数字示波器', 'ms', '0-10', 10, 0, '超出上下限判不合格', 1),
(6914, 6902, 2, 'FQ-02', '接触电阻', '微欧计测量', '微欧计', 'mΩ', '0-100', 100, 0, '超出上下限判不合格', 1);

INSERT INTO quality_defect_code (id, defect_code, defect_name, defect_category, operation_code, station, responsible_dept, default_cause, default_action, severity, status) VALUES
(6921, 'DF-R-001', '电阻阻值超差', '来料不良', 'OP10', 'IQC 检验台', '供应商质量', '供应商批次波动', '拦截批次并要求供应商 8D 回复', 'major', 1),
(6922, 'DF-S-001', '虚焊', '制程不良', 'OP20', '回流焊炉后', '制程工程', '回流温度曲线偏移', '调整温度曲线并加严检验', 'critical', 1),
(6923, 'DF-A-001', '装配划伤', '制程不良', 'OP30', '整机装配线', '生产制造', '工装夹具毛刺', '修理工装并增加防护', 'minor', 1);

INSERT INTO quality_issue (id, issue_no, title, source_type, product_code, material_code, batch_no, work_order_no, operation_code, defect_code, defect_name, severity, found_qty, issue_desc, responsible_dept, temp_action, status, found_at) VALUES
(6931, 'QI-202611-0001', 'A100 主控板电阻阻值超差', 'inspection', 'SP-A100', 'M-0002', 'B20261101', 'WO-20261101-001', 'OP10', 'DF-R-001', '电阻阻值超差', 'major', 120, 'IQC 抽检 20 只，3 只阻值超出 ±1%，本批 120 只待判定', '供应商质量', '已暂停该批次上线，待供应商回复', 'open', TIMESTAMP '2026-11-10 09:30:00');

INSERT INTO quality_issue_action (id, issue_id, action_type, content, owner_name, due_date, status) VALUES
(6941, 6931, 'containment', '暂停 B20261101 批次上线并隔离库存', '质量工程师', DATE '2026-11-11', 'done');
