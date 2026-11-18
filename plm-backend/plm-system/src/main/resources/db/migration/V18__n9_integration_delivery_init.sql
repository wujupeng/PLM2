-- N9 初始化数据：系统集成、迁移、测试与上线交付的菜单与按钮权限、角色授权、字典、可配置项与联调样例数据
-- 注意：示例数据仅用于联调与验收演示，实施时由业务方通过界面或导入替换。
-- 未明确的性能目标、SLA 时限、RPO/RTO、接口端点等统一落为配置项并标记 pending_confirm=1，待业务方集中确认。

-- ========== N9 权限（菜单 3480-3489，按钮 3490-3534） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(3480, 'int-domain', '集成与交付', 'menu', 0, NULL, 'ApiOutlined', 85, 1),
(3481, 'int-endpoint', '接口配置与监控', 'menu', 3480, '/int/endpoint', 'LinkOutlined', 1, 1),
(3482, 'int-master-data', '主数据同步', 'menu', 3480, '/int/master-data', 'SyncOutlined', 2, 1),
(3483, 'int-qms', 'QMS 质量接口', 'menu', 3480, '/int/qms', 'SafetyCertificateOutlined', 3, 1),
(3484, 'int-migration', '数据迁移', 'menu', 3480, '/int/migration', 'ImportOutlined', 4, 1),
(3485, 'int-export', '数据导出', 'menu', 3480, '/int/export', 'ExportOutlined', 5, 1),
(3486, 'int-test', '测试与性能', 'menu', 3480, '/int/test', 'ExperimentOutlined', 6, 1),
(3487, 'int-security', '安全与备份', 'menu', 3480, '/int/security', 'SafetyOutlined', 7, 1),
(3488, 'int-golive', '上线与交付', 'menu', 3480, '/int/golive', 'RocketOutlined', 8, 1),
(3489, 'int-defect', '缺陷与 SLA', 'menu', 3480, '/int/defect', 'BugOutlined', 9, 1),
(3490, 'int:endpoint:list', '查询接口配置', 'button', 3481, NULL, NULL, 1, 1),
(3491, 'int:endpoint:save', '维护接口配置', 'button', 3481, NULL, NULL, 2, 1),
(3492, 'int:endpoint:delete', '删除接口配置', 'button', 3481, NULL, NULL, 3, 1),
(3493, 'int:log:list', '查询接口日志', 'button', 3481, NULL, NULL, 4, 1),
(3494, 'int:log:retry', '接口失败重试', 'button', 3481, NULL, NULL, 5, 1),
(3495, 'int:log:compensate', '接口异常补偿', 'button', 3481, NULL, NULL, 6, 1),
(3496, 'int:mds:list', '查询主数据同步', 'button', 3482, NULL, NULL, 1, 1),
(3497, 'int:mds:save', '维护主数据同步', 'button', 3482, NULL, NULL, 2, 1),
(3498, 'int:mds:sync', '执行主数据同步', 'button', 3482, NULL, NULL, 3, 1),
(3499, 'int:mds:diff:list', '查询同步差异', 'button', 3482, NULL, NULL, 4, 1),
(3500, 'int:mds:diff:resolve', '处理同步差异', 'button', 3482, NULL, NULL, 5, 1),
(3501, 'int:qms:list', '查询 QMS 记录', 'button', 3483, NULL, NULL, 1, 1),
(3502, 'int:qms:save', '录入 QMS 记录', 'button', 3483, NULL, NULL, 2, 1),
(3503, 'int:qms:receive', '接收 QMS 接口数据', 'button', 3483, NULL, NULL, 3, 1),
(3504, 'int:migration:list', '查询迁移任务', 'button', 3484, NULL, NULL, 1, 1),
(3505, 'int:migration:run', '执行迁移任务', 'button', 3484, NULL, NULL, 2, 1),
(3506, 'int:migration:verify', '迁移结果核对', 'button', 3484, NULL, NULL, 3, 1),
(3507, 'int:migration:exception:list', '查询迁移异常', 'button', 3484, NULL, NULL, 4, 1),
(3508, 'int:migration:exception:handle', '处理迁移异常', 'button', 3484, NULL, NULL, 5, 1),
(3509, 'int:export:list', '查询导出任务', 'button', 3485, NULL, NULL, 1, 1),
(3510, 'int:export:run', '执行导出任务', 'button', 3485, NULL, NULL, 2, 1),
(3511, 'int:test:list', '查询测试用例', 'button', 3486, NULL, NULL, 1, 1),
(3512, 'int:test:save', '维护测试用例', 'button', 3486, NULL, NULL, 2, 1),
(3513, 'int:test:run', '执行测试用例', 'button', 3486, NULL, NULL, 3, 1),
(3514, 'int:perf:list', '查询性能测试', 'button', 3486, NULL, NULL, 4, 1),
(3515, 'int:perf:save', '维护性能测试', 'button', 3486, NULL, NULL, 5, 1),
(3516, 'int:security:list', '查询安全问题', 'button', 3487, NULL, NULL, 1, 1),
(3517, 'int:security:save', '维护安全问题', 'button', 3487, NULL, NULL, 2, 1),
(3518, 'int:security:fix', '安全问题整改', 'button', 3487, NULL, NULL, 3, 1),
(3519, 'int:backup:list', '查询备份记录', 'button', 3487, NULL, NULL, 4, 1),
(3520, 'int:backup:save', '维护备份记录', 'button', 3487, NULL, NULL, 5, 1),
(3521, 'int:backup:verify', '备份恢复验证', 'button', 3487, NULL, NULL, 6, 1),
(3522, 'int:training:list', '查询培训记录', 'button', 3488, NULL, NULL, 1, 1),
(3523, 'int:training:save', '维护培训记录', 'button', 3488, NULL, NULL, 2, 1),
(3524, 'int:golive:list', '查询上线切换', 'button', 3488, NULL, NULL, 3, 1),
(3525, 'int:golive:save', '维护上线切换', 'button', 3488, NULL, NULL, 4, 1),
(3526, 'int:golive:execute', '执行上线切换', 'button', 3488, NULL, NULL, 5, 1),
(3527, 'int:delivery:list', '查询交付物', 'button', 3488, NULL, NULL, 6, 1),
(3528, 'int:delivery:save', '维护交付物', 'button', 3488, NULL, NULL, 7, 1),
(3529, 'int:delivery:verify', '交付物验收', 'button', 3488, NULL, NULL, 8, 1),
(3530, 'int:defect:list', '查询缺陷', 'button', 3489, NULL, NULL, 1, 1),
(3531, 'int:defect:save', '维护缺陷', 'button', 3489, NULL, NULL, 2, 1),
(3532, 'int:defect:assign', '分派缺陷', 'button', 3489, NULL, NULL, 3, 1),
(3533, 'int:defect:close', '关闭缺陷', 'button', 3489, NULL, NULL, 4, 1),
(3534, 'int:defect:escalate', '缺陷升级', 'button', 3489, NULL, NULL, 5, 1);

