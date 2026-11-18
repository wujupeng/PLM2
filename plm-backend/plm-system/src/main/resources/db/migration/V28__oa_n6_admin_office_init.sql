-- OA-N6 初始化数据：行政人事与办公应用的菜单、按钮权限、角色授权、字典、可配置项与样例流程
-- 说明：流程与表单均为可配置数据，样例仅用于联调与验收演示，实施时由业务方通过设计器维护。
-- 号段避让：菜单 3760-3764、按钮 3765-3781、角色授权 11260-11336、字典 6360-6522、配置 5960-5980、样例 7502-7799。

-- ========== OA-N6 权限（菜单 3760-3764，按钮 3765-3781） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(3760, 'oa-hr', '行政人事', 'menu', 3600, '/oa/hr', 'TeamOutlined', 18, 1),
(3761, 'oa-meeting', '会议与日程', 'menu', 3600, '/oa/meeting', 'CalendarOutlined', 19, 1),
(3762, 'oa-collab', '协同办公', 'menu', 3600, '/oa/collab', 'NotificationOutlined', 20, 1),
(3763, 'oa-address-book', '通讯录', 'menu', 3600, '/oa/address-book', 'ContactsOutlined', 21, 1),
(3764, 'oa-mobile-admin', '移动端后台', 'menu', 3600, '/oa/mobile-admin', 'MobileOutlined', 22, 1),
(3765, 'oa:hr:list', '查询人事申请', 'button', 3760, NULL, NULL, 1, 1),
(3766, 'oa:hr:apply', '提交人事申请', 'button', 3760, NULL, NULL, 2, 1),
(3767, 'oa:hr:manage', '维护人事单据', 'button', 3760, NULL, NULL, 3, 1),
(3768, 'oa:hr:vehicle:manage', '维护车辆档案', 'button', 3760, NULL, NULL, 4, 1),
(3769, 'oa:meeting:list', '查询会议日程', 'button', 3761, NULL, NULL, 1, 1),
(3770, 'oa:meeting:book', '预约会议室', 'button', 3761, NULL, NULL, 2, 1),
(3771, 'oa:meeting:manage', '维护会议室', 'button', 3761, NULL, NULL, 3, 1),
(3772, 'oa:schedule:edit', '维护日程', 'button', 3761, NULL, NULL, 4, 1),
(3773, 'oa:collab:list', '查询协同内容', 'button', 3762, NULL, NULL, 1, 1),
(3774, 'oa:collab:publish', '发布公告新闻', 'button', 3762, NULL, NULL, 2, 1),
(3775, 'oa:collab:vote', '发起投票', 'button', 3762, NULL, NULL, 3, 1),
(3776, 'oa:collab:album', '维护相册', 'button', 3762, NULL, NULL, 4, 1),
(3777, 'oa:collab:task', '协作任务', 'button', 3762, NULL, NULL, 5, 1),
(3778, 'oa:collab:report', '工作汇报', 'button', 3762, NULL, NULL, 6, 1),
(3779, 'oa:addressbook:list', '查询通讯录', 'button', 3763, NULL, NULL, 1, 1),
(3780, 'oa:mobile:manage', '维护移动端配置', 'button', 3764, NULL, NULL, 1, 1),
(3781, 'oa:mobile:view', '移动端访问', 'button', 3764, NULL, NULL, 2, 1);

-- 管理员（2001）：授予 OA-N6 全部权限
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11260, 2001, 3760), (11261, 2001, 3761), (11262, 2001, 3762), (11263, 2001, 3763),
(11264, 2001, 3764), (11265, 2001, 3765), (11266, 2001, 3766), (11267, 2001, 3767),
(11268, 2001, 3768), (11269, 2001, 3769), (11270, 2001, 3770), (11271, 2001, 3771),
(11272, 2001, 3772), (11273, 2001, 3773), (11274, 2001, 3774), (11275, 2001, 3775),
(11276, 2001, 3776), (11277, 2001, 3777), (11278, 2001, 3778), (11279, 2001, 3779),
(11280, 2001, 3780), (11281, 2001, 3781);

