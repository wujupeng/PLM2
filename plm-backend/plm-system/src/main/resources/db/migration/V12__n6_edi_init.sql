-- N6 初始化数据：EDI 客户需求与供应商协同的菜单与按钮权限、角色授权、字典、可配置项与联调样例数据
-- 注意：示例数据仅用于联调与验收演示，实施时由业务方通过界面或导入替换。

-- ========== N6 权限 ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(3070, 'edi-domain', 'EDI 协同', 'menu', 0, NULL, 'SwapOutlined', 60, 1),
(3071, 'edi-partner', 'EDI 伙伴', 'menu', 3070, '/edi/partner', 'TeamOutlined', 1, 1),
(3072, 'edi-trans-set', '交易集配置', 'menu', 3070, '/edi/trans-set', 'ProfileOutlined', 2, 1),
(3073, 'edi-message-map', '报文映射', 'menu', 3070, '/edi/message-map', 'NodeIndexOutlined', 3, 1),
(3074, 'edi-monitor', '报文监控台', 'menu', 3070, '/edi/monitor', 'MonitorOutlined', 4, 1),
(3075, 'edi-demand', '客户需求', 'menu', 3070, '/edi/demand', 'ImportOutlined', 5, 1),
(3076, 'edi-dispatch', '供应商分发', 'menu', 3070, '/edi/dispatch', 'ShareAltOutlined', 6, 1),
(3077, 'edi-asn', 'ASN 交付', 'menu', 3070, '/edi/asn', 'CarOutlined', 7, 1),
(3078, 'edi-supplier-material', '供货关系', 'menu', 3070, '/edi/supplier-material', 'DeploymentUnitOutlined', 8, 1),
(3401, 'edi:partner:list', '查询 EDI 伙伴', 'button', 3071, NULL, NULL, 1, 1),
(3402, 'edi:partner:save', '维护 EDI 伙伴', 'button', 3071, NULL, NULL, 2, 1),
(3403, 'edi:partner:delete', '删除 EDI 伙伴', 'button', 3071, NULL, NULL, 3, 1),
(3404, 'edi:transset:list', '查询交易集配置', 'button', 3072, NULL, NULL, 1, 1),
(3405, 'edi:transset:save', '维护交易集配置', 'button', 3072, NULL, NULL, 2, 1),
(3406, 'edi:transset:delete', '删除交易集配置', 'button', 3072, NULL, NULL, 3, 1),
(3407, 'edi:map:list', '查询报文映射', 'button', 3073, NULL, NULL, 1, 1),
(3408, 'edi:map:save', '维护报文映射', 'button', 3073, NULL, NULL, 2, 1),
(3409, 'edi:map:delete', '删除报文映射', 'button', 3073, NULL, NULL, 3, 1),
(3410, 'edi:monitor:list', '查询报文监控', 'button', 3074, NULL, NULL, 1, 1),
(3411, 'edi:monitor:retry', '报文重试', 'button', 3074, NULL, NULL, 2, 1),
(3412, 'edi:monitor:replay', '报文重放', 'button', 3074, NULL, NULL, 3, 1),
(3413, 'edi:demand:list', '查询客户需求', 'button', 3075, NULL, NULL, 1, 1),
(3414, 'edi:demand:parse', '接收并解析报文', 'button', 3075, NULL, NULL, 2, 1),
(3415, 'edi:demand:dispatch', '需求分发供应商', 'button', 3075, NULL, NULL, 3, 1),
(3416, 'edi:dispatch:list', '查询分发记录', 'button', 3076, NULL, NULL, 1, 1),
(3417, 'edi:dispatch:send', '发送需求给供应商', 'button', 3076, NULL, NULL, 2, 1),
(3418, 'edi:ack:list', '查询供应商回执', 'button', 3076, NULL, NULL, 3, 1),
(3419, 'edi:asn:list', '查询 ASN', 'button', 3077, NULL, NULL, 1, 1),
(3420, 'edi:asn:save', '创建 ASN', 'button', 3077, NULL, NULL, 2, 1),
(3421, 'edi:asn:send', '发送 ASN', 'button', 3077, NULL, NULL, 3, 1),
(3422, 'edi:suppliermaterial:list', '查询供货关系', 'button', 3078, NULL, NULL, 1, 1),
(3423, 'edi:suppliermaterial:save', '维护供货关系', 'button', 3078, NULL, NULL, 2, 1);

