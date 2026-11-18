-- G6-N6 MES—产品追溯（WBS T042）初始化：菜单/按钮权限、角色授权、字典与可配置项。
-- 号段基线（V127 之后已占用的最大值）：sys_permission=4910（本脚本从 4911 起）、
-- sys_role_permission=15185（从 15186 起）、sys_dictionary=8869（从 8870 起）、sys_config=6719（从 6720 起）。
-- 菜单说明：MES 顶级菜单域（4830）已由 G6-N1 建立；产品追溯（4911）为其下二级分组，
--          覆盖序列号台账、批次追溯、追溯码（Data Matrix）、追溯关联、追溯记录。

-- ========== 产品追溯分组菜单（4911，挂在 4830 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4911, 'mes:trace', '产品追溯', 'menu', 4830, '/mes/trace', 'NodeIndexOutlined', 6, 1);

-- ========== 产品追溯业务菜单（4912-4916，挂在 4911 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4912, 'mes:trace:serial', '序列号台账', 'menu', 4911, '/mes/trace/serials', 'NumberOutlined', 1, 1),
(4913, 'mes:trace:batch', '批次追溯', 'menu', 4911, '/mes/trace/batches', 'ClusterOutlined', 2, 1),
(4914, 'mes:trace:code', '追溯码', 'menu', 4911, '/mes/trace/codes', 'QrcodeOutlined', 3, 1),
(4915, 'mes:trace:link', '追溯关联', 'menu', 4911, '/mes/trace/links', 'DeploymentUnitOutlined', 4, 1),
(4916, 'mes:trace:record', '追溯记录', 'menu', 4911, '/mes/trace/records', 'ProfileOutlined', 5, 1);

-- ========== 产品追溯按钮（4917-4926） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4917, 'mes:trace:serial:list', '查询序列号台账', 'button', 4912, NULL, NULL, 1, 1),
(4918, 'mes:trace:serial:manage', '维护序列号台账', 'button', 4912, NULL, NULL, 2, 1),
(4919, 'mes:trace:batch:list', '查询批次追溯', 'button', 4913, NULL, NULL, 1, 1),
(4920, 'mes:trace:batch:manage', '维护批次追溯', 'button', 4913, NULL, NULL, 2, 1),
(4921, 'mes:trace:code:list', '查询追溯码', 'button', 4914, NULL, NULL, 1, 1),
(4922, 'mes:trace:code:manage', '维护追溯码', 'button', 4914, NULL, NULL, 2, 1),
(4923, 'mes:trace:link:list', '查询追溯关联', 'button', 4915, NULL, NULL, 1, 1),
(4924, 'mes:trace:link:manage', '维护追溯关联', 'button', 4915, NULL, NULL, 2, 1),
(4925, 'mes:trace:record:list', '查询追溯记录', 'button', 4916, NULL, NULL, 1, 1),
(4926, 'mes:trace:record:manage', '维护追溯记录', 'button', 4916, NULL, NULL, 2, 1);

-- ========== 角色授权 ==========

-- 管理员（2001）：授予全部权限（1 分组 + 5 菜单 + 10 按钮，共 16 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(15186, 2001, 4911), (15187, 2001, 4912), (15188, 2001, 4913), (15189, 2001, 4914),
(15190, 2001, 4915), (15191, 2001, 4916), (15192, 2001, 4917), (15193, 2001, 4918),
(15194, 2001, 4919), (15195, 2001, 4920), (15196, 2001, 4921), (15197, 2001, 4922),
(15198, 2001, 4923), (15199, 2001, 4924), (15200, 2001, 4925), (15201, 2001, 4926);

-- 质量工程师（2003）：授予全部权限（产品追溯为质量主责，共 16 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(15202, 2003, 4911), (15203, 2003, 4912), (15204, 2003, 4913), (15205, 2003, 4914),
(15206, 2003, 4915), (15207, 2003, 4916), (15208, 2003, 4917), (15209, 2003, 4918),
(15210, 2003, 4919), (15211, 2003, 4920), (15212, 2003, 4921), (15213, 2003, 4922),
(15214, 2003, 4923), (15215, 2003, 4924), (15216, 2003, 4925), (15217, 2003, 4926);

-- 研发工程师（2002）：授予分组/菜单 + 仅查询按钮（11 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(15218, 2002, 4911), (15219, 2002, 4912), (15220, 2002, 4913), (15221, 2002, 4914),
(15222, 2002, 4915), (15223, 2002, 4916), (15224, 2002, 4917), (15225, 2002, 4919),
(15226, 2002, 4921), (15227, 2002, 4923), (15228, 2002, 4925);

-- 供应链专员（2004）：授予分组/菜单 + 仅查询按钮（11 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(15229, 2004, 4911), (15230, 2004, 4912), (15231, 2004, 4913), (15232, 2004, 4914),
(15233, 2004, 4915), (15234, 2004, 4916), (15235, 2004, 4917), (15236, 2004, 4919),
(15237, 2004, 4921), (15238, 2004, 4923), (15239, 2004, 4925);

-- 生产现场（2005）：授予分组/菜单 + 仅查询按钮（11 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(15240, 2005, 4911), (15241, 2005, 4912), (15242, 2005, 4913), (15243, 2005, 4914),
(15244, 2005, 4915), (15245, 2005, 4916), (15246, 2005, 4917), (15247, 2005, 4919),
(15248, 2005, 4921), (15249, 2005, 4923), (15250, 2005, 4925);