-- 管理员（2001）：授予 N9 全部权限
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(10200, 2001, 3480), (10201, 2001, 3481), (10202, 2001, 3482), (10203, 2001, 3483), (10204, 2001, 3484),
(10205, 2001, 3485), (10206, 2001, 3486), (10207, 2001, 3487), (10208, 2001, 3488), (10209, 2001, 3489),
(10210, 2001, 3490), (10211, 2001, 3491), (10212, 2001, 3492), (10213, 2001, 3493), (10214, 2001, 3494),
(10215, 2001, 3495), (10216, 2001, 3496), (10217, 2001, 3497), (10218, 2001, 3498), (10219, 2001, 3499),
(10220, 2001, 3500), (10221, 2001, 3501), (10222, 2001, 3502), (10223, 2001, 3503), (10224, 2001, 3504),
(10225, 2001, 3505), (10226, 2001, 3506), (10227, 2001, 3507), (10228, 2001, 3508), (10229, 2001, 3509),
(10230, 2001, 3510), (10231, 2001, 3511), (10232, 2001, 3512), (10233, 2001, 3513), (10234, 2001, 3514),
(10235, 2001, 3515), (10236, 2001, 3516), (10237, 2001, 3517), (10238, 2001, 3518), (10239, 2001, 3519),
(10240, 2001, 3520), (10241, 2001, 3521), (10242, 2001, 3522), (10243, 2001, 3523), (10244, 2001, 3524),
(10245, 2001, 3525), (10246, 2001, 3526), (10247, 2001, 3527), (10248, 2001, 3528), (10249, 2001, 3529),
(10250, 2001, 3530), (10251, 2001, 3531), (10252, 2001, 3532), (10253, 2001, 3533), (10254, 2001, 3534);

-- 只读用户（2006）：全菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(10255, 2006, 3480), (10256, 2006, 3481), (10257, 2006, 3482), (10258, 2006, 3483), (10259, 2006, 3484),
(10260, 2006, 3485), (10261, 2006, 3486), (10262, 2006, 3487), (10263, 2006, 3488), (10264, 2006, 3489),
(10265, 2006, 3490), (10266, 2006, 3493), (10267, 2006, 3496), (10268, 2006, 3499), (10269, 2006, 3501),
(10270, 2006, 3504), (10271, 2006, 3507), (10272, 2006, 3509), (10273, 2006, 3511), (10274, 2006, 3514),
(10275, 2006, 3516), (10276, 2006, 3519), (10277, 2006, 3522), (10278, 2006, 3524), (10279, 2006, 3527),
(10280, 2006, 3530);

-- 质量工程师（2003）：QMS、测试与性能、安全与备份、缺陷与 SLA
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(10281, 2003, 3480), (10282, 2003, 3483), (10283, 2003, 3486), (10284, 2003, 3487), (10285, 2003, 3489),
(10286, 2003, 3501), (10287, 2003, 3502), (10288, 2003, 3503), (10289, 2003, 3511), (10290, 2003, 3512),
(10291, 2003, 3513), (10292, 2003, 3514), (10293, 2003, 3515), (10294, 2003, 3516), (10295, 2003, 3517),
(10296, 2003, 3518), (10297, 2003, 3519), (10298, 2003, 3520), (10299, 2003, 3521), (10300, 2003, 3530),
(10301, 2003, 3531), (10302, 2003, 3532), (10303, 2003, 3533), (10304, 2003, 3534);

-- 供应链专员（2004）：主数据同步、数据迁移、数据导出
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(10305, 2004, 3480), (10306, 2004, 3482), (10307, 2004, 3484), (10308, 2004, 3485),
(10309, 2004, 3496), (10310, 2004, 3497), (10311, 2004, 3498), (10312, 2004, 3499), (10313, 2004, 3500),
(10314, 2004, 3504), (10315, 2004, 3505), (10316, 2004, 3506), (10317, 2004, 3507), (10318, 2004, 3508),
(10319, 2004, 3509), (10320, 2004, 3510);

-- 研发工程师（2002）：主数据同步只读
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(10321, 2002, 3480), (10322, 2002, 3482), (10323, 2002, 3496), (10324, 2002, 3499);

-- 生产现场（2005）：数据导出（只读+执行）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(10325, 2005, 3480), (10326, 2005, 3485), (10327, 2005, 3509), (10328, 2005, 3510);

