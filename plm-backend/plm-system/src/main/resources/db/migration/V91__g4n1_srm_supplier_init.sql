-- G4-N1 SRM—供应商全生命周期（WBS T031）初始化：菜单/按钮权限、角色授权、字典与可配置项。
-- 号段基线（V89 之后已占用的最大值）：sys_permission=4548（本脚本从 4550 起）、
-- sys_role_permission=13752（从 13760 起）、sys_dictionary=8170（从 8180 起）、sys_config=6321（从 6330 起）。
-- 菜单说明：SRM 供应商协同（4550）为新增顶级菜单域；
--           供应商全生命周期（4551）为其下二级分组；组织/权限/审批复用既有平台底座。

-- ========== SRM 顶级菜单域（4550，parent_id=0） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4550, 'srm', 'SRM 供应商协同', 'menu', 0, '/srm', 'ApartmentOutlined', 16, 1);

-- ========== SRM 供应商全生命周期分组菜单（4551，挂在 4550 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4551, 'srm:supplier', '供应商全生命周期', 'menu', 4550, '/srm/supplier', 'TeamOutlined', 1, 1);

-- ========== SRM 供应商全生命周期业务菜单（4552-4558，挂在 4551 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4552, 'srm:supplier:archive', '供应商主档', 'menu', 4551, '/srm/supplier/archives', 'DatabaseOutlined', 1, 1),
(4553, 'srm:supplier:admission', '供应商准入', 'menu', 4551, '/srm/supplier/admissions', 'AuditOutlined', 2, 1),
(4554, 'srm:supplier:qualification', '供应商资质', 'menu', 4551, '/srm/supplier/qualifications', 'SafetyCertificateOutlined', 3, 1),
(4555, 'srm:supplier:risk', '供应商风险', 'menu', 4551, '/srm/supplier/risks', 'WarningOutlined', 4, 1),
(4556, 'srm:supplier:grade', '供应商分级', 'menu', 4551, '/srm/supplier/grades', 'StarOutlined', 5, 1),
(4557, 'srm:supplier:blacklist', '供应商黑名单', 'menu', 4551, '/srm/supplier/blacklists', 'StopOutlined', 6, 1),
(4558, 'srm:supplier:review', '年度复审', 'menu', 4551, '/srm/supplier/reviews', 'ReconciliationOutlined', 7, 1);

-- ========== SRM 供应商全生命周期按钮（4559-4572） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4559, 'srm:supplier:archive:list', '查询供应商主档', 'button', 4552, NULL, NULL, 1, 1),
(4560, 'srm:supplier:archive:manage', '维护供应商主档', 'button', 4552, NULL, NULL, 2, 1),
(4561, 'srm:supplier:admission:list', '查询供应商准入', 'button', 4553, NULL, NULL, 1, 1),
(4562, 'srm:supplier:admission:manage', '维护供应商准入', 'button', 4553, NULL, NULL, 2, 1),
(4563, 'srm:supplier:qualification:list', '查询供应商资质', 'button', 4554, NULL, NULL, 1, 1),
(4564, 'srm:supplier:qualification:manage', '维护供应商资质', 'button', 4554, NULL, NULL, 2, 1),
(4565, 'srm:supplier:risk:list', '查询供应商风险', 'button', 4555, NULL, NULL, 1, 1),
(4566, 'srm:supplier:risk:manage', '维护供应商风险', 'button', 4555, NULL, NULL, 2, 1),
(4567, 'srm:supplier:grade:list', '查询供应商分级', 'button', 4556, NULL, NULL, 1, 1),
(4568, 'srm:supplier:grade:manage', '维护供应商分级', 'button', 4556, NULL, NULL, 2, 1),
(4569, 'srm:supplier:blacklist:list', '查询供应商黑名单', 'button', 4557, NULL, NULL, 1, 1),
(4570, 'srm:supplier:blacklist:manage', '维护供应商黑名单', 'button', 4557, NULL, NULL, 2, 1),
(4571, 'srm:supplier:review:list', '查询年度复审', 'button', 4558, NULL, NULL, 1, 1),
(4572, 'srm:supplier:review:manage', '维护年度复审', 'button', 4558, NULL, NULL, 2, 1);

-- ========== 角色授权 ==========