-- 管理员：授予 N6 全部权限
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(9801, 2001, 3070), (9802, 2001, 3071), (9803, 2001, 3072), (9804, 2001, 3073),
(9805, 2001, 3074), (9806, 2001, 3075), (9807, 2001, 3076), (9808, 2001, 3077), (9809, 2001, 3078),
(9810, 2001, 3401), (9811, 2001, 3402), (9812, 2001, 3403),
(9813, 2001, 3404), (9814, 2001, 3405), (9815, 2001, 3406),
(9816, 2001, 3407), (9817, 2001, 3408), (9818, 2001, 3409),
(9819, 2001, 3410), (9820, 2001, 3411), (9821, 2001, 3412),
(9822, 2001, 3413), (9823, 2001, 3414), (9824, 2001, 3415),
(9825, 2001, 3416), (9826, 2001, 3417), (9827, 2001, 3418),
(9828, 2001, 3419), (9829, 2001, 3420), (9830, 2001, 3421),
(9831, 2001, 3422), (9832, 2001, 3423);

-- 供应链（2004）：EDI 全流程操作主体
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(9833, 2004, 3070), (9834, 2004, 3071), (9835, 2004, 3072), (9836, 2004, 3073),
(9837, 2004, 3074), (9838, 2004, 3075), (9839, 2004, 3076), (9840, 2004, 3077), (9841, 2004, 3078),
(9842, 2004, 3401), (9843, 2004, 3402),
(9844, 2004, 3404), (9845, 2004, 3405),
(9846, 2004, 3407), (9847, 2004, 3408),
(9848, 2004, 3410), (9849, 2004, 3411), (9850, 2004, 3412),
(9851, 2004, 3413), (9852, 2004, 3414), (9853, 2004, 3415),
(9854, 2004, 3416), (9855, 2004, 3417), (9856, 2004, 3418),
(9857, 2004, 3419), (9858, 2004, 3420), (9859, 2004, 3421),
(9860, 2004, 3422), (9861, 2004, 3423);

-- 研发工程师（2002）：查看报文映射与客户需求，可维护映射
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(9862, 2002, 3070), (9863, 2002, 3073), (9864, 2002, 3074), (9865, 2002, 3075),
(9866, 2002, 3407), (9867, 2002, 3408), (9868, 2002, 3410), (9869, 2002, 3413);

-- 质量工程师（2003）：查看客户需求与供应商回执
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(9870, 2003, 3070), (9871, 2003, 3074), (9872, 2003, 3075), (9873, 2003, 3076),
(9874, 2003, 3410), (9875, 2003, 3413), (9876, 2003, 3418);

-- 只读（2006）：仅查询
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(9877, 2006, 3070), (9878, 2006, 3071), (9879, 2006, 3072), (9880, 2006, 3073),
(9881, 2006, 3074), (9882, 2006, 3075), (9883, 2006, 3076), (9884, 2006, 3077), (9885, 2006, 3078),
(9886, 2006, 3401), (9887, 2006, 3404), (9888, 2006, 3407), (9889, 2006, 3410),
(9890, 2006, 3413), (9891, 2006, 3416), (9892, 2006, 3418), (9893, 2006, 3419), (9894, 2006, 3422);

