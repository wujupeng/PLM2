-- G1-N8 公共平台底座—主数据平台（WBS T007）初始化：菜单/按钮权限、角色授权、字典与可配置项。
-- 号段基线（V67 之后已占用的最大值）：sys_permission=4219（本脚本从 4230 起）、
-- sys_role_permission=12494（从 12500 起）、sys_dictionary=7429（从 7430 起）、sys_config=6158（从 6160 起）。
-- 菜单继续挂在「平台底座」（parent_id=3920）下，与前述各节点并列。

-- ========== 主数据平台菜单（4230-4237，挂在平台底座 3920 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4230, 'platform:mdm:domain', '主数据域', 'menu', 3920, '/platform/mdm/domains', 'DatabaseOutlined', 141, 1),
(4231, 'platform:mdm:source', '权威源登记', 'menu', 3920, '/platform/mdm/sources', 'ApartmentOutlined', 142, 1),
(4232, 'platform:mdm:codestandard', '编码标准', 'menu', 3920, '/platform/mdm/code-standards', 'BarcodeOutlined', 143, 1),
(4233, 'platform:mdm:distribution', '主数据分发', 'menu', 3920, '/platform/mdm/distributions', 'SendOutlined', 144, 1),
(4234, 'platform:mdm:changerequest', '变更申请', 'menu', 3920, '/platform/mdm/change-requests', 'EditOutlined', 145, 1),
(4235, 'platform:mdm:qualitycheck', '数据质量校验', 'menu', 3920, '/platform/mdm/quality-checks', 'SafetyCertificateOutlined', 146, 1),
(4236, 'platform:mdm:synclog', '同步日志', 'menu', 3920, '/platform/mdm/sync-logs', 'SyncOutlined', 147, 1),
(4237, 'platform:mdm:codeissue', '编码发放', 'menu', 3920, '/platform/mdm/code-issues', 'NumberOutlined', 148, 1);

-- ========== 主数据平台按钮（4240-4255） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4240, 'platform:mdm:domain:list', '查询主数据域', 'button', 4230, NULL, NULL, 1, 1),
(4241, 'platform:mdm:domain:manage', '维护主数据域', 'button', 4230, NULL, NULL, 2, 1),
(4242, 'platform:mdm:source:list', '查询权威源登记', 'button', 4231, NULL, NULL, 1, 1),
(4243, 'platform:mdm:source:manage', '维护权威源登记', 'button', 4231, NULL, NULL, 2, 1),
(4244, 'platform:mdm:codestandard:list', '查询编码标准', 'button', 4232, NULL, NULL, 1, 1),
(4245, 'platform:mdm:codestandard:manage', '维护编码标准', 'button', 4232, NULL, NULL, 2, 1),
(4246, 'platform:mdm:distribution:list', '查询主数据分发', 'button', 4233, NULL, NULL, 1, 1),
(4247, 'platform:mdm:distribution:manage', '维护主数据分发', 'button', 4233, NULL, NULL, 2, 1),
(4248, 'platform:mdm:changerequest:list', '查询变更申请', 'button', 4234, NULL, NULL, 1, 1),
(4249, 'platform:mdm:changerequest:manage', '维护变更申请', 'button', 4234, NULL, NULL, 2, 1),
(4250, 'platform:mdm:qualitycheck:list', '查询数据质量校验', 'button', 4235, NULL, NULL, 1, 1),
(4251, 'platform:mdm:qualitycheck:manage', '维护数据质量校验', 'button', 4235, NULL, NULL, 2, 1),
(4252, 'platform:mdm:synclog:list', '查询同步日志', 'button', 4236, NULL, NULL, 1, 1),
(4253, 'platform:mdm:synclog:manage', '维护同步日志', 'button', 4236, NULL, NULL, 2, 1),
(4254, 'platform:mdm:codeissue:list', '查询编码发放', 'button', 4237, NULL, NULL, 1, 1),
(4255, 'platform:mdm:codeissue:manage', '维护编码发放', 'button', 4237, NULL, NULL, 2, 1);

-- ========== 角色授权 ==========

-- 管理员（2001）：授予主数据平台全部权限（8 菜单 + 16 按钮）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(12500, 2001, 4230), (12501, 2001, 4231), (12502, 2001, 4232), (12503, 2001, 4233),
(12504, 2001, 4234), (12505, 2001, 4235), (12506, 2001, 4236), (12507, 2001, 4237),
(12508, 2001, 4240), (12509, 2001, 4241), (12510, 2001, 4242), (12511, 2001, 4243),
(12512, 2001, 4244), (12513, 2001, 4245), (12514, 2001, 4246), (12515, 2001, 4247),
(12516, 2001, 4248), (12517, 2001, 4249), (12518, 2001, 4250), (12519, 2001, 4251),
(12520, 2001, 4252), (12521, 2001, 4253), (12522, 2001, 4254), (12523, 2001, 4255);

