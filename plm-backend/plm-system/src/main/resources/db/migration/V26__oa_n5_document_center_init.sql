-- OA-N5 初始化数据：文档中心与知识管理菜单、按钮权限、角色授权、字典、可配置项与样例目录文档
-- 说明：目录类型、文档状态、权限级别、授权对象、分享方式、审计动作均为可配置数据；
--       在线预览与病毒扫描组件许可待业务方确认后开启（IF-OA-08）。

-- ========== OA-N5 权限（菜单 3740-3741，按钮 3742-3751） ==========

INSERT INTO sys_permission (id, permission_code, permission_name, permission_type, parent_id, path, icon, sort_no, status) VALUES
(3740, 'oa-document', '文档中心', 'menu', 3600, '/oa/documents', 'FolderOpenOutlined', 16, 1),
(3741, 'oa-knowledge', '知识库', 'menu', 3600, '/oa/knowledge', 'ReadOutlined', 17, 1),
(3742, 'oa:doc:list', '查询文档', 'button', 3740, NULL, NULL, 1, 1),
(3743, 'oa:doc:upload', '上传文档', 'button', 3740, NULL, NULL, 2, 1),
(3744, 'oa:doc:edit', '维护文档', 'button', 3740, NULL, NULL, 3, 1),
(3745, 'oa:doc:delete', '删除文档', 'button', 3740, NULL, NULL, 4, 1),
(3746, 'oa:doc:version', '管理文档版本', 'button', 3740, NULL, NULL, 5, 1),
(3747, 'oa:doc:comment', '文档评论', 'button', 3740, NULL, NULL, 6, 1),
(3748, 'oa:doc:share', '文档分享', 'button', 3740, NULL, NULL, 7, 1),
(3749, 'oa:doc:folder', '维护文档目录', 'button', 3740, NULL, NULL, 8, 1),
(3750, 'oa:doc:recycle', '回收站管理', 'button', 3740, NULL, NULL, 9, 1),
(3751, 'oa:doc:search', '文档检索', 'button', 3741, NULL, NULL, 1, 1);

-- 管理员（2001）：授予 OA-N5 全部权限
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11210, 2001, 3740), (11211, 2001, 3741), (11212, 2001, 3742), (11213, 2001, 3743),
(11214, 2001, 3744), (11215, 2001, 3745), (11216, 2001, 3746), (11217, 2001, 3747),
(11218, 2001, 3748), (11219, 2001, 3749), (11220, 2001, 3750), (11221, 2001, 3751);

-- 只读用户（2006）：文档中心与知识库菜单 + 仅查询与检索
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11222, 2006, 3740), (11223, 2006, 3741), (11224, 2006, 3742), (11225, 2006, 3751);

-- 研发工程师（2002）：文档中心（含上传/维护/版本/评论/分享）与知识库检索
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11226, 2002, 3740), (11227, 2002, 3741), (11228, 2002, 3742), (11229, 2002, 3743),
(11230, 2002, 3744), (11231, 2002, 3746), (11232, 2002, 3747), (11233, 2002, 3748),
(11234, 2002, 3751);

-- 质量工程师（2003）：同研发工程师
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11235, 2003, 3740), (11236, 2003, 3741), (11237, 2003, 3742), (11238, 2003, 3743),
(11239, 2003, 3744), (11240, 2003, 3746), (11241, 2003, 3747), (11242, 2003, 3748),
(11243, 2003, 3751);

-- 供应链专员（2004）：同研发工程师
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11244, 2004, 3740), (11245, 2004, 3741), (11246, 2004, 3742), (11247, 2004, 3743),
(11248, 2004, 3744), (11249, 2004, 3746), (11250, 2004, 3747), (11251, 2004, 3748),
(11252, 2004, 3751);

-- 生产现场（2005）：文档中心（上传、评论）与知识库检索
INSERT INTO sys_role_permission (id, role_id, permission_id) VALUES
(11253, 2005, 3740), (11254, 2005, 3741), (11255, 2005, 3742), (11256, 2005, 3743),
(11257, 2005, 3747), (11258, 2005, 3751);

-- ========== OA-N5 字典 ==========

INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(6281, 'oa_doc_folder_type', '公共目录', 'PUBLIC', 1, 1, NULL),
(6282, 'oa_doc_folder_type', '部门目录', 'DEPARTMENT', 2, 1, NULL),
(6283, 'oa_doc_folder_type', '项目目录', 'PROJECT', 3, 1, NULL),
(6284, 'oa_doc_folder_type', '个人目录', 'PERSONAL', 4, 1, NULL),
(6285, 'oa_doc_folder_type', '共享目录', 'SHARED', 5, 1, NULL),
(6286, 'oa_doc_folder_type', '流程归档', 'ARCHIVE', 6, 1, NULL),
(6287, 'oa_doc_folder_type', '知识库', 'KNOWLEDGE', 7, 1, NULL),
(6291, 'oa_doc_status', '草稿', 'DRAFT', 1, 1, NULL),
(6292, 'oa_doc_status', '审批中', 'IN_REVIEW', 2, 1, NULL),
(6293, 'oa_doc_status', '已发布', 'PUBLISHED', 3, 1, NULL),
(6294, 'oa_doc_status', '已作废', 'VOID', 4, 1, NULL),
(6295, 'oa_doc_status', '已归档', 'ARCHIVED', 5, 1, NULL),
(6301, 'oa_doc_permission_level', '只读', 'READ', 1, 1, NULL),
(6302, 'oa_doc_permission_level', '可写', 'WRITE', 2, 1, NULL),
(6303, 'oa_doc_permission_level', '管理', 'MANAGE', 3, 1, NULL),
(6311, 'oa_doc_subject_type', '所有人', 'ALL', 1, 1, NULL),
(6312, 'oa_doc_subject_type', '部门', 'DEPT', 2, 1, NULL),
(6313, 'oa_doc_subject_type', '角色', 'ROLE', 3, 1, NULL),
(6314, 'oa_doc_subject_type', '指定用户', 'USER', 4, 1, NULL),
(6321, 'oa_doc_share_type', '内部分享', 'INTERNAL', 1, 1, NULL),
(6322, 'oa_doc_share_type', '链接分享', 'LINK', 2, 1, NULL),
(6331, 'oa_doc_access_action', '查看', 'VIEW', 1, 1, NULL),
(6332, 'oa_doc_access_action', '预览', 'PREVIEW', 2, 1, NULL),
(6333, 'oa_doc_access_action', '下载', 'DOWNLOAD', 3, 1, NULL),
(6334, 'oa_doc_access_action', '编辑', 'EDIT', 4, 1, NULL),
(6335, 'oa_doc_access_action', '删除', 'DELETE', 5, 1, NULL),
(6336, 'oa_doc_access_action', '分享', 'SHARE', 6, 1, NULL),
(6337, 'oa_doc_access_action', '恢复', 'RESTORE', 7, 1, NULL),
(6341, 'oa_doc_source_type', '手工创建', 'MANUAL', 1, 1, NULL),
(6342, 'oa_doc_source_type', '流程归档', 'WORKFLOW', 2, 1, NULL),
(6343, 'oa_doc_source_type', '邮件归档', 'MAIL', 3, 1, NULL),
(6344, 'oa_doc_source_type', '迁移导入', 'IMPORT', 4, 1, NULL),
(6351, 'oa_doc_scan_status', '待扫描', 'PENDING', 1, 1, NULL),
(6352, 'oa_doc_scan_status', '安全', 'CLEAN', 2, 1, NULL),
(6353, 'oa_doc_scan_status', '存在风险', 'INFECTED', 3, 1, NULL);

-- ========== OA-N5 可配置项：限值与保留策略先落默认值，待业务方确认 ==========

INSERT INTO sys_config (id, category, config_key, config_name, config_value, pending_confirm, editable, remark) VALUES
(5940, 'OA', 'oa.doc.storage.dir', '文档存储目录', './data/oa-documents', 0, 1, '生产环境建议切换为对象存储，避免绑定单一厂商'),
(5941, 'OA', 'oa.doc.upload.max.size.mb', '文档上传大小上限（MB）', '50', 1, 1, '待业务方确认单文件与总量配额'),
(5942, 'OA', 'oa.doc.preview.enabled', '启用文档在线预览', 'false', 1, 1, '预览组件许可待核查（IF-OA-08）；关闭时仅提供原文件下载'),
(5943, 'OA', 'oa.doc.scan.enabled', '启用文档病毒扫描', 'false', 1, 1, '扫描组件许可待核查（IF-OA-08）；关闭时不执行扫描，版本扫描状态直接置为安全'),
(5944, 'OA', 'oa.doc.no.prefix', '文档编号前缀', 'DOC-', 0, 1, NULL),
(5945, 'OA', 'oa.doc.version.max.keep', '单文档保留历史版本数', '20', 1, 1, '超出后自动清理最旧版本，保留策略待业务方确认'),
(5946, 'OA', 'oa.doc.share.default.expire.days', '分享默认有效期（天）', '7', 1, 1, '默认有效期与是否允许永久分享待业务方确认'),
(5947, 'OA', 'oa.doc.default.permission.level', '新建目录默认权限级别', 'READ', 0, 1, NULL),
(5948, 'OA', 'oa.doc.search.index.enabled', '启用统一检索索引', 'true', 0, 1, '关闭时检索仅覆盖标题与关键词，不做正文索引'),
(5949, 'OA', 'oa.doc.recycle.keep.days', '回收站保留天数', '30', 1, 1, '保留与彻底清理策略待业务方确认'),
(5950, 'OA', 'oa.doc.folder.custom.enabled', '允许创建自定义目录', 'true', 0, 1, NULL);

