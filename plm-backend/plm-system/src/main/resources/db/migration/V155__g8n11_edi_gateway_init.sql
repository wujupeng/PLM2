-- G8-N11 六系统集成—EDI 网关（WBS T072）初始化：菜单/按钮权限、角色授权、字典与可配置项。
-- 号段基线（V153 之后实测）：sys_permission=5152（本脚本从 5153 起）、
-- sys_role_permission=16333（从 16334 起）、sys_dictionary=9367（从 9368 起）、sys_config=6885（从 6886 起）。
-- 菜单说明：G8「系统集成」顶级菜单域（4962，V135 建立）复用，本节点新增二级方向分组
--          EDI 网关（5153），覆盖集成接口、字段映射、同步批次、接收回执、异常补偿、对账。

-- ========== EDI 网关集成方向分组（5153，挂在 4962 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(5153, 'intg:edi-gateway', 'EDI 网关集成', 'menu', 4962, '/intg/edi-gateway', 'SwapOutlined', 11, 1);

-- ========== EDI 网关业务菜单（5154-5159，挂在 5153 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(5154, 'intg:edi-gateway:interface', '集成接口', 'menu', 5153, '/intg/edi-gateway/interfaces', 'ApiOutlined', 1, 1),
(5155, 'intg:edi-gateway:mapping', '字段映射', 'menu', 5153, '/intg/edi-gateway/mappings', 'PartitionOutlined', 2, 1),
(5156, 'intg:edi-gateway:batch', '同步批次', 'menu', 5153, '/intg/edi-gateway/batches', 'SyncOutlined', 3, 1),
(5157, 'intg:edi-gateway:receipt', '接收回执', 'menu', 5153, '/intg/edi-gateway/receipts', 'AuditOutlined', 4, 1),
(5158, 'intg:edi-gateway:compensation', '异常补偿', 'menu', 5153, '/intg/edi-gateway/compensations', 'ToolOutlined', 5, 1),
(5159, 'intg:edi-gateway:reconcile', '对账', 'menu', 5153, '/intg/edi-gateway/reconciles', 'BalanceOutlined', 6, 1);

-- ========== EDI 网关按钮（5160-5171） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(5160, 'intg:edi-gateway:interface:list', '查询集成接口', 'button', 5154, NULL, NULL, 1, 1),
(5161, 'intg:edi-gateway:interface:manage', '维护集成接口', 'button', 5154, NULL, NULL, 2, 1),
(5162, 'intg:edi-gateway:mapping:list', '查询字段映射', 'button', 5155, NULL, NULL, 1, 1),
(5163, 'intg:edi-gateway:mapping:manage', '维护字段映射', 'button', 5155, NULL, NULL, 2, 1),
(5164, 'intg:edi-gateway:batch:list', '查询同步批次', 'button', 5156, NULL, NULL, 1, 1),
(5165, 'intg:edi-gateway:batch:manage', '维护同步批次', 'button', 5156, NULL, NULL, 2, 1),
(5166, 'intg:edi-gateway:receipt:list', '查询接收回执', 'button', 5157, NULL, NULL, 1, 1),
(5167, 'intg:edi-gateway:receipt:manage', '维护接收回执', 'button', 5157, NULL, NULL, 2, 1),
(5168, 'intg:edi-gateway:compensation:list', '查询异常补偿', 'button', 5158, NULL, NULL, 1, 1),
(5169, 'intg:edi-gateway:compensation:manage', '维护异常补偿', 'button', 5158, NULL, NULL, 2, 1),
(5170, 'intg:edi-gateway:reconcile:list', '查询对账', 'button', 5159, NULL, NULL, 1, 1),
(5171, 'intg:edi-gateway:reconcile:manage', '维护对账', 'button', 5159, NULL, NULL, 2, 1);

-- ========== 角色授权（16334-16423） ==========

-- 系统管理员（2001）：授予全部权限（19 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(16334, 2001, 5153), (16335, 2001, 5154), (16336, 2001, 5155), (16337, 2001, 5156),
(16338, 2001, 5157), (16339, 2001, 5158), (16340, 2001, 5159), (16341, 2001, 5160),
(16342, 2001, 5161), (16343, 2001, 5162), (16344, 2001, 5163), (16345, 2001, 5164),
(16346, 2001, 5165), (16347, 2001, 5166), (16348, 2001, 5167), (16349, 2001, 5168),
(16350, 2001, 5169), (16351, 2001, 5170), (16352, 2001, 5171);

