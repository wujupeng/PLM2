-- N8 初始化数据：生产执行与发货追溯的菜单与按钮权限、角色授权、字典、可配置项与联调样例数据
-- 注意：示例数据仅用于联调与验收演示，实施时由业务方通过界面或导入替换。

-- ========== N8 权限 ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(3090, 'mfg-domain', '生产执行与追溯', 'menu', 0, NULL, 'DeploymentUnitOutlined', 80, 1),
(3091, 'mfg-batch', '生产批次', 'menu', 3090, '/mfg/batch', 'ProfileOutlined', 1, 1),
(3092, 'mfg-operation', '工序过站', 'menu', 3090, '/mfg/operation', 'NodeIndexOutlined', 2, 1),
(3093, 'mfg-test', '测试数据', 'menu', 3090, '/mfg/test', 'ExperimentOutlined', 3, 1),
(3094, 'mfg-package', '包装与箱码', 'menu', 3090, '/mfg/package', 'DropboxOutlined', 4, 1),
(3095, 'mfg-shipment', '出货与放行', 'menu', 3090, '/mfg/shipment', 'CarOutlined', 5, 1),
(3096, 'mfg-trace', '追溯查询', 'menu', 3090, '/mfg/trace', 'SearchOutlined', 6, 1),
(3097, 'mfg-recall', '召回与隔离', 'menu', 3090, '/mfg/recall', 'StopOutlined', 7, 1),
(3461, 'mfg:batch:list', '查询生产批次', 'button', 3091, NULL, NULL, 1, 1),
(3462, 'mfg:batch:save', '维护生产批次', 'button', 3091, NULL, NULL, 2, 1),
(3463, 'mfg:operation:list', '查询过站记录', 'button', 3092, NULL, NULL, 1, 1),
(3464, 'mfg:operation:save', '录入过站记录', 'button', 3092, NULL, NULL, 2, 1),
(3465, 'mfg:test:list', '查询测试结果', 'button', 3093, NULL, NULL, 1, 1),
(3466, 'mfg:test:save', '录入测试结果', 'button', 3093, NULL, NULL, 2, 1),
(3467, 'mfg:package:list', '查询包装', 'button', 3094, NULL, NULL, 1, 1),
(3468, 'mfg:package:save', '维护包装', 'button', 3094, NULL, NULL, 2, 1),
(3469, 'mfg:package:seal', '封箱', 'button', 3094, NULL, NULL, 3, 1),
(3470, 'mfg:shipment:list', '查询出货单', 'button', 3095, NULL, NULL, 1, 1),
(3471, 'mfg:shipment:save', '维护出货单', 'button', 3095, NULL, NULL, 2, 1),
(3472, 'mfg:shipment:scan', '出货扫码复核', 'button', 3095, NULL, NULL, 3, 1),
(3473, 'mfg:shipment:release', '发货放行', 'button', 3095, NULL, NULL, 4, 1),
(3474, 'mfg:trace:list', '追溯查询', 'button', 3096, NULL, NULL, 1, 1),
(3475, 'mfg:recall:list', '查询召回', 'button', 3097, NULL, NULL, 1, 1),
(3476, 'mfg:recall:create', '发起召回', 'button', 3097, NULL, NULL, 2, 1),
(3477, 'mfg:recall:isolate', '执行批次隔离', 'button', 3097, NULL, NULL, 3, 1),
(3478, 'mfg:recall:close', '关闭召回', 'button', 3097, NULL, NULL, 4, 1),
(3479, 'mfg:trace:save', '维护追溯绑定', 'button', 3096, NULL, NULL, 2, 1);

-- 管理员：授予 N8 全部权限
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(10020, 2001, 3090), (10021, 2001, 3091), (10022, 2001, 3092), (10023, 2001, 3093), (10024, 2001, 3094),
(10025, 2001, 3095), (10026, 2001, 3096), (10027, 2001, 3097), (10028, 2001, 3461), (10029, 2001, 3462),
(10030, 2001, 3463), (10031, 2001, 3464), (10032, 2001, 3465), (10033, 2001, 3466), (10034, 2001, 3467),
(10035, 2001, 3468), (10036, 2001, 3469), (10037, 2001, 3470), (10038, 2001, 3471), (10039, 2001, 3472),
(10040, 2001, 3473), (10041, 2001, 3474), (10042, 2001, 3475), (10043, 2001, 3476), (10044, 2001, 3477),
(10045, 2001, 3478), (10115, 2001, 3479);