-- ========== N6 字典 ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(4901, 'edi_partner_type', '客户', 'CUSTOMER', 1, 1, NULL),
(4902, 'edi_partner_type', '供应商', 'SUPPLIER', 2, 1, NULL),
(4903, 'edi_protocol', 'SFTP', 'SFTP', 1, 1, NULL),
(4904, 'edi_protocol', 'AS2', 'AS2', 2, 1, NULL),
(4905, 'edi_protocol', 'API', 'API', 3, 1, NULL),
(4906, 'edi_protocol', '文件交换', 'FILE', 4, 1, NULL),
(4907, 'edi_direction', '接收', 'INBOUND', 1, 1, NULL),
(4908, 'edi_direction', '发送', 'OUTBOUND', 2, 1, NULL),
(4909, 'edi_standard', 'ANSI X12', 'X12', 1, 1, NULL),
(4910, 'edi_standard', 'EDIFACT', 'EDIFACT', 2, 1, NULL),
(4911, 'edi_standard', 'XML', 'XML', 3, 1, NULL),
(4912, 'edi_standard', 'CSV', 'CSV', 4, 1, NULL),
(4913, 'edi_trans_code', '长期预测 830', '830', 1, 1, NULL),
(4914, 'edi_trans_code', '采购订单 850', '850', 2, 1, NULL),
(4915, 'edi_trans_code', '交付计划 862', '862', 3, 1, NULL),
(4916, 'edi_trans_code', '订单确认 855', '855', 4, 1, NULL),
(4917, 'edi_trans_code', '发货通知 856', '856', 5, 1, NULL),
(4918, 'edi_trans_code', '功能确认 997', '997', 6, 1, NULL),
(4919, 'edi_parse_status', '已接收', 'RECEIVED', 1, 1, NULL),
(4920, 'edi_parse_status', '解析成功', 'PARSED', 2, 1, NULL),
(4921, 'edi_parse_status', '解析失败', 'FAILED', 3, 1, NULL),
(4922, 'edi_parse_status', '重复报文', 'DUPLICATE', 4, 1, NULL),
(4923, 'edi_parse_status', '死信待处理', 'DEAD_LETTER', 5, 1, NULL),
(4924, 'edi_demand_status', '新建', 'NEW', 1, 1, NULL),
(4925, 'edi_demand_status', '已变更', 'CHANGED', 2, 1, NULL),
(4926, 'edi_demand_status', '已分发', 'DISPATCHED', 3, 1, NULL),
(4927, 'edi_demand_status', '供应商已确认', 'CONFIRMED', 4, 1, NULL),
(4928, 'edi_demand_status', '已关闭', 'CLOSED', 5, 1, NULL),
(4929, 'edi_change_type', '新增', 'NEW', 1, 1, NULL),
(4930, 'edi_change_type', '数量/日期变更', 'CHANGE', 2, 1, NULL),
(4931, 'edi_change_type', '取消', 'CANCEL', 3, 1, NULL),
(4932, 'edi_dispatch_status', '待发送', 'PENDING', 1, 1, NULL),
(4933, 'edi_dispatch_status', '已发送', 'SENT', 2, 1, NULL),
(4934, 'edi_dispatch_status', '已回执', 'ACKED', 3, 1, NULL),
(4935, 'edi_dispatch_status', '发送失败', 'FAILED', 4, 1, NULL),
(4936, 'edi_dispatch_status', '已取消', 'CANCELLED', 5, 1, NULL),
(4937, 'edi_ack_status', '已确认', 'CONFIRMED', 1, 1, NULL),
(4938, 'edi_ack_status', '存在缺口', 'SHORTAGE', 2, 1, NULL),
(4939, 'edi_ack_status', '已拒绝', 'REJECTED', 3, 1, NULL),
(4940, 'edi_ack_type', '确认', 'CONFIRM', 1, 1, NULL),
(4941, 'edi_ack_type', '缺料/缺口', 'SHORTAGE', 2, 1, NULL),
(4942, 'edi_ack_type', '拒绝', 'REJECT', 3, 1, NULL),
(4943, 'edi_ack_type', '异常反馈', 'EXCEPTION', 4, 1, NULL),
(4944, 'edi_asn_status', '已创建', 'CREATED', 1, 1, NULL),
(4945, 'edi_asn_status', '已发送', 'SENT', 2, 1, NULL),
(4946, 'edi_asn_status', '已收货确认', 'ACKED', 3, 1, NULL),
(4947, 'edi_asn_status', '已取消', 'CANCELLED', 4, 1, NULL),
(4948, 'edi_send_channel', '接口推送', 'API', 1, 1, NULL),
(4949, 'edi_send_channel', '文件投递', 'FILE', 2, 1, NULL),
(4950, 'edi_send_channel', 'SFTP', 'SFTP', 3, 1, NULL),
(4951, 'edi_send_channel', '邮件', 'EMAIL', 4, 1, NULL),
(4952, 'edi_transform_type', '直接映射', 'DIRECT', 1, 1, NULL),
(4953, 'edi_transform_type', '码表转换', 'DICT', 2, 1, NULL),
(4954, 'edi_transform_type', '日期转换', 'DATE', 3, 1, NULL),
(4955, 'edi_transform_type', '固定常量', 'CONST', 4, 1, NULL),
(4956, 'edi_message_scope', '单头', 'HEADER', 1, 1, NULL),
(4957, 'edi_message_scope', '明细行', 'LINE', 2, 1, NULL),
(4958, 'edi_uom', '个', 'EA', 1, 1, 'EDI 单位码表示例，待业务方补充完整单位映射'),
(4959, 'edi_uom', '件', 'PCS', 2, 1, NULL),
(4960, 'edi_uom', '套', 'SET', 3, 1, NULL);

