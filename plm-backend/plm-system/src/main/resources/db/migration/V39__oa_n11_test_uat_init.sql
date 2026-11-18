-- OA-N11 初始化数据：安全性能测试与用户验收的菜单、按钮权限、角色授权、字典与可配置项
-- 号段避让：菜单 3859-3867、按钮 3868-3885、角色授权 11597-11667、字典 6760-6826、配置 6041-6051。
-- 复用既有字典：oa_biz_flow_status、oa_data_source 等；本节点不新增流程表单（测试与验收为数据与验证型能力）。

-- ========== OA-N11 权限（菜单 3859-3867，按钮 3868-3885） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(3859, 'oa-test-case', '测试用例库', 'menu', 3600, '/oa/test/case', 'ProfileOutlined', 46, 1),
(3860, 'oa-test-permission', '权限测试', 'menu', 3600, '/oa/test/permission', 'SafetyOutlined', 47, 1),
(3861, 'oa-test-security', '安全测试', 'menu', 3600, '/oa/test/security', 'SecurityScanOutlined', 48, 1),
(3862, 'oa-test-perf', '性能测试', 'menu', 3600, '/oa/test/performance', 'ThunderboltOutlined', 49, 1),
(3863, 'oa-test-compat', '兼容测试', 'menu', 3600, '/oa/test/compatibility', 'MobileOutlined', 50, 1),
(3864, 'oa-test-backup', '备份恢复演练', 'menu', 3600, '/oa/test/backup-drill', 'DatabaseOutlined', 51, 1),
(3865, 'oa-test-uat', '用户验收(UAT)', 'menu', 3600, '/oa/test/uat', 'AuditOutlined', 52, 1),
(3866, 'oa-test-training', '培训交付', 'menu', 3600, '/oa/test/training', 'ReadOutlined', 53, 1),
(3867, 'oa-test-cutover', '上线切换预案', 'menu', 3600, '/oa/test/cutover', 'RocketOutlined', 54, 1),
(3868, 'oa:test:case:list', '查询测试用例', 'button', 3859, NULL, NULL, 1, 1),
(3869, 'oa:test:case:manage', '维护测试用例', 'button', 3859, NULL, NULL, 2, 1),
(3870, 'oa:test:permission:list', '查询权限测试', 'button', 3860, NULL, NULL, 1, 1),
(3871, 'oa:test:permission:manage', '维护权限测试', 'button', 3860, NULL, NULL, 2, 1),
(3872, 'oa:test:security:list', '查询安全测试', 'button', 3861, NULL, NULL, 1, 1),
(3873, 'oa:test:security:manage', '维护安全测试', 'button', 3861, NULL, NULL, 2, 1),
(3874, 'oa:test:perf:list', '查询性能测试', 'button', 3862, NULL, NULL, 1, 1),
(3875, 'oa:test:perf:manage', '维护性能测试', 'button', 3862, NULL, NULL, 2, 1),
(3876, 'oa:test:compat:list', '查询兼容测试', 'button', 3863, NULL, NULL, 1, 1),
(3877, 'oa:test:compat:manage', '维护兼容测试', 'button', 3863, NULL, NULL, 2, 1),
(3878, 'oa:test:backup:list', '查询备份恢复演练', 'button', 3864, NULL, NULL, 1, 1),
(3879, 'oa:test:backup:manage', '维护备份恢复演练', 'button', 3864, NULL, NULL, 2, 1),
(3880, 'oa:test:uat:list', '查询UAT记录', 'button', 3865, NULL, NULL, 1, 1),
(3881, 'oa:test:uat:manage', '维护UAT记录', 'button', 3865, NULL, NULL, 2, 1),
(3882, 'oa:test:training:list', '查询培训材料', 'button', 3866, NULL, NULL, 1, 1),
(3883, 'oa:test:training:manage', '维护培训材料', 'button', 3866, NULL, NULL, 2, 1),
(3884, 'oa:test:cutover:list', '查询切换预案', 'button', 3867, NULL, NULL, 1, 1),
(3885, 'oa:test:cutover:manage', '维护切换预案', 'button', 3867, NULL, NULL, 2, 1);