-- ========== N9 字典 ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(5200, 'int_domain', 'PLM', 'PLM', 1, 1, NULL),
(5201, 'int_domain', 'ERP', 'ERP', 2, 1, NULL),
(5202, 'int_domain', 'MES', 'MES', 3, 1, NULL),
(5203, 'int_domain', 'QMS', 'QMS', 4, 1, NULL),
(5204, 'int_domain', 'EDI', 'EDI', 5, 1, NULL),
(5210, 'int_direction', '入站', 'INBOUND', 1, 1, NULL),
(5211, 'int_direction', '出站', 'OUTBOUND', 2, 1, NULL),
(5220, 'int_protocol', 'REST', 'REST', 1, 1, NULL),
(5221, 'int_protocol', 'SOAP', 'SOAP', 2, 1, NULL),
(5222, 'int_protocol', '文件', 'FILE', 3, 1, NULL),
(5223, 'int_protocol', '消息队列', 'MQ', 4, 1, NULL),
(5230, 'int_endpoint_status', '启用', 'enabled', 1, 1, NULL),
(5231, 'int_endpoint_status', '停用', 'disabled', 2, 1, NULL),
(5240, 'int_result_status', '成功', 'SUCCESS', 1, 1, NULL),
(5241, 'int_result_status', '失败', 'FAILED', 2, 1, NULL),
(5242, 'int_result_status', '重试中', 'RETRYING', 3, 1, NULL),
(5243, 'int_result_status', '已补偿', 'COMPENSATED', 4, 1, NULL),
(5250, 'int_sync_direction', 'PLM→ERP', 'PLM_TO_ERP', 1, 1, NULL),
(5251, 'int_sync_direction', 'ERP→PLM', 'ERP_TO_PLM', 2, 1, NULL),
(5252, 'int_sync_direction', 'PLM→MES', 'PLM_TO_MES', 3, 1, NULL),
(5253, 'int_sync_direction', 'MES→PLM', 'MES_TO_PLM', 4, 1, NULL),
(5260, 'int_sync_status', '待同步', 'PENDING', 1, 1, NULL),
(5261, 'int_sync_status', '已同步', 'SYNCED', 2, 1, NULL),
(5262, 'int_sync_status', '同步失败', 'FAILED', 3, 1, NULL),
(5263, 'int_sync_status', '存在差异', 'DIFF', 4, 1, NULL),
(5270, 'int_diff_type', '取值不一致', 'VALUE_DIFF', 1, 1, NULL),
(5271, 'int_diff_type', '目标端缺失', 'MISSING_IN_TARGET', 2, 1, NULL),
(5272, 'int_diff_type', '源端缺失', 'MISSING_IN_SOURCE', 3, 1, NULL),
(5280, 'int_handle_status', '待处理', 'OPEN', 1, 1, NULL),
(5281, 'int_handle_status', '已处理', 'RESOLVED', 2, 1, NULL),
(5282, 'int_handle_status', '已忽略', 'IGNORED', 3, 1, NULL),
(5290, 'int_qms_record_type', '来料检验', 'INCOMING', 1, 1, NULL),
(5291, 'int_qms_record_type', '过程检验', 'IN_PROCESS', 2, 1, NULL),
(5292, 'int_qms_record_type', '成品检验', 'FINAL', 3, 1, NULL),
(5293, 'int_qms_record_type', '客户投诉', 'COMPLAINT', 4, 1, NULL),
(5294, 'int_qms_record_type', '供应商质量', 'SUPPLIER', 5, 1, NULL),
(5300, 'int_inspection_result', '合格', 'PASS', 1, 1, NULL),
(5301, 'int_inspection_result', '不合格', 'FAIL', 2, 1, NULL),
(5302, 'int_inspection_result', '让步接收', 'CONCESSION', 3, 1, NULL),
(5310, 'int_defect_level', '致命', 'CRITICAL', 1, 1, NULL),
(5311, 'int_defect_level', '严重', 'MAJOR', 2, 1, NULL),
(5312, 'int_defect_level', '轻微', 'MINOR', 3, 1, NULL),
(5320, 'int_migration_status', '待执行', 'PENDING', 1, 1, NULL),
(5321, 'int_migration_status', '执行中', 'RUNNING', 2, 1, NULL),
(5322, 'int_migration_status', '成功', 'SUCCESS', 3, 1, NULL),
(5323, 'int_migration_status', '失败', 'FAILED', 4, 1, NULL),
(5324, 'int_migration_status', '部分成功', 'PARTIAL', 5, 1, NULL),
(5330, 'int_migration_scope', '物料', 'MATERIAL', 1, 1, NULL),
(5331, 'int_migration_scope', 'BOM', 'BOM', 2, 1, NULL),
(5332, 'int_migration_scope', '供应商', 'SUPPLIER', 3, 1, NULL),
(5333, 'int_migration_scope', '产品', 'PRODUCT', 4, 1, NULL),
(5334, 'int_migration_scope', '图文档', 'DOCUMENT', 5, 1, NULL),
(5335, 'int_migration_scope', '追溯数据', 'TRACE', 6, 1, NULL),
(5340, 'int_exception_type', '字段非法', 'FIELD_INVALID', 1, 1, NULL),
(5341, 'int_exception_type', '重复数据', 'DUPLICATE', 2, 1, NULL),
(5342, 'int_exception_type', '引用缺失', 'MISSING_REF', 3, 1, NULL),
(5343, 'int_exception_type', '格式错误', 'FORMAT_ERROR', 4, 1, NULL),
(5350, 'int_export_format', 'CSV', 'CSV', 1, 1, NULL),
(5351, 'int_export_format', 'Excel', 'EXCEL', 2, 1, NULL),
(5352, 'int_export_format', 'JSON', 'JSON', 3, 1, NULL),
(5360, 'int_task_status', '待执行', 'PENDING', 1, 1, NULL),
(5361, 'int_task_status', '执行中', 'RUNNING', 2, 1, NULL),
(5362, 'int_task_status', '成功', 'SUCCESS', 3, 1, NULL),
(5363, 'int_task_status', '失败', 'FAILED', 4, 1, NULL),
(5364, 'int_task_status', '已取消', 'CANCELLED', 5, 1, NULL),
(5370, 'int_export_scope', '主数据', 'MASTER_DATA', 1, 1, NULL),
(5371, 'int_export_scope', 'BOM', 'BOM', 2, 1, NULL),
(5372, 'int_export_scope', '追溯数据', 'TRACE', 3, 1, NULL),
(5373, 'int_export_scope', '附件索引', 'ATTACHMENT', 4, 1, NULL),
(5374, 'int_export_scope', '全量', 'ALL', 5, 1, NULL),
(5380, 'int_case_type', '功能测试', 'FUNCTION', 1, 1, NULL),
(5381, 'int_case_type', '集成测试', 'INTEGRATION', 2, 1, NULL),
(5382, 'int_case_type', '性能测试', 'PERFORMANCE', 3, 1, NULL),
(5383, 'int_case_type', '安全测试', 'SECURITY', 4, 1, NULL),
(5384, 'int_case_type', 'UAT 验收', 'UAT', 5, 1, NULL),
(5390, 'int_run_status', '未执行', 'NOT_RUN', 1, 1, NULL),
(5391, 'int_run_status', '通过', 'PASS', 2, 1, NULL),
(5392, 'int_run_status', '失败', 'FAIL', 3, 1, NULL),
(5393, 'int_run_status', '阻塞', 'BLOCKED', 4, 1, NULL),
(5400, 'int_priority', 'P0', 'P0', 1, 1, NULL),
(5401, 'int_priority', 'P1', 'P1', 2, 1, NULL),
(5402, 'int_priority', 'P2', 'P2', 3, 1, NULL),
(5410, 'int_perf_scenario', 'BOM 展开', 'BOM_EXPLODE', 1, 1, NULL),
(5411, 'int_perf_scenario', '批量导入', 'BATCH_IMPORT', 2, 1, NULL),
(5412, 'int_perf_scenario', '扫码并发', 'SCAN_CONCURRENT', 3, 1, NULL),
(5413, 'int_perf_scenario', 'EDI 峰值', 'EDI_PEAK', 4, 1, NULL),
(5414, 'int_perf_scenario', '追溯查询', 'TRACE_QUERY', 5, 1, NULL),
(5420, 'int_perf_result', '达标', 'PASS', 1, 1, NULL),
(5421, 'int_perf_result', '未达标', 'FAIL', 2, 1, NULL),
(5430, 'int_severity', '高危', 'CRITICAL', 1, 1, NULL),
(5431, 'int_severity', '高', 'HIGH', 2, 1, NULL),
(5432, 'int_severity', '中', 'MEDIUM', 3, 1, NULL),
(5433, 'int_severity', '低', 'LOW', 4, 1, NULL),
(5440, 'int_security_category', '认证授权', 'AUTH', 1, 1, NULL),
(5441, 'int_security_category', '注入攻击', 'INJECTION', 2, 1, NULL),
(5442, 'int_security_category', '敏感数据', 'SENSITIVE_DATA', 3, 1, NULL),
(5443, 'int_security_category', '越权访问', 'PERMISSION', 4, 1, NULL),
(5444, 'int_security_category', '配置安全', 'CONFIG', 5, 1, NULL),
(5450, 'int_issue_status', '待处理', 'OPEN', 1, 1, NULL),
(5451, 'int_issue_status', '整改中', 'FIXING', 2, 1, NULL),
(5452, 'int_issue_status', '已整改', 'FIXED', 3, 1, NULL),
(5453, 'int_issue_status', '已验证', 'VERIFIED', 4, 1, NULL),
(5454, 'int_issue_status', '已关闭', 'CLOSED', 5, 1, NULL),
(5460, 'int_backup_type', '备份', 'BACKUP', 1, 1, NULL),
(5461, 'int_backup_type', '恢复', 'RESTORE', 2, 1, NULL),
(5462, 'int_backup_type', '演练', 'DRILL', 3, 1, NULL),
(5470, 'int_backup_scope', '数据库', 'DB', 1, 1, NULL),
(5471, 'int_backup_scope', '文件', 'FILE', 2, 1, NULL),
(5472, 'int_backup_scope', '全量', 'FULL', 3, 1, NULL),
(5480, 'int_result', '成功', 'SUCCESS', 1, 1, NULL),
(5481, 'int_result', '失败', 'FAILED', 2, 1, NULL),
(5490, 'int_cutover_status', '已计划', 'PLANNED', 1, 1, NULL),
(5491, 'int_cutover_status', '切换中', 'RUNNING', 2, 1, NULL),
(5492, 'int_cutover_status', '切换成功', 'SUCCESS', 3, 1, NULL),
(5493, 'int_cutover_status', '已回退', 'ROLLED_BACK', 4, 1, NULL),
(5500, 'int_delivery_category', '源代码', 'SOURCE_CODE', 1, 1, NULL),
(5501, 'int_delivery_category', '技术文档', 'DOC', 2, 1, NULL),
(5502, 'int_delivery_category', '部署脚本', 'SCRIPT', 3, 1, NULL),
(5503, 'int_delivery_category', '配置清单', 'CONFIG', 4, 1, NULL),
(5510, 'int_delivery_status', '待交付', 'PENDING', 1, 1, NULL),
(5511, 'int_delivery_status', '已交付', 'DELIVERED', 2, 1, NULL),
(5512, 'int_delivery_status', '已验收', 'ACCEPTED', 3, 1, NULL),
(5520, 'int_defect_source', 'UAT', 'UAT', 1, 1, NULL),
(5521, 'int_defect_source', '生产', 'PRODUCTION', 2, 1, NULL),
(5522, 'int_defect_source', '测试', 'TEST', 3, 1, NULL),
(5523, 'int_defect_source', '安全', 'SECURITY', 4, 1, NULL),
(5530, 'int_defect_status', '待处理', 'OPEN', 1, 1, NULL),
(5531, 'int_defect_status', '已分派', 'ASSIGNED', 2, 1, NULL),
(5532, 'int_defect_status', '处理中', 'FIXING', 3, 1, NULL),
(5533, 'int_defect_status', '已修复', 'FIXED', 4, 1, NULL),
(5534, 'int_defect_status', '已验证', 'VERIFIED', 5, 1, NULL),
(5535, 'int_defect_status', '已关闭', 'CLOSED', 6, 1, NULL),
(5540, 'int_interface_status', '已接收', 'RECEIVED', 1, 1, NULL),
(5541, 'int_interface_status', '已处理', 'PROCESSED', 2, 1, NULL),
(5542, 'int_interface_status', '处理失败', 'FAILED', 3, 1, NULL);