-- ========== OA-N5 样例数据：仅用于联调与验收演示，实施时由业务方通过界面或迁移工具替换 ==========

-- 根目录与知识库分类目录
INSERT INTO oa_doc_folder (id, folder_code, folder_name, folder_type, parent_id, folder_path, folder_level, category_code, sort_no, status, created_by, created_at) VALUES
(7701, 'PUBLIC_ROOT', '公共目录', 'PUBLIC', 0, '/PUBLIC_ROOT', 1, NULL, 1, 'enabled', 9001, CURRENT_TIMESTAMP),
(7702, 'DEPT_ROOT', '部门目录', 'DEPARTMENT', 0, '/DEPT_ROOT', 1, NULL, 2, 'enabled', 9001, CURRENT_TIMESTAMP),
(7703, 'KNOWLEDGE_ROOT', '知识库', 'KNOWLEDGE', 0, '/KNOWLEDGE_ROOT', 1, NULL, 3, 'enabled', 9001, CURRENT_TIMESTAMP),
(7704, 'PROJECT_ROOT', '项目目录', 'PROJECT', 0, '/PROJECT_ROOT', 1, NULL, 4, 'enabled', 9001, CURRENT_TIMESTAMP),
(7705, 'SHARED_ROOT', '共享目录', 'SHARED', 0, '/SHARED_ROOT', 1, NULL, 5, 'enabled', 9001, CURRENT_TIMESTAMP),
(7706, 'ARCHIVE_ROOT', '流程归档', 'ARCHIVE', 0, '/ARCHIVE_ROOT', 1, NULL, 6, 'enabled', 9001, CURRENT_TIMESTAMP),
(7707, 'KNOWLEDGE_ISO', 'ISO 体系', 'KNOWLEDGE', 7703, '/KNOWLEDGE_ROOT/KNOWLEDGE_ISO', 2, 'ISO', 1, 'enabled', 9001, CURRENT_TIMESTAMP),
(7708, 'KNOWLEDGE_LESSON', '经验教训库', 'KNOWLEDGE', 7703, '/KNOWLEDGE_ROOT/KNOWLEDGE_LESSON', 2, 'LESSON', 2, 'enabled', 9001, CURRENT_TIMESTAMP),
(7709, 'KNOWLEDGE_CUSTOMER', '客户明示要求', 'KNOWLEDGE', 7703, '/KNOWLEDGE_ROOT/KNOWLEDGE_CUSTOMER', 2, 'CUSTOMER', 3, 'enabled', 9001, CURRENT_TIMESTAMP),
(7710, 'KNOWLEDGE_QUALITY', '质量数据库', 'KNOWLEDGE', 7703, '/KNOWLEDGE_ROOT/KNOWLEDGE_QUALITY', 2, 'QUALITY', 4, 'enabled', 9001, CURRENT_TIMESTAMP);

-- 目录权限：公共目录与知识库对所有人只读，公共目录根授予管理员写权限
INSERT INTO oa_doc_folder_permission (id, folder_id, subject_type, subject_id, permission_level, inherit_flag, remark, created_by, created_at) VALUES
(7741, 7701, 'ALL', NULL, 'READ', 1, '公共目录对全员只读，可写权限按部门/角色单独授予', 9001, CURRENT_TIMESTAMP),
(7742, 7703, 'ALL', NULL, 'READ', 1, '知识库对全员只读', 9001, CURRENT_TIMESTAMP),
(7743, 7702, 'DEPT', 1001, 'WRITE', 1, '示例：研发部门对部门目录可写，实施时按组织调整', 9001, CURRENT_TIMESTAMP);

