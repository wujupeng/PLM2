-- OA-N12 初始化数据：正式切换与现有OA退役的菜单、按钮权限、角色授权、字典与可配置项
-- 号段避让：菜单 3886-3893、按钮 3894-3909、角色授权 11668-11729、字典 6827-6887、配置 6052-6058。
-- 复用既有配置：oa.rollback.window.minutes（OA-N11 已定义，本节点回退决策复用）。

-- ========== OA-N12 权限（菜单 3886-3893，按钮 3894-3909） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(3886, 'oa-golive-freeze', '切换冻结管理', 'menu', 3600, '/oa/golive/freeze', 'PauseCircleOutlined', 55, 1),
(3887, 'oa-golive-migration', '最终数据迁移', 'menu', 3600, '/oa/golive/final-migration', 'CloudUploadOutlined', 56, 1),
(3888, 'oa-golive-entry', '入口与身份切换', 'menu', 3600, '/oa/golive/entry-switch', 'SwapOutlined', 57, 1),
(3889, 'oa-golive-watch', '上线值守', 'menu', 3600, '/oa/golive/watch', 'AlertOutlined', 58, 1),
(3890, 'oa-golive-rollback', '回退决策', 'menu', 3600, '/oa/golive/rollback', 'RollbackOutlined', 59, 1),
(3891, 'oa-golive-archive', '旧系统只读封存', 'menu', 3600, '/oa/golive/legacy-archive', 'InboxOutlined', 60, 1),
(3892, 'oa-golive-decommission', '资源回收', 'menu', 3600, '/oa/golive/decommission', 'ClearOutlined', 61, 1),
(3893, 'oa-golive-handover', '运维交接', 'menu', 3600, '/oa/golive/handover', 'SolutionOutlined', 62, 1),
(3894, 'oa:golive:freeze:list', '查询切换冻结', 'button', 3886, NULL, NULL, 1, 1),
(3895, 'oa:golive:freeze:manage', '维护切换冻结', 'button', 3886, NULL, NULL, 2, 1),
(3896, 'oa:golive:migration:list', '查询最终数据迁移', 'button', 3887, NULL, NULL, 1, 1),
(3897, 'oa:golive:migration:manage', '维护最终数据迁移', 'button', 3887, NULL, NULL, 2, 1),
(3898, 'oa:golive:entry:list', '查询入口与身份切换', 'button', 3888, NULL, NULL, 1, 1),
(3899, 'oa:golive:entry:manage', '维护入口与身份切换', 'button', 3888, NULL, NULL, 2, 1),
(3900, 'oa:golive:watch:list', '查询上线值守', 'button', 3889, NULL, NULL, 1, 1),
(3901, 'oa:golive:watch:manage', '维护上线值守', 'button', 3889, NULL, NULL, 2, 1),
(3902, 'oa:golive:rollback:list', '查询回退决策', 'button', 3890, NULL, NULL, 1, 1),
(3903, 'oa:golive:rollback:manage', '维护回退决策', 'button', 3890, NULL, NULL, 2, 1),
(3904, 'oa:golive:archive:list', '查询旧系统封存', 'button', 3891, NULL, NULL, 1, 1),
(3905, 'oa:golive:archive:manage', '维护旧系统封存', 'button', 3891, NULL, NULL, 2, 1),
(3906, 'oa:golive:decommission:list', '查询资源回收', 'button', 3892, NULL, NULL, 1, 1),
(3907, 'oa:golive:decommission:manage', '维护资源回收', 'button', 3892, NULL, NULL, 2, 1),
(3908, 'oa:golive:handover:list', '查询运维交接', 'button', 3893, NULL, NULL, 1, 1),
(3909, 'oa:golive:handover:manage', '维护运维交接', 'button', 3893, NULL, NULL, 2, 1);

-- 管理员（2001）：授予 OA-N12 全部权限
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11668, 2001, 3886), (11669, 2001, 3887), (11670, 2001, 3888), (11671, 2001, 3889),
(11672, 2001, 3890), (11673, 2001, 3891), (11674, 2001, 3892), (11675, 2001, 3893),
(11676, 2001, 3894), (11677, 2001, 3895), (11678, 2001, 3896), (11679, 2001, 3897),
(11680, 2001, 3898), (11681, 2001, 3899), (11682, 2001, 3900), (11683, 2001, 3901),
(11684, 2001, 3902), (11685, 2001, 3903), (11686, 2001, 3904), (11687, 2001, 3905),
(11688, 2001, 3906), (11689, 2001, 3907), (11690, 2001, 3908), (11691, 2001, 3909);

