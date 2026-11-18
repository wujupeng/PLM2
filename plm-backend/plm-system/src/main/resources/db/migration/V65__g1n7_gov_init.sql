-- G1-N7 公共平台底座—治理中心（WBS T001-T005）初始化：菜单/按钮权限、角色授权、字典与可配置项。
-- 号段基线（V64 之前已占用的最大值）：sys_permission=4144（本脚本从 4150 起）、
-- sys_role_permission=12262（从 12270 起）、sys_dictionary=7298（从 7300 起）、sys_config=6147（从 6150 起）。
-- 菜单继续挂在「平台底座」（parent_id=3920）下，与前述各节点并列。

-- ========== 治理中心菜单（4150-4161，挂在平台底座 3920 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4150, 'platform:gov:project', '项目治理', 'menu', 3920, '/platform/governance/projects', 'ProjectOutlined', 111, 1),
(4151, 'platform:gov:milestone', '里程碑', 'menu', 3920, '/platform/governance/milestones', 'FlagOutlined', 112, 1),
(4152, 'platform:gov:task', '治理任务', 'menu', 3920, '/platform/governance/tasks', 'CarryOutOutlined', 113, 1),
(4153, 'platform:gov:risk', '风险与问题', 'menu', 3920, '/platform/governance/risks', 'WarningOutlined', 114, 1),
(4154, 'platform:gov:asissystem', '存量系统盘点', 'menu', 3920, '/platform/governance/asis-systems', 'DatabaseOutlined', 115, 1),
(4155, 'platform:gov:asisfinding', '盘点发现', 'menu', 3920, '/platform/governance/asis-findings', 'FileSearchOutlined', 116, 1),
(4156, 'platform:gov:process', '流程建模', 'menu', 3920, '/platform/governance/processes', 'PartitionOutlined', 117, 1),
(4157, 'platform:gov:processnode', '流程节点', 'menu', 3920, '/platform/governance/process-nodes', 'NodeIndexOutlined', 118, 1),
(4158, 'platform:gov:requirement', '需求台账', 'menu', 3920, '/platform/governance/requirements', 'FileTextOutlined', 119, 1),
(4159, 'platform:gov:tracelink', '需求追踪矩阵', 'menu', 3920, '/platform/governance/trace-links', 'LinkOutlined', 120, 1),
(4160, 'platform:gov:archcomponent', '架构组件', 'menu', 3920, '/platform/governance/arch-components', 'BlockOutlined', 121, 1),
(4161, 'platform:gov:archrelation', '架构关系', 'menu', 3920, '/platform/governance/arch-relations', 'DeploymentUnitOutlined', 122, 1);