-- 管理员（2001）：授予全部权限（1 顶级 + 1 分组 + 7 菜单 + 14 按钮，共 23 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(13760, 2001, 4550), (13761, 2001, 4551), (13762, 2001, 4552), (13763, 2001, 4553),
(13764, 2001, 4554), (13765, 2001, 4555), (13766, 2001, 4556), (13767, 2001, 4557),
(13768, 2001, 4558), (13769, 2001, 4559), (13770, 2001, 4560), (13771, 2001, 4561),
(13772, 2001, 4562), (13773, 2001, 4563), (13774, 2001, 4564), (13775, 2001, 4565),
(13776, 2001, 4566), (13777, 2001, 4567), (13778, 2001, 4568), (13779, 2001, 4569),
(13780, 2001, 4570), (13781, 2001, 4571), (13782, 2001, 4572);

-- 供应链专员（2004）：授予全部权限（供应商为供应链职能主责，共 23 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(13783, 2004, 4550), (13784, 2004, 4551), (13785, 2004, 4552), (13786, 2004, 4553),
(13787, 2004, 4554), (13788, 2004, 4555), (13789, 2004, 4556), (13790, 2004, 4557),
(13791, 2004, 4558), (13792, 2004, 4559), (13793, 2004, 4560), (13794, 2004, 4561),
(13795, 2004, 4562), (13796, 2004, 4563), (13797, 2004, 4564), (13798, 2004, 4565),
(13799, 2004, 4566), (13800, 2004, 4567), (13801, 2004, 4568), (13802, 2004, 4569),
(13803, 2004, 4570), (13804, 2004, 4571), (13805, 2004, 4572);

-- 研发工程师（2002）：授予顶级/分组/菜单 + 仅查询按钮（16 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(13806, 2002, 4550), (13807, 2002, 4551), (13808, 2002, 4552), (13809, 2002, 4553),
(13810, 2002, 4554), (13811, 2002, 4555), (13812, 2002, 4556), (13813, 2002, 4557),
(13814, 2002, 4558), (13815, 2002, 4559), (13816, 2002, 4561), (13817, 2002, 4563),
(13818, 2002, 4565), (13819, 2002, 4567), (13820, 2002, 4569), (13821, 2002, 4571);

-- 质量工程师（2003）：授予顶级/分组/菜单 + 仅查询按钮（16 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(13822, 2003, 4550), (13823, 2003, 4551), (13824, 2003, 4552), (13825, 2003, 4553),
(13826, 2003, 4554), (13827, 2003, 4555), (13828, 2003, 4556), (13829, 2003, 4557),
(13830, 2003, 4558), (13831, 2003, 4559), (13832, 2003, 4561), (13833, 2003, 4563),
(13834, 2003, 4565), (13835, 2003, 4567), (13836, 2003, 4569), (13837, 2003, 4571);

-- 生产现场（2005）：授予顶级/分组/菜单 + 仅查询按钮（16 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(13838, 2005, 4550), (13839, 2005, 4551), (13840, 2005, 4552), (13841, 2005, 4553),
(13842, 2005, 4554), (13843, 2005, 4555), (13844, 2005, 4556), (13845, 2005, 4557),
(13846, 2005, 4558), (13847, 2005, 4559), (13848, 2005, 4561), (13849, 2005, 4563),
(13850, 2005, 4565), (13851, 2005, 4567), (13852, 2005, 4569), (13853, 2005, 4571);

-- 只读用户（2006）：授予顶级/分组/菜单 + 仅查询按钮（16 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(13854, 2006, 4550), (13855, 2006, 4551), (13856, 2006, 4552), (13857, 2006, 4553),
(13858, 2006, 4554), (13859, 2006, 4555), (13860, 2006, 4556), (13861, 2006, 4557),
(13862, 2006, 4558), (13863, 2006, 4559), (13864, 2006, 4561), (13865, 2006, 4563),
(13866, 2006, 4565), (13867, 2006, 4567), (13868, 2006, 4569), (13869, 2006, 4571);

