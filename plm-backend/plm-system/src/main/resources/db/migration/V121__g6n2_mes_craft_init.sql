-- G6-N2 MES—工艺与作业（WBS T038）初始化：菜单/按钮权限、角色授权、字典与可配置项。
-- 号段基线（V119 之后已占用的最大值）：sys_permission=4840（本脚本从 4841 起）、
-- sys_role_permission=14853（从 14854 起）、sys_dictionary=8759（从 8760 起）、sys_config=6671（从 6672 起）。
-- 菜单说明：MES 顶级菜单域（4830）已由 G6-N1 建立；工艺与作业（4841）为其下二级分组，
--          覆盖工艺版本、SOP、参数配方、首件确认、换线换型。

-- ========== 工艺与作业分组菜单（4841，挂在 4830 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4841, 'mes:craft', '工艺与作业', 'menu', 4830, '/mes/craft', 'ExperimentOutlined', 2, 1);

-- ========== 工艺与作业业务菜单（4842-4846，挂在 4841 下） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4842, 'mes:craft:version', '工艺版本', 'menu', 4841, '/mes/craft/versions', 'BranchesOutlined', 1, 1),
(4843, 'mes:craft:sop', 'SOP作业指导书', 'menu', 4841, '/mes/craft/sops', 'FileTextOutlined', 2, 1),
(4844, 'mes:craft:recipe', '参数配方', 'menu', 4841, '/mes/craft/recipes', 'ExperimentOutlined', 3, 1),
(4845, 'mes:craft:fai', '首件确认', 'menu', 4841, '/mes/craft/fais', 'CheckCircleOutlined', 4, 1),
(4846, 'mes:craft:changeover', '换线换型', 'menu', 4841, '/mes/craft/changeovers', 'SwapOutlined', 5, 1);

-- ========== 工艺与作业按钮（4847-4856） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(4847, 'mes:craft:version:list', '查询工艺版本', 'button', 4842, NULL, NULL, 1, 1),
(4848, 'mes:craft:version:manage', '维护工艺版本', 'button', 4842, NULL, NULL, 2, 1),
(4849, 'mes:craft:sop:list', '查询SOP作业指导书', 'button', 4843, NULL, NULL, 1, 1),
(4850, 'mes:craft:sop:manage', '维护SOP作业指导书', 'button', 4843, NULL, NULL, 2, 1),
(4851, 'mes:craft:recipe:list', '查询参数配方', 'button', 4844, NULL, NULL, 1, 1),
(4852, 'mes:craft:recipe:manage', '维护参数配方', 'button', 4844, NULL, NULL, 2, 1),
(4853, 'mes:craft:fai:list', '查询首件确认', 'button', 4845, NULL, NULL, 1, 1),
(4854, 'mes:craft:fai:manage', '维护首件确认', 'button', 4845, NULL, NULL, 2, 1),
(4855, 'mes:craft:changeover:list', '查询换线换型', 'button', 4846, NULL, NULL, 1, 1),
(4856, 'mes:craft:changeover:manage', '维护换线换型', 'button', 4846, NULL, NULL, 2, 1);

-- ========== 角色授权 ==========

-- 管理员（2001）：授予全部权限（1 分组 + 5 菜单 + 10 按钮，共 16 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14854, 2001, 4841), (14855, 2001, 4842), (14856, 2001, 4843), (14857, 2001, 4844),
(14858, 2001, 4845), (14859, 2001, 4846), (14860, 2001, 4847), (14861, 2001, 4848),
(14862, 2001, 4849), (14863, 2001, 4850), (14864, 2001, 4851), (14865, 2001, 4852),
(14866, 2001, 4853), (14867, 2001, 4854), (14868, 2001, 4855), (14869, 2001, 4856);

-- 生产现场（2005）：授予全部权限（工艺与作业为生产主责，共 16 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14870, 2005, 4841), (14871, 2005, 4842), (14872, 2005, 4843), (14873, 2005, 4844),
(14874, 2005, 4845), (14875, 2005, 4846), (14876, 2005, 4847), (14877, 2005, 4848),
(14878, 2005, 4849), (14879, 2005, 4850), (14880, 2005, 4851), (14881, 2005, 4852),
(14882, 2005, 4853), (14883, 2005, 4854), (14884, 2005, 4855), (14885, 2005, 4856);

-- 研发工程师（2002）：授予分组/菜单 + 仅查询按钮（11 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14886, 2002, 4841), (14887, 2002, 4842), (14888, 2002, 4843), (14889, 2002, 4844),
(14890, 2002, 4845), (14891, 2002, 4846), (14892, 2002, 4847), (14893, 2002, 4849),
(14894, 2002, 4851), (14895, 2002, 4853), (14896, 2002, 4855);

-- 质量工程师（2003）：授予分组/菜单 + 仅查询按钮（11 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14897, 2003, 4841), (14898, 2003, 4842), (14899, 2003, 4843), (14900, 2003, 4844),
(14901, 2003, 4845), (14902, 2003, 4846), (14903, 2003, 4847), (14904, 2003, 4849),
(14905, 2003, 4851), (14906, 2003, 4853), (14907, 2003, 4855);

