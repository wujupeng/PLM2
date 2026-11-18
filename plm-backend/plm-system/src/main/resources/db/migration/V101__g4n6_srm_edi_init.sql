-- G4-N6 SRM—EDI 协同（WBS T036）初始化：菜单/按钮权限、角色授权、字典与可配置项。
-- 号段基线（V99 之后已占用的最大值）：sys_permission=4659（本脚本从 4670 起）、
-- sys_role_permission=14217（从 14230 起）、sys_dictionary=8416（从 8420 起）、sys_config=6421（从 6430 起）。
-- 菜单说明：复用 V91 已建的 SRM 顶级菜单域（4550）；
--           EDI 协同（4670）为其下二级分组；EDI 与既有 OA 开放集成平台（/oa/integration/edi）通过报文编号互联。

-- ========== SRM EDI 协同分组菜单（4670，挂在 4550 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4670, 'srm:edi', 'EDI协同', 'menu', 4550, '/srm/edi', 'ApiOutlined', 6, 1);

-- ========== SRM EDI 协同业务菜单（4671-4673，挂在 4670 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4671, 'srm:edi:message', 'EDI报文', 'menu', 4670, '/srm/edi/messages', 'SendOutlined', 1, 1),
(4672, 'srm:edi:receipt', 'EDI回执', 'menu', 4670, '/srm/edi/receipts', 'MailOutlined', 2, 1),
(4673, 'srm:edi:reconcile', 'EDI对账', 'menu', 4670, '/srm/edi/reconciles', 'ReconciliationOutlined', 3, 1);

-- ========== SRM EDI 协同按钮（4674-4679） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4674, 'srm:edi:message:list', '查询EDI报文', 'button', 4671, NULL, NULL, 1, 1),
(4675, 'srm:edi:message:manage', '维护EDI报文', 'button', 4671, NULL, NULL, 2, 1),
(4676, 'srm:edi:receipt:list', '查询EDI回执', 'button', 4672, NULL, NULL, 1, 1),
(4677, 'srm:edi:receipt:manage', '维护EDI回执', 'button', 4672, NULL, NULL, 2, 1),
(4678, 'srm:edi:reconcile:list', '查询EDI对账', 'button', 4673, NULL, NULL, 1, 1),
(4679, 'srm:edi:reconcile:manage', '维护EDI对账', 'button', 4673, NULL, NULL, 2, 1);

-- ========== 角色授权 ==========

-- 管理员（2001）：授予全部权限（1 分组 + 3 菜单 + 6 按钮，共 10 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14230, 2001, 4670), (14231, 2001, 4671), (14232, 2001, 4672), (14233, 2001, 4673),
(14234, 2001, 4674), (14235, 2001, 4675), (14236, 2001, 4676), (14237, 2001, 4677),
(14238, 2001, 4678), (14239, 2001, 4679);

-- 供应链专员（2004）：授予全部权限（EDI 协同为供应链主责，共 10 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14240, 2004, 4670), (14241, 2004, 4671), (14242, 2004, 4672), (14243, 2004, 4673),
(14244, 2004, 4674), (14245, 2004, 4675), (14246, 2004, 4676), (14247, 2004, 4677),
(14248, 2004, 4678), (14249, 2004, 4679);

-- 研发工程师（2002）：授予分组/菜单 + 仅查询按钮（7 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14250, 2002, 4670), (14251, 2002, 4671), (14252, 2002, 4672), (14253, 2002, 4673),
(14254, 2002, 4674), (14255, 2002, 4676), (14256, 2002, 4678);

-- 质量工程师（2003）：授予分组/菜单 + 仅查询按钮（7 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14257, 2003, 4670), (14258, 2003, 4671), (14259, 2003, 4672), (14260, 2003, 4673),
(14261, 2003, 4674), (14262, 2003, 4676), (14263, 2003, 4678);

-- 生产现场（2005）：授予分组/菜单 + 仅查询按钮（7 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14264, 2005, 4670), (14265, 2005, 4671), (14266, 2005, 4672), (14267, 2005, 4673),
(14268, 2005, 4674), (14269, 2005, 4676), (14270, 2005, 4678);

-- 只读用户（2006）：授予分组/菜单 + 仅查询按钮（7 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14271, 2006, 4670), (14272, 2006, 4671), (14273, 2006, 4672), (14274, 2006, 4673),
(14275, 2006, 4674), (14276, 2006, 4676), (14277, 2006, 4678);

