-- N9 系统集成、迁移、上线与运维交付：接口配置与幂等重试补偿、主数据同步与差异处理、QMS 质量接口、
-- 历史数据清洗迁移与核对、数据导入导出与退出能力、测试与性能、安全整改、备份恢复与容灾演练、
-- 培训与上线切换、源代码与技术交接、缺陷与 SLA 运维闭环。
-- 说明：SQL 同时兼容 PostgreSQL 与 H2（PostgreSQL 兼容模式），主键由应用侧雪花算法生成。

-- ========== DEV-095/096/097 集成接口配置（幂等/重试/补偿/监控） ==========

CREATE TABLE int_endpoint (
    id                  BIGINT        NOT NULL,
    endpoint_code       VARCHAR(64)   NOT NULL,
    endpoint_name       VARCHAR(128),
    domain              VARCHAR(32)   NOT NULL,
    direction           VARCHAR(16)   NOT NULL DEFAULT 'OUTBOUND',
    protocol            VARCHAR(16)   NOT NULL DEFAULT 'REST',
    endpoint_url        VARCHAR(255),
    auth_type           VARCHAR(16),
    timeout_ms          INT,
    retry_max           INT           NOT NULL DEFAULT 3,
    idempotent_enabled  INT           NOT NULL DEFAULT 1,
    compensate_enabled  INT           NOT NULL DEFAULT 1,
    status              VARCHAR(16)   NOT NULL DEFAULT 'enabled',
    remark              VARCHAR(255),
    created_by          BIGINT,
    created_at          TIMESTAMP,
    updated_by          BIGINT,
    updated_at          TIMESTAMP,
    deleted             INT           NOT NULL DEFAULT 0,
    version             INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_int_endpoint_code ON int_endpoint (endpoint_code);
CREATE INDEX idx_int_endpoint_domain ON int_endpoint (domain);

-- 接口调用日志：幂等键唯一，失败可重试，异常可补偿
CREATE TABLE int_interface_log (
    id               BIGINT        NOT NULL,
    log_no           VARCHAR(64)   NOT NULL,
    endpoint_code    VARCHAR(64),
    interface_code   VARCHAR(64),
    direction        VARCHAR(16),
    biz_key          VARCHAR(128),
    idempotent_key   VARCHAR(128)  NOT NULL,
    request_body     VARCHAR(2000),
    request_hash     VARCHAR(64),
    response_body    VARCHAR(2000),
    http_status      INT,
    result_status    VARCHAR(16)   NOT NULL DEFAULT 'SUCCESS',
    retry_count      INT           NOT NULL DEFAULT 0,
    retry_max        INT           NOT NULL DEFAULT 3,
    next_retry_at    TIMESTAMP,
    compensated      INT           NOT NULL DEFAULT 0,
    error_message    VARCHAR(500),
    source_system    VARCHAR(32),
    target_system    VARCHAR(32),
    cost_ms          BIGINT,
    operator         VARCHAR(64),
    remark           VARCHAR(255),
    created_by       BIGINT,
    created_at       TIMESTAMP,
    updated_by       BIGINT,
    updated_at       TIMESTAMP,
    deleted          INT           NOT NULL DEFAULT 0,
    version          INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_int_if_log_no ON int_interface_log (log_no);
CREATE UNIQUE INDEX uk_int_if_log_idem ON int_interface_log (idempotent_key);
CREATE INDEX idx_int_if_log_endpoint ON int_interface_log (endpoint_code);
CREATE INDEX idx_int_if_log_status ON int_interface_log (result_status);
CREATE INDEX idx_int_if_log_biz ON int_interface_log (biz_key);

-- ========== DEV-095 统一主数据同步 ==========

CREATE TABLE int_master_data_sync (
    id               BIGINT        NOT NULL,
    sync_no          VARCHAR(64)   NOT NULL,
    master_type      VARCHAR(32)   NOT NULL,
    master_code      VARCHAR(64)   NOT NULL,
    master_name      VARCHAR(128),
    master_version   VARCHAR(64),
    source_system    VARCHAR(32),
    target_system    VARCHAR(32),
    sync_direction   VARCHAR(16)   NOT NULL DEFAULT 'PLM_TO_ERP',
    sync_status      VARCHAR(16)   NOT NULL DEFAULT 'PENDING',
    source_version   VARCHAR(64),
    target_version   VARCHAR(64),
    source_hash      VARCHAR(64),
    target_hash      VARCHAR(64),
    diff_flag        INT           NOT NULL DEFAULT 0,
    last_sync_at     TIMESTAMP,
    retry_count      INT           NOT NULL DEFAULT 0,
    remark           VARCHAR(255),
    created_by       BIGINT,
    created_at       TIMESTAMP,
    updated_by       BIGINT,
    updated_at       TIMESTAMP,
    deleted          INT           NOT NULL DEFAULT 0,
    version          INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_int_mds_key ON int_master_data_sync (master_type, master_code, target_system);
CREATE INDEX idx_int_mds_type ON int_master_data_sync (master_type);
CREATE INDEX idx_int_mds_status ON int_master_data_sync (sync_status);

-- 主数据差异处理清单
CREATE TABLE int_master_data_diff (
    id            BIGINT        NOT NULL,
    sync_no       VARCHAR(64)   NOT NULL,
    master_type   VARCHAR(32),
    master_code   VARCHAR(64),
    field_name    VARCHAR(64),
    source_value  VARCHAR(255),
    target_value  VARCHAR(255),
    diff_type     VARCHAR(24)   NOT NULL DEFAULT 'VALUE_DIFF',
    handle_status VARCHAR(16)   NOT NULL DEFAULT 'OPEN',
    resolved_by   VARCHAR(64),
    resolved_at   TIMESTAMP,
    resolution    VARCHAR(255),
    remark        VARCHAR(255),
    created_by    BIGINT,
    created_at    TIMESTAMP,
    updated_by    BIGINT,
    updated_at    TIMESTAMP,
    deleted       INT           NOT NULL DEFAULT 0,
    version       INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE INDEX idx_int_mdd_sync ON int_master_data_diff (sync_no);
CREATE INDEX idx_int_mdd_status ON int_master_data_diff (handle_status);

-- ========== DEV-097 QMS 质量接口 ==========

CREATE TABLE int_qms_record (
    id                   BIGINT        NOT NULL,
    record_no            VARCHAR(64)   NOT NULL,
    record_type          VARCHAR(24)   NOT NULL,
    source_no            VARCHAR(64),
    product_code         VARCHAR(64),
    material_code        VARCHAR(64),
    batch_no             VARCHAR(64),
    product_version      VARCHAR(64),
    inspection_item      VARCHAR(128),
    result               VARCHAR(16),
    defect_code          VARCHAR(64),
    defect_level         VARCHAR(16),
    disposition          VARCHAR(64),
    occurred_at          TIMESTAMP,
    source_system        VARCHAR(32),
    related_product_code VARCHAR(64),
    attachment_url       VARCHAR(255),
    interface_status     VARCHAR(16)   NOT NULL DEFAULT 'RECEIVED',
    remark               VARCHAR(255),
    created_by           BIGINT,
    created_at           TIMESTAMP,
    updated_by           BIGINT,
    updated_at           TIMESTAMP,
    deleted              INT           NOT NULL DEFAULT 0,
    version              INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_int_qms_record_no ON int_qms_record (record_no);
CREATE INDEX idx_int_qms_type ON int_qms_record (record_type);
CREATE INDEX idx_int_qms_batch ON int_qms_record (batch_no);
CREATE INDEX idx_int_qms_product ON int_qms_record (product_code);

-- ========== DEV-098 历史数据清洗迁移 ==========

CREATE TABLE int_migration_task (
    id            BIGINT        NOT NULL,
    task_no       VARCHAR(64)   NOT NULL,
    scope         VARCHAR(32)   NOT NULL,
    source_system VARCHAR(32),
    target_table  VARCHAR(64),
    source_count  BIGINT        NOT NULL DEFAULT 0,
    success_count BIGINT        NOT NULL DEFAULT 0,
    fail_count    BIGINT        NOT NULL DEFAULT 0,
    skip_count    BIGINT        NOT NULL DEFAULT 0,
    task_status   VARCHAR(16)   NOT NULL DEFAULT 'PENDING',
    started_at    TIMESTAMP,
    finished_at   TIMESTAMP,
    report_path   VARCHAR(255),
    operator      VARCHAR(64),
    remark        VARCHAR(255),
    created_by    BIGINT,
    created_at    TIMESTAMP,
    updated_by    BIGINT,
    updated_at    TIMESTAMP,
    deleted       INT           NOT NULL DEFAULT 0,
    version       INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_int_mig_task_no ON int_migration_task (task_no);
CREATE INDEX idx_int_mig_scope ON int_migration_task (scope);
CREATE INDEX idx_int_mig_status ON int_migration_task (task_status);

CREATE TABLE int_migration_exception (
    id             BIGINT        NOT NULL,
    task_no        VARCHAR(64)   NOT NULL,
    source_key     VARCHAR(128),
    exception_type VARCHAR(24)   NOT NULL DEFAULT 'FIELD_INVALID',
    field_name     VARCHAR(64),
    reason         VARCHAR(500),
    raw_data       VARCHAR(2000),
    handle_status  VARCHAR(16)   NOT NULL DEFAULT 'OPEN',
    handler        VARCHAR(64),
    handled_at     TIMESTAMP,
    remark         VARCHAR(255),
    created_by     BIGINT,
    created_at     TIMESTAMP,
    updated_by     BIGINT,
    updated_at     TIMESTAMP,
    deleted        INT           NOT NULL DEFAULT 0,
    version        INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE INDEX idx_int_mig_ex_task ON int_migration_exception (task_no);
CREATE INDEX idx_int_mig_ex_status ON int_migration_exception (handle_status);

-- ========== DEV-099 数据导入导出与退出能力 ==========

CREATE TABLE int_export_task (
    id                BIGINT        NOT NULL,
    task_no           VARCHAR(64)   NOT NULL,
    scope             VARCHAR(32)   NOT NULL,
    export_format     VARCHAR(16)   NOT NULL DEFAULT 'CSV',
    include_attachment INT          NOT NULL DEFAULT 0,
    record_count      BIGINT        NOT NULL DEFAULT 0,
    file_path         VARCHAR(255),
    file_size         BIGINT,
    task_status       VARCHAR(16)   NOT NULL DEFAULT 'PENDING',
    requested_by      VARCHAR(64),
    started_at        TIMESTAMP,
    finished_at       TIMESTAMP,
    error_message     VARCHAR(500),
    remark            VARCHAR(255),
    created_by        BIGINT,
    created_at        TIMESTAMP,
    updated_by        BIGINT,
    updated_at        TIMESTAMP,
    deleted           INT           NOT NULL DEFAULT 0,
    version           INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_int_export_task_no ON int_export_task (task_no);
CREATE INDEX idx_int_export_scope ON int_export_task (scope);
CREATE INDEX idx_int_export_status ON int_export_task (task_status);

-- ========== DEV-100/101 功能与端到端测试、性能与容量测试 ==========

CREATE TABLE int_test_case (
    id           BIGINT        NOT NULL,
    case_no      VARCHAR(64)   NOT NULL,
    case_type    VARCHAR(16)   NOT NULL DEFAULT 'FUNCTION',
    related_node VARCHAR(16),
    title        VARCHAR(200)  NOT NULL,
    precondition VARCHAR(500),
    steps        VARCHAR(2000),
    expected     VARCHAR(2000),
    priority     VARCHAR(8)    NOT NULL DEFAULT 'P1',
    run_status   VARCHAR(16)   NOT NULL DEFAULT 'NOT_RUN',
    run_result   VARCHAR(500),
    run_at       TIMESTAMP,
    runner       VARCHAR(64),
    defect_no    VARCHAR(64),
    remark       VARCHAR(255),
    created_by   BIGINT,
    created_at   TIMESTAMP,
    updated_by   BIGINT,
    updated_at   TIMESTAMP,
    deleted      INT           NOT NULL DEFAULT 0,
    version      INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_int_test_case_no ON int_test_case (case_no);
CREATE INDEX idx_int_test_type ON int_test_case (case_type);
CREATE INDEX idx_int_test_status ON int_test_case (run_status);

CREATE TABLE int_perf_test (
    id            BIGINT        NOT NULL,
    test_no       VARCHAR(64)   NOT NULL,
    scenario      VARCHAR(32)   NOT NULL,
    target_rps    DECIMAL(18, 4),
    target_p95_ms DECIMAL(18, 4),
    actual_rps    DECIMAL(18, 4),
    actual_p95_ms DECIMAL(18, 4),
    concurrency   INT,
    duration_sec  INT,
    result        VARCHAR(16)   NOT NULL DEFAULT 'PASS',
    test_at       TIMESTAMP,
    report_path   VARCHAR(255),
    remark        VARCHAR(255),
    created_by    BIGINT,
    created_at    TIMESTAMP,
    updated_by    BIGINT,
    updated_at    TIMESTAMP,
    deleted       INT           NOT NULL DEFAULT 0,
    version       INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_int_perf_test_no ON int_perf_test (test_no);
CREATE INDEX idx_int_perf_scenario ON int_perf_test (scenario);

-- ========== DEV-102 安全测试与整改 ==========

CREATE TABLE int_security_issue (
    id            BIGINT        NOT NULL,
    issue_no      VARCHAR(64)   NOT NULL,
    category      VARCHAR(32)   NOT NULL,
    severity      VARCHAR(16)   NOT NULL DEFAULT 'MEDIUM',
    title         VARCHAR(200)  NOT NULL,
    detail        VARCHAR(2000),
    discovered_by VARCHAR(64),
    discovered_at TIMESTAMP,
    status        VARCHAR(16)   NOT NULL DEFAULT 'OPEN',
    fix_plan      VARCHAR(1000),
    fixed_at      TIMESTAMP,
    verifier      VARCHAR(64),
    verified_at   TIMESTAMP,
    remark        VARCHAR(255),
    created_by    BIGINT,
    created_at    TIMESTAMP,
    updated_by    BIGINT,
    updated_at    TIMESTAMP,
    deleted       INT           NOT NULL DEFAULT 0,
    version       INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_int_sec_issue_no ON int_security_issue (issue_no);
CREATE INDEX idx_int_sec_category ON int_security_issue (category);
CREATE INDEX idx_int_sec_status ON int_security_issue (status);

-- ========== DEV-103 备份恢复与容灾演练 ==========

CREATE TABLE int_backup_record (
    id               BIGINT        NOT NULL,
    record_no        VARCHAR(64)   NOT NULL,
    record_type      VARCHAR(16)   NOT NULL DEFAULT 'BACKUP',
    scope            VARCHAR(16)   NOT NULL DEFAULT 'DB',
    backup_at        TIMESTAMP,
    size_mb          DECIMAL(18, 4),
    target_path      VARCHAR(255),
    rpo_minutes      INT,
    rto_minutes      INT,
    elapsed_minutes  INT,
    result_status    VARCHAR(16)   NOT NULL DEFAULT 'SUCCESS',
    verified         INT           NOT NULL DEFAULT 0,
    operator         VARCHAR(64),
    remark           VARCHAR(255),
    created_by       BIGINT,
    created_at       TIMESTAMP,
    updated_by       BIGINT,
    updated_at       TIMESTAMP,
    deleted          INT           NOT NULL DEFAULT 0,
    version          INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_int_backup_no ON int_backup_record (record_no);
CREATE INDEX idx_int_backup_type ON int_backup_record (record_type);

-- ========== DEV-104 培训与上线切换 ==========

CREATE TABLE int_training_record (
    id            BIGINT        NOT NULL,
    training_no   VARCHAR(64)   NOT NULL,
    role_code     VARCHAR(32)   NOT NULL,
    title         VARCHAR(200),
    trainer       VARCHAR(64),
    trainee_count INT           NOT NULL DEFAULT 0,
    passed_count  INT           NOT NULL DEFAULT 0,
    trained_at    TIMESTAMP,
    material_url  VARCHAR(255),
    pass_rate     DECIMAL(9, 4),
    remark        VARCHAR(255),
    created_by    BIGINT,
    created_at    TIMESTAMP,
    updated_by    BIGINT,
    updated_at    TIMESTAMP,
    deleted       INT           NOT NULL DEFAULT 0,
    version       INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_int_training_no ON int_training_record (training_no);
CREATE INDEX idx_int_training_role ON int_training_record (role_code);

CREATE TABLE int_golive_record (
    id              BIGINT        NOT NULL,
    golive_no       VARCHAR(64)   NOT NULL,
    plan_name       VARCHAR(200)  NOT NULL,
    scope           VARCHAR(255),
    planned_at      TIMESTAMP,
    actual_at       TIMESTAMP,
    cutover_status  VARCHAR(16)   NOT NULL DEFAULT 'PLANNED',
    rollback_plan   VARCHAR(1000),
    rollback_at     TIMESTAMP,
    owner           VARCHAR(64),
    remark          VARCHAR(255),
    created_by      BIGINT,
    created_at      TIMESTAMP,
    updated_by      BIGINT,
    updated_at      TIMESTAMP,
    deleted         INT           NOT NULL DEFAULT 0,
    version         INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_int_golive_no ON int_golive_record (golive_no);
CREATE INDEX idx_int_golive_status ON int_golive_record (cutover_status);

-- ========== DEV-105 源代码与技术交接 ==========

CREATE TABLE int_delivery_item (
    id           BIGINT        NOT NULL,
    item_no      VARCHAR(64)   NOT NULL,
    category     VARCHAR(24)   NOT NULL,
    name         VARCHAR(200)  NOT NULL,
    item_version VARCHAR(64),
    file_path    VARCHAR(255),
    checksum     VARCHAR(64),
    delivered_at TIMESTAMP,
    status       VARCHAR(16)   NOT NULL DEFAULT 'PENDING',
    verifier     VARCHAR(64),
    remark       VARCHAR(255),
    created_by   BIGINT,
    created_at   TIMESTAMP,
    updated_by   BIGINT,
    updated_at   TIMESTAMP,
    deleted      INT           NOT NULL DEFAULT 0,
    version      INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_int_delivery_no ON int_delivery_item (item_no);
CREATE INDEX idx_int_delivery_category ON int_delivery_item (category);
CREATE INDEX idx_int_delivery_status ON int_delivery_item (status);

-- ========== DEV-106 质保运维与缺陷处理 ==========

CREATE TABLE int_defect (
    id                 BIGINT        NOT NULL,
    defect_no          VARCHAR(64)   NOT NULL,
    source             VARCHAR(24)   NOT NULL DEFAULT 'UAT',
    severity           VARCHAR(16)   NOT NULL DEFAULT 'MAJOR',
    title              VARCHAR(200)  NOT NULL,
    detail             VARCHAR(2000),
    module             VARCHAR(64),
    found_at           TIMESTAMP,
    sla_response_hours INT,
    sla_fix_hours      INT,
    response_at        TIMESTAMP,
    fixed_at           TIMESTAMP,
    verified_at        TIMESTAMP,
    status             VARCHAR(16)   NOT NULL DEFAULT 'OPEN',
    escalation_level   INT           NOT NULL DEFAULT 0,
    assignee           VARCHAR(64),
    sla_breached       INT           NOT NULL DEFAULT 0,
    remark             VARCHAR(255),
    created_by         BIGINT,
    created_at         TIMESTAMP,
    updated_by         BIGINT,
    updated_at         TIMESTAMP,
    deleted            INT           NOT NULL DEFAULT 0,
    version            INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_int_defect_no ON int_defect (defect_no);
CREATE INDEX idx_int_defect_status ON int_defect (status);
CREATE INDEX idx_int_defect_severity ON int_defect (severity);
