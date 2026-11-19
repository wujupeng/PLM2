-- G9-N1 数据迁移—主数据迁移（WBS T076）表结构。
-- 覆盖范围：物料、客户、供应商、单位、仓库、人员、设备、工艺编码清洗去重。
-- 交付物：迁移脚本、字段映射、数据质量报告、核对签字。
-- 主数据权责：物料/客户/供应商等主数据以 PLM/SRM 为权威源，本迁移模块负责清洗去重与映射；
-- 编码冲突、重复项与缺失项进入异常补偿人工处理。

-- ========== 1. 集成接口定义 ==========

CREATE TABLE mig_master_data_interface (
    id                  BIGINT        NOT NULL,
    interface_no        VARCHAR(64)   NOT NULL,
    interface_name      VARCHAR(200),
    direction           VARCHAR(32)   NOT NULL DEFAULT 'MASTER_DATA_MIGRATION',
    object_type         VARCHAR(32)   NOT NULL DEFAULT 'MATERIAL',
    protocol            VARCHAR(32)   NOT NULL DEFAULT 'API',
    endpoint            VARCHAR(255),
    trigger_type        VARCHAR(32)   NOT NULL DEFAULT 'MANUAL',
    sync_mode           VARCHAR(32)   NOT NULL DEFAULT 'INCREMENTAL',
    interface_status    VARCHAR(32)   NOT NULL DEFAULT 'DRAFT',
    org_id              BIGINT,
    org_name            VARCHAR(128),
    description         VARCHAR(1000),
    remark              VARCHAR(500),
    created_by          BIGINT,
    created_at          TIMESTAMP,
    updated_by          BIGINT,
    updated_at          TIMESTAMP,
    deleted             INT           NOT NULL DEFAULT 0,
    version             INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_mig_master_data_interface_no ON mig_master_data_interface (interface_no);
CREATE INDEX idx_mig_master_data_interface_object ON mig_master_data_interface (object_type);
CREATE INDEX idx_mig_master_data_interface_protocol ON mig_master_data_interface (protocol);
CREATE INDEX idx_mig_master_data_interface_status ON mig_master_data_interface (interface_status);

-- ========== 2. 字段映射 ==========

CREATE TABLE mig_master_data_mapping (
    id                  BIGINT        NOT NULL,
    mapping_no          VARCHAR(64)   NOT NULL,
    mapping_name        VARCHAR(200),
    interface_no        VARCHAR(64),
    object_type         VARCHAR(32)   NOT NULL DEFAULT 'MATERIAL',
    source_field        VARCHAR(128),
    target_field        VARCHAR(128),
    transform_rule      VARCHAR(500),
    default_value       VARCHAR(255),
    required_flag       INT           NOT NULL DEFAULT 0,
    mapping_status      VARCHAR(32)   NOT NULL DEFAULT 'DRAFT',
    org_id              BIGINT,
    org_name            VARCHAR(128),
    description         VARCHAR(1000),
    remark              VARCHAR(500),
    created_by          BIGINT,
    created_at          TIMESTAMP,
    updated_by          BIGINT,
    updated_at          TIMESTAMP,
    deleted             INT           NOT NULL DEFAULT 0,
    version             INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_mig_master_data_mapping_no ON mig_master_data_mapping (mapping_no);
CREATE INDEX idx_mig_master_data_mapping_interface ON mig_master_data_mapping (interface_no);
CREATE INDEX idx_mig_master_data_mapping_object ON mig_master_data_mapping (object_type);
CREATE INDEX idx_mig_master_data_mapping_status ON mig_master_data_mapping (mapping_status);

-- ========== 3. 同步批次 ==========

CREATE TABLE mig_master_data_batch (
    id                  BIGINT        NOT NULL,
    batch_no            VARCHAR(64)   NOT NULL,
    batch_name          VARCHAR(200),
    interface_no        VARCHAR(64),
    direction           VARCHAR(32)   NOT NULL DEFAULT 'MASTER_DATA_MIGRATION',
    object_type         VARCHAR(32)   NOT NULL DEFAULT 'MATERIAL',
    trigger_type        VARCHAR(32)   NOT NULL DEFAULT 'MANUAL',
    total_count         INT           NOT NULL DEFAULT 0,
    success_count       INT           NOT NULL DEFAULT 0,
    fail_count          INT           NOT NULL DEFAULT 0,
    start_time          TIMESTAMP,
    end_time            TIMESTAMP,
    batch_status        VARCHAR(32)   NOT NULL DEFAULT 'PENDING',
    message             VARCHAR(1000),
    org_id              BIGINT,
    org_name            VARCHAR(128),
    description         VARCHAR(1000),
    remark              VARCHAR(500),
    created_by          BIGINT,
    created_at          TIMESTAMP,
    updated_by          BIGINT,
    updated_at          TIMESTAMP,
    deleted             INT           NOT NULL DEFAULT 0,
    version             INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_mig_master_data_batch_no ON mig_master_data_batch (batch_no);
CREATE INDEX idx_mig_master_data_batch_interface ON mig_master_data_batch (interface_no);
CREATE INDEX idx_mig_master_data_batch_object ON mig_master_data_batch (object_type);
CREATE INDEX idx_mig_master_data_batch_status ON mig_master_data_batch (batch_status);

-- ========== 4. 内部系统接收回执 ==========

CREATE TABLE mig_master_data_receipt (
    id                  BIGINT        NOT NULL,
    receipt_no          VARCHAR(64)   NOT NULL,
    batch_no            VARCHAR(64),
    interface_no        VARCHAR(64),
    object_type         VARCHAR(32)   NOT NULL DEFAULT 'MATERIAL',
    object_no           VARCHAR(128),
    object_version      VARCHAR(64),
    migrate_object_id    VARCHAR(128),
    receipt_status      VARCHAR(32)   NOT NULL DEFAULT 'PENDING',
    check_message       VARCHAR(1000),
    receipt_time        TIMESTAMP,
    org_id              BIGINT,
    org_name            VARCHAR(128),
    description         VARCHAR(1000),
    remark              VARCHAR(500),
    created_by          BIGINT,
    created_at          TIMESTAMP,
    updated_by          BIGINT,
    updated_at          TIMESTAMP,
    deleted             INT           NOT NULL DEFAULT 0,
    version             INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_mig_master_data_receipt_no ON mig_master_data_receipt (receipt_no);
CREATE INDEX idx_mig_master_data_receipt_batch ON mig_master_data_receipt (batch_no);
CREATE INDEX idx_mig_master_data_receipt_interface ON mig_master_data_receipt (interface_no);
CREATE INDEX idx_mig_master_data_receipt_status ON mig_master_data_receipt (receipt_status);

-- ========== 5. 异常补偿 ==========

CREATE TABLE mig_master_data_compensation (
    id                  BIGINT        NOT NULL,
    compensation_no     VARCHAR(64)   NOT NULL,
    batch_no            VARCHAR(64),
    interface_no        VARCHAR(64),
    object_type         VARCHAR(32)   NOT NULL DEFAULT 'MATERIAL',
    object_no           VARCHAR(128),
    error_type          VARCHAR(32)   NOT NULL DEFAULT 'VALIDATION',
    error_message       VARCHAR(1000),
    retry_count         INT           NOT NULL DEFAULT 0,
    handler             VARCHAR(64),
    handle_time         TIMESTAMP,
    compensation_status VARCHAR(32)   NOT NULL DEFAULT 'PENDING',
    org_id              BIGINT,
    org_name            VARCHAR(128),
    description         VARCHAR(1000),
    remark              VARCHAR(500),
    created_by          BIGINT,
    created_at          TIMESTAMP,
    updated_by          BIGINT,
    updated_at          TIMESTAMP,
    deleted             INT           NOT NULL DEFAULT 0,
    version             INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_mig_master_data_compensation_no ON mig_master_data_compensation (compensation_no);
CREATE INDEX idx_mig_master_data_compensation_batch ON mig_master_data_compensation (batch_no);
CREATE INDEX idx_mig_master_data_compensation_interface ON mig_master_data_compensation (interface_no);
CREATE INDEX idx_mig_master_data_compensation_status ON mig_master_data_compensation (compensation_status);

-- ========== 6. 对账 ==========

CREATE TABLE mig_master_data_reconcile (
    id                  BIGINT        NOT NULL,
    reconcile_no        VARCHAR(64)   NOT NULL,
    reconcile_name      VARCHAR(200),
    interface_no        VARCHAR(64),
    object_type         VARCHAR(32)   NOT NULL DEFAULT 'MATERIAL',
    source_count        INT           NOT NULL DEFAULT 0,
    target_count        INT           NOT NULL DEFAULT 0,
    diff_count          INT           NOT NULL DEFAULT 0,
    reconcile_date      TIMESTAMP,
    reconcile_status    VARCHAR(32)   NOT NULL DEFAULT 'PENDING',
    result_message      VARCHAR(1000),
    org_id              BIGINT,
    org_name            VARCHAR(128),
    description         VARCHAR(1000),
    remark              VARCHAR(500),
    created_by          BIGINT,
    created_at          TIMESTAMP,
    updated_by          BIGINT,
    updated_at          TIMESTAMP,
    deleted             INT           NOT NULL DEFAULT 0,
    version             INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_mig_master_data_reconcile_no ON mig_master_data_reconcile (reconcile_no);
CREATE INDEX idx_mig_master_data_reconcile_interface ON mig_master_data_reconcile (interface_no);
CREATE INDEX idx_mig_master_data_reconcile_object ON mig_master_data_reconcile (object_type);
CREATE INDEX idx_mig_master_data_reconcile_status ON mig_master_data_reconcile (reconcile_status);