-- ========== N6 可配置项：未明确的编码、字段与业务规则先落默认值，待业务方集中确认 ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(5501, 'EDI', 'edi.dedup.policy', '报文防重判定依据', 'partner_code+trans_code+control_no', 1, 1, '待业务方确认防重口径是否加入校验和与时间窗'),
(5502, 'EDI', 'edi.retry.interval_minutes', '报文重试间隔（分钟）', '10', 0, 1, NULL),
(5503, 'EDI', 'edi.dead_letter.enabled', '失败报文是否进入死信待人工处理', 'true', 0, 1, NULL),
(5504, 'EDI', 'edi.auto_parse', '收到报文是否自动解析', 'true', 0, 1, NULL),
(5505, 'EDI', 'edi.demand.number.pattern', '客户需求单号规则', 'CD-{yyyyMM}-{4 位流水号}', 1, 1, '待业务方确认客户需求单编号规则'),
(5506, 'EDI', 'edi.demand.auto_dispatch', '解析成功后是否自动分发给供应商', 'false', 1, 1, '默认人工确认后分发；待业务方确认是否自动分发'),
(5507, 'EDI', 'edi.dispatch.allocation.strategy', '需求分发分配策略', 'BY_SUPPLIER_SHARE', 1, 1, 'BY_SUPPLIER_SHARE=按供货份额分配 / MANUAL=人工指定 / PRIORITY=按优先级'),
(5508, 'EDI', 'edi.ack.required', '是否要求供应商回执', 'true', 0, 1, NULL),
(5509, 'EDI', 'edi.ack.timeout_hours', '回执超时判定（小时）', '24', 1, 1, '待业务方确认回执时限与超时升级规则'),
(5510, 'EDI', 'edi.asn.required', '是否要求供应商提供 ASN', 'true', 1, 1, '待业务方确认交付反馈是否强制 ASN'),
(5511, 'EDI', 'edi.asn.auto_send', 'ASN 是否自动发送给客户', 'false', 0, 1, NULL),
(5512, 'EDI', 'edi.file.charset', '报文文件默认字符集', 'UTF-8', 0, 1, NULL),
(5513, 'EDI', 'edi.file.delimiter.segment', 'X12 段分隔符', '~', 1, 1, '待业务方按客户 EDI 规范确认分隔符'),
(5514, 'EDI', 'edi.file.delimiter.element', 'X12 元素分隔符', '*', 1, 1, '待业务方按客户 EDI 规范确认分隔符'),
(5515, 'EDI', 'edi.file.delimiter.sub_element', 'X12 子元素分隔符', ':', 1, 1, '待业务方按客户 EDI 规范确认分隔符'),
(5516, 'EDI', 'edi.std.version.default', '默认标准版本', '004010', 1, 1, '待业务方确认客户 X12/EDIFACT 版本'),
(5517, 'EDI', 'edi.demand.change.enabled', '是否启用需求变更比对', 'true', 0, 1, '按客户订单号+行号比对数量与需求日期生成变更留痕'),
(5518, 'EDI', 'edi.ack.resend.on_timeout', '回执超时是否自动重发', 'false', 1, 1, '待业务方确认超时未回执的处理策略'),
(5519, 'EDI', 'edi.log.retention_days', 'EDI 交易日志保留天数', '365', 0, 1, NULL),
(5520, 'EDI', 'edi.sample.partner_code', '联调用样例伙伴编码', 'CUST-DEMO', 1, 1, '仅用于联调演示，实施时删除');

