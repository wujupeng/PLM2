-- G1-N3 公共平台底座—统一文件服务（对应总任务书 WBS T011）：
-- 统一附件、CAD/Office/PDF 预览、版本、病毒扫描、对象存储和归档。
-- 说明：SQL 同时兼容 PostgreSQL 与 H2（PostgreSQL 兼容模式），主键由应用侧雪花算法生成。
-- 设计原则：
--   1) 统一附件收口：六大系统的附件统一登记在本表，按业务模块（biz_module）、业务单据类型（biz_type）
--      与业务单据（biz_id/biz_no）关联，避免各系统各存各的附件、无法统一权限与生命周期管理。
--   2) 元数据与实体分离：附件表只存元数据与对象存储定位（storage_type/bucket/object_key），
--      实体文件落对象存储或本地，便于容量扩展与冷热分层迁移。
--   3) 版本可追溯：文件每次更新生成一条版本记录，current_flag 标记当前生效版本，历史版本只读留痕。
--   4) 预览转换异步化：CAD/Office/PDF 预览通过转换任务生成，任务登记转换引擎、目标格式与结果，
--      避免在线转换阻塞上传主链路。
--   5) 病毒扫描前置：上传后登记扫描记录，扫描结果（CLEAN/INFECTED/ERROR）回写附件状态，
--      未通过扫描的文件置 QUARANTINED，禁止下载与外发。
--   6) 归档与保留期：按文件登记归档策略（热/冷/永久）、存储级别与保留年限，到期可下沉归档或清理。
-- 注意：
--   a) 业务字段一律不得命名为 version，避免与 BaseEntity 的乐观锁字段 version 冲突；
--      文件版本序号使用 seq_no，版本编号使用 version_no。
--   b) 附件编号/版本编号/任务编号/扫描编号/归档编号均支持人工指定，且表上存在硬唯一索引；
--      为与唯一索引保持一致，本模块删除语义为「释放编码」，由服务层执行物理删除（与 G1-N1 幂等记录同一处理方式）。

-- ========== 统一附件（T011） ==========

