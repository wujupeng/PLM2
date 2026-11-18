-- OA-N5 企业文档中心与知识管理：目录、目录权限映射、文档、版本、评论、分享、访问审计、统一检索索引
-- 说明：SQL 同时兼容 PostgreSQL 与 H2（PostgreSQL 兼容模式），主键由应用侧雪花算法生成。
-- 设计原则：目录类型、文档分类、权限级别、分享方式、审计动作均为可配置数据；
--           目录权限以「目录 + 授权对象」的映射表表达，支持向子目录继承。
-- 注意：业务字段一律不得命名为 version，避免与 BaseEntity 的乐观锁字段 version 冲突。

-- ========== 文档目录（公共/部门/项目/个人/共享/流程归档/知识库） ==========

CREATE TABLE oa_doc_folder (
    id             BIGINT       NOT NULL,
    folder_code    VARCHAR(64)  NOT NULL,
    folder_name    VARCHAR(128) NOT NULL,
    folder_type    VARCHAR(32)  NOT NULL DEFAULT 'PUBLIC',
    parent_id      BIGINT       NOT NULL DEFAULT 0,
    -- 物化路径（形如 /PUBLIC_ROOT/ISO），便于按层级前缀检索子目录
    folder_path    VARCHAR(500),
    folder_level   INT          NOT NULL DEFAULT 1,
    owner_user_id  BIGINT,
    owner_dept_id  BIGINT,
    -- 知识库分类编码（经验教训、ISO 体系、客户明示要求、质量数据库等），非知识库目录为空
    category_code  VARCHAR(64),
    sort_no        INT          NOT NULL DEFAULT 0,
    status         VARCHAR(32)  NOT NULL DEFAULT 'enabled',
    remark         VARCHAR(255),
    created_by     BIGINT,
    created_at     TIMESTAMP,
    updated_by     BIGINT,
    updated_at     TIMESTAMP,
    deleted        INT          NOT NULL DEFAULT 0,
    version        INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
-- 说明：目录编码采用逻辑删除后重建的方式，唯一性由服务层校验，故使用普通索引。
CREATE INDEX idx_oa_doc_folder_parent ON oa_doc_folder (parent_id);
CREATE INDEX idx_oa_doc_folder_path ON oa_doc_folder (folder_path);
CREATE INDEX idx_oa_doc_folder_type ON oa_doc_folder (folder_type);

-- ========== 目录权限映射（授权对象可为所有人/部门/角色/指定用户） ==========

CREATE TABLE oa_doc_folder_permission (
    id               BIGINT      NOT NULL,
    folder_id        BIGINT      NOT NULL,
    subject_type     VARCHAR(32) NOT NULL DEFAULT 'ALL',
    -- 授权对象标识：ALL 时为空；DEPT 为组织ID；ROLE 为角色ID；USER 为用户ID
    subject_id       BIGINT,
    permission_level VARCHAR(32) NOT NULL DEFAULT 'READ',
    -- 是否向子目录继承：1 继承，0 仅本目录
    inherit_flag     INT         NOT NULL DEFAULT 1,
    remark           VARCHAR(255),
    created_by       BIGINT,
    created_at       TIMESTAMP,
    updated_by       BIGINT,
    updated_at       TIMESTAMP,
    deleted          INT         NOT NULL DEFAULT 0,
    version          INT         NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE INDEX idx_oa_doc_folder_perm_folder ON oa_doc_folder_permission (folder_id);
CREATE INDEX idx_oa_doc_folder_perm_subject ON oa_doc_folder_permission (subject_type, subject_id);

-- ========== 文档元数据 ==========

CREATE TABLE oa_document (
    id                 BIGINT       NOT NULL,
    doc_no             VARCHAR(64)  NOT NULL,
    title              VARCHAR(256) NOT NULL,
    folder_id          BIGINT       NOT NULL,
    doc_type           VARCHAR(64),
    status             VARCHAR(32)  NOT NULL DEFAULT 'DRAFT',
    source_type        VARCHAR(32)  NOT NULL DEFAULT 'MANUAL',
    source_biz_id      BIGINT,
    source_biz_no      VARCHAR(64),
    owner_user_id      BIGINT,
    owner_name         VARCHAR(64),
    owner_dept_id      BIGINT,
    owner_dept_name    VARCHAR(128),
    current_version_id BIGINT,
    current_version_no INT          NOT NULL DEFAULT 0,
    file_name          VARCHAR(255),
    file_size          BIGINT       NOT NULL DEFAULT 0,
    content_type       VARCHAR(128),
    file_hash          VARCHAR(128),
    summary            VARCHAR(500),
    keywords           VARCHAR(500),
    tags               VARCHAR(255),
    published_at       TIMESTAMP,
    archived_flag      INT          NOT NULL DEFAULT 0,
    view_count         BIGINT       NOT NULL DEFAULT 0,
    download_count     BIGINT       NOT NULL DEFAULT 0,
    lock_flag          INT          NOT NULL DEFAULT 0,
    lock_user_id       BIGINT,
    -- 扩展字段：以 JSON 承载旧系统已知但未固定建模的列表字段，保证可导出可追溯
    ext_json           TEXT,
    remark             VARCHAR(255),
    created_by         BIGINT,
    created_at         TIMESTAMP,
    updated_by         BIGINT,
    updated_at         TIMESTAMP,
    deleted            INT          NOT NULL DEFAULT 0,
    version            INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_oa_document_no ON oa_document (doc_no);
CREATE INDEX idx_oa_document_folder ON oa_document (folder_id, status);
CREATE INDEX idx_oa_document_owner ON oa_document (owner_user_id);
CREATE INDEX idx_oa_document_hash ON oa_document (file_hash);

-- ========== 文档版本（历史版本不可被无痕覆盖） ==========

CREATE TABLE oa_doc_version (
    id                  BIGINT       NOT NULL,
    doc_id              BIGINT       NOT NULL,
    version_no          INT          NOT NULL,
    revision_note       VARCHAR(500),
    file_name           VARCHAR(255) NOT NULL,
    file_size           BIGINT       NOT NULL DEFAULT 0,
    content_type        VARCHAR(128),
    file_hash           VARCHAR(128),
    storage_path        VARCHAR(500),
    scan_status         VARCHAR(32)  NOT NULL DEFAULT 'PENDING',
    scan_at             TIMESTAMP,
    published_flag      INT          NOT NULL DEFAULT 0,
    current_flag        INT          NOT NULL DEFAULT 0,
    lock_flag           INT          NOT NULL DEFAULT 0,
    uploaded_by_user_id BIGINT,
    remark              VARCHAR(255),
    created_by          BIGINT,
    created_at          TIMESTAMP,
    updated_by          BIGINT,
    updated_at          TIMESTAMP,
    deleted             INT          NOT NULL DEFAULT 0,
    version             INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE INDEX idx_oa_doc_version_doc ON oa_doc_version (doc_id, version_no);
CREATE INDEX idx_oa_doc_version_hash ON oa_doc_version (file_hash);

-- ========== 文档评论与 @提醒 ==========

CREATE TABLE oa_doc_comment (
    id                BIGINT      NOT NULL,
    doc_id            BIGINT      NOT NULL,
    version_id        BIGINT,
    parent_comment_id BIGINT,
    content           TEXT        NOT NULL,
    -- 被 @ 的用户ID，逗号分隔
    mention_user_ids  VARCHAR(500),
    author_user_id    BIGINT,
    author_name       VARCHAR(64),
    status            VARCHAR(32) NOT NULL DEFAULT 'enabled',
    remark            VARCHAR(255),
    created_by        BIGINT,
    created_at        TIMESTAMP,
    updated_by        BIGINT,
    updated_at        TIMESTAMP,
    deleted           INT         NOT NULL DEFAULT 0,
    version           INT         NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE INDEX idx_oa_doc_comment_doc ON oa_doc_comment (doc_id);
CREATE INDEX idx_oa_doc_comment_parent ON oa_doc_comment (parent_comment_id);

-- ========== 文档分享（内部分享 / 链接分享，带有效期与撤销） ==========

CREATE TABLE oa_doc_share (
    id               BIGINT      NOT NULL,
    share_no         VARCHAR(64) NOT NULL,
    doc_id           BIGINT      NOT NULL,
    share_type       VARCHAR(32) NOT NULL DEFAULT 'INTERNAL',
    target_user_id   BIGINT,
    target_dept_id   BIGINT,
    permission_level VARCHAR(32) NOT NULL DEFAULT 'READ',
    download_allowed INT         NOT NULL DEFAULT 1,
    expire_at        TIMESTAMP,
    revoked_flag     INT         NOT NULL DEFAULT 0,
    view_count       BIGINT      NOT NULL DEFAULT 0,
    remark           VARCHAR(255),
    created_by       BIGINT,
    created_at       TIMESTAMP,
    updated_by       BIGINT,
    updated_at       TIMESTAMP,
    deleted          INT         NOT NULL DEFAULT 0,
    version          INT         NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_oa_doc_share_no ON oa_doc_share (share_no);
CREATE INDEX idx_oa_doc_share_doc ON oa_doc_share (doc_id);
CREATE INDEX idx_oa_doc_share_target ON oa_doc_share (target_user_id);

-- ========== 文档访问审计（OA-UAT-05 版本记录与访问日志证据） ==========

CREATE TABLE oa_doc_access_log (
    id            BIGINT      NOT NULL,
    doc_id        BIGINT      NOT NULL,
    version_id    BIGINT,
    folder_id     BIGINT,
    user_id       BIGINT,
    user_name     VARCHAR(64),
    action        VARCHAR(32) NOT NULL,
    action_detail VARCHAR(500),
    client_ip     VARCHAR(64),
    user_agent    VARCHAR(255),
    occurred_at   TIMESTAMP,
    created_by    BIGINT,
    created_at    TIMESTAMP,
    updated_by    BIGINT,
    updated_at    TIMESTAMP,
    deleted       INT         NOT NULL DEFAULT 0,
    version       INT         NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE INDEX idx_oa_doc_access_doc ON oa_doc_access_log (doc_id, action);
CREATE INDEX idx_oa_doc_access_user ON oa_doc_access_log (user_id);

-- ========== 统一检索索引（文档元数据、邮件正文与附件名；按权限过滤） ==========
-- 说明：默认为关系库精简索引，生产可替换为独立搜索引擎，替换不改变上层接口与服务契约。

CREATE TABLE oa_doc_search_index (
    id               BIGINT       NOT NULL,
    source_type      VARCHAR(32)  NOT NULL,
    source_id        BIGINT       NOT NULL,
    biz_no           VARCHAR(64),
    title            VARCHAR(256),
    content_text     TEXT,
    keywords         VARCHAR(500),
    folder_id        BIGINT,
    doc_id           BIGINT,
    owner_user_id    BIGINT,
    owner_dept_id    BIGINT,
    permission_scope VARCHAR(32)  NOT NULL DEFAULT 'PRIVATE',
    indexed_at       TIMESTAMP,
    remark           VARCHAR(255),
    created_by       BIGINT,
    created_at       TIMESTAMP,
    updated_by       BIGINT,
    updated_at       TIMESTAMP,
    deleted          INT          NOT NULL DEFAULT 0,
    version          INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE INDEX idx_oa_doc_search_source ON oa_doc_search_index (source_type, source_id);
CREATE INDEX idx_oa_doc_search_owner ON oa_doc_search_index (owner_user_id);
CREATE INDEX idx_oa_doc_search_scope ON oa_doc_search_index (permission_scope);