-- ========== 治理中心按钮（4170-4193） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4170, 'platform:gov:project:list', '查询项目', 'button', 4150, NULL, NULL, 1, 1),
(4171, 'platform:gov:project:manage', '维护项目', 'button', 4150, NULL, NULL, 2, 1),
(4172, 'platform:gov:milestone:list', '查询里程碑', 'button', 4151, NULL, NULL, 1, 1),
(4173, 'platform:gov:milestone:manage', '维护里程碑', 'button', 4151, NULL, NULL, 2, 1),
(4174, 'platform:gov:task:list', '查询治理任务', 'button', 4152, NULL, NULL, 1, 1),
(4175, 'platform:gov:task:manage', '维护治理任务', 'button', 4152, NULL, NULL, 2, 1),
(4176, 'platform:gov:risk:list', '查询风险', 'button', 4153, NULL, NULL, 1, 1),
(4177, 'platform:gov:risk:manage', '维护风险', 'button', 4153, NULL, NULL, 2, 1),
(4178, 'platform:gov:asissystem:list', '查询存量系统', 'button', 4154, NULL, NULL, 1, 1),
(4179, 'platform:gov:asissystem:manage', '维护存量系统', 'button', 4154, NULL, NULL, 2, 1),
(4180, 'platform:gov:asisfinding:list', '查询盘点发现', 'button', 4155, NULL, NULL, 1, 1),
(4181, 'platform:gov:asisfinding:manage', '维护盘点发现', 'button', 4155, NULL, NULL, 2, 1),
(4182, 'platform:gov:process:list', '查询流程', 'button', 4156, NULL, NULL, 1, 1),
(4183, 'platform:gov:process:manage', '维护流程', 'button', 4156, NULL, NULL, 2, 1),
(4184, 'platform:gov:processnode:list', '查询流程节点', 'button', 4157, NULL, NULL, 1, 1),
(4185, 'platform:gov:processnode:manage', '维护流程节点', 'button', 4157, NULL, NULL, 2, 1),
(4186, 'platform:gov:requirement:list', '查询需求', 'button', 4158, NULL, NULL, 1, 1),
(4187, 'platform:gov:requirement:manage', '维护需求', 'button', 4158, NULL, NULL, 2, 1),
(4188, 'platform:gov:tracelink:list', '查询追踪链接', 'button', 4159, NULL, NULL, 1, 1),
(4189, 'platform:gov:tracelink:manage', '维护追踪链接', 'button', 4159, NULL, NULL, 2, 1),
(4190, 'platform:gov:archcomponent:list', '查询架构组件', 'button', 4160, NULL, NULL, 1, 1),
(4191, 'platform:gov:archcomponent:manage', '维护架构组件', 'button', 4160, NULL, NULL, 2, 1),
(4192, 'platform:gov:archrelation:list', '查询架构关系', 'button', 4161, NULL, NULL, 1, 1),
(4193, 'platform:gov:archrelation:manage', '维护架构关系', 'button', 4161, NULL, NULL, 2, 1);

-- ========== 角色授权 ==========

-- 管理员（2001）：授予治理中心全部权限（12 菜单 + 24 按钮）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(12270, 2001, 4150), (12271, 2001, 4151), (12272, 2001, 4152), (12273, 2001, 4153),
(12274, 2001, 4154), (12275, 2001, 4155), (12276, 2001, 4156), (12277, 2001, 4157),
(12278, 2001, 4158), (12279, 2001, 4159), (12280, 2001, 4160), (12281, 2001, 4161),
(12282, 2001, 4170), (12283, 2001, 4171), (12284, 2001, 4172), (12285, 2001, 4173),
(12286, 2001, 4174), (12287, 2001, 4175), (12288, 2001, 4176), (12289, 2001, 4177),
(12290, 2001, 4178), (12291, 2001, 4179), (12292, 2001, 4180), (12293, 2001, 4181),
(12294, 2001, 4182), (12295, 2001, 4183), (12296, 2001, 4184), (12297, 2001, 4185),
(12298, 2001, 4186), (12299, 2001, 4187), (12300, 2001, 4188), (12301, 2001, 4189),
(12302, 2001, 4190), (12303, 2001, 4191), (12304, 2001, 4192), (12305, 2001, 4193);

-- 只读用户（2006）：全部菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(12306, 2006, 4150), (12307, 2006, 4151), (12308, 2006, 4152), (12309, 2006, 4153),
(12310, 2006, 4154), (12311, 2006, 4155), (12312, 2006, 4156), (12313, 2006, 4157),
(12314, 2006, 4158), (12315, 2006, 4159), (12316, 2006, 4160), (12317, 2006, 4161),
(12318, 2006, 4170), (12319, 2006, 4172), (12320, 2006, 4174), (12321, 2006, 4176),
(12322, 2006, 4178), (12323, 2006, 4180), (12324, 2006, 4182), (12325, 2006, 4184),
(12326, 2006, 4186), (12327, 2006, 4188), (12328, 2006, 4190), (12329, 2006, 4192);

