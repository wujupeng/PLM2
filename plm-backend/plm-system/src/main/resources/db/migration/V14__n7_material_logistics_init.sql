-- N7 初始化数据：物料供应、Kanban、FIFO 与缺料管理的菜单与按钮权限、角色授权、字典、可配置项与联调样例数据
-- 注意：示例数据仅用于联调与验收演示，实施时由业务方通过界面或导入替换。

-- ========== N7 权限 ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(3080, 'wms-domain', '物料供应与看板', 'menu', 0, NULL, 'ControlOutlined', 70, 1),
(3081, 'wms-location', '库位与物料标识', 'menu', 3080, '/wms/location', 'ClusterOutlined', 1, 1),
(3082, 'wms-kanban', '电子看板', 'menu', 3080, '/wms/kanban', 'DashboardOutlined', 2, 1),
(3083, 'wms-delivery', '物料配送', 'menu', 3080, '/wms/delivery', 'CarryOutOutlined', 3, 1),
(3084, 'wms-pick', '扫码领料', 'menu', 3080, '/wms/pick', 'ScanOutlined', 4, 1),
(3085, 'wms-fifo', 'FIFO 规则', 'menu', 3080, '/wms/fifo', 'FieldTimeOutlined', 5, 1),
(3086, 'wms-binding', '防混料绑定', 'menu', 3080, '/wms/binding', 'LinkOutlined', 6, 1),
(3087, 'wms-line-stock', '线边库存', 'menu', 3080, '/wms/line-stock', 'BuildOutlined', 7, 1),
(3088, 'wms-shortage', '缺料与欠料', 'menu', 3080, '/wms/shortage', 'AlertOutlined', 8, 1),
(3089, 'wms-plan', '应急预案', 'menu', 3080, '/wms/plan', 'SafetyCertificateOutlined', 9, 1),
(3431, 'wms:location:list', '查询库位', 'button', 3081, NULL, NULL, 1, 1),
(3432, 'wms:location:save', '维护库位', 'button', 3081, NULL, NULL, 2, 1),
(3433, 'wms:location:delete', '删除库位', 'button', 3081, NULL, NULL, 3, 1),
(3434, 'wms:batch:list', '查询物料批次', 'button', 3081, NULL, NULL, 4, 1),
(3435, 'wms:batch:save', '维护物料批次', 'button', 3081, NULL, NULL, 5, 1),
(3436, 'wms:kanban:list', '查询看板', 'button', 3082, NULL, NULL, 1, 1),
(3437, 'wms:kanban:save', '维护看板', 'button', 3082, NULL, NULL, 2, 1),
(3438, 'wms:kanban:pull', '触发看板拉动', 'button', 3082, NULL, NULL, 3, 1),
(3439, 'wms:delivery:list', '查询配送任务', 'button', 3083, NULL, NULL, 1, 1),
(3440, 'wms:delivery:execute', '执行配送任务', 'button', 3083, NULL, NULL, 2, 1),
(3441, 'wms:pick:list', '查询领料记录', 'button', 3084, NULL, NULL, 1, 1),
(3442, 'wms:pick:verify', '扫码领料校验', 'button', 3084, NULL, NULL, 2, 1),
(3443, 'wms:fifo:list', '查询 FIFO 规则', 'button', 3085, NULL, NULL, 1, 1),
(3444, 'wms:fifo:save', '维护 FIFO 规则', 'button', 3085, NULL, NULL, 2, 1),
(3445, 'wms:binding:list', '查询防混料绑定', 'button', 3086, NULL, NULL, 1, 1),
(3446, 'wms:binding:save', '维护防混料绑定', 'button', 3086, NULL, NULL, 2, 1),
(3447, 'wms:linestock:list', '查询线边库存', 'button', 3087, NULL, NULL, 1, 1),
(3448, 'wms:linestock:operate', '线边库存收发操作', 'button', 3087, NULL, NULL, 2, 1),
(3449, 'wms:shortage:list', '查询缺料与欠料', 'button', 3088, NULL, NULL, 1, 1),
(3450, 'wms:shortage:calculate', '触发缺料预警计算', 'button', 3088, NULL, NULL, 2, 1),
(3451, 'wms:shortage:handle', '欠料异常处理与关闭', 'button', 3088, NULL, NULL, 3, 1),
(3452, 'wms:plan:list', '查询应急预案', 'button', 3089, NULL, NULL, 1, 1),
(3453, 'wms:plan:save', '维护应急预案', 'button', 3089, NULL, NULL, 2, 1),
(3454, 'wms:plan:approve', '审批应急预案', 'button', 3089, NULL, NULL, 3, 1);