-- 生产现场（2005）：生产批次、工序过站、测试数据、包装、出货扫码、追溯
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(10046, 2005, 3090), (10047, 2005, 3091), (10048, 2005, 3092), (10049, 2005, 3093), (10050, 2005, 3094),
(10051, 2005, 3095), (10052, 2005, 3096),
(10053, 2005, 3461), (10054, 2005, 3462), (10055, 2005, 3463), (10056, 2005, 3464), (10057, 2005, 3465),
(10058, 2005, 3466), (10059, 2005, 3467), (10060, 2005, 3468), (10061, 2005, 3469), (10062, 2005, 3470),
(10063, 2005, 3471), (10064, 2005, 3472), (10065, 2005, 3474), (10116, 2005, 3479);

-- 质量工程师（2003）：生产批次只读、测试数据、追溯、召回
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(10066, 2003, 3090), (10067, 2003, 3091), (10068, 2003, 3093), (10069, 2003, 3096), (10070, 2003, 3097),
(10071, 2003, 3461), (10072, 2003, 3465), (10073, 2003, 3466), (10074, 2003, 3474),
(10075, 2003, 3475), (10076, 2003, 3476), (10077, 2003, 3477), (10078, 2003, 3478);

-- 供应链专员（2004）：包装、出货与放行、追溯、召回只读
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(10079, 2004, 3090), (10080, 2004, 3094), (10081, 2004, 3095), (10082, 2004, 3096), (10083, 2004, 3097),
(10084, 2004, 3467), (10085, 2004, 3468), (10086, 2004, 3469), (10087, 2004, 3470), (10088, 2004, 3471),
(10089, 2004, 3472), (10090, 2004, 3473), (10091, 2004, 3474), (10092, 2004, 3475);

-- 研发工程师（2002）：生产批次、测试数据、追溯只读
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(10093, 2002, 3090), (10094, 2002, 3091), (10095, 2002, 3093), (10096, 2002, 3096),
(10097, 2002, 3461), (10098, 2002, 3465), (10099, 2002, 3474);

-- 只读用户（2006）：全菜单只读
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(10100, 2006, 3090), (10101, 2006, 3091), (10102, 2006, 3092), (10103, 2006, 3093), (10104, 2006, 3094),
(10105, 2006, 3095), (10106, 2006, 3096), (10107, 2006, 3097),
(10108, 2006, 3461), (10109, 2006, 3463), (10110, 2006, 3465), (10111, 2006, 3467), (10112, 2006, 3470),
(10113, 2006, 3474), (10114, 2006, 3475);