-- 管理员（2001）：授予 OA-N11 全部权限
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11597, 2001, 3859), (11598, 2001, 3860), (11599, 2001, 3861), (11600, 2001, 3862),
(11601, 2001, 3863), (11602, 2001, 3864), (11603, 2001, 3865), (11604, 2001, 3866),
(11605, 2001, 3867), (11606, 2001, 3868), (11607, 2001, 3869), (11608, 2001, 3870),
(11609, 2001, 3871), (11610, 2001, 3872), (11611, 2001, 3873), (11612, 2001, 3874),
(11613, 2001, 3875), (11614, 2001, 3876), (11615, 2001, 3877), (11616, 2001, 3878),
(11617, 2001, 3879), (11618, 2001, 3880), (11619, 2001, 3881), (11620, 2001, 3882),
(11621, 2001, 3883), (11622, 2001, 3884), (11623, 2001, 3885);

-- 研发工程师（2002）：用例、安全、性能、兼容与培训只读
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11624, 2002, 3859), (11625, 2002, 3861), (11626, 2002, 3862), (11627, 2002, 3863),
(11628, 2002, 3866), (11629, 2002, 3868), (11630, 2002, 3872), (11631, 2002, 3874),
(11632, 2002, 3876), (11633, 2002, 3882);

-- 质量工程师（2003）：用例、权限、安全与 UAT 只读
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11634, 2003, 3859), (11635, 2003, 3860), (11636, 2003, 3861), (11637, 2003, 3865),
(11638, 2003, 3868), (11639, 2003, 3870), (11640, 2003, 3872), (11641, 2003, 3880);

-- 供应链专员（2004）：用例与 UAT 只读
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11642, 2004, 3859), (11643, 2004, 3865), (11644, 2004, 3868), (11645, 2004, 3880);

-- 生产现场（2005）：用例与培训只读
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11646, 2005, 3859), (11647, 2005, 3866), (11648, 2005, 3868), (11649, 2005, 3882);

-- 只读用户（2006）：全部菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11650, 2006, 3859), (11651, 2006, 3860), (11652, 2006, 3861), (11653, 2006, 3862),
(11654, 2006, 3863), (11655, 2006, 3864), (11656, 2006, 3865), (11657, 2006, 3866),
(11658, 2006, 3867), (11659, 2006, 3868), (11660, 2006, 3870), (11661, 2006, 3872),
(11662, 2006, 3874), (11663, 2006, 3876), (11664, 2006, 3878), (11665, 2006, 3880),
(11666, 2006, 3882), (11667, 2006, 3884);