-- 只读用户（2006）：全部菜单 + 仅查询按钮（不含任何维护与发起）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11282, 2006, 3760), (11283, 2006, 3761), (11284, 2006, 3762), (11285, 2006, 3763),
(11286, 2006, 3764), (11287, 2006, 3765), (11288, 2006, 3769), (11289, 2006, 3773),
(11290, 2006, 3779);

-- 研发工程师（2002）：行政人事/会议日程/协同办公/通讯录菜单，可发起申请与协作
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11291, 2002, 3760), (11292, 2002, 3761), (11293, 2002, 3762), (11294, 2002, 3763),
(11295, 2002, 3765), (11296, 2002, 3766), (11297, 2002, 3769), (11298, 2002, 3770),
(11299, 2002, 3772), (11300, 2002, 3773), (11301, 2002, 3777), (11302, 2002, 3778),
(11303, 2002, 3779);

-- 质量工程师（2003）：同研发工程师
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11304, 2003, 3760), (11305, 2003, 3761), (11306, 2003, 3762), (11307, 2003, 3763),
(11308, 2003, 3765), (11309, 2003, 3766), (11310, 2003, 3769), (11311, 2003, 3770),
(11312, 2003, 3772), (11313, 2003, 3773), (11314, 2003, 3777), (11315, 2003, 3778),
(11316, 2003, 3779);

-- 供应链专员（2004）：同研发工程师
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11317, 2004, 3760), (11318, 2004, 3761), (11319, 2004, 3762), (11320, 2004, 3763),
(11321, 2004, 3765), (11322, 2004, 3766), (11323, 2004, 3769), (11324, 2004, 3770),
(11325, 2004, 3772), (11326, 2004, 3773), (11327, 2004, 3777), (11328, 2004, 3778),
(11329, 2004, 3779);

-- 生产现场（2005）：行政人事/协同办公/通讯录，可发起申请与查看协作
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11330, 2005, 3760), (11331, 2005, 3762), (11332, 2005, 3763), (11333, 2005, 3765),
(11334, 2005, 3766), (11335, 2005, 3773), (11336, 2005, 3779);

