-- G6-N5 MES—质量检验（WBS T041）初始化：菜单/按钮权限、角色授权、字典与可配置项。
-- 号段基线（V125 之后已占用的最大值）：sys_permission=4885（本脚本从 4886 起）、
-- sys_role_permission=15067（从 15068 起）、sys_dictionary=8838（从 8839 起）、sys_config=6707（从 6708 起）。
-- 菜单说明：MES 顶级菜单域（4830）已由 G6-N1 建立；质量检验（4886）为其下二级分组，
--          覆盖检验规范、来料检验、首件检验、巡检、末件检验、终检、检验判定、隔离。

-- ========== 质量检验分组菜单（4886，挂在 4830 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4886, 'mes:quality', '质量检验', 'menu', 4830, '/mes/quality', 'SafetyCertificateOutlined', 5, 1);

-- ========== 质量检验业务菜单（4887-4894，挂在 4886 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4887, 'mes:quality:spec', '检验规范', 'menu', 4886, '/mes/quality/specs', 'FileProtectOutlined', 1, 1),
(4888, 'mes:quality:incoming', '来料检验', 'menu', 4886, '/mes/quality/incomings', 'ImportOutlined', 2, 1),
(4889, 'mes:quality:first', '首件检验', 'menu', 4886, '/mes/quality/firsts', 'CheckCircleOutlined', 3, 1),
(4890, 'mes:quality:patrol', '巡检记录', 'menu', 4886, '/mes/quality/patrols', 'ScanOutlined', 4, 1),
(4891, 'mes:quality:last', '末件检验', 'menu', 4886, '/mes/quality/lasts', 'CheckSquareOutlined', 5, 1),
(4892, 'mes:quality:final', '终检记录', 'menu', 4886, '/mes/quality/finals', 'SafetyCertificateOutlined', 6, 1),
(4893, 'mes:quality:judge', '检验判定', 'menu', 4886, '/mes/quality/judges', 'AuditOutlined', 7, 1),
(4894, 'mes:quality:quarantine', '隔离记录', 'menu', 4886, '/mes/quality/quarantines', 'StopOutlined', 8, 1);

-- ========== 质量检验按钮（4895-4910） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4895, 'mes:quality:spec:list', '查询检验规范', 'button', 4887, NULL, NULL, 1, 1),
(4896, 'mes:quality:spec:manage', '维护检验规范', 'button', 4887, NULL, NULL, 2, 1),
(4897, 'mes:quality:incoming:list', '查询来料检验', 'button', 4888, NULL, NULL, 1, 1),
(4898, 'mes:quality:incoming:manage', '维护来料检验', 'button', 4888, NULL, NULL, 2, 1),
(4899, 'mes:quality:first:list', '查询首件检验', 'button', 4889, NULL, NULL, 1, 1),
(4900, 'mes:quality:first:manage', '维护首件检验', 'button', 4889, NULL, NULL, 2, 1),
(4901, 'mes:quality:patrol:list', '查询巡检记录', 'button', 4890, NULL, NULL, 1, 1),
(4902, 'mes:quality:patrol:manage', '维护巡检记录', 'button', 4890, NULL, NULL, 2, 1),
(4903, 'mes:quality:last:list', '查询末件检验', 'button', 4891, NULL, NULL, 1, 1),
(4904, 'mes:quality:last:manage', '维护末件检验', 'button', 4891, NULL, NULL, 2, 1),
(4905, 'mes:quality:final:list', '查询终检记录', 'button', 4892, NULL, NULL, 1, 1),
(4906, 'mes:quality:final:manage', '维护终检记录', 'button', 4892, NULL, NULL, 2, 1),
(4907, 'mes:quality:judge:list', '查询检验判定', 'button', 4893, NULL, NULL, 1, 1),
(4908, 'mes:quality:judge:manage', '维护检验判定', 'button', 4893, NULL, NULL, 2, 1),
(4909, 'mes:quality:quarantine:list', '查询隔离记录', 'button', 4894, NULL, NULL, 1, 1),
(4910, 'mes:quality:quarantine:manage', '维护隔离记录', 'button', 4894, NULL, NULL, 2, 1);

-- ========== 角色授权 ==========

