-- N3 初始化数据：图文档 / CAD / 工程变更的按钮权限、字典、可配置项，以及用于 UAT-02 验证的示例数据
-- 注意：示例数据仅用于联调与验收演示，实施时由业务方通过导入或界面替换。

-- ========== N3 权限：图文档（菜单 3021）、工程变更（菜单 3022）、CAD 集成（菜单 3023）按钮 ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(3201, 'doc:list', '查询图文档', 'button', 3021, NULL, NULL, 1, 1),
(3202, 'doc:create', '新增图文档', 'button', 3021, NULL, NULL, 2, 1),
(3203, 'doc:update', '修改图文档', 'button', 3021, NULL, NULL, 3, 1),
(3204, 'doc:delete', '删除图文档', 'button', 3021, NULL, NULL, 4, 1),
(3205, 'doc:submit', '提交签审', 'button', 3021, NULL, NULL, 5, 1),
(3206, 'doc:review', '签审处理', 'button', 3021, NULL, NULL, 6, 1),
(3207, 'doc:release', '发布文档', 'button', 3021, NULL, NULL, 7, 1),
(3208, 'doc:obsolete', '作废文档', 'button', 3021, NULL, NULL, 8, 1),
(3209, 'doc:distribute', '受控分发', 'button', 3021, NULL, NULL, 9, 1),
(3210, 'doc:compare', '文档版本比较', 'button', 3021, NULL, NULL, 10, 1),
(3211, 'doc:category:list', '查询文档分类', 'button', 3021, NULL, NULL, 11, 1),
(3212, 'doc:category:save', '维护文档分类', 'button', 3021, NULL, NULL, 12, 1),
(3221, 'cad:list', '查询 CAD 文件', 'button', 3023, NULL, NULL, 1, 1),
(3222, 'cad:create', '新增 CAD 文件', 'button', 3023, NULL, NULL, 2, 1),
(3223, 'cad:update', '修改 CAD 文件', 'button', 3023, NULL, NULL, 3, 1),
(3224, 'cad:delete', '删除 CAD 文件', 'button', 3023, NULL, NULL, 4, 1),
(3225, 'cad:extract', '执行 CAD 属性提取', 'button', 3023, NULL, NULL, 5, 1),
(3226, 'cad:mapping:list', '查询 CAD 属性映射', 'button', 3023, NULL, NULL, 6, 1),
(3227, 'cad:mapping:save', '维护 CAD 属性映射', 'button', 3023, NULL, NULL, 7, 1),
(3241, 'eco:list', '查询工程变更', 'button', 3022, NULL, NULL, 1, 1),
(3242, 'eco:create', '发起变更申请', 'button', 3022, NULL, NULL, 2, 1),
(3243, 'eco:update', '修改变更单', 'button', 3022, NULL, NULL, 3, 1),
(3244, 'eco:delete', '删除变更单', 'button', 3022, NULL, NULL, 4, 1),
(3245, 'eco:review', '变更评审', 'button', 3022, NULL, NULL, 5, 1),
(3246, 'eco:convert', '变更申请转 ECO', 'button', 3022, NULL, NULL, 6, 1),
(3247, 'eco:approve', 'ECO 审批', 'button', 3022, NULL, NULL, 7, 1),
(3248, 'eco:execute', '变更执行与版本切换', 'button', 3022, NULL, NULL, 8, 1),
(3249, 'eco:notice', '变更通知', 'button', 3022, NULL, NULL, 9, 1),
(3250, 'eco:impact', '变更影响分析', 'button', 3022, NULL, NULL, 10, 1);

-- 管理员：授予 N3 全部权限
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(9401, 2001, 3201), (9402, 2001, 3202), (9403, 2001, 3203), (9404, 2001, 3204),
(9405, 2001, 3205), (9406, 2001, 3206), (9407, 2001, 3207), (9408, 2001, 3208),
(9409, 2001, 3209), (9410, 2001, 3210), (9411, 2001, 3211), (9412, 2001, 3212),
(9413, 2001, 3221), (9414, 2001, 3222), (9415, 2001, 3223), (9416, 2001, 3224),
(9417, 2001, 3225), (9418, 2001, 3226), (9419, 2001, 3227),
(9420, 2001, 3241), (9421, 2001, 3242), (9422, 2001, 3243), (9423, 2001, 3244),
(9424, 2001, 3245), (9425, 2001, 3246), (9426, 2001, 3247), (9427, 2001, 3248),
(9428, 2001, 3249), (9429, 2001, 3250);