-- ========== OA-N6 字典 ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(6360, 'oa_hr_flow_status', '草稿', 'DRAFT', 1, 1, NULL),
(6361, 'oa_hr_flow_status', '审批中', 'RUNNING', 2, 1, NULL),
(6362, 'oa_hr_flow_status', '已通过', 'APPROVED', 3, 1, NULL),
(6363, 'oa_hr_flow_status', '已驳回', 'REJECTED', 4, 1, NULL),
(6364, 'oa_hr_flow_status', '已撤回', 'CANCELLED', 5, 1, NULL),
(6370, 'oa_hr_leave_type', '事假', 'PERSONAL', 1, 1, NULL),
(6371, 'oa_hr_leave_type', '病假', 'SICK', 2, 1, NULL),
(6372, 'oa_hr_leave_type', '年假', 'ANNUAL', 3, 1, NULL),
(6373, 'oa_hr_leave_type', '调休', 'COMPENSATORY', 4, 1, NULL),
(6374, 'oa_hr_leave_type', '婚假', 'MARRIAGE', 5, 1, NULL),
(6375, 'oa_hr_leave_type', '产假', 'MATERNITY', 6, 1, NULL),
(6376, 'oa_hr_leave_type', '陪产假', 'PATERNITY', 7, 1, NULL),
(6380, 'oa_hr_overtime_type', '工作日加班', 'WORKDAY', 1, 1, NULL),
(6381, 'oa_hr_overtime_type', '休息日加班', 'WEEKEND', 2, 1, NULL),
(6382, 'oa_hr_overtime_type', '节假日加班', 'HOLIDAY', 3, 1, NULL),
(6385, 'oa_hr_compensate_type', '调休', 'COMPENSATORY', 1, 1, NULL),
(6386, 'oa_hr_compensate_type', '加班费', 'OVERTIME_PAY', 2, 1, NULL),
(6390, 'oa_hr_resignation_type', '主动离职', 'VOLUNTARY', 1, 1, NULL),
(6391, 'oa_hr_resignation_type', '协商解除', 'MUTUAL', 2, 1, NULL),
(6392, 'oa_hr_resignation_type', '合同到期', 'EXPIRED', 3, 1, NULL),
(6393, 'oa_hr_resignation_type', '辞退', 'TERMINATED', 4, 1, NULL),
(6400, 'oa_hr_visitor_status', '已申请', 'APPLIED', 1, 1, NULL),
(6401, 'oa_hr_visitor_status', '已批准', 'APPROVED', 2, 1, NULL),
(6402, 'oa_hr_visitor_status', '已到访', 'CHECKED_IN', 3, 1, NULL),
(6403, 'oa_hr_visitor_status', '已离开', 'CHECKED_OUT', 4, 1, NULL),
(6404, 'oa_hr_visitor_status', '已拒绝', 'REJECTED', 5, 1, NULL),
(6405, 'oa_hr_visitor_status', '已撤回', 'CANCELLED', 6, 1, NULL),
(6410, 'oa_hr_att_exception_type', '迟到', 'LATE', 1, 1, NULL),
(6411, 'oa_hr_att_exception_type', '早退', 'EARLY_LEAVE', 2, 1, NULL),
(6412, 'oa_hr_att_exception_type', '缺卡', 'MISSING', 3, 1, NULL),
(6413, 'oa_hr_att_exception_type', '旷工', 'ABSENT', 4, 1, NULL),
(6414, 'oa_hr_att_exception_type', '其他', 'OTHER', 5, 1, NULL),
(6420, 'oa_hr_vehicle_type', '轿车', 'SEDAN', 1, 1, NULL),
(6421, 'oa_hr_vehicle_type', '商务车', 'MPV', 2, 1, NULL),
(6422, 'oa_hr_vehicle_type', '客车', 'BUS', 3, 1, NULL),
(6423, 'oa_hr_vehicle_type', '货车', 'TRUCK', 4, 1, NULL),
(6424, 'oa_hr_vehicle_type', '其他', 'OTHER', 5, 1, NULL),
(6430, 'oa_hr_vehicle_status', '空闲', 'IDLE', 1, 1, NULL),
(6431, 'oa_hr_vehicle_status', '使用中', 'IN_USE', 2, 1, NULL),
(6432, 'oa_hr_vehicle_status', '维保中', 'MAINTENANCE', 3, 1, NULL),
(6433, 'oa_hr_vehicle_status', '停用', 'DISABLED', 4, 1, NULL),
(6440, 'oa_meeting_booking_status', '已预约', 'BOOKED', 1, 1, NULL),
(6441, 'oa_meeting_booking_status', '已取消', 'CANCELLED', 2, 1, NULL),
(6442, 'oa_meeting_booking_status', '已完成', 'FINISHED', 3, 1, NULL),
(6450, 'oa_schedule_type', '个人日程', 'PERSONAL', 1, 1, NULL),
(6451, 'oa_schedule_type', '部门日程', 'DEPT', 2, 1, NULL),
(6452, 'oa_schedule_type', '共享日程', 'SHARED', 3, 1, NULL),
(6455, 'oa_schedule_share_scope', '私有', 'PRIVATE', 1, 1, NULL),
(6456, 'oa_schedule_share_scope', '部门可见', 'DEPT', 2, 1, NULL),
(6457, 'oa_schedule_share_scope', '公开', 'PUBLIC', 3, 1, NULL),
(6465, 'oa_announcement_category', '公告', 'ANNOUNCEMENT', 1, 1, NULL),
(6466, 'oa_announcement_category', '新闻', 'NEWS', 2, 1, NULL),
(6470, 'oa_publish_scope', '全员', 'ALL', 1, 1, NULL),
(6471, 'oa_publish_scope', '部门', 'DEPT', 2, 1, NULL),
(6472, 'oa_publish_scope', '角色', 'ROLE', 3, 1, NULL),
(6473, 'oa_publish_scope', '指定人员', 'USER', 4, 1, NULL),
(6480, 'oa_publish_status', '草稿', 'DRAFT', 1, 1, NULL),
(6481, 'oa_publish_status', '已发布', 'PUBLISHED', 2, 1, NULL),
(6482, 'oa_publish_status', '已下线', 'OFFLINE', 3, 1, NULL),
(6490, 'oa_vote_type', '单选', 'SINGLE', 1, 1, NULL),
(6491, 'oa_vote_type', '多选', 'MULTI', 2, 1, NULL),
(6495, 'oa_vote_status', '草稿', 'DRAFT', 1, 1, NULL),
(6496, 'oa_vote_status', '进行中', 'RUNNING', 2, 1, NULL),
(6497, 'oa_vote_status', '已结束', 'CLOSED', 3, 1, NULL),
(6500, 'oa_album_status', '草稿', 'DRAFT', 1, 1, NULL),
(6501, 'oa_album_status', '已发布', 'PUBLISHED', 2, 1, NULL),
(6502, 'oa_album_status', '已归档', 'ARCHIVED', 3, 1, NULL),
(6505, 'oa_report_type', '日报', 'DAILY', 1, 1, NULL),
(6506, 'oa_report_type', '周报', 'WEEKLY', 2, 1, NULL),
(6507, 'oa_report_type', '月报', 'MONTHLY', 3, 1, NULL),
(6510, 'oa_collab_task_status', '待办', 'TODO', 1, 1, NULL),
(6511, 'oa_collab_task_status', '进行中', 'DOING', 2, 1, NULL),
(6512, 'oa_collab_task_status', '已完成', 'DONE', 3, 1, NULL),
(6513, 'oa_collab_task_status', '已关闭', 'CLOSED', 4, 1, NULL),
(6515, 'oa_collab_task_priority', '低', 'LOW', 1, 1, NULL),
(6516, 'oa_collab_task_priority', '普通', 'NORMAL', 2, 1, NULL),
(6517, 'oa_collab_task_priority', '高', 'HIGH', 3, 1, NULL),
(6518, 'oa_collab_task_priority', '紧急', 'URGENT', 4, 1, NULL),
(6520, 'oa_mobile_config_type', '菜单', 'MENU', 1, 1, NULL),
(6521, 'oa_mobile_config_type', '推送', 'PUSH', 2, 1, NULL),
(6522, 'oa_mobile_config_type', '策略', 'POLICY', 3, 1, NULL);