-- 管理员（2001）：授予全部权限（1 分组 + 8 菜单 + 16 按钮，共 25 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(15068, 2001, 4886), (15069, 2001, 4887), (15070, 2001, 4888), (15071, 2001, 4889),
(15072, 2001, 4890), (15073, 2001, 4891), (15074, 2001, 4892), (15075, 2001, 4893),
(15076, 2001, 4894), (15077, 2001, 4895), (15078, 2001, 4896), (15079, 2001, 4897),
(15080, 2001, 4898), (15081, 2001, 4899), (15082, 2001, 4900), (15083, 2001, 4901),
(15084, 2001, 4902), (15085, 2001, 4903), (15086, 2001, 4904), (15087, 2001, 4905),
(15088, 2001, 4906), (15089, 2001, 4907), (15090, 2001, 4908), (15091, 2001, 4909),
(15092, 2001, 4910);

-- 质量工程师（2003）：授予全部权限（质量检验为质量主责，共 25 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(15093, 2003, 4886), (15094, 2003, 4887), (15095, 2003, 4888), (15096, 2003, 4889),
(15097, 2003, 4890), (15098, 2003, 4891), (15099, 2003, 4892), (15100, 2003, 4893),
(15101, 2003, 4894), (15102, 2003, 4895), (15103, 2003, 4896), (15104, 2003, 4897),
(15105, 2003, 4898), (15106, 2003, 4899), (15107, 2003, 4900), (15108, 2003, 4901),
(15109, 2003, 4902), (15110, 2003, 4903), (15111, 2003, 4904), (15112, 2003, 4905),
(15113, 2003, 4906), (15114, 2003, 4907), (15115, 2003, 4908), (15116, 2003, 4909),
(15117, 2003, 4910);

-- 研发工程师（2002）：授予分组/菜单 + 仅查询按钮（17 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(15118, 2002, 4886), (15119, 2002, 4887), (15120, 2002, 4888), (15121, 2002, 4889),
(15122, 2002, 4890), (15123, 2002, 4891), (15124, 2002, 4892), (15125, 2002, 4893),
(15126, 2002, 4894), (15127, 2002, 4895), (15128, 2002, 4897), (15129, 2002, 4899),
(15130, 2002, 4901), (15131, 2002, 4903), (15132, 2002, 4905), (15133, 2002, 4907),
(15134, 2002, 4909);

-- 供应链专员（2004）：授予分组/菜单 + 仅查询按钮（17 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(15135, 2004, 4886), (15136, 2004, 4887), (15137, 2004, 4888), (15138, 2004, 4889),
(15139, 2004, 4890), (15140, 2004, 4891), (15141, 2004, 4892), (15142, 2004, 4893),
(15143, 2004, 4894), (15144, 2004, 4895), (15145, 2004, 4897), (15146, 2004, 4899),
(15147, 2004, 4901), (15148, 2004, 4903), (15149, 2004, 4905), (15150, 2004, 4907),
(15151, 2004, 4909);

-- 生产现场（2005）：授予分组/菜单 + 仅查询按钮（17 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(15152, 2005, 4886), (15153, 2005, 4887), (15154, 2005, 4888), (15155, 2005, 4889),
(15156, 2005, 4890), (15157, 2005, 4891), (15158, 2005, 4892), (15159, 2005, 4893),
(15160, 2005, 4894), (15161, 2005, 4895), (15162, 2005, 4897), (15163, 2005, 4899),
(15164, 2005, 4901), (15165, 2005, 4903), (15166, 2005, 4905), (15167, 2005, 4907),
(15168, 2005, 4909);

-- 只读用户（2006）：授予分组/菜单 + 仅查询按钮（17 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(15169, 2006, 4886), (15170, 2006, 4887), (15171, 2006, 4888), (15172, 2006, 4889),
(15173, 2006, 4890), (15174, 2006, 4891), (15175, 2006, 4892), (15176, 2006, 4893),
(15177, 2006, 4894), (15178, 2006, 4895), (15179, 2006, 4897), (15180, 2006, 4899),
(15181, 2006, 4901), (15182, 2006, 4903), (15183, 2006, 4905), (15184, 2006, 4907),
(15185, 2006, 4909);

