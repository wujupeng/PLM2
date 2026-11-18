-- G3-N7a ERP—业务单据追踪与条码（WBS T029 业务单据追踪 / T030 条码业务 / T099 条码生成）初始化：
-- 菜单/按钮权限、角色授权、字典与可配置项。
-- 号段基线（V85 之后已占用的最大值）：sys_permission=4493（本脚本从 4500 起）、
-- sys_role_permission=13547（从 13560 起）、sys_dictionary=8059（从 8070 起）、sys_config=6284（从 6290 起）。
-- 菜单说明：业务单据追踪（4500）、条码管理（4503）均为 ERP 顶级菜单（4260）下的二级分组；
--           组织/法人/工厂/单据状态机/审批复用既有平台底座，不在此重复定义。

-- ========== ERP 业务单据追踪分组菜单（4500，挂在 ERP 顶级菜单 4260 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4500, 'erp:trace', '业务单据追踪', 'menu', 4260, '/erp/trace', 'SearchOutlined', 27, 1);

-- ========== ERP 业务单据追踪业务菜单（4501-4502，挂在 4500 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4501, 'erp:trace:doc', '单据追溯', 'menu', 4500, '/erp/trace/docs', 'PartitionOutlined', 1, 1),
(4502, 'erp:trace:event', '业务事件', 'menu', 4500, '/erp/trace/events', 'HistoryOutlined', 2, 1);

-- ========== ERP 条码管理分组菜单（4503，挂在 ERP 顶级菜单 4260 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4503, 'erp:barcode', '条码管理', 'menu', 4260, '/erp/barcode', 'BarcodeOutlined', 28, 1);

-- ========== ERP 条码管理业务菜单（4504-4508，挂在 4503 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4504, 'erp:barcode:record', '条码生成', 'menu', 4503, '/erp/barcode/records', 'QrcodeOutlined', 1, 1),
(4505, 'erp:barcode:template', '标签模板', 'menu', 4503, '/erp/barcode/templates', 'ProfileOutlined', 2, 1),
(4506, 'erp:barcode:reprint', '补打记录', 'menu', 4503, '/erp/barcode/reprints', 'RedoOutlined', 3, 1),
(4507, 'erp:barcode:rule', '扫码规则', 'menu', 4503, '/erp/barcode/rules', 'ControlOutlined', 4, 1),
(4508, 'erp:barcode:scan', '扫描校验', 'menu', 4503, '/erp/barcode/scans', 'ScanOutlined', 5, 1);

-- ========== ERP 业务单据追踪与条码按钮（4509-4522） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4509, 'erp:trace:doc:list', '查询单据追溯', 'button', 4501, NULL, NULL, 1, 1),
(4510, 'erp:trace:doc:manage', '维护单据追溯', 'button', 4501, NULL, NULL, 2, 1),
(4511, 'erp:trace:event:list', '查询业务事件', 'button', 4502, NULL, NULL, 1, 1),
(4512, 'erp:trace:event:manage', '维护业务事件', 'button', 4502, NULL, NULL, 2, 1),
(4513, 'erp:barcode:record:list', '查询条码生成', 'button', 4504, NULL, NULL, 1, 1),
(4514, 'erp:barcode:record:manage', '维护条码生成', 'button', 4504, NULL, NULL, 2, 1),
(4515, 'erp:barcode:template:list', '查询标签模板', 'button', 4505, NULL, NULL, 1, 1),
(4516, 'erp:barcode:template:manage', '维护标签模板', 'button', 4505, NULL, NULL, 2, 1),
(4517, 'erp:barcode:reprint:list', '查询补打记录', 'button', 4506, NULL, NULL, 1, 1),
(4518, 'erp:barcode:reprint:manage', '维护补打记录', 'button', 4506, NULL, NULL, 2, 1),
(4519, 'erp:barcode:rule:list', '查询扫码规则', 'button', 4507, NULL, NULL, 1, 1),
(4520, 'erp:barcode:rule:manage', '维护扫码规则', 'button', 4507, NULL, NULL, 2, 1),
(4521, 'erp:barcode:scan:list', '查询扫描校验', 'button', 4508, NULL, NULL, 1, 1),
(4522, 'erp:barcode:scan:manage', '维护扫描校验', 'button', 4508, NULL, NULL, 2, 1);