-- ========== N9 可配置项：未明确的集成规则、性能目标、SLA 与容灾指标先落默认值，待业务方集中确认 ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(5801, 'INT', 'int.api.timeout.ms', '接口默认超时（毫秒）', '10000', 1, 1, '待业务方确认各接口超时口径'),
(5802, 'INT', 'int.api.retry.max', '接口默认最大重试次数', '3', 1, 1, '待业务方确认重试次数与退避策略'),
(5803, 'INT', 'int.api.idempotent.window.minutes', '接口幂等窗口（分钟）', '1440', 1, 1, '窗口内相同幂等键直接返回首次结果'),
(5804, 'INT', 'int.api.compensate.enabled', '启用接口异常补偿', 'true', 0, 1, NULL),
(5805, 'INT', 'int.mds.sync.mode', '主数据同步方式', 'SCHEDULED', 1, 1, 'REALTIME=实时 / SCHEDULED=定时；待业务方确认'),
(5806, 'INT', 'int.mds.sync.cron', '主数据同步计划', '0 0/30 * * * ?', 1, 1, '定时同步表达式；待业务方确认同步频度'),
(5807, 'INT', 'int.mds.diff.auto.flag', '自动标记主数据差异', 'true', 0, 1, NULL),
(5808, 'INT', 'int.mds.diff.auto.block', '差异是否阻断后续接口', 'false', 1, 1, '待业务方确认差异处置策略'),
(5809, 'INT', 'int.qms.endpoint', 'QMS 质量接口地址（IF-11）', '', 1, 1, '待业务方提供 QMS 接口地址与认证方式'),
(5810, 'INT', 'int.qms.auth.type', 'QMS 接口认证方式', '', 1, 1, '待业务方确认认证方式（token/证书/白名单）'),
(5811, 'INT', 'int.migration.batch.size', '迁移批处理条数', '1000', 0, 1, NULL),
(5812, 'INT', 'int.migration.verify.enabled', '迁移后自动核对', 'true', 0, 1, '迁移后核对数量、关键字段与关系完整性'),
(5813, 'INT', 'int.export.max.records', '单次导出最大记录数', '100000', 1, 1, '待业务方确认单次导出上限'),
(5814, 'INT', 'int.export.include.attachment', '导出是否包含附件', 'false', 1, 1, '待业务方确认退出时附件是否随数据导出'),
(5815, 'INT', 'int.perf.target.rps', '性能目标吞吐（RPS）', '', 1, 1, '待业务方确认各场景目标 RPS'),
(5816, 'INT', 'int.perf.target.p95.ms', '性能目标 P95 响应（毫秒）', '', 1, 1, '待业务方确认各场景目标 P95'),
(5817, 'INT', 'int.perf.scan.concurrent', '扫码并发目标用户数', '', 1, 1, '待业务方确认产线扫码并发规模'),
(5818, 'INT', 'int.security.scan.tool', '安全测试工具与范围', '', 1, 1, '待业务方确认安全基线要求与测试工具'),
(5819, 'INT', 'int.backup.rpo.minutes', '备份 RPO（分钟）', '', 1, 1, '待业务方确认可接受数据丢失窗口'),
(5820, 'INT', 'int.backup.rto.minutes', '恢复 RTO（分钟）', '', 1, 1, '待业务方确认可接受恢复时长'),
(5821, 'INT', 'int.backup.schedule.cron', '备份计划', '0 0 2 * * ?', 1, 1, '待业务方确认备份频度与保留策略'),
(5822, 'INT', 'int.golive.rollback.plan', '上线回退预案说明', '', 1, 1, '待业务方确认上线回退条件与责任人'),
(5823, 'INT', 'int.defect.sla.response.hours.critical', '致命缺陷响应时限（小时）', '2', 1, 1, '待业务方确认 SLA 响应时限'),
(5824, 'INT', 'int.defect.sla.fix.hours.critical', '致命缺陷修复时限（小时）', '24', 1, 1, '待业务方确认 SLA 修复时限'),
(5825, 'INT', 'int.defect.sla.response.hours.major', '严重缺陷响应时限（小时）', '4', 1, 1, '待业务方确认 SLA 响应时限'),
(5826, 'INT', 'int.defect.sla.fix.hours.major', '严重缺陷修复时限（小时）', '72', 1, 1, '待业务方确认 SLA 修复时限'),
(5827, 'INT', 'int.defect.sla.response.hours.minor', '轻微缺陷响应时限（小时）', '8', 1, 1, '待业务方确认 SLA 响应时限'),
(5828, 'INT', 'int.defect.sla.fix.hours.minor', '轻微缺陷修复时限（小时）', '120', 1, 1, '待业务方确认 SLA 修复时限'),
(5829, 'INT', 'int.defect.escalate.hours', '缺陷超时升级阈值（小时）', '24', 1, 1, '超过阈值自动升级；待业务方确认升级路径'),
(5830, 'INT', 'int.warranty.months', '质保运维期（月）', '12', 1, 1, '待业务方确认质保期与运维边界'),
(5831, 'INT', 'int.training.pass.rate.target', '培训通过率目标', '0.9', 1, 1, '待业务方确认培训与考核要求'),
(5832, 'INT', 'int.sample.demo.enabled', '联调样例数据开关', 'true', 1, 1, '仅用于联调演示，实施时删除');

