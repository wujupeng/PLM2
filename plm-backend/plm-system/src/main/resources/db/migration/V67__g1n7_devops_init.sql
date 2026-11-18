-- G1-N7 公共平台底座—DevSecOps（WBS T012）初始化：菜单/按钮权限、角色授权、字典与可配置项。
-- 号段基线（V66 之前已占用的最大值）：sys_permission=4193（本脚本从 4200 起）、
-- sys_role_permission=12425（从 12430 起）、sys_dictionary=7385（从 7390 起）、sys_config=6154（从 6155 起）。
-- 菜单继续挂在「平台底座」（parent_id=3920）下，与前述各节点并列。

-- ========== DevSecOps菜单（4200-4204，挂在平台底座 3920 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4200, 'platform:devops:repository', '代码仓库', 'menu', 3920, '/platform/devops/repositories', 'CloudServerOutlined', 131, 1),
(4201, 'platform:devops:pipeline', '流水线', 'menu', 3920, '/platform/devops/pipelines', 'BranchesOutlined', 132, 1),
(4202, 'platform:devops:environment', '环境管理', 'menu', 3920, '/platform/devops/environments', 'ClusterOutlined', 133, 1),
(4203, 'platform:devops:buildrun', '构建记录', 'menu', 3920, '/platform/devops/build-runs', 'BuildOutlined', 134, 1),
(4204, 'platform:devops:gate', '质量安全门禁', 'menu', 3920, '/platform/devops/gates', 'SafetyOutlined', 135, 1);

-- ========== DevSecOps按钮（4210-4219） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4210, 'platform:devops:repository:list', '查询代码仓库', 'button', 4200, NULL, NULL, 1, 1),
(4211, 'platform:devops:repository:manage', '维护代码仓库', 'button', 4200, NULL, NULL, 2, 1),
(4212, 'platform:devops:pipeline:list', '查询流水线', 'button', 4201, NULL, NULL, 1, 1),
(4213, 'platform:devops:pipeline:manage', '维护流水线', 'button', 4201, NULL, NULL, 2, 1),
(4214, 'platform:devops:environment:list', '查询环境', 'button', 4202, NULL, NULL, 1, 1),
(4215, 'platform:devops:environment:manage', '维护环境', 'button', 4202, NULL, NULL, 2, 1),
(4216, 'platform:devops:buildrun:list', '查询构建记录', 'button', 4203, NULL, NULL, 1, 1),
(4217, 'platform:devops:buildrun:manage', '维护构建记录', 'button', 4203, NULL, NULL, 2, 1),
(4218, 'platform:devops:gate:list', '查询质量安全门禁', 'button', 4204, NULL, NULL, 1, 1),
(4219, 'platform:devops:gate:manage', '维护质量安全门禁', 'button', 4204, NULL, NULL, 2, 1);

-- ========== 角色授权 ==========

-- 管理员（2001）：授予 DevSecOps 全部权限（5 菜单 + 10 按钮）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(12430, 2001, 4200), (12431, 2001, 4201), (12432, 2001, 4202), (12433, 2001, 4203), (12434, 2001, 4204),
(12435, 2001, 4210), (12436, 2001, 4211), (12437, 2001, 4212), (12438, 2001, 4213), (12439, 2001, 4214),
(12440, 2001, 4215), (12441, 2001, 4216), (12442, 2001, 4217), (12443, 2001, 4218), (12444, 2001, 4219);

-- 只读用户（2006）：全部菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(12445, 2006, 4200), (12446, 2006, 4201), (12447, 2006, 4202), (12448, 2006, 4203), (12449, 2006, 4204),
(12450, 2006, 4210), (12451, 2006, 4212), (12452, 2006, 4214), (12453, 2006, 4216), (12454, 2006, 4218);

-- 研发工程师（2002）：全部菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(12455, 2002, 4200), (12456, 2002, 4201), (12457, 2002, 4202), (12458, 2002, 4203), (12459, 2002, 4204),
(12460, 2002, 4210), (12461, 2002, 4212), (12462, 2002, 4214), (12463, 2002, 4216), (12464, 2002, 4218);

-- 质量工程师（2003）：全部菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(12465, 2003, 4200), (12466, 2003, 4201), (12467, 2003, 4202), (12468, 2003, 4203), (12469, 2003, 4204),
(12470, 2003, 4210), (12471, 2003, 4212), (12472, 2003, 4214), (12473, 2003, 4216), (12474, 2003, 4218);

-- 供应链专员（2004）：全部菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(12475, 2004, 4200), (12476, 2004, 4201), (12477, 2004, 4202), (12478, 2004, 4203), (12479, 2004, 4204),
(12480, 2004, 4210), (12481, 2004, 4212), (12482, 2004, 4214), (12483, 2004, 4216), (12484, 2004, 4218);