-- ========== 角色授权 ==========

-- 管理员（2001）：授予全部权限（2 分组 + 7 菜单 + 14 按钮，共 23 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(13560, 2001, 4500), (13561, 2001, 4501), (13562, 2001, 4502), (13563, 2001, 4503),
(13564, 2001, 4504), (13565, 2001, 4505), (13566, 2001, 4506), (13567, 2001, 4507),
(13568, 2001, 4508), (13569, 2001, 4509), (13570, 2001, 4510), (13571, 2001, 4511),
(13572, 2001, 4512), (13573, 2001, 4513), (13574, 2001, 4514), (13575, 2001, 4515),
(13576, 2001, 4516), (13577, 2001, 4517), (13578, 2001, 4518), (13579, 2001, 4519),
(13580, 2001, 4520), (13581, 2001, 4521), (13582, 2001, 4522);

-- 研发工程师（2002）：授予分组与菜单 + 仅查询按钮（16 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(13583, 2002, 4500), (13584, 2002, 4501), (13585, 2002, 4502), (13586, 2002, 4503),
(13587, 2002, 4504), (13588, 2002, 4505), (13589, 2002, 4506), (13590, 2002, 4507),
(13591, 2002, 4508), (13592, 2002, 4509), (13593, 2002, 4511), (13594, 2002, 4513),
(13595, 2002, 4515), (13596, 2002, 4517), (13597, 2002, 4519), (13598, 2002, 4521);

-- 质量工程师（2003）：授予分组与菜单 + 仅查询按钮（16 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(13599, 2003, 4500), (13600, 2003, 4501), (13601, 2003, 4502), (13602, 2003, 4503),
(13603, 2003, 4504), (13604, 2003, 4505), (13605, 2003, 4506), (13606, 2003, 4507),
(13607, 2003, 4508), (13608, 2003, 4509), (13609, 2003, 4511), (13610, 2003, 4513),
(13611, 2003, 4515), (13612, 2003, 4517), (13613, 2003, 4519), (13614, 2003, 4521);

-- 生产现场（2005）：授予分组与菜单 + 仅查询按钮（16 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(13615, 2005, 4500), (13616, 2005, 4501), (13617, 2005, 4502), (13618, 2005, 4503),
(13619, 2005, 4504), (13620, 2005, 4505), (13621, 2005, 4506), (13622, 2005, 4507),
(13623, 2005, 4508), (13624, 2005, 4509), (13625, 2005, 4511), (13626, 2005, 4513),
(13627, 2005, 4515), (13628, 2005, 4517), (13629, 2005, 4519), (13630, 2005, 4521);

-- 只读用户（2006）：授予分组与菜单 + 仅查询按钮（16 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(13631, 2006, 4500), (13632, 2006, 4501), (13633, 2006, 4502), (13634, 2006, 4503),
(13635, 2006, 4504), (13636, 2006, 4505), (13637, 2006, 4506), (13638, 2006, 4507),
(13639, 2006, 4508), (13640, 2006, 4509), (13641, 2006, 4511), (13642, 2006, 4513),
(13643, 2006, 4515), (13644, 2006, 4517), (13645, 2006, 4519), (13646, 2006, 4521);

-- 供应链专员（2004）：授予全部查询与维护按钮（14 项，不含分组与菜单）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(13647, 2004, 4509), (13648, 2004, 4510), (13649, 2004, 4511), (13650, 2004, 4512),
(13651, 2004, 4513), (13652, 2004, 4514), (13653, 2004, 4515), (13654, 2004, 4516),
(13655, 2004, 4517), (13656, 2004, 4518), (13657, 2004, 4519), (13658, 2004, 4520),
(13659, 2004, 4521), (13660, 2004, 4522);