CREATE TABLE sys_file_attachment (
    id                BIGINT       NOT NULL,
    file_no           VARCHAR(64)  NOT NULL,
    file_name         VARCHAR(255) NOT NULL,
    original_name     VARCHAR(255),
    file_ext          VARCHAR(32),
    biz_module        VARCHAR(32),
    biz_type          VARCHAR(64),
    biz_id            VARCHAR(64),
    biz_no            VARCHAR(64),
    storage_type      VARCHAR(32)  NOT NULL DEFAULT 'OBJECT',
    storage_bucket    VARCHAR(128),
    object_key        VARCHAR(512),
    file_size         BIGINT       NOT NULL DEFAULT 0,
    content_type      VARCHAR(128),
    checksum          VARCHAR(128),
    security_level    VARCHAR(32)  NOT NULL DEFAULT 'INTERNAL',
    scan_status       VARCHAR(32)  NOT NULL DEFAULT 'PENDING',
    preview_supported INT          NOT NULL DEFAULT 0,
    latest_version_no VARCHAR(64),
    upload_by         VARCHAR(64),
    upload_time       TIMESTAMP,
    retention_years   INT          NOT NULL DEFAULT 0,
    archive_status    VARCHAR(32)  NOT NULL DEFAULT 'NONE',
    file_status       VARCHAR(32)  NOT NULL DEFAULT 'NORMAL',
    description       VARCHAR(1000),
    org_id            BIGINT,
    org_name          VARCHAR(128),
    remark            VARCHAR(500),
    created_by        BIGINT,
    created_at        TIMESTAMP,
    updated_by        BIGINT,
    updated_at        TIMESTAMP,
    deleted           INT          NOT NULL DEFAULT 0,
    version           INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_sys_file_attachment_no ON sys_file_attachment (file_no);
CREATE INDEX idx_sys_file_attachment_biz ON sys_file_attachment (biz_module, biz_type, biz_id);
CREATE INDEX idx_sys_file_attachment_status ON sys_file_attachment (file_status);
CREATE INDEX idx_sys_file_attachment_scan ON sys_file_attachment (scan_status);

-- ========== 文件版本（T011） ==========

CREATE TABLE sys_file_version (
    id             BIGINT       NOT NULL,
    version_no     VARCHAR(64)  NOT NULL,
    file_no        VARCHAR(64)  NOT NULL,
    file_name      VARCHAR(255),
    seq_no         INT          NOT NULL DEFAULT 1,
    storage_bucket VARCHAR(128),
    object_key     VARCHAR(512),
    file_size      BIGINT       NOT NULL DEFAULT 0,
    checksum       VARCHAR(128),
    change_note    VARCHAR(1000),
    current_flag   INT          NOT NULL DEFAULT 0,
    upload_by      VARCHAR(64),
    upload_time    TIMESTAMP,
    version_status VARCHAR(32)  NOT NULL DEFAULT 'ACTIVE',
    org_id         BIGINT,
    org_name       VARCHAR(128),
    remark         VARCHAR(500),
    created_by     BIGINT,
    created_at     TIMESTAMP,
    updated_by     BIGINT,
    updated_at     TIMESTAMP,
    deleted        INT          NOT NULL DEFAULT 0,
    version        INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_sys_file_version_no ON sys_file_version (version_no);
CREATE INDEX idx_sys_file_version_file ON sys_file_version (file_no);
CREATE INDEX idx_sys_file_version_status ON sys_file_version (version_status);

-- ========== 预览转换任务（T011） ==========

CREATE TABLE sys_file_preview_task (
    id            BIGINT       NOT NULL,
    task_no       VARCHAR(64)  NOT NULL,
    file_no       VARCHAR(64)  NOT NULL,
    file_name     VARCHAR(255),
    source_ext    VARCHAR(32),
    target_format VARCHAR(32)  NOT NULL DEFAULT 'PDF',
    convert_mode  VARCHAR(32)  NOT NULL DEFAULT 'OFFICE',
    convert_engine VARCHAR(64),
    task_status   VARCHAR(32)  NOT NULL DEFAULT 'PENDING',
    preview_url   VARCHAR(512),
    error_message VARCHAR(1000),
    retry_count   INT          NOT NULL DEFAULT 0,
    start_time    TIMESTAMP,
    end_time      TIMESTAMP,
    cost_ms       INT          NOT NULL DEFAULT 0,
    org_id        BIGINT,
    org_name      VARCHAR(128),
    remark        VARCHAR(500),
    created_by    BIGINT,
    created_at    TIMESTAMP,
    updated_by    BIGINT,
    updated_at    TIMESTAMP,
    deleted       INT          NOT NULL DEFAULT 0,
    version       INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_sys_file_preview_task_no ON sys_file_preview_task (task_no);
CREATE INDEX idx_sys_file_preview_task_file ON sys_file_preview_task (file_no);
CREATE INDEX idx_sys_file_preview_task_status ON sys_file_preview_task (task_status);

-- ========== 病毒扫描记录（T011） ==========

CREATE TABLE sys_file_scan_record (
    id             BIGINT       NOT NULL,
    scan_no        VARCHAR(64)  NOT NULL,
    file_no        VARCHAR(64)  NOT NULL,
    file_name      VARCHAR(255),
    scan_engine    VARCHAR(64),
    engine_version VARCHAR(64),
    virus_name     VARCHAR(255),
    scan_result    VARCHAR(32)  NOT NULL DEFAULT 'CLEAN',
    action_taken   VARCHAR(64),
    scan_time      TIMESTAMP,
    cost_ms        INT          NOT NULL DEFAULT 0,
    org_id         BIGINT,
    org_name       VARCHAR(128),
    remark         VARCHAR(500),
    created_by     BIGINT,
    created_at     TIMESTAMP,
    updated_by     BIGINT,
    updated_at     TIMESTAMP,
    deleted        INT          NOT NULL DEFAULT 0,
    version        INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_sys_file_scan_record_no ON sys_file_scan_record (scan_no);
CREATE INDEX idx_sys_file_scan_record_file ON sys_file_scan_record (file_no);
CREATE INDEX idx_sys_file_scan_record_result ON sys_file_scan_record (scan_result);

-- ========== 文件归档（T011） ==========

CREATE TABLE sys_file_archive (
    id              BIGINT       NOT NULL,
    archive_no      VARCHAR(64)  NOT NULL,
    file_no         VARCHAR(64)  NOT NULL,
    file_name       VARCHAR(255),
    archive_type    VARCHAR(32)  NOT NULL DEFAULT 'HOT',
    storage_class   VARCHAR(32)  NOT NULL DEFAULT 'STANDARD',
    retention_years INT          NOT NULL DEFAULT 0,
    storage_path    VARCHAR(512),
    archive_time    TIMESTAMP,
    expire_time     TIMESTAMP,
    archive_status  VARCHAR(32)  NOT NULL DEFAULT 'PENDING',
    restore_status  VARCHAR(32)  NOT NULL DEFAULT 'NONE',
    org_id          BIGINT,
    org_name        VARCHAR(128),
    remark          VARCHAR(500),
    created_by      BIGINT,
    created_at      TIMESTAMP,
    updated_by      BIGINT,
    updated_at      TIMESTAMP,
    deleted         INT          NOT NULL DEFAULT 0,
    version         INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_sys_file_archive_no ON sys_file_archive (archive_no);
CREATE INDEX idx_sys_file_archive_file ON sys_file_archive (file_no);
CREATE INDEX idx_sys_file_archive_status ON sys_file_archive (archive_status);