-- 只读用户（2006）：全部菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(12524, 2006, 4230), (12525, 2006, 4231), (12526, 2006, 4232), (12527, 2006, 4233),
(12528, 2006, 4234), (12529, 2006, 4235), (12530, 2006, 4236), (12531, 2006, 4237),
(12532, 2006, 4240), (12533, 2006, 4242), (12534, 2006, 4244), (12535, 2006, 4246),
(12536, 2006, 4248), (12537, 2006, 4250), (12538, 2006, 4252), (12539, 2006, 4254);

-- 研发工程师（2002）：全部菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(12540, 2002, 4230), (12541, 2002, 4231), (12542, 2002, 4232), (12543, 2002, 4233),
(12544, 2002, 4234), (12545, 2002, 4235), (12546, 2002, 4236), (12547, 2002, 4237),
(12548, 2002, 4240), (12549, 2002, 4242), (12550, 2002, 4244), (12551, 2002, 4246),
(12552, 2002, 4248), (12553, 2002, 4250), (12554, 2002, 4252), (12555, 2002, 4254);

-- 质量工程师（2003）：全部菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(12556, 2003, 4230), (12557, 2003, 4231), (12558, 2003, 4232), (12559, 2003, 4233),
(12560, 2003, 4234), (12561, 2003, 4235), (12562, 2003, 4236), (12563, 2003, 4237),
(12564, 2003, 4240), (12565, 2003, 4242), (12566, 2003, 4244), (12567, 2003, 4246),
(12568, 2003, 4248), (12569, 2003, 4250), (12570, 2003, 4252), (12571, 2003, 4254);

-- 供应链专员（2004）：全部菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(12572, 2004, 4230), (12573, 2004, 4231), (12574, 2004, 4232), (12575, 2004, 4233),
(12576, 2004, 4234), (12577, 2004, 4235), (12578, 2004, 4236), (12579, 2004, 4237),
(12580, 2004, 4240), (12581, 2004, 4242), (12582, 2004, 4244), (12583, 2004, 4246),
(12584, 2004, 4248), (12585, 2004, 4250), (12586, 2004, 4252), (12587, 2004, 4254);

-- 生产现场（2005）：全部菜单 + 仅查询按钮
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(12588, 2005, 4230), (12589, 2005, 4231), (12590, 2005, 4232), (12591, 2005, 4233),
(12592, 2005, 4234), (12593, 2005, 4235), (12594, 2005, 4236), (12595, 2005, 4237),
(12596, 2005, 4240), (12597, 2005, 4242), (12598, 2005, 4244), (12599, 2005, 4246),
(12600, 2005, 4248), (12601, 2005, 4250), (12602, 2005, 4252), (12603, 2005, 4254);