-- 管理员：授予 N7 全部权限
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(9901, 2001, 3080), (9902, 2001, 3081), (9903, 2001, 3082), (9904, 2001, 3083), (9905, 2001, 3084),
(9906, 2001, 3085), (9907, 2001, 3086), (9908, 2001, 3087), (9909, 2001, 3088), (9910, 2001, 3089),
(9911, 2001, 3431), (9912, 2001, 3432), (9913, 2001, 3433), (9914, 2001, 3434), (9915, 2001, 3435),
(9916, 2001, 3436), (9917, 2001, 3437), (9918, 2001, 3438), (9919, 2001, 3439), (9920, 2001, 3440),
(9921, 2001, 3441), (9922, 2001, 3442), (9923, 2001, 3443), (9924, 2001, 3444), (9925, 2001, 3445),
(9926, 2001, 3446), (9927, 2001, 3447), (9928, 2001, 3448), (9929, 2001, 3449), (9930, 2001, 3450),
(9931, 2001, 3451), (9932, 2001, 3452), (9933, 2001, 3453), (9934, 2001, 3454);

-- 供应链专员（2004）：库位、看板、配送、FIFO、线边库存、缺料与计划
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(9935, 2004, 3080), (9936, 2004, 3081), (9937, 2004, 3082), (9938, 2004, 3083), (9939, 2004, 3085),
(9940, 2004, 3087), (9941, 2004, 3088), (9942, 2004, 3089),
(9943, 2004, 3431), (9944, 2004, 3432), (9945, 2004, 3434), (9946, 2004, 3435),
(9947, 2004, 3436), (9948, 2004, 3437), (9949, 2004, 3438), (9950, 2004, 3439), (9951, 2004, 3440),
(9952, 2004, 3443), (9953, 2004, 3444), (9954, 2004, 3447), (9955, 2004, 3448),
(9956, 2004, 3449), (9957, 2004, 3450), (9958, 2004, 3451),
(9959, 2004, 3452), (9960, 2004, 3453), (9961, 2004, 3454);

-- 生产现场（2005）：看板拉动、配送签收、扫码领料、防混料、线边库存
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(9962, 2005, 3080), (9963, 2005, 3082), (9964, 2005, 3083), (9965, 2005, 3084),
(9966, 2005, 3086), (9967, 2005, 3087), (9968, 2005, 3088),
(9969, 2005, 3436), (9970, 2005, 3438), (9971, 2005, 3439), (9972, 2005, 3440),
(9973, 2005, 3441), (9974, 2005, 3442), (9975, 2005, 3445), (9976, 2005, 3446),
(9977, 2005, 3447), (9978, 2005, 3448), (9979, 2005, 3449);

-- 质量工程师（2003）：库位与批次、FIFO 规则、防混料绑定只读
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(9980, 2003, 3080), (9981, 2003, 3081), (9982, 2003, 3085), (9983, 2003, 3086),
(9984, 2003, 3431), (9985, 2003, 3434), (9986, 2003, 3443), (9987, 2003, 3445);

-- 研发工程师（2002）：库位与 FIFO 规则只读
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(9988, 2002, 3080), (9989, 2002, 3081), (9990, 2002, 3085),
(9991, 2002, 3431), (9992, 2002, 3434), (9993, 2002, 3443);

