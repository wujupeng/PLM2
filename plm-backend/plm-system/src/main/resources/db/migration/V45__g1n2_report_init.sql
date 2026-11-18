-- G1-N2 公共平台底座—报表平台（对应总任务书 WBS T010）初始化：
-- 菜单/按钮权限、角色授权、字典与可配置项。
-- 号段基线（V44 之前已占用的最大值）：sys_permission=3953、sys_role_permission=11794、
-- sys_dictionary=6947、sys_config=6065；本脚本从各自之后继续编号，避免主键冲突。

-- ========== 报表平台菜单（3960-3964，挂在平台底座 3920 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(3960, 'platform:report:indicator', '指标口径', 'menu', 3920, '/platform/report/indicators', 'NumberOutlined', 11, 1),
(3961, 'platform:report:dataset', '数据集市', 'menu', 3920, '/platform/report/datasets', 'DatabaseOutlined', 12, 1),
(3962, 'platform:report:definition', '报表定义', 'menu', 3920, '/platform/report/definitions', 'BarChartOutlined', 13, 1),
(3963, 'platform:report:exportlog', '导出审计', 'menu', 3920, '/platform/report/export-logs', 'ExportOutlined', 14, 1),
(3964, 'platform:report:dashboard', '经营驾驶舱', 'menu', 3920, '/platform/report/dashboards', 'FundProjectionScreenOutlined', 15, 1);

-- ========== 报表平台按钮（3970-3979） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(3970, 'platform:report:indicator:list', '查询指标口径', 'button', 3960, NULL, NULL, 1, 1),
(3971, 'platform:report:indicator:manage', '维护指标口径', 'button', 3960, NULL, NULL, 2, 1),
(3972, 'platform:report:dataset:list', '查询数据集', 'button', 3961, NULL, NULL, 1, 1),
(3973, 'platform:report:dataset:manage', '维护数据集', 'button', 3961, NULL, NULL, 2, 1),
(3974, 'platform:report:definition:list', '查询报表定义', 'button', 3962, NULL, NULL, 1, 1),
(3975, 'platform:report:definition:manage', '维护报表定义', 'button', 3962, NULL, NULL, 2, 1),
(3976, 'platform:report:exportlog:list', '查询导出审计', 'button', 3963, NULL, NULL, 1, 1),
(3977, 'platform:report:exportlog:manage', '维护导出审计', 'button', 3963, NULL, NULL, 2, 1),
(3978, 'platform:report:dashboard:list', '查询驾驶舱', 'button', 3964, NULL, NULL, 1, 1),
(3979, 'platform:report:dashboard:manage', '维护驾驶舱', 'button', 3964, NULL, NULL, 2, 1);

-- ========== 角色授权 ==========

-- 管理员（2001）：授予报表平台全部权限
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11800, 2001, 3960), (11801, 2001, 3961), (11802, 2001, 3962), (11803, 2001, 3963), (11804, 2001, 3964),
(11805, 2001, 3970), (11806, 2001, 3971), (11807, 2001, 3972), (11808, 2001, 3973), (11809, 2001, 3974),
(11810, 2001, 3975), (11811, 2001, 3976), (11812, 2001, 3977), (11813, 2001, 3978), (11814, 2001, 3979);

-- 只读用户（2006）：全部菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11815, 2006, 3960), (11816, 2006, 3961), (11817, 2006, 3962), (11818, 2006, 3963), (11819, 2006, 3964),
(11820, 2006, 3970), (11821, 2006, 3972), (11822, 2006, 3974), (11823, 2006, 3976), (11824, 2006, 3978);

-- 研发工程师（2002）、质量工程师（2003）、供应链专员（2004）、生产现场（2005）：指标与报表只读
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11825, 2002, 3960), (11826, 2002, 3962), (11827, 2002, 3964), (11828, 2002, 3970), (11829, 2002, 3974), (11830, 2002, 3978),
(11831, 2003, 3960), (11832, 2003, 3962), (11833, 2003, 3970), (11834, 2003, 3974),
(11835, 2004, 3960), (11836, 2004, 3962), (11837, 2004, 3964), (11838, 2004, 3970), (11839, 2004, 3974), (11840, 2004, 3978),
(11841, 2005, 3960), (11842, 2005, 3962), (11843, 2005, 3970), (11844, 2005, 3974);