-- ========== N9 联调样例数据：接口配置、接口日志、主数据同步、QMS、迁移、导出、测试、安全、备份、上线与缺陷 ==========

INSERT INTO int_endpoint (id, endpoint_code, endpoint_name, domain, direction, protocol, endpoint_url, auth_type, timeout_ms, retry_max, idempotent_enabled, compensate_enabled, status, remark) VALUES
(11001, 'IF-01-PLM-ERP-MATERIAL', '物料主数据 PLM→ERP', 'ERP', 'OUTBOUND', 'REST', 'http://erp-demo/api/material/sync', 'TOKEN', 10000, 3, 1, 1, 'enabled', '联调样例：物料主数据同步接口（地址待业务方提供）'),
(11002, 'IF-09-PLM-MES-WO', '工单与工艺 PLM→MES', 'MES', 'OUTBOUND', 'REST', 'http://mes-demo/api/workorder/sync', 'TOKEN', 10000, 3, 1, 1, 'enabled', '联调样例：工单与工艺路线下发接口'),
(11003, 'IF-11-QMS-PLM-INSP', '检验结果 QMS→PLM', 'QMS', 'INBOUND', 'REST', 'http://plm/api/int/qms/inspection', 'TOKEN', 10000, 3, 1, 1, 'enabled', '联调样例：检验结果回传接口'),
(11004, 'IF-04-PLM-EDI-ASN', '发货通知 PLM→EDI', 'EDI', 'OUTBOUND', 'REST', 'http://edi-demo/api/asn/send', 'TOKEN', 15000, 5, 1, 1, 'enabled', '联调样例：ASN 856 发送接口');

