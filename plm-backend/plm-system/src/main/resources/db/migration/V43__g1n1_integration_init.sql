-- G1-N1 初始化数据：集成平台的菜单、按钮权限、角色授权、字典与可配置项
-- 号段避让：菜单 3920/3930-3936、按钮 3940-3953（sys_permission 既有最大号 3909，3700-3751 已被 OA N3-N6 占用）；
--           角色授权 11730-11794（既有最大 11729）、字典 6888-6947（既有最大 6887）、配置 6059-6065（既有最大 6058）。
-- 说明：平台底座为独立顶级菜单（parent_id=0，sort=91），与 OA 办公门户（3600）并列。

-- ========== 集成平台权限（菜单 3920、3930-3936，按钮 3940-3953） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(3920, 'platform', '平台底座', 'menu', 0, NULL, 'DeploymentUnitOutlined', 91, 1),
(3930, 'platform:integration:api', '接口注册中心', 'menu', 3920, '/platform/integration/api-registry', 'ApiOutlined', 1, 1),
(3931, 'platform:integration:topic', '事件主题', 'menu', 3920, '/platform/integration/event-topics', 'PartitionOutlined', 2, 1),
(3932, 'platform:integration:subscription', '事件订阅', 'menu', 3920, '/platform/integration/event-subscriptions', 'NodeIndexOutlined', 3, 1),
(3933, 'platform:integration:message', '事件消息', 'menu', 3920, '/platform/integration/event-messages', 'SendOutlined', 4, 1),
(3934, 'platform:integration:deadletter', '死信处理', 'menu', 3920, '/platform/integration/dead-letters', 'WarningOutlined', 5, 1),
(3935, 'platform:integration:idempotent', '幂等记录', 'menu', 3920, '/platform/integration/idempotent-records', 'SafetyCertificateOutlined', 6, 1),
(3936, 'platform:integration:monitor', '集成监控', 'menu', 3920, '/platform/integration/monitor', 'DashboardOutlined', 7, 1),
(3940, 'platform:integration:api:list', '查询接口注册', 'button', 3930, NULL, NULL, 1, 1),
(3941, 'platform:integration:api:manage', '维护接口注册', 'button', 3930, NULL, NULL, 2, 1),
(3942, 'platform:integration:topic:list', '查询事件主题', 'button', 3931, NULL, NULL, 1, 1),
(3943, 'platform:integration:topic:manage', '维护事件主题', 'button', 3931, NULL, NULL, 2, 1),
(3944, 'platform:integration:subscription:list', '查询事件订阅', 'button', 3932, NULL, NULL, 1, 1),
(3945, 'platform:integration:subscription:manage', '维护事件订阅', 'button', 3932, NULL, NULL, 2, 1),
(3946, 'platform:integration:message:list', '查询事件消息', 'button', 3933, NULL, NULL, 1, 1),
(3947, 'platform:integration:message:manage', '维护事件消息', 'button', 3933, NULL, NULL, 2, 1),
(3948, 'platform:integration:deadletter:list', '查询死信', 'button', 3934, NULL, NULL, 1, 1),
(3949, 'platform:integration:deadletter:manage', '处理死信', 'button', 3934, NULL, NULL, 2, 1),
(3950, 'platform:integration:idempotent:list', '查询幂等记录', 'button', 3935, NULL, NULL, 1, 1),
(3951, 'platform:integration:idempotent:manage', '维护幂等记录', 'button', 3935, NULL, NULL, 2, 1),
(3952, 'platform:integration:monitor:list', '查询集成监控', 'button', 3936, NULL, NULL, 1, 1),
(3953, 'platform:integration:monitor:manage', '维护集成监控', 'button', 3936, NULL, NULL, 2, 1);

-- 管理员（2001）：授予集成平台全部权限
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11730, 2001, 3920), (11731, 2001, 3930), (11732, 2001, 3931), (11733, 2001, 3932),
(11734, 2001, 3933), (11735, 2001, 3934), (11736, 2001, 3935), (11737, 2001, 3936),
(11738, 2001, 3940), (11739, 2001, 3941), (11740, 2001, 3942), (11741, 2001, 3943),
(11742, 2001, 3944), (11743, 2001, 3945), (11744, 2001, 3946), (11745, 2001, 3947),
(11746, 2001, 3948), (11747, 2001, 3949), (11748, 2001, 3950), (11749, 2001, 3951),
(11750, 2001, 3952), (11751, 2001, 3953);