-- ========== 报表平台字典（6950-6992） ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(6950, 'report_biz_domain', 'PLM 产品研发', 'PLM', 1, 1, NULL),
(6951, 'report_biz_domain', 'ERP 经营管理', 'ERP', 2, 1, NULL),
(6952, 'report_biz_domain', 'SRM 供应商协同', 'SRM', 3, 1, NULL),
(6953, 'report_biz_domain', 'MES 制造执行', 'MES', 4, 1, NULL),
(6954, 'report_biz_domain', 'WMS 仓储管理', 'WMS', 5, 1, NULL),
(6955, 'report_biz_domain', 'OA 企业协同', 'OA', 6, 1, NULL),
(6956, 'report_indicator_status', '草稿', 'DRAFT', 1, 1, NULL),
(6957, 'report_indicator_status', '已启用', 'ACTIVE', 2, 1, NULL),
(6958, 'report_indicator_status', '已停用', 'DISABLED', 3, 1, NULL),
(6959, 'report_refresh_cycle', '实时', 'REALTIME', 1, 1, NULL),
(6960, 'report_refresh_cycle', '按小时', 'HOURLY', 2, 1, NULL),
(6961, 'report_refresh_cycle', '按天', 'DAILY', 3, 1, NULL),
(6962, 'report_refresh_cycle', '按周', 'WEEKLY', 4, 1, NULL),
(6963, 'report_refresh_cycle', '按月', 'MONTHLY', 5, 1, NULL),
(6964, 'report_source_type', '物理表', 'TABLE', 1, 1, NULL),
(6965, 'report_source_type', '视图', 'VIEW', 2, 1, NULL),
(6966, 'report_source_type', '接口', 'API', 3, 1, NULL),
(6967, 'report_source_type', '自定义 SQL', 'SQL', 4, 1, NULL),
(6968, 'report_refresh_mode', '手动刷新', 'MANUAL', 1, 1, NULL),
(6969, 'report_refresh_mode', '定时刷新', 'SCHEDULED', 2, 1, NULL),
(6970, 'report_refresh_mode', '实时刷新', 'REALTIME', 3, 1, NULL),
(6971, 'report_dataset_status', '草稿', 'DRAFT', 1, 1, NULL),
(6972, 'report_dataset_status', '已启用', 'ACTIVE', 2, 1, NULL),
(6973, 'report_dataset_status', '已停用', 'DISABLED', 3, 1, NULL),
(6974, 'report_chart_type', '明细表', 'TABLE', 1, 1, NULL),
(6975, 'report_chart_type', '柱状图', 'BAR', 2, 1, NULL),
(6976, 'report_chart_type', '折线图', 'LINE', 3, 1, NULL),
(6977, 'report_chart_type', '饼图', 'PIE', 4, 1, NULL),
(6978, 'report_chart_type', '仪表盘', 'GAUGE', 5, 1, NULL),
(6979, 'report_chart_type', '指标卡', 'CARD', 6, 1, NULL),
(6980, 'report_definition_status', '草稿', 'DRAFT', 1, 1, NULL),
(6981, 'report_definition_status', '已发布', 'PUBLISHED', 2, 1, NULL),
(6982, 'report_definition_status', '已停用', 'DISABLED', 3, 1, NULL),
(6983, 'report_export_type', 'Excel', 'EXCEL', 1, 1, NULL),
(6984, 'report_export_type', 'CSV', 'CSV', 2, 1, NULL),
(6985, 'report_export_type', 'PDF', 'PDF', 3, 1, NULL),
(6986, 'report_export_status', '成功', 'SUCCESS', 1, 1, NULL),
(6987, 'report_export_status', '失败', 'FAILED', 2, 1, NULL),
(6988, 'report_layout_mode', '栅格布局', 'GRID', 1, 1, NULL),
(6989, 'report_layout_mode', '自由布局', 'FREE', 2, 1, NULL),
(6990, 'report_dashboard_status', '草稿', 'DRAFT', 1, 1, NULL),
(6991, 'report_dashboard_status', '已发布', 'PUBLISHED', 2, 1, NULL),
(6992, 'report_dashboard_status', '已停用', 'DISABLED', 3, 1, NULL);

-- ========== 报表平台可配置项（6070-6074） ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(6070, 'REPORT', 'report.export.row.limit', '单次导出最大行数', '50000', 1, 1, '待业务方确认导出上限，超限需分片或审批'),
(6071, 'REPORT', 'report.export.audit.enabled', '导出审计开关', 'true', 0, 1, '关闭将无法追溯数据外发，默认必须开启'),
(6072, 'REPORT', 'report.dataset.refresh.default.cron', '数据集默认刷新周期', '0 30 2 * * ?', 1, 1, '待业务方确认刷新窗口，避开业务高峰'),
(6073, 'REPORT', 'report.dashboard.refresh.interval.sec', '驾驶舱默认刷新间隔（秒）', '60', 0, 1, '驾驶舱自动刷新默认值'),
(6074, 'REPORT', 'report.indicator.review.required', '指标口径发布前需审核', 'true', 1, 1, '待业务方确认口径审核流程与责任人');