-- ========== N6 联调样例数据：EDI 伙伴、交易集、报文映射、供货关系 ==========

INSERT INTO edi_partner (id, partner_code, partner_name, partner_type, partner_id, protocol, endpoint, port, remote_path, username, secret_ref, charset, contact, email, status, remark) VALUES
(8001, 'CUST-DEMO', '示例客户（整车厂）', 'CUSTOMER', 'CUST-0001', 'SFTP', 'sftp://demo-customer.example.com', 22, '/inbound/edi', 'demo_cust', 'secret/demo-customer', 'UTF-8', '张三', 'edi@demo-customer.example.com', 'enabled', '联调样例客户，待业务方提供真实端点与证书'),
(8002, 'SUP-A', '示例二级供应商 A', 'SUPPLIER', 'SUP-0001', 'API', 'https://supplier-a.example.com/api/edi', 443, '/edi/receive', 'sup_a', 'secret/supplier-a', 'UTF-8', '李四', 'edi@supplier-a.example.com', 'enabled', '联调样例供应商，待业务方提供供货关系与份额'),
(8003, 'SUP-B', '示例二级供应商 B', 'SUPPLIER', 'SUP-0002', 'API', 'https://supplier-b.example.com/api/edi', 443, '/edi/receive', 'sup_b', 'secret/supplier-b', 'UTF-8', '王五', 'edi@supplier-b.example.com', 'enabled', '联调样例供应商，待业务方提供供货关系与份额');

INSERT INTO edi_transaction_set (id, partner_code, trans_code, trans_name, direction, standard, std_version, header_seg_tag, line_seg_tag, ack_trans_code, ack_required, status, description) VALUES
(8101, 'CUST-DEMO', '850', '采购订单', 'INBOUND', 'X12', '004010', 'BEG', 'PO1', '997', 1, 'enabled', '客户采购订单接收'),
(8102, 'CUST-DEMO', '862', '交付计划/预测', 'INBOUND', 'X12', '004010', 'BFR', 'FST', '997', 1, 'enabled', '客户滚动交付计划'),
(8103, 'CUST-DEMO', '830', '长期预测', 'INBOUND', 'X12', '004010', 'BFR', 'FST', '997', 1, 'enabled', '客户长期要货计划'),
(8104, 'CUST-DEMO', '856', '发货通知', 'OUTBOUND', 'X12', '004010', 'BSN', 'HL', NULL, 0, 'enabled', '向客户发送发货通知'),
(8105, 'CUST-DEMO', '997', '功能确认', 'OUTBOUND', 'X12', '004010', 'AK1', 'AK2', NULL, 0, 'enabled', '对客户报文的功能确认'),
(8106, '*', '850', '采购订单（通用映射）', 'INBOUND', 'X12', '004010', 'BEG', 'PO1', '997', 1, 'enabled', '伙伴未单独配置时使用的通用交易集');

