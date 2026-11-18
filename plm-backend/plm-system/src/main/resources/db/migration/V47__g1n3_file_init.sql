-- G1-N3 公共平台底座—统一文件服务（对应总任务书 WBS T011）初始化：
-- 菜单/按钮权限、角色授权、字典与可配置项。
-- 号段基线（V46 之前已占用的最大值）：sys_permission=3979、sys_role_permission=11844、
-- sys_dictionary=6992、sys_config=6074；本脚本从各自之后继续编号，避免主键冲突。
-- 菜单继续挂在「平台底座」（parent_id=3920）下，与集成平台（sort 1-7）、报表平台（sort 11-15）并列。

-- ========== 统一文件服务菜单（3980-3984，挂在平台底座 3920 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(3980, 'platform:file:attachment', '统一附件', 'menu', 3920, '/platform/file/attachments', 'PaperClipOutlined', 21, 1),
(3981, 'platform:file:version', '文件版本', 'menu', 3920, '/platform/file/versions', 'HistoryOutlined', 22, 1),
(3982, 'platform:file:preview', '预览转换', 'menu', 3920, '/platform/file/preview-tasks', 'FileSearchOutlined', 23, 1),
(3983, 'platform:file:scan', '病毒扫描', 'menu', 3920, '/platform/file/scan-records', 'SafetyOutlined', 24, 1),
(3984, 'platform:file:archive', '归档管理', 'menu', 3920, '/platform/file/archives', 'InboxOutlined', 25, 1);

-- ========== 统一文件服务按钮（3990-3999） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(3990, 'platform:file:attachment:list', '查询统一附件', 'button', 3980, NULL, NULL, 1, 1),
(3991, 'platform:file:attachment:manage', '维护统一附件', 'button', 3980, NULL, NULL, 2, 1),
(3992, 'platform:file:version:list', '查询文件版本', 'button', 3981, NULL, NULL, 1, 1),
(3993, 'platform:file:version:manage', '维护文件版本', 'button', 3981, NULL, NULL, 2, 1),
(3994, 'platform:file:preview:list', '查询预览任务', 'button', 3982, NULL, NULL, 1, 1),
(3995, 'platform:file:preview:manage', '维护预览任务', 'button', 3982, NULL, NULL, 2, 1),
(3996, 'platform:file:scan:list', '查询扫描记录', 'button', 3983, NULL, NULL, 1, 1),
(3997, 'platform:file:scan:manage', '维护扫描记录', 'button', 3983, NULL, NULL, 2, 1),
(3998, 'platform:file:archive:list', '查询归档记录', 'button', 3984, NULL, NULL, 1, 1),
(3999, 'platform:file:archive:manage', '维护归档记录', 'button', 3984, NULL, NULL, 2, 1);

-- ========== 角色授权 ==========

-- 管理员（2001）：授予统一文件服务全部权限
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11850, 2001, 3980), (11851, 2001, 3981), (11852, 2001, 3982), (11853, 2001, 3983), (11854, 2001, 3984),
(11855, 2001, 3990), (11856, 2001, 3991), (11857, 2001, 3992), (11858, 2001, 3993), (11859, 2001, 3994),
(11860, 2001, 3995), (11861, 2001, 3996), (11862, 2001, 3997), (11863, 2001, 3998), (11864, 2001, 3999);

-- 只读用户（2006）：全部菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11865, 2006, 3980), (11866, 2006, 3981), (11867, 2006, 3982), (11868, 2006, 3983), (11869, 2006, 3984),
(11870, 2006, 3990), (11871, 2006, 3992), (11872, 2006, 3994), (11873, 2006, 3996), (11874, 2006, 3998);

-- 研发工程师（2002）：附件、版本、预览只读
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11875, 2002, 3980), (11876, 2002, 3981), (11877, 2002, 3982),
(11878, 2002, 3990), (11879, 2002, 3992), (11880, 2002, 3994);

-- 质量工程师（2003）：附件、病毒扫描只读
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11881, 2003, 3980), (11882, 2003, 3983),
(11883, 2003, 3990), (11884, 2003, 3996);

-- 供应链专员（2004）：附件、归档只读
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11885, 2004, 3980), (11886, 2004, 3984),
(11887, 2004, 3990), (11888, 2004, 3998);

-- 生产现场（2005）：附件、预览只读
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11889, 2005, 3980), (11890, 2005, 3982),
(11891, 2005, 3990), (11892, 2005, 3994);