-- ========== OA-N11 字典 ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(6760, 'oa_test_case_type', '功能测试', 'FUNCTION', 1, 1, NULL),
(6761, 'oa_test_case_type', '回归测试', 'REGRESSION', 2, 1, NULL),
(6762, 'oa_test_priority', 'P0', 'P0', 1, 1, NULL),
(6763, 'oa_test_priority', 'P1', 'P1', 2, 1, NULL),
(6764, 'oa_test_priority', 'P2', 'P2', 3, 1, NULL),
(6765, 'oa_test_exec_status', '未执行', 'NOT_RUN', 1, 1, NULL),
(6766, 'oa_test_exec_status', '通过', 'PASS', 2, 1, NULL),
(6767, 'oa_test_exec_status', '失败', 'FAIL', 3, 1, NULL),
(6768, 'oa_test_exec_status', '阻塞', 'BLOCKED', 4, 1, NULL),
(6769, 'oa_permission_scene_type', '跨部门访问', 'CROSS_DEPT', 1, 1, NULL),
(6770, 'oa_permission_scene_type', '跨工厂访问', 'CROSS_FACTORY', 2, 1, NULL),
(6771, 'oa_permission_scene_type', '离职账号', 'RESIGNED', 3, 1, NULL),
(6772, 'oa_permission_scene_type', '代理审批', 'DELEGATION', 4, 1, NULL),
(6773, 'oa_permission_scene_type', '管理员权限', 'ADMIN', 5, 1, NULL),
(6774, 'oa_permission_scene_type', '外部用户', 'EXTERNAL', 6, 1, NULL),
(6775, 'oa_permission_test_result', '待执行', 'PENDING', 1, 1, NULL),
(6776, 'oa_permission_test_result', '通过', 'PASS', 2, 1, NULL),
(6777, 'oa_permission_test_result', '不通过', 'FAIL', 3, 1, NULL),
(6778, 'oa_security_check_type', '代码扫描', 'CODE_SCAN', 1, 1, NULL),
(6779, 'oa_security_check_type', '依赖扫描', 'DEPENDENCY', 2, 1, NULL),
(6780, 'oa_security_check_type', '渗透测试', 'PENTEST', 3, 1, NULL),
(6781, 'oa_security_check_type', '弱口令检查', 'WEAK_PWD', 4, 1, NULL),
(6782, 'oa_security_check_type', '文件上传检查', 'UPLOAD', 5, 1, NULL),
(6783, 'oa_security_check_type', '会话安全检查', 'SESSION', 6, 1, NULL),
(6784, 'oa_security_severity', '严重', 'CRITICAL', 1, 1, NULL),
(6785, 'oa_security_severity', '高危', 'HIGH', 2, 1, NULL),
(6786, 'oa_security_severity', '中危', 'MEDIUM', 3, 1, NULL),
(6787, 'oa_security_severity', '低危', 'LOW', 4, 1, NULL),
(6788, 'oa_security_fix_status', '待修复', 'OPEN', 1, 1, NULL),
(6789, 'oa_security_fix_status', '已修复', 'FIXED', 2, 1, NULL),
(6790, 'oa_security_fix_status', '风险接受', 'ACCEPTED', 3, 1, '风险接受需业务方与安全责任人共同批准'),
(6791, 'oa_perf_test_result', '待执行', 'PENDING', 1, 1, NULL),
(6792, 'oa_perf_test_result', '达标', 'PASS', 2, 1, NULL),
(6793, 'oa_perf_test_result', '未达标', 'FAIL', 3, 1, NULL),
(6794, 'oa_compat_env_type', '浏览器', 'BROWSER', 1, 1, NULL),
(6795, 'oa_compat_env_type', 'PC 分辨率', 'RESOLUTION', 2, 1, NULL),
(6796, 'oa_compat_env_type', '手机浏览器', 'MOBILE_BROWSER', 3, 1, NULL),
(6797, 'oa_compat_env_type', '移动网络', 'MOBILE_NETWORK', 4, 1, NULL),
(6798, 'oa_compat_test_result', '待测试', 'PENDING', 1, 1, NULL),
(6799, 'oa_compat_test_result', '通过', 'PASS', 2, 1, NULL),
(6800, 'oa_compat_test_result', '部分通过', 'PARTIAL', 3, 1, NULL),
(6801, 'oa_compat_test_result', '不通过', 'FAIL', 4, 1, NULL),
(6802, 'oa_backup_drill_type', '数据库', 'DB', 1, 1, NULL),
(6803, 'oa_backup_drill_type', '对象存储', 'OBJECT_STORAGE', 2, 1, NULL),
(6804, 'oa_backup_drill_type', '配置', 'CONFIG', 3, 1, NULL),
(6805, 'oa_backup_drill_type', '密钥', 'KEY', 4, 1, NULL),
(6806, 'oa_backup_drill_type', '日志', 'LOG', 5, 1, NULL),
(6807, 'oa_backup_restore_result', '待演练', 'PENDING', 1, 1, NULL),
(6808, 'oa_backup_restore_result', '成功', 'SUCCESS', 2, 1, NULL),
(6809, 'oa_backup_restore_result', '部分成功', 'PARTIAL', 3, 1, NULL),
(6810, 'oa_backup_restore_result', '失败', 'FAILED', 4, 1, NULL),
(6811, 'oa_uat_status', '待验收', 'PENDING', 1, 1, NULL),
(6812, 'oa_uat_status', '验收中', 'RUNNING', 2, 1, NULL),
(6813, 'oa_uat_status', '已通过', 'PASSED', 3, 1, NULL),
(6814, 'oa_uat_status', '未通过', 'FAILED', 4, 1, NULL),
(6815, 'oa_training_material_type', '角色培训', 'ROLE_TRAINING', 1, 1, NULL),
(6816, 'oa_training_material_type', '操作手册', 'MANUAL', 2, 1, NULL),
(6817, 'oa_training_material_type', '短视频/图文指引', 'VIDEO', 3, 1, NULL),
(6818, 'oa_training_material_type', '常见问题库', 'FAQ', 4, 1, NULL),
(6819, 'oa_cutover_plan_type', '切换预案', 'CUTOVER', 1, 1, NULL),
(6820, 'oa_cutover_plan_type', '回退预案', 'ROLLBACK', 2, 1, NULL),
(6821, 'oa_cutover_status', '草稿', 'DRAFT', 1, 1, NULL),
(6822, 'oa_cutover_status', '已评审', 'REVIEWED', 2, 1, NULL),
(6823, 'oa_cutover_status', '已批准', 'APPROVED', 3, 1, NULL),
(6824, 'oa_rehearsal_result', '未演练', 'NOT_RUN', 1, 1, NULL),
(6825, 'oa_rehearsal_result', '演练通过', 'PASS', 2, 1, NULL),
(6826, 'oa_rehearsal_result', '演练失败', 'FAIL', 3, 1, NULL);