-- 生产现场（2005）：全部菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(12485, 2005, 4200), (12486, 2005, 4201), (12487, 2005, 4202), (12488, 2005, 4203), (12489, 2005, 4204),
(12490, 2005, 4210), (12491, 2005, 4212), (12492, 2005, 4214), (12493, 2005, 4216), (12494, 2005, 4218);

-- ========== DevSecOps字典（7390-7429） ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(7390, 'repo_type', 'Git', 'GIT', 1, 1, NULL),
(7391, 'repo_type', 'SVN', 'SVN', 2, 1, NULL),
(7392, 'branch_strategy', 'GitFlow', 'GITFLOW', 1, 1, NULL),
(7393, 'branch_strategy', '主干开发', 'TRUNK_BASED', 2, 1, NULL),
(7394, 'branch_strategy', '发布分支', 'RELEASE', 3, 1, NULL),
(7395, 'repo_status', '生效', 'ACTIVE', 1, 1, NULL),
(7396, 'repo_status', '停用', 'DISABLED', 2, 1, NULL),
(7397, 'pipeline_trigger', '推送触发', 'PUSH', 1, 1, NULL),
(7398, 'pipeline_trigger', '手动触发', 'MANUAL', 2, 1, NULL),
(7399, 'pipeline_trigger', '定时触发', 'SCHEDULE', 3, 1, NULL),
(7400, 'pipeline_status', '生效', 'ACTIVE', 1, 1, NULL),
(7401, 'pipeline_status', '停用', 'DISABLED', 2, 1, NULL),
(7402, 'env_type', '开发', 'DEV', 1, 1, NULL),
(7403, 'env_type', '测试', 'TEST', 2, 1, NULL),
(7404, 'env_type', '验收', 'UAT', 3, 1, NULL),
(7405, 'env_type', '生产', 'PROD', 4, 1, NULL),
(7406, 'env_status', '生效', 'ACTIVE', 1, 1, NULL),
(7407, 'env_status', '维护中', 'MAINTENANCE', 2, 1, NULL),
(7408, 'env_status', '离线', 'OFFLINE', 3, 1, NULL),
(7409, 'build_status', '成功', 'SUCCESS', 1, 1, NULL),
(7410, 'build_status', '失败', 'FAILED', 2, 1, NULL),
(7411, 'build_status', '运行中', 'RUNNING', 3, 1, NULL),
(7412, 'gate_type', '单元测试', 'UNIT_TEST', 1, 1, NULL),
(7413, 'gate_type', '覆盖率', 'COVERAGE', 2, 1, NULL),
(7414, 'gate_type', '代码扫描', 'SONAR', 3, 1, NULL),
(7415, 'gate_type', '漏洞扫描', 'SECURITY_SCAN', 4, 1, NULL),
(7416, 'gate_type', '性能测试', 'PERFORMANCE', 5, 1, NULL),
(7417, 'gate_result', '通过', 'PASS', 1, 1, NULL),
(7418, 'gate_result', '失败', 'FAIL', 2, 1, NULL),
(7419, 'gate_result', '告警', 'WARN', 3, 1, NULL),
(7420, 'devops_severity', '高', 'HIGH', 1, 1, NULL),
(7421, 'devops_severity', '中', 'MEDIUM', 2, 1, NULL),
(7422, 'devops_severity', '低', 'LOW', 3, 1, NULL),
(7423, 'devops_domain', 'PLM', 'PLM', 1, 1, NULL),
(7424, 'devops_domain', 'ERP', 'ERP', 2, 1, NULL),
(7425, 'devops_domain', 'SRM', 'SRM', 3, 1, NULL),
(7426, 'devops_domain', 'MES', 'MES', 4, 1, NULL),
(7427, 'devops_domain', 'WMS', 'WMS', 5, 1, NULL),
(7428, 'devops_domain', 'OA', 'OA', 6, 1, NULL),
(7429, 'devops_domain', '平台', 'PLATFORM', 7, 1, NULL);

-- ========== DevSecOps可配置项（6155-6158） ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(6155, 'DEVOPS', 'devops.enabled', 'DevSecOps启用开关', 'true', 0, 1, '统一交付流水线治理总开关，默认启用'),
(6156, 'DEVOPS', 'devops.gate.enforce', '门禁强制拦截', 'true', 1, 1, '待业务方确认质量门禁未通过是否阻断流水线'),
(6157, 'DEVOPS', 'devops.security.scan.required', '漏洞扫描必过', 'true', 1, 1, '待业务方确认高危漏洞是否强制阻断发布'),
(6158, 'DEVOPS', 'devops.env.isolation.required', '环境强隔离', 'true', 1, 1, '待业务方确认各环境是否强制物理/网络隔离');