-- 供应链专员（2004）：授予全部权限（客户/供应商 EDI 报文主责角色，共 19 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(16353, 2004, 5153), (16354, 2004, 5154), (16355, 2004, 5155), (16356, 2004, 5156),
(16357, 2004, 5157), (16358, 2004, 5158), (16359, 2004, 5159), (16360, 2004, 5160),
(16361, 2004, 5161), (16362, 2004, 5162), (16363, 2004, 5163), (16364, 2004, 5164),
(16365, 2004, 5165), (16366, 2004, 5166), (16367, 2004, 5167), (16368, 2004, 5168),
(16369, 2004, 5169), (16370, 2004, 5170), (16371, 2004, 5171);

-- 生产现场（2005）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(16372, 2005, 5153), (16373, 2005, 5154), (16374, 2005, 5155), (16375, 2005, 5156),
(16376, 2005, 5157), (16377, 2005, 5158), (16378, 2005, 5159), (16379, 2005, 5160),
(16380, 2005, 5162), (16381, 2005, 5164), (16382, 2005, 5166), (16383, 2005, 5168),
(16384, 2005, 5170);

-- 质量工程师（2003）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(16385, 2003, 5153), (16386, 2003, 5154), (16387, 2003, 5155), (16388, 2003, 5156),
(16389, 2003, 5157), (16390, 2003, 5158), (16391, 2003, 5159), (16392, 2003, 5160),
(16393, 2003, 5162), (16394, 2003, 5164), (16395, 2003, 5166), (16396, 2003, 5168),
(16397, 2003, 5170);

-- 研发工程师（2002）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(16398, 2002, 5153), (16399, 2002, 5154), (16400, 2002, 5155), (16401, 2002, 5156),
(16402, 2002, 5157), (16403, 2002, 5158), (16404, 2002, 5159), (16405, 2002, 5160),
(16406, 2002, 5162), (16407, 2002, 5164), (16408, 2002, 5166), (16409, 2002, 5168),
(16410, 2002, 5170);

-- 只读用户（2006）：授予分组/菜单 + 仅查询按钮（13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(16411, 2006, 5153), (16412, 2006, 5154), (16413, 2006, 5155), (16414, 2006, 5156),
(16415, 2006, 5157), (16416, 2006, 5158), (16417, 2006, 5159), (16418, 2006, 5160),
(16419, 2006, 5162), (16420, 2006, 5164), (16421, 2006, 5166), (16422, 2006, 5168),
(16423, 2006, 5170);

-- ========== EDI 网关集成字典（9368-9408） ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(9368, 'intg_edi_gateway_object_type', '采购订单报文', 'EDI_PURCHASE_ORDER', 1, 1, NULL),
(9369, 'intg_edi_gateway_object_type', '发货通知报文', 'EDI_DELIVERY_NOTE', 2, 1, NULL),
(9370, 'intg_edi_gateway_object_type', '发票报文', 'EDI_INVOICE', 3, 1, NULL),
(9371, 'intg_edi_gateway_object_type', '到货通知报文', 'EDI_ASN', 4, 1, NULL),
(9372, 'intg_edi_gateway_object_type', '收货确认报文', 'EDI_RECEIPT', 5, 1, NULL),
(9373, 'intg_edi_gateway_protocol', 'API 接口', 'API', 1, 1, NULL),
(9374, 'intg_edi_gateway_protocol', '事件消息', 'EVENT', 2, 1, NULL),
(9375, 'intg_edi_gateway_protocol', '批量文件', 'FILE', 3, 1, NULL),
(9376, 'intg_edi_gateway_trigger_type', '手工触发', 'MANUAL', 1, 1, NULL),
(9377, 'intg_edi_gateway_trigger_type', '定时触发', 'SCHEDULED', 2, 1, NULL),
(9378, 'intg_edi_gateway_trigger_type', '事件触发', 'EVENT', 3, 1, NULL),
(9379, 'intg_edi_gateway_sync_mode', '全量', 'FULL', 1, 1, NULL),
(9380, 'intg_edi_gateway_sync_mode', '增量', 'INCREMENTAL', 2, 1, NULL),
(9381, 'intg_edi_gateway_interface_status', '草稿', 'DRAFT', 1, 1, NULL),
(9382, 'intg_edi_gateway_interface_status', '启用', 'ACTIVE', 2, 1, NULL),
(9383, 'intg_edi_gateway_interface_status', '停用', 'DISABLED', 3, 1, NULL),
(9384, 'intg_edi_gateway_mapping_status', '草稿', 'DRAFT', 1, 1, NULL),
(9385, 'intg_edi_gateway_mapping_status', '启用', 'ACTIVE', 2, 1, NULL),
(9386, 'intg_edi_gateway_mapping_status', '停用', 'DISABLED', 3, 1, NULL),
(9387, 'intg_edi_gateway_batch_status', '待执行', 'PENDING', 1, 1, NULL),
(9388, 'intg_edi_gateway_batch_status', '执行中', 'RUNNING', 2, 1, NULL),
(9389, 'intg_edi_gateway_batch_status', '成功', 'SUCCESS', 3, 1, NULL),
(9390, 'intg_edi_gateway_batch_status', '部分成功', 'PARTIAL', 4, 1, NULL),
(9391, 'intg_edi_gateway_batch_status', '失败', 'FAILED', 5, 1, NULL),
(9392, 'intg_edi_gateway_receipt_status', '待回执', 'PENDING', 1, 1, NULL),
(9393, 'intg_edi_gateway_receipt_status', '已接收', 'ACCEPTED', 2, 1, NULL),
(9394, 'intg_edi_gateway_receipt_status', '已拒绝', 'REJECTED', 3, 1, NULL),
(9395, 'intg_edi_gateway_receipt_status', '警告', 'WARN', 4, 1, NULL),
(9396, 'intg_edi_gateway_error_type', '校验失败', 'VALIDATION', 1, 1, NULL),
(9397, 'intg_edi_gateway_error_type', '超时', 'TIMEOUT', 2, 1, NULL),
(9398, 'intg_edi_gateway_error_type', '数据冲突', 'CONFLICT', 3, 1, NULL),
(9399, 'intg_edi_gateway_error_type', '网络异常', 'NETWORK', 4, 1, NULL),
(9400, 'intg_edi_gateway_error_type', '其他', 'OTHER', 5, 1, NULL),
(9401, 'intg_edi_gateway_compensation_status', '待处理', 'PENDING', 1, 1, NULL),
(9402, 'intg_edi_gateway_compensation_status', '处理中', 'PROCESSING', 2, 1, NULL),
(9403, 'intg_edi_gateway_compensation_status', '已解决', 'RESOLVED', 3, 1, NULL),
(9404, 'intg_edi_gateway_compensation_status', '已忽略', 'IGNORED', 4, 1, NULL),
(9405, 'intg_edi_gateway_reconcile_status', '待对账', 'PENDING', 1, 1, NULL),
(9406, 'intg_edi_gateway_reconcile_status', '已平账', 'BALANCED', 2, 1, NULL),
(9407, 'intg_edi_gateway_reconcile_status', '存在差异', 'DIFF', 3, 1, NULL),
(9408, 'intg_edi_gateway_reconcile_status', '已关闭', 'CLOSED', 4, 1, NULL);