-- ========== N8 字典 ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(5100, 'mfg_batch_status', '计划中', 'PLANNED', 1, 1, NULL),
(5101, 'mfg_batch_status', '生产中', 'IN_PROCESS', 2, 1, NULL),
(5102, 'mfg_batch_status', '已完工', 'COMPLETED', 3, 1, NULL),
(5103, 'mfg_batch_status', '已关闭', 'CLOSED', 4, 1, NULL),
(5104, 'mfg_release_status', '未放行', 'UNRELEASED', 1, 1, NULL),
(5105, 'mfg_release_status', '已放行', 'RELEASED', 2, 1, NULL),
(5106, 'mfg_release_status', '暂停', 'HOLD', 3, 1, NULL),
(5107, 'mfg_operation_result', '合格', 'OK', 1, 1, NULL),
(5108, 'mfg_operation_result', '不合格', 'NG', 2, 1, NULL),
(5109, 'mfg_operation_result', '返工', 'REWORK', 3, 1, NULL),
(5110, 'mfg_interface_status', '已接收', 'RECEIVED', 1, 1, NULL),
(5111, 'mfg_interface_status', '已处理', 'PROCESSED', 2, 1, NULL),
(5112, 'mfg_interface_status', '处理失败', 'FAILED', 3, 1, NULL),
(5113, 'mfg_interface_status', '已补偿', 'COMPENSATED', 4, 1, NULL),
(5114, 'mfg_test_type', '电气测试', 'ELECTRICAL', 1, 1, NULL),
(5115, 'mfg_test_type', '尺寸检测', 'DIMENSION', 2, 1, NULL),
(5116, 'mfg_test_type', '装配检查', 'ASSEMBLY', 3, 1, NULL),
(5117, 'mfg_test_type', '焊接质量', 'WELDING', 4, 1, NULL),
(5118, 'mfg_test_type', '点胶灌封', 'POTTING', 5, 1, NULL),
(5119, 'mfg_test_type', '功能测试', 'FUNCTION', 6, 1, NULL),
(5120, 'mfg_trace_type', '单件', 'SINGLE', 1, 1, NULL),
(5121, 'mfg_trace_type', '批次', 'BATCH', 2, 1, NULL),
(5122, 'mfg_package_level', '内箱', 'INNER', 1, 1, NULL),
(5123, 'mfg_package_level', '外箱', 'OUTER', 2, 1, NULL),
(5124, 'mfg_package_level', '托盘', 'PALLET', 3, 1, NULL),
(5125, 'mfg_package_status', '待封箱', 'OPEN', 1, 1, NULL),
(5126, 'mfg_package_status', '已封箱', 'SEALED', 2, 1, NULL),
(5127, 'mfg_package_status', '已发运', 'SHIPPED', 3, 1, NULL),
(5128, 'mfg_shipment_status', '已创建', 'CREATED', 1, 1, NULL),
(5129, 'mfg_shipment_status', '已复核', 'VERIFIED', 2, 1, NULL),
(5130, 'mfg_shipment_status', '已放行', 'RELEASED', 3, 1, NULL),
(5131, 'mfg_shipment_status', '已发运', 'SHIPPED', 4, 1, NULL),
(5132, 'mfg_shipment_status', '已取消', 'CANCELLED', 5, 1, NULL),
(5133, 'mfg_scan_result', '通过', 'PASS', 1, 1, NULL),
(5134, 'mfg_scan_result', '阻断', 'BLOCKED', 2, 1, NULL),
(5135, 'mfg_scan_type', '箱码', 'PACKAGE', 1, 1, NULL),
(5136, 'mfg_scan_type', '单件码', 'SERIAL', 2, 1, NULL),
(5137, 'mfg_scan_type', '物料批次码', 'MATERIAL_BATCH', 3, 1, NULL),
(5138, 'mfg_recall_type', '物料批次', 'MATERIAL_BATCH', 1, 1, NULL),
(5139, 'mfg_recall_type', '生产批次', 'PRODUCTION_BATCH', 2, 1, NULL),
(5140, 'mfg_recall_type', '客户', 'CUSTOMER', 3, 1, NULL),
(5141, 'mfg_recall_type', '日期范围', 'DATE_RANGE', 4, 1, NULL),
(5142, 'mfg_recall_status', '已发起', 'OPEN', 1, 1, NULL),
(5143, 'mfg_recall_status', '隔离中', 'ISOLATING', 2, 1, NULL),
(5144, 'mfg_recall_status', '已隔离', 'ISOLATED', 3, 1, NULL),
(5145, 'mfg_recall_status', '已关闭', 'CLOSED', 4, 1, NULL),
(5146, 'mfg_impact_type', '产品', 'PRODUCT', 1, 1, NULL),
(5147, 'mfg_impact_type', '库存', 'STOCK', 2, 1, NULL),
(5148, 'mfg_impact_type', '工单', 'WORK_ORDER', 3, 1, NULL),
(5149, 'mfg_impact_type', '客户', 'CUSTOMER', 4, 1, NULL),
(5150, 'mfg_enabled', '启用', 'enabled', 1, 1, NULL),
(5151, 'mfg_enabled', '停用', 'disabled', 2, 1, NULL);