-- ========== OA-N6 可配置项 ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(5960, 'OA', 'oa.hr.leave.max.days.per.apply', '单次请假最长天数', '50', 1, 1, '待业务方确认各假种单次申请上限与年度额度规则'),
(5961, 'OA', 'oa.hr.leave.advance.days', '请假需提前申请天数', '0', 1, 1, '待业务方确认事假/年假的提前申请要求'),
(5962, 'OA', 'oa.hr.leave.need.attachment.days', '病假需上传证明的天数阈值', '3', 1, 1, '请假天数达到该阈值时提示上传证明材料'),
(5963, 'OA', 'oa.hr.overtime.compensate.default', '加班默认补偿方式', 'COMPENSATORY', 1, 1, 'COMPENSATORY=调休 / OVERTIME_PAY=加班费'),
(5964, 'OA', 'oa.hr.overtime.min.hours', '加班最小时长（小时）', '1', 0, 1, NULL),
(5965, 'OA', 'oa.hr.attendance.forward.days', '考勤异常可补办天数', '7', 1, 1, '待业务方确认考勤异常补办时效'),
(5966, 'OA', 'oa.hr.visitor.need.approval', '访客申请需审批', 'true', 1, 1, '待业务方确认是否所有访客均需审批'),
(5967, 'OA', 'oa.hr.visitor.valid.hours', '访客凭证有效时长（小时）', '24', 1, 1, NULL),
(5968, 'OA', 'oa.hr.resignation.notice.days', '离职提前通知天数', '30', 1, 1, '待业务方确认试用期与正式员工的提前通知期差异'),
(5969, 'OA', 'oa.hr.resignation.disable.account', '离职审批通过后自动停用账号', 'true', 0, 1, '仅在流程审批通过的授权范围内执行账号停用，历史责任链保留'),
(5970, 'OA', 'oa.hr.flow.no.prefix', '人事单据编号前缀', 'OAHR', 0, 1, NULL),
(5971, 'OA', 'oa.meeting.conflict.check', '会议室预约冲突校验', 'true', 0, 1, '同一会议室时间段重叠时拒绝预约'),
(5972, 'OA', 'oa.meeting.book.advance.minutes', '会议预约提前量（分钟）', '0', 0, 1, NULL),
(5973, 'OA', 'oa.meeting.default.duration.minutes', '会议默认时长（分钟）', '60', 0, 1, NULL),
(5974, 'OA', 'oa.schedule.remind.default.minutes', '日程默认提醒提前量（分钟）', '15', 0, 1, NULL),
(5975, 'OA', 'oa.collab.announcement.need.read', '公告默认需阅读确认', 'false', 1, 1, '待业务方确认哪些公告需阅读回执'),
(5976, 'OA', 'oa.collab.album.max.photos', '单个相册最大照片数', '200', 1, 1, NULL),
(5977, 'OA', 'oa.collab.report.due.day', '工作汇报提交时限（天）', '1', 1, 1, '待业务方确认日报/周报/月报的提交时限与提醒规则'),
(5978, 'OA', 'oa.mobile.enabled', '启用移动端访问', 'true', 0, 1, NULL),
(5979, 'OA', 'oa.mobile.push.enabled', '启用移动消息推送', 'false', 1, 1, '推送通道按许可与安全策略确定，见 IF-OA-07'),
(5980, 'OA', 'oa.mobile.workbench.max.items', '移动工作台最多展示应用数', '12', 0, 1, NULL);