-- 研发工程师：图文档、CAD、工程变更全流程（不含删除）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(9431, 2002, 3201), (9432, 2002, 3202), (9433, 2002, 3203), (9434, 2002, 3205),
(9435, 2002, 3206), (9436, 2002, 3207), (9437, 2002, 3208), (9438, 2002, 3209),
(9439, 2002, 3210), (9440, 2002, 3211),
(9441, 2002, 3221), (9442, 2002, 3222), (9443, 2002, 3223), (9444, 2002, 3225),
(9445, 2002, 3226),
(9446, 2002, 3241), (9447, 2002, 3242), (9448, 2002, 3243), (9449, 2002, 3245),
(9450, 2002, 3246), (9451, 2002, 3247), (9452, 2002, 3248), (9453, 2002, 3249),
(9454, 2002, 3250);

-- 质量工程师：查询图文档、承接质量问题触发的变更
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(9461, 2003, 3201), (9462, 2003, 3210), (9463, 2003, 3211),
(9464, 2003, 3221), (9465, 2003, 3226),
(9466, 2003, 3241), (9467, 2003, 3242), (9468, 2003, 3245), (9469, 2003, 3250),
(9470, 2003, 3249);

-- 只读用户：仅查询
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(9481, 2006, 3201), (9482, 2006, 3211), (9483, 2006, 3221),
(9484, 2006, 3226), (9485, 2006, 3241);