-- ========== ERP 单据追踪与条码字典（8070-8125） ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(8070, 'erp_doc_track_type', '销售订单', 'SALES_ORDER', 1, 1, NULL),
(8071, 'erp_doc_track_type', '采购订单', 'PURCHASE_ORDER', 2, 1, NULL),
(8072, 'erp_doc_track_type', '生产订单', 'PRODUCTION_ORDER', 3, 1, NULL),
(8073, 'erp_doc_track_type', '委外订单', 'OUTSOURCE_ORDER', 4, 1, NULL),
(8074, 'erp_doc_track_type', '发货单', 'DELIVERY', 5, 1, NULL),
(8075, 'erp_doc_track_type', '库存单据', 'INVENTORY', 6, 1, NULL),
(8076, 'erp_doc_track_type', '财务单据', 'FINANCE', 7, 1, NULL),
(8077, 'erp_doc_track_type', '其他', 'OTHER', 8, 1, NULL),
(8078, 'erp_doc_track_biz_status', '未开始', 'OPEN', 1, 1, NULL),
(8079, 'erp_doc_track_biz_status', '进行中', 'PROCESSING', 2, 1, NULL),
(8080, 'erp_doc_track_biz_status', '已完成', 'COMPLETED', 3, 1, NULL),
(8081, 'erp_doc_track_biz_status', '已关闭', 'CLOSED', 4, 1, NULL),
(8082, 'erp_doc_track_biz_status', '已取消', 'CANCELLED', 5, 1, NULL),
(8083, 'erp_doc_approval_status', '无需审批', 'NONE', 1, 1, NULL),
(8084, 'erp_doc_approval_status', '审批中', 'PENDING', 2, 1, NULL),
(8085, 'erp_doc_approval_status', '已通过', 'APPROVED', 3, 1, NULL),
(8086, 'erp_doc_approval_status', '已驳回', 'REJECTED', 4, 1, NULL),
(8087, 'erp_doc_event_type', '创建', 'CREATE', 1, 1, NULL),
(8088, 'erp_doc_event_type', '提交', 'SUBMIT', 2, 1, NULL),
(8089, 'erp_doc_event_type', '审批通过', 'APPROVE', 3, 1, NULL),
(8090, 'erp_doc_event_type', '审批驳回', 'REJECT', 4, 1, NULL),
(8091, 'erp_doc_event_type', '状态变更', 'STATUS_CHANGE', 5, 1, NULL),
(8092, 'erp_doc_event_type', '打印', 'PRINT', 6, 1, NULL),
(8093, 'erp_doc_event_type', '扫码', 'SCAN', 7, 1, NULL),
(8094, 'erp_doc_event_type', '关闭', 'CLOSE', 8, 1, NULL),
(8095, 'erp_doc_event_type', '其他', 'OTHER', 9, 1, NULL),
(8096, 'erp_doc_event_status', '已完成', 'DONE', 1, 1, NULL),
(8097, 'erp_doc_event_status', '处理中', 'PENDING', 2, 1, NULL),
(8098, 'erp_doc_event_status', '失败', 'FAILED', 3, 1, NULL),
(8099, 'erp_barcode_type', '采购订单条码', 'PURCHASE_ORDER', 1, 1, NULL),
(8100, 'erp_barcode_type', '生产订单条码', 'PRODUCTION_ORDER', 2, 1, NULL),
(8101, 'erp_barcode_type', '物料标签', 'MATERIAL', 3, 1, NULL),
(8102, 'erp_barcode_type', '通用标签', 'LABEL', 4, 1, NULL),
(8103, 'erp_barcode_template_type', '物料标签', 'MATERIAL', 1, 1, NULL),
(8104, 'erp_barcode_template_type', '采购订单', 'PURCHASE_ORDER', 2, 1, NULL),
(8105, 'erp_barcode_template_type', '生产订单', 'PRODUCTION_ORDER', 3, 1, NULL),
(8106, 'erp_barcode_template_type', '装箱标签', 'CARTON', 4, 1, NULL),
(8107, 'erp_barcode_template_type', '库位标签', 'LOCATION', 5, 1, NULL),
(8108, 'erp_barcode_print_status', '未打印', 'UNPRINTED', 1, 1, NULL),
(8109, 'erp_barcode_print_status', '已打印', 'PRINTED', 2, 1, NULL),
(8110, 'erp_barcode_print_status', '已补打', 'REPRINTED', 3, 1, NULL),
(8111, 'erp_barcode_print_status', '已作废', 'VOID', 4, 1, NULL),
(8112, 'erp_barcode_reprint_approval_status', '无需审批', 'NONE', 1, 1, NULL),
(8113, 'erp_barcode_reprint_approval_status', '审批中', 'PENDING', 2, 1, NULL),
(8114, 'erp_barcode_reprint_approval_status', '已通过', 'APPROVED', 3, 1, NULL),
(8115, 'erp_barcode_reprint_approval_status', '已驳回', 'REJECTED', 4, 1, NULL),
(8116, 'erp_barcode_scan_biz_type', '收料', 'RECEIPT', 1, 1, NULL),
(8117, 'erp_barcode_scan_biz_type', '发料', 'ISSUE', 2, 1, NULL),
(8118, 'erp_barcode_scan_biz_type', '盘点', 'INVENTORY', 3, 1, NULL),
(8119, 'erp_barcode_scan_biz_type', '退料', 'RETURN', 4, 1, NULL),
(8120, 'erp_barcode_scan_result', '通过', 'PASS', 1, 1, NULL),
(8121, 'erp_barcode_scan_result', '校验失败', 'FAIL', 2, 1, NULL),
(8122, 'erp_barcode_scan_result', '重复扫描', 'DUPLICATE', 3, 1, NULL),
(8123, 'erp_barcode_scan_result', '未知条码', 'UNKNOWN', 4, 1, NULL),
(8124, 'erp_common_active_status', '启用', 'ACTIVE', 1, 1, NULL),
(8125, 'erp_common_active_status', '停用', 'INACTIVE', 2, 1, NULL);