-- ========== 统一文件服务字典（7000-7052） ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(7000, 'file_biz_module', 'PLM 产品研发', 'PLM', 1, 1, NULL),
(7001, 'file_biz_module', 'ERP 经营管理', 'ERP', 2, 1, NULL),
(7002, 'file_biz_module', 'SRM 供应商协同', 'SRM', 3, 1, NULL),
(7003, 'file_biz_module', 'MES 制造执行', 'MES', 4, 1, NULL),
(7004, 'file_biz_module', 'WMS 仓储管理', 'WMS', 5, 1, NULL),
(7005, 'file_biz_module', 'OA 企业协同', 'OA', 6, 1, NULL),
(7006, 'file_storage_type', '对象存储', 'OBJECT', 1, 1, NULL),
(7007, 'file_storage_type', '本地存储', 'LOCAL', 2, 1, NULL),
(7008, 'file_security_level', '公开', 'PUBLIC', 1, 1, NULL),
(7009, 'file_security_level', '内部', 'INTERNAL', 2, 1, NULL),
(7010, 'file_security_level', '机密', 'CONFIDENTIAL', 3, 1, NULL),
(7011, 'file_security_level', '绝密', 'SECRET', 4, 1, NULL),
(7012, 'file_scan_status', '待扫描', 'PENDING', 1, 1, NULL),
(7013, 'file_scan_status', '安全', 'CLEAN', 2, 1, NULL),
(7014, 'file_scan_status', '已感染', 'INFECTED', 3, 1, NULL),
(7015, 'file_scan_status', '扫描异常', 'ERROR', 4, 1, NULL),
(7016, 'file_status', '正常', 'NORMAL', 1, 1, NULL),
(7017, 'file_status', '隔离', 'QUARANTINED', 2, 1, NULL),
(7018, 'file_status', '已归档', 'ARCHIVED', 3, 1, NULL),
(7019, 'file_status', '已删除', 'DELETED', 4, 1, NULL),
(7020, 'file_version_status', '当前版本', 'ACTIVE', 1, 1, NULL),
(7021, 'file_version_status', '历史版本', 'HISTORY', 2, 1, NULL),
(7022, 'file_convert_mode', 'Office 转换', 'OFFICE', 1, 1, NULL),
(7023, 'file_convert_mode', 'CAD 转换', 'CAD', 2, 1, NULL),
(7024, 'file_convert_mode', 'PDF 处理', 'PDF', 3, 1, NULL),
(7025, 'file_convert_mode', '图片处理', 'IMAGE', 4, 1, NULL),
(7026, 'file_preview_format', 'PDF', 'PDF', 1, 1, NULL),
(7027, 'file_preview_format', '图片', 'IMAGE', 2, 1, NULL),
(7028, 'file_preview_format', 'HTML', 'HTML', 3, 1, NULL),
(7029, 'file_task_status', '待处理', 'PENDING', 1, 1, NULL),
(7030, 'file_task_status', '处理中', 'PROCESSING', 2, 1, NULL),
(7031, 'file_task_status', '成功', 'SUCCESS', 3, 1, NULL),
(7032, 'file_task_status', '失败', 'FAILED', 4, 1, NULL),
(7033, 'file_scan_result', '安全', 'CLEAN', 1, 1, NULL),
(7034, 'file_scan_result', '已感染', 'INFECTED', 2, 1, NULL),
(7035, 'file_scan_result', '扫描异常', 'ERROR', 3, 1, NULL),
(7036, 'file_scan_action', '放行', 'PASS', 1, 1, NULL),
(7037, 'file_scan_action', '隔离', 'QUARANTINE', 2, 1, NULL),
(7038, 'file_scan_action', '删除', 'DELETE', 3, 1, NULL),
(7039, 'file_archive_type', '热归档', 'HOT', 1, 1, NULL),
(7040, 'file_archive_type', '冷归档', 'COLD', 2, 1, NULL),
(7041, 'file_archive_type', '永久保留', 'PERMANENT', 3, 1, NULL),
(7042, 'file_storage_class', '标准存储', 'STANDARD', 1, 1, NULL),
(7043, 'file_storage_class', '低频访问', 'IA', 2, 1, NULL),
(7044, 'file_storage_class', '归档存储', 'ARCHIVE', 3, 1, NULL),
(7045, 'file_archive_status', '待归档', 'PENDING', 1, 1, NULL),
(7046, 'file_archive_status', '已归档', 'ARCHIVED', 2, 1, NULL),
(7047, 'file_archive_status', '恢复中', 'RESTORING', 3, 1, NULL),
(7048, 'file_archive_status', '已恢复', 'RESTORED', 4, 1, NULL),
(7049, 'file_archive_status', '已过期', 'EXPIRED', 5, 1, NULL),
(7050, 'file_restore_status', '未恢复', 'NONE', 1, 1, NULL),
(7051, 'file_restore_status', '已申请', 'REQUESTED', 2, 1, NULL),
(7052, 'file_restore_status', '已完成', 'DONE', 3, 1, NULL);

-- ========== 统一文件服务可配置项（6080-6084） ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(6080, 'FILE', 'file.upload.max.size.mb', '单文件最大上传大小（MB）', '200', 1, 1, '待业务方确认各类附件大小上限，CAD 图纸可能超限需单独放开'),
(6081, 'FILE', 'file.upload.allowed.ext', '允许上传的文件扩展名', 'pdf,doc,docx,xls,xlsx,ppt,pptx,dwg,dxf,step,stp,iges,igs,zip,rar,png,jpg,jpeg', 1, 1, '待业务方确认白名单，未列入的扩展名一律拒绝上传'),
(6082, 'FILE', 'file.scan.enabled', '上传后病毒扫描开关', 'true', 0, 1, '关闭将导致带毒文件可被下载，默认必须开启'),
(6083, 'FILE', 'file.preview.enabled', '预览转换开关', 'true', 0, 1, '关闭后仅提供下载，不生成在线预览'),
(6084, 'FILE', 'file.archive.retention.years', '默认归档保留年限', '10', 1, 1, '待业务方按行业与合规要求确认保留年限');