-- ========== N3 字典 ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(4201, 'doc_type', '二维图纸', '2d_drawing', 1, 1, NULL),
(4202, 'doc_type', '三维模型', '3d_model', 2, 1, NULL),
(4203, 'doc_type', '技术规范', 'tech_spec', 3, 1, NULL),
(4204, 'doc_type', '检验规范', 'inspection_spec', 4, 1, NULL),
(4205, 'doc_type', '工艺文件', 'process_doc', 5, 1, NULL),
(4206, 'doc_type', '客户文件', 'customer_doc', 6, 1, NULL),
(4211, 'doc_status', '草稿', 'draft', 1, 1, NULL),
(4212, 'doc_status', '审批中', 'in_review', 2, 1, NULL),
(4213, 'doc_status', '已批准', 'approved', 3, 1, NULL),
(4214, 'doc_status', '已发布', 'released', 4, 1, NULL),
(4215, 'doc_status', '已作废', 'obsolete', 5, 1, NULL),
(4221, 'doc_review_node', '编制', 'prepare', 1, 1, NULL),
(4222, 'doc_review_node', '校对', 'proofread', 2, 1, NULL),
(4223, 'doc_review_node', '审核', 'review', 3, 1, NULL),
(4224, 'doc_review_node', '批准', 'approve', 4, 1, NULL),
(4231, 'doc_review_decision', '待处理', 'pending', 1, 1, NULL),
(4232, 'doc_review_decision', '通过', 'approved', 2, 1, NULL),
(4233, 'doc_review_decision', '驳回', 'rejected', 3, 1, NULL),
(4241, 'doc_relation_type', '产品型号', 'product', 1, 1, NULL),
(4242, 'doc_relation_type', '物料', 'material', 2, 1, NULL),
(4243, 'doc_relation_type', 'BOM', 'bom', 3, 1, NULL),
(4251, 'doc_distribution_recipient', '组织', 'org', 1, 1, NULL),
(4252, 'doc_distribution_recipient', '用户', 'user', 2, 1, NULL),
(4253, 'doc_distribution_recipient', '供应商', 'supplier', 3, 1, NULL),
(4254, 'doc_distribution_recipient', '客户', 'customer', 4, 1, NULL),
(4261, 'cad_file_format', 'AutoCAD DWG', 'dwg', 1, 1, NULL),
(4262, 'cad_file_format', 'AutoCAD DXF', 'dxf', 2, 1, NULL),
(4263, 'cad_file_format', 'SolidWorks 零件', 'sldprt', 3, 1, NULL),
(4264, 'cad_file_format', 'SolidWorks 装配', 'sldasm', 4, 1, NULL),
(4271, 'cad_extract_status', '待提取', 'pending', 1, 1, NULL),
(4272, 'cad_extract_status', '提取成功', 'success', 2, 1, NULL),
(4273, 'cad_extract_status', '部分成功', 'partial', 3, 1, NULL),
(4274, 'cad_extract_status', '提取失败', 'failed', 4, 1, NULL),
(4281, 'eco_source_type', '内部提出', 'internal', 1, 1, NULL),
(4282, 'eco_source_type', '客户要求', 'customer', 2, 1, NULL),
(4283, 'eco_source_type', '质量问题', 'quality', 3, 1, NULL),
(4284, 'eco_source_type', '供应商提出', 'supplier', 4, 1, NULL),
(4291, 'eco_risk_level', '低', 'low', 1, 1, NULL),
(4292, 'eco_risk_level', '中', 'middle', 2, 1, NULL),
(4293, 'eco_risk_level', '高', 'high', 3, 1, NULL),
(4301, 'eco_urgency', '一般', 'normal', 1, 1, NULL),
(4302, 'eco_urgency', '紧急', 'urgent', 2, 1, NULL),
(4303, 'eco_urgency', '特急', 'emergency', 3, 1, NULL),
(4311, 'ecr_status', '草稿', 'draft', 1, 1, NULL),
(4312, 'ecr_status', '已提交', 'submitted', 2, 1, NULL),
(4313, 'ecr_status', '评审中', 'reviewing', 3, 1, NULL),
(4314, 'ecr_status', '已批准', 'approved', 4, 1, NULL),
(4315, 'ecr_status', '已驳回', 'rejected', 5, 1, NULL),
(4316, 'ecr_status', '已转 ECO', 'converted', 6, 1, NULL),
(4317, 'ecr_status', '已关闭', 'closed', 7, 1, NULL),
(4321, 'eco_approval_status', '草稿', 'draft', 1, 1, NULL),
(4322, 'eco_approval_status', '已提交', 'submitted', 2, 1, NULL),
(4323, 'eco_approval_status', '已批准', 'approved', 3, 1, NULL),
(4324, 'eco_approval_status', '已驳回', 'rejected', 4, 1, NULL),
(4331, 'eco_execution_status', '待执行', 'pending', 1, 1, NULL),
(4332, 'eco_execution_status', '执行中', 'executing', 2, 1, NULL),
(4333, 'eco_execution_status', '已完成', 'completed', 3, 1, NULL),
(4341, 'eco_object_type', '产品型号', 'product', 1, 1, NULL),
(4342, 'eco_object_type', '物料', 'material', 2, 1, NULL),
(4343, 'eco_object_type', '图文档', 'document', 3, 1, NULL),
(4344, 'eco_object_type', 'BOM', 'bom', 4, 1, NULL),
(4345, 'eco_object_type', '工艺', 'process', 5, 1, NULL),
(4351, 'eco_change_action', '新增', 'add', 1, 1, NULL),
(4352, 'eco_change_action', '修改', 'modify', 2, 1, NULL),
(4353, 'eco_change_action', '删除', 'delete', 3, 1, NULL),
(4354, 'eco_change_action', '版本切换', 'switch', 4, 1, NULL),
(4361, 'eco_switch_status', '待切换', 'pending', 1, 1, NULL),
(4362, 'eco_switch_status', '已切换', 'switched', 2, 1, NULL),
(4363, 'eco_switch_status', '切换失败', 'failed', 3, 1, NULL),
(4371, 'eco_impact_type', 'BOM', 'bom', 1, 1, NULL),
(4372, 'eco_impact_type', '库存', 'inventory', 2, 1, NULL),
(4373, 'eco_impact_type', '采购订单', 'po', 3, 1, NULL),
(4374, 'eco_impact_type', '在制工单', 'wip', 4, 1, NULL),
(4375, 'eco_impact_type', '供应商', 'supplier', 5, 1, NULL),
(4376, 'eco_impact_type', '客户项目', 'customer', 6, 1, NULL),
(4381, 'eco_impact_handle_status', '待处理', 'pending', 1, 1, NULL),
(4382, 'eco_impact_handle_status', '已处理', 'handled', 2, 1, NULL),
(4383, 'eco_impact_handle_status', '已忽略', 'ignored', 3, 1, NULL),
(4391, 'eco_notice_target', '内部', 'internal', 1, 1, NULL),
(4392, 'eco_notice_target', '供应商', 'supplier', 2, 1, NULL),
(4393, 'eco_notice_target', '客户', 'customer', 3, 1, NULL),
(4401, 'eco_notice_status', '草稿', 'draft', 1, 1, NULL),
(4402, 'eco_notice_status', '已发送', 'sent', 2, 1, NULL),
(4403, 'eco_notice_status', '已确认', 'confirmed', 3, 1, NULL);