-- 研发工程师（2002）：接口、主题、消息与监控只读
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11752, 2002, 3920), (11753, 2002, 3930), (11754, 2002, 3931), (11755, 2002, 3933),
(11756, 2002, 3936),
(11757, 2002, 3940), (11758, 2002, 3942), (11759, 2002, 3946), (11760, 2002, 3952);

-- 质量工程师（2003）：消息与监控只读
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11761, 2003, 3920), (11762, 2003, 3933), (11763, 2003, 3936),
(11764, 2003, 3946), (11765, 2003, 3952);

-- 供应链专员（2004）：接口、订阅、消息与监控只读
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11766, 2004, 3920), (11767, 2004, 3930), (11768, 2004, 3932), (11769, 2004, 3933),
(11770, 2004, 3936),
(11771, 2004, 3940), (11772, 2004, 3944), (11773, 2004, 3946), (11774, 2004, 3952);

-- 生产现场（2005）：消息与监控只读
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11775, 2005, 3920), (11776, 2005, 3933), (11777, 2005, 3936),
(11778, 2005, 3946), (11779, 2005, 3952);

-- 只读用户（2006）：全部菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11780, 2006, 3920), (11781, 2006, 3930), (11782, 2006, 3931), (11783, 2006, 3932),
(11784, 2006, 3933), (11785, 2006, 3934), (11786, 2006, 3935), (11787, 2006, 3936),
(11788, 2006, 3940), (11789, 2006, 3942), (11790, 2006, 3944), (11791, 2006, 3946),
(11792, 2006, 3948), (11793, 2006, 3950), (11794, 2006, 3952);

