-- OA-N12 正式切换与现有OA退役：冻结旧OA写入、最终全量及增量迁移、门户入口与身份切换、
-- 上线值守与问题响应、回退决策与演练、现有OA只读封存、授权与资源回收、运维交接与质保。
-- 说明：SQL 同时兼容 PostgreSQL 与 H2（PostgreSQL 兼容模式），主键由应用侧雪花算法生成。
-- 设计原则：
--   1) 切换以"冻结 → 最终迁移 → 入口切换 → 上线值守 → 回退决策"为主干（OA-DEV-114/115/116/117/118），
--      每步均可追溯冻结范围、迁移数量与核对结论、入口切换记录、值守问题、回退触发与决策结果。
--   2) 退役以"只读封存 → 资源回收 → 运维交接"为主干（OA-DEV-119/120/121），
--      明确保留期限、快照校验、审批与回收清单，确保历史资料可检索且旧系统不再承载新业务。
--   3) 窗口时长、核对容差、值守阈值、保留期限与质保期限等均为可配置项（sys_config）并标记待业务方确认。
-- 注意：业务字段一律不得命名为 version，避免与 BaseEntity 的乐观锁字段 version 冲突。

-- ========== 冻结旧OA关键写入（OA-DEV-114） ==========

CREATE TABLE oa_golive_freeze (
    id                BIGINT       NOT NULL,
    freeze_no         VARCHAR(64)  NOT NULL,
    freeze_name       VARCHAR(200) NOT NULL,
    freeze_type       VARCHAR(32)  NOT NULL DEFAULT 'ALL',
    freeze_scope      VARCHAR(1000),
    freeze_start      TIMESTAMP,
    freeze_end        TIMESTAMP,
    read_only_retained INT         NOT NULL DEFAULT 1,
    emergency_plan    VARCHAR(1000),
    notice_published  INT          NOT NULL DEFAULT 0,
    notice_time       TIMESTAMP,
    freeze_status     VARCHAR(32)  NOT NULL DEFAULT 'PENDING',
    duty_person       VARCHAR(200),
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
CREATE UNIQUE INDEX uk_oa_golive_freeze_no ON oa_golive_freeze (freeze_no);
CREATE INDEX idx_oa_golive_freeze_type ON oa_golive_freeze (freeze_type);
CREATE INDEX idx_oa_golive_freeze_status ON oa_golive_freeze (freeze_status);

-- ========== 执行最终全量及增量迁移（OA-DEV-115） ==========

CREATE TABLE oa_final_migration (
    id                BIGINT       NOT NULL,
    mig_no            VARCHAR(64)  NOT NULL,
    mig_name          VARCHAR(200) NOT NULL,
    mig_type          VARCHAR(32)  NOT NULL DEFAULT 'FULL',
    source_scope      VARCHAR(1000),
    extract_start     TIMESTAMP,
    extract_end       TIMESTAMP,
    imported_count    BIGINT       NOT NULL DEFAULT 0,
    failed_count      BIGINT       NOT NULL DEFAULT 0,
    attachment_count  BIGINT       NOT NULL DEFAULT 0,
    verify_status     VARCHAR(32)  NOT NULL DEFAULT 'PENDING',
    verify_pass       INT          NOT NULL DEFAULT 0,
    mig_status        VARCHAR(32)  NOT NULL DEFAULT 'PENDING',
    operator_name     VARCHAR(64),
    mig_time          TIMESTAMP,
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
CREATE UNIQUE INDEX uk_oa_final_migration_no ON oa_final_migration (mig_no);
CREATE INDEX idx_oa_final_migration_type ON oa_final_migration (mig_type);
CREATE INDEX idx_oa_final_migration_status ON oa_final_migration (mig_status);

-- ========== 切换门户入口与身份（OA-DEV-116） ==========

CREATE TABLE oa_entry_switch (
    id                BIGINT       NOT NULL,
    switch_no         VARCHAR(64)  NOT NULL,
    switch_name       VARCHAR(200) NOT NULL,
    switch_type       VARCHAR(32)  NOT NULL DEFAULT 'PORTAL',
    old_entry         VARCHAR(500),
    new_entry         VARCHAR(500),
    switch_plan       VARCHAR(1000),
    dns_ttl_minutes   INT          NOT NULL DEFAULT 10,
    sso_enabled       INT          NOT NULL DEFAULT 1,
    mobile_enabled    INT          NOT NULL DEFAULT 1,
    switch_status     VARCHAR(32)  NOT NULL DEFAULT 'PENDING',
    switch_time       TIMESTAMP,
    verify_result     VARCHAR(500),
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
CREATE UNIQUE INDEX uk_oa_entry_switch_no ON oa_entry_switch (switch_no);
CREATE INDEX idx_oa_entry_switch_type ON oa_entry_switch (switch_type);
CREATE INDEX idx_oa_entry_switch_status ON oa_entry_switch (switch_status);

-- ========== 上线值守与问题响应（OA-DEV-117） ==========

CREATE TABLE oa_golive_watch (
    id                   BIGINT       NOT NULL,
    watch_no             VARCHAR(64)  NOT NULL,
    watch_name           VARCHAR(200) NOT NULL,
    watch_shift          VARCHAR(32)  NOT NULL DEFAULT 'FULL',
    duty_role            VARCHAR(32)  NOT NULL DEFAULT 'TECH',
    duty_person          VARCHAR(64),
    monitor_scope        VARCHAR(1000),
    login_count          INT          NOT NULL DEFAULT 0,
    flow_count           INT          NOT NULL DEFAULT 0,
    mail_count           INT          NOT NULL DEFAULT 0,
    doc_count            INT          NOT NULL DEFAULT 0,
    api_count            INT          NOT NULL DEFAULT 0,
    issue_count          INT          NOT NULL DEFAULT 0,
    critical_issue_count INT          NOT NULL DEFAULT 0,
    closed_issue_count   INT          NOT NULL DEFAULT 0,
    watch_status         VARCHAR(32)  NOT NULL DEFAULT 'PENDING',
    report_summary       VARCHAR(1000),
    watch_time           TIMESTAMP,
    org_id               BIGINT,
    org_name             VARCHAR(128),
    remark               VARCHAR(500),
    created_by           BIGINT,
    created_at           TIMESTAMP,
    updated_by           BIGINT,
    updated_at           TIMESTAMP,
    deleted              INT          NOT NULL DEFAULT 0,
    version              INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_oa_golive_watch_no ON oa_golive_watch (watch_no);
CREATE INDEX idx_oa_golive_watch_role ON oa_golive_watch (duty_role);
CREATE INDEX idx_oa_golive_watch_status ON oa_golive_watch (watch_status);

-- ========== 回退决策与演练（OA-DEV-118） ==========

CREATE TABLE oa_rollback_record (
    id                BIGINT       NOT NULL,
    rollback_no       VARCHAR(64)  NOT NULL,
    rollback_name     VARCHAR(200) NOT NULL,
    rollback_type     VARCHAR(32)  NOT NULL DEFAULT 'DECISION',
    rollback_reason   VARCHAR(1000),
    trigger_condition VARCHAR(1000),
    rollback_scope    VARCHAR(1000),
    data_boundary     VARCHAR(1000),
    decision_result   VARCHAR(32)  NOT NULL DEFAULT 'PENDING',
    decision_time     TIMESTAMP,
    drill_result      VARCHAR(32)  NOT NULL DEFAULT 'NOT_RUN',
    drill_time        TIMESTAMP,
    window_minutes    INT          NOT NULL DEFAULT 0,
    double_write_avoided INT       NOT NULL DEFAULT 1,
    rollback_owner    VARCHAR(64),
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
CREATE UNIQUE INDEX uk_oa_rollback_record_no ON oa_rollback_record (rollback_no);
CREATE INDEX idx_oa_rollback_record_type ON oa_rollback_record (rollback_type);
CREATE INDEX idx_oa_rollback_record_decision ON oa_rollback_record (decision_result);

-- ========== 现有OA只读封存（OA-DEV-119） ==========

CREATE TABLE oa_legacy_archive (
    id                BIGINT       NOT NULL,
    archive_no        VARCHAR(64)  NOT NULL,
    archive_name      VARCHAR(200) NOT NULL,
    archive_type      VARCHAR(32)  NOT NULL DEFAULT 'READONLY',
    archive_scope     VARCHAR(1000),
    snapshot_path     VARCHAR(500),
    snapshot_checksum VARCHAR(128),
    retention_years   INT          NOT NULL DEFAULT 0,
    retention_policy  VARCHAR(1000),
    backup_verified   INT          NOT NULL DEFAULT 0,
    query_entry       VARCHAR(500),
    archive_status    VARCHAR(32)  NOT NULL DEFAULT 'PENDING',
    archive_time      TIMESTAMP,
    approver          VARCHAR(64),
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
CREATE UNIQUE INDEX uk_oa_legacy_archive_no ON oa_legacy_archive (archive_no);
CREATE INDEX idx_oa_legacy_archive_type ON oa_legacy_archive (archive_type);
CREATE INDEX idx_oa_legacy_archive_status ON oa_legacy_archive (archive_status);

-- ========== 授权与资源回收（OA-DEV-120） ==========

CREATE TABLE oa_decommission_record (
    id                BIGINT       NOT NULL,
    decommission_no   VARCHAR(64)  NOT NULL,
    decommission_name VARCHAR(200) NOT NULL,
    resource_type     VARCHAR(32)  NOT NULL DEFAULT 'ACCESS',
    resource_desc     VARCHAR(1000),
    revoke_scope      VARCHAR(1000),
    approved          INT          NOT NULL DEFAULT 0,
    approver          VARCHAR(64),
    decommission_status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    execute_time      TIMESTAMP,
    backup_kept       INT          NOT NULL DEFAULT 1,
    risk_note         VARCHAR(1000),
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
CREATE UNIQUE INDEX uk_oa_decommission_record_no ON oa_decommission_record (decommission_no);
CREATE INDEX idx_oa_decommission_record_type ON oa_decommission_record (resource_type);
CREATE INDEX idx_oa_decommission_record_status ON oa_decommission_record (decommission_status);

-- ========== 运维交接与质保（OA-DEV-121） ==========

CREATE TABLE oa_ops_handover (
    id                BIGINT       NOT NULL,
    handover_no       VARCHAR(64)  NOT NULL,
    handover_name     VARCHAR(200) NOT NULL,
    deliverable_type  VARCHAR(32)  NOT NULL DEFAULT 'SOURCE',
    deliverable_desc  VARCHAR(1000),
    location          VARCHAR(500),
    handover_status   VARCHAR(32)  NOT NULL DEFAULT 'PENDING',
    delivered_time    TIMESTAMP,
    receiver          VARCHAR(64),
    confirm_time      TIMESTAMP,
    warranty_months   INT          NOT NULL DEFAULT 0,
    warranty_start    TIMESTAMP,
    warranty_end      TIMESTAMP,
    acceptance_verified INT        NOT NULL DEFAULT 0,
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
CREATE UNIQUE INDEX uk_oa_ops_handover_no ON oa_ops_handover (handover_no);
CREATE INDEX idx_oa_ops_handover_type ON oa_ops_handover (deliverable_type);
CREATE INDEX idx_oa_ops_handover_status ON oa_ops_handover (handover_status);