-- ========== EDI 网关集成可配置项（6886-6898） ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(6886, 'INTG', 'intg.edi-gateway.enabled', 'EDI 网关集成启用开关', 'true', 0, 1, 'EDI 网关集成总开关，默认启用'),
(6887, 'INTG', 'intg.edi-gateway.batch.size', '同步批次单批条数', '200', 1, 1, '单批同步条数，待业务方确认并发规模后调整'),
(6888, 'INTG', 'intg.edi-gateway.retry.times', '失败重试次数', '3', 1, 1, 'EDI 报文重传次数，待业务方确认'),
(6889, 'INTG', 'intg.edi-gateway.timeout.ms', '接口超时时间（毫秒）', '30000', 1, 1, '接口调用超时时间，待业务方确认'),
(6890, 'INTG', 'intg.edi-gateway.idempotent.window.hours', '幂等窗口（小时）', '24', 1, 1, '幂等判重时间窗口，待业务方确认'),
(6891, 'INTG', 'intg.edi-gateway.receipt.auto', '系统回执自动生成', 'true', 0, 1, '系统校验通过后自动生成回执'),
(6892, 'INTG', 'intg.edi-gateway.reconcile.cron', '对账任务计划表达式', '0 0 2 * * ?', 1, 1, '每日对账任务 Cron，待业务方确认对账频率'),
(6893, 'INTG', 'intg.edi-gateway.interface.no.prefix', '集成接口编号前缀', 'EDI', 0, 1, '集成接口编号自动生成前缀'),
(6894, 'INTG', 'intg.edi-gateway.mapping.no.prefix', '字段映射编号前缀', 'EDM', 0, 1, '字段映射编号自动生成前缀'),
(6895, 'INTG', 'intg.edi-gateway.batch.no.prefix', '同步批次编号前缀', 'EDB', 0, 1, '同步批次编号自动生成前缀'),
(6896, 'INTG', 'intg.edi-gateway.receipt.no.prefix', '接收回执编号前缀', 'EDR', 0, 1, '接收回执编号自动生成前缀'),
(6897, 'INTG', 'intg.edi-gateway.compensation.no.prefix', '异常补偿编号前缀', 'EDC', 0, 1, '异常补偿编号自动生成前缀'),
(6898, 'INTG', 'intg.edi-gateway.reconcile.no.prefix', '对账编号前缀', 'EDO', 0, 1, '对账编号自动生成前缀');