-- ========== 主数据平台字典（7430-7486） ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(7430, 'mdm_master_type', '物料', 'MATERIAL', 1, 1, NULL),
(7431, 'mdm_master_type', '产品', 'PRODUCT', 2, 1, NULL),
(7432, 'mdm_master_type', '客户', 'CUSTOMER', 3, 1, NULL),
(7433, 'mdm_master_type', '供应商', 'SUPPLIER', 4, 1, NULL),
(7434, 'mdm_master_type', '组织', 'ORG', 5, 1, NULL),
(7435, 'mdm_master_type', '人员', 'PERSONNEL', 6, 1, NULL),
(7436, 'mdm_master_type', '仓库', 'WAREHOUSE', 7, 1, NULL),
(7437, 'mdm_master_type', '工艺', 'PROCESS', 8, 1, NULL),
(7438, 'mdm_master_type', '设备', 'EQUIPMENT', 9, 1, NULL),
(7439, 'mdm_authority_system', 'PLM', 'PLM', 1, 1, NULL),
(7440, 'mdm_authority_system', 'ERP', 'ERP', 2, 1, NULL),
(7441, 'mdm_authority_system', 'SRM', 'SRM', 3, 1, NULL),
(7442, 'mdm_authority_system', 'MES', 'MES', 4, 1, NULL),
(7443, 'mdm_authority_system', 'WMS', 'WMS', 5, 1, NULL),
(7444, 'mdm_authority_system', 'OA', 'OA', 6, 1, NULL),
(7445, 'mdm_authority_system', '平台', 'PLATFORM', 7, 1, NULL),
(7446, 'mdm_sync_mode', '推送', 'PUSH', 1, 1, NULL),
(7447, 'mdm_sync_mode', '拉取', 'PULL', 2, 1, NULL),
(7448, 'mdm_sync_mode', '事件驱动', 'EVENT', 3, 1, NULL),
(7449, 'mdm_domain_status', '生效', 'ACTIVE', 1, 1, NULL),
(7450, 'mdm_domain_status', '草稿', 'DRAFT', 2, 1, NULL),
(7451, 'mdm_domain_status', '停用', 'DISABLED', 3, 1, NULL),
(7452, 'mdm_authority_level', '主权威源', 'PRIMARY', 1, 1, NULL),
(7453, 'mdm_authority_level', '次权威源', 'SECONDARY', 2, 1, NULL),
(7454, 'mdm_sync_direction', '对外发布', 'OUT', 1, 1, NULL),
(7455, 'mdm_sync_direction', '对外接收', 'IN', 2, 1, NULL),
(7456, 'mdm_sync_direction', '双向同步', 'BOTH', 3, 1, NULL),
(7457, 'mdm_source_status', '生效', 'ACTIVE', 1, 1, NULL),
(7458, 'mdm_source_status', '停用', 'DISABLED', 2, 1, NULL),
(7459, 'mdm_reset_cycle', '不重置', 'NONE', 1, 1, NULL),
(7460, 'mdm_reset_cycle', '按年重置', 'YEAR', 2, 1, NULL),
(7461, 'mdm_reset_cycle', '按月重置', 'MONTH', 3, 1, NULL),
(7462, 'mdm_reset_cycle', '按日重置', 'DAY', 4, 1, NULL),
(7463, 'mdm_standard_status', '生效', 'ACTIVE', 1, 1, NULL),
(7464, 'mdm_standard_status', '停用', 'DISABLED', 2, 1, NULL),
(7465, 'mdm_dist_type', '全量', 'FULL', 1, 1, NULL),
(7466, 'mdm_dist_type', '增量', 'INCREMENT', 2, 1, NULL),
(7467, 'mdm_dist_status', '待分发', 'PENDING', 1, 1, NULL),
(7468, 'mdm_dist_status', '已发送', 'SENT', 2, 1, NULL),
(7469, 'mdm_dist_status', '已回执', 'ACK', 3, 1, NULL),
(7470, 'mdm_dist_status', '失败', 'FAILED', 4, 1, NULL),
(7471, 'mdm_change_type', '新增', 'CREATE', 1, 1, NULL),
(7472, 'mdm_change_type', '修改', 'UPDATE', 2, 1, NULL),
(7473, 'mdm_change_type', '停用', 'DISABLE', 3, 1, NULL),
(7474, 'mdm_change_type', '合并', 'MERGE', 4, 1, NULL),
(7475, 'mdm_request_status', '已提交', 'SUBMITTED', 1, 1, NULL),
(7476, 'mdm_request_status', '已批准', 'APPROVED', 2, 1, NULL),
(7477, 'mdm_request_status', '已驳回', 'REJECTED', 3, 1, NULL),
(7478, 'mdm_request_status', '已生效', 'APPLIED', 4, 1, NULL),
(7479, 'mdm_check_result', '通过', 'PASS', 1, 1, NULL),
(7480, 'mdm_check_result', '告警', 'WARN', 2, 1, NULL),
(7481, 'mdm_check_result', '不通过', 'FAIL', 3, 1, NULL),
(7482, 'mdm_sync_status', '成功', 'SUCCESS', 1, 1, NULL),
(7483, 'mdm_sync_status', '失败', 'FAILED', 2, 1, NULL),
(7484, 'mdm_sync_status', '已忽略', 'IGNORED', 3, 1, NULL),
(7485, 'mdm_issue_status', '已发放', 'ISSUED', 1, 1, NULL),
(7486, 'mdm_issue_status', '已作废', 'VOID', 2, 1, NULL);

-- ========== 主数据平台可配置项（6160-6164） ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(6160, 'MDM', 'mdm.enabled', '主数据平台启用开关', 'true', 0, 1, '统一主数据治理总开关，默认启用'),
(6161, 'MDM', 'mdm.authority.plm', 'PLM为物料产品BOM权威源', 'true', 1, 1, '待业务方确认物料/产品/BOM 以 PLM 为唯一权威源，六系统不得各自维护'),
(6162, 'MDM', 'mdm.distribution.auto', '主数据自动分发', 'true', 1, 1, '待业务方确认主数据变更是否自动向目标系统分发'),
(6163, 'MDM', 'mdm.change.approval.required', '主数据变更需审批', 'true', 1, 1, '待业务方确认主数据新增/修改/停用是否强制审批'),
(6164, 'MDM', 'mdm.code.issue.auto', '编码自动发放', 'true', 1, 1, '待业务方确认主数据编码是否按标准自动发放');
