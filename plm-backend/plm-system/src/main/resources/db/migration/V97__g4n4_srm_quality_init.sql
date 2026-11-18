-- G4-N4 SRM—供应商质量（WBS T034）初始化：菜单/按钮权限、角色授权、字典与可配置项。
-- 号段基线（V95 之后已占用的最大值）：sys_permission=4625（本脚本从 4630 起）、
-- sys_role_permission=14075（从 14090 起）、sys_dictionary=8346（从 8350 起）、sys_config=6380（从 6390 起）。
-- 菜单说明：复用 V91 已建的 SRM 顶级菜单域（4550）；
--           供应商质量（4630）为其下二级分组；质量检验/审批复用既有平台底座。

-- ========== SRM 供应商质量分组菜单（4630，挂在 4550 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4630, 'srm:quality', '供应商质量', 'menu', 4550, '/srm/quality', 'ExperimentOutlined', 4, 1);

-- ========== SRM 供应商质量业务菜单（4631-4634，挂在 4630 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4631, 'srm:quality:iqc', '来料质量', 'menu', 4630, '/srm/quality/iqc', 'FileProtectOutlined', 1, 1),
(4632, 'srm:quality:assessment', '供应商考评', 'menu', 4630, '/srm/quality/assessments', 'RadarChartOutlined', 2, 1),
(4633, 'srm:quality:eightd', '8D报告', 'menu', 4630, '/srm/quality/eightd', 'AlertOutlined', 3, 1),
(4634, 'srm:quality:rectification', '整改跟踪', 'menu', 4630, '/srm/quality/rectifications', 'CheckSquareOutlined', 4, 1);

-- ========== SRM 供应商质量按钮（4635-4642） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4635, 'srm:quality:iqc:list', '查询来料质量', 'button', 4631, NULL, NULL, 1, 1),
(4636, 'srm:quality:iqc:manage', '维护来料质量', 'button', 4631, NULL, NULL, 2, 1),
(4637, 'srm:quality:assessment:list', '查询供应商考评', 'button', 4632, NULL, NULL, 1, 1),
(4638, 'srm:quality:assessment:manage', '维护供应商考评', 'button', 4632, NULL, NULL, 2, 1),
(4639, 'srm:quality:eightd:list', '查询8D报告', 'button', 4633, NULL, NULL, 1, 1),
(4640, 'srm:quality:eightd:manage', '维护8D报告', 'button', 4633, NULL, NULL, 2, 1),
(4641, 'srm:quality:rectification:list', '查询整改跟踪', 'button', 4634, NULL, NULL, 1, 1),
(4642, 'srm:quality:rectification:manage', '维护整改跟踪', 'button', 4634, NULL, NULL, 2, 1);

-- ========== 角色授权 ==========

-- 管理员（2001）：授予全部权限（1 分组 + 4 菜单 + 8 按钮，共 13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14090, 2001, 4630), (14091, 2001, 4631), (14092, 2001, 4632), (14093, 2001, 4633),
(14094, 2001, 4634), (14095, 2001, 4635), (14096, 2001, 4636), (14097, 2001, 4637),
(14098, 2001, 4638), (14099, 2001, 4639), (14100, 2001, 4640), (14101, 2001, 4641),
(14102, 2001, 4642);

-- 供应链专员（2004）：授予全部权限（共 13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14103, 2004, 4630), (14104, 2004, 4631), (14105, 2004, 4632), (14106, 2004, 4633),
(14107, 2004, 4634), (14108, 2004, 4635), (14109, 2004, 4636), (14110, 2004, 4637),
(14111, 2004, 4638), (14112, 2004, 4639), (14113, 2004, 4640), (14114, 2004, 4641),
(14115, 2004, 4642);

-- 质量工程师（2003）：授予全部权限（供应商质量为质量职能主责，共 13 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14116, 2003, 4630), (14117, 2003, 4631), (14118, 2003, 4632), (14119, 2003, 4633),
(14120, 2003, 4634), (14121, 2003, 4635), (14122, 2003, 4636), (14123, 2003, 4637),
(14124, 2003, 4638), (14125, 2003, 4639), (14126, 2003, 4640), (14127, 2003, 4641),
(14128, 2003, 4642);

-- 研发工程师（2002）：授予分组/菜单 + 仅查询按钮（9 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14129, 2002, 4630), (14130, 2002, 4631), (14131, 2002, 4632), (14132, 2002, 4633),
(14133, 2002, 4634), (14134, 2002, 4635), (14135, 2002, 4637), (14136, 2002, 4639),
(14137, 2002, 4641);

-- 生产现场（2005）：授予分组/菜单 + 仅查询按钮（9 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14138, 2005, 4630), (14139, 2005, 4631), (14140, 2005, 4632), (14141, 2005, 4633),
(14142, 2005, 4634), (14143, 2005, 4635), (14144, 2005, 4637), (14145, 2005, 4639),
(14146, 2005, 4641);

-- 只读用户（2006）：授予分组/菜单 + 仅查询按钮（9 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14147, 2006, 4630), (14148, 2006, 4631), (14149, 2006, 4632), (14150, 2006, 4633),
(14151, 2006, 4634), (14152, 2006, 4635), (14153, 2006, 4637), (14154, 2006, 4639),
(14155, 2006, 4641);

