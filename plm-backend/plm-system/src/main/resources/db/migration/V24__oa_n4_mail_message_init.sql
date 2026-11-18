-- OA-N4 初始化数据：内部邮件与统一消息中心的菜单、按钮权限、角色授权、字典、可配置项与样例模板
-- 说明：邮件文件夹、通知类型、通知渠道、通知模板均为可配置数据；渠道类的邮件/移动推送需业务方确认许可后开启（IF-OA-07/IF-OA-08）。

-- ========== OA-N4 权限（菜单 3720-3722，按钮 3723-3732） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(3720, 'oa-mail', '内部邮件', 'menu', 3600, '/oa/mails', 'MailOutlined', 13, 1),
(3721, 'oa-notification', '消息中心', 'menu', 3600, '/oa/notifications', 'BellOutlined', 14, 1),
(3722, 'oa-notify-template', '通知模板', 'menu', 3600, '/oa/notify-templates', 'NotificationOutlined', 15, 1),
(3723, 'oa:mail:list', '查询邮件', 'button', 3720, NULL, NULL, 1, 1),
(3724, 'oa:mail:send', '发送邮件', 'button', 3720, NULL, NULL, 2, 1),
(3725, 'oa:mail:delete', '删除邮件', 'button', 3720, NULL, NULL, 3, 1),
(3726, 'oa:mail:folder', '维护邮件文件夹', 'button', 3720, NULL, NULL, 4, 1),
(3727, 'oa:mail:attachment', '管理邮件附件', 'button', 3720, NULL, NULL, 5, 1),
(3728, 'oa:notification:list', '查询消息', 'button', 3721, NULL, NULL, 1, 1),
(3729, 'oa:notification:send', '发送消息', 'button', 3721, NULL, NULL, 2, 1),
(3730, 'oa:notify-template:list', '查询通知模板', 'button', 3722, NULL, NULL, 1, 1),
(3731, 'oa:notify-template:save', '维护通知模板', 'button', 3722, NULL, NULL, 2, 1),
(3732, 'oa:notify-template:delete', '删除通知模板', 'button', 3722, NULL, NULL, 3, 1);

-- 管理员（2001）：授予 OA-N4 全部权限
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11159, 2001, 3720), (11160, 2001, 3721), (11161, 2001, 3722), (11162, 2001, 3723),
(11163, 2001, 3724), (11164, 2001, 3725), (11165, 2001, 3726), (11166, 2001, 3727),
(11167, 2001, 3728), (11168, 2001, 3729), (11169, 2001, 3730), (11170, 2001, 3731),
(11171, 2001, 3732);

-- 只读用户（2006）：邮件与消息菜单 + 仅查看按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11172, 2006, 3720), (11173, 2006, 3721), (11174, 2006, 3722), (11175, 2006, 3723),
(11176, 2006, 3728), (11177, 2006, 3730);

-- 研发工程师（2002）：内部邮件（含写信/删除/文件夹/附件）与消息中心
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11178, 2002, 3720), (11179, 2002, 3721), (11180, 2002, 3723), (11181, 2002, 3724),
(11182, 2002, 3725), (11183, 2002, 3726), (11184, 2002, 3727), (11185, 2002, 3728);

-- 质量工程师（2003）：同研发工程师
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11186, 2003, 3720), (11187, 2003, 3721), (11188, 2003, 3723), (11189, 2003, 3724),
(11190, 2003, 3725), (11191, 2003, 3726), (11192, 2003, 3727), (11193, 2003, 3728);

-- 供应链专员（2004）：同研发工程师
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11194, 2004, 3720), (11195, 2004, 3721), (11196, 2004, 3723), (11197, 2004, 3724),
(11198, 2004, 3725), (11199, 2004, 3726), (11200, 2004, 3727), (11201, 2004, 3728);

-- 生产现场（2005）：内部邮件（含写信/删除/文件夹/附件）与消息中心
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11202, 2005, 3720), (11203, 2005, 3721), (11204, 2005, 3723), (11205, 2005, 3724),
(11206, 2005, 3725), (11207, 2005, 3726), (11208, 2005, 3727), (11209, 2005, 3728);

