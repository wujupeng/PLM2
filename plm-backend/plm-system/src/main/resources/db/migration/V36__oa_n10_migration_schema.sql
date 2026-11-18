-- OA-N10 历史数据迁移与新旧并行验证：迁移对象目录、字段映射、抽取/试迁批次、清洗规则与日志、
-- 附件迁移任务、历史流程档案、迁移对账、双跑对照。
-- 说明：SQL 同时兼容 PostgreSQL 与 H2（PostgreSQL 兼容模式），主键由应用侧雪花算法生成。
-- 设计原则：
--   1) 迁移以"对象目录 + 映射字典 + 批次 + 对账"为主干：对象目录定义迁移范围（OA-DEV-095），
--      字段映射定义源目标转换（OA-DEV-096），批次记录每次抽取/试迁的快照与校验值（OA-DEV-097/100/101），
--      清洗规则与日志记录处理过程且不覆盖原始数据（OA-DEV-098），附件任务支持分片/断点/哈希校验（OA-DEV-099），
--      对账按对象统计源/成功/失败/跳过/差异（OA-DEV-103），双跑对照关键流程结果（OA-DEV-104）。
--   2) 历史流程以"档案"形式只读留存（OA-DEV-102）：保留原单号、表单快照、审批意见、处理人、
--      组织快照与时间线，供按原单号和人员查询；不参与新的审批流转。
--   3) 权威数据边界遵循任务书：组织/人员/角色/流程定义/邮件/文档等以现有 OA 为迁移来源，
--      迁移策略、保留年限、差异容差、增量窗口、哈希算法等均为可配置项（sys_config）并标记待业务方确认。
-- 注意：业务字段一律不得命名为 version，避免与 BaseEntity 的乐观锁字段 version 冲突。

-- ========== 迁移对象目录（OA-DEV-095） ==========