-- 只读用户（2006）：全菜单只读
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(9994, 2006, 3080), (9995, 2006, 3081), (9996, 2006, 3082), (9997, 2006, 3083), (9998, 2006, 3084),
(9999, 2006, 3085), (10000, 2006, 3086), (10001, 2006, 3087), (10002, 2006, 3088), (10003, 2006, 3089),
(10004, 2006, 3431), (10005, 2006, 3434), (10006, 2006, 3436), (10007, 2006, 3439), (10008, 2006, 3441),
(10009, 2006, 3443), (10010, 2006, 3445), (10011, 2006, 3447), (10012, 2006, 3449), (10013, 2006, 3452);

-- ========== N7 字典 ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(4961, 'wms_location_type', '货架库位', 'RACK', 1, 1, NULL),
(4962, 'wms_location_type', '存储区', 'STORAGE', 2, 1, NULL),
(4963, 'wms_location_type', '暂存区', 'STAGING', 3, 1, NULL),
(4964, 'wms_location_type', '线边库位', 'LINE_SIDE', 4, 1, NULL),
(4965, 'wms_location_type', '收货区', 'RECEIVING', 5, 1, NULL),
(4966, 'wms_kanban_type', '生产看板', 'PRODUCTION', 1, 1, NULL),
(4967, 'wms_kanban_type', '供应商看板', 'SUPPLIER', 2, 1, NULL),
(4968, 'wms_kanban_type', '内部看板', 'IN_HOUSE', 3, 1, NULL),
(4969, 'wms_kanban_status', '满箱', 'FULL', 1, 1, NULL),
(4970, 'wms_kanban_status', '空箱待补', 'EMPTY', 2, 1, NULL),
(4971, 'wms_kanban_status', '补货中', 'REPLENISHING', 3, 1, NULL),
(4972, 'wms_kanban_status', '停用', 'IDLE', 4, 1, NULL),
(4973, 'wms_pull_signal', '看板卡', 'CARD', 1, 1, NULL),
(4974, 'wms_pull_signal', '电子拉动', 'ELECTRONIC', 2, 1, NULL),
(4975, 'wms_pull_signal', '安灯呼叫', 'ANDON', 3, 1, NULL),
(4976, 'wms_task_type', '补料', 'REPLENISH', 1, 1, NULL),
(4977, 'wms_task_type', '退料', 'RETURN', 2, 1, NULL),
(4978, 'wms_task_type', '调拨', 'TRANSFER', 3, 1, NULL),
(4979, 'wms_delivery_status', '待派发', 'CREATED', 1, 1, NULL),
(4980, 'wms_delivery_status', '已接单', 'ACCEPTED', 2, 1, NULL),
(4981, 'wms_delivery_status', '配送中', 'DELIVERING', 3, 1, NULL),
(4982, 'wms_delivery_status', '已签收', 'SIGNED', 4, 1, NULL),
(4983, 'wms_delivery_status', '已取消', 'CANCELLED', 5, 1, NULL),
(4984, 'wms_pick_result', '通过', 'PASS', 1, 1, NULL),
(4985, 'wms_pick_result', '阻断', 'BLOCKED', 2, 1, NULL),
(4986, 'wms_pick_result', '预警放行', 'WARN', 3, 1, NULL),
(4987, 'wms_fifo_result', '符合先进先出', 'FIFO_OK', 1, 1, NULL),
(4988, 'wms_fifo_result', '违反先进先出', 'FIFO_VIOLATION', 2, 1, NULL),
(4989, 'wms_fifo_result', '授权例外', 'FIFO_EXCEPTION', 3, 1, NULL),
(4990, 'wms_fifo_basis', '入库日期', 'INBOUND_DATE', 1, 1, NULL),
(4991, 'wms_fifo_basis', '检验放行日期', 'RELEASE_DATE', 2, 1, NULL),
(4992, 'wms_fifo_basis', '批次日期', 'BATCH_DATE', 3, 1, NULL),
(4993, 'wms_fifo_basis', '生产日期', 'PRODUCTION_DATE', 4, 1, NULL),
(4994, 'wms_inspection_status', '待检', 'PENDING', 1, 1, NULL),
(4995, 'wms_inspection_status', '已放行', 'RELEASED', 2, 1, NULL),
(4996, 'wms_inspection_status', '不合格', 'REJECTED', 3, 1, NULL),
(4997, 'wms_batch_status', '在库', 'IN_STOCK', 1, 1, NULL),
(4998, 'wms_batch_status', '已消耗', 'CONSUMED', 2, 1, NULL),
(4999, 'wms_batch_status', '已退料', 'RETURNED', 3, 1, NULL),
(5000, 'wms_batch_status', '已报废', 'SCRAPPED', 4, 1, NULL),
(5001, 'wms_batch_status', '已超期', 'EXPIRED', 5, 1, NULL),
(5002, 'wms_binding_type', '产线-物料绑定', 'LINE_MATERIAL', 1, 1, NULL),
(5003, 'wms_binding_type', '产线-批次绑定', 'LINE_BATCH', 2, 1, NULL),
(5004, 'wms_binding_type', '工位-容器绑定', 'STATION_CONTAINER', 3, 1, NULL),
(5005, 'wms_txn_type', '入库', 'INBOUND', 1, 1, NULL),
(5006, 'wms_txn_type', '发料', 'ISSUE', 2, 1, NULL),
(5007, 'wms_txn_type', '消耗', 'CONSUME', 3, 1, NULL),
(5008, 'wms_txn_type', '退料', 'RETURN', 4, 1, NULL),
(5009, 'wms_txn_type', '报废', 'SCRAP', 5, 1, NULL),
(5010, 'wms_txn_type', '盘点调整', 'COUNT_ADJUST', 6, 1, NULL),
(5011, 'wms_txn_type', '调拨', 'TRANSFER', 7, 1, NULL),
(5012, 'wms_stock_status', '正常', 'NORMAL', 1, 1, NULL),
(5013, 'wms_stock_status', '预警', 'WARNING', 2, 1, NULL),
(5014, 'wms_stock_status', '缺料', 'SHORTAGE', 3, 1, NULL),
(5015, 'wms_warning_level', '提示', 'L1', 1, 1, NULL),
(5016, 'wms_warning_level', '关注', 'L2', 2, 1, NULL),
(5017, 'wms_warning_level', '严重', 'L3', 3, 1, NULL),
(5018, 'wms_warning_level', '紧急', 'CRITICAL', 4, 1, NULL),
(5019, 'wms_warning_status', '待处理', 'OPEN', 1, 1, NULL),
(5020, 'wms_warning_status', '已确认', 'ACK', 2, 1, NULL),
(5021, 'wms_warning_status', '处理中', 'PROCESSING', 3, 1, NULL),
(5022, 'wms_warning_status', '已关闭', 'CLOSED', 4, 1, NULL),
(5023, 'wms_case_status', '待处理', 'OPEN', 1, 1, NULL),
(5024, 'wms_case_status', '处理中', 'PROCESSING', 2, 1, NULL),
(5025, 'wms_case_status', '已关闭', 'CLOSED', 3, 1, NULL),
(5026, 'wms_plan_type', '替代料', 'SUBSTITUTE', 1, 1, NULL),
(5027, 'wms_plan_type', '跨仓调拨', 'TRANSFER', 2, 1, NULL),
(5028, 'wms_plan_type', '供应商加急', 'EXPEDITE', 3, 1, NULL),
(5029, 'wms_plan_type', '计划调整', 'RESCHEDULE', 4, 1, NULL),
(5030, 'wms_plan_type', '升级上报', 'ESCALATE', 5, 1, NULL),
(5031, 'wms_plan_status', '草稿', 'DRAFT', 1, 1, NULL),
(5032, 'wms_plan_status', '已审批', 'APPROVED', 2, 1, NULL),
(5033, 'wms_plan_status', '执行中', 'EXECUTING', 3, 1, NULL),
(5034, 'wms_plan_status', '已完成', 'COMPLETED', 4, 1, NULL),
(5035, 'wms_plan_status', '已取消', 'CANCELLED', 5, 1, NULL);