-- ========== SRM 供应商质量字典（8350-8379） ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(8350, 'srm_iqc_result', '合格', 'PASS', 1, 1, NULL),
(8351, 'srm_iqc_result', '不合格', 'FAIL', 2, 1, NULL),
(8352, 'srm_iqc_result', '让步接收', 'CONCESSION', 3, 1, NULL),
(8353, 'srm_iqc_result', '待检验', 'PENDING', 4, 1, NULL),
(8354, 'srm_iqc_status', '草稿', 'DRAFT', 1, 1, NULL),
(8355, 'srm_iqc_status', '已提交', 'SUBMITTED', 2, 1, NULL),
(8356, 'srm_iqc_status', '已确认', 'CONFIRMED', 3, 1, NULL),
(8357, 'srm_iqc_status', '已取消', 'CANCELLED', 4, 1, NULL),
(8358, 'srm_assessment_type', '月度考评', 'MONTHLY', 1, 1, NULL),
(8359, 'srm_assessment_type', '季度考评', 'QUARTERLY', 2, 1, NULL),
(8360, 'srm_assessment_type', '年度考评', 'ANNUAL', 3, 1, NULL),
(8361, 'srm_assessment_grade', 'A级', 'A', 1, 1, NULL),
(8362, 'srm_assessment_grade', 'B级', 'B', 2, 1, NULL),
(8363, 'srm_assessment_grade', 'C级', 'C', 3, 1, NULL),
(8364, 'srm_assessment_grade', 'D级', 'D', 4, 1, NULL),
(8365, 'srm_assessment_status', '草稿', 'DRAFT', 1, 1, NULL),
(8366, 'srm_assessment_status', '已提交', 'SUBMITTED', 2, 1, NULL),
(8367, 'srm_assessment_status', '已批准', 'APPROVED', 3, 1, NULL),
(8368, 'srm_assessment_status', '已取消', 'CANCELLED', 4, 1, NULL),
(8369, 'srm_eightd_status', '草稿', 'DRAFT', 1, 1, NULL),
(8370, 'srm_eightd_status', '进行中', 'IN_PROGRESS', 2, 1, NULL),
(8371, 'srm_eightd_status', '已提交', 'SUBMITTED', 3, 1, NULL),
(8372, 'srm_eightd_status', '已关闭', 'CLOSED', 4, 1, NULL),
(8373, 'srm_eightd_status', '已取消', 'CANCELLED', 5, 1, NULL),
(8374, 'srm_rectification_status', '待整改', 'PENDING', 1, 1, NULL),
(8375, 'srm_rectification_status', '整改中', 'IN_PROGRESS', 2, 1, NULL),
(8376, 'srm_rectification_status', '已完成', 'COMPLETED', 3, 1, NULL),
(8377, 'srm_rectification_status', '已验证', 'VERIFIED', 4, 1, NULL),
(8378, 'srm_rectification_status', '已关闭', 'CLOSED', 5, 1, NULL),
(8379, 'srm_rectification_status', '已取消', 'CANCELLED', 6, 1, NULL);

-- ========== SRM 供应商质量可配置项（6390-6401） ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(6390, 'SRM', 'srm.quality.enabled', '供应商质量启用开关', 'true', 0, 1, 'SRM 供应商质量总开关，默认启用'),
(6391, 'SRM', 'srm.quality.iqc.sample.ratio', '来料抽检比例%', '10', 1, 1, '待业务方确认：来料检验默认抽检比例（%）'),
(6392, 'SRM', 'srm.quality.iqc.defect.threshold', '来料不良率阈值%', '2', 1, 1, '待业务方确认：判定不合格的不良率阈值（%）'),
(6393, 'SRM', 'srm.quality.assessment.quality.weight', '考评质量得分权重%', '30', 1, 1, '待业务方确认：供应商考评质量维度权重（%）'),
(6394, 'SRM', 'srm.quality.assessment.delivery.weight', '考评交期得分权重%', '30', 1, 1, '待业务方确认：供应商考评交期维度权重（%）'),
(6395, 'SRM', 'srm.quality.assessment.price.weight', '考评价格得分权重%', '20', 1, 1, '待业务方确认：供应商考评价格维度权重（%）'),
(6396, 'SRM', 'srm.quality.assessment.service.weight', '考评服务得分权重%', '20', 1, 1, '待业务方确认：供应商考评服务维度权重（%）'),
(6397, 'SRM', 'srm.quality.assessment.grade.a.score', 'A级分数下限', '90', 1, 1, '待业务方确认：A 级供应商综合得分下限'),
(6398, 'SRM', 'srm.quality.assessment.grade.b.score', 'B级分数下限', '80', 1, 1, '待业务方确认：B 级供应商综合得分下限'),
(6399, 'SRM', 'srm.quality.assessment.grade.c.score', 'C级分数下限', '60', 1, 1, '待业务方确认：C 级供应商综合得分下限'),
(6400, 'SRM', 'srm.quality.eightd.close.days', '8D 关闭时限天数', '30', 1, 1, '待业务方确认：8D 报告要求关闭时限（天）'),
(6401, 'SRM', 'srm.quality.rectification.verify.required', '整改验证必填', 'true', 1, 1, '待业务方确认：整改完成是否必须验证');
