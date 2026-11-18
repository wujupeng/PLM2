-- G4-N5 SRM—供应商门户（WBS T035）初始化：菜单/按钮权限、角色授权、字典与可配置项。
-- 号段基线（V97 之后已占用的最大值）：sys_permission=4642（本脚本从 4650 起）、
-- sys_role_permission=14155（从 14170 起）、sys_dictionary=8379（从 8390 起）、sys_config=6401（从 6410 起）。
-- 菜单说明：复用 V91 已建的 SRM 顶级菜单域（4550）；
--           供应商门户（4650）为其下二级分组；门户自身账号体系与外部供应商登录，独立于平台底座角色。

-- ========== SRM 供应商门户分组菜单（4650，挂在 4550 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4650, 'srm:portal', '供应商门户', 'menu', 4550, '/srm/portal', 'ShopOutlined', 5, 1);

-- ========== SRM 供应商门户业务菜单（4651-4653，挂在 4650 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4651, 'srm:portal:account', '供应商账号', 'menu', 4650, '/srm/portal/accounts', 'UserSwitchOutlined', 1, 1),
(4652, 'srm:portal:message', '门户消息', 'menu', 4650, '/srm/portal/messages', 'MessageOutlined', 2, 1),
(4653, 'srm:portal:attachment', '门户附件', 'menu', 4650, '/srm/portal/attachments', 'PaperClipOutlined', 3, 1);

-- ========== SRM 供应商门户按钮（4654-4659） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4654, 'srm:portal:account:list', '查询供应商账号', 'button', 4651, NULL, NULL, 1, 1),
(4655, 'srm:portal:account:manage', '维护供应商账号', 'button', 4651, NULL, NULL, 2, 1),
(4656, 'srm:portal:message:list', '查询门户消息', 'button', 4652, NULL, NULL, 1, 1),
(4657, 'srm:portal:message:manage', '维护门户消息', 'button', 4652, NULL, NULL, 2, 1),
(4658, 'srm:portal:attachment:list', '查询门户附件', 'button', 4653, NULL, NULL, 1, 1),
(4659, 'srm:portal:attachment:manage', '维护门户附件', 'button', 4653, NULL, NULL, 2, 1);

-- ========== 角色授权 ==========

-- 管理员（2001）：授予全部权限（1 分组 + 3 菜单 + 6 按钮，共 10 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14170, 2001, 4650), (14171, 2001, 4651), (14172, 2001, 4652), (14173, 2001, 4653),
(14174, 2001, 4654), (14175, 2001, 4655), (14176, 2001, 4656), (14177, 2001, 4657),
(14178, 2001, 4658), (14179, 2001, 4659);

-- 供应链专员（2004）：授予全部权限（供应商门户为供应链主责，共 10 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14180, 2004, 4650), (14181, 2004, 4651), (14182, 2004, 4652), (14183, 2004, 4653),
(14184, 2004, 4654), (14185, 2004, 4655), (14186, 2004, 4656), (14187, 2004, 4657),
(14188, 2004, 4658), (14189, 2004, 4659);

-- 研发工程师（2002）：授予分组/菜单 + 仅查询按钮（7 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14190, 2002, 4650), (14191, 2002, 4651), (14192, 2002, 4652), (14193, 2002, 4653),
(14194, 2002, 4654), (14195, 2002, 4656), (14196, 2002, 4658);

-- 质量工程师（2003）：授予分组/菜单 + 仅查询按钮（7 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14197, 2003, 4650), (14198, 2003, 4651), (14199, 2003, 4652), (14200, 2003, 4653),
(14201, 2003, 4654), (14202, 2003, 4656), (14203, 2003, 4658);

-- 生产现场（2005）：授予分组/菜单 + 仅查询按钮（7 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14204, 2005, 4650), (14205, 2005, 4651), (14206, 2005, 4652), (14207, 2005, 4653),
(14208, 2005, 4654), (14209, 2005, 4656), (14210, 2005, 4658);

-- 只读用户（2006）：授予分组/菜单 + 仅查询按钮（7 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14211, 2006, 4650), (14212, 2006, 4651), (14213, 2006, 4652), (14214, 2006, 4653),
(14215, 2006, 4654), (14216, 2006, 4656), (14217, 2006, 4658);