-- ========== N3 可配置项：图文档 / CAD / 工程变更的未明确规则，先落默认值，待业务方集中确认 ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(5201, 'DOCUMENT', 'doc.code.pattern', '图号/文档编号规则', '分类前缀 + 产品编码 + 3 位流水号', 1, 1, '待业务方确认图号命名规则与流水位数'),
(5202, 'DOCUMENT', 'doc.review.nodes.default', '文档默认签审节点', 'prepare,proofread,review,approve', 1, 1, '待业务方确认各分类是否需要校对/审核节点'),
(5203, 'DOCUMENT', 'doc.released.file.replace.policy', '已发布文档更换文件策略', 'controlled_revision', 1, 1, '取值 controlled_revision=受控修订生成新版本 / overwrite=直接覆盖（不推荐）'),
(5204, 'DOCUMENT', 'doc.distribution.controlled_categories', '需受控分发的文档分类', '', 1, 1, '留空表示按分类 review_required 与受控分发开关判定；待业务方确认受控分发范围'),
(5205, 'DOCUMENT', 'doc.version.compare.fields', '文档版本比较字段', 'fileName,fileType,fileSize,fileHash,changeNote', 0, 1, '元数据差异比较字段清单'),
(5206, 'DOCUMENT', 'doc.file.storage.mode', '文档文件存储方式', 'metadata_only', 1, 1, '当前环境无文件服务器，先记录文件元数据与路径；待业务方提供对象存储或文件服务后切换'),
(5211, 'CAD', 'cad.software.compat_range', 'CAD 软件版本兼容范围', 'AutoCAD 2018-2024 / SolidWorks 2019-2023', 1, 1, '待业务方确认实际软件版本与许可'),
(5212, 'CAD', 'cad.attr.extract.mode', 'CAD 属性提取方式', 'attribute', 1, 1, '取值 attribute=读取自定义属性 / file_property=读取文件属性；无 CAD 解析服务时按上传元数据与属性清单模拟'),
(5213, 'CAD', 'cad.extract.error.policy', 'CAD 属性异常处理原则', 'report_only', 0, 1, '异常属性只报告不改写，提供人工映射与修正入口'),
(5221, 'ECO', 'eco.ecr.review.required', 'ECR 是否必须评审', 'true', 0, 1, NULL),
(5222, 'ECO', 'eco.eco.approval.nodes.default', 'ECO 默认审批节点', 'review,approve', 1, 1, '待业务方确认 ECO 审批层级'),
(5223, 'ECO', 'eco.effective.policy', '变更生效控制方式', 'by_date_or_batch', 1, 1, '取值 by_date=按生效日期 / by_batch=按生效批次 / by_date_or_batch=两者兼可；待业务方确认'),
(5224, 'ECO', 'eco.switch.target_systems', '变更生效需切换的下游系统', 'ERP,MES', 1, 1, '待业务方确认 IF-02/IF-03 下游系统与切换口径'),
(5225, 'ECO', 'eco.impact.types', '变更影响分析范围', 'bom,inventory,po,wip,supplier,customer', 1, 1, '待业务方确认可获取的库存/采购/工单数据来源'),
(5226, 'ECO', 'eco.impact.handle.required', '影响对象是否必须处理后方可执行变更', 'true', 1, 1, '待业务方确认是否允许忽略未处理影响项'),
(5227, 'ECO', 'eco.notice.auto_send', '变更通知是否自动发送', 'false', 0, 1, '关闭时由变更负责人手动触发发送'),
(5228, 'ECO', 'eco.number.pattern', 'ECR/ECO 编号规则', 'ECR-{yyyyMM}-{4 位流水号} / ECO-{yyyyMM}-{4 位流水号}', 1, 1, '待业务方确认编号规则');

-- ========== N3 示例数据（用于 UAT-02 联调与验收演示） ==========