-- 研发工程师（2002）：全部菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(12330, 2002, 4150), (12331, 2002, 4151), (12332, 2002, 4152), (12333, 2002, 4153),
(12334, 2002, 4154), (12335, 2002, 4155), (12336, 2002, 4156), (12337, 2002, 4157),
(12338, 2002, 4158), (12339, 2002, 4159), (12340, 2002, 4160), (12341, 2002, 4161),
(12342, 2002, 4170), (12343, 2002, 4172), (12344, 2002, 4174), (12345, 2002, 4176),
(12346, 2002, 4178), (12347, 2002, 4180), (12348, 2002, 4182), (12349, 2002, 4184),
(12350, 2002, 4186), (12351, 2002, 4188), (12352, 2002, 4190), (12353, 2002, 4192);

-- 质量工程师（2003）：全部菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(12354, 2003, 4150), (12355, 2003, 4151), (12356, 2003, 4152), (12357, 2003, 4153),
(12358, 2003, 4154), (12359, 2003, 4155), (12360, 2003, 4156), (12361, 2003, 4157),
(12362, 2003, 4158), (12363, 2003, 4159), (12364, 2003, 4160), (12365, 2003, 4161),
(12366, 2003, 4170), (12367, 2003, 4172), (12368, 2003, 4174), (12369, 2003, 4176),
(12370, 2003, 4178), (12371, 2003, 4180), (12372, 2003, 4182), (12373, 2003, 4184),
(12374, 2003, 4186), (12375, 2003, 4188), (12376, 2003, 4190), (12377, 2003, 4192);

-- 供应链专员（2004）：全部菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(12378, 2004, 4150), (12379, 2004, 4151), (12380, 2004, 4152), (12381, 2004, 4153),
(12382, 2004, 4154), (12383, 2004, 4155), (12384, 2004, 4156), (12385, 2004, 4157),
(12386, 2004, 4158), (12387, 2004, 4159), (12388, 2004, 4160), (12389, 2004, 4161),
(12390, 2004, 4170), (12391, 2004, 4172), (12392, 2004, 4174), (12393, 2004, 4176),
(12394, 2004, 4178), (12395, 2004, 4180), (12396, 2004, 4182), (12397, 2004, 4184),
(12398, 2004, 4186), (12399, 2004, 4188), (12400, 2004, 4190), (12401, 2004, 4192);

-- 生产现场（2005）：全部菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(12402, 2005, 4150), (12403, 2005, 4151), (12404, 2005, 4152), (12405, 2005, 4153),
(12406, 2005, 4154), (12407, 2005, 4155), (12408, 2005, 4156), (12409, 2005, 4157),
(12410, 2005, 4158), (12411, 2005, 4159), (12412, 2005, 4160), (12413, 2005, 4161),
(12414, 2005, 4170), (12415, 2005, 4172), (12416, 2005, 4174), (12417, 2005, 4176),
(12418, 2005, 4178), (12419, 2005, 4180), (12420, 2005, 4182), (12421, 2005, 4184),
(12422, 2005, 4186), (12423, 2005, 4188), (12424, 2005, 4190), (12425, 2005, 4192);