INSERT INTO edi_message_map (id, map_code, map_name, partner_code, trans_code, standard, direction, scope, source_path, target_field, transform_type, dict_type, date_pattern, default_value, required_flag, sort_no, status) VALUES
(8201, 'DEMAND-850', '客户订单 850 标准映射', '*', '850', 'X12', 'INBOUND', 'HEADER', 'BEG03', 'customerOrderNo', 'DIRECT', NULL, NULL, NULL, 1, 1, 1),
(8202, 'DEMAND-850', '客户订单 850 标准映射', '*', '850', 'X12', 'INBOUND', 'HEADER', 'BEG05', 'requiredDate', 'DATE', NULL, 'yyyyMMdd', NULL, 0, 2, 1),
(8203, 'DEMAND-850', '客户订单 850 标准映射', '*', '850', 'X12', 'INBOUND', 'HEADER', 'CUR02', 'unit', 'DICT', 'edi_uom', NULL, NULL, 0, 3, 1),
(8204, 'DEMAND-850', '客户订单 850 标准映射', '*', '850', 'X12', 'INBOUND', 'LINE', 'PO101', 'customerLineNo', 'DIRECT', NULL, NULL, NULL, 1, 1, 1),
(8205, 'DEMAND-850', '客户订单 850 标准映射', '*', '850', 'X12', 'INBOUND', 'LINE', 'PO102', 'qty', 'DIRECT', NULL, NULL, NULL, 1, 2, 1),
(8206, 'DEMAND-850', '客户订单 850 标准映射', '*', '850', 'X12', 'INBOUND', 'LINE', 'PO103', 'unit', 'DICT', 'edi_uom', NULL, NULL, 0, 3, 1),
(8207, 'DEMAND-850', '客户订单 850 标准映射', '*', '850', 'X12', 'INBOUND', 'LINE', 'PO107', 'materialCode', 'DIRECT', NULL, NULL, NULL, 1, 4, 1),
(8208, 'DEMAND-850', '客户订单 850 标准映射', '*', '850', 'X12', 'INBOUND', 'LINE', 'PO108', 'shipTo', 'DIRECT', NULL, NULL, NULL, 0, 5, 1),
(8211, 'DEMAND-862', '交付计划 862 标准映射', '*', '862', 'X12', 'INBOUND', 'HEADER', 'BFR02', 'customerOrderNo', 'DIRECT', NULL, NULL, NULL, 1, 1, 1),
(8212, 'DEMAND-862', '交付计划 862 标准映射', '*', '862', 'X12', 'INBOUND', 'HEADER', 'BFR04', 'requiredDate', 'DATE', NULL, 'yyyyMMdd', NULL, 0, 2, 1),
(8213, 'DEMAND-862', '交付计划 862 标准映射', '*', '862', 'X12', 'INBOUND', 'LINE', 'FST01', 'materialCode', 'DIRECT', NULL, NULL, NULL, 1, 1, 1),
(8214, 'DEMAND-862', '交付计划 862 标准映射', '*', '862', 'X12', 'INBOUND', 'LINE', 'FST02', 'qty', 'DIRECT', NULL, NULL, NULL, 1, 2, 1),
(8215, 'DEMAND-862', '交付计划 862 标准映射', '*', '862', 'X12', 'INBOUND', 'LINE', 'FST03', 'unit', 'DICT', 'edi_uom', NULL, NULL, 0, 3, 1),
(8216, 'DEMAND-862', '交付计划 862 标准映射', '*', '862', 'X12', 'INBOUND', 'LINE', 'FST04', 'requiredDate', 'DATE', NULL, 'yyyyMMdd', NULL, 0, 4, 1),
(8217, 'DEMAND-862', '交付计划 862 标准映射', '*', '862', 'X12', 'INBOUND', 'LINE', 'FST05', 'customerLineNo', 'DIRECT', NULL, NULL, NULL, 0, 5, 1);

INSERT INTO edi_supplier_material (id, supplier_code, supplier_name, material_code, share_pct, lead_time_days, priority, send_channel, status, remark) VALUES
(8301, 'SUP-A', '示例二级供应商 A', 'M-0001', 60.00, 7, 1, 'API', 1, '联调样例供货关系，待业务方确认份额与提前期'),
(8302, 'SUP-B', '示例二级供应商 B', 'M-0001', 40.00, 10, 2, 'API', 1, '联调样例供货关系，待业务方确认份额与提前期');