-- ========== 集成平台字典（6888-6947） ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(6888, 'integration_system_code', 'PLM 产品研发', 'PLM', 1, 1, NULL),
(6889, 'integration_system_code', 'ERP 经营管理', 'ERP', 2, 1, NULL),
(6890, 'integration_system_code', 'SRM 供应商协同', 'SRM', 3, 1, NULL),
(6891, 'integration_system_code', 'MES 制造执行', 'MES', 4, 1, NULL),
(6892, 'integration_system_code', 'WMS 仓储管理', 'WMS', 5, 1, NULL),
(6893, 'integration_system_code', 'OA 企业协同', 'OA', 6, 1, NULL),
(6894, 'integration_system_code', 'EDI 网关', 'EDI', 7, 1, NULL),
(6895, 'integration_direction', '入向（接收）', 'IN', 1, 1, NULL),
(6896, 'integration_direction', '出向（发布）', 'OUT', 2, 1, NULL),
(6897, 'integration_direction', '双向', 'BOTH', 3, 1, NULL),
(6898, 'integration_protocol', 'HTTP/REST', 'HTTP', 1, 1, NULL),
(6899, 'integration_protocol', 'Dubbo', 'DUBBO', 2, 1, NULL),
(6900, 'integration_protocol', '数据库直连', 'DB', 3, 1, NULL),
(6901, 'integration_protocol', '消息队列', 'MQ', 4, 1, NULL),
(6902, 'integration_protocol', '批量文件', 'FILE', 5, 1, NULL),
(6903, 'integration_protocol', 'EDI 报文', 'EDI', 6, 1, NULL),
(6904, 'integration_http_method', 'GET', 'GET', 1, 1, NULL),
(6905, 'integration_http_method', 'POST', 'POST', 2, 1, NULL),
(6906, 'integration_http_method', 'PUT', 'PUT', 3, 1, NULL),
(6907, 'integration_http_method', 'DELETE', 'DELETE', 4, 1, NULL),
(6908, 'integration_auth_type', 'JWT 令牌', 'JWT', 1, 1, NULL),
(6909, 'integration_auth_type', 'API Key', 'API_KEY', 2, 1, NULL),
(6910, 'integration_auth_type', 'OAuth2', 'OAUTH2', 3, 1, NULL),
(6911, 'integration_auth_type', '双向 TLS 证书', 'MTLS', 4, 1, NULL),
(6912, 'integration_auth_type', '免认证（内网）', 'NONE', 5, 1, NULL),
(6913, 'integration_api_status', '草稿', 'DRAFT', 1, 1, NULL),
(6914, 'integration_api_status', '已发布', 'ACTIVE', 2, 1, NULL),
(6915, 'integration_api_status', '已废弃', 'DEPRECATED', 3, 1, NULL),
(6916, 'integration_api_status', '已下线', 'OFFLINE', 4, 1, NULL),
(6917, 'integration_version_change_type', '重大变更', 'MAJOR', 1, 1, NULL),
(6918, 'integration_version_change_type', '功能变更', 'MINOR', 2, 1, NULL),
(6919, 'integration_version_change_type', '补丁修复', 'PATCH', 3, 1, NULL),
(6920, 'integration_compatibility', '向后兼容', 'COMPATIBLE', 1, 1, NULL),
(6921, 'integration_compatibility', '不兼容变更', 'BREAKING', 2, 1, NULL),
(6922, 'integration_version_status', '草稿', 'DRAFT', 1, 1, NULL),
(6923, 'integration_version_status', '已发布', 'PUBLISHED', 2, 1, NULL),
(6924, 'integration_version_status', '已生效', 'RELEASED', 3, 1, NULL),
(6925, 'integration_topic_status', '草稿', 'DRAFT', 1, 1, NULL),
(6926, 'integration_topic_status', '已启用', 'ACTIVE', 2, 1, NULL),
(6927, 'integration_topic_status', '已停用', 'DISABLED', 3, 1, NULL),
(6928, 'integration_delivery_mode', '推送', 'PUSH', 1, 1, NULL),
(6929, 'integration_delivery_mode', '拉取', 'PULL', 2, 1, NULL),
(6930, 'integration_subscription_status', '已启用', 'ENABLED', 1, 1, NULL),
(6931, 'integration_subscription_status', '已停用', 'DISABLED', 2, 1, NULL),
(6932, 'integration_message_status', '待投递', 'PENDING', 1, 1, NULL),
(6933, 'integration_message_status', '投递成功', 'SENT', 2, 1, NULL),
(6934, 'integration_message_status', '投递失败', 'FAILED', 3, 1, NULL),
(6935, 'integration_message_status', '已入死信', 'DEAD_LETTER', 4, 1, NULL),
(6936, 'integration_dead_status', '待处理', 'PENDING', 1, 1, NULL),
(6937, 'integration_dead_status', '已处理', 'HANDLED', 2, 1, NULL),
(6938, 'integration_dead_status', '已忽略', 'IGNORED', 3, 1, NULL),
(6939, 'integration_idempotent_status', '处理中', 'PROCESSING', 1, 1, NULL),
(6940, 'integration_idempotent_status', '已成功', 'SUCCESS', 2, 1, NULL),
(6941, 'integration_idempotent_status', '重复请求', 'DUPLICATE', 3, 1, NULL),
(6942, 'integration_idempotent_status', '处理失败', 'FAILED', 4, 1, NULL),
(6943, 'integration_health_status', '健康', 'HEALTHY', 1, 1, NULL),
(6944, 'integration_health_status', '警告', 'WARNING', 2, 1, NULL),
(6945, 'integration_health_status', '严重', 'CRITICAL', 3, 1, NULL),
(6946, 'integration_target_type', 'API 接口', 'API', 1, 1, NULL),
(6947, 'integration_target_type', '事件消息', 'EVENT', 2, 1, NULL);

-- ========== 集成平台可配置项（6059-6065） ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(6059, 'INTEGRATION', 'integration.retry.max_times', '消息投递最大重试次数', '5', 1, 1, '待业务方确认重试上限'),
(6060, 'INTEGRATION', 'integration.retry.interval.seconds', '消息重试间隔（秒）', '30', 1, 1, '待业务方确认重试间隔'),
(6061, 'INTEGRATION', 'integration.message.retention.days', '事件消息保留天数', '30', 1, 1, '待业务方确认消息保留期限'),
(6062, 'INTEGRATION', 'integration.monitor.alert.fail.rate', '集成监控告警失败率阈值（%）', '5', 1, 1, '待业务方确认告警阈值'),
(6063, 'INTEGRATION', 'integration.idempotent.expire.hours', '幂等键有效期（小时）', '24', 0, 1, '防止重复投递导致下游重复入账'),
(6064, 'INTEGRATION', 'integration.deadletter.auto.handle', '死信自动处理开关', 'false', 0, 1, '默认人工处理，避免错误自动放行'),
(6065, 'INTEGRATION', 'integration.monitor.aggregate.enabled', '集成监控汇总开关', 'true', 0, 1, '关闭后不再生成小时级监控快照');