-- 样例文档（含当前版本指向）
INSERT INTO oa_document (id, doc_no, title, folder_id, doc_type, status, source_type, owner_user_id, owner_name, current_version_id, current_version_no, file_name, file_size, content_type, summary, keywords, tags, published_at, archived_flag, view_count, download_count, remark, created_by, created_at) VALUES
(7721, 'DOC-DEMO-0001', '质量手册（演示）', 7707, 'ISO', 'PUBLISHED', 'MANUAL', 9001, '系统管理员', 7731, 1, '质量手册.pdf', 102400, 'application/pdf',
 'ISO 体系质量手册演示文档，用于联调与验收演示', '质量手册,ISO,体系', 'ISO,质量', CURRENT_TIMESTAMP, 0, 0, 0, '样例数据，实施时由迁移工具或业务方替换', 9001, CURRENT_TIMESTAMP),
(7722, 'DOC-DEMO-0002', '8D 问题改善经验教训（演示）', 7708, 'LESSON', 'PUBLISHED', 'MANUAL', 9001, '系统管理员', 7732, 1, '8D经验教训.docx', 51200, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
 '经验教训库演示文档', '8D,经验教训,问题改善', '经验教训', CURRENT_TIMESTAMP, 0, 0, 0, '样例数据', 9001, CURRENT_TIMESTAMP),
(7723, 'DOC-DEMO-0003', '客户特殊要求清单（演示）', 7709, 'CUSTOMER', 'PUBLISHED', 'MANUAL', 9001, '系统管理员', 7733, 1, '客户特殊要求清单.xlsx', 30720, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
 '客户明示要求演示文档', '客户要求,特殊特性', '客户', CURRENT_TIMESTAMP, 0, 0, 0, '样例数据', 9001, CURRENT_TIMESTAMP);

-- 样例文档版本（storage_path 仅为演示占位，实际文件由上传接口写入存储目录）
INSERT INTO oa_doc_version (id, doc_id, version_no, revision_note, file_name, file_size, content_type, file_hash, storage_path, scan_status, scan_at, published_flag, current_flag, lock_flag, uploaded_by_user_id, remark, created_by, created_at) VALUES
(7731, 7721, 1, '初始版本', '质量手册.pdf', 102400, 'application/pdf', 'demo-doc-0001-v1', 'demo/质量手册-v1.pdf', 'CLEAN', CURRENT_TIMESTAMP, 1, 1, 0, 9001, '样例版本，无实际文件', 9001, CURRENT_TIMESTAMP),
(7732, 7722, 1, '初始版本', '8D经验教训.docx', 51200, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'demo-doc-0002-v1', 'demo/8D经验教训-v1.docx', 'CLEAN', CURRENT_TIMESTAMP, 1, 1, 0, 9001, '样例版本，无实际文件', 9001, CURRENT_TIMESTAMP),
(7733, 7723, 1, '初始版本', '客户特殊要求清单.xlsx', 30720, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'demo-doc-0003-v1', 'demo/客户特殊要求清单-v1.xlsx', 'CLEAN', CURRENT_TIMESTAMP, 1, 1, 0, 9001, '样例版本，无实际文件', 9001, CURRENT_TIMESTAMP);

-- 样例检索索引
INSERT INTO oa_doc_search_index (id, source_type, source_id, biz_no, title, content_text, keywords, folder_id, doc_id, owner_user_id, permission_scope, indexed_at, created_by, created_at) VALUES
(7761, 'DOCUMENT', 7721, 'DOC-DEMO-0001', '质量手册（演示）', 'ISO 体系质量手册演示文档，用于联调与验收演示', '质量手册,ISO,体系', 7707, 7721, 9001, 'PUBLIC', CURRENT_TIMESTAMP, 9001, CURRENT_TIMESTAMP),
(7762, 'DOCUMENT', 7722, 'DOC-DEMO-0002', '8D 问题改善经验教训（演示）', '经验教训库演示文档', '8D,经验教训,问题改善', 7708, 7722, 9001, 'PUBLIC', CURRENT_TIMESTAMP, 9001, CURRENT_TIMESTAMP),
(7763, 'DOCUMENT', 7723, 'DOC-DEMO-0003', '客户特殊要求清单（演示）', '客户明示要求演示文档', '客户要求,特殊特性', 7709, 7723, 9001, 'PUBLIC', CURRENT_TIMESTAMP, 9001, CURRENT_TIMESTAMP);