INSERT INTO int_interface_log (id, log_no, endpoint_code, interface_code, direction, biz_key, idempotent_key, request_body, request_hash, response_body, http_status, result_status, retry_count, retry_max, next_retry_at, compensated, error_message, source_system, target_system, cost_ms, operator, remark) VALUES
(11011, 'IL-2026-0001', 'IF-01-PLM-ERP-MATERIAL', 'MATERIAL_SYNC', 'OUTBOUND', 'M-0001', 'IDEM-M-0001-20261116', '{"materialCode":"M-0001"}', 'HASH-A1', '{"code":200}', 200, 'SUCCESS', 0, 3, NULL, 0, NULL, 'PLM', 'ERP', 320, 'admin', '联调样例：物料同步成功'),
(11012, 'IL-2026-0002', 'IF-09-PLM-MES-WO', 'WO_SYNC', 'OUTBOUND', 'WO-2026-001', 'IDEM-WO-2026-001-20261116', '{"workOrderNo":"WO-2026-001"}', 'HASH-A2', NULL, 500, 'FAILED', 3, 3, TIMESTAMP '2026-11-16 11:00:00', 0, '目标系统超时', 'PLM', 'MES', 10005, 'admin', '联调样例：工单下发失败待重试'),
(11013, 'IL-2026-0003', 'IF-11-QMS-PLM-INSP', 'INSPECTION_RECEIVE', 'INBOUND', 'IR-2026-001', 'IDEM-IR-2026-001-20261116', '{"recordNo":"IR-2026-001"}', 'HASH-A3', '{"code":200}', 200, 'COMPENSATED', 1, 3, NULL, 1, '首次处理失败已补偿', 'QMS', 'PLM', 450, 'admin', '联调样例：检验结果补偿成功');

INSERT INTO int_master_data_sync (id, sync_no, master_type, master_code, master_name, master_version, source_system, target_system, sync_direction, sync_status, source_version, target_version, source_hash, target_hash, diff_flag, last_sync_at, retry_count, remark) VALUES
(11021, 'MDS-2026-0001', 'MATERIAL', 'M-0001', '示例物料 M-0001', 'V1.0', 'PLM', 'ERP', 'PLM_TO_ERP', 'SYNCED', 'V1.0', 'V1.0', 'HASH-M1', 'HASH-M1', 0, TIMESTAMP '2026-11-16 09:00:00', 0, '联调样例：物料已同步且一致'),
(11022, 'MDS-2026-0002', 'BOM', 'BOM-P-1001', '示例产品 P-1001 BOM', 'V1.0', 'PLM', 'ERP', 'PLM_TO_ERP', 'DIFF', 'V1.0', 'V1.0', 'HASH-B1', 'HASH-B2', 1, TIMESTAMP '2026-11-16 09:05:00', 0, '联调样例：BOM 存在版本/字段差异'),
(11023, 'MDS-2026-0003', 'SUPPLIER', 'SUP-A', '示例供应商 SUP-A', 'V1.0', 'PLM', 'ERP', 'PLM_TO_ERP', 'PENDING', 'V1.0', NULL, 'HASH-S1', NULL, 0, NULL, 0, '联调样例：供应商待同步');

INSERT INTO int_master_data_diff (id, sync_no, master_type, master_code, field_name, source_value, target_value, diff_type, handle_status, resolved_by, resolved_at, resolution, remark) VALUES
(11031, 'MDS-2026-0002', 'BOM', 'BOM-P-1001', 'version', 'V1.0', 'V0.9', 'VALUE_DIFF', 'OPEN', NULL, NULL, NULL, '联调样例：BOM 版本不一致待处理'),
(11032, 'MDS-2026-0002', 'BOM', 'BOM-P-1001', 'line_material', 'M-0002', NULL, 'MISSING_IN_TARGET', 'RESOLVED', 'admin', TIMESTAMP '2026-11-16 10:20:00', '已补充目标端子项并重新同步', '联调样例：子项缺失已处理');