-- ========== N8 可配置项：未明确的业务规则先落默认值，待业务方集中确认 ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(5701, 'MFG', 'mfg.trace.code.source', '追溯码来源', 'LABEL', 1, 1, 'LABEL=N5 标签编码 / OFFLINE=离线导入；待业务方确认'),
(5702, 'MFG', 'mfg.trace.serial.required', '单件是否强制序列号', 'true', 1, 1, '待业务方确认哪些产品需要单件级追溯'),
(5703, 'MFG', 'mfg.operation.source', '工序过站数据来源', 'MES', 1, 1, 'MES=取自 IF-10 / MANUAL=人工录入；待业务方确认'),
(5704, 'MFG', 'mfg.operation.collect.mode', '工序数据采集方式', 'EVENT', 1, 1, 'EVENT=实时事件 / POLL=定时拉取；待业务方确认'),
(5705, 'MFG', 'mfg.operation.miss.alert.minutes', '过站数据缺失告警（分钟）', '30', 1, 1, '超时未收到 MES 实绩时告警；待业务方确认'),
(5706, 'MFG', 'mfg.test.auto.judge', '测试结果是否按上下限自动判定', 'true', 0, 1, '按 lower_limit/upper_limit 自动判定 OK/NG'),
(5707, 'MFG', 'mfg.test.ng.block.next', '测试不合格是否阻断后续', 'true', 1, 1, '待业务方确认不合格处置流程'),
(5708, 'MFG', 'mfg.package.default.level', '默认包装层级', 'INNER', 0, 1, 'INNER/OUTER/PALLET'),
(5709, 'MFG', 'mfg.package.label.template', '默认包装标签模板编码', 'TPL-BOX-DEMO', 1, 1, '待业务方提供客户包装标签模板'),
(5710, 'MFG', 'mfg.package.repack.require.reason', '重包是否需要原因', 'true', 1, 1, '拆箱/并箱/重包留痕；待业务方确认'),
(5711, 'MFG', 'mfg.shipment.over.qty.block', '出货超订单数量是否阻断', 'true', 1, 1, '待业务方确认超发容差'),
(5712, 'MFG', 'mfg.shipment.dup.scan.block', '重复扫描是否阻断', 'true', 0, 1, NULL),
(5713, 'MFG', 'mfg.shipment.customer.match.strict', '出货客户是否严格匹配', 'true', 1, 1, '待业务方确认客户/收货方匹配口径'),
(5714, 'MFG', 'mfg.shipment.version.match.strict', '出货版本是否严格匹配', 'true', 1, 1, '待业务方确认版本匹配规则'),
(5715, 'MFG', 'mfg.shipment.release.require.approval', '发货放行是否需要审批', 'true', 1, 1, '待业务方确认放行审批层级'),
(5716, 'MFG', 'mfg.shipment.asn.auto.create', '放行后是否自动生成 ASN', 'true', 0, 1, '对接 N6 EDI 856 发货通知'),
(5717, 'MFG', 'mfg.shipment.asn.auto.send', 'ASN 是否自动发送客户', 'false', 1, 1, '待业务方确认是否自动发送；关闭时人工触发'),
(5718, 'MFG', 'mfg.trace.forward.enabled', '是否启用正向追溯', 'true', 0, 1, '由物料批次反查影响产品与客户'),
(5719, 'MFG', 'mfg.trace.backward.enabled', '是否启用反向追溯', 'true', 0, 1, '由产品码反查物料、供应商、生产、检验、发货'),
(5720, 'MFG', 'mfg.recall.owner.default', '召回默认责任人', '质量主管', 1, 1, '待业务方确认召回责任人与升级路径'),
(5721, 'MFG', 'mfg.recall.require.evidence', '关闭召回是否需要证据', 'true', 0, 1, NULL),
(5722, 'MFG', 'mfg.recall.isolate.stock.auto', '召回是否自动冻结库存', 'true', 1, 1, '待业务方确认库存冻结范围与解冻流程'),
(5723, 'MFG', 'mfg.if10.mes.endpoint', 'MES 过站/实绩接口地址（IF-10）', '', 1, 1, '待业务方提供 MES 接口地址与认证方式'),
(5724, 'MFG', 'mfg.if09.erp.endpoint', 'ERP 工单/库存接口地址（IF-09）', '', 1, 1, '待业务方提供 ERP 接口地址与认证方式'),
(5725, 'MFG', 'mfg.sample.demo.enabled', '联调样例数据开关', 'true', 1, 1, '仅用于联调演示，实施时删除');

-- ========== N8 联调样例数据：生产批次、追溯绑定、包装规则、出货单 ==========

INSERT INTO mfg_production_batch (id, batch_no, work_order_no, product_code, product_name, product_version, bom_version, process_version, production_date, shift_code, line_code, work_station, planned_qty, completed_qty, scrap_qty, batch_status, release_status, source_system, remark) VALUES
(9601, 'PB20261113001', 'WO-2026-001', 'P-1001', '示例产品 P-1001', 'V1.0', 'BOM-V1.0', 'RT-V1.0', DATE '2026-11-13', 'DAY', 'LINE-1', 'ST-01', 3.0000, 3.0000, 0.0000, 'COMPLETED', 'RELEASED', 'MES', '联调样例：已完工并放行的生产批次'),
(9602, 'PB20261113002', 'WO-2026-002', 'P-1002', '示例产品 P-1002', 'V1.0', 'BOM-V1.0', 'RT-V1.0', DATE '2026-11-13', 'DAY', 'LINE-1', 'ST-02', 5.0000, 0.0000, 0.0000, 'PLANNED', 'UNRELEASED', 'MES', '联调样例：计划中的生产批次');