-- ========== OA-N4 字典 ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(6201, 'oa_mail_folder_type', '系统文件夹', 'SYSTEM', 1, 1, NULL),
(6202, 'oa_mail_folder_type', '自定义文件夹', 'CUSTOM', 2, 1, NULL),
(6205, 'oa_mail_system_folder', '收件箱', 'INBOX', 1, 1, NULL),
(6206, 'oa_mail_system_folder', '已发送', 'SENT', 2, 1, NULL),
(6207, 'oa_mail_system_folder', '草稿箱', 'DRAFT', 3, 1, NULL),
(6208, 'oa_mail_system_folder', '已删除', 'TRASH', 4, 1, NULL),
(6209, 'oa_mail_system_folder', '星标邮件', 'STARRED', 5, 1, NULL),
(6211, 'oa_mail_priority', '低', 'LOW', 1, 1, NULL),
(6212, 'oa_mail_priority', '普通', 'NORMAL', 2, 1, NULL),
(6213, 'oa_mail_priority', '紧急', 'HIGH', 3, 1, NULL),
(6221, 'oa_mail_message_status', '草稿', 'DRAFT', 1, 1, NULL),
(6222, 'oa_mail_message_status', '已发送', 'SENT', 2, 1, NULL),
(6231, 'oa_mail_recipient_type', '收件人', 'TO', 1, 1, NULL),
(6232, 'oa_mail_recipient_type', '抄送', 'CC', 2, 1, NULL),
(6233, 'oa_mail_recipient_type', '密送', 'BCC', 3, 1, NULL),
(6241, 'oa_notification_type', '流程待办', 'WORKFLOW', 1, 1, NULL),
(6242, 'oa_notification_type', '公告', 'ANNOUNCEMENT', 2, 1, NULL),
(6243, 'oa_notification_type', '系统消息', 'SYSTEM', 3, 1, NULL),
(6244, 'oa_notification_type', '集成提醒', 'INTEGRATION', 4, 1, NULL),
(6245, 'oa_notification_type', '业务通知', 'BUSINESS', 5, 1, NULL),
(6251, 'oa_notification_channel', '站内', 'STATION', 1, 1, NULL),
(6252, 'oa_notification_channel', '邮件', 'EMAIL', 2, 1, '渠道许可待业务方确认（IF-OA-07）'),
(6253, 'oa_notification_channel', '移动推送', 'MOBILE', 3, 1, '渠道许可待业务方确认（IF-OA-07）'),
(6254, 'oa_notification_channel', '短信', 'SMS', 4, 1, '渠道许可待业务方确认'),
(6255, 'oa_notification_channel', '企业 IM', 'IM', 5, 1, '渠道许可待业务方确认'),
(6261, 'oa_notification_send_status', '待发送', 'PENDING', 1, 1, NULL),
(6262, 'oa_notification_send_status', '已发送', 'SENT', 2, 1, NULL),
(6263, 'oa_notification_send_status', '发送失败', 'FAILED', 3, 1, NULL),
(6271, 'oa_mail_scan_status', '待扫描', 'PENDING', 1, 1, NULL),
(6272, 'oa_mail_scan_status', '安全', 'CLEAN', 2, 1, NULL),
(6273, 'oa_mail_scan_status', '存在风险', 'INFECTED', 3, 1, NULL);

-- ========== OA-N4 可配置项：渠道与限值先落默认值，待业务方确认许可与策略 ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(5926, 'OA', 'oa.mail.attachment.max.size.mb', '邮件附件大小上限（MB）', '20', 1, 1, '待业务方确认附件大小上限与总量配额'),
(5927, 'OA', 'oa.mail.attachment.dir', '邮件附件存储目录', './data/oa-mail-attachments', 0, 1, '生产环境建议切换为对象存储，避免绑定单一厂商'),
(5928, 'OA', 'oa.mail.attachment.scan.enabled', '启用附件病毒扫描', 'false', 1, 1, '病毒扫描组件许可待核查（IF-OA-08）；关闭时不执行扫描，附件扫描状态直接置为安全'),
(5929, 'OA', 'oa.mail.message.no.prefix', '邮件编号前缀', 'MAIL-', 0, 1, NULL),
(5930, 'OA', 'oa.mail.folder.custom.enabled', '允许用户创建自定义邮件文件夹', 'true', 0, 1, NULL),
(5931, 'OA', 'oa.notify.station.enabled', '启用站内通知渠道', 'true', 0, 1, NULL),
(5932, 'OA', 'oa.notify.email.enabled', '启用邮件通知渠道', 'false', 1, 1, '邮件通道许可与发信地址待业务方确认（IF-OA-07）'),
(5933, 'OA', 'oa.notify.mobile.enabled', '启用移动推送通知渠道', 'false', 1, 1, '移动推送通道许可待业务方确认（IF-OA-07）'),
(5934, 'OA', 'oa.notify.retry.max', '通知发送失败重试次数', '3', 1, 1, '异步发送通道的重试策略待业务方确认'),
(5935, 'OA', 'oa.notify.template.default.channel', '通知模板默认渠道', 'STATION', 0, 1, NULL);

