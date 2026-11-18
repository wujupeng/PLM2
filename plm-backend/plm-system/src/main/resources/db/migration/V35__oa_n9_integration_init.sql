-- OA-N9 初始化数据：开放集成平台的菜单、按钮权限、角色授权、字典与可配置项
-- 号段避让：菜单 3824-3829、按钮 3830-3840、角色授权 11479-11538、字典 6680-6721、配置 6021-6030。
-- 复用既有字典：oa_data_source、oa_biz_flow_status 等；本节点不新增流程表单（集成平台为配置+运行记录型能力）。

-- ========== OA-N9 权限（菜单 3824-3829，按钮 3830-3840） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(3824, 'oa-integration-gateway', 'API 网关', 'menu', 3600, '/oa/integration/gateway', 'ApiOutlined', 34, 1),
(3825, 'oa-integration-webhook', 'Webhook 订阅', 'menu', 3600, '/oa/integration/webhook', 'NotificationOutlined', 35, 1),
(3826, 'oa-integration-task', '消息任务队列', 'menu', 3600, '/oa/integration/task', 'ClusterOutlined', 36, 1),
(3827, 'oa-integration-connector', '集成连接器', 'menu', 3600, '/oa/integration/connector', 'DeploymentUnitOutlined', 37, 1),
(3828, 'oa-integration-edi', 'EDI 状态通知', 'menu', 3600, '/oa/integration/edi', 'SwapOutlined', 38, 1),
(3829, 'oa-integration-monitor', '接口监控台', 'menu', 3600, '/oa/integration/monitor', 'DashboardOutlined', 39, 1),
(3830, 'oa:integration:api:list', '查询网关策略与凭证', 'button', 3824, NULL, NULL, 1, 1),
(3831, 'oa:integration:api:manage', '维护网关策略与凭证', 'button', 3824, NULL, NULL, 2, 1),
(3832, 'oa:integration:webhook:list', '查询 Webhook 订阅与投递', 'button', 3825, NULL, NULL, 1, 1),
(3833, 'oa:integration:webhook:manage', '维护 Webhook 订阅与投递', 'button', 3825, NULL, NULL, 2, 1),
(3834, 'oa:integration:task:list', '查询消息任务', 'button', 3826, NULL, NULL, 1, 1),
(3835, 'oa:integration:task:manage', '维护消息任务', 'button', 3826, NULL, NULL, 2, 1),
(3836, 'oa:integration:connector:list', '查询集成连接器', 'button', 3827, NULL, NULL, 1, 1),
(3837, 'oa:integration:connector:manage', '维护连接器与主数据映射', 'button', 3827, NULL, NULL, 2, 1),
(3838, 'oa:integration:edi:list', '查询 EDI 通知', 'button', 3828, NULL, NULL, 1, 1),
(3839, 'oa:integration:edi:manage', '处理 EDI 通知', 'button', 3828, NULL, NULL, 2, 1),
(3840, 'oa:integration:monitor:list', '查看集成监控', 'button', 3829, NULL, NULL, 1, 1);

-- 管理员（2001）：授予 OA-N9 全部权限
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11479, 2001, 3824), (11480, 2001, 3825), (11481, 2001, 3826), (11482, 2001, 3827),
(11483, 2001, 3828), (11484, 2001, 3829), (11485, 2001, 3830), (11486, 2001, 3831),
(11487, 2001, 3832), (11488, 2001, 3833), (11489, 2001, 3834), (11490, 2001, 3835),
(11491, 2001, 3836), (11492, 2001, 3837), (11493, 2001, 3838), (11494, 2001, 3839),
(11495, 2001, 3840);

-- 研发工程师（2002）：集成平台全部菜单只读
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11496, 2002, 3824), (11497, 2002, 3825), (11498, 2002, 3826), (11499, 2002, 3827),
(11500, 2002, 3828), (11501, 2002, 3829), (11502, 2002, 3830), (11503, 2002, 3832),
(11504, 2002, 3834), (11505, 2002, 3836), (11506, 2002, 3838);

