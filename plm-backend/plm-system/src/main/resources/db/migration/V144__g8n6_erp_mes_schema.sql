-- G8-N6 六系统集成—ERP→MES（WBS T067）表结构。
-- 覆盖范围：ERP 向 MES 推送生产订单、BOM 需求、计划日期、工单变更和优先级；MES 接收后校验并回执。
-- 交付物：接口规范、字段映射、联调报告（同步批次）、异常补偿、对账报告。
-- 主数据权责：ERP 为生产订单/BOM 需求/计划日期/工单变更/优先级的权威源，MES 为执行与消费方；本节记录发布与回执全过程。

-- ========== 1. 集成接口定义 ==========

CREATE TABLE intg_erp_mes_interface (
    id                  BIGINT        NOT NULL,
    interface_no        VARCHAR(64)   NOT NULL,
    interface_name      VARCHAR(200),
    direction           VARCHAR(32)   NOT NULL DEFAULT 'ERP_TO_MES',
    object_type         VARCHAR(32)   NOT NULL DEFAULT 'PRODUCTION_ORDER',
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
CREATE UNIQUE INDEX uk_intg_erp_mes_interface_no ON intg_erp_mes_interface (interface_no);
CREATE INDEX idx_intg_erp_mes_interface_object ON intg_erp_mes_interface (object_type);
CREATE INDEX idx_intg_erp_mes_interface_protocol ON intg_erp_mes_interface (protocol);
CREATE INDEX idx_intg_erp_mes_interface_status ON intg_erp_mes_interface (interface_status);

-- ========== 2. 字段映射 ==========

CREATE TABLE intg_erp_mes_mapping (
    id                  BIGINT        NOT NULL,
    mapping_no          VARCHAR(64)   NOT NULL,
    mapping_name        VARCHAR(200),
    interface_no        VARCHAR(64),
    object_type         VARCHAR(32)   NOT NULL DEFAULT 'PRODUCTION_ORDER',
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
CREATE UNIQUE INDEX uk_intg_erp_mes_mapping_no ON intg_erp_mes_mapping (mapping_no);
CREATE INDEX idx_intg_erp_mes_mapping_interface ON intg_erp_mes_mapping (interface_no);
CREATE INDEX idx_intg_erp_mes_mapping_object ON intg_erp_mes_mapping (object_type);
CREATE INDEX idx_intg_erp_mes_mapping_status ON intg_erp_mes_mapping (mapping_status);

-- ========== 3. 同步批次 ==========

CREATE TABLE intg_erp_mes_batch (
    id                  BIGINT        NOT NULL,
    batch_no            VARCHAR(64)   NOT NULL,
    batch_name          VARCHAR(200),
    interface_no        VARCHAR(64),
    direction           VARCHAR(32)   NOT NULL DEFAULT 'ERP_TO_MES',
    object_type         VARCHAR(32)   NOT NULL DEFAULT 'PRODUCTION_ORDER',
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
CREATE UNIQUE INDEX uk_intg_erp_mes_batch_no ON intg_erp_mes_batch (batch_no);
CREATE INDEX idx_intg_erp_mes_batch_interface ON intg_erp_mes_batch (interface_no);
CREATE INDEX idx_intg_erp_mes_batch_object ON intg_erp_mes_batch (object_type);
CREATE INDEX idx_intg_erp_mes_batch_status ON intg_erp_mes_batch (batch_status);

-- ========== 4. MES 接收回执 ==========

CREATE TABLE intg_erp_mes_receipt (
    id                  BIGINT        NOT NULL,
    receipt_no          VARCHAR(64)   NOT NULL,
    batch_no            VARCHAR(64),
    interface_no        VARCHAR(64),
    object_type         VARCHAR(32)   NOT NULL DEFAULT 'PRODUCTION_ORDER',
    object_no           VARCHAR(128),
    object_version      VARCHAR(64),
    mes_object_id       VARCHAR(128),
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
CREATE UNIQUE INDEX uk_intg_erp_mes_receipt_no ON intg_erp_mes_receipt (receipt_no);
CREATE INDEX idx_intg_erp_mes_receipt_batch ON intg_erp_mes_receipt (batch_no);
CREATE INDEX idx_intg_erp_mes_receipt_interface ON intg_erp_mes_receipt (interface_no);
CREATE INDEX idx_intg_erp_mes_receipt_status ON intg_erp_mes_receipt (receipt_status);

-- ========== 5. 异常补偿 ==========

CREATE TABLE intg_erp_mes_compensation (
    id                  BIGINT        NOT NULL,
    compensation_no     VARCHAR(64)   NOT NULL,
    batch_no            VARCHAR(64),
    interface_no        VARCHAR(64),
    object_type         VARCHAR(32)   NOT NULL DEFAULT 'PRODUCTION_ORDER',
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
CREATE UNIQUE INDEX uk_intg_erp_mes_compensation_no ON intg_erp_mes_compensation (compensation_no);
CREATE INDEX idx_intg_erp_mes_compensation_batch ON intg_erp_mes_compensation (batch_no);
CREATE INDEX idx_intg_erp_mes_compensation_interface ON intg_erp_mes_compensation (interface_no);
CREATE INDEX idx_intg_erp_mes_compensation_status ON intg_erp_mes_compensation (compensation_status);

-- ========== 6. 对账 ==========

CREATE TABLE intg_erp_mes_reconcile (
    id                  BIGINT        NOT NULL,
    reconcile_no        VARCHAR(64)   NOT NULL,
    reconcile_name      VARCHAR(200),
    interface_no        VARCHAR(64),
    object_type         VARCHAR(32)   NOT NULL DEFAULT 'PRODUCTION_ORDER',
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
CREATE UNIQUE INDEX uk_intg_erp_mes_reconcile_no ON intg_erp_mes_reconcile (reconcile_no);
CREATE INDEX idx_intg_erp_mes_reconcile_interface ON intg_erp_mes_reconcile (interface_no);
CREATE INDEX idx_intg_erp_mes_reconcile_object ON intg_erp_mes_reconcile (object_type);
CREATE INDEX idx_intg_erp_mes_reconcile_status ON intg_erp_mes_reconcile (reconcile_status);