INSERT INTO int_qms_record (id, record_no, record_type, source_no, product_code, material_code, batch_no, product_version, inspection_item, result, defect_code, defect_level, disposition, occurred_at, source_system, related_product_code, attachment_url, interface_status, remark) VALUES
(11041, 'QR-2026-0001', 'INCOMING', 'IR-2026-001', NULL, 'M-0001', 'B20261101', 'V1.0', '外观检查', 'PASS', NULL, NULL, '接收', TIMESTAMP '2026-11-16 08:30:00', 'QMS', 'P-1001', NULL, 'RECEIVED', '联调样例：来料检验合格'),
(11042, 'QR-2026-0002', 'IN_PROCESS', 'IR-2026-002', 'P-1001', 'M-0002', 'PB20261113001', 'V1.0', '焊接质量', 'FAIL', 'D-WELD-01', 'MAJOR', '返工', TIMESTAMP '2026-11-16 09:40:00', 'QMS', 'P-1001', NULL, 'PROCESSED', '联调样例：过程检验不合格返工'),
(11043, 'QR-2026-0003', 'FINAL', 'IR-2026-003', 'P-1001', NULL, 'PB20261113001', 'V1.0', '功能测试', 'PASS', NULL, NULL, '放行', TIMESTAMP '2026-11-16 10:10:00', 'QMS', 'P-1001', NULL, 'RECEIVED', '联调样例：成品检验合格');

INSERT INTO int_migration_task (id, task_no, scope, source_system, target_table, source_count, success_count, fail_count, skip_count, task_status, started_at, finished_at, report_path, operator, remark) VALUES
(11051, 'MIG-2026-0001', 'MATERIAL', 'LEGACY-PLM', 'md_material', 1200, 1195, 3, 2, 'PARTIAL', TIMESTAMP '2026-11-16 02:00:00', TIMESTAMP '2026-11-16 02:12:00', '/data/migration/MIG-2026-0001-report.csv', 'admin', '联调样例：历史物料迁移部分成功'),
(11052, 'MIG-2026-0002', 'BOM', 'LEGACY-PLM', 'md_bom', 800, 800, 0, 0, 'SUCCESS', TIMESTAMP '2026-11-16 02:20:00', TIMESTAMP '2026-11-16 02:28:00', '/data/migration/MIG-2026-0002-report.csv', 'admin', '联调样例：历史 BOM 迁移成功');

INSERT INTO int_migration_exception (id, task_no, source_key, exception_type, field_name, reason, raw_data, handle_status, handler, handled_at, remark) VALUES
(11061, 'MIG-2026-0001', 'LEG-M-0007', 'FIELD_INVALID', 'unit', '计量单位为空且无法推导', '{"code":"LEG-M-0007","unit":null}', 'OPEN', NULL, NULL, '联调样例：待人工补录单位'),
(11062, 'MIG-2026-0001', 'LEG-M-0031', 'DUPLICATE', 'material_code', '与已迁移物料编码重复', '{"code":"LEG-M-0031"}', 'RESOLVED', 'admin', TIMESTAMP '2026-11-16 03:00:00', '联调样例：重复数据已合并处理');

INSERT INTO int_export_task (id, task_no, scope, export_format, include_attachment, record_count, file_path, file_size, task_status, requested_by, started_at, finished_at, error_message, remark) VALUES
(11071, 'EXP-2026-0001', 'MASTER_DATA', 'CSV', 0, 1200, '/data/export/EXP-2026-0001.csv', 524288, 'SUCCESS', 'admin', TIMESTAMP '2026-11-16 04:00:00', TIMESTAMP '2026-11-16 04:02:00', NULL, '联调样例：主数据导出成功'),
(11072, 'EXP-2026-0002', 'TRACE', 'EXCEL', 1, 5600, '/data/export/EXP-2026-0002.xlsx', 2097152, 'SUCCESS', 'admin', TIMESTAMP '2026-11-16 04:10:00', TIMESTAMP '2026-11-16 04:15:00', NULL, '联调样例：追溯数据含附件索引导出成功');

INSERT INTO int_test_case (id, case_no, case_type, related_node, title, precondition, steps, expected, priority, run_status, run_result, run_at, runner, defect_no, remark) VALUES
(11081, 'TC-2026-0001', 'INTEGRATION', 'N9', '主数据 PLM→ERP 同步一致性', '接口配置已启用、ERP 可达', '1.维护物料主数据；2.触发同步；3.核对目标端数据', '目标端数据与源端一致且无差异标记', 'P0', 'PASS', '同步后数据一致', TIMESTAMP '2026-11-16 05:00:00', 'admin', NULL, '联调样例：集成用例通过'),
(11082, 'TC-2026-0002', 'FUNCTION', 'N9', '接口失败重试与幂等', '存在失败接口日志', '1.对失败日志执行重试；2.重复提交相同幂等键', '重试成功且重复提交返回首次结果', 'P0', 'PASS', '幂等生效', TIMESTAMP '2026-11-16 05:10:00', 'admin', NULL, '联调样例：幂等与重试用例通过'),
(11083, 'TC-2026-0003', 'UAT', 'N9', 'UAT-13 数据导出与恢复', '已完成导出与备份', '1.导出主数据与追溯数据；2.备份；3.恢复到测试库；4.校验', '导出完整可读、恢复后关键数据可访问', 'P0', 'NOT_RUN', NULL, NULL, NULL, NULL, '联调样例：待 UAT 执行');

INSERT INTO int_perf_test (id, test_no, scenario, target_rps, target_p95_ms, actual_rps, actual_p95_ms, concurrency, duration_sec, result, test_at, report_path, remark) VALUES
(11091, 'PT-2026-0001', 'BOM_EXPLODE', 50.0000, 2000.0000, 62.0000, 1450.0000, 50, 300, 'PASS', TIMESTAMP '2026-11-16 06:00:00', '/data/perf/PT-2026-0001.html', '联调样例：BOM 展开达标（目标待业务方确认）'),
(11092, 'PT-2026-0002', 'SCAN_CONCURRENT', 100.0000, 500.0000, 120.0000, 380.0000, 100, 300, 'PASS', TIMESTAMP '2026-11-16 06:20:00', '/data/perf/PT-2026-0002.html', '联调样例：扫码并发达标（目标待业务方确认）');