-- ========== OA-N4 样例数据：仅用于联调与验收演示，实施时由业务方通过界面或导入替换 ==========

-- 系统邮件文件夹（与 admin 账号关联）
INSERT INTO oa_mail_folder (id, folder_code, folder_name, folder_type, owner_user_id, sort_no, status, remark, created_by, created_at) VALUES
(7601, 'INBOX', '收件箱', 'SYSTEM', 9001, 1, 'enabled', NULL, 9001, CURRENT_TIMESTAMP),
(7602, 'SENT', '已发送', 'SYSTEM', 9001, 2, 'enabled', NULL, 9001, CURRENT_TIMESTAMP),
(7603, 'DRAFT', '草稿箱', 'SYSTEM', 9001, 3, 'enabled', NULL, 9001, CURRENT_TIMESTAMP),
(7604, 'TRASH', '已删除', 'SYSTEM', 9001, 4, 'enabled', NULL, 9001, CURRENT_TIMESTAMP),
(7605, 'STARRED', '星标邮件', 'SYSTEM', 9001, 5, 'enabled', NULL, 9001, CURRENT_TIMESTAMP);

-- 通知模板
INSERT INTO oa_notify_template (id, template_code, template_name, message_type, channel, title_template, content_template, variable_json, status, remark, created_by, created_at) VALUES
(7611, 'WORKFLOW_TODO', '流程待办通知', 'WORKFLOW', 'STATION', '流程待办提醒：${processName}',
 '您有一条新的待办任务（单号 ${instanceNo}）：${title}，请在 ${dueAt} 前处理。', '["processName","instanceNo","title","dueAt"]', 'enabled',
 '流程节点生成待办时自动发送，示例模板，实施时由业务方维护', 9001, CURRENT_TIMESTAMP),
(7612, 'ANNOUNCEMENT_PUBLISH', '公告发布通知', 'ANNOUNCEMENT', 'STATION', '公告：${title}',
 '${publisher} 发布了公告《${title}》，请及时查阅。', '["title","publisher"]', 'enabled',
 '示例模板，实施时由业务方维护', 9001, CURRENT_TIMESTAMP),
(7613, 'WORKFLOW_REJECT', '流程驳回通知', 'WORKFLOW', 'STATION', '流程被驳回：${processName}',
 '您发起的流程（单号 ${instanceNo}）已被 ${handlerName} 驳回，驳回意见：${comment}。', '["processName","instanceNo","handlerName","comment"]', 'enabled',
 '流程被驳回时通知发起人，示例模板，实施时由业务方维护', 9001, CURRENT_TIMESTAMP),
(7614, 'WORKFLOW_CANCEL', '流程撤回通知', 'WORKFLOW', 'STATION', '流程已撤回：${processName}',
 '流程（单号 ${instanceNo}）已被发起人 ${applicantName} 撤回，无需继续处理。', '["processName","instanceNo","applicantName"]', 'enabled',
 '流程撤回时通知待办处理人，示例模板，实施时由业务方维护', 9001, CURRENT_TIMESTAMP);

-- 站内通知样例
INSERT INTO oa_notification (id, notification_no, receiver_user_id, receiver_name, message_type, title, content, biz_type, biz_id, biz_no, link_url, priority, read_flag, archived_flag, template_code, channel, send_status, sent_at, remark, created_by, created_at) VALUES
(7621, 'MSG-DEMO-0001', 9001, '系统管理员', 'WORKFLOW', '流程待办提醒：请假审批流程',
 '您有一条新的待办任务（单号 OA-DEMO-0001）：演示请假申请，请在时限内处理。', 'OA_TASK', NULL, 'OA-DEMO-0001', '/oa/tasks',
 'NORMAL', 0, 0, 'WORKFLOW_TODO', 'STATION', 'SENT', CURRENT_TIMESTAMP,
 '示例通知，实施时由流程待办与业务事件自动生成', 9001, CURRENT_TIMESTAMP);