-- ========== OA-N11 可配置项 ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(6041, 'OA', 'oa.test.regression.enabled', '功能与回归测试集启用', 'true', 0, 1, NULL),
(6042, 'OA', 'oa.test.blocker.defect.threshold', '阻断级缺陷允许数量', '0', 0, 1, '阻断级缺陷须清零后方可进入切换'),
(6043, 'OA', 'oa.security.high.risk.tolerance', '高危及以上漏洞允许数量', '0', 1, 1, '高危/严重问题须清零，容差与例外待业务方确认(OA-DEV-107)'),
(6044, 'OA', 'oa.perf.concurrent.users.target', '性能并发用户目标', '500', 1, 1, '并发目标待双方确认(OA-DEV-108)'),
(6045, 'OA', 'oa.perf.response.ms.target', '性能响应时间目标(ms)', '2000', 1, 1, '响应时间目标待双方确认(OA-DEV-108)'),
(6046, 'OA', 'oa.compat.browsers', '兼容浏览器范围', 'Chrome,Edge,Firefox,Safari', 1, 1, '兼容范围与移动端清单待双方确认(OA-DEV-109)'),
(6047, 'OA', 'oa.backup.rpo.minutes', '备份恢复 RPO(分钟)', '15', 1, 1, 'RPO 目标待业务方确认(OA-DEV-110)'),
(6048, 'OA', 'oa.backup.rto.minutes', '备份恢复 RTO(分钟)', '120', 1, 1, 'RTO 目标待业务方确认(OA-DEV-110)'),
(6049, 'OA', 'oa.uat.pass.rate', 'UAT 通过率门槛(%)', '95', 1, 1, '验收通过率门槛与关闭标准待业务方确认(OA-DEV-111)'),
(6050, 'OA', 'oa.cutover.window', '正式切换窗口', '周六 22:00 至次日 02:00', 1, 1, '切换窗口、数据冻结与值守安排待业务方确认(OA-DEV-113)'),
(6051, 'OA', 'oa.rollback.window.minutes', '回退窗口(分钟)', '120', 1, 1, '回退触发条件、窗口与责任待业务方确认(OA-DEV-113)');