-- ========== SRM 供应商门户字典（8390-8416） ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(8390, 'srm_portal_account_status', '草稿', 'DRAFT', 1, 1, NULL),
(8391, 'srm_portal_account_status', '已启用', 'ACTIVE', 2, 1, NULL),
(8392, 'srm_portal_account_status', '已锁定', 'LOCKED', 3, 1, NULL),
(8393, 'srm_portal_account_status', '已过期', 'EXPIRED', 4, 1, NULL),
(8394, 'srm_portal_account_status', '已禁用', 'DISABLED', 5, 1, NULL),
(8395, 'srm_portal_role', '管理员', 'ADMIN', 1, 1, NULL),
(8396, 'srm_portal_role', '采购员', 'BUYER', 2, 1, NULL),
(8397, 'srm_portal_role', '质量员', 'QUALITY', 3, 1, NULL),
(8398, 'srm_portal_role', '只读', 'VIEWER', 4, 1, NULL),
(8399, 'srm_portal_message_type', '订单协同', 'ORDER', 1, 1, NULL),
(8400, 'srm_portal_message_type', '交期协同', 'DELIVERY', 2, 1, NULL),
(8401, 'srm_portal_message_type', '送货协同', 'ASN', 3, 1, NULL),
(8402, 'srm_portal_message_type', '质量协同', 'QUALITY', 4, 1, NULL),
(8403, 'srm_portal_message_type', '系统公告', 'ANNOUNCE', 5, 1, NULL),
(8404, 'srm_portal_message_status', '草稿', 'DRAFT', 1, 1, NULL),
(8405, 'srm_portal_message_status', '已发送', 'SENT', 2, 1, NULL),
(8406, 'srm_portal_message_status', '已读', 'READ', 3, 1, NULL),
(8407, 'srm_portal_message_status', '已取消', 'CANCELLED', 4, 1, NULL),
(8408, 'srm_portal_attachment_status', '待上传', 'PENDING', 1, 1, NULL),
(8409, 'srm_portal_attachment_status', '已上传', 'UPLOADED', 2, 1, NULL),
(8410, 'srm_portal_attachment_status', '已确认', 'CONFIRMED', 3, 1, NULL),
(8411, 'srm_portal_attachment_status', '已驳回', 'REJECTED', 4, 1, NULL),
(8412, 'srm_portal_attachment_status', '已取消', 'CANCELLED', 5, 1, NULL),
(8413, 'srm_portal_biz_type', '订单协同', 'ORDER', 1, 1, NULL),
(8414, 'srm_portal_biz_type', '交期/送货', 'DELIVERY', 2, 1, NULL),
(8415, 'srm_portal_biz_type', '质量协同', 'QUALITY', 3, 1, NULL),
(8416, 'srm_portal_biz_type', '门户消息', 'MESSAGE', 4, 1, NULL);

-- ========== SRM 供应商门户可配置项（6410-6421） ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(6410, 'SRM', 'srm.portal.enabled', '供应商门户启用开关', 'true', 0, 1, 'SRM 供应商门户总开关，默认启用'),
(6411, 'SRM', 'srm.portal.account.auto.approve', '门户账号自动开通', 'false', 1, 1, '待业务方确认：供应商门户账号注册后是否自动开通'),
(6412, 'SRM', 'srm.portal.account.session.timeout.minutes', '门户会话超时分钟', '30', 1, 1, '待业务方确认：供应商门户登录会话超时（分钟）'),
(6413, 'SRM', 'srm.portal.message.push.enabled', '门户消息推送开关', 'true', 1, 1, '待业务方确认：门户协同消息是否推送（站内/邮件）'),
(6414, 'SRM', 'srm.portal.message.read.required', '门户消息已读必填', 'false', 1, 1, '待业务方确认：门户消息是否要求供应商确认已读'),
(6415, 'SRM', 'srm.portal.attachment.max.size.mb', '附件大小上限MB', '20', 1, 1, '待业务方确认：门户附件单文件大小上限（MB）'),
(6416, 'SRM', 'srm.portal.attachment.allowed.types', '附件允许类型', 'pdf,doc,docx,xls,xlsx,jpg,png', 1, 1, '待业务方确认：门户附件允许的文件扩展名'),
(6417, 'SRM', 'srm.portal.collab.order.enabled', '门户订单协同开关', 'true', 0, 1, '门户是否开放订单协同（引用 G4-N3 订单确认）'),
(6418, 'SRM', 'srm.portal.collab.delivery.enabled', '门户交期协同开关', 'true', 0, 1, '门户是否开放交期/送货协同（引用 G4-N3 交期承诺/送货预约/ASN）'),
(6419, 'SRM', 'srm.portal.collab.quality.enabled', '门户质量协同开关', 'true', 0, 1, '门户是否开放质量协同（引用 G4-N4 供应商质量）'),
(6420, 'SRM', 'srm.portal.collab.asn.enabled', '门户送货协同开关', 'true', 0, 1, '门户是否开放 ASN 送货协同'),
(6421, 'SRM', 'srm.portal.login.captcha.enabled', '门户登录验证码', 'true', 1, 1, '待业务方确认：供应商门户登录是否启用验证码');