-- ========== SRM 供应商全生命周期字典（8180-8250） ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(8180, 'srm_supplier_type', '原材料', 'RAW', 1, 1, NULL),
(8181, 'srm_supplier_type', '零部件', 'PART', 2, 1, NULL),
(8182, 'srm_supplier_type', '服务类', 'SERVICE', 3, 1, NULL),
(8183, 'srm_supplier_type', '设备类', 'EQUIPMENT', 4, 1, NULL),
(8184, 'srm_supplier_type', '外协加工', 'OUTSOURCE', 5, 1, NULL),
(8185, 'srm_supplier_type', '其他', 'OTHER', 6, 1, NULL),
(8186, 'srm_supplier_status', '待准入', 'PENDING', 1, 1, NULL),
(8187, 'srm_supplier_status', '合格供应商', 'ACTIVE', 2, 1, NULL),
(8188, 'srm_supplier_status', '暂停合作', 'SUSPENDED', 3, 1, NULL),
(8189, 'srm_supplier_status', '黑名单', 'BLACKLIST', 4, 1, NULL),
(8190, 'srm_supplier_status', '已失效', 'OBSOLETE', 5, 1, NULL),
(8191, 'srm_supplier_source', '内部推荐', 'RECOMMEND', 1, 1, NULL),
(8192, 'srm_supplier_source', '供应商自荐', 'SELF', 2, 1, NULL),
(8193, 'srm_supplier_source', '寻源引入', 'SOURCING', 3, 1, NULL),
(8194, 'srm_supplier_source', '历史继承', 'INHERIT', 4, 1, NULL),
(8195, 'srm_supplier_source', '其他', 'OTHER', 5, 1, NULL),
(8196, 'srm_supplier_admission_type', '新准入', 'NEW', 1, 1, NULL),
(8197, 'srm_supplier_admission_type', '变更准入', 'CHANGE', 2, 1, NULL),
(8198, 'srm_supplier_admission_type', '扩品类', 'EXPAND', 3, 1, NULL),
(8199, 'srm_supplier_admission_status', '草稿', 'DRAFT', 1, 1, NULL),
(8200, 'srm_supplier_admission_status', '待审批', 'SUBMITTED', 2, 1, NULL),
(8201, 'srm_supplier_admission_status', '已通过', 'APPROVED', 3, 1, NULL),
(8202, 'srm_supplier_admission_status', '已驳回', 'REJECTED', 4, 1, NULL),
(8203, 'srm_supplier_admission_status', '已取消', 'CANCELLED', 5, 1, NULL),
(8204, 'srm_supplier_qualification_type', '营业执照', 'BUSINESS_LICENSE', 1, 1, NULL),
(8205, 'srm_supplier_qualification_type', '质量体系(ISO9001)', 'ISO9001', 2, 1, NULL),
(8206, 'srm_supplier_qualification_type', '环境体系(ISO14001)', 'ISO14001', 3, 1, NULL),
(8207, 'srm_supplier_qualification_type', '生产许可', 'PRODUCTION_LICENSE', 4, 1, NULL),
(8208, 'srm_supplier_qualification_type', '质量认证', 'QUALITY_CERT', 5, 1, NULL),
(8209, 'srm_supplier_qualification_type', '其他', 'OTHER', 6, 1, NULL),
(8210, 'srm_supplier_qualification_status', '有效', 'VALID', 1, 1, NULL),
(8211, 'srm_supplier_qualification_status', '即将到期', 'EXPIRING', 2, 1, NULL),
(8212, 'srm_supplier_qualification_status', '已过期', 'EXPIRED', 3, 1, NULL),
(8213, 'srm_supplier_risk_type', '财务风险', 'FINANCE', 1, 1, NULL),
(8214, 'srm_supplier_risk_type', '质量风险', 'QUALITY', 2, 1, NULL),
(8215, 'srm_supplier_risk_type', '交付风险', 'DELIVERY', 3, 1, NULL),
(8216, 'srm_supplier_risk_type', '合规风险', 'COMPLIANCE', 4, 1, NULL),
(8217, 'srm_supplier_risk_type', '舆情风险', 'REPUTATION', 5, 1, NULL),
(8218, 'srm_supplier_risk_type', '其他', 'OTHER', 6, 1, NULL),
(8219, 'srm_supplier_risk_level', '低', 'LOW', 1, 1, NULL),
(8220, 'srm_supplier_risk_level', '中', 'MEDIUM', 2, 1, NULL),
(8221, 'srm_supplier_risk_level', '高', 'HIGH', 3, 1, NULL),
(8222, 'srm_supplier_risk_level', '严重', 'CRITICAL', 4, 1, NULL),
(8223, 'srm_supplier_risk_status', '待处理', 'OPEN', 1, 1, NULL),
(8224, 'srm_supplier_risk_status', '处理中', 'HANDLING', 2, 1, NULL),
(8225, 'srm_supplier_risk_status', '已关闭', 'CLOSED', 3, 1, NULL),
(8226, 'srm_supplier_grade_level', 'A级(战略)', 'A', 1, 1, NULL),
(8227, 'srm_supplier_grade_level', 'B级(核心)', 'B', 2, 1, NULL),
(8228, 'srm_supplier_grade_level', 'C级(一般)', 'C', 3, 1, NULL),
(8229, 'srm_supplier_grade_level', 'D级(观察)', 'D', 4, 1, NULL),
(8230, 'srm_supplier_grade_status', '草稿', 'DRAFT', 1, 1, NULL),
(8231, 'srm_supplier_grade_status', '已确认', 'CONFIRMED', 2, 1, NULL),
(8232, 'srm_supplier_grade_status', '已失效', 'OBSOLETE', 3, 1, NULL),
(8233, 'srm_supplier_blacklist_type', '永久', 'PERMANENT', 1, 1, NULL),
(8234, 'srm_supplier_blacklist_type', '临时', 'TEMPORARY', 2, 1, NULL),
(8235, 'srm_supplier_blacklist_status', '生效', 'ACTIVE', 1, 1, NULL),
(8236, 'srm_supplier_blacklist_status', '已解除', 'RELEASED', 2, 1, NULL),
(8237, 'srm_supplier_review_type', '年度复审', 'ANNUAL', 1, 1, NULL),
(8238, 'srm_supplier_review_type', '季度复审', 'QUARTERLY', 2, 1, NULL),
(8239, 'srm_supplier_review_type', '专项复审', 'SPECIAL', 3, 1, NULL),
(8240, 'srm_supplier_review_type', '触发复审', 'TRIGGERED', 4, 1, NULL),
(8241, 'srm_supplier_review_status', '待复审', 'PENDING', 1, 1, NULL),
(8242, 'srm_supplier_review_status', '复审中', 'IN_PROGRESS', 2, 1, NULL),
(8243, 'srm_supplier_review_status', '复审通过', 'PASSED', 3, 1, NULL),
(8244, 'srm_supplier_review_status', '复审不通过', 'FAILED', 4, 1, NULL),
(8245, 'srm_supplier_review_status', '已关闭', 'CLOSED', 5, 1, NULL),
(8246, 'srm_supplier_review_result', '保留', 'KEEP', 1, 1, NULL),
(8247, 'srm_supplier_review_result', '升级', 'UPGRADE', 2, 1, NULL),
(8248, 'srm_supplier_review_result', '降级', 'DOWNGRADE', 3, 1, NULL),
(8249, 'srm_supplier_review_result', '暂停', 'SUSPEND', 4, 1, NULL),
(8250, 'srm_supplier_review_result', '拉黑', 'BLACKLIST', 5, 1, NULL);

