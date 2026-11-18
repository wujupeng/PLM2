-- G6-N8 MES—数据采集（WBS T044）初始化：菜单/按钮权限、角色授权、字典与可配置项。
-- 号段基线（V132 之后已占用的最大值）：sys_permission=4945（本脚本从 4946 起）、
-- sys_role_permission=15351（从 15352 起）、sys_dictionary=8920（从 8921 起）、sys_config=6743（从 6744 起）。
-- 菜单说明：MES 顶级菜单域（4830）已由 G6-N1 建立；数据采集（4946）为其下二级分组，
--          覆盖采集设备（测试设备/仪器）、PLC/网关接口、采集数据点、校验规则、采集数据。

-- ========== 数据采集分组菜单（4946，挂在 4830 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4946, 'mes:collect', '数据采集', 'menu', 4830, '/mes/collect', 'ApiOutlined', 8, 1);

-- ========== 数据采集业务菜单（4947-4951，挂在 4946 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4947, 'mes:collect:device', '采集设备', 'menu', 4946, '/mes/collect/devices', 'ClusterOutlined', 1, 1),
(4948, 'mes:collect:interface', '采集接口', 'menu', 4946, '/mes/collect/interfaces', 'ApiOutlined', 2, 1),
(4949, 'mes:collect:point', '采集数据点', 'menu', 4946, '/mes/collect/points', 'DotChartOutlined', 3, 1),
(4950, 'mes:collect:rule', '校验规则', 'menu', 4946, '/mes/collect/rules', 'FilterOutlined', 4, 1),
(4951, 'mes:collect:record', '采集数据', 'menu', 4946, '/mes/collect/records', 'LineChartOutlined', 5, 1);

-- ========== 数据采集按钮（4952-4961） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4952, 'mes:collect:device:list', '查询采集设备', 'button', 4947, NULL, NULL, 1, 1),
(4953, 'mes:collect:device:manage', '维护采集设备', 'button', 4947, NULL, NULL, 2, 1),
(4954, 'mes:collect:interface:list', '查询采集接口', 'button', 4948, NULL, NULL, 1, 1),
(4955, 'mes:collect:interface:manage', '维护采集接口', 'button', 4948, NULL, NULL, 2, 1),
(4956, 'mes:collect:point:list', '查询采集数据点', 'button', 4949, NULL, NULL, 1, 1),
(4957, 'mes:collect:point:manage', '维护采集数据点', 'button', 4949, NULL, NULL, 2, 1),
(4958, 'mes:collect:rule:list', '查询校验规则', 'button', 4950, NULL, NULL, 1, 1),
(4959, 'mes:collect:rule:manage', '维护校验规则', 'button', 4950, NULL, NULL, 2, 1),
(4960, 'mes:collect:record:list', '查询采集数据', 'button', 4951, NULL, NULL, 1, 1),
(4961, 'mes:collect:record:manage', '维护采集数据', 'button', 4951, NULL, NULL, 2, 1);

-- ========== 角色授权 ==========

-- 管理员（2001）：授予全部权限（1 分组 + 5 菜单 + 10 按钮，共 16 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(15352, 2001, 4946), (15353, 2001, 4947), (15354, 2001, 4948), (15355, 2001, 4949),
(15356, 2001, 4950), (15357, 2001, 4951), (15358, 2001, 4952), (15359, 2001, 4953),
(15360, 2001, 4954), (15361, 2001, 4955), (15362, 2001, 4956), (15363, 2001, 4957),
(15364, 2001, 4958), (15365, 2001, 4959), (15366, 2001, 4960), (15367, 2001, 4961);

-- 质量工程师（2003）：授予全部权限（采集数据校验为质量主责，共 16 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(15368, 2003, 4946), (15369, 2003, 4947), (15370, 2003, 4948), (15371, 2003, 4949),
(15372, 2003, 4950), (15373, 2003, 4951), (15374, 2003, 4952), (15375, 2003, 4953),
(15376, 2003, 4954), (15377, 2003, 4955), (15378, 2003, 4956), (15379, 2003, 4957),
(15380, 2003, 4958), (15381, 2003, 4959), (15382, 2003, 4960), (15383, 2003, 4961);

-- 研发工程师（2002）：授予分组/菜单 + 仅查询按钮（11 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(15384, 2002, 4946), (15385, 2002, 4947), (15386, 2002, 4948), (15387, 2002, 4949),
(15388, 2002, 4950), (15389, 2002, 4951), (15390, 2002, 4952), (15391, 2002, 4954),
(15392, 2002, 4956), (15393, 2002, 4958), (15394, 2002, 4960);

-- 供应链专员（2004）：授予分组/菜单 + 仅查询按钮（11 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(15395, 2004, 4946), (15396, 2004, 4947), (15397, 2004, 4948), (15398, 2004, 4949),
(15399, 2004, 4950), (15400, 2004, 4951), (15401, 2004, 4952), (15402, 2004, 4954),
(15403, 2004, 4956), (15404, 2004, 4958), (15405, 2004, 4960);

-- 生产现场（2005）：授予分组/菜单 + 仅查询按钮（11 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(15406, 2005, 4946), (15407, 2005, 4947), (15408, 2005, 4948), (15409, 2005, 4949),
(15410, 2005, 4950), (15411, 2005, 4951), (15412, 2005, 4952), (15413, 2005, 4954),
(15414, 2005, 4956), (15415, 2005, 4958), (15416, 2005, 4960);