-- 研发工程师（2002）：冻结、最终迁移、入口切换与运维交接只读
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11692, 2002, 3886), (11693, 2002, 3887), (11694, 2002, 3888), (11695, 2002, 3893),
(11696, 2002, 3894), (11697, 2002, 3896), (11698, 2002, 3898), (11699, 2002, 3908);

-- 质量工程师（2003）：最终迁移、回退决策与旧系统封存只读
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11700, 2003, 3887), (11701, 2003, 3890), (11702, 2003, 3891),
(11703, 2003, 3896), (11704, 2003, 3902), (11705, 2003, 3904);

-- 供应链专员（2004）：最终迁移与入口切换只读
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11706, 2004, 3887), (11707, 2004, 3888), (11708, 2004, 3896), (11709, 2004, 3898);

-- 生产现场（2005）：上线值守与运维交接只读
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11710, 2005, 3889), (11711, 2005, 3893), (11712, 2005, 3900), (11713, 2005, 3908);

-- 只读用户（2006）：全部菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11714, 2006, 3886), (11715, 2006, 3887), (11716, 2006, 3888), (11717, 2006, 3889),
(11718, 2006, 3890), (11719, 2006, 3891), (11720, 2006, 3892), (11721, 2006, 3893),
(11722, 2006, 3894), (11723, 2006, 3896), (11724, 2006, 3898), (11725, 2006, 3900),
(11726, 2006, 3902), (11727, 2006, 3904), (11728, 2006, 3906), (11729, 2006, 3908);