-- ========== OA-N6 样例流程包（仅用于联调与验收演示） ==========
-- 请假流程表单 7501 与流程 7521 已在 OA-N3（V22）初始化，此处补充 OA-N6 其余流程包。

INSERT INTO oa_form_definition (id, form_code, form_name, category, version_no, status, schema_json, description, remark, created_by, created_at) VALUES
(7502, 'OA_OVERTIME', '加班申请单', '人事行政', 1, 'PUBLISHED', NULL, '员工加班申请，含加班类型、起止时间、时长与补偿方式', '示例表单，实施时由业务方通过表单设计器维护', 9001, CURRENT_TIMESTAMP),
(7503, 'OA_RESIGNATION', '离职申请单', '人事行政', 1, 'PUBLISHED', NULL, '员工离职申请，含最后工作日、离职原因与交接安排', '示例表单，实施时由业务方通过表单设计器维护', 9001, CURRENT_TIMESTAMP),
(7504, 'OA_VISITOR', '访客申请单', '人事行政', 1, 'PUBLISHED', NULL, '访客来访申请，含访客信息、来访时间、接待人与访问区域', '示例表单，实施时由业务方通过表单设计器维护', 9001, CURRENT_TIMESTAMP),
(7505, 'OA_ATT_EXCEPTION', '考勤异常单', '人事行政', 1, 'PUBLISHED', NULL, '考勤异常补办申请，含异常类型、异常日期与申请事由', '示例表单，实施时由业务方通过表单设计器维护', 9001, CURRENT_TIMESTAMP),
(7506, 'OA_VEHICLE_APPLY', '用车申请单', '人事行政', 1, 'PUBLISHED', NULL, '用车申请，含用车时间、目的地、事由与随行人数', '示例表单，实施时由业务方通过表单设计器维护', 9001, CURRENT_TIMESTAMP);