INSERT INTO int_security_issue (id, issue_no, category, severity, title, detail, discovered_by, discovered_at, status, fix_plan, fixed_at, verifier, verified_at, remark) VALUES
(11101, 'SEC-2026-0001', 'SENSITIVE_DATA', 'HIGH', '导出文件包含敏感字段', '导出未脱敏包含供应商联系方式', 'admin', TIMESTAMP '2026-11-16 07:00:00', 'FIXED', '按角色脱敏并在导出说明中标注', TIMESTAMP '2026-11-16 07:40:00', NULL, NULL, '联调样例：高危问题已整改待验证'),
(11102, 'SEC-2026-0002', 'PERMISSION', 'MEDIUM', '低权限账号可访问接口日志', '只读角色可见接口请求体', 'admin', TIMESTAMP '2026-11-16 07:10:00', 'OPEN', NULL, NULL, NULL, NULL, '联调样例：越权问题待整改');

INSERT INTO int_backup_record (id, record_no, record_type, scope, backup_at, size_mb, target_path, rpo_minutes, rto_minutes, elapsed_minutes, result_status, verified, operator, remark) VALUES
(11111, 'BKP-2026-0001', 'BACKUP', 'FULL', TIMESTAMP '2026-11-16 02:00:00', 2048.0000, '/backup/full/20261116', 60, 240, 12, 'SUCCESS', 1, 'admin', '联调样例：全量备份成功（RPO/RTO 目标待业务方确认）'),
(11112, 'BKP-2026-0002', 'DRILL', 'FULL', TIMESTAMP '2026-11-16 03:00:00', 2048.0000, '/backup/restore-drill/20261116', 60, 240, 35, 'SUCCESS', 1, 'admin', '联调样例：恢复到测试环境演练成功');

INSERT INTO int_training_record (id, training_no, role_code, title, trainer, trainee_count, passed_count, trained_at, material_url, pass_rate, remark) VALUES
(11121, 'TRN-2026-0001', 'ENGINEER', '研发工程师 PLM 操作培训', 'admin', 20, 19, TIMESTAMP '2026-11-16 08:00:00', '/doc/training/engineer.pdf', 0.9500, '联调样例：研发角色培训'),
(11122, 'TRN-2026-0002', 'SUPPLY', '供应链与 EDI 协同培训', 'admin', 15, 14, TIMESTAMP '2026-11-16 08:30:00', '/doc/training/supply.pdf', 0.9333, '联调样例：供应链角色培训');

INSERT INTO int_golive_record (id, golive_no, plan_name, scope, planned_at, actual_at, cutover_status, rollback_plan, rollback_at, owner, remark) VALUES
(11131, 'GO-2026-0001', '生产一体化系统上线切换方案', '研发、供应链、生产、质量追溯全模块', TIMESTAMP '2026-11-20 22:00:00', NULL, 'PLANNED', '切换失败时回退至原系统并保留切换前数据快照（回退预案待业务方确认）', NULL, 'admin', '联调样例：上线切换计划');

INSERT INTO int_delivery_item (id, item_no, category, name, item_version, file_path, checksum, delivered_at, status, verifier, remark) VALUES
(11141, 'DLV-2026-0001', 'SOURCE_CODE', 'PLM 一体化系统源代码', 'V1.0.0', '/delivery/source/plm-v1.0.0.zip', 'SHA256-DEMO-001', TIMESTAMP '2026-11-16 09:00:00', 'DELIVERED', NULL, '联调样例：源代码交付包'),
(11142, 'DLV-2026-0002', 'DOC', '系统设计与运维手册', 'V1.0.0', '/delivery/doc/plm-manual-v1.0.0.pdf', 'SHA256-DEMO-002', TIMESTAMP '2026-11-16 09:10:00', 'DELIVERED', NULL, '联调样例：技术文档交付'),
(11143, 'DLV-2026-0003', 'SCRIPT', '部署与初始化脚本', 'V1.0.0', '/delivery/script/deploy-v1.0.0.sh', 'SHA256-DEMO-003', NULL, 'PENDING', NULL, '联调样例：部署脚本待交付');

INSERT INTO int_defect (id, defect_no, source, severity, title, detail, module, found_at, sla_response_hours, sla_fix_hours, response_at, fixed_at, verified_at, status, escalation_level, assignee, sla_breached, remark) VALUES
(11151, 'DEF-2026-0001', 'UAT', 'CRITICAL', 'UAT 导出中断', '大数量导出过程中服务中断', '数据导出', TIMESTAMP '2026-11-16 10:00:00', 2, 24, TIMESTAMP '2026-11-16 10:30:00', NULL, NULL, 'FIXING', 0, 'admin', 0, '联调样例：致命缺陷处理中（SLA 待业务方确认）'),
(11152, 'DEF-2026-0002', 'UAT', 'MAJOR', '接口日志筛选条件失效', '按业务键筛选无结果', '接口监控', TIMESTAMP '2026-11-16 10:15:00', 4, 72, TIMESTAMP '2026-11-16 11:00:00', TIMESTAMP '2026-11-16 12:00:00', TIMESTAMP '2026-11-16 13:00:00', 'VERIFIED', 0, 'admin', 0, '联调样例：严重缺陷已修复并验证'),
(11153, 'DEF-2026-0003', 'TEST', 'MINOR', '导出文件名缺时间戳', '导出文件命名不规范', '数据导出', TIMESTAMP '2026-11-16 10:40:00', 8, 120, NULL, NULL, NULL, 'OPEN', 0, NULL, 0, '联调样例：轻微缺陷待处理');
