-- G8-N3 六系统集成—PLM→SRM（WBS T064）表结构。
-- 覆盖范围：PLM 发布采购技术规范、图纸、质量要求、供应商受控文件；SRM 接收后校验并回执。
-- 交付物：接口规范、字段映射、联调报告（同步批次）、异常补偿、对账报告。
-- 主数据权责：PLM 为采购技术规范/图纸/质量要求/供应商受控文件的权威源，SRM 为消费方；本节记录发布与回执全过程。

-- ========== 1. 集成接口定义 ==========

CREATE TABLE intg_plm_srm_interface (
    id                  BIGINT        NOT NULL,
    interface_no        VARCHAR(64)   NOT NULL,
    interface_name      VARCHAR(200),
    direction           VARCHAR(32)   NOT NULL DEFAULT 'PLM_TO_SRM',
    object_type         VARCHAR(32)   NOT NULL DEFAULT 'PURCHASE_SPEC',
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
CREATE UNIQUE INDEX uk_intg_plm_srm_interface_no ON intg_plm_srm_interface (interface_no);
CREATE INDEX idx_intg_plm_srm_interface_object ON intg_plm_srm_interface (object_type);
CREATE INDEX idx_intg_plm_srm_interface_protocol ON intg_plm_srm_interface (protocol);
CREATE INDEX idx_intg_plm_srm_interface_status ON intg_plm_srm_interface (interface_status);

-- ========== 2. 字段映射 ==========

CREATE TABLE intg_plm_srm_mapping (
    id                  BIGINT        NOT NULL,
    mapping_no          VARCHAR(64)   NOT NULL,
    mapping_name        VARCHAR(200),
    interface_no        VARCHAR(64),
    object_type         VARCHAR(32)   NOT NULL DEFAULT 'PURCHASE_SPEC',
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
CREATE UNIQUE INDEX uk_intg_plm_srm_mapping_no ON intg_plm_srm_mapping (mapping_no);
CREATE INDEX idx_intg_plm_srm_mapping_interface ON intg_plm_srm_mapping (interface_no);
CREATE INDEX idx_intg_plm_srm_mapping_object ON intg_plm_srm_mapping (object_type);
CREATE INDEX idx_intg_plm_srm_mapping_status ON intg_plm_srm_mapping (mapping_status);

-- ========== 3. 同步批次 ==========

CREATE TABLE intg_plm_srm_batch (
    id                  BIGINT        NOT NULL,
    batch_no            VARCHAR(64)   NOT NULL,
    batch_name          VARCHAR(200),
    interface_no        VARCHAR(64),
    direction           VARCHAR(32)   NOT NULL DEFAULT 'PLM_TO_SRM',
    object_type         VARCHAR(32)   NOT NULL DEFAULT 'PURCHASE_SPEC',
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
CREATE UNIQUE INDEX uk_intg_plm_srm_batch_no ON intg_plm_srm_batch (batch_no);
CREATE INDEX idx_intg_plm_srm_batch_interface ON intg_plm_srm_batch (interface_no);
CREATE INDEX idx_intg_plm_srm_batch_object ON intg_plm_srm_batch (object_type);
CREATE INDEX idx_intg_plm_srm_batch_status ON intg_plm_srm_batch (batch_status);

-- ========== 4. SRM 接收回执 ==========

CREATE TABLE intg_plm_srm_receipt (
    id                  BIGINT        NOT NULL,
    receipt_no          VARCHAR(64)   NOT NULL,
    batch_no            VARCHAR(64),
    interface_no        VARCHAR(64),
    object_type         VARCHAR(32)   NOT NULL DEFAULT 'PURCHASE_SPEC',
    object_no           VARCHAR(128),
    object_version      VARCHAR(64),
    srm_object_id       VARCHAR(128),
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
CREATE UNIQUE INDEX uk_intg_plm_srm_receipt_no ON intg_plm_srm_receipt (receipt_no);
CREATE INDEX idx_intg_plm_srm_receipt_batch ON intg_plm_srm_receipt (batch_no);
CREATE INDEX idx_intg_plm_srm_receipt_interface ON intg_plm_srm_receipt (interface_no);
CREATE INDEX idx_intg_plm_srm_receipt_status ON intg_plm_srm_receipt (receipt_status);

-- ========== 5. 异常补偿 ==========

CREATE TABLE intg_plm_srm_compensation (
    id                  BIGINT        NOT NULL,
    compensation_no     VARCHAR(64)   NOT NULL,
    batch_no            VARCHAR(64),
    interface_no        VARCHAR(64),
    object_type         VARCHAR(32)   NOT NULL DEFAULT 'PURCHASE_SPEC',
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
CREATE UNIQUE INDEX uk_intg_plm_srm_compensation_no ON intg_plm_srm_compensation (compensation_no);
CREATE INDEX idx_intg_plm_srm_compensation_batch ON intg_plm_srm_compensation (batch_no);
CREATE INDEX idx_intg_plm_srm_compensation_interface ON intg_plm_srm_compensation (interface_no);
CREATE INDEX idx_intg_plm_srm_compensation_status ON intg_plm_srm_compensation (compensation_status);

-- ========== 6. 对账 ==========

CREATE TABLE intg_plm_srm_reconcile (
    id                  BIGINT        NOT NULL,
    reconcile_no        VARCHAR(64)   NOT NULL,
    reconcile_name      VARCHAR(200),
    interface_no        VARCHAR(64),
    object_type         VARCHAR(32)   NOT NULL DEFAULT 'PURCHASE_SPEC',
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
CREATE UNIQUE INDEX uk_intg_plm_srm_reconcile_no ON intg_plm_srm_reconcile (reconcile_no);
CREATE INDEX idx_intg_plm_srm_reconcile_interface ON intg_plm_srm_reconcile (interface_no);
CREATE INDEX idx_intg_plm_srm_reconcile_object ON intg_plm_srm_reconcile (object_type);
CREATE INDEX idx_intg_plm_srm_reconcile_status ON intg_plm_srm_reconcile (reconcile_status);