INSERT INTO oa_form_field (id, form_id, field_code, field_name, field_type, required_flag, data_source, source_value, options_json, rules_json, placeholder, sort_no, remark, created_by, created_at) VALUES
(7551, 7502, 'overtimeType', '加班类型', 'SELECT', 1, 'DICT', 'oa_hr_overtime_type', NULL, NULL, '请选择加班类型', 1, NULL, 9001, CURRENT_TIMESTAMP),
(7552, 7502, 'startTime', '开始时间', 'DATETIME', 1, 'MANUAL', NULL, NULL, NULL, '请选择开始时间', 2, NULL, 9001, CURRENT_TIMESTAMP),
(7553, 7502, 'endTime', '结束时间', 'DATETIME', 1, 'MANUAL', NULL, NULL, NULL, '请选择结束时间', 3, NULL, 9001, CURRENT_TIMESTAMP),
(7554, 7502, 'overtimeHours', '加班时长', 'NUMBER', 1, 'MANUAL', NULL, NULL, NULL, '请输入加班时长（小时）', 4, NULL, 9001, CURRENT_TIMESTAMP),
(7555, 7502, 'compensateType', '补偿方式', 'SELECT', 1, 'DICT', 'oa_hr_compensate_type', NULL, NULL, '请选择补偿方式', 5, NULL, 9001, CURRENT_TIMESTAMP),
(7556, 7503, 'lastWorkDate', '最后工作日', 'DATE', 1, 'MANUAL', NULL, NULL, NULL, '请选择最后工作日', 1, NULL, 9001, CURRENT_TIMESTAMP),
(7557, 7503, 'resignationType', '离职类型', 'SELECT', 1, 'DICT', 'oa_hr_resignation_type', NULL, NULL, '请选择离职类型', 2, NULL, 9001, CURRENT_TIMESTAMP),
(7558, 7503, 'reason', '离职原因', 'TEXTAREA', 1, 'MANUAL', NULL, NULL, NULL, '请输入离职原因', 3, NULL, 9001, CURRENT_TIMESTAMP),
(7559, 7503, 'handoverUser', '交接人', 'USER', 1, 'USER', NULL, NULL, NULL, '请选择交接人', 4, NULL, 9001, CURRENT_TIMESTAMP),
(7560, 7503, 'handoverItems', '交接事项', 'TEXTAREA', 1, 'MANUAL', NULL, NULL, NULL, '请填写交接事项清单', 5, NULL, 9001, CURRENT_TIMESTAMP),
(7561, 7504, 'visitorName', '访客姓名', 'TEXT', 1, 'MANUAL', NULL, NULL, NULL, '请输入访客姓名', 1, NULL, 9001, CURRENT_TIMESTAMP),
(7562, 7504, 'visitorCompany', '访客单位', 'TEXT', 1, 'MANUAL', NULL, NULL, NULL, '请输入访客单位', 2, NULL, 9001, CURRENT_TIMESTAMP),
(7563, 7504, 'visitorPhone', '联系电话', 'TEXT', 1, 'MANUAL', NULL, NULL, NULL, '请输入联系电话', 3, NULL, 9001, CURRENT_TIMESTAMP),
(7564, 7504, 'visitStart', '来访时间', 'DATETIME', 1, 'MANUAL', NULL, NULL, NULL, '请选择来访时间', 4, NULL, 9001, CURRENT_TIMESTAMP),
(7565, 7504, 'visitEnd', '离访时间', 'DATETIME', 1, 'MANUAL', NULL, NULL, NULL, '请选择离访时间', 5, NULL, 9001, CURRENT_TIMESTAMP),
(7566, 7504, 'hostUser', '接待人', 'USER', 1, 'USER', NULL, NULL, NULL, '请选择接待人', 6, NULL, 9001, CURRENT_TIMESTAMP),
(7567, 7504, 'visitArea', '访问区域', 'TEXT', 1, 'MANUAL', NULL, NULL, NULL, '请输入访问区域', 7, NULL, 9001, CURRENT_TIMESTAMP),
(7568, 7505, 'exceptionType', '异常类型', 'SELECT', 1, 'DICT', 'oa_hr_att_exception_type', NULL, NULL, '请选择异常类型', 1, NULL, 9001, CURRENT_TIMESTAMP),
(7569, 7505, 'exceptionDate', '异常日期', 'DATE', 1, 'MANUAL', NULL, NULL, NULL, '请选择异常日期', 2, NULL, 9001, CURRENT_TIMESTAMP),
(7570, 7505, 'exceptionDesc', '异常情况说明', 'TEXTAREA', 1, 'MANUAL', NULL, NULL, NULL, '请描述考勤异常情况', 3, NULL, 9001, CURRENT_TIMESTAMP),
(7571, 7505, 'applyReason', '申请事由', 'TEXTAREA', 1, 'MANUAL', NULL, NULL, NULL, '请输入申请事由', 4, NULL, 9001, CURRENT_TIMESTAMP),
(7572, 7506, 'vehicleId', '申请车辆', 'SELECT', 1, 'MANUAL', NULL, NULL, NULL, '请选择申请车辆', 1, NULL, 9001, CURRENT_TIMESTAMP),
(7573, 7506, 'startTime', '用车开始时间', 'DATETIME', 1, 'MANUAL', NULL, NULL, NULL, '请选择用车开始时间', 2, NULL, 9001, CURRENT_TIMESTAMP),
(7574, 7506, 'endTime', '用车结束时间', 'DATETIME', 1, 'MANUAL', NULL, NULL, NULL, '请选择用车结束时间', 3, NULL, 9001, CURRENT_TIMESTAMP),
(7575, 7506, 'destination', '目的地', 'TEXT', 1, 'MANUAL', NULL, NULL, NULL, '请输入目的地', 4, NULL, 9001, CURRENT_TIMESTAMP),
(7576, 7506, 'purpose', '用车事由', 'TEXTAREA', 1, 'MANUAL', NULL, NULL, NULL, '请输入用车事由', 5, NULL, 9001, CURRENT_TIMESTAMP),
(7577, 7506, 'passengerCount', '随行人数', 'NUMBER', 1, 'MANUAL', NULL, NULL, NULL, '请输入随行人数', 6, NULL, 9001, CURRENT_TIMESTAMP);