-- 只读用户（2006）：授予分组/菜单 + 仅查询按钮（11 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(15417, 2006, 4946), (15418, 2006, 4947), (15419, 2006, 4948), (15420, 2006, 4949),
(15421, 2006, 4950), (15422, 2006, 4951), (15423, 2006, 4952), (15424, 2006, 4954),
(15425, 2006, 4956), (15426, 2006, 4958), (15427, 2006, 4960);

-- ========== 数据采集字典（8921-8952） ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(8921, 'mes_collect_device_type', '测试设备', 'TEST', 1, 1, NULL),
(8922, 'mes_collect_device_type', '仪器', 'INSTRUMENT', 2, 1, NULL),
(8923, 'mes_collect_device_type', 'PLC', 'PLC', 3, 1, NULL),
(8924, 'mes_collect_device_type', '网关', 'GATEWAY', 4, 1, NULL),
(8925, 'mes_collect_device_type', '其他', 'OTHER', 5, 1, NULL),
(8926, 'mes_collect_protocol', 'OPC UA', 'OPCUA', 1, 1, NULL),
(8927, 'mes_collect_protocol', 'Modbus TCP', 'MODBUS_TCP', 2, 1, NULL),
(8928, 'mes_collect_protocol', 'Modbus RTU', 'MODBUS_RTU', 3, 1, NULL),
(8929, 'mes_collect_protocol', 'TCP', 'TCP', 4, 1, NULL),
(8930, 'mes_collect_protocol', '串口', 'SERIAL', 5, 1, NULL),
(8931, 'mes_collect_protocol', 'HTTP', 'HTTP', 6, 1, NULL),
(8932, 'mes_collect_status', '离线', 'OFFLINE', 1, 1, NULL),
(8933, 'mes_collect_status', '在线', 'ONLINE', 2, 1, NULL),
(8934, 'mes_collect_status', '采集中', 'COLLECTING', 3, 1, NULL),
(8935, 'mes_collect_status', '故障', 'FAULT', 4, 1, NULL),
(8936, 'mes_collect_data_type', '数值', 'NUMERIC', 1, 1, NULL),
(8937, 'mes_collect_data_type', '文本', 'TEXT', 2, 1, NULL),
(8938, 'mes_collect_data_type', '布尔', 'BOOL', 3, 1, NULL),
(8939, 'mes_collect_data_type', 'JSON', 'JSON', 4, 1, NULL),
(8940, 'mes_collect_rule_type', '量程校验', 'RANGE', 1, 1, NULL),
(8941, 'mes_collect_rule_type', '空值校验', 'NULL', 2, 1, NULL),
(8942, 'mes_collect_rule_type', '时间戳校验', 'TIMESTAMP', 3, 1, NULL),
(8943, 'mes_collect_rule_type', '枚举校验', 'ENUM', 4, 1, NULL),
(8944, 'mes_collect_rule_type', '变化率校验', 'RATE', 5, 1, NULL),
(8945, 'mes_collect_rule_action', '告警', 'WARN', 1, 1, NULL),
(8946, 'mes_collect_rule_action', '拒收', 'REJECT', 2, 1, NULL),
(8947, 'mes_collect_quality_flag', '有效', 'VALID', 1, 1, NULL),
(8948, 'mes_collect_quality_flag', '无效', 'INVALID', 2, 1, NULL),
(8949, 'mes_collect_quality_flag', '可疑', 'SUSPECT', 3, 1, NULL),
(8950, 'mes_collect_validate_status', '待校验', 'PENDING', 1, 1, NULL),
(8951, 'mes_collect_validate_status', '已通过', 'PASSED', 2, 1, NULL),
(8952, 'mes_collect_validate_status', '未通过', 'FAILED', 3, 1, NULL);

-- ========== 数据采集可配置项（6744-6755） ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(6744, 'MES', 'mes.collect.enabled', '数据采集启用开关', 'true', 0, 1, 'MES 数据采集总开关，默认启用'),
(6745, 'MES', 'mes.collect.device.no.prefix', '采集设备编号前缀', 'MCD', 0, 1, '采集设备编号自动生成前缀'),
(6746, 'MES', 'mes.collect.interface.no.prefix', '采集接口编号前缀', 'MCI', 0, 1, '采集接口编号自动生成前缀'),
(6747, 'MES', 'mes.collect.point.no.prefix', '采集数据点编号前缀', 'MCP', 0, 1, '采集数据点编号自动生成前缀'),
(6748, 'MES', 'mes.collect.rule.no.prefix', '校验规则编号前缀', 'MCR', 0, 1, '校验规则编号自动生成前缀'),
(6749, 'MES', 'mes.collect.record.no.prefix', '采集数据编号前缀', 'MCS', 0, 1, '采集数据记录编号自动生成前缀'),
(6750, 'MES', 'mes.collect.sample.interval.seconds', '默认采集频率', '10', 1, 1, '待业务方确认：接口默认采集频率（秒）'),
(6751, 'MES', 'mes.collect.timestamp.tolerance.seconds', '时间戳容差', '5', 1, 1, '待业务方确认：采集时间戳与接收时间的允许偏差（秒）'),
(6752, 'MES', 'mes.collect.default.protocol', '默认通讯协议', 'MODBUS_TCP', 1, 1, '待业务方确认：PLC/网关接口默认通讯协议'),
(6753, 'MES', 'mes.collect.retention.days', '采集数据保存天数', '365', 1, 1, '待业务方确认：采集数据保存天数'),
(6754, 'MES', 'mes.collect.invalid.allow.save', '无效数据允许入库', 'true', 1, 1, '待业务方确认：校验未通过的采集数据是否允许入库'),
(6755, 'MES', 'mes.collect.data.batch.size', '采集批量写入条数', '200', 1, 1, '待业务方确认：单批采集数据写入条数');