-- 只读用户（2006）：授予分组/菜单 + 仅查询按钮（11 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(15251, 2006, 4911), (15252, 2006, 4912), (15253, 2006, 4913), (15254, 2006, 4914),
(15255, 2006, 4915), (15256, 2006, 4916), (15257, 2006, 4917), (15258, 2006, 4919),
(15259, 2006, 4921), (15260, 2006, 4923), (15261, 2006, 4925);

-- ========== 产品追溯字典（8870-8897） ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(8870, 'mes_serial_number_status', '已创建', 'CREATED', 1, 1, NULL),
(8871, 'mes_serial_number_status', '在库', 'IN_STOCK', 2, 1, NULL),
(8872, 'mes_serial_number_status', '已发货', 'SHIPPED', 3, 1, NULL),
(8873, 'mes_serial_number_status', '已使用', 'CONSUMED', 4, 1, NULL),
(8874, 'mes_serial_number_status', '已报废', 'SCRAPPED', 5, 1, NULL),
(8875, 'mes_batch_status', '待检', 'PENDING', 1, 1, NULL),
(8876, 'mes_batch_status', '在制', 'IN_PROCESS', 2, 1, NULL),
(8877, 'mes_batch_status', '已完工', 'COMPLETED', 3, 1, NULL),
(8878, 'mes_batch_status', '已出货', 'SHIPPED', 4, 1, NULL),
(8879, 'mes_batch_status', '已冻结', 'FROZEN', 5, 1, NULL),
(8880, 'mes_trace_code_type', 'Data Matrix', 'DATAMATRIX', 1, 1, NULL),
(8881, 'mes_trace_code_type', '二维码', 'QRCODE', 2, 1, NULL),
(8882, 'mes_trace_code_type', '条形码', 'BARCODE', 3, 1, NULL),
(8883, 'mes_trace_code_type', 'RFID', 'RFID', 4, 1, NULL),
(8884, 'mes_trace_code_status', '未激活', 'INACTIVE', 1, 1, NULL),
(8885, 'mes_trace_code_status', '已激活', 'ACTIVE', 2, 1, NULL),
(8886, 'mes_trace_code_status', '已作废', 'VOID', 3, 1, NULL),
(8887, 'mes_trace_link_type', '人员', 'PERSON', 1, 1, NULL),
(8888, 'mes_trace_link_type', '设备', 'EQUIPMENT', 2, 1, NULL),
(8889, 'mes_trace_link_type', '工艺', 'PROCESS', 3, 1, NULL),
(8890, 'mes_trace_link_type', '物料', 'MATERIAL', 4, 1, NULL),
(8891, 'mes_trace_link_type', '参数', 'PARAMETER', 5, 1, NULL),
(8892, 'mes_trace_object_type', '序列号', 'SERIAL', 1, 1, NULL),
(8893, 'mes_trace_object_type', '批次', 'BATCH', 2, 1, NULL),
(8894, 'mes_trace_object_type', '追溯码', 'CODE', 3, 1, NULL),
(8895, 'mes_trace_record_status', '草稿', 'DRAFT', 1, 1, NULL),
(8896, 'mes_trace_record_status', '已归档', 'ARCHIVED', 2, 1, NULL),
(8897, 'mes_trace_record_status', '已作废', 'CANCELLED', 3, 1, NULL);

-- ========== 产品追溯可配置项（6720-6731） ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(6720, 'MES', 'mes.trace.enabled', '产品追溯启用开关', 'true', 0, 1, 'MES 产品追溯总开关，默认启用'),
(6721, 'MES', 'mes.trace.serial.no.prefix', '序列号编号前缀', 'MSN', 0, 1, '序列号编号自动生成前缀'),
(6722, 'MES', 'mes.trace.serial.rule', '序列号编码规则', '{PART14}-{YYMMDD}-{SEQ6}', 1, 1, '待业务方确认：14位零件号+日期+流水 的序列号编码规则'),
(6723, 'MES', 'mes.trace.batch.no.prefix', '批次编号前缀', 'MBT', 0, 1, '批次编号自动生成前缀'),
(6724, 'MES', 'mes.trace.code.no.prefix', '追溯码编号前缀', 'MDM', 0, 1, '追溯码编号自动生成前缀'),
(6725, 'MES', 'mes.trace.code.default.type', '追溯码默认码制', 'DATAMATRIX', 1, 1, '待业务方确认：追溯码默认码制（Data Matrix/二维码/条形码/RFID）'),
(6726, 'MES', 'mes.trace.code.length', '追溯码内容长度', '28', 1, 1, '待业务方确认：28位追溯码内容规则长度'),
(6727, 'MES', 'mes.trace.link.no.prefix', '追溯关联编号前缀', 'MLK', 0, 1, '追溯关联记录编号自动生成前缀'),
(6728, 'MES', 'mes.trace.record.no.prefix', '追溯记录编号前缀', 'MTR', 0, 1, '追溯记录编号自动生成前缀'),
(6729, 'MES', 'mes.trace.record.need.approve', '追溯记录需确认开关', 'true', 1, 1, '待业务方确认：追溯记录归档前是否需质量主管确认'),
(6730, 'MES', 'mes.trace.lock.on.close', '追溯归档锁定开关', 'true', 0, 1, '追溯记录归档后是否锁定关联数据'),
(6731, 'MES', 'mes.trace.retention.years', '追溯数据保存年限', '10', 1, 1, '待业务方确认：追溯数据保存年限（年）');