INSERT INTO doc_category (id, category_code, category_name, parent_id, doc_type, file_types, required_metadata, review_required, review_nodes, sort_no, status) VALUES
(6701, 'DC-2D', '二维图纸', 0, '2d_drawing', 'dwg,dxf,pdf', 'docNo,docName,productCode,materialCode,versionNo', 1, 'prepare,proofread,review,approve', 1, 1),
(6702, 'DC-3D', '三维模型', 0, '3d_model', 'sldprt,sldasm,step', 'docNo,docName,productCode,materialCode,versionNo', 1, 'prepare,review,approve', 2, 1),
(6703, 'DC-SPEC', '技术规范', 0, 'tech_spec', 'pdf,docx', 'docNo,docName,productCode', 1, 'prepare,review,approve', 3, 1);

INSERT INTO doc_document (id, doc_no, doc_name, category_id, category_code, doc_type, product_code, material_code, file_name, current_version_no, status, distribution_controlled, owner_name, description) VALUES
(6711, 'DWG-SP-A100-M-0001-001', '主控板装配图', 6701, 'DC-2D', '2d_drawing', 'SP-A100', 'M-0001', 'DWG-SP-A100-M-0001-001.dwg', 'V1', 'draft', 1, '研发工程师', '示例图纸，用于 UAT-02 签审发布与版本切换演示');

INSERT INTO doc_version (id, document_id, doc_no, version_no, file_name, file_path, file_size, file_type, file_hash, metadata_json, change_note, status) VALUES
(6721, 6711, 'DWG-SP-A100-M-0001-001', 'V1', 'DWG-SP-A100-M-0001-001.dwg', '/plm-files/doc/6711/V1/DWG-SP-A100-M-0001-001.dwg', 524288, 'dwg', 'md5-v1-sample', '{"weight":"12.5g","material":"FR4"}', '初始版本', 'draft');

INSERT INTO doc_relation (id, document_id, doc_no, relation_type, target_id, target_code, target_name, relation_role) VALUES
(6726, 6711, 'DWG-SP-A100-M-0001-001', 'material', 6301, 'M-0001', '主控板', 'primary'),
(6727, 6711, 'DWG-SP-A100-M-0001-001', 'product', 6001, 'SP-A100', '智能控制器 A100', 'reference'),
(6728, 6711, 'DWG-SP-A100-M-0001-001', 'bom', 6402, 'BOM-M-0001-EBOM-V1', '主控板子级 BOM', 'reference');

INSERT INTO cad_attr_mapping (id, cad_attr_name, cad_attr_label, plm_field_name, plm_field_label, target_entity, required_flag, transform_rule, sort_no, status) VALUES
(6731, 'DrawingNo', '图号', 'docNo', '图号', 'document', 1, NULL, 1, 1),
(6732, 'PartName', '名称', 'docName', '文档名称', 'document', 1, NULL, 2, 1),
(6733, 'Revision', '版本', 'versionNo', '版本号', 'document', 1, NULL, 3, 1),
(6734, 'Material', '材料', 'materialCode', '物料编码', 'document', 0, NULL, 4, 1),
(6735, 'Weight', '重量', 'weight', '重量（技术属性）', 'document', 0, '保留数值并统一为克', 5, 1);

INSERT INTO cad_file (id, cad_no, file_name, file_path, file_format, cad_software, software_version, compat_range, file_size, file_hash, document_id, doc_no, product_code, material_code, extract_status) VALUES
(6741, 'CAD-0001', 'DWG-SP-A100-M-0001-001.dwg', '/plm-files/cad/6741/DWG-SP-A100-M-0001-001.dwg', 'dwg', 'AutoCAD', '2021', 'AutoCAD 2018-2024', 524288, 'md5-v1-sample', 6711, 'DWG-SP-A100-M-0001-001', 'SP-A100', 'M-0001', 'pending');

INSERT INTO eco_change_request (id, ecr_no, title, source_type, source_ref, reason, risk_level, urgency, affected_products, affected_materials, affected_documents, affected_processes, applicant_name, status) VALUES
(6751, 'ECR-202611-0001', '主控板电阻由 10K 改为 4.7K', 'quality', 'QI-2026-0001', '客户反馈上电浪涌电流偏大，需调整下拉电阻阻值', 'middle', 'urgent', 'SP-A100', 'M-0002', 'DWG-SP-A100-M-0001-001', 'SMT 贴片工序', '研发工程师', 'draft');