-- ========== 治理中心字典（7300-7385） ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(7300, 'gov_project_status', '规划中', 'PLANNING', 1, 1, NULL),
(7301, 'gov_project_status', '进行中', 'ACTIVE', 2, 1, NULL),
(7302, 'gov_project_status', '暂挂', 'HOLDING', 3, 1, NULL),
(7303, 'gov_project_status', '已关闭', 'CLOSED', 4, 1, NULL),
(7304, 'gov_milestone_status', '待启动', 'PENDING', 1, 1, NULL),
(7305, 'gov_milestone_status', '进行中', 'IN_PROGRESS', 2, 1, NULL),
(7306, 'gov_milestone_status', '已完成', 'DONE', 3, 1, NULL),
(7307, 'gov_milestone_status', '已延期', 'DELAYED', 4, 1, NULL),
(7308, 'gov_task_status', '待办', 'TODO', 1, 1, NULL),
(7309, 'gov_task_status', '进行中', 'DOING', 2, 1, NULL),
(7310, 'gov_task_status', '已完成', 'DONE', 3, 1, NULL),
(7311, 'gov_task_status', '受阻', 'BLOCKED', 4, 1, NULL),
(7312, 'gov_priority', 'P0-最高', 'P0', 1, 1, NULL),
(7313, 'gov_priority', 'P1-高', 'P1', 2, 1, NULL),
(7314, 'gov_priority', 'P2-中', 'P2', 3, 1, NULL),
(7315, 'gov_priority', 'P3-低', 'P3', 4, 1, NULL),
(7316, 'gov_risk_type', '风险', 'RISK', 1, 1, NULL),
(7317, 'gov_risk_type', '问题', 'ISSUE', 2, 1, NULL),
(7318, 'gov_risk_type', '变更', 'CHANGE', 3, 1, NULL),
(7319, 'gov_risk_level', '高', 'HIGH', 1, 1, NULL),
(7320, 'gov_risk_level', '中', 'MEDIUM', 2, 1, NULL),
(7321, 'gov_risk_level', '低', 'LOW', 3, 1, NULL),
(7322, 'gov_risk_status', '开启', 'OPEN', 1, 1, NULL),
(7323, 'gov_risk_status', '跟踪中', 'TRACKING', 2, 1, NULL),
(7324, 'gov_risk_status', '已关闭', 'CLOSED', 3, 1, NULL),
(7325, 'gov_asis_system_type', 'ERP', 'ERP', 1, 1, NULL),
(7326, 'gov_asis_system_type', 'PLM', 'PLM', 2, 1, NULL),
(7327, 'gov_asis_system_type', 'OA', 'OA', 3, 1, NULL),
(7328, 'gov_asis_system_type', 'MES', 'MES', 4, 1, NULL),
(7329, 'gov_asis_system_type', 'WMS', 'WMS', 5, 1, NULL),
(7330, 'gov_asis_system_type', 'SRM', 'SRM', 6, 1, NULL),
(7331, 'gov_asis_system_type', '其他', 'OTHER', 7, 1, NULL),
(7332, 'gov_asis_system_status', '在用', 'ACTIVE', 1, 1, NULL),
(7333, 'gov_asis_system_status', '规划中', 'PLANNED', 2, 1, NULL),
(7334, 'gov_asis_system_status', '退役中', 'RETIRING', 3, 1, NULL),
(7335, 'gov_asis_system_status', '已退役', 'RETIRED', 4, 1, NULL),
(7336, 'gov_finding_type', '流程', 'PROCESS', 1, 1, NULL),
(7337, 'gov_finding_type', '数据', 'DATA', 2, 1, NULL),
(7338, 'gov_finding_type', '集成', 'INTEGRATION', 3, 1, NULL),
(7339, 'gov_finding_type', '人工环节', 'MANUAL', 4, 1, NULL),
(7340, 'gov_finding_type', '痛点', 'PAIN_POINT', 5, 1, NULL),
(7341, 'gov_finding_status', '待确认', 'OPEN', 1, 1, NULL),
(7342, 'gov_finding_status', '已确认', 'CONFIRMED', 2, 1, NULL),
(7343, 'gov_finding_status', '已关闭', 'CLOSED', 3, 1, NULL),
(7344, 'gov_process_type', '订单到收款', 'O2C', 1, 1, NULL),
(7345, 'gov_process_type', '采购到付款', 'P2P', 2, 1, NULL),
(7346, 'gov_process_type', '计划到生产', 'P2M', 3, 1, NULL),
(7347, 'gov_process_type', '收货到发运', 'R2S', 4, 1, NULL),
(7348, 'gov_process_type', '设计到量产', 'D2M', 5, 1, NULL),
(7349, 'gov_process_level', 'L0-价值链', 'L0', 1, 1, NULL),
(7350, 'gov_process_level', 'L1-流程域', 'L1', 2, 1, NULL),
(7351, 'gov_process_level', 'L2-子流程', 'L2', 3, 1, NULL),
(7352, 'gov_process_level', 'L3-作业', 'L3', 4, 1, NULL),
(7353, 'gov_process_status', '草稿', 'DRAFT', 1, 1, NULL),
(7354, 'gov_process_status', '已发布', 'PUBLISHED', 2, 1, NULL),
(7355, 'gov_process_status', '已归档', 'ARCHIVED', 3, 1, NULL),
(7356, 'gov_node_type', '开始', 'START', 1, 1, NULL),
(7357, 'gov_node_type', '活动', 'ACTIVITY', 2, 1, NULL),
(7358, 'gov_node_type', '判断', 'DECISION', 3, 1, NULL),
(7359, 'gov_node_type', '结束', 'END', 4, 1, NULL),
(7360, 'gov_req_type', '业务需求', 'BUSINESS', 1, 1, NULL),
(7361, 'gov_req_type', '功能需求', 'FUNCTIONAL', 2, 1, NULL),
(7362, 'gov_req_type', '数据需求', 'DATA', 3, 1, NULL),
(7363, 'gov_req_type', '技术需求', 'TECHNICAL', 4, 1, NULL),
(7364, 'gov_req_status', '已提出', 'PROPOSED', 1, 1, NULL),
(7365, 'gov_req_status', '已评审', 'APPROVED', 2, 1, NULL),
(7366, 'gov_req_status', '实现中', 'IN_PROGRESS', 3, 1, NULL),
(7367, 'gov_req_status', '已完成', 'DONE', 4, 1, NULL),
(7368, 'gov_req_status', '已驳回', 'REJECTED', 5, 1, NULL),
(7369, 'gov_link_type', '功能', 'FUNCTION', 1, 1, NULL),
(7370, 'gov_link_type', '数据/API', 'DATA_API', 2, 1, NULL),
(7371, 'gov_link_type', '测试用例', 'TEST_CASE', 3, 1, NULL),
(7372, 'gov_link_type', '验收证据', 'ACCEPTANCE', 4, 1, NULL),
(7373, 'gov_arch_layer', '应用层', 'APPLICATION', 1, 1, NULL),
(7374, 'gov_arch_layer', '数据层', 'DATA', 2, 1, NULL),
(7375, 'gov_arch_layer', '技术层', 'TECHNICAL', 3, 1, NULL),
(7376, 'gov_arch_layer', '安全层', 'SECURITY', 4, 1, NULL),
(7377, 'gov_relation_type', '调用', 'CALL', 1, 1, NULL),
(7378, 'gov_relation_type', '依赖', 'DEPEND', 2, 1, NULL),
(7379, 'gov_relation_type', '同步', 'SYNC', 3, 1, NULL),
(7380, 'gov_relation_type', '复制', 'REPLICATE', 4, 1, NULL),
(7381, 'gov_component_status', '生效', 'ACTIVE', 1, 1, NULL),
(7382, 'gov_component_status', '停用', 'DISABLED', 2, 1, NULL),
(7383, 'gov_severity', '高', 'HIGH', 1, 1, NULL),
(7384, 'gov_severity', '中', 'MEDIUM', 2, 1, NULL),
(7385, 'gov_severity', '低', 'LOW', 3, 1, NULL);

-- ========== 治理中心可配置项（6150-6154） ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(6150, 'GOV', 'gov.enabled', '治理中心启用开关', 'true', 0, 1, '统一项目治理能力总开关，默认启用'),
(6151, 'GOV', 'gov.default.priority', '默认优先级', 'P1', 1, 1, '待业务方确认新任务/需求默认优先级'),
(6152, 'GOV', 'gov.risk.escalation.days', '风险升级天数', '7', 1, 1, '待业务方确认风险逾期未处理自动升级天数'),
(6153, 'GOV', 'gov.trace.matrix.required', '需求追踪矩阵必填', 'true', 1, 1, '待业务方确认需求是否强制建立追踪链接'),
(6154, 'GOV', 'gov.asis.migration.strategy', '存量系统默认迁移策略', 'PENDING', 1, 1, '待业务方确认存量系统默认迁移策略');
