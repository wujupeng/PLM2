-- G9-N3 数据迁移—库存迁移（WBS T078）表结构。
-- 覆盖范围：按仓库/库位/批次/状态导入期初库存，冻结盘点并进行账实核对。
-- 主数据权责：期初库存以各业务系统库存为权威源，本迁移模块负责期初导入与账实核对；
-- 数量差异、批次缺失与状态冲突进入异常补偿人工处理。

-- ========== 1. 集成接口定义 ==========

CREATE TABLE mig_inventory_interface (
    id                  BIGINT        NOT NULL,
    interface_no        VARCHAR(64)   NOT NULL,
    interface_name      VARCHAR(200),
    direction           VARCHAR(32)   NOT NULL DEFAULT 'STOCK_MIGRATION',
    object_type         VARCHAR(32)   NOT NULL DEFAULT 'STOCK',
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
CREATE UNIQUE INDEX uk_mig_inventory_interface_no ON mig_inventory_interface (interface_no);
CREATE INDEX idx_mig_inventory_interface_object ON mig_inventory_interface (object_type);
CREATE INDEX idx_mig_inventory_interface_protocol ON mig_inventory_interface (protocol);
CREATE INDEX idx_mig_inventory_interface_status ON mig_inventory_interface (interface_status);

-- ========== 2. 字段映射 ==========

CREATE TABLE mig_inventory_mapping (
    id                  BIGINT        NOT NULL,
    mapping_no          VARCHAR(64)   NOT NULL,
    mapping_name        VARCHAR(200),
    interface_no        VARCHAR(64),
    object_type         VARCHAR(32)   NOT NULL DEFAULT 'STOCK',
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
CREATE UNIQUE INDEX uk_mig_inventory_mapping_no ON mig_inventory_mapping (mapping_no);
CREATE INDEX idx_mig_inventory_mapping_interface ON mig_inventory_mapping (interface_no);
CREATE INDEX idx_mig_inventory_mapping_object ON mig_inventory_mapping (object_type);
CREATE INDEX idx_mig_inventory_mapping_status ON mig_inventory_mapping (mapping_status);

-- ========== 3. 同步批次 ==========

CREATE TABLE mig_inventory_batch (
    id                  BIGINT        NOT NULL,
    batch_no            VARCHAR(64)   NOT NULL,
    batch_name          VARCHAR(200),
    interface_no        VARCHAR(64),
    direction           VARCHAR(32)   NOT NULL DEFAULT 'STOCK_MIGRATION',
    object_type         VARCHAR(32)   NOT NULL DEFAULT 'STOCK',
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
CREATE UNIQUE INDEX uk_mig_inventory_batch_no ON mig_inventory_batch (batch_no);
CREATE INDEX idx_mig_inventory_batch_interface ON mig_inventory_batch (interface_no);
CREATE INDEX idx_mig_inventory_batch_object ON mig_inventory_batch (object_type);
CREATE INDEX idx_mig_inventory_batch_status ON mig_inventory_batch (batch_status);

-- ========== 4. 内部系统接收回执 ==========

CREATE TABLE mig_inventory_receipt (
    id                  BIGINT        NOT NULL,
    receipt_no          VARCHAR(64)   NOT NULL,
    batch_no            VARCHAR(64),
    interface_no        VARCHAR(64),
    object_type         VARCHAR(32)   NOT NULL DEFAULT 'STOCK',
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
CREATE UNIQUE INDEX uk_mig_inventory_receipt_no ON mig_inventory_receipt (receipt_no);
CREATE INDEX idx_mig_inventory_receipt_batch ON mig_inventory_receipt (batch_no);
CREATE INDEX idx_mig_inventory_receipt_interface ON mig_inventory_receipt (interface_no);
CREATE INDEX idx_mig_inventory_receipt_status ON mig_inventory_receipt (receipt_status);

-- ========== 5. 异常补偿 ==========

CREATE TABLE mig_inventory_compensation (
    id                  BIGINT        NOT NULL,
    compensation_no     VARCHAR(64)   NOT NULL,
    batch_no            VARCHAR(64),
    interface_no        VARCHAR(64),
    object_type         VARCHAR(32)   NOT NULL DEFAULT 'STOCK',
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
CREATE UNIQUE INDEX uk_mig_inventory_compensation_no ON mig_inventory_compensation (compensation_no);
CREATE INDEX idx_mig_inventory_compensation_batch ON mig_inventory_compensation (batch_no);
CREATE INDEX idx_mig_inventory_compensation_interface ON mig_inventory_compensation (interface_no);
CREATE INDEX idx_mig_inventory_compensation_status ON mig_inventory_compensation (compensation_status);

-- ========== 6. 对账 ==========

CREATE TABLE mig_inventory_reconcile (
    id                  BIGINT        NOT NULL,
    reconcile_no        VARCHAR(64)   NOT NULL,
    reconcile_name      VARCHAR(200),
    interface_no        VARCHAR(64),
    object_type         VARCHAR(32)   NOT NULL DEFAULT 'STOCK',
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
CREATE UNIQUE INDEX uk_mig_inventory_reconcile_no ON mig_inventory_reconcile (reconcile_no);
CREATE INDEX idx_mig_inventory_reconcile_interface ON mig_inventory_reconcile (interface_no);
CREATE INDEX idx_mig_inventory_reconcile_object ON mig_inventory_reconcile (object_type);
CREATE INDEX idx_mig_inventory_reconcile_status ON mig_inventory_reconcile (reconcile_status);