-- ========== 质量检验字典（8839-8869） ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(8839, 'mes_inspection_spec_type', '来料检验', 'INCOMING', 1, 1, NULL),
(8840, 'mes_inspection_spec_type', '首件检验', 'FIRST', 2, 1, NULL),
(8841, 'mes_inspection_spec_type', '巡检', 'PATROL', 3, 1, NULL),
(8842, 'mes_inspection_spec_type', '末件检验', 'LAST', 4, 1, NULL),
(8843, 'mes_inspection_spec_type', '终检', 'FINAL', 5, 1, NULL),
(8844, 'mes_inspection_spec_status', '草稿', 'DRAFT', 1, 1, NULL),
(8845, 'mes_inspection_spec_status', '生效', 'ACTIVE', 2, 1, NULL),
(8846, 'mes_inspection_spec_status', '失效', 'EXPIRED', 3, 1, NULL),
(8847, 'mes_inspection_spec_status', '已取消', 'CANCELLED', 4, 1, NULL),
(8848, 'mes_inspection_status', '待检', 'PENDING', 1, 1, NULL),
(8849, 'mes_inspection_status', '检验中', 'INSPECTING', 2, 1, NULL),
(8850, 'mes_inspection_status', '合格', 'PASSED', 3, 1, NULL),
(8851, 'mes_inspection_status', '不合格', 'FAILED', 4, 1, NULL),
(8852, 'mes_inspection_result', '合格', 'PASS', 1, 1, NULL),
(8853, 'mes_inspection_result', '不合格', 'FAIL', 2, 1, NULL),
(8854, 'mes_inspection_result', '让步接收', 'CONCESSION', 3, 1, NULL),
(8855, 'mes_inspection_judge_result', '合格', 'PASS', 1, 1, NULL),
(8856, 'mes_inspection_judge_result', '不合格', 'FAIL', 2, 1, NULL),
(8857, 'mes_inspection_judge_result', '返工', 'REWORK', 3, 1, NULL),
(8858, 'mes_inspection_judge_result', '报废', 'SCRAP', 4, 1, NULL),
(8859, 'mes_inspection_judge_result', '让步接收', 'CONCESSION', 5, 1, NULL),
(8860, 'mes_inspection_judge_status', '草稿', 'DRAFT', 1, 1, NULL),
(8861, 'mes_inspection_judge_status', '已确认', 'CONFIRMED', 2, 1, NULL),
(8862, 'mes_inspection_judge_status', '已取消', 'CANCELLED', 3, 1, NULL),
(8863, 'mes_quarantine_type', '疑似不合格', 'SUSPECT', 1, 1, NULL),
(8864, 'mes_quarantine_type', '不合格', 'DEFECT', 2, 1, NULL),
(8865, 'mes_quarantine_type', '返工待处理', 'REWORK', 3, 1, NULL),
(8866, 'mes_quarantine_status', '待处理', 'PENDING', 1, 1, NULL),
(8867, 'mes_quarantine_status', '已放行', 'RELEASED', 2, 1, NULL),
(8868, 'mes_quarantine_status', '已报废', 'SCRAPPED', 3, 1, NULL),
(8869, 'mes_quarantine_status', '已退货', 'RETURNED', 4, 1, NULL);

-- ========== 质量检验可配置项（6708-6719） ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(6708, 'MES', 'mes.quality.enabled', '质量检验启用开关', 'true', 0, 1, 'MES 质量检验总开关，默认启用'),
(6709, 'MES', 'mes.quality.spec.no.prefix', '检验规范编号前缀', 'MQS', 0, 1, '检验规范编号自动生成前缀'),
(6710, 'MES', 'mes.quality.incoming.no.prefix', '来料检验编号前缀', 'MIQ', 0, 1, '来料检验单编号自动生成前缀'),
(6711, 'MES', 'mes.quality.incoming.need.confirm', '来料检验需确认开关', 'true', 1, 1, '待业务方确认：来料检验结果是否需质量主管确认'),
(6712, 'MES', 'mes.quality.first.no.prefix', '首件检验编号前缀', 'MFA', 0, 1, '首件检验单编号自动生成前缀'),
(6713, 'MES', 'mes.quality.patrol.no.prefix', '巡检编号前缀', 'MPI', 0, 1, '巡检记录编号自动生成前缀'),
(6714, 'MES', 'mes.quality.patrol.interval.hours', '巡检默认间隔(小时)', '4', 1, 1, '待业务方确认：巡检默认时间间隔'),
(6715, 'MES', 'mes.quality.last.no.prefix', '末件检验编号前缀', 'MLA', 0, 1, '末件检验单编号自动生成前缀'),
(6716, 'MES', 'mes.quality.final.no.prefix', '终检编号前缀', 'MFI', 0, 1, '终检记录编号自动生成前缀'),
(6717, 'MES', 'mes.quality.judge.no.prefix', '检验判定编号前缀', 'MJG', 0, 1, '检验判定单编号自动生成前缀'),
(6718, 'MES', 'mes.quality.quarantine.no.prefix', '隔离记录编号前缀', 'MQT', 0, 1, '隔离记录编号自动生成前缀'),
(6719, 'MES', 'mes.quality.quarantine.need.approve', '隔离需审批开关', 'true', 1, 1, '待业务方确认：隔离处置是否需审批');