-- ========== OA-N12 字典 ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(6827, 'oa_golive_freeze_type', '流程发起冻结', 'FLOW', 1, 1, NULL),
(6828, 'oa_golive_freeze_type', '文档写入冻结', 'DOC', 2, 1, NULL),
(6829, 'oa_golive_freeze_type', '邮件变更冻结', 'MAIL', 3, 1, NULL),
(6830, 'oa_golive_freeze_type', '全部冻结', 'ALL', 4, 1, NULL),
(6831, 'oa_golive_freeze_status', '待冻结', 'PENDING', 1, 1, NULL),
(6832, 'oa_golive_freeze_status', '冻结中', 'ACTIVE', 2, 1, NULL),
(6833, 'oa_golive_freeze_status', '已解除', 'RELEASED', 3, 1, NULL),
(6834, 'oa_golive_mig_type', '全量迁移', 'FULL', 1, 1, NULL),
(6835, 'oa_golive_mig_type', '增量迁移', 'INCREMENT', 2, 1, NULL),
(6836, 'oa_golive_mig_status', '待执行', 'PENDING', 1, 1, NULL),
(6837, 'oa_golive_mig_status', '执行中', 'RUNNING', 2, 1, NULL),
(6838, 'oa_golive_mig_status', '成功', 'SUCCESS', 3, 1, NULL),
(6839, 'oa_golive_mig_status', '部分成功', 'PARTIAL', 4, 1, NULL),
(6840, 'oa_golive_mig_status', '失败', 'FAILED', 5, 1, NULL),
(6841, 'oa_golive_verify_status', '待核对', 'PENDING', 1, 1, NULL),
(6842, 'oa_golive_verify_status', '核对通过', 'VERIFIED', 2, 1, NULL),
(6843, 'oa_golive_verify_status', '存在差异', 'EXCEPTION', 3, 1, NULL),
(6844, 'oa_golive_entry_type', '门户入口', 'PORTAL', 1, 1, NULL),
(6845, 'oa_golive_entry_type', '域名解析', 'DNS', 2, 1, NULL),
(6846, 'oa_golive_entry_type', '反向代理', 'PROXY', 3, 1, NULL),
(6847, 'oa_golive_entry_type', '统一身份(SSO)', 'SSO', 4, 1, NULL),
(6848, 'oa_golive_entry_type', '移动端入口', 'MOBILE', 5, 1, NULL),
(6849, 'oa_golive_entry_status', '待切换', 'PENDING', 1, 1, NULL),
(6850, 'oa_golive_entry_status', '已切换', 'DONE', 2, 1, NULL),
(6851, 'oa_golive_entry_status', '已回退', 'ROLLBACK', 3, 1, NULL),
(6852, 'oa_golive_duty_role', '业务值守', 'BUSINESS', 1, 1, NULL),
(6853, 'oa_golive_duty_role', '技术值守', 'TECH', 2, 1, NULL),
(6854, 'oa_golive_duty_role', '数据值守', 'DATA', 3, 1, NULL),
(6855, 'oa_golive_duty_role', '安全值守', 'SECURITY', 4, 1, NULL),
(6856, 'oa_golive_watch_status', '值守中', 'PENDING', 1, 1, NULL),
(6857, 'oa_golive_watch_status', '已归档', 'CLOSED', 2, 1, NULL),
(6858, 'oa_golive_rollback_type', '回退决策', 'DECISION', 1, 1, NULL),
(6859, 'oa_golive_rollback_type', '回退演练', 'DRILL', 2, 1, NULL),
(6860, 'oa_golive_decision_result', '待决策', 'PENDING', 1, 1, NULL),
(6861, 'oa_golive_decision_result', '继续运行', 'GO', 2, 1, NULL),
(6862, 'oa_golive_decision_result', '执行回退', 'ROLLBACK', 3, 1, NULL),
(6863, 'oa_golive_drill_result', '未演练', 'NOT_RUN', 1, 1, NULL),
(6864, 'oa_golive_drill_result', '演练通过', 'PASS', 2, 1, NULL),
(6865, 'oa_golive_drill_result', '演练失败', 'FAIL', 3, 1, NULL),
(6866, 'oa_golive_archive_type', '只读封存', 'READONLY', 1, 1, NULL),
(6867, 'oa_golive_archive_type', '离线封存', 'OFFLINE', 2, 1, NULL),
(6868, 'oa_golive_archive_status', '待封存', 'PENDING', 1, 1, NULL),
(6869, 'oa_golive_archive_status', '已封存', 'ARCHIVED', 2, 1, NULL),
(6870, 'oa_golive_resource_type', '外部访问', 'ACCESS', 1, 1, NULL),
(6871, 'oa_golive_resource_type', '服务账号', 'SERVICE_ACCOUNT', 2, 1, NULL),
(6872, 'oa_golive_resource_type', '证书', 'CERTIFICATE', 3, 1, NULL),
(6873, 'oa_golive_resource_type', '存储资源', 'STORAGE', 4, 1, NULL),
(6874, 'oa_golive_resource_type', '软件许可', 'LICENSE', 5, 1, NULL),
(6875, 'oa_golive_decommission_status', '待回收', 'PENDING', 1, 1, NULL),
(6876, 'oa_golive_decommission_status', '已回收', 'EXECUTED', 2, 1, NULL),
(6877, 'oa_golive_deliverable_type', '源代码', 'SOURCE', 1, 1, NULL),
(6878, 'oa_golive_deliverable_type', '构建产物', 'BUILD', 2, 1, NULL),
(6879, 'oa_golive_deliverable_type', '部署脚本', 'DEPLOY', 3, 1, NULL),
(6880, 'oa_golive_deliverable_type', '监控方案', 'MONITOR', 4, 1, NULL),
(6881, 'oa_golive_deliverable_type', '备份方案', 'BACKUP', 5, 1, NULL),
(6882, 'oa_golive_deliverable_type', '故障手册', 'INCIDENT', 6, 1, NULL),
(6883, 'oa_golive_deliverable_type', '账号权限', 'ACCOUNT', 7, 1, NULL),
(6884, 'oa_golive_deliverable_type', '质保服务', 'WARRANTY', 8, 1, NULL),
(6885, 'oa_golive_handover_status', '待交付', 'PENDING', 1, 1, NULL),
(6886, 'oa_golive_handover_status', '已交付', 'DELIVERED', 2, 1, NULL),
(6887, 'oa_golive_handover_status', '已确认', 'CONFIRMED', 3, 1, NULL);

-- ========== OA-N12 可配置项 ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(6052, 'OA', 'oa.golive.freeze.window.hours', '切换冻结窗口(小时)', '12', 1, 1, '冻结窗口与冻结范围待业务方确认(OA-DEV-114)'),
(6053, 'OA', 'oa.golive.verify.tolerance', '最终迁移核对容差(条)', '0', 1, 1, '关键对象核对容差待业务方确认(OA-DEV-115)'),
(6054, 'OA', 'oa.golive.dns.ttl.minutes', '入口切换域名 TTL(分钟)', '10', 1, 1, '域名解析 TTL 与生效窗口待业务方确认(OA-DEV-116)'),
(6055, 'OA', 'oa.golive.critical.issue.threshold', '上线值守严重问题阈值(个)', '0', 1, 1, '严重故障阈值与回退触发口径待业务方确认(OA-DEV-117)'),
(6056, 'OA', 'oa.legacy.retention.years', '旧系统封存保留期限(年)', '5', 1, 1, '数据保留期限依据合同与合规要求待确认(OA-DEV-119)'),
(6057, 'OA', 'oa.ops.warranty.months', '运维质保期限(月)', '12', 1, 1, '质保范围与期限待合同确认(OA-DEV-121)'),
(6058, 'OA', 'oa.golive.watch.report.enabled', '上线值守日报启用', 'true', 0, 1, NULL);