-- ========== SRM 供应商全生命周期可配置项（6330-6341） ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(6330, 'SRM', 'srm.supplier.enabled', '供应商全生命周期启用开关', 'true', 0, 1, 'SRM 供应商全生命周期总开关，默认启用'),
(6331, 'SRM', 'srm.supplier.code.rule', '供应商编码规则', 'SUP{序号}', 0, 1, '新建供应商主档编码规则'),
(6332, 'SRM', 'srm.supplier.admission.auto.number', '准入单自动编号', 'true', 0, 1, '准入单号为空时是否自动生成'),
(6333, 'SRM', 'srm.supplier.qualification.expire.warn.days', '资质到期预警天数', '30', 1, 1, '待业务方确认：资质到期前预警天数'),
(6334, 'SRM', 'srm.supplier.qualification.required', '资质必填校验', 'true', 1, 1, '待业务方确认：准入时是否强制校验关键资质齐全'),
(6335, 'SRM', 'srm.supplier.blacklist.enabled', '黑名单启用开关', 'true', 0, 1, '是否启用供应商黑名单控制'),
(6336, 'SRM', 'srm.supplier.blacklist.approve.required', '黑名单审批必填', 'true', 1, 1, '待业务方确认：加入黑名单是否需审批'),
(6337, 'SRM', 'srm.supplier.status.auto.suspend.on.blacklist', '黑名单自动暂停合作', 'true', 1, 1, '待业务方确认：加入黑名单后是否自动置为暂停合作'),
(6338, 'SRM', 'srm.supplier.grade.default.level', '供应商默认分级', 'C', 1, 1, '待业务方确认：新准入供应商默认级别'),
(6339, 'SRM', 'srm.supplier.risk.auto.alert', '风险自动预警', 'true', 1, 1, '待业务方确认：高风险供应商是否自动预警'),
(6340, 'SRM', 'srm.supplier.review.annual.enabled', '年度复审启用', 'true', 1, 1, '待业务方确认：是否启用年度复审计划'),
(6341, 'SRM', 'srm.supplier.review.cycle.months', '复审周期(月)', '12', 1, 1, '待业务方确认：供应商复审周期');