-- ========== N7 可配置项：未明确的业务规则先落默认值，待业务方集中确认 ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(5601, 'WMS', 'wms.fifo.default_basis', 'FIFO 默认判定依据', 'INBOUND_DATE', 1, 1, 'INBOUND_DATE=入库日期 / RELEASE_DATE=检验放行日期 / BATCH_DATE=批次日期 / PRODUCTION_DATE=生产日期；待业务方确认'),
(5602, 'WMS', 'wms.fifo.expiry_warn_days', '临期预警天数', '30', 1, 1, '距有效期小于该天数时预警；待业务方确认'),
(5603, 'WMS', 'wms.fifo.expiry_block', '超期批次是否阻断领料', 'true', 1, 1, '待业务方确认超期批次是否允许授权放行'),
(5604, 'WMS', 'wms.fifo.exception.required', 'FIFO 例外是否需授权留痕', 'true', 0, 1, '违反 FIFO 时必须填写授权人与原因'),
(5605, 'WMS', 'wms.fifo.exception.role', 'FIFO 例外授权角色', '生产主管', 1, 1, '待业务方确认例外授权角色与审批要求'),
(5606, 'WMS', 'wms.fifo.customer.strategy.enabled', '是否启用客户特定 FIFO 策略', 'true', 1, 1, '待业务方提供各客户特定批次策略'),
(5607, 'WMS', 'wms.kanban.replenish.trigger', '看板补货触发方式', 'POINT', 1, 1, 'POINT=低于补货点触发 / EMPTY=空箱触发；待业务方确认'),
(5608, 'WMS', 'wms.kanban.pull.signal', '看板拉动信号方式', 'ELECTRONIC', 0, 1, 'CARD/ELECTRONIC/ANDON'),
(5609, 'WMS', 'wms.kanban.default.container_qty', '看板默认单箱数量', '100', 1, 1, '待业务方按物料包装规格确认'),
(5610, 'WMS', 'wms.kanban.auto.delivery.task', '看板拉动是否自动生成配送任务', 'true', 0, 1, NULL),
(5611, 'WMS', 'wms.mix.check.enabled', '是否启用防混料校验', 'true', 0, 1, NULL),
(5612, 'WMS', 'wms.mix.check.mode', '防混料校验模式', 'STRICT', 1, 1, 'STRICT=阻断 / WARN=预警放行；待业务方确认'),
(5613, 'WMS', 'wms.mix.check.fields', '防混料校验字段', 'line_code,material_code,batch_no,container_code,work_station', 1, 1, '待业务方确认防混料校验维度'),
(5614, 'WMS', 'wms.pick.verify.required', '领料是否强制扫码校验', 'true', 0, 1, '工单/物料/批次/库位/数量/目标产线工位'),
(5615, 'WMS', 'wms.pick.qty.exceed.block', '领料数量超发是否阻断', 'true', 1, 1, '待业务方确认超发容差'),
(5616, 'WMS', 'wms.line.stock.warning.ratio', '线边库存预警比例', '0.2', 1, 1, '低于安全库存该比例时预警；待业务方确认'),
(5617, 'WMS', 'wms.inventory.count.tolerance', '盘点差异容差', '0', 1, 1, '待业务方确认盘点差异允许范围'),
(5618, 'WMS', 'wms.shortage.safety.stock.default', '缺料计算默认安全库存', '0', 1, 1, '待业务方按物料确认安全库存'),
(5619, 'WMS', 'wms.shortage.lead.time.days', '缺料计算默认采购提前期（天）', '7', 1, 1, '待业务方确认各物料提前期，或改由 ERP 提供'),
(5620, 'WMS', 'wms.shortage.in_transit.source', '在途库存来源', 'ERP', 1, 1, 'ERP=取自 IF-09 接口 / MANUAL=人工维护；待业务方确认'),
(5621, 'WMS', 'wms.shortage.warning.level.rule', '缺料预警等级规则', 'gap>0且需求日期落在提前期内=CRITICAL; gap>0且需求日期在提前期后=L2', 1, 1, '待业务方确认分级规则与责任人'),
(5622, 'WMS', 'wms.shortage.warning.calc.schedule', '缺料预警计算频率', 'DAILY', 1, 1, 'DAILY/HOURLY/MANUAL；待业务方确认'),
(5623, 'WMS', 'wms.shortage.owner.default', '欠料默认责任人角色', '计划员', 1, 1, '待业务方确认欠料责任人与影响范围口径'),
(5624, 'WMS', 'wms.shortage.escalation.hours', '欠料升级时限（小时）', '4', 1, 1, '待业务方确认升级路径与时限'),
(5625, 'WMS', 'wms.plan.require.approval', '应急预案是否需审批', 'true', 1, 1, '待业务方确认应急预案审批层级'),
(5626, 'WMS', 'wms.if09.erp.endpoint', 'ERP 库存/在途/工单接口地址（IF-09）', '', 1, 1, '待业务方提供 ERP 接口地址与认证方式'),
(5627, 'WMS', 'wms.if10.mes.endpoint', 'MES 工单/过站接口地址（IF-10）', '', 1, 1, '待业务方提供 MES 接口地址与认证方式'),
(5628, 'WMS', 'wms.shortage.calc.enabled', '是否启用缺料预警自动计算', 'true', 0, 1, NULL),
(5629, 'WMS', 'wms.line.stock.auto.sync', '线边库存是否与 MES 自动同步', 'false', 1, 1, '待业务方确认线边库存同步方式（IF-10）'),
(5630, 'WMS', 'wms.sample.demo.enabled', '联调样例数据开关', 'true', 1, 1, '仅用于联调演示，实施时删除');