CREATE TABLE oa_migration_object (
    id                BIGINT       NOT NULL,
    object_code       VARCHAR(64)  NOT NULL,
    object_name       VARCHAR(200) NOT NULL,
    source_system     VARCHAR(64),
    source_type       VARCHAR(32)  NOT NULL DEFAULT 'DB',
    source_location   VARCHAR(500),
    target_object     VARCHAR(128),
    source_count      BIGINT       NOT NULL DEFAULT 0,
    migrated_count    BIGINT       NOT NULL DEFAULT 0,
    migrate_required  INT          NOT NULL DEFAULT 1,
    status            VARCHAR(32)  NOT NULL DEFAULT 'PENDING',
    last_migrate_time TIMESTAMP,
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
CREATE UNIQUE INDEX uk_oa_migration_object_code ON oa_migration_object (object_code);
CREATE INDEX idx_oa_migration_object_status ON oa_migration_object (status);

-- ========== 源目标字段映射字典（OA-DEV-096） ==========

CREATE TABLE oa_migration_field_mapping (
    id                BIGINT       NOT NULL,
    mapping_no        VARCHAR(64)  NOT NULL,
    object_code       VARCHAR(64)  NOT NULL,
    source_field      VARCHAR(128) NOT NULL,
    target_field      VARCHAR(128) NOT NULL,
    data_type         VARCHAR(32),
    enum_mapping      VARCHAR(1000),
    value_mapping     VARCHAR(1000),
    transform_rule    VARCHAR(1000),
    required_flag     INT          NOT NULL DEFAULT 0,
    status            INT          NOT NULL DEFAULT 1,
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
CREATE UNIQUE INDEX uk_oa_migration_field_no ON oa_migration_field_mapping (mapping_no);
CREATE INDEX idx_oa_migration_field_object ON oa_migration_field_mapping (object_code);

-- ========== 迁移批次：抽取 / 全量试迁 / 增量试迁（OA-DEV-097/100/101） ==========

CREATE TABLE oa_migration_batch (
    id                BIGINT       NOT NULL,
    batch_no          VARCHAR(64)  NOT NULL,
    batch_name        VARCHAR(200) NOT NULL,
    object_code       VARCHAR(64),
    batch_type        VARCHAR(32)  NOT NULL DEFAULT 'TRIAL',
    extract_method    VARCHAR(32)  NOT NULL DEFAULT 'DB',
    source_snapshot   VARCHAR(500),
    snapshot_checksum VARCHAR(128),
    total_count       BIGINT       NOT NULL DEFAULT 0,
    success_count     BIGINT       NOT NULL DEFAULT 0,
    fail_count        BIGINT       NOT NULL DEFAULT 0,
    skip_count        BIGINT       NOT NULL DEFAULT 0,
    batch_status      VARCHAR(32)  NOT NULL DEFAULT 'PENDING',
    trial_round       INT          NOT NULL DEFAULT 1,
    start_time        TIMESTAMP,
    end_time          TIMESTAMP,
    operator_name     VARCHAR(64),
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
CREATE UNIQUE INDEX uk_oa_migration_batch_no ON oa_migration_batch (batch_no);
CREATE INDEX idx_oa_migration_batch_type ON oa_migration_batch (batch_type);
CREATE INDEX idx_oa_migration_batch_status ON oa_migration_batch (batch_status);
CREATE INDEX idx_oa_migration_batch_object ON oa_migration_batch (object_code);

-- ========== 清洗规则与清洗日志（OA-DEV-098） ==========

CREATE TABLE oa_migration_clean_rule (
    id                BIGINT       NOT NULL,
    rule_no           VARCHAR(64)  NOT NULL,
    rule_name         VARCHAR(200) NOT NULL,
    object_code       VARCHAR(64),
    rule_type         VARCHAR(32)  NOT NULL DEFAULT 'DEDUP_USER',
    rule_expr         VARCHAR(1000),
    action            VARCHAR(64),
    priority          INT          NOT NULL DEFAULT 5,
    hit_count         BIGINT       NOT NULL DEFAULT 0,
    status            INT          NOT NULL DEFAULT 1,
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
CREATE UNIQUE INDEX uk_oa_migration_clean_rule_no ON oa_migration_clean_rule (rule_no);
CREATE INDEX idx_oa_migration_clean_rule_type ON oa_migration_clean_rule (rule_type);

CREATE TABLE oa_migration_clean_log (
    id                BIGINT       NOT NULL,
    batch_id          BIGINT,
    rule_id           BIGINT,
    rule_no           VARCHAR(64),
    object_code       VARCHAR(64),
    record_key        VARCHAR(128),
    source_value      VARCHAR(1000),
    cleaned_value     VARCHAR(1000),
    clean_result      VARCHAR(32)  NOT NULL DEFAULT 'CLEANED',
    message           VARCHAR(1000),
    clean_time        TIMESTAMP,
    org_id            BIGINT,
    org_name          VARCHAR(128),
    remark            VARCHAR(255),
    created_by        BIGINT,
    created_at        TIMESTAMP,
    updated_by        BIGINT,
    updated_at        TIMESTAMP,
    deleted           INT          NOT NULL DEFAULT 0,
    version           INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE INDEX idx_oa_migration_clean_log_batch ON oa_migration_clean_log (batch_id);
CREATE INDEX idx_oa_migration_clean_log_object ON oa_migration_clean_log (object_code);

-- ========== 附件迁移任务（OA-DEV-099） ==========

CREATE TABLE oa_migration_attachment_task (
    id                BIGINT       NOT NULL,
    task_no           VARCHAR(64)  NOT NULL,
    batch_id          BIGINT,
    object_code       VARCHAR(64),
    source_path       VARCHAR(500) NOT NULL,
    target_path       VARCHAR(500),
    file_name         VARCHAR(255),
    file_size         BIGINT       NOT NULL DEFAULT 0,
    file_type         VARCHAR(64),
    chunk_total       INT          NOT NULL DEFAULT 1,
    chunk_done        INT          NOT NULL DEFAULT 0,
    file_hash         VARCHAR(128),
    target_hash       VARCHAR(128),
    hash_matched      INT          NOT NULL DEFAULT 0,
    transfer_status   VARCHAR(32)  NOT NULL DEFAULT 'PENDING',
    retry_count       INT          NOT NULL DEFAULT 0,
    error_msg         VARCHAR(1000),
    transfer_time     TIMESTAMP,
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
CREATE UNIQUE INDEX uk_oa_migration_attach_no ON oa_migration_attachment_task (task_no);
CREATE INDEX idx_oa_migration_attach_status ON oa_migration_attachment_task (transfer_status);
CREATE INDEX idx_oa_migration_attach_batch ON oa_migration_attachment_task (batch_id);

-- ========== 历史流程档案（OA-DEV-102） ==========

CREATE TABLE oa_migration_history_flow (
    id                 BIGINT       NOT NULL,
    archive_no         VARCHAR(64)  NOT NULL,
    source_instance_no VARCHAR(64)  NOT NULL,
    process_code       VARCHAR(64),
    process_name       VARCHAR(200),
    title              VARCHAR(500),
    form_snapshot      TEXT,
    applicant_name     VARCHAR(64),
    applicant_org      VARCHAR(200),
    start_time         TIMESTAMP,
    end_time           TIMESTAMP,
    instance_status    VARCHAR(32)  NOT NULL DEFAULT 'APPROVED',
    approval_json      TEXT,
    timeline_json      TEXT,
    attachment_count   INT          NOT NULL DEFAULT 0,
    migrated_flag      INT          NOT NULL DEFAULT 1,
    query_user_name    VARCHAR(64),
    org_id             BIGINT,
    org_name           VARCHAR(128),
    remark             VARCHAR(500),
    created_by         BIGINT,
    created_at         TIMESTAMP,
    updated_by         BIGINT,
    updated_at         TIMESTAMP,
    deleted            INT          NOT NULL DEFAULT 0,
    version            INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_oa_migration_history_no ON oa_migration_history_flow (archive_no);
CREATE INDEX idx_oa_migration_history_src ON oa_migration_history_flow (source_instance_no);
CREATE INDEX idx_oa_migration_history_status ON oa_migration_history_flow (instance_status);
CREATE INDEX idx_oa_migration_history_applicant ON oa_migration_history_flow (applicant_name);

-- ========== 迁移对账（OA-DEV-103） ==========

CREATE TABLE oa_migration_reconcile (
    id                BIGINT       NOT NULL,
    reconcile_no      VARCHAR(64)  NOT NULL,
    batch_id          BIGINT,
    batch_no          VARCHAR(64),
    object_code       VARCHAR(64)  NOT NULL,
    source_count      BIGINT       NOT NULL DEFAULT 0,
    target_count      BIGINT       NOT NULL DEFAULT 0,
    success_count     BIGINT       NOT NULL DEFAULT 0,
    fail_count        BIGINT       NOT NULL DEFAULT 0,
    skip_count        BIGINT       NOT NULL DEFAULT 0,
    diff_count        BIGINT       NOT NULL DEFAULT 0,
    diff_reason       VARCHAR(1000),
    conclusion        VARCHAR(1000),
    reconcile_status  VARCHAR(32)  NOT NULL DEFAULT 'PENDING',
    report_time       TIMESTAMP,
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
CREATE UNIQUE INDEX uk_oa_migration_reconcile_no ON oa_migration_reconcile (reconcile_no);
CREATE INDEX idx_oa_migration_reconcile_object ON oa_migration_reconcile (object_code);
CREATE INDEX idx_oa_migration_reconcile_status ON oa_migration_reconcile (reconcile_status);

-- ========== 新旧流程双跑对照（OA-DEV-104） ==========

CREATE TABLE oa_migration_dual_run (
    id                BIGINT       NOT NULL,
    dual_no           VARCHAR(64)  NOT NULL,
    process_code      VARCHAR(64),
    process_name      VARCHAR(200),
    biz_key           VARCHAR(128),
    new_instance_id   BIGINT,
    old_instance_no   VARCHAR(64),
    compare_result    VARCHAR(32)  NOT NULL DEFAULT 'PENDING',
    approver_diff     VARCHAR(1000),
    path_diff         VARCHAR(1000),
    field_diff        VARCHAR(1000),
    notify_diff       VARCHAR(1000),
    result_diff       VARCHAR(1000),
    conclusion        VARCHAR(1000),
    run_time          TIMESTAMP,
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
CREATE UNIQUE INDEX uk_oa_migration_dual_no ON oa_migration_dual_run (dual_no);
CREATE INDEX idx_oa_migration_dual_result ON oa_migration_dual_run (compare_result);
CREATE INDEX idx_oa_migration_dual_process ON oa_migration_dual_run (process_code);