-- 质量工程师（2003）：连接器与 EDI 只读 + 监控
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11507, 2003, 3827), (11508, 2003, 3828), (11509, 2003, 3829),
(11510, 2003, 3836), (11511, 2003, 3838), (11512, 2003, 3840);

-- 供应链专员（2004）：连接器（含维护）+ EDI（含处理）+ Webhook 查询 + 监控
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11513, 2004, 3827), (11514, 2004, 3825), (11515, 2004, 3828), (11516, 2004, 3829),
(11517, 2004, 3832), (11518, 2004, 3836), (11519, 2004, 3837), (11520, 2004, 3838),
(11521, 2004, 3839), (11522, 2004, 3840);

-- 生产现场（2005）：连接器只读（MES）+ 监控
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11523, 2005, 3827), (11524, 2005, 3829), (11525, 2005, 3836), (11526, 2005, 3840);

-- 只读用户（2006）：全部菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11527, 2006, 3824), (11528, 2006, 3825), (11529, 2006, 3826), (11530, 2006, 3827),
(11531, 2006, 3828), (11532, 2006, 3829), (11533, 2006, 3830), (11534, 2006, 3832),
(11535, 2006, 3834), (11536, 2006, 3836), (11537, 2006, 3838), (11538, 2006, 3840);

-- ========== OA-N9 字典 ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(6680, 'oa_integration_system', 'PLM 产品生命周期', 'PLM', 1, 1, NULL),
(6681, 'oa_integration_system', 'ERP 企业资源', 'ERP', 2, 1, NULL),
(6682, 'oa_integration_system', 'MES 制造执行', 'MES', 3, 1, NULL),
(6683, 'oa_integration_system', 'QMS 质量管理', 'QMS', 4, 1, NULL),
(6684, 'oa_integration_system', 'EDI 电子数据交换', 'EDI', 5, 1, NULL),
(6685, 'oa_sync_direction', '入向（外部到 OA）', 'INBOUND', 1, 1, NULL),
(6686, 'oa_sync_direction', '出向（OA 到外部）', 'OUTBOUND', 2, 1, NULL),
(6687, 'oa_sync_direction', '双向', 'BIDIRECTIONAL', 3, 1, '双向更新需先确认主数据权威源，待业务方确认'),
(6688, 'oa_message_task_type', '邮件发送', 'EMAIL', 1, 1, NULL),
(6689, 'oa_message_task_type', '通知推送', 'NOTIFY', 2, 1, NULL),
(6690, 'oa_message_task_type', '全文索引', 'INDEX', 3, 1, NULL),
(6691, 'oa_message_task_type', '文件扫描', 'SCAN', 4, 1, NULL),
(6692, 'oa_message_task_type', '迁移任务', 'MIGRATION', 5, 1, NULL),
(6693, 'oa_message_task_type', '接口同步', 'SYNC', 6, 1, NULL),
(6694, 'oa_webhook_event_type', '流程完成', 'FLOW_COMPLETED', 1, 1, NULL),
(6695, 'oa_webhook_event_type', '审批拒绝', 'FLOW_REJECTED', 2, 1, NULL),
(6696, 'oa_webhook_event_type', '文档发布', 'DOC_PUBLISHED', 3, 1, NULL),
(6697, 'oa_webhook_event_type', '人员变更', 'USER_CHANGED', 4, 1, NULL),
(6698, 'oa_edi_notice_type', '报文状态', 'STATUS', 1, 1, NULL),
(6699, 'oa_edi_notice_type', '异常告警', 'ALERT', 2, 1, NULL),
(6700, 'oa_edi_notice_type', '交付协同', 'DELIVERY', 3, 1, NULL),
(6701, 'oa_integration_auth_type', 'JWT 令牌', 'JWT', 1, 1, NULL),
(6702, 'oa_integration_auth_type', 'OAuth2', 'OAUTH2', 2, 1, NULL),
(6703, 'oa_integration_auth_type', 'AppKey/Secret', 'APPKEY', 3, 1, NULL),
(6704, 'oa_integration_auth_type', '签名校验', 'SIGN', 4, 1, NULL),
(6705, 'oa_message_task_status', '待处理', 'PENDING', 1, 1, NULL),
(6706, 'oa_message_task_status', '处理中', 'RUNNING', 2, 1, NULL),
(6707, 'oa_message_task_status', '成功', 'SUCCESS', 3, 1, NULL),
(6708, 'oa_message_task_status', '失败', 'FAILED', 4, 1, NULL),
(6709, 'oa_message_task_status', '死信', 'DEAD', 5, 1, NULL),
(6710, 'oa_delivery_status', '待投递', 'PENDING', 1, 1, NULL),
(6711, 'oa_delivery_status', '投递成功', 'SUCCESS', 2, 1, NULL),
(6712, 'oa_delivery_status', '投递失败', 'FAILED', 3, 1, NULL),
(6713, 'oa_delivery_status', '死信', 'DEAD', 4, 1, NULL),
(6714, 'oa_master_data_object', '客户', 'CUSTOMER', 1, 1, NULL),
(6715, 'oa_master_data_object', '供应商', 'SUPPLIER', 2, 1, NULL),
(6716, 'oa_master_data_object', '物料', 'MATERIAL', 3, 1, NULL),
(6717, 'oa_master_data_object', '销售订单', 'ORDER', 4, 1, NULL),
(6718, 'oa_master_data_object', '采购订单', 'PURCHASE', 5, 1, NULL),
(6719, 'oa_master_data_object', '价格', 'PRICE', 6, 1, NULL),
(6720, 'oa_edi_notice_status', '待处理', 'PENDING', 1, 1, NULL),
(6721, 'oa_edi_notice_status', '已处理', 'HANDLED', 2, 1, NULL);