-- ========== SRM EDI 协同字典（8420-8449） ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(8420, 'srm_edi_direction', '出站（我方发送）', 'OUTBOUND', 1, 1, NULL),
(8421, 'srm_edi_direction', '入站（对方发送）', 'INBOUND', 2, 1, NULL),
(8422, 'srm_edi_message_type', '客户需求', 'DEMAND', 1, 1, NULL),
(8423, 'srm_edi_message_type', '需求预测', 'FORECAST', 2, 1, NULL),
(8424, 'srm_edi_message_type', '采购订单', 'ORDER', 3, 1, NULL),
(8425, 'srm_edi_message_type', '订单变更', 'CHANGE', 4, 1, NULL),
(8426, 'srm_edi_message_type', '发货通知', 'ASN', 5, 1, NULL),
(8427, 'srm_edi_message_type', '发票对账', 'INVOICE', 6, 1, NULL),
(8428, 'srm_edi_format', 'EDIFACT', 'EDIFACT', 1, 1, NULL),
(8429, 'srm_edi_format', 'ANSI X12', 'X12', 2, 1, NULL),
(8430, 'srm_edi_format', 'XML', 'XML', 3, 1, NULL),
(8431, 'srm_edi_format', 'JSON', 'JSON', 4, 1, NULL),
(8432, 'srm_edi_format', 'CSV', 'CSV', 5, 1, NULL),
(8433, 'srm_edi_status', '草稿', 'DRAFT', 1, 1, NULL),
(8434, 'srm_edi_status', '待发送', 'READY', 2, 1, NULL),
(8435, 'srm_edi_status', '已发送', 'SENT', 3, 1, NULL),
(8436, 'srm_edi_status', '已回执', 'ACKED', 4, 1, NULL),
(8437, 'srm_edi_status', '发送失败', 'FAILED', 5, 1, NULL),
(8438, 'srm_edi_status', '重试中', 'RETRYING', 6, 1, NULL),
(8439, 'srm_edi_status', '已取消', 'CANCELLED', 7, 1, NULL),
(8440, 'srm_edi_receipt_type', '接收确认', 'ACK', 1, 1, NULL),
(8441, 'srm_edi_receipt_type', '拒绝确认', 'NAK', 2, 1, NULL),
(8442, 'srm_edi_receipt_type', '应用确认', 'APPLICATION', 3, 1, NULL),
(8443, 'srm_edi_receipt_status', '已接收', 'RECEIVED', 1, 1, NULL),
(8444, 'srm_edi_receipt_status', '已处理', 'PROCESSED', 2, 1, NULL),
(8445, 'srm_edi_receipt_status', '处理失败', 'FAILED', 3, 1, NULL),
(8446, 'srm_edi_reconcile_status', '待对账', 'PENDING', 1, 1, NULL),
(8447, 'srm_edi_reconcile_status', '已平账', 'MATCHED', 2, 1, NULL),
(8448, 'srm_edi_reconcile_status', '存在差异', 'DIFF', 3, 1, NULL),
(8449, 'srm_edi_reconcile_status', '已确认', 'CONFIRMED', 4, 1, NULL);

-- ========== SRM EDI 协同可配置项（6430-6441） ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(6430, 'SRM', 'srm.edi.enabled', 'EDI协同启用开关', 'true', 0, 1, 'SRM EDI 协同总开关，默认启用'),
(6431, 'SRM', 'srm.edi.partner.default.protocol', 'EDI默认传输协议', 'AS2', 1, 1, '待业务方确认：EDI 默认传输协议（AS2/OFTP/SFTP/HTTPS）'),
(6432, 'SRM', 'srm.edi.retry.max.count', 'EDI最大重试次数', '3', 1, 1, '待业务方确认：报文发送失败最大重试次数'),
(6433, 'SRM', 'srm.edi.retry.interval.minutes', 'EDI重试间隔分钟', '10', 1, 1, '待业务方确认：报文重试间隔（分钟）'),
(6434, 'SRM', 'srm.edi.ack.timeout.minutes', 'EDI回执超时分钟', '30', 1, 1, '待业务方确认：等待对方回执的超时时间（分钟）'),
(6435, 'SRM', 'srm.edi.message.type.demand.enabled', '需求报文分发开关', 'true', 0, 1, '是否分发客户需求报文'),
(6436, 'SRM', 'srm.edi.message.type.forecast.enabled', '预测报文分发开关', 'true', 0, 1, '是否分发需求预测报文'),
(6437, 'SRM', 'srm.edi.message.type.order.enabled', '订单报文分发开关', 'true', 0, 1, '是否分发采购订单报文'),
(6438, 'SRM', 'srm.edi.message.type.change.enabled', '变更报文分发开关', 'true', 0, 1, '是否分发订单变更报文'),
(6439, 'SRM', 'srm.edi.reconcile.auto.enabled', 'EDI自动对账开关', 'true', 1, 1, '待业务方确认：EDI 对账是否自动生成'),
(6440, 'SRM', 'srm.edi.reconcile.period', 'EDI对账周期', 'MONTHLY', 1, 1, '待业务方确认：EDI 对账周期（MONTHLY/WEEKLY）'),
(6441, 'SRM', 'srm.edi.payload.retention.days', '报文保留天数', '90', 1, 1, '待业务方确认：EDI 报文内容保留天数');