-- ========== N7 联调样例数据：库位、批次库存、看板、FIFO 规则、防混料绑定、线边库存 ==========

INSERT INTO wms_storage_location (id, location_code, location_name, warehouse_code, area_code, rack_code, level_code, bin_code, location_type, line_code, capacity, status, remark) VALUES
(9001, 'WH-A-01-01', 'A 区 01 排 01 层', 'WH-A', 'A-01', 'R01', 'L01', '01', 'RACK', NULL, 2000.0000, 'enabled', '联调样例货架库位'),
(9002, 'WH-A-01-02', 'A 区 01 排 02 层', 'WH-A', 'A-01', 'R01', 'L02', '02', 'RACK', NULL, 2000.0000, 'enabled', '联调样例货架库位'),
(9003, 'STG-01', '收货暂存区 01', 'WH-A', 'STG', NULL, NULL, NULL, 'STAGING', NULL, 5000.0000, 'enabled', '联调样例暂存区'),
(9004, 'LINE-1-SIDE', '总装一线线边库位', 'WH-A', 'LINE', NULL, NULL, NULL, 'LINE_SIDE', 'LINE-1', 1000.0000, 'enabled', '联调样例线边库位');

INSERT INTO wms_material_batch (id, batch_no, material_code, material_name, location_code, container_code, supplier_code, qty_on_hand, unit, inbound_date, release_date, production_date, expiry_date, inspection_status, batch_status, remark) VALUES
(9101, 'B20261101', 'M-0001', '示例物料 M-0001', 'WH-A-01-01', 'BOX-1001', 'SUP-A', 500.0000, 'EA', DATE '2026-11-01', DATE '2026-11-02', DATE '2026-10-28', NULL, 'RELEASED', 'IN_STOCK', '联调样例：较早入库批次'),
(9102, 'B20261105', 'M-0001', '示例物料 M-0001', 'WH-A-01-01', 'BOX-1002', 'SUP-A', 300.0000, 'EA', DATE '2026-11-05', DATE '2026-11-06', DATE '2026-11-02', NULL, 'RELEASED', 'IN_STOCK', '联调样例：较晚入库批次'),
(9103, 'B20261020', 'M-0002', '示例物料 M-0002', 'WH-A-01-02', 'BOX-2001', 'SUP-B', 20.0000, 'EA', DATE '2026-10-20', DATE '2026-10-21', DATE '2026-10-15', DATE '2026-11-30', 'RELEASED', 'IN_STOCK', '联调样例：临期批次');