INSERT INTO oa_process_definition (id, process_code, process_name, form_id, category, version_no, status, definition_json, description, remark, created_by, created_at) VALUES
(7522, 'OA_OVERTIME_FLOW', '加班审批流程', 7502, '人事行政', 1, 'PUBLISHED', NULL, '加班申请提交后依次经部门主管、人事备案', '示例流程，实施时由业务方通过流程设计器维护', 9001, CURRENT_TIMESTAMP),
(7523, 'OA_RESIGNATION_FLOW', '离职审批流程', 7503, '人事行政', 1, 'PUBLISHED', NULL, '离职申请经部门主管、行政、人事会签后生效', '示例流程，实施时由业务方通过流程设计器维护', 9001, CURRENT_TIMESTAMP),
(7524, 'OA_VISITOR_FLOW', '访客审批流程', 7504, '人事行政', 1, 'PUBLISHED', NULL, '访客申请经接待人及行政审批', '示例流程，实施时由业务方通过流程设计器维护', 9001, CURRENT_TIMESTAMP),
(7525, 'OA_ATT_EXCEPTION_FLOW', '考勤异常审批流程', 7505, '人事行政', 1, 'PUBLISHED', NULL, '考勤异常补办经部门主管、人事审批', '示例流程，实施时由业务方通过流程设计器维护', 9001, CURRENT_TIMESTAMP),
(7526, 'OA_VEHICLE_APPLY_FLOW', '用车审批流程', 7506, '人事行政', 1, 'PUBLISHED', NULL, '用车申请经部门主管、行政调度审批', '示例流程，实施时由业务方通过流程设计器维护', 9001, CURRENT_TIMESTAMP);

INSERT INTO oa_process_node (id, process_id, node_code, node_name, node_type, approver_type, approver_value, allow_delegate, sort_no, remark, created_by, created_at) VALUES
(7541, 7522, 'N1', '部门主管审批', 'APPROVAL', 'ROLE', '2001', 1, 1, '示例节点，按角色审批', 9001, CURRENT_TIMESTAMP),
(7542, 7522, 'N2', '人事备案', 'APPROVAL', 'ROLE', '2001', 1, 2, '示例节点，按角色审批', 9001, CURRENT_TIMESTAMP),
(7543, 7523, 'N1', '部门主管审批', 'APPROVAL', 'ROLE', '2001', 1, 1, '示例节点，按角色审批', 9001, CURRENT_TIMESTAMP),
(7544, 7523, 'N2', '行政会签', 'APPROVAL', 'ROLE', '2001', 1, 2, '示例节点，按角色审批', 9001, CURRENT_TIMESTAMP),
(7545, 7523, 'N3', '人事审批', 'APPROVAL', 'ROLE', '2001', 1, 3, '示例节点，按角色审批', 9001, CURRENT_TIMESTAMP),
(7546, 7524, 'N1', '接待人确认', 'APPROVAL', 'ROLE', '2001', 1, 1, '示例节点，按角色审批', 9001, CURRENT_TIMESTAMP),
(7547, 7524, 'N2', '行政审批', 'APPROVAL', 'ROLE', '2001', 1, 2, '示例节点，按角色审批', 9001, CURRENT_TIMESTAMP),
(7548, 7525, 'N1', '部门主管审批', 'APPROVAL', 'ROLE', '2001', 1, 1, '示例节点，按角色审批', 9001, CURRENT_TIMESTAMP),
(7549, 7525, 'N2', '人事审批', 'APPROVAL', 'ROLE', '2001', 1, 2, '示例节点，按角色审批', 9001, CURRENT_TIMESTAMP),
(7550, 7526, 'N1', '部门主管审批', 'APPROVAL', 'ROLE', '2001', 1, 1, '示例节点，按角色审批', 9001, CURRENT_TIMESTAMP),
(7551, 7526, 'N2', '行政调度', 'APPROVAL', 'ROLE', '2001', 1, 2, '示例节点，按角色审批', 9001, CURRENT_TIMESTAMP);