-- ========== ERP 单据追踪与条码可配置项（6290-6305） ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(6290, 'ERP', 'erp.trace.enabled', '业务单据追踪启用开关', 'true', 0, 1, 'ERP 业务单据追踪总开关，默认启用'),
(6291, 'ERP', 'erp.trace.event.log.enabled', '业务事件与操作日志启用', 'true', 0, 1, '是否记录单据业务事件与操作日志'),
(6292, 'ERP', 'erp.trace.auto.link.enabled', '上下游自动关联启用', 'true', 1, 1, '待业务方确认：业务单据是否按单号自动建立上下游追溯关联'),
(6293, 'ERP', 'erp.trace.max.level', '最大追溯层级', '5', 1, 1, '待业务方确认：单据追溯最大层级'),
(6294, 'ERP', 'erp.trace.report.default.range', '追溯报表默认范围(天)', '30', 1, 1, '待业务方确认：追溯报表默认统计范围天数'),
(6295, 'ERP', 'erp.barcode.enabled', '条码业务启用开关', 'true', 0, 1, 'ERP 条码业务总开关，默认启用'),
(6296, 'ERP', 'erp.barcode.rule.default', '默认条码规则编码', 'BCRULE001', 0, 1, '条码生成时未指定规则使用的默认规则编码'),
(6297, 'ERP', 'erp.barcode.label.template.default', '默认标签模板编码', 'BCTPL001', 0, 1, '条码打印时未指定模板使用的默认标签模板编码'),
(6298, 'ERP', 'erp.barcode.print.permission.required', '打印需权限', 'true', 1, 1, '待业务方确认：条码打印是否必须校验打印权限'),
(6299, 'ERP', 'erp.barcode.reprint.approval.required', '补打需审批', 'true', 1, 1, '待业务方确认：条码补打是否必须经审批'),
(6300, 'ERP', 'erp.barcode.reprint.max.count', '补打次数上限', '3', 1, 1, '待业务方确认：单个条码允许的最大补打次数'),
(6301, 'ERP', 'erp.barcode.scan.duplicate.check', '扫描重复校验', 'true', 1, 1, '待业务方确认：扫码是否进行重复扫描校验'),
(6302, 'ERP', 'erp.barcode.purchase.order.rule', '采购订单条码规则编码', 'BCRULE_PO', 1, 1, '待业务方确认：采购订单条码生成规则编码'),
(6303, 'ERP', 'erp.barcode.production.order.rule', '生产订单条码规则编码', 'BCRULE_MO', 1, 1, '待业务方确认：生产订单条码生成规则编码'),
(6304, 'ERP', 'erp.barcode.material.label.rule', '物料标签条码规则编码', 'BCRULE_MAT', 1, 1, '待业务方确认：物料标签条码生成规则编码'),
(6305, 'ERP', 'erp.barcode.scan.api.enabled', '扫码接口启用', 'true', 1, 1, '待业务方确认：是否对外提供扫码校验接口供扫码枪/移动端调用');