INSERT INTO wms_kanban (id, kanban_no, kanban_type, material_code, material_name, from_location_code, line_code, work_station, container_qty, replenish_point, min_qty, max_qty, current_qty, kanban_status, pull_signal, supplier_code, lead_time_days, status, remark) VALUES
(9201, 'KB-M0001-L1', 'PRODUCTION', 'M-0001', '示例物料 M-0001', 'WH-A-01-01', 'LINE-1', 'ST-01', 100.0000, 50.0000, 20.0000, 200.0000, 40.0000, 'FULL', 'ELECTRONIC', NULL, 1, 'enabled', '联调样例：当前数量低于补货点，可触发拉动'),
(9202, 'KB-M0002-L1', 'PRODUCTION', 'M-0002', '示例物料 M-0002', 'WH-A-01-02', 'LINE-1', 'ST-02', 50.0000, 20.0000, 10.0000, 100.0000, 60.0000, 'FULL', 'ELECTRONIC', NULL, 1, 'enabled', '联调样例：库存充足');

INSERT INTO wms_fifo_rule (id, rule_code, rule_name, scope, customer_code, material_code, fifo_basis, expiry_check, expiry_warn_days, allow_exception, exception_role, priority, status, remark) VALUES
(9301, 'FIFO-GLOBAL', '全局先进先出规则', 'GLOBAL', NULL, NULL, 'INBOUND_DATE', 1, 30, 1, '生产主管', 100, 1, '联调样例：默认按入库日期先进先出，超期阻断'),
(9302, 'FIFO-CUST-DEMO', '示例客户特定 FIFO 规则', 'CUSTOMER', 'CUST-DEMO', NULL, 'RELEASE_DATE', 1, 15, 1, '质量主管', 10, 1, '联调样例：客户特定策略按检验放行日期，优先级更高'),
(9303, 'FIFO-M0001', '物料 M-0001 专用 FIFO 规则', 'MATERIAL', NULL, 'M-0001', 'INBOUND_DATE', 0, NULL, 0, NULL, 20, 1, '联调样例：该物料不允许 FIFO 例外');