INSERT INTO mfg_trace_binding (id, binding_no, trace_code, trace_type, batch_no, serial_no, product_code, material_code, material_name, material_batch_no, material_supplier, operation_code, quantity, unit, bind_time, source_system, remark) VALUES
(9701, 'TB-2026-0001', 'SN-2026-0001', 'SINGLE', 'PB20261113001', 'SN-2026-0001', 'P-1001', 'M-0001', '示例物料 M-0001', 'B20261101', 'SUP-A', 'OP10', 1.0000, 'EA', TIMESTAMP '2026-11-13 09:10:00', 'MES', '联调样例：单件绑定较早批次物料'),
(9702, 'TB-2026-0002', 'SN-2026-0002', 'SINGLE', 'PB20261113001', 'SN-2026-0002', 'P-1001', 'M-0001', '示例物料 M-0001', 'B20261101', 'SUP-A', 'OP10', 1.0000, 'EA', TIMESTAMP '2026-11-13 09:15:00', 'MES', '联调样例：单件绑定较早批次物料'),
(9703, 'TB-2026-0003', 'SN-2026-0003', 'SINGLE', 'PB20261113001', 'SN-2026-0003', 'P-1001', 'M-0001', '示例物料 M-0001', 'B20261101', 'SUP-A', 'OP10', 1.0000, 'EA', TIMESTAMP '2026-11-13 09:20:00', 'MES', '联调样例：单件绑定较早批次物料');

INSERT INTO mfg_package_rule (id, rule_no, product_code, package_level, package_qty, inner_qty_per_box, box_per_pallet, label_template_code, customer_code, status, remark) VALUES
(9801, 'PKR-P1001-INNER', 'P-1001', 'INNER', 3.0000, 3.0000, 10.0000, 'TPL-BOX-DEMO', NULL, 'enabled', '联调样例：P-1001 内箱装 3 只'),
(9802, 'PKR-P1001-OUTER', 'P-1001', 'OUTER', 30.0000, NULL, NULL, 'TPL-BOX-DEMO', NULL, 'enabled', '联调样例：P-1001 外箱装 30 只');

INSERT INTO mfg_package (id, package_no, package_code, package_level, parent_package_no, product_code, batch_no, work_order_no, package_qty, customer_code, package_status, packed_at, operator, remark) VALUES
(9851, 'PKG-2026-0001', 'BOX-P1001-0001', 'INNER', NULL, 'P-1001', 'PB20261113001', 'WO-2026-001', 3.0000, 'CUST-DEMO', 'SEALED', TIMESTAMP '2026-11-13 10:30:00', 'admin', '联调样例：已封箱内箱');

INSERT INTO mfg_package_item (id, package_no, serial_no, trace_code, material_code, material_batch_no, quantity, item_status, remark) VALUES
(9861, 'PKG-2026-0001', 'SN-2026-0001', 'SN-2026-0001', 'P-1001', 'PB20261113001', 1.0000, 'PACKED', '联调样例'),
(9862, 'PKG-2026-0001', 'SN-2026-0002', 'SN-2026-0002', 'P-1001', 'PB20261113001', 1.0000, 'PACKED', '联调样例'),
(9863, 'PKG-2026-0001', 'SN-2026-0003', 'SN-2026-0003', 'P-1001', 'PB20261113001', 1.0000, 'PACKED', '联调样例');

INSERT INTO mfg_shipment (id, shipment_no, customer_code, customer_name, order_no, delivery_plan_no, product_code, product_name, product_version, order_qty, planned_qty, scanned_qty, shipped_qty, package_count, shipment_status, release_status, carrier, vehicle_no, ship_date, remark) VALUES
(9901, 'SHP20261113001', 'CUST-DEMO', '示例客户 CUST-DEMO', 'SO-2026-001', 'DP-2026-001', 'P-1001', '示例产品 P-1001', 'V1.0', 3.0000, 3.0000, 0.0000, 0.0000, 1, 'CREATED', 'UNRELEASED', '顺丰速运', '沪A12345', DATE '2026-11-13', '联调样例：待扫码复核与放行的出货单');

INSERT INTO mfg_shipment_line (id, shipment_no, line_no, order_no, order_line_no, product_code, product_version, batch_no, serial_no, trace_code, package_no, qty, scan_status, line_status, remark) VALUES
(9951, 'SHP20261113001', 1, 'SO-2026-001', 1, 'P-1001', 'V1.0', 'PB20261113001', NULL, NULL, 'PKG-2026-0001', 3.0000, 'PENDING', 'OPEN', '联调样例：出货明细 1');