-- 供应链专员（2004）：授予分组/菜单 + 仅查询按钮（11 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14908, 2004, 4841), (14909, 2004, 4842), (14910, 2004, 4843), (14911, 2004, 4844),
(14912, 2004, 4845), (14913, 2004, 4846), (14914, 2004, 4847), (14915, 2004, 4849),
(14916, 2004, 4851), (14917, 2004, 4853), (14918, 2004, 4855);

-- 只读用户（2006）：授予分组/菜单 + 仅查询按钮（11 项）
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(14919, 2006, 4841), (14920, 2006, 4842), (14921, 2006, 4843), (14922, 2006, 4844),
(14923, 2006, 4845), (14924, 2006, 4846), (14925, 2006, 4847), (14926, 2006, 4849),
(14927, 2006, 4851), (14928, 2006, 4853), (14929, 2006, 4855);

-- ========== 工艺与作业字典（8760-8783） ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(8760, 'mes_process_version_status', '草稿', 'DRAFT', 1, 1, NULL),
(8761, 'mes_process_version_status', '已发布', 'RELEASED', 2, 1, NULL),
(8762, 'mes_process_version_status', '已失效', 'OBSOLETE', 3, 1, NULL),
(8763, 'mes_process_version_status', '已取消', 'CANCELLED', 4, 1, NULL),
(8764, 'mes_sop_status', '草稿', 'DRAFT', 1, 1, NULL),
(8765, 'mes_sop_status', '已发布', 'RELEASED', 2, 1, NULL),
(8766, 'mes_sop_status', '已失效', 'OBSOLETE', 3, 1, NULL),
(8767, 'mes_recipe_status', '草稿', 'DRAFT', 1, 1, NULL),
(8768, 'mes_recipe_status', '已发布', 'RELEASED', 2, 1, NULL),
(8769, 'mes_recipe_status', '已失效', 'OBSOLETE', 3, 1, NULL),
(8770, 'mes_fai_status', '待确认', 'PENDING', 1, 1, NULL),
(8771, 'mes_fai_status', '已通过', 'PASSED', 2, 1, NULL),
(8772, 'mes_fai_status', '未通过', 'FAILED', 3, 1, NULL),
(8773, 'mes_fai_status', '已取消', 'CANCELLED', 4, 1, NULL),
(8774, 'mes_fai_result', '合格', 'PASS', 1, 1, NULL),
(8775, 'mes_fai_result', '不合格', 'FAIL', 2, 1, NULL),
(8776, 'mes_fai_result', '让步接收', 'CONCESSION', 3, 1, NULL),
(8777, 'mes_changeover_type', '换型', 'MODEL', 1, 1, NULL),
(8778, 'mes_changeover_type', '换料', 'MATERIAL', 2, 1, NULL),
(8779, 'mes_changeover_type', '换工艺', 'ROUTE', 3, 1, NULL),
(8780, 'mes_changeover_status', '草稿', 'DRAFT', 1, 1, NULL),
(8781, 'mes_changeover_status', '进行中', 'IN_PROGRESS', 2, 1, NULL),
(8782, 'mes_changeover_status', '已完成', 'COMPLETED', 3, 1, NULL),
(8783, 'mes_changeover_status', '已取消', 'CANCELLED', 4, 1, NULL);

-- ========== 工艺与作业可配置项（6672-6683） ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(6672, 'MES', 'mes.craft.enabled', '工艺与作业启用开关', 'true', 0, 1, 'MES 工艺与作业总开关，默认启用'),
(6673, 'MES', 'mes.process.version.no.prefix', '工艺版本号前缀', 'MPV', 0, 1, '工艺版本单号自动生成前缀'),
(6674, 'MES', 'mes.process.version.approve.required', '工艺版本需审批开关', 'true', 1, 1, '待业务方确认：工艺版本发布是否需审批'),
(6675, 'MES', 'mes.process.version.default.status', '工艺版本默认状态', 'DRAFT', 1, 1, '待业务方确认：工艺版本默认状态'),
(6676, 'MES', 'mes.sop.no.prefix', 'SOP单号前缀', 'MSOP', 0, 1, 'SOP 作业指导书单号自动生成前缀'),
(6677, 'MES', 'mes.sop.file.required', 'SOP附件必填开关', 'false', 1, 1, '待业务方确认：SOP 是否必须上传附件'),
(6678, 'MES', 'mes.recipe.no.prefix', '参数配方单号前缀', 'MRC', 0, 1, '参数配方单号自动生成前缀'),
(6679, 'MES', 'mes.recipe.limit.check', '配方上下限校验开关', 'true', 1, 1, '待业务方确认：配方参数是否校验上下限'),
(6680, 'MES', 'mes.fai.no.prefix', '首件确认单号前缀', 'MFA', 0, 1, '首件确认单号自动生成前缀'),
(6681, 'MES', 'mes.fai.required.before.prod', '首件确认前置开关', 'true', 1, 1, '待业务方确认：投产前是否强制首件确认'),
(6682, 'MES', 'mes.changeover.no.prefix', '换线换型单号前缀', 'MCO', 0, 1, '换线换型单号自动生成前缀'),
(6683, 'MES', 'mes.changeover.default.type', '换线换型默认类型', 'MODEL', 1, 1, '待业务方确认：换线换型默认类型');