INSERT INTO wms_material_binding (id, binding_no, bind_type, line_code, work_station, material_code, batch_no, container_code, bind_status, remark) VALUES
(9401, 'BIND-L1-M0001', 'LINE_MATERIAL', 'LINE-1', NULL, 'M-0001', NULL, NULL, 'enabled', '联调样例：总装一线只允许使用 M-0001'),
(9402, 'BIND-L1-M0002', 'LINE_MATERIAL', 'LINE-1', NULL, 'M-0002', NULL, NULL, 'enabled', '联调样例：总装一线只允许使用 M-0002'),
(9403, 'BIND-ST01-CT', 'STATION_CONTAINER', 'LINE-1', 'ST-01', 'M-0001', NULL, 'BOX-1001', 'enabled', '联调样例：ST-01 工位绑定容器 BOX-1001');

INSERT INTO wms_line_side_stock (id, line_code, work_station, material_code, material_name, batch_no, container_code, unit, qty_on_hand, qty_issued, qty_consumed, qty_returned, qty_scrapped, safety_stock, stock_status, remark) VALUES
(9501, 'LINE-1', 'ST-01', 'M-0001', '示例物料 M-0001', 'B20261101', 'BOX-1001', 'EA', 40.0000, 40.0000, 0.0000, 0.0000, 0.0000, 20.0000, 'NORMAL', '联调样例：线边库存'),
(9502, 'LINE-1', 'ST-02', 'M-0002', '示例物料 M-0002', 'B20261020', 'BOX-2001', 'EA', 60.0000, 60.0000, 0.0000, 0.0000, 0.0000, 10.0000, 'NORMAL', '联调样例：线边库存');