-- ========== OA-N6 样例基础数据 ==========

INSERT INTO oa_hr_meeting_room (id, room_code, room_name, location, capacity, device_json, room_status, manager_user_id, manager_name, created_by, created_at) VALUES
(7770, 'MR-A101', 'A101 第一会议室', 'A 座 1 层', 20, '["投影仪","视频会议","白板"]', 'ENABLED', 9001, '系统管理员', 9001, CURRENT_TIMESTAMP),
(7771, 'MR-A102', 'A102 洽谈室', 'A 座 1 层', 8, '["电视","白板"]', 'ENABLED', 9001, '系统管理员', 9001, CURRENT_TIMESTAMP),
(7772, 'MR-B201', 'B201 培训室', 'B 座 2 层', 60, '["投影仪","音响","视频会议"]', 'ENABLED', 9001, '系统管理员', 9001, CURRENT_TIMESTAMP),
(7773, 'MR-B202', 'B202 评审室', 'B 座 2 层', 12, '["投影仪","白板"]', 'ENABLED', 9001, '系统管理员', 9001, CURRENT_TIMESTAMP);

INSERT INTO oa_hr_vehicle (id, vehicle_code, plate_no, vehicle_type, brand_model, seat_count, driver_user_id, driver_name, vehicle_status, created_by, created_at) VALUES
(7780, 'VH-001', '沪A12345', 'SEDAN', '大众帕萨特', 5, 9001, '系统管理员', 'IDLE', 9001, CURRENT_TIMESTAMP),
(7781, 'VH-002', '沪A67890', 'MPV', '别克GL8', 7, 9001, '系统管理员', 'IDLE', 9001, CURRENT_TIMESTAMP),
(7782, 'VH-003', '沪B11223', 'BUS', '金龙客车', 23, 9001, '系统管理员', 'IDLE', 9001, CURRENT_TIMESTAMP);

INSERT INTO oa_mobile_config (id, config_type, config_key, config_name, config_value, icon, sort_no, config_status, remark, created_by, created_at) VALUES
(7790, 'MENU', 'MOBILE_TODO', '我的待办', '/oa/tasks', 'CarryOutOutlined', 1, 'ENABLED', '移动工作台入口', 9001, CURRENT_TIMESTAMP),
(7791, 'MENU', 'MOBILE_APPROVAL', '审批查询', '/oa/approvals', 'AuditOutlined', 2, 'ENABLED', '移动工作台入口', 9001, CURRENT_TIMESTAMP),
(7792, 'MENU', 'MOBILE_MAIL', '内部邮件', '/oa/mail', 'MailOutlined', 3, 'ENABLED', '移动工作台入口', 9001, CURRENT_TIMESTAMP),
(7793, 'MENU', 'MOBILE_DOCUMENT', '文档中心', '/oa/documents', 'FolderOpenOutlined', 4, 'ENABLED', '移动工作台入口', 9001, CURRENT_TIMESTAMP),
(7794, 'MENU', 'MOBILE_NOTIFICATION', '消息通知', '/oa/notifications', 'BellOutlined', 5, 'ENABLED', '移动工作台入口', 9001, CURRENT_TIMESTAMP),
(7795, 'POLICY', 'MOBILE_SESSION_TIMEOUT', '移动端会话超时（分钟）', '30', NULL, 1, 'ENABLED', '移动端安全策略', 9001, CURRENT_TIMESTAMP),
(7796, 'POLICY', 'MOBILE_MAX_DEVICE', '单账号最大设备数', '3', NULL, 2, 'ENABLED', '移动端安全策略，待业务方确认', 9001, CURRENT_TIMESTAMP),
(7797, 'PUSH', 'PUSH_WORKFLOW_TODO', '待办推送', 'true', NULL, 1, 'ENABLED', '推送通道见 IF-OA-07，未接入前仅保留站内消息', 9001, CURRENT_TIMESTAMP);