-- ========== OA-N9 可配置项 ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(6021, 'OA', 'oa.integration.api.rate.limit.default', 'API 默认限流阈值(QPS)', '100', 0, 1, NULL),
(6022, 'OA', 'oa.integration.api.signature.enabled', 'API 默认启用签名校验', 'false', 1, 1, '签名算法与密钥分发方式待业务方确认'),
(6023, 'OA', 'oa.integration.webhook.max.retry', 'Webhook 最大重试次数', '3', 0, 1, NULL),
(6024, 'OA', 'oa.integration.webhook.dead.threshold', 'Webhook 死信阈值(次)', '5', 1, 1, '达阈值转死信不自动重试，阈值待确认'),
(6025, 'OA', 'oa.integration.task.max.retry', '消息任务最大重试次数', '3', 0, 1, NULL),
(6026, 'OA', 'oa.integration.credential.expire.alert.days', '集成凭证到期提醒提前天数', '30', 0, 1, NULL),
(6027, 'OA', 'oa.integration.monitor.window.days', '接口监控统计窗口(天)', '30', 0, 1, NULL),
(6028, 'OA', 'oa.integration.plm.sso.enabled', 'PLM 统一登录(SSO)启用', 'true', 1, 1, '待业务方确认 SSO 协议(IF-OA-02)与组织映射规则'),
(6029, 'OA', 'oa.integration.edi.todo.enabled', 'EDI 异常自动生成待办', 'true', 1, 1, '待确认 EDI 异常转 OA 待办的触发规则(IF-OA-06)'),
(6030, 'OA', 'oa.integration.master.data.authority', '主数据权威源配置', '{"CUSTOMER":"ERP","SUPPLIER":"ERP","MATERIAL":"ERP","ORDER":"ERP","PURCHASE":"ERP","PRICE":"ERP"}', 1, 1, '主数据权威源与双向更新规则待业务方确认(IF-OA-03)');
